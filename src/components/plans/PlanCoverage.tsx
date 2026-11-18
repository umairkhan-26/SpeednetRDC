"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { WifiOff } from "lucide-react";
import type { Plan } from "@/lib/types";
import { useNames } from "@/i18n/use-names";
import { coveredPlaces, leftOutPlaces, type Place } from "@/lib/plan-coverage";

/** Chips shown before "+N more" (the rest open on tap). */
const COLLAPSED_COUNT = 8;

function Chips({ places, tone }: { places: Place[]; tone: "covered" | "left" }) {
  const t = useTranslations("coverage");
  const names = useNames();
  const [open, setOpen] = useState(false);
  const hidden = places.length - COLLAPSED_COUNT;
  const shown = open || hidden <= 0 ? places : places.slice(0, COLLAPSED_COUNT);
  const chip =
    tone === "covered"
      ? "rounded-full border border-line bg-cream px-2.5 py-1 text-xs font-medium text-ink"
      : "rounded-full border border-dashed border-line px-2.5 py-1 text-xs text-muted";

  return (
    <ul className={`mt-2 flex flex-wrap gap-1.5 ${open ? "max-h-44 overflow-y-auto pr-1" : ""}`}>
      {shown.map((p) => (
        <li key={`${p.iso ?? ""}-${p.name}`} className={chip}>
          {names.country({ name: p.name, iso: p.iso ?? "" })}
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-orange hover:underline"
          >
            {open ? t("showLess") : t("showMore", { count: hidden })}
          </button>
        </li>
      )}
    </ul>
  );
}

/**
 * Where a plan works, shown next to the Buy button and in the checkout summary:
 * the countries it covers, for regional and global plans the nearby places it
 * leaves out, and a plain sentence that there is no internet anywhere else.
 */
export default function PlanCoverage({ plan }: { plan: Plan }) {
  const t = useTranslations("coverage");
  const names = useNames();
  const covered = useMemo(() => coveredPlaces(plan), [plan]);
  const leftOut = useMemo(() => leftOutPlaces(plan), [plan]);

  if (covered.length === 0) return null;

  if (covered.length === 1) {
    const only = names.country({ name: covered[0].name, iso: covered[0].iso ?? "" });
    return (
      <div>
        <p className="text-sm font-semibold text-ink">{t("worksOnly", { country: only })}</p>
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-orange/5 px-3 py-2.5 text-sm font-medium text-ink">
          <WifiOff className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden />
          {t("noInternetSingle", { country: only })}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink">{t("worksIn", { count: covered.length })}</p>
      <Chips places={covered} tone="covered" />

      {leftOut.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("notIncluded")}</p>
          <p className="mt-1 text-xs text-muted">{t("notIncludedHint")}</p>
          <Chips places={leftOut} tone="left" />
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-orange/5 px-3 py-2.5 text-sm font-medium text-ink">
        <WifiOff className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden />
        {t("noInternet")}
      </p>
    </div>
  );
}
