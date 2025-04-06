// utils.js

const colorEmojis = ['🔴', '🟠', '🟢'];
const urgentEmojis = ['‼️']; // Add more if needed

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

module.exports = {
  detectPriority,
  deleteMessageAfterDelay,
  endCommand,
  formatTaskMessage,
};