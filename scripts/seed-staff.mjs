// One-off dev seeder for the staff/admin portal MySQL database.
// Run with: npm run seed:staff (loads DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME from .env.local)
//
// Duplicates the same scrypt hash format as src/lib/staff/password.ts (salt:hash, both hex)
// and the same schema/date-format conventions as src/lib/staff/db.ts, since this plain .mjs
// script runs outside the TS path aliases the app uses.
import mysql from "mysql2/promise";
import { randomBytes, scryptSync } from "node:crypto";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set (did you forget --env-file=.env.local?)`);
  }
  return value;
}

const connection = await mysql.createConnection({
  host: requireEnv("DB_HOST"),
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  dateStrings: true,
});

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS staff_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('staff', 'admin') NOT NULL,
    profile_photo VARCHAR(512)
  )`,
  `CREATE TABLE IF NOT EXISTS shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    login_time DATETIME NOT NULL,
    logout_time DATETIME,
    is_currently_active TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (staff_id) REFERENCES staff_members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INT,
    status ENUM('pending', 'in_progress', 'done') NOT NULL DEFAULT 'pending',
    due_date VARCHAR(32),
    created_by INT,
    FOREIGN KEY (assigned_to) REFERENCES staff_members(id),
    FOREIGN KEY (created_by) REFERENCES staff_members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(255) NOT NULL,
    subject VARCHAR(512) NOT NULL,
    status ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_name VARCHAR(255) NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(8) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    amount_eur DECIMAL(10,2) NOT NULL,
    status ENUM('completed', 'refunded', 'failed') NOT NULL DEFAULT 'completed',
    created_at DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_id INT,
    message TEXT NOT NULL,
    sent_at DATETIME NOT NULL,
    is_team_broadcast TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (sender_id) REFERENCES staff_members(id),
    FOREIGN KEY (recipient_id) REFERENCES staff_members(id)
  )`,
];

for (const statement of SCHEMA_STATEMENTS) {
  await connection.query(statement);
}

function toMySQLDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function upsertStaff(name, email, password, role) {
  const [existingRows] = await connection.query("SELECT id FROM staff_members WHERE email = ?", [email]);
  if (existingRows[0]) {
    console.log(`Skipping ${email} (already exists, id ${existingRows[0].id})`);
    return existingRows[0].id;
  }
  const [result] = await connection.query(
    "INSERT INTO staff_members (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, hashPassword(password), role]
  );
  console.log(`Created ${role} ${email} (id ${result.insertId})`);
  return result.insertId;
}

const adminId = await upsertStaff("Amara Okafor", "admin@speednetrdc.com", "ChangeMe123!", "admin");
const staffId = await upsertStaff("Jules Mbeki", "staff@speednetrdc.com", "ChangeMe123!", "staff");

const [[{ count: taskCount }]] = await connection.query("SELECT COUNT(*) AS count FROM tasks");
if (taskCount === 0) {
  const insertTask = async (title, description, assignedTo, status, dueDate, createdBy) =>
    connection.query(
      "INSERT INTO tasks (title, description, assigned_to, status, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, assignedTo, status, dueDate, createdBy]
    );
  await insertTask(
    "Restock eSIM QR code printouts",
    "Front desk is low on printed activation cards.",
    staffId,
    "pending",
    "2026-09-15",
    adminId
  );
  await insertTask(
    "Follow up on refund request #4821",
    "Customer emailed about a failed activation.",
    staffId,
    "in_progress",
    "2026-09-14",
    adminId
  );
  await insertTask(
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

const [[{ count: complaintCount }]] = await connection.query("SELECT COUNT(*) AS count FROM complaints");
if (complaintCount === 0) {
  const complaints = [
    ["Grace Adebayo", "eSIM did not activate after arrival in Nairobi", "open"],
    ["Tom Reyes", "Charged twice for the same 5GB plan", "open"],
    ["Lina Haddad", "QR code email never arrived", "resolved"],
    ["Peter Novak", "Data ran out faster than advertised", "resolved"],
    ["Fatima Zahra", "Requesting refund, wrong country plan purchased", "open"],
  ];
  const now = Date.now();
  for (const [i, [customerName, subject, status]] of complaints.entries()) {
    const createdAt = toMySQLDateTime(new Date(now - i * 36 * 60 * 60 * 1000));
    await connection.query(
      "INSERT INTO complaints (customer_name, subject, status, created_at) VALUES (?, ?, ?, ?)",
      [customerName, subject, status, createdAt]
    );
  }
  console.log(`Seeded ${complaints.length} demo complaints.`);
} else {
  console.log(`Skipping complaint seed (${complaintCount} complaints already exist).`);
}

const [[{ count: orderCount }]] = await connection.query("SELECT COUNT(*) AS count FROM orders");
if (orderCount === 0) {
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
    const createdAt = toMySQLDateTime(
      new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (i % 5) * 3 * 60 * 60 * 1000)
    );
    await connection.query(
      "INSERT INTO orders (plan_name, country_name, country_code, customer_name, customer_email, amount_eur, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        plan,
        countryName,
        countryCode,
        `${first} ${last}`,
        `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        amount,
        status,
        createdAt,
      ]
    );
    seeded++;
  }
  console.log(`Seeded ${seeded} demo orders (pending real checkout persistence — see scripts/README.md).`);
} else {
  console.log(`Skipping order seed (${orderCount} orders already exist).`);
}

const [[{ count: messageCount }]] = await connection.query("SELECT COUNT(*) AS count FROM messages");
if (messageCount === 0) {
  const now = Date.now();
  await connection.query(
    "INSERT INTO messages (sender_id, recipient_id, message, sent_at, is_team_broadcast) VALUES (?, ?, ?, ?, ?)",
    [adminId, staffId, "Hi Jules, can you double check the refund on order #4821 today?", toMySQLDateTime(new Date(now - 3 * 60 * 60 * 1000)), 0]
  );
  await connection.query(
    "INSERT INTO messages (sender_id, recipient_id, message, sent_at, is_team_broadcast) VALUES (?, ?, ?, ?, ?)",
    [staffId, adminId, "On it, will update the ticket by end of day.", toMySQLDateTime(new Date(now - 2.5 * 60 * 60 * 1000)), 0]
  );
  await connection.query(
    "INSERT INTO messages (sender_id, recipient_id, message, sent_at, is_team_broadcast) VALUES (?, ?, ?, ?, ?)",
    [adminId, null, "Welcome to the new staff portal! Clock in/out and check My Tasks daily.", toMySQLDateTime(new Date(now - 20 * 60 * 60 * 1000)), 1]
  );
  console.log("Seeded 3 demo messages (2 direct, 1 team broadcast).");
} else {
  console.log(`Skipping message seed (${messageCount} messages already exist).`);
}

console.log("\nLogin at /staff/login with:");
console.log("  admin@speednetrdc.com / ChangeMe123! (admin -> redirects to /admin)");
console.log("  staff@speednetrdc.com / ChangeMe123! (staff -> redirects to /staff)");

await connection.end();
