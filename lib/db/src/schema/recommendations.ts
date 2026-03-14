import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { songsTable } from "./songs";

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default"),
  songId: integer("song_id").references(() => songsTable.id),
  emotion: text("emotion").notNull().default("unknown"),
  similarityScore: real("similarity_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true, createdAt: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;
