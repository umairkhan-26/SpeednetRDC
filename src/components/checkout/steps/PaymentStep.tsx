"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNames } from "@/i18n/use-names";
import { ESIM_CHECKOUT_PAUSED_ERROR } from "@/lib/checkout/availability";
import { submitOrder } from "@/lib/api/checkout";
import type { Plan } from "@/lib/types";
import { legalPagesLive } from "@/lib/legal";

// The checkout API's messages (English) mapped to translations; anything
// unrecognised shows the generic "couldn't start checkout" message.
const API_ERRORS: Record<string, string> = {
  [ESIM_CHECKOUT_PAUSED_ERROR]: "errorPaused",
  "Enter a valid name and email address": "errorDetails",
  "Unknown plan": "errorPlan",
  "Please tick the box to confirm immediate delivery of your eSIM.": "errorConsent",
};

function translateCheckoutError(message: string, t: (key: string) => string): string {
  return t(API_ERRORS[message] ?? "errorGeneric");
}

export default function PaymentStep({
  plan,
  total,
  fullName,
  email,
  onBack,
}: {
  plan: Plan;
  total: number;
  fullName: string;
  email: string;
  onBack: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("checkout.paymentStep");
  const names = useNames();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The withdrawal-right consent box and legal links appear once the legal
  // pages are published (src/lib/legal.ts); the API then requires the box.
  const showLegal = legalPagesLive();
  const [withdrawalConsent, setWithdrawalConsent] = useState(false);

  async function handlePay() {
    setError(null);
    setSubmitting(true);
    try {
      const session = await submitOrder({ plan, fullName, email, locale, withdrawalConsent });
      window.location.href = session.url;
    } catch (err) {
      setSubmitting(false);
      setError(translateCheckoutError(err instanceof Error ? err.message : "", t));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("intro")}</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-cream p-5 text-sm text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <p>{t("methods")}</p>
      </div>

      {showLegal && (
        <div className="space-y-3 rounded-2xl border border-line bg-white p-5 text-sm">
          <label className="flex items-start gap-3 text-ink">
            <input
              type="checkbox"
              checked={withdrawalConsent}
              onChange={(e) => setWithdrawalConsent(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-orange"
            />
            <span>{t("consent")}</span>
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

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={submitting}>
          {t("back")}
        </Button>
        <Button type="button" size="lg" onClick={handlePay} disabled={submitting || (showLegal && !withdrawalConsent)} className="flex-1">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {t("pay", { total: names.price(total) })}
        </Button>
      </div>
    </div>
  );
}
