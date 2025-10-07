const {
    detectPriority,
    endCommand,
    formatTaskMessage,
    sendTemporaryError,
    encodeInvisibleTag,
    extractInvisibleTag,
    checkTaskFormatting
  } = require('../utils');

  const { makeAsanaTask } = require('../asana/postTasks');
  
  const ANNOY_ZANE_CHAT_ID = -4701994359;
  const TEST_CHAT_ID = -4674536716;
  
  module.exports = async function handleTaskCommand(bot, msg, match) {
   
    const msgChatId = msg.chat.id;

    const textObj = {
      originalText: match[1].trim(),
      color: '',
      urgent: '',
      title: '',
      description: '',
    }

    const { color, urgent } = detectPriority(textObj.originalText);

    textObj.color = color;
    textObj.urgent = urgent;

    const {formattedTextObj , formattedCheck } = checkTaskFormatting(bot, msg, textObj); 

    if(!formattedCheck) {
      console.log('❌ Task formatting check failed.');
      return;
    } else {
      console.log('✅ Task formatting check passed.');
    }
  
    if (!color) {
      await sendTemporaryError(bot, msg, '❌ Please include a color emoji (🔴🟠🟢).');
      return;
    }
  
  

    const taskGID = await makeAsanaTask(formattedTextObj.title, formattedTextObj.description)

    if(!taskGID) {
      await sendTemporaryError(bot, msg, '❌ Failed to create task in Asana.');
      console.log('❌ Failed to create task in Asana.');
      return;
    }

    const formatted = formatTaskMessage(formattedTextObj, Date.now(), taskGID);
  
    await bot.sendMessage(msgChatId, formatted, {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ complete', callback_data: 'mark_seen' }
        ]]
      }
    });

    

    console.log(`📩 Sent task set`);
  
    return endCommand(bot, msg);
  };