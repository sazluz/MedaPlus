import { Suspense } from "react";
import { connection } from "next/server";
import MatchGrid from "@/components/matches/MatchGrid";
import { getLiveAndUpcomingEvents } from "@/db/queries";

async function LiveMatchesStream() {
  // Opt out of prerender caching during build and fetch fresh data from Turso
  await connection();
  const liveEvents = await getLiveAndUpcomingEvents();

  return (
    <MatchGrid
      title="Live Now & Featured Broadcasts"
      badge="Live"
      events={liveEvents}
    />
  );
}

function MatchGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1 rounded-full bg-[#E50914]" />
        <div className="h-6 w-48 rounded bg-neutral-900 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-44 rounded-2xl border border-neutral-800/60 bg-[#0A0C12] animate-pulse" />
        <div className="h-44 rounded-2xl border border-neutral-800/60 bg-[#0A0C12] animate-pulse" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<MatchGridSkeleton />}>
        <LiveMatchesStream />
      </Suspense>
    </div>
  );
}