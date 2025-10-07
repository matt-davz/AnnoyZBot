// complete-task.js
// Marks an Asana task as complete—no take backsies.

require('dotenv').config();
const Asana = require('asana');

// Initialize Asana client
const client = Asana.ApiClient.instance;
client.authentications['token'].accessToken = process.env.ASANA_API_KEY;

const tasksApi = new Asana.TasksApi();

/**
 * Marks the specified Asana task as completed.
 * @param {string} taskGid  – The GID of the task to complete.
 * @returns {Promise<object>} – The updated task data from Asana.
 */
async function completeTask(taskGid) {
  if (!taskGid || typeof taskGid !== 'string') {
    throw new Error('A valid task GID string is required');
  }

  // build your body first
  const updateBody = {
    data: { completed: true }
  };

  try {
    // ⚠️ swap the args: (body, gid)
    const response = await tasksApi.updateTask(updateBody, taskGid);

    console.log(`✔ Task ${taskGid} marked complete`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to complete task ${taskGid}:`, error.message);
    throw error;
  }
}

module.exports = {
  completeTask
};