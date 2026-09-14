import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import Providers from "./providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SpeedNetRDC — Instant eSIM Data, Anywhere",
  description:
    "Stay connected in 190+ destinations with instant eSIM data. No roaming stress, no physical SIM.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
