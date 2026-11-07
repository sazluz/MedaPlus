import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopHeader from "@/components/navigation/TopHeader";
import LeftSidebar from "@/components/navigation/LeftSidebar";
import BottomBar from "@/components/navigation/BottomBar";
import RequestMatchModal from "@/components/community/RequestMatchModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MEDA PLUS + | Premium Streaming Hub",
  description: "Live sports streams and 24/7 broadcast television.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0B0E] text-white min-h-screen selection:bg-[#E50914] selection:text-white antialiased`}>
        <TopHeader />

        <div className="flex">
          <LeftSidebar />
          <main className="flex-1 min-w-0 md:pl-20 pb-24 md:pb-12 px-4 md:px-8 pt-4">
            {children}
          </main>
        </div>

        <BottomBar />
        {/* Floating Community Request Modal */}
        <RequestMatchModal />
      </body>
    </html>
  );
}