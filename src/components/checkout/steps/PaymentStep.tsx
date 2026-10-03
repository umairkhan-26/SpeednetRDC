"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { submitOrder } from "@/lib/api/checkout";
import type { Plan } from "@/lib/types";
import { legalPagesLive } from "@/lib/legal";

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
      setError(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Payment</h2>
        <p className="mt-1 text-sm text-muted">
          You&apos;ll enter your card details on Stripe&apos;s secure checkout page &mdash; we never see or
          store your card number.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-cream p-5 text-sm text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <p>
          Card, Apple Pay, Google Pay, and other methods enabled on our account will be offered on the next
          screen. Payment is processed by Stripe; nothing is charged until you confirm there.
        </p>
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
            <span>
              I want my eSIM delivered immediately after payment, and I understand that I lose my 14-day right of withdrawal once it has been
              delivered.
            </span>
          </label>
          <p className="text-xs text-muted">
            By continuing you agree to our{" "}
            <a href={`/${locale}/terms`} target="_blank" rel="noopener" className="font-semibold text-ink underline hover:text-orange">
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a href={`/${locale}/refunds`} target="_blank" rel="noopener" className="font-semibold text-ink underline hover:text-orange">
              Refund Policy
            </a>
            . Read how we use your data in our{" "}
            <a href={`/${locale}/privacy`} target="_blank" rel="noopener" className="font-semibold text-ink underline hover:text-orange">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={handlePay} disabled={submitting || (showLegal && !withdrawalConsent)} className="flex-1">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          Continue to secure payment &middot; {formatPrice(total)}
        </Button>
      </div>
    </div>
  );
}
