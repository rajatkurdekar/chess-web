import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useGetPlatformStats, useGetLeaderboard } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Users, Trophy, TrendingUp, Shield, Swords, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FEATURES = [
  {
    icon: Swords,
    title: "Local Duel",
    desc: "Two players. One board. Pass the device between moves — no internet required.",
    color: "#C9A84C",
    colorAlpha: "rgba(201,168,76,",
  },
  {
    icon: Users,
    title: "Invite to Duel",
    desc: "Create a private room, share a 6-character code, play in real-time from anywhere.",
    color: "#10B981",
    colorAlpha: "rgba(16,185,129,",
  },
  {
    icon: TrendingUp,
    title: "ELO Rankings",
    desc: "Every game counts. Climb the leaderboard with the industry-standard rating system.",
    color: "#818CF8",
    colorAlpha: "rgba(129,140,248,",
  },
  {
    icon: Shield,
    title: "Fair Play",
    desc: "Human vs Human only. No engines. No bots. Pure chess decided by intellect alone.",
    color: "#F87171",
    colorAlpha: "rgba(248,113,113,",
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
      <div className="space-y-16">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO                                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-2xl min-h-[520px] flex items-center"
          style={{
            background: "#060810",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.6)",
          }}>

          {/* Chess board photography background */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              opacity: 0.18,
            }} />

          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, rgba(6,8,16,1) 0%, rgba(6,8,16,0.96) 35%, rgba(6,8,16,0.75) 65%, rgba(6,8,16,0.4) 100%)",
            }} />

          {/* Emerald glow top-left */}
          <div className="absolute top-0 left-0 w-2/3 h-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 60% at 0% 30%, rgba(16,185,129,0.06) 0%, transparent 70%)",
            }} />

          {/* Gold glow bottom-right */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 80% at 100% 100%, rgba(201,168,76,0.08) 0%, transparent 70%)",
            }} />

          {/* Chess grid overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none hidden lg:block"
            style={{
              backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.018) 0% 25%, transparent 0% 50%)",
              backgroundSize: "52px 52px",
              maskImage: "linear-gradient(to left, rgba(0,0,0,0.5), transparent)",
            }} />

          {/* Floating chess piece watermark */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden xl:block float-anim"
            style={{
              fontSize: "280px",
              lineHeight: 1,
              opacity: 0.025,
              color: "#C9A84C",
              fontFamily: "serif",
            }}>
            ♛
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 md:px-12 py-16 md:py-20 w-full">
            <div className="max-w-2xl">

              {/* Live status badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-7 text-xs font-semibold"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.22)",
                  color: "#10B981",
                  backdropFilter: "blur(8px)",
                }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
                {stats ? `${stats.activeGames} live games in progress` : "Platform live"}
                <span className="w-px h-3 bg-primary/30" />
                <Zap className="w-3 h-3" />
                <span className="text-primary/70">Real-time</span>
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
                  Where
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight gradient-text-gold mt-1">
                  Champions
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mt-1"
                  style={{ color: "rgba(226,232,244,0.9)" }}>
                  Are Forged
                </span>
              </h1>

              <p className="text-[#7A8799] text-lg md:text-xl mb-10 leading-relaxed max-w-lg"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                Challenge rivals with a private invite code or duel side-by-side. Track your ELO,
                analyse every move, and rise through the ranks.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-12">
                <button
                  onClick={() => setLocation("/play")}
                  className="btn-gold flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold"
                  style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }}
                >
                  ♟ Play Now
                </button>
                {!player && (
                  <button
                    onClick={() => setLocation("/auth")}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#C4CFDF",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setLocation("/leaderboard")}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#C4CFDF",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Trophy className="w-4 h-4 text-accent" />
                  Leaderboard
                </button>
              </div>

              {/* Stats */}
              {stats && (
                <div className="flex items-center gap-8 pt-7"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {[
                    { label: "Registered Players", value: stats.totalPlayers.toLocaleString() },
                    { label: "Games Today", value: stats.gamesPlayedToday.toLocaleString() },
                    { label: "Avg ELO Rating", value: String(stats.averageRating) },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-2xl md:text-3xl font-black gradient-text-gold stat-glow tabular-nums"
                        style={{ fontFamily: "'Cinzel', serif" }}>
                        {s.value}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PLAY MODES                                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
                Choose Your Battle
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Two warriors. One board. Your rules.</p>
            </div>
            <Link href="/play" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              All modes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Local Duel */}
            <button
              onClick={() => setLocation("/play")}
              onMouseEnter={() => setHoveredMode("local")}
              onMouseLeave={() => setHoveredMode(null)}
              className="relative overflow-hidden rounded-2xl text-left transition-all duration-500 focus:outline-none group"
              style={{
                background: hoveredMode === "local"
                  ? "radial-gradient(ellipse at 25% 75%, rgba(201,168,76,0.20) 0%, rgba(6,8,16,0.97) 65%)"
                  : "radial-gradient(ellipse at 25% 75%, rgba(201,168,76,0.09) 0%, rgba(6,8,16,0.97) 65%)",
                border: hoveredMode === "local" ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(201,168,76,0.14)",
                boxShadow: hoveredMode === "local"
                  ? "0 0 60px rgba(201,168,76,0.12), 0 0 120px rgba(201,168,76,0.05), inset 0 1px 0 rgba(201,168,76,0.1)"
                  : "inset 0 1px 0 rgba(201,168,76,0.05)",
                transform: hoveredMode === "local" ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
              }}
            >
              <div className="absolute right-3 bottom-0 text-[160px] leading-none select-none pointer-events-none"
                style={{ opacity: hoveredMode === "local" ? 0.06 : 0.03, transition: "opacity 0.5s", color: "#C9A84C" }}>♟</div>
              <div className="relative p-8 space-y-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.06))",
                    border: "1px solid rgba(201,168,76,0.3)",
                    boxShadow: hoveredMode === "local" ? "0 0 32px rgba(201,168,76,0.25)" : "none",
                    transition: "box-shadow 0.4s",
                  }}>♞</div>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                      Local Duel
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.22)" }}>
                      Same Device
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Two players share one screen. Pass the board between moves. No internet required — just two minds and a board.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Pass & Play", "Offline Ready", "Custom Names", "Timed or Free"].map(f => (
                    <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(201,168,76,0.07)", color: "rgba(201,168,76,0.65)", border: "1px solid rgba(201,168,76,0.12)" }}>
                      {f}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-sm" style={{ color: "#C9A84C" }}>Start local battle</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(201,168,76,0.18)",
                      transform: hoveredMode === "local" ? "translateX(5px)" : "translateX(0)",
                      transition: "transform 0.3s ease",
                    }}>
                    <ArrowRight className="w-3 h-3" style={{ color: "#C9A84C" }} />
                  </div>
                </div>
              </div>
            </button>

            {/* Invite Duel */}
            <button
              onClick={() => setLocation("/play")}
              onMouseEnter={() => setHoveredMode("invite")}
              onMouseLeave={() => setHoveredMode(null)}
              className="relative overflow-hidden rounded-2xl text-left transition-all duration-500 focus:outline-none group"
              style={{
                background: hoveredMode === "invite"
                  ? "radial-gradient(ellipse at 75% 25%, rgba(16,185,129,0.20) 0%, rgba(6,8,16,0.97) 65%)"
                  : "radial-gradient(ellipse at 75% 25%, rgba(16,185,129,0.09) 0%, rgba(6,8,16,0.97) 65%)",
                border: hoveredMode === "invite" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(16,185,129,0.14)",
                boxShadow: hoveredMode === "invite"
                  ? "0 0 60px rgba(16,185,129,0.12), 0 0 120px rgba(16,185,129,0.05), inset 0 1px 0 rgba(16,185,129,0.1)"
                  : "inset 0 1px 0 rgba(16,185,129,0.05)",
                transform: hoveredMode === "invite" ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
              }}
            >
              <div className="absolute left-3 bottom-0 text-[160px] leading-none select-none pointer-events-none"
                style={{ opacity: hoveredMode === "invite" ? 0.06 : 0.03, transition: "opacity 0.5s", color: "#10B981" }}>♜</div>
              <div className="relative p-8 space-y-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.06))",
                    border: "1px solid rgba(16,185,129,0.3)",
                    boxShadow: hoveredMode === "invite" ? "0 0 32px rgba(16,185,129,0.25)" : "none",
                    transition: "box-shadow 0.4s",
                  }}>♛</div>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                      Invite to Duel
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.22)" }}>
                      Online
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Generate a private room code. Share it with your rival. Play from anywhere in the world, in real-time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Unique Room Code", "Shareable Link", "Real-time Sync", "Private Game"].map(f => (
                    <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(16,185,129,0.07)", color: "rgba(16,185,129,0.65)", border: "1px solid rgba(16,185,129,0.12)" }}>
                      {f}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-sm" style={{ color: "#10B981" }}>Create private room</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.18)",
                      transform: hoveredMode === "invite" ? "translateX(5px)" : "translateX(0)",
                      transition: "transform 0.3s ease",
                    }}>
                    <ArrowRight className="w-3 h-3" style={{ color: "#10B981" }} />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FEATURES + TOP PLAYERS                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Features — 3 cols */}
          <section className="lg:col-span-3">
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
              Platform Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc, color, colorAlpha }) => (
                <div key={title}
                  className="group p-5 rounded-2xl transition-all duration-300 card-hover"
                  style={{
                    background: `${colorAlpha}0.05)`,
                    border: `1px solid ${colorAlpha}0.12)`,
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${colorAlpha}0.12)`,
                      border: `1px solid ${colorAlpha}0.2)`,
                    }}>
                    <Icon className="w-4.5 h-4.5" style={{ color, width: "18px", height: "18px" }} />
                  </div>
                  <div className="font-semibold text-sm text-foreground mb-1.5">{title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Players — 2 cols */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>Top Players</h2>
              <Link href="/leaderboard"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Full table <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(12,14,26,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
              }}>
              <div className="divide-y divide-white/[0.04]">
                {(topPlayers ?? []).slice(0, 5).map((p: any, i: number) => (
                  <Link
                    key={p.playerId}
                    href={`/profile/${p.playerId}`}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] transition-all group cursor-pointer"
                  >
                    <div className="w-6 text-center flex-shrink-0">
                      {i === 0 ? <span className="text-base">🥇</span>
                        : i === 1 ? <span className="text-base">🥈</span>
                        : i === 2 ? <span className="text-base">🥉</span>
                        : <span className="text-xs font-bold text-muted-foreground font-mono">#{p.rank}</span>}
                    </div>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={
                        i === 0
                          ? { background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }
                          : i === 1
                          ? { background: "rgba(192,192,192,0.12)", border: "1px solid rgba(192,192,192,0.25)", color: "#D0D0D0" }
                          : i === 2
                          ? { background: "rgba(205,127,50,0.12)", border: "1px solid rgba(205,127,50,0.25)", color: "#CD7F32" }
                          : { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)", color: "#10B981" }
                      }>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {p.username}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.gamesPlayed}g · {Math.round((p.winRate ?? 0) * 100)}% W
                      </div>
                    </div>
                    <div className="gradient-text-gold font-black text-base tabular-nums flex-shrink-0"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.rating}
                    </div>
                  </Link>
                ))}
              </div>
              {(topPlayers ?? []).length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  <div className="text-3xl mb-2 opacity-20">♞</div>
                  Be the first on the board
                </div>
              )}
              <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <Link href="/leaderboard"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
                  View all rankings <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* BOTTOM CTA BANNER                                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-2xl px-8 md:px-14 py-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,8,16,0.9) 40%, rgba(201,168,76,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.012) 0% 25%, transparent 0% 50%)",
              backgroundSize: "48px 48px",
              opacity: 0.5,
            }} />
          <div className="relative z-10">
            <div className="text-4xl mb-4 opacity-60">♔</div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
              Ready to Prove Your Worth?
            </h2>
            <p className="text-muted-foreground mb-7 max-w-md mx-auto text-sm">
              No AI. No bots. Just two humans and 64 squares. Your rating awaits.
            </p>
            <button
              onClick={() => setLocation(player ? "/play" : "/auth")}
              className="btn-gold inline-flex items-center gap-2.5 px-10 py-3.5 rounded-xl text-sm font-bold"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.04em" }}
            >
              ♟ {player ? "Play Now" : "Join ChessForge"}
            </button>
          </div>
        </section>

      </div>
    </Layout>
  );
}
