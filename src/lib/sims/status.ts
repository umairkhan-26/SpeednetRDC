import type { SimSnapshot } from "./repository";
import { seenOutsidePlanCoverage } from "./coverage";

/** The admin SIMs page's "status" filter, from the plan's Transatel status. */
export type UsageStatus = "active" | "not_used" | "expired" | "unknown";

/** In filter order; labels are in the admin messages (admin.badges.usage). */
export const USAGE_STATUSES: UsageStatus[] = ["active", "not_used", "expired", "unknown"];

const NOT_STARTED = new Set(["pending", "pendingForFirstUse", "readyForUse", "scheduled"]);

export function usageStatus(snapshot: SimSnapshot | null, now = Date.now()): UsageStatus {
  if (!snapshot?.fetchedAt || !snapshot.planStatus) return "unknown";
  const expiry = snapshot.planExpiryDate ? Date.parse(snapshot.planExpiryDate) : NaN;
  if (snapshot.planStatus === "terminated" || (!Number.isNaN(expiry) && expiry < now)) return "expired";
  if (snapshot.planStatus === "active") return "active";
  if (NOT_STARTED.has(snapshot.planStatus)) return "not_used";
  return "unknown";
}

/**
 * How a SIM looks at a glance in the admin panel (colours: green, blue, red).
 *  working = data is being used            -> green
 *  idle    = installed / waiting for use   -> blue
 *  problem = deleted eSIM, or seen in a country the plan doesn't cover -> red
 *  ended   = plan expired or finished      -> grey
 */
export type SimHealth = "working" | "idle" | "problem" | "ended" | "unknown";

export function simHealth(snapshot: SimSnapshot | null, planId: string | null, now = Date.now()): SimHealth {
  if (!snapshot?.fetchedAt) return "unknown";
  const usage = usageStatus(snapshot, now);
  if (usage === "expired") return "ended";
  if (snapshot.esimProfileStatus === "DELETED" || seenOutsidePlanCoverage(planId, snapshot.lastOriginCountry)) return "problem";
  if (usage === "active") return "working";
  if (usage === "not_used") return "idle";
  return snapshot.simStatus ? "idle" : "unknown";
}

/** Left edge of a row in the SIM list. */
export const HEALTH_BORDER: Record<SimHealth, string> = {
  working: "border-green-500",
  idle: "border-sky-400",
  problem: "border-red-500",
  ended: "border-ink/20",
  unknown: "border-transparent",
};

/** e.g. 1536 KB -> "1.5 MB", 3145728 KB -> "3 GB". */
export function formatKb(kb: number | null): string {
  if (kb === null) return "—";
  if (kb >= 1024 * 1024) return `${+(kb / 1024 / 1024).toFixed(2)} GB`;
  if (kb >= 1024) return `${+(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}
