import {
  attachReservedSim,
  attachTransatelOrder,
  claimProvisioning,
  completeProvisioning,
  completeTopUp,
  detachSim,
  ensureAccessToken,
  getOrderById,
  listSubscriptionIdsClaimedByOtherOrders,
  markProvisioningFailed,
  type CheckoutOrder,
} from "@/lib/checkout/orders-repository";
import { orderKind } from "@/lib/checkout/order-kind";
import { sendOrderReadyEmail, sendTopUpReadyEmail } from "@/lib/email/order-emails";
import {
  getEsimDetails,
  getPlanSubscriptions,
  getSimSearchRecord,
  getSubscriberProducts,
  placePlanOrder,
  placePreloadOrder,
  searchSimByIccid,
  toMsisdnDigits,
  TransatelApiError,
  type EsimDetails,
} from "./client";
import {
  getSimByIccid,
  markSimPhysical,
  releaseSimFromOrder,
  reserveEsimForOrder,
  retireSim,
  setSimMsisdn,
  type InventorySim,
} from "./inventory";
import { getTransatelProductId } from "./product";

const MAX_SIM_ATTEMPTS = 3;

type UsableEsim = { sim: InventorySim; esim: EsimDetails & { activationCode: string } };

/**
 * Gives a paid order its eSIM, for Transatel Service Provider Connect
 * (SPC): our SIMs are delivered pre-activated with their eSIM profile
 * already released, so there is no activation call — we place the plan on
 * the SIM and hand the customer the profile's activation code.
 *
 *   1. Claim the order (exactly one attempt runs; see claimProvisioning).
 *   2. Secure a usable eSIM: profile "released", activation code present,
 *      not bound to a device. Checked read-only BEFORE any money is spent
 *      with Transatel; an unusable SIM is taken out of the pool and the
 *      next one tried.
 *   3. MSISDN, digits only, from inventory or SIM Search (the order API
 *      only accepts an MSISDN).
 *   4. Place the "preload" order — skipped if the order already has one, or
 *      if the SIM already carries this plan from an attempt that crashed
 *      before recording it, so a retry never double-orders.
 *   5. Save the activation code and mark the order provisioned.
 *
 * Resumable: each step is saved, so an admin retry of a failed order picks
 * up where it stopped. Never throws — payment already succeeded, so a
 * failure is recorded (provisioning_status 'failed') for an admin to retry
 * from the dashboard.
 */
export async function provisionEsimOrder(orderId: number): Promise<void> {
  // Provisioning buys a real plan from Transatel and hands out a real eSIM.
  // Stripe test-mode payments move no money and public test cards work, so
  // only live orders are provisioned — unless deliberately allowed while
  // testing (ESIM_PROVISION_TEST_ORDERS=true).
  const candidate = await getOrderById(orderId);
  if (!candidate) return;
  // A SIM card is posted, never provisioned: no eSIM reservation, no
  // activation code. A top-up adds a plan to the customer's own SIM.
  if (candidate.productType === "physical_sim") return;
  const kind = orderKind(candidate.stripeCheckoutSessionId);
  if (kind !== "live" && process.env.ESIM_PROVISION_TEST_ORDERS !== "true") {
    console.warn(`[transatel] Order ${orderId} is a ${kind} order — not provisioning a real eSIM (ESIM_PROVISION_TEST_ORDERS is not "true")`);
    return;
  }

  if (candidate.productType === "topup") return provisionTopUp(orderId);

  if (!(await claimProvisioning(orderId))) return;
  await ensureAccessToken(orderId);

  try {
    const order = await getOrderById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (!order.planId) throw new Error(`Order ${orderId} has no plan`);
    const productId = getTransatelProductId({ id: order.planId });

    const { sim, esim } = await secureUsableEsim(order);
    const msisdn = await resolveMsisdn(sim);

    if (!order.transatelOrderId) {
      const existing = (await getSubscriberProducts(msisdn)).find((s) => s.productId === productId);
      const subscriptionId = existing
        ? existing.subscriptionId
        : (await placePreloadOrder({ msisdn, productId, transactionReference: `order-${orderId}` })).subscriptionId;
      await attachTransatelOrder(orderId, subscriptionId, msisdn);
    }

    const code = esim.activationCode.startsWith("LPA:") ? esim.activationCode : `LPA:${esim.activationCode}`;
    await completeProvisioning(orderId, { msisdn, lpaActivationCode: code });
    // Never throws, and a failed email doesn't undo a working eSIM — the
    // admin Orders page can resend it.
    await sendOrderReadyEmail(orderId);
  } catch (error) {
    if (error instanceof TransatelApiError) {
      console.error(`[transatel] Order ${orderId} provisioning failed (${error.status}):`, error.body);
    } else {
      console.error(`[transatel] Order ${orderId} provisioning failed:`, error);
    }
    await markProvisioningFailed(orderId);
  }
}

