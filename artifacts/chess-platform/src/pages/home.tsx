import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetPlatformStats, useGetLeaderboard } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Users, Trophy, TrendingUp, Shield, Swords, Hash, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FEATURES = [
  {
    icon: Swords,
    title: "Local Duel",
    desc: "Pass the board between friends on the same device — no internet required.",
    color: "text-amber-400",
    bg: "bg-amber-400/8 border-amber-400/15",
    glow: "rgba(245,158,11,0.1)",
  },
  {
    icon: Users,
    title: "Invite via Code",
    desc: "Create a private room, share a 6-char code, and play against a friend anywhere.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/8 border-emerald-400/15",
    glow: "rgba(34,197,94,0.1)",
  },
  {
    icon: TrendingUp,
    title: "ELO Ratings",
    desc: "Compete for ranking with the industry-standard ELO rating system.",
    color: "text-blue-400",
    bg: "bg-blue-400/8 border-blue-400/15",
    glow: "rgba(59,130,246,0.1)",
  },
  {
    icon: Shield,
    title: "Fair Play",
    desc: "Anti-cheat monitoring ensures every game is decided by skill alone.",
    color: "text-rose-400",
    bg: "bg-rose-400/8 border-rose-400/15",
    glow: "rgba(244,63,94,0.1)",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { player } = useAuth();
  const { data: stats } = useGetPlatformStats();
  const { data: topPlayers } = useGetLeaderboard({ limit: 5 } as any);
  const [hoveredMode, setHoveredMode] = useState<"local" | "invite" | null>(null);

  return (
    <Layout>
      <div className="space-y-14">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, #13161F 0%, #0F1219 50%, #0D0F17 100%)" }}>

          {/* Radial glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.07) 0%, transparent 70%)" }} />

          {/* Chess grid decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none hidden lg:block"
            style={{
              backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.015) 0% 25%, transparent 0% 50%)",
              backgroundSize: "48px 48px",
              maskImage: "linear-gradient(to left, rgba(0,0,0,0.7), transparent)",
            }} />

          {/* Large decorative piece */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[200px] leading-none pointer-events-none select-none hidden lg:block"
            style={{ opacity: 0.035, color: "#22C55E" }}>
            ♞
          </div>

          <div className="relative z-10 px-8 py-14 md:py-20">
            <div className="max-w-2xl">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6 text-xs font-semibold"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#22C55E",
                }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
                {stats ? `${stats.activeGames} games live now` : "Live platform"}
              </div>

              <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] mb-5 text-white">
                Play Chess,<br />
                <span className="gradient-text">Master the Game</span>
              </h1>

              <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-lg">
                Challenge friends with an invite code or duel them face-to-face on the same device.
                Track your ELO, analyse every game, and dominate the leaderboard.
              </p>

              {/* Two hero CTAs */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => setLocation("/play")}
                  className="font-bold px-8 shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #22C55E, #10B981)",
                    boxShadow: "0 8px 32px rgba(34,197,94,0.3)",
                    color: "#052e16",
                    border: "none",
                  }}
                >
                  ♟ Play Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 font-semibold"
                  onClick={() => setLocation("/leaderboard")}
                >
                  <Trophy className="w-4 h-4 mr-2 text-amber-400" />
                  Leaderboard
                </Button>
              </div>

              {/* Stats */}
              {stats && (
                <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/[0.06]">
                  {[
                    { label: "Players", value: stats.totalPlayers.toLocaleString() },
                    { label: "Games Today", value: stats.gamesPlayedToday.toLocaleString() },
                    { label: "Avg Rating", value: stats.averageRating },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-2xl font-bold gradient-text-gold">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Play Modes ────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">How to Play</h2>
            <Link href="/play" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              Choose mode <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Local Duel */}
            <button
              onClick={() => setLocation("/play")}
              onMouseEnter={() => setHoveredMode("local")}
              onMouseLeave={() => setHoveredMode(null)}
              className="relative overflow-hidden rounded-xl border text-left transition-all duration-400 p-6 group"
              style={{
                background: hoveredMode === "local"
                  ? "radial-gradient(ellipse at 20% 80%, rgba(245,158,11,0.16), rgba(13,15,23,0.9) 60%)"
                  : "radial-gradient(ellipse at 20% 80%, rgba(245,158,11,0.06), rgba(13,15,23,0.9) 60%)",
                borderColor: hoveredMode === "local" ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.12)",
                boxShadow: hoveredMode === "local" ? "0 0 40px rgba(245,158,11,0.1)" : "none",
                transform: hoveredMode === "local" ? "translateY(-2px)" : "none",
              }}
            >
              <div className="absolute right-4 bottom-2 text-[80px] leading-none select-none pointer-events-none"
                style={{ opacity: 0.05, color: "#F59E0B" }}>♟</div>
              <div className="text-3xl mb-3">♞</div>
              <h3 className="font-display text-xl font-bold text-white mb-1">Local Duel</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pass the board between moves. Play anywhere, no internet needed.
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold"
                style={{ color: "#F59E0B" }}>
                Start local game <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            {/* Invite Duel */}
            <button
              onClick={() => setLocation("/play")}
              onMouseEnter={() => setHoveredMode("invite")}
              onMouseLeave={() => setHoveredMode(null)}
              className="relative overflow-hidden rounded-xl border text-left transition-all duration-400 p-6 group"
              style={{
                background: hoveredMode === "invite"
                  ? "radial-gradient(ellipse at 80% 20%, rgba(34,197,94,0.16), rgba(13,15,23,0.9) 60%)"
                  : "radial-gradient(ellipse at 80% 20%, rgba(34,197,94,0.06), rgba(13,15,23,0.9) 60%)",
                borderColor: hoveredMode === "invite" ? "rgba(34,197,94,0.4)" : "rgba(34,197,94,0.12)",
                boxShadow: hoveredMode === "invite" ? "0 0 40px rgba(34,197,94,0.1)" : "none",
                transform: hoveredMode === "invite" ? "translateY(-2px)" : "none",
              }}
            >
              <div className="absolute right-4 bottom-2 text-[80px] leading-none select-none pointer-events-none"
                style={{ opacity: 0.05, color: "#22C55E" }}>♜</div>
              <div className="text-3xl mb-3">♛</div>
              <h3 className="font-display text-xl font-bold text-white mb-1">Invite to Duel</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate a private room code. Share it. Play in real-time from anywhere.
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold"
                style={{ color: "#22C55E" }}>
                Create room <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </section>

        {/* ── Features + Leaderboard ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Features */}
          <section>
            <h2 className="text-xl font-bold mb-5">Platform Features</h2>
            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title}
                  className={cn("flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-opacity-40", bg)}>
                  <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0", bg)}>
                    <Icon className={cn("w-4 h-4", color)} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Leaderboard preview */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Top Players</h2>
              <Link href="/leaderboard"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                Full leaderboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Card className="glass-card border-card-border overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-white/[0.04]">
                  {(topPlayers ?? []).slice(0, 5).map((p: any, i: number) => (
                    <Link
                      key={p.playerId}
                      href={`/profile/${p.playerId}`}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-all group"
                    >
                      <div className="w-7 text-center flex-shrink-0">
                        {i === 0 ? <span className="text-lg">🥇</span>
                          : i === 1 ? <span className="text-lg">🥈</span>
                          : i === 2 ? <span className="text-lg">🥉</span>
                          : <span className="text-xs font-bold text-muted-foreground font-mono">#{p.rank}</span>}
                      </div>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          background: i === 0 ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.1)",
                          border: i === 0 ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(34,197,94,0.2)",
                          color: i === 0 ? "#F59E0B" : "#22C55E",
                        }}>
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {p.username}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.gamesPlayed} games · {Math.round((p.winRate ?? 0) * 100)}% win
                        </div>
                      </div>
                      <div className="gradient-text-gold font-bold text-base tabular-nums flex-shrink-0">
                        {p.rating}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-white/[0.04]">
                  <Link href="/leaderboard"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    View all players <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
}
