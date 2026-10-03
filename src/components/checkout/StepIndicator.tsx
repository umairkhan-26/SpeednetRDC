"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { clsx } from "clsx";
import type { CheckoutStep } from "@/lib/store/checkout-store";

// "confirmation" is shown here purely as the visual endpoint of the
// flow — it's no longer a CheckoutStep the store tracks, since payment
// success now lands on its own route (/checkout/success) after a real
// Stripe redirect, rather than being a step within this SPA flow.
const steps: (CheckoutStep | "confirmation")[] = ["plan", "account", "payment", "confirmation"];

export default function StepIndicator({ current }: { current: CheckoutStep }) {
  const t = useTranslations("checkout.steps");
  const currentIndex = steps.findIndex((s) => s === current);

  return (
    <ol className="flex items-center justify-between gap-2">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  done && "bg-orange text-white",
                  active && "bg-ink text-white",
                  !done && !active && "bg-ink/10 text-muted",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={clsx(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-ink" : "text-muted",
                )}
              >
                {t(step)}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={clsx("h-px flex-1", done ? "bg-orange" : "bg-line")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
