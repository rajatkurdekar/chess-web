import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { cn } from "@/lib/utils";

interface ChessBoardProps {
  fen: string;
  onMove?: (uci: string) => void;
  orientation?: "white" | "black";
  disabled?: boolean;
}

const PIECE_SYMBOLS: Record<string, string> = {
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕", K: "♔",
};

export function ChessBoard({ fen, onMove, orientation = "white", disabled = false }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  useEffect(() => {
    try {
      setGame(new Chess(fen));
      setSelectedSquare(null);
      setLegalMoves([]);
    } catch (e) {
      console.error("Invalid FEN:", fen);
    }
  }, [fen]);

  const board = game.board();
  
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const displayRanks = orientation === "white" ? ranks : [...ranks].reverse();
  const displayFiles = orientation === "white" ? files : [...files].reverse();

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    if (selectedSquare) {
      // Try to move
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: "q", // Always promote to queen for simplicity in this demo
        });
        
        if (move) {
          onMove?.(move.from + move.to + (move.promotion ? move.promotion : ""));
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
      } catch (e) {
        // Invalid move, fall through to selection logic
      }
    }

    // Select piece
    const piece = game.get(square as any);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as any, verbose: true });
      setLegalMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  return (
    <div className="w-full max-w-[600px] aspect-square grid grid-cols-8 grid-rows-8 border-4 border-card-border shadow-2xl rounded-sm overflow-hidden">
      {displayRanks.map((rank, rIdx) => 
        displayFiles.map((file, fIdx) => {
          const square = file + rank;
          const piece = game.get(square as any);
          const isLight = (rIdx + fIdx) % 2 === 0;
          const isSelected = selectedSquare === square;
          const isLegalMove = legalMoves.includes(square);

          return (
            <div
              key={square}
              onClick={() => handleSquareClick(square)}
              className={cn(
                "relative flex items-center justify-center w-full h-full select-none cursor-pointer",
                isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]",
                isSelected && "after:absolute after:inset-0 after:bg-board-highlight",
                isLegalMove && !piece && "after:absolute after:w-1/3 after:h-1/3 after:rounded-full after:bg-black/20",
                isLegalMove && piece && "after:absolute after:inset-0 after:border-4 after:border-black/20 after:rounded-full"
              )}
            >
              {piece && (
                <span 
                  className={cn(
                    "text-[clamp(1rem,8vw,4rem)] leading-none z-10 drop-shadow-md",
                    piece.color === "w" ? "text-white" : "text-black"
                  )}
                  style={{
                    textShadow: piece.color === 'w' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 1px rgba(255,255,255,0.3)',
                    WebkitTextStroke: piece.color === 'w' ? '1px black' : '1px white'
                  }}
                >
                  {PIECE_SYMBOLS[piece.color === "w" ? piece.type.toUpperCase() : piece.type]}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
