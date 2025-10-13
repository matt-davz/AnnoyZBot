const ora = require('ora');
const path = require('path');
const colorEmojis = ['🔴', '🟠', '🟢'];
const urgentEmojis = ['‼️'];

function checkTaskFormatting(bot, msg, textObj) {
  // checking if text has proper task title. Task title should be wrapped in '#'
  const textArray = textObj.originalText.split('');
  let hashTagCount = 0;
  let firstHashIndex, secondHashIndex;
  let firstBracketIndex, lastBracketIndex;

  textArray.forEach((char, i) => {
    if (hashTagCount < 2 && char === '#') {
      hashTagCount += 1;
      if (hashTagCount === 1) firstHashIndex = i;
      else if (hashTagCount === 2) secondHashIndex = i;
    }

    if (char === '[' && firstBracketIndex === undefined) {
      firstBracketIndex = i;
    } else if (char === ']') {
      lastBracketIndex = i;
    }
  });

  const title =
    firstHashIndex !== undefined && secondHashIndex !== undefined
      ? textArray.slice(firstHashIndex + 1, secondHashIndex).join('').trim()
      : '';

  // ✅ Explicitly safe: description will always be a string
  const description =
    firstBracketIndex !== undefined && lastBracketIndex !== undefined
      ? textArray.slice(firstBracketIndex + 1, lastBracketIndex).join('').trim()
      : '';

  const formattedTextObj = {
    ...textObj,
    title,
    description, // always a string, empty if no brackets
  };

  console.log('text obj', formattedTextObj);

  if (hashTagCount < 2) {
    sendTemporaryError(
      bot,
      msg,
      '❌ Please wrap your task title in #. Example: #task title#'
    );
    return { formattedTextObj, formattedCheck: false };
  }

  return { formattedTextObj, formattedCheck: true };
}

function getTaskGIDFromText(text) {
  const match = text.match(/\[GID:\s*(\d+)\]/);
  return match ? match[1] : null;
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

function formatTaskMessage(textObj, timeStamp, taskGid, priority) {
  const urgentEmoji = '‼️';
  const recentEmoji = '🆕';
  const isRecent =
    timeStamp &&
    Date.now() - new Date(timeStamp).getTime() <= 48 * 60 * 60 * 1000;
  let color = colorEmojis[2]; // default green
  
  switch (priority) {
    case 'high':
      color = colorEmojis[0]; // red
      break;
    case 'medium':
      color = colorEmojis[1]; // orange
      break;
    default:
      color = colorEmojis[2]; // green
  }

  
  return `• ${isRecent ? ' ' + recentEmoji : ''} ${textObj.urgent ? urgentEmoji + ' ' : ''}${color} ${textObj.title}\n\n\t${textObj.description}\n\n[GID: ${taskGid}]`;
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

  try {
    for (const message of messages) {
      if(message.completed === true) continue

      const sectionGid = message.memberships[0].section.gid
      
      const priority = sectionGid === process.env.HIGH_GID ? 'high' : sectionGid === process.env.MEDIUM_GID ? 'medium' : 'low';
      const body = message.notes
      const formatted = formatTaskMessage(
        {
          title: message.name,
          description: body || '',
          urgent: body.includes('‼️') ? '‼️' : '',
        },
        message.created_at,
        message.gid,
        priority
      );
      await bot.sendMessage(chatId, formatted.trim(), {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ complete', callback_data: 'mark_seen' }],
          ],
        },
      });
      // await new Promise((resolve) => setTimeout(resolve, delay)); // optional delay
    }

    console.log('Rapidfire success')
  } catch (err) {
    console.error('❌ Failed to send message in rapidfire:', err.message);
  }
}

// Invisible tag encoder/decoder
const invisibleBinaryMap = { 0: '\u200B', 1: '\u200C' };
const reverseInvisibleBinaryMap = { '\u200B': '0', '\u200C': '1' };

function encodeInvisibleTag(tag) {
  return tag
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .flatMap((bits) => bits.split('').map((bit) => invisibleBinaryMap[bit]))
    .join('');
}

function decodeInvisibleTag(invisible) {
  const bits = [...invisible]
    .map((char) => reverseInvisibleBinaryMap[char] || '')
    .join('');
  const bytes = bits.match(/.{8}/g) || [];
  return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join('');
}

function extractInvisibleTag(message) {
  const invisiblePart = message.replace(/[^\u200B\u200C]/g, '');
  return decodeInvisibleTag(invisiblePart);
}

async function createBorderImage(bot, msg, color = 'red') {
    const chatId = msg.chat.id;
    const redPath = path.join(__dirname, 'img', 'red.png');
    const orangePath = path.join(__dirname, 'img', 'orange.png');

    if(color === 'red') {
        await bot.sendPhoto(chatId, redPath);
        return;
    }

    if(color === 'orange') {
        await bot.sendPhoto(chatId, orangePath);
        return;
    }
}

module.exports = {
  rapidfire,
  deleteMessageAfterDelay,
  endCommand,
  formatTaskMessage,
  sendTemporaryError,
  encodeInvisibleTag,
  decodeInvisibleTag,
  extractInvisibleTag,
    createBorderImage,
    checkTaskFormatting,
    getTaskGIDFromText
};
