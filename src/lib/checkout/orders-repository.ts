import { randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "@/lib/staff/db";
import { LIVE_ORDER_SQL, ORDER_KIND_SQL, type OrderKind } from "./order-kind";

// 24 random bytes -> 32 URL-safe characters for the private order link.
const newAccessToken = () => randomBytes(24).toString("base64url");

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
  transatelOrderId: string | null;
  provisionedAt: string | null;
  provisioningStartedAt: string | null;
  accessToken: string | null;
  locale: string | null;
  confirmationEmailSentAt: string | null;
  billingCountry: string | null;
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
  transatel_order_id: string | null;
  provisioned_at: string | null;
  provisioning_started_at: string | null;
  access_token: string | null;
  locale: string | null;
  confirmation_email_sent_at: string | null;
  billing_country: string | null;
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
    transatelOrderId: row.transatel_order_id,
    provisionedAt: fromMySQLDateTime(row.provisioned_at),
    provisioningStartedAt: fromMySQLDateTime(row.provisioning_started_at),
    accessToken: row.access_token,
    locale: row.locale,
    confirmationEmailSentAt: fromMySQLDateTime(row.confirmation_email_sent_at),
    billingCountry: row.billing_country,
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
  locale: string;
}): Promise<CheckoutOrder> {
  const pool = await getPool();
  const now = new Date();
  const accessToken = newAccessToken();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO orders
      (plan_id, plan_name, country_name, country_code, customer_name, customer_email, amount_eur, status, access_token, locale, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
    [
      input.planId,
      input.planName,
      input.countryName,
      input.countryCode,
      input.customerName,
      input.customerEmail,
      input.amountEur,
      accessToken,
      input.locale,
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
    transatelOrderId: null,
    provisionedAt: null,
    provisioningStartedAt: null,
    accessToken,
    locale: input.locale,
    confirmationEmailSentAt: null,
    billingCountry: null,
    createdAt: now.toISOString(),
  };
}

export async function markConfirmationEmailSent(orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET confirmation_email_sent_at = ? WHERE id = ?", [toMySQLDateTime(new Date()), orderId]);
}

/** Keeps only the billing country's ISO code from Stripe; ignores anything that isn't one. */
export async function recordBillingCountry(orderId: number, country: string | null | undefined): Promise<void> {
  if (!country || !/^[A-Z]{2}$/.test(country)) return;
  const pool = await getPool();
  await pool.query("UPDATE orders SET billing_country = ? WHERE id = ? AND billing_country IS NULL", [country, orderId]);
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

export async function getOrderByAccessToken(token: string): Promise<CheckoutOrder | null> {
  if (!token) return null;
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>("SELECT * FROM orders WHERE access_token = ?", [token]);
  const row = rows[0];
  return row ? toCheckoutOrder(row) : null;
}

// A customer's orders, for "My eSIMs": paid (or since refunded) orders
// placed through Stripe with that email at checkout. Matched
// case-insensitively, since the address is typed in by hand each time.
const CUSTOMER_ORDERS_SQL =
  "LOWER(customer_email) = ? AND status IN ('completed', 'refunded') AND stripe_checkout_session_id IS NOT NULL";

export async function customerHasOrders(email: string): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT 1 FROM orders WHERE ${CUSTOMER_ORDERS_SQL} LIMIT 1`, [email.trim().toLowerCase()]);
  return rows.length > 0;
}

export async function listOrdersForCustomer(email: string): Promise<CheckoutOrder[]> {
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>(`SELECT * FROM orders WHERE ${CUSTOMER_ORDERS_SQL} ORDER BY id DESC LIMIT 200`, [
    email.trim().toLowerCase(),
  ]);
  return rows.map(toCheckoutOrder);
}

/** Orders created before private order links existed get a token the first time they're provisioned. */
export async function ensureAccessToken(orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET access_token = ? WHERE id = ? AND access_token IS NULL", [newAccessToken(), orderId]);
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
// `status` above is payment status only. provisioning_status tracks giving
// the customer a working eSIM (see src/lib/transatel/provisioning.ts):
//   pending -> activating (claimed by one attempt) -> provisioned
//                                                  \-> failed -> (admin retry) -> pending

/**
 * Atomically claims a paid order for provisioning. Exactly one caller wins,
 * no matter who marked the order paid first (Stripe webhook or the success
 * page's reconciliation) or how many times the webhook is delivered.
 */
export async function claimProvisioning(orderId: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE orders SET provisioning_status = 'activating', provisioning_started_at = ?
     WHERE id = ? AND status = 'completed' AND provisioning_status = 'pending'`,
    [toMySQLDateTime(new Date()), orderId]
  );
  return result.affectedRows > 0;
}

