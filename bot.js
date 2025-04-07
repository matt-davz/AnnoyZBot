require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const {
  detectPriority,
  endCommand,
  formatTaskMessage,
  sendTemporaryError,
} = require('./utils');
const {
  logStartup,
  notifyDevStartup,
} = require('./dev');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

const DEV_CHAT_ID = 1526672904;
const ANNOY_ZANE_CHAT_ID = -4674536716;

logStartup();
notifyDevStartup(bot, DEV_CHAT_ID);

// /task command — posts task with "✅ Seen" button
bot.onText(/\/task (.+)/, async (msg, match) => {
  const originalText = match[1].trim();
  const { color, urgent } = detectPriority(originalText);

  if (!color) {
    await sendTemporaryError(bot, msg, '❌ Please include a color emoji (🔴🟠🟢).');
    return;
  }

  let cleanedText = originalText.replace(color, '');
  if (urgent) cleanedText = cleanedText.replace(urgent, '');
  cleanedText = cleanedText.trim();

  const formatted = formatTaskMessage(cleanedText, color, urgent);

  await bot.sendMessage(ANNOY_ZANE_CHAT_ID, formatted, {
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Seen', callback_data: 'mark_seen' }
      ]]
    }
  });

  return endCommand(bot, msg);
});

// Handle "✅ Seen" button presses — deletes the task message
bot.on('callback_query', async (callbackQuery) => {
    const { message, data, id } = callbackQuery;
  
    if (data === 'mark_seen') {
      await bot.answerCallbackQuery(id, { text: 'Marked as seen!' });
  
      const originalText = message.text || '';
  
      // Add ✅ to the end if not already present
      const updatedText = originalText.endsWith('✅')
        ? originalText
        : originalText + ' ✅';
  
      try {
        // Edit the message text to include the ✅
        await bot.editMessageText(updatedText, {
          chat_id: message.chat.id,
          message_id: message.message_id,
          reply_markup: { inline_keyboard: [] }, // Remove the button
        });
      } catch (err) {
        console.error('❌ Failed to update task message:', err.message);
      }
    }
  });