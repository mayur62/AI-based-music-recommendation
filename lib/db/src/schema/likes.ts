import { pgTable, text, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { songsTable } from "./songs";

export const likesTable = pgTable("likes", {
  userId: text("user_id").notNull().default("default"),
  songId: integer("song_id").references(() => songsTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.songId] })]);

export const insertLikeSchema = createInsertSchema(likesTable).omit({ createdAt: true });
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likesTable.$inferSelect;
