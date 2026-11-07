"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Info, ShieldCheck } from "lucide-react";

const MOBILE_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/channels", label: "Channels", icon: Search },
  { href: "/about", label: "About", icon: Info },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-neutral-900 bg-[#0A0B0E]/95 backdrop-blur-xl md:hidden">
      {MOBILE_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? "text-[#E50914]" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-[#E50914]" : "text-neutral-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}