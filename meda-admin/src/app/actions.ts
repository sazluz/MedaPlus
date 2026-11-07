"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addEventAction(formData: FormData) {
  const customId = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "team_match";
  const tournament = (formData.get("tournament") as string)?.trim();
  const backdropUrl =
    (formData.get("backdropUrl") as string)?.trim() ||
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200";
  const homeTeam = (formData.get("homeTeam") as string)?.trim() || null;
  const awayTeam = (formData.get("awayTeam") as string)?.trim() || null;
  const homeLogo = (formData.get("homeLogo") as string)?.trim() || null;
  const awayLogo = (formData.get("awayLogo") as string)?.trim() || null;
  const streamUrl = (formData.get("streamUrl") as string)?.trim();
  const backupStreamUrl = (formData.get("backupStreamUrl") as string)?.trim() || null;
  const timeOrStatus = (formData.get("timeOrStatus") as string)?.trim() || "20:00";
  const isLive = formData.get("isLive") === "on";
  const qualityBadge = (formData.get("qualityBadge") as string)?.trim() || "1080P";

  // Use custom ID if provided; otherwise derive a clean slug from the title
  const finalId = customId || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  await db.insert(events).values({
    id: finalId,
    type,
    title,
    tournament,
    backdropUrl,
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
    streamUrl,
    backupStreamUrl,
    timeOrStatus,
    isLive,
    qualityBadge,
    viewCount: 0,
  });

  revalidatePath("/");
  revalidatePath("/admin");
}