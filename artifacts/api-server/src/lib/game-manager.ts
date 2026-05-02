import { v4 as uuidv4 } from "uuid";
import { db, gamesTable, movesTable, playersTable, ratingHistoryTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { validateAndApplyMove, getTurnFromFen, isValidFen } from "./chess-engine.js";
import { calculateElo } from "./elo.js";
import { logger } from "./logger.js";
import type { Game } from "@workspace/db";

export interface TimeControl {
  initialSeconds: number;
  incrementSeconds: number;
  label: string;
}

export interface ActiveGameState {
  gameId: string;
  whiteSocketId?: string;
  blackSocketId?: string;
  spectatorSocketIds: Set<string>;
  clockInterval?: ReturnType<typeof setInterval>;
  lastMoveTime?: number;
  premoves: Map<string, { from: string; to: string; promotion?: string }>;
}

const activeGames = new Map<string, ActiveGameState>();
const socketToGame = new Map<string, string>();
const matchmakingQueue = new Map<string, { playerId: string; timeControl: TimeControl; joinedAt: number }>();

export function getActiveGame(gameId: string): ActiveGameState | undefined {
  return activeGames.get(gameId);
}

export function registerSocket(socketId: string, gameId: string, color: "white" | "black" | "spectator"): void {
  let state = activeGames.get(gameId);
  if (!state) {
    state = { gameId, spectatorSocketIds: new Set(), premoves: new Map() };
    activeGames.set(gameId, state);
  }
  if (color === "white") state.whiteSocketId = socketId;
  else if (color === "black") state.blackSocketId = socketId;
  else state.spectatorSocketIds.add(socketId);
  socketToGame.set(socketId, gameId);
}

export function unregisterSocket(socketId: string): string | undefined {
  const gameId = socketToGame.get(socketId);
  if (!gameId) return undefined;
  socketToGame.delete(socketId);
  const state = activeGames.get(gameId);
  if (!state) return gameId;
  if (state.whiteSocketId === socketId) state.whiteSocketId = undefined;
  if (state.blackSocketId === socketId) state.blackSocketId = undefined;
  state.spectatorSocketIds.delete(socketId);
  return gameId;
}

export async function createAiGame(
  playerId: string,
  playerColor: "white" | "black" | "random",
  timeControl: TimeControl,
  aiDepth: number = 10
): Promise<Game> {
  const player = await db.select().from(playersTable).where(eq(playersTable.id, playerId)).then(r => r[0]);
  if (!player) throw new Error("Player not found");

  const resolvedColor = playerColor === "random"
    ? (Math.random() < 0.5 ? "white" : "black")
    : playerColor;

  const gameId = uuidv4();
  const whitePlayerId = resolvedColor === "white" ? playerId : "ai";
  const blackPlayerId = resolvedColor === "black" ? playerId : "ai";
  const whiteUsername = resolvedColor === "white" ? player.username : `AI (depth ${aiDepth})`;
  const blackUsername = resolvedColor === "black" ? player.username : `AI (depth ${aiDepth})`;

  const [game] = await db.insert(gamesTable).values({
    id: gameId,
    whitePlayerId,
    blackPlayerId,
    whiteUsername,
    blackUsername,
    whiteRating: resolvedColor === "white" ? player.rating : 1500,
    blackRating: resolvedColor === "black" ? player.rating : 1500,
    status: "active",
    timeControl,
    whiteTimeMs: timeControl.initialSeconds * 1000,
    blackTimeMs: timeControl.initialSeconds * 1000,
    isAiGame: true,
    aiDepth,
    moveCount: 0,
  }).returning();

  activeGames.set(gameId, { gameId, spectatorSocketIds: new Set(), premoves: new Map() });
  return game;
}

export async function createRoom(
  playerId: string,
  timeControl: TimeControl,
  playerColor: "white" | "black" | "random"
): Promise<{ game: Game; roomCode: string }> {
  const player = await db.select().from(playersTable).where(eq(playersTable.id, playerId)).then(r => r[0]);
  if (!player) throw new Error("Player not found");

  const resolvedColor = playerColor === "random"
    ? (Math.random() < 0.5 ? "white" : "black")
    : playerColor;

  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const gameId = uuidv4();

  const [game] = await db.insert(gamesTable).values({
    id: gameId,
    whitePlayerId: resolvedColor === "white" ? playerId : "",
    blackPlayerId: resolvedColor === "black" ? playerId : null,
    whiteUsername: resolvedColor === "white" ? player.username : "Waiting...",
    blackUsername: resolvedColor === "black" ? player.username : null,
    whiteRating: resolvedColor === "white" ? player.rating : 1200,
    blackRating: resolvedColor === "black" ? player.rating : null,
    status: "pending",
    timeControl,
    whiteTimeMs: timeControl.initialSeconds * 1000,
    blackTimeMs: timeControl.initialSeconds * 1000,
    isAiGame: false,
    roomCode,
    moveCount: 0,
  }).returning();

  activeGames.set(gameId, { gameId, spectatorSocketIds: new Set(), premoves: new Map() });
  return { game, roomCode };
}

export async function joinRoom(playerId: string, roomCode: string): Promise<Game> {
  const player = await db.select().from(playersTable).where(eq(playersTable.id, playerId)).then(r => r[0]);
  if (!player) throw new Error("Player not found");

  const [game] = await db.select().from(gamesTable).where(
    and(eq(gamesTable.roomCode, roomCode), eq(gamesTable.status, "pending"))
  );
  if (!game) throw new Error("Room not found or already started");

  const isWhiteEmpty = !game.whitePlayerId || game.whitePlayerId === "";
  const isBlackEmpty = !game.blackPlayerId;

  if (!isWhiteEmpty && !isBlackEmpty) throw new Error("Room is full");
  if (game.whitePlayerId === playerId || game.blackPlayerId === playerId) throw new Error("You cannot join your own room");

  const updates: Partial<typeof gamesTable.$inferInsert> = { status: "active" };
  if (isWhiteEmpty) {
    updates.whitePlayerId = playerId;
    updates.whiteUsername = player.username;
    updates.whiteRating = player.rating;
  } else {
    updates.blackPlayerId = playerId;
    updates.blackUsername = player.username;
    updates.blackRating = player.rating;
  }

  const [updated] = await db.update(gamesTable).set(updates).where(eq(gamesTable.id, game.id)).returning();
  if (!activeGames.has(updated.id)) {
    activeGames.set(updated.id, { gameId: updated.id, spectatorSocketIds: new Set(), premoves: new Map() });
  }
  return updated;
}

export async function processMove(
  gameId: string,
  playerId: string,
  uci: string
): Promise<{ success: boolean; error?: string; moveResult?: Record<string, unknown> }> {
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  if (!game) return { success: false, error: "Game not found" };
  if (game.status !== "active") return { success: false, error: "Game not active" };

  const turn = getTurnFromFen(game.fen);
  const isWhiteTurn = turn === "w";
  const isPlayerWhite = game.whitePlayerId === playerId;
  const isPlayerBlack = game.blackPlayerId === playerId;

  if (isWhiteTurn && !isPlayerWhite) return { success: false, error: "Not your turn" };
  if (!isWhiteTurn && !isPlayerBlack) return { success: false, error: "Not your turn" };

  const state = activeGames.get(gameId);
  const now = Date.now();
  let whiteTimeMs = game.whiteTimeMs;
  let blackTimeMs = game.blackTimeMs;

  if (state?.lastMoveTime && game.moveCount > 0) {
    const elapsed = now - state.lastMoveTime;
    if (isWhiteTurn) {
      whiteTimeMs = Math.max(0, whiteTimeMs - elapsed);
    } else {
      blackTimeMs = Math.max(0, blackTimeMs - elapsed);
    }
  }

  const timeControl = game.timeControl as TimeControl;
  if (isWhiteTurn) {
    whiteTimeMs += timeControl.incrementSeconds * 1000;
  } else {
    blackTimeMs += timeControl.incrementSeconds * 1000;
  }

  const moveResult = validateAndApplyMove(game.fen, uci);
  if (!moveResult) return { success: false, error: "Illegal move" };

  const moveId = uuidv4();
  const moveNumber = game.moveCount + 1;

  await db.insert(movesTable).values({
    id: moveId,
    gameId,
    moveNumber,
    san: moveResult.san,
    uci: moveResult.uci,
    fen: moveResult.fen,
    whiteClockMs: whiteTimeMs,
    blackClockMs: blackTimeMs,
  });

  const gameUpdates: Partial<typeof gamesTable.$inferInsert> = {
    fen: moveResult.fen,
    pgn: moveResult.pgn,
    whiteTimeMs,
    blackTimeMs,
    moveCount: moveNumber,
    drawOfferedBy: null,
    lastMoveAt: new Date(),
  };

  if (moveResult.isGameOver) {
    gameUpdates.status = "finished";
    gameUpdates.result = moveResult.result;
    gameUpdates.resultReason = moveResult.resultReason;
    await finalizeGame(gameId, moveResult.result!, game);
  }

  await db.update(gamesTable).set(gameUpdates).where(eq(gamesTable.id, gameId));

  if (state) {
    state.lastMoveTime = now;
  }

  return {
    success: true,
    moveResult: {
      gameId,
      moveNumber,
      whiteTimeMs,
      blackTimeMs,
      fen: moveResult.fen,
      san: moveResult.san,
      uci: moveResult.uci,
      pgn: moveResult.pgn,
      isCheck: moveResult.isCheck,
      isCheckmate: moveResult.isCheckmate,
      isStalemate: moveResult.isStalemate,
      isDraw: moveResult.isDraw,
      drawReason: moveResult.drawReason,
      isGameOver: moveResult.isGameOver,
      result: moveResult.result,
      resultReason: moveResult.resultReason,
    },
  };
}

export async function resignGame(gameId: string, playerId: string): Promise<Game> {
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  if (!game || game.status !== "active") throw new Error("Game not active");

  const isWhite = game.whitePlayerId === playerId;
  const result = isWhite ? "black" : "white";

  await db.update(gamesTable).set({
    status: "finished",
    result,
    resultReason: "resignation",
  }).where(eq(gamesTable.id, gameId));

  await finalizeGame(gameId, result, game);
  const [updated] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  return updated;
}

export async function abortGame(gameId: string, playerId: string): Promise<Game> {
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  if (!game) throw new Error("Game not found");
  if (game.status !== "active" && game.status !== "pending") throw new Error("Game cannot be aborted");
  if (game.moveCount > 2) throw new Error("Can only abort before 2 moves are made");

  await db.update(gamesTable).set({ status: "aborted", resultReason: "abort" }).where(eq(gamesTable.id, gameId));
  const [updated] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  return updated;
}

export async function offerDraw(gameId: string, playerId: string): Promise<Game> {
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  if (!game || game.status !== "active") throw new Error("Game not active");

  await db.update(gamesTable).set({ drawOfferedBy: playerId }).where(eq(gamesTable.id, gameId));
  const [updated] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  return updated;
}

export async function acceptDraw(gameId: string, playerId: string): Promise<Game> {
  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  if (!game || game.status !== "active") throw new Error("Game not active");
  if (game.drawOfferedBy === playerId) throw new Error("Cannot accept your own draw offer");
  if (!game.drawOfferedBy) throw new Error("No draw offer pending");

  await db.update(gamesTable).set({
    status: "finished",
    result: "draw",
    resultReason: "agreement",
    drawOfferedBy: null,
  }).where(eq(gamesTable.id, gameId));

  await finalizeGame(gameId, "draw", game);
  const [updated] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
  return updated;
}

async function finalizeGame(gameId: string, result: "white" | "black" | "draw", game: Game): Promise<void> {
  if (game.isAiGame) return;
  if (!game.blackPlayerId) return;

  const whitePlayer = await db.select().from(playersTable).where(eq(playersTable.id, game.whitePlayerId)).then(r => r[0]);
  const blackPlayer = await db.select().from(playersTable).where(eq(playersTable.id, game.blackPlayerId)).then(r => r[0]);
  if (!whitePlayer || !blackPlayer) return;

  const eloResult = calculateElo(
    whitePlayer.rating,
    blackPlayer.rating,
    whitePlayer.gamesPlayed,
    blackPlayer.gamesPlayed,
    result
  );

  const whiteWon = result === "white";
  const blackWon = result === "black";
  const isDraw = result === "draw";

  await db.update(playersTable).set({
    rating: eloResult.whiteNewRating,
    peakRating: Math.max(whitePlayer.peakRating, eloResult.whiteNewRating),
    gamesPlayed: whitePlayer.gamesPlayed + 1,
    wins: whitePlayer.wins + (whiteWon ? 1 : 0),
    losses: whitePlayer.losses + (blackWon ? 1 : 0),
    draws: whitePlayer.draws + (isDraw ? 1 : 0),
    currentStreak: whiteWon
      ? Math.max(0, whitePlayer.currentStreak) + 1
      : isDraw
      ? 0
      : Math.min(0, whitePlayer.currentStreak) - 1,
  }).where(eq(playersTable.id, whitePlayer.id));

  await db.update(playersTable).set({
    rating: eloResult.blackNewRating,
    peakRating: Math.max(blackPlayer.peakRating, eloResult.blackNewRating),
    gamesPlayed: blackPlayer.gamesPlayed + 1,
    wins: blackPlayer.wins + (blackWon ? 1 : 0),
    losses: blackPlayer.losses + (whiteWon ? 1 : 0),
    draws: blackPlayer.draws + (isDraw ? 1 : 0),
    currentStreak: blackWon
      ? Math.max(0, blackPlayer.currentStreak) + 1
      : isDraw
      ? 0
      : Math.min(0, blackPlayer.currentStreak) - 1,
  }).where(eq(playersTable.id, blackPlayer.id));

  const histId1 = uuidv4();
  const histId2 = uuidv4();
  await db.insert(ratingHistoryTable).values([
    {
      id: histId1,
      playerId: whitePlayer.id,
      gameId,
      rating: eloResult.whiteNewRating,
      ratingChange: eloResult.whiteChange,
    },
    {
      id: histId2,
      playerId: blackPlayer.id,
      gameId,
      rating: eloResult.blackNewRating,
      ratingChange: eloResult.blackChange,
    },
  ]);

  logger.info({ gameId, result, whiteChange: eloResult.whiteChange, blackChange: eloResult.blackChange }, "Game finalized, ratings updated");
}

export async function joinMatchmakingQueue(
  playerId: string,
  timeControl: TimeControl
): Promise<{ status: "queued" | "matched"; gameId?: string }> {
  if (matchmakingQueue.size > 0) {
    const candidates = Array.from(matchmakingQueue.entries()).filter(([id]) => id !== playerId);
    if (candidates.length > 0) {
      const [opponentId, opponentEntry] = candidates[0];
      matchmakingQueue.delete(opponentId);

      const opponent = await db.select().from(playersTable).where(eq(playersTable.id, opponentId)).then(r => r[0]);
      const player = await db.select().from(playersTable).where(eq(playersTable.id, playerId)).then(r => r[0]);
      if (!opponent || !player) return { status: "queued" };

      const isWhite = Math.random() < 0.5;
      const gameId = uuidv4();

      await db.insert(gamesTable).values({
        id: gameId,
        whitePlayerId: isWhite ? playerId : opponentId,
        blackPlayerId: isWhite ? opponentId : playerId,
        whiteUsername: isWhite ? player.username : opponent.username,
        blackUsername: isWhite ? opponent.username : player.username,
        whiteRating: isWhite ? player.rating : opponent.rating,
        blackRating: isWhite ? opponent.rating : player.rating,
        status: "active",
        timeControl: opponentEntry.timeControl,
        whiteTimeMs: opponentEntry.timeControl.initialSeconds * 1000,
        blackTimeMs: opponentEntry.timeControl.initialSeconds * 1000,
        isAiGame: false,
        moveCount: 0,
      });

      activeGames.set(gameId, { gameId, spectatorSocketIds: new Set(), premoves: new Map() });
      return { status: "matched", gameId };
    }
  }

  matchmakingQueue.set(playerId, { playerId, timeControl, joinedAt: Date.now() });
  return { status: "queued" };
}

export function leaveMatchmakingQueue(playerId: string): void {
  matchmakingQueue.delete(playerId);
}

export function startClockForGame(_gameId: string): void {
}
