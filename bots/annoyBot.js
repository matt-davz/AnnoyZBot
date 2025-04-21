const handleTaskCommand = require('../commands/task');

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

    console.log(`💀👻 ANNOY BOT HAS RISEN FROM THE ABYSS... BEWARE! 👻💀`);
  };