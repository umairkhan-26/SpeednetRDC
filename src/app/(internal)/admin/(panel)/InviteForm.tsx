"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin");

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" /> {role === "admin" ? t("invite.inviteAdmin") : t("invite.inviteSomeone")}
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{role === "admin" ? t("invite.titleAdmin") : t("invite.titleMember")}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink" aria-label={t("common.close")}>
          <X className="size-4" />
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">{t("invite.intro")}</p>
      <AccountForm action={inviteStaffAction} submitLabel={t("invite.submit")} pendingLabel={t("common.sending")}>
        <Field label={t("invite.name")} name="name" required maxLength={255} />
        <Field label={t("invite.email")} type="email" name="email" required />
        {role ? (
          <input type="hidden" name="role" value={role} />
        ) : (
          <label className="block text-sm font-medium text-ink">
            {t("invite.role")}
            <select name="role" defaultValue="staff" className="mt-1.5 block w-full rounded-lg border border-line px-4 py-3 text-sm font-normal outline-none focus:border-orange">
              <option value="staff">{t("common.roles.staff")}</option>
              <option value="admin">{t("common.roles.admin")}</option>
            </select>
          </label>
        )}
      </AccountForm>
    </div>
  );
}
