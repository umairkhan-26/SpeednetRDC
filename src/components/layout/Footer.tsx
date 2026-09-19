import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Footer({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const shopLinks = [
    { label: tNav("esimStore"), href: "/esim-store" },
    { label: tNav("destinations"), href: "/destinations" },
    { label: tNav("regionalPlans"), href: "/regional-plans" },
    { label: t("globalEsim"), href: "/global-plans" },
  ];

  const supportLinks = [
    { label: tNav("howItWorks"), href: "/how-it-works" },
    { label: t("deviceCompatibility"), href: "/device-compatibility" },
    { label: t("helpCenter"), href: "/help" },
    { label: tNav("myEsims"), href: "/account" },
  ];

  return (
    <footer className="bg-ink text-white">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo theme="dark" href={`/${locale}`} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{t("tagline")}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/40">
            {t("shopHeading")}
          </h3>
          <ul className="mt-4 space-y-3">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/40">
            {t("supportHeading")}
          </h3>
          <ul className="mt-4 space-y-3">
            {supportLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/40">
            {t("languageHeading")}
          </h3>
          <div className="mt-4">
            <LanguageSwitcher theme="dark" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-page flex flex-col gap-2 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>
            {t("designedBy")}{" "}
            <a
              href="https://corenovait.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white"
            >
              CoreNovaIT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
