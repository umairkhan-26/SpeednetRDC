import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getPool, toMySQLDateTime } from "@/lib/staff/db";

// One row per order whose buyer accepted Meta cookies before checking out.
// Orders without consent have no row, and nothing about them is ever sent
// to Meta. Kept apart from the orders table so checkout and provisioning
// never depend on it.

export interface MetaOrderConsent {
  orderId: number;
  eventId: string;
  fbp: string | null;
  fbc: string | null;
  userAgent: string | null;
  capiSentAt: string | null;
}

interface ConsentRow extends RowDataPacket {
  order_id: number;
  event_id: string;
  fbp: string | null;
  fbc: string | null;
  user_agent: string | null;
  capi_sent_at: string | null;
}

export async function recordMetaConsent(input: { orderId: number; eventId: string; fbp: string | null; fbc: string | null; userAgent: string | null }): Promise<void> {
  const pool = await getPool();
  await pool.query(
    "INSERT INTO meta_order_consent (order_id, event_id, fbp, fbc, user_agent, consented_at) VALUES (?, ?, ?, ?, ?, ?)",
    [input.orderId, input.eventId, input.fbp, input.fbc, input.userAgent, toMySQLDateTime(new Date())]
  );
}

export async function getMetaConsent(orderId: number): Promise<MetaOrderConsent | null> {
  const pool = await getPool();
  const [rows] = await pool.query<ConsentRow[]>("SELECT * FROM meta_order_consent WHERE order_id = ?", [orderId]);
  const row = rows[0];
  return row
    ? { orderId: row.order_id, eventId: row.event_id, fbp: row.fbp, fbc: row.fbc, userAgent: row.user_agent, capiSentAt: row.capi_sent_at }
    : null;
}

/** Claims the Purchase send for an order; true for exactly one caller, so a redelivered webhook never sends it twice. */
export async function claimCapiSend(orderId: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE meta_order_consent SET capi_sent_at = ? WHERE order_id = ? AND capi_sent_at IS NULL",
    [toMySQLDateTime(new Date()), orderId]
  );
  return result.affectedRows === 1;
}

/** Releases a claim after a failed send, so the next webhook delivery can try again. */
export async function releaseCapiSend(orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE meta_order_consent SET capi_sent_at = NULL WHERE order_id = ?", [orderId]);
}
