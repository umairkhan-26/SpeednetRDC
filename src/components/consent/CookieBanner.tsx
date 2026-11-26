"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { languageTag } from "@/i18n/routing";
import {
  acceptedVendors,
  consentChoice,
  OPEN_COOKIE_SETTINGS_EVENT,
  readConsentCookie,
  subscribeConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";
import { clearTrackingCookies } from "@/lib/tracking/cookies";
import { enabledVendors, VENDOR_NAMES } from "@/lib/tracking/vendors";

/**
 * Accept / Reject banner for the optional advertising and analytics cookies,
 * shown until the visitor chooses (again if a new tool is switched on after
 * they accepted), and from "Cookie settings" in the footer. It names only the
 * tools that are switched on. Both buttons look the same: rejecting is as easy
 * as accepting.
 */
export default function CookieBanner({ privacyLink }: { privacyLink: boolean }) {
  const t = useTranslations("consent");
  const locale = useLocale();
  // The choice lives in a browser cookie; on the server it reads as "unknown"
  // so the banner never flashes into server-rendered HTML.
  const consent = useSyncExternalStore(subscribeConsent, readConsentCookie, () => "unknown" as const);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const reopen = () => setSettingsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const vendors = enabledVendors();
  const choice = consent === "unknown" ? "unknown" : consentChoice(consent);
  // Accepted before one of today's tools was switched on: ask again.
  const outdated = choice === "granted" && vendors.some((vendor) => !acceptedVendors(consent).includes(vendor));
  const open = vendors.length > 0 && (choice === null || outdated || settingsOpen);

  function choose(next: ConsentChoice) {
    const before = consentChoice(readConsentCookie());
    writeConsent(next, vendors);
    setSettingsOpen(false);
    // A tool that already loaded can't be unloaded: clear its cookies and
    // reload so nothing from it keeps running on this page.
    if (next === "denied" && before === "granted") {
      clearTrackingCookies();
      window.location.reload();
    }
  }

  if (!open) return null;

  const metaOnly = vendors.length === 1 && vendors[0] === "meta";
  const partners = new Intl.ListFormat(languageTag(locale), { type: "conjunction" }).format(vendors.map((vendor) => VENDOR_NAMES[vendor]));
  const text = metaOnly
    ? t("text")
    : [t("textPartners", { partners }), vendors.includes("meta") ? t("textMetaHashed") : "", t("textChange")].filter(Boolean).join(" ");

  const button =
    "min-w-28 rounded-full border border-white/30 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white/90";

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cookie-banner-title" className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl bg-ink p-5 text-white shadow-2xl sm:flex-row sm:items-center">
        <div className="flex-1 text-sm">
          <p id="cookie-banner-title" className="font-semibold">
            {t("title")}
          </p>
          <p className="mt-1 text-white/80">
            {text}
            {privacyLink && (
              <>
                {" "}
                <a href={`/${locale}/privacy#cookies`} className="font-semibold text-white underline hover:text-orange-soft">
                  {t("learnMore")}
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" className={button} onClick={() => choose("denied")}>
            {t("reject")}
          </button>
          <button type="button" className={button} onClick={() => choose("granted")}>
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
