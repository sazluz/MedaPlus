import { db } from "./index";
import { events } from "./schema";

async function seed() {
  await db.insert(events).values([
    {
      id: "evt_epl_ars_che",
      title: "Arsenal vs Chelsea",
      tournament: "Premier League • London Derby",
      posterUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1400",
      streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      backupStreamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      startTime: "19:30",
      isLive: true,
      viewCount: 18450,
    },
    {
      id: "evt_ucl_rm_bay",
      title: "Real Madrid vs Bayern Munich",
      tournament: "UEFA Champions League • Semi-Final",
      posterUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1400",
      streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      backupStreamUrl: null,
      startTime: "22:00",
      isLive: false,
      viewCount: 6200,
    },
  ]);
  console.log("Database seeded successfully!");
}

seed();