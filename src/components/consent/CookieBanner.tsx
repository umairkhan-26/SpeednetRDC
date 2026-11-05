"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { OPEN_COOKIE_SETTINGS_EVENT, readConsent, subscribeConsent, writeConsent, type ConsentChoice } from "@/lib/consent";
import { clearMetaCookies, metaPixelEnabled } from "@/lib/meta/pixel";

/**
 * Accept / Reject banner for the optional Meta cookies, shown until the
 * visitor chooses, and again from "Cookie settings" in the footer. Both
 * buttons look the same: rejecting is as easy as accepting.
 */
export default function CookieBanner({ privacyLink }: { privacyLink: boolean }) {
  const t = useTranslations("consent");
  const locale = useLocale();
  // The choice lives in a browser cookie; on the server it reads as "unknown"
  // so the banner never flashes into server-rendered HTML.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => "unknown" as const);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const reopen = () => setSettingsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const open = metaPixelEnabled() && (consent === null || settingsOpen);

  function choose(choice: ConsentChoice) {
    const before = readConsent();
    writeConsent(choice);
    setSettingsOpen(false);
    // A Pixel that already loaded can't be unloaded: clear its cookies and
    // reload so nothing from Meta keeps running on this page.
    if (choice === "denied" && before === "granted") {
      clearMetaCookies();
      window.location.reload();
    }
  }

  if (!open) return null;

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
            {t("text")}
            {privacyLink && (
              <>
                {" "}
                <a href={`/${locale}/privacy`} className="font-semibold text-white underline hover:text-orange-soft">
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
