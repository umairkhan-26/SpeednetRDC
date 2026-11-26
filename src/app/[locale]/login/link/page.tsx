import type { Metadata } from "next";
import { readPendingLink } from "@/lib/customer/social/cookies";
import { PROVIDER_NAMES } from "@/lib/customer/social/providers";
import LinkClient from "./LinkClient";

// It shows the visitor's email address: never indexed, never cached.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Where Google or Apple sign-in lands when we still need to know which email the orders use. */
export default async function LinkAccountPage() {
  const pending = await readPendingLink();
  return <LinkClient pending={pending ? { provider: PROVIDER_NAMES[pending.provider], email: pending.email, relay: pending.relay } : null} />;
}
