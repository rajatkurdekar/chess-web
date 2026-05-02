import { Layout } from "@/components/layout";
import { ChessBoard, CapturedPieces } from "@/components/chess-board";
import { useGetGame } from "@workspace/api-client-react";
import type { Game } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { useGameSocket } from "@/lib/socket";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Flag, BarChart2, Home, AlertTriangle, Handshake, RotateCcw, Wifi, WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Live Clock ───────────────────────────────────────────────────────────────

function Clock({ ms, active }: { ms: number; active: boolean }) {
  const [remaining, setRemaining] = useState(ms);
  const lastTick = useRef(Date.now());
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
      setRemaining((r) => Math.max(0, r - (now - lastTick.current)));
      lastTick.current = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active]);

  const isLow = remaining < 30_000;
  const isVeryLow = remaining < 10_000;
  const min = Math.floor(remaining / 60_000);
  const sec = Math.floor((remaining % 60_000) / 1_000);
  const tenths = Math.floor((remaining % 1_000) / 100);
  const showTenths = remaining < 20_000;

  return (
    <div
      className={cn(
        "font-mono tabular-nums text-2xl font-bold px-4 py-2 rounded-lg border transition-all duration-300 min-w-[90px] text-center",
        active
          ? isVeryLow
            ? "clock-low"
            : isLow
            ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
            : "clock-active"
          : "border-border bg-card/50 text-foreground/50"
      )}
    >
      {min}:{sec.toString().padStart(2, "0")}
      {showTenths && <span className="text-sm opacity-70">.{tenths}</span>}
    </div>
  );
}

// ─── Player Bar ───────────────────────────────────────────────────────────────

function PlayerBar({
  username,
  rating,
  isActive,
  timeMs,
  isBottom,
  captured,
  captureColor,
  advantage,
}: {
  username: string;
  rating?: number | null;
  isActive: boolean;
  timeMs: number;
  isBottom?: boolean;
  captured: string[];
  captureColor: "w" | "b";
  advantage: number;
}) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-3 px-1 max-w-[580px]",
        isBottom ? "mt-2" : "mb-2"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 transition-all",
            isActive
              ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
              : "bg-muted/50 text-foreground/70 border border-border"
          )}
        >
          {(username ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <div className="font-semibold text-sm truncate text-foreground">
              {username ?? "Opponent"}
            </div>
            {rating != null && (
              <span className="text-[11px] text-muted-foreground font-mono flex-shrink-0">
                ({rating})
              </span>
            )}
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary live-dot flex-shrink-0" />
            )}
          </div>
          <CapturedPieces pieces={captured} color={captureColor} advantage={advantage > 0 ? advantage : 0} />
        </div>
      </div>
      <Clock ms={timeMs} active={isActive} />
    </div>
  );
}

// ─── Move List ────────────────────────────────────────────────────────────────

