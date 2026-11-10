import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { events, channels, matchRequests } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("meda_admin_token")?.value;
  const masterKey = process.env.ADMIN_SECRET_KEY;

  if (!token || !masterKey || token !== masterKey) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const [allEvents, allChannels, allRequests] = await Promise.all([
      db.select().from(events).orderBy(desc(events.isLive), desc(events.startTime)),
      db.select().from(channels),
      db.select().from(matchRequests).orderBy(desc(matchRequests.votes)),
    ]);

    return NextResponse.json({
      authenticated: true,
      events: allEvents,
      channels: allChannels,
      requests: allRequests,
    });
  } catch {
    return NextResponse.json({
      authenticated: true,
      events: [],
      channels: [],
      requests: [],
    });
  }
}