"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { inviteStaffAction } from "@/lib/staff/account-actions";
import AccountForm, { Field } from "@/components/staff/AccountForm";
import { Button } from "@/components/ui/Button";

/**
 * Invites a new admin or staff member by email. They choose their own
 * password through the link; nobody else ever sets or sees it.
 */
export default function InviteForm({ role }: { role?: "admin" | "staff" }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" /> {role === "admin" ? "Invite admin" : "Invite someone"}
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{role === "admin" ? "Invite an admin" : "Invite a team member"}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink" aria-label="Close">
          <X className="size-4" />
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">They&apos;ll get an email with a link to choose their own password. The link works once and expires in 24 hours.</p>
      <AccountForm action={inviteStaffAction} submitLabel="Send invite" pendingLabel="Sending…">
        <Field label="Name" name="name" required maxLength={255} />
        <Field label="Email" type="email" name="email" required />
        {role ? (
          <input type="hidden" name="role" value={role} />
        ) : (
          <label className="block text-sm font-medium text-ink">
            Role
            <select name="role" defaultValue="staff" className="mt-1.5 block w-full rounded-lg border border-line px-4 py-3 text-sm font-normal outline-none focus:border-orange">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
      </AccountForm>
    </div>
  );
}
