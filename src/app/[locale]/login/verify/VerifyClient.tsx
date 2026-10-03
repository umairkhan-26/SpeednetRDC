"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { verifyCustomerLoginAction, type CustomerLoginState } from "@/lib/customer/actions";
import { Button } from "@/components/ui/Button";
import Logo from "@/components/layout/Logo";

function SubmitButton() {
  const t = useTranslations("auth.verify");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? t("signingIn") : t("submit")}
    </Button>
  );
}

export default function VerifyClient({ token, email }: { token: string; email: string | null }) {
  const locale = useLocale();
  const t = useTranslations("auth.verify");
  const [state, formAction] = useActionState<CustomerLoginState, FormData>(verifyCustomerLoginAction, {});
  const invalid = !email || state.status === "invalidLink";

  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo href={`/${locale}`} />
        </div>
        <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">
          {invalid ? (
            <>
              <h1 className="text-xl font-bold text-ink">{t("invalidTitle")}</h1>
              <p className="mt-2 text-sm text-muted">{t("invalidBody")}</p>
              <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-orange hover:underline">
                {t("newLink")}
              </Link>
            </>
          ) : (
            <form action={formAction} className="space-y-4">
              <h1 className="text-xl font-bold text-ink">{t("title")}</h1>
              <p className="text-sm text-muted">{t("body", { email })}</p>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="locale" value={locale} />
              {state.status === "tooMany" && <p className="text-sm text-red-600">{t("tooMany")}</p>}
              {state.status === "unavailable" && <p className="text-sm text-red-600">{t("unavailable")}</p>}
              <SubmitButton />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
