// src/db/seedChannels.ts
import { db } from "./index";
import { channels } from "./schema";
import { CHANNELS_DATA } from "../data/channels";

async function seedChannels() {
  for (const ch of CHANNELS_DATA) {
    await db.insert(channels).values({
      id: ch.id,
      name: ch.name,
      slug: ch.id,
      category: ch.category,
      streamUrl: ch.streamUrl,
      logoUrl: ch.logo,
      is247: true,
      status: "online",
    }).onConflictDoNothing();
  }
  console.log("Channels seeded to Turso successfully!");
}

seedChannels();