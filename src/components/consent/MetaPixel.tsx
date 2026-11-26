"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { readConsentCookie, subscribeConsent } from "@/lib/consent";
import { loadMetaPixel, trackMeta } from "@/lib/meta/pixel";

/** Loads the Meta Pixel once the visitor accepts cookies, and sends PageView on every page. */
export default function MetaPixel() {
  const pathname = usePathname();
  // The choice lives in a browser cookie; on the server nothing is known yet.
  const consent = useSyncExternalStore(subscribeConsent, readConsentCookie, () => null);

  useEffect(() => {
    // Both do nothing without an ID, without consent or on a private page.
    loadMetaPixel();
    trackMeta("PageView");
  }, [consent, pathname]);

  return null;
}
