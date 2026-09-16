"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { getGlobalPlans } from "@/data/plans";
import MultiPlansHero from "@/components/plans/MultiPlansHero";

type Tier = "budget" | "premium";

const TIER_COPY: Record<Tier, { label: string; eyebrow: string; title: React.ReactNode; subtitle: string }> = {
  budget: {
    label: "Global",
    eyebrow: "Global eSIM",
    title: (
      <>
        One eSIM. <span className="text-orange">The World Is Yours.</span>
      </>
    ),
    subtitle: "Our everyday global plan — broad coverage at the lowest price per GB.",
  },
  premium: {
    label: "Global Plus",
    eyebrow: "Global Plus eSIM",
    title: (
      <>
        Global Plus. <span className="text-orange">Wider Coverage, Faster Networks.</span>
      </>
    ),
    subtitle: "Our premium global tier — broader carrier coverage for travelers who need it everywhere.",
  },
};

export default function GlobalPlansClient() {
  const [tier, setTier] = useState<Tier>("budget");

  const plans = useMemo(() => getGlobalPlans(tier), [tier]);
  const countriesIncluded = plans[0]?.countriesIncluded ?? [];
  const copy = TIER_COPY[tier];

  return (
    <div>
      <div className="bg-ink pt-8">
        <div className="container-page flex justify-center">
          <div className="inline-flex rounded-full bg-white/10 p-1">
            {(["budget", "premium"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={clsx(
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  tier === t ? "bg-orange text-white" : "text-white/70 hover:text-white",
                )}
              >
                {TIER_COPY[t].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MultiPlansHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        stats={[
          { label: "Countries covered", value: `${countriesIncluded.length}+` },
          { label: "Network", value: "SpeedNetRDC" },
          { label: "Speed", value: "4G/5G" },
          { label: "Plans", value: `${plans.length}` },
        ]}
        plans={plans}
        countriesIncluded={countriesIncluded}
        networks={["SpeedNetRDC"]}
      />
    </div>
  );
}
