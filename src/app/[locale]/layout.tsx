import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { manrope } from "@/fonts/manrope";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import "../globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import Providers from "../providers";
import { SITE_URL } from "@/lib/site";
import { SOCIAL_LINKS, SUPPORT_EMAIL } from "@/lib/contact";
import { languageTag, routing, textDirection } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { loadMessages } from "@/i18n/messages";



export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale, namespace: "meta" });
  const TITLE = t("siteTitle");
  const DESCRIPTION = t("siteDescription");

  return {
    metadataBase: new URL(SITE_URL),
    title: TITLE,
    description: DESCRIPTION,
    // No canonical here: each page sets its own (pageUrls in src/i18n/metadata.ts).
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: "SpeedNetRDC",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: TITLE,
      description: DESCRIPTION,
    },
    // Meta Business domain verification (a public value, not a secret).
    verification: {
      other: { "facebook-domain-verification": "ytdt36unujf4wlsxfdsywh8sos9op7" },
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
  const messages = await loadMessages(locale);

  // Tells search engines which social accounts are ours.
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SpeedNetRDC",
    url: SITE_URL,
    email: SUPPORT_EMAIL,
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };

  return (
    <html lang={languageTag(locale)} dir={textDirection(locale)} className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <SiteChrome locale={locale}>{children}</SiteChrome>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
