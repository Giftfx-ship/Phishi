const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const OWNER_ID = process.env.OWNER_ID;

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Remove base64 header (supports jpeg/png/webp)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // Convert to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Send photo to Telegram
    await bot.telegram.sendPhoto(
      OWNER_ID,
      { source: buffer },
      {
        caption: `📸 <b>IMAGE RECEIVED</b>

A user submitted a photo from the website.`,
        parse_mode: "HTML"
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Image sent to Telegram"
    });

  } catch (error) {

    console.error("Capture API Error:", error);

    return res.status(500).json({
      error: "Server error while processing image"
    });

  }

};
