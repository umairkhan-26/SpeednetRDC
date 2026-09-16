"use client";

import { useTranslations } from "next-intl";
import { CreditCard, MapPin, QrCode, Plane } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  { icon: MapPin, titleKey: "searchTitle", descriptionKey: "searchDescription" },
  { icon: CreditCard, titleKey: "pickTitle", descriptionKey: "pickDescription" },
  { icon: QrCode, titleKey: "scanTitle", descriptionKey: "scanDescription" },
  { icon: Plane, titleKey: "landTitle", descriptionKey: "landDescription" },
] as const;

export default function StepsSection() {
  const t = useTranslations("home.steps");

  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.titleKey} className="relative rounded-2xl border border-line bg-white p-6">
            <span className="absolute -top-3 left-6 flex size-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
              {i + 1}
            </span>
            <step.icon className="size-7 text-orange" />
            <p className="mt-4 font-semibold text-ink">{t(step.titleKey)}</p>
            <p className="mt-1.5 text-sm text-muted">{t(step.descriptionKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
