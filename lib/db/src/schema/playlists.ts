import { pgTable, serial, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { songsTable } from "./songs";

export const playlistsTable = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default"),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlistSongsTable = pgTable("playlist_songs", {
  playlistId: integer("playlist_id").references(() => playlistsTable.id).notNull(),
  songId: integer("song_id").references(() => songsTable.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
}, (t) => [primaryKey({ columns: [t.playlistId, t.songId] })]);

export const insertPlaylistSchema = createInsertSchema(playlistsTable).omit({ id: true, createdAt: true });
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlistsTable.$inferSelect;
