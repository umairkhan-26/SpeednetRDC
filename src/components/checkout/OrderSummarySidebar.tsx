"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import type { Plan } from "@/lib/types";
import { useNames } from "@/i18n/use-names";
import { calculateOrderTotals } from "@/lib/pricing";
import { getCountryBySlug } from "@/data/countries";

export default function OrderSummarySidebar({ plan }: { plan: Plan }) {
  const t = useTranslations("checkout.summary");
  const names = useNames();
  const country = plan.countrySlug ? getCountryBySlug(plan.countrySlug) : undefined;
  const destination = country ? names.country(country) : names.planArea(plan);
  const totals = calculateOrderTotals(plan.price);

  return (
    <aside className="h-max rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("title")}</p>

      <dl className="mt-4 space-y-3 text-sm">
        <Row label={t("destination")} value={destination} />
        <Row label={t("plan")} value={names.planName(plan)} />
        <Row label={t("validity")} value={names.validity(plan.validityDays)} />
        <Row label={t("data")} value={names.data(plan.dataAmountGb)} />
      </dl>

      <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <Row label={t("price")} value={names.price(totals.subtotal)} />
        <Row label={t("taxes")} value={names.price(totals.taxesAndFees)} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-semibold text-ink">{t("total")}</span>
        <span className="text-xl font-bold text-orange">{names.price(totals.total)}</span>
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-xs text-muted">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
        {t("footer")}
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
