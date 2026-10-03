/**
 * Transactional email via Resend (https://resend.com/docs/api-reference/emails/send-email).
 *
 * Env vars:
 *   RESEND_API_KEY  — a "sending access" key from Resend
 *   EMAIL_FROM      — e.g. "SpeedNetRDC <orders@speednetrdc.com>"; its domain
 *                     must be verified in Resend
 *   EMAIL_REPLY_TO  — optional inbox that receives customer replies
 *
 * Never throws: email is always secondary to the action that triggered it
 * (an eSIM is still provisioned if its email fails), so callers get a
 * result and decide what to record.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Resend drops a second send with the same key (within 24h), so retries can't double-send. */
  idempotencyKey?: string;
}

export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    const error = "Email not configured (RESEND_API_KEY / EMAIL_FROM not set)";
    console.error(`[email] ${error} — not sending "${input.subject}"`);
    return { ok: false, error };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    if (!response.ok || !body?.id) {
      const error = `Resend ${response.status}: ${body?.message ?? "unknown error"}`;
      console.error(`[email] Sending "${input.subject}" failed: ${error}`);
      return { ok: false, error };
    }
    return { ok: true, id: body.id };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[email] Sending "${input.subject}" failed: ${error}`);
    return { ok: false, error };
  }
}
