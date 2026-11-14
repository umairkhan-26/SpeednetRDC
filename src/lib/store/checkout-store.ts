"use client";

import { create } from "zustand";
import type { Plan } from "../types";

export type CheckoutStep = "plan" | "account" | "payment";

/** "new": buy a new eSIM · "topup": add the plan to a SIM the customer already has. */
export type CheckoutMode = "new" | "topup";

interface CheckoutState {
  plan: Plan | null;
  step: CheckoutStep;
  fullName: string;
  email: string;
  mode: CheckoutMode;
  /** The SIM the plan goes on, once checked (top-ups only). */
  topUpIccid: string | null;
  /** From "Buy more data" on My SIMs: preselects "Add to my SIM" with this SIM. */
  suggestedIccid: string | null;
  /** Country page slug the suggested / chosen SIM was bought for, when known (for the coverage warning). */
  suggestedCountrySlug: string | null;
  topUpCountrySlug: string | null;
  startCheckout: (plan: Plan, mode?: CheckoutMode) => void;
  setStep: (step: CheckoutStep) => void;
  setAccountDetails: (fullName: string, email: string) => void;
  setTopUpIccid: (iccid: string | null, countrySlug?: string | null) => void;
  suggestTopUp: (iccid: string, countrySlug?: string | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  plan: null,
  step: "plan",
  fullName: "",
  email: "",
  mode: "new",
  topUpIccid: null,
  suggestedIccid: null,
  suggestedCountrySlug: null,
  topUpCountrySlug: null,
  startCheckout: (plan, mode = "new") => set({ plan, step: "plan", mode, topUpIccid: null, topUpCountrySlug: null }),
  setStep: (step) => set({ step }),
  setAccountDetails: (fullName, email) => set({ fullName, email }),
  setTopUpIccid: (iccid, countrySlug = null) => set({ topUpIccid: iccid, topUpCountrySlug: iccid ? countrySlug : null }),
  suggestTopUp: (iccid, countrySlug = null) => set({ suggestedIccid: iccid, suggestedCountrySlug: countrySlug, mode: "topup" }),
  reset: () => set({ plan: null, step: "plan", fullName: "", email: "", mode: "new", topUpIccid: null, suggestedIccid: null, suggestedCountrySlug: null, topUpCountrySlug: null }),
}));
