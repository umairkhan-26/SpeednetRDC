import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCountryBySlug } from "@/data/countries";
import { getPlanById } from "@/data/plans";
import { formatData, formatValidity } from "@/lib/format";
import PlanDetailView from "@/components/plans/PlanDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const plan = getPlanById(planId);
  return { title: plan ? `${plan.name} — SpeedNetRDC` : "Plan — SpeedNetRDC" };
}

export default async function CountryPlanDetailPage({
  params,
}: {
  params: Promise<{ slug: string; planId: string }>;
}) {
  const { slug, planId } = await params;
  const country = getCountryBySlug(slug);
  const plan = getPlanById(planId);
  if (!country || !plan || plan.countrySlug !== slug) notFound();

  return (
    <PlanDetailView
      plan={plan}
      title={`${country.name} eSIM`}
      subtitle={`${formatData(plan.dataAmountGb)} · ${formatValidity(plan.validityDays)}`}
      iconSlot={
        <span className="flex h-10 w-[3.75rem] shrink-0 items-center justify-center rounded-md bg-cream text-xs font-bold text-ink">
          {country.iso}
        </span>
      }
    />
  );
}
