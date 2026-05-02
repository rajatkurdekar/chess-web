import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateAiGame, useGetPlatformStats, useGetLeaderboard } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Loader2, Zap, Clock, Hourglass, Bot, Users, Trophy, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const TIME_CONTROLS = [
  { label: "Bullet", sub: "1+0", icon: Zap, initial: 60, inc: 0, color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 hover:border-amber-400/50", iconColor: "text-amber-400", badge: "bg-amber-500/15 text-amber-400" },
  { label: "Bullet", sub: "2+1", icon: Zap, initial: 120, inc: 1, color: "from-orange-500/20 to-red-500/10 border-orange-500/20 hover:border-orange-400/50", iconColor: "text-orange-400", badge: "bg-orange-500/15 text-orange-400" },
  { label: "Blitz", sub: "3+0", icon: Clock, initial: 180, inc: 0, color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/50", iconColor: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-400" },
  { label: "Blitz", sub: "5+0", icon: Clock, initial: 300, inc: 0, color: "from-teal-500/20 to-cyan-500/10 border-teal-500/20 hover:border-teal-400/50", iconColor: "text-teal-400", badge: "bg-teal-500/15 text-teal-400" },
  { label: "Blitz", sub: "5+3", icon: Clock, initial: 300, inc: 3, color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20 hover:border-cyan-400/50", iconColor: "text-cyan-400", badge: "bg-cyan-500/15 text-cyan-400" },
  { label: "Rapid", sub: "10+0", icon: Hourglass, initial: 600, inc: 0, color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20 hover:border-blue-400/50", iconColor: "text-blue-400", badge: "bg-blue-500/15 text-blue-400" },
];

const FEATURES = [
  { icon: Bot, title: "AI Opponent", desc: "Practice against computer intelligence at any skill level", color: "text-emerald-400", bg: "bg-emerald-400/8 border-emerald-400/15" },
  { icon: Users, title: "Live Multiplayer", desc: "Real-time games powered by WebSockets with instant move sync", color: "text-blue-400", bg: "bg-blue-400/8 border-blue-400/15" },
  { icon: TrendingUp, title: "ELO Ratings", desc: "Compete for ranking with the industry-standard ELO system", color: "text-amber-400", bg: "bg-amber-400/8 border-amber-400/15" },
  { icon: Shield, title: "Fair Play", desc: "Anti-cheat monitoring ensures every game is decided by skill", color: "text-rose-400", bg: "bg-rose-400/8 border-rose-400/15" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { player } = useAuth();
  const createAiGame = useCreateAiGame();
  const { data: stats } = useGetPlatformStats();
  const { data: topPlayers } = useGetLeaderboard({ limit: 5 } as any);

  const handlePlay = (tc: typeof TIME_CONTROLS[0]) => {
    if (!player) { setLocation("/auth"); return; }
    createAiGame.mutate({
      data: {
        playerId: player.id,
        playerColor: "random",
        timeControl: { initialSeconds: tc.initial, incrementSeconds: tc.inc, label: `${tc.label} ${tc.sub}` },
        aiDepth: 3,
      }
    }, { onSuccess: (game) => setLocation(`/game/${game.id}`) });
  };

  return (
    <Layout>
      <div className="space-y-12">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#13161F] via-[#0F1219] to-[#0D0F17]">
          <div className="hero-glow absolute inset-0 pointer-events-none" />
          {/* Decorative board grid */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.04] pointer-events-none hidden lg:block"
            style={{ backgroundImage: "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)", backgroundSize: "48px 48px" }} />

          <div className="relative z-10 px-8 py-12 md:py-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
                <span className="text-xs font-semibold text-primary">
                  {stats ? `${stats.activeGames} games live now` : "Live platform"}
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.05] mb-4 text-white">
                Play Chess,<br />
                <span className="gradient-text">Master the Game</span>
              </h1>

              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Challenge players worldwide or sharpen your tactics against our AI.
                Track your ELO, analyse every game, and climb the leaderboard.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-lg shadow-primary/25"
                  onClick={() => handlePlay(TIME_CONTROLS[3])}
                  disabled={createAiGame.isPending}
                >
                  {createAiGame.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting…</>
                    : <>♟ Play Now (5+0)</>}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 font-semibold"
                  onClick={() => setLocation("/play")}
                >
                  More Time Controls
                </Button>
              </div>

              {/* Stats row */}
              {stats && (
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/[0.06]">
                  {[
                    { label: "Players", value: stats.totalPlayers.toLocaleString() },
                    { label: "Games Today", value: stats.gamesPlayedToday.toLocaleString() },
                    { label: "Avg Rating", value: stats.averageRating },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-xl font-bold gradient-text-gold">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Quick Play Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Quick Play</h2>
            <Link href="/play" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              All options →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TIME_CONTROLS.map((tc, i) => {
              const Icon = tc.icon;
              return (
                <button
                  key={i}
                  onClick={() => handlePlay(tc)}
                  disabled={createAiGame.isPending}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50",
                    tc.color
                  )}
                >
                  <Icon className={cn("w-5 h-5 mb-3", tc.iconColor)} />
                  <div className="font-bold text-sm text-foreground">{tc.label}</div>
                  <div className={cn("text-xs font-mono font-bold rounded-md px-1.5 py-0.5 inline-block mt-1", tc.badge)}>
                    {tc.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Two-column: Features + Leaderboard ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Features */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold mb-4">Platform Features</h2>
            <div className="grid grid-cols-1 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                <div key={title} className={cn("flex items-start gap-4 p-4 rounded-xl border", bg)}>
                  <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0", bg)}>
                    <Icon className={cn("w-4.5 h-4.5", color)} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Players */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Top Players</h2>
              <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Full leaderboard →
              </Link>
            </div>
            <Card className="glass-card border-card-border overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-white/[0.05]">
                  {(topPlayers ?? []).slice(0, 5).map((p: any, i: number) => (
                    <Link
                      key={p.playerId}
                      href={`/profile/${p.playerId}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-all group"
                    >
                      <div className="w-7 text-center">
                        {i === 0 ? <span className="text-base">🥇</span>
                          : i === 1 ? <span className="text-base">🥈</span>
                          : i === 2 ? <span className="text-base">🥉</span>
                          : <span className="text-xs font-bold text-muted-foreground">#{p.rank}</span>}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{p.username}</div>
                        <div className="text-[11px] text-muted-foreground">{p.gamesPlayed} games</div>
                      </div>
                      <div className="text-right">
                        <div className="gradient-text-gold font-bold text-sm">{p.rating}</div>
                        <div className="text-[10px] text-muted-foreground">{Math.round((p.winRate ?? 0) * 100)}% win</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
}
