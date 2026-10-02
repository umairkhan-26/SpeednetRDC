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
  // Widens the pre-existing orders.status enum so a real checkout can
  // insert a row the instant a Stripe Checkout Session is created (before
  // payment is known to succeed), rather than defaulting to 'completed'
  // before any money has actually moved. Re-running MODIFY COLUMN with an
  // identical definition is a no-op, so this is safe on every boot.
  `ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'completed', 'refunded', 'failed') NOT NULL DEFAULT 'pending'`,
  // Real SIM stock delivered by Transatel (see scripts/import-esims.mjs,
  // scripts/seed-sim-inventory.mjs and scripts/README.md). One row per
  // physical SIM or eSIM; `status` tracks whether it's been handed to a
  // customer, separately from Transatel's own status. Only sim_type 'esim'
  // rows are ever reserved for eSIM orders. msisdn is stored digits-only
  // (Transatel's order and inventory APIs reject a leading "+"); if it's
  // missing, provisioning looks it up via SIM Search. is_activated is
  // informational only: Service Provider Connect SIMs arrive pre-activated
  // and nothing branches on it.
  `CREATE TABLE IF NOT EXISTS sim_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    iccid VARCHAR(32) NOT NULL UNIQUE,
    msisdn VARCHAR(32) NULL,
    sim_type ENUM('esim', 'physical') NOT NULL DEFAULT 'physical',
    pin1 VARCHAR(16) NULL,
    puk1 VARCHAR(16) NULL,
    transatel_hlr_status VARCHAR(32) NULL,
    is_activated TINYINT(1) NOT NULL DEFAULT 0,
    status ENUM('available', 'assigned', 'retired') NOT NULL DEFAULT 'available',
    assigned_order_id INT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (assigned_order_id) REFERENCES orders(id)
  )`,
  // Widens sim_inventory.status to add 'retired' — a non-destructive way to
  // permanently exclude a row from reserveEsimForOrder's
  // WHERE status = 'available' pick (see src/lib/transatel/inventory.ts)
  // without deleting the row or losing its assigned_order_id history (e.g.
  // the 10 demo/test SIMs that were wrongly assignable to real orders
  // before production stock existed — see orders 11 and 12). Re-running
  // MODIFY COLUMN with an identical definition is a no-op, so this is safe
  // on every boot, same as the orders.status widening above.
  `ALTER TABLE sim_inventory MODIFY COLUMN status ENUM('available', 'assigned', 'retired') NOT NULL DEFAULT 'available'`,
  // Every event Transatel's Data Stream webhook delivers (see
  // src/app/api/transatel/events/route.ts), keyed by Transatel's eventId so
  // a redelivered event is stored once. Informational only — no order
  // depends on an event arriving.
  `CREATE TABLE IF NOT EXISTS transatel_events (
    event_id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    msisdn VARCHAR(32) NULL,
    iccid VARCHAR(32) NULL,
    event_date DATETIME NULL,
    payload TEXT NOT NULL,
    received_at DATETIME NOT NULL
  )`,
];

// sim_inventory columns added after the table already existed in
// production — same idempotent, information_schema-checked pattern as
// ORDERS_NEW_COLUMNS below (plain ADD COLUMN isn't safely re-runnable on
// MySQL versions before 8.0.29, and Hostinger's exact version isn't
// guaranteed).
const SIM_INVENTORY_NEW_COLUMNS: { name: string; ddl: string }[] = [
  { name: "is_activated", ddl: "TINYINT(1) NOT NULL DEFAULT 0" },
];

async function ensureSimInventoryColumns(pool: mysql.Pool): Promise<void> {
  const [rows] = await pool.query<(mysql.RowDataPacket & { COLUMN_NAME: string })[]>(
    `SELECT COLUMN_NAME FROM information_schema.columns
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sim_inventory'`
  );
  const existing = new Set(rows.map((r) => r.COLUMN_NAME));
  for (const column of SIM_INVENTORY_NEW_COLUMNS) {
    if (!existing.has(column.name)) {
      await pool.query(`ALTER TABLE sim_inventory ADD COLUMN ${column.name} ${column.ddl}`);
    }
  }
}

// orders columns added for real Stripe checkout. Plain ADD COLUMN isn't
// idempotent on MySQL versions before 8.0.29 (no IF NOT EXISTS support),
// and the Hostinger MySQL version isn't guaranteed, so existence is checked
// via information_schema first instead of relying on that syntax.
const ORDERS_NEW_COLUMNS: { name: string; ddl: string }[] = [
  { name: "plan_id", ddl: "VARCHAR(255) NULL" },
  { name: "stripe_checkout_session_id", ddl: "VARCHAR(255) NULL" },
  { name: "stripe_payment_intent_id", ddl: "VARCHAR(255) NULL" },
  { name: "iccid", ddl: "VARCHAR(255) NULL" },
  { name: "lpa_activation_code", ddl: "VARCHAR(255) NULL" },
  { name: "msisdn", ddl: "VARCHAR(32) NULL" },
  // Transatel's reference for the product order placed on the order's
  // SIM. Once set, provisioning never places a second order for it.
  { name: "transatel_order_id", ddl: "VARCHAR(64) NULL" },
  // Tracks Transatel-side provisioning independently of `status` (which
  // is payment status only): 'pending' until claimed, 'activating' while a
  // provisioning attempt runs, then 'provisioned' or 'failed'. See
  // src/lib/transatel/provisioning.ts.
  { name: "provisioning_status", ddl: "ENUM('pending', 'activating', 'provisioned', 'failed') NOT NULL DEFAULT 'pending'" },
  // Unused since Transatel SPC SIMs arrive pre-activated (we never call the
  // activation API); kept so existing rows aren't altered.
  { name: "transatel_activation_transaction_id", ddl: "VARCHAR(64) NULL" },
  // Set inside completeProvisioning() the moment a paid order's plan is
  // confirmed live on the SIM — distinct from created_at (order/checkout
  // time). Nothing previously recorded when provisioning actually finished.
  { name: "provisioned_at", ddl: "DATETIME NULL" },
  // When the current provisioning attempt claimed the order, so an attempt
  // that died mid-way ('activating' for too long) can be retried by an
  // admin.
  { name: "provisioning_started_at", ddl: "DATETIME NULL" },
  // Unguessable token for the customer's private order page
  // (/[locale]/order/[token]), which shows their eSIM activation code and
  // QR code. Treat it like a password: anyone with the link can see them.
  { name: "access_token", ddl: "VARCHAR(64) NULL" },
];

async function ensureOrdersColumns(pool: mysql.Pool): Promise<void> {
  const [rows] = await pool.query<(mysql.RowDataPacket & { COLUMN_NAME: string })[]>(
    `SELECT COLUMN_NAME FROM information_schema.columns
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders'`
  );
  const existing = new Set(rows.map((r) => r.COLUMN_NAME));
  for (const column of ORDERS_NEW_COLUMNS) {
    if (!existing.has(column.name)) {
      await pool.query(`ALTER TABLE orders ADD COLUMN ${column.name} ${column.ddl}`);
    }
  }
}

async function ensureSchema(pool: mysql.Pool): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await pool.query(statement);
  }
  await ensureOrdersColumns(pool);
  await ensureSimInventoryColumns(pool);
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
