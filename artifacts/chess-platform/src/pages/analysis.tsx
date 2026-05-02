import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChessBoard } from "@/components/chess-board";
import { useGetGame } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Chess } from "chess.js";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Home, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Evaluation helpers ───────────────────────────────────────────────────────

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3.2, r: 5, q: 9 };

function evalPosition(fen: string): number {
  const chess = new Chess(fen);
  const board = chess.board();
  let score = 0;
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue;
      const v = PIECE_VALUES[sq.type] ?? 0;
      score += sq.color === "w" ? v : -v;
    }
  }
  if (chess.isCheckmate()) score = chess.turn() === "w" ? -99 : 99;
  return score;
}

function evalToBar(score: number): number {
  // Returns 0-100, 50 = equal, >50 = white advantage
  const clamped = Math.max(-10, Math.min(10, score));
  return 50 + (clamped / 10) * 45;
}

type MoveQuality = "brilliant" | "excellent" | "good" | "inaccuracy" | "mistake" | "blunder" | null;

function getMoveQuality(scoreBefore: number, scoreAfter: number, color: "w" | "b"): MoveQuality {
  // Positive delta = better for the player who just moved
  const delta = color === "w" ? (scoreAfter - scoreBefore) : (scoreBefore - scoreAfter);
  if (delta >= 1.5) return "brilliant";
  if (delta >= 0) return "excellent";
  if (delta >= -0.3) return "good";
  if (delta >= -1) return "inaccuracy";
  if (delta >= -2) return "mistake";
  return "blunder";
}

