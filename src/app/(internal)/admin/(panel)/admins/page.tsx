import { requireAdminSession } from "@/lib/staff/auth";
import { getPendingInviteExpiries, listAuditLog, listStaffAccounts } from "@/lib/staff/accounts";
import AccountRowActions from "../AccountRowActions";
import EditNameButton from "../EditNameButton";
import InviteForm from "../InviteForm";
import { AccountStatusBadge } from "../Badges";
import { getAdminT } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";

function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(adminDateLocale(locale), { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminsPage() {
  const session = await requireAdminSession();
  const [admins, inviteExpiries, log] = await Promise.all([listStaffAccounts("admin"), getPendingInviteExpiries(), listAuditLog(50)]);
  const t = await getAdminT();
  const fmt = (iso: string | null) => formatDateTime(iso, t.locale);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("admins.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("admins.intro")}</p>
        </div>
        <InviteForm role="admin" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              {(["name", "email", "status", "lastSignIn", "added", "actions"] as const).map((c) => (
                <th key={c} className="px-4 py-3 font-semibold">
                  {t(`admins.columns.${c}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {admins.map((admin) => {
              const inviteExpiry = inviteExpiries.get(admin.id) ?? null;
              return (
                <tr key={admin.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">
                    {admin.name}
                    {admin.id === session.staffId && <span className="ml-1.5 text-xs font-normal text-muted">{t("common.you")}</span>}
                  </td>
                  <td className="px-4 py-3 text-ink">{admin.email}</td>
                  <td className="px-4 py-3">
                    <AccountStatusBadge status={admin.status} />
                    {admin.status === "invited" && (
                      <p className="mt-1 text-xs text-muted">{inviteExpiry ? t("admins.linkExpires", { date: fmt(inviteExpiry) }) : t("admins.linkExpired")}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{fmt(admin.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {fmt(admin.createdAt)}
                    {admin.invitedByName && <p>{t("admins.invitedBy", { name: admin.invitedByName })}</p>}
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
        <h2 className="text-lg font-bold text-ink">{t("admins.activityTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("admins.activityIntro")}</p>
        <div className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
          {log.length === 0 && <p className="px-4 py-3 text-sm text-muted">{t("admins.nothingYet")}</p>}
          {log.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-sm">
              <p className="text-ink">
                {entry.actorName && entry.actorName !== entry.targetName ? (
                  <>
                    <span className="font-medium">{entry.actorName}</span> {t(`admins.actions.${entry.action}`)}
                    {entry.targetName && <> — {entry.targetName}</>}
                  </>
                ) : (
                  <>
                    <span className="font-medium">{entry.targetName ?? t("admins.unknownAccount")}</span> {t(`admins.actions.${entry.action}`)}
                  </>
                )}
                {entry.detail && <span className="text-muted"> · {entry.detail}</span>}
              </p>
              <p className="text-xs whitespace-nowrap text-muted">{fmt(entry.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
