export type StaffRole = "staff" | "admin";

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  profilePhoto: string | null;
}

export interface Shift {
  id: number;
  staffId: number;
  loginTime: string;
  logoutTime: string | null;
  isCurrentlyActive: boolean;
}

export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  assignedTo: number | null;
  assignedToName?: string;
  status: TaskStatus;
  dueDate: string | null;
  createdBy: number | null;
}

export type ComplaintStatus = "open" | "resolved";

export interface Complaint {
  id: number;
  customerName: string;
  subject: string;
  status: ComplaintStatus;
  createdAt: string;
}

export type OrderStatus = "completed" | "refunded" | "failed";

export interface StoreOrder {
  id: number;
  planName: string;
  countryName: string;
  countryCode: string;
  customerName: string;
  customerEmail: string;
  amountEur: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName?: string;
  recipientId: number | null;
  message: string;
  sentAt: string;
  isTeamBroadcast: boolean;
}
