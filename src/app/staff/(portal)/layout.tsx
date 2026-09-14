import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staff/auth";
import { logoutAction } from "@/lib/staff/actions";

export default async function StaffPortalLayout({ children }: { children: ReactNode }) {
  const session = await getStaffSession();
  if (!session) {
    redirect("/staff/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-white">
        <div className="container-page flex items-center justify-between py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange">SpeedNetRDC</p>
            <p className="text-sm text-muted">Staff portal &middot; {session.name}</p>
          </div>
          <nav className="flex items-center gap-5 text-sm font-semibold text-ink">
            <Link href="/staff" className="hover:text-orange">
              Dashboard
            </Link>
            <Link href="/staff/tasks" className="hover:text-orange">
              My tasks
            </Link>
            <Link href="/staff/messages" className="hover:text-orange">
              Messages
            </Link>
            {session.role === "admin" && (
              <Link href="/admin" className="hover:text-orange">
                Admin panel
              </Link>
            )}
            <form action={logoutAction}>
              <button type="submit" className="text-muted hover:text-orange">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container-page py-10">{children}</main>
    </div>
  );
}
