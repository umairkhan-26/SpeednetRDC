import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getRegionBySlug, regions } from "@/data/regions";
import { getPlansForRegion } from "@/data/plans";
import MultiPlansHero from "@/components/plans/MultiPlansHero";
import type { RegionSlug } from "@/lib/types";
import { getNames } from "@/i18n/get-names";
import { pageMetadata } from "@/i18n/metadata";

export function generateStaticParams() {
  return regions.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; locale: string }>;
}): Promise<Metadata> {
  const { region: slug, locale } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return pageMetadata(locale, "regionalPlans");
  const names = await getNames(locale);
  return pageMetadata(locale, "regionPlans", { region: names.region(region.slug, region.name) });
}

export default async function RegionPlansPage({ params }: { params: Promise<{ region: string; locale: string }> }) {
  const { region: slug, locale } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const t = await getTranslations({ locale, namespace: "regionPage" });
  const names = await getNames(locale);
  const regionName = names.region(region.slug, region.name);
  const plans = getPlansForRegion(slug as RegionSlug);
  // Plans of a region cover different sets of countries (each card shows its
  // own); the coverage section lists every country at least one of them covers.
  const countriesIncluded = [...new Set(plans.flatMap((p) => p.countriesIncluded ?? []))].sort();

  return (
    <MultiPlansHero
      eyebrow={t("eyebrow", { region: regionName })}
      title={
        <>
          {t("titleStart")} <span className="text-orange">{t("titleEnd", { region: regionName })}</span>
        </>
      }
      subtitle={t("subtitle", { count: region.countryCount, region: regionName })}
      stats={[
        { label: t("statCountries"), value: `${region.countryCount}` },
        { label: t("statNetwork"), value: "SpeedNetRDC" },
        { label: t("statValidity"), value: t("validityRange") },
      ]}
      plans={plans}
      countriesIncluded={countriesIncluded}
      networks={["SpeedNetRDC"]}
    />
  );
}
