import { randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "@/lib/staff/db";
import { LIVE_ORDER_SQL, ORDER_KIND_SQL, type OrderKind } from "./order-kind";
import { getPlanCostEur } from "./plan-cost";

// 24 random bytes -> 32 URL-safe characters for the private order link.
const newAccessToken = () => randomBytes(24).toString("base64url");

export type PaymentStatus = "pending" | "completed" | "refunded" | "failed";
export type ProvisioningStatus = "pending" | "activating" | "provisioned" | "failed";
/** esim: a new eSIM · physical_sim: a SIM card shipped by post · topup: a plan for a SIM the customer already has. */
export type ProductType = "esim" | "physical_sim" | "topup";
export type ShippingStatus = "awaiting" | "shipped" | "delivered";

export interface ShippingAddress {
  name: string | null;
  line1: string | null;
  line2: string | null;
  postalCode: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

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
  withdrawalConsentAt: string | null;
  /** Transatel wholesale cost saved when the order was placed (see plan-cost.ts). */
  planCostEur: number | null;
  /** Stripe's fee for the payment, once fetched. */
  stripeFeeEur: number | null;
  productType: ProductType;
  shippingAddress: ShippingAddress | null;
  shippingCountry: string | null;
  shippingEur: number | null;
  shippingStatus: ShippingStatus | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
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
  withdrawal_consent_at?: string | null;
  plan_cost_eur?: string | null;
  stripe_fee_eur?: string | null;
  product_type?: ProductType;
  shipping_address?: string | null;
  shipping_country?: string | null;
  shipping_eur?: string | null;
  shipping_status?: ShippingStatus | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  tracking_number?: string | null;
  created_at: string;
}

function parseAddress(json: string | null | undefined): ShippingAddress | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ShippingAddress;
  } catch {
    return null;
  }
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
    withdrawalConsentAt: fromMySQLDateTime(row.withdrawal_consent_at ?? null),
    planCostEur: row.plan_cost_eur == null ? null : Number(row.plan_cost_eur),
    stripeFeeEur: row.stripe_fee_eur == null ? null : Number(row.stripe_fee_eur),
    productType: row.product_type ?? "esim",
    shippingAddress: parseAddress(row.shipping_address),
    shippingCountry: row.shipping_country ?? null,
    shippingEur: row.shipping_eur == null ? null : Number(row.shipping_eur),
    shippingStatus: row.shipping_status ?? null,
    shippedAt: fromMySQLDateTime(row.shipped_at ?? null),
    deliveredAt: fromMySQLDateTime(row.delivered_at ?? null),
    trackingNumber: row.tracking_number ?? null,
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
  /** For a top-up: the ICCID of the customer's existing SIM (already verified). */
  topUpIccid?: string;
}): Promise<CheckoutOrder> {
  const pool = await getPool();
  const now = new Date();
  const accessToken = newAccessToken();
  const values = [
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
  ];
  // A top-up is created with its target SIM in a single INSERT, so it can
  // never exist, even for a moment, as a plain eSIM order (which would get a
  // new eSIM reserved). The eSIM INSERT itself is unchanged.
  const [result] = input.topUpIccid
    ? await pool.query<ResultSetHeader>(
        `INSERT INTO orders
          (plan_id, plan_name, country_name, country_code, customer_name, customer_email, amount_eur, status, access_token, locale, created_at, product_type, iccid)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, 'topup', ?)`,
        [...values, input.topUpIccid]
      )
    : await pool.query<ResultSetHeader>(
        `INSERT INTO orders
          (plan_id, plan_name, country_name, country_code, customer_name, customer_email, amount_eur, status, access_token, locale, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        values
      );
  const planCostEur = getPlanCostEur(input.planId);
  await recordPlanCost(result.insertId, planCostEur);
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
    iccid: input.topUpIccid ?? null,
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
    withdrawalConsentAt: null,
    planCostEur,
    stripeFeeEur: null,
    productType: input.topUpIccid ? "topup" : "esim",
    shippingAddress: null,
    shippingCountry: null,
    shippingEur: null,
    shippingStatus: null,
    shippedAt: null,
    deliveredAt: null,
    trackingNumber: null,
    createdAt: now.toISOString(),
  };
}

/** Saves the plan's current wholesale cost on the order. Never throws: it must not block a sale. */
async function recordPlanCost(orderId: number, costEur: number | null): Promise<void> {
  if (costEur === null) return;
  try {
    const pool = await getPool();
    await pool.query("UPDATE orders SET plan_cost_eur = ? WHERE id = ? AND plan_cost_eur IS NULL", [costEur, orderId]);
  } catch (error) {
    console.error(`[checkout] Couldn't record the plan cost for order ${orderId}:`, error);
  }
}

