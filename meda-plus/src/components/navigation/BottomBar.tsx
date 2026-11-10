"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Tv, LayoutGrid, Inbox } from "lucide-react";

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

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-white/[0.06] bg-[#07080B]/95 backdrop-blur-md select-none">
      <div className="grid grid-cols-2 h-full">
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
              className={`relative flex flex-col items-center justify-center transition-colors duration-150 ${
                isActive
                  ? "bg-white/[0.03] text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {/* Broadcast Precision Top Edge Strip (Active) */}
              {isActive && (
                <span className="absolute top-0 left-3 right-3 h-[2px] bg-[#E50914]" />
              )}

              {/* Icon Container with Signal Dot */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? "text-white" : "text-zinc-400"
                  }`}
                />

                {item.isLiveIndicator && (
                  <span className="absolute -top-1 -right-1.5 h-1.5 w-1.5 rounded-full bg-[#E50914]" />
                )}
              </div>

              {/* Monospace Label */}
              <span className="text-[10px] font-medium tracking-tight mt-1 leading-none">
                {item.label}
              </span>

              {/* Subdued Status Tag */}
              {item.tag && (
                <span className="absolute bottom-1 text-[7px] font-mono tracking-tighter text-zinc-500">
                  {item.tag}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}