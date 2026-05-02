import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ratingHistoryTable = pgTable("rating_history", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull(),
  gameId: text("game_id").notNull(),
  rating: integer("rating").notNull(),
  ratingChange: integer("rating_change").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRatingHistorySchema = createInsertSchema(ratingHistoryTable).omit({ timestamp: true });
export type InsertRatingHistory = z.infer<typeof insertRatingHistorySchema>;
export type RatingHistory = typeof ratingHistoryTable.$inferSelect;
