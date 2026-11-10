import { Suspense } from "react";
import { connection } from "next/server";
import { getAllChannels } from "@/db/queries";
import ChannelGrid from "@/components/channels/ChannelGrid";

async function ChannelsContent() {
  await connection();
  const channels = await getAllChannels();

  return <ChannelGrid channels={channels} />;
}

function ChannelsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-2">
        <div className="h-8 w-16 rounded-xl bg-neutral-900" />
        <div className="h-8 w-24 rounded-xl bg-neutral-900" />
        <div className="h-8 w-24 rounded-xl bg-neutral-900" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-[#0E1017] border border-neutral-800" />
        ))}
      </div>
    </div>
  );
}

export default function ChannelsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 text-white min-h-screen">
      <Suspense fallback={<ChannelsSkeleton />}>
        <ChannelsContent />
      </Suspense>
    </div>
  );
}