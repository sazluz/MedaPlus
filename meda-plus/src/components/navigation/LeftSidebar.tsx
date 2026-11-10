"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Radio, 
  Tv, 
  LayoutGrid, 
  Inbox, 
  ShieldCheck 
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isLiveIndicator?: boolean;
  tag?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Live",
    href: "/",
    icon: Radio,
    isLiveIndicator: true,
  },
  {
    label: "24/7 TV",
    href: "/channels",
    icon: Tv,
  },
  // {
  //   label: "Multi-View",
  //   href: "/multiview",
  //   icon: LayoutGrid,
  //   tag: "SOON",
  // },
  // {
  //   label: "Requests",
  //   href: "/requests",
  //   icon: Inbox,
  // },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-40 hidden md:flex w-20 flex-col items-center py-4 border-r border-white/[0.06] bg-[#07080B] select-none">
      {/* Primary Navigation Rail - Centered Vertically on Screen */}
      <nav className="my-auto flex flex-col justify-center gap-3 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-16 rounded-lg transition-colors duration-150 ${
                isActive
                  ? "bg-white/[0.04] text-white"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
              }`}
            >
              {/* Broadcast Precision Edge Indicator (Left 2px line) */}
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-[2px] bg-[#E50914]" />
              )}

              {/* Icon Container with Precision Dot */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? "text-white" : "text-zinc-400"
                  }`}
                />
                
                {/* Minimalist Live Signal Dot */}
                {item.isLiveIndicator && (
                  <span className="absolute -top-1 -right-1.5 h-1.5 w-1.5 rounded-full bg-[#E50914]" />
                )}
              </div>

              {/* Monospace Label */}
              <span className="text-[10px] font-medium tracking-tight mt-1.5 leading-none">
                {item.label}
              </span>

              {/* Subdued Status Pill */}
              {item.tag && (
                <span className="absolute bottom-1 text-[8px] font-mono tracking-tighter text-zinc-500">
                  {item.tag}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}