import { getStaffSession } from "@/lib/staff/auth";
import {
  getDirectConversation,
  getDirectMessagePartnerIds,
  getStaffById,
  getTeamBroadcasts,
} from "@/lib/staff/repository";
import MessagesClient from "./MessagesClient";
import { getAdminT } from "@/i18n/admin";

export default async function StaffMessagesPage() {
  const session = await getStaffSession();
  if (!session) return null;
  const t = await getAdminT();

  const partnerIds = await getDirectMessagePartnerIds(session.staffId);
  const threadsWithNulls = await Promise.all(
    partnerIds.map(async (partnerId) => {
      const partner = await getStaffById(partnerId);
      if (!partner) return null;
      return {
        partnerId,
        partnerName: partner.name,
        messages: await getDirectConversation(session.staffId, partnerId),
      };
    })
  );
  const directThreads = threadsWithNulls.filter((t): t is NonNullable<typeof t> => t !== null);

  const teamBroadcasts = await getTeamBroadcasts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("portal.messages")}</h1>
        <p className="mt-1 text-sm text-muted">{t("portal.messagesIntro")}</p>
      </div>

      <MessagesClient
        currentStaffId={session.staffId}
        directThreads={directThreads}
        teamBroadcasts={teamBroadcasts}
      />
    </div>
  );
}
