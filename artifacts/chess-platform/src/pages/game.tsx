import { Layout } from "@/components/layout";
import { ChessBoard } from "@/components/chess-board";
import { useGetGame } from "@workspace/api-client-react";
import type { Game } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { useGameSocket } from "@/lib/socket";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { Flag, BarChart2, Home, AlertTriangle } from "lucide-react";

function Clock({ ms, active }: { ms: number; active: boolean }) {
  const [remaining, setRemaining] = useState(ms);
  const lastTick = useRef<number>(Date.now());
  const raf = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(ms);
    lastTick.current = Date.now();
  }, [ms]);

  useEffect(() => {
    if (!active) {
      if (raf.current) cancelAnimationFrame(raf.current);
      return;
    }
    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastTick.current;
      lastTick.current = now;
      setRemaining((r) => Math.max(0, r - elapsed));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active]);

  const totalSec = Math.ceil(remaining / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const isLow = remaining < 30000;

  return (
    <span className={`text-2xl font-mono tabular-nums px-4 py-1 rounded border ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"} ${isLow && active ? "text-red-400 border-red-400/60 bg-red-400/10 animate-pulse" : ""}`}>
      {min}:{sec.toString().padStart(2, "0")}
    </span>
  );
}

function PlayerRow({ username, rating, isActive, timeMs, isBottom }: { username: string; rating?: number | null; isActive: boolean; timeMs: number; isBottom?: boolean }) {
  return (
    <div className="w-full flex justify-between items-center px-2 max-w-[600px]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-lg ${isBottom ? "bg-primary/20 text-primary border border-primary/50" : "bg-muted text-foreground border border-border"}`}>
          {(username ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold">{username ?? "Opponent"}</div>
          {rating != null && <div className="text-xs text-muted-foreground">{rating}</div>}
        </div>
        {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse ml-1" />}
      </div>
      <Clock ms={timeMs} active={isActive} />
    </div>
  );
}

function fenTurn(fen: string): "white" | "black" {
  return fen.split(" ")[1] === "w" ? "white" : "black";
}

export default function GamePage() {
  const [, params] = useRoute("/game/:id");
  const gameId = params?.id;
  const { player } = useAuth();
  const [, setLocation] = useLocation();
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gameDetail } = useGetGame(gameId || "", { query: { enabled: !!gameId } } as any);
  const { gameState, makeMove, resign, connected, moves: socketMoves } = useGameSocket(gameId, player?.id);

  const baseGame: Game | undefined = gameDetail?.game;
  const game: Game | undefined = gameState ?? baseGame;
  const socketMoveList = socketMoves;

  const handleResign = useCallback(() => {
    if (!showResignConfirm) { setShowResignConfirm(true); return; }
    resign();
    setShowResignConfirm(false);
  }, [showResignConfirm, resign]);

  if (!game) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </Layout>
    );
  }

  const isWhitePlayer = player?.id === game.whitePlayerId;
  const isBlackPlayer = player?.id === game.blackPlayerId;
  const orientation = isBlackPlayer ? "black" : "white";
  const currentTurn = fenTurn(game.fen);
  const isMyTurn = game.status === "active" && (
    (currentTurn === "white" && isWhitePlayer) ||
    (currentTurn === "black" && isBlackPlayer)
  );
  const isGameOver = game.status === "finished" || game.status === "aborted";

  const whiteTimeMs = game.whiteTimeMs ?? (game.timeControl.initialSeconds * 1000);
  const blackTimeMs = game.blackTimeMs ?? (game.timeControl.initialSeconds * 1000);

  const topUsername = orientation === "white" ? (game.blackUsername ?? "Opponent") : game.whiteUsername;
  const topRating = orientation === "white" ? game.blackRating : game.whiteRating;
  const topTimeMs = orientation === "white" ? blackTimeMs : whiteTimeMs;
  const topActive = game.status === "active" && (orientation === "white" ? currentTurn === "black" : currentTurn === "white");

  const botUsername = orientation === "white" ? game.whiteUsername : (game.blackUsername ?? "Opponent");
  const botRating = orientation === "white" ? game.whiteRating : game.blackRating;
  const botTimeMs = orientation === "white" ? whiteTimeMs : blackTimeMs;
  const botActive = game.status === "active" && (orientation === "white" ? currentTurn === "white" : currentTurn === "black");

  const resultText = isGameOver
    ? game.result === "draw" ? "½-½ Draw" :
      game.result === "white" ? `1-0 · ${game.whiteUsername} wins` :
      game.result === "black" ? `0-1 · ${game.blackUsername ?? "Opponent"} wins` : "Game Over"
    : null;

  const movesToShow = socketMoveList.length > 0 ? socketMoveList : (gameDetail?.moves ?? []);

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-2 flex flex-col items-center gap-3">
          <PlayerRow username={topUsername} rating={topRating} isActive={topActive} timeMs={topTimeMs} />

          <div className="relative w-full max-w-[600px]">
            <ChessBoard
              fen={game.fen}
              orientation={orientation}
              onMove={makeMove}
              disabled={!isMyTurn || isGameOver}
            />

            {isGameOver && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded gap-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl mb-2">{game.result === "draw" ? "🤝" : game.result === (isWhitePlayer ? "white" : "black") ? "🏆" : "😔"}</div>
                  <div className="text-2xl font-bold text-white">{resultText}</div>
                  <div className="text-muted-foreground capitalize mt-1">{game.resultReason}</div>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => setLocation(`/analysis/${gameId}`)}>
                    <BarChart2 className="w-4 h-4 mr-2" /> Analyze
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setLocation("/")}>
                    <Home className="w-4 h-4 mr-2" /> Home
                  </Button>
                </div>
              </div>
            )}
          </div>

          <PlayerRow username={botUsername} rating={botRating} isActive={botActive} timeMs={botTimeMs} isBottom />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Game</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                  <Badge variant={connected ? "outline" : "destructive"} className="text-xs">
                    {connected ? "Live" : "Offline"}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Time Control</span>
                <span className="font-medium text-foreground">{game.timeControl?.label ?? "—"}</span>
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Status</span>
                <Badge variant="outline" className="capitalize text-xs">
                  {isGameOver ? (game.result ?? "Over") : "Active"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm mb-2 px-1">Moves</h4>
              <div className="max-h-80 overflow-y-auto font-mono text-sm">
                {movesToShow.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-xs">No moves yet</p>
                ) : (
                  <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-x-1 gap-y-0.5">
                    {movesToShow.filter((_, i) => i % 2 === 0).map((_, pairIdx) => {
                      const w = movesToShow[pairIdx * 2];
                      const b = movesToShow[pairIdx * 2 + 1];
                      return (
                        <>
                          <span key={`n-${pairIdx}`} className="text-muted-foreground text-right text-xs py-0.5">{pairIdx + 1}.</span>
                          <span key={`w-${pairIdx}`} className="px-1 py-0.5 rounded hover:bg-muted/40 cursor-default">{w.san}</span>
                          {b ? <span key={`b-${pairIdx}`} className="px-1 py-0.5 rounded hover:bg-muted/40 cursor-default">{b.san}</span> : <span key={`be-${pairIdx}`} />}
                        </>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!isGameOver && (isWhitePlayer || isBlackPlayer) && (
            <div className="space-y-2">
              {showResignConfirm ? (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="w-4 h-4" /> Resign this game?
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" className="flex-1" onClick={handleResign}>Yes, resign</Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowResignConfirm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleResign}>
                  <Flag className="w-4 h-4 mr-2" /> Resign
                </Button>
              )}
            </div>
          )}

          {isGameOver && (
            <div className="flex flex-col gap-2">
              <Button onClick={() => setLocation(`/analysis/${gameId}`)}>
                <BarChart2 className="w-4 h-4 mr-2" /> Analyze Game
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")}>
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
