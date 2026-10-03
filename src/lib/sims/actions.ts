"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/staff/auth";
import { refreshAllSimStatuses, refreshSimStatus } from "./refresh";

export interface SimRefreshResult {
  ok: boolean;
  message: string;
}

declare global {
  var __simRefreshRunning__: boolean | undefined;
}

/** Admin-only: re-reads every sold SIM's status from Transatel (read-only calls). */
export async function refreshAllSimsAction(): Promise<SimRefreshResult> {
  await requireAdminSession();
  if (globalThis.__simRefreshRunning__) return { ok: false, message: "A refresh is already running — give it a moment." };
  globalThis.__simRefreshRunning__ = true;
  try {
    const s = await refreshAllSimStatuses();
    revalidatePath("/admin/sims");
    const parts = [`Refreshed ${s.refreshed} SIM${s.refreshed === 1 ? "" : "s"}`];
    if (s.failed) parts.push(`${s.failed} failed (see each SIM)`);
    if (s.notFoundInTransatel) parts.push(`${s.notFoundInTransatel} not found in Transatel's SIM Search`);
    if (s.billingCountriesFilled) parts.push(`${s.billingCountriesFilled} billing countr${s.billingCountriesFilled === 1 ? "y" : "ies"} filled in from Stripe`);
    return { ok: s.failed === 0, message: `${parts.join(", ")}.` };
  } catch (error) {
    console.error("[sims] Refresh failed:", error);
    return { ok: false, message: `Refresh failed: ${error instanceof Error ? error.message : String(error)}` };
  } finally {
    globalThis.__simRefreshRunning__ = false;
  }
}

export async function refreshSimAction(iccid: string): Promise<SimRefreshResult> {
  await requireAdminSession();
  const result = await refreshSimStatus(iccid);
  revalidatePath("/admin/sims");
  revalidatePath(`/admin/sims/${iccid}`);
  return result.ok ? { ok: true, message: "Refreshed from Transatel." } : { ok: false, message: `Refresh failed: ${result.error}` };
}
