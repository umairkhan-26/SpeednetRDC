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
  var __staffSchemaRetryAt__: number | undefined;
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
  // An invited account has no password until its owner sets one through
  // the invite link (passwords are never set or emailed by an admin).
  `ALTER TABLE staff_members MODIFY COLUMN password_hash VARCHAR(255) NULL`,
  // One-time links for staff accounts: 'invite' (24h), 'password_reset'
  // (1h) and 'email_change' (24h, sent to the new address). Only a SHA-256
  // of the token is stored, so a database leak can't be turned into links.
  `CREATE TABLE IF NOT EXISTS staff_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    purpose ENUM('invite', 'password_reset', 'email_change') NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    new_email VARCHAR(255) NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    INDEX (staff_id, purpose),
    FOREIGN KEY (staff_id) REFERENCES staff_members(id)
  )`,
  // Failed sign-in / reset attempts for rate limiting. `bucket` is a keyed
  // hash (of an email address or IP address, never the raw value), and
  // rows older than 24 hours are deleted as new ones are written.
  `CREATE TABLE IF NOT EXISTS auth_rate_limits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bucket CHAR(64) NOT NULL,
    attempted_at DATETIME NOT NULL,
    INDEX (bucket, attempted_at),
    INDEX (attempted_at)
  )`,
  // One-time sign-in links for customers ("My eSIMs"), stored as a SHA-256
  // of the token. Rows are deleted a day after they expire.
  `CREATE TABLE IF NOT EXISTS customer_login_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    INDEX (email),
    INDEX (expires_at)
  )`,
  // Last known Transatel status of each sold SIM, for the admin SIMs page
  // (refreshed on demand with read-only API calls, never on page load).
  // plans_json holds every plan seen on the SIM: product, status, dates
  // and data balances in KB. Never holds an activation code.
  `CREATE TABLE IF NOT EXISTS sim_status_snapshot (
    iccid VARCHAR(32) PRIMARY KEY,
    msisdn VARCHAR(32) NULL,
    sim_status VARCHAR(32) NULL,
    esim_profile_status VARCHAR(32) NULL,
    esim_profile_date VARCHAR(40) NULL,
    sim_activation_date VARCHAR(40) NULL,
    last_seen_date VARCHAR(40) NULL,
    last_origin_country VARCHAR(64) NULL,
    plan_status VARCHAR(32) NULL,
    plan_activation_date VARCHAR(40) NULL,
    plan_expiry_date VARCHAR(40) NULL,
    data_total_kb BIGINT NULL,
    data_remaining_kb BIGINT NULL,
    plans_json TEXT NULL,
    fetched_at DATETIME NULL,
    error VARCHAR(512) NULL,
    error_at DATETIME NULL
  )`,
  // Who did what in the admin panel: sign-ins, invites, deactivations,
  // email and password changes. No IP addresses.
  `CREATE TABLE IF NOT EXISTS admin_audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    actor_id INT NULL,
    action VARCHAR(64) NOT NULL,
    target_id INT NULL,
    detail VARCHAR(512) NULL,
    created_at DATETIME NOT NULL,
    INDEX (created_at)
  )`,
];

// Columns added after a table already existed in production. Plain ADD
// COLUMN isn't idempotent on MySQL versions before 8.0.29 (no IF NOT EXISTS
// support), and Hostinger's MySQL version isn't guaranteed, so existence
// is checked via information_schema first (see ensureColumns).
type NewColumn = { name: string; ddl: string };

const SIM_INVENTORY_NEW_COLUMNS: NewColumn[] = [
  { name: "is_activated", ddl: "TINYINT(1) NOT NULL DEFAULT 0" },
];

const STAFF_MEMBERS_NEW_COLUMNS: NewColumn[] = [
  { name: "last_login_at", ddl: "DATETIME NULL" },
  // Set instead of deleting an account, so its history (shifts, tasks,
  // messages, audit log) stays intact. A deactivated account can't sign in.
  { name: "deactivated_at", ddl: "DATETIME NULL" },
  // Embedded in the session cookie; bumping it signs the account out
  // everywhere (password change, deactivation).
  { name: "session_version", ddl: "INT NOT NULL DEFAULT 0" },
  { name: "invited_by", ddl: "INT NULL" },
  { name: "created_at", ddl: "DATETIME NULL" },
];

