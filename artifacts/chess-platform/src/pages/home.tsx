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
    color: "#d69d66",
    ca: "rgba(214,157,102,",
  },
  {
    icon: Users,
    title: "Invite to Duel",
    desc: "Generate a private room code. Share it with a rival. Play in real-time from anywhere on the globe.",
    color: "#3d6d79",
    ca: "rgba(61,109,121,",
  },
  {
    icon: TrendingUp,
    title: "ELO Rankings",
    desc: "Every game shapes your rating. Climb the ladder with the industry-standard ELO system.",
    color: "#e0e2ee",
    ca: "rgba(224,226,238,",
  },
  {
    icon: Shield,
    title: "Fair Play",
    desc: "Human vs Human only. No engines. No bots. Chess decided purely by intellect and nerve.",
    color: "#d69d66",
    ca: "rgba(214,157,102,",
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
        <section className="relative overflow-hidden rounded-2xl min-h-[520px] sm:min-h-[620px] flex items-center mb-12 sm:mb-16"
          style={{
            background: "#f7f8fc",
            boxShadow: "0 0 0 1px rgba(61,109,121,0.1), 0 40px 100px rgba(0,0,0,0.07)",
          }}>

          {/* Background photo */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              opacity: 0.12,
            }} />

          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(105deg, rgba(247,248,252,1) 0%, rgba(247,248,252,0.97) 40%, rgba(247,248,252,0.72) 100%)" }} />

          {/* Aurora glows */}
          <div className="absolute top-0 left-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(61,109,121,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "aurora-drift 8s ease-in-out infinite alternate",
            }} />
          <div className="absolute bottom-0 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(214,157,102,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "aurora-drift 10s ease-in-out infinite alternate-reverse",
            }} />

          {/* Chess grid */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none hidden lg:block"
            style={{
              backgroundImage: "repeating-conic-gradient(rgba(61,109,121,0.06) 0% 25%, transparent 0% 50%)",
              backgroundSize: "52px 52px",
              maskImage: "linear-gradient(to left, rgba(0,0,0,0.5), transparent)",
            }} />

          {/* Floating chess pieces */}
          <ParticleField count={20} />

          {/* Content */}
          <div className="relative z-10 px-5 sm:px-8 md:px-14 py-12 sm:py-16 md:py-20 w-full">
            <div className="max-w-3xl">

              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-6 sm:mb-8 text-xs font-semibold"
                style={{
                  background: "rgba(61,109,121,0.1)",
                  border: "1px solid rgba(61,109,121,0.28)",
                  color: "#3d6d79",
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
              <h1 className="display-hero-syne mb-5 sm:mb-7">
                <SplitText
                  text="Where"
                  className="block text-[42px] sm:text-5xl md:text-6xl lg:text-[88px] font-black text-[#0f1624]"
                  delay={0.1}
                  stagger={0.04}
                />
                <SplitText
                  text="Champions"
                  className="block text-[42px] sm:text-5xl md:text-6xl lg:text-[88px] font-black gradient-text-spectral"
                  delay={0.3}
                  stagger={0.035}
                />
                <SplitText
                  text="Are Forged"
                  className="block text-[42px] sm:text-5xl md:text-6xl lg:text-[88px] font-black text-[#0f1624]/70"
                  delay={0.6}
                  stagger={0.03}
                />
              </h1>

              {/* Subtitle */}
              <LineReveal delay={1.0}>
                <p className="text-[#0f1624]/60 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 leading-relaxed max-w-xl">
                  Challenge rivals with a private invite code or duel face-to-face.
                  Track your ELO, analyse every move, and rise through the ranks.
                </p>
              </LineReveal>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row flex-wrap gap-3 mb-10 sm:mb-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <MagneticBtn
                  onClick={() => setLocation("/play")}
                  className="btn-spectral flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl text-sm font-black w-full sm:w-auto"
                  style={{ fontFamily: "'Bodoni Moda', serif", letterSpacing: "0.02em" }}
                >
                  ♟ Play Now
                </MagneticBtn>

                <MagneticBtn
                  onClick={() => setLocation(player ? "/leaderboard" : "/auth")}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold transition-all w-full sm:w-auto"
                  style={{
                    background: "rgba(61,109,121,0.07)",
                    border: "1px solid rgba(61,109,121,0.22)",
                    color: "#0f1624",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {player ? <><Trophy className="w-4 h-4" style={{ color: "#d69d66" }} />Leaderboard</> : <>Create Account<ArrowRight className="w-4 h-4" /></>}
                </MagneticBtn>
              </motion.div>

              {/* Live Stats with CountUp */}
              {stats && (
                <motion.div
                  className="flex items-center flex-wrap gap-6 sm:gap-10 pt-6 sm:pt-8"
                  style={{ borderTop: "1px solid rgba(61,109,121,0.2)" }}
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
                        className="font-black gradient-text-spectral stat-glow-spectral tabular-nums"
                        style={{ fontFamily: "'Bodoni Moda', serif", fontSize: "2.1rem", lineHeight: 1 }}
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
            style={{ borderTop: "1px solid rgba(61,109,121,0.1)", borderBottom: "1px solid rgba(61,109,121,0.1)" }}>
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
                <h2 className="text-2xl sm:text-3xl font-black text-[#0f1624]" style={{ fontFamily: "'Bodoni Moda', serif" }}>
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
                    ? "radial-gradient(ellipse at 25% 75%, rgba(214,157,102,0.14) 0%, rgba(255,255,255,0.98) 65%)"
                    : "radial-gradient(ellipse at 25% 75%, rgba(214,157,102,0.06) 0%, rgba(255,255,255,0.98) 65%)",
                  border: hoveredMode === "local" ? "1px solid rgba(214,157,102,0.38)" : "1px solid rgba(214,157,102,0.18)",
                  boxShadow: hoveredMode === "local" ? "0 8px 60px rgba(214,157,102,0.14)" : "0 2px 16px rgba(0,0,0,0.05)",
                }}
                onClick={() => setLocation("/play")}
                onMouseEnter={() => setHoveredMode("local")}
                onMouseLeave={() => setHoveredMode(null)}
              >
                <div className="absolute right-4 bottom-0 text-[170px] leading-none select-none pointer-events-none"
                  style={{ opacity: hoveredMode === "local" ? 0.055 : 0.025, transition: "opacity 0.5s", color: "#d69d66" }}>
                  ♟
                </div>
                <div className="relative p-6 sm:p-8 space-y-5">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "linear-gradient(135deg, rgba(214,157,102,0.22), rgba(214,157,102,0.07))",
                      border: "1px solid rgba(214,157,102,0.3)",
                    }}
                  >♞</motion.div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2.5 mb-2">
                      <h3 className="text-xl font-black text-[#0f1624]" style={{ fontFamily: "'Bodoni Moda', serif" }}>Local Duel</h3>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: "rgba(214,157,102,0.1)", color: "#d69d66", border: "1px solid rgba(214,157,102,0.22)" }}>
                        Same Device
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#526070" }}>
                      Two players share one screen. Pass the board between moves. No internet. Just two minds.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Pass & Play", "Offline", "Custom Names", "Timed or Free"].map(f => (
                      <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(214,157,102,0.07)", color: "rgba(214,157,102,0.75)", border: "1px solid rgba(214,157,102,0.14)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-sm" style={{ color: "#d69d66" }}>Start local battle</span>
                    <motion.div
                      animate={{ x: hoveredMode === "local" ? 6 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(214,157,102,0.18)" }}
                    >
                      <ArrowRight className="w-3 h-3" style={{ color: "#d69d66" }} />
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
                    ? "radial-gradient(ellipse at 75% 25%, rgba(61,109,121,0.14) 0%, rgba(255,255,255,0.98) 65%)"
                    : "radial-gradient(ellipse at 75% 25%, rgba(61,109,121,0.06) 0%, rgba(255,255,255,0.98) 65%)",
                  border: hoveredMode === "invite" ? "1px solid rgba(61,109,121,0.4)" : "1px solid rgba(61,109,121,0.18)",
                  boxShadow: hoveredMode === "invite" ? "0 8px 60px rgba(61,109,121,0.12)" : "0 2px 16px rgba(0,0,0,0.05)",
                }}
                onClick={() => setLocation("/play")}
                onMouseEnter={() => setHoveredMode("invite")}
                onMouseLeave={() => setHoveredMode(null)}
              >
                <div className="absolute left-4 bottom-0 text-[170px] leading-none select-none pointer-events-none"
                  style={{ opacity: hoveredMode === "invite" ? 0.055 : 0.025, transition: "opacity 0.5s", color: "#3d6d79" }}>
                  ♜
                </div>
                <div className="relative p-6 sm:p-8 space-y-5">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "linear-gradient(135deg, rgba(61,109,121,0.22), rgba(61,109,121,0.07))",
                      border: "1px solid rgba(61,109,121,0.3)",
                    }}
                  >♛</motion.div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2.5 mb-2">
                      <h3 className="text-xl font-black text-[#0f1624]" style={{ fontFamily: "'Bodoni Moda', serif" }}>Invite to Duel</h3>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: "rgba(61,109,121,0.1)", color: "#3d6d79", border: "1px solid rgba(61,109,121,0.25)" }}>
                        Online
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#526070" }}>
                      Generate a private room code, share it with your rival, and play from anywhere in real-time.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Room Code", "Shareable Link", "Real-time", "Private"].map(f => (
                      <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(61,109,121,0.07)", color: "rgba(61,109,121,0.85)", border: "1px solid rgba(61,109,121,0.14)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-sm" style={{ color: "#3d6d79" }}>Create private room</span>
                    <motion.div
                      animate={{ x: hoveredMode === "invite" ? 6 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(61,109,121,0.18)" }}
                    >
                      <ArrowRight className="w-3 h-3" style={{ color: "#3d6d79" }} />
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
              <h2 className="text-2xl font-black mb-8 text-[#0f1624]" style={{ fontFamily: "'Bodoni Moda', serif" }}>
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
                <h2 className="text-2xl font-black text-[#0f1624]" style={{ fontFamily: "'Bodoni Moda', serif" }}>Top Players</h2>
                <Link href="/leaderboard"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                  Full table <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(61,109,121,0.1)",
                  backdropFilter: "blur(20px)",
                }}>
                <div className="divide-y divide-black/[0.05]">
                  {(topPlayers ?? []).slice(0, 5).map((p: any, i: number) => (
                    <motion.div key={p.playerId} whileHover={{ backgroundColor: "rgba(61,109,121,0.04)" }}>
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
                              ? { background: "rgba(214,157,102,0.15)", border: "1px solid rgba(214,157,102,0.3)", color: "#d69d66" }
                              : i === 1
                              ? { background: "rgba(61,109,121,0.08)", border: "1px solid rgba(61,109,121,0.2)", color: "#3d6d79" }
                              : i === 2
                              ? { background: "rgba(214,157,102,0.08)", border: "1px solid rgba(214,157,102,0.2)", color: "#d69d66" }
                              : { background: "rgba(61,109,121,0.08)", border: "1px solid rgba(61,109,121,0.2)", color: "#3d6d79" }
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
                          style={{ fontFamily: "'Bodoni Moda', serif" }}>
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
                <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(61,109,121,0.08)" }}>
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
          <section className="relative overflow-hidden rounded-2xl px-5 sm:px-8 md:px-16 py-12 md:py-16 text-center mb-2"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(61,109,121,0.12)",
              boxShadow: "0 0 80px rgba(61,109,121,0.04) inset, 0 4px 24px rgba(0,0,0,0.05)",
            }}>

            {/* Aurora gradient */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute -top-20 -left-20 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(61,109,121,0.15) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  animation: "aurora-drift 7s ease-in-out infinite alternate",
                }} />
              <div className="absolute -bottom-20 -right-20 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(214,157,102,0.14) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  animation: "aurora-drift 9s ease-in-out infinite alternate-reverse",
                }} />
              <div className="absolute inset-0"
                style={{
                  backgroundImage: "repeating-conic-gradient(rgba(61,109,121,0.03) 0% 25%, transparent 0% 50%)",
                  backgroundSize: "48px 48px",
                }} />
            </div>

            <div className="relative z-10">
              <motion.div
                className="text-5xl mb-5"
                animate={{ y: [0, -8, 0], rotateZ: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ opacity: 0.5, color: "#d69d66" }}
              >
                ♔
              </motion.div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0f1624] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                Ready to Prove Your Worth?
              </h2>
              <p className="text-muted-foreground mb-9 max-w-md mx-auto text-sm leading-relaxed">
                No AI. No bots. Just two humans and 64 squares.
                Your rating — and your legend — awaits.
              </p>
              <MagneticBtn
                onClick={() => setLocation(player ? "/play" : "/auth")}
                className="btn-spectral inline-flex items-center gap-3 px-12 py-4 rounded-xl text-sm font-black"
                style={{ fontFamily: "'Bodoni Moda', serif", letterSpacing: "0.02em" }}
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
