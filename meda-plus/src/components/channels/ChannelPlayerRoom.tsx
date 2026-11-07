"use client";

import { useState } from "react";
import Link from "next/link";
import HlsPlayer from "@/components/player/HlsPlayer";
import { ChannelItem } from "./ChannelCard";
import { 
  Server, 
  Share2, 
  Flag, 
  Radio, 
  Tv, 
  ChevronRight, 
  Sparkles,
  Check
} from "lucide-react";

interface StreamMirror {
  name: string;
  url: string;
  quality: string;
}

interface ChannelPlayerRoomProps {
  currentChannel: ChannelItem;
  allChannels: ChannelItem[];
}

export default function ChannelPlayerRoom({
  currentChannel,
  allChannels,
}: ChannelPlayerRoomProps) {
  // Configured stream mirrors (falls back to primary streamUrl)
  const mirrors: StreamMirror[] = [
    {
      name: "Server 1 (Primary)",
      url: currentChannel.streamUrl,
      quality: currentChannel.qualityBadge || "1080P 50FPS",
    },
    {
      name: "Server 2 (Backup)",
      url: currentChannel.streamUrl,
      quality: "720P HD",
    },
  ];

  const [activeMirrorIndex, setActiveMirrorIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);

  const activeMirror = mirrors[activeMirrorIndex] || mirrors[0];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pt-2 max-w-7xl mx-auto">
      {/* Breadcrumb / Category Status Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
          <Link href="/channels" className="hover:text-white transition">
            Channels
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
          <span className="text-[#E50914] uppercase">{currentChannel.category}</span>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
          <span className="text-white truncate">{currentChannel.name}</span>
        </div>

        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase text-[#E50914]">
          <span className="h-2 w-2 rounded-full bg-[#E50914] animate-ping" />
          24/7 BROADCAST
        </span>
      </div>

      {/* Main Player & Channel Switcher Grid (12 Columns) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Video Player & Details (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Server Mirror Switches */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#E50914]" />
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Mirror Feed:
              </span>
            </div>

            <div className="flex items-center gap-2">
              {mirrors.map((mirror, idx) => (
                <button
                  key={mirror.name}
                  onClick={() => setActiveMirrorIndex(idx)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                    activeMirrorIndex === idx
                      ? "bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                      : "bg-[#10121A] text-neutral-400 hover:bg-[#161922] hover:text-white"
                  }`}
                >
                  <span>{mirror.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({mirror.quality})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Video Screen */}
          <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-black shadow-2xl">
            <HlsPlayer
              key={activeMirror.url + activeMirrorIndex}
              streamUrl={activeMirror.url}
              autoPlay={true}
            />
          </div>

          {/* Channel Info & Actions */}
          <div className="pt-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={currentChannel.logoUrl}
                  alt={currentChannel.name}
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    {currentChannel.name}
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    <span className="text-neutral-500 font-bold">Current Broadcast:</span>{" "}
                    {currentChannel.currentShow}
                  </p>
                </div>
              </div>

              {/* Share & Report Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-lg bg-[#10121A] border border-neutral-800/80 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-white transition"
                >
                  {hasCopied ? <Check className="h-3.5 w-3.5 text-[#00E676]" /> : <Share2 className="h-3.5 w-3.5 text-neutral-400" />}
                  <span>{hasCopied ? "Copied" : "Share"}</span>
                </button>

                <a
                  href="https://t.me/medaplus_live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-[#10121A] border border-neutral-800/80 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-[#E50914] transition"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Report</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Switch Channel Directory (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col h-[580px] lg:h-[660px] rounded-2xl border border-neutral-800/80 bg-[#0B0D13] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-3 bg-[#08090D]">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4 text-[#E50914]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Live Channels Guide
              </h3>
            </div>
            <span className="text-[10px] font-bold text-neutral-500 font-mono">
              {allChannels.length} ONLINE
            </span>
          </div>

          {/* Quick Switch Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {allChannels.map((channel) => {
              const isCurrent = channel.id === currentChannel.id;

              return (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-[#E50914] bg-[#161924] shadow-md ring-1 ring-[#E50914]"
                      : "border-neutral-800/50 bg-[#10121A] hover:border-neutral-700 hover:bg-[#131620]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={channel.logoUrl}
                      alt={channel.name}
                      className="h-9 w-9 shrink-0 object-contain drop-shadow"
                    />
                    <div className="truncate">
                      <h4 className="text-xs font-black uppercase text-white truncate">
                        {channel.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {channel.currentShow}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-[#E50914]">
                        <Radio className="h-3 w-3 animate-pulse" /> Playing
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500">
                        {channel.qualityBadge || "HD"}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}