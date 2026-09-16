import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { getPlanById } from "@/data/plans";
import { formatData, formatValidity } from "@/lib/format";
import PlanDetailView from "@/components/plans/PlanDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const plan = getPlanById(planId);
  return { title: plan ? `${plan.name} — SpeedNetRDC` : "Plan — SpeedNetRDC" };
}

export default async function GlobalPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const plan = getPlanById(planId);
  if (!plan || plan.scope !== "global") notFound();

  return (
    <PlanDetailView
      plan={plan}
      title={plan.globalTier === "premium" ? "Global Plus eSIM" : "Global eSIM"}
      subtitle={`${formatData(plan.dataAmountGb)} · ${formatValidity(plan.validityDays)}`}
      iconSlot={
        <span className="flex h-10 w-[3.75rem] shrink-0 items-center justify-center rounded-md bg-orange/10 text-orange">
          <Globe className="size-6" />
        </span>
      }
    />
  );
}