declare global {
  var __planCostsBackfilled__: Promise<void> | undefined;
}

/**
 * Orders placed before costs were recorded get their plan's cost from the
 * current grid — once per server start, and only for rows still missing
 * it, so a later grid never overwrites a recorded cost. Never throws.
 */
export function ensurePlanCostsBackfilled(): Promise<void> {
  globalThis.__planCostsBackfilled__ ??= (async () => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query<(RowDataPacket & { id: number; plan_id: string })[]>(
        "SELECT id, plan_id FROM orders WHERE plan_cost_eur IS NULL AND plan_id IS NOT NULL"
      );
      for (const row of rows) {
        const cost = getPlanCostEur(row.plan_id);
        if (cost !== null) await pool.query("UPDATE orders SET plan_cost_eur = ? WHERE id = ? AND plan_cost_eur IS NULL", [cost, row.id]);
      }
    } catch (error) {
      globalThis.__planCostsBackfilled__ = undefined;
      console.error("[checkout] Plan cost backfill failed; will retry:", error);
    }
  })();
  return globalThis.__planCostsBackfilled__;
}

/** Stripe's processing fee for an order's payment (EUR). Never throws. */
export async function recordStripeFee(orderId: number, feeEur: number): Promise<void> {
  try {
    const pool = await getPool();
    await pool.query("UPDATE orders SET stripe_fee_eur = ? WHERE id = ?", [feeEur, orderId]);
  } catch (error) {
    console.error(`[checkout] Couldn't record the Stripe fee for order ${orderId}:`, error);
  }
}

/** Paid live orders whose Stripe fee hasn't been fetched yet. */
export async function listOrdersMissingStripeFee(limit: number): Promise<{ id: number; paymentIntentId: string }[]> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { id: number; stripe_payment_intent_id: string })[]>(
    `SELECT id, stripe_payment_intent_id FROM orders
     WHERE stripe_fee_eur IS NULL AND stripe_payment_intent_id IS NOT NULL AND status = 'completed' AND ${LIVE_ORDER_SQL}
     ORDER BY id DESC LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({ id: row.id, paymentIntentId: row.stripe_payment_intent_id }));
}

/**
 * Records that the customer ticked the withdrawal-right consent box at
 * checkout. A failure is logged, not thrown, so it can't block a sale (the
 * box was already required in the browser and checked by the API).
 */
export async function recordWithdrawalConsent(orderId: number): Promise<void> {
  try {
    const pool = await getPool();
    await pool.query("UPDATE orders SET withdrawal_consent_at = ? WHERE id = ?", [toMySQLDateTime(new Date()), orderId]);
  } catch (error) {
    console.error(`[checkout] Couldn't record withdrawal-right consent for order ${orderId}:`, error);
  }
}

export async function markConfirmationEmailSent(orderId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET confirmation_email_sent_at = ? WHERE id = ?", [toMySQLDateTime(new Date()), orderId]);
}

/**
 * Keeps only the billing country's ISO code from Stripe; ignores anything
 * that isn't one. Never throws: it's called from the payment webhook,
 * which must go on to provision the eSIM whatever happens here.
 */
