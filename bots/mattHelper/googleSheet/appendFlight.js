// bots/mattHelper/googleSheet/appendFlight.js
const { getSheetsClient } = require('./googleAuth');

const SHEET_ID = process.env.FLIGHT_SHEETS_ID;
const SHEET_RANGE = process.env.FLIGHT_SHEETS_RANGE || 'RAW!A:N';

/**
 * Append a flight row to the RAW sheet.
 *
 * parsed = {
 *   raw,
 *   flight,
 *   route,
 *   date,
 *   time,
 *   confirmation,
 *   ticketId,
 *   cabin,
 *   cabinText,
 *   payer,
 *   price
 * }
 */
async function appendFlightToSheet(parsed) {
  if (!SHEET_ID) {
    throw new Error('FLIGHT_SHEETS_ID env var is not set');
  }

  const sheets = await getSheetsClient();

  // Split route → HKT-BKK
  let [from, to] = parsed.route.split('-');

  // Force airport codes uppercase
  from = (from || "").trim().toUpperCase();
  to   = (to || "").trim().toUpperCase();

  // Extract airline code + flight number
  const airlineCodeMatch = parsed.flight.match(/^[A-Za-z]+/);
  const flightNumMatch = parsed.flight.match(/\d+$/);

  let airlineCode = airlineCodeMatch ? airlineCodeMatch[0].toUpperCase() : '';
  let flightNum = flightNumMatch ? flightNumMatch[0] : '';

  // APPLY UPPERCASE TO FLIGHT CODE
  const flightCode = parsed.flight.toUpperCase();

  // RAW sheet columns
  // A: Date
  // B: AirlineCode
  // C: FlightNumber
  // D: From
  // E: To
  // F: DepTime
  // G: Confirmation
  // H: TicketID
  // I: CabinCode
  // J: CabinText
  // K: Payer
  // L: Price
  // M: FlightradarLogged (checkbox)
  // N: MilesLogged (checkbox)

  const values = [[
    parsed.date,
    airlineCode,
    flightNum,
    from,
    to,
    parsed.time,
    parsed.confirmation || '',
    parsed.ticketId || '',
    (parsed.cabin || '').toUpperCase(),
    parsed.cabinText || '',
    parsed.payer || '',
    parsed.price != null ? parsed.price : '',
    false,  // FlightradarLogged checkbox
    false   // MilesLogged checkbox
  ]];

  // APPEND TO SHEET
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values }
  });

  return res.data;
}

module.exports = { appendFlightToSheet };