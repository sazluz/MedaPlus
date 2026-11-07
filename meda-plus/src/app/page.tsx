// "use client";

// import MatchGrid from "@/components/matches/MatchGrid";
// import { EventData } from "@/components/matches/MatchCard";

// export const dynamic = "force-dynamic"

// const FEATURED_BROADCASTS: EventData[] = [
//   {
//     id: "match-1",
//     type: "team_match",
//     title: "Arsenal vs Chelsea",
//     tournament: "Premier League • London Derby",
//     backdropUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200",
//     homeTeam: "Arsenal",
//     awayTeam: "Chelsea",
//     homeLogo: "https://media.api-sports.io/football/teams/42.png",
//     awayLogo: "https://media.api-sports.io/football/teams/49.png",
//     timeOrStatus: "67'",
//     isLive: true,
//     qualityBadge: "4K UHD",
//   },
//   {
//     id: "ufc-334",
//     type: "single_event",
//     title: "UFC 334",
//     tournament: "UFC Main Card",
//     backdropUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200",
//     eventHeadline: "UFC 334",
//     eventSubtitle: "Pereira vs Ankalaev • Light Heavyweight Title",
//     eventCategory: "Championship Bout",
//     timeOrStatus: "04:00 AM",
//     isLive: false,
//     qualityBadge: "1080P",
//   },
//   {
//     id: "match-2",
//     type: "team_match",
//     title: "Real Madrid vs Barcelona",
//     tournament: "La Liga • El Clásico",
//     backdropUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200",
//     homeTeam: "Real Madrid",
//     awayTeam: "Barcelona",
//     homeLogo: "https://media.api-sports.io/football/teams/541.png",
//     awayLogo: "https://media.api-sports.io/football/teams/529.png",
//     timeOrStatus: "22:00",
//     isLive: false,
//     qualityBadge: "1080P",
//   },
//   {
//     id: "f1-monaco",
//     type: "single_event",
//     title: "Formula 1 Monaco GP",
//     tournament: "Formula 1",
//     backdropUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200",
//     eventHeadline: "Formula 1 Monaco GP",
//     eventSubtitle: "Official Qualifying & Main Race Session",
//     eventCategory: "Grand Prix",
//     timeOrStatus: "Sunday 15:00",
//     isLive: false,
//     qualityBadge: "4K UHD",
//   },
// ];

// export default function Home() {
//   return (
//     <div className="space-y-6">
//       <MatchGrid
//         title="Live Now & Featured Broadcasts"
//         badge="Hot"
//         events={FEATURED_BROADCASTS}
//       />
//     </div>
//   );
// }

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