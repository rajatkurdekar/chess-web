import { Router, type IRouter } from "express";
import { JoinQueueBody } from "@workspace/api-zod";
import { joinMatchmakingQueue, leaveMatchmakingQueue } from "../lib/game-manager.js";

const router: IRouter = Router();

router.post("/matchmaking/queue", async (req, res): Promise<void> => {
  const parsed = JoinQueueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { playerId, timeControl } = parsed.data;
  const result = await joinMatchmakingQueue(playerId, timeControl);

  res.json({
    status: result.status,
    gameId: result.gameId ?? null,
    queuePosition: result.status === "queued" ? 1 : null,
  });
});

router.delete("/matchmaking/queue", async (req, res): Promise<void> => {
  const body = req.body as { playerId?: string };
  if (!body.playerId) {
    res.status(400).json({ error: "playerId required" });
    return;
  }

  leaveMatchmakingQueue(body.playerId);
  res.sendStatus(204);
});

export default router;
