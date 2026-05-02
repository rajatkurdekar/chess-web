import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamesTable = pgTable("games", {
  id: text("id").primaryKey(),
  whitePlayerId: text("white_player_id").notNull(),
  blackPlayerId: text("black_player_id"),
  whiteUsername: text("white_username").notNull(),
  blackUsername: text("black_username"),
  whiteRating: integer("white_rating").notNull().default(1200),
  blackRating: integer("black_rating"),
  status: text("status").notNull().default("pending"),
  result: text("result"),
  resultReason: text("result_reason"),
  fen: text("fen").notNull().default("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
  pgn: text("pgn").notNull().default(""),
  timeControl: jsonb("time_control").notNull(),
  whiteTimeMs: integer("white_time_ms").notNull().default(600000),
  blackTimeMs: integer("black_time_ms").notNull().default(600000),
  lastMoveAt: timestamp("last_move_at", { withTimezone: true }),
  isAiGame: boolean("is_ai_game").notNull().default(false),
  aiDepth: integer("ai_depth"),
  roomCode: text("room_code"),
  drawOfferedBy: text("draw_offered_by"),
  moveCount: integer("move_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGameSchema = createInsertSchema(gamesTable).omit({ createdAt: true, updatedAt: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof gamesTable.$inferSelect;
