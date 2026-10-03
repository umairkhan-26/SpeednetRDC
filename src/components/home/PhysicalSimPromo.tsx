"use client";

import { useTranslations } from "next-intl";
import { CreditCard, Truck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { SHIPPING_PRICE_EUR, SIM_CARD_PRICE_EUR } from "@/components/physical-sim/facts";

/** Homepage pointer to the (coming soon) SIM card for phones without eSIM. */
export default function PhysicalSimPromo() {
  const t = useTranslations("homePhysicalSim");
  return (
    <section className="container-page py-12">
      <div className="flex flex-col gap-6 rounded-3xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="flex items-start gap-5">
          <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
            <CreditCard className="size-7 text-orange" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange">{t("eyebrow")}</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{t("title")}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">{t("text")}</p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Truck className="size-4 text-orange" />
              {t("price", { sim: SIM_CARD_PRICE_EUR, shipping: SHIPPING_PRICE_EUR })}
            </p>
          </div>
        </div>
        <LinkButton href="/physical-sim" size="lg" className="shrink-0">
          {t("cta")}
        </LinkButton>
      </div>
    </section>
  );
}
