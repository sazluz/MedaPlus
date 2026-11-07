import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function isAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get("meda_admin_token")?.value;
  return Boolean(token && token === process.env.ADMIN_SECRET_KEY);
}

// GET all events
export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db.select().from(events).orderBy(desc(events.isLive), desc(events.timeOrStatus));
    const formatted = list.map((evt) => ({
      ...evt,
      servers: JSON.parse(evt.servers || "[]"),
    }));
    return NextResponse.json({ success: true, events: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create or hot-swap event
export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      type,
      title,
      tournament,
      backdropUrl,
      homeTeam,
      awayTeam,
      homeLogo,
      awayLogo,
      timeOrStatus,
      isLive,
      qualityBadge,
      servers,
    } = body;

    if (!id || !title || !servers || servers.length === 0) {
      return NextResponse.json(
        { error: "Match ID, title, and at least 1 server are required." },
        { status: 400 }
      );
    }

    const payload = {
      id: id.trim(),
      type: type || "team_match",
      title: title.trim(),
      tournament: tournament?.trim() || "General Match",
      backdropUrl: backdropUrl?.trim() || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200",
      homeTeam: homeTeam?.trim() || null,
      awayTeam: awayTeam?.trim() || null,
      homeLogo: homeLogo?.trim() || null,
      awayLogo: awayLogo?.trim() || null,
      servers: JSON.stringify(servers),
      timeOrStatus: timeOrStatus?.trim() || "20:00",
      isLive: Boolean(isLive),
      qualityBadge: qualityBadge?.trim() || "1080P",
      viewCount: 0,
    };

    // Upsert: update existing if ID exists, or insert new
    await db.insert(events).values(payload).onConflictDoUpdate({
      target: events.id,
      set: payload,
    });

    return NextResponse.json({ success: true, event: payload });
  } catch (err: any) {
    console.error("API error creating event:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE event
export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await db.delete(events).where(eq(events.id, id));
  return NextResponse.json({ success: true });
}