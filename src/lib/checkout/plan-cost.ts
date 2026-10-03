import sourcePlans from "../../../scripts/source/plans.json";

// What a plan costs us at Transatel: wholesale_price_excl_vat_eur from the
// price grid in scripts/source/plans.json — the same file the public plan
// data is generated from, so a new grid brings new costs with it.
//
// SERVER-ONLY: wholesale prices are confidential. Only import this from
// server code (repositories, route handlers), never from a client
// component. Each order stores its cost when it's placed
// (orders.plan_cost_eur), so later grid changes never rewrite past orders.

const COSTS = new Map<string, number>();
for (const plan of sourcePlans as { technical_reference: string; wholesale_price_excl_vat_eur: number | null }[]) {
  if (typeof plan.wholesale_price_excl_vat_eur === "number") COSTS.set(plan.technical_reference, plan.wholesale_price_excl_vat_eur);
}

/** Transatel wholesale cost of a plan in EUR (excl. VAT), or null if the grid doesn't list one. */
export function getPlanCostEur(planId: string | null | undefined): number | null {
  return planId ? (COSTS.get(planId) ?? null) : null;
}
