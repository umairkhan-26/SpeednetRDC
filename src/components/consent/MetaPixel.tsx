"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { readConsent, subscribeConsent } from "@/lib/consent";
import { loadMetaPixel, metaPixelEnabled, trackMeta } from "@/lib/meta/pixel";

/** Loads the Meta Pixel once the visitor accepts cookies, and sends PageView on every page. */
export default function MetaPixel() {
  const pathname = usePathname();
  // The choice lives in a browser cookie; on the server nothing is known yet.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);

  useEffect(() => {
    if (consent !== "granted" || !metaPixelEnabled()) return;
    loadMetaPixel();
    trackMeta("PageView");
  }, [consent, pathname]);

  return null;
}
