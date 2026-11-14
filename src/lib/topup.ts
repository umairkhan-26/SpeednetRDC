// "Recharge" / "Add to my SIM": put a new data plan on a SIM the customer
// already has (eSIM or SIM card).
//
// Its own switch, TOPUP_ENABLED, exactly "true" (set it in Hostinger and
// redeploy). OFF by default: nothing recharge-related is visible or accepted.
// It is deliberately separate from PHYSICAL_SIM_ENABLED, so eSIM recharge can
// be opened without opening the SIM-card sale. When the SIM-card sale is on,
// recharging stays available too (as it always was with that switch).

import { getCountryBySlug } from "@/data/countries";
import type { Plan } from "@/lib/types";
import { isPhysicalSimEnabled } from "@/lib/physical-sim";

export function isTopUpEnabled(): boolean {
  return process.env.TOPUP_ENABLED === "true" || isPhysicalSimEnabled();
}

/**
 * Where a SIM was bought for, from the plan of its first order. Only country
 * plans name one country; regional/global SIMs can be used in many countries,
 * so we can't tell where they are.
 */
export function simHomeCountrySlug(planId: string | null | undefined, getPlan: (id: string) => Plan | undefined): string | null {
  if (!planId) return null;
  const plan = getPlan(planId);
  return plan?.scope === "country" && plan.countrySlug ? plan.countrySlug : null;
}

// Transatel's lists spell some countries differently ("United States of
// America", "Brunei Darussalam"…): compare without accents, punctuation and
// spaces, allow one name to contain the other, and map the few real aliases.
const ALIASES: Record<string, string> = { southkorea: "republicofkorea", laos: "laopeoplesdemocraticrepublic" };
const norm = (s: string) => {
  const key = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return ALIASES[key] ?? key;
};
const sameCountry = (a: string, b: string) => {
  const x = norm(a);
  const y = norm(b);
  return x === y || (x.length >= 5 && y.includes(x)) || (y.length >= 5 && x.includes(y));
};

/**
 * false only when we can tell that the plan does NOT cover that country
 * (so the warning never fires on a guess). Country plans compare slugs;
 * multi-country plans compare the country name against their list.
 */
export function planMissesCountry(plan: Plan, countrySlug: string | null | undefined): boolean {
  if (!countrySlug) return false;
  const country = getCountryBySlug(countrySlug);
  if (!country) return false;
  if (plan.scope === "country") return plan.countrySlug !== countrySlug;
  const list = plan.countriesIncluded;
  if (!list || list.length === 0) return false;
  return !list.some((name) => sameCountry(name, country.name));
}
