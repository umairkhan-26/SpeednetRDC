import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "@/lib/staff/db";

export type PaymentStatus = "pending" | "completed" | "refunded" | "failed";

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
