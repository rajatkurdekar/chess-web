import { Chess } from "chess.js";

export interface MoveResult {
  success: boolean;
  fen: string;
  san: string;
  uci: string;
  pgn: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?: string;
  isGameOver: boolean;
  result?: "white" | "black" | "draw";
  resultReason?: string;
}

export interface LegalMovesResult {
  from: string;
  to: string;
  promotion?: string;
}

export function createChessInstance(fen?: string): Chess {
  return fen ? new Chess(fen) : new Chess();
}

export function validateAndApplyMove(
  fen: string,
  uci: string
): MoveResult | null {
  try {
    const chess = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length === 5 ? uci[4] : undefined;

    const move = chess.move({ from, to, promotion });
    if (!move) return null;

    const newFen = chess.fen();
    const isCheckmate = chess.isCheckmate();
    const isStalemate = chess.isStalemate();
    const isInsufficientMaterial = chess.isInsufficientMaterial();
    const isThreefoldRepetition = chess.isThreefoldRepetition();
    const isFiftyMoveRule = chess.isDraw() && !isStalemate && !isInsufficientMaterial && !isThreefoldRepetition;
    const isDraw = chess.isDraw();
    const isGameOver = chess.isGameOver();

    let result: "white" | "black" | "draw" | undefined;
    let resultReason: string | undefined;
    let drawReason: string | undefined;

    if (isCheckmate) {
      result = chess.turn() === "w" ? "black" : "white";
      resultReason = "checkmate";
    } else if (isStalemate) {
      result = "draw";
      resultReason = "stalemate";
      drawReason = "stalemate";
    } else if (isInsufficientMaterial) {
      result = "draw";
      resultReason = "insufficient_material";
      drawReason = "insufficient_material";
    } else if (isThreefoldRepetition) {
      result = "draw";
      resultReason = "threefold_repetition";
      drawReason = "threefold_repetition";
    } else if (isFiftyMoveRule) {
      result = "draw";
      resultReason = "fifty_move_rule";
      drawReason = "fifty_move_rule";
    }

    return {
      success: true,
      fen: newFen,
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion || ""}`,
      pgn: chess.pgn(),
      isCheck: chess.inCheck(),
      isCheckmate,
      isStalemate,
      isDraw,
      drawReason,
      isGameOver,
      result,
      resultReason,
    };
  } catch {
    return null;
  }
}

export function getLegalMoves(fen: string, square?: string): LegalMovesResult[] {
  try {
    const chess = new Chess(fen);
    const moves = square
      ? chess.moves({ square: square as Parameters<Chess["moves"]>[0]["square"], verbose: true })
      : chess.moves({ verbose: true });
    return moves.map((m) => ({ from: m.from, to: m.to, promotion: m.promotion }));
  } catch {
    return [];
  }
}

export function isValidFen(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

export function getTurnFromFen(fen: string): "w" | "b" {
  const chess = new Chess(fen);
  return chess.turn();
}

// ─── AI Engine: Minimax with Alpha-Beta Pruning ────────────────────────────

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Piece-square tables (white's perspective, rank 8 → rank 1)
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

function getPSTValue(pieceType: string, color: "w" | "b", sq: string): number {
  const fileIdx = sq.charCodeAt(0) - 97; // 'a' = 0
  const rankIdx = 8 - parseInt(sq[1]);    // rank 8 = row 0
  const tableIdx = color === "w"
    ? rankIdx * 8 + fileIdx
    : (7 - rankIdx) * 8 + fileIdx;
  return PST[pieceType]?.[tableIdx] ?? 0;
}

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw()) return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const sq = String.fromCharCode(97 + f) + (8 - r);
      const val = (PIECE_VALUES[piece.type] ?? 0) + getPSTValue(piece.type, piece.color, sq);
      score += piece.color === "w" ? val : -val;
    }
  }
  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess);

  const moves = chess.moves({ verbose: true });

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      chess.move(m);
      const score = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (score > best) best = score;
      if (score > alpha) alpha = score;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      chess.move(m);
      const score = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      if (score < best) best = score;
      if (score < beta) beta = score;
      if (beta <= alpha) break;
    }
    return best;
  }
}

/**
 * Returns the best move UCI string for the given position.
 * depth 1 = beginner (fast), depth 4 = strong (may take ~1s).
 */
export function getBestAiMove(fen: string, depth: number): string | null {
  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) return null;

    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    const isMaximizing = chess.turn() === "w";
    let bestMove = moves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;

    // Shuffle for depth-1 (beginner) to add unpredictability
    const candidates = depth <= 1
      ? [...moves].sort(() => Math.random() - 0.5)
      : moves;

    for (const m of candidates) {
      chess.move(m);
      const score = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
      chess.undo();

      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }

    return `${bestMove.from}${bestMove.to}${bestMove.promotion ?? ""}`;
  } catch {
    return null;
  }
}
