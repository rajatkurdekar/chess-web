import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, gamesTable, movesTable } from "@workspace/db";
import {
  CreateAiGameBody,
  CreateRoomBody,
  GetGameParams,
  GetGameMovesParams,
  ResignGameParams,
  AbortGameParams,
  OfferDrawParams,
  AcceptDrawParams,
  JoinRoomParams,
  ListGamesQueryParams,
} from "@workspace/api-zod";
import {
  createAiGame,
  createRoom,
  joinRoom,
  resignGame,
  abortGame,
  offerDraw,
  acceptDraw,
} from "../lib/game-manager.js";

const router: IRouter = Router();

router.get("/games", async (req, res): Promise<void> => {
  const query = ListGamesQueryParams.safeParse(req.query);
  const status = query.success ? query.data.status : undefined;
  const limit = query.success ? (query.data.limit ?? 20) : 20;

  let dbQuery = db.select().from(gamesTable).orderBy(desc(gamesTable.createdAt)).limit(limit);
  const games = await dbQuery;

  const filtered = status ? games.filter(g => g.status === status) : games;
  res.json({ games: filtered, total: filtered.length });
});

router.post("/games/ai", async (req, res): Promise<void> => {
  const parsed = CreateAiGameBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { playerId, playerColor, timeControl, aiDepth } = parsed.data;
  const game = await createAiGame(playerId, playerColor, timeControl, aiDepth ?? 10);
  res.status(201).json(game);
});

router.post("/games/room", async (req, res): Promise<void> => {
  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { playerId, timeControl, playerColor } = parsed.data;
  const { game, roomCode } = await createRoom(playerId, timeControl, playerColor ?? "random");

  const origin = req.headers.origin || `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost"}`;
  const inviteUrl = `${origin}/game/${game.id}?room=${roomCode}`;

  res.status(201).json({ game, roomCode, inviteUrl });
});

router.post("/games/room/:roomCode/join", async (req, res): Promise<void> => {
  const params = JoinRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = req.body as { playerId?: string };
  if (!body.playerId) {
    res.status(400).json({ error: "playerId required" });
    return;
  }

  try {
    const game = await joinRoom(body.playerId, params.data.roomCode);
    res.json(game);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.get("/games/:gameId", async (req, res): Promise<void> => {
  const params = GetGameParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.gameId));
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const moves = await db.select().from(movesTable)
    .where(eq(movesTable.gameId, params.data.gameId))
    .orderBy(movesTable.moveNumber);

  res.json({ game, moves });
});

router.get("/games/:gameId/moves", async (req, res): Promise<void> => {
  const params = GetGameMovesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const moves = await db.select().from(movesTable)
    .where(eq(movesTable.gameId, params.data.gameId))
    .orderBy(movesTable.moveNumber);

  res.json(moves);
});

router.post("/games/:gameId/resign", async (req, res): Promise<void> => {
  const params = ResignGameParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = req.body as { playerId?: string };
  if (!body.playerId) {
    res.status(400).json({ error: "playerId required" });
    return;
  }

  try {
    const game = await resignGame(params.data.gameId, body.playerId);
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/games/:gameId/abort", async (req, res): Promise<void> => {
  const params = AbortGameParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = req.body as { playerId?: string };
  if (!body.playerId) {
    res.status(400).json({ error: "playerId required" });
    return;
  }

  try {
    const game = await abortGame(params.data.gameId, body.playerId);
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/games/:gameId/draw-offer", async (req, res): Promise<void> => {
  const params = OfferDrawParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = req.body as { playerId?: string };
  if (!body.playerId) {
    res.status(400).json({ error: "playerId required" });
    return;
  }

  try {
    const game = await offerDraw(params.data.gameId, body.playerId);
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/games/:gameId/draw-accept", async (req, res): Promise<void> => {
  const params = AcceptDrawParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = req.body as { playerId?: string };
  if (!body.playerId) {
    res.status(400).json({ error: "playerId required" });
    return;
  }

  try {
    const game = await acceptDraw(params.data.gameId, body.playerId);
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
