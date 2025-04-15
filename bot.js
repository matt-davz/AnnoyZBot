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
const { rapidfire, endCommand } = require('./utils');
const { sortTasks } = require('./commands/commandUtils');
const annoyBot  = require('./bots/annoyBot');
const updateBot = require('./bots/updateBot');

// Connect to MongoDB
connectDB();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

bot.on('polling_error', (error) => console.error('Polling error:', error));

bot.on('message', (msg) => {
  if (msg.chat.id == parseInt(process.env.ANNOY_ZANE_TEST_CHAT_ID) || msg.chat.id == parseInt(process.env.ANNOY_ZANE_CHAT_ID)) {
    annoyBot(bot, msg);
  } else if (msg.chat.id == parseInt(process.env.UPDATE_ZANE_CHAT_ID) || msg.chat.id == parseInt(process.env.UPDATE_ZANE_TEST_CHAT_ID)) {
    updateBot(bot, msg);
  }
});


logStartup();
notifyDevStartup(bot);

// Register /task command
bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/task')) {
      const fullText = msg.text.replace('/task', '').trim();
      handleTaskCommand(bot, msg, [null, fullText]);
    }
});

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

  await console.log(`📩 Received /ping command from chat ID: ${chatId}`);
  bot.sendMessage(
    chatId,
    '============================\nPING 🔴🔔:\n============================'
  );

  try {
    const tasks = await getTasksByDate();
    const sortedTasks = sortTasks(tasks);
    await rapidfire(bot, chatId, sortedTasks);
  } catch (error) {
    console.error('❌ Error fetching tasks by date:', error.message);
  }

  endCommand(bot, msg);
});

// Handle "✅ Seen" button presses
bot.on('callback_query', async (callbackQuery) => {
  const prevmessageId = Number(callbackQuery.message.message_id) - 1;

  const { message, data, id } = callbackQuery;
  toggleTaskSeenStatus(message.text);
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
});
