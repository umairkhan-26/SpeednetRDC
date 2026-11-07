import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staff/auth";
import { loginAction } from "@/lib/staff/actions";
import { getAdminT } from "@/i18n/admin";
import LoginForm from "@/components/staff/LoginForm";
import AuthCard from "../../admin/AuthCard";

export default async function StaffLoginPage() {
  const session = await getStaffSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/staff");
  }
  const t = await getAdminT();

  return (
    <AuthCard title={t("auth.staffTitle")} intro={t("auth.staffIntro")}>
      <LoginForm action={loginAction} />
      <p className="mt-4 text-center text-sm">
        <Link href="/admin/forgot-password" className="font-medium text-muted hover:text-orange">
          {t("auth.forgotPassword")}
        </Link>
      </p>
    </AuthCard>
  );
}
