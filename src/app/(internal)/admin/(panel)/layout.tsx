import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staff/auth";
import { logoutAction } from "@/lib/staff/actions";
import { getOpenShift } from "@/lib/staff/repository";
import { CreditCard, LayoutDashboard, Receipt, ShieldCheck, Users } from "lucide-react";
import Logo from "@/components/layout/Logo";
import AdminClockControl from "./AdminClockControl";
import AdminLanguageSwitcher from "@/components/staff/AdminLanguageSwitcher";
import { getAdminT } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";

const NAV_ITEMS = [
  { href: "/admin", label: "dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "orders", icon: Receipt },
  { href: "/admin/sims", label: "sims", icon: CreditCard },
  { href: "/admin/staff", label: "staffDirectory", icon: Users },
  { href: "/admin/admins", label: "admins", icon: ShieldCheck },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getStaffSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "admin") {
    redirect("/staff");
  }

  const t = await getAdminT();
  const openShift = await getOpenShift(session.staffId);
  const clockedInSince = openShift
    ? new Date(openShift.loginTime).toLocaleTimeString(adminDateLocale(t.locale), { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-ink">
        <div className="px-6 py-6">
          <Logo theme="dark" />
          <p className="mt-2 text-sm font-semibold text-white/70">{t("nav.panelTitle")}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-4" />
              {t(`nav.${label}`)}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 px-3 pb-4">
          <AdminClockControl since={clockedInSince} />
          <AdminLanguageSwitcher theme="dark" />
        </div>
        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-sm font-medium text-white">{session.name}</p>
          <div className="mt-2 flex items-center gap-3">
            <Link href="/admin/account" className="text-xs font-medium text-white/60 hover:text-orange">
              {t("nav.account")}
            </Link>
            <Link href="/staff" className="text-xs font-medium text-white/60 hover:text-orange">
              {t("nav.staffView")}
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-xs font-medium text-white/60 hover:text-orange">
                {t("nav.logOut")}
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
