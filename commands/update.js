const { createUpdate } = require('../database/dbUpdate');
const { formatUpdateMessage } = require('./updateUtils');

module.exports = async function handleUpdateCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const timeStamp = msg.date; // Assuming msg.date is the timestamp you want to use
  const cleanedText = text.replace('/update', '').trim();
  const formattedText = formatUpdateMessage(cleanedText,timeStamp);
  
    try {
      await createUpdate({
        text: text,
        messageId: msg.message_id,
        updateId: `${Date.now()}${msg.from.id}`,
      });

      console.log('✅ Update successfully created in the database');

      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Seen', callback_data: 'update_seen' },
              { text: 'Seen & Remove', callback_data: 'update_seen_remove' }
            ]
          ]
        }
      };

      await bot.sendMessage(chatId, formattedText, options);
    } catch (error) {
      console.error('❌ Failed to create update in the database:', error);
    }
};
