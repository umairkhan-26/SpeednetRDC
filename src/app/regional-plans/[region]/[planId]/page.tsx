import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { getPlanById } from "@/data/plans";
import { getRegionBySlug } from "@/data/regions";
import { formatData, formatValidity } from "@/lib/format";
import PlanDetailView from "@/components/plans/PlanDetailView";
import type { RegionSlug } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const plan = getPlanById(planId);
  return { title: plan ? `${plan.name} — SpeedNetRDC` : "Plan — SpeedNetRDC" };
}

export default async function RegionalPlanDetailPage({
  params,
}: {
  params: Promise<{ region: string; planId: string }>;
}) {
  const { region: regionSlug, planId } = await params;
  const region = getRegionBySlug(regionSlug);
  const plan = getPlanById(planId);
  if (!region || !plan || plan.scope !== "regional" || plan.regionSlug !== (regionSlug as RegionSlug)) {
    notFound();
  }

  return (
    <PlanDetailView
      plan={plan}
      title={`${region.name} eSIM`}
      subtitle={`${formatData(plan.dataAmountGb)} · ${formatValidity(plan.validityDays)}`}
      iconSlot={
        <span className="flex h-10 w-[3.75rem] shrink-0 items-center justify-center rounded-md bg-orange/10 text-orange">
          <Globe className="size-6" />
        </span>
      }
    />
  );
}
