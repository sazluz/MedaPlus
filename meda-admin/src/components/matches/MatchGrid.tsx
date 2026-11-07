"use client";

import MatchCard, { EventData } from "./MatchCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface MatchGridProps {
  title: string;
  badge?: string;
  events: EventData[];
  seeAllHref?: string;
}

export default function MatchGrid({
  title,
  badge,
  events,
  seeAllHref,
}: MatchGridProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800/60 bg-[#0A0C12] p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          No live broadcasts scheduled right now
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1 rounded-full bg-[#E50914]" />
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>
          {badge && (
            <span className="rounded-full bg-[#E50914]/20 border border-[#E50914]/30 px-2 py-0.5 text-[10px] font-black uppercase text-[#E50914]">
              {badge}
            </span>
          )}
        </div>

        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            See All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {events.map((evt) => (
          <MatchCard key={evt.id} event={evt} />
        ))}
      </div>
    </section>
  );
}