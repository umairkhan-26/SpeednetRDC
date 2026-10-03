import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { regions } from "@/data/regions";
import Flag from "@/components/ui/Flag";
import { Globe } from "lucide-react";
import { getNames } from "@/i18n/get-names";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "regionalPlans");
}

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

export default async function RegionalPlansPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "regionalPlans" });
  const names = await getNames(locale);

  return (
    <div className="container-page py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
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
              <p className="font-semibold text-ink">{names.region(region.slug, region.name)}</p>
              <p className="text-sm text-muted">{t("countries", { count: region.countryCount })}</p>
              <p className="mt-1 text-sm font-semibold text-orange">{t("from", { price: names.price(region.fromPrice) })}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
