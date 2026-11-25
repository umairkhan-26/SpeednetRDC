import Link from "next/link";
import { requireAdminSession } from "@/lib/staff/auth";
import { getAdminT } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";
import { isTicketStatus } from "@/lib/support/categories";
import { listTicketsForAdmin, type TicketFilter } from "@/lib/support/repository";
import { listSoldSims } from "@/lib/sims/repository";
import { simHealth } from "@/lib/sims/status";
import { HealthBadge } from "../Badges";

const TABS: TicketFilter[] = ["open", "answered", "resolved", "all"];

const STATUS_STYLE = {
  open: "bg-sky-100 text-sky-700",
  answered: "bg-green-100 text-green-700",
  resolved: "bg-ink/10 text-ink/60",
} as const;

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdminSession();
  const params = await searchParams;
  const filter: TicketFilter = params.status === "all" ? "all" : isTicketStatus(params.status) ? params.status : "open";
  const t = await getAdminT();
  const s = (key: string, values?: Record<string, string | number>) => t(`support.${key}`, values);

  const tickets = await listTicketsForAdmin(filter);
  // One query for every SIM's last known state, to colour each request.
  const sims = new Map((await listSoldSims()).filter((sim) => sim.productType !== "topup").map((sim) => [sim.iccid, sim]));
  const fmt = (iso: string) => new Date(iso).toLocaleString(adminDateLocale(t.locale), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{s("title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{s("subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "open" ? "/admin/support" : `/admin/support?status=${tab}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === tab ? "bg-ink text-white" : "border border-line bg-white text-ink hover:bg-ink/5"}`}
          >
            {s(`tabs.${tab}`)}
          </Link>
        ))}
      </div>

      {tickets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white py-14 text-center text-sm text-muted">{s("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[820px] text-start text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                {["issue", "customer", "order", "sim", "updated"].map((c) => (
                  <th key={c} className="px-4 py-3 font-semibold">
                    {s(`cols.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tickets.map((ticket) => {
                const sim = ticket.iccid ? sims.get(ticket.iccid) : undefined;
                return (
                  <tr key={ticket.id} className="align-top hover:bg-cream/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/support/${ticket.id}`} className="flex items-center gap-2 font-medium text-ink hover:text-orange">
                        {ticket.adminUnread && <span aria-label={s("new")} className="size-2 rounded-full bg-orange" />}
                        {s(`categories.${ticket.category}`)}
                      </Link>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[ticket.status]}`}>{s(`status.${ticket.status}`)}</span>
                      {ticket.lastMessage && <p className="mt-1 max-w-xs truncate text-xs text-muted">{ticket.lastMessage}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{ticket.customerName}</p>
                      <p className="text-xs text-muted">{ticket.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="whitespace-nowrap text-ink">ORD-{ticket.orderId}</p>
                      <p className="text-xs text-muted">{ticket.planName}</p>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.iccid ? (
                        <>
                          <Link href={`/admin/sims/${ticket.iccid}`} className="font-mono text-xs text-ink hover:text-orange hover:underline">
                            …{ticket.iccid.slice(-4)}
                          </Link>
                          <p className="mt-1">
                            <HealthBadge health={simHealth(sim?.snapshot ?? null, ticket.planId)} />
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">{fmt(ticket.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
