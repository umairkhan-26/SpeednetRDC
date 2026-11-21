import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { languageTag } from "@/i18n/routing";
import { getCountryBySlug } from "@/data/countries";
import { legalPagesLive } from "@/lib/legal";
import { SOCIAL_LINKS, SUPPORT_EMAIL } from "@/lib/contact";
import CookieSettingsButton from "@/components/consent/CookieSettingsButton";
import LanguageSwitcher from "./LanguageSwitcher";
import SocialIcon from "./SocialIcon";

// Our most-visited places (all have country pages and plans).
const POPULAR = ["congo-democratic-republic", "morocco", "turkey", "spain", "france", "united-states", "thailand", "japan", "dominican-republic"] as const;

// "Congo Democratic Republic" reads awkwardly in a footer.
const SHORT_NAMES: Record<string, Record<string, string>> = {
  "congo-democratic-republic": { en: "DR Congo", fr: "RD Congo", es: "RD del Congo", pt: "RD Congo" },
};

const linkClass = "text-sm text-ink/75 transition-colors hover:text-orange";
const headingClass = "text-sm font-bold text-ink";

function VisaBadge() {
  return (
    <span className="inline-flex h-7 w-11 items-center justify-center rounded-md border border-line bg-white" role="img" aria-label="Visa">
      <svg viewBox="0 0 44 16" className="h-3 w-8" aria-hidden>
        <text x="22" y="13" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontStyle="italic" fontSize="15" fill="#1A1F71">
          VISA
        </text>
      </svg>
    </span>
  );
}

function MastercardBadge() {
  return (
    <span className="inline-flex h-7 w-11 items-center justify-center rounded-md border border-line bg-white" role="img" aria-label="Mastercard">
      <svg viewBox="0 0 32 20" className="h-4 w-7" aria-hidden>
        <circle cx="11" cy="10" r="8" fill="#EB001B" />
        <circle cx="21" cy="10" r="8" fill="#F79E1B" fillOpacity="0.92" />
      </svg>
    </span>
  );
}

export default async function Footer({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  // Country names in the visitor's own language for this list ("Maroc", "États-Unis"), falling back to English.
  let display: Intl.DisplayNames | null = null;
  try {
    display = new Intl.DisplayNames([languageTag(locale)], { type: "region", fallback: "none" });
  } catch {
    display = null;
  }
  const countryName = (iso: string, fallback: string) => display?.of(iso.toUpperCase()) || fallback;

  const popular = POPULAR.flatMap((slug) => {
    const country = getCountryBySlug(slug);
    if (!country) return [];
    return [{ slug, label: SHORT_NAMES[slug]?.[locale] ?? countryName(country.iso, country.name) }];
  });

  const company = [
    { label: tNav("physicalSim"), href: "/physical-sim" },
    { label: tNav("howItWorks"), href: "/how-it-works" },
    { label: t("deviceCompatibility"), href: "/device-compatibility" },
  ];
  const esim = [
    { label: tNav("esimStore"), href: "/esim-store" },
    { label: tNav("destinations"), href: "/destinations" },
    { label: tNav("regionalPlans"), href: "/regional-plans" },
    { label: t("globalEsim"), href: "/global-plans" },
  ];
  const help = [
    { label: t("helpCenter"), href: "/help" },
    { label: tNav("myEsims"), href: "/account" },
  ];

  const showCookieSettings = /^\d{5,20}$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "");
  const legalLive = legalPagesLive();
  const bottomLink = "text-ink/75 underline-offset-4 transition-colors hover:text-orange hover:underline";

  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:gap-x-8 lg:grid-cols-5 lg:py-14">
        <div>
          <h3 className={headingClass}>{t("popularDestinations")}</h3>
          <ul className="mt-5 space-y-3">
            {popular.map(({ slug, label }) => (
              <li key={slug}>
                <Link locale={locale} href={`/destinations/${slug}`} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={headingClass}>SpeedNetRDC</h3>
          <ul className="mt-5 space-y-3">
            {company.map((link) => (
              <li key={link.href}>
                <Link locale={locale} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={headingClass}>eSIM</h3>
          <ul className="mt-5 space-y-3">
            {esim.map((link) => (
              <li key={link.href}>
                <Link locale={locale} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={headingClass}>{t("supportHeading")}</h3>
          <ul className="mt-5 space-y-3">
            {help.map((link) => (
              <li key={link.href}>
                <Link locale={locale} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
                {t("contactUs")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={headingClass}>{t("followUs")}</h3>
          <ul className="mt-5 space-y-3">
            {SOCIAL_LINKS.map(({ network, href }) => (
              <li key={network}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("followOn", { network })}
                  className="flex items-center gap-3 text-sm text-ink/75 transition-colors hover:text-orange"
                >
                  <SocialIcon network={network} className="size-5 shrink-0" />
                  {network}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <LanguageSwitcher theme="light" />
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink/75 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
            <p>{t("copyright", { year: new Date().getFullYear() })}</p>
            {legalLive && (
              <>
                <Link locale={locale} href="/privacy" className={bottomLink}>
                  {t("privacy")}
                </Link>
                <Link locale={locale} href="/terms" className={bottomLink}>
                  {t("terms")}
                </Link>
                <Link locale={locale} href="/refunds" className={bottomLink}>
                  {t("refunds")}
                </Link>
                <Link locale={locale} href="/terms#legal-notice" className={bottomLink}>
                  {t("legalNotice")}
                </Link>
              </>
            )}
            {showCookieSettings && <CookieSettingsButton label={t("cookieSettings")} className={`text-left ${bottomLink}`} />}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-ink/60">{t("securePayments")}</span>
            <VisaBadge />
            <MastercardBadge />
          </div>
        </div>
        <p className="container-page pb-3 text-xs text-ink/60">{t("operatedBy")}</p>
        <div className="container-page pb-6 text-[11px] text-ink/50">
          {t("designedBy")}{" "}
          <a href="https://corenovait.com.au" target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-orange hover:underline">
            CoreNovaIT
          </a>
        </div>
      </div>
    </footer>
  );
}
