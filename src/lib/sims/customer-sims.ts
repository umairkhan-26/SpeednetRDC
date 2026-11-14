import { getPlanById } from "@/data/plans";
import { simHomeCountrySlug } from "@/lib/topup";
import { listCustomerSims } from "@/lib/checkout/orders-repository";
import { getSoldSimsByIccid } from "./repository";
import { refreshSimStatus } from "./refresh";

// "My SIMs" for a signed-in customer: each SIM with the plans on it (data
// left, expiry). Statuses come from the cached Transatel snapshot, refreshed
// (read-only) when it's older than 15 minutes; a failed refresh just shows
// the last known status.

const STALE_MS = 15 * 60 * 1000;
const NOT_OVER = new Set(["active", "pending", "pendingForFirstUse", "readyForUse", "scheduled"]);

export interface CustomerSimPlan {
  name: string;
  /** active, or waiting for first use in a covered country */
  state: "active" | "waiting";
  dataRemainingKb: number | null;
  dataTotalKb: number | null;
  expiresAt: string | null;
}

export interface CustomerSimStatus {
  iccid: string;
  simType: "esim" | "physical";
  orderAccessToken: string | null;
  /** Country page slug the SIM was bought for (country plans only), to send "Recharge" to the right plans. */
  homeCountrySlug: string | null;
  plans: CustomerSimPlan[];
  checkedAt: string | null;
}

export async function getCustomerSimStatuses(email: string): Promise<CustomerSimStatus[]> {
  const sims = await listCustomerSims(email);
  return Promise.all(
    sims.map(async (sim) => {
      let [sale] = await getSoldSimsByIccid(sim.iccid);
      const fetchedAt = sale?.snapshot?.fetchedAt ? Date.parse(sale.snapshot.fetchedAt) : 0;
      if (Date.now() - fetchedAt > STALE_MS) {
        try {
          await refreshSimStatus(sim.iccid);
          [sale] = await getSoldSimsByIccid(sim.iccid);
        } catch (error) {
          console.warn(`[sims] Couldn't refresh SIM ${sim.iccid} for My SIMs:`, error);
        }
      }
      const plans = (sale?.snapshot?.plans ?? [])
        .filter((p) => NOT_OVER.has(p.status) && !(p.expirationDate && Date.parse(p.expirationDate) < Date.now()))
        .sort((a, b) => (a.status === "active" ? -1 : 0) - (b.status === "active" ? -1 : 0))
        .map((p) => ({
          name: getPlanById(p.productId)?.name ?? p.productId,
          state: p.status === "active" ? ("active" as const) : ("waiting" as const),
          dataRemainingKb: p.dataRemainingKb,
          dataTotalKb: p.dataTotalKb,
          expiresAt: p.status === "active" ? p.expirationDate : null,
        }));
      return { iccid: sim.iccid, simType: sim.simType, orderAccessToken: sim.orderAccessToken, homeCountrySlug: simHomeCountrySlug(sim.planId, getPlanById), plans, checkedAt: sale?.snapshot?.fetchedAt ?? null };
    })
  );
}
