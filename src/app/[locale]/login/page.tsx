import type { Metadata } from "next";
import LoginClient from "./LoginClient";
import { pageUrls } from "@/i18n/metadata";
import { enabledProviders, isSocialProvider, PROVIDER_NAMES } from "@/lib/customer/social/providers";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageUrls(locale, "/login");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ social?: string | string[]; provider?: string | string[] }> }) {
  // social=failed: the visitor is back from Google or Apple without being signed in.
  const { social, provider } = await searchParams;
  const failed = social === "failed" && typeof provider === "string" && isSocialProvider(provider) ? PROVIDER_NAMES[provider] : null;
  return <LoginClient providers={enabledProviders()} failedProvider={failed} />;
}
