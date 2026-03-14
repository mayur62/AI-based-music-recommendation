import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const songsTable = sqliteTable("songs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull().default("unknown"),
  emotion: text("emotion").notNull().default("unknown"),
  youtubeId: text("youtube_id").notNull().unique(),
  thumbnail: text("thumbnail").default(""),
  duration: integer("duration").default(0),
  createdAt: text("created_at").default(""),
});

export const insertSongSchema = createInsertSchema(songsTable).omit({ id: true, createdAt: true });
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songsTable.$inferSelect;
