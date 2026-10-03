import type { Metadata } from "next";
import { getStaffAccountById, peekStaffToken } from "@/lib/staff/accounts";
import { confirmEmailChangeAction } from "@/lib/staff/account-actions";
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

  if (!info || !account || account.status === "deactivated") {
    return (
      <AuthCard title="Link expired" intro="This link is invalid, has already been used or has expired.">
        <p className="mt-6 text-sm text-muted">Sign in and request the change again from your account settings.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Confirm your new email" intro={`Change the sign-in email for ${account.name} from ${account.email} to ${info.newEmail}?`}>
      <AccountForm action={confirmEmailChangeAction} submitLabel="Confirm the change" hideOnSuccess fullWidth>
        <input type="hidden" name="token" value={token} />
      </AccountForm>
    </AuthCard>
  );
}
