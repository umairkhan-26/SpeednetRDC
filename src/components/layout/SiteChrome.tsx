import type { ReactNode } from "react";
import type { AppLocale } from "@/i18n/routing";
import Header from "./Header";
import Footer from "./Footer";
import ChatBubble from "./ChatBubble";
import CursorTrail from "./CursorTrail";
import { isPhysicalSimEnabled } from "@/lib/physical-sim";

export default function SiteChrome({
  children,
  locale,
}: {
  children: ReactNode;
  locale: AppLocale;
}) {
  return (
    <>
      <Header showPhysicalSim={isPhysicalSimEnabled()} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <ChatBubble />
      <CursorTrail />
    </>
  );
}
