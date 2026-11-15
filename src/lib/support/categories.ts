// Shared by the customer form and the admin panel (safe to import in the browser).

/** What the customer can pick. Labels live in the messages (support.categories / admin.support.categories). */
export const SUPPORT_CATEGORIES = ["no_internet", "cant_install", "wrong_country", "data_gone", "billing", "other"] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const TICKET_STATUSES = ["open", "answered", "resolved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const MAX_SUPPORT_MESSAGE = 1000;

export function isSupportCategory(value: unknown): value is SupportCategory {
  return typeof value === "string" && (SUPPORT_CATEGORIES as readonly string[]).includes(value);
}

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && (TICKET_STATUSES as readonly string[]).includes(value);
}
