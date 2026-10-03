"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { isValidEmail, isValidFullName } from "@/lib/validation";

export default function AccountStep({
  fullName,
  email,
  onBack,
  onContinue,
}: {
  fullName: string;
  email: string;
  onBack: () => void;
  onContinue: (fullName: string, email: string) => void;
}) {
  const t = useTranslations("checkout.accountStep");
  const [name, setName] = useState(fullName);
  const [emailValue, setEmailValue] = useState(email);
  const [touched, setTouched] = useState(false);

  const nameValid = isValidFullName(name);
  const emailValid = isValidEmail(emailValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!nameValid || !emailValid) return;
    onContinue(name, emailValue);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div>
        <label htmlFor="checkout-name" className="mb-1.5 block text-sm font-medium text-ink">
          {t("fullName")}
        </label>
        <input
          id="checkout-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
        {touched && !nameValid && <p className="mt-1 text-xs text-red-600">{t("nameError")}</p>}
      </div>

      <div>
        <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium text-ink">
          {t("email")}
        </label>
        <input
          id="checkout-email"
          type="email"
          autoComplete="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
        />
        {touched && !emailValid && <p className="mt-1 text-xs text-red-600">{t("emailError")}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          {t("back")}
        </Button>
        <Button type="submit" size="lg">
          {t("continue")}
        </Button>
      </div>
    </form>
  );
}