function MoveList({ moves, currentMoveIdx }: { moves: Array<{ san: string; uci: string }>; currentMoveIdx?: number }) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves.length]);

  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div ref={listRef} className="overflow-y-auto flex-1 min-h-0 font-mono text-sm px-1">
      {pairs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
          <span className="text-3xl">♟</span>
          <span className="text-xs">Make the first move</span>
        </div>
      ) : (
        <div className="space-y-0.5">
          {pairs.map(({ num, white, black }) => (
            <div key={num} className="grid grid-cols-[2rem_1fr_1fr] gap-x-1 group">
              <span className="text-muted-foreground/60 text-right text-xs py-1">{num}.</span>
              <span className="px-1.5 py-1 rounded hover:bg-white/5 cursor-default text-foreground/90 font-medium transition-colors">
                {white.san}
              </span>
              {black ? (
                <span className="px-1.5 py-1 rounded hover:bg-white/5 cursor-default text-foreground/80 transition-colors">
                  {black.san}
                </span>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Game-Over Overlay ────────────────────────────────────────────────────────

function GameOverOverlay({
  game,
  isWhitePlayer,
  isSpectator,
  onAnalyze,
  onHome,
}: {
  game: Game;
  isWhitePlayer: boolean;
  isSpectator: boolean;
  onAnalyze: () => void;
  onHome: () => void;
}) {
  const myColor = isWhitePlayer ? "white" : "black";
  const drew = game.result === "draw";
  const won = !isSpectator && game.result === myColor;

  const emoji = drew ? "🤝" : isSpectator ? "♟" : won ? "🏆" : "💔";
  const headline = drew ? "Draw" : isSpectator ? "Game Over" : won ? "Victory!" : "Defeat";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-sm z-50 backdrop-blur-md bg-black/65">
      <div className="text-center space-y-3 p-6">
        <div className="text-6xl mb-2">{emoji}</div>
        <div className="font-display text-3xl font-bold text-white">
          {headline}
        </div>
        <div className="text-base text-white/70 capitalize">
          {game.result === "white"
            ? `${game.whiteUsername} wins`
            : game.result === "black"
            ? `${game.blackUsername ?? "Opponent"} wins`
            : "½–½"}
        </div>
        {game.resultReason && (
          <div className="text-sm text-white/50 capitalize bg-white/5 rounded-full px-3 py-1 inline-block">
            {game.resultReason?.replace(/_/g, " ")}
          </div>
        )}
        <div className="flex gap-2 justify-center pt-2">
          <Button
            size="sm"
            onClick={onAnalyze}
            className="bg-primary hover:bg-primary/90 font-semibold"
          >
            <BarChart2 className="w-4 h-4 mr-1.5" /> Analyse
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onHome}
            className="border-white/20 hover:bg-white/10 text-white"
          >
            <Home className="w-4 h-4 mr-1.5" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fenTurn(fen: string): "white" | "black" {
  return fen.split(" ")[1] === "w" ? "white" : "black";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GamePage() {
  const [, params] = useRoute("/game/:id");
  const gameId = params?.id;
  const { player } = useAuth();
  const [, setLocation] = useLocation();
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gameDetail } = useGetGame(gameId || "", { query: { enabled: !!gameId } } as any);
  const {
    gameState,
    makeMove,
    resign,
    drawOffer,
    drawAccept,
    drawDecline,
    drawOfferFrom,
    connected,
    moves: socketMoves,
  } = useGameSocket(gameId, player?.id);

  const baseGame = gameDetail?.game;
  const game: Game | undefined = gameState ?? baseGame;
  const movesToShow =
    socketMoves.length > 0 ? socketMoves : (gameDetail?.moves ?? []);

  const handleResign = useCallback(() => {
    if (!showResignConfirm) {
      setShowResignConfirm(true);
      return;
    }
    resign();
    setShowResignConfirm(false);
  }, [showResignConfirm, resign]);

  if (!game) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading game…</p>
        </div>
      </Layout>
    );
  }

  const isWhitePlayer = player?.id === game.whitePlayerId;
  const isBlackPlayer = player?.id === game.blackPlayerId;
  const isSpectator = !isWhitePlayer && !isBlackPlayer;
  const orientation = "white" as const;
  const currentTurn = fenTurn(game.fen);
  const isMyTurn =
    game.status === "active" &&
    ((currentTurn === "white" && isWhitePlayer) ||
      (currentTurn === "black" && isBlackPlayer));
  const isGameOver = game.status === "finished" || game.status === "aborted";

  const whiteTimeMs = game.whiteTimeMs ?? game.timeControl.initialSeconds * 1000;
  const blackTimeMs = game.blackTimeMs ?? game.timeControl.initialSeconds * 1000;

  const topName =
    orientation === "white"
      ? game.blackUsername ?? "Opponent"
      : game.whiteUsername;
  const topRating =
    orientation === "white" ? game.blackRating : game.whiteRating;
  const topTimeMs = orientation === "white" ? blackTimeMs : whiteTimeMs;
  const topActive =
    !isGameOver &&
    (orientation === "white" ? currentTurn === "black" : currentTurn === "white");

  const botName =
    orientation === "white"
      ? game.whiteUsername
      : game.blackUsername ?? "Opponent";
  const botRating =
    orientation === "white" ? game.whiteRating : game.blackRating;
  const botTimeMs = orientation === "white" ? whiteTimeMs : blackTimeMs;
  const botActive =
    !isGameOver &&
    (orientation === "white" ? currentTurn === "white" : currentTurn === "black");

  const lastMove =
    movesToShow.length > 0
      ? {
          from: movesToShow[movesToShow.length - 1].uci.slice(0, 2),
          to: movesToShow[movesToShow.length - 1].uci.slice(2, 4),
        }
      : null;

  // Which color did what: white captured black pieces, black captured white pieces
  const topCaptured = orientation === "white" ? capturedBlack : capturedWhite;
  const topCaptureColor: "w" | "b" = orientation === "white" ? "b" : "w";
  const topAdvantage = orientation === "white"
    ? capturedBlack.reduce((s, p) => s + ({ p: 1, n: 3, b: 3, r: 5, q: 9 }[p] ?? 0), 0) -
      capturedWhite.reduce((s, p) => s + ({ p: 1, n: 3, b: 3, r: 5, q: 9 }[p] ?? 0), 0)
    : capturedWhite.reduce((s, p) => s + ({ p: 1, n: 3, b: 3, r: 5, q: 9 }[p] ?? 0), 0) -
      capturedBlack.reduce((s, p) => s + ({ p: 1, n: 3, b: 3, r: 5, q: 9 }[p] ?? 0), 0);

  const botCaptured = orientation === "white" ? capturedWhite : capturedBlack;
  const botCaptureColor: "w" | "b" = orientation === "white" ? "w" : "b";
  const botAdvantage = -topAdvantage;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 max-w-5xl mx-auto">

        {/* ── Left: Board ── */}
        <div className="flex flex-col items-center">
          <PlayerBar
            username={topName}
            rating={topRating}
            isActive={topActive}
            timeMs={topTimeMs}
            captured={topCaptured}
            captureColor={topCaptureColor}
            advantage={topAdvantage}
          />

          <div className="relative w-full max-w-[580px]">
            <ChessBoard
              fen={game.fen}
              orientation={orientation}
              playerColor={isWhitePlayer ? "w" : isBlackPlayer ? "b" : undefined}
              onMove={(uci) => makeMove(uci)}
              disabled={!isMyTurn || isGameOver}
              lastMove={lastMove}
              onCapturedUpdate={(wc, bc) => {
                setCapturedWhite(wc);
                setCapturedBlack(bc);
              }}
            />
            {isGameOver && (
              <GameOverOverlay
                game={game}
                isWhitePlayer={isWhitePlayer}
                isSpectator={isSpectator}
                onAnalyze={() => setLocation(`/analysis/${gameId}`)}
                onHome={() => setLocation("/")}
              />
            )}
          </div>

          <PlayerBar
            username={botName}
            rating={botRating}
            isActive={botActive}
            timeMs={botTimeMs}
            isBottom
            captured={botCaptured}
            captureColor={botCaptureColor}
            advantage={botAdvantage}
          />

          {/* Mobile controls */}
          {!isGameOver && !isSpectator && (
            <div className="flex gap-2 mt-3 lg:hidden w-full max-w-[580px]">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleResign}
              >
                <Flag className="w-3.5 h-3.5 mr-1.5" />
                {showResignConfirm ? "Confirm Resign" : "Resign"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => drawOffer()}
              >
                <Handshake className="w-3.5 h-3.5 mr-1.5" /> Draw
              </Button>
            </div>
          )}
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Connection + game info */}
          <Card className="glass-card border-card-border">
            <CardContent className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connected ? (
                    <Wifi className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-destructive" />
                  )}
                  <span className="text-xs font-semibold text-muted-foreground">
                    {connected ? "Live" : "Reconnecting…"}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] capitalize",
                    isGameOver
                      ? "border-muted text-muted-foreground"
                      : "border-primary/30 text-primary bg-primary/5"
                  )}
                >
                  {isGameOver
                    ? game.result ?? "over"
                    : isMyTurn
                    ? "Your turn"
                    : "Waiting"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/30 rounded-lg p-2">
                  <div className="text-muted-foreground">Time Control</div>
                  <div className="font-bold text-foreground mt-0.5">
                    {game.timeControl?.label ?? "—"}
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <div className="text-muted-foreground">Move</div>
                  <div className="font-bold text-foreground mt-0.5">
                    {movesToShow.length > 0
                      ? Math.ceil(movesToShow.length / 2)
                      : "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Move list */}
          <Card
            className="glass-card border-card-border flex-1 overflow-hidden"
            style={{ minHeight: 200, maxHeight: 360 }}
          >
            <CardContent className="p-3 flex flex-col h-full gap-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-shrink-0">
                Moves
              </h4>
              <MoveList moves={movesToShow} />
            </CardContent>
          </Card>

          {/* Draw offer notification */}
          {drawOfferFrom && drawOfferFrom !== player?.id && !isGameOver && (
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-yellow-300">
                <Handshake className="w-3.5 h-3.5" /> Opponent offers a draw
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-xs h-8 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-200 border border-yellow-400/30"
                  onClick={drawAccept}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-8 border-border hover:bg-white/5"
                  onClick={drawDecline}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* Controls */}
          {!isGameOver && !isSpectator && (
            <div className="hidden lg:flex flex-col gap-2">
              {showResignConfirm ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
                    <AlertTriangle className="w-3.5 h-3.5" /> Resign this game?
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 text-xs h-8"
                      onClick={handleResign}
                    >
                      Yes, resign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => setShowResignConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40 text-xs"
                    onClick={handleResign}
                  >
                    <Flag className="w-3.5 h-3.5 mr-1.5" /> Resign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground border-border hover:bg-white/5 text-xs"
                    onClick={() => drawOffer()}
                  >
                    <Handshake className="w-3.5 h-3.5 mr-1.5" /> Draw
                  </Button>
                </div>
              )}
            </div>
          )}

          {isGameOver && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={() => setLocation(`/analysis/${gameId}`)}
              >
                <BarChart2 className="w-4 h-4 mr-1.5" /> Analyse Game
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-white/5"
                onClick={() => setLocation("/play")}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Play Again
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setLocation("/")}
              >
                <Home className="w-3.5 h-3.5 mr-1.5" /> Home
              </Button>
            </div>
          )}

          {isSpectator && !isGameOver && (
            <div className="rounded-xl border border-border bg-muted/20 p-3 text-center text-xs text-muted-foreground">
              👁 Spectating
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
