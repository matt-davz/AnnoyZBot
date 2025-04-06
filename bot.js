require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const {
  detectPriority,
  endCommand,
  formatTaskMessage,
} = require('./utils');
const {
  logStartup,
  notifyDevStartup,
} = require('./dev');




// Load bot token from .env
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in .env');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(botToken, { polling: true });

// ✅ Run dev startup logs
const DEV_CHAT_ID = process.env.DEV_CHAT_ID;
logStartup();
notifyDevStartup(bot, DEV_CHAT_ID);

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
  
});