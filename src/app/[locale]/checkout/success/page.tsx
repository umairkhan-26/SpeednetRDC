import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = { title: "Order confirmed — SpeedNetRDC" };

export default function CheckoutSuccessPage() {
  return <SuccessClient />;
}
