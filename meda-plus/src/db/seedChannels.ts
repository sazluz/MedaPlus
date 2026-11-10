// src/db/seedChannels.ts
import { db } from "./index";
import { channels } from "./schema";
import * as channelDataModule from "../data/channels";

// Safely resolve the export name whether named CHANNELS_CATALOG or CHANNELS_DATA
const channelsSource: any[] =
  (channelDataModule as any).CHANNELS_CATALOG ||
  (channelDataModule as any).CHANNELS_DATA ||
  [];

async function seedChannels() {
  for (const ch of channelsSource) {
    const serverPayload = ch.servers
      ? typeof ch.servers === "string"
        ? ch.servers
        : JSON.stringify(ch.servers)
      : JSON.stringify([
          {
            name: "Main Feed",
            url: ch.streamUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            quality: "1080P",
          },
        ]);

    await db
      .insert(channels)
      .values({
        id: ch.id || ch.slug,
        name: ch.name,
        category: ch.category || "Sports",
        logoUrl: ch.logoUrl || ch.logo || "",
        servers: serverPayload,
        status: ch.status || "online",
      })
      .onConflictDoNothing();
  }

  console.log("Channels seeded to Turso successfully!");
}

seedChannels();