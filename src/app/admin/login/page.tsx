import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staff/auth";
import { adminLoginAction } from "@/lib/staff/actions";
import LoginForm from "@/components/staff/LoginForm";

export default async function AdminLoginPage() {
  const session = await getStaffSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/staff");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange">SpeedNetRDC</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">
          This is a separate login from the staff and customer account areas.
        </p>
        <LoginForm action={adminLoginAction} emailPlaceholder="you@speednetrdc.com" />
      </div>
    </div>
  );
}
