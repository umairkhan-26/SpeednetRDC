import { getPool, toMySQLDateTime } from "@/lib/staff/db";

/** Stores a Transatel webhook event once (redeliveries of the same eventId are ignored). */
export async function recordTransatelEvent(event: {
  eventId: string;
  eventType: string;
  msisdn: string | null;
  iccid: string | null;
  eventDate: Date | null;
  payload: string;
}): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT IGNORE INTO transatel_events (event_id, event_type, msisdn, iccid, event_date, payload, received_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      event.eventId,
      event.eventType,
      event.msisdn,
      event.iccid,
      event.eventDate ? toMySQLDateTime(event.eventDate) : null,
      event.payload,
      toMySQLDateTime(new Date()),
    ]
  );
  return (result as { affectedRows: number }).affectedRows > 0;
}
