import { db } from "./index";
import { events } from "./schema";

async function seed() {
  await db.insert(events).values([
    {
      id: "evt_epl_ars_che",
      type: "team_match",
      title: "Arsenal vs Chelsea",
      tournament: "Premier League • London Derby",
      backdropUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1400",
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      homeLogo: "https://media.api-sports.io/football/teams/42.png",
      awayLogo: "https://media.api-sports.io/football/teams/49.png",
      timeOrStatus: "LIVE",
      isLive: true,
      qualityBadge: "1080P",
      servers: JSON.stringify([
        {
          name: "Server 1 (Primary)",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          quality: "1080P",
        },
        {
          name: "Server 2 (Backup)",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          quality: "720P",
        },
      ]),
      viewCount: 18450,
    },
    {
      id: "evt_ucl_rm_bay",
      type: "team_match",
      title: "Real Madrid vs Bayern Munich",
      tournament: "UEFA Champions League • Semi-Final",
      backdropUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1400",
      homeTeam: "Real Madrid",
      awayTeam: "Bayern Munich",
      homeLogo: "https://media.api-sports.io/football/teams/541.png",
      awayLogo: "https://media.api-sports.io/football/teams/157.png",
      timeOrStatus: "22:00",
      isLive: false,
      qualityBadge: "1080P",
      servers: JSON.stringify([
        {
          name: "Main Server",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          quality: "1080P",
        },
      ]),
      viewCount: 6200,
    },
  ]);
  console.log("Database seeded successfully!");
}

seed();