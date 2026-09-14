"use client";

import { create } from "zustand";
import type { Plan } from "../types";
import type { CheckoutResult } from "../api/checkout";

export type CheckoutStep = "plan" | "account" | "payment" | "confirmation";
export type PaymentMethod = "card" | "apple-pay" | "google-pay" | "paypal";

interface CheckoutState {
  plan: Plan | null;
  step: CheckoutStep;
  fullName: string;
  email: string;
  paymentMethod: PaymentMethod;
  result: CheckoutResult | null;
  startCheckout: (plan: Plan) => void;
  setStep: (step: CheckoutStep) => void;
  setAccountDetails: (fullName: string, email: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setResult: (result: CheckoutResult) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  plan: null,
  step: "plan",
  fullName: "",
  email: "",
  paymentMethod: "card",
  result: null,
  startCheckout: (plan) => set({ plan, step: "plan", result: null }),
  setStep: (step) => set({ step }),
  setAccountDetails: (fullName, email) => set({ fullName, email }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setResult: (result) => set({ result }),
  reset: () => set({ plan: null, step: "plan", fullName: "", email: "", result: null }),
}));
