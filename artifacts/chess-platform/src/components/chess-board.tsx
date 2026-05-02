import React, { useState, useEffect, useCallback, useRef } from "react";
import { Chess, Square } from "chess.js";
import { cn } from "@/lib/utils";
import { ChessPiece } from "@/components/chess-pieces";

interface ChessBoardProps {
  fen: string;
  onMove?: (uci: string, from: string, to: string) => void;
  orientation?: "white" | "black";
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
  onCapturedUpdate?: (white: string[], black: string[]) => void;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function computeCaptured(fen: string) {
  const startingCounts: Record<string, number> = {
    p: 8, n: 2, b: 2, r: 2, q: 1,
    P: 8, N: 2, B: 2, R: 2, Q: 1,
  };
  const counts: Record<string, number> = {};
  const piecePart = fen.split(" ")[0];
  for (const ch of piecePart) {
    if (/[pnbrqkPNBRQK]/.test(ch)) counts[ch] = (counts[ch] ?? 0) + 1;
  }
  const capturedByWhite: string[] = [];
  const capturedByBlack: string[] = [];
  for (const [piece, start] of Object.entries(startingCounts)) {
    const current = counts[piece] ?? 0;
    const captured = start - current;
    for (let i = 0; i < captured; i++) {
      if (piece === piece.toLowerCase()) capturedByWhite.push(piece);
      else capturedByBlack.push(piece.toLowerCase());
    }
  }
  return { capturedByWhite, capturedByBlack };
}

function materialScore(capturedByWhite: string[], capturedByBlack: string[]) {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const wScore = capturedByWhite.reduce((s, p) => s + (values[p] ?? 0), 0);
  const bScore = capturedByBlack.reduce((s, p) => s + (values[p] ?? 0), 0);
  return wScore - bScore;
}

const PIECE_DISPLAY: Record<string, string> = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" };

export function CapturedPieces({
  pieces,
  color,
  advantage,
}: {
  pieces: string[];
  color: "w" | "b";
  advantage: number;
}) {
  const sorted = [...pieces].sort();
  return (
    <div className="flex items-center gap-0.5 min-h-[16px] flex-wrap">
      {sorted.map((p, i) => (
        <span
          key={i}
          className={cn(
            "text-sm leading-none",
            color === "w" ? "text-stone-200" : "text-stone-700"
          )}
          style={{
            textShadow:
              color === "w"
                ? "0 1px 2px rgba(0,0,0,0.8)"
                : "0 1px 1px rgba(255,255,255,0.4)",
          }}
        >
          {PIECE_DISPLAY[p]}
        </span>
      ))}
      {advantage > 0 && (
        <span className="text-[11px] font-bold text-muted-foreground ml-0.5">
          +{advantage}
        </span>
      )}
    </div>
  );
}

export function ChessBoard({
  fen,
  onMove,
  orientation = "white",
  disabled = false,
  lastMove,
  onCapturedUpdate,
}: ChessBoardProps) {
  const [game, setGame] = useState<Chess>(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  });
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [localLastMove, setLocalLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);
  const prevFenRef = useRef(fen);

  const { capturedByWhite, capturedByBlack } = computeCaptured(fen);
  const advantage = materialScore(capturedByWhite, capturedByBlack);

  useEffect(() => {
    onCapturedUpdate?.(capturedByWhite, capturedByBlack);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  // Sync game with incoming FEN prop
  useEffect(() => {
    try {
      const next = new Chess(fen);
      prevFenRef.current = fen;
      setSelectedSquare(null);
      setLegalTargets([]);
      setGame(next);
    } catch {
      /* invalid FEN */
    }
  }, [fen]);

  const effectiveLastMove = lastMove ?? localLastMove;

  const displayRanks = orientation === "white" ? RANKS : [...RANKS].reverse();
  const displayFiles = orientation === "white" ? FILES : [...FILES].reverse();

  const handleSquareClick = useCallback(
    (square: string) => {
      if (disabled || promotionPending) return;

      const piece = game.get(square as Square);
      const myColor = orientation === "white" ? "w" : "b";

      if (selectedSquare) {
        // ── Clicking a legal target → make the move ──
        if (legalTargets.includes(square)) {
          const movingPiece = game.get(selectedSquare as Square);
          const isPromotion =
            movingPiece?.type === "p" &&
            ((movingPiece.color === "w" && square[1] === "8") ||
              (movingPiece.color === "b" && square[1] === "1"));

          if (isPromotion) {
            setPromotionPending({ from: selectedSquare, to: square });
            setSelectedSquare(null);
            setLegalTargets([]);
            return;
          }

          try {
            // Clone so React knows state changed
            const next = new Chess(game.fen());
            const move = next.move({ from: selectedSquare, to: square });
            if (move) {
              setGame(next);
              setLocalLastMove({ from: selectedSquare, to: square });
              setSelectedSquare(null);
              setLegalTargets([]);
              onMove?.(`${move.from}${move.to}`, move.from, move.to);
              return;
            }
          } catch {
            /* illegal */
          }
        }

        // ── Re-select own piece ──
        if (piece?.color === myColor) {
          setSelectedSquare(square);
          const moves = game.moves({ square: square as Square, verbose: true });
          setLegalTargets(moves.map((m) => m.to));
          return;
        }

        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      // ── Select piece ──
      if (piece?.color === myColor && game.turn() === myColor) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as Square, verbose: true });
        setLegalTargets(moves.map((m) => m.to));
      }
    },
    [disabled, game, orientation, selectedSquare, legalTargets, onMove, promotionPending]
  );

