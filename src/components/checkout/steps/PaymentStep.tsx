"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { submitOrder } from "@/lib/api/checkout";
import type { Plan } from "@/lib/types";

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

  async function handlePay() {
    setError(null);
    setSubmitting(true);
    try {
      const session = await submitOrder({ plan, fullName, email, locale });
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

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={handlePay} disabled={submitting} className="flex-1">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          Continue to secure payment &middot; {formatPrice(total)}
        </Button>
      </div>
    </div>
  );
}