async function secureUsableEsim(order: CheckoutOrder): Promise<UsableEsim> {
  let iccid = order.iccid;

  for (let attempt = 1; attempt <= MAX_SIM_ATTEMPTS; attempt++) {
    let sim = iccid ? await getSimByIccid(iccid) : null;
    const ownsUsableRow = sim && sim.simType === "esim" && sim.status === "assigned" && sim.assignedOrderId === order.id;

    // A SIM already on the order that it can't keep: e.g. a physical SIM
    // reserved by the old flow before stock was typed (order 13), or a
    // retired demo SIM. Give a physical one back to stock, then reserve.
    if (iccid && !ownsUsableRow) {
      if (order.transatelOrderId) {
        throw new Error(`Order ${order.id} already has a Transatel order on SIM ${iccid}, which is no longer usable — needs manual handling`);
      }
      if (sim && sim.status === "assigned" && sim.assignedOrderId === order.id) await releaseSimFromOrder(sim.iccid, order.id);
      await detachSim(order.id);
      sim = null;
      iccid = null;
    }

    if (!sim) {
      sim = await reserveEsimForOrder(order.id);
      await attachReservedSim(order.id, sim.iccid);
      iccid = sim.iccid;
    }

    const esim = await getEsimDetails(sim.iccid);
    if (esim && esim.status === "released" && esim.activationCode && !esim.eid) {
      return { sim, esim: { ...esim, activationCode: esim.activationCode } };
    }

    const problem = esim ? `eSIM profile is "${esim.status}"${esim.eid ? " and bound to a device" : ""}` : "not an eSIM";
    if (order.transatelOrderId) {
      throw new Error(`Order ${order.id}: SIM ${sim.iccid} already has the plan but its ${problem} — needs manual handling`);
    }
    console.warn(`[transatel] Order ${order.id}: SIM ${sim.iccid} unusable (${problem}), trying another`);
    if (esim) await retireSim(sim.iccid);
    else await markSimPhysical(sim.iccid);
    await detachSim(order.id);
    iccid = null;
  }

  throw new Error(`Order ${order.id}: no usable eSIM found after ${MAX_SIM_ATTEMPTS} attempts`);
}

async function resolveMsisdn(sim: InventorySim): Promise<string> {
  if (sim.msisdn) return toMsisdnDigits(sim.msisdn);
  const found = await searchSimByIccid(sim.iccid);
  if (!found?.msisdn) throw new Error(`SIM ${sim.iccid} has no MSISDN in Transatel's SIM Search`);
  await setSimMsisdn(sim.iccid, found.msisdn);
  return found.msisdn;
}

// --- Top-ups ------------------------------------------------------------------

/** How far our clock and Transatel's may disagree when matching a plan to an order. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Adds a paid plan to the customer's existing SIM (orders.iccid, verified at
 * checkout). No SIM is reserved and there's no activation code. Same safety
 * as eSIMs: claimed once, resumable, failures recorded for an admin retry.
 *
 * Order type follows the SIM's state: "preload" while it has never been used
 * (Pre-Activated), "subscribe" once it's Active. Plans stack on the SIM.
 *
 * Duplicate protection: the eSIM rule ("this plan is already on the SIM, so
 * reuse it") would be wrong here — a customer may buy the same plan again.
 * Instead, a plan of this product only counts as this order's if Transatel
 * created it after the order was placed and no other order has claimed it;
 * that is the plan an attempt that crashed before saving it would have left.
 */
async function provisionTopUp(orderId: number): Promise<void> {
  if (!(await claimProvisioning(orderId))) return;
  await ensureAccessToken(orderId);

  try {
    const order = await getOrderById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (!order.planId) throw new Error(`Order ${orderId} has no plan`);
    if (!order.iccid) throw new Error(`Top-up order ${orderId} has no target SIM`);
    const productId = getTransatelProductId({ id: order.planId });

    const sim = await getSimByIccid(order.iccid);
    if (!sim || sim.status !== "assigned") throw new Error(`Top-up order ${orderId}: SIM ${order.iccid} isn't one of our customers' SIMs`);
    const msisdn = await resolveMsisdn(sim);

    if (!order.transatelOrderId) {
      const since = Date.parse(order.createdAt) - CLOCK_SKEW_MS;
      const ofThisProduct = (await getPlanSubscriptions(msisdn)).filter(
        (p) => p.productId === productId && p.subscriptionDate !== null && Date.parse(p.subscriptionDate) >= since
      );
      const claimed = await listSubscriptionIdsClaimedByOtherOrders(
        ofThisProduct.map((p) => p.subscriptionId),
        orderId
      );
      const leftOver = ofThisProduct.find((p) => !claimed.has(p.subscriptionId));

      let subscriptionId = leftOver?.subscriptionId;
      if (!subscriptionId) {
        const record = await getSimSearchRecord(sim.iccid);
        const state = (record?.status ?? "").toLowerCase().replace(/[^a-z]/g, "");
        if (state !== "preactivated" && state !== "active") {
          throw new Error(`Top-up order ${orderId}: SIM ${sim.iccid} is "${record?.status ?? "unknown"}" at Transatel — can't add a plan`);
        }
        const orderType = state === "preactivated" ? "preload" : "subscribe";
        subscriptionId = (await placePlanOrder({ msisdn, productId, transactionReference: `order-${orderId}`, orderType })).subscriptionId;
      }
      await attachTransatelOrder(orderId, subscriptionId, msisdn);
    }

    await completeTopUp(orderId, msisdn);
    await sendTopUpReadyEmail(orderId);
  } catch (error) {
    if (error instanceof TransatelApiError) {
      console.error(`[transatel] Top-up order ${orderId} failed (${error.status}):`, error.body);
    } else {
      console.error(`[transatel] Top-up order ${orderId} failed:`, error);
    }
    await markProvisioningFailed(orderId);
  }
}
