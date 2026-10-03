import { createHash, randomBytes } from "node:crypto";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "./db";
import { toStaffMember, type StaffRow } from "./repository";
import type { StaffMember, StaffRole } from "./types";

// Staff/admin account management: sign-in lookups, invites, one-time links,
// deactivation and the audit log. Passwords are only ever stored hashed
// (see password.ts) and one-time link tokens only as a SHA-256.

export interface StaffAccount extends StaffMember {
  passwordHash: string | null;
  sessionVersion: number;
  invitedBy: number | null;
  createdAt: string | null;
}

function toAccount(row: StaffRow): StaffAccount {
  return {
    ...toStaffMember(row),
    passwordHash: row.password_hash,
    sessionVersion: row.session_version,
    invitedBy: row.invited_by,
    createdAt: fromMySQLDateTime(row.created_at),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getStaffAccountByEmail(email: string): Promise<StaffAccount | null> {
  const pool = await getPool();
  const [rows] = await pool.query<StaffRow[]>("SELECT * FROM staff_members WHERE email = ?", [normalizeEmail(email)]);
  return rows[0] ? toAccount(rows[0]) : null;
}

export async function getStaffAccountById(id: number): Promise<StaffAccount | null> {
  const pool = await getPool();
  const [rows] = await pool.query<StaffRow[]>("SELECT * FROM staff_members WHERE id = ?", [id]);
  return rows[0] ? toAccount(rows[0]) : null;
}

export async function listStaffAccounts(role?: StaffRole): Promise<(StaffAccount & { invitedByName: string | null })[]> {
  const pool = await getPool();
  const [rows] = await pool.query<(StaffRow & { invited_by_name: string | null })[]>(
    `SELECT s.*, inviter.name AS invited_by_name
     FROM staff_members s LEFT JOIN staff_members inviter ON inviter.id = s.invited_by
     ${role ? "WHERE s.role = ?" : ""}
     ORDER BY s.deactivated_at IS NOT NULL, s.name`,
    role ? [role] : []
  );
  return rows.map((row) => ({ ...toAccount(row), invitedByName: row.invited_by_name }));
}

/** A new account with no password; its owner sets one through the invite link. */
export async function createInvitedStaff(input: { name: string; email: string; role: StaffRole; invitedBy: number }): Promise<number> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO staff_members (name, email, password_hash, role, profile_photo, invited_by, created_at) VALUES (?, ?, NULL, ?, NULL, ?, ?)",
    [input.name, normalizeEmail(input.email), input.role, input.invitedBy, toMySQLDateTime(new Date())]
  );
  return result.insertId;
}

/** Sets a new password and signs the account out everywhere else. Returns the new session version. */
export async function setStaffPassword(staffId: number, passwordHash: string): Promise<number> {
  const pool = await getPool();
  await pool.query("UPDATE staff_members SET password_hash = ?, session_version = session_version + 1 WHERE id = ?", [passwordHash, staffId]);
  const [rows] = await pool.query<(RowDataPacket & { session_version: number })[]>("SELECT session_version FROM staff_members WHERE id = ?", [staffId]);
  return rows[0].session_version;
}

/** Never throws: "last sign-in" is informational and must not block signing in. */
export async function recordStaffLogin(staffId: number): Promise<void> {
  try {
    const pool = await getPool();
    await pool.query("UPDATE staff_members SET last_login_at = ? WHERE id = ?", [toMySQLDateTime(new Date()), staffId]);
  } catch (error) {
    console.error(`[staff] Couldn't record sign-in time for staff ${staffId}:`, error);
  }
}

/** Display names: trimmed, 1–100 characters, no control characters. Returns null if invalid. */
export function cleanDisplayName(raw: string): string | null {
  const name = raw.replace(/\s+/g, " ").trim();
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) return null;
  return name;
}

export async function renameStaff(staffId: number, name: string): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE staff_members SET name = ? WHERE id = ?", [name, staffId]);
}

