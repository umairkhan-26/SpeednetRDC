"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CreditCard, Gift, MapPin, Package, Plane, ShoppingCart, Smartphone, Truck, Wifi } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNames } from "@/i18n/use-names";
import { isValidEmail, isValidFullName } from "@/lib/validation";
import type { PhysicalSimPricing } from "@/lib/physical-sim";

interface Pending {
  inactivityPeriod: string;
  planPriority: string;
  startWindow: string;
  returns: string;
}

const STEPS = [
  { icon: ShoppingCart, key: "order" },
  { icon: Truck, key: "ship" },
  { icon: Smartphone, key: "insert" },
  { icon: CreditCard, key: "buy" },
  { icon: Plane, key: "connect" },
] as const;

const FAQ = ["what", "included", "phones", "shipping", "customs", "keep", "data", "start", "two", "returns"] as const;

/** The SIM card shop: shown instead of PhysicalSimView once PHYSICAL_SIM_ENABLED is on. */
export default function PhysicalSimCheckoutView({
  pricing,
  included,
  pending,
}: {
  pricing: PhysicalSimPricing;
  included: { gb: string; days: number; countries: number };
  pending: Pending;
}) {
  const t = useTranslations("physicalSimShop");
  const locale = useLocale();
  const names = useNames();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const lineLabel = (key: string) => (key === "sim" ? t("simLine", included) : key === "shipping" ? t("shippingLine") : t("feesLine"));
  const taxNote =
    pricing.mode === "vat"
      ? t("taxVat", { vat: names.price(pricing.vatEur) })
      : pricing.mode === "surcharge"
        ? t("taxSurcharge")
        : t("taxFinal", { vat: names.price(pricing.vatEur) });
  const facts = { ...included, total: names.price(pricing.totalEur) };

  async function order(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidFullName(fullName) || !isValidEmail(email)) return setError(t("invalid"));
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout/physical-sim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, locale }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.url) {
        setSubmitting(false);
        return setError(response.status === 400 ? t("invalid") : t("error"));
      }
      window.location.href = body.url;
    } catch {
      setSubmitting(false);
      setError(t("error"));
    }
  }

  const faqValues: Record<(typeof FAQ)[number], Record<string, string | number>> = {
    what: facts,
    included: facts,
    phones: {},
    shipping: {},
    customs: {},
    keep: { period: pending.inactivityPeriod },
    data: {},
    start: { window: pending.startWindow },
    two: { priority: pending.planPriority },
    returns: { returns: pending.returns },
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
                [Gift, "keep"],
              ] as const
            ).map(([Icon, key]) => (
              <div key={key} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-orange" />
                <p className="text-sm font-semibold text-ink">{t(`features.${key}`)}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold text-ink">{t("howTitle")}</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            {pricing.lines.map((line) => (
              <div key={line.key} className="flex items-center justify-between">
                <dt className="text-muted">{lineLabel(line.key)}</dt>
                <dd className="font-medium text-ink">{names.price(line.amountEur)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="font-semibold text-ink">{t("total")}</span>
            <span className="text-2xl font-bold text-orange">{names.price(pricing.totalEur)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{taxNote}</p>

          <form onSubmit={order} className="mt-6 space-y-4">
            <p className="font-semibold text-ink">{t("orderTitle")}</p>
            <div>
              <label htmlFor="sim-name" className="mb-1.5 block text-sm font-medium text-ink">
                {t("nameLabel")}
              </label>
              <input
                id="sim-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
              />
            </div>
            <div>
              <label htmlFor="sim-email" className="mb-1.5 block text-sm font-medium text-ink">
                {t("emailLabel")}
              </label>
              <input
                id="sim-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
              />
              <p className="mt-1 text-xs text-muted">{t("emailHint")}</p>
            </div>
            <p className="flex items-start gap-2 text-xs text-muted">
              <Wifi className="mt-0.5 size-3.5 shrink-0 text-orange" />
              {t("addressNote")} {t("oneSim")}
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t("submitting") : t("submit", { total: names.price(pricing.totalEur) })}
            </Button>
            <p className="text-xs text-muted">{pending.returns}</p>
          </form>
        </aside>
      </div>
    </div>
  );
}
