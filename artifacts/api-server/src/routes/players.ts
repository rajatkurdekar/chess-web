import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, playersTable, gamesTable, ratingHistoryTable } from "@workspace/db";
import {
  RegisterPlayerBody,
  LoginPlayerBody,
  CreateGuestBody,
  GetPlayerParams,
  GetPlayerGamesParams,
  GetPlayerGamesQueryParams,
  GetPlayerStatsParams,
  GetPlayerRatingHistoryParams,
  GetLeaderboardQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "chess-secret-key";

function generateToken(playerId: string): string {
  return jwt.sign({ playerId }, JWT_SECRET, { expiresIn: "30d" });
}

router.post("/players/guest", async (req, res): Promise<void> => {
  const parsed = CreateGuestBody.safeParse(req.body);
  const username = parsed.success && parsed.data.username
    ? parsed.data.username
    : `Guest_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const existing = await db.select().from(playersTable).where(eq(playersTable.username, username)).then(r => r[0]);
  if (existing) {
    const token = generateToken(existing.id);
    res.status(201).json({ player: existing, token });
    return;
  }

  const id = uuidv4();
  const [player] = await db.insert(playersTable).values({
    id,
    username,
    isGuest: true,
    rating: 1200,
    peakRating: 1200,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
  }).returning();

  const token = generateToken(player.id);
  res.status(201).json({ player, token });
});

router.post("/players/register", async (req, res): Promise<void> => {
  const parsed = RegisterPlayerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  const existing = await db.select().from(playersTable).where(eq(playersTable.username, username)).then(r => r[0]);
  if (existing) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const [player] = await db.insert(playersTable).values({
    id,
    username,
    passwordHash,
    isGuest: false,
    rating: 1200,
    peakRating: 1200,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
  }).returning();

  const token = generateToken(player.id);
  res.status(201).json({ player, token });
});

router.post("/players/login", async (req, res): Promise<void> => {
  const parsed = LoginPlayerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  const player = await db.select().from(playersTable).where(eq(playersTable.username, username)).then(r => r[0]);
  if (!player || !player.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, player.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(player.id);
  res.json({ player, token });
});

router.get("/players/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { playerId: string };
    const player = await db.select().from(playersTable).where(eq(playersTable.id, payload.playerId)).then(r => r[0]);
    if (!player) {
      res.status(401).json({ error: "Player not found" });
      return;
    }
    res.json(player);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get("/players/:playerId", async (req, res): Promise<void> => {
  const params = GetPlayerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const player = await db.select().from(playersTable).where(eq(playersTable.id, params.data.playerId)).then(r => r[0]);
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  res.json(player);
});

router.get("/players/:playerId/games", async (req, res): Promise<void> => {
  const params = GetPlayerGamesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = GetPlayerGamesQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;
  const offset = query.success ? (query.data.offset ?? 0) : 0;

  const { playerId } = params.data;
  const games = await db.select().from(gamesTable)
    .where(
      sql`(${gamesTable.whitePlayerId} = ${playerId} OR ${gamesTable.blackPlayerId} = ${playerId})`
    )
    .orderBy(desc(gamesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db.select({ count: sql<number>`count(*)` }).from(gamesTable)
    .where(
      sql`(${gamesTable.whitePlayerId} = ${playerId} OR ${gamesTable.blackPlayerId} = ${playerId})`
    ).then(r => Number(r[0]?.count ?? 0));

  res.json({ games, total });
});

router.get("/players/:playerId/stats", async (req, res): Promise<void> => {
  const params = GetPlayerStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const player = await db.select().from(playersTable).where(eq(playersTable.id, params.data.playerId)).then(r => r[0]);
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const winRate = player.gamesPlayed > 0 ? player.wins / player.gamesPlayed : 0;

  res.json({
    playerId: player.id,
    totalGames: player.gamesPlayed,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
    winRate,
    currentRating: player.rating,
    peakRating: player.peakRating,
    currentStreak: player.currentStreak,
    favoriteTimeControl: null,
    avgGameDuration: null,
  });
});

router.get("/players/:playerId/rating-history", async (req, res): Promise<void> => {
  const params = GetPlayerRatingHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const history = await db.select().from(ratingHistoryTable)
    .where(eq(ratingHistoryTable.playerId, params.data.playerId))
    .orderBy(desc(ratingHistoryTable.timestamp))
    .limit(50);

  res.json(history);
});

router.get("/leaderboard", async (req, res): Promise<void> => {
  const query = GetLeaderboardQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;

  const players = await db.select().from(playersTable)
    .where(sql`${playersTable.gamesPlayed} >= 5`)
    .orderBy(desc(playersTable.rating))
    .limit(limit);

  const leaderboard = players.map((p, i) => ({
    rank: i + 1,
    playerId: p.id,
    username: p.username,
    rating: p.rating,
    gamesPlayed: p.gamesPlayed,
    winRate: p.gamesPlayed > 0 ? p.wins / p.gamesPlayed : 0,
  }));

  res.json(leaderboard);
});

export default router;
