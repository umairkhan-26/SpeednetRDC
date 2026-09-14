import { mockEsims, topUpPackages } from "@/data/esims";
import type { ActiveEsim } from "../types";
import { simulateLatency } from "./client";

export async function fetchEsims() {
  return simulateLatency(mockEsims);
}

export async function fetchEsim(iccid: string) {
  return simulateLatency(mockEsims.find((e) => e.iccid === iccid) ?? null);
}

export async function fetchTopUpPackages() {
  return simulateLatency(topUpPackages);
}

export async function topUpEsim(
  esim: ActiveEsim,
  packageId: string,
): Promise<{ success: true; newTotalGb: number }> {
  const pack = topUpPackages.find((p) => p.id === packageId);
  const addedGb = pack?.dataGb ?? 0;
  const newTotalGb = esim.dataTotalGb === "unlimited" ? Infinity : esim.dataTotalGb + addedGb;
  return simulateLatency({ success: true, newTotalGb }, 700);
}
