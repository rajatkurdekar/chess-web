import { logger } from "./logger.js";

interface MoveAudit {
  gameId: string;
  playerId: string;
  moveNumber: number;
  thinkingTimeMs: number;
  fen: string;
  uci: string;
  isAiGame: boolean;
}

interface AuditResult {
  suspicious: boolean;
  flags: string[];
  riskScore: number;
}

// Per-game move timing history for pattern analysis
const gameTimingHistory = new Map<string, number[]>();

const MIN_HUMAN_MOVE_MS = 80;     // Absolute floor – no human can move faster
const INSTANT_SERIES_THRESHOLD = 500; // ms – "instant" move
const INSTANT_SERIES_COUNT = 5;   // N consecutive instant moves = flag
const MOVE_RATE_WINDOW_MS = 10_000; // 10-second window
const MAX_MOVES_PER_WINDOW = 12;   // Maximum human moves in 10 seconds

export function auditMove(audit: MoveAudit): AuditResult {
  if (audit.isAiGame) {
    // AI games — only flag impossible-speed moves
    if (audit.thinkingTimeMs < MIN_HUMAN_MOVE_MS && audit.moveNumber > 3) {
      return {
        suspicious: true,
        flags: ["impossible_speed_ai_game"],
        riskScore: 30,
      };
    }
    return { suspicious: false, flags: [], riskScore: 0 };
  }

  const flags: string[] = [];
  let riskScore = 0;

  // ── Flag 1: Impossibly fast move ─────────────────────────────────────────
  if (audit.thinkingTimeMs < MIN_HUMAN_MOVE_MS && audit.moveNumber > 1) {
    flags.push("impossible_speed");
    riskScore += 40;
  }

  // ── Flag 2: Series of very fast moves ────────────────────────────────────
  const history = gameTimingHistory.get(audit.gameId) ?? [];
  history.push(audit.thinkingTimeMs);
  if (history.length > 30) history.shift(); // keep last 30 moves
  gameTimingHistory.set(audit.gameId, history);

  if (history.length >= INSTANT_SERIES_COUNT) {
    const lastN = history.slice(-INSTANT_SERIES_COUNT);
    const allInstant = lastN.every(t => t < INSTANT_SERIES_THRESHOLD);
    if (allInstant) {
      flags.push("instant_series");
      riskScore += 30;
    }
  }

  // ── Flag 3: Move rate too high ────────────────────────────────────────────
  const windowMoves = history.filter(t => t < MOVE_RATE_WINDOW_MS).length;
  if (windowMoves > MAX_MOVES_PER_WINDOW) {
    flags.push("high_move_rate");
    riskScore += 20;
  }

  // ── Flag 4: Suspiciously consistent thinking times ────────────────────────
  if (history.length >= 10) {
    const recentTimes = history.slice(-10);
    const avg = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
    const variance = recentTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / recentTimes.length;
    const stdDev = Math.sqrt(variance);
    // Extremely consistent sub-1s moves (engine-like pattern)
    if (avg < 1000 && stdDev < 50 && history.length >= 10) {
      flags.push("robotic_consistency");
      riskScore += 25;
    }
  }

  const suspicious = riskScore >= 40;

  if (suspicious) {
    logger.warn(
      { gameId: audit.gameId, playerId: audit.playerId, flags, riskScore, moveNumber: audit.moveNumber },
      "Anti-cheat: suspicious move pattern detected"
    );
  }

  return { suspicious, flags, riskScore };
}

export function clearGameHistory(gameId: string): void {
  gameTimingHistory.delete(gameId);
}

export function getGameRiskSummary(gameId: string): {
  totalMoves: number;
  avgThinkingMs: number;
  fastMoveCount: number;
} {
  const history = gameTimingHistory.get(gameId) ?? [];
  if (history.length === 0) return { totalMoves: 0, avgThinkingMs: 0, fastMoveCount: 0 };

  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const fastCount = history.filter(t => t < INSTANT_SERIES_THRESHOLD).length;
  return { totalMoves: history.length, avgThinkingMs: Math.round(avg), fastMoveCount: fastCount };
}
