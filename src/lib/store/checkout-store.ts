"use client";

import { create } from "zustand";
import type { Plan } from "../types";

export type CheckoutStep = "plan" | "account" | "payment";

interface CheckoutState {
  plan: Plan | null;
  step: CheckoutStep;
  fullName: string;
  email: string;
  startCheckout: (plan: Plan) => void;
  setStep: (step: CheckoutStep) => void;
  setAccountDetails: (fullName: string, email: string) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  plan: null,
  step: "plan",
  fullName: "",
  email: "",
  startCheckout: (plan) => set({ plan, step: "plan" }),
  setStep: (step) => set({ step }),
  setAccountDetails: (fullName, email) => set({ fullName, email }),
  reset: () => set({ plan: null, step: "plan", fullName: "", email: "" }),
}));
