import type { Metadata } from "next";
import LoginClient from "./LoginClient";
import { pageUrls } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageUrls(locale, "/login");
}

export default function LoginPage() {
  return <LoginClient />;
}
