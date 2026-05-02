import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const movesTable = pgTable("moves", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull(),
  moveNumber: integer("move_number").notNull(),
  san: text("san").notNull(),
  uci: text("uci").notNull(),
  fen: text("fen").notNull(),
  whiteClockMs: integer("white_clock_ms").notNull(),
  blackClockMs: integer("black_clock_ms").notNull(),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMoveSchema = createInsertSchema(movesTable).omit({ playedAt: true });
export type InsertMove = z.infer<typeof insertMoveSchema>;
export type Move = typeof movesTable.$inferSelect;
