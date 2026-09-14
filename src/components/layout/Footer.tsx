import Link from "next/link";
import Logo from "./Logo";

const shopLinks = [
  { label: "eSIM Store", href: "/esim-store" },
  { label: "Destinations", href: "/destinations" },
  { label: "Regional Plans", href: "/regional-plans" },
  { label: "Global eSIM", href: "/global-plans" },
];

const supportLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Device Compatibility", href: "/device-compatibility" },
  { label: "Help Center", href: "/help" },
  { label: "My eSIMs", href: "/account" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo theme="dark" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Stay Connected. Anywhere. Instant eSIM data in 190+ destinations, no roaming stress
            and no physical SIM.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/40">Shop</h3>
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/40">Support</h3>
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
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-page text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} SpeedNetRDC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
