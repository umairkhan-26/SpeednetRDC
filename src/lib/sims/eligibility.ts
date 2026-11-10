import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/staff/db";

// Can a customer buy a data plan for this SIM? Only for one of our own SIMs
// that has actually reached a customer: a SIM card that's been shipped, or
// an eSIM that was delivered on a paid (not refunded) order. Never reveals
// who owns a SIM — the answer is just yes/no.

export interface TopUpTarget {
  iccid: string;
  simType: "esim" | "physical";
}

/** ICCIDs are 18–22 digits; people type them with spaces or dashes. */
export function normalizeIccid(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, "");
  return /^\d{18,22}$/.test(digits) ? digits : null;
}

export async function findTopUpTarget(rawIccid: string): Promise<TopUpTarget | null> {
  const iccid = normalizeIccid(rawIccid);
  if (!iccid) return null;
  const pool = await getPool();
  const [rows] = await pool.query<
    (RowDataPacket & {
      sim_type: "esim" | "physical";
      sim_status: string;
      product_type: string | null;
      order_status: string | null;
      provisioning_status: string | null;
      shipping_status: string | null;
    })[]
  >(
    `SELECT si.sim_type, si.status AS sim_status, o.product_type, o.status AS order_status, o.provisioning_status, o.shipping_status
     FROM sim_inventory si
     LEFT JOIN orders o ON o.id = si.assigned_order_id
     WHERE si.iccid = ?`,
    [iccid]
  );
  const row = rows[0];
  if (!row || row.sim_status !== "assigned" || row.order_status !== "completed") return null;
  if (row.sim_type === "physical") {
    return row.product_type === "physical_sim" && (row.shipping_status === "shipped" || row.shipping_status === "delivered")
      ? { iccid, simType: "physical" }
      : null;
  }
  return row.provisioning_status === "provisioned" ? { iccid, simType: "esim" } : null;
}
