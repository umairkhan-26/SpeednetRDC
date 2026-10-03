import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import type { RowDataPacket } from "mysql2/promise";
import { getPool, toMySQLDateTime } from "@/lib/staff/db";

// Counts failed sign-in / reset attempts per bucket in auth_rate_limits.
// A bucket is a keyed hash of what's being limited (an email address or an
// IP address) — the raw value is never stored — and rows are deleted after
// 24 hours.
//
// If the table can't be used (a failed migration, say), these fail open:
// the error is logged and sign-in carries on unlimited, rather than locking
// everyone — including the only admin — out.

const RETENTION_MS = 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.STAFF_SESSION_SECRET;
  if (!secret) throw new Error("STAFF_SESSION_SECRET environment variable is not set");
  return secret;
}

/** e.g. rateLimitBucket("staff-login-ip", ip). Emails are lower-cased first. */
export function rateLimitBucket(kind: string, value: string): string {
  return createHmac("sha256", getSecret()).update(`rate-limit|${kind}|${value.trim().toLowerCase()}`).digest("hex");
}

/** The visitor's IP as seen by our host's proxy, or "unknown". Only ever used hashed. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "unknown";
}

export async function isRateLimited(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const pool = await getPool();
    const since = toMySQLDateTime(new Date(Date.now() - windowSeconds * 1000));
    const [rows] = await pool.query<(RowDataPacket & { count: number })[]>(
      "SELECT COUNT(*) AS count FROM auth_rate_limits WHERE bucket = ? AND attempted_at > ?",
      [bucket, since]
    );
    return rows[0].count >= max;
  } catch (error) {
    console.error("[rate-limit] Check failed; allowing the attempt:", error);
    return false;
  }
}

export async function recordAttempt(...buckets: string[]): Promise<void> {
  try {
    const pool = await getPool();
    const now = new Date();
    for (const bucket of buckets) {
      await pool.query("INSERT INTO auth_rate_limits (bucket, attempted_at) VALUES (?, ?)", [bucket, toMySQLDateTime(now)]);
    }
    await pool.query("DELETE FROM auth_rate_limits WHERE attempted_at < ?", [toMySQLDateTime(new Date(now.getTime() - RETENTION_MS))]);
  } catch (error) {
    console.error("[rate-limit] Couldn't record an attempt:", error);
  }
}

export async function clearAttempts(bucket: string): Promise<void> {
  try {
    const pool = await getPool();
    await pool.query("DELETE FROM auth_rate_limits WHERE bucket = ?", [bucket]);
  } catch (error) {
    console.error("[rate-limit] Couldn't clear attempts:", error);
  }
}
