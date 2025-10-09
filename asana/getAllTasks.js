require('dotenv').config();
const Asana = require('asana');

// Initialize Asana client
const client = Asana.ApiClient.instance;
const token = client.authentications['token'];
token.accessToken = process.env.ASANA_API_KEY;

const tasksApiInstance = new Asana.TasksApi();

/**
 * Fetches all tasks from the "annoy_z" section.
 * @returns {Promise<Array>} List of tasks in the section
 */
async function getAllTasks() {
    const sectionGids = [process.env.HIGH_GID, process.env.MEDIUM_GID, process.env.LOW_GID];
    const gidToLabel = {
      [process.env.HIGH_GID]: 'high',
      [process.env.MEDIUM_GID]: 'medium',
      [process.env.LOW_GID]: 'low',
    };
  
    const tasks = [];
    for (const sectionGid of sectionGids) {
      const section = gidToLabel[sectionGid] ?? 'unknown';
      try {
        console.log(`Fetching tasks from section: ${section} (${sectionGid})`);
        const opts = {
          section: sectionGid,
          opt_fields: "name,assignee.name,completed,created_at,modified_at,permalink_url,notes,memberships.section.gid"
        };
        const res = await tasksApiInstance.getTasks(opts);
        tasks.push(...(res?.data ?? []));
        // console.log(`✅ Retrieved ${(res?.data ?? []).length} tasks from ${section}`);
      } catch (error) {
        console.error(`❌ Error fetching tasks from ${section}:`, error.response?.body || error);
      }
    }
    console.log(`Total tasks fetched: ${tasks.length}`);
    return tasks;
  }

module.exports = { getAllTasks };