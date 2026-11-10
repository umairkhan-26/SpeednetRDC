import type { SocialNetwork } from "@/lib/contact";

// Simple brand glyphs (lucide-react no longer ships brand icons).
export default function SocialIcon({ network, className }: { network: SocialNetwork; className?: string }) {
  if (network === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  if (network === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 3c.4 2.3 1.8 3.8 4.4 4v3.4a8 8 0 0 1-4.4-1.3v6.2c0 3.4-2.7 5.7-5.7 5.7A5.6 5.6 0 0 1 5.3 15.4c0-3.4 2.9-6 6.5-5.5v3.5c-1.7-.4-3.1.7-3.1 2.1 0 1.2.9 2.1 2.2 2.1 1.3 0 2.3-.9 2.3-2.5V3h3.4Z" />
    </svg>
  );
}
