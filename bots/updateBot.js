const handleUpdateCommand = require('../commands/update');
const { getUpdatesByDate } = require('../database/dbUpdate');
const {endCommand,createBorderImage,rapidfire} = require('../utils');
const {sortUpdates} = require('../commands/updateUtils');
const updatePing = require('../commands/updatePing');

module.exports = async function updateBot(bot,msg) {
    if (msg.text && msg.text.startsWith('/update')) {
      const fullText = msg.text.replace('/update', '').trim();
      if (fullText.length === 0) {
        bot.sendMessage(msg.chat.id, '❌ Please include a message after /update');
        return;
      }

      handleUpdateCommand(bot, msg, fullText);

    }

    if (msg.text && msg.text.startsWith('/ping')){
        await updatePing(bot, msg);
        // const fullText = msg.text.replace('/ping', '').trim();

        // await createBorderImage(bot, msg);
        // await bot.sendMessage(
        //     msg.chat.id,
        //     '============================\nUPDATES 🟠🔔:\n============================'
        // );

        // const updates = await getUpdatesByDate(fullText);
        // const sortedUpdates = sortUpdates(updates);
        // rapidfire(bot, msg.chat.id, sortedUpdates);
    }

  console.log(`🎃🍂 UPDATE BOT IS HERE TO KEEP YOU INFORMED! 🍂🎃`);
};