import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/app/actions/adminAuth";
import { db } from "@/db";
import { events, channels, matchRequests } from "@/db/schema";
import { desc } from "drizzle-orm";
import AdminDashboardView from "@/components/admin/AdminDashboardView";

// export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  // Load all broadcast data concurrently
  const [allEvents, allChannels, allRequests] = await Promise.all([
    db.select().from(events).orderBy(desc(events.isLive), desc(events.startTime)),
    db.select().from(channels),
    db.select().from(matchRequests).orderBy(desc(matchRequests.votes)),
  ]);

  return (
    <main className="min-h-screen bg-[#07090E] text-white">
      <AdminDashboardView
        events={allEvents}
        channels={allChannels}
        requests={allRequests}
      />
    </main>
  );
}