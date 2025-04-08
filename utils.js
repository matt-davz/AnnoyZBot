const ora = require('ora');
const handleTaskCommand = require('./commands/task');

const colorEmojis = ['🔴', '🟠', '🟢'];
const urgentEmojis = ['‼️'];

function detectPriority(text) {
  const color = colorEmojis.find((emoji) => text.includes(emoji)) || null;
  const urgent = urgentEmojis.find((emoji) => text.includes(emoji)) || null;
  return { color, urgent };
}

function deleteMessageAfterDelay(bot, chatId, messageId, delay = 3000) {
  setTimeout(() => {
    bot.deleteMessage(chatId, messageId).catch((err) => {
      console.error('❌ Failed to delete message:', err.message);
    });
  }, delay);
}

function endCommand(bot, msg, delay = 3000) {
  deleteMessageAfterDelay(bot, msg.chat.id, msg.message_id, delay);
  return;
}

function formatTaskMessage(text, color, urgent) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `• ${color}${urgent ? ' ' + urgent : ''} ${text}\n${time}`;
}

// ✅ New utility: send a temporary error message + auto-delete it
async function sendTemporaryError(bot, msg, text, delay = 3000) {
  try {
    const sent = await bot.sendMessage(msg.chat.id, text);
    deleteMessageAfterDelay(bot, msg.chat.id, sent.message_id, delay);
    endCommand(bot, msg, delay);
  } catch (err) {
    console.error('❌ Failed to send temporary error message:', err.message);
  }
}

async function rapidfire(bot, chatId, messages, delay = 500) {
    const spinner = ora('Rapid fire in progress...').start();
    try {
        for (const message of messages) {
            handleTaskCommand(bot, message);
            await bot.sendMessage(chatId, message.text);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        spinner.succeed('Rapid fire completed successfully!');
    } catch (err) {
        spinner.fail('Rapid fire encountered an error.');
        console.error('❌ Failed to send message in rapidfire:', err.message);
    }
}

module.exports = {
  detectPriority,
  rapidfire,
  deleteMessageAfterDelay,
  endCommand,
  formatTaskMessage,
  sendTemporaryError,
};