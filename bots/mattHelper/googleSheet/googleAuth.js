// bots/mattHelper/googleSheet/googleAuth.js
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
let cachedClient = null;

/**
 * Loads Google Sheets authenticated client using GOOGLE_CREDS
 * which MUST be a single-line JSON service-account in .env:
 *
 * GOOGLE_CREDS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"..."}
 */
async function getSheetsClient() {
  if (cachedClient) return cachedClient;

  let raw = process.env.GOOGLE_CREDS;
  if (!raw) {
    throw new Error('❌ GOOGLE_CREDS environment variable is missing.');
  }

  raw = raw.trim();

  // If user accidentally pasted "GOOGLE_CREDS={...}" inside the value, strip it.
  if (raw.startsWith('GOOGLE_CREDS=')) {
    raw = raw.slice('GOOGLE_CREDS='.length).trim();
  }

  // Strip surrounding quotes if present
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1);
  }

  let creds;
  try {
    creds = JSON.parse(raw);
  } catch (err) {
    console.error('❌ Failed to parse GOOGLE_CREDS JSON:', err.message);
    console.error('Raw begins with:', raw.slice(0, 80));
    throw err;
  }

  // Debug so we know what we actually have
  
  if (!creds.private_key || !creds.client_email) {
    throw new Error('❌ GOOGLE_CREDS JSON missing private_key or client_email.');
  }

  // Normalize newlines in private key
  if (typeof creds.private_key === 'string') {
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  }

  // Use GoogleAuth wrapper instead of raw JWT
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();

  cachedClient = google.sheets({
    version: 'v4',
    auth: authClient,
  });

  return cachedClient;
}

module.exports = { getSheetsClient };