const ORDERS_NEW_COLUMNS: NewColumn[] = [
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
  // Site language the customer checked out in (en/fr/es), so emails link
  // to their order page in that language.
  { name: "locale", ddl: "VARCHAR(8) NULL" },
  // Set once the "your eSIM is ready" email was accepted by Resend, so a
  // provisioning retry never emails the customer twice.
  { name: "confirmation_email_sent_at", ddl: "DATETIME NULL" },
  // ISO country code of the card's billing address, from Stripe Checkout
  // (customer_details.address.country). Only the country is kept — never
  // the rest of the address, and never the customer's IP address.
  { name: "billing_country", ddl: "CHAR(2) NULL" },
  // When the customer ticked the checkout box agreeing to immediate
  // delivery and acknowledging the loss of their 14-day EU withdrawal right
  // once the eSIM is delivered (only asked once the legal pages are live).
  { name: "withdrawal_consent_at", ddl: "DATETIME NULL" },
  // What the plan cost us at Transatel (wholesale, excl. VAT) when the order
  // was placed, so past orders keep their real cost when the grid changes.
  // Only counted as a cost once the eSIM is delivered (provisioned).
  { name: "plan_cost_eur", ddl: "DECIMAL(10,2) NULL" },
  // Stripe's processing fee for the payment, from its balance transaction.
  { name: "stripe_fee_eur", ddl: "DECIMAL(10,2) NULL" },
];

// A connection-level failure (database down, wrong credentials) is not a
// migration problem: it's thrown so the caller fails and the next request
// retries, exactly as any query would.
function isConnectionError(error: unknown): boolean {
  const e = error as { fatal?: boolean; code?: string };
  return e?.fatal === true || ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET", "ER_ACCESS_DENIED_ERROR", "ER_DBACCESS_DENIED_ERROR"].includes(e?.code ?? "");
}

type Step = (label: string, run: () => Promise<unknown>) => Promise<void>;

async function ensureColumns(pool: mysql.Pool, table: string, columns: NewColumn[], step: Step): Promise<void> {
  let existing: Set<string> | null = null;
  await step(`read columns of ${table}`, async () => {
    const [rows] = await pool.query<(mysql.RowDataPacket & { COLUMN_NAME: string })[]>(
      `SELECT COLUMN_NAME FROM information_schema.columns
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [table]
    );
    existing = new Set(rows.map((r) => r.COLUMN_NAME));
  });
  if (!existing) return;
  for (const column of columns) {
    if (!(existing as Set<string>).has(column.name)) {
      await step(`add ${table}.${column.name}`, () => pool.query(`ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.ddl}`));
    }
  }
}

/**
 * Runs every migration step independently: a step that fails (say, a new
 * feature's table) is logged and retried a minute later, and only breaks
 * the feature that needs it — never checkout, provisioning or sign-in,
 * whose tables already exist. Returns how many steps failed.
 */
async function ensureSchema(pool: mysql.Pool): Promise<number> {
  let failures = 0;
  const step: Step = async (label, run) => {
    try {
      await run();
    } catch (error) {
      if (isConnectionError(error)) throw error;
      failures++;
      console.error(`[db] Schema step failed (${label}); will retry in a minute:`, error);
    }
  };
  for (const statement of SCHEMA_STATEMENTS) {
    await step(statement.trim().split("\n")[0].replace(/\s*\($/, ""), () => pool.query(statement));
  }
  await ensureColumns(pool, "staff_members", STAFF_MEMBERS_NEW_COLUMNS, step);
  await ensureColumns(pool, "orders", ORDERS_NEW_COLUMNS, step);
  await ensureColumns(pool, "sim_inventory", SIM_INVENTORY_NEW_COLUMNS, step);
  return failures;
}

const SCHEMA_RETRY_MS = 60_000;

export async function getPool(): Promise<mysql.Pool> {
  const pool = getOrCreatePool();
  const retryAt = globalThis.__staffSchemaRetryAt__;
  if (!globalThis.__staffSchemaReady__ || (retryAt !== undefined && Date.now() >= retryAt)) {
    globalThis.__staffSchemaRetryAt__ = undefined;
    globalThis.__staffSchemaReady__ = ensureSchema(pool).then(
      (failures) => {
        if (failures > 0) globalThis.__staffSchemaRetryAt__ = Date.now() + SCHEMA_RETRY_MS;
      },
      (error) => {
        // Couldn't reach the database at all: forget this attempt so the
        // next request retries, instead of failing until a restart.
        globalThis.__staffSchemaReady__ = undefined;
        throw error;
      }
    );
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
