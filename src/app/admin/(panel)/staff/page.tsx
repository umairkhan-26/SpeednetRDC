import Link from "next/link";
import { getStaffSession } from "@/lib/staff/auth";
import {
  getActiveStaffIds,
  getDirectConversation,
  getOpenShift,
  getTeamBroadcasts,
  listStaff,
} from "@/lib/staff/repository";
import NewStaffForm from "./NewStaffForm";
import MessageButton from "./MessageButton";
import TeamBroadcastButton from "./TeamBroadcastButton";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default async function AdminStaffDirectoryPage() {
  const session = await getStaffSession();
  if (!session) return null;

  const staff = await listStaff();
  const activeIds = await getActiveStaffIds();
  const teamBroadcasts = await getTeamBroadcasts();

  const rows = await Promise.all(
    staff.map(async (member) => {
      const isOnline = activeIds.has(member.id);
      const openShift = isOnline ? await getOpenShift(member.id) : null;
      const conversation =
        member.id === session.staffId ? [] : await getDirectConversation(session.staffId, member.id);
      return { member, isOnline, openShift, conversation };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Staff Directory</h1>
          <p className="mt-1 text-sm text-muted">Every staff and admin account, with today&apos;s shift status.</p>
        </div>
        <div className="flex items-center gap-3">
          <TeamBroadcastButton messages={teamBroadcasts} />
          <NewStaffForm />
        </div>
      </div>

      <div className="divide-y divide-line rounded-2xl border border-line bg-white">
        {rows.map(({ member, isOnline, openShift, conversation }) => {
          return (
            <div key={member.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-cream/60">
              <Link href={`/admin/staff/${member.id}`} className="flex flex-1 items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-orange/10 text-sm font-bold text-orange">
                  {member.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-ink">{member.name}</p>
                  <p className="text-sm text-muted">{member.email}</p>
                </div>
              </Link>
              <div className="flex items-center gap-6">
                <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold capitalize text-orange">
                  {member.role}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`size-2 rounded-full ${isOnline ? "bg-green-500" : "bg-muted-light"}`} />
                  <span className="font-medium text-ink">{isOnline ? "Online" : "Offline"}</span>
                </div>
                <p className="w-28 text-right text-sm text-muted">
                  {openShift ? `Since ${formatTime(openShift.loginTime)}` : "Not clocked in"}
                </p>
                {member.id !== session.staffId && (
                  <MessageButton
                    recipientId={member.id}
                    recipientName={member.name}
                    currentAdminId={session.staffId}
                    messages={conversation}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
