import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import WatchPlayerRoom from "@/components/watch/WatchPlayerRoom";
import { RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function WatchContent({ params }: PageProps) {
  // Opt out of prerender caching cleanly inside a Suspense boundary
  await connection();
  const { id } = await params;

  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  const match = result[0];

  if (!match) {
    notFound();
  }

  let parsedServers = [];
  try {
    parsedServers = JSON.parse(match.servers || "[]");
  } catch {
    parsedServers = [];
  }

  if (parsedServers.length === 0) {
    parsedServers = [
      {
        name: "Main Server",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        quality: match.qualityBadge || "1080P",
      },
    ];
  }

  const sanitizedEvent = {
    id: match.id,
    type: match.type || "team_match",
    title: match.title,
    tournament: match.tournament,
    backdropUrl: match.backdropUrl,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeLogo: match.homeLogo,
    awayLogo: match.awayLogo,
    timeOrStatus: match.timeOrStatus,
    isLive: Boolean(match.isLive),
    qualityBadge: match.qualityBadge || "1080P",
    servers: parsedServers,
  };

  return <WatchPlayerRoom event={sanitizedEvent} />;
}

function WatchSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white pb-12 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
        <div className="h-4 w-32 bg-neutral-900 rounded" />
        <div className="h-4 w-20 bg-neutral-900 rounded" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Player Skeleton */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-[#E50914]" />
          </div>
          <div className="h-24 rounded-2xl bg-[#0E1017] border border-neutral-800" />
          <div className="h-32 rounded-2xl bg-[#0E1017] border border-neutral-800" />
        </div>

        {/* Chat Skeleton */}
        <div className="lg:col-span-4 h-[580px] rounded-2xl bg-[#0E1017] border border-neutral-800" />
      </div>
    </div>
  );
}

export default function WatchEventPage({ params }: PageProps) {
  return (
    <Suspense fallback={<WatchSkeleton />}>
      <WatchContent params={params} />
    </Suspense>
  );
}