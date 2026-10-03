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

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
  const sim = sales[0];
  if (!sim) notFound();

  const snap = sim.snapshot;
  const kind = orderKind(sim.stripeCheckoutSessionId);
  const used = snap?.dataTotalKb != null && snap.dataRemainingKb != null ? snap.dataTotalKb - snap.dataRemainingKb : null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/sims" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-orange">
          <ArrowLeft className="size-4" /> All SIMs
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-bold text-ink">{sim.iccid}</h1>
            <p className="mt-1 text-sm text-muted">
              {sim.simType === "physical" ? "Physical SIM" : sim.simType === "esim" ? "eSIM" : "Type unknown"} · Last refreshed{" "}
              {formatDateTime(snap?.fetchedAt ?? null)}
            </p>
            {snap?.error && (
              <p className="mt-1 text-sm text-red-700">
                Last refresh failed ({formatDateTime(snap.errorAt)}): {snap.error}
              </p>
            )}
          </div>
          <RefreshButton iccid={sim.iccid} label="Refresh this SIM" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Order">
          <Row label="Order">
            <span className="inline-flex items-center gap-1.5">
              ORD-{sim.orderId} <KindBadge kind={kind} />
            </span>
          </Row>
          <Row label="Date">{formatDateTime(sim.orderCreatedAt)}</Row>
          <Row label="Plan">{sim.planName}</Row>
          <Row label="Destination">{sim.countryName}</Row>
          <Row label="Payment">
            <PaymentBadge status={sim.paymentStatus} />
          </Row>
          <Row label="Delivery">
            <DeliveryBadge kind={kind} paymentStatus={sim.paymentStatus} deliveryStatus={sim.provisioningStatus} />
          </Row>
          <Row label="Customer page">
            {sim.accessToken && sim.paymentStatus === "completed" ? (
              <a href={`/en/order/${sim.accessToken}`} target="_blank" rel="noreferrer" className="font-semibold text-orange hover:underline">
                Open (shows the QR code — only share with the customer)
              </a>
            ) : null}
          </Row>
          {sales.length > 1 && <Row label="Earlier orders">{sales.slice(1).map((s) => `ORD-${s.orderId}`).join(", ")}</Row>}
        </Section>

        <Section title="Customer">
          <Row label="Name">{sim.customerName}</Row>
          <Row label="Email">{sim.customerEmail}</Row>
          <Row label="Billing country">{sim.billingCountry}</Row>
        </Section>

        <Section title="SIM (Transatel)">
          <Row label="MSISDN">{sim.msisdn ? `+${sim.msisdn}` : null}</Row>
          <Row label="SIM status">{snap?.simStatus}</Row>
          <Row label="eSIM profile">{snap?.esimProfileStatus}</Row>
          <Row label="Profile updated">{snap?.esimProfileDate ? formatDateTime(snap.esimProfileDate) : null}</Row>
          <Row label="Activated">{snap?.simActivationDate ? formatDateTime(snap.simActivationDate) : null}</Row>
          <Row label="Last seen">{snap?.lastSeenDate ? formatDateTime(snap.lastSeenDate) : null}</Row>
          <Row label="Last country">{snap?.lastOriginCountry}</Row>
        </Section>

        <Section title="Plan">
          <Row label="Status">
            <span className="inline-flex items-center gap-2">
              <UsageBadge status={usageStatus(snap)} />
              {snap?.planStatus && <span className="text-xs text-muted">({snap.planStatus})</span>}
            </span>
          </Row>
          <Row label="Data used">{snap?.dataTotalKb != null ? `${formatKb(used)} of ${formatKb(snap.dataTotalKb)}` : null}</Row>
          <Row label="Data left">{snap?.dataRemainingKb != null ? formatKb(snap.dataRemainingKb) : null}</Row>
          <Row label="Started">{snap?.planActivationDate ? formatDateTime(snap.planActivationDate) : null}</Row>
          <Row label="Expires">{snap?.planExpiryDate ? formatDateTime(snap.planExpiryDate) : null}</Row>
        </Section>
      </div>

      {snap && snap.plans.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-ink">Every plan on this SIM</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Bought</th>
                  <th className="px-4 py-3 font-semibold">Started</th>
                  <th className="px-4 py-3 font-semibold">Expires</th>
                  <th className="px-4 py-3 font-semibold">Data left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {snap.plans.map((plan) => (
                  <tr key={plan.subscriptionId}>
                    <td className="px-4 py-3 font-mono text-xs text-ink">
                      {plan.productId}
                      {plan.subscriptionId === sim.transatelSubscriptionId && <span className="ml-1.5 font-sans text-orange">(this order)</span>}
                    </td>
                    <td className="px-4 py-3 text-ink">{plan.status}</td>
                    <td className="px-4 py-3 text-muted">{formatDateTime(plan.subscriptionDate)}</td>
                    <td className="px-4 py-3 text-muted">{formatDateTime(plan.activationDate)}</td>
                    <td className="px-4 py-3 text-muted">{formatDateTime(plan.expirationDate)}</td>
                    <td className="px-4 py-3 text-muted">
                      {plan.dataRemainingKb != null ? `${formatKb(plan.dataRemainingKb)} of ${formatKb(plan.dataTotalKb)}` : "—"}
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
