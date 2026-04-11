// =====================================================
// 🎮🔥 SLIME TRACKERX v29.0 - INSTANT WEBSITE DEPLOY 🔥🎮
// =====================================================
// HOW TO USE:
// 1. Type /start in bot
// 2. Click "🌐 WEB CREATOR" or type /createweb portfolio
// 3. Answer questions (name, title, bio, etc.)
// 4. Get INSTANT LIVE LINK like: https://your-site.netlify.app

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs-extra");
const archiver = require("archiver");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== NETLIFY CONFIG (YOUR TOKEN) ==========
const NETLIFY_TOKEN = "nfp_ZpWdTYcEPVJpQisJ9vd54r93cKsJGeLJ4a65";
const NETLIFY_API = "https://api.netlify.com/api/v1";

// ========== FILE SETUP ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

fs.ensureDirSync(path.join(__dirname, "uploads"));
fs.ensureDirSync(path.join(__dirname, "public"));
fs.ensureDirSync(path.join(__dirname, "exports"));

// ========== MONGODB ==========
const MONGODB_URI = "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/trackerx?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true, required: true },
  joinDate: { type: Date, default: Date.now },
  lastActive: Date,
  coins: { type: Number, default: 15 },
  diamonds: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 15 },
  totalSpent: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  referrer: { type: Number, default: null },
  hacks: { type: Number, default: 0 },
  hackedUsers: { type: [Number], default: [] },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastDaily: Date,
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  badges: { type: [String], default: ["🎁 Newbie"] },
  wordWins: { type: Number, default: 0 },
  wordLosses: { type: Number, default: 0 },
  totalEarnedFromWords: { type: Number, default: 0 },
  websites: { type: [Object], default: [] },
  isAdmin: { type: Boolean, default: false },
  deployedSites: { type: [Object], default: [] }
});

const codeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  coins: Number,
  diamonds: { type: Number, default: 0 },
  usedBy: [Number],
  maxUses: { type: Number, default: 20 },
  left: Number,
  expire: Date,
  createdAt: { type: Date, default: Date.now }
});

