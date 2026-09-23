import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "@/lib/staff/db";

export type PaymentStatus = "pending" | "completed" | "refunded" | "failed";
export type ProvisioningStatus = "pending" | "activating" | "provisioned" | "failed";

export interface CheckoutOrder {
  id: number;
  planId: string | null;
  planName: string;
  countryName: string;
  countryCode: string;
  customerName: string;
  customerEmail: string;
  amountEur: number;
  status: PaymentStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  iccid: string | null;
  lpaActivationCode: string | null;
  msisdn: string | null;
  provisioningStatus: ProvisioningStatus;
  transatelActivationTransactionId: string | null;
  createdAt: string;
}

interface OrderRow extends RowDataPacket {
  id: number;
  plan_id: string | null;
  plan_name: string;
  country_name: string;
  country_code: string;
  customer_name: string;
  customer_email: string;
  amount_eur: string;
  status: PaymentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  iccid: string | null;
  lpa_activation_code: string | null;
  msisdn: string | null;
  provisioning_status: ProvisioningStatus;
  transatel_activation_transaction_id: string | null;
  created_at: string;
}

function toCheckoutOrder(row: OrderRow): CheckoutOrder {
  return {
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name,
    countryName: row.country_name,
    countryCode: row.country_code,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    amountEur: Number(row.amount_eur),
    status: row.status,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    iccid: row.iccid,
    lpaActivationCode: row.lpa_activation_code,
    msisdn: row.msisdn,
    provisioningStatus: row.provisioning_status,
    transatelActivationTransactionId: row.transatel_activation_transaction_id,
    createdAt: fromMySQLDateTime(row.created_at),
  };
}

export async function createPendingOrder(input: {
  planId: string;
  planName: string;
  countryName: string;
  countryCode: string;
  customerName: string;
  customerEmail: string;
  amountEur: number;
}): Promise<CheckoutOrder> {
  const pool = await getPool();
  const now = new Date();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO orders
      (plan_id, plan_name, country_name, country_code, customer_name, customer_email, amount_eur, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      input.planId,
      input.planName,
      input.countryName,
      input.countryCode,
      input.customerName,
      input.customerEmail,
      input.amountEur,
      toMySQLDateTime(now),
    ]
  );
  return {
    id: result.insertId,
    planId: input.planId,
    planName: input.planName,
    countryName: input.countryName,
    countryCode: input.countryCode,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    amountEur: input.amountEur,
    status: "pending",
    stripeCheckoutSessionId: null,
    stripePaymentIntentId: null,
    iccid: null,
    lpaActivationCode: null,
    msisdn: null,
    provisioningStatus: "pending",
    transatelActivationTransactionId: null,
    createdAt: now.toISOString(),
  };
}

export async function attachStripeCheckoutSession(orderId: number, sessionId: string): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET stripe_checkout_session_id = ? WHERE id = ?", [sessionId, orderId]);
}

export async function getOrderById(orderId: number): Promise<CheckoutOrder | null> {
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>("SELECT * FROM orders WHERE id = ?", [orderId]);
  const row = rows[0];
  return row ? toCheckoutOrder(row) : null;
}

export async function getOrderByStripeCheckoutSessionId(sessionId: string): Promise<CheckoutOrder | null> {
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>(
    "SELECT * FROM orders WHERE stripe_checkout_session_id = ?",
    [sessionId]
  );
  const row = rows[0];
  return row ? toCheckoutOrder(row) : null;
}

// Used by the Transatel events webhook (src/app/api/transatel/events/route.ts)
// to match an incoming CONNECTIVITY-MANAGEMENT/SUBSCRIBER/ACTIVATED event
// back to the order whose SIM activation it reports the result of.
export async function getOrderByActivationTransactionId(transactionId: string): Promise<CheckoutOrder | null> {
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>(
    "SELECT * FROM orders WHERE transatel_activation_transaction_id = ?",
    [transactionId]
  );
  const row = rows[0];
  return row ? toCheckoutOrder(row) : null;
}

// Idempotent: only transitions rows that are still 'pending', so a
// duplicate webhook delivery (or a race with the success-page reconciler)
// never re-processes an order that's already settled.
export async function markOrderPaid(orderId: number, paymentIntentId: string | null): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE orders SET status = 'completed', stripe_payment_intent_id = ? WHERE id = ? AND status = 'pending'",
    [paymentIntentId, orderId]
  );
  return result.affectedRows > 0;
}

export async function markOrderFailed(orderId: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE orders SET status = 'failed' WHERE id = ? AND status = 'pending'",
    [orderId]
  );
  return result.affectedRows > 0;
}

// --- Transatel provisioning tracking ---------------------------------
// `status` above is payment status only. These track the separate,
// asynchronous process of actually giving the customer a working eSIM:
//   pending -> activating -> provisioned
//                        \-> failed
// See src/app/api/stripe/webhook/route.ts (starts activation right after
// payment) and src/app/api/transatel/events/route.ts (finishes it once
// Transatel reports the SIM is active).

// Records which SIM (from sim_inventory, see src/lib/transatel/inventory.ts)
// was reserved for this order. Called right after reservation regardless
// of which path the order takes next (see src/app/api/stripe/webhook/route.ts):
// a SIM that already has an MSISDN goes straight to completeProvisioning;
// one that doesn't needs attachActivationTransaction + the events webhook
// first.
export async function attachReservedSim(orderId: number, iccid: string): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `UPDATE orders SET iccid = ?, provisioning_status = 'activating' WHERE id = ?`,
    [iccid, orderId]
  );
}

// Records that we've asked Transatel to activate a brand-new SIM (one with
// no MSISDN yet) and are now waiting on its ACTIVATED event.
export async function attachActivationTransaction(orderId: number, activationTransactionId: string): Promise<void> {
  const pool = await getPool();
  await pool.query(`UPDATE orders SET transatel_activation_transaction_id = ? WHERE id = ?`, [
    activationTransactionId,
    orderId,
  ]);
}

// Called once Transatel's ACTIVATED event confirms the SIM is live and we've
// successfully preloaded the customer's purchased plan onto it.
export async function completeProvisioning(
  orderId: number,
  details: { msisdn: string; lpaActivationCode: string | null }
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `UPDATE orders
     SET msisdn = ?, lpa_activation_code = ?, provisioning_status = 'provisioned'
     WHERE id = ?`,
    [details.msisdn, details.lpaActivationCode, orderId]
  );
}

export async function markProvisioningFailed(orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET provisioning_status = 'failed' WHERE id = ?", [orderId]);
}
