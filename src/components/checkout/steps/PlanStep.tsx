"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Plan } from "@/lib/types";
import { useNames } from "@/i18n/use-names";
import { getCountryBySlug } from "@/data/countries";
import { Button } from "@/components/ui/Button";
import { Globe } from "lucide-react";

export default function PlanStep({ plan, onContinue }: { plan: Plan; onContinue: () => void }) {
  const t = useTranslations("checkout.planStep");
  const names = useNames();
  const country = plan.countrySlug ? getCountryBySlug(plan.countrySlug) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-line bg-cream p-5">
        {country ? (
          <span className="flex h-10 w-15 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-ink">
            {country.iso}
          </span>
        ) : (
          <span className="flex h-10 w-15 shrink-0 items-center justify-center rounded-md bg-orange/10 text-orange">
            <Globe className="size-6" />
          </span>
        )}
        <div className="flex-1">
          <p className="font-semibold text-ink">{country ? names.country(country) : names.planName(plan)}</p>
          <p className="text-sm text-muted">
            {names.data(plan.dataAmountGb)} &middot; {names.validity(plan.validityDays)}
          </p>
        </div>
        <p className="text-lg font-bold text-orange">{names.price(plan.price)}</p>
      </div>

      <Link href="/esim-store" className="inline-block text-sm font-semibold text-orange hover:underline">
        {t("changePlan")}
      </Link>

      <Button onClick={onContinue} size="lg" className="w-full sm:w-auto">
        {t("continue")}
      </Button>
    </div>
  );
}
