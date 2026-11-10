import { notFound } from "next/navigation";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import WatchPlayerRoom from "@/components/watch/WatchPlayerRoom";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchEventPage({ params }: PageProps) {
  const { id } = await params;

  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  const match = result[0];

  if (!match) {
    notFound();
  }

  const parsedServers = JSON.parse(match.servers || "[]");

  return (
    <WatchPlayerRoom
      event={{
        ...match,
        servers: parsedServers,
      }}
    />
  );
}