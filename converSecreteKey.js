// convertSecretsToEnv.js
//
// This script loads your secrets.js file and converts the GOOGLE_CREDS
// object into a single-line JSON string safe for .env usage.

const path = require('path');
const fs = require('fs');

console.log("🔍 Loading secrets.js...");

let secrets;
try {
  const secretsPath = path.resolve(__dirname, './secrets.json');
  secrets = require(secretsPath);
} catch (err) {
  console.error("❌ Could not load secrets.js:", err.message);
  process.exit(1);
}



const creds = secrets

// Fix newline formatting for JSON-in-env
if (creds.private_key) {
  creds.private_key = creds.private_key.replace(/\n/g, "\\n");
}

// Convert to single-line JSON
const oneLine = JSON.stringify(creds);

// Final output
console.log("\n✅ Your GOOGLE_CREDS line for .env:");
console.log("-----------------------------------------------------------------");
console.log(`GOOGLE_CREDS=${oneLine}`);
console.log("-----------------------------------------------------------------");
console.log("\n👉 Copy/paste this directly into your .env file.\n");