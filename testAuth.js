// testSheets.js
require('dotenv').config();
const { getSheetsClient } = require('./bots/mattHelper/googleSheet/googleAuth');

(async () => {
  try {
    const sheets = await getSheetsClient();
    console.log('Sheets client OK ✓');
    
  } catch (err) {
    console.error('❌ ERROR:', err);
    
  }
})();