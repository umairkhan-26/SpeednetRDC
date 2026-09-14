"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatBubble from "./ChatBubble";
import CursorTrail from "./CursorTrail";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isInternalPortal = pathname?.startsWith("/staff") || pathname?.startsWith("/admin") || false;

  if (isInternalPortal) {
    return <div className="flex-1">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBubble />
      <CursorTrail />
    </>
  );
}
