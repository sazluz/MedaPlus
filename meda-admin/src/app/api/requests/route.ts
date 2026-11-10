import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { matchRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// 1. Force Next.js to never cache this API response
export const dynamic = "force-dynamic";

async function isAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get("meda_admin_token")?.value;
  return Boolean(token && token === process.env.ADMIN_SECRET_KEY);
}

// GET all community requests
export async function GET() {
  if (!(await isAuthorized())) {
    console.error("[Admin Requests API] Unauthorized check failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(matchRequests)
      .orderBy(desc(matchRequests.votes), desc(matchRequests.createdAt));
      
    console.log(`[Admin Requests API] Fetched ${list.length} requests from Turso:`, list);
    return NextResponse.json({ success: true, requests: list });
  } catch (err: any) {
    console.error("[Admin Requests API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH update status
export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
    }

    await db
      .update(matchRequests)
      .set({ status })
      .where(eq(matchRequests.id, id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Admin Requests PATCH Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}