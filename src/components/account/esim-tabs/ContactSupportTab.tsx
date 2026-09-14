import { Mail, MessageCircle } from "lucide-react";

export default function ContactSupportTab() {
  return (
    <div className="grid gap-4 py-2 sm:grid-cols-2">
      <div className="rounded-2xl border border-line bg-orange p-6 text-white">
        <MessageCircle className="size-6" />
        <p className="mt-3 font-semibold">Live chat</p>
        <p className="mt-1 text-sm text-white/85">Average reply under 2 minutes.</p>
      </div>
      <a
        href="mailto:support@speednetrdc.com"
        className="rounded-2xl border border-line bg-white p-6 transition-colors hover:border-orange/40"
      >
        <Mail className="size-6 text-orange" />
        <p className="mt-3 font-semibold text-ink">Email support</p>
        <p className="mt-1 text-sm text-muted">support@speednetrdc.com &middot; replies within 24h.</p>
      </a>
    </div>
  );
}
