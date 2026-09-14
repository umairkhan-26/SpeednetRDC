import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staff/auth";
import { logoutAction } from "@/lib/staff/actions";
import { LayoutDashboard, Users } from "lucide-react";
import Logo from "@/components/layout/Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/staff", label: "Staff Directory", icon: Users },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getStaffSession();
  if (!session) {
    redirect("/staff/login");
  }
  if (session.role !== "admin") {
    redirect("/staff");
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-ink">
        <div className="px-6 py-6">
          <Logo theme="dark" />
          <p className="mt-2 text-sm font-semibold text-white/70">Admin panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-sm font-medium text-white">{session.name}</p>
          <div className="mt-2 flex items-center gap-3">
            <Link href="/staff" className="text-xs font-medium text-white/60 hover:text-orange">
              Staff view
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-xs font-medium text-white/60 hover:text-orange">
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
