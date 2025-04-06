require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Load bot token from .env
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(botToken, { polling: true });

// Chat ID for Annoy Zane group
const ANNOY_ZANE_CHAT_ID = -4674536716;

// Priority emoji sets
const colorEmojis = ['🔴', '🟠', '🟢'];
const urgentEmojis = ['‼️']; // You can add more urgency symbols here

// Detect priority and urgency emojis
function detectPriority(text) {
  const color = colorEmojis.find((emoji) => text.includes(emoji)) || null;
  const urgent = urgentEmojis.find((emoji) => text.includes(emoji)) || null;
  return { color, urgent };
}

// Auto-delete original message after a delay
function deleteMessageAfterDelay(chatId, messageId, delay = 3000) {
  setTimeout(() => {
    bot.deleteMessage(chatId, messageId).catch((err) => {
      console.error('❌ Failed to delete message:', err.message);
    });
  }, delay);
}

// Shortcut to cleanly end a command
function endCommand(msg, delay = 3000) {
  deleteMessageAfterDelay(msg.chat.id, msg.message_id, delay);
  return;
}

// Format the outgoing task message
function formatTaskMessage(text, color, urgent) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `• ${color}${urgent ? ' ' + urgent : ''} ${text}\n${time}`;
}

// /task command handler
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