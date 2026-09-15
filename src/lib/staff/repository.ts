import { staffDb } from "./db";
import type {
  Complaint,
  ComplaintStatus,
  Message,
  OrderStatus,
  Shift,
  StaffMember,
  StaffRole,
  StoreOrder,
  Task,
  TaskStatus,
} from "./types";

interface StaffRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: StaffRole;
  profile_photo: string | null;
}

function toStaffMember(row: StaffRow): StaffMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    profilePhoto: row.profile_photo,
  };
}

export function getStaffByEmail(email: string): (StaffMember & { passwordHash: string }) | null {
  const row = staffDb.prepare("SELECT * FROM staff_members WHERE email = ?").get(email) as
    | StaffRow
    | undefined;
  if (!row) return null;
  return { ...toStaffMember(row), passwordHash: row.password_hash };
}

export function getStaffById(id: number): StaffMember | null {
  const row = staffDb.prepare("SELECT * FROM staff_members WHERE id = ?").get(id) as
    | StaffRow
    | undefined;
  return row ? toStaffMember(row) : null;
}

export function listStaff(): StaffMember[] {
  const rows = staffDb
    .prepare("SELECT * FROM staff_members ORDER BY name")
    .all() as unknown as StaffRow[];
  return rows.map(toStaffMember);
}

export function hasAnyAdmin(): boolean {
  const row = staffDb
    .prepare("SELECT COUNT(*) AS count FROM staff_members WHERE role = 'admin'")
    .get() as { count: number };
  return row.count > 0;
}

export function createStaffMember(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
}): StaffMember {
  const result = staffDb
    .prepare(
      "INSERT INTO staff_members (name, email, password_hash, role, profile_photo) VALUES (?, ?, ?, ?, NULL)"
    )
    .run(input.name, input.email, input.passwordHash, input.role);
  return {
    id: Number(result.lastInsertRowid),
    name: input.name,
    email: input.email,
    role: input.role,
    profilePhoto: null,
  };
}

interface ShiftRow {
  id: number;
  staff_id: number;
  login_time: string;
  logout_time: string | null;
  is_currently_active: number;
}

function toShift(row: ShiftRow): Shift {
  return {
    id: row.id,
    staffId: row.staff_id,
    loginTime: row.login_time,
    logoutTime: row.logout_time,
    isCurrentlyActive: Boolean(row.is_currently_active),
  };
}

export function getOpenShift(staffId: number): Shift | null {
  const row = staffDb
    .prepare(
      "SELECT * FROM shifts WHERE staff_id = ? AND is_currently_active = 1 ORDER BY id DESC LIMIT 1"
    )
    .get(staffId) as ShiftRow | undefined;
  return row ? toShift(row) : null;
}

export function getTodaysShifts(staffId: number): Shift[] {
  const rows = staffDb
    .prepare(
      "SELECT * FROM shifts WHERE staff_id = ? AND date(login_time, 'localtime') = date('now', 'localtime') ORDER BY id DESC"
    )
    .all(staffId) as unknown as ShiftRow[];
  return rows.map(toShift);
}

export function getShiftHistory(staffId: number, limit = 30): Shift[] {
  const rows = staffDb
    .prepare("SELECT * FROM shifts WHERE staff_id = ? ORDER BY id DESC LIMIT ?")
    .all(staffId, limit) as unknown as ShiftRow[];
  return rows.map(toShift);
}

export function clockIn(staffId: number): Shift {
  const now = new Date().toISOString();
  const result = staffDb
    .prepare("INSERT INTO shifts (staff_id, login_time, is_currently_active) VALUES (?, ?, 1)")
    .run(staffId, now);
  return {
    id: Number(result.lastInsertRowid),
    staffId,
    loginTime: now,
    logoutTime: null,
    isCurrentlyActive: true,
  };
}

export function clockOut(shiftId: number): void {
  const now = new Date().toISOString();
  staffDb
    .prepare("UPDATE shifts SET logout_time = ?, is_currently_active = 0 WHERE id = ?")
    .run(now, shiftId);
}

export function countActiveStaffNow(): number {
  const row = staffDb
    .prepare("SELECT COUNT(*) AS count FROM shifts WHERE is_currently_active = 1")
    .get() as { count: number };
  return row.count;
}

