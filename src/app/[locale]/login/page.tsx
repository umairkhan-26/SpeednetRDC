"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { MailCheck } from "lucide-react";
import { requestCustomerLoginAction, type CustomerLoginState } from "@/lib/customer/actions";
import { Button } from "@/components/ui/Button";
import { isValidEmail } from "@/lib/validation";
import Logo from "@/components/layout/Logo";

function SubmitButton() {
  const t = useTranslations("auth.login");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? t("sending") : t("submit")}
    </Button>
  );
}

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const [state, formAction] = useActionState<CustomerLoginState, FormData>(requestCustomerLoginAction, {});
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const sent = state.status === "sent" && !showForm;

  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo href={`/${locale}`} />
        </div>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">
            <MailCheck className="mx-auto size-10 text-orange" />
            <h1 className="mt-3 text-xl font-bold text-ink">{t("sentTitle")}</h1>
            <p className="mt-2 text-sm text-muted">{t("sentBody", { email })}</p>
            <button type="button" onClick={() => setShowForm(true)} className="mt-4 text-sm font-semibold text-orange hover:underline">
              {t("useDifferent")}
            </button>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-center text-2xl font-bold text-ink">{t("title")}</h1>
            <p className="mt-1 text-center text-sm text-muted">{t("subtitle")}</p>
            <form
              action={formAction}
              onSubmit={(e) => {
                setTouched(true);
                if (!isValidEmail(email)) e.preventDefault();
                else setShowForm(false);
              }}
              className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6"
            >
              <input type="hidden" name="locale" value={locale} />
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink">
                  {t("emailLabel")}
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-orange"
                />
                {((touched && !isValidEmail(email)) || state.status === "invalidEmail") && (
                  <p className="mt-1 text-xs text-red-600">{t("emailError")}</p>
                )}
              </div>
              {state.status === "tooMany" && <p className="text-sm text-red-600">{t("tooMany")}</p>}
              {state.status === "unavailable" && <p className="text-sm text-red-600">{t("unavailable")}</p>}
              <SubmitButton />
            </form>
          </>
        )}
      </div>
    </div>
  );
}
