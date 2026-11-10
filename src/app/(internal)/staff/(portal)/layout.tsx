import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staff/auth";
import { logoutAction } from "@/lib/staff/actions";
import { getAdminT } from "@/i18n/admin";
import AdminLanguageSwitcher from "@/components/staff/AdminLanguageSwitcher";
import { isPhysicalSimEnabled } from "@/lib/physical-sim";

export default async function StaffPortalLayout({ children }: { children: ReactNode }) {
  const session = await getStaffSession();
  if (!session) {
    redirect("/staff/login");
  }
  const t = await getAdminT();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-white">
        <div className="container-page flex items-center justify-between py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange">SpeedNetRDC</p>
            <p className="text-sm text-muted">
              {t("portal.title")} &middot; {session.name}
            </p>
          </div>
          <nav className="flex items-center gap-5 text-sm font-semibold text-ink">
            <Link href="/staff" className="hover:text-orange">
              {t("portal.dashboard")}
            </Link>
            <Link href="/staff/tasks" className="hover:text-orange">
              {t("portal.myTasks")}
            </Link>
            <Link href="/staff/messages" className="hover:text-orange">
              {t("portal.messages")}
            </Link>
            {isPhysicalSimEnabled() && (
              <Link href="/staff/shipping" className="hover:text-orange">
                {t("portal.shipping")}
              </Link>
            )}
            {session.role === "admin" && (
              <Link href="/admin" className="hover:text-orange">
                {t("portal.adminPanel")}
              </Link>
            )}
            <form action={logoutAction}>
              <button type="submit" className="text-muted hover:text-orange">
                {t("portal.logOut")}
              </button>
            </form>
            <AdminLanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="container-page py-10">{children}</main>
    </div>
  );
}
