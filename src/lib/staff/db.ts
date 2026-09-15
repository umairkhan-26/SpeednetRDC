import mysql from "mysql2/promise";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: requireEnv("DB_HOST"),
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
}

declare global {
  var __staffPool__: mysql.Pool | undefined;
  var __staffSchemaReady__: Promise<void> | undefined;
}

// Created lazily (on first getPool() call, i.e. the first real request),
// never at module import time — Next.js imports this module graph while
// collecting build-time page data even for routes that never execute
// during the build, and eagerly requiring DB_HOST etc. there would fail
// the build in any environment without those vars set (e.g. local dev).
function getOrCreatePool(): mysql.Pool {
  if (!globalThis.__staffPool__) {
    globalThis.__staffPool__ = createPool();
  }
  return globalThis.__staffPool__;
}

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

async function ensureSchema(pool: mysql.Pool): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await pool.query(statement);
  }
}

export async function getPool(): Promise<mysql.Pool> {
  const pool = getOrCreatePool();
  if (!globalThis.__staffSchemaReady__) {
    globalThis.__staffSchemaReady__ = ensureSchema(pool);
  }
  await globalThis.__staffSchemaReady__;
  return pool;
}

// DATETIME columns are stored and read as plain UTC wall-clock strings
// (dateStrings: true above) so round-tripping never depends on the
// server's or driver's local timezone interpretation.
export function toMySQLDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function fromMySQLDateTime(value: string): string;
export function fromMySQLDateTime(value: string | null): string | null;
export function fromMySQLDateTime(value: string | null): string | null {
  if (!value) return null;
  return `${value.replace(" ", "T")}.000Z`;
}
