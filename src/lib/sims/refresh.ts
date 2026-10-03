import { getStripe } from "@/lib/checkout/stripe";
import { recordBillingCountry } from "@/lib/checkout/orders-repository";
import { getTransatelProductId } from "@/lib/transatel/product";
import {
  getEsimDetails,
  getPlanSubscriptions,
  getSimSearchRecord,
  searchAllSims,
  type PlanSubscription,
  type SimSearchRecord,
} from "@/lib/transatel/client";
import {
  getSoldSimsByIccid,
  listOrdersMissingBillingCountry,
  listSoldSims,
  saveSimSnapshot,
  saveSimSnapshotError,
  type SnapshotData,
  type SoldSim,
} from "./repository";

// Refreshes the cached Transatel status of sold SIMs. Read-only towards
// Transatel (GET requests only) and Stripe (retrieving Checkout Sessions).
// Activation codes are never read into the snapshot.

const CONCURRENCY = 4;

/** The plan this order bought: the subscription provisioning recorded, else the newest one for the product, else the newest. */
function pickPlan(sim: SoldSim, plans: PlanSubscription[]): PlanSubscription | null {
  const byId = sim.transatelSubscriptionId ? plans.find((p) => p.subscriptionId === sim.transatelSubscriptionId) : undefined;
  if (byId) return byId;
  const newestFirst = [...plans].sort((a, b) => (b.subscriptionDate ?? "").localeCompare(a.subscriptionDate ?? ""));
  const productId = sim.planId ? getTransatelProductId({ id: sim.planId }) : null;
  return newestFirst.find((p) => p.productId === productId) ?? newestFirst[0] ?? null;
}

async function buildSnapshot(sim: SoldSim, record: SimSearchRecord | null, esimProfileStatus?: string | null): Promise<SnapshotData> {
  const msisdn = record?.msisdn ?? sim.msisdn;
  const plans = msisdn ? await getPlanSubscriptions(msisdn) : [];
  const plan = pickPlan(sim, plans);
  return {
    msisdn,
    simStatus: record?.status ?? null,
    esimProfileStatus: esimProfileStatus ?? record?.lastEsimProfileStatus ?? null,
    esimProfileDate: record?.lastEsimProfileDate ?? null,
    simActivationDate: record?.activationDate ?? null,
    lastSeenDate: record?.lastSeenDate ?? null,
    lastOriginCountry: record?.lastOriginCountry ?? null,
    planStatus: plan?.status ?? null,
    planActivationDate: plan?.activationDate ?? null,
    planExpiryDate: plan?.expirationDate ?? null,
    dataTotalKb: plan?.dataTotalKb ?? null,
    dataRemainingKb: plan?.dataRemainingKb ?? null,
    plans,
  };
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

async function forEachWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]);
  });
  await Promise.all(workers);
}

/**
 * Fills in billing countries Stripe has but we didn't store (orders paid
 * before we started capturing it). Only sessions from the same Stripe mode
 * as the configured key can be looked up.
 */
async function backfillBillingCountries(): Promise<number> {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const prefix = key.startsWith("sk_live_") || key.startsWith("rk_live_") ? "cs_live_" : "cs_test_";
  const orders = (await listOrdersMissingBillingCountry(25)).filter((o) => o.stripeCheckoutSessionId.startsWith(prefix));
  if (!orders.length) return 0;
  const stripe = getStripe();
  let filled = 0;
  for (const order of orders) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
      const country = session.customer_details?.address?.country;
      if (country) {
        await recordBillingCountry(order.id, country);
        filled++;
      }
    } catch (error) {
      console.warn(`[sims] Couldn't read billing country for order ${order.id} from Stripe:`, errorMessage(error));
    }
  }
  return filled;
}

export interface RefreshSummary {
  refreshed: number;
  failed: number;
  notFoundInTransatel: number;
  billingCountriesFilled: number;
}

/** Every sold SIM: one SIM Search for the whole fleet, then each SIM's plans (4 at a time). */
export async function refreshAllSimStatuses(): Promise<RefreshSummary> {
  const sims = await listSoldSims();
  const fleet = await searchAllSims();
  const summary: RefreshSummary = { refreshed: 0, failed: 0, notFoundInTransatel: 0, billingCountriesFilled: 0 };
  const seen = new Set<string>();
  const unique = sims.filter((sim) => !seen.has(sim.iccid) && seen.add(sim.iccid));

  await forEachWithConcurrency(unique, CONCURRENCY, async (sim) => {
    const record = fleet.get(sim.iccid) ?? null;
    if (!record) summary.notFoundInTransatel++;
    try {
      await saveSimSnapshot(sim.iccid, await buildSnapshot(sim, record));
      summary.refreshed++;
    } catch (error) {
      summary.failed++;
      await saveSimSnapshotError(sim.iccid, errorMessage(error));
    }
  });

  try {
    summary.billingCountriesFilled = await backfillBillingCountries();
  } catch (error) {
    console.warn("[sims] Billing country backfill failed:", errorMessage(error));
  }
  return summary;
}

/** One SIM, with the eSIM profile status read live from the SM-DP+ (the activation code is discarded). */
export async function refreshSimStatus(iccid: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const [sim] = await getSoldSimsByIccid(iccid);
  if (!sim) return { ok: false, error: "No sold SIM with that ICCID." };
  try {
    const record = await getSimSearchRecord(iccid);
    const esim = sim.simType === "physical" ? null : await getEsimDetails(iccid);
    await saveSimSnapshot(iccid, await buildSnapshot(sim, record, esim?.status ?? null));
    return { ok: true };
  } catch (error) {
    await saveSimSnapshotError(iccid, errorMessage(error));
    return { ok: false, error: errorMessage(error) };
  }
}
