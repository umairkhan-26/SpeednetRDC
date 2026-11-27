"use client";

import { useTranslations } from "next-intl";
import { UserCheck } from "lucide-react";
import { isValidEmail, isValidFullName } from "@/lib/validation";
import type { CheckoutCustomer } from "@/lib/customer/checkout-customer";
import SectionHeading from "./SectionHeading";

const INPUT = "w-full scroll-mt-28 rounded-lg border border-line px-4 py-3 text-base outline-none focus:border-orange sm:text-sm";

export default function DetailsSection({
  account,
  onEditAccount,
  fullName,
  email,
  onChange,
  showErrors,
}: {
  /** The signed-in customer, unless they chose to type other details. */
  account: CheckoutCustomer | null;
  onEditAccount: () => void;
  fullName: string;
  email: string;
  onChange: (fullName: string, email: string) => void;
  /** True once pay was pressed. */
  showErrors: boolean;
}) {
  const t = useTranslations("checkout.accountStep");
  // Signed in: only ask for what we don't know already.
  const askName = !account?.fullName;
  const askEmail = !account;

  return (
    <div className="space-y-5">
      <SectionHeading number={2} title={t("title")} subtitle={t("subtitle")} />

      {account && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-cream p-4">
          <div className="flex min-w-0 items-start gap-3">
            <UserCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-muted">{t("signedIn")}</p>
              {account.fullName && <p className="break-words font-semibold text-ink">{account.fullName}</p>}
              <p className="break-all text-sm text-ink">
                <bdi dir="ltr">{account.email}</bdi>
              </p>
            </div>
          </div>
          <button type="button" onClick={onEditAccount} className="text-sm font-semibold text-orange hover:underline">
            {t("change")}
          </button>
        </div>
      )}

      {(askName || askEmail) && (
        <div className={askName && askEmail ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
          {askName && (
            <div>
              <label htmlFor="checkout-name" className="mb-1.5 block text-sm font-medium text-ink">
                {t("fullName")}
              </label>
              <input
                id="checkout-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => onChange(e.target.value, email)}
                placeholder={t("namePlaceholder")}
                aria-invalid={showErrors && !isValidFullName(fullName)}
                aria-describedby={showErrors && !isValidFullName(fullName) ? "checkout-name-error" : undefined}
                className={INPUT}
              />
              {showErrors && !isValidFullName(fullName) && (
                <p id="checkout-name-error" className="mt-1 text-xs text-red-600">
                  {t("nameError")}
                </p>
              )}
            </div>
          )}

          {askEmail && (
            <div>
              <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium text-ink">
                {t("email")}
              </label>
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => onChange(fullName, e.target.value)}
                placeholder={t("emailPlaceholder")}
                aria-invalid={showErrors && !isValidEmail(email)}
                aria-describedby={showErrors && !isValidEmail(email) ? "checkout-email-error" : undefined}
                className={INPUT}
              />
              {showErrors && !isValidEmail(email) && (
                <p id="checkout-email-error" className="mt-1 text-xs text-red-600">
                  {t("emailError")}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
