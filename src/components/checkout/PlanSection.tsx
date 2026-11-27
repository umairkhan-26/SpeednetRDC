"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Plan } from "@/lib/types";
import { useNames } from "@/i18n/use-names";
import { getCountryBySlug } from "@/data/countries";
import { Globe } from "lucide-react";
import { useCheckoutStore } from "@/lib/store/checkout-store";
import SectionHeading from "./SectionHeading";
import TopUpSimPicker from "./TopUpSimPicker";
import TopUpCoverageNotice from "./TopUpCoverageNotice";

export default function PlanSection({ plan, simError }: { plan: Plan; /** Pay was pressed before a SIM was chosen. */ simError: string | null }) {
  const t = useTranslations("checkout.planStep");
  const names = useNames();
  const country = plan.countrySlug ? getCountryBySlug(plan.countrySlug) : undefined;
  const { mode, topUpCountrySlug } = useCheckoutStore();
  const isTopUp = mode === "topup";

  return (
    <div className="space-y-5">
      <SectionHeading number={1} title={t("title")} subtitle={isTopUp ? t("subtitleTopUp") : t("subtitle")} />

      <div className="flex items-center gap-4 rounded-2xl border border-line bg-cream p-4 sm:p-5">
        {country ? (
          <span className="flex h-10 w-15 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-ink">
            {country.iso}
          </span>
        ) : (
          <span className="flex h-10 w-15 shrink-0 items-center justify-center rounded-md bg-orange/10 text-orange">
            <Globe className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{country ? names.country(country) : names.planName(plan)}</p>
          <p className="text-sm text-muted">
            {names.data(plan.dataAmountGb)} &middot; {names.validity(plan.validityDays)}
          </p>
        </div>
        <p className="shrink-0 text-lg font-bold text-orange">{names.price(plan.price)}</p>
      </div>

      {isTopUp && <TopUpSimPicker />}
      {simError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {simError}
        </p>
      )}
      {isTopUp && <TopUpCoverageNotice plan={plan} simCountrySlug={topUpCountrySlug} />}

      <Link href="/esim-store" className="inline-block text-sm font-semibold text-orange hover:underline">
        {t("changePlan")}
      </Link>
    </div>
  );
}
