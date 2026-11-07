import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";
import Providers from "../providers";
import { getAdminLocale, loadAdminMessages } from "@/i18n/admin";
import { languageTag } from "@/i18n/routing";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SpeedNetRDC",
  robots: { index: false, follow: false },
};

export default async function InternalRootLayout({ children }: LayoutProps<"/">) {
  // The language picked with the switcher (a cookie; these pages have no
  // language in the URL). Client components read the "admin" texts from here.
  const locale = await getAdminLocale();
  const messages = await loadAdminMessages(locale);

  return (
    <html lang={languageTag(locale)} className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
