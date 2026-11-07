"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Info, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/channels", label: "Channels", icon: Search },
  { href: "/about", label: "About", icon: Info },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 z-40 hidden md:flex w-20 flex-col items-center py-6 border-r border-neutral-900/60 bg-[#0A0B0E] select-none">
      <nav className="flex flex-col gap-4 w-full px-2.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group flex flex-col items-center w-full"
            >
              {/* Active Red Indicator Strip on Left */}
              {isActive && (
                <span className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-[#E50914]" />
              )}

              {/* Rounded Dock Tile */}
              <div
                className={`flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#181B22] text-white shadow-sm"
                    : "text-neutral-500 hover:bg-[#12141A] hover:text-neutral-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-[#E50914]" : "text-neutral-400 group-hover:text-white"}`} />
                <span className="text-[10px] font-bold mt-1 tracking-tight">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}