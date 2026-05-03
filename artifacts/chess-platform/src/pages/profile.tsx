import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetPlayer, useGetPlayerGames } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Trophy, TrendingUp, Swords, BarChart2, Flame, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function ResultBadge({ result }: { result: "win" | "loss" | "draw" }) {
  const styles = {
    win:  { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  color: "#10B981",  text: "1–0" },
    loss: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   color: "#F87171",  text: "0–1" },
    draw: { bg: "rgba(201,168,76,0.1)",  border: "rgba(201,168,76,0.3)",  color: "#C9A84C",  text: "½–½" },
  }[result];
  return (
    <span className="inline-flex items-center justify-center w-11 h-7 rounded-lg text-[11px] font-black"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color }}>
      {styles.text}
    </span>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) {
  return (
    <div className="rounded-2xl p-5 text-center"
      style={{
        background: "rgba(12,14,26,0.8)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
      }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
        {value}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const playerId = params?.id ?? "";
  const { player: me } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading } = useGetPlayer(playerId, { query: { enabled: !!playerId } } as any);
  const { data: gamesData } = useGetPlayerGames(playerId, { limit: 15 } as any, { query: { enabled: !!playerId } } as any);
  const games = gamesData?.games ?? [];

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-48 rounded-2xl shimmer" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-5xl opacity-10">♟</div>
          <p className="text-muted-foreground">Player not found</p>
        </div>
      </Layout>
    );
  }

  const gamesPlayed = profile.gamesPlayed ?? 0;
  const wins = profile.wins ?? 0;
  const draws = profile.draws ?? 0;
  const losses = profile.losses ?? 0;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : null;
  const streak = profile.currentStreak ?? 0;
  const peakRating = profile.peakRating ?? profile.rating;
  const isMe = me?.id === playerId;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl"
          style={{
            background: "#060810",
            border: "1px solid rgba(255,255,255,0.06)",
            minHeight: "180px",
          }}>

          {/* Photo bg */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=1200&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.08,
            }} />

          {/* Gradient overlay */}
          <div className="absolute inset-0 profile-banner" />

          {/* Grid pattern */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.014) 0% 25%, transparent 0% 50%)",
              backgroundSize: "40px 40px",
              opacity: 0.6,
            }} />

          {/* Content */}
          <div className="relative z-10 px-6 pt-8 pb-6 flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.08))",
                    border: "2px solid rgba(16,185,129,0.4)",
                    color: "#10B981",
                    boxShadow: "0 0 0 3px rgba(6,8,16,0.8), 0 0 32px rgba(16,185,129,0.15)",
                  }}>
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                {streak > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #E8C875)", color: "#1a0f00", fontWeight: 800 }}>
                    🔥
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mb-1">
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                    {profile.username}
                  </h1>
                  {profile.isGuest && (
                    <Badge variant="secondary" className="text-[10px] h-5 font-bold">Guest</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {isMe && (
              <button
                className="btn-emerald flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold"
                onClick={() => setLocation("/play")}
              >
                ♟ Play <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Rating + Badges Strip ── */}
        <div className="rounded-2xl px-6 py-5"
          style={{
            background: "rgba(12,14,26,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}>
          <div className="flex items-center justify-between flex-wrap gap-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Current Rating
              </div>
              <div className="font-black gradient-text-gold stat-glow"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2.8rem", lineHeight: 1 }}>
                {profile.rating}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {peakRating > 1200 && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(201,168,76,0.07)",
                    border: "1px solid rgba(201,168,76,0.18)",
                  }}>
                  <Star className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Peak</div>
                    <div className="text-sm font-black" style={{ color: "#C9A84C" }}>{peakRating}</div>
                  </div>
                </div>
              )}

              {streak !== 0 && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{
                    background: streak > 0 ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
                    border: streak > 0 ? "1px solid rgba(16,185,129,0.18)" : "1px solid rgba(239,68,68,0.18)",
                  }}>
                  <Flame className="w-3.5 h-3.5" style={{ color: streak > 0 ? "#10B981" : "#F87171" }} />
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Streak</div>
                    <div className="text-sm font-black" style={{ color: streak > 0 ? "#10B981" : "#F87171" }}>
                      {streak > 0 ? `+${streak}` : streak}
                    </div>
                  </div>
                </div>
              )}

              {winRate !== null && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(129,140,248,0.07)",
                    border: "1px solid rgba(129,140,248,0.18)",
                  }}>
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: "#818CF8" }} />
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Win Rate</div>
                    <div className="text-sm font-black" style={{ color: "#818CF8" }}>{winRate}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        {gamesPlayed > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={<Swords className="w-4 h-4" />}
                label="Games"
                value={gamesPlayed}
                color="#818CF8"
              />
              <StatCard
                icon={<Trophy className="w-4 h-4" />}
                label="Wins"
                value={wins}
                color="#10B981"
              />
              <StatCard
                icon={<span className="text-sm font-black">{draws}D / {losses}L</span>}
                label="Draw / Loss"
                value={`${draws} / ${losses}`}
                color="#C9A84C"
              />
            </div>

            {/* Results breakdown */}
            <div className="rounded-2xl p-5"
              style={{
                background: "rgba(12,14,26,0.8)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Results Breakdown</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#10B981" }} />
                    W {wins}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#C9A84C" }} />
                    D {draws}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#F87171" }} />
                    L {losses}
                  </span>
                </div>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
                {wins > 0 && (
                  <div style={{ width: `${(wins / gamesPlayed) * 100}%`, background: "linear-gradient(90deg, #059669, #10B981)", borderRadius: draws === 0 && losses === 0 ? "999px" : "999px 0 0 999px" }} />
                )}
                {draws > 0 && (
                  <div style={{ width: `${(draws / gamesPlayed) * 100}%`, background: "#C9A84C" }} />
                )}
                {losses > 0 && (
                  <div style={{ flex: 1, background: "#F87171", borderRadius: "0 999px 999px 0" }} />
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Recent Games ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(12,14,26,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
          <div className="px-5 py-4 flex items-center gap-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Swords className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-bold text-sm text-foreground">Recent Games</h2>
          </div>

          {games.length === 0 ? (
            <div className="py-14 text-center">
              <div className="text-5xl mb-4 opacity-10">♟</div>
              <p className="text-muted-foreground text-sm font-medium">No games played yet</p>
              {isMe && (
                <button
                  className="btn-emerald mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  onClick={() => setLocation("/play")}
                >
                  Play first game <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {games.map((g: any) => {
                const isWhite = g.whitePlayerId === playerId;
                const opponent = isWhite ? (g.blackUsername ?? "Opponent") : (g.whiteUsername ?? "Opponent");
                const myColor = isWhite ? "white" : "black";
                const myResult: "win" | "loss" | "draw" =
                  g.result === "draw" ? "draw" : g.result === myColor ? "win" : "loss";
                const reason = g.resultReason
                  ? g.resultReason.replace(/_/g, " ")
                  : g.status === "aborted" ? "aborted" : null;

                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.025] transition-all cursor-pointer group"
                    onClick={() => setLocation(`/game/${g.id}`)}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <ResultBadge result={myResult} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                          vs {opponent}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <span className="capitalize">{isWhite ? "White" : "Black"}</span>
                          {reason && (
                            <><span className="opacity-30">·</span>
                            <span className="capitalize">{reason}</span></>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setLocation(`/analysis/${g.id}`); }}
                        className="p-2 rounded-xl transition-all"
                        style={{ color: "#7A8799" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.1)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#10B981";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "#7A8799";
                        }}
                        title="Analyse game"
                        aria-label="Analyse game"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
