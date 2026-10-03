import { requireAdminSession } from "@/lib/staff/auth";
import { getPendingInviteExpiries, listAuditLog, listStaffAccounts, type AuditAction } from "@/lib/staff/accounts";
import AccountRowActions from "../AccountRowActions";
import EditNameButton from "../EditNameButton";
import InviteForm from "../InviteForm";
import { AccountStatusBadge } from "../Badges";

const ACTION_LABELS: Record<AuditAction, string> = {
  login: "signed in",
  login_failed: "failed sign-in",
  invite_sent: "sent an invite",
  invite_accepted: "accepted their invite",
  password_reset_requested: "password reset requested",
  password_reset: "reset their password",
  password_changed: "changed their password",
  email_change_requested: "requested an email change",
  email_changed: "changed their email",
  deactivated: "deactivated",
  reactivated: "reactivated",
  name_changed: "changed a name",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminsPage() {
  const session = await requireAdminSession();
  const [admins, inviteExpiries, log] = await Promise.all([listStaffAccounts("admin"), getPendingInviteExpiries(), listAuditLog(50)]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Admins</h1>
          <p className="mt-1 text-sm text-muted">
            Everyone who can open this admin panel. Accounts are deactivated, never deleted. You can&apos;t deactivate yourself or the last active admin.
          </p>
        </div>
        <InviteForm role="admin" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last sign-in</th>
              <th className="px-4 py-3 font-semibold">Added</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {admins.map((admin) => {
              const inviteExpiry = inviteExpiries.get(admin.id) ?? null;
              return (
                <tr key={admin.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">
                    {admin.name}
                    {admin.id === session.staffId && <span className="ml-1.5 text-xs font-normal text-muted">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-ink">{admin.email}</td>
                  <td className="px-4 py-3">
                    <AccountStatusBadge status={admin.status} />
                    {admin.status === "invited" && (
                      <p className="mt-1 text-xs text-muted">{inviteExpiry ? `Link expires ${formatDateTime(inviteExpiry)}` : "Link expired"}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(admin.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {formatDateTime(admin.createdAt)}
                    {admin.invitedByName && <p>by {admin.invitedByName}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <EditNameButton staffId={admin.id} name={admin.name} />
                      <AccountRowActions staffId={admin.id} name={admin.name} status={admin.status} isSelf={admin.id === session.staffId} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-bold text-ink">Account activity</h2>
        <p className="mt-1 text-sm text-muted">The latest 50 sign-ins, invites and account changes for admin and staff accounts.</p>
        <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
          {log.length === 0 && <p className="px-4 py-3 text-sm text-muted">Nothing yet.</p>}
          {log.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-sm">
              <p className="text-ink">
                {entry.actorName && entry.actorName !== entry.targetName ? (
                  <>
                    <span className="font-medium">{entry.actorName}</span> {ACTION_LABELS[entry.action]}
                    {entry.targetName && <> — {entry.targetName}</>}
                  </>
                ) : (
                  <>
                    <span className="font-medium">{entry.targetName ?? "Unknown account"}</span> {ACTION_LABELS[entry.action]}
                  </>
                )}
                {entry.detail && <span className="text-muted"> · {entry.detail}</span>}
              </p>
              <p className="text-xs whitespace-nowrap text-muted">{formatDateTime(entry.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
