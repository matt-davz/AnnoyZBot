// dev.js

function logStartup() {
    const os = require('os');
    console.log('🤖 Annoy Zane bot is running...');
    console.log('System uptime:', os.uptime());
    console.log('Timestamp:', new Date().toLocaleString());
}


  
function notifyDevStartup(bot) {
    const devChatId = parseInt(process.env.DEV_CHAT_ID);
    const now = new Date();
    const bootTime = now.toLocaleString();
    const message = `✅ Annoy Zane bot is now live.\n🕒 ${bootTime}`;
  
    bot.sendMessage(devChatId, message).catch((err) => {
      console.error('❌ Failed to send dev startup message:', err.message);
    });
  }
  
  module.exports = {
    logStartup,
    notifyDevStartup,
  };