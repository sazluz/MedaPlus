"use client";

import Link from "next/link";
import { Play, Flame, Calendar } from "lucide-react";

export type EventType = "team_match" | "single_event";

export interface EventData {
  id: string;
  type: EventType;
  title: string;
  tournament: string;
  backdropUrl: string;
  timeOrStatus: string;
  isLive: boolean;
  qualityBadge?: string;
  // Team match props
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  // Single event props (UFC, F1, Boxing)
  eventHeadline?: string;
  eventSubtitle?: string;
  eventCategory?: string;
}

export default function MatchCard({ event }: { event: EventData }) {
  const isTeam = event.type === "team_match";

  return (
    <Link
      href={`/watch/${event.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800/60 bg-[#0A0C12] transition-all duration-300 hover:border-[#E50914]/80 hover:shadow-[0_12px_30px_rgba(229,9,20,0.18)]"
    >
      {/* Background Graphic / Stadium Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={event.backdropUrl}
          className="h-full w-full object-cover object-center opacity-40 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C12] via-[#0A0C12]/80 to-black/30" />
      </div>

      {/* Top Header: Simple Text (No nested boxes) */}
      <div className="relative z-10 flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
            {event.tournament}
          </span>
          {event.qualityBadge && (
            <span className="text-[10px] font-mono text-[#00E676]">
              • {event.qualityBadge}
            </span>
          )}
        </div>

        {event.isLive ? (
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#E50914]">
            <span className="h-2 w-2 rounded-full bg-[#E50914] animate-ping" />
            LIVE {event.timeOrStatus}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-neutral-400">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            {event.timeOrStatus}
          </span>
        )}
      </div>

      {/* Center Body: Clean Crests + Team Names (No scores, no logo boxes) */}
      <div className="relative z-10 px-5 py-4">
        {isTeam ? (
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex flex-1 items-center gap-3 min-w-0">
              {/* <img
                src={event.homeLogo}
                className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
              /> */}
              <span className="text-base sm:text-lg font-black uppercase tracking-tight text-white group-hover:text-[#E50914] transition-colors truncate">
                {event.homeTeam}
              </span>
            </div>

            {/* Simple VS text */}
            <span className="text-xs font-black tracking-widest text-neutral-500 font-mono px-2">
              VS
            </span>

            {/* Away Team */}
            <div className="flex flex-1 items-center justify-end gap-3 min-w-0 text-right">
              <span className="text-base sm:text-lg font-black uppercase tracking-tight text-white group-hover:text-[#E50914] transition-colors truncate">
                {event.awayTeam}
              </span>
              {/* <img
                src={event.awayLogo}
                className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
              /> */}
            </div>
          </div>
        ) : (
          /* Single Event (UFC, F1, Boxing) */
          <div className="flex flex-col justify-center min-h-[50px]">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#E50914]">
              <Flame className="h-3 w-3" />
              <span>{event.eventCategory || "Main Event"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white group-hover:text-[#E50914] transition-colors">
              {event.eventHeadline || event.title}
            </h3>
            {event.eventSubtitle && (
              <p className="text-xs sm:text-sm font-semibold text-neutral-300">
                {event.eventSubtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Centered Watch Now Button */}
      <div className="relative z-10 flex items-center justify-center p-3 pt-1 border-neutral-800/40">
        <span className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-2 text-xs font-black uppercase tracking-wider text-white transition-all group-hover:bg-[#E50914] group-hover:shadow-[0_0_15px_rgba(229,9,20,0.5)]">
          <Play className="h-3.5 w-3.5 fill-current" />
          Watch Now
        </span>
      </div>
    </Link>
  );
}