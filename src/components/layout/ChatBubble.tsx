"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, X } from "lucide-react";

export default function ChatBubble() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-orange to-orange-soft px-4 py-4 text-white">
            <p className="text-sm font-semibold">{t("title")}</p>
            <p className="text-xs text-white/85">{t("replyTime")}</p>
          </div>
          <div className="space-y-3 p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-cream px-3.5 py-2.5 text-sm text-ink">
              {t("greeting")}
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-line p-3">
            <input
              type="text"
              placeholder={t("placeholder")}
              className="flex-1 rounded-full border border-line px-3.5 py-2 text-sm outline-none focus:border-orange"
            />
            <button
              type="button"
              className="rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white"
            >
              {t("send")}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("open")}
        className="flex size-14 items-center justify-center rounded-full bg-orange text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
