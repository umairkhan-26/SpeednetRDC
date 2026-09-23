import { getPlanById } from "@/data/plans";
import { completeProvisioning, type CheckoutOrder } from "@/lib/checkout/orders-repository";
import { getTransatelProductId } from "./product";
import { placePreloadOrder } from "./client";

/**
 * Places the customer's actual purchased plan on an already-known MSISDN
 * and marks the order provisioned. Shared by two callers that reach this
 * point differently:
 *   - src/app/api/stripe/webhook/route.ts, for a SIM that already had an
 *     MSISDN at reservation time (no activation needed).
 *   - src/app/api/transatel/events/route.ts, for a SIM that needed
 *     activation first and just got its MSISDN via Transatel's event.
 *
 * Throws (TransatelApiError or a plain Error for a missing/unknown plan)
 * rather than swallowing failures — callers decide how to record that
 * (see markProvisioningFailed at each call site).
 */
export async function preloadCustomerPlan(
  order: Pick<CheckoutOrder, "id" | "planId">,
  msisdn: string
): Promise<void> {
  if (!order.planId) {
    throw new Error(`Order ${order.id} has no planId, cannot preload a plan`);
  }
  const plan = getPlanById(order.planId);
  if (!plan) {
    throw new Error(`Order ${order.id} references unknown plan ${order.planId}`);
  }

  await placePreloadOrder({
    msisdn,
    productId: getTransatelProductId(plan),
    transactionReference: `order-${order.id}`,
  });

  // No LPA activation code available from this flow — see the comment in
  // src/app/api/transatel/events/route.ts for why (physical-SIM delivery
  // files don't carry one; eSIM delivery files might).
  await completeProvisioning(order.id, { msisdn, lpaActivationCode: null });
}
