import { getPool } from "@/lib/staff/db";
import type { RowDataPacket } from "mysql2/promise";

export interface ReservedSim {
  iccid: string;
  // Present for stock that's already had a subscriber before (e.g. the
  // demo account's "Pre-activée" test eSIMs, imported with a known MSISDN
  // straight from the SIM management portal export) — that SIM can go
  // straight to placePreloadOrder, no activation step needed. NULL for
  // brand-new stock (e.g. the production delivery file, status
  // "Available", never activated) — that SIM needs activateSim() first;
  // see src/app/api/stripe/webhook/route.ts for how the caller branches
  // on this.
  msisdn: string | null;
}

/**
 * Reserves one unused SIM from `sim_inventory` for a paid order, inside a
 * transaction with a row lock (`FOR UPDATE`) so two orders can never be
 * handed the same SIM if their webhooks happen to race.
 *
 * Seed this table first with `npm run seed:sims` — see
 * scripts/seed-sim-inventory.mjs and scripts/README.md.
 */
export async function reserveSimForOrder(orderId: number): Promise<ReservedSim> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<(RowDataPacket & { id: number; iccid: string; msisdn: string | null })[]>(
      "SELECT id, iccid, msisdn FROM sim_inventory WHERE status = 'available' LIMIT 1 FOR UPDATE"
    );
    const sim = rows[0];
    if (!sim) {
      throw new Error("No available SIMs left in sim_inventory — restock and re-run npm run seed:sims");
    }

    await conn.query("UPDATE sim_inventory SET status = 'assigned', assigned_order_id = ? WHERE id = ?", [
      orderId,
      sim.id,
    ]);

    await conn.commit();
    return { iccid: sim.iccid, msisdn: sim.msisdn };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
