"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { continueWithHiddenEmailAction, requestIdentityLinkAction, type CustomerLoginState } from "@/lib/customer/actions";
import { Button } from "@/components/ui/Button";
import Logo from "@/components/layout/Logo";
import { isValidEmail } from "@/lib/validation";

function SubmitButton() {
  const t = useTranslations("auth.login");
  const social = useTranslations("auth.social");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? t("sending") : social("linkSubmit")}
    </Button>
  );
}

export default function LinkClient({ pending }: { pending: { provider: string; email: string; relay: boolean } | null }) {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const social = useTranslations("auth.social");
  const [state, formAction] = useActionState<CustomerLoginState, FormData>(requestIdentityLinkAction, {});
  const [email, setEmail] = useState(pending && !pending.relay ? pending.email : "");
  const [touched, setTouched] = useState(false);
  const expired = !pending || state.status === "expired";

  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo href={`/${locale}`} />
        </div>

        {state.status === "sent" ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">
            <MailCheck className="mx-auto size-10 text-orange" />
            <h1 className="mt-3 text-xl font-bold text-ink">{t("sentTitle")}</h1>
            <p className="mt-2 text-sm text-muted">{social("linkSentBody")}</p>
          </div>
        ) : expired ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">
            <h1 className="text-xl font-bold text-ink">{social("expiredTitle")}</h1>
            <p className="mt-2 text-sm text-muted">{social("expiredBody")}</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-orange hover:underline">
              {social("backToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-center text-2xl font-bold text-ink">{social("linkTitle")}</h1>
            <p className="mt-2 text-center text-sm text-muted">
              {pending.relay ? social("linkRelayBody") : social("linkConfirmBody", { provider: pending.provider })}
            </p>
            <form
              action={formAction}
              onSubmit={(e) => {
                setTouched(true);
                if (!isValidEmail(email)) e.preventDefault();
              }}
              className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6"
            >
              <input type="hidden" name="locale" value={locale} />
              <div>
                <label htmlFor="link-email" className="mb-1.5 block text-sm font-medium text-ink">
                  {t("emailLabel")}
                </label>
                <input
                  id="link-email"
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
            {pending.relay && (
              <form action={continueWithHiddenEmailAction} className="mt-4 text-center">
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="text-sm font-semibold text-orange hover:underline">
                  {social("continueWithout")}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
