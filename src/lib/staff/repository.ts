import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { fromMySQLDateTime, getPool, toMySQLDateTime } from "./db";
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

interface StaffRow extends RowDataPacket {
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

export async function getStaffByEmail(
  email: string
): Promise<(StaffMember & { passwordHash: string }) | null> {
  const pool = await getPool();
  const [rows] = await pool.query<StaffRow[]>("SELECT * FROM staff_members WHERE email = ?", [email]);
  const row = rows[0];
  if (!row) return null;
  return { ...toStaffMember(row), passwordHash: row.password_hash };
}

export async function getStaffById(id: number): Promise<StaffMember | null> {
  const pool = await getPool();
  const [rows] = await pool.query<StaffRow[]>("SELECT * FROM staff_members WHERE id = ?", [id]);
  const row = rows[0];
  return row ? toStaffMember(row) : null;
}

export async function listStaff(): Promise<StaffMember[]> {
  const pool = await getPool();
  const [rows] = await pool.query<StaffRow[]>("SELECT * FROM staff_members ORDER BY name");
  return rows.map(toStaffMember);
}

export async function hasAnyAdmin(): Promise<boolean> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM staff_members WHERE role = 'admin'"
  );
  return rows[0].count > 0;
}

export async function createStaffMember(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
}): Promise<StaffMember> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO staff_members (name, email, password_hash, role, profile_photo) VALUES (?, ?, ?, ?, NULL)",
    [input.name, input.email, input.passwordHash, input.role]
  );
  return {
    id: result.insertId,
    name: input.name,
    email: input.email,
    role: input.role,
    profilePhoto: null,
  };
}

interface ShiftRow extends RowDataPacket {
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
    loginTime: fromMySQLDateTime(row.login_time),
    logoutTime: fromMySQLDateTime(row.logout_time),
    isCurrentlyActive: Boolean(row.is_currently_active),
  };
}

export async function getOpenShift(staffId: number): Promise<Shift | null> {
  const pool = await getPool();
  const [rows] = await pool.query<ShiftRow[]>(
    "SELECT * FROM shifts WHERE staff_id = ? AND is_currently_active = 1 ORDER BY id DESC LIMIT 1",
    [staffId]
  );
  const row = rows[0];
  return row ? toShift(row) : null;
}

export async function getTodaysShifts(staffId: number): Promise<Shift[]> {
  const pool = await getPool();
  const [rows] = await pool.query<ShiftRow[]>(
    "SELECT * FROM shifts WHERE staff_id = ? AND DATE(login_time) = CURDATE() ORDER BY id DESC",
    [staffId]
  );
  return rows.map(toShift);
}

export async function getShiftHistory(staffId: number, limit = 30): Promise<Shift[]> {
  const pool = await getPool();
  const [rows] = await pool.query<ShiftRow[]>(
    "SELECT * FROM shifts WHERE staff_id = ? ORDER BY id DESC LIMIT ?",
    [staffId, limit]
  );
  return rows.map(toShift);
}

export async function clockIn(staffId: number): Promise<Shift> {
  const pool = await getPool();
  const nowDate = new Date();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO shifts (staff_id, login_time, is_currently_active) VALUES (?, ?, 1)",
    [staffId, toMySQLDateTime(nowDate)]
  );
  return {
    id: result.insertId,
    staffId,
    loginTime: nowDate.toISOString(),
    logoutTime: null,
    isCurrentlyActive: true,
  };
}

export async function clockOut(shiftId: number): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE shifts SET logout_time = ?, is_currently_active = 0 WHERE id = ?", [
    toMySQLDateTime(new Date()),
    shiftId,
  ]);
}

export async function countActiveStaffNow(): Promise<number> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM shifts WHERE is_currently_active = 1"
  );
  return rows[0].count;
}

export async function getActiveStaffIds(): Promise<Set<number>> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { staff_id: number })[]>(
    "SELECT DISTINCT staff_id FROM shifts WHERE is_currently_active = 1"
  );
  return new Set(rows.map((r) => r.staff_id));
}

interface TaskRow extends RowDataPacket {
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

export async function getTasksForStaff(staffId: number): Promise<Task[]> {
  const pool = await getPool();
  const [rows] = await pool.query<TaskRow[]>(
    "SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_date IS NULL, due_date, id",
    [staffId]
  );
  return rows.map(toTask);
}

export async function listAllTasks(): Promise<Task[]> {
  const pool = await getPool();
  const [rows] = await pool.query<TaskRow[]>(
    `SELECT tasks.*, staff_members.name AS assigned_to_name
     FROM tasks
     LEFT JOIN staff_members ON staff_members.id = tasks.assigned_to
     ORDER BY tasks.due_date IS NULL, tasks.due_date, tasks.id`
  );
  return rows.map(toTask);
}

export async function getTaskById(taskId: number): Promise<Task | null> {
  const pool = await getPool();
  const [rows] = await pool.query<TaskRow[]>("SELECT * FROM tasks WHERE id = ?", [taskId]);
  const row = rows[0];
  return row ? toTask(row) : null;
}

export async function updateTaskStatus(taskId: number, status: TaskStatus): Promise<void> {
  const pool = await getPool();
  await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [status, taskId]);
}

export async function createTask(input: {
  title: string;
  description: string | null;
  assignedTo: number;
  dueDate: string | null;
  createdBy: number;
}): Promise<Task> {
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO tasks (title, description, assigned_to, status, due_date, created_by) VALUES (?, ?, ?, 'pending', ?, ?)",
    [input.title, input.description, input.assignedTo, input.dueDate, input.createdBy]
  );
  return {
    id: result.insertId,
    title: input.title,
    description: input.description,
    assignedTo: input.assignedTo,
    status: "pending",
    dueDate: input.dueDate,
    createdBy: input.createdBy,
  };
}

