import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { db, gamesTable, movesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  registerSocket,
  unregisterSocket,
  processMove,
  getActiveGame,
  resignGame,
  acceptDraw,
} from "./game-manager.js";
import { logger } from "./logger.js";
import { auditMove, clearGameHistory } from "./anti-cheat.js";
import { getBestAiMove } from "./chess-engine.js";
import { Chess } from "chess.js";

// Track last-move timestamp per game for anti-cheat timing analysis
const gameMoveTimestamps = new Map<string, number>();

// Track in-progress AI computations to avoid double moves
const aiThinking = new Set<string>();

async function triggerAiMove(io: SocketIOServer, gameId: string): Promise<void> {
  if (aiThinking.has(gameId)) return;
  aiThinking.add(gameId);

  try {
    const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
    if (!game || game.status !== "active" || !game.isAiGame) return;

    const chess = new Chess(game.fen);
    if (chess.isGameOver()) return;

    const aiPlayerId = game.whitePlayerId === "ai" ? "ai" : "ai";
    const aiColor = game.whitePlayerId === "ai" ? "w" : "b";
    if (chess.turn() !== aiColor) return;

    const depth = Math.min(game.aiDepth ?? 3, 4);
    const bestMove = getBestAiMove(game.fen, depth);
    if (!bestMove) return;

    const result = await processMove(gameId, aiPlayerId, bestMove);
    if (!result.success) {
      logger.warn({ gameId, bestMove, error: result.error }, "AI move failed");
      return;
    }

    io.to(`game:${gameId}`).emit("move:confirmed", {
      gameId,
      ...result.moveResult,
    });

    logger.info({ gameId, move: bestMove, san: result.moveResult?.san }, "AI move executed");

    if (result.moveResult?.isGameOver) {
      const [finalGame] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
      clearGameHistory(gameId);
      gameMoveTimestamps.delete(gameId);
      io.to(`game:${gameId}`).emit("game:over", {
        gameId,
        result: finalGame?.result,
        resultReason: finalGame?.resultReason,
      });
    }
  } catch (err) {
    logger.error({ err, gameId }, "Error in AI move");
  } finally {
    aiThinking.delete(gameId);
  }
}

