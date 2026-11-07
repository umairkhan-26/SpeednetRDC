import { getStaffSession } from "@/lib/staff/auth";
import { getOpenShift, getTodaysShifts } from "@/lib/staff/repository";
import ClockControls from "./ClockControls";
import { getAdminT } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";

function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(adminDateLocale(locale), { hour: "2-digit", minute: "2-digit" });
}

export default async function StaffDashboardPage() {
  const session = await getStaffSession();
  if (!session) return null;
  const t = await getAdminT();

  const openShift = await getOpenShift(session.staffId);
  const todaysShifts = await getTodaysShifts(session.staffId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("portal.welcome", { name: session.name })}</h1>
        <p className="mt-1 text-sm text-muted">{t("portal.intro")}</p>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{t("portal.currentStatus")}</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {openShift
              ? t.rich("portal.clockedInSince", {
                  time: formatTime(openShift.loginTime, t.locale),
                  highlight: (chunks) => <span className="text-orange">{chunks}</span>,
                })
              : t("portal.notClockedIn")}
          </p>
        </div>
        <ClockControls isClockedIn={Boolean(openShift)} />
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("portal.todaysShifts")}</h2>
        {todaysShifts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t("portal.noShiftsToday")}</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {todaysShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-ink">{formatTime(shift.loginTime, t.locale)}</span>
                <span className="text-muted">
                  {shift.logoutTime ? t("portal.shiftTo", { time: formatTime(shift.logoutTime, t.locale) }) : t("portal.inProgress")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
