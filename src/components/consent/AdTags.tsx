"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { readConsentCookie, subscribeConsent } from "@/lib/consent";
import { loadGoogleTag } from "@/lib/tracking/google";
import { tikTokPageView } from "@/lib/tracking/tiktok";

/** Loads the Google tag and the TikTok Pixel once the visitor accepts their cookies, and counts page views. */
export default function AdTags() {
  const pathname = usePathname();
  // The choice lives in a browser cookie; on the server nothing is known yet.
  const consent = useSyncExternalStore(subscribeConsent, readConsentCookie, () => null);

  useEffect(() => {
    // Both do nothing without an ID, without consent or on a private page.
    loadGoogleTag();
    tikTokPageView();
  }, [consent, pathname]);

  return null;
}
