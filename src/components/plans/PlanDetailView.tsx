"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Clock, Database, Network, ShieldCheck, Signal, Smartphone, Undo2, Wifi } from "lucide-react";
import type { Plan } from "@/lib/types";
import { useCheckoutStore } from "@/lib/store/checkout-store";
import { LinkButton, Button } from "@/components/ui/Button";
import { EsimSalesPausedNotice } from "@/components/checkout/EsimSalesPaused";
import { useNames } from "@/i18n/use-names";

export default function PlanDetailView({
  plan,
  title,
  subtitle,
  iconSlot,
  salesPaused,
}: {
  plan: Plan;
  title: string;
  subtitle: string;
  iconSlot: React.ReactNode;
  salesPaused: boolean;
}) {
  const t = useTranslations("planDetail");
  const tCoverage = useTranslations("coverage");
  const names = useNames();
  const router = useRouter();
  const startCheckout = useCheckoutStore((s) => s.startCheckout);

  function handleBuy() {
    startCheckout(plan);
    router.push("/checkout");
  }

  return (
    <div className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center gap-4">
            {iconSlot}
            <div>
              <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
              <p className="text-sm text-muted">{subtitle}</p>
            </div>
          </div>

          {plan.countriesIncluded && plan.countriesIncluded.length > 1 && (
            <div className="mt-8 rounded-2xl border border-line bg-cream p-5">
              <p className="text-sm font-semibold text-ink">{tCoverage("countriesCovered", { count: plan.countriesIncluded.length })}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{plan.countriesIncluded.join(", ")}</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoTile icon={Database} label={t("dataAllowance")} value={names.data(plan.dataAmountGb)} />
            <InfoTile icon={Signal} label={t("validity")} value={names.validity(plan.validityDays)} />
            <InfoTile icon={Network} label={t("network")} value={plan.network} />
            <InfoTile icon={Wifi} label={t("speed")} value={plan.speed} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoTile icon={Wifi} label={t("hotspot")} value={plan.hotspot ? t("supported") : t("notSupported")} />
            <InfoTile icon={Clock} label={t("activationPolicy")} value={t("activationPolicyValue")} />
            <InfoTile icon={Smartphone} label={t("supportedDevices")} value={t("supportedDevicesValue")} />
            <InfoTile icon={Undo2} label={t("refunds")} value={t("refundsValue")} />
          </div>
        </div>

        <aside className="h-max rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("totalPrice")}</p>
          <p className="mt-1 text-3xl font-bold text-orange">{names.price(plan.price)}</p>

          {salesPaused ? (
            <EsimSalesPausedNotice />
          ) : (
            <Button onClick={handleBuy} className="mt-6 w-full" size="lg">
              {t("buy")}
            </Button>
          )}
          <LinkButton href="/device-compatibility" variant="outline" size="lg" className="mt-3 w-full">
            {t("checkDevice")}
          </LinkButton>

          {!salesPaused && (
            <div className="mt-5 flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="size-4 text-orange" />
              {t("instantSecure")}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <Icon className="size-4 text-orange" />
      <p className="mt-2 text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
