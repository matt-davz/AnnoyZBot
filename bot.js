require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { logStartup, notifyDevStartup } = require('./dev');
const handleTaskCommand = require('./commands/task');
const connectDB = require('./database/connect');
const {
  toogleTaskSeenStatus,
  toggleTaskSeenStatus,
  getTasksByDate,
  
} = require('./database/dbTask');
const { rapidfire, endCommand , createBorderImage} = require('./utils');
const { sortTasks } = require('./commands/commandUtils');
const annoyBot  = require('./bots/annoyBot');
const updateBot = require('./bots/updateBot');
const {toggleUpdateStatus} = require('./database/dbUpdate');



const path = require('path');

// Connect to MongoDB
connectDB();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

bot.on('polling_error', (error) => console.error('Polling error:', error));



bot.onText(/(.+)/, (msg, match) => {
  if (msg.chat.id == parseInt(process.env.ANNOY_ZANE_TEST_CHAT_ID) || msg.chat.id == parseInt(process.env.ANNOY_ZANE_CHAT_ID)) {
    annoyBot(bot, msg, match);
  } else if (msg.chat.id == parseInt(process.env.UPDATE_ZANE_CHAT_ID) || msg.chat.id == parseInt(process.env.UPDATE_ZANE_TEST_CHAT_ID)) {
    updateBot(bot, msg, match);
  }
});


logStartup();
notifyDevStartup(bot);

// Register /task command
// bot.on('message', (msg) => {
//     if (msg.text && msg.text.startsWith('/task')) {
//       const fullText = msg.text.replace('/task', '').trim();
//       handleTaskCommand(bot, msg, [null, fullText]);
//     }
// });

// Register /taskMass command
bot.onText(/\/taskMass (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const tasksInput = match[1]; // Get the input after /taskMass
  const tasks = tasksInput.split('/'); // Split tasks by "/"

  for (const task of tasks) {
    try {
      // Reuse handleTaskCommand for each task
    } catch (error) {
      console.error(`❌ Error handling task "${task}":`, error.message);
    }
  }

  bot.sendMessage(chatId, '✅ All tasks processed successfully.');
});

// Register /ping command
bot.onText(/\/ping/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`📩 Received /ping command from chat ID: ${chatId}`);

  try {
    // First: send the red border
    await createBorderImage(bot, msg);

    // Then: send the ping message
    await bot.sendMessage(
      chatId,
      '============================\nPING 🔴🔔:\n============================'
    );

    // Then: send all the tasks
    const tasks = await getTasksByDate();
    const sortedTasks = sortTasks(tasks);
    await rapidfire(bot, chatId, sortedTasks);

    await createBorderImage(bot, msg);

  } catch (error) {
    console.error('❌ Error in /ping:', error.message);
    bot.sendMessage(chatId, '❌ Something went wrong.');
  }

  endCommand(bot, msg);
});


// Handle "✅ Seen" button presses
bot.on('callback_query', async (callbackQuery) => {
  const prevmessageId = Number(callbackQuery.message.message_id) - 1;

  const { message, data, id } = callbackQuery;
  
  if (data === 'mark_seen') {
    toggleTaskSeenStatus(message.text);
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
      await toggleUpdateStatus(message.text.trim(),[true]);
      await bot.answerCallbackQuery(id, { text: 'Update Seen' });
      const originalText = message.text || '';
      const updatedText = originalText.endsWith('\n\n👁️👁️')
        ? originalText
        : originalText + '\n\n👁️👁️';

      await bot.editMessageText(updatedText, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: { inline_keyboard: [[{text:'Remove', callback_data: 'update_remove'}]] },
      });
    } catch (err) {
      console.error('❌ Failed to update task message with eye emoji:', err.message);
    }
  } else if (data === 'update_seen_remove' || data === 'update_remove') {
    try {
      await toggleUpdateStatus(message.text,[true,true]);
      await bot.answerCallbackQuery(id, { text: 'Update Removed' });
      const originalText = message.text || '';
      const updatedText = originalText.endsWith('\n\n👁️👁️')
        ? originalText
        : originalText + '\n\n👁️👁️';

      await bot.editMessageText(updatedText, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: { inline_keyboard: [] },
      });
    } catch (err) {
      console.error('❌ Failed to append eye emoji to task message:', err.message);
    }
  }
});
