"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/staff/auth";
import { refreshAllSimStatuses, refreshSimStatus } from "./refresh";
import { getAdminT } from "@/i18n/admin";

/** A message for the person using the panel, in their admin-panel language (keys under admin.msg). */
async function msg(key: string, values?: Record<string, string | number>): Promise<string> {
  const t = await getAdminT();
  return t(`msg.${key}`, values);
}

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
  if (globalThis.__simRefreshRunning__) return { ok: false, message: await msg("simRefresh.running") };
  globalThis.__simRefreshRunning__ = true;
  try {
    const s = await refreshAllSimStatuses();
    revalidatePath("/admin/sims");
    const parts = [await msg("simRefresh.refreshed", { count: s.refreshed })];
    if (s.failed) parts.push(await msg("simRefresh.failed", { count: s.failed }));
    if (s.notFoundInTransatel) parts.push(await msg("simRefresh.notFound", { count: s.notFoundInTransatel }));
    if (s.billingCountriesFilled) parts.push(await msg("simRefresh.billing", { count: s.billingCountriesFilled }));
    return { ok: s.failed === 0, message: `${parts.join(", ")}.` };
  } catch (error) {
    console.error("[sims] Refresh failed:", error);
    return { ok: false, message: await msg("simRefresh.error", { error: error instanceof Error ? error.message : String(error) }) };
  } finally {
    globalThis.__simRefreshRunning__ = false;
  }
}

export async function refreshSimAction(iccid: string): Promise<SimRefreshResult> {
  await requireAdminSession();
  const result = await refreshSimStatus(iccid);
  revalidatePath("/admin/sims");
  revalidatePath(`/admin/sims/${iccid}`);
  return result.ok ? { ok: true, message: await msg("simRefresh.refreshedOne") } : { ok: false, message: await msg("simRefresh.error", { error: result.error }) };
}
