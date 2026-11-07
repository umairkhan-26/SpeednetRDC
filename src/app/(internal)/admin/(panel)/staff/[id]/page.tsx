import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getShiftHistory, getStaffById, getTasksForStaff } from "@/lib/staff/repository";
import { getAdminT } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(adminDateLocale(locale), {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminStaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffId = Number(id);
  const staff = Number.isFinite(staffId) ? await getStaffById(staffId) : null;

  if (!staff) {
    notFound();
  }

  const t = await getAdminT();
  const shifts = await getShiftHistory(staff.id, 20);
  const tasks = await getTasksForStaff(staff.id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/staff" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-orange">
          <ArrowLeft className="size-4" /> {t("staff.back")}
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-orange/10 text-lg font-bold text-orange">
            {staff.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">{staff.name}</h1>
            <p className="text-sm text-muted">
              {staff.email} &middot; {t(`common.roles.${staff.role}`)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("staff.shiftHistory")}</h2>
        {shifts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t("staff.noShifts")}</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-ink">{formatDateTime(shift.loginTime, t.locale)}</span>
                <span className="text-muted">
                  {shift.logoutTime ? t("staff.shiftTo", { time: formatDateTime(shift.logoutTime, t.locale) }) : t("staff.inProgress")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("staff.assignedTasks")}</h2>
        {tasks.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t("staff.noTasks")}</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{task.title}</p>
                  {task.dueDate && <p className="text-xs text-muted">{t("staff.due", { date: task.dueDate })}</p>}
                </div>
                <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange">
                  {t(`taskStatus.${task.status}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