/** False if another account already uses the address. */
export async function changeStaffEmail(staffId: number, newEmail: string): Promise<boolean> {
  const pool = await getPool();
  try {
    await pool.query("UPDATE staff_members SET email = ? WHERE id = ?", [normalizeEmail(newEmail), staffId]);
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") return false;
    throw error;
  }
}

// --- Deactivation ---------------------------------------------------------

export type DeactivationResult = { ok: true } | { ok: false; error: string };

async function inTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Deactivates an account (never deletes it): it can't sign in, its open
 * sessions end and its unused links stop working. An admin can't
 * deactivate themselves, and the last active admin can't be deactivated.
 * The admin rows are locked so two admins deactivating each other at the
 * same moment can't leave nobody in charge.
 */
export async function deactivateStaff(actorId: number, targetId: number): Promise<DeactivationResult> {
  if (actorId === targetId) return { ok: false, error: "You can't deactivate your own account." };
  return inTransaction(async (conn) => {
    const [admins] = await conn.query<StaffRow[]>(
      "SELECT * FROM staff_members WHERE role = 'admin' AND deactivated_at IS NULL AND password_hash IS NOT NULL FOR UPDATE"
    );
    const [targets] = await conn.query<StaffRow[]>("SELECT * FROM staff_members WHERE id = ? FOR UPDATE", [targetId]);
    const target = targets[0];
    if (!target) return { ok: false, error: "Account not found." };
    if (target.deactivated_at) return { ok: false, error: "That account is already deactivated." };
    if (target.role === "admin" && !admins.some((a) => a.id !== targetId)) {
      return { ok: false, error: "This is the last active admin account, so it can't be deactivated." };
    }
    const now = toMySQLDateTime(new Date());
    await conn.query("UPDATE staff_members SET deactivated_at = ?, session_version = session_version + 1 WHERE id = ?", [now, targetId]);
    await conn.query("UPDATE staff_tokens SET used_at = ? WHERE staff_id = ? AND used_at IS NULL", [now, targetId]);
    return { ok: true };
  });
}

export async function reactivateStaff(targetId: number): Promise<DeactivationResult> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE staff_members SET deactivated_at = NULL WHERE id = ? AND deactivated_at IS NOT NULL",
    [targetId]
  );
  return result.affectedRows === 1 ? { ok: true } : { ok: false, error: "That account isn't deactivated." };
}

// --- One-time links ---------------------------------------------------------

export type StaffTokenPurpose = "invite" | "password_reset" | "email_change";

export const TOKEN_TTL_SECONDS: Record<StaffTokenPurpose, number> = {
  invite: 24 * 60 * 60,
  password_reset: 60 * 60,
  email_change: 24 * 60 * 60,
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Creates a one-time link token and returns it (the only time the raw
 * value exists). Any earlier unused token for the same purpose stops
 * working, so only the newest link is valid.
 */
export async function createStaffToken(staffId: number, purpose: StaffTokenPurpose, newEmail: string | null = null): Promise<string> {
  const pool = await getPool();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await pool.query("UPDATE staff_tokens SET used_at = ? WHERE staff_id = ? AND purpose = ? AND used_at IS NULL", [
    toMySQLDateTime(now),
    staffId,
    purpose,
  ]);
  await pool.query(
    "INSERT INTO staff_tokens (staff_id, purpose, token_hash, new_email, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      staffId,
      purpose,
      hashToken(token),
      newEmail ? normalizeEmail(newEmail) : null,
      toMySQLDateTime(new Date(now.getTime() + TOKEN_TTL_SECONDS[purpose] * 1000)),
      toMySQLDateTime(now),
    ]
  );
  return token;
}

export interface StaffTokenInfo {
  staffId: number;
  purpose: StaffTokenPurpose;
  newEmail: string | null;
  expiresAt: string;
}

interface TokenRow extends RowDataPacket {
  staff_id: number;
  purpose: StaffTokenPurpose;
  new_email: string | null;
  expires_at: string;
}

const toTokenInfo = (row: TokenRow): StaffTokenInfo => ({
  staffId: row.staff_id,
  purpose: row.purpose,
  newEmail: row.new_email,
  expiresAt: fromMySQLDateTime(row.expires_at),
});