  const handlePromotion = (piece: string) => {
    if (!promotionPending) return;
    try {
      const next = new Chess(game.fen());
      const move = next.move({
        from: promotionPending.from,
        to: promotionPending.to,
        promotion: piece,
      });
      if (move) {
        setGame(next);
        setLocalLastMove({ from: promotionPending.from, to: promotionPending.to });
        onMove?.(`${move.from}${move.to}${piece}`, move.from, move.to);
      }
    } catch {
      /* invalid */
    }
    setPromotionPending(null);
  };

  const inCheck = game.inCheck();
  const kingSquare = inCheck
    ? (() => {
        const b = game.board();
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            const sq = b[r][f];
            if (sq?.type === "k" && sq.color === game.turn()) {
              return FILES[f] + (8 - r);
            }
          }
        }
        return null;
      })()
    : null;

  return (
    <div className="flex flex-col w-full max-w-[580px] select-none">
      {/* Board */}
      <div className="relative w-full aspect-square board-shadow rounded-sm overflow-visible">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-sm overflow-hidden">
          {displayRanks.map((rank, rIdx) =>
            displayFiles.map((file, fIdx) => {
              const square = file + rank;
              const piece = game.get(square as Square);
              const fileNum = FILES.indexOf(file);
              const rankNum = parseInt(rank) - 1;
              const isLight = (fileNum + rankNum) % 2 !== 0;
              const isSelected = selectedSquare === square;
              const isLastFrom = effectiveLastMove?.from === square;
              const isLastTo = effectiveLastMove?.to === square;
              const isLegal = legalTargets.includes(square);
              const isCheckSq = square === kingSquare;
              const hasCapture = isLegal && !!piece;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={cn(
                    "relative flex items-center justify-center w-full h-full",
                    !disabled ? "cursor-pointer" : "cursor-default",
                    isLight ? "bg-[#F0D9B5]" : "bg-[#B58863]"
                  )}
                  style={{
                    background: isCheckSq
                      ? `radial-gradient(circle, rgba(220,38,38,0.95) 20%, ${isLight ? "#F0D9B5" : "#B58863"} 80%)`
                      : undefined,
                  }}
                >
                  {/* Last move highlight */}
                  {(isLastFrom || isLastTo) && (
                    <div
                      className="absolute inset-0"
                      style={{ background: "rgba(246,166,35,0.42)", pointerEvents: "none" }}
                    />
                  )}

                  {/* Selected highlight */}
                  {isSelected && (
                    <div
                      className="absolute inset-0"
                      style={{ background: "rgba(20,185,140,0.5)", pointerEvents: "none" }}
                    />
                  )}

                  {/* Legal move dot */}
                  {isLegal && !hasCapture && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-[28%] h-[28%] rounded-full"
                        style={{ background: "rgba(0,0,0,0.20)" }}
                      />
                    </div>
                  )}

                  {/* Legal capture ring */}
                  {hasCapture && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, transparent 65%, rgba(0,0,0,0.18) 65%)`,
                      }}
                    />
                  )}

                  {/* Rank label */}
                  {fIdx === 0 && (
                    <span
                      className={cn(
                        "board-label absolute top-[2px] left-[3px] z-10 pointer-events-none",
                        isLight ? "text-[#B58863]" : "text-[#F0D9B5]"
                      )}
                    >
                      {rank}
                    </span>
                  )}

                  {/* File label */}
                  {rIdx === 7 && (
                    <span
                      className={cn(
                        "board-label absolute bottom-[2px] right-[3px] z-10 pointer-events-none",
                        isLight ? "text-[#B58863]" : "text-[#F0D9B5]"
                      )}
                    >
                      {file}
                    </span>
                  )}

                  {/* Piece */}
                  {piece && (
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center z-20 p-[5%] pointer-events-none",
                        !disabled &&
                          piece.color === (orientation === "white" ? "w" : "b") &&
                          game.turn() === piece.color &&
                          "piece-lift"
                      )}
                    >
                      <ChessPiece
                        color={piece.color}
                        type={piece.type}
                        className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Promotion Dialog */}
        {promotionPending && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-sm backdrop-blur-sm">
            <div className="bg-card border border-card-border rounded-xl p-4 shadow-2xl">
              <p className="text-sm text-muted-foreground mb-3 text-center font-medium">
                Promote pawn
              </p>
              <div className="grid grid-cols-4 gap-2">
                {["q", "r", "b", "n"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePromotion(p)}
                    className="w-14 h-14 rounded-lg border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all"
                  >
                    <ChessPiece
                      color={orientation === "white" ? "w" : "b"}
                      type={p}
                      className="w-10 h-10"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
