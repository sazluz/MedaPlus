"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Maximize, Minimize, User, Send } from "lucide-react";

export default function TopHeader() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-900/60 bg-[#0A0B0E]/95 px-4 md:px-8 backdrop-blur-md">
      {/* Brand Logo (Red, Bold, Styled like SAZFLIX) */}
      <Link href="/" className="flex items-center gap-1 group">
        <span className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#E50914] drop-shadow-[0_0_12px_rgba(229,9,20,0.35)]">
          MEDA<span className="text-white">PLUS</span>
        </span>
      </Link>

      {/* Center Pill Search Bar with CTRL+K */}
      <div className="relative hidden sm:flex w-full max-w-md items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-neutral-500 pointer-events-none" />
        <input
          id="global-search-input"
          type="text"
          placeholder="Search matches, tournaments, channels..."
          className="w-full rounded-full border border-neutral-800/80 bg-[#12141A] py-2 pl-10 pr-20 text-xs text-white placeholder-neutral-500 transition-all focus:border-red-600/80 focus:bg-[#161922] focus:outline-none"
        />
        <div className="absolute right-2.5 flex items-center gap-1 rounded border border-neutral-800 bg-[#0D0F14] px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
          <span>CTRL+K</span>
        </div>
      </div>

      {/* Right Controls: Socials, Fullscreen, Profile */}
      <div className="flex items-center gap-3">
        {/* Telegram Community Quick Button */}
        <a
          href="https://t.me/medaplus_live"
          target="_blank"
          rel="noopener noreferrer"
          title="Join Telegram Community"
          className="flex items-center gap-1.5 rounded-lg border border-[#229ED9]/30 bg-[#229ED9]/10 px-2.5 py-1.5 text-xs font-bold text-[#229ED9] hover:bg-[#229ED9]/20 transition"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden lg:inline text-[11px]">Telegram</span>
        </a>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white transition"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>

        {/* User / Admin Access Avatar */}
        <Link
          href="/admin"
          title="Admin Control"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-600 transition"
        >
          <User className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}