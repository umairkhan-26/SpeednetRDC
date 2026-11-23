"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, Phone, X } from "lucide-react";
import { clsx } from "clsx";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");

  const navLinks = [
    { label: t("esimStore"), href: "/esim-store" },
    { label: t("destinations"), href: "/destinations" },
    { label: t("regionalPlans"), href: "/regional-plans" },
    { label: t("globalPlans"), href: "/global-plans" },
    { label: t("physicalSim"), href: "/physical-sim" },
    { label: t("howItWorks"), href: "/how-it-works" },
    { label: t("help"), href: "/help" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="container-header flex h-16 items-center justify-between gap-6">
        <div className="shrink-0">
          <Logo href={`/${locale}`} />
        </div>

        <nav className="hidden min-w-0 items-center gap-5 min-[1340px]:flex min-[1560px]:gap-7">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "whitespace-nowrap text-sm font-medium transition-colors",
                  active ? "text-orange" : "text-ink/80 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 min-[1340px]:flex">
          <LanguageSwitcher />
          <Link
            href="/account"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-soft"
          >
            <Phone className="size-4" />
            {t("myEsims")}
          </Link>
        </div>

        <button
          type="button"
          aria-label={t("toggleMenu")}
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line min-[1340px]:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-cream min-[1340px]:hidden">
          <nav className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-ink/5"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white"
            >
              <Phone className="size-4" />
              {t("myEsims")}
            </Link>
            <div className="mt-3 border-t border-line pt-3">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
