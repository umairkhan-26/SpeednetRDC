"use client";

import { useLocale, useTranslations } from "next-intl";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNames } from "@/i18n/use-names";
import { legalPagesLive } from "@/lib/legal";
import SectionHeading from "./SectionHeading";

/** How payment works, the withdrawal-right consent box and the pay button (it submits the checkout form). */
export default function PaymentSection({
  total,
  isTopUp,
  withdrawalConsent,
  onConsentChange,
  submitting,
  error,
}: {
  total: number;
  isTopUp: boolean;
  withdrawalConsent: boolean;
  onConsentChange: (checked: boolean) => void;
  submitting: boolean;
  error: string | null;
}) {
  const locale = useLocale();
  const t = useTranslations("checkout.paymentStep");
  const names = useNames();
  // The withdrawal-right consent box and legal links appear once the legal
  // pages are published (src/lib/legal.ts); the API then requires the box.
  const showLegal = legalPagesLive();

  return (
    <div className="space-y-5">
      <SectionHeading number={3} title={t("title")} subtitle={t("intro")} />

      <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-cream p-4 text-sm text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <p>{t("methods")}</p>
      </div>

      {showLegal && (
        <div className="space-y-3 rounded-2xl border border-line bg-white p-4 text-sm">
          <label className="flex items-start gap-3 text-ink">
            <input
              type="checkbox"
              checked={withdrawalConsent}
              onChange={(e) => onConsentChange(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-orange"
            />
            <span>{t.rich(isTopUp ? "consentTopUp" : "consent", { refunds: (chunks) => (<a href={`/${locale}/refunds`} target="_blank" rel="noopener" className="font-semibold underline hover:text-orange">{chunks}</a>) })}</span>
          </label>
          <p className="text-xs text-muted">
            {t.rich("legal", {
              terms: (chunks) => (
                <a href={`/${locale}/terms`} target="_blank" rel="noopener" className="font-semibold text-ink underline hover:text-orange">
                  {chunks}
                </a>
              ),
              refunds: (chunks) => (
                <a href={`/${locale}/refunds`} target="_blank" rel="noopener" className="font-semibold text-ink underline hover:text-orange">
                  {chunks}
                </a>
              ),
              privacy: (chunks) => (
                <a href={`/${locale}/privacy`} target="_blank" rel="noopener" className="font-semibold text-ink underline hover:text-orange">
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting || (showLegal && !withdrawalConsent)} className="w-full">
        {submitting ? <Loader2 className="size-4 shrink-0 animate-spin" /> : <Lock className="size-4 shrink-0" />}
        {t("pay", { total: names.price(total) })}
      </Button>
    </div>
  );
}
