"use client";

import ChannelCard, { ChannelItem } from "./ChannelCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ChannelGridProps {
  title: string;
  channels: ChannelItem[];
  badge?: string;
  seeAllHref?: string;
}

export default function ChannelGrid({
  title,
  channels,
  badge = "24/7",
  seeAllHref,
}: ChannelGridProps) {
  if (channels.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
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

      {/* Grid: 1 column on mobile, 2 wide columns on desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </section>
  );
}