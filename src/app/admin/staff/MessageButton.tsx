"use client";

import { useState, useTransition } from "react";
import { MessageCircle, X } from "lucide-react";
import { sendAdminDirectMessageAction } from "@/lib/staff/actions";
import type { Message } from "@/lib/staff/types";
import { Button } from "@/components/ui/Button";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageButton({
  recipientId,
  recipientName,
  currentAdminId,
  messages,
}: {
  recipientId: number;
  recipientName: string;
  currentAdminId: number;
  messages: Message[];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [attachAsTask, setAttachAsTask] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await sendAdminDirectMessageAction(recipientId, trimmed, attachAsTask);
      setText("");
      setAttachAsTask(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-orange/10 hover:text-orange"
        aria-label={`Message ${recipientName}`}
      >
        <MessageCircle className="size-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="flex h-[520px] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-semibold text-ink">{recipientName}</p>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted">No messages yet. Say hello.</p>
              ) : (
                messages.map((m) => {
                  const fromMe = m.senderId === currentAdminId;
                  return (
                    <div key={m.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                          fromMe ? "bg-orange text-white" : "bg-cream text-ink"
                        }`}
                      >
                        <p>{m.message}</p>
                        <p className={`mt-1 text-[11px] ${fromMe ? "text-white/70" : "text-muted"}`}>
                          {formatTime(m.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-line p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
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
                  Attach as task
                </label>
                <Button size="sm" onClick={handleSend} disabled={isPending || !text.trim()}>
                  {isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
