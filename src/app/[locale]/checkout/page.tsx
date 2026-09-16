import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = { title: "Checkout — SpeedNetRDC" };

export default function CheckoutPage() {
  return <CheckoutClient />;
}
