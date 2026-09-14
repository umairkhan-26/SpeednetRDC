// One-off dev seeder for the staff/admin portal DB. Run with: node scripts/seed-staff.mjs
// Duplicates the same scrypt hash format as src/lib/staff/password.ts (salt:hash, both hex)
// since this plain .mjs script runs outside the TS path aliases the app uses.
import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "staff.db");
mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH, { timeout: 5000 });
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA busy_timeout = 5000");
db.exec(`
  CREATE TABLE IF NOT EXISTS staff_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('staff', 'admin')),
    profile_photo TEXT
  );
  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL REFERENCES staff_members(id),
    login_time TEXT NOT NULL,
    logout_time TEXT,
    is_currently_active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES staff_members(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
    due_date TEXT,
    created_by INTEGER REFERENCES staff_members(id)
  );
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_name TEXT NOT NULL,
    country_name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    amount_eur REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'failed')),
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL REFERENCES staff_members(id),
    recipient_id INTEGER REFERENCES staff_members(id),
    message TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    is_team_broadcast INTEGER NOT NULL DEFAULT 0
  );
`);

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function upsertStaff(name, email, password, role) {
  const existing = db.prepare("SELECT id FROM staff_members WHERE email = ?").get(email);
  if (existing) {
    console.log(`Skipping ${email} (already exists, id ${existing.id})`);
    return existing.id;
  }
  const result = db
    .prepare("INSERT INTO staff_members (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(name, email, hashPassword(password), role);
  console.log(`Created ${role} ${email} (id ${result.lastInsertRowid})`);
  return Number(result.lastInsertRowid);
}

const adminId = upsertStaff("Amara Okafor", "admin@speednetrdc.com", "ChangeMe123!", "admin");
const staffId = upsertStaff("Jules Mbeki", "staff@speednetrdc.com", "ChangeMe123!", "staff");

const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
if (taskCount === 0) {
  const insertTask = db.prepare(
    "INSERT INTO tasks (title, description, assigned_to, status, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertTask.run(
    "Restock eSIM QR code printouts",
    "Front desk is low on printed activation cards.",
    staffId,
    "pending",
    "2026-09-15",
    adminId
  );
  insertTask.run(
    "Follow up on refund request #4821",
    "Customer emailed about a failed activation.",
    staffId,
    "in_progress",
    "2026-09-14",
    adminId
  );
  insertTask.run(
    "Review weekly sales report",
    "Check plan mix vs. last week.",
    adminId,
    "pending",
    "2026-09-16",
    adminId
  );
  console.log("Seeded 3 demo tasks.");
} else {
  console.log(`Skipping task seed (${taskCount} tasks already exist).`);
}

const complaintCount = db.prepare("SELECT COUNT(*) AS count FROM complaints").get().count;
if (complaintCount === 0) {
  const insertComplaint = db.prepare(
    "INSERT INTO complaints (customer_name, subject, status, created_at) VALUES (?, ?, ?, ?)"
  );
  const complaints = [
    ["Grace Adebayo", "eSIM did not activate after arrival in Nairobi", "open"],
    ["Tom Reyes", "Charged twice for the same 5GB plan", "open"],
    ["Lina Haddad", "QR code email never arrived", "resolved"],
    ["Peter Novak", "Data ran out faster than advertised", "resolved"],
    ["Fatima Zahra", "Requesting refund, wrong country plan purchased", "open"],
  ];
  const now = Date.now();
  complaints.forEach(([customerName, subject, status], i) => {
    const createdAt = new Date(now - i * 36 * 60 * 60 * 1000).toISOString();
    insertComplaint.run(customerName, subject, status, createdAt);
  });
  console.log(`Seeded ${complaints.length} demo complaints.`);
} else {
  console.log(`Skipping complaint seed (${complaintCount} complaints already exist).`);
}

const orderCount = db.prepare("SELECT COUNT(*) AS count FROM orders").get().count;
if (orderCount === 0) {
  const insertOrder = db.prepare(
    "INSERT INTO orders (plan_name, country_name, country_code, customer_name, customer_email, amount_eur, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const destinations = [
    ["France", "FR"],
    ["United States", "US"],
    ["United Kingdom", "GB"],
    ["Morocco", "MA"],
    ["Nigeria", "NG"],
    ["United Arab Emirates", "AE"],
    ["Democratic Republic of the Congo", "CD"],
    ["South Africa", "ZA"],
    ["Turkey", "TR"],
    ["Spain", "ES"],
  ];
  const plans = ["1GB / 7 Days", "3GB / 15 Days", "5GB / 30 Days", "10GB / 30 Days", "Unlimited / 7 Days"];
  const firstNames = ["Aisha", "Marco", "Lucie", "Kwame", "Sofia", "Hana", "David", "Chidi", "Elena", "Youssef"];
  const lastNames = ["Diallo", "Rossi", "Martin", "Boateng", "Garcia", "Suleiman", "Kim", "Okoye", "Popescu", "Amrani"];

  let seeded = 0;
  const now = Date.now();
  for (let i = 0; i < 60; i++) {
    const [countryName, countryCode] = destinations[i % destinations.length];
    const plan = plans[i % plans.length];
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 3) % lastNames.length];
    const amount = [4.99, 9.99, 14.99, 19.99, 29.99][i % 5];
    const status = i % 17 === 0 ? "refunded" : i % 23 === 0 ? "failed" : "completed";
    const daysAgo = Math.floor(i / 5);
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (i % 5) * 3 * 60 * 60 * 1000).toISOString();
    insertOrder.run(
      plan,
      countryName,
      countryCode,
      `${first} ${last}`,
      `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      amount,
      status,
      createdAt
    );
    seeded++;
  }
  console.log(`Seeded ${seeded} demo orders (pending real checkout persistence — see scripts/README.md).`);
} else {
  console.log(`Skipping order seed (${orderCount} orders already exist).`);
}

const messageCount = db.prepare("SELECT COUNT(*) AS count FROM messages").get().count;
if (messageCount === 0) {
  const insertMessage = db.prepare(
    "INSERT INTO messages (sender_id, recipient_id, message, sent_at, is_team_broadcast) VALUES (?, ?, ?, ?, ?)"
  );
  const now = Date.now();
  insertMessage.run(
    adminId,
    staffId,
    "Hi Jules, can you double check the refund on order #4821 today?",
    new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    0
  );
  insertMessage.run(
    staffId,
    adminId,
    "On it, will update the ticket by end of day.",
    new Date(now - 2.5 * 60 * 60 * 1000).toISOString(),
    0
  );
  insertMessage.run(
    adminId,
    null,
    "Welcome to the new staff portal! Clock in/out and check My Tasks daily.",
    new Date(now - 20 * 60 * 60 * 1000).toISOString(),
    1
  );
  console.log("Seeded 3 demo messages (2 direct, 1 team broadcast).");
} else {
  console.log(`Skipping message seed (${messageCount} messages already exist).`);
}

console.log("\nLogin at /staff/login with:");
console.log("  admin@speednetrdc.com / ChangeMe123! (admin -> redirects to /admin)");
console.log("  staff@speednetrdc.com / ChangeMe123! (staff -> redirects to /staff)");
