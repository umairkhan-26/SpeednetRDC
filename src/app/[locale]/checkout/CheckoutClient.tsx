"use client";

import { Link } from "@/i18n/navigation";
import { useCheckoutStore } from "@/lib/store/checkout-store";
import StepIndicator from "@/components/checkout/StepIndicator";
import OrderSummarySidebar from "@/components/checkout/OrderSummarySidebar";
import PlanStep from "@/components/checkout/steps/PlanStep";
import AccountStep from "@/components/checkout/steps/AccountStep";
import PaymentStep from "@/components/checkout/steps/PaymentStep";
import ConfirmationStep from "@/components/checkout/steps/ConfirmationStep";
import { calculateOrderTotals } from "@/lib/pricing";
import { LinkButton } from "@/components/ui/Button";

export default function CheckoutClient() {
  const {
    plan,
    step,
    fullName,
    email,
    paymentMethod,
    result,
    setStep,
    setAccountDetails,
    setPaymentMethod,
    setResult,
  } = useCheckoutStore();

  if (!plan) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">No plan selected yet</h1>
        <p className="max-w-sm text-muted">
          Pick an eSIM plan first, then come back here to check out.
        </p>
        <LinkButton href="/esim-store">Browse eSIM Plans</LinkButton>
      </div>
    );
  }

  const totals = calculateOrderTotals(plan.price);

  return (
    <div className="container-page py-10">
      {step !== "confirmation" && (
        <div className="mb-10">
          <StepIndicator current={step} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          {step === "plan" && <PlanStep plan={plan} onContinue={() => setStep("account")} />}

          {step === "account" && (
            <AccountStep
              fullName={fullName}
              email={email}
              onBack={() => setStep("plan")}
              onContinue={(name, mail) => {
                setAccountDetails(name, mail);
                setStep("payment");
              }}
            />
          )}

          {step === "payment" && (
            <PaymentStep
              plan={plan}
              total={totals.total}
              fullName={fullName}
              email={email}
              method={paymentMethod}
              onMethodChange={setPaymentMethod}
              onBack={() => setStep("account")}
              onSuccess={(checkoutResult) => {
                setResult(checkoutResult);
                setStep("confirmation");
              }}
            />
          )}

          {step === "confirmation" && result && <ConfirmationStep result={result} plan={plan} />}
        </div>

        {step !== "confirmation" && <OrderSummarySidebar plan={plan} />}
      </div>

      {step !== "confirmation" && (
        <p className="mt-8 text-center text-xs text-muted">
          Having trouble? <Link href="/help" className="font-semibold text-orange hover:underline">Get help</Link>
        </p>
      )}
    </div>
  );
}
