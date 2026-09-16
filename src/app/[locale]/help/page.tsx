import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Mail, MessageCircle, Smartphone, CreditCard, Power, BookOpen } from "lucide-react";
import { helpFaqs } from "@/data/faqs";
import Accordion from "@/components/ui/Accordion";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "Help Center — SpeedNetRDC" };

const categories = [
  { icon: BookOpen, title: "Installation help", description: "Step-by-step QR and manual setup.", href: "/how-it-works" },
  { icon: Smartphone, title: "Device compatibility", description: "Check if your phone supports eSIM.", href: "/device-compatibility" },
  { icon: CreditCard, title: "Payment help", description: "Cards, wallets, receipts and refunds.", href: "/help#faq" },
  { icon: Power, title: "eSIM activation", description: "Turning your plan on when you land.", href: "/help#faq" },
];

export default function HelpPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">How can we help?</h1>
        <p className="mt-3 text-muted">
          Find quick answers or reach a real person &mdash; we are online 24/7 across every time zone.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <c.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{c.title}</p>
              <p className="text-xs text-muted">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-orange to-orange-soft p-6 text-white">
          <MessageCircle className="size-7" />
          <p className="text-lg font-bold">Live chat</p>
          <p className="text-sm text-white/85">Average reply under 2 minutes.</p>
          <button
            type="button"
            className="mt-2 w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-orange"
          >
            Start chat
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6">
          <Mail className="size-7 text-orange" />
          <p className="text-lg font-bold text-ink">Email support</p>
          <p className="text-sm text-muted">We answer every message within 24 hours.</p>
          <a
            href="mailto:support@speednetrdc.com"
            className="mt-2 w-fit rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white"
          >
            support@speednetrdc.com
          </a>
        </div>
      </div>

      <div id="faq" className="mx-auto mt-16 max-w-3xl scroll-mt-24">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-6">
          <Accordion items={helpFaqs} />
        </div>
      </div>
    </div>
  );
}
