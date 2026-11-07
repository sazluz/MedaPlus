"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { events, channels, matchRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const AUTH_COOKIE = "meda_admin_token";

export async function verifyAdminPassphrase(passphrase: string) {
  const masterKey = process.env.ADMIN_SECRET_KEY;
  if (!masterKey || passphrase !== masterKey) {
    return { success: false, error: "Invalid admin passphrase." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, masterKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const masterKey = process.env.ADMIN_SECRET_KEY;
  return Boolean(token && masterKey && token === masterKey);
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return { success: true };
}

export async function getAdminData() {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) return { authorized: false, events: [], channels: [], requests: [] };

  try {
    const [allEvents, allChannels, allRequests] = await Promise.all([
      db.select().from(events).orderBy(desc(events.isLive), desc(events.startTime)),
      db.select().from(channels),
      db.select().from(matchRequests).orderBy(desc(matchRequests.votes)),
    ]);
    return { authorized: true, events: allEvents, channels: allChannels, requests: allRequests };
  } catch (err) {
    console.error("Turso fetch error in admin deck:", err);
    return { authorized: true, events: [], channels: [], requests: [] };
  }
}

export async function addEventAction(formData: FormData) {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) throw new Error("Unauthorized");

  const title = (formData.get("title") as string)?.trim();
  const tournament = (formData.get("tournament") as string)?.trim();
  const streamUrl = (formData.get("streamUrl") as string)?.trim();
  const backupStreamUrl = (formData.get("backupStreamUrl") as string)?.trim() || null;
  const startTime = (formData.get("startTime") as string)?.trim() || "LIVE";
  const backdropUrl =
    (formData.get("backdropUrl") as string)?.trim() ||
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200";
  const isLive = formData.get("isLive") === "on";

  await db.insert(events).values({
    id: `evt_${Date.now()}`,
    title,
    tournament,
    posterUrl: backdropUrl,
    streamUrl,
    backupStreamUrl,
    startTime,
    isLive,
    viewCount: 0,
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateEventAction(
  id: string,
  streamUrl: string,
  backupUrl: string,
  isLive: boolean
) {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) throw new Error("Unauthorized");

  await db
    .update(events)
    .set({
      streamUrl,
      backupStreamUrl: backupUrl || null,
      isLive,
    })
    .where(eq(events.id, id));

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteEventAction(id: string) {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) throw new Error("Unauthorized");

  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function addChannelAction(formData: FormData) {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "Sports";
  const streamUrl = (formData.get("streamUrl") as string)?.trim();
  const logoUrl =
    (formData.get("logoUrl") as string)?.trim() ||
    "https://media.api-sports.io/football/leagues/39.png";

  await db.insert(channels).values({
    id: `ch_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category,
    streamUrl,
    logoUrl,
    is247: true,
    status: "online",
  });

  revalidatePath("/channels");
  revalidatePath("/admin");
}

export async function deleteChannelAction(id: string) {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) throw new Error("Unauthorized");

  await db.delete(channels).where(eq(channels.id, id));
  revalidatePath("/channels");
  revalidatePath("/admin");
}

export async function updateRequestStatusAction(id: string, status: "scheduled" | "rejected") {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) throw new Error("Unauthorized");

  await db.update(matchRequests).set({ status }).where(eq(matchRequests.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
}

export {
  addEventAction as addEvent,
  updateEventAction as updateEventStream,
  deleteEventAction as deleteEvent,
  addChannelAction as addChannel,
  deleteChannelAction as deleteChannel,
  updateRequestStatusAction as updateRequestStatus,
};