interface ComplaintRow extends RowDataPacket {
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
    createdAt: fromMySQLDateTime(row.created_at),
  };
}

export async function listRecentComplaints(limit = 5): Promise<Complaint[]> {
  const pool = await getPool();
  const [rows] = await pool.query<ComplaintRow[]>(
    "SELECT * FROM complaints ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  return rows.map(toComplaint);
}

export async function countOpenComplaints(): Promise<number> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM complaints WHERE status = 'open'"
  );
  return rows[0].count;
}

interface OrderRow extends RowDataPacket {
  id: number;
  plan_name: string;
  country_name: string;
  country_code: string;
  customer_name: string;
  customer_email: string;
  amount_eur: string;
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
    amountEur: Number(row.amount_eur),
    status: row.status,
    createdAt: fromMySQLDateTime(row.created_at),
  };
}

export async function listRecentOrders(limit = 8): Promise<StoreOrder[]> {
  const pool = await getPool();
  const [rows] = await pool.query<OrderRow[]>("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?", [
    limit,
  ]);
  return rows.map(toOrder);
}

export async function getOrderStats(): Promise<{
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
}> {
  const pool = await getPool();
  const [totalsRows] = await pool.query<(RowDataPacket & { total: number; revenue: string | null })[]>(
    "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN amount_eur ELSE 0 END) AS revenue FROM orders"
  );
  const [completedRows] = await pool.query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM orders WHERE status = 'completed'"
  );

  const totals = totalsRows[0];
  const completed = completedRows[0];

  return {
    totalRevenue: totals.revenue ? Number(totals.revenue) : 0,
    totalOrders: totals.total,
    conversionRate: totals.total > 0 ? (completed.count / totals.total) * 100 : 0,
  };
}

export async function getRevenueByDay(days = 14): Promise<{ date: string; revenue: number }[]> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { date: string; revenue: string | null })[]>(
    `SELECT DATE(created_at) AS date, SUM(amount_eur) AS revenue
     FROM orders
     WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY date
     ORDER BY date ASC`,
    [days]
  );
  return rows.map((r) => ({ date: r.date, revenue: r.revenue ? Number(r.revenue) : 0 }));
}

export async function getOrdersByDay(days = 14): Promise<{ date: string; orders: number }[]> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { date: string; orders: number })[]>(
    `SELECT DATE(created_at) AS date, COUNT(*) AS orders
     FROM orders
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY date
     ORDER BY date ASC`,
    [days]
  );
  return rows.map((r) => ({ date: r.date, orders: r.orders }));
}

export async function getTopCountries(
  limit = 6
): Promise<{ countryName: string; countryCode: string; orders: number }[]> {
  const pool = await getPool();
  const [rows] = await pool.query<
    (RowDataPacket & { countryName: string; countryCode: string; orders: number })[]
  >(
    `SELECT country_name AS countryName, country_code AS countryCode, COUNT(*) AS orders
     FROM orders
     WHERE status = 'completed'
     GROUP BY country_code, country_name
     ORDER BY orders DESC
     LIMIT ?`,
    [limit]
  );
  return rows.map((r) => ({ countryName: r.countryName, countryCode: r.countryCode, orders: r.orders }));
}

interface MessageRow extends RowDataPacket {
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
    sentAt: fromMySQLDateTime(row.sent_at),
    isTeamBroadcast: Boolean(row.is_team_broadcast),
  };
}

export async function createMessage(input: {
  senderId: number;
  recipientId: number | null;
  message: string;
  isTeamBroadcast: boolean;
}): Promise<Message> {
  const pool = await getPool();
  const nowDate = new Date();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO messages (sender_id, recipient_id, message, sent_at, is_team_broadcast) VALUES (?, ?, ?, ?, ?)",
    [input.senderId, input.recipientId, input.message, toMySQLDateTime(nowDate), input.isTeamBroadcast ? 1 : 0]
  );
  return {
    id: result.insertId,
    senderId: input.senderId,
    recipientId: input.recipientId,
    message: input.message,
    sentAt: nowDate.toISOString(),
    isTeamBroadcast: input.isTeamBroadcast,
  };
}

export async function getDirectConversation(staffIdA: number, staffIdB: number): Promise<Message[]> {
  const pool = await getPool();
  const [rows] = await pool.query<MessageRow[]>(
    `SELECT messages.*, staff_members.name AS sender_name
     FROM messages
     LEFT JOIN staff_members ON staff_members.id = messages.sender_id
     WHERE is_team_broadcast = 0
       AND ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
     ORDER BY sent_at ASC`,
    [staffIdA, staffIdB, staffIdB, staffIdA]
  );
  return rows.map(toMessage);
}

export async function getDirectMessagePartnerIds(staffId: number): Promise<number[]> {
  const pool = await getPool();
  const [rows] = await pool.query<(RowDataPacket & { partner_id: number | null })[]>(
    `SELECT DISTINCT CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END AS partner_id
     FROM messages
     WHERE is_team_broadcast = 0 AND (sender_id = ? OR recipient_id = ?)`,
    [staffId, staffId, staffId]
  );
  return rows.map((r) => r.partner_id).filter((id): id is number => id !== null);
}

export async function getTeamBroadcasts(): Promise<Message[]> {
  const pool = await getPool();
  const [rows] = await pool.query<MessageRow[]>(
    `SELECT messages.*, staff_members.name AS sender_name
     FROM messages
     LEFT JOIN staff_members ON staff_members.id = messages.sender_id
     WHERE is_team_broadcast = 1
     ORDER BY sent_at ASC`
  );
  return rows.map(toMessage);
}
