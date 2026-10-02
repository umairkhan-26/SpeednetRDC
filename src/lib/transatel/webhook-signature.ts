import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies Transatel's Data Stream signature: header X-TSL-Signature-256 is
 * "sha256=" + hex(HMAC-SHA256(raw request body, our webhook secret)).
 * Must be computed over the exact raw body, before any JSON parsing.
 */
export function isValidTransatelSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header || !secret) return false;
  const received = header.trim().replace(/^sha256=/i, "");
  if (!/^[0-9a-f]{64}$/i.test(received)) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return timingSafeEqual(Buffer.from(received.toLowerCase(), "hex"), Buffer.from(expected, "hex"));
}
