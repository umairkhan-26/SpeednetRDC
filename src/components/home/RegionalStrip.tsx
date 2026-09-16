"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Globe } from "lucide-react";
import { getRegionBySlug } from "@/data/regions";
import { getGlobalPlans } from "@/data/plans";
import { formatPrice } from "@/lib/format";
import SectionHeading from "@/components/ui/SectionHeading";
import Flag from "@/components/ui/Flag";

const FEATURED_REGIONS: { slug: string; icon: string; href: string }[] = [
  { slug: "africa", icon: "🌍", href: "/regional-plans/africa" },
  { slug: "americas", icon: "🌎", href: "/regional-plans/americas" },
  { slug: "asia", icon: "🌏", href: "/regional-plans/asia" },
  { slug: "caribbean", icon: "🏝️", href: "/regional-plans/caribbean" },
  { slug: "europe", icon: "", href: "/regional-plans/europe" },
  { slug: "middle-east", icon: "🕌", href: "/regional-plans/middle-east" },
];

export default function RegionalStrip() {
  const t = useTranslations("home.regionalStrip");
  const tRegions = useTranslations("regions");
  const globalPlans = getGlobalPlans("budget");
  const globalFromPrice = Math.min(...globalPlans.map((p) => p.price));
  const globalCountryCount = globalPlans[0]?.countriesIncluded?.length ?? 0;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          action={
            <Link href="/regional-plans" className="inline-flex items-center gap-1 text-sm font-semibold text-orange hover:underline">
              {t("seeAllRegions")} <ArrowRight className="size-3.5" />
            </Link>
          }
        />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          <Link
            href="/global-plans"
            className="flex flex-col items-center gap-2 rounded-2xl border border-orange/30 bg-orange/5 px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Globe className="size-8 text-orange" />
            <p className="text-sm font-semibold text-ink">{t("global")}</p>
            <p className="text-xs text-muted">{t("countriesCount", { count: globalCountryCount })}</p>
            <p className="text-xs font-semibold text-orange">{t("fromPrice", { price: formatPrice(globalFromPrice) })}</p>
          </Link>

          {FEATURED_REGIONS.map(({ slug, icon, href }) => {
            const region = getRegionBySlug(slug);
            if (!region) return null;
            return (
              <Link
                key={slug}
                href={href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-cream px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-orange/40 hover:shadow-md"
              >
                {slug === "europe" ? <Flag iso="EU" className="h-8 w-12" /> : <span className="text-3xl">{icon}</span>}
                <p className="text-sm font-semibold text-ink">{tRegions(slug as never)}</p>
                <p className="text-xs text-muted">{t("countriesCountPlain", { count: region.countryCount })}</p>
                <p className="text-xs font-semibold text-orange">{t("fromPrice", { price: formatPrice(region.fromPrice) })}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
