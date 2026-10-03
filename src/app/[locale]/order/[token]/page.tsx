import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Package, ShieldAlert, Truck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getOrderByAccessToken, type CheckoutOrder, type ShippingAddress } from "@/lib/checkout/orders-repository";
import { pendingAnswer, SHIPS_FROM } from "@/lib/physical-sim";
import { generateQrDataUrl } from "@/lib/qr";

// The URL token is the only thing protecting the activation code shown
// here: keep the page out of search engines, and never send it as a
// referrer when the customer follows a link off the page.
export const metadata: Metadata = {
  title: "Your eSIM — SpeedNetRDC",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "your email";
  return `${name.slice(0, 1)}***@${domain}`;
}

export default async function PrivateOrderPage({ params }: { params: Promise<{ token: string; locale: string }> }) {
  const { token, locale } = await params;
  const order = await getOrderByAccessToken(token);
  if (!order || order.status !== "completed") notFound();

  return (
    <div className="container-page max-w-3xl py-12">
      <p className="text-sm text-muted">
        Order ORD-{order.id} &middot; {order.planName}
      </p>
      {order.productType === "physical_sim" ? (
        <SimCardOrder order={order} locale={locale} />
      ) : order.productType === "topup" ? (
        <TopUpOrder order={order} locale={locale} />
      ) : order.provisioningStatus === "provisioned" && order.lpaActivationCode ? (
        <ReadyToInstall activationCode={order.lpaActivationCode} />
      ) : (
        <NotReadyYet order={order} />
      )}
    </div>
  );
}

async function ReadyToInstall({ activationCode }: { activationCode: string }) {
  const qr = await generateQrDataUrl(activationCode);
  // LPA:1$<SM-DP+ address>$<matching ID>
  const [, smdpAddress = "", matchingId = ""] = activationCode.replace(/^LPA:/, "").split("$");

  return (
    <>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
        <CheckCircle2 className="size-7 text-emerald-600" />
        Your eSIM is ready to install
      </h1>
      <p className="mt-2 text-muted">
        Your plan starts the first time your phone connects to a network in a country it covers, not before.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto rounded-2xl border border-line bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL generated on the server */}
          <img src={qr} alt="eSIM installation QR code" width={240} height={240} />
        </div>
        <div className="space-y-4 rounded-2xl border border-line bg-white p-5 text-sm">
          <p className="font-semibold text-ink">Scan this QR code with the phone you&apos;re installing the eSIM on</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted">
            <li>
              <span className="font-medium text-ink">iPhone:</span> Settings &rsaquo; Mobile/Cellular &rsaquo; Add eSIM &rsaquo; Use QR
              code
            </li>
            <li>
              <span className="font-medium text-ink">Android:</span> Settings &rsaquo; Network &amp; internet &rsaquo; SIMs &rsaquo; Add eSIM
              (wording varies by brand)
            </li>
            <li>Turn on data roaming for this eSIM when you arrive.</li>
          </ol>
          <p className="text-muted">Install it while you have Wi-Fi — ideally before you travel.</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-sm">
        <p className="font-semibold text-ink">Can&apos;t scan? Enter it manually</p>
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="text-muted">SM-DP+ address</dt>
            <dd className="break-all font-mono text-ink">{smdpAddress}</dd>
          </div>
          <div>
            <dt className="text-muted">Activation code</dt>
            <dd className="break-all font-mono text-ink">{matchingId}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl bg-orange/5 px-4 py-3 text-sm text-ink">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-orange" />
        Keep this page private: anyone with this link or QR code can install your eSIM, and it can only be installed once. Bookmark it
        so you can come back.
      </p>
      <HelpLine />
    </>
  );
}

function NotReadyYet({ order }: { order: CheckoutOrder }) {
  const failed = order.provisioningStatus === "failed";
  return (
    <>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
        <Clock className="size-7 text-orange" />
        {failed ? "Your eSIM needs a little more time" : "We're setting up your eSIM"}
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        {failed
          ? `Your payment went through, but we hit a snag setting up your eSIM automatically. It's been flagged for our team, who will finish it and contact you at ${maskEmail(order.customerEmail)} if needed.`
          : "Your payment went through. This usually takes less than a minute — refresh this page shortly."}{" "}
        Your QR code will appear here once it&apos;s ready, so bookmark this page.
      </p>
      <HelpLine />
    </>
  );
}

