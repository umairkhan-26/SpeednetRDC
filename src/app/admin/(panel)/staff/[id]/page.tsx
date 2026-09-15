import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getShiftHistory, getStaffById, getTasksForStaff } from "@/lib/staff/repository";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

export default async function AdminStaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffId = Number(id);
  const staff = Number.isFinite(staffId) ? await getStaffById(staffId) : null;

  if (!staff) {
    notFound();
  }

  const shifts = await getShiftHistory(staff.id, 20);
  const tasks = await getTasksForStaff(staff.id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/staff" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-orange">
          <ArrowLeft className="size-4" /> Back to staff directory
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
              {staff.email} &middot; <span className="capitalize">{staff.role}</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Shift history</h2>
        {shifts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No shifts recorded yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-ink">{formatDateTime(shift.loginTime)}</span>
                <span className="text-muted">
                  {shift.logoutTime ? `to ${formatDateTime(shift.logoutTime)}` : "in progress"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Assigned tasks</h2>
        {tasks.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No tasks assigned.</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{task.title}</p>
                  {task.dueDate && <p className="text-xs text-muted">Due {task.dueDate}</p>}
                </div>
                <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange">
                  {TASK_STATUS_LABELS[task.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
