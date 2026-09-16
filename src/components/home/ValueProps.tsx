"use client";

import { useTranslations } from "next-intl";
import { Headset, RefreshCcw, ShieldCheck, Zap } from "lucide-react";

const props = [
  { icon: Zap, titleKey: "instantDeliveryTitle", descriptionKey: "instantDeliveryDescription" },
  { icon: ShieldCheck, titleKey: "securePaymentsTitle", descriptionKey: "securePaymentsDescription" },
  { icon: RefreshCcw, titleKey: "topUpTitle", descriptionKey: "topUpDescription" },
  { icon: Headset, titleKey: "supportTitle", descriptionKey: "supportDescription" },
] as const;

export default function ValueProps() {
  const t = useTranslations("home.valueProps");

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {props.map((p) => (
          <div key={p.titleKey} className="flex flex-col items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <p.icon className="size-5" />
            </span>
            <p className="font-semibold text-ink">{t(p.titleKey)}</p>
            <p className="text-sm text-muted">{t(p.descriptionKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
