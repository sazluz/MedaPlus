import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { EventData } from "@/components/matches/MatchCard";

function parseMatchTeams(title: string) {
  const parts = title.split(/\s+(?:vs\.?|v|-)\s+/i);
  if (parts.length >= 2) {
    return {
      isTeam: true,
      homeTeam: parts[0]?.trim() || "Home",
      awayTeam: parts[1]?.trim() || "Away",
    };
  }
  return {
    isTeam: false,
    headline: title.trim(),
  };
}

export async function getLiveAndUpcomingEvents(): Promise<EventData[]> {
  try {
    const rawEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.isLive), desc(events.startTime));

    return rawEvents.map((evt) => {
      const parsed = parseMatchTeams(evt.title);

      if (parsed.isTeam) {
        return {
          id: evt.id,
          type: "team_match",
          title: evt.title,
          tournament: evt.tournament,
          backdropUrl:
            evt.posterUrl ||
            "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200",
          homeTeam: parsed.homeTeam,
          awayTeam: parsed.awayTeam,
          homeLogo: "https://media.api-sports.io/football/teams/42.png",
          awayLogo: "https://media.api-sports.io/football/teams/49.png",
          timeOrStatus: evt.isLive ? "LIVE" : evt.startTime || "Upcoming",
          isLive: Boolean(evt.isLive),
          qualityBadge: "1080P",
        };
      }

      return {
        id: evt.id,
        type: "single_event",
        title: evt.title,
        tournament: evt.tournament,
        backdropUrl:
          evt.posterUrl ||
          "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200",
        eventHeadline: parsed.headline,
        eventCategory: evt.tournament,
        timeOrStatus: evt.isLive ? "LIVE" : evt.startTime || "Upcoming",
        isLive: Boolean(evt.isLive),
        qualityBadge: "HD",
      };
    });
  } catch (err) {
    console.error("Failed to fetch events from Turso:", err);
    return [];
  }
}