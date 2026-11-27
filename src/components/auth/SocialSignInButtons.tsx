"use client";

import { useLocale, useTranslations } from "next-intl";
import { clsx } from "clsx";
import type { SocialProvider } from "@/lib/customer/social/providers";
import { AppleMark, GoogleMark } from "./SocialIcons";

const STYLES: Record<SocialProvider, string> = {
  google: "border border-ink/20 bg-white text-ink hover:bg-ink/5",
  apple: "border border-black bg-black text-white hover:bg-black/85",
};

export default function SocialSignInButtons({ providers, checkout }: { providers: SocialProvider[]; checkout?: { planId: string; topUp: boolean } }) {
  const locale = useLocale();
  const t = useTranslations("auth.social");
  if (providers.length === 0) return null;
  // From the checkout, so signing in comes back to the same plan.
  const back = checkout ? `&plan=${encodeURIComponent(checkout.planId)}${checkout.topUp ? "&mode=topup" : ""}` : "";

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        // A plain link: signing in leaves the site and comes back as a new page.
        <a
          key={provider}
          href={`/api/auth/${provider}/start?locale=${locale}${back}`}
          rel="nofollow"
          className={clsx("flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition-colors", STYLES[provider])}
        >
          {provider === "google" ? <GoogleMark /> : <AppleMark />}
          {t(provider === "google" ? "continueGoogle" : "continueApple")}
        </a>
      ))}
    </div>
  );
}
