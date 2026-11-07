"use server";

import { db } from "@/db";
import { matchRequests, events } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Admin Actions ---

export async function createStreamEvent(formData: FormData, adminKey: string) {
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error("Unauthorized access.");
  }

  const title = formData.get("title") as string;
  const tournament = formData.get("tournament") as string;
  const posterUrl = formData.get("posterUrl") as string;
  const streamUrl = formData.get("streamUrl") as string;
  const backupStreamUrl = formData.get("backupStreamUrl") as string;
  const startTime = formData.get("startTime") as string;
  const isLive = formData.get("isLive") === "on";

  await db.insert(events).values({
    id: `evt_${Date.now()}`,
    title,
    tournament,
    posterUrl: posterUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000",
    streamUrl,
    backupStreamUrl: backupStreamUrl || null,
    startTime: startTime || new Date().toISOString(),
    isLive,
    viewCount: 0,
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateStreamStatus(id: string, isLive: boolean, adminKey: string) {
  if (adminKey !== process.env.ADMIN_SECRET_KEY) throw new Error("Unauthorized");

  await db.update(events).set({ isLive }).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateStreamUrl(id: string, newUrl: string, adminKey: string) {
  if (adminKey !== process.env.ADMIN_SECRET_KEY) throw new Error("Unauthorized");

  await db.update(events).set({ streamUrl: newUrl }).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteStreamEvent(id: string, adminKey: string) {
  if (adminKey !== process.env.ADMIN_SECRET_KEY) throw new Error("Unauthorized");

  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function submitMatchRequest(formData: FormData) {
  const matchTitle = formData.get("matchTitle") as string;
  const tournament = formData.get("tournament") as string;

  if (!matchTitle || matchTitle.trim().length === 0) {
    return { success: false, error: "Event name is required." };
  }

  await db.insert(matchRequests).values({
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    matchTitle: matchTitle.trim(),
    tournament: tournament?.trim() || "General Event",
    votes: 1,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  return { success: true };
}

export async function upvoteRequest(requestId: string) {
  await db
    .update(matchRequests)
    .set({ votes: sql`${matchRequests.votes} + 1` })
    .where(eq(matchRequests.id, requestId));

  revalidatePath("/");
  return { success: true };
}