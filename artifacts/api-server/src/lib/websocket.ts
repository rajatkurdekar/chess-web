import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { db, gamesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  registerSocket,
  unregisterSocket,
  processMove,
  getActiveGame,
} from "./game-manager.js";
import { logger } from "./logger.js";
import { auditMove, clearGameHistory } from "./anti-cheat.js";

// Track last-move timestamp per game for anti-cheat timing analysis
const gameMoveTimestamps = new Map<string, number>();

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

        socket.emit("game:state", { game, color });

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
          const chessboard = new (await import("chess.js")).Chess(gameRow.fen);
          const auditResult = auditMove({
            gameId,
            playerId,
            moveNumber: Math.floor(chessboard.history().length / 2) + 1,
            thinkingTimeMs,
            fen: gameRow.fen,
            uci,
            isAiGame: !!gameRow.blackPlayerId?.startsWith("ai_") || gameRow.blackPlayerId === null,
          });

          if (auditResult.suspicious) {
            logger.warn(
              { gameId, playerId, flags: auditResult.flags, riskScore: auditResult.riskScore },
              "Anti-cheat: suspicious activity flagged"
            );
          }
        }

        // ── Process move ─────────────────────────────────────────────────
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
        }

        logger.info({ gameId, playerId, uci, san: result.moveResult?.san, thinkingTimeMs }, "Move processed");
      } catch (err) {
        logger.error({ err, gameId }, "Error processing move");
        socket.emit("error", { message: "Failed to process move" });
      }
    });

    socket.on("game:resign", async ({ gameId, playerId }: { gameId: string; playerId: string }) => {
      try {
        const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
        if (!game || game.status !== "active") return;

        const isWhite = game.whitePlayerId === playerId;
        const result = isWhite ? "black" : "white";

        await db.update(gamesTable).set({
          status: "finished",
          result,
          resultReason: "resignation",
        }).where(eq(gamesTable.id, gameId));

        clearGameHistory(gameId);
        gameMoveTimestamps.delete(gameId);

        io.to(`game:${gameId}`).emit("game:over", {
          gameId,
          result,
          resultReason: "resignation",
        });
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
        const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
        if (!game || game.status !== "active" || !game.drawOfferedBy || game.drawOfferedBy === playerId) return;

        await db.update(gamesTable).set({
          status: "finished",
          result: "draw",
          resultReason: "agreement",
          drawOfferedBy: null,
        }).where(eq(gamesTable.id, gameId));

        clearGameHistory(gameId);
        gameMoveTimestamps.delete(gameId);

        io.to(`game:${gameId}`).emit("game:over", {
          gameId,
          result: "draw",
          resultReason: "agreement",
        });
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
      socket.emit("game:state", { game, resync: true });
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