export function getActiveStaffIds(): Set<number> {
  const rows = staffDb
    .prepare("SELECT DISTINCT staff_id FROM shifts WHERE is_currently_active = 1")
    .all() as unknown as { staff_id: number }[];
  return new Set(rows.map((r) => r.staff_id));
}

interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  assigned_to: number | null;
  status: TaskStatus;
  due_date: string | null;
  created_by: number | null;
  assigned_to_name?: string | null;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assignedTo: row.assigned_to,
    assignedToName: row.assigned_to_name ?? undefined,
    status: row.status,
    dueDate: row.due_date,
    createdBy: row.created_by,
  };
}

export function getTasksForStaff(staffId: number): Task[] {
  const rows = staffDb
    .prepare("SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date IS NULL, due_date, id")
    .all(staffId) as unknown as TaskRow[];
  return rows.map(toTask);
}

export function listAllTasks(): Task[] {
  const rows = staffDb
    .prepare(
      `SELECT tasks.*, staff_members.name AS assigned_to_name
       FROM tasks
       LEFT JOIN staff_members ON staff_members.id = tasks.assigned_to
       ORDER BY tasks.due_date IS NULL, tasks.due_date, tasks.id`
    )
    .all() as unknown as TaskRow[];
  return rows.map(toTask);
}

export function getTaskById(taskId: number): Task | null {
  const row = staffDb.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as
    | TaskRow
    | undefined;
  return row ? toTask(row) : null;
}

export function updateTaskStatus(taskId: number, status: TaskStatus): void {
  staffDb.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, taskId);
}

export function createTask(input: {
  title: string;
  description: string | null;
  assignedTo: number;
  dueDate: string | null;
  createdBy: number;
}): Task {
  const result = staffDb
    .prepare(
      "INSERT INTO tasks (title, description, assigned_to, status, due_date, created_by) VALUES (?, ?, ?, 'pending', ?, ?)"
    )
    .run(input.title, input.description, input.assignedTo, input.dueDate, input.createdBy);
  return {
    id: Number(result.lastInsertRowid),
    title: input.title,
    description: input.description,
    assignedTo: input.assignedTo,
    status: "pending",
    dueDate: input.dueDate,
    createdBy: input.createdBy,
  };
}

interface ComplaintRow {
  id: number;
  customer_name: string;
  subject: string;
  status: ComplaintStatus;
  created_at: string;
}

