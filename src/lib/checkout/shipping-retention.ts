// Deletes the delivery name and street address of SIM card orders once they
// are no longer needed, as the Privacy Policy says (owner, 2026-11-25: six
// months). The order itself, its delivery country and its dates are kept.
//
// The clock starts on the delivery date; on the posting date if delivery was
// never recorded; on the order date if the order was refunded before posting.
// Paid orders still waiting to be posted keep their address.

import type { ResultSetHeader } from "mysql2/promise";
import { POLICY } from "@/lib/legal";
import { getPool, toMySQLDateTime } from "@/lib/staff/db";

const RUN_EVERY_MS = 12 * 60 * 60 * 1000;
const FIRST_RUN_AFTER_MS = 60 * 1000;

/** The same day and time `months` calendar months earlier (31 August minus 6 months is the end of February). */
function monthsBefore(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

/** Returns how many addresses were deleted. Never throws: a failure is logged and retried on the next run. */
export async function deleteExpiredShippingAddresses(now: Date = new Date()): Promise<number> {
  const months = Number(POLICY.shippingAddressMonths);
  // A missing or odd setting must never delete anything.
  if (!Number.isInteger(months) || months < 1) return 0;
  try {
    const pool = await getPool();
    const cutoff = toMySQLDateTime(monthsBefore(now, months));
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE orders SET shipping_address = NULL, shipping_address_deleted_at = ?
       WHERE product_type = 'physical_sim' AND shipping_address IS NOT NULL
         AND (delivered_at < ?
           OR (delivered_at IS NULL AND shipped_at < ?)
           OR (status = 'refunded' AND shipped_at IS NULL AND created_at < ?))`,
      [toMySQLDateTime(now), cutoff, cutoff, cutoff]
    );
    if (result.affectedRows > 0) console.log(`[privacy] Deleted ${result.affectedRows} expired SIM card delivery address(es)`);
    return result.affectedRows;
  } catch (error) {
    console.error("[privacy] Couldn't delete expired delivery addresses:", error);
    return 0;
  }
}

/** Runs the deletion shortly after the server starts, then twice a day. */
export function scheduleShippingAddressCleanup(): void {
  const run = () => void deleteExpiredShippingAddresses();
  // unref: these timers must never keep a build or a stopping server alive.
  setTimeout(run, FIRST_RUN_AFTER_MS).unref();
  setInterval(run, RUN_EVERY_MS).unref();
}