export function createWebSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/ws/socket.io",
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Client connected");

    socket.on("game:join", async ({ gameId, playerId }: { gameId: string; playerId: string }) => {
      try {
        const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
        if (!game) {
          socket.emit("error", { message: "Game not found" });
          return;
        }

        socket.join(`game:${gameId}`);

        let color: "white" | "black" | "spectator" = "spectator";
        if (game.whitePlayerId === playerId) color = "white";
        else if (game.blackPlayerId === playerId) color = "black";

        registerSocket(socket.id, gameId, color);

        // Fetch move history so client has full context on join
        const moves = await db.select().from(movesTable)
          .where(eq(movesTable.gameId, gameId))
          .orderBy(movesTable.moveNumber);

        socket.emit("game:state", {
          game,
          color,
          moves: moves.map(m => ({ san: m.san, uci: m.uci, moveNumber: m.moveNumber })),
        });

        // If it's an AI game and AI needs to move, trigger it
        if (game.isAiGame && game.status === "active") {
          const chess = new Chess(game.fen);
          const aiColor = game.whitePlayerId === "ai" ? "w" : "b";
          if (!chess.isGameOver() && chess.turn() === aiColor) {
            const delay = 400;
            setTimeout(() => triggerAiMove(io, gameId), delay);
          }
        }

        logger.info({ socketId: socket.id, gameId, color }, "Player joined game");
      } catch (err) {
        logger.error({ err }, "Error joining game");
        socket.emit("error", { message: "Failed to join game" });
      }
    });

    socket.on("game:move", async ({
      gameId,
      playerId,
      uci,
      clientTime,
    }: {
      gameId: string;
      playerId: string;
      uci: string;
      clientTime?: number;
    }) => {
      try {
        // ── Anti-cheat: timing analysis ──────────────────────────────────
        const serverReceived = Date.now();
        const lastTs = gameMoveTimestamps.get(gameId);
        const thinkingTimeMs = lastTs ? serverReceived - lastTs : 999_999;
        gameMoveTimestamps.set(gameId, serverReceived);

        const [gameRow] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
        if (gameRow) {
          const chessboard = new Chess(gameRow.fen);
          const auditResult = auditMove({
            gameId,
            playerId,
            moveNumber: Math.floor(chessboard.history().length / 2) + 1,
            thinkingTimeMs,
            fen: gameRow.fen,
            uci,
            isAiGame: !!gameRow.blackPlayerId?.startsWith("ai") || gameRow.blackPlayerId === null,
          });

          if (auditResult.suspicious) {
            logger.warn(
              { gameId, playerId, flags: auditResult.flags, riskScore: auditResult.riskScore },
              "Anti-cheat: suspicious activity flagged"
            );
          }
        }

        // ── Process human move ────────────────────────────────────────────
        const result = await processMove(gameId, playerId, uci);

        if (!result.success) {
          socket.emit("move:rejected", { error: result.error, gameId });
          return;
        }

        io.to(`game:${gameId}`).emit("move:confirmed", {
          gameId,
          ...result.moveResult,
        });

        if (result.moveResult?.isGameOver) {
          const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
          clearGameHistory(gameId);
          gameMoveTimestamps.delete(gameId);
          io.to(`game:${gameId}`).emit("game:over", {
            gameId,
            result: game?.result,
            resultReason: game?.resultReason,
          });
        } else {
          // ── Trigger AI response if needed ─────────────────────────────
          const [updatedGame] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
          if (updatedGame?.isAiGame && updatedGame.status === "active") {
            // Add a small delay so the client sees the human move first
            const thinkDelay = 200 + Math.random() * 400; // 200-600ms realistic feel
            setTimeout(() => triggerAiMove(io, gameId), thinkDelay);
          }
        }

        logger.info({ gameId, playerId, uci, san: result.moveResult?.san, thinkingTimeMs }, "Move processed");
      } catch (err) {
        logger.error({ err, gameId }, "Error processing move");
        socket.emit("error", { message: "Failed to process move" });
      }
    });

    socket.on("game:resign", async ({ gameId, playerId }: { gameId: string; playerId: string }) => {
      try {
        const updated = await resignGame(gameId, playerId);
        clearGameHistory(gameId);
        gameMoveTimestamps.delete(gameId);
        io.to(`game:${gameId}`).emit("game:over", {
          gameId,
          result: updated.result,
          resultReason: updated.resultReason,
        });
        logger.info({ gameId, playerId, result: updated.result }, "Player resigned, ratings updated");
      } catch (err) {
        logger.error({ err, gameId }, "Error resigning game");
      }
    });

    socket.on("game:draw-offer", async ({ gameId, playerId }: { gameId: string; playerId: string }) => {
      try {
        await db.update(gamesTable).set({ drawOfferedBy: playerId }).where(eq(gamesTable.id, gameId));
        io.to(`game:${gameId}`).emit("game:draw-offered", { gameId, offeredBy: playerId });
        logger.info({ gameId, playerId }, "Draw offered");
      } catch (err) {
        logger.error({ err, gameId }, "Error offering draw");
      }
    });

    socket.on("game:draw-accept", async ({ gameId, playerId }: { gameId: string; playerId: string }) => {
      try {
        const updated = await acceptDraw(gameId, playerId);
        clearGameHistory(gameId);
        gameMoveTimestamps.delete(gameId);
        io.to(`game:${gameId}`).emit("game:over", {
          gameId,
          result: updated.result,
          resultReason: updated.resultReason,
        });
        logger.info({ gameId, playerId }, "Draw accepted, ratings updated");
      } catch (err) {
        logger.error({ err, gameId }, "Error accepting draw");
      }
    });

    socket.on("game:draw-decline", async ({ gameId }: { gameId: string }) => {
      await db.update(gamesTable).set({ drawOfferedBy: null }).where(eq(gamesTable.id, gameId));
      io.to(`game:${gameId}`).emit("game:draw-declined", { gameId });
    });

    socket.on("clock:sync", async ({ gameId }: { gameId: string }) => {
      const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
      if (!game) return;

      socket.emit("clock:update", {
        gameId,
        whiteTimeMs: game.whiteTimeMs,
        blackTimeMs: game.blackTimeMs,
        serverTime: Date.now(),
      });
    });

    socket.on("game:resync", async ({ gameId }: { gameId: string }) => {
      const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
      if (!game) return;

      const moves = await db.select().from(movesTable)
        .where(eq(movesTable.gameId, gameId))
        .orderBy(movesTable.moveNumber);

      socket.emit("game:state", {
        game,
        resync: true,
        moves: moves.map(m => ({ san: m.san, uci: m.uci, moveNumber: m.moveNumber })),
      });
    });

    socket.on("disconnect", () => {
      const gameId = unregisterSocket(socket.id);
      if (gameId) {
        socket.to(`game:${gameId}`).emit("player:disconnected", {
          socketId: socket.id,
          gameId,
        });
      }
      logger.info({ socketId: socket.id, gameId }, "Client disconnected");
    });
  });

  return io;
}
