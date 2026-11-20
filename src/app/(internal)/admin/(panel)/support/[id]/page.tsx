import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/staff/auth";
import { getAdminT } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";
import { getPlanForOrder } from "@/data/plans";
import { getOrderById } from "@/lib/checkout/orders-repository";
import { getSoldSimsByIccid } from "@/lib/sims/repository";
import { seenOutsidePlanCoverage } from "@/lib/sims/coverage";
import { simHealth, usageStatus } from "@/lib/sims/status";
import { replyToTicketAsAdminAction, setTicketStatusAction } from "@/lib/support/admin-actions";
import { MAX_SUPPORT_MESSAGE } from "@/lib/support/categories";
import { getTicketForAdmin, markTicketReadByAdmin } from "@/lib/support/repository";
import { HealthBadge, UsageBadge } from "../../Badges";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{children ?? "—"}</dd>
    </>
  );
}

export default async function AdminSupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId)) notFound();
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) notFound();
  if (ticket.adminUnread) await markTicketReadByAdmin(ticketId);

  const t = await getAdminT();
  const s = (key: string, values?: Record<string, string | number>) => t(`support.${key}`, values);
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(adminDateLocale(t.locale), { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

  const order = await getOrderById(ticket.orderId);
  const sim = ticket.iccid ? (await getSoldSimsByIccid(ticket.iccid)).find((x) => x.productType !== "topup") ?? null : null;
  const snap = sim?.snapshot ?? null;
  const plan = order?.planId ? getPlanForOrder(order.planId) : undefined;
  const outside = seenOutsidePlanCoverage(order?.planId ?? null, snap?.lastOriginCountry ?? null);
  const covered = plan?.countriesIncluded ?? [];

  return (
    <div className="space-y-6">
      <Link href="/admin/support" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-orange">
        <ArrowLeft className="size-4" />
        {s("back")}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">
          {s(`categories.${ticket.category}`)} · ORD-{ticket.orderId}
        </h1>
        <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink">{s(`status.${ticket.status}`)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{s("conversation")}</h2>
          <div className="mt-4 space-y-3">
            {ticket.messages.length === 0 && <p className="text-sm text-muted">{s("noMessages")}</p>}
            {ticket.messages.map((m) => (
              <div key={m.id} className={m.sender === "staff" ? "ml-10 rounded-xl bg-orange/10 px-3 py-2" : "mr-10 rounded-xl bg-ink/5 px-3 py-2"}>
                <p className="text-xs font-semibold text-muted">
                  {m.sender === "staff" ? (m.staffName ?? s("team")) : s("customerLabel")} · {fmt(m.createdAt)}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{m.body}</p>
              </div>
            ))}
          </div>

          <form action={replyToTicketAsAdminAction} className="mt-5 space-y-3 border-t border-line pt-5">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <textarea
              name="message"
              required
              maxLength={MAX_SUPPORT_MESSAGE}
              rows={4}
              placeholder={s("replyPlaceholder")}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-orange"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-soft">
                {s("send")}
              </button>
              <p className="text-xs text-muted">{s("emailNote")}</p>
            </div>
          </form>

          <form action={setTicketStatusAction} className="mt-4">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <input type="hidden" name="status" value={ticket.status === "resolved" ? "open" : "resolved"} />
            <button type="submit" className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5">
              {ticket.status === "resolved" ? s("reopen") : s("resolve")}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{s("context.title")}</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
            <Row label={s("context.customer")}>
              {order?.customerName}
              <br />
              <span className="text-xs text-muted">{ticket.customerEmail}</span>
            </Row>
            <Row label={s("context.plan")}>{order?.planName}</Row>
            <Row label={s("context.covers")}>
              {covered.length > 0 ? (
                <span className="text-xs">
                  {s("context.countries", { count: covered.length })}: {covered.slice(0, 14).join(", ")}
                  {covered.length > 14 ? "…" : ""}
                </span>
              ) : null}
            </Row>
            <Row label={s("context.sim")}>
              {ticket.iccid ? (
                <Link href={`/admin/sims/${ticket.iccid}`} className="font-mono text-xs hover:text-orange hover:underline">
                  {ticket.iccid}
                </Link>
              ) : (
                s("context.noSim")
              )}
            </Row>
            {snap?.fetchedAt && (
              <>
                <Row label={s("context.health")}>
                  <HealthBadge health={simHealth(snap, order?.planId ?? null)} />
                </Row>
                <Row label={s("context.simStatus")}>{snap.simStatus}</Row>
                <Row label={s("context.profile")}>{snap.esimProfileStatus}</Row>
                <Row label={s("context.planStatus")}>
                  <UsageBadge status={usageStatus(snap)} />
                </Row>
                <Row label={s("context.lastSeen")}>{fmt(snap.lastSeenDate)}</Row>
                <Row label={s("context.lastCountry")}>{snap.lastOriginCountry}</Row>
              </>
            )}
          </dl>
          {outside && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{s("context.outside")}</p>}
          {!snap?.fetchedAt && ticket.iccid && <p className="mt-4 text-xs text-muted">{s("context.notChecked")}</p>}
        </section>
      </div>
    </div>
  );
}
