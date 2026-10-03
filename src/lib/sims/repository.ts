import type { RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "@/lib/staff/db";
import type { PaymentStatus, ProvisioningStatus } from "@/lib/checkout/orders-repository";
import type { PlanSubscription } from "@/lib/transatel/client";

// Sold SIMs (orders with a SIM attached) joined with their last known
// Transatel status, for the admin SIMs page. Deliberately never selects
// orders.lpa_activation_code.

/** Last known Transatel status of a SIM (see sim_status_snapshot). */
export interface SimSnapshot {
  msisdn: string | null;
  simStatus: string | null;
  esimProfileStatus: string | null;
  esimProfileDate: string | null;
  simActivationDate: string | null;
  lastSeenDate: string | null;
  lastOriginCountry: string | null;
  planStatus: string | null;
  planActivationDate: string | null;
  planExpiryDate: string | null;
  dataTotalKb: number | null;
  dataRemainingKb: number | null;
  plans: PlanSubscription[];
  fetchedAt: string | null;
  error: string | null;
  errorAt: string | null;
}

export interface SoldSim {
  orderId: number;
  orderCreatedAt: string;
  stripeCheckoutSessionId: string | null;
  paymentStatus: PaymentStatus;
  provisioningStatus: ProvisioningStatus;
  planId: string | null;
  planName: string;
  countryName: string;
  countryCode: string;
  customerName: string;
  customerEmail: string;
  billingCountry: string | null;
  accessToken: string | null;
  transatelSubscriptionId: string | null;
  iccid: string;
  msisdn: string | null;
  simType: "esim" | "physical" | null;
  snapshot: SimSnapshot | null;
}

interface SoldSimRow extends RowDataPacket {
  order_id: number;
  order_created_at: string;
  stripe_checkout_session_id: string | null;
  payment_status: PaymentStatus;
  provisioning_status: ProvisioningStatus;
  plan_id: string | null;
  plan_name: string;
  country_name: string;
  country_code: string;
  customer_name: string;
  customer_email: string;
  billing_country: string | null;
  access_token: string | null;
  transatel_order_id: string | null;
  iccid: string;
  order_msisdn: string | null;
  sim_type: "esim" | "physical" | null;
  snap_iccid: string | null;
  snap_msisdn: string | null;
  sim_status: string | null;
  esim_profile_status: string | null;
  esim_profile_date: string | null;
  sim_activation_date: string | null;
  last_seen_date: string | null;
  last_origin_country: string | null;
  plan_status: string | null;
  plan_activation_date: string | null;
  plan_expiry_date: string | null;
  data_total_kb: number | string | null;
  data_remaining_kb: number | string | null;
  plans_json: string | null;
  fetched_at: string | null;
  error: string | null;
  error_at: string | null;
}

const SOLD_SIM_SELECT = `
  SELECT o.id AS order_id, o.created_at AS order_created_at, o.stripe_checkout_session_id,
         o.status AS payment_status, o.provisioning_status, o.plan_id, o.plan_name, o.country_name,
         o.country_code, o.customer_name, o.customer_email, o.billing_country, o.access_token,
         o.transatel_order_id, o.iccid, o.msisdn AS order_msisdn,
         si.sim_type,
         s.iccid AS snap_iccid, s.msisdn AS snap_msisdn, s.sim_status, s.esim_profile_status, s.esim_profile_date,
         s.sim_activation_date, s.last_seen_date, s.last_origin_country, s.plan_status, s.plan_activation_date,
         s.plan_expiry_date, s.data_total_kb, s.data_remaining_kb, s.plans_json, s.fetched_at, s.error, s.error_at
  FROM orders o
  LEFT JOIN sim_inventory si ON si.iccid = o.iccid
  LEFT JOIN sim_status_snapshot s ON s.iccid = o.iccid
  WHERE o.iccid IS NOT NULL AND o.status IN ('completed', 'refunded')`;

const toNumber = (value: number | string | null) => (value === null ? null : Number(value));

function parsePlans(json: string | null): PlanSubscription[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toSoldSim(row: SoldSimRow): SoldSim {
  return {
    orderId: row.order_id,
    orderCreatedAt: fromMySQLDateTime(row.order_created_at),
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    paymentStatus: row.payment_status,
    provisioningStatus: row.provisioning_status,
    planId: row.plan_id,
    planName: row.plan_name,
    countryName: row.country_name,
    countryCode: row.country_code,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    billingCountry: row.billing_country,
    accessToken: row.access_token,
    transatelSubscriptionId: row.transatel_order_id,
    iccid: row.iccid,
    msisdn: row.order_msisdn ?? row.snap_msisdn,
    simType: row.sim_type,
    snapshot: row.snap_iccid
      ? {
          msisdn: row.snap_msisdn,
          simStatus: row.sim_status,
          esimProfileStatus: row.esim_profile_status,
          esimProfileDate: row.esim_profile_date,
          simActivationDate: row.sim_activation_date,
          lastSeenDate: row.last_seen_date,
          lastOriginCountry: row.last_origin_country,
          planStatus: row.plan_status,
          planActivationDate: row.plan_activation_date,
          planExpiryDate: row.plan_expiry_date,
          dataTotalKb: toNumber(row.data_total_kb),
          dataRemainingKb: toNumber(row.data_remaining_kb),
          plans: parsePlans(row.plans_json),
          fetchedAt: fromMySQLDateTime(row.fetched_at),
          error: row.error,
          errorAt: fromMySQLDateTime(row.error_at),
        }
      : null,
  };
}

/** Every sold SIM, newest order first (capped; filtering happens on the page). */
export const SOLD_SIM_LIMIT = 5000;

export async function listSoldSims(): Promise<SoldSim[]> {
  const pool = await getPool();
  const [rows] = await pool.query<SoldSimRow[]>(`${SOLD_SIM_SELECT} ORDER BY o.id DESC LIMIT ${SOLD_SIM_LIMIT}`);
  return rows.map(toSoldSim);
}

/** The order(s) a SIM was sold on, newest first (normally exactly one). */
export async function getSoldSimsByIccid(iccid: string): Promise<SoldSim[]> {
  const pool = await getPool();
  const [rows] = await pool.query<SoldSimRow[]>(`${SOLD_SIM_SELECT} AND o.iccid = ? ORDER BY o.id DESC`, [iccid]);
  return rows.map(toSoldSim);
}

export type SnapshotData = Omit<SimSnapshot, "fetchedAt" | "error" | "errorAt">;

export async function saveSimSnapshot(iccid: string, data: SnapshotData): Promise<void> {
  const pool = await getPool();
  const values = [
    iccid,
    data.msisdn,
    data.simStatus,
    data.esimProfileStatus,
    data.esimProfileDate,
    data.simActivationDate,
    data.lastSeenDate,
    data.lastOriginCountry,
    data.planStatus,
    data.planActivationDate,
    data.planExpiryDate,
    data.dataTotalKb,
    data.dataRemainingKb,
    JSON.stringify(data.plans),
    toMySQLDateTime(new Date()),
  ];
  await pool.query(
    `INSERT INTO sim_status_snapshot
       (iccid, msisdn, sim_status, esim_profile_status, esim_profile_date, sim_activation_date, last_seen_date,
        last_origin_country, plan_status, plan_activation_date, plan_expiry_date, data_total_kb, data_remaining_kb,
        plans_json, fetched_at, error, error_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
     ON DUPLICATE KEY UPDATE
       msisdn = VALUES(msisdn), sim_status = VALUES(sim_status), esim_profile_status = VALUES(esim_profile_status),
       esim_profile_date = VALUES(esim_profile_date), sim_activation_date = VALUES(sim_activation_date),
       last_seen_date = VALUES(last_seen_date), last_origin_country = VALUES(last_origin_country),
       plan_status = VALUES(plan_status), plan_activation_date = VALUES(plan_activation_date),
       plan_expiry_date = VALUES(plan_expiry_date), data_total_kb = VALUES(data_total_kb),
       data_remaining_kb = VALUES(data_remaining_kb), plans_json = VALUES(plans_json),
       fetched_at = VALUES(fetched_at), error = NULL, error_at = NULL`,
    values
  );
}

/** Records a failed refresh without wiping the last good status. */
export async function saveSimSnapshotError(iccid: string, error: string): Promise<void> {
  const pool = await getPool();
  const now = toMySQLDateTime(new Date());
  await pool.query(
    `INSERT INTO sim_status_snapshot (iccid, error, error_at) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE error = VALUES(error), error_at = VALUES(error_at)`,
    [iccid, error.slice(0, 512), now]
  );
}

/** Paid orders with no billing country yet, to fill in from Stripe. */
export async function listOrdersMissingBillingCountry(limit: number): Promise<{ id: number; stripeCheckoutSessionId: string }[]> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { id: number; stripe_checkout_session_id: string })[]>(
    `SELECT id, stripe_checkout_session_id FROM orders
     WHERE billing_country IS NULL AND stripe_checkout_session_id IS NOT NULL AND status IN ('completed', 'refunded')
     ORDER BY id DESC LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({ id: row.id, stripeCheckoutSessionId: row.stripe_checkout_session_id }));
}
