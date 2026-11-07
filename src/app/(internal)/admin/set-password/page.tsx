import type { Metadata } from "next";
import Link from "next/link";
import { getStaffAccountById, peekStaffToken } from "@/lib/staff/accounts";
import { setPasswordWithTokenAction } from "@/lib/staff/account-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/staff/password";
import { getAdminT } from "@/i18n/admin";
import AccountForm, { Field } from "@/components/staff/AccountForm";
import AuthCard from "../AuthCard";

// The token is in the URL: never leak it to another site through Referer.
export const metadata: Metadata = { referrer: "no-referrer" };

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token: tokenParam } = await searchParams;
  const token = typeof tokenParam === "string" ? tokenParam : "";
  const info = await peekStaffToken(token, ["invite", "password_reset"]);
  const account = info ? await getStaffAccountById(info.staffId) : null;
  const t = await getAdminT();

  if (!info || !account || account.status === "deactivated") {
    return (
      <AuthCard title={t("auth.linkExpiredTitle")} intro={t("auth.linkExpiredIntro")}>
        <p className="mt-6 text-sm text-muted">
          {t.rich("auth.linkExpiredPassword", {
            link: (chunks) => (
              <Link href="/admin/forgot-password" className="font-semibold text-orange hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </AuthCard>
    );
  }

  const isInvite = info.purpose === "invite";
  return (
    <AuthCard
      title={t(isInvite ? "auth.setTitle" : "auth.chooseTitle")}
      intro={isInvite ? t("auth.setIntro", { name: account.name, email: account.email }) : t("auth.chooseIntro", { email: account.email })}
    >
      <AccountForm action={setPasswordWithTokenAction} submitLabel={t("auth.savePassword")} hideOnSuccess fullWidth>
        <input type="hidden" name="token" value={token} />
        <Field
          label={t("auth.newPassword")}
          type="password"
          name="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          hint={t("auth.passwordHint", { min: MIN_PASSWORD_LENGTH })}
        />
        <Field label={t("auth.repeatPassword")} type="password" name="confirm" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
      </AccountForm>
    </AuthCard>
  );
}
