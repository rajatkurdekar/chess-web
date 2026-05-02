import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { Chess } from "chess.js";
import { db, gamesTable, movesTable } from "@workspace/db";
import { GetGameAnalysisParams } from "@workspace/api-zod";

const router: IRouter = Router();

type MoveClassification = "brilliant" | "great" | "best" | "good" | "inaccuracy" | "mistake" | "blunder" | "book";

function classifyMove(cpLoss: number, moveNumber: number): MoveClassification {
  if (moveNumber <= 10) return "book";
  if (cpLoss <= 0) return "best";
  if (cpLoss <= 20) return "good";
  if (cpLoss <= 50) return "inaccuracy";
  if (cpLoss <= 150) return "mistake";
  return "blunder";
}

function materialEval(fen: string): number {
  const chess = new Chess(fen);
  const board = chess.board();
  const pieceValues: Record<string, number> = {
    p: -1, n: -3, b: -3, r: -5, q: -9,
    P: 1, N: 3, B: 3, R: 5, Q: 9,
  };

  let eval_ = 0;
  for (const row of board) {
    for (const square of row) {
      if (square) {
        const key = square.color === "w"
          ? square.type.toUpperCase()
          : square.type.toLowerCase();
        eval_ += pieceValues[key] ?? 0;
      }
    }
  }

  return eval_;
}

router.get("/analysis/:gameId", async (req, res): Promise<void> => {
  const params = GetGameAnalysisParams.safeParse(req.params);
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

  const analyzedMoves = [];
  let whiteInaccuracies = 0, whiteMistakes = 0, whiteBlunders = 0, whiteBest = 0, whiteGood = 0, whiteBrilliant = 0, whiteGreat = 0;
  let blackInaccuracies = 0, blackMistakes = 0, blackBlunders = 0, blackBest = 0, blackGood = 0, blackBrilliant = 0, blackGreat = 0;

  const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  let prevFen = startFen;

  for (const move of moves) {
    const evalBefore = materialEval(prevFen) * 100;
    const evalAfter = materialEval(move.fen) * 100;
    const isWhiteMove = move.moveNumber % 2 !== 0;
    const cpLoss = isWhiteMove
      ? Math.max(0, evalBefore - evalAfter)
      : Math.max(0, evalAfter - evalBefore);

    const classification = classifyMove(cpLoss, move.moveNumber);

    if (isWhiteMove) {
      if (classification === "brilliant") whiteBrilliant++;
      else if (classification === "great") whiteGreat++;
      else if (classification === "best") whiteBest++;
      else if (classification === "good") whiteGood++;
      else if (classification === "inaccuracy") whiteInaccuracies++;
      else if (classification === "mistake") whiteMistakes++;
      else if (classification === "blunder") whiteBlunders++;
    } else {
      if (classification === "brilliant") blackBrilliant++;
      else if (classification === "great") blackGreat++;
      else if (classification === "best") blackBest++;
      else if (classification === "good") blackGood++;
      else if (classification === "inaccuracy") blackInaccuracies++;
      else if (classification === "mistake") blackMistakes++;
      else if (classification === "blunder") blackBlunders++;
    }

    analyzedMoves.push({
      moveNumber: move.moveNumber,
      san: move.san,
      classification,
      evalBefore: evalBefore / 100,
      evalAfter: evalAfter / 100,
      bestMove: null,
      bestMoveEval: null,
    });

    prevFen = move.fen;
  }

  const whiteTotal = whiteBrilliant + whiteGreat + whiteBest + whiteGood + whiteInaccuracies + whiteMistakes + whiteBlunders;
  const blackTotal = blackBrilliant + blackGreat + blackBest + blackGood + blackInaccuracies + blackMistakes + blackBlunders;

  const whiteAccuracy = whiteTotal > 0
    ? Math.round(((whiteBrilliant + whiteGreat + whiteBest + whiteGood) / whiteTotal) * 100)
    : 100;
  const blackAccuracy = blackTotal > 0
    ? Math.round(((blackBrilliant + blackGreat + blackBest + blackGood) / blackTotal) * 100)
    : 100;

  res.json({
    gameId: params.data.gameId,
    analyzedMoves,
    whiteAccuracy,
    blackAccuracy,
    whiteBrilliant,
    whiteGreat,
    whiteBest,
    whiteGood,
    whiteInaccuracies,
    whiteMistakes,
    whiteBlunders,
    blackBrilliant,
    blackGreat,
    blackBest,
    blackGood,
    blackInaccuracies,
    blackMistakes,
    blackBlunders,
  });
});

export default router;
