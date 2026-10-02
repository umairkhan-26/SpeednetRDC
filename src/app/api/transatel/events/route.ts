import { NextResponse } from "next/server";
import { getTransatelEventsSecret } from "@/lib/transatel/config";
import { recordTransatelEvent } from "@/lib/transatel/events-repository";
import { isValidTransatelSignature } from "@/lib/transatel/webhook-signature";

/**
 * Transatel Data Stream webhook (optional — no order depends on it).
 * Register in the Transatel Console, Data Stream tab:
 *   URL:     https://<your-domain>/api/transatel/events
 *   Secret:  the value of TRANSATEL_EVENTS_SECRET
 *   Events:  OCS/PRODUCT/ACTIVATED (plan started), OCS/PRODUCT/EXPIRED,
 *            OCS/RESOURCE/THRESHOLD (20% of data left)
 *
 * Every event is signature-checked and stored once in transatel_events,
 * then acknowledged with 204 as Transatel requires (any 3xx/4xx/5xx makes
 * Transatel retry delivery).
 */
interface TransatelEvent {
  header?: { eventId?: string; eventType?: string; eventDate?: string };
  body?: { msisdn?: string; iccid?: string };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!isValidTransatelSignature(rawBody, request.headers.get("x-tsl-signature-256"), getTransatelEventsSecret())) {
    return new NextResponse(null, { status: 401 });
  }

  let event: TransatelEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const { eventId, eventType, eventDate } = event.header ?? {};
  if (!eventId || !eventType) {
    return new NextResponse("Missing header.eventId or header.eventType", { status: 400 });
  }

  const parsedDate = eventDate ? new Date(eventDate) : null;
  const isNew = await recordTransatelEvent({
    eventId,
    eventType,
    msisdn: event.body?.msisdn ? event.body.msisdn.replace(/\D/g, "") : null,
    iccid: event.body?.iccid ?? null,
    eventDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
    payload: rawBody,
  });
  if (isNew) console.log(`[transatel] event ${eventType} (${eventId}) for ${event.body?.msisdn ?? event.body?.iccid ?? "unknown SIM"}`);

  return new NextResponse(null, { status: 204 });
}
