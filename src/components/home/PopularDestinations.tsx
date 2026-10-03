"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { popularDestinations } from "@/data/popular-destinations";
import SectionHeading from "@/components/ui/SectionHeading";
import DestinationTile from "@/components/destinations/DestinationTile";
import { useNames } from "@/i18n/use-names";

export default function PopularDestinations() {
  const t = useTranslations("home.popularDestinations");
  const names = useNames();

  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        action={
          <Link href="/destinations" className="text-sm font-semibold text-orange hover:underline">
            {t("allDestinations")} →
          </Link>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {popularDestinations.map((d) => (
          <DestinationTile
            key={d.slug}
            href={d.href}
            imageUrl={d.heroImage}
            code={d.iso}
            isGlobal={d.iso === "GLOBAL"}
            name={names.localized ? t(`names.${d.slug}`) : d.name}
            subtitle={names.localized ? t(`subtitles.${d.slug}`) : d.subtitle}
            fromPrice={d.fromPrice}
          />
        ))}
      </div>
    </section>
  );
}
