// bots/mattHelper/commands/flightCommand.js
const { appendFlightToSheet } = require('../googleSheet/appendFlight');
const airlines = require('airline-codes');

// ------------------------------
// Cabin Mapping
// ------------------------------
const cabinMap = {
  Y: 'ECON',
  W: 'PREMIUM ECON',
  J: 'BUSINESS',
  F: 'FIRST',
};

// ------------------------------
// Parse /flight Command
// Example:
// /flight PG278 HKT-BKK 2025-11-25 19:50 EB2EXP NA Y Zane 0
// ------------------------------
function parseFlightInput(text) {
  const parts = text.trim().split(' ');

  if (parts.length < 9) {
    throw new Error('Invalid flight command format.');
  }

  parts.shift(); // remove '/flight'

  let [
    flight,
    route,
    date,
    time,
    confirmation,
    ticketId,
    cabin,
    payer,
    price,
  ] = parts;

  // 🔥 Normalise at the command level
  flight = (flight || '').toUpperCase();       // PG278
  route = (route || '').toUpperCase();         // HKT-BKK
  cabin = (cabin || '').toUpperCase();         // Y / J / F / W

  const cabinText = cabinMap[cabin] || cabin;

  return {
    raw: text,
    flight,
    route,
    date,
    time,
    confirmation,
    ticketId,
    cabin,
    cabinText,
    payer,
    price,
  };
}

// ------------------------------
// Airline Lookup (Backbone Collection)
// ------------------------------
function getAirlineNameFromFlight(flight) {
  const prefixMatch = flight.match(/[A-Za-z]+/);
  const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : '';

  const match =
    airlines.findWhere({ iata: prefix }) ||
    airlines.findWhere({ fs: prefix }) ||
    null;

  return match ? match.get('name') : prefix;
}

// ------------------------------
// Format Message for Zane
// ------------------------------
function buildZaneMessage(parsed) {
  const { flight, route, date, time, cabinText, confirmation } = parsed;

  const airline = getAirlineNameFromFlight(flight);
  const [fromRaw, toRaw] = route.split('-');

  // Route already uppercased in parser, but just in case:
  const from = (fromRaw || '').toUpperCase();
  const to = (toRaw || '').toUpperCase();

  const dt = new Date(`${date}T${time}`);
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dayName = days[dt.getDay()];
  const dayNum = dt.getDate();
  const monthName = months[dt.getMonth()];

  let hours = dt.getHours();
  let minutes = dt.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeFormatted = `${hours}:${minutes} ${ampm}`;

  return `${from} → ${to} | ${cabinText} | ${airline}
Booking #: ${confirmation}
${dayName} ${dayNum} ${monthName}, ${timeFormatted}
${flight}`;
}

// ------------------------------
// MAIN EXPORT
// ------------------------------
module.exports = async function flightCommand(bot, msg) {
  try {
    const text = msg.text;
    const parsed = parseFlightInput(text);

    // Append to Google Sheets
    await appendFlightToSheet(parsed);

    // Build Zane-friendly message
    const zaneMessage = buildZaneMessage(parsed);

    // Confirm to you
    await bot.sendMessage(msg.chat.id, '✈️ Flight added to Google Sheets!');

    // Forward-ready message
    await bot.sendMessage(msg.chat.id, `${zaneMessage}`);
  } catch (err) {
    console.error('❌ Failed to append flight:', err);
    await bot.sendMessage(msg.chat.id, '❌ Error: ' + err.message);
  }
};