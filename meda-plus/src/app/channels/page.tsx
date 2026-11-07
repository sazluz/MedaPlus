"use client";

import { useState } from "react";
import ChannelGrid from "@/components/channels/ChannelGrid";
import { CHANNELS_CATALOG } from "@/data/channels";

const CATEGORIES = ["All", "Sports", "News"] as const;

export default function ChannelsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredChannels =
    activeCategory === "All"
      ? CHANNELS_CATALOG
      : CHANNELS_CATALOG.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-6 pt-2">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">


        <div className="flex items-center gap-1.5 rounded-xl border border-neutral-900 bg-[#0E1017] p-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wider transition ${
                activeCategory === cat
                  ? "bg-[#E50914] text-white"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Clean Channel Cards */}
      <ChannelGrid
        title="Active 24/7 Networks"
        badge="ONLINE"
        channels={filteredChannels}
      />
    </div>
  );
}