// An attempt still 'activating' after this long is assumed dead (e.g. the
// server restarted mid-way) and may be retried.
const STALE_ATTEMPT_MINUTES = 10;

/** Puts a failed (or stale) paid order back to 'pending' so it can be claimed again. */
export async function resetProvisioningForRetry(orderId: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE orders SET provisioning_status = 'pending'
     WHERE id = ? AND status = 'completed' AND (
       provisioning_status = 'failed'
       OR (provisioning_status = 'activating'
           AND (provisioning_started_at IS NULL OR provisioning_started_at < UTC_TIMESTAMP() - INTERVAL ${STALE_ATTEMPT_MINUTES} MINUTE))
     )`,
    [orderId]
  );
  return result.affectedRows > 0;
}

/**
 * Paid LIVE orders whose eSIM isn't provisioned and that need an admin's
 * attention: failed, stuck mid-attempt, or never started (Stripe webhook
 * never arrived). Stripe test-mode orders and seeded demo rows are never
 * listed — retrying buys a real plan from Transatel.
 */
export async function listOrdersNeedingProvisioning(): Promise<CheckoutOrder[]> {
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>(
    `SELECT * FROM orders
     WHERE status = 'completed' AND plan_id IS NOT NULL AND ${LIVE_ORDER_SQL}
       AND (
         provisioning_status = 'failed'
         OR (provisioning_status = 'pending' AND created_at < UTC_TIMESTAMP() - INTERVAL 5 MINUTE)
         OR (provisioning_status = 'activating'
             AND (provisioning_started_at IS NULL OR provisioning_started_at < UTC_TIMESTAMP() - INTERVAL ${STALE_ATTEMPT_MINUTES} MINUTE))
       )
     ORDER BY id DESC LIMIT 50`
  );
  return rows.map(toCheckoutOrder);
}

export const ADMIN_ORDER_SEARCH_LIMIT = 100;

/**
 * Admin order search, newest first. `query` matches an order number
 * ("13" or "ORD-13"), customer name or email, plan, ICCID or MSISDN.
 */
export async function searchOrdersForAdmin(query: string, kind: OrderKind | "all"): Promise<CheckoutOrder[]> {
  const pool = await getPool();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  const q = query.trim();
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
    const fields = ["customer_name", "customer_email", "plan_name", "iccid", "msisdn"].map((f) => `${f} LIKE ?`);
    const orderNumber = /^(?:ORD-?)?(\d+)$/i.exec(q);
    conditions.push(`(${[...fields, ...(orderNumber ? ["id = ?"] : [])].join(" OR ")})`);
    params.push(...fields.map(() => like), ...(orderNumber ? [Number(orderNumber[1])] : []));
  }
  if (kind !== "all") {
    conditions.push(`${ORDER_KIND_SQL} = ?`);
    params.push(kind);
  }

  const [rows] = await pool.query<OrderRow[]>(
    `SELECT * FROM orders ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
     ORDER BY id DESC LIMIT ${ADMIN_ORDER_SEARCH_LIMIT}`,
    params
  );
  return rows.map(toCheckoutOrder);
}

/** Records which SIM (from sim_inventory) this order uses. */
export async function attachReservedSim(orderId: number, iccid: string): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET iccid = ? WHERE id = ?", [iccid, orderId]);
}

export async function detachSim(orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET iccid = NULL WHERE id = ?", [orderId]);
}

/** Records the Transatel product order placed on the order's SIM. Never placed twice once set. */
export async function attachTransatelOrder(orderId: number, transatelOrderId: string, msisdn: string): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET transatel_order_id = ?, msisdn = ? WHERE id = ?", [transatelOrderId, msisdn, orderId]);
}

/** The plan is on the SIM and the customer has an activation code: done. */
export async function completeProvisioning(
  orderId: number,
  details: { msisdn: string; lpaActivationCode: string | null }
): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `UPDATE orders
     SET msisdn = ?, lpa_activation_code = ?, provisioning_status = 'provisioned', provisioned_at = ?
     WHERE id = ?`,
    [details.msisdn, details.lpaActivationCode, toMySQLDateTime(new Date()), orderId]
  );
}

export async function markProvisioningFailed(orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET provisioning_status = 'failed' WHERE id = ?", [orderId]);
}
