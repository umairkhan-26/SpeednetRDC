import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "checkoutCancelled");
}

export default async function CheckoutCancelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout.cancelled" });
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-ink/5">
        <XCircle className="size-9 text-muted" />
      </span>
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="max-w-sm text-muted">{t("text")}</p>
      <div className="mt-2 flex gap-3">
        <LinkButton href="/esim-store" size="lg">
          {t("backToPlans")}
        </LinkButton>
        <Link
          href="/help"
          className="inline-flex items-center px-4 text-sm font-semibold text-orange hover:underline"
        >
          {t("getHelp")}
        </Link>
      </div>
    </div>
  );
}
