import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRegionBySlug, regions } from "@/data/regions";
import { getPlansForRegion } from "@/data/plans";
import MultiPlansHero from "@/components/plans/MultiPlansHero";
import type { RegionSlug } from "@/lib/types";

export function generateStaticParams() {
  return regions.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region: slug } = await params;
  const region = getRegionBySlug(slug);
  return { title: region ? `${region.name} Plans — SpeedNetRDC` : "Regional Plans — SpeedNetRDC" };
}

export default async function RegionPlansPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const plans = getPlansForRegion(slug as RegionSlug);
  const countriesIncluded = plans[0]?.countriesIncluded ?? [];

  return (
    <MultiPlansHero
      eyebrow={`${region.name} eSIM`}
      title={
        <>
          One eSIM. <span className="text-orange">All of {region.name}.</span>
        </>
      }
      subtitle={`A single plan that works across ${region.countryCount} countries in ${region.name} — no swapping SIMs between borders.`}
      stats={[
        { label: "Countries covered", value: `${region.countryCount}` },
        { label: "Network", value: "SpeedNetRDC" },
        { label: "Speed", value: "4G/5G" },
        { label: "Validity", value: "3–30 days" },
      ]}
      plans={plans}
      countriesIncluded={countriesIncluded}
      networks={["SpeedNetRDC"]}
    />
  );
}