function toComplaint(row: ComplaintRow): Complaint {
  return {
    id: row.id,
    customerName: row.customer_name,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function listRecentComplaints(limit = 5): Complaint[] {
  const rows = staffDb
    .prepare("SELECT * FROM complaints ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as ComplaintRow[];
  return rows.map(toComplaint);
}

export function countOpenComplaints(): number {
  const row = staffDb
    .prepare("SELECT COUNT(*) AS count FROM complaints WHERE status = 'open'")
    .get() as { count: number };
  return row.count;
}

interface OrderRow {
  id: number;
  plan_name: string;
  country_name: string;
  country_code: string;
  customer_name: string;
  customer_email: string;
  amount_eur: number;
  status: OrderStatus;
  created_at: string;
}

function toOrder(row: OrderRow): StoreOrder {
  return {
    id: row.id,
    planName: row.plan_name,
    countryName: row.country_name,
    countryCode: row.country_code,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    amountEur: row.amount_eur,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function listRecentOrders(limit = 8): StoreOrder[] {
  const rows = staffDb
    .prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as OrderRow[];
  return rows.map(toOrder);
}

export function getOrderStats(): { totalRevenue: number; totalOrders: number; conversionRate: number } {
  const totals = staffDb
    .prepare(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN amount_eur ELSE 0 END) AS revenue FROM orders"
    )
    .get() as { total: number; revenue: number | null };
  const completed = staffDb
    .prepare("SELECT COUNT(*) AS count FROM orders WHERE status = 'completed'")
    .get() as { count: number };

  return {
    totalRevenue: totals.revenue ?? 0,
    totalOrders: totals.total,
    conversionRate: totals.total > 0 ? (completed.count / totals.total) * 100 : 0,
  };
}

export function getRevenueByDay(days = 14): { date: string; revenue: number }[] {
  const rows = staffDb
    .prepare(
      `SELECT date(created_at, 'localtime') AS date, SUM(amount_eur) AS revenue
       FROM orders
       WHERE status = 'completed' AND created_at >= datetime('now', ?)
       GROUP BY date
       ORDER BY date ASC`
    )
    .all(`-${days} days`) as unknown as { date: string; revenue: number }[];
  return rows.map((r) => ({ date: r.date, revenue: r.revenue ?? 0 }));
}

export function getOrdersByDay(days = 14): { date: string; orders: number }[] {
  const rows = staffDb
    .prepare(
      `SELECT date(created_at, 'localtime') AS date, COUNT(*) AS orders
       FROM orders
       WHERE created_at >= datetime('now', ?)
       GROUP BY date
       ORDER BY date ASC`
    )
    .all(`-${days} days`) as unknown as { date: string; orders: number }[];
  return rows.map((r) => ({ date: r.date, orders: r.orders }));
}

export function getTopCountries(limit = 6): { countryName: string; countryCode: string; orders: number }[] {
  const rows = staffDb
    .prepare(
      `SELECT country_name AS countryName, country_code AS countryCode, COUNT(*) AS orders
       FROM orders
       WHERE status = 'completed'
       GROUP BY country_code
       ORDER BY orders DESC
       LIMIT ?`
    )
    .all(limit) as unknown as { countryName: string; countryCode: string; orders: number }[];
  return rows.map((r) => ({ countryName: r.countryName, countryCode: r.countryCode, orders: r.orders }));
}

interface MessageRow {
  id: number;
  sender_id: number;
  recipient_id: number | null;
  message: string;
  sent_at: string;
  is_team_broadcast: number;
  sender_name?: string | null;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name ?? undefined,
    recipientId: row.recipient_id,
    message: row.message,
    sentAt: row.sent_at,
    isTeamBroadcast: Boolean(row.is_team_broadcast),
  };
}

export function createMessage(input: {
  senderId: number;
  recipientId: number | null;
  message: string;
  isTeamBroadcast: boolean;
}): Message {
  const now = new Date().toISOString();
  const result = staffDb
    .prepare(
      "INSERT INTO messages (sender_id, recipient_id, message, sent_at, is_team_broadcast) VALUES (?, ?, ?, ?, ?)"
    )
    .run(input.senderId, input.recipientId, input.message, now, input.isTeamBroadcast ? 1 : 0);
  return {
    id: Number(result.lastInsertRowid),
    senderId: input.senderId,
    recipientId: input.recipientId,
    message: input.message,
    sentAt: now,
    isTeamBroadcast: input.isTeamBroadcast,
  };
}

export function getDirectConversation(staffIdA: number, staffIdB: number): Message[] {
  const rows = staffDb
    .prepare(
      `SELECT messages.*, staff_members.name AS sender_name
       FROM messages
       LEFT JOIN staff_members ON staff_members.id = messages.sender_id
       WHERE is_team_broadcast = 0
         AND ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
       ORDER BY sent_at ASC`
    )
    .all(staffIdA, staffIdB, staffIdB, staffIdA) as unknown as MessageRow[];
  return rows.map(toMessage);
}

export function getDirectMessagePartnerIds(staffId: number): number[] {
  const rows = staffDb
    .prepare(
      `SELECT DISTINCT CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END AS partner_id
       FROM messages
       WHERE is_team_broadcast = 0 AND (sender_id = ? OR recipient_id = ?)`
    )
    .all(staffId, staffId, staffId) as unknown as { partner_id: number | null }[];
  return rows.map((r) => r.partner_id).filter((id): id is number => id !== null);
}

export function getTeamBroadcasts(): Message[] {
  const rows = staffDb
    .prepare(
      `SELECT messages.*, staff_members.name AS sender_name
       FROM messages
       LEFT JOIN staff_members ON staff_members.id = messages.sender_id
       WHERE is_team_broadcast = 1
       ORDER BY sent_at ASC`
    )
    .all() as unknown as MessageRow[];
  return rows.map(toMessage);
}
