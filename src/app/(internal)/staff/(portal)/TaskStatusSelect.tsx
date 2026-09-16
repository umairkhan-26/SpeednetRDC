"use client";

import { useTransition } from "react";
import { updateTaskStatusAction } from "@/lib/staff/actions";
import type { TaskStatus } from "@/lib/staff/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

export default function TaskStatusSelect({
  taskId,
  status,
}: {
  taskId: number;
  status: TaskStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as TaskStatus;
        startTransition(() => {
          updateTaskStatusAction(taskId, next);
        });
      }}
      className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink outline-none focus:border-orange disabled:opacity-50"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
