// list-gids.js
require('dotenv').config();
const Asana = require('asana');

async function listAllGids() {
  // 1) Initialize client
  const client = Asana.ApiClient.instance;
  client.authentications['token'].accessToken = process.env.ASANA_API_KEY;

  const workspacesApi = new Asana.WorkspacesApi();
  const usersApi      = new Asana.UsersApi();
  const projectsApi   = new Asana.ProjectsApi();
  const sectionsApi   = new Asana.SectionsApi();

  // 2) Fetch all workspaces
  const wsRes = await workspacesApi.getWorkspaces();
  console.log('\n=== Workspaces ===');
  wsRes.data.forEach(ws => {
    console.log(`• ${ws.name} — ${ws.gid}`);
  });

  // 3) Choose your workspace
  const workspaceGid = process.env.LIFE_IS_A_BITCH_GID || wsRes.data[0].gid;
  console.log(`\nUsing workspace GID: ${workspaceGid}\n`);

  // 4) List all users in that workspace — pass the GID directly!
  const usersRes = await usersApi.getUsersForWorkspace(workspaceGid, {
    opt_fields: 'name,email'
  });
  console.log('=== Users in Workspace ===');
  usersRes.data.forEach(user => {
    console.log(`• ${user.name} — ${user.gid} (${user.email || 'no-email'})`);
  });

  // 5) List all projects and their sections
  const projRes = await projectsApi.getProjects({ workspace: workspaceGid });
  console.log('\n=== Projects & Sections ===');
  for (const project of projRes.data) {
    console.log(`• [Project] ${project.name} — ${project.gid}`);

    const secRes = await sectionsApi.getSectionsForProject(project.gid);
    secRes.data.forEach(section => {
      console.log(`    • [Section] ${section.name} — ${section.gid}`);
    });
  }
}

listAllGids().catch(err => {
  console.error('Error listing GIDs:', err.value?.errors || err);
  process.exit(1);
});