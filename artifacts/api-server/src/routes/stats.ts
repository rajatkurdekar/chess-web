import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, playersTable, gamesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/platform", async (_req, res): Promise<void> => {
  const [totalPlayers] = await db.select({ count: sql<number>`count(*)` }).from(playersTable);
  const [totalGames] = await db.select({ count: sql<number>`count(*)` }).from(gamesTable);
  const [activeGames] = await db.select({ count: sql<number>`count(*)` })
    .from(gamesTable)
    .where(sql`${gamesTable.status} = 'active'`);
  const [gamesPlayedToday] = await db.select({ count: sql<number>`count(*)` })
    .from(gamesTable)
    .where(sql`${gamesTable.createdAt} > now() - interval '24 hours'`);
  const [avgRating] = await db.select({ avg: sql<number>`avg(${playersTable.rating})` }).from(playersTable);

  res.json({
    totalPlayers: Number(totalPlayers?.count ?? 0),
    totalGames: Number(totalGames?.count ?? 0),
    activeGames: Number(activeGames?.count ?? 0),
    gamesPlayedToday: Number(gamesPlayedToday?.count ?? 0),
    averageRating: Math.round(Number(avgRating?.avg ?? 1200)),
  });
});

export default router;
