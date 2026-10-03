"use client";

import { useTranslations } from "next-intl";
import { Clock, CreditCard, Mail, MapPin, Package, Smartphone, Truck } from "lucide-react";
import { useNames } from "@/i18n/use-names";
import { CONTACT_EMAIL, SHIPPING_PRICE_EUR, SIM_CARD_PRICE_EUR } from "@/components/physical-sim/facts";

const STEPS = [
  { icon: Truck, key: "ship" },
  { icon: Smartphone, key: "insert" },
  { icon: CreditCard, key: "data" },
] as const;

const FAQ = ["what", "phones", "price", "shipping", "when"] as const;

export default function PhysicalSimView() {
  const t = useTranslations("physicalSim");
  const names = useNames();
  const prices = { sim: SIM_CARD_PRICE_EUR, shipping: SHIPPING_PRICE_EUR };
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("contactSubject"))}`;
  const faqValues: Record<(typeof FAQ)[number], Record<string, string | number>> = {
    what: {},
    phones: {},
    price: prices,
    shipping: {},
    when: { email: CONTACT_EMAIL },
  };

  return (
    <div className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-muted">{t("subtitle")}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(
              [
                [MapPin, "shipsFrom"],
                [Package, "delivery"],
                [Smartphone, "unlocked"],
                [CreditCard, "data"],
              ] as const
            ).map(([Icon, key]) => (
              <div key={key} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-orange" />
                <p className="text-sm font-semibold text-ink">{t(`features.${key}`)}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold text-ink">{t("howTitle")}</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.key} className="relative rounded-2xl border border-line bg-white p-5">
                <span className="absolute -top-3 left-5 flex size-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {i + 1}
                </span>
                <step.icon className="size-6 text-orange" />
                <p className="mt-3 font-semibold text-ink">{t(`steps.${step.key}Title`)}</p>
                <p className="mt-1 text-sm text-muted">{t(`steps.${step.key}Text`)}</p>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 text-xl font-bold text-ink">{t("faqTitle")}</h2>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
            {FAQ.map((key) => (
              <details key={key} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {t(`faq.${key}Q`)}
                    <span className="text-orange transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(`faq.${key}A`, faqValues[key])}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="h-max rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("priceTitle")}</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t("simLine")}</dt>
              <dd className="font-medium text-ink">{names.price(SIM_CARD_PRICE_EUR)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t("shippingLine")}</dt>
              <dd className="font-medium text-ink">{names.price(SHIPPING_PRICE_EUR)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="font-semibold text-ink">{t("total")}</span>
            <span className="text-2xl font-bold text-orange">{names.price(SIM_CARD_PRICE_EUR + SHIPPING_PRICE_EUR)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{t("taxNote")}</p>

          <div className="mt-6 rounded-xl bg-orange/5 p-4">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <Clock className="size-4 text-orange" />
              {t("comingSoonTitle")}
            </p>
            <p className="mt-1.5 text-sm text-muted">{t("comingSoonText")}</p>
          </div>
          <a
            href={mailto}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-orange px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-orange-soft"
          >
            <Mail className="size-4" />
            {t("contactButton")}
          </a>
          <p className="mt-2 text-center text-xs text-muted">{CONTACT_EMAIL}</p>
        </aside>
      </div>
    </div>
  );
}
