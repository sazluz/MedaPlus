import { db } from "@/db";
import { events, channels, matchRequests } from "@/db/schema";
import { Channel } from "@/data/channels";
import { eq, desc } from "drizzle-orm";
import { MatchItem } from "@/components/home/LiveShelf";
import { WatchMatchDetails } from "@/components/watch/WatchRoom";

// Helper to extract team names from titles like "Arsenal vs Chelsea"
function parseTeams(title: string) {
  const parts = title.split(/\s+(?:vs\.?|v|-)\s+/i);
  return {
    homeTeam: parts[0]?.trim() || title,
    awayTeam: parts[1]?.trim() || "Opponent",
  };
}

// 1. Fetch live and upcoming matches for the Home Page
export async function getLiveAndUpcomingEvents(): Promise<EventData[]> {
  try {
    const rawList = await db
      .select()
      .from(events)
      .orderBy(desc(events.isLive), desc(events.timeOrStatus));

    return rawList.map((evt) => {
      let parsedServers = [];
      try {
        parsedServers = JSON.parse(evt.servers || "[]");
      } catch {
        parsedServers = [];
      }

      return {
        id: evt.id,
        type: evt.type || "team_match",
        title: evt.title,
        tournament: evt.tournament,
        backdropUrl: evt.backdropUrl,
        homeTeam: evt.homeTeam,
        awayTeam: evt.awayTeam,
        homeLogo: evt.homeLogo,
        awayLogo: evt.awayLogo,
        timeOrStatus: evt.timeOrStatus,
        isLive: Boolean(evt.isLive),
        qualityBadge: evt.qualityBadge || "1080P",
        servers: parsedServers,
      };
    });
  } catch (err) {
    console.error("Failed to query events from Turso:", err);
    return [];
  }
}

// 2. Fetch single event by ID with all server mirrors for the Watch Page
export async function getEventById(id: string): Promise<WatchMatchDetails | null> {
  try {
    const records = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    const match = records[0];
    if (!match) return null;

    const { homeTeam, awayTeam } = parseTeams(match.title);

    const sources = [
      {
        name: "Server 1 (Primary)",
        url: match.streamUrl,
        type: match.streamUrl.includes(".m3u8") ? ("hls" as const) : ("embed" as const),
        quality: "1080p 60fps",
      },
    ];

    if (match.backupStreamUrl) {
      sources.push({
        name: "Server 2 (Backup)",
        url: match.backupStreamUrl,
        type: match.backupStreamUrl.includes(".m3u8") ? ("hls" as const) : ("embed" as const),
        quality: "720p HD",
      });
    }

    return {
      id: match.id,
      title: match.title,
      tournament: match.tournament,
      homeTeam,
      awayTeam,
      homeLogo: "https://media.api-sports.io/football/teams/42.png",
      awayLogo: "https://media.api-sports.io/football/teams/50.png",
      timeOrStatus: match.isLive ? "LIVE" : match.startTime,
      isLive: Boolean(match.isLive),
      views: match.viewCount ?? 1240,
      sources,
    };
  } catch (err) {
    console.error(`Failed to fetch event ${id} from Turso:`, err);
    return null;
  }
}

// 3. Fetch active community requests for the modal
export async function getPendingCommunityRequests() {
  try {
    return await db
      .select()
      .from(matchRequests)
      .where(eq(matchRequests.status, "pending"))
      .orderBy(desc(matchRequests.votes))
      .limit(10);
  } catch (err) {
    console.error("Failed to fetch match requests:", err);
    return [];
  }
}

export async function getAllChannels(): Promise<Channel[]> {
  try {
    const rawChannels = await db.select().from(channels);

    if (rawChannels.length === 0) {
      return [];
    }

    return rawChannels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      category: (ch.category as "Sports" | "News" | "Entertainment") || "Sports",
      streamUrl: ch.streamUrl,
      logo: ch.logoUrl,
      currentShow: "Live 24/7 Broadcast",
      quality: "1080p 50fps",
    }));
  } catch (err) {
    console.error("Failed to fetch 24/7 channels from Turso:", err);
    return [];
  }
}