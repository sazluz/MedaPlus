import type { Metadata } from "next";
import { Suspense } from "react";
import TopHeader from "@/components/navigation/TopHeader";
import Sidebar from "@/components/navigation/LeftSidebar";
import BottomNav from "@/components/navigation/BottomBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meda+ | Broadcast System",
  description: "Live Sports & 24/7 TV Streaming",
};

// Static fallbacks prevent UI shifting during hydration
function SidebarFallback() {
  return (
    <aside className="fixed left-0 top-14 bottom-0 z-40 hidden md:flex w-20 flex-col items-center py-4 border-r border-white/[0.06] bg-[#07080B]" />
  );
}

function BottomNavFallback() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-white/[0.06] bg-[#07080B]/95" />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07080B] text-zinc-100 min-h-screen antialiased">
        <TopHeader />

        {/* 1. Wrapped in Suspense to resolve Blocking Route error #1 */}
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>

        {/* Main Viewport */}
        <div className="pt-14 md:pl-20 min-h-screen flex flex-col">
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* 2. Wrapped in Suspense to resolve Blocking Route error #2 */}
        <Suspense fallback={<BottomNavFallback />}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}