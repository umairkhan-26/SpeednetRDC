import { listOrdersForCustomer } from "@/lib/checkout/orders-repository";
import { isValidFullName } from "@/lib/validation";
import { getCustomerEmail, getCustomerName } from "./session";

/** Who is signed in at checkout, so they don't have to type their details again. */
export interface CheckoutCustomer {
  email: string;
  /** The name on their latest order, else the one Google gave; null when we have neither (checkout then asks for it). */
  fullName: string | null;
}

/**
 * Only for the signed-in visitor's own checkout page: the address comes from
 * their signed session cookie, never from the browser. A failed order lookup
 * must never stop a checkout, so it just means the name is asked again.
 */
export async function getCheckoutCustomer(): Promise<CheckoutCustomer | null> {
  const email = await getCustomerEmail();
  if (!email) return null;
  const signInName = await getCustomerName();
  const fallbackName = signInName && isValidFullName(signInName) ? signInName : null;
  try {
    const orders = await listOrdersForCustomer(email);
    const fullName = orders.map((order) => order.customerName?.trim() ?? "").find(isValidFullName) ?? fallbackName;
    return { email, fullName };
  } catch (error) {
    console.error("[checkout] Couldn't look up the signed-in customer's name:", error instanceof Error ? error.message : error);
    return { email, fullName: fallbackName };
  }
}
