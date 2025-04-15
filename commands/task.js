const {
    detectPriority,
    endCommand,
    formatTaskMessage,
    sendTemporaryError,
    encodeInvisibleTag,
    extractInvisibleTag
  } = require('../utils');

const {
    createTask
} = require('../database/dbTask');
  
  const ANNOY_ZANE_CHAT_ID = -4701994359;
  const TEST_CHAT_ID = -4674536716;
  
  module.exports = async function handleTaskCommand(bot, msg, match) {
    const tag = `${Date.now()}${msg.from.id}`;
    const encodedTag = encodeInvisibleTag(tag);

   
    const msgChatId = msg.chat.id;
    
    const originalText = match[1].trim();
    const { color, urgent } = detectPriority(originalText);
  
    if (!color) {
      await sendTemporaryError(bot, msg, '❌ Please include a color emoji (🔴🟠🟢).');
      return;
    }
  
    let cleanedText = originalText.replace(color, '');
    if (urgent) cleanedText = cleanedText.replace(urgent, '');
    cleanedText = cleanedText.trim();
  
    const formatted = formatTaskMessage(cleanedText, color, urgent, Date.now());
    const taggedText = `${formatted} ${encodedTag}`;

    console.log(extractInvisibleTag(taggedText), "taggedText decoded");
  
    await bot.sendMessage(msgChatId, formatted, {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ complete', callback_data: 'mark_seen' }
        ]]
      }
    });

    try { // creates task in db
      await createTask({
        text: cleanedText,
        color,
        urgent: !!urgent,
        messageId: msg.message_id,
        taskId: `${tag}`,
      });
      console.log('✅ Task successfully created in the database');
    } catch (error) {
      console.error('❌ Failed to create task in the database:', error);
    }

    console.log(`📩 Sent task set`);
  
    return endCommand(bot, msg);
  };