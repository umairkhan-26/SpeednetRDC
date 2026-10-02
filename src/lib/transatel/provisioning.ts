import {
  attachReservedSim,
  attachTransatelOrder,
  claimProvisioning,
  completeProvisioning,
  detachSim,
  ensureAccessToken,
  getOrderById,
  markProvisioningFailed,
  type CheckoutOrder,
} from "@/lib/checkout/orders-repository";
import {
  getEsimDetails,
  getSubscriberProducts,
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
