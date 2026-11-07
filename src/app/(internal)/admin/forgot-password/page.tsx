import Link from "next/link";
import { forgotPasswordAction } from "@/lib/staff/account-actions";
import { getAdminT } from "@/i18n/admin";
import AccountForm, { Field } from "@/components/staff/AccountForm";
import AuthCard from "../AuthCard";

export default async function ForgotPasswordPage() {
  const t = await getAdminT();
  return (
    <AuthCard title={t("auth.resetTitle")} intro={t("auth.resetIntro")}>
      <AccountForm action={forgotPasswordAction} submitLabel={t("auth.resetSubmit")} pendingLabel={t("common.sending")} hideOnSuccess fullWidth>
        <Field label={t("auth.email")} type="email" name="email" required autoComplete="email" placeholder="you@speednetrdc.com" />
      </AccountForm>
      <p className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="font-medium text-muted hover:text-orange">
          {t("auth.backToSignIn")}
        </Link>
      </p>
    </AuthCard>
  );
}
