// create-task.js
// Wrapper to create an Asana task and return its GID

require('dotenv').config();
const Asana = require('asana');

// Initialize Asana client
const client = Asana.ApiClient.instance;
client.authentications['token'].accessToken = process.env.ASANA_API_KEY;

const tasksApi = new Asana.TasksApi();

/**
 * Creates an Asana task in the specified workspace/project/section, assigns it, and returns its GID.
 * @param {string} title - The task title
 * @param {string} description - The task description/notes
 * @returns {Promise<string>} - The GID of the newly created task
 */
async function makeAsanaTask(title, description, priority) {
  if (!title || !description) {
    throw new Error('Both title and description are required');
  }

  let section = ''

  switch(priority) {
    case 'high':
      section = process.env.HIGH_GID;
      break;
    case 'medium':
      section = process.env.MEDIUM_GID;
      break;
    default:
      section = process.env.LOW_GID;
  }


  const payload = {
    data: {
      workspace: process.env.LIFE_IS_A_BITCH_GID,
      name:      title,
      notes:     description,
      assignee:  process.env.ZANE_GID,
      memberships: [
        {
          project: process.env.PROJECT_GID,
          section: section
        }
      ]
    }
  };

  console.log('Creating Asana task with payload:', JSON.stringify(payload, null, 2));

  const response = await tasksApi.createTask(payload);
  const taskGid  = response.data.gid;

  console.log(`✔ Created task with GID: ${taskGid}`);
  return taskGid;
}

module.exports = {
  makeAsanaTask
};
