import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getOrderByAccessToken, type CheckoutOrder } from "@/lib/checkout/orders-repository";
import { generateQrDataUrl } from "@/lib/qr";

// The URL token is the only thing protecting the activation code shown
// here: keep the page out of search engines, and never send it as a
// referrer when the customer follows a link off the page.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `${t("order")} — SpeedNetRDC`,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

type T = Awaited<ReturnType<typeof getTranslations<"orderPage">>>;

function maskEmail(email: string, fallback: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return fallback;
  return `${name.slice(0, 1)}***@${domain}`;
}

export default async function PrivateOrderPage({ params }: { params: Promise<{ token: string; locale: string }> }) {
  const { token, locale } = await params;
  const order = await getOrderByAccessToken(token);
  if (!order || order.status !== "completed") notFound();
  const t = await getTranslations({ locale, namespace: "orderPage" });

  return (
    <div className="container-page max-w-3xl py-12">
      <p className="text-sm text-muted">
        {t("orderNumber", { id: order.id })} &middot; {order.planName}
      </p>
      {order.provisioningStatus === "provisioned" && order.lpaActivationCode ? (
        <ReadyToInstall activationCode={order.lpaActivationCode} t={t} />
      ) : (
        <NotReadyYet order={order} t={t} />
      )}
    </div>
  );
}

async function ReadyToInstall({ activationCode, t }: { activationCode: string; t: T }) {
  const qr = await generateQrDataUrl(activationCode);
  // LPA:1$<SM-DP+ address>$<matching ID>
  const [, smdpAddress = "", matchingId = ""] = activationCode.replace(/^LPA:/, "").split("$");

  return (
    <>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
        <CheckCircle2 className="size-7 text-emerald-600" />
        {t("readyTitle")}
      </h1>
      <p className="mt-2 text-muted">{t("readyText")}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto rounded-2xl border border-line bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL generated on the server */}
          <img src={qr} alt={t("qrAlt")} width={240} height={240} />
        </div>
        <div className="space-y-4 rounded-2xl border border-line bg-white p-5 text-sm">
          <p className="font-semibold text-ink">{t("scanTitle")}</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted">
            <li>
              <span className="font-medium text-ink">iPhone:</span> {t("iphoneSteps")}
            </li>
            <li>
              <span className="font-medium text-ink">Android:</span> {t("androidSteps")}
            </li>
            <li>{t("roaming")}</li>
          </ol>
          <p className="text-muted">{t("wifi")}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 text-sm">
        <p className="font-semibold text-ink">{t("manualTitle")}</p>
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="text-muted">{t("smdpAddress")}</dt>
            <dd className="break-all font-mono text-ink">{smdpAddress}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("activationCode")}</dt>
            <dd className="break-all font-mono text-ink">{matchingId}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl bg-orange/5 px-4 py-3 text-sm text-ink">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-orange" />
        {t("keepPrivate")}
      </p>
      <HelpLine t={t} />
    </>
  );
}

function NotReadyYet({ order, t }: { order: CheckoutOrder; t: T }) {
  const failed = order.provisioningStatus === "failed";
  return (
    <>
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
        <Clock className="size-7 text-orange" />
        {failed ? t("failedTitle") : t("settingUpTitle")}
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        {failed ? t("failedText", { email: maskEmail(order.customerEmail, t("yourEmail")) }) : t("settingUpText")}{" "}
        {t("qrWillAppear")}
      </p>
      <HelpLine t={t} />
    </>
  );
}

function HelpLine({ t }: { t: T }) {
  return (
    <p className="mt-8 text-sm text-muted">
      {t("questions")}{" "}
      <Link href="/help" className="font-semibold text-orange hover:underline">
        {t("getHelp")}
      </Link>
    </p>
  );
}
