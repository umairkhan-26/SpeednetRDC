import { CreditCard, MapPin, QrCode, Plane } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  { icon: MapPin, title: "Search your destination", description: "Tell us where you're headed and we'll show every plan that covers it." },
  { icon: CreditCard, title: "Pick a plan & pay", description: "Choose your data and validity, then check out securely in under a minute." },
  { icon: QrCode, title: "Scan the QR code", description: "Install instantly by scanning your QR code or entering the activation details." },
  { icon: Plane, title: "Land & connect", description: "Your eSIM activates automatically on your first supported network." },
];

export default function StepsSection() {
  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow="How it works"
        title="Connected in four simple steps"
        align="center"
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="relative rounded-2xl border border-line bg-white p-6">
            <span className="absolute -top-3 left-6 flex size-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
              {i + 1}
            </span>
            <step.icon className="size-7 text-orange" />
            <p className="mt-4 font-semibold text-ink">{step.title}</p>
            <p className="mt-1.5 text-sm text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
