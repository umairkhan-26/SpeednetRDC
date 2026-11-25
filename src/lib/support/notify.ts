import { getAppUrl } from "@/lib/checkout/stripe";
import { SUPPORT_EMAIL } from "@/lib/contact";
import { sendEmail } from "@/lib/email/send";
import type { SupportCategory } from "./categories";

// Best-effort emails: a failed email never stops a request or a reply
// (sendEmail never throws and just reports a result).

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CATEGORY_EN: Record<SupportCategory, string> = {
  no_internet: "No internet",
  cant_install: "Can't install the eSIM",
  wrong_country: "Plan doesn't cover my country",
  data_gone: "Data used up or missing",
  billing: "Payment or refund",
  other: "Other",
};

/** Tells the team a customer reported a problem (to SUPPORT_NOTIFY_EMAIL, or the public support address). */
export async function notifyTeamOfTicket(input: { ticketId: number; orderId: number; category: SupportCategory; customerName: string; message: string }): Promise<void> {
  const link = `${getAppUrl()}/admin/support/${input.ticketId}`;
  const category = CATEGORY_EN[input.category];
  const text = `New SIM issue from ${input.customerName} (ORD-${input.orderId}): ${category}\n\n${input.message || "(no message)"}\n\nOpen it: ${link}`;
  await sendEmail({
    to: process.env.SUPPORT_NOTIFY_EMAIL || SUPPORT_EMAIL,
    subject: `New SIM issue: ORD-${input.orderId} (${category})`,
    text,
    html: `<p><strong>New SIM issue</strong> from ${esc(input.customerName)} (ORD-${input.orderId}): ${esc(category)}</p><p>${esc(input.message || "(no message)").replace(/\n/g, "<br>")}</p><p><a href="${link}">Open it in the admin panel</a></p>`,
    idempotencyKey: `support-ticket-${input.ticketId}`,
  });
}

const REPLY_COPY: Record<string, { subject: (id: number) => string; intro: (id: number) => string; cta: string }> = {
  en: { subject: (id) => `SpeedNetRDC replied to your request (ORD-${id})`, intro: (id) => `Our team answered your request about order ORD-${id}:`, cta: "Open your account to reply" },
  fr: { subject: (id) => `SpeedNetRDC a répondu à votre demande (ORD-${id})`, intro: (id) => `Notre équipe a répondu à votre demande concernant la commande ORD-${id} :`, cta: "Ouvrez votre compte pour répondre" },
  es: { subject: (id) => `SpeedNetRDC ha respondido a tu solicitud (ORD-${id})`, intro: (id) => `Nuestro equipo ha respondido a tu solicitud sobre el pedido ORD-${id}:`, cta: "Abre tu cuenta para responder" },
  pt: { subject: (id) => `A SpeedNetRDC respondeu ao seu pedido (ORD-${id})`, intro: (id) => `A nossa equipa respondeu ao seu pedido sobre a encomenda ORD-${id}:`, cta: "Abra a sua conta para responder" },
  nl: { subject: (id) => `SpeedNetRDC heeft op je melding geantwoord (ORD-${id})`, intro: (id) => `Ons team heeft je vraag over bestelling ORD-${id} beantwoord:`, cta: "Open je account om te antwoorden" },
  de: { subject: (id) => `SpeedNetRDC hat auf Ihre Anfrage geantwortet (ORD-${id})`, intro: (id) => `Unser Team hat Ihre Anfrage zur Bestellung ORD-${id} beantwortet:`, cta: "Konto öffnen und antworten" },
  it: { subject: (id) => `SpeedNetRDC ha risposto alla tua richiesta (ORD-${id})`, intro: (id) => `Il nostro team ha risposto alla tua richiesta sull'ordine ORD-${id}:`, cta: "Apri il tuo account per rispondere" },
};

/** Tells the customer the team replied, with the reply and a link to their account. */
export async function notifyCustomerOfReply(input: { ticketId: number; orderId: number; to: string; locale: string | null; reply: string }): Promise<void> {
  const copy = REPLY_COPY[input.locale ?? "en"] ?? REPLY_COPY.en;
  const locale = input.locale && REPLY_COPY[input.locale] ? input.locale : "en";
  const link = `${getAppUrl()}/${locale}/account`;
  await sendEmail({
    to: input.to,
    subject: copy.subject(input.orderId),
    text: `${copy.intro(input.orderId)}\n\n${input.reply}\n\n${copy.cta}: ${link}`,
    html: `<p>${esc(copy.intro(input.orderId))}</p><blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #f97316">${esc(input.reply).replace(/\n/g, "<br>")}</blockquote><p><a href="${link}">${esc(copy.cta)}</a></p>`,
  });
}
