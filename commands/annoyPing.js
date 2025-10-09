const { rapidfire, endCommand, createBorderImage } = require('../utils');
const { sortTasks } = require('./commandUtils');
const { getAllTasks} = require('../asana/getAllTasks');
const { get } = require('mongoose');

module.exports = async function annoyPing(bot, msg) {
    const chatId = msg.chat.id;
    console.log(`📩 Received /ping command from chat ID: ${chatId}`);
  
    try {
      // First: send the red border
      await createBorderImage(bot, msg);
  
      // Then: send the ping message
      await bot.sendMessage(
        chatId,
        '============================\nPING 🔴🔔:\n============================'
      );
  
      // Then: send all the tasks
      const tasks = await getAllTasks();
      console.log(`Retrieved ${tasks.length} tasks from Asana. : `, tasks);

      await rapidfire(bot, chatId, tasks);
      await createBorderImage(bot, msg);
  
    } catch (error) {
      console.error('❌ Error in /ping:', error.message);
      bot.sendMessage(chatId, '❌ Something went wrong.');
    }
  
    endCommand(bot, msg);
}   

