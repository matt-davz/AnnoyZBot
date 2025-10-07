require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { logStartup, notifyDevStartup } = require('./dev');
const annoyBot = require('./bots/annoyBot');
const updateBot = require('./bots/updateBot');
const {getTaskGIDFromText} = require('./utils');
const {completeTask} = require('./asana/completeTask');


// Connect to MongoDB

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

bot.on('polling_error', (error) => console.error('Polling error:', error));

logStartup();
notifyDevStartup(bot);

bot.onText(/(.+)/, (msg, match) => {
  if (
    msg.chat.id == parseInt(process.env.ANNOY_ZANE_TEST_CHAT_ID) ||
    msg.chat.id == parseInt(process.env.ANNOY_ZANE_CHAT_ID)
  ) {
    annoyBot(bot, msg, match);
  } else if (
    msg.chat.id == parseInt(process.env.UPDATE_ZANE_CHAT_ID) ||
    msg.chat.id == parseInt(process.env.UPDATE_ZANE_TEST_CHAT_ID)
  ) {
    updateBot(bot, msg, match);
  }
});

// Handle "✅ Seen" button presses
bot.on('callback_query', async (callbackQuery) => {
  const prevmessageId = Number(callbackQuery.message.message_id) - 1;

  const { message, data, id } = callbackQuery;

  const taskGID = getTaskGIDFromText(message.text);

  console.log('taskGID:', taskGID); 

  if(taskGID){
    try {
      await completeTask(taskGID);
      console.log('✅ Task completed in Asana');
    } catch (err) {
      console.error('❌ Failed to complete task in Asana:', err.message);
      await bot.answerCallbackQuery(id, { text: '❌ Failed to complete task' });
      return;
    }
  }

  if (data === 'mark_seen') {
    await bot.answerCallbackQuery(id, { text: 'Marked as done' });



    const originalText = message.text || '';
    const updatedText = originalText.endsWith('✅')
      ? originalText
      : originalText + '\n✅';

    try {
      await bot.editMessageText(updatedText, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.error('❌ Failed to update task message:', err.message);
    }
  }

  if (data === 'update_seen') {
    try {
      await bot.answerCallbackQuery(id, { text: 'Update Seen' });
      const originalText = message.text || '';
      const updatedText = originalText.endsWith('\n\n👁️👁️')
        ? originalText
        : originalText + '\n\n👁️👁️';

      await bot.editMessageText(updatedText, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Remove', callback_data: 'update_remove' }],
          ],
        },
      });
    } catch (err) {
      console.error(
        '❌ Failed to update task message with eye emoji:',
        err.message
      );
    }
  } else if (data === 'update_seen_remove' || data === 'update_remove') {
    try {
      await toggleUpdateStatus(message.text, [true, true]);
      await bot.answerCallbackQuery(id, { text: 'Update Removed' });
      const originalText = message.text || '';
      const updatedText = originalText.endsWith('\n\n👁️👁️')
        ? originalText
        : originalText + '\n\n👁️👁️❌';

      await bot.editMessageText(updatedText, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.error(
        '❌ Failed to append eye emoji to task message:',
        err.message
      );
    }
  }
});
