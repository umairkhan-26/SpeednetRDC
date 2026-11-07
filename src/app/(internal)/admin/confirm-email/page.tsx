import type { Metadata } from "next";
import { getStaffAccountById, peekStaffToken } from "@/lib/staff/accounts";
import { confirmEmailChangeAction } from "@/lib/staff/account-actions";
import { getAdminT } from "@/i18n/admin";
import AccountForm from "@/components/staff/AccountForm";
import AuthCard from "../AuthCard";

export const metadata: Metadata = { referrer: "no-referrer" };

// Opening the link only shows a button: the change happens on the POST, so
// an email scanner that pre-fetches links can't use the link up.
export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token: tokenParam } = await searchParams;
  const token = typeof tokenParam === "string" ? tokenParam : "";
  const info = await peekStaffToken(token, ["email_change"]);
  const account = info ? await getStaffAccountById(info.staffId) : null;
  const t = await getAdminT();

  if (!info || !account || account.status === "deactivated") {
    return (
      <AuthCard title={t("auth.linkExpiredTitle")} intro={t("auth.linkExpiredIntro")}>
        <p className="mt-6 text-sm text-muted">{t("auth.linkExpiredEmail")}</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("auth.confirmEmailTitle")}
      intro={t("auth.confirmEmailIntro", { name: account.name, from: account.email, to: info.newEmail ?? "" })}
    >
      <AccountForm action={confirmEmailChangeAction} submitLabel={t("auth.confirmEmailSubmit")} hideOnSuccess fullWidth>
        <input type="hidden" name="token" value={token} />
      </AccountForm>
    </AuthCard>
  );
}
