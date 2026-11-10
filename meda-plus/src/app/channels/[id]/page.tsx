import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getChannelById } from "@/db/queries";
import WatchPlayerRoom from "@/components/watch/WatchPlayerRoom";
import { RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ChannelWatchContent({ params }: PageProps) {
  await connection();
  const { id } = await params;

  const channel = await getChannelById(id);
  if (!channel) {
    notFound();
  }

  // Sanitize channel data into the player's format
  const eventPayload = {
    id: channel.id,
    type: "single_event",
    title: channel.name,
    tournament: `24/7 TV Network • ${channel.category}`,
    backdropUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200",
    timeOrStatus: "ONLINE",
    isLive: true,
    qualityBadge: "HD 24/7",
    servers:
      channel.servers.length > 0
        ? channel.servers
        : [{ name: "Main Feed", url: "", quality: "HD" }],
  };

  return <WatchPlayerRoom event={eventPayload} />;
}

function WatchSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white pb-12 animate-pulse p-4">
      <div className="h-4 w-32 bg-neutral-900 rounded" />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-[#00E676]" />
          </div>
          <div className="h-24 rounded-2xl bg-[#0E1017] border border-neutral-800" />
        </div>
        <div className="lg:col-span-4 h-[580px] rounded-2xl bg-[#0E1017] border border-neutral-800" />
      </div>
    </div>
  );
}

export default function ChannelWatchPage({ params }: PageProps) {
  return (
    <Suspense fallback={<WatchSkeleton />}>
      <ChannelWatchContent params={params} />
    </Suspense>
  );
}