const QUALITY_LABEL: Record<string, string> = {
  brilliant: "!!", excellent: "!", good: "✓",
  inaccuracy: "?!", mistake: "?", blunder: "??",
};
const QUALITY_CLASS: Record<string, string> = {
  brilliant: "move-brilliant", excellent: "move-excellent", good: "move-good",
  inaccuracy: "move-inaccuracy", mistake: "move-mistake", blunder: "move-blunder",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function Analysis() {
  const [, params] = useRoute("/analysis/:id");
  const gameId = params?.id ?? "";
  const [, setLocation] = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gameDetail } = useGetGame(gameId, { query: { enabled: !!gameId } } as any);
  const game = gameDetail?.game;
  const moves = gameDetail?.moves ?? [];
  const [cursor, setCursor] = useState(-1);

  const { positions, evals, qualities } = useMemo(() => {
    if (moves.length === 0) return { positions: [], evals: [], qualities: [] };
    const chess = new Chess();
    const fens: string[] = [chess.fen()];
    const evs: number[] = [evalPosition(chess.fen())];
    const quals: (MoveQuality)[] = [null];
    for (const move of moves) {
      const prevScore = evs[evs.length - 1];
      try {
        chess.move(move.uci ?? move.san);
        const fen = chess.fen();
        const score = evalPosition(fen);
        const movedColor = chess.turn() === "w" ? "b" : "w"; // after move, turn flipped
        fens.push(fen);
        evs.push(score);
        quals.push(getMoveQuality(prevScore, score, movedColor));
      } catch { break; }
    }
    return { positions: fens, evals: evs, qualities: quals };
  }, [moves]);

  const currentIndex = cursor === -1 ? Math.max(0, positions.length - 1) : cursor;
  const currentFen = positions[currentIndex] ?? game?.fen ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const currentEval = evals[currentIndex] ?? 0;
  const barPct = evalToBar(currentEval);
  const isWhiteAhead = currentEval > 0;

  const goToStart = () => setCursor(0);
  const goToPrev = () => setCursor(Math.max(0, currentIndex - 1));
  const goToNext = () => {
    const next = currentIndex + 1;
    if (next >= positions.length) return;
    setCursor(next === positions.length - 1 ? -1 : next);
  };
  const goToEnd = () => setCursor(-1);

  if (!game) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading analysis…</p>
        </div>
      </Layout>
    );
  }

  const resultLabel = game.result === "white" ? `${game.whiteUsername} wins`
    : game.result === "black" ? `${game.blackUsername ?? "Black"} wins`
    : game.result === "draw" ? "Draw" : "In progress";

  const pairs: Array<{ num: number; white: typeof moves[0]; black?: typeof moves[0]; wQ: MoveQuality; bQ: MoveQuality }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: i / 2 + 1, white: moves[i], black: moves[i + 1], wQ: qualities[i + 1] ?? null, bQ: qualities[i + 2] ?? null });
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr_280px] gap-5">

        {/* ── Evaluation Bar (vertical) ── */}
        <div className="hidden lg:flex flex-col items-center w-6">
          <div className="flex-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden relative border border-white/10" style={{ minHeight: 400 }}>
            {/* Black side (top) */}
            <div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-zinc-700 to-zinc-800 eval-bar transition-all"
              style={{ height: `${100 - barPct}%` }}
            />
            {/* White side (bottom) */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-100 to-stone-200 eval-bar transition-all"
              style={{ height: `${barPct}%` }}
            />
            {/* Score label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "text-[10px] font-bold font-mono rotate-90",
                isWhiteAhead ? "text-zinc-800" : "text-stone-200"
              )}>
                {Math.abs(currentEval) < 0.1 ? "=" : `${isWhiteAhead ? "+" : "−"}${Math.abs(currentEval).toFixed(1)}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Board ── */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-full flex justify-between items-start max-w-[580px]">
            <div>
              <h2 className="font-bold text-base text-foreground">
                {game.whiteUsername} <span className="text-muted-foreground font-normal text-sm">vs</span> {game.blackUsername ?? "AI"}
              </h2>
              <p className="text-xs text-muted-foreground">{game.timeControl?.label} · {resultLabel}</p>
            </div>
            <Badge variant="outline" className="capitalize text-xs">{game.status}</Badge>
          </div>

          <ChessBoard fen={currentFen} disabled orientation="white" />

          {/* Navigation */}
          <div className="flex items-center gap-1.5 w-full max-w-[580px] justify-center">
            <Button variant="outline" size="icon" className="h-8 w-8 border-border hover:bg-white/5" onClick={goToStart} disabled={currentIndex === 0}>
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-border hover:bg-white/5" onClick={goToPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center text-xs text-muted-foreground font-mono">
              {currentIndex === 0 ? "Start" : `Move ${currentIndex} / ${positions.length - 1}`}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 border-border hover:bg-white/5" onClick={goToNext} disabled={currentIndex >= positions.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-border hover:bg-white/5" onClick={goToEnd} disabled={cursor === -1}>
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-3">

          {/* Game info */}
          <Card className="glass-card border-card-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Game Info</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2 text-xs">
              {[
                { label: "White", value: `${game.whiteUsername} (${game.whiteRating})` },
                { label: "Black", value: `${game.blackUsername ?? "AI"} (${game.blackRating ?? "—"})` },
                { label: "Time", value: game.timeControl?.label ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground text-right">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Result</span>
                <Badge variant="outline" className="capitalize text-[10px] h-5">
                  {game.result === "white" ? "1–0" : game.result === "black" ? "0–1" : game.result === "draw" ? "½–½" : "—"}
                </Badge>
              </div>
              {game.resultReason && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="font-medium capitalize">{game.resultReason}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Move list with quality indicators */}
          <Card className="glass-card border-card-border flex-1 overflow-hidden" style={{ maxHeight: 400 }}>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Move List</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3 overflow-y-auto" style={{ maxHeight: 340 }}>
              {moves.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-xs">No moves recorded</p>
              ) : (
                <div className="font-mono text-sm space-y-0.5">
                  {pairs.map(({ num, white, black, wQ, bQ }) => {
                    const wIdx = (num - 1) * 2 + 1;
                    const bIdx = (num - 1) * 2 + 2;
                    return (
                      <div key={num} className="grid grid-cols-[1.5rem_1fr_1fr] gap-x-1">
                        <span className="text-muted-foreground/60 text-right text-xs py-0.5">{num}.</span>
                        <button
                          onClick={() => setCursor(wIdx)}
                          className={cn(
                            "text-left px-1.5 py-0.5 rounded text-xs transition-colors flex items-center gap-0.5",
                            currentIndex === wIdx ? "bg-primary/15 text-primary" : "hover:bg-white/5 text-foreground/80"
                          )}
                        >
                          {white.san}
                          {wQ && wQ !== "good" && wQ !== "excellent" && (
                            <span className={cn("text-[10px] font-bold", QUALITY_CLASS[wQ])}>{QUALITY_LABEL[wQ]}</span>
                          )}
                        </button>
                        {black ? (
                          <button
                            onClick={() => setCursor(bIdx)}
                            className={cn(
                              "text-left px-1.5 py-0.5 rounded text-xs transition-colors flex items-center gap-0.5",
                              currentIndex === bIdx ? "bg-primary/15 text-primary" : "hover:bg-white/5 text-foreground/70"
                            )}
                          >
                            {black.san}
                            {bQ && bQ !== "good" && bQ !== "excellent" && (
                              <span className={cn("text-[10px] font-bold", QUALITY_CLASS[bQ])}>{QUALITY_LABEL[bQ]}</span>
                            )}
                          </button>
                        ) : <span />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="glass-card border-card-border">
            <CardContent className="px-3 py-2.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                {[
                  ["!!", "Brilliant", "move-brilliant"],
                  ["!", "Excellent", "move-excellent"],
                  ["✓", "Good", "move-good"],
                  ["?!", "Inaccuracy", "move-inaccuracy"],
                  ["?", "Mistake", "move-mistake"],
                  ["??", "Blunder", "move-blunder"],
                ].map(([sym, label, cls]) => (
                  <div key={label} className="flex items-center gap-1">
                    <span className={cn("font-bold w-4", cls)}>{sym}</span>
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 border-border hover:bg-white/5 text-xs" onClick={() => setLocation("/play")}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Rematch
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => setLocation("/")}>
              <Home className="w-3.5 h-3.5 mr-1.5" /> Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
