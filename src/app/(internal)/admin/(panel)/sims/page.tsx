import Link from "next/link";
import { requireAdminSession } from "@/lib/staff/auth";
import { orderKind } from "@/lib/checkout/order-kind";
import { listSoldSims, SOLD_SIM_LIMIT, type SoldSim } from "@/lib/sims/repository";
import { formatKb, USAGE_STATUS_LABELS, usageStatus, type UsageStatus } from "@/lib/sims/status";
import { DeliveryBadge, KindBadge, UsageBadge } from "../Badges";
import RefreshButton from "./RefreshButton";

type Params = Record<"q" | "status" | "type" | "country" | "from" | "to", string>;
const PARAM_KEYS: (keyof Params)[] = ["q", "status", "type", "country", "from", "to"];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Search box: email, order number (ORD-12 or 12), ICCID or MSISDN (with or without +). */
function matchesSearch(sim: SoldSim, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const orderNumber = /^(ord-?)?(\d+)$/.exec(query);
  if (orderNumber && Number(orderNumber[2]) === sim.orderId) return true;
  const digits = query.replace(/[\s+]/g, "");
  const isNumber = /^\d{4,}$/.test(digits);
  return (
    sim.customerEmail.toLowerCase().includes(query) ||
    (isNumber && (sim.iccid.includes(digits) || Boolean(sim.msisdn?.includes(digits))))
  );
}

function applyFilters(sims: SoldSim[], p: Params): SoldSim[] {
  const from = p.from ? Date.parse(`${p.from}T00:00:00Z`) : NaN;
  const to = p.to ? Date.parse(`${p.to}T23:59:59Z`) : NaN;
  return sims.filter((sim) => {
    const created = Date.parse(sim.orderCreatedAt);
    return (
      matchesSearch(sim, p.q) &&
      (!p.status || usageStatus(sim.snapshot) === p.status) &&
      (!p.type || sim.simType === p.type) &&
      (!p.country || sim.countryName === p.country) &&
      (Number.isNaN(from) || created >= from) &&
      (Number.isNaN(to) || created <= to)
    );
  });
}

const selectClass = "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange";

