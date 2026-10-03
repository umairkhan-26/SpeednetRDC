"use client";

import { useState, useTransition } from "react";
import {
  deactivateStaffAction,
  reactivateStaffAction,
  resendInviteAction,
  type AccountActionResult,
} from "@/lib/staff/account-actions";
import type { StaffAccountStatus } from "@/lib/staff/types";

/** Resend invite / Deactivate / Reactivate buttons for one staff or admin account. */
export default function AccountRowActions({
  staffId,
  name,
  status,
  isSelf,
}: {
  staffId: number;
  name: string;
  status: StaffAccountStatus;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AccountActionResult | null>(null);

  function run(confirmText: string, action: (id: number) => Promise<AccountActionResult>) {
    if (!window.confirm(confirmText)) return;
    setResult(null);
    startTransition(async () => setResult(await action(staffId)));
  }

  const buttonClass = "text-xs font-semibold text-orange hover:underline disabled:opacity-50";

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap gap-3">
        {status === "invited" && (
          <button type="button" disabled={isPending} className={buttonClass} onClick={() => run(`Send ${name} a new invite link? Earlier links stop working.`, resendInviteAction)}>
            Resend invite
          </button>
        )}
        {status !== "deactivated" && !isSelf && (
          <button
            type="button"
            disabled={isPending}
            className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
            onClick={() => run(`Deactivate ${name}? They'll be signed out and won't be able to sign in. Their history is kept, and you can reactivate them later.`, deactivateStaffAction)}
          >
            Deactivate
          </button>
        )}
        {status === "deactivated" && (
          <button type="button" disabled={isPending} className={buttonClass} onClick={() => run(`Reactivate ${name}? They'll be able to sign in again.`, reactivateStaffAction)}>
            Reactivate
          </button>
        )}
      </div>
      {isPending && <span className="text-xs text-muted">Working…</span>}
      {result && <span className={`text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}>{result.message}</span>}
    </div>
  );
}