/** Looks a token up without using it (to show the right page). Null if unknown, used or expired. */
export async function peekStaffToken(token: string, purposes: StaffTokenPurpose[]): Promise<StaffTokenInfo | null> {
  if (!token) return null;
  const pool = await getPool();
  const [rows] = await pool.query<TokenRow[]>(
    "SELECT staff_id, purpose, new_email, expires_at FROM staff_tokens WHERE token_hash = ? AND purpose IN (?) AND used_at IS NULL AND expires_at > ?",
    [hashToken(token), purposes, toMySQLDateTime(new Date())]
  );
  return rows[0] ? toTokenInfo(rows[0]) : null;
}

/** Uses a token up. Exactly one caller can ever succeed for a given token. */
export async function consumeStaffToken(token: string, purposes: StaffTokenPurpose[]): Promise<StaffTokenInfo | null> {
  if (!token) return null;
  const pool = await getPool();
  const now = toMySQLDateTime(new Date());
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE staff_tokens SET used_at = ? WHERE token_hash = ? AND purpose IN (?) AND used_at IS NULL AND expires_at > ?",
    [now, hashToken(token), purposes, now]
  );
  if (result.affectedRows !== 1) return null;
  const [rows] = await pool.query<TokenRow[]>("SELECT staff_id, purpose, new_email, expires_at FROM staff_tokens WHERE token_hash = ?", [
    hashToken(token),
  ]);
  return rows[0] ? toTokenInfo(rows[0]) : null;
}

/** When the account's current invite link expires, if it has an unused one. */
export async function getPendingInviteExpiries(): Promise<Map<number, string>> {
  const pool = await getPool();
  const [rows] = await pool.query<TokenRow[]>(
    "SELECT staff_id, MAX(expires_at) AS expires_at FROM staff_tokens WHERE purpose = 'invite' AND used_at IS NULL AND expires_at > ? GROUP BY staff_id",
    [toMySQLDateTime(new Date())]
  );
  return new Map(rows.map((row) => [row.staff_id, fromMySQLDateTime(row.expires_at)]));
}

// --- Audit log --------------------------------------------------------------

export type AuditAction =
  | "login"
  | "login_failed"
  | "invite_sent"
  | "invite_accepted"
  | "password_reset_requested"
  | "password_reset"
  | "password_changed"
  | "email_change_requested"
  | "email_changed"
  | "deactivated"
  | "reactivated"
  | "name_changed";

/** Never throws: a failed audit write is logged, and never blocks a sign-in or account change. */
export async function logAudit(actorId: number | null, action: AuditAction, targetId: number | null, detail: string | null = null): Promise<void> {
  try {
    const pool = await getPool();
    await pool.query("INSERT INTO admin_audit_log (actor_id, action, target_id, detail, created_at) VALUES (?, ?, ?, ?, ?)", [
      actorId,
      action,
      targetId,
      detail ? detail.slice(0, 512) : null,
      toMySQLDateTime(new Date()),
    ]);
  } catch (error) {
    console.error(`[audit] Couldn't record "${action}":`, error);
  }
}

export interface AuditEntry {
  id: number;
  action: AuditAction;
  actorName: string | null;
  targetName: string | null;
  detail: string | null;
  createdAt: string;
}

export async function listAuditLog(limit = 50): Promise<AuditEntry[]> {
  const pool = await getPool();
  const [rows] = await pool.query<
    (RowDataPacket & { id: number; action: AuditAction; actor_name: string | null; target_name: string | null; detail: string | null; created_at: string })[]
  >(
    `SELECT log.id, log.action, actor.name AS actor_name, target.name AS target_name, log.detail, log.created_at
     FROM admin_audit_log log
     LEFT JOIN staff_members actor ON actor.id = log.actor_id
     LEFT JOIN staff_members target ON target.id = log.target_id
     ORDER BY log.id DESC LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    actorName: row.actor_name,
    targetName: row.target_name,
    detail: row.detail,
    createdAt: fromMySQLDateTime(row.created_at),
  }));
}
