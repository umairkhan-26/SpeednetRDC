import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "staff.db");

function createDatabase(): DatabaseSync {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const database = new DatabaseSync(DB_PATH, { timeout: 5000 });

  // WAL mode lets Next.js's parallel build workers (each opening their own
  // connection to this file) read/write concurrently instead of locking out.
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA busy_timeout = 5000");

  database.exec(`
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

  return database;
}

declare global {
  var __staffDb__: DatabaseSync | undefined;
}

export const staffDb = globalThis.__staffDb__ ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalThis.__staffDb__ = staffDb;
}
