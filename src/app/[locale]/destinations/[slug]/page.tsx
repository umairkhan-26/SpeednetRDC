import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Radio, ShieldCheck, Signal, Wifi } from "lucide-react";
import { getCountryBySlug, countries } from "@/data/countries";
import { getPlansForCountry } from "@/data/plans";
import PlanCard from "@/components/plans/PlanCard";
import InstallSteps from "@/components/destinations/InstallSteps";
import Accordion from "@/components/ui/Accordion";
import SectionHeading from "@/components/ui/SectionHeading";
import DeviceCompatibilityChecker from "@/components/device-compat/DeviceCompatibilityChecker";
import { getNames } from "@/i18n/get-names";
import { pageMetadata } from "@/i18n/metadata";
import type { FaqItem } from "@/lib/types";

export function generateStaticParams() {
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return pageMetadata(locale, "destinationFallback");
  const names = await getNames(locale);
  return pageMetadata(locale, "destination", { country: names.country(country) });
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const t = await getTranslations({ locale, namespace: "destination" });
  const tCoverage = await getTranslations({ locale, namespace: "coverage" });
  const tTaglines = await getTranslations({ locale, namespace: "taglines" });
  const tFaq = await getTranslations({ locale, namespace: "faq" });
  const names = await getNames(locale);
  const countryName = names.country(country);
  // English keeps the catalogue's tagline; other languages use their own
  // version of it, or a translated default.
  const tagline = !names.localized
    ? country.tagline
    : tTaglines.has(`custom.${country.slug}`)
      ? tTaglines(`custom.${country.slug}`)
      : tTaglines("default", { country: countryName });

  const plans = getPlansForCountry(country.slug);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <Image
          src={country.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
        <div className="container-page relative flex flex-col items-center gap-5 py-16 text-center sm:py-20">
          <span className="flex size-12 items-center justify-center rounded-xl bg-white/95 text-sm font-bold text-ink shadow">
            {country.iso}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{t("title", { country: countryName })}</h1>
          <p className="max-w-lg text-white/70">{tagline}</p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85">
              {t("oneCountry")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85">
              <Signal className="size-3.5" /> {t("networks", { count: country.networkCount })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-ink">
              <Wifi className="size-3.5" /> {country.speed}
            </span>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow={t("plansEyebrow")} title={t("plansTitle")} align="center" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading eyebrow={tCoverage("eyebrow")} title={tCoverage("title")} />
          <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-line bg-cream p-5">
              <p className="text-sm font-semibold text-ink">{tCoverage("countriesCovered", { count: 1 })}</p>
              <p className="mt-3 text-sm text-muted">{countryName}</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-cream p-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Radio className="size-4" /> {tCoverage("availableNetworks")}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {country.networks.map((n) => (
                    <li key={n}>&bull; {n}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-line bg-cream p-5">
                <p className="text-sm font-semibold text-ink">{tCoverage("speed")}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink">
                  <Wifi className="size-3.5" /> {country.speed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow={t("setupEyebrow")} title={t("installTitle")} align="center" />
        <div className="mt-8">
          <InstallSteps />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading eyebrow={t("deviceEyebrow")} title={t("deviceTitle")} align="center" />
          <div className="mt-8">
            <DeviceCompatibilityChecker />
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow={tFaq("eyebrow")} title={tFaq("title")} />
          <div className="mt-6">
            <Accordion items={tFaq.raw("destination") as FaqItem[]} />
          </div>
        </div>
      </section>

      <section className="container-page pb-16 text-center">
        <ShieldCheck className="mx-auto size-6 text-orange" />
        <p className="mt-2 text-sm text-muted">
          {t("needDifferent")}{" "}
          <Link href="/destinations" className="font-semibold text-orange hover:underline">
            {t("browseAll")}
          </Link>
        </p>
      </section>
    </div>
  );
}
