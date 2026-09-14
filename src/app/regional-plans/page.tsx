import type { Metadata } from "next";
import Link from "next/link";
import { regions } from "@/data/regions";
import { formatPrice } from "@/lib/format";
import Flag from "@/components/ui/Flag";
import { Globe } from "lucide-react";

export const metadata: Metadata = { title: "Regional Plans — SpeedNetRDC" };

const regionIcons: Record<string, string> = {
  africa: "🌍",
  americas: "🌎",
  asia: "🌏",
  caribbean: "🏝️",
  "latin-america": "🌎",
  "middle-east": "🕌",
  oceania: "🏄",
  "north-america": "🗽",
};

export default function RegionalPlansPage() {
  return (
    <div className="container-page py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">One eSIM for your whole trip</h1>
        <p className="mt-3 text-muted">
          Crossing multiple borders in a region? One plan covers every country in it.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => (
          <Link
            key={region.slug}
            href={`/regional-plans/${region.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {region.slug === "europe" ? (
              <Flag iso="EU" className="h-10 w-14 shrink-0" />
            ) : (
              <span className="flex h-10 w-14 shrink-0 items-center justify-center text-3xl">
                {regionIcons[region.slug] ?? <Globe />}
              </span>
            )}
            <div>
              <p className="font-semibold text-ink">{region.name}</p>
              <p className="text-sm text-muted">{region.countryCount} countries</p>
              <p className="mt-1 text-sm font-semibold text-orange">from {formatPrice(region.fromPrice)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
