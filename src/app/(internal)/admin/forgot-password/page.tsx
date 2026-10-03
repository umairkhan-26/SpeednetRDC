import Link from "next/link";
import { forgotPasswordAction } from "@/lib/staff/account-actions";
import AccountForm, { Field } from "@/components/staff/AccountForm";
import AuthCard from "../AuthCard";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset your password" intro="For admin and staff accounts. We'll email you a link that works once, for 1 hour.">
      <AccountForm action={forgotPasswordAction} submitLabel="Email me a reset link" pendingLabel="Sending…" hideOnSuccess fullWidth>
        <Field label="Email" type="email" name="email" required autoComplete="email" placeholder="you@speednetrdc.com" />
      </AccountForm>
      <p className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="font-medium text-muted hover:text-orange">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
