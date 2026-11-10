"use client";

import { Radio, Tv } from "lucide-react";

interface CategoryTabsProps {
  activeTab: "live" | "channels";
  onTabChange: (tab: "live" | "channels") => void;
}

export default function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center justify-center gap-8 py-3 border-b border-neutral-900/60">
      <button
        onClick={() => onTabChange("live")}
        className={`relative flex items-center gap-2 pb-2 text-xs font-black uppercase tracking-wider transition-colors ${
          activeTab === "live" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
        }`}
      >
        <Radio className={`h-4 w-4 ${activeTab === "live" ? "text-[#E50914]" : "text-neutral-500"}`} />
        <span>Live Matches</span>
        {activeTab === "live" && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E50914] rounded-full" />
        )}
      </button>

      <button
        onClick={() => onTabChange("channels")}
        className={`relative flex items-center gap-2 pb-2 text-xs font-black uppercase tracking-wider transition-colors ${
          activeTab === "channels" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
        }`}
      >
        <Tv className={`h-4 w-4 ${activeTab === "channels" ? "text-[#E50914]" : "text-neutral-500"}`} />
        <span>24/7 Channels</span>
        {activeTab === "channels" && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E50914] rounded-full" />
        )}
      </button>
    </div>
  );
}