export async function recordBillingCountry(orderId: number, country: string | null | undefined): Promise<void> {
  if (!country || !/^[A-Z]{2}$/.test(country)) return;
  try {
    const pool = await getPool();
    await pool.query("UPDATE orders SET billing_country = ? WHERE id = ? AND billing_country IS NULL", [country, orderId]);
  } catch (error) {
    console.error(`[checkout] Couldn't record the billing country for order ${orderId}:`, error);
  }
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
       AND attention_dismissed_at IS NULL
       -- a SIM card's included plan is only added once the card is shipped
       AND NOT (product_type = 'physical_sim' AND (shipping_status IS NULL OR shipping_status = 'awaiting'))
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

/**
 * Takes a paid order off the dashboard's "needing attention" list. With
 * `refunded`, the order is also marked refunded (only call that after
 * Stripe confirmed a full refund), so it stops counting as revenue. The
 * order row and its payment details are always kept.
 */
export async function dismissOrderAttention(orderId: number, refunded: boolean): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE orders SET attention_dismissed_at = ?${refunded ? ", status = 'refunded'" : ""}
     WHERE id = ? AND status = 'completed' AND attention_dismissed_at IS NULL`,
    [toMySQLDateTime(new Date()), orderId]
  );
  return result.affectedRows === 1;
}

export const ADMIN_ORDER_SEARCH_LIMIT = 100;

/**
 * Admin order search, newest first. `query` matches an order number
 * ("13" or "ORD-13"), customer name or email, plan, ICCID or MSISDN.
 */
export async function searchOrdersForAdmin(query: string, kind: OrderKind | "all"): Promise<CheckoutOrder[]> {
  await ensurePlanCostsBackfilled();
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

// --- Physical SIM cards ------------------------------------------------------

/** A SIM card order, before payment. The address comes from Stripe Checkout once paid. */
export async function createPhysicalSimOrder(input: {
  customerName: string;
  customerEmail: string;
  amountEur: number;
  shippingEur: number;
  locale: string;
  /** The data plan that comes with the card, added to it when it's shipped. */
  includedPlanId: string;
}): Promise<CheckoutOrder> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO orders
      (plan_id, plan_name, country_name, country_code, customer_name, customer_email, amount_eur, status, access_token, locale, created_at, product_type, shipping_eur)
     VALUES (?, 'Physical SIM card', 'Worldwide', 'WW', ?, ?, ?, 'pending', ?, ?, ?, 'physical_sim', ?)`,
    [input.includedPlanId, input.customerName, input.customerEmail, input.amountEur, newAccessToken(), input.locale, toMySQLDateTime(new Date()), input.shippingEur]
  );
  const order = await getOrderById(result.insertId);
  if (!order) throw new Error("Physical SIM order not found after insert");
  return order;
}

/** Saves the address Stripe collected and queues the card for shipping. Idempotent (webhook redeliveries). */
export async function recordShippingDetails(orderId: number, address: ShippingAddress): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `UPDATE orders SET shipping_address = ?, shipping_country = ?, shipping_status = 'awaiting'
     WHERE id = ? AND product_type = 'physical_sim' AND shipping_status IS NULL`,
    [JSON.stringify(address), address.country, orderId]
  );
}

/** Paid SIM card orders for the shipping list, waiting ones first. */
export async function listPhysicalSimOrders(status: ShippingStatus | "all"): Promise<CheckoutOrder[]> {
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>(
    `SELECT * FROM orders
     WHERE product_type = 'physical_sim' AND status IN ('completed', 'refunded') AND shipping_status IS NOT NULL
       ${status === "all" ? "" : "AND shipping_status = ?"}
     ORDER BY FIELD(shipping_status, 'awaiting', 'shipped', 'delivered'), id ASC
     LIMIT 500`,
    status === "all" ? [] : [status]
  );
  return rows.map(toCheckoutOrder);
}

/** error is a key under admin.msg.shipping ("notAvailable" also has the SIM status). */
export type ShipResult = { ok: true; msisdn: string | null } | { ok: false; error: "notPaidSim" | "alreadyShipped" | "notInStock" | "isEsim" | "notAvailable"; simStatus?: string };

/**
 * Records which card was posted: the ICCID must be an available physical SIM
 * in stock. In one transaction the SIM is assigned to the order and the
 * order marked shipped, so a card can never go to two customers.
 */
