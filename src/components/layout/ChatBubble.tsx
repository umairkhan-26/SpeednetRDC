"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle, X } from "lucide-react";
import { SUPPORT_EMAIL, whatsappUrl } from "@/lib/contact";

// A simple FAQ helper: canned questions and answers from the FAQ texts, in
// the visitor's language. No AI, no external service, no order data.
type FaqEntry = { id: string; question: string; answer: string };

// The questions offered, by FAQ id (messages: faq.destination / faq.help).
const QUESTION_IDS = ["what-is-esim", "when-install", "keep-number", "delivery", "compatible", "refund", "payment"];

export default function ChatBubble() {
  const t = useTranslations("chat");
  const tFaq = useTranslations("faq");
  const [open, setOpen] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);

  const all = [...(tFaq.raw("destination") as FaqEntry[]), ...(tFaq.raw("help") as FaqEntry[])];
  const questions = QUESTION_IDS.map((id) => all.find((q) => q.id === id)).filter((q): q is FaqEntry => Boolean(q));
  const last = asked[asked.length - 1];
  const whatsapp = whatsappUrl(t("whatsappMessage"));

  // Bring the newest answer's question to the top of the conversation.
  useEffect(() => {
    const box = scrollRef.current;
    const latest = latestRef.current;
    if (box && latest) box.scrollTop = latest.offsetTop - 12;
  }, [asked, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed bottom-20 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="flex max-h-[min(34rem,calc(100vh-9rem))] w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-orange to-orange-soft px-4 py-4 text-white">
            <p className="text-sm font-semibold">{t("title")}</p>
            <p className="text-xs text-white/85">{t("subtitle")}</p>
          </div>

          <div ref={scrollRef} className="relative flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            <Bot>{t("greeting")}</Bot>
            {asked.map((id, i) => {
              const q = questions.find((x) => x.id === id);
              if (!q) return null;
              return (
                <div key={`${id}-${i}`} ref={i === asked.length - 1 ? latestRef : undefined} className="space-y-3">
                  <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-orange px-3.5 py-2.5 text-sm text-white">{q.question}</p>
                  <Bot>{q.answer}</Bot>
                </div>
              );
            })}
            {asked.length > 0 && <Bot>{t("more")}</Bot>}
            <div className="flex flex-col items-start gap-2">
              {questions
                .filter((q) => q.id !== last)
                .map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setAsked((prev) => [...prev, q.id])}
                    className="rounded-full border border-orange/40 px-3.5 py-1.5 text-left text-xs font-medium text-ink transition-colors hover:border-orange hover:bg-orange/5"
                  >
                    {q.question}
                  </button>
                ))}
            </div>
          </div>

          <div className="border-t border-line p-3">
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
              >
                <MessageCircle className="size-4" />
                {t("whatsapp")}
              </a>
            ) : (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex w-full flex-col items-center rounded-full bg-orange px-4 py-2 text-white hover:bg-orange-soft"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="size-4" />
                  {t("emailUs")}
                </span>
                <span className="text-xs text-white/85">{SUPPORT_EMAIL}</span>
              </a>
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-full bg-orange text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}

function Bot({ children }: { children: React.ReactNode }) {
  return <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-cream px-3.5 py-2.5 text-sm text-ink">{children}</p>;
}
