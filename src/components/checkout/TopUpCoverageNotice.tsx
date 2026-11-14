"use client";

import { AlertTriangle, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { getCountryBySlug } from "@/data/countries";
import { useNames } from "@/i18n/use-names";
import { planMissesCountry } from "@/lib/topup";
import type { Plan } from "@/lib/types";

/**
 * Shown when a plan is being added to an existing SIM: a plan only works in the
 * countries it covers, so remind the customer to check where they are — and warn
 * clearly when we can tell the plan does NOT cover the country the SIM was bought for.
 */
export default function TopUpCoverageNotice({ plan, simCountrySlug }: { plan: Plan; simCountrySlug?: string | null }) {
  const t = useTranslations("recharge.coverage");
  const names = useNames();
  const country = simCountrySlug ? getCountryBySlug(simCountrySlug) : undefined;
  const misses = !!country && planMissesCountry(plan, simCountrySlug);

  if (misses && country) {
    return (
      <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-orange bg-orange/10 px-4 py-3 text-sm text-ink">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange" />
        {t("warning", { country: names.country(country) })}
      </p>
    );
  }
  return (
    <p className="mt-4 flex items-start gap-2 rounded-xl bg-orange/5 px-4 py-3 text-sm text-ink">
      <Info className="mt-0.5 size-4 shrink-0 text-orange" />
      {t("generic")}
    </p>
  );
}
