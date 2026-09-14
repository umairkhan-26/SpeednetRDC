"use client";

import { useState, useTransition } from "react";
import { postTeamReplyAction, sendStaffReplyAction } from "@/lib/staff/actions";
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

interface DirectThread {
  partnerId: number;
  partnerName: string;
  messages: Message[];
}

function DirectThreadPanel({ thread, currentStaffId }: { thread: DirectThread; currentStaffId: number }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await sendStaffReplyAction(thread.partnerId, trimmed);
      setText("");
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-white">
      <p className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">{thread.partnerName}</p>
      <div className="space-y-3 px-5 py-4">
        {thread.messages.map((m) => {
          const fromMe = m.senderId === currentStaffId;
          return (
            <div key={m.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
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
        })}
      </div>
      <div className="border-t border-line p-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Reply..."
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-orange"
          />
          <Button size="sm" onClick={handleSend} disabled={isPending || !text.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function TeamPanel({ messages, currentStaffId }: { messages: Message[]; currentStaffId: number }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await postTeamReplyAction(trimmed);
      setText("");
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-white">
      <div className="space-y-3 px-5 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No announcements yet.</p>
        ) : (
          messages.map((m) => {
            const fromMe = m.senderId === currentStaffId;
            return (
              <div key={m.id} className="rounded-2xl bg-cream px-3.5 py-2 text-sm">
                <p className="text-xs font-semibold text-orange">
                  {fromMe ? "You" : m.senderName ?? "Unknown"}
                </p>
                <p className="mt-0.5 text-ink">{m.message}</p>
                <p className="mt-1 text-[11px] text-muted">{formatTime(m.sentAt)}</p>
              </div>
            );
          })
        )}
      </div>
      <div className="border-t border-line p-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Post to the team..."
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-orange"
          />
          <Button size="sm" onClick={handleSend} disabled={isPending || !text.trim()}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MessagesClient({
  currentStaffId,
  directThreads,
  teamBroadcasts,
}: {
  currentStaffId: number;
  directThreads: DirectThread[];
  teamBroadcasts: Message[];
}) {
  const [tab, setTab] = useState<"direct" | "team">("direct");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setTab("direct")}
          className={`px-3 py-2 text-sm font-semibold ${
            tab === "direct" ? "border-b-2 border-orange text-orange" : "text-muted"
          }`}
        >
          Direct Messages
        </button>
        <button
          type="button"
          onClick={() => setTab("team")}
          className={`px-3 py-2 text-sm font-semibold ${
            tab === "team" ? "border-b-2 border-orange text-orange" : "text-muted"
          }`}
        >
          Team
        </button>
      </div>

      {tab === "direct" ? (
        directThreads.length === 0 ? (
          <p className="text-sm text-muted">No direct messages yet.</p>
        ) : (
          <div className="space-y-4">
            {directThreads.map((thread) => (
              <DirectThreadPanel key={thread.partnerId} thread={thread} currentStaffId={currentStaffId} />
            ))}
          </div>
        )
      ) : (
        <TeamPanel messages={teamBroadcasts} currentStaffId={currentStaffId} />
      )}
    </div>
  );
}
