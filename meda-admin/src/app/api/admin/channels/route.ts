import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";

async function isAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get("meda_admin_token")?.value;
  return Boolean(token && token === process.env.ADMIN_SECRET_KEY);
}

// GET all 24/7 channels
export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db.select().from(channels);
    const formatted = list.map((ch) => ({
      ...ch,
      servers: JSON.parse(ch.servers || "[]"),
    }));
    return NextResponse.json({ success: true, channels: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create or update channel
export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, category, logoUrl, status, servers } = body;

    if (!id || !name || !servers || servers.length === 0) {
      return NextResponse.json(
        { error: "Channel ID, name, and at least 1 server stream are required." },
        { status: 400 }
      );
    }

    const payload = {
      id: id.trim(),
      name: name.trim(),
      category: category?.trim() || "Sports",
      logoUrl: logoUrl?.trim() || "https://media.api-sports.io/football/leagues/39.png",
      status: status || "online",
      servers: JSON.stringify(servers),
    };

    await db.insert(channels).values(payload).onConflictDoUpdate({
      target: channels.id,
      set: payload,
    });

    return NextResponse.json({ success: true, channel: payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE channel
export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing Channel ID" }, { status: 400 });

  await db.delete(channels).where(eq(channels.id, id));
  return NextResponse.json({ success: true });
}