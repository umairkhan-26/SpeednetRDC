"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateTaskStatusAction } from "@/lib/staff/actions";
import type { TaskStatus } from "@/lib/staff/types";

const STATUSES: TaskStatus[] = ["pending", "in_progress", "done"];

export default function TaskStatusSelect({
  taskId,
  status,
}: {
  taskId: number;
  status: TaskStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("admin.taskStatus");

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
      {STATUSES.map((value) => (
        <option key={value} value={value}>
          {t(value)}
        </option>
      ))}
    </select>
  );
}
