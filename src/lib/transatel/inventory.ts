import { getPool } from "@/lib/staff/db";
import type { RowDataPacket } from "mysql2/promise";

export type SimType = "esim" | "physical";
export type SimStatus = "available" | "assigned" | "retired";

export interface InventorySim {
  iccid: string;
  /** Digits only, or null if not known yet (provisioning then asks SIM Search). */
  msisdn: string | null;
  simType: SimType;
  status: SimStatus;
  assignedOrderId: number | null;
}

interface SimRow extends RowDataPacket {
  iccid: string;
  msisdn: string | null;
  sim_type: SimType;
  status: SimStatus;
  assigned_order_id: number | null;
}

function toSim(row: SimRow): InventorySim {
  return {
    iccid: row.iccid,
    msisdn: row.msisdn,
    simType: row.sim_type,
    status: row.status,
    assignedOrderId: row.assigned_order_id,
  };
}

/**
 * Reserves one unused eSIM from `sim_inventory` for a paid order, inside a
 * transaction with a row lock (`FOR UPDATE`) so two orders can never be
 * handed the same SIM. Physical SIMs are never picked.
 *
 * Load eSIM stock with scripts/import-esims.mjs (see scripts/README.md).
 */
export async function reserveEsimForOrder(orderId: number): Promise<InventorySim> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<SimRow[]>(
      `SELECT iccid, msisdn, sim_type, status, assigned_order_id FROM sim_inventory
       WHERE sim_type = 'esim' AND status = 'available'
       ORDER BY id LIMIT 1 FOR UPDATE`
    );
    const sim = rows[0];
    if (!sim) {
      throw new Error("No available eSIMs left in sim_inventory — import more with scripts/import-esims.mjs");
    }
    await conn.query("UPDATE sim_inventory SET status = 'assigned', assigned_order_id = ? WHERE iccid = ?", [orderId, sim.iccid]);
    await conn.commit();
    return toSim({ ...sim, status: "assigned", assigned_order_id: orderId });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function getSimByIccid(iccid: string): Promise<InventorySim | null> {
  const pool = await getPool();
  const [rows] = await pool.query<SimRow[]>(
    "SELECT iccid, msisdn, sim_type, status, assigned_order_id FROM sim_inventory WHERE iccid = ?",
    [iccid]
  );
  return rows[0] ? toSim(rows[0]) : null;
}

/** Gives a SIM back to the pool — only if it's still assigned to this order. */
export async function releaseSimFromOrder(iccid: string, orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query(
    "UPDATE sim_inventory SET status = 'available', assigned_order_id = NULL WHERE iccid = ? AND assigned_order_id = ? AND status = 'assigned'",
    [iccid, orderId]
  );
}

/** Takes an eSIM out of circulation for good (e.g. its profile was already used on a device). */
export async function retireSim(iccid: string): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE sim_inventory SET status = 'retired' WHERE iccid = ?", [iccid]);
}

/** Corrects a row recorded as an eSIM that Transatel says isn't one, returning it to physical stock. */
export async function markSimPhysical(iccid: string): Promise<void> {
  const pool = await getPool();
  await pool.query(
    "UPDATE sim_inventory SET sim_type = 'physical', status = 'available', assigned_order_id = NULL WHERE iccid = ?",
    [iccid]
  );
}

export async function setSimMsisdn(iccid: string, msisdn: string): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE sim_inventory SET msisdn = ? WHERE iccid = ?", [msisdn, iccid]);
}
