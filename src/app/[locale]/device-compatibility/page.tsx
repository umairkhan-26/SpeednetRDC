import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Smartphone, Unlock, Wifi } from "lucide-react";
import DeviceCompatibilityChecker from "@/components/device-compat/DeviceCompatibilityChecker";

import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "deviceCompatibility");
}

const infoCards = [
  { key: "capable", icon: Smartphone },
  { key: "unlocked", icon: Unlock },
  { key: "wifi", icon: Wifi },
] as const;

export default async function DeviceCompatibilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "devicePage" });
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
      </div>

      <div className="mt-10">
        <DeviceCompatibilityChecker />
      </div>

      <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-3">
        {infoCards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-line bg-white p-5">
            <card.icon className="size-6 text-orange" />
            <p className="mt-3 text-sm font-semibold text-ink">{t(`cards.${card.key}.title`)}</p>
            <p className="mt-1 text-sm text-muted">{t(`cards.${card.key}.description`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
