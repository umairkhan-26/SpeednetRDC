import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCountryBySlug } from "@/data/countries";
import { getPlanById } from "@/data/plans";
import { getTranslations } from "next-intl/server";
import { getNames } from "@/i18n/get-names";
import { pageMetadata } from "@/i18n/metadata";
import PlanDetailView from "@/components/plans/PlanDetailView";
import { isEsimCheckoutEnabled } from "@/lib/checkout/availability";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; planId: string; locale: string }>;
}): Promise<Metadata> {
  const { planId, locale } = await params;
  const plan = getPlanById(planId);
  if (!plan) return pageMetadata(locale, "planFallback");
  const names = await getNames(locale);
  return { title: `${names.planName(plan)} — SpeedNetRDC` };
}

export default async function CountryPlanDetailPage({
  params,
}: {
  params: Promise<{ slug: string; planId: string; locale: string }>;
}) {
  const { slug, planId, locale } = await params;
  const country = getCountryBySlug(slug);
  const plan = getPlanById(planId);
  if (!country || !plan || plan.countrySlug !== slug) notFound();
  const t = await getTranslations({ locale, namespace: "planDetail" });
  const names = await getNames(locale);

  return (
    <PlanDetailView
      plan={plan}
      salesPaused={!isEsimCheckoutEnabled()}
      title={t("title", { area: names.country(country) })}
      subtitle={`${names.data(plan.dataAmountGb)} · ${names.validity(plan.validityDays)}`}
      iconSlot={
        <span className="flex h-10 w-[3.75rem] shrink-0 items-center justify-center rounded-md bg-cream text-xs font-bold text-ink">
          {country.iso}
        </span>
      }
    />
  );
}
