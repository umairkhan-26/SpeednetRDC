// Where a visitor goes once signed in with Google or Apple: their account, or
// back to the checkout they left, with the same plan. Server-only.

/** The checkout the sign-in started from. */
export interface CheckoutReturn {
  planId: string;
  /** "Add to my SIM" was chosen. */
  topUp: boolean;
}

export function checkoutPath(locale: string, checkout: CheckoutReturn, extra: Record<string, string> = {}): string {
  const query = new URLSearchParams({ plan: checkout.planId, ...(checkout.topUp ? { mode: "topup" } : {}), ...extra });
  return `/${locale}/checkout?${query}`;
}

export const signedInPath = (locale: string, checkout?: CheckoutReturn) => (checkout ? checkoutPath(locale, checkout) : `/${locale}/account`);
