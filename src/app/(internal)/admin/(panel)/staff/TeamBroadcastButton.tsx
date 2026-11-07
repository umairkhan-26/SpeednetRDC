"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { adminDateLocale } from "@/i18n/admin-locale";
import { Megaphone, X } from "lucide-react";
import { sendTeamBroadcastAction } from "@/lib/staff/actions";
import type { Message } from "@/lib/staff/types";
import { Button } from "@/components/ui/Button";

function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(adminDateLocale(locale), {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeamBroadcastButton({ messages }: { messages: Message[] }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [attachAsTask, setAttachAsTask] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("admin");
  const locale = useLocale();

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await sendTeamBroadcastAction(trimmed, attachAsTask);
      setText("");
      setAttachAsTask(false);
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <Megaphone className="size-4" /> {t("staff.broadcastButton")}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="flex h-[520px] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="font-semibold text-ink">{t("staff.broadcastTitle")}</p>
                <p className="text-xs text-muted">{t("staff.broadcastSubtitle")}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink" aria-label={t("common.close")}>
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted">{t("staff.noAnnouncements")}</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="rounded-2xl bg-cream px-3.5 py-2 text-sm">
                    <p className="text-xs font-semibold text-orange">{m.senderName ?? t("common.unknown")}</p>
                    <p className="mt-0.5 text-ink">{m.message}</p>
                    <p className="mt-1 text-[11px] text-muted">{formatTime(m.sentAt, locale)}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-line p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("staff.broadcastPlaceholder")}
                rows={2}
                className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-orange"
              />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-muted">
                  <input
                    type="checkbox"
                    checked={attachAsTask}
                    onChange={(e) => setAttachAsTask(e.target.checked)}
                    className="accent-orange"
                  />
                  {t("staff.attachForEveryone")}
                </label>
                <Button size="sm" onClick={handleSend} disabled={isPending || !text.trim()}>
                  {isPending ? t("common.sending") : t("common.send")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
