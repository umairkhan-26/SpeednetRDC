import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Mail, MessageCircle, Smartphone, CreditCard, Power, BookOpen } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import SectionHeading from "@/components/ui/SectionHeading";
import type { FaqItem } from "@/lib/types";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "help");
}

const categories = [
  { key: "installation", icon: BookOpen, href: "/how-it-works" },
  { key: "compatibility", icon: Smartphone, href: "/device-compatibility" },
  { key: "payment", icon: CreditCard, href: "/help#faq" },
  { key: "activation", icon: Power, href: "/help#faq" },
] as const;

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });
  const tFaq = await getTranslations({ locale, namespace: "faq" });
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <c.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{t(`categories.${c.key}.title`)}</p>
              <p className="text-xs text-muted">{t(`categories.${c.key}.description`)}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-orange to-orange-soft p-6 text-white">
          <MessageCircle className="size-7" />
          <p className="text-lg font-bold">{t("liveChat")}</p>
          <p className="text-sm text-white/85">{t("liveChatText")}</p>
          <button
            type="button"
            className="mt-2 w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-orange"
          >
            {t("startChat")}
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6">
          <Mail className="size-7 text-orange" />
          <p className="text-lg font-bold text-ink">{t("emailSupport")}</p>
          <p className="text-sm text-muted">{t("emailSupportText")}</p>
          <a
            href="mailto:contact@speednetrdc.com"
            className="mt-2 w-fit rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white"
          >
            contact@speednetrdc.com
          </a>
        </div>
      </div>

      <div id="faq" className="mx-auto mt-16 max-w-3xl scroll-mt-24">
        <SectionHeading eyebrow={tFaq("eyebrow")} title={tFaq("title")} />
        <div className="mt-6">
          <Accordion items={tFaq.raw("help") as FaqItem[]} />
        </div>
      </div>
    </div>
  );
}
