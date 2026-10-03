import type Stripe from "stripe";
import { getOrderById, recordShippingDetails } from "./orders-repository";
import { sendSimOnItsWayEmail } from "@/lib/email/order-emails";

/**
 * When a SIM card order is paid: keep the shipping address Stripe Checkout
 * collected (name and postal address only) and tell the customer it's on its
 * way. Does nothing for other orders. Never throws — the payment webhook
 * must always finish.
 */
export async function fulfilPaidPhysicalSim(orderId: number, session: Stripe.Checkout.Session): Promise<void> {
  try {
    const order = await getOrderById(orderId);
    if (!order || order.productType !== "physical_sim") return;
    const details = session.collected_information?.shipping_details;
    const a = details?.address;
    await recordShippingDetails(orderId, {
      name: details?.name ?? order.customerName,
      line1: a?.line1 ?? null,
      line2: a?.line2 ?? null,
      postalCode: a?.postal_code ?? null,
      city: a?.city ?? null,
      state: a?.state ?? null,
      country: a?.country ?? null,
    });
    if (!a?.line1) console.error(`[shipping] Order ${orderId} was paid without a shipping address from Stripe — contact the customer`);
    await sendSimOnItsWayEmail(orderId);
  } catch (error) {
    console.error(`[shipping] Order ${orderId}: couldn't record the paid SIM card order:`, error);
  }
}
