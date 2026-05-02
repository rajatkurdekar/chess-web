import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChessBoard } from "@/components/chess-board";
import { useGetGame } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Chess } from "chess.js";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Home } from "lucide-react";

export default function Analysis() {
  const [, params] = useRoute("/analysis/:id");
  const gameId = params?.id ?? "";
  const [, setLocation] = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gameDetail } = useGetGame(gameId, { query: { enabled: !!gameId } } as any);

  const game = gameDetail?.game;
  const moves = gameDetail?.moves ?? [];

  const [cursor, setCursor] = useState<number>(-1);

  const positions = useMemo(() => {
    if (!moves || moves.length === 0) return [];
    const chess = new Chess();
    const fens: string[] = [chess.fen()];
    for (const move of moves) {
      try {
        chess.move(move.uci ?? move.san ?? "");
        fens.push(chess.fen());
      } catch {
        break;
      }
    }
    return fens;
  }, [moves]);

  const currentIndex = cursor === -1 ? positions.length - 1 : cursor;
  const currentFen = positions[currentIndex] ?? game?.fen ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const goToStart = () => setCursor(0);
  const goToPrev = () => setCursor(Math.max(0, currentIndex - 1));
  const goToNext = () => {
    const next = Math.min(positions.length - 1, currentIndex + 1);
    setCursor(next === positions.length - 1 ? -1 : next);
  };
  const goToEnd = () => setCursor(-1);

  if (!game) {
    return (
      <Layout>
        <div className="flex justify-center py-20 text-muted-foreground">Loading analysis...</div>
      </Layout>
    );
  }

  const resultLabel = game.result === "white" ? `${game.whiteUsername} wins` :
    game.result === "black" ? `${game.blackUsername ?? "Black"} wins` :
    game.result === "draw" ? "Draw" : "In progress";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-center max-w-[600px]">
            <div>
              <h2 className="font-bold text-lg">{game.whiteUsername} vs {game.blackUsername ?? "AI"}</h2>
              <p className="text-sm text-muted-foreground">{game.timeControl?.label} · {resultLabel}</p>
            </div>
            <Badge variant="outline" className="capitalize">{game.status}</Badge>
          </div>

          <ChessBoard fen={currentFen} disabled orientation="white" />

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToStart} disabled={currentIndex === 0}>
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToPrev} disabled={currentIndex === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-20 text-center">
              Move {currentIndex} / {Math.max(0, positions.length - 1)}
            </span>
            <Button variant="outline" size="icon" onClick={goToNext} disabled={currentIndex >= positions.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToEnd} disabled={cursor === -1}>
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Game Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">White</span>
                <span className="font-medium">{game.whiteUsername} ({game.whiteRating})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Black</span>
                <span className="font-medium">{game.blackUsername ?? "AI"} ({game.blackRating ?? "—"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Control</span>
                <span className="font-medium">{game.timeControl?.label ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Result</span>
                <Badge variant="outline" className="capitalize">{game.result ?? "—"}</Badge>
              </div>
              {game.resultReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="font-medium capitalize">{game.resultReason}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Move List</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="max-h-80 overflow-y-auto font-mono text-sm">
                {moves.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No moves recorded</p>
                ) : (
                  <div className="grid grid-cols-[2rem_1fr_1fr] gap-x-2 gap-y-0.5">
                    {moves.filter((_, i) => i % 2 === 0).map((_, pairIdx) => {
                      const w = moves[pairIdx * 2];
                      const b = moves[pairIdx * 2 + 1];
                      const wMoveIdx = pairIdx * 2 + 1;
                      const bMoveIdx = pairIdx * 2 + 2;
                      return (
                        <>
                          <span key={`n-${pairIdx}`} className="text-muted-foreground text-right pr-1">{pairIdx + 1}.</span>
                          <button
                            key={`w-${pairIdx}`}
                            onClick={() => setCursor(wMoveIdx)}
                            className={`text-left px-1 rounded ${currentIndex === wMoveIdx ? "bg-primary/20 text-primary" : "hover:bg-muted/40"}`}
                          >
                            {w.san}
                          </button>
                          {b ? (
                            <button
                              key={`b-${pairIdx}`}
                              onClick={() => setCursor(bMoveIdx)}
                              className={`text-left px-1 rounded ${currentIndex === bMoveIdx ? "bg-primary/20 text-primary" : "hover:bg-muted/40"}`}
                            >
                              {b.san}
                            </button>
                          ) : <span key={`be-${pairIdx}`} />}
                        </>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}
