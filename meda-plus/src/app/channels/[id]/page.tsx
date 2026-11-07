import { notFound } from "next/navigation";
import ChannelPlayerRoom from "@/components/channels/ChannelPlayerRoom";
import { CHANNELS_CATALOG } from "@/data/channels";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const channel = CHANNELS_CATALOG.find((c) => c.id === id);

  if (!channel) return { title: "Channel Not Found | Meda Plus +" };

  return {
    title: `Watch ${channel.name} Live 24/7 | Meda Plus +`,
    description: `Stream ${channel.name} non-stop in HD with low-latency backup servers.`,
  };
}

export default async function ChannelDetailPage({ params }: PageProps) {
  const { id } = await params;
  const channel = CHANNELS_CATALOG.find((c) => c.id === id);

  if (!channel) {
    notFound();
  }

  return <ChannelPlayerRoom currentChannel={channel} allChannels={CHANNELS_CATALOG} />;
}