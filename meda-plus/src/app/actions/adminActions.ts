"use server";

import { db } from "@/db";
import { events, channels, matchRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "./adminAuth";

async function assertAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) throw new Error("Unauthorized");
}

// --- Live Events Management ---

export async function addEventAction(formData: FormData) {
  await assertAuth();

  const title = (formData.get("title") as string)?.trim();
  const tournament = (formData.get("tournament") as string)?.trim();
  const streamUrl = (formData.get("streamUrl") as string)?.trim();
  const backupStreamUrl = (formData.get("backupStreamUrl") as string)?.trim() || null;
  const startTime = (formData.get("startTime") as string)?.trim() || "LIVE";
  const isLive = formData.get("isLive") === "on";

  await db.insert(events).values({
    id: `evt_${Date.now()}`,
    title,
    tournament,
    posterUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200",
    streamUrl,
    backupStreamUrl,
    startTime,
    isLive,
    viewCount: 0,
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateEventAction(id: string, streamUrl: string, backupUrl: string, isLive: boolean) {
  await assertAuth();

  await db
    .update(events)
    .set({ streamUrl, backupStreamUrl: backupUrl || null, isLive })
    .where(eq(events.id, id));

  revalidatePath("/");
  revalidatePath(`/watch/${id}`);
  revalidatePath("/admin");
}

export async function deleteEventAction(id: string) {
  await assertAuth();

  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

// --- 24/7 Channels Management ---

export async function addChannelAction(formData: FormData) {
  await assertAuth();

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "Sports";
  const streamUrl = (formData.get("streamUrl") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim();

  await db.insert(channels).values({
    id: `ch_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category,
    streamUrl,
    logoUrl: logoUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200",
    is247: true,
    status: "online",
  });

  revalidatePath("/channels");
  revalidatePath("/admin");
}

export async function deleteChannelAction(id: string) {
  await assertAuth();

  await db.delete(channels).where(eq(channels.id, id));
  revalidatePath("/channels");
  revalidatePath("/admin");
}

// --- Community Requests Moderation ---

export async function updateRequestStatusAction(id: string, status: "scheduled" | "rejected") {
  await assertAuth();

  await db.update(matchRequests).set({ status }).where(eq(matchRequests.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}