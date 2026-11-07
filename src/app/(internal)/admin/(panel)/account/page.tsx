import { requireAdminSession } from "@/lib/staff/auth";
import { getStaffAccountById } from "@/lib/staff/accounts";
import { changeOwnNameAction, changePasswordAction, requestEmailChangeAction } from "@/lib/staff/account-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/staff/password";
import AccountForm, { Field } from "@/components/staff/AccountForm";
import { getAdminT } from "@/i18n/admin";

export default async function AccountSettingsPage() {
  const session = await requireAdminSession();
  const account = await getStaffAccountById(session.staffId);
  if (!account) return null;
  const t = await getAdminT();
  const a = (key: string, values?: Record<string, string | number>) => t(`account.${key}`, values);

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">{a("title")}</h1>
        <p className="mt-1 text-sm text-muted">{a("signedInAs", { name: account.name, email: account.email })}</p>
      </div>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">{a("nameTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{a("nameIntro")}</p>
        <AccountForm action={changeOwnNameAction} submitLabel={a("saveName")}>
          <Field label={a("name")} name="name" required maxLength={100} defaultValue={account.name} autoComplete="name" />
        </AccountForm>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">{a("emailTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{a("emailIntro")}</p>
        <AccountForm action={requestEmailChangeAction} submitLabel={a("sendConfirmation")} pendingLabel={t("common.sending")}>
          <Field label={a("newEmail")} type="email" name="email" required autoComplete="email" />
          <Field label={a("currentPassword")} type="password" name="current" required autoComplete="current-password" />
        </AccountForm>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-bold text-ink">{a("passwordTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{a("passwordIntro")}</p>
        <AccountForm action={changePasswordAction} submitLabel={a("changePassword")}>
          <Field label={a("currentPassword")} type="password" name="current" required autoComplete="current-password" />
          <Field
            label={a("newPassword")}
            type="password"
            name="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            hint={a("passwordHint", { min: MIN_PASSWORD_LENGTH })}
          />
          <Field label={a("repeatPassword")} type="password" name="confirm" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
        </AccountForm>
      </section>
    </div>
  );
}
