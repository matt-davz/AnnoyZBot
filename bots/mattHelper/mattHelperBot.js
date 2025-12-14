// bots/mattHelper/mattHelperBot.js


// NOTE: from bot.js you `require('./bots/mattHelper/mattHelperBot')`
// so relative to THIS file:
const flightCmd = require('./commands/flightCommand');

module.exports = async function mattHelperBot(
  bot,
  msgOrCallback,
  isCallback = false
) {
  const msg = msgOrCallback;
  const text = msg.text || '';

  if (text.startsWith('/flight')) {
    return flightCmd(bot, msg);
  }

  if (text.startsWith('/hotel')) {
    // TODO: implement later
    return bot.sendMessage(msg.chat.id, 'Hotel command coming soon 🏨');
  }

  if (text.startsWith('/sol')) {
    // TODO: implement later
    return bot.sendMessage(msg.chat.id, 'Sol command coming soon 🌞');
  }

  if (text.startsWith('/eth')) {
    // TODO: implement later
    return bot.sendMessage(msg.chat.id, 'ETH command coming soon ⛓️');
  }

  // Fallback if no command matched
  // (optional – you can remove this if you want silence)
  // await bot.sendMessage(msg.chat.id, 'Matt Helper here. Use /flight to log a flight.');
};