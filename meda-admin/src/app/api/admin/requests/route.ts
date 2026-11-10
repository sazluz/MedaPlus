import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { matchRequests } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

// GET all requests sorted by votes
export async function GET() {
  try {
    const list = await db
      .select()
      .from(matchRequests)
      .orderBy(desc(matchRequests.votes), desc(matchRequests.createdAt));
    return NextResponse.json({ success: true, requests: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST submit a new request
export async function POST(req: NextRequest) {
  try {
    const { matchTitle, tournament, requestedBy } = await req.json();

    if (!matchTitle || !tournament) {
      return NextResponse.json(
        { error: "Match title and competition are required." },
        { status: 400 }
      );
    }

    const newRequest = {
      id: `req_${Date.now()}`,
      matchTitle: matchTitle.trim(),
      tournament: tournament.trim(),
      requestedBy: requestedBy?.trim() || "Anonymous Fan",
      votes: 1,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await db.insert(matchRequests).values(newRequest);
    return NextResponse.json({ success: true, request: newRequest });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH upvote an existing request
export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db
      .update(matchRequests)
      .set({ votes: sql`${matchRequests.votes} + 1` })
      .where(eq(matchRequests.id, id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}