export default async function AdminSimsPage({ searchParams }: { searchParams: Promise<Partial<Record<keyof Params, string | string[]>>> }) {
  await requireAdminSession();
  const raw = await searchParams;
  const params = Object.fromEntries(PARAM_KEYS.map((k) => [k, typeof raw[k] === "string" ? raw[k] : ""])) as Params;

  const sims = await listSoldSims();
  const filtered = applyFilters(sims, params);
  const countries = [...new Set(sims.map((s) => s.countryName))].sort();
  const lastRefresh = sims.reduce<string | null>((latest, s) => {
    const at = s.snapshot?.fetchedAt ?? null;
    return at && (!latest || at > latest) ? at : latest;
  }, null);
  const filtersActive = PARAM_KEYS.some((k) => params[k]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">SIMs</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Every SIM we&apos;ve sold, with its last known status from Transatel. Statuses are cached — use Refresh to re-read them (read-only
            requests; nothing changes on Transatel&apos;s side). Last refreshed: {lastRefresh ? formatDateTime(lastRefresh) : "never"}.
          </p>
        </div>
        <RefreshButton label="Refresh from Transatel" />
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Email, order number, ICCID or MSISDN"
          className="w-full max-w-xs rounded-lg border border-line bg-white px-3.5 py-2 text-sm outline-none focus:border-orange"
        />
        <select name="status" defaultValue={params.status} className={selectClass} aria-label="Status">
          <option value="">Any status</option>
          {(Object.keys(USAGE_STATUS_LABELS) as UsageStatus[]).map((s) => (
            <option key={s} value={s}>
              {USAGE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={params.type} className={selectClass} aria-label="SIM type">
          <option value="">eSIM and physical</option>
          <option value="esim">eSIM</option>
          <option value="physical">Physical SIM</option>
        </select>
        <select name="country" defaultValue={params.country} className={selectClass} aria-label="Destination">
          <option value="">Any destination</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="text-xs text-muted">
          From
          <input type="date" name="from" defaultValue={params.from} className={`${selectClass} ml-1.5`} />
        </label>
        <label className="text-xs text-muted">
          To
          <input type="date" name="to" defaultValue={params.to} className={`${selectClass} ml-1.5`} />
        </label>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Filter
        </button>
        {filtersActive && (
          <Link href="/admin/sims" className="py-2 text-sm font-medium text-muted hover:text-orange">
            Clear
          </Link>
        )}
      </form>

      <p className="text-xs text-muted">
        {filtered.length === 0
          ? "No SIMs match."
          : `${filtered.length} SIM${filtered.length === 1 ? "" : "s"}${filtersActive ? ` (of ${sims.length})` : ""}.`}
        {sims.length === SOLD_SIM_LIMIT && ` Only the ${SOLD_SIM_LIMIT} most recent sales are loaded.`} &ldquo;Destination&rdquo; is the
        country the plan was bought for; the billing country comes from Stripe and the last country from Transatel.
      </p>

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">SIM</th>
                <th className="px-4 py-3 font-semibold">Transatel</th>
                <th className="px-4 py-3 font-semibold">Plan status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((sim) => {
                const kind = orderKind(sim.stripeCheckoutSessionId);
                const snap = sim.snapshot;
                const usage = usageStatus(snap);
                const used = snap?.dataTotalKb != null && snap.dataRemainingKb != null ? snap.dataTotalKb - snap.dataRemainingKb : null;
                return (
                  <tr key={`${sim.orderId}-${sim.iccid}`} className="align-top">
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-1.5 font-medium whitespace-nowrap text-ink">
                        ORD-{sim.orderId} <KindBadge kind={kind} />
                      </p>
                      <p className="text-xs text-muted">{formatDate(sim.orderCreatedAt)}</p>
                      {sim.provisioningStatus !== "provisioned" && (
                        <div className="mt-1">
                          <DeliveryBadge kind={kind} paymentStatus={sim.paymentStatus} deliveryStatus={sim.provisioningStatus} />
                        </div>
                      )}
                      {sim.paymentStatus === "refunded" && <p className="mt-1 text-xs text-orange">Refunded</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{sim.planName}</p>
                      <p className="text-xs text-muted">{sim.countryName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{sim.customerName}</p>
                      <p className="text-xs text-muted">{sim.customerEmail}</p>
                      <p className="text-xs text-muted">Billing: {sim.billingCountry ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink">
                      <Link href={`/admin/sims/${sim.iccid}`} className="hover:text-orange hover:underline">
                        {sim.iccid}
                      </Link>
                      <p className="text-muted">{sim.msisdn ? `+${sim.msisdn}` : "—"}</p>
                      <p className="font-sans text-muted">{sim.simType === "physical" ? "Physical SIM" : sim.simType === "esim" ? "eSIM" : "Type unknown"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {snap?.fetchedAt ? (
                        <>
                          <p className="text-ink">{snap.simStatus ?? "—"}</p>
                          {snap.esimProfileStatus && <p>Profile: {snap.esimProfileStatus}</p>}
                          <p>Activated: {formatDate(snap.simActivationDate)}</p>
                          <p>Last seen: {formatDate(snap.lastSeenDate)}</p>
                          <p>Last country: {snap.lastOriginCountry ?? "—"}</p>
                        </>
                      ) : (
                        <p>Not checked yet</p>
                      )}
                      {snap?.error && <p className="mt-1 text-red-700">Last refresh failed</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      <UsageBadge status={usage} />
                      {snap?.dataTotalKb != null && (
                        <p className="mt-1">
                          {formatKb(used)} used of {formatKb(snap.dataTotalKb)}
                          <br />
                          {formatKb(snap.dataRemainingKb)} left
                        </p>
                      )}
                      {snap?.planExpiryDate && <p>Expires: {formatDate(snap.planExpiryDate)}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <Link href={`/admin/sims/${sim.iccid}`} className="block font-semibold text-orange hover:underline">
                        Details
                      </Link>
                      {sim.accessToken && sim.paymentStatus === "completed" && (
                        <a href={`/en/order/${sim.accessToken}`} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-orange hover:underline">
                          Customer page
                        </a>
                      )}
                    </td>
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
