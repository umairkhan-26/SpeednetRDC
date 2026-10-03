import type { Metadata } from "next";
import Link from "next/link";
import { getStaffAccountById, peekStaffToken } from "@/lib/staff/accounts";
import { setPasswordWithTokenAction } from "@/lib/staff/account-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/staff/password";
import AccountForm, { Field } from "@/components/staff/AccountForm";
import AuthCard from "../AuthCard";

// The token is in the URL: never leak it to another site through Referer.
export const metadata: Metadata = { referrer: "no-referrer" };

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token: tokenParam } = await searchParams;
  const token = typeof tokenParam === "string" ? tokenParam : "";
  const info = await peekStaffToken(token, ["invite", "password_reset"]);
  const account = info ? await getStaffAccountById(info.staffId) : null;

  if (!info || !account || account.status === "deactivated") {
    return (
      <AuthCard title="Link expired" intro="This link is invalid, has already been used or has expired.">
        <p className="mt-6 text-sm text-muted">
          Invites last 24 hours and reset links 1 hour. Ask an admin for a new invite, or{" "}
          <Link href="/admin/forgot-password" className="font-semibold text-orange hover:underline">
            request a new reset link
          </Link>
          .
        </p>
      </AuthCard>
    );
  }

  const isInvite = info.purpose === "invite";
  return (
    <AuthCard
      title={isInvite ? "Set your password" : "Choose a new password"}
      intro={isInvite ? `Welcome, ${account.name}. Choose a password for ${account.email}.` : `For ${account.email}.`}
    >
      <AccountForm action={setPasswordWithTokenAction} submitLabel="Save password" hideOnSuccess fullWidth>
        <input type="hidden" name="token" value={token} />
        <Field
          label="New password"
          type="password"
          name="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. A short sentence works well.`}
        />
        <Field label="Repeat the password" type="password" name="confirm" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
      </AccountForm>
    </AuthCard>
  );
}
