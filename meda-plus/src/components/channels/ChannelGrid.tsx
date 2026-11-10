"use client";

import { useState } from "react";
import Link from "next/link";
import { Tv, Radio, Play } from "lucide-react";
import { ChannelData } from "@/db/queries";

export default function ChannelGrid({ channels }: { channels: ChannelData[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredChannels =
    activeCategory === "All"
      ? channels
      : channels.filter((c) => c.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-6">

      {/* Channels Grid */}
      {filteredChannels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center text-xs text-neutral-500">
          No TV channels found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredChannels.map((channel) => (
            <Link
              key={channel.id}
              href={`/channels/${channel.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4 transition duration-300 hover:border-[#00E676]/60 hover:bg-[#111714] hover:shadow-[0_0_25px_rgba(0,230,118,0.15)]"
            >
              {/* Channel Logo */}
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-neutral-900/90 border border-neutral-800 p-2 transition group-hover:scale-105">
                  {channel.logoUrl ? (
                    <img
                      src={channel.logoUrl}
                      alt={channel.name}
                      className="h-full w-full object-contain drop-shadow"
                    />
                  ) : (
                    <Tv className="h-8 w-8 text-neutral-500" />
                  )}
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-[#00E676] transition">
                    {channel.name}
                  </h3>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {channel.category}
                  </span>
                </div>
              </div>

              {/* Status and Action Bar */}
              <div className="border-t border-neutral-800/60 pt-2.5 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 text-[#00E676] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                  24/7 LIVE
                </span>

                <span className="flex items-center gap-1 text-neutral-400 font-mono group-hover:text-white transition">
                  <Play className="h-2.5 w-2.5 fill-current" />
                  <span>Watch</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}