const handleTaskCommand = require('../commands/task');
const annoyPing = require('../commands/annoyPing');

module.exports = async function annoyBot(
    bot,
    msgOrCallback,
    isCallback = false
  ) {
   
    const msg = msgOrCallback;
    const text = msg.text

    if (text.startsWith('/task')) {
        const cleanedText = text.replace('/task', '').trim();
        await handleTaskCommand(bot, msg, [null, cleanedText]);
    }

    if (text.startsWith('/ping')) {
       annoyPing(bot, msg);
    }

    console.log(`ANNOY BOT ACTIVE`);
  };