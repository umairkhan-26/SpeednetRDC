import { getStaffSession } from "@/lib/staff/auth";
import { getTasksForStaff } from "@/lib/staff/repository";
import TaskStatusSelect from "../TaskStatusSelect";
import { getAdminT } from "@/i18n/admin";

export default async function StaffTasksPage() {
  const session = await getStaffSession();
  if (!session) return null;
  const t = await getAdminT();

  const tasks = await getTasksForStaff(session.staffId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("portal.myTasks")}</h1>
        <p className="mt-1 text-sm text-muted">{t("portal.tasksIntro")}</p>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted">{t("portal.noTasks")}</p>
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-white">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold text-ink">{task.title}</p>
                {task.description && <p className="mt-1 text-sm text-muted">{task.description}</p>}
                {task.dueDate && (
                  <p className="mt-1 text-xs font-medium text-orange">{t("portal.due", { date: task.dueDate })}</p>
                )}
              </div>
              <TaskStatusSelect taskId={task.id} status={task.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
