import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "@/lib/staff/db";
import type { SupportCategory, TicketStatus } from "./categories";

export interface SupportMessage {
  id: number;
  sender: "customer" | "staff";
  /** Staff name, for the admin panel only; customers just see "the team". */
  staffName: string | null;
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  customerEmail: string;
  orderId: number;
  iccid: string | null;
  category: SupportCategory;
  status: TicketStatus;
  adminUnread: boolean;
  customerUnread: boolean;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

interface TicketRow extends RowDataPacket {
  id: number;
  customer_email: string;
  order_id: number;
  iccid: string | null;
  category: SupportCategory;
  status: TicketStatus;
  admin_unread: number;
  customer_unread: number;
  created_at: string;
  updated_at: string;
}

interface MessageRow extends RowDataPacket {
  id: number;
  ticket_id: number;
  sender: "customer" | "staff";
  staff_name: string | null;
  body: string;
  created_at: string;
}

function toTicket(row: TicketRow, messages: SupportMessage[]): SupportTicket {
  return {
    id: row.id,
    customerEmail: row.customer_email,
    orderId: row.order_id,
    iccid: row.iccid,
    category: row.category,
    status: row.status,
    adminUnread: row.admin_unread === 1,
    customerUnread: row.customer_unread === 1,
    createdAt: fromMySQLDateTime(row.created_at),
    updatedAt: fromMySQLDateTime(row.updated_at),
    messages,
  };
}

async function loadMessages(ticketIds: number[]): Promise<Map<number, SupportMessage[]>> {
  const byTicket = new Map<number, SupportMessage[]>();
  if (ticketIds.length === 0) return byTicket;
  const pool = await getPool();
  const [rows] = await pool.query<MessageRow[]>(
    `SELECT m.id, m.ticket_id, m.sender, s.name AS staff_name, m.body, m.created_at
     FROM support_messages m LEFT JOIN staff_members s ON s.id = m.staff_id
     WHERE m.ticket_id IN (?) ORDER BY m.id`,
    [ticketIds]
  );
  for (const row of rows) {
    const list = byTicket.get(row.ticket_id) ?? [];
    list.push({ id: row.id, sender: row.sender, staffName: row.staff_name, body: row.body, createdAt: fromMySQLDateTime(row.created_at) });
    byTicket.set(row.ticket_id, list);
  }
  return byTicket;
}

const now = () => toMySQLDateTime(new Date());

/** A new request from a customer, with its first message. Returns the ticket id. */
export async function createTicket(input: {
  customerEmail: string;
  orderId: number;
  iccid: string | null;
  category: SupportCategory;
  message: string;
}): Promise<number> {
  const pool = await getPool();
  const at = now();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO support_tickets (customer_email, order_id, iccid, category, status, admin_unread, customer_unread, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'open', 1, 0, ?, ?)`,
    [input.customerEmail.trim().toLowerCase(), input.orderId, input.iccid, input.category, at, at]
  );
  if (input.message.trim()) {
    await pool.query("INSERT INTO support_messages (ticket_id, sender, body, created_at) VALUES (?, 'customer', ?, ?)", [
      result.insertId,
      input.message.trim(),
      at,
    ]);
  }
  return result.insertId;
}

export async function listTicketsForCustomer(email: string): Promise<SupportTicket[]> {
  const pool = await getPool();
  const [rows] = await pool.query<TicketRow[]>("SELECT * FROM support_tickets WHERE customer_email = ? ORDER BY updated_at DESC, id DESC LIMIT 50", [
    email.trim().toLowerCase(),
  ]);
  const messages = await loadMessages(rows.map((r) => r.id));
  return rows.map((row) => toTicket(row, messages.get(row.id) ?? []));
}

/** Customer replies on their own ticket (reopens it). False if it is not theirs. */
export async function addCustomerMessage(email: string, ticketId: number, body: string): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query<TicketRow[]>("SELECT id FROM support_tickets WHERE id = ? AND customer_email = ?", [ticketId, email.trim().toLowerCase()]);
  if (rows.length === 0) return false;
  const at = now();
  await pool.query("INSERT INTO support_messages (ticket_id, sender, body, created_at) VALUES (?, 'customer', ?, ?)", [ticketId, body.trim(), at]);
  await pool.query("UPDATE support_tickets SET status = 'open', admin_unread = 1, updated_at = ? WHERE id = ?", [at, ticketId]);
  return true;
}

export async function markTicketReadByCustomer(email: string, ticketId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE support_tickets SET customer_unread = 0 WHERE id = ? AND customer_email = ?", [ticketId, email.trim().toLowerCase()]);
}

// --- Admin side -------------------------------------------------------------------

export async function getTicketForAdmin(ticketId: number): Promise<SupportTicket | null> {
  const pool = await getPool();
  const [rows] = await pool.query<TicketRow[]>("SELECT * FROM support_tickets WHERE id = ?", [ticketId]);
  if (rows.length === 0) return null;
  const messages = await loadMessages([ticketId]);
  return toTicket(rows[0], messages.get(ticketId) ?? []);
}

export type TicketFilter = TicketStatus | "all";

export interface TicketListItem {
  id: number;
  customerEmail: string;
  customerName: string;
  orderId: number;
  planId: string | null;
  planName: string;
  iccid: string | null;
  category: SupportCategory;
  status: TicketStatus;
  adminUnread: boolean;
  updatedAt: string;
  lastMessage: string | null;
}

interface ListRow extends TicketRow {
  customer_name: string;
  plan_id: string | null;
  plan_name: string;
  last_message: string | null;
}

export async function listTicketsForAdmin(filter: TicketFilter): Promise<TicketListItem[]> {
  const pool = await getPool();
  const [rows] = await pool.query<ListRow[]>(
    `SELECT t.*, o.customer_name, o.plan_id, o.plan_name,
            (SELECT body FROM support_messages WHERE ticket_id = t.id ORDER BY id DESC LIMIT 1) AS last_message
     FROM support_tickets t JOIN orders o ON o.id = t.order_id
     ${filter === "all" ? "" : "WHERE t.status = ?"}
     ORDER BY t.admin_unread DESC, t.updated_at DESC LIMIT 300`,
    filter === "all" ? [] : [filter]
  );
  return rows.map((row) => ({
    id: row.id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    orderId: row.order_id,
    planId: row.plan_id,
    planName: row.plan_name,
    iccid: row.iccid,
    category: row.category,
    status: row.status,
    adminUnread: row.admin_unread === 1,
    updatedAt: fromMySQLDateTime(row.updated_at),
    lastMessage: row.last_message,
  }));
}

/** Tickets with something new for the team (shown as a badge in the admin menu). */
export async function countUnreadTicketsForAdmin(): Promise<number> {
  try {
    const pool = await getPool();
    const [rows] = await pool.query<(RowDataPacket & { n: number })[]>(
      "SELECT COUNT(*) AS n FROM support_tickets WHERE admin_unread = 1 AND status <> 'resolved'"
    );
    return Number(rows[0]?.n ?? 0);
  } catch (error) {
    console.error("[support] Couldn't count unread tickets:", error instanceof Error ? error.message : error);
    return 0;
  }
}

export async function markTicketReadByAdmin(ticketId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE support_tickets SET admin_unread = 0 WHERE id = ?", [ticketId]);
}

/** A staff reply: the customer is told, the ticket moves to "answered". */
export async function addStaffMessage(staffId: number, ticketId: number, body: string): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query<TicketRow[]>("SELECT id FROM support_tickets WHERE id = ?", [ticketId]);
  if (rows.length === 0) return false;
  const at = now();
  await pool.query("INSERT INTO support_messages (ticket_id, sender, staff_id, body, created_at) VALUES (?, 'staff', ?, ?, ?)", [ticketId, staffId, body.trim(), at]);
  await pool.query("UPDATE support_tickets SET status = 'answered', customer_unread = 1, admin_unread = 0, updated_at = ? WHERE id = ?", [at, ticketId]);
  return true;
}

export async function setTicketStatus(ticketId: number, status: TicketStatus): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE support_tickets SET status = ?, admin_unread = 0, updated_at = ? WHERE id = ?", [status, now(), ticketId]);
}
