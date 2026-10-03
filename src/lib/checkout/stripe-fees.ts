import type Stripe from "stripe";
import { getStripe } from "./stripe";
import { listOrdersMissingStripeFee, recordStripeFee } from "./orders-repository";

// Stripe's actual processing fee per payment, read from the payment's
// balance transaction (read-only API calls). Only EUR fees are recorded: a
// fee in another settlement currency can't be compared with EUR revenue.

async function fetchStripeFeeEur(paymentIntentId: string): Promise<number | null> {
  const intent = await getStripe().paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge.balance_transaction"] });
  const charge = intent.latest_charge;
  if (!charge || typeof charge === "string") return null;
  const balance = charge.balance_transaction as Stripe.BalanceTransaction | string | null;
  if (!balance || typeof balance === "string" || balance.currency !== "eur") return null;
  return balance.fee / 100;
}

/** Called after a payment succeeds. Never throws; a fee not available yet is picked up by the backfill. */
export async function recordStripeFeeForOrder(orderId: number, paymentIntentId: string | null): Promise<void> {
  if (!paymentIntentId) return;
  try {
    const fee = await fetchStripeFeeEur(paymentIntentId);
    if (fee !== null) await recordStripeFee(orderId, fee);
  } catch (error) {
    console.warn(`[stripe] Couldn't read the fee for order ${orderId}:`, error instanceof Error ? error.message : error);
  }
}

/** Fills in fees for paid live orders that don't have one yet (e.g. paid before fees were recorded). */
export async function backfillStripeFees(limit = 50): Promise<{ filled: number; missing: number }> {
  const orders = await listOrdersMissingStripeFee(limit);
  let filled = 0;
  for (const order of orders) {
    try {
      const fee = await fetchStripeFeeEur(order.paymentIntentId);
      if (fee !== null) {
        await recordStripeFee(order.id, fee);
        filled++;
      }
    } catch (error) {
      console.warn(`[stripe] Couldn't read the fee for order ${order.id}:`, error instanceof Error ? error.message : error);
    }
  }
  return { filled, missing: orders.length - filled };
}
