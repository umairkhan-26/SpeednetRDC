import type { ReactNode } from "react";
import type { AppLocale } from "@/i18n/routing";
import Header from "./Header";
import Footer from "./Footer";
import ChatBubble from "./ChatBubble";
import CursorTrail from "./CursorTrail";

export default function SiteChrome({
  children,
  locale,
}: {
  children: ReactNode;
  locale: AppLocale;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <ChatBubble />
      <CursorTrail />
    </>
  );
}
