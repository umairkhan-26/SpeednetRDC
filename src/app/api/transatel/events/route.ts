import { NextResponse } from "next/server";
import { getTransatelEventsSecret } from "@/lib/transatel/config";
import { TransatelApiError } from "@/lib/transatel/client";
import { preloadCustomerPlan } from "@/lib/transatel/provisioning";
import { getOrderByActivationTransactionId, markProvisioningFailed } from "@/lib/checkout/orders-repository";

/**
 * Receives Transatel's CONNECTIVITY-MANAGEMENT/SUBSCRIBER/ACTIVATED event
 * (registered as a Data Stream webhook in the Transatel Console — see the
 * comment on getTransatelEventsSecret) and finishes provisioning a paid
 * order that needed activation first: now that the SIM has a real MSISDN,
 * place the customer's actual purchased plan on it.
 *
 * See src/app/api/stripe/webhook/route.ts for step 1 (reserving a SIM,
 * and either going straight to the plan or starting activation depending
 * on whether the SIM already had an MSISDN) and Transatel's "Activating a
 * subscriber" guide for why activation is asynchronous.
 *
 * Register this URL in the Console as:
 *   https://<your-domain>/api/transatel/events?token=<TRANSATEL_EVENTS_SECRET>
 */
interface ActivatedEventBody {
  header?: { eventType?: string };
  body?: { transactionId?: string; msisdn?: string; status?: string };
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (token !== getTransatelEventsSecret()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let event: ActivatedEventBody;
  try {
    event = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  if (event.header?.eventType !== "CONNECTIVITY-MANAGEMENT/SUBSCRIBER/ACTIVATED") {
    // Not an error — the same Data Stream could carry other event types
    // in the future. Acknowledge and ignore.
    return new NextResponse("ok", { status: 200 });
  }

  const transactionId = event.body?.transactionId;
  const msisdn = event.body?.msisdn;
  if (!transactionId || !msisdn) {
    console.error("[transatel] ACTIVATED event missing transactionId or msisdn:", event);
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const order = await getOrderByActivationTransactionId(transactionId);
  if (!order) {
    console.error(`[transatel] No order found for activation transactionId ${transactionId}`);
    // Acknowledge anyway: Transatel will retry delivery on a non-2xx
    // response, and retrying won't create a matching order.
    return new NextResponse("ok", { status: 200 });
  }

  try {
    await preloadCustomerPlan(order, msisdn);
  } catch (error) {
    if (error instanceof TransatelApiError) {
      console.error(`[transatel] Order ${order.id} preload order failed (${error.status}):`, error.body);
    } else {
      console.error(`[transatel] Order ${order.id} preload order failed:`, error);
    }
    await markProvisioningFailed(order.id);
  }

  return new NextResponse("ok", { status: 200 });
}
