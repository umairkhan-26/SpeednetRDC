"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Circle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import DestinationSearch from "./DestinationSearch";

export default function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(240,97,4,0.25),_transparent_60%)]" />
      <div className="container-page relative flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
          {t("titleLine1")} <span className="text-orange">{t("titleLine2")}</span>
        </h1>
        <p className="max-w-xl text-base text-white/70 sm:text-lg">{t("subtitle")}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/esim-store" size="lg">
            {t("explorePlans")} <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton href="/how-it-works" variant="outline-light" size="lg">
            <Circle className="size-3 fill-current" /> {t("howItWorks")}
          </LinkButton>
        </div>

        <div className="mt-6 w-full">
          <DestinationSearch />
        </div>
      </div>
    </section>
  );
}
