// Which "Continue with …" buttons exist. A provider is offered only when all
// its settings are there (see .env.example); with none, the sign-in page is
// the emailed link alone. Server-only.

import { isCustomerSignInConfigured } from "../session";

export const SOCIAL_PROVIDERS = ["google", "apple"] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export const PROVIDER_NAMES: Record<SocialProvider, string> = { google: "Google", apple: "Apple" };

const SETTINGS: Record<SocialProvider, string[]> = {
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  apple: ["APPLE_CLIENT_ID", "APPLE_TEAM_ID", "APPLE_KEY_ID", "APPLE_PRIVATE_KEY"],
};

export function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as readonly string[]).includes(value);
}

export function isProviderEnabled(provider: SocialProvider): boolean {
  return isCustomerSignInConfigured() && SETTINGS[provider].every((name) => Boolean(process.env[name]));
}

export function enabledProviders(): SocialProvider[] {
  return SOCIAL_PROVIDERS.filter(isProviderEnabled);
}
