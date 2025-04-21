const { createBorderImage, rapidfire } = require('../utils');
const { getUpdatesByDate } = require('../database/dbUpdate');
const { sortUpdates, updateRapidFire } = require('../commands/updateUtils');

module.exports = async function updatePing(bot, msg) {
  const fullText = msg.text.replace('/ping', '').trim();
  await createBorderImage(bot, msg, 'orange');
  await bot.sendMessage(
    msg.chat.id,
    '============================\nUPDATES 🟠🔔:\n============================'
  );

  const updates = await getUpdatesByDate(fullText);
  const sortedUpdates = sortUpdates(updates);
  await updateRapidFire(bot, msg.chat.id, sortedUpdates);

  await createBorderImage(bot, msg, 'orange');
};
