import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { songsTable } from "./songs";

export const historyTable = sqliteTable("history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("default"),
  songId: integer("song_id").references(() => songsTable.id),
  playPercentage: real("play_percentage").default(0),
  playTime: real("play_time").default(0),
  duration: real("duration").default(0),
  timestamp: text("timestamp").default(""),
});

export const insertHistorySchema = createInsertSchema(historyTable).omit({ id: true, timestamp: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof historyTable.$inferSelect;
