const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const width = 640;
const height = 90; // bumping this up for Telegram compatibility

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill solid red
ctx.fillStyle = '#FF0000';
ctx.fillRect(0, 0, width, height);

const outDir = path.join(__dirname, 'img');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const filePath = path.join(outDir, 'red.png');
fs.writeFileSync(filePath, canvas.toBuffer('image/png'));

console.log(`✅ red.png saved at ${filePath}`);