import { Headset, RefreshCcw, ShieldCheck, Zap } from "lucide-react";

const props = [
  { icon: Zap, title: "Instant delivery", description: "QR code and activation details the moment you pay." },
  { icon: ShieldCheck, title: "Secure payments", description: "Encrypted checkout with cards, Apple Pay, Google Pay & PayPal." },
  { icon: RefreshCcw, title: "Top up anytime", description: "Running low? Add more data in a couple of taps." },
  { icon: Headset, title: "24/7 human support", description: "Real people, live chat, replies in minutes." },
];

export default function ValueProps() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {props.map((p) => (
          <div key={p.title} className="flex flex-col items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <p.icon className="size-5" />
            </span>
            <p className="font-semibold text-ink">{p.title}</p>
            <p className="text-sm text-muted">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
