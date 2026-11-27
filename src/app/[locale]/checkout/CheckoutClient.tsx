"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCheckoutStore } from "@/lib/store/checkout-store";
import OrderSummarySidebar from "@/components/checkout/OrderSummarySidebar";
import PlanSection from "@/components/checkout/PlanSection";
import DetailsSection from "@/components/checkout/DetailsSection";
import PaymentSection from "@/components/checkout/PaymentSection";
import { calculateOrderTotals } from "@/lib/pricing";
import { LinkButton } from "@/components/ui/Button";
import { ESIM_CHECKOUT_PAUSED_ERROR } from "@/lib/checkout/availability";
import { submitOrder } from "@/lib/api/checkout";
import type { CheckoutCustomer } from "@/lib/customer/checkout-customer";
import { legalPagesLive } from "@/lib/legal";
import { hasConsent } from "@/lib/consent";
import { readMetaBrowserIds, trackMeta } from "@/lib/meta/pixel";
import { trackBeginCheckout } from "@/lib/tracking/events";
import { isValidEmail, isValidFullName } from "@/lib/validation";
import type { Plan } from "@/lib/types";
import type { SocialProvider } from "@/lib/customer/social/providers";

// The checkout API's messages (English) mapped to translations; anything
// unrecognised shows the generic "couldn't start checkout" message.
const API_ERRORS: Record<string, string> = {
  [ESIM_CHECKOUT_PAUSED_ERROR]: "errorPaused",
  "Enter a valid name and email address": "errorDetails",
  "Unknown plan": "errorPlan",
  "Please tick the box to confirm immediate delivery of your eSIM.": "errorConsent",
  "Adding a plan to an existing SIM isn't available yet.": "errorTopUpUnavailable",
  "Too many attempts. Please try again later.": "errorTooMany",
  "We couldn't find that SIM. Check the number printed on your SIM card.": "errorSimNotFound",
};

const CARD = "rounded-2xl border border-line bg-white p-5 sm:p-7 lg:col-start-1";

/** The whole checkout on one page: plan, details, order summary and payment. */
export default function CheckoutClient({
  customer,
  providers,
  resume,
  failedProvider,
}: {
  customer: CheckoutCustomer | null;
  /** The "Continue with …" buttons that are switched on. */
  providers: SocialProvider[];
  /** Back from Google or Apple: the plan the visitor was buying (the page was reloaded, so the store is empty). */
  resume: { plan: Plan; topUp: boolean } | null;
  failedProvider: string | null;
}) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { plan, fullName: typedName, email: typedEmail, mode, topUpIccid, setAccountDetails } = useCheckoutStore();
  const [editingAccount, setEditingAccount] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [withdrawalConsent, setWithdrawalConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startCheckout = useCheckoutStore((s) => s.startCheckout);

  useEffect(() => {
    if (!useCheckoutStore.getState().plan && resume) startCheckout(resume.plan, resume.topUp ? "topup" : "new");
  }, [resume, startCheckout]);

  // The plan is on its way into the store: don't flash "no plan chosen".
  if (!plan && resume) return <div className="container-page py-24" aria-busy="true" />;

  if (!plan) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">{t("noPlanTitle")}</h1>
        <p className="max-w-sm text-muted">{t("noPlanText")}</p>
        <LinkButton href="/esim-store">{t("browsePlans")}</LinkButton>
      </div>
    );
  }

  const totals = calculateOrderTotals(plan.price);
  const isTopUp = mode === "topup";
  const account = editingAccount ? null : customer;
  const fullName = account?.fullName ?? typedName;
  const email = account?.email ?? typedEmail;

  function editAccount() {
    setAccountDetails(fullName, email);
    setEditingAccount(true);
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!plan || submitting || (legalPagesLive() && !withdrawalConsent)) return;
    setError(null);
    setShowErrors(true);

    // Point at the first thing still missing, top of the page first.
    if (isTopUp && !topUpIccid) {
      document.getElementById("checkout-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const invalid = !isValidFullName(fullName) ? "checkout-name" : !isValidEmail(email) ? "checkout-email" : null;
    if (invalid) {
      document.getElementById(invalid)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      trackMeta("InitiateCheckout", { content_ids: [plan.id], content_type: "product", num_items: 1, value: totals.total, currency: "EUR" });
      trackBeginCheckout({ contentId: plan.id, contentName: plan.name, value: totals.total, currency: "EUR" });
      const meta = hasConsent("meta") ? { consent: true as const, ...readMetaBrowserIds() } : undefined;
      const session = await submitOrder({ plan, fullName, email, locale, withdrawalConsent, meta, topUpIccid: isTopUp ? topUpIccid : null });
      window.location.href = session.url;
    } catch (err) {
      setSubmitting(false);
      setError(t(`paymentStep.${API_ERRORS[err instanceof Error ? err.message : ""] ?? "errorGeneric"}`));
    }
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">{t("title")}</h1>

      {/* On phones the order summary sits just above payment; on wide screens it stays beside all three parts. */}
      <form noValidate onSubmit={handlePay} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_auto_1fr] lg:gap-x-8">
        <section id="checkout-plan" className={`${CARD} scroll-mt-24 lg:row-start-1`}>
          <PlanSection plan={plan} simError={showErrors && isTopUp && !topUpIccid ? t("paymentStep.errorChooseSim") : null} />
        </section>

        <section className={`${CARD} lg:row-start-2`}>
          <DetailsSection
            account={account}
            onEditAccount={editAccount}
            fullName={fullName}
            email={email}
            onChange={setAccountDetails}
            showErrors={showErrors}
            signIn={customer ? null : { providers, checkout: { planId: plan.id, topUp: isTopUp }, failedProvider }}
          />
        </section>

        <OrderSummarySidebar plan={plan} className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start" />

        <section className={`${CARD} lg:row-start-3 lg:self-start`}>
          <PaymentSection
            total={totals.total}
            isTopUp={isTopUp}
            withdrawalConsent={withdrawalConsent}
            onConsentChange={setWithdrawalConsent}
            submitting={submitting}
            error={error}
          />
        </section>
      </form>

      <p className="mt-8 text-center text-xs text-muted">
        {t("trouble")}{" "}
        <Link href="/help" className="font-semibold text-orange hover:underline">
          {t("getHelp")}
        </Link>
      </p>
    </div>
  );
}