export async function shipPhysicalOrder(orderId: number, iccid: string, trackingNumber: string | null, staffId: number): Promise<ShipResult> {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const fail = async (error: "notPaidSim" | "alreadyShipped" | "notInStock" | "isEsim" | "notAvailable", simStatus?: string): Promise<ShipResult> => {
      await conn.rollback();
      return { ok: false, error, ...(simStatus ? { simStatus } : {}) };
    };
    const [orders] = await conn.query<OrderRow[]>("SELECT * FROM orders WHERE id = ? FOR UPDATE", [orderId]);
    const order = orders[0];
    if (!order || order.product_type !== "physical_sim" || order.status !== "completed") return fail("notPaidSim");
    if (order.shipping_status !== "awaiting") return fail("alreadyShipped");
    const [sims] = await conn.query<(RowDataPacket & { sim_type: string; status: string; msisdn: string | null })[]>(
      "SELECT sim_type, status, msisdn FROM sim_inventory WHERE iccid = ? FOR UPDATE",
      [iccid]
    );
    const sim = sims[0];
    if (!sim) return fail("notInStock");
    if (sim.sim_type !== "physical") return fail("isEsim");
    if (sim.status !== "available") return fail("notAvailable", sim.status);
    const now = toMySQLDateTime(new Date());
    await conn.query("UPDATE sim_inventory SET status = 'assigned', assigned_order_id = ? WHERE iccid = ? AND status = 'available'", [orderId, iccid]);
    await conn.query(
      `UPDATE orders SET iccid = ?, msisdn = ?, shipping_status = 'shipped', shipped_at = ?, tracking_number = ?, shipped_by = ?
       WHERE id = ?`,
      [iccid, sim.msisdn, now, trackingNumber, staffId, orderId]
    );
    await conn.commit();
    return { ok: true, msisdn: sim.msisdn };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function markPhysicalOrderDelivered(orderId: number): Promise<boolean> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE orders SET shipping_status = 'delivered', delivered_at = ? WHERE id = ? AND product_type = 'physical_sim' AND shipping_status = 'shipped'",
    [toMySQLDateTime(new Date()), orderId]
  );
  return result.affectedRows === 1;
}

// --- Top-ups ------------------------------------------------------------------

/** A top-up is done once its plan is on the SIM; there's no activation code to store. */
export async function completeTopUp(orderId: number, msisdn: string): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE orders SET msisdn = ?, provisioning_status = 'provisioned', provisioned_at = ? WHERE id = ? AND product_type IN ('topup', 'physical_sim')", [
    msisdn,
    toMySQLDateTime(new Date()),
    orderId,
  ]);
}

/** Of these Transatel subscription ids, the ones already recorded on an order other than this one. */
export async function listSubscriptionIdsClaimedByOtherOrders(subscriptionIds: string[], orderId: number): Promise<Set<string>> {
  if (subscriptionIds.length === 0) return new Set();
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { transatel_order_id: string })[]>(
    "SELECT transatel_order_id FROM orders WHERE transatel_order_id IN (?) AND id <> ?",
    [subscriptionIds, orderId]
  );
  return new Set(rows.map((r) => r.transatel_order_id));
}

export interface CustomerSim {
  iccid: string;
  simType: "esim" | "physical";
  /** The order the SIM came with (the eSIM order, or the card's order). */
  orderId: number;
  orderAccessToken: string | null;
}

/**
 * The SIMs a customer owns, by checkout email: delivered eSIMs and SIM
 * cards that have been shipped. Top-up orders add plans, not SIMs.
 */
export async function listCustomerSims(email: string): Promise<CustomerSim[]> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { id: number; iccid: string; product_type: ProductType; access_token: string | null })[]>(
    `SELECT id, iccid, product_type, access_token FROM orders
     WHERE ${CUSTOMER_ORDERS_SQL} AND status = 'completed' AND iccid IS NOT NULL
       AND ((product_type = 'esim' AND provisioning_status = 'provisioned')
         OR (product_type = 'physical_sim' AND shipping_status IN ('shipped', 'delivered')))
     ORDER BY id DESC`,
    [email.trim().toLowerCase()]
  );
  const seen = new Set<string>();
  return rows
    .filter((r) => !seen.has(r.iccid) && seen.add(r.iccid))
    .map((r) => ({ iccid: r.iccid, simType: r.product_type === "physical_sim" ? "physical" : "esim", orderId: r.id, orderAccessToken: r.access_token }));
}
