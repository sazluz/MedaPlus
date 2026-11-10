import { db } from "@/db";
import { events, channels, matchRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface StreamServer {
  name: string;
  url: string;
  quality: string;
}

export interface EventData {
  id: string;
  type: string;
  title: string;
  tournament: string;
  backdropUrl: string;
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeLogo?: string | null;
  awayLogo?: string | null;
  timeOrStatus: string;
  isLive: boolean;
  qualityBadge?: string | null;
  servers: StreamServer[];
}

export interface ChannelData {
  id: string;
  name: string;
  category: string;
  logoUrl: string;
  status: string;
  servers: StreamServer[];
}

// 1. Fetch live and upcoming matches for the Home Page
export async function getLiveAndUpcomingEvents(): Promise<EventData[]> {
  try {
    const rawList = await db
      .select()
      .from(events)
      .orderBy(desc(events.isLive), desc(events.timeOrStatus));

    return rawList.map((evt) => {
      let parsedServers: StreamServer[] = [];
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
export async function getEventById(id: string): Promise<EventData | null> {
  try {
    const records = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    const match = records[0];
    if (!match) return null;

    let parsedServers: StreamServer[] = [];
    try {
      parsedServers = JSON.parse(match.servers || "[]");
    } catch {
      parsedServers = [];
    }

    if (parsedServers.length === 0) {
      parsedServers = [
        {
          name: "Main Server",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          quality: match.qualityBadge || "1080P",
        },
      ];
    }

    return {
      id: match.id,
      type: match.type || "team_match",
      title: match.title,
      tournament: match.tournament,
      backdropUrl: match.backdropUrl,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeLogo: match.homeLogo,
      awayLogo: match.awayLogo,
      timeOrStatus: match.timeOrStatus,
      isLive: Boolean(match.isLive),
      qualityBadge: match.qualityBadge || "1080P",
      servers: parsedServers,
    };
  } catch (err) {
    console.error(`Failed to fetch event ${id} from Turso:`, err);
    return null;
  }
}

// 3. Fetch active community requests
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

// 4. Fetch all 24/7 channels
export async function getAllChannels(): Promise<ChannelData[]> {
  try {
    const rawChannels = await db.select().from(channels);

    return rawChannels.map((ch) => {
      let parsedServers: StreamServer[] = [];
      try {
        parsedServers = JSON.parse(ch.servers || "[]");
      } catch {
        parsedServers = [];
      }

      return {
        id: ch.id,
        name: ch.name,
        category: ch.category,
        logoUrl: ch.logoUrl,
        status: ch.status || "online",
        servers: parsedServers,
      };
    });
  } catch (err) {
    console.error("Failed to query channels:", err);
    return [];
  }
}

// 5. Fetch single channel by ID
export async function getChannelById(id: string): Promise<ChannelData | null> {
  try {
    const rows = await db.select().from(channels).where(eq(channels.id, id)).limit(1);
    if (!rows || rows.length === 0) return null;

    const ch = rows[0];
    let parsedServers: StreamServer[] = [];
    try {
      parsedServers = JSON.parse(ch.servers || "[]");
    } catch {
      parsedServers = [];
    }

    return {
      id: ch.id,
      name: ch.name,
      category: ch.category,
      logoUrl: ch.logoUrl,
      status: ch.status || "online",
      servers: parsedServers,
    };
  } catch (err) {
    console.error(`Failed to fetch channel ${id}:`, err);
    return null;
  }
}