"use client";

import Link from "next/link";
import { Play, Radio } from "lucide-react";

export interface ChannelItem {
  id: string;
  name: string;
  category: "Sports" | "News" | "Entertainment";
  streamUrl: string;
  logoUrl: string;
  backdropUrl: string;
  currentShow: string;
  qualityBadge?: string;
  isOnline?: boolean;
}

export default function ChannelCard({ channel }: { channel: ChannelItem }) {
  return (
    <Link
      href={`/channels/${channel.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800/60 bg-[#0A0C12] transition-all duration-300 hover:border-[#E50914]/80 hover:shadow-[0_12px_30px_rgba(229,9,20,0.18)]"
    >
      {/* Background Graphic / Stadium Backdrop Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src={channel.backdropUrl}
          alt={channel.name}
          className="h-full w-full object-cover object-center opacity-30 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C12] via-[#0A0C12]/80 to-black/30" />
      </div>

      {/* Top Header: Simple Text (No nested boxes) */}
      <div className="relative z-10 flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
            {channel.category}
          </span>
          {channel.qualityBadge && (
            <span className="text-[10px] font-mono text-[#00E676]">
              • {channel.qualityBadge}
            </span>
          )}
        </div>

        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#E50914]">
          <span className="h-2 w-2 rounded-full bg-[#E50914] animate-ping" />
          24/7 LIVE
        </span>
      </div>

      {/* Center Body: Channel Logo, Title & Current Schedule */}
      <div className="relative z-10 flex items-center gap-4 px-5 py-4 min-h-[96px]">
        {/* Channel Emblem / Logo without heavy borders */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center">
          <img
            src={channel.logoUrl}
            alt={channel.name}
            className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Channel Text Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white group-hover:text-[#E50914] transition-colors truncate">
            {channel.name}
          </h3>
          <p className="mt-1 text-xs text-neutral-400 truncate">
            <span className="text-neutral-500 font-bold">Now:</span> {channel.currentShow}
          </p>
        </div>
      </div>

      {/* Bottom Footer: Centered Watch Live Action */}
      <div className="relative z-10 flex items-center justify-center p-3 pt-1 border-t border-neutral-800/40">
        <span className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-2 text-xs font-black uppercase tracking-wider text-white transition-all group-hover:bg-[#E50914] group-hover:shadow-[0_0_15px_rgba(229,9,20,0.5)]">
          <Play className="h-3.5 w-3.5 fill-current" />
          Watch Live
        </span>
      </div>
    </Link>
  );
}