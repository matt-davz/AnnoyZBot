// dev.js

function logStartup() {
    console.log('🤖 Annoy Zane bot is running and listening for /task commands...');
  }
  
  function notifyDevStartup(bot, devChatId) {
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