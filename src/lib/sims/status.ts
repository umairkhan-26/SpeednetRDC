import type { SimSnapshot } from "./repository";

/** The admin SIMs page's "status" filter, from the plan's Transatel status. */
export type UsageStatus = "active" | "not_used" | "expired" | "unknown";

export const USAGE_STATUS_LABELS: Record<UsageStatus, string> = {
  active: "Active",
  not_used: "Not yet used",
  expired: "Expired",
  unknown: "Not checked yet",
};

const NOT_STARTED = new Set(["pending", "pendingForFirstUse", "readyForUse", "scheduled"]);

export function usageStatus(snapshot: SimSnapshot | null, now = Date.now()): UsageStatus {
  if (!snapshot?.fetchedAt || !snapshot.planStatus) return "unknown";
  const expiry = snapshot.planExpiryDate ? Date.parse(snapshot.planExpiryDate) : NaN;
  if (snapshot.planStatus === "terminated" || (!Number.isNaN(expiry) && expiry < now)) return "expired";
  if (snapshot.planStatus === "active") return "active";
  if (NOT_STARTED.has(snapshot.planStatus)) return "not_used";
  return "unknown";
}

/** e.g. 1536 KB -> "1.5 MB", 3145728 KB -> "3 GB". */
export function formatKb(kb: number | null): string {
  if (kb === null) return "—";
  if (kb >= 1024 * 1024) return `${+(kb / 1024 / 1024).toFixed(2)} GB`;
  if (kb >= 1024) return `${+(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}
