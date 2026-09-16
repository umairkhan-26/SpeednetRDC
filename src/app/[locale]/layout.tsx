import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Manrope } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import "../globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import Providers from "../providers";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const TITLE = "SpeedNetRDC — Instant eSIM Data, Anywhere";
const DESCRIPTION =
  "Stay connected in 190+ destinations with instant eSIM data. No roaming stress, no physical SIM.";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}/${l}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: `${SITE_URL}/${locale}`,
      siteName: "SpeedNetRDC",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Passed explicitly rather than relying on next-intl's request-config
  // auto-detection (which depends on a header forwarded via Proxy's
  // NextResponse.next({request:{headers}}) — verified broken in this
  // Next.js version/webpack setup: a hand-rolled test header set the same
  // way never reached a Server Component's headers() read). params.locale
  // is Next's own dynamic route segment resolution, independently verified
  // reliable via the <html lang> attribute.
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <SiteChrome locale={locale}>{children}</SiteChrome>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
