import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { songsTable } from "./songs";

export const playlistsTable = sqliteTable("playlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("default"),
  name: text("name").notNull(),
  createdAt: text("created_at").default(""),
});

export const playlistSongsTable = sqliteTable("playlist_songs", {
  playlistId: integer("playlist_id").references(() => playlistsTable.id).notNull(),
  songId: integer("song_id").references(() => songsTable.id).notNull(),
  addedAt: text("added_at").default(""),
}, (t) => [primaryKey({ columns: [t.playlistId, t.songId] })]);

export const insertPlaylistSchema = createInsertSchema(playlistsTable).omit({ id: true, createdAt: true });
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlistsTable.$inferSelect;
