const ora = require('ora');

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
  const urgentEmoji = '‼️';
  return `• ${urgent ? urgentEmoji + ' ' : ''}${color} ${text}`;
}

// Send a temporary error message + auto-delete it
async function sendTemporaryError(bot, msg, text, delay = 3000) {
  try {
    const sent = await bot.sendMessage(msg.chat.id, text);
    deleteMessageAfterDelay(bot, msg.chat.id, sent.message_id, delay);
    endCommand(bot, msg, delay);
  } catch (err) {
    console.error('❌ Failed to send temporary error message:', err.message);
  }
}

// Rapidfire resend of unseen messages
async function rapidfire(bot, chatId, messages, delay = 500) {
  const spinner = ora('Rapid fire in progress...').start();
  try {
    for (const message of messages) {
      if (message.seen) continue;
      const body = message.text;
      const formatted = formatTaskMessage(body, message.color, message.urgent);
      await bot.sendMessage(chatId, formatted.trim(), {
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ complete', callback_data: 'mark_seen' }
          ]]
        }
      });
      spinner.text = `Sending: ${formatted.trim()}`;
      spinner.render();
      // await new Promise((resolve) => setTimeout(resolve, delay)); // optional delay
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