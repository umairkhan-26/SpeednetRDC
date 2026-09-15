import { getStaffSession } from "@/lib/staff/auth";
import { getOpenShift, getTodaysShifts } from "@/lib/staff/repository";
import ClockControls from "./ClockControls";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default async function StaffDashboardPage() {
  const session = await getStaffSession();
  if (!session) return null;

  const openShift = await getOpenShift(session.staffId);
  const todaysShifts = await getTodaysShifts(session.staffId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Welcome back, {session.name}</h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s your shift status for today.</p>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Current status</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {openShift ? (
              <>
                Clocked in since{" "}
                <span className="text-orange">{formatTime(openShift.loginTime)}</span>
              </>
            ) : (
              "Not clocked in"
            )}
          </p>
        </div>
        <ClockControls isClockedIn={Boolean(openShift)} />
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Today&apos;s shifts</h2>
        {todaysShifts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No shifts recorded yet today.</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {todaysShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-ink">{formatTime(shift.loginTime)}</span>
                <span className="text-muted">
                  {shift.logoutTime ? `to ${formatTime(shift.logoutTime)}` : "in progress"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
