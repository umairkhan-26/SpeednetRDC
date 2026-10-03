// Bootstraps an admin account on a database with no admin yet (e.g. a fresh
// local dev database). Never sets a password: it creates the account (or
// reuses a not-yet-accepted one) and prints a one-time, 24-hour link where
// its owner chooses their own. Once one admin exists, invite everyone else
// from the admin panel (Admins / Staff Directory) instead.
//
// Run with: npm run admin:invite -- <email> "<Full Name>"
// (loads DB_* and APP_URL from .env.local). Start the app once first so it
// creates the tables. The printed link is a secret: send it only to the
// person it's for.
import mysql from "mysql2/promise";
import { createHash, randomBytes } from "node:crypto";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set (did you forget --env-file=.env.local?)`);
  }
  return value;
}

const [emailArg, ...nameParts] = process.argv.slice(2);
const email = (emailArg ?? "").trim().toLowerCase();
const name = nameParts.join(" ").trim();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
  console.error('Usage: npm run admin:invite -- <email> "<Full Name>"');
  process.exit(1);
}

const toMySQLDateTime = (date) => date.toISOString().slice(0, 19).replace("T", " ");

const connection = await mysql.createConnection({
  host: requireEnv("DB_HOST"),
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  dateStrings: true,
});

try {
  const [tables] = await connection.query(
    "SELECT COUNT(*) AS count FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff_tokens'"
  );
  if (tables[0].count === 0) {
    throw new Error("The staff_tokens table doesn't exist yet. Start the app (npm run dev) and open any admin page once, then re-run this.");
  }

  const now = new Date();
  const [existing] = await connection.query("SELECT id, role, password_hash, deactivated_at FROM staff_members WHERE email = ?", [email]);
  let staffId;
  if (existing[0]) {
    const row = existing[0];
    if (row.password_hash || row.deactivated_at || row.role !== "admin") {
      throw new Error(`${email} already has an account that isn't a pending admin invite. Use "Forgot your password?" on /admin/login instead.`);
    }
    staffId = row.id;
  } else {
    const [result] = await connection.query(
      "INSERT INTO staff_members (name, email, password_hash, role, profile_photo, created_at) VALUES (?, ?, NULL, 'admin', NULL, ?)",
      [name, email, toMySQLDateTime(now)]
    );
    staffId = result.insertId;
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await connection.query("UPDATE staff_tokens SET used_at = ? WHERE staff_id = ? AND purpose = 'invite' AND used_at IS NULL", [
    toMySQLDateTime(now),
    staffId,
  ]);
  await connection.query(
    "INSERT INTO staff_tokens (staff_id, purpose, token_hash, new_email, expires_at, created_at) VALUES (?, 'invite', ?, NULL, ?, ?)",
    [staffId, tokenHash, toMySQLDateTime(new Date(now.getTime() + 24 * 60 * 60 * 1000)), toMySQLDateTime(now)]
  );
  await connection.query("INSERT INTO admin_audit_log (actor_id, action, target_id, detail, created_at) VALUES (NULL, 'invite_sent', ?, ?, ?)", [
    staffId,
    `admin invite to ${email} (command line)`,
    toMySQLDateTime(now),
  ]);

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  console.log(`Admin account ready for ${email} (id ${staffId}).`);
  console.log("One-time link to choose a password (expires in 24 hours — send it only to them):");
  console.log(`${appUrl}/admin/set-password?token=${token}`);
} finally {
  await connection.end();
}
