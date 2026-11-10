import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  logoUrl: text("logo_url").notNull(),
  servers: text("servers").notNull(), // JSON: [{"name": "Main HD", "url": "...", "quality": "HD"}]
  status: text("status").default("online"),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(), // e.g. "match-2"
  type: text("type").default("team_match").notNull(), // "team_match" | "single_event"
  title: text("title").notNull(), // "Real Madrid vs Barcelona"
  tournament: text("tournament").notNull(), // "La Liga • El Clásico"
  backdropUrl: text("backdrop_url").notNull(),
  homeTeam: text("home_team"),
  awayTeam: text("away_team"),
  homeLogo: text("home_logo"),
  awayLogo: text("away_logo"),
  servers: text("servers").notNull(), // JSON: [{"name": "Server 1", "url": "...", "quality": "1080P"}]
  timeOrStatus: text("time_or_status").notNull(), // "22:00" or "LIVE"
  isLive: integer("is_live", { mode: "boolean" }).default(false),
  qualityBadge: text("quality_badge").default("1080P"),
  viewCount: integer("view_count").default(0),
});

export const matchRequests = sqliteTable("match_requests", {
  id: text("id").primaryKey(),
  matchTitle: text("match_title").notNull(),
  tournament: text("tournament").notNull(),
  requestedBy: text("requested_by").default("Anonymous Fan"),
  votes: integer("votes").default(1),
  status: text("status").default("pending"),
  createdAt: text("created_at").notNull(),
});