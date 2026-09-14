"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { clsx } from "clsx";
import Logo from "./Logo";

const navLinks = [
  { label: "eSIM Store", href: "/esim-store" },
  { label: "Destinations", href: "/destinations" },
  { label: "Regional Plans", href: "/regional-plans" },
  { label: "Global Plans", href: "/global-plans" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Help", href: "/help" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition-colors",
                  active ? "text-orange" : "text-ink/80 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link href="/account/orders" className="text-sm font-medium text-ink/80 hover:text-ink">
            Orders
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-soft"
          >
            <Phone className="size-4" />
            My eSIMs
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-full border border-line lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-cream lg:hidden">
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
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-ink/5"
            >
              Orders
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-orange px-5 py-3 text-sm font-semibold text-white"
            >
              <Phone className="size-4" />
              My eSIMs
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
