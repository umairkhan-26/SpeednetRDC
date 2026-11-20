"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LifeBuoy, MessageCircle, Send } from "lucide-react";
import { languageTag } from "@/i18n/routing";
import { useRouter } from "@/i18n/navigation";
import { createTicketAction, markTicketReadAction, replyToTicketAction, type SupportResult } from "@/lib/support/actions";
import { MAX_SUPPORT_MESSAGE, SUPPORT_CATEGORIES, type SupportCategory, type TicketStatus } from "@/lib/support/categories";

export interface CustomerTicketMessage {
  id: number;
  sender: "customer" | "staff";
  body: string;
  createdAt: string;
}

export interface CustomerTicket {
  id: number;
  orderId: number;
  category: SupportCategory;
  status: TicketStatus;
  customerUnread: boolean;
  updatedAt: string;
  messages: CustomerTicketMessage[];
}

export interface SupportOrderOption {
  id: number;
  planName: string;
}

const STATUS_STYLE: Record<TicketStatus, string> = {
  open: "bg-sky-100 text-sky-700",
  answered: "bg-green-100 text-green-700",
  resolved: "bg-ink/10 text-ink/60",
};

export default function SupportPanel({ orders, tickets }: { orders: SupportOrderOption[]; tickets: CustomerTicket[] }) {
  const t = useTranslations("support");
  const locale = useLocale();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [orderId, setOrderId] = useState<number>(orders[0]?.id ?? 0);
  const [category, setCategory] = useState<SupportCategory | "">("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (orders.length === 0) return null;

  const formatDate = (iso: string) => new Date(iso).toLocaleString(languageTag(locale), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  function handleResult(result: SupportResult, onOk: () => void) {
    if (result.ok) {
      setError(null);
      onOk();
      router.refresh();
    } else {
      setError(t(`errors.${result.error}`));
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!category) {
      setError(t("errors.chooseIssue"));
      return;
    }
    startTransition(async () => {
      handleResult(await createTicketAction({ orderId, category, message }), () => {
        setSent(true);
        setCategory("");
        setMessage("");
        setFormOpen(false);
      });
    });
  }

  return (
    <section id="support" className="mt-8 scroll-mt-24 rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
            <LifeBuoy className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">{t("title")}</h2>
            <p className="text-sm text-muted">{t("subtitle")}</p>
          </div>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={() => {
              setFormOpen(true);
              setSent(false);
              setError(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-soft"
          >
            <MessageCircle className="size-4" />
            {t("report")}
          </button>
        )}
      </div>

      {sent && <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{t("sent")}</p>}

      {formOpen && (
        <form onSubmit={submit} className="mt-5 space-y-5 border-t border-line pt-5">
          {orders.length > 1 && (
            <fieldset>
              <legend className="text-sm font-semibold text-ink">{t("whichOrder")}</legend>
              <div className="mt-2 space-y-2">
                {orders.map((order) => (
                  <label key={order.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink has-[:checked]:border-orange has-[:checked]:bg-orange/5">
                    <input type="radio" name="order" checked={orderId === order.id} onChange={() => setOrderId(order.id)} className="accent-orange" />
                    <span>
                      ORD-{order.id} · {order.planName}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className="text-sm font-semibold text-ink">{t("whichIssue")}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SUPPORT_CATEGORIES.map((item) => (
                <label key={item} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink has-[:checked]:border-orange has-[:checked]:bg-orange/5">
                  <input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} className="accent-orange" />
                  {t(`categories.${item}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="support-message" className="text-sm font-semibold text-ink">
              {t("messageLabel")}
            </label>
            <textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_SUPPORT_MESSAGE}
              rows={4}
              placeholder={t("messagePlaceholder")}
              className="mt-2 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-orange"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-700">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-soft disabled:opacity-60">
              <Send className="size-4" />
              {pending ? t("sending") : t("send")}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5">
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      {tickets.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{t("yourRequests")}</h3>
          <ul className="mt-3 space-y-3">
            {tickets.map((ticket) => (
              <TicketThread key={ticket.id} ticket={ticket} formatDate={formatDate} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function TicketThread({ ticket, formatDate }: { ticket: CustomerTicket; formatDate: (iso: string) => string }) {
  const t = useTranslations("support");
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(event: React.FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    startTransition(async () => {
      const result = await replyToTicketAction({ ticketId: ticket.id, message: reply });
      if (result.ok) {
        setReply("");
        setError(null);
        router.refresh();
      } else {
        setError(t(`errors.${result.error}`));
      }
    });
  }

  return (
    <li>
      <details
        className="rounded-xl border border-line"
        onToggle={(e) => {
          if ((e.currentTarget as HTMLDetailsElement).open && ticket.customerUnread) void markTicketReadAction(ticket.id).then(() => router.refresh());
        }}
      >
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
          <span className="font-medium text-ink">
            ORD-{ticket.orderId} · {t(`categories.${ticket.category}`)}
          </span>
          <span className="flex items-center gap-2">
            {ticket.customerUnread && <span className="rounded-full bg-orange px-2 py-0.5 text-xs font-semibold text-white">{t("newReply")}</span>}
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[ticket.status]}`}>{t(`status.${ticket.status}`)}</span>
          </span>
        </summary>
        <div className="space-y-3 border-t border-line px-4 py-4">
          {ticket.messages.length === 0 && <p className="text-sm text-muted">{t("noMessage")}</p>}
          {ticket.messages.map((m) => (
            <div key={m.id} className={m.sender === "customer" ? "ml-8 rounded-xl bg-orange/10 px-3 py-2" : "mr-8 rounded-xl bg-ink/5 px-3 py-2"}>
              <p className="text-xs font-semibold text-muted">
                {m.sender === "customer" ? t("you") : t("team")} · {formatDate(m.createdAt)}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{m.body}</p>
            </div>
          ))}
          <form onSubmit={send} className="flex flex-col gap-2 sm:flex-row">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              maxLength={MAX_SUPPORT_MESSAGE}
              rows={2}
              placeholder={t("replyPlaceholder")}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-orange"
            />
            <button type="submit" disabled={pending || !reply.trim()} className="inline-flex items-center justify-center gap-2 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-soft disabled:opacity-60">
              <Send className="size-4" />
              {t("reply")}
            </button>
          </form>
          {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        </div>
      </details>
    </li>
  );
}