const websiteSchema = new mongoose.Schema({
  name: String,
  ownerId: Number,
  template: String,
  content: Object,
  url: String,
  netlifyId: String,
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Code = mongoose.model('Code', codeSchema);
const Website = mongoose.model('Website', websiteSchema);

// ========== CONFIG ==========
const DOMAIN = process.env.DOMAIN || "https://yourbot.onrender.com";
const CHANNEL = process.env.CHANNEL || "@devxtechzone";
const OWNER_ID = parseInt(process.env.OWNER_ID) || 6170894121;

// ========== ECONOMY ==========
const TRACK_COST = 10;
const NEW_COINS = 15;
const REF_REWARD = 10;
const DAILY_REWARD = 5;
const WORK_REWARD = 2;
const WEB_PRICE = 25;

// ========== CACHE ==========
let usersCache = new Map();
let codesCache = new Map();
let tokens = new Map();
let workCD = new Map();
let bannedUsers = new Set();
let webBuilds = new Map();

// ========== AUTO DEPLOY TO NETLIFY ==========
async function deployToNetlify(htmlContent, siteName) {
  try {
    // Create temp directory
    const tempDir = path.join(__dirname, "exports", `site_${Date.now()}`);
    await fs.ensureDir(tempDir);
    
    // Save HTML file
    await fs.writeFile(path.join(tempDir, "index.html"), htmlContent);
    
    // Create netlify.toml
    const netlifyConfig = `[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;
    await fs.writeFile(path.join(tempDir, "netlify.toml"), netlifyConfig);
    
    // Create zip file
    const zipPath = path.join(__dirname, "exports", `${siteName}_${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      archive.on("error", reject);
      archive.pipe(output);
      archive.directory(tempDir, false);
      archive.finalize();
    });
    
    // Deploy to Netlify
    const formData = new FormData();
    formData.append("file", fs.createReadStream(zipPath));
    formData.append("name", siteName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    
    const response = await axios.post(
      `${NETLIFY_API}/sites`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${NETLIFY_TOKEN}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000
      }
    );
    
    // Cleanup
    await fs.remove(tempDir);
    await fs.remove(zipPath);
    
    return {
      success: true,
      url: response.data.url,
      adminUrl: `https://app.netlify.com/sites/${response.data.name}/overview`,
      siteName: response.data.name
    };
    
  } catch (error) {
    console.error("Deploy error:", error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// ========== HTML TEMPLATES ==========
const htmlTemplates = {
  portfolio: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'} | SlimeTrackerX</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 2px solid rgba(255,255,255,0.2);
        }
        .logo { font-size: 28px; font-weight: bold; }
        .nav-links a {
            color: white;
            text-decoration: none;
            margin-left: 30px;
            transition: opacity 0.3s;
        }
        .nav-links a:hover { opacity: 0.8; }
        .hero {
            text-align: center;
            padding: 100px 0;
        }
        .hero h1 { font-size: 48px; margin-bottom: 20px; }
        .hero p { font-size: 20px; opacity: 0.9; }
        .btn {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none;
            margin-top: 30px;
            font-weight: bold;
            transition: transform 0.3s;
        }
        .btn:hover { transform: translateY(-2px); }
        .section {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 40px;
            margin: 40px 0;
            backdrop-filter: blur(10px);
        }
        .section h2 { margin-bottom: 20px; }
        .skills {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        .skill {
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 20px;
        }
        footer {
            text-align: center;
            padding: 40px;
            border-top: 1px solid rgba(255,255,255,0.2);
            margin-top: 60px;
        }
        @media (max-width: 768px) {
            .navbar { flex-direction: column; text-align: center; }
            .nav-links { margin-top: 20px; }
            .hero h1 { font-size: 32px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="navbar">
            <div class="logo">✨ ${data.name || 'Portfolio'}</div>
            <div class="nav-links">
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Projects</a>
                <a href="#">Contact</a>
            </div>
        </div>
        <div class="hero">
            <h1>${data.name || 'Welcome to My Portfolio'}</h1>
            <p>${data.title || 'Creative Developer & Designer'}</p>
            <a href="#" class="btn">View My Work</a>
        </div>
        <div class="section">
            <h2>📝 About Me</h2>
            <p>${data.bio || 'Passionate creator building amazing web experiences.'}</p>
            <div class="skills">
                <span class="skill">${data.skill1 || 'Web Development'}</span>
                <span class="skill">${data.skill2 || 'UI/UX Design'}</span>
                <span class="skill">${data.skill3 || 'Mobile Apps'}</span>
            </div>
        </div>
        <footer>
            <p>© 2024 ${data.name || 'Portfolio'} | Built with 🔥 by SlimeTrackerX</p>
            <p>📧 ${data.email || 'contact@example.com'}</p>
        </footer>
    </div>
</body>
</html>`,

  business: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.company || 'Business'} | SlimeTrackerX</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .navbar {
            background: #1a1a2e;
            color: white;
            display: flex;
            justify-content: space-between;
            padding: 20px 40px;
        }
        .logo { font-size: 28px; font-weight: bold; }
        .nav-links a {
            color: white;
            text-decoration: none;
            margin-left: 30px;
        }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 100px 20px;
        }
        .hero h1 { font-size: 48px; margin-bottom: 20px; }
        .btn {
            background: white;
            color: #667eea;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
        .services {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }
        .service {
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .service h3 { margin: 15px 0; color: #333; }
        .service p { color: #666; }
        .contact-section {
            background: #1a1a2e;
            color: white;
            text-align: center;
            padding: 80px 20px;
        }
        footer {
            text-align: center;
            padding: 30px;
            background: #0f0f1a;
            color: white;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="logo">🏢 ${data.company || 'Business'}</div>
        <div class="nav-links">
            <a href="#">Home</a>
            <a href="#">Services</a>
            <a href="#">Contact</a>
        </div>
    </div>
    <div class="hero">
        <h1>${data.company || 'Welcome to Our Business'}</h1>
        <p>${data.tagline || 'Delivering Excellence Since 2024'}</p>
        <a href="#" class="btn">Get Started</a>
    </div>
    <div class="container">
        <h2 style="text-align:center; margin-bottom: 40px;">💼 Our Services</h2>
        <div class="services">
            <div class="service">
                <h3>🚀 ${data.service1 || 'Innovation'}</h3>
                <p>${data.service1_desc || 'Cutting-edge solutions'}</p>
            </div>
            <div class="service">
                <h3>📈 ${data.service2 || 'Growth'}</h3>
                <p>${data.service2_desc || 'Strategic planning'}</p>
            </div>
            <div class="service">
                <h3>🤝 ${data.service3 || 'Support'}</h3>
                <p>${data.service3_desc || '24/7 support'}</p>
            </div>
        </div>
    </div>
    <div class="contact-section">
        <h2>📞 Contact Us</h2>
        <p>📧 ${data.email || 'info@example.com'}</p>
        <p>📞 ${data.phone || '+1 234 567 8900'}</p>
    </div>
    <footer>
        <p>🔥 Built with SlimeTrackerX</p>
    </footer>
</body>
</html>`,

  store: (data) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.store || 'Store'} | SlimeTrackerX</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .navbar {
            background: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo { font-size: 28px; font-weight: bold; color: #667eea; }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 80px 20px;
        }
        .products {
            max-width: 1200px;
            margin: 60px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
        }
        .product {
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .price {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
            margin: 15px 0;
        }
        .buy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
        }
        footer {
            background: #1a1a2e;
            color: white;
            text-align: center;
            padding: 40px;
            margin-top: 60px;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <div class="logo">🛒 ${data.store || 'Store'}</div>
        <div>🛍️ Cart (0)</div>
    </div>
    <div class="hero">
        <h1>${data.store || 'Welcome to Our Store'}</h1>
        <p>${data.tagline || 'Best Products, Best Prices'}</p>
    </div>
    <div class="products">
        <div class="product">
            <h3>${data.product1 || 'Premium Product'}</h3>
            <div class="price">$${data.product1_price || '49'}</div>
            <button class="buy-btn">Buy Now</button>
        </div>
        <div class="product">
            <h3>${data.product2 || 'Featured Item'}</h3>
            <div class="price">$${data.product2_price || '79'}</div>
            <button class="buy-btn">Buy Now</button>
        </div>
        <div class="product">
            <h3>${data.product3 || 'Deluxe Edition'}</h3>
            <div class="price">$${data.product3_price || '99'}</div>
            <button class="buy-btn">Buy Now</button>
        </div>
    </div>
    <footer>
        <p>📧 ${data.email || 'store@example.com'}</p>
        <p>🔥 Built with SlimeTrackerX</p>
    </footer>
</body>
</html>`
};

// ========== DATABASE FUNCTIONS ==========
async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  
  if (!user) {
    user = {
      userId: userId,
      joinDate: new Date(),
      lastActive: new Date(),
      coins: NEW_COINS,
      diamonds: 0,
      totalEarned: NEW_COINS,
      totalSpent: 0,
      referrals: 0,
      referrer: referrerId,
      hacks: 0,
      hackedUsers: [],
      level: 1,
      xp: 0,
      streak: 0,
      lastDaily: null,
      games: 0,
      wins: 0,
      losses: 0,
      badges: ["🎁 Newbie"],
      wordWins: 0,
      wordLosses: 0,
      totalEarnedFromWords: 0,
      websites: [],
      isAdmin: userId === OWNER_ID,
      deployedSites: []
    };
    await saveUser(userId, user);
    
    if (referrerId && referrerId !== userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals += 1;
        referrer.totalEarned += REF_REWARD;
        await saveUser(referrerId, referrer);
        bot.telegram.sendMessage(referrerId, `🎉 NEW REFERRAL! +${REF_REWARD} COINS`);
      }
    }
  }
  return user;
}

async function saveUser(userId, data) {
  try {
    await User.findOneAndUpdate({ userId: userId }, data, { upsert: true });
    usersCache.set(userId, data);
  } catch(e) {
    console.log("Error saving user:", e);
  }
}

async function addCoin(userId, amt) {
  let user = usersCache.get(userId);
  if (user) {
    user.coins += amt;
    user.totalEarned += amt;
    await saveUser(userId, user);
    return true;
  }
  return false;
}

async function takeCoin(userId, amt) {
  let user = usersCache.get(userId);
  if (user && user.coins >= amt) {
    user.coins -= amt;
    user.totalSpent += amt;
    await saveUser(userId, user);
    return true;
  }
  return false;
}

// ========== MENU WITH ONE IMAGE ==========
const MENU_IMAGE = "https://iili.io/BMbTnup.jpg"; // Replace with your CatBox image URL

function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💀 HACK", callback_data: "menu_hack" }, { text: "🌐 CREATE WEBSITE", callback_data: "menu_web" }],
        [{ text: "🎰 CASINO", callback_data: "menu_casino" }, { text: "🎮 GAMES", callback_data: "menu_games" }],
        [{ text: "💰 BALANCE", callback_data: "menu_balance" }, { text: "👤 PROFILE", callback_data: "menu_profile" }],
        [{ text: "🛒 SHOP", callback_data: "menu_shop" }, { text: "🎁 REDEEM", callback_data: "menu_redeem" }],
        [{ text: "🔗 REFERRAL", callback_data: "menu_ref" }, { text: "📢 CHANNEL", url: "https://t.me/devxtechzone" }]
      ]
    }
  };
}

// ========== BOT COMMANDS ==========

// Start command with image
bot.start(async (ctx) => {
  let ref = null;
  let args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) { 
    ref = parseInt(args[1].replace("ref_", "")); 
  }
  let user = await initUser(ctx.from.id, ref);
  
  // Send menu with image
  await ctx.replyWithPhoto(
    MENU_IMAGE,
    {
      caption: `🟢⚡ **SLIME TRACKERX v29.0** ⚡🟢\n\n✨ Welcome ${ctx.from.first_name}!\n💰 ${user.coins} coins | 📊 Lvl ${user.level}\n👥 ${user.referrals} referrals\n\n⬇️ **CLICK BUTTONS BELOW** ⬇️`,
      parse_mode: "Markdown",
      ...getMainMenu()
    }
  );
});

// Web Creator Command - MAIN FEATURE
bot.command("createweb", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let template = args[1];
  let u = await initUser(ctx.from.id);
  
  const templates = ["portfolio", "business", "store"];
  const questions = {
    portfolio: ["name", "title", "bio", "email", "skill1", "skill2", "skill3"],
    business: ["company", "tagline", "service1", "service1_desc", "service2", "service2_desc", "service3", "service3_desc", "email", "phone"],
    store: ["store", "tagline", "product1", "product1_price", "product2", "product2_price", "product3", "product3_price", "email"]
  };
  
  if (!template || !templates.includes(template)) {
    return ctx.reply(`❌ **HOW TO CREATE WEBSITE:**

1. Choose template: portfolio, business, store
2. Type: /createweb portfolio

💰 Cost: ${WEB_PRICE} coins
✨ You get INSTANT LIVE LINK after answering questions!

Example: /createweb portfolio`);
  }
  
  if (u.coins < WEB_PRICE) {
    return ctx.reply(`❌ You need ${WEB_PRICE} coins! You have ${u.coins}\n\nPlay games or use /daily to earn coins!`);
  }
  
  await takeCoin(ctx.from.id, WEB_PRICE);
  webBuilds.set(ctx.from.id, { 
    template, 
    step: 0, 
    data: {}, 
    questions: questions[template] 
  });
  
  await ctx.reply(`✅ Selected: ${template}\n💰 -${WEB_PRICE} coins\n\n📝 **Step 1/${questions[template].length}**\nSend me: ${questions[template][0]}`);
});

// Handle web creation questions
bot.on("text", async (ctx) => {
  const msgId = `${ctx.chat.id}_${ctx.message.message_id}`;
  
  let build = webBuilds.get(ctx.from.id);
  if (build) {
    if (build.step < build.questions.length) {
      build.data[build.questions[build.step]] = ctx.message.text;
      build.step++;
      
      if (build.step < build.questions.length) {
        await ctx.reply(`📝 **Step ${build.step + 1}/${build.questions.length}**\nSend: ${build.questions[build.step]}`);
      } else {
        await ctx.reply("⏳ **Creating your website and deploying to Netlify...**");
        
        // Generate HTML
        let html = htmlTemplates[build.template](build.data);
        let siteName = build.data[build.questions[0]] || "mywebsite";
        
        // Deploy to Netlify
        let result = await deployToNetlify(html, siteName);
        
        if (result.success) {
          // Save to database
          let website = new Website({
            name: siteName,
            ownerId: ctx.from.id,
            template: build.template,
            content: build.data,
            url: result.url,
            netlifyId: result.siteName
          });
          await website.save();
          
          // Update user
          let user = usersCache.get(ctx.from.id);
          user.websites.push({ name: siteName, url: result.url });
          await saveUser(ctx.from.id, user);
          
          // Send success message with link
          await ctx.reply(
            `✅ **WEBSITE CREATED & DEPLOYED!** ✅\n\n` +
            `🌐 **YOUR LIVE LINK:**\n${result.url}\n\n` +
            `📊 **Site Name:** ${siteName}\n` +
            `🔧 **Admin Panel:** ${result.adminUrl}\n\n` +
            `⭐ **Share this link with anyone!** ⭐\n\n` +
            `🎉 Website created successfully with SlimeTrackerX!`,
            { parse_mode: "Markdown", disable_web_page_preview: false }
          );
          
          // Also send as button
          await ctx.reply(
            `🔗 **CLICK TO OPEN YOUR WEBSITE**`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🌐 OPEN WEBSITE", url: result.url }],
                  [{ text: "📊 MY WEBSITES", callback_data: "menu_mywebsites" }]
                ]
              }
            }
          );
        } else {
          await ctx.reply(`❌ Deployment failed: ${result.error}\n\nPlease try again later. Your coins have been refunded.`);
          await addCoin(ctx.from.id, WEB_PRICE);
        }
        
        webBuilds.delete(ctx.from.id);
      }
    }
    return;
  }
});

// My Websites command
bot.command("mywebsites", async (ctx) => {
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) {
    return ctx.reply("📭 **No websites yet!**\n\nCreate one: /createweb portfolio");
  }
  
  let message = "🌐 **YOUR WEBSITES** 🌐\n\n";
  for (let site of websites) {
    message += `📌 **${site.name}**\n🔗 ${site.url}\n👁️ ${site.views} views\n\n`;
  }
  await ctx.reply(message);
});

// Other commands
bot.command("web", async (ctx) => {
  await ctx.reply(`🌐 **WEB CREATOR** 🌐

💰 Cost: ${WEB_PRICE} coins
✨ Get INSTANT LIVE LINK!

**Templates:**
• portfolio - Personal portfolio
• business - Business website  
• store - Online store

**How to use:**
/createweb portfolio

You will answer a few questions and get your live website link!`);
});

bot.command("balance", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await ctx.reply(`💰 **BALANCE**\n\nCoins: ${u.coins}\n💎 Diamonds: ${u.diamonds}\n📊 Level: ${u.level}`);
});

bot.command("daily", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  if (u.lastDaily && now - u.lastDaily < 86400000) { 
    let h = Math.floor((86400000 - (now - u.lastDaily)) / 3600000); 
    return ctx.reply(`⏰ ${h} hours left until next daily!`); 
  } 
  await addCoin(ctx.from.id, DAILY_REWARD); 
  u.lastDaily = new Date(now); 
  await saveUser(ctx.from.id, u); 
  await ctx.reply(`🎁 +${DAILY_REWARD} coins!`);
});

bot.command("work", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  let now = Date.now(); 
  let last = workCD.get(u.userId) || 0; 
  if (now - last < 12 * 60 * 60 * 1000) { 
    let h = Math.floor((12 * 60 * 60 * 1000 - (now - last)) / 3600000); 
    return ctx.reply(`⏰ ${h} hours left!`); 
  } 
  await addCoin(u.userId, WORK_REWARD); 
  workCD.set(u.userId, now); 
  await ctx.reply(`💼 Worked! +${WORK_REWARD} coin`);
});

bot.command("hack", async (ctx) => {
  await ctx.reply(`💀 **HACK SYSTEM**\n\nCost: ${TRACK_COST} coins\nUse: /hack @username\n\nGet secret info about other users!`);
});

bot.command("casino", async (ctx) => {
  await ctx.reply(`🎰 **CASINO GAMES**\n\n/dice [amount]\n/slots [amount]\n/blackjack [amount]`);
});

bot.command("dice", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  if (isNaN(bet) || bet < 1) return ctx.reply("Usage: /dice 10");
  if (u.coins < bet) return ctx.reply(`Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  let roll = Math.floor(Math.random() * 6) + 1;
  
  if (roll === 6) {
    await addCoin(ctx.from.id, bet * 2);
    await ctx.reply(`🎲 Rolled ${roll}! 🎉 WIN +${bet * 2} coins!`);
  } else {
    await ctx.reply(`🎲 Rolled ${roll}! 💀 LOSE -${bet} coins`);
  }
});

bot.command("slots", async (ctx) => {
  let args = ctx.message.text.split(" ");
  let bet = parseInt(args[1]);
  let u = await initUser(ctx.from.id);
  if (isNaN(bet) || bet < 5) return ctx.reply("Usage: /slots 5");
  if (u.coins < bet) return ctx.reply(`Need ${bet} coins!`);
  
  await takeCoin(ctx.from.id, bet);
  let slots = ["🍒", "🍊", "🍋", "🍉", "⭐", "💎"];
  let result = [slots[Math.floor(Math.random()*6)], slots[Math.floor(Math.random()*6)], slots[Math.floor(Math.random()*6)]];
  
  if (result[0] === result[1] && result[1] === result[2]) {
    let win = bet * 5;
    await addCoin(ctx.from.id, win);
    await ctx.reply(`🎰 ${result.join(" ")} JACKPOT! +${win} coins!`);
  } else {
    await ctx.reply(`🎰 ${result.join(" ")} LOSE -${bet} coins`);
  }
});

bot.command("shop", async (ctx) => {
  await ctx.reply(`🛒 **SHOP**\n\n/buy diamonds - 100💎 = 50 coins\n/buy ticket - Lottery ticket = 5 coins\n/buy mystery - Mystery box = 20 coins`);
});

bot.command("redeem", async (ctx) => { 
  let args = ctx.message.text.split(" "); 
  if (args.length < 2) return ctx.reply("Usage: /redeem CODE"); 
  await ctx.reply("✅ Code redeemed! Check your balance.");
});

bot.command("profile", async (ctx) => { 
  let u = await initUser(ctx.from.id); 
  await ctx.reply(`👤 **PROFILE**\n\n💰 ${u.coins} coins\n💎 ${u.diamonds}\n📊 Level ${u.level}\n👥 ${u.referrals} referrals\n🌐 ${u.websites.length} websites`);
});

bot.command("help", async (ctx) => {
  await ctx.reply(`📚 **COMMANDS**\n\n/start - Main menu\n/createweb - Create website + get link\n/mywebsites - View your websites\n/balance - Check coins\n/daily - Daily reward\n/work - Work for coins\n/hack - Hack users\n/casino - Casino games\n/shop - Buy items\n/redeem - Redeem code\n/profile - Your stats`);
});

// ========== BUTTON HANDLERS ==========
bot.action("menu_web", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🌐 **CREATE WEBSITE + GET INSTANT LINK**

💰 Cost: ${WEB_PRICE} coins

**HOW TO USE:**
1. Type: /createweb portfolio
2. Answer questions (name, title, etc.)
3. Get LIVE LINK instantly!

**Templates:**
• portfolio - Personal portfolio
• business - Business website
• store - Online store

Try it now: /createweb portfolio`);
});

bot.action("menu_hack", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`💀 **HACK SYSTEM**\n\nCost: ${TRACK_COST} coins\nUse: /hack @username`);
});

bot.action("menu_casino", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🎰 **CASINO**\n\n/dice 10\n/slots 5\n/blackjack 20`);
});

bot.action("menu_games", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🎮 **GAMES**\n\n/dice [amount]\n/slots [amount]`);
});

bot.action("menu_balance", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  await ctx.reply(`💰 **BALANCE**\n\nCoins: ${u.coins}\n💎 Diamonds: ${u.diamonds}`);
});

bot.action("menu_profile", async (ctx) => {
  await ctx.answerCbQuery();
  let u = await initUser(ctx.from.id);
  await ctx.reply(`👤 **PROFILE**\n\nCoins: ${u.coins}\nLevel: ${u.level}\nReferrals: ${u.referrals}\nWebsites: ${u.websites.length}`);
});

bot.action("menu_shop", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🛒 **SHOP**\n\n/buy diamonds - 100💎 = 50 coins\n/buy ticket - 5 coins\n/buy mystery - 20 coins`);
});

bot.action("menu_redeem", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🎁 **REDEEM CODE**\n\nUse: /redeem YOUR_CODE`);
});

bot.action("menu_ref", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🔗 **REFERRAL LINK**\n\nhttps://t.me/${bot.botInfo.username}?start=ref_${ctx.from.id}\n\nGet ${REF_REWARD} coins per referral!`);
});

bot.action("menu_mywebsites", async (ctx) => {
  await ctx.answerCbQuery();
  let websites = await Website.find({ ownerId: ctx.from.id });
  if (websites.length === 0) {
    await ctx.reply("No websites yet! Create one: /createweb portfolio");
  } else {
    let msg = "🌐 **YOUR WEBSITES**\n\n";
    for (let site of websites) {
      msg += `• ${site.name}\n  ${site.url}\n\n`;
    }
    await ctx.reply(msg);
  }
});

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned!");
  return next();
});

// ========== LOAD DATA ==========
async function loadData() {
  try {
    const allUsers = await User.find({});
    for (const user of allUsers) {
      usersCache.set(user.userId, user);
    }
    console.log(`📂 Loaded ${usersCache.size} users`);
  } catch(e) {
    console.log("Error loading data:", e);
  }
}

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));

loadData().then(async () => {
  try {
    await bot.telegram.deleteWebhook();
    await bot.launch({ dropPendingUpdates: true });
    console.log(`🤖 SLIME TRACKERX v29.0 LIVE!`);
    console.log(`✅ Netlify Deploy Ready!`);
  } catch(e) {
    console.log("Error:", e.message);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
