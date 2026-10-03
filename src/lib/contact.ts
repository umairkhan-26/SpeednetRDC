// How customers reach us. The WhatsApp number comes from
// NEXT_PUBLIC_WHATSAPP_NUMBER (international format, e.g. +32 470 12 34 56);
// it's built into the pages, so set it before deploying. Without it, the
// site offers email instead.
export const SUPPORT_EMAIL = "contact@speednetrdc.com";

/** A wa.me link with a pre-filled message, or null when no number is configured. */
export function whatsappUrl(message: string): string | null {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
