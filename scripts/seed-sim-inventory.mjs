// One-off importer for a Transatel SIM file into the `sim_inventory` table
// (created automatically by src/lib/staff/db.ts on next app boot — no
// separate migration step needed).
//
// Run with:
//   npm run seed:sims -- <path-to-csv> [esim|physical]
//
// Reads DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME from .env.local — point
// those at whichever database you want the SIMs available in (this only
// works if Hostinger's MySQL allows remote connections; see Databases >
// Management > Remote MySQL in Hostinger's dashboard if this script can't
// connect).
//
// Handles TWO semicolon-delimited formats, auto-detected by header:
//   1. Transatel's delivery file (new stock, e.g. the 1000-SIM production
//      file): TransatelId;Msisdn;Release;IccId;HLRStatus;Pin1;Puk1
//      — msisdn is always empty here (SIM never activated yet).
//   2. An export from the SIM management portal (auriga.transatel.com,
//      "Parc" section, e.g. the demo account's 17 test SIMs): includes
//      ICCID, MSISDN, and "Statut de provisioning" (Pre-activée / Résiliée)
//      columns among many others. Rows with a terminated-looking status
//      ("Résiliée"/"Terminated") are SKIPPED — they can't be assigned to
//      a customer.
//
// Safe to re-run: existing rows (matched by iccid) have their
// pin1/puk1/hlr_status refreshed but keep their assigned/available status,
// so re-importing the same file never un-assigns a SIM that's already
// been handed to a customer.
import fs from "node:fs";
import mysql from "mysql2/promise";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set (did you forget --env-file=.env.local?)`);
  }
  return value;
}

const csvPath = process.argv[2] ?? "scripts/source/sim-inventory.csv";
const simType = process.argv[3] ?? "physical";
if (!["esim", "physical"].includes(simType)) {
  throw new Error(`Invalid sim type "${simType}" — must be "esim" or "physical"`);
}
if (!fs.existsSync(csvPath)) {
  throw new Error(
    `CSV not found at ${csvPath}. Usage: npm run seed:sims -- <path-to-csv> [esim|physical]`
  );
}

const connection = await mysql.createConnection({
  host: requireEnv("DB_HOST"),
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  dateStrings: true,
});

// Mirrors the sim_inventory CREATE TABLE in src/lib/staff/db.ts, in case
// this script runs before the app has booted once against this database.
await connection.query(`CREATE TABLE IF NOT EXISTS sim_inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  iccid VARCHAR(32) NOT NULL UNIQUE,
  msisdn VARCHAR(32) NULL,
  sim_type ENUM('esim', 'physical') NOT NULL DEFAULT 'physical',
  pin1 VARCHAR(16) NULL,
  puk1 VARCHAR(16) NULL,
  transatel_hlr_status VARCHAR(32) NULL,
  status ENUM('available', 'assigned') NOT NULL DEFAULT 'available',
  assigned_order_id INT NULL,
  created_at DATETIME NOT NULL
)`);

function toMySQLDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// Case-insensitive header lookup so both known formats (and any casing
// Transatel happens to export with) resolve the same way.
function findCol(header, ...names) {
  const lower = header.map((h) => h.toLowerCase());
  for (const name of names) {
    const i = lower.indexOf(name.toLowerCase());
    if (i !== -1) return i;
  }
  return -1;
}

const TERMINATED_PATTERN = /r[ée]sili|terminat/i;

const lines = fs.readFileSync(csvPath, "utf-8").split(/\r?\n/).filter((line) => line.trim().length > 0);
const header = lines[0].split(";").map((h) => h.trim());
const idx = {
  msisdn: findCol(header, "Msisdn", "MSISDN"),
  iccid: findCol(header, "IccId", "ICCID"),
  status: findCol(header, "HLRStatus", "Statut de provisioning"),
  pin1: findCol(header, "Pin1"),
  puk1: findCol(header, "Puk1"),
};
if (idx.iccid === -1) {
  throw new Error(`Expected an ICCID column in ${csvPath}, got header: ${header.join(", ")}`);
}

let inserted = 0;
let updated = 0;
let skippedTerminated = 0;
const now = toMySQLDateTime(new Date());

for (const line of lines.slice(1)) {
  const cols = line.split(";").map((c) => c.trim());
  const iccid = cols[idx.iccid];
  if (!iccid) continue;

  const status = idx.status !== -1 ? cols[idx.status] || null : null;
  if (status && TERMINATED_PATTERN.test(status)) {
    skippedTerminated++;
    continue;
  }

  // Strip a leading "+" so stored values match the plain-digits format
  // Transatel's order APIs expect for bind.msisdn (e.g. "33612345678").
  const rawMsisdn = idx.msisdn !== -1 ? cols[idx.msisdn] || null : null;
  const msisdn = rawMsisdn ? rawMsisdn.replace(/^\+/, "") : null;
  const pin1 = idx.pin1 !== -1 ? cols[idx.pin1] || null : null;
  const puk1 = idx.puk1 !== -1 ? cols[idx.puk1] || null : null;

  const [result] = await connection.query(
    `INSERT INTO sim_inventory (iccid, msisdn, sim_type, pin1, puk1, transatel_hlr_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       msisdn = COALESCE(VALUES(msisdn), msisdn),
       pin1 = COALESCE(VALUES(pin1), pin1),
       puk1 = COALESCE(VALUES(puk1), puk1),
       transatel_hlr_status = VALUES(transatel_hlr_status)`,
    [iccid, msisdn, simType, pin1, puk1, status, now]
  );
  if (result.affectedRows === 1) inserted++;
  else updated++;
}

console.log(
  `Imported ${csvPath}: ${inserted} new SIMs, ${updated} existing SIMs refreshed, ${skippedTerminated} terminated SIMs skipped.`
);

const [[{ count: available }]] = await connection.query(
  "SELECT COUNT(*) AS count FROM sim_inventory WHERE status = 'available'"
);
console.log(`Total available SIMs in inventory now: ${available}`);

await connection.end();
