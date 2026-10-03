"use client";

import { useLocale, useTranslations } from "next-intl";
import { CreditCard, Smartphone } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useCheckoutStore } from "@/lib/store/checkout-store";
import type { CustomerSimStatus } from "@/lib/sims/customer-sims";

function formatKb(kb: number | null): string {
  if (kb === null) return "—";
  if (kb >= 1024 * 1024) return `${+(kb / 1024 / 1024).toFixed(2)} GB`;
  if (kb >= 1024) return `${Math.round(kb / 1024)} MB`;
  return `${kb} KB`;
}

/** Each of the customer's SIMs with the plans on it, and "Buy more data" (which preselects that SIM). */
export default function MySims({ sims }: { sims: CustomerSimStatus[] }) {
  const t = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const suggestTopUp = useCheckoutStore((s) => s.suggestTopUp);
  if (sims.length === 0) return null;

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const formatTime = (iso: string) => new Date(iso).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-ink">{t("mySimsTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("mySimsSubtitle")}</p>
      <ul className="mt-4 space-y-4">
        {sims.map((sim) => (
          <li key={sim.iccid} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
                  {sim.simType === "physical" ? <CreditCard className="size-5" /> : <Smartphone className="size-5" />}
                </span>
                <div>
                  <p className="font-semibold text-ink">
                    {sim.simType === "physical" ? t("simCard") : t("esim")} {t("ending", { digits: sim.iccid.slice(-4) })}
                  </p>
                  <p className="font-mono text-xs text-muted">{sim.iccid}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  suggestTopUp(sim.iccid);
                  router.push("/esim-store");
                }}
                className="rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-soft"
              >
                {t("buyMore")}
              </button>
            </div>

            {sim.plans.length === 0 ? (
              <p className="mt-4 text-sm text-muted">{t("noPlan")}</p>
            ) : (
              <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
                {sim.plans.map((plan, i) => (
                  <li key={`${plan.name}-${i}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{plan.name}</p>
                      <p className="text-xs text-muted">{plan.state === "active" ? t("planActive") : t("planWaiting")}</p>
                    </div>
                    <div className="text-right text-xs text-muted">
                      {plan.dataTotalKb !== null && <p>{t("dataLeft", { left: formatKb(plan.dataRemainingKb ?? plan.dataTotalKb), total: formatKb(plan.dataTotalKb) })}</p>}
                      {plan.expiresAt && <p>{t("expires", { date: formatDate(plan.expiresAt) })}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {sim.checkedAt && <p className="mt-2 text-xs text-muted">{t("checkedAt", { time: formatTime(sim.checkedAt) })}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
