import { requireAdminSession } from "@/lib/staff/auth";
import { getStaffAccountById } from "@/lib/staff/accounts";
import { changeOwnNameAction, changePasswordAction, requestEmailChangeAction } from "@/lib/staff/account-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/staff/password";
import AccountForm, { Field } from "@/components/staff/AccountForm";

export default async function AccountSettingsPage() {
  const session = await requireAdminSession();
  const account = await getStaffAccountById(session.staffId);
  if (!account) return null;

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Account settings</h1>
        <p className="mt-1 text-sm text-muted">
          Signed in as {account.name} ({account.email}).
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">Display name</h2>
        <p className="mt-1 text-sm text-muted">Shown in the admin panel, the staff portal and the account activity log.</p>
        <AccountForm action={changeOwnNameAction} submitLabel="Save name">
          <Field label="Name" name="name" required maxLength={100} defaultValue={account.name} autoComplete="name" />
        </AccountForm>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">Change email</h2>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll send a confirmation link to the new address; your email only changes once you open it. Your current address gets a notice
          when it changes.
        </p>
        <AccountForm action={requestEmailChangeAction} submitLabel="Send confirmation link" pendingLabel="Sending…">
          <Field label="New email" type="email" name="email" required autoComplete="email" />
          <Field label="Current password" type="password" name="current" required autoComplete="current-password" />
        </AccountForm>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">Change password</h2>
        <p className="mt-1 text-sm text-muted">You&apos;ll stay signed in here and be signed out everywhere else.</p>
        <AccountForm action={changePasswordAction} submitLabel="Change password">
          <Field label="Current password" type="password" name="current" required autoComplete="current-password" />
          <Field
            label="New password"
            type="password"
            name="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          />
          <Field label="Repeat the new password" type="password" name="confirm" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
        </AccountForm>
      </section>
    </div>
  );
}
