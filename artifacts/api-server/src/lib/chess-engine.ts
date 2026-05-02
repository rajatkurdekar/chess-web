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
