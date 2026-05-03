import { Layout } from "@/components/layout";
import { useGetPlatformStats, useGetLeaderboard } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Users, Trophy, TrendingUp, Shield, Swords, ArrowRight, Zap } from "lucide-react";
import { ParticleField } from "@/components/effects/particle-field";
import { SplitText, LineReveal } from "@/components/effects/split-text";
import { CountUp } from "@/components/effects/count-up";
import { TiltCard } from "@/components/effects/tilt-card";
import { MagneticBtn } from "@/components/effects/magnetic-btn";
import { ScrollReveal, StaggerReveal } from "@/components/effects/scroll-reveal";
import { Marquee } from "@/components/effects/marquee";
import { motion } from "framer-motion";
import { useState } from "react";

const CHESS_TERMS = [
  "Checkmate", "En Passant", "Castling", "Gambit", "Blitz",
  "Endgame", "Fork", "Pin", "Skewer", "Zwischenzug", "Zugzwang",
  "Fianchetto", "Brilliancy", "Sacrifice", "Initiative",
];

const FEATURES = [
  {
    icon: Swords,
    title: "Local Duel",
    desc: "Two players. One screen. Pass the device between moves — no internet required.",
    color: "#C9A84C",
    ca: "rgba(201,168,76,",
  },
  {
    icon: Users,
    title: "Invite to Duel",
    desc: "Generate a private room code. Share it with a rival. Play in real-time from anywhere on the globe.",
    color: "#10B981",
    ca: "rgba(16,185,129,",
  },
  {
    icon: TrendingUp,
    title: "ELO Rankings",
    desc: "Every game shapes your rating. Climb the ladder with the industry-standard ELO system.",
    color: "#818CF8",
    ca: "rgba(129,140,248,",
  },
  {
    icon: Shield,
    title: "Fair Play",
    desc: "Human vs Human only. No engines. No bots. Chess decided purely by intellect and nerve.",
    color: "#F87171",
    ca: "rgba(248,113,113,",
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
      <div className="space-y-0">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO — full-height cinematic                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-2xl min-h-[600px] flex items-center mb-16"
          style={{
            background: "#060810",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,0.7)",
          }}>

          {/* Background photo */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              opacity: 0.14,
            }} />

          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(105deg, rgba(6,8,16,1) 0%, rgba(6,8,16,0.95) 40%, rgba(6,8,16,0.65) 100%)" }} />

          {/* Aurora glows */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "aurora-drift 8s ease-in-out infinite alternate",
            }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "aurora-drift 10s ease-in-out infinite alternate-reverse",
            }} />

          {/* Chess grid */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none hidden lg:block"
            style={{
              backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.016) 0% 25%, transparent 0% 50%)",
              backgroundSize: "52px 52px",
              maskImage: "linear-gradient(to left, rgba(0,0,0,0.4), transparent)",
            }} />

          {/* Floating chess pieces */}
          <ParticleField count={20} />

          {/* Content */}
          <div className="relative z-10 px-8 md:px-14 py-20 w-full">
            <div className="max-w-3xl">

              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-8 text-xs font-semibold"
                style={{
                  background: "rgba(16,185,129,0.07)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#10B981",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary live-dot" />
                {stats ? `${stats.activeGames} live games in progress` : "Platform live"}
                <span className="w-px h-3 bg-primary/20" />
                <Zap className="w-3 h-3" />
                <span className="opacity-60">Real-time</span>
              </motion.div>

              {/* Main headline with split text animation */}
              <h1 className="mb-7 leading-[0.95] tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                <SplitText
                  text="Where"
                  className="block text-5xl md:text-6xl lg:text-[80px] font-black text-white/90"
                  delay={0.1}
                  stagger={0.04}
                />
                <SplitText
                  text="Champions"
                  className="block text-5xl md:text-6xl lg:text-[80px] font-black gradient-text-gold"
                  delay={0.3}
                  stagger={0.035}
                />
                <SplitText
                  text="Are Forged"
                  className="block text-5xl md:text-6xl lg:text-[80px] font-black text-white/85"
                  delay={0.6}
                  stagger={0.03}
                />
              </h1>

              {/* Subtitle */}
              <LineReveal delay={1.0}>
                <p className="text-[#7A8799] text-lg md:text-xl mb-10 leading-relaxed max-w-xl">
                  Challenge rivals with a private invite code or duel face-to-face.
                  Track your ELO, analyse every move, and rise through the ranks.
                </p>
              </LineReveal>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap gap-3 mb-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <MagneticBtn
                  onClick={() => setLocation("/play")}
                  className="btn-gold flex items-center gap-2.5 px-9 py-4 rounded-xl text-sm font-black"
                  style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }}
                >
                  ♟ Play Now
                </MagneticBtn>

                <MagneticBtn
                  onClick={() => setLocation(player ? "/leaderboard" : "/auth")}
                  className="flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#C4CFDF",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {player ? <><Trophy className="w-4 h-4 text-accent" />Leaderboard</> : <>Create Account<ArrowRight className="w-4 h-4" /></>}
                </MagneticBtn>
              </motion.div>

              {/* Live Stats with CountUp */}
              {stats && (
                <motion.div
                  className="flex items-center gap-10 pt-8"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 1.5 }}
                >
                  {[
                    { label: "Players", value: stats.totalPlayers },
                    { label: "Games Today", value: stats.gamesPlayedToday },
                    { label: "Avg ELO", value: stats.averageRating },
                  ].map((s, i) => (
                    <div key={s.label}>
                      <div
                        className="font-black gradient-text-gold stat-glow tabular-nums"
                        style={{ fontFamily: "'Cinzel', serif", fontSize: "2rem", lineHeight: 1 }}
                      >
                        <CountUp to={s.value} delay={1.6 + i * 0.12} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom scroll indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-semibold">Scroll</span>
            <motion.div
              className="w-px h-8 bg-gradient-to-b from-muted-foreground/20 to-transparent"
              animate={{ scaleY: [0, 1, 0], originY: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MARQUEE STRIP                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <ScrollReveal delay={0}>
          <div className="py-4 mb-16 overflow-hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <Marquee
              items={CHESS_TERMS}
              speed={30}
              separator="·"
              itemClassName="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/30"
            />
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PLAY MODES — Tilt Cards                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="mb-16">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                  Choose Your Battle
                </h2>
                <p className="text-sm text-muted-foreground mt-2">Two warriors. One board. Your rules.</p>
              </div>
              <Link href="/play" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                All modes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Local Duel — TiltCard */}
            <ScrollReveal delay={0.1}>
              <TiltCard
                className="relative overflow-hidden rounded-2xl cursor-pointer h-full"
                style={{
                  background: hoveredMode === "local"
                    ? "radial-gradient(ellipse at 25% 75%, rgba(201,168,76,0.18) 0%, rgba(6,8,16,0.97) 65%)"
                    : "radial-gradient(ellipse at 25% 75%, rgba(201,168,76,0.08) 0%, rgba(6,8,16,0.97) 65%)",
                  border: hoveredMode === "local" ? "1px solid rgba(201,168,76,0.38)" : "1px solid rgba(201,168,76,0.14)",
                  boxShadow: hoveredMode === "local" ? "0 0 80px rgba(201,168,76,0.12)" : "none",
                }}
                onClick={() => setLocation("/play")}
                onMouseEnter={() => setHoveredMode("local")}
                onMouseLeave={() => setHoveredMode(null)}
              >
                <div className="absolute right-4 bottom-0 text-[170px] leading-none select-none pointer-events-none"
                  style={{ opacity: hoveredMode === "local" ? 0.055 : 0.025, transition: "opacity 0.5s", color: "#C9A84C" }}>
                  ♟
                </div>
                <div className="relative p-8 space-y-5">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.07))",
                      border: "1px solid rgba(201,168,76,0.3)",
                    }}
                  >♞</motion.div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>Local Duel</h3>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.22)" }}>
                        Same Device
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Two players share one screen. Pass the board between moves. No internet. Just two minds.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Pass & Play", "Offline", "Custom Names", "Timed or Free"].map(f => (
                      <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(201,168,76,0.07)", color: "rgba(201,168,76,0.65)", border: "1px solid rgba(201,168,76,0.12)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-sm" style={{ color: "#C9A84C" }}>Start local battle</span>
                    <motion.div
                      animate={{ x: hoveredMode === "local" ? 6 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(201,168,76,0.18)" }}
                    >
                      <ArrowRight className="w-3 h-3" style={{ color: "#C9A84C" }} />
                    </motion.div>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            {/* Invite Duel — TiltCard */}
            <ScrollReveal delay={0.18}>
              <TiltCard
                className="relative overflow-hidden rounded-2xl cursor-pointer h-full"
                style={{
                  background: hoveredMode === "invite"
                    ? "radial-gradient(ellipse at 75% 25%, rgba(16,185,129,0.18) 0%, rgba(6,8,16,0.97) 65%)"
                    : "radial-gradient(ellipse at 75% 25%, rgba(16,185,129,0.08) 0%, rgba(6,8,16,0.97) 65%)",
                  border: hoveredMode === "invite" ? "1px solid rgba(16,185,129,0.38)" : "1px solid rgba(16,185,129,0.14)",
                  boxShadow: hoveredMode === "invite" ? "0 0 80px rgba(16,185,129,0.12)" : "none",
                }}
                onClick={() => setLocation("/play")}
                onMouseEnter={() => setHoveredMode("invite")}
                onMouseLeave={() => setHoveredMode(null)}
              >
                <div className="absolute left-4 bottom-0 text-[170px] leading-none select-none pointer-events-none"
                  style={{ opacity: hoveredMode === "invite" ? 0.055 : 0.025, transition: "opacity 0.5s", color: "#10B981" }}>
                  ♜
                </div>
                <div className="relative p-8 space-y-5">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(16,185,129,0.07))",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >♛</motion.div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>Invite to Duel</h3>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.22)" }}>
                        Online
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Generate a private room code, share it with your rival, and play from anywhere in real-time.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Room Code", "Shareable Link", "Real-time", "Private"].map(f => (
                      <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(16,185,129,0.07)", color: "rgba(16,185,129,0.65)", border: "1px solid rgba(16,185,129,0.12)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-sm" style={{ color: "#10B981" }}>Create private room</span>
                    <motion.div
                      animate={{ x: hoveredMode === "invite" ? 6 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(16,185,129,0.18)" }}
                    >
                      <ArrowRight className="w-3 h-3" style={{ color: "#10B981" }} />
                    </motion.div>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FEATURES + TOP PLAYERS                                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16">

          {/* Features — 3 cols */}
          <section className="lg:col-span-3">
            <ScrollReveal>
              <h2 className="text-2xl font-black mb-8 text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                Platform Features
              </h2>
            </ScrollReveal>
            <StaggerReveal stagger={0.09} delay={0.05} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc, color, ca }) => (
                <TiltCard
                  key={title}
                  maxTilt={7}
                  className="p-5 rounded-2xl"
                  style={{ background: `${ca}0.04)`, border: `1px solid ${ca}0.1)` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${ca}0.12)`, border: `1px solid ${ca}0.18)` }}>
                    <Icon style={{ color, width: "18px", height: "18px" }} />
                  </div>
                  <div className="font-bold text-sm text-foreground mb-1.5">{title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                </TiltCard>
              ))}
            </StaggerReveal>
          </section>

          {/* Top Players — 2 cols */}
          <section className="lg:col-span-2">
            <ScrollReveal delay={0.15}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>Top Players</h2>
                <Link href="/leaderboard"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Full table <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(12,14,26,0.85)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(20px)",
                }}>
                <div className="divide-y divide-white/[0.04]">
                  {(topPlayers ?? []).slice(0, 5).map((p: any, i: number) => (
                    <motion.div key={p.playerId} whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}>
                      <Link
                        href={`/profile/${p.playerId}`}
                        className="flex items-center gap-3 px-5 py-4 transition-all group cursor-pointer"
                      >
                        <div className="w-6 text-center flex-shrink-0">
                          {i === 0 ? <span className="text-base">🥇</span>
                            : i === 1 ? <span className="text-base">🥈</span>
                            : i === 2 ? <span className="text-base">🥉</span>
                            : <span className="text-xs font-bold text-muted-foreground font-mono">#{p.rank}</span>}
                        </div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
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
                    </motion.div>
                  ))}
                </div>
                {(topPlayers ?? []).length === 0 && (
                  <div className="py-12 text-center">
                    <motion.div
                      className="text-4xl mb-3 opacity-10"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >♞</motion.div>
                    <p className="text-muted-foreground text-sm">Be the first on the board</p>
                  </div>
                )}
                <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <Link href="/leaderboard" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
                    View all rankings <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* BOTTOM CTA BANNER — Aurora                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <ScrollReveal delay={0.1}>
          <section className="relative overflow-hidden rounded-2xl px-8 md:px-16 py-16 text-center mb-2"
            style={{
              background: "#060810",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 0 100px rgba(16,185,129,0.04) inset",
            }}>

            {/* Aurora gradient */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  animation: "aurora-drift 7s ease-in-out infinite alternate",
                }} />
              <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  animation: "aurora-drift 9s ease-in-out infinite alternate-reverse",
                }} />
              <div className="absolute inset-0"
                style={{
                  backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.012) 0% 25%, transparent 0% 50%)",
                  backgroundSize: "48px 48px",
                }} />
            </div>

            <div className="relative z-10">
              <motion.div
                className="text-5xl mb-5"
                animate={{ y: [0, -8, 0], rotateZ: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ opacity: 0.5 }}
              >
                ♔
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
                Ready to Prove Your Worth?
              </h2>
              <p className="text-muted-foreground mb-9 max-w-md mx-auto text-sm leading-relaxed">
                No AI. No bots. Just two humans and 64 squares.
                Your rating — and your legend — awaits.
              </p>
              <MagneticBtn
                onClick={() => setLocation(player ? "/play" : "/auth")}
                className="btn-gold inline-flex items-center gap-3 px-12 py-4 rounded-xl text-sm font-black"
                style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }}
              >
                ♟ {player ? "Play Now" : "Join ChessForge"}
              </MagneticBtn>
            </div>
          </section>
        </ScrollReveal>

      </div>
    </Layout>
  );
}
