require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { logStartup, notifyDevStartup } = require('./dev');
const handleTaskCommand = require('./commands/task');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

const DEV_CHAT_ID = 1526672904;

logStartup();
notifyDevStartup(bot, DEV_CHAT_ID);

// Register /task command
bot.onText(/\/task (.+)/, (msg, match) => handleTaskCommand(bot, msg, match));

// Handle "✅ Seen" button presses
bot.on('callback_query', async (callbackQuery) => {
  const { message, data, id } = callbackQuery;

  if (data === 'mark_seen') {
    await bot.answerCallbackQuery(id, { text: 'Marked as seen!' });

    const originalText = message.text || '';
    const updatedText = originalText.endsWith('✅')
      ? originalText
      : originalText + ' ✅';

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