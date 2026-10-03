import { createHash, randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getPool, toMySQLDateTime } from "@/lib/staff/db";

// One-time sign-in links for customers (customer_login_tokens). Only a
// SHA-256 of each token is stored; a link works once, for 15 minutes.

export const LOGIN_LINK_TTL_MINUTES = 15;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Returns the raw token (the only time it exists). Earlier unused links for the address stop working. */
export async function createCustomerLoginToken(email: string): Promise<string> {
  const pool = await getPool();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await pool.query("UPDATE customer_login_tokens SET used_at = ? WHERE email = ? AND used_at IS NULL", [toMySQLDateTime(now), email]);
  await pool.query("INSERT INTO customer_login_tokens (email, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)", [
    email,
    hashToken(token),
    toMySQLDateTime(new Date(now.getTime() + LOGIN_LINK_TTL_MINUTES * 60 * 1000)),
    toMySQLDateTime(now),
  ]);
  // Housekeeping: links are useless a day after they expire.
  await pool.query("DELETE FROM customer_login_tokens WHERE expires_at < ?", [toMySQLDateTime(new Date(now.getTime() - 24 * 60 * 60 * 1000))]);
  return token;
}

/** The address a still-valid link is for, without using it up. */
export async function peekCustomerLoginToken(token: string): Promise<string | null> {
  if (!token) return null;
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { email: string })[]>(
    "SELECT email FROM customer_login_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?",
    [hashToken(token), toMySQLDateTime(new Date())]
  );
  return rows[0]?.email ?? null;
}

/** Uses a link up; returns its address, or null if it's unknown, used or expired. */
export async function consumeCustomerLoginToken(token: string): Promise<string | null> {
  if (!token) return null;
  const pool = await getPool();
  const now = toMySQLDateTime(new Date());
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE customer_login_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?",
    [now, hashToken(token), now]
  );
  if (result.affectedRows !== 1) return null;
  const [rows] = await pool.query<(RowDataPacket & { email: string })[]>("SELECT email FROM customer_login_tokens WHERE token_hash = ?", [
    hashToken(token),
  ]);
  return rows[0]?.email ?? null;
}
