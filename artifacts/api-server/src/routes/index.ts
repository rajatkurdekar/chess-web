import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import gamesRouter from "./games";
import matchmakingRouter from "./matchmaking";
import analysisRouter from "./analysis";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(playersRouter);
router.use(gamesRouter);
router.use(matchmakingRouter);
router.use(analysisRouter);
router.use(statsRouter);

export default router;
