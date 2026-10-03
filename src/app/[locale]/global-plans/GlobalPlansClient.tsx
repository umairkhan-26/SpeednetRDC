"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { clsx } from "clsx";
import { getGlobalPlans } from "@/data/plans";
import MultiPlansHero from "@/components/plans/MultiPlansHero";

type Tier = "budget" | "premium";

export default function GlobalPlansClient() {
  const t = useTranslations("globalPlans");
  const [tier, setTier] = useState<Tier>("budget");

  const plans = useMemo(() => getGlobalPlans(tier), [tier]);
  const countriesIncluded = plans[0]?.countriesIncluded ?? [];

  return (
    <div>
      <div className="bg-ink pt-8">
        <div className="container-page flex justify-center">
          <div className="inline-flex rounded-full bg-white/10 p-1">
            {(["budget", "premium"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTier(option)}
                className={clsx(
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  tier === option ? "bg-orange text-white" : "text-white/70 hover:text-white",
                )}
              >
                {t(`${option}.label`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MultiPlansHero
        eyebrow={t(`${tier}.eyebrow`)}
        title={
          <>
            {t(`${tier}.titleStart`)} <span className="text-orange">{t(`${tier}.titleEnd`)}</span>
          </>
        }
        subtitle={t(`${tier}.subtitle`)}
        stats={[
          { label: t("statCountries"), value: `${countriesIncluded.length}+` },
          { label: t("statNetwork"), value: "SpeedNetRDC" },
          { label: t("statSpeed"), value: "4G/5G" },
          { label: t("statPlans"), value: `${plans.length}` },
        ]}
        plans={plans}
        countriesIncluded={countriesIncluded}
        networks={["SpeedNetRDC"]}
      />
    </div>
  );
}
