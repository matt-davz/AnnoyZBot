const handleUpdateCommand = require('../commands/update');
const {endCommand} = require('../utils');

module.exports = function updateBot(bot,msg) {
    if (msg.text && msg.text.startsWith('/update')) {
      const fullText = msg.text.replace('/update', '').trim();
      if (fullText.length === 0) {
        bot.sendMessage(msg.chat.id, '❌ Please include a message after /update');
        return;
      }

      handleUpdateCommand(bot, msg, fullText);
      endCommand(bot,msg) // <-- pass fullText instead of match
    }

  console.log(`🎃🍂 UPDATE BOT IS HERE TO KEEP YOU INFORMED! 🍂🎃`);
};