function SimCardOrder({ order, locale }: { order: CheckoutOrder; locale: string }) {
  const status = order.shippingStatus ?? "awaiting";
  const heading = status === "delivered" ? "Your SIM has been delivered" : status === "shipped" ? "Your SIM is in the post" : "Your SIM is on its way";
  return (
    <>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
        {status === "awaiting" ? <Package className="size-7 text-orange" /> : <Truck className="size-7 text-emerald-600" />}
        {heading}
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        {status === "awaiting"
          ? `We're preparing your SIM card. It ships from ${SHIPS_FROM} and usually arrives within 3–5 working days of posting — we'll email you when it's posted.`
          : status === "shipped"
            ? "Your SIM card has been posted and usually arrives within 3–5 working days."
            : "Your SIM card has arrived. Insert it, then add a data plan for it."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {order.shippingAddress && (
          <div className="rounded-2xl border border-line bg-white p-5 text-sm">
            <p className="font-semibold text-ink">Shipping to</p>
            <p className="mt-2 whitespace-pre-line text-muted">{formatAddress(order.shippingAddress)}</p>
          </div>
        )}
        <div className="rounded-2xl border border-line bg-white p-5 text-sm">
          <p className="font-semibold text-ink">Status</p>
          <ul className="mt-2 space-y-1 text-muted">
            <li>Paid &middot; {formatDate(order.createdAt)}</li>
            {order.shippedAt && <li>Posted &middot; {formatDate(order.shippedAt)}</li>}
            {order.trackingNumber && <li>Tracking number: <span className="font-mono text-ink">{order.trackingNumber}</span></li>}
            {order.deliveredAt && <li>Delivered &middot; {formatDate(order.deliveredAt)}</li>}
            {order.iccid && <li>SIM number (ICCID): <span className="font-mono text-ink">{order.iccid}</span></li>}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-sm">
        <p className="font-semibold text-ink">When it arrives</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted">
          <li>Insert the SIM in any unlocked phone.</li>
          <li>Buy a data plan for it: pick a plan on our site and choose &ldquo;Add to my SIM&rdquo;.</li>
          <li>Turn on data roaming for this SIM. Your plan starts the first time you connect in a country it covers.</li>
        </ol>
        <p className="mt-3 text-muted">
          Yours to keep: add more data whenever you travel. A SIM left unused for {pendingAnswer("inactivityPeriod", locale)} is deactivated.
        </p>
      </div>

      <p className="mt-6 text-sm text-muted">{pendingAnswer("returns", locale)}</p>
      <HelpLine />
    </>
  );
}

function TopUpOrder({ order, locale }: { order: CheckoutOrder; locale: string }) {
  const ending = order.iccid?.slice(-4) ?? "????";
  if (order.provisioningStatus === "provisioned") {
    return (
      <>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
          <CheckCircle2 className="size-7 text-emerald-600" />
          Your plan is on your SIM
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          {order.planName} has been added to your SIM ending {ending}. There&apos;s nothing to install: the plan starts the first time your
          phone connects in a country it covers {pendingAnswer("startWindow", locale)}. Make sure data roaming is on for this SIM.
        </p>
        <HelpLine />
      </>
    );
  }
  const failed = order.provisioningStatus === "failed";
  return (
    <>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
        <Clock className="size-7 text-orange" />
        {failed ? "Your plan needs a little more time" : `Adding your plan to SIM ending ${ending}`}
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        {failed
          ? `Your payment went through, but we hit a snag adding the plan automatically. It's been flagged for our team, who will finish it and contact you at ${maskEmail(order.customerEmail)} if needed.`
          : "Your payment went through. This usually takes less than a minute — refresh this page shortly."}
      </p>
      <HelpLine />
    </>
  );
}

function formatAddress(a: ShippingAddress): string {
  return [a.name, a.line1, a.line2, [a.postalCode, a.city].filter(Boolean).join(" "), a.state, a.country].filter(Boolean).join("\n");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function HelpLine() {
  return (
    <p className="mt-8 text-sm text-muted">
      Questions?{" "}
      <Link href="/help" className="font-semibold text-orange hover:underline">
        Get help
      </Link>
    </p>
  );
}
