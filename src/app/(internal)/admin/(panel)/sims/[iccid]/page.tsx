import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/staff/auth";
import { orderKind } from "@/lib/checkout/order-kind";
import { getSoldSimsByIccid } from "@/lib/sims/repository";
import { formatKb, usageStatus } from "@/lib/sims/status";
import { DeliveryBadge, KindBadge, PaymentBadge, UsageBadge } from "../../Badges";
import RefreshButton from "../RefreshButton";
import { getAdminT } from "@/i18n/admin";
import { adminDateLocale } from "@/i18n/admin-locale";

function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString(adminDateLocale(locale), { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{children ?? "—"}</dd>
    </>
  );
}

// Never shows the eSIM activation code: it isn't selected from the orders
// table here, and a refresh discards it from Transatel's answer.
export default async function AdminSimDetailPage({ params }: { params: Promise<{ iccid: string }> }) {
  await requireAdminSession();
  const { iccid } = await params;
  if (!/^\d{10,25}$/.test(iccid)) notFound();
  const sales = await getSoldSimsByIccid(iccid);
  const sim = sales.find((s) => s.productType !== "topup") ?? sales[0];
  if (!sim) notFound();
  const topUps = sales.filter((s) => s.productType === "topup");

  const t = await getAdminT();
  const d = (key: string, values?: Record<string, string | number>) => t(`simDetail.${key}`, values);
  const fmt = (iso: string | null) => formatDateTime(iso, t.locale);
  const snap = sim.snapshot;
  const kind = orderKind(sim.stripeCheckoutSessionId);
  const used = snap?.dataTotalKb != null && snap.dataRemainingKb != null ? snap.dataTotalKb - snap.dataRemainingKb : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/sims" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-orange">
          <ArrowLeft className="size-4" /> {d("allSims")}
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-bold text-ink">{sim.iccid}</h1>
            <p className="mt-1 text-sm text-muted">
              {sim.simType === "physical" ? t("sims.physical") : sim.simType === "esim" ? t("sims.esim") : t("sims.typeUnknown")} ·{" "}
              {d("lastRefreshed", { date: fmt(snap?.fetchedAt ?? null) })}
            </p>
            {snap?.error && (
              <p className="mt-1 text-sm text-red-700">
                {d("refreshFailedAt", { date: fmt(snap.errorAt), error: snap.error })}
              </p>
            )}
          </div>
          <RefreshButton iccid={sim.iccid} label={t("sims.refreshOne")} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={d("sections.order")}>
          <Row label={d("rows.order")}>
            <span className="inline-flex items-center gap-1.5">
              ORD-{sim.orderId} <KindBadge kind={kind} />
            </span>
          </Row>
          <Row label={d("rows.date")}>{fmt(sim.orderCreatedAt)}</Row>
          <Row label={d("rows.plan")}>{sim.planName}</Row>
          <Row label={d("rows.destination")}>{sim.countryName}</Row>
          <Row label={d("rows.payment")}>
            <PaymentBadge status={sim.paymentStatus} />
          </Row>
          <Row label={d("rows.delivery")}>
            <DeliveryBadge kind={kind} paymentStatus={sim.paymentStatus} deliveryStatus={sim.provisioningStatus} />
          </Row>
          <Row label={d("rows.customerPage")}>
            {sim.accessToken && sim.paymentStatus === "completed" ? (
              <a href={`/en/order/${sim.accessToken}`} target="_blank" rel="noreferrer" className="font-semibold text-orange hover:underline">
                {d("openQr")}
              </a>
            ) : null}
          </Row>
          {sales.length > 1 && <Row label={d("rows.earlierOrders")}>{sales.slice(1).map((s) => `ORD-${s.orderId}`).join(", ")}</Row>}
          {topUps.length > 0 && <Row label={d("rows.dataAddedLater")}>{topUps.map((s) => `ORD-${s.orderId} (${s.planName})`).join(", ")}</Row>}
        </Section>

        <Section title={d("sections.customer")}>
          <Row label={d("rows.name")}>{sim.customerName}</Row>
          <Row label={d("rows.email")}>{sim.customerEmail}</Row>
          <Row label={d("rows.billingCountry")}>{sim.billingCountry}</Row>
        </Section>

        <Section title={d("sections.sim")}>
          <Row label={d("rows.msisdn")}>{sim.msisdn ? `+${sim.msisdn}` : null}</Row>
          <Row label={d("rows.simStatus")}>{snap?.simStatus}</Row>
          <Row label={d("rows.esimProfile")}>{snap?.esimProfileStatus}</Row>
          <Row label={d("rows.profileUpdated")}>{snap?.esimProfileDate ? fmt(snap.esimProfileDate) : null}</Row>
          <Row label={d("rows.activated")}>{snap?.simActivationDate ? fmt(snap.simActivationDate) : null}</Row>
          <Row label={d("rows.lastSeen")}>{snap?.lastSeenDate ? fmt(snap.lastSeenDate) : null}</Row>
          <Row label={d("rows.lastCountry")}>{snap?.lastOriginCountry}</Row>
        </Section>

        <Section title={d("sections.plan")}>
          <Row label={d("rows.status")}>
            <span className="inline-flex items-center gap-2">
              <UsageBadge status={usageStatus(snap)} />
              {snap?.planStatus && <span className="text-xs text-muted">({snap.planStatus})</span>}
            </span>
          </Row>
          <Row label={d("rows.dataUsed")}>{snap?.dataTotalKb != null ? d("usedOf", { used: formatKb(used), total: formatKb(snap.dataTotalKb) }) : null}</Row>
          <Row label={d("rows.dataLeft")}>{snap?.dataRemainingKb != null ? formatKb(snap.dataRemainingKb) : null}</Row>
          <Row label={d("rows.started")}>{snap?.planActivationDate ? fmt(snap.planActivationDate) : null}</Row>
          <Row label={d("rows.expires")}>{snap?.planExpiryDate ? fmt(snap.planExpiryDate) : null}</Row>
        </Section>
      </div>

      {snap && snap.plans.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-ink">{d("everyPlan")}</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  {(["product", "status", "bought", "started", "expires", "dataLeft"] as const).map((c) => (
                    <th key={c} className="px-4 py-3 font-semibold">
                      {d(`columns.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {snap.plans.map((plan) => (
                  <tr key={plan.subscriptionId}>
                    <td className="px-4 py-3 font-mono text-xs text-ink">
                      {plan.productId}
                      {plan.subscriptionId === sim.transatelSubscriptionId && <span className="ml-1.5 font-sans text-orange">{d("thisOrder")}</span>}
                    </td>
                    <td className="px-4 py-3 text-ink">{plan.status}</td>
                    <td className="px-4 py-3 text-muted">{fmt(plan.subscriptionDate)}</td>
                    <td className="px-4 py-3 text-muted">{fmt(plan.activationDate)}</td>
                    <td className="px-4 py-3 text-muted">{fmt(plan.expirationDate)}</td>
                    <td className="px-4 py-3 text-muted">
                      {plan.dataRemainingKb != null ? d("usedOf", { used: formatKb(plan.dataRemainingKb), total: formatKb(plan.dataTotalKb) }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
