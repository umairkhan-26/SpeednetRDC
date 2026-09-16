import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Radio, ShieldCheck, Signal, Wifi } from "lucide-react";
import { getCountryBySlug, countries } from "@/data/countries";
import { getPlansForCountry } from "@/data/plans";
import { destinationFaqs } from "@/data/faqs";
import PlanCard from "@/components/plans/PlanCard";
import InstallSteps from "@/components/destinations/InstallSteps";
import Accordion from "@/components/ui/Accordion";
import SectionHeading from "@/components/ui/SectionHeading";
import DeviceCompatibilityChecker from "@/components/device-compat/DeviceCompatibilityChecker";

export function generateStaticParams() {
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  return { title: country ? `${country.name} eSIM — SpeedNetRDC` : "Destination — SpeedNetRDC" };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

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
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {country.name} eSIM
          </h1>
          <p className="max-w-lg text-white/70">{country.tagline}</p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85">
              1 country covered
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85">
              <Signal className="size-3.5" /> {country.networkCount} network{country.networkCount > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-ink">
              <Wifi className="size-3.5" /> {country.speed}
            </span>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Plans" title="Choose your plan" align="center" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Coverage" title="Coverage & networks" />
          <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-line bg-cream p-5">
              <p className="text-sm font-semibold text-ink">Countries covered (1)</p>
              <p className="mt-3 text-sm text-muted">{country.name}</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-cream p-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Radio className="size-4" /> Available networks
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {country.networks.map((n) => (
                    <li key={n}>&bull; {n}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-line bg-cream p-5">
                <p className="text-sm font-semibold text-ink">Speed</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink">
                  <Wifi className="size-3.5" /> {country.speed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Setup" title="Installation in five steps" align="center" />
        <div className="mt-8">
          <InstallSteps />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Device check" title="Is your phone compatible?" align="center" />
          <div className="mt-8">
            <DeviceCompatibilityChecker />
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-6">
            <Accordion items={destinationFaqs} />
          </div>
        </div>
      </section>

      <section className="container-page pb-16 text-center">
        <ShieldCheck className="mx-auto size-6 text-orange" />
        <p className="mt-2 text-sm text-muted">
          Need a different country? <Link href="/destinations" className="font-semibold text-orange hover:underline">Browse all destinations</Link>
        </p>
      </section>
    </div>
  );
}
