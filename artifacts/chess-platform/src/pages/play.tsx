import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import { ChessBoard } from "@/components/chess-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateRoom } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "wouter";
import { Chess } from "chess.js";
import { cn } from "@/lib/utils";
import {
  Copy, Check, ArrowLeft, Flag, RotateCcw, Clock,
  Zap, Hourglass, Loader2, Swords, Hash, Crown,
  Users, Link as LinkIcon, Infinity as InfinityIcon,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Mode = "select" | "local-setup" | "local-game" | "room";

interface LocalState {
  fen: string;
  activeColor: "white" | "black";
  whiteMs: number;
  blackMs: number;
  timeChoiceMs: number;
  moves: string[];
  gameOver: { result: "white" | "black" | "draw"; reason: string } | null;
  whiteName: string;
  blackName: string;
}

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const TIME_OPTIONS = [
  { label: "No limit",  ms: 0,       Icon: InfinityIcon },
  { label: "3 min",     ms: 180_000, Icon: Zap          },
  { label: "5 min",     ms: 300_000, Icon: Clock        },
  { label: "10 min",    ms: 600_000, Icon: Clock        },
  { label: "30 min",    ms: 1_800_000, Icon: Hourglass  },
];

// ─── Clock Display ─────────────────────────────────────────────────────────────
function ClockDisplay({ ms, active, unlimited }: { ms: number; active: boolean; unlimited: boolean }) {
  if (unlimited) {
    return (
      <div className={cn(
        "font-mono text-xl font-bold px-3 py-1.5 rounded-lg border transition-all",
        active ? "border-primary/50 text-primary bg-primary/10" : "border-border text-muted-foreground bg-card/50"
      )}>∞</div>
    );
  }
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  const t = Math.floor((ms % 1_000) / 100);
  const isLow = ms < 30_000;
  const isVeryLow = ms < 10_000;
  return (
    <div className={cn(
      "font-mono tabular-nums text-xl font-bold px-3 py-1.5 rounded-lg border transition-all duration-300",
      active ? isVeryLow ? "clock-low" : isLow ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "clock-active"
             : "border-border text-foreground/50 bg-card/50"
    )}>
      {m}:{s.toString().padStart(2, "0")}
      {ms < 20_000 && active && <span className="text-sm opacity-60">.{t}</span>}
    </div>
  );
}

// ─── Local Game Player Bar ─────────────────────────────────────────────────────
function LocalPlayerBar({
  name, color, active, ms, unlimited, isTop,
}: {
  name: string; color: "white" | "black"; active: boolean;
  ms: number; unlimited: boolean; isTop?: boolean;
}) {
  return (
    <div className={cn(
      "w-full max-w-[580px] flex items-center justify-between px-1",
      isTop ? "mb-2" : "mt-2"
    )}>
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "w-8 h-8 rounded-md border-2 flex items-center justify-center text-xs font-bold transition-all",
          color === "white"
            ? "bg-white text-zinc-900 border-zinc-300"
            : "bg-zinc-900 text-white border-zinc-600",
          active && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(34,197,94,0.3)]"
        )}>
          {color === "white" ? "♔" : "♚"}
        </div>
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className={cn(
            "text-[10px] font-medium uppercase tracking-wider",
            color === "white" ? "text-stone-400" : "text-zinc-500"
          )}>
            {color === "white" ? "White" : "Black"}
          </div>
        </div>
        {active && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
        )}
      </div>
      <ClockDisplay ms={ms} active={active} unlimited={unlimited} />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function Play() {
  const { player } = useAuth();
  const [, setLocation] = useLocation();
  const createRoom = useCreateRoom();

  const [mode, setMode] = useState<Mode>("select");
  const [whiteName, setWhiteName] = useState("Player 1");
  const [blackName, setBlackName] = useState("Player 2");
  const [timeChoice, setTimeChoice] = useState(300_000);
  const [hoveredCard, setHoveredCard] = useState<"local" | "room" | null>(null);

  // Room state
  const [roomInfo, setRoomInfo] = useState<{ gameId: string; roomCode: string; inviteUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Local game state
  const [local, setLocal] = useState<LocalState | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(Date.now());

  // ── Clock tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!local || local.gameOver || local.timeChoiceMs === 0) return;

    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      setLocal(prev => {
        if (!prev || prev.gameOver || prev.timeChoiceMs === 0) return prev;
        if (prev.activeColor === "white") {
          const next = Math.max(0, prev.whiteMs - elapsed);
          if (next === 0) return { ...prev, whiteMs: 0, gameOver: { result: "black", reason: "timeout" } };
          return { ...prev, whiteMs: next };
        } else {
          const next = Math.max(0, prev.blackMs - elapsed);
          if (next === 0) return { ...prev, blackMs: 0, gameOver: { result: "white", reason: "timeout" } };
          return { ...prev, blackMs: next };
        }
      });
    }, 100);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [local?.gameOver, local?.activeColor, local?.timeChoiceMs, mode]);

  // ── Start local game ────────────────────────────────────────────────────────
  const startLocalGame = useCallback(() => {
    setLocal({
      fen: INITIAL_FEN,
      activeColor: "white",
      whiteMs: timeChoice,
      blackMs: timeChoice,
      timeChoiceMs: timeChoice,
      moves: [],
      gameOver: null,
      whiteName: whiteName.trim() || "Player 1",
      blackName: blackName.trim() || "Player 2",
    });
    setMode("local-game");
  }, [whiteName, blackName, timeChoice]);

  // ── Handle local move ───────────────────────────────────────────────────────
  const handleLocalMove = useCallback((uci: string) => {
    setLocal(prev => {
      if (!prev || prev.gameOver) return prev;
      try {
        const chess = new Chess(prev.fen);
        chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined });
        const newFen = chess.fen();
        const newColor: "white" | "black" = chess.turn() === "w" ? "white" : "black";

        let gameOver: LocalState["gameOver"] = null;
        if (chess.isCheckmate()) {
          gameOver = { result: newColor === "white" ? "black" : "white", reason: "checkmate" };
        } else if (chess.isStalemate()) {
          gameOver = { result: "draw", reason: "stalemate" };
        } else if (chess.isDraw()) {
          gameOver = { result: "draw", reason: "draw" };
        }

        return {
          ...prev,
          fen: newFen,
          activeColor: newColor,
          moves: [...prev.moves, uci],
          gameOver,
        };
      } catch {
        return prev;
      }
    });
  }, []);

  // ── Create room ──────────────────────────────────────────────────────────────
  const handleCreateRoom = () => {
    createRoom.mutate({
      data: {
        playerId: player?.id ?? "guest",
        playerColor: "white",
        timeControl: { initialSeconds: 300, incrementSeconds: 0, label: "Blitz 5+0" },
      },
    }, {
      onSuccess: (res) => {
        setRoomInfo({ gameId: res.game.id, roomCode: res.roomCode, inviteUrl: res.inviteUrl });
      },
    });
  };

  const handleCopy = useCallback(() => {
    if (!roomInfo) return;
    navigator.clipboard.writeText(roomInfo.inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [roomInfo]);

  // ─────────────────────────────────────────────────────────────────────────────
  //  SCREEN: MODE SELECT
  // ─────────────────────────────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Hero text */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-primary mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
              Choose your battle
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">
              How do you <span className="gradient-text">want to play?</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Two warriors, one board. Your rules.
            </p>
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* ── Local Duel Card ── */}
            <button
              onClick={() => setMode("local-setup")}
              onMouseEnter={() => setHoveredCard("local")}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative overflow-hidden rounded-2xl border text-left transition-all duration-500 focus:outline-none"
              style={{
                background: hoveredCard === "local"
                  ? "radial-gradient(ellipse at 30% 70%, rgba(245,158,11,0.18) 0%, rgba(13,15,23,0.95) 60%)"
                  : "radial-gradient(ellipse at 30% 70%, rgba(245,158,11,0.08) 0%, rgba(13,15,23,0.95) 60%)",
                borderColor: hoveredCard === "local" ? "rgba(245,158,11,0.45)" : "rgba(245,158,11,0.15)",
                boxShadow: hoveredCard === "local"
                  ? "0 0 60px rgba(245,158,11,0.15), 0 0 120px rgba(245,158,11,0.06), inset 0 1px 0 rgba(245,158,11,0.12)"
                  : "inset 0 1px 0 rgba(245,158,11,0.06)",
                transform: hoveredCard === "local" ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
              }}
            >
              {/* Watermark piece */}
              <div className="absolute right-4 top-4 text-[140px] leading-none select-none pointer-events-none"
                style={{ opacity: hoveredCard === "local" ? 0.07 : 0.04, transition: "opacity 0.5s", color: "#F59E0B" }}>
                ♟
              </div>

              {/* Diagonal shine */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 50%)",
                  opacity: hoveredCard === "local" ? 1 : 0,
                  transition: "opacity 0.4s",
                }} />

              <div className="relative p-7 space-y-5">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))",
                    border: "1px solid rgba(245,158,11,0.3)",
                    boxShadow: hoveredCard === "local" ? "0 0 24px rgba(245,158,11,0.2)" : "none",
                    transition: "box-shadow 0.4s",
                  }}>
                  ♞
                </div>

                {/* Labels */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-2xl font-bold text-white">Local Duel</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}>
                      Same device
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Two players, one screen. Pass the board between moves and let the best mind win.
                  </p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {["Pass & Play", "Offline", "Custom names", "Timed or free"].map(f => (
                    <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(245,158,11,0.08)", color: "rgba(245,158,11,0.7)", border: "1px solid rgba(245,158,11,0.12)" }}>
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-sm"
                    style={{ color: "#F59E0B" }}>
                    Start local battle
                  </span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300"
                    style={{
                      background: "rgba(245,158,11,0.2)",
                      transform: hoveredCard === "local" ? "translateX(4px)" : "translateX(0)",
                    }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5h6M6 3l2 2-2 2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* ── Room Invite Card ── */}
            <button
              onClick={() => {
                setMode("room");
                handleCreateRoom();
              }}
              onMouseEnter={() => setHoveredCard("room")}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative overflow-hidden rounded-2xl border text-left transition-all duration-500 focus:outline-none"
              style={{
                background: hoveredCard === "room"
                  ? "radial-gradient(ellipse at 70% 30%, rgba(34,197,94,0.18) 0%, rgba(13,15,23,0.95) 60%)"
                  : "radial-gradient(ellipse at 70% 30%, rgba(34,197,94,0.08) 0%, rgba(13,15,23,0.95) 60%)",
                borderColor: hoveredCard === "room" ? "rgba(34,197,94,0.45)" : "rgba(34,197,94,0.15)",
                boxShadow: hoveredCard === "room"
                  ? "0 0 60px rgba(34,197,94,0.15), 0 0 120px rgba(34,197,94,0.06), inset 0 1px 0 rgba(34,197,94,0.12)"
                  : "inset 0 1px 0 rgba(34,197,94,0.06)",
                transform: hoveredCard === "room" ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
              }}
            >
              {/* Watermark */}
              <div className="absolute left-4 bottom-4 text-[140px] leading-none select-none pointer-events-none"
                style={{ opacity: hoveredCard === "room" ? 0.07 : 0.04, transition: "opacity 0.5s", color: "#22C55E" }}>
                ♜
              </div>

              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(225deg, rgba(34,197,94,0.04) 0%, transparent 50%)",
                  opacity: hoveredCard === "room" ? 1 : 0,
                  transition: "opacity 0.4s",
                }} />

              <div className="relative p-7 space-y-5">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))",
                    border: "1px solid rgba(34,197,94,0.3)",
                    boxShadow: hoveredCard === "room" ? "0 0 24px rgba(34,197,94,0.2)" : "none",
                    transition: "box-shadow 0.4s",
                  }}>
                  ♛
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-2xl font-bold text-white">Invite to Duel</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.25)" }}>
                      Online
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Generate a private room code. Share it with your friend and play from anywhere in real-time.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Unique room code", "Shareable link", "Real-time sync", "Private game"].map(f => (
                    <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(34,197,94,0.08)", color: "rgba(34,197,94,0.7)", border: "1px solid rgba(34,197,94,0.12)" }}>
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-sm" style={{ color: "#22C55E" }}>
                    Create private room
                  </span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300"
                    style={{
                      background: "rgba(34,197,94,0.2)",
                      transform: hoveredCard === "room" ? "translateX(4px)" : "translateX(0)",
                    }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5h6M6 3l2 2-2 2" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs text-muted-foreground/50 mt-8">
            No AI. No bots. Pure human chess.
          </p>
        </div>
      </Layout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  SCREEN: LOCAL SETUP
  // ─────────────────────────────────────────────────────────────────────────────
  if (mode === "local-setup") {
    return (
      <Layout>
        <div className="max-w-lg mx-auto space-y-8">
          <button
            onClick={() => setMode("select")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="space-y-2">
            <h1 className="font-display text-4xl font-bold text-white">
              Local <span style={{ color: "#F59E0B" }}>Duel</span>
            </h1>
            <p className="text-muted-foreground">Customise your game, then pass the board.</p>
          </div>

          {/* Player names */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Players</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-400 flex items-center gap-1.5">
                  <span className="text-base">♔</span> White
                </label>
                <Input
                  value={whiteName}
                  onChange={e => setWhiteName(e.target.value)}
                  placeholder="Player 1"
                  maxLength={20}
                  className="bg-muted/30 border-border focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <span className="text-base">♚</span> Black
                </label>
                <Input
                  value={blackName}
                  onChange={e => setBlackName(e.target.value)}
                  placeholder="Player 2"
                  maxLength={20}
                  className="bg-muted/30 border-border focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>

          {/* Time control */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Control</h3>
            <div className="grid grid-cols-5 gap-2">
              {TIME_OPTIONS.map(({ label, ms, Icon }) => (
                <button
                  key={ms}
                  onClick={() => setTimeChoice(ms)}
                  className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all"
                  style={{
                    background: timeChoice === ms ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.02)",
                    borderColor: timeChoice === ms ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.08)",
                    boxShadow: timeChoice === ms ? "0 0 20px rgba(245,158,11,0.1)" : "none",
                  }}
                >
                  <Icon className="w-4 h-4"
                    style={{ color: timeChoice === ms ? "#F59E0B" : "rgba(255,255,255,0.4)" }} />
                  <span className="text-[11px] font-bold leading-tight"
                    style={{ color: timeChoice === ms ? "#F59E0B" : "rgba(255,255,255,0.5)" }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button
            onClick={startLocalGame}
            className="w-full h-14 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.9), rgba(234,88,12,0.9))",
              boxShadow: "0 8px 32px rgba(245,158,11,0.25), 0 0 0 1px rgba(245,158,11,0.3)",
              color: "#fff",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.boxShadow = "0 12px 40px rgba(245,158,11,0.4), 0 0 0 1px rgba(245,158,11,0.5)"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.boxShadow = "0 8px 32px rgba(245,158,11,0.25), 0 0 0 1px rgba(245,158,11,0.3)"; }}
          >
            <span className="text-xl">♟</span>
            Start Battle
          </button>
        </div>
      </Layout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  SCREEN: LOCAL GAME
  // ─────────────────────────────────────────────────────────────────────────────
  if (mode === "local-game" && local) {
    const unlimited = local.timeChoiceMs === 0;
    const isPlayable = !local.gameOver;

    const lastMove = local.moves.length > 0 ? {
      from: local.moves[local.moves.length - 1].slice(0, 2),
      to: local.moves[local.moves.length - 1].slice(2, 4),
    } : null;

    return (
      <Layout>
        <div className="flex flex-col items-center max-w-[620px] mx-auto">
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-4">
            <button
              onClick={() => { setMode("select"); setLocal(null); if (timerRef.current) clearInterval(timerRef.current); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Exit
            </button>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 live-dot" />
              <span className="text-xs font-semibold text-amber-400">Local Duel</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {Math.ceil(local.moves.length / 2)} moves
            </div>
          </div>

          {/* Black player bar (top) */}
          <LocalPlayerBar
            name={local.blackName} color="black"
            active={local.activeColor === "black"}
            ms={local.blackMs} unlimited={unlimited} isTop
          />

          <div className="relative w-full max-w-[580px]">
            <ChessBoard
              fen={local.fen}
              orientation="white"
              onMove={handleLocalMove}
              disabled={!isPlayable}
              lastMove={lastMove}
            />

            {/* Game over overlay */}
            {local.gameOver && (
              <div className="absolute inset-0 rounded-sm flex items-center justify-center z-50"
                style={{ backdropFilter: "blur(20px)", background: "rgba(13,15,23,0.90)" }}>
                <div className="text-center space-y-5 p-8">
                  <div className="text-7xl">
                    {local.gameOver.result === "draw" ? "🤝" : local.gameOver.result === "white" ? "♔" : "♚"}
                  </div>
                  <div>
                    <div className="font-display text-4xl font-bold text-white mb-2">
                      {local.gameOver.result === "draw" ? "Draw!" : (
                        local.gameOver.result === "white" ? local.whiteName : local.blackName
                      ) + " wins!"}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize px-3 py-1 rounded-full inline-block"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {local.gameOver.reason.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => { setLocal(null); setMode("local-setup"); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}
                    >
                      <RotateCcw className="w-4 h-4" /> Rematch
                    </button>
                    <button
                      onClick={() => { setLocal(null); setMode("select"); if (timerRef.current) clearInterval(timerRef.current); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* White player bar (bottom) */}
          <LocalPlayerBar
            name={local.whiteName} color="white"
            active={local.activeColor === "white"}
            ms={local.whiteMs} unlimited={unlimited}
          />

          {/* Resign */}
          {!local.gameOver && (
            <div className="mt-4">
              <button
                onClick={() => {
                  const loser = local.activeColor;
                  setLocal(prev => prev ? { ...prev, gameOver: { result: loser === "white" ? "black" : "white", reason: "resignation" } } : prev);
                }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
              >
                <Flag className="w-3 h-3" /> Resign ({local.activeColor === "white" ? local.whiteName : local.blackName})
              </button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  SCREEN: ROOM
  // ─────────────────────────────────────────────────────────────────────────────
  if (mode === "room") {
    return (
      <Layout>
        <div className="max-w-md mx-auto space-y-8">
          <button
            onClick={() => { setMode("select"); setRoomInfo(null); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="space-y-1">
            <h1 className="font-display text-4xl font-bold text-white">
              Invite to <span className="gradient-text">Duel</span>
            </h1>
            <p className="text-muted-foreground">Share your room code or link.</p>
          </div>

          {/* Room display */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "rgba(34,197,94,0.2)", background: "rgba(13,15,23,0.8)" }}>

            {!roomInfo ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 border-4 rounded-full animate-spin"
                  style={{ borderColor: "rgba(34,197,94,0.2)", borderTopColor: "#22C55E" }} />
                <div className="text-sm text-muted-foreground">Creating your room…</div>
              </div>
            ) : (
              <div className="p-8 space-y-8">
                {/* Code display */}
                <div className="text-center space-y-3">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Room Code
                  </div>

                  {/* Dramatic code block */}
                  <div className="relative inline-flex items-center justify-center">
                    {/* Glow backdrop */}
                    <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
                      style={{ background: "radial-gradient(circle, #22C55E, transparent 70%)" }} />
                    <div className="relative font-mono font-black tracking-[0.4em] text-5xl px-6 py-4 rounded-2xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))",
                        border: "1px solid rgba(34,197,94,0.3)",
                        color: "#22C55E",
                        textShadow: "0 0 30px rgba(34,197,94,0.4)",
                        letterSpacing: "0.35em",
                      }}>
                      {roomInfo.roomCode}
                    </div>
                  </div>

                  {/* Individual char boxes */}
                  <div className="flex justify-center gap-1.5 mt-2">
                    {roomInfo.roomCode.split("").map((ch, i) => (
                      <div key={i} className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
                        style={{
                          background: "rgba(34,197,94,0.08)",
                          border: "1px solid rgba(34,197,94,0.2)",
                          color: "#6EE7B7",
                        }}>
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <span className="text-xs text-muted-foreground">or share link</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>

                {/* Invite URL */}
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2.5 rounded-xl text-xs font-mono truncate"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.5)",
                    }}>
                    {roomInfo.inviteUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
                    style={{
                      background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                      border: copied ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.1)",
                      color: copied ? "#22C55E" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setLocation(`/game/${roomInfo.gameId}`)}
                    className="w-full h-12 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #22C55E, #10B981)",
                      boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                      color: "#052e16",
                    }}
                  >
                    <Users className="w-4 h-4" />
                    Enter Room & Wait for Opponent
                  </button>

                  <button
                    onClick={() => { setRoomInfo(null); handleCreateRoom(); }}
                    className="w-full h-10 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Generate new code
                  </button>
                </div>

                <p className="text-center text-xs text-muted-foreground/50">
                  Room expires when both players leave · Private & secure
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}
