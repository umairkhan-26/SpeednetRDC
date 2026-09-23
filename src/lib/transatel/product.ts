import type { Plan } from "@/lib/types";

/**
 * Transatel's Technical Reference / productId for this plan.
 *
 * IMPORTANT: this is currently the same value as `Plan.id` — both come
 * straight from Transatel's own `technical_reference` field in the source
 * export (scripts/source/plans.json -> scripts/generate-data.mjs).
 * `Plan.id` is also reused internally for routing and lookup
 * (getPlanById), so if a future refactor ever changes how `id` is
 * generated, this is the one function that must be updated to keep
 * pointing at the real Transatel value.
 *
 * Always call this — never read `plan.id` directly — anywhere the code
 * talks to Transatel's API, so a drift shows up here instead of silently
 * breaking order placement.
 */
export function getTransatelProductId(plan: Pick<Plan, "id">): string {
  return plan.id;
}
