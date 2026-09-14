"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { CreditCard, Lock, Loader2, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCvc,
  isValidExpiry,
} from "@/lib/validation";
import { submitOrder, type CheckoutResult } from "@/lib/api/checkout";
import type { Plan } from "@/lib/types";
import type { PaymentMethod } from "@/lib/store/checkout-store";

const methods: { key: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { key: "card", label: "Credit / debit card", icon: CreditCard },
  { key: "apple-pay", label: "Apple Pay", icon: Smartphone },
  { key: "google-pay", label: "Google Pay", icon: Wallet },
  { key: "paypal", label: "PayPal", icon: Wallet },
];

export default function PaymentStep({
  plan,
  total,
  fullName,
  email,
  method,
  onMethodChange,
  onBack,
  onSuccess,
}: {
  plan: Plan;
  total: number;
  fullName: string;
  email: string;
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onBack: () => void;
  onSuccess: (result: CheckoutResult) => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cardValid = isValidCardNumber(cardNumber);
  const expiryValid = isValidExpiry(expiry);
  const cvcValid = isValidCvc(cvc);
  const cardFormValid = method !== "card" || (cardValid && expiryValid && cvcValid);

  async function handlePay() {
    setTouched(true);
    if (!cardFormValid) return;
    setSubmitting(true);
    const result = await submitOrder({ plan, fullName, email, paymentMethod: method });
    setSubmitting(false);
    onSuccess(result);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Payment</h2>
        <p className="mt-1 text-sm text-muted">Choose how you&apos;d like to pay.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {methods.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onMethodChange(m.key)}
            className={clsx(
              "flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors",
              method === m.key
                ? "border-orange bg-orange text-white"
                : "border-line bg-cream text-ink hover:border-orange/40",
            )}
          >
            <m.icon className="size-4 shrink-0" />
            {m.label}
          </button>
        ))}
      </div>

      {method === "card" && (
        <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
              <CreditCard className="size-4" /> Card number
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
            />
            {touched && !cardValid && <p className="mt-1 text-xs text-red-600">Enter a valid card number.</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Expiry</label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
              />
              {touched && !expiryValid && <p className="mt-1 text-xs text-red-600">Invalid expiry.</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">CVC</label>
              <input
                type="text"
                inputMode="numeric"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
              />
              {touched && !cvcValid && <p className="mt-1 text-xs text-red-600">Invalid CVC.</p>}
            </div>
          </div>
        </div>
      )}

      {method !== "card" && (
        <div className="rounded-2xl border border-line bg-cream p-5 text-sm text-muted">
          You&apos;ll be prompted to confirm with {methods.find((m) => m.key === method)?.label} when you tap
          pay.
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={handlePay} disabled={submitting} className="flex-1">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          Pay &amp; Activate &middot; {formatPrice(total)}
        </Button>
      </div>
    </div>
  );
}
