const handleTaskCommand = require('../commands/task');
const annoyPing = require('../commands/annoyPing');

module.exports = async function annoyBot(
    bot,
    msgOrCallback,
    isCallback = false
  ) {
   
    const msg = msgOrCallback;
    const text = msg.text

    if (text.startsWith('/high')){
      const cleanedText = text.replace('/high', '').trim();
      await handleTaskCommand(bot, msg, [null, cleanedText, 'high']);
    }

    if (text.startsWith('/med')){
      const cleanedText = text.replace('/high', '').trim();
      await handleTaskCommand(bot, msg, [null, cleanedText, 'medium']);
    }

    if (text.startsWith('/low')){
      const cleanedText = text.replace('/high', '').trim();
      await handleTaskCommand(bot, msg, [null, cleanedText, 'low']);
    }

    if (text.startsWith('/ping')) {
       annoyPing(bot, msg);
    }

    console.log(`ANNOY BOT ACTIVE`);
  };