require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const {
  detectPriority,
  endCommand,
  formatTaskMessage,
} = require('./utils');

// Load bot token from .env
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(botToken, { polling: true });

// ✅ Log on startup
console.log('🤖 Annoy Zane bot is running and listening for /task commands...');

// Chat ID for Annoy Zane group
const ANNOY_ZANE_CHAT_ID = -4674536716;

// /task command handler
bot.onText(/\/task (.+)/, (msg, match) => {
  const originalText = match[1].trim();
  const { color, urgent } = detectPriority(originalText);

  if (!color) {
    bot.sendMessage(msg.chat.id, '❌ Please include one of the color emojis (🔴🟠🟢) in your task.');
    return endCommand(bot, msg);
  }

  let cleanedText = originalText.replace(color, '');
  if (urgent) cleanedText = cleanedText.replace(urgent, '');
  cleanedText = cleanedText.trim();

  const formattedMessage = formatTaskMessage(cleanedText, color, urgent);
  bot.sendMessage(ANNOY_ZANE_CHAT_ID, formattedMessage);

  return endCommand(bot, msg);
});