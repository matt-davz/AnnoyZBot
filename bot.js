const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('YOUR_BOT_TOKEN', { polling: true });


const ANNOY_ZANE_CHAT_ID = -123456789;

const colorEmojis = ['🔴', '🟠', '🟢'];
const urgentEmojis = ['‼️']; // Expand if needed

function detectPriority(text) {
  const color = colorEmojis.find((emoji) => text.includes(emoji)) || null;
  const urgent = urgentEmojis.find((emoji) => text.includes(emoji)) || null;
  return { color, urgent };
}

function deleteMessageAfterDelay(chatId, messageId, delay = 3000) {
  setTimeout(() => {
    bot.deleteMessage(chatId, messageId).catch((err) => {
      console.error('❌ Failed to delete message:', err.message);
    });
  }, delay);
}

function endCommand(msg, delay = 3000) {
  deleteMessageAfterDelay(msg.chat.id, msg.message_id, delay);
  return;
}

function formatTaskMessage(text, color, urgent) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `• ${color}${urgent ? ' ' + urgent : ''} ${text}\n${time}`;
}

// /task command
bot.onText(/\/task (.+)/, (msg, match) => {
  const originalText = match[1].trim();
  const { color, urgent } = detectPriority(originalText);

  if (!color) {
    bot.sendMessage(msg.chat.id, '❌ Please include one of the color emojis (🔴🟠🟢) in your task.');
    return endCommand(msg);
  }

  let cleanedText = originalText.replace(color, '');
  if (urgent) cleanedText = cleanedText.replace(urgent, '');
  cleanedText = cleanedText.trim();

  const formattedMessage = formatTaskMessage(cleanedText, color, urgent);
  bot.sendMessage(ANNOY_ZANE_CHAT_ID, formattedMessage);

  return endCommand(msg);
});