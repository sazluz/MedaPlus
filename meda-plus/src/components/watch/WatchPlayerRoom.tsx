"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Server, 
  Radio, 
  Eye, 
  Share2, 
  Shield, 
  Check, 
  MessageSquare,
  Sparkles,
  Send
} from "lucide-react";
import HlsVideoPlayer from "./HlsVideoPlayer";

interface StreamServer {
  name: string;
  url: string;
  quality: string;
}

interface EventPayload {
  id: string;
  type: string;
  title: string;
  tournament: string;
  backdropUrl: string;
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeLogo?: string | null;
  awayLogo?: string | null;
  timeOrStatus: string;
  isLive: boolean;
  qualityBadge: string;
  servers: StreamServer[];
}

export default function WatchPlayerRoom({ event }: { event: EventPayload }) {
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<{ user: string; text: string; time: string }[]>([
    { user: "AddisFan99", text: "Quality is crisp on Server 1!", time: "Just now" },
    { user: "MedaMod", text: "Welcome to Meda+ live watch room. Respect community rules.", time: "2m ago" },
  ]);

  const activeServer = event.servers[selectedServerIndex] || event.servers[0];
  const isTeam = event.type === "team_match" && event.homeTeam && event.awayTeam;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        user: "You",
        text: chatMessage.trim(),
        time: "Just now",
      },
    ]);
    setChatMessage("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-900 pb-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Matches</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
            <Eye className="h-3.5 w-3.5 text-[#E50914]" />
            <span>2.4k Watching</span>
          </span>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#0E1017] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:border-neutral-700 hover:text-white transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? "Link Copied" : "Share"}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Player & Server Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Video Screen */}
          <HlsVideoPlayer
            src={activeServer?.url || ""}
            poster={event.backdropUrl}
            serverName={activeServer?.name || "Server"}
          />

          {/* DYNAMIC SERVER MIRROR SWITCHER BAR */}
          <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-[#E50914]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Available Mirrors ({event.servers.length})
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Current: <strong className="text-[#E50914]">{activeServer?.name}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {event.servers.map((srv, idx) => {
                const isActive = selectedServerIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedServerIndex(idx)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider transition-all ${
                      isActive
                        ? "bg-[#E50914] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] scale-105"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-white animate-pulse" : "bg-emerald-400"
                      }`}
                    />
                    <span>{srv.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                        isActive ? "bg-black/30 text-white" : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {srv.quality || "HD"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Metadata & Fixture Header Card */}
          {/* <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/60 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                {event.tournament}
              </span>

              {event.isLive ? (
                <span className="flex items-center gap-1.5 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#E50914]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E50914] animate-ping" />
                  LIVE {event.timeOrStatus !== "LIVE" ? `• ${event.timeOrStatus}` : ""}
                </span>
              ) : (
                <span className="rounded-full bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                  {event.timeOrStatus}
                </span>
              )}
            </div>

            {isTeam ? (
              <div className="grid grid-cols-7 items-center py-2 text-center">
                <div className="col-span-3 flex items-center justify-end gap-3">
                  <span className="text-sm sm:text-base font-black uppercase text-white">
                    {event.homeTeam}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 p-2 shrink-0">
                    {event.homeLogo ? (
                      <img src={event.homeLogo} alt={event.homeTeam || "Home"} className="h-full w-full object-contain" />
                    ) : (
                      <Shield className="h-6 w-6 text-neutral-500" />
                    )}
                  </div>
                </div>

                <div className="col-span-1 flex justify-center">
                  <span className="rounded-lg bg-neutral-900/90 border border-neutral-800 px-2.5 py-1 text-xs font-black text-[#E50914]">
                    VS
                  </span>
                </div>

                <div className="col-span-3 flex items-center justify-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 p-2 shrink-0">
                    {event.awayLogo ? (
                      <img src={event.awayLogo} alt={event.awayTeam || "Away"} className="h-full w-full object-contain" />
                    ) : (
                      <Shield className="h-6 w-6 text-neutral-500" />
                    )}
                  </div>
                  <span className="text-sm sm:text-base font-black uppercase text-white">
                    {event.awayTeam}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">{event.title}</h2>
                <p className="text-xs text-neutral-400 mt-1">Direct live broadcast feed.</p>
              </div>
            )}
          </div> */}
        </div>

        {/* Right Column: Live Fan Room Chat (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col h-[580px] lg:h-auto rounded-2xl border border-neutral-800/80 bg-[#0E1017]">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#E50914]" />
              <span className="text-xs font-black uppercase tracking-wider text-white">Live Fan Room</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
            {messages.map((msg, idx) => (
              <div key={idx} className="rounded-xl border border-neutral-800/60 bg-[#07080B] p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#E50914]">{msg.user}</span>
                  <span className="font-mono text-neutral-500">{msg.time}</span>
                </div>
                <p className="text-xs text-neutral-200">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="border-t border-neutral-800/80 p-3 flex gap-2">
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Join match discussion..."
              className="flex-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-xl bg-[#E50914] px-3.5 py-2 text-white hover:bg-red-700 transition"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}