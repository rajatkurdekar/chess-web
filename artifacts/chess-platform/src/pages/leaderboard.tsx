import { Layout } from "@/components/layout";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Trophy } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function WinBar({ winRate }: { winRate: number }) {
  const pct = Math.round(winRate * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #059669, #10B981)",
          }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-8" style={{ color: "rgba(226,232,244,0.6)" }}>{pct}%</span>
    </div>
  );
}

const PODIUM_STYLES = [
  {
    ring: "0 0 0 2px rgba(201,168,76,0.6), 0 0 32px rgba(201,168,76,0.25)",
    avatar: { background: "linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.08))", border: "2px solid rgba(201,168,76,0.5)", color: "#C9A84C" },
    card: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(12,14,26,0.95) 100%)",
    cardBorder: "rgba(201,168,76,0.22)",
    crown: "🥇",
    label: "Champion",
    labelColor: "#C9A84C",
    size: "text-4xl",
    order: 2,
    yOffset: "mt-0",
  },
  {
    ring: "0 0 0 2px rgba(192,192,192,0.5), 0 0 24px rgba(192,192,192,0.15)",
    avatar: { background: "linear-gradient(135deg, rgba(192,192,192,0.2), rgba(192,192,192,0.06))", border: "2px solid rgba(192,192,192,0.4)", color: "#C0C0C0" },
    card: "linear-gradient(135deg, rgba(192,192,192,0.07) 0%, rgba(12,14,26,0.95) 100%)",
    cardBorder: "rgba(192,192,192,0.16)",
    crown: "🥈",
    label: "Runner-Up",
    labelColor: "#C0C0C0",
    size: "text-3xl",
    order: 1,
    yOffset: "mt-8",
  },
  {
    ring: "0 0 0 2px rgba(205,127,50,0.5), 0 0 20px rgba(205,127,50,0.12)",
    avatar: { background: "linear-gradient(135deg, rgba(205,127,50,0.2), rgba(205,127,50,0.06))", border: "2px solid rgba(205,127,50,0.4)", color: "#CD7F32" },
    card: "linear-gradient(135deg, rgba(205,127,50,0.07) 0%, rgba(12,14,26,0.95) 100%)",
    cardBorder: "rgba(205,127,50,0.16)",
    crown: "🥉",
    label: "Third Place",
    labelColor: "#CD7F32",
    size: "text-2xl",
    order: 3,
    yOffset: "mt-12",
  },
];

export default function Leaderboard() {
  const { data: players, isLoading } = useGetLeaderboard({ limit: 50 } as any);
  const top3 = (players ?? []).slice(0, 3);
  const rest = (players ?? []).slice(3);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold mb-2"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "#C9A84C",
            }}>
            <Trophy className="w-3.5 h-3.5" />
            Season Rankings
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm">
            The finest minds on the platform, ranked by ELO rating
          </p>
        </div>

        {/* ── Podium — Top 3 ── */}
        {!isLoading && top3.length >= 2 && (
          <div className="flex items-end justify-center gap-4 pt-4">
            {[1, 0, 2].map((dataIdx) => {
              const p = top3[dataIdx] as any;
              if (!p) return null;
              const s = PODIUM_STYLES[dataIdx];
              return (
                <Link
                  key={p.playerId}
                  href={`/profile/${p.playerId}`}
                  className={cn(
                    "flex-1 max-w-[200px] rounded-2xl p-5 text-center transition-all duration-300 card-hover cursor-pointer",
                    s.yOffset
                  )}
                  style={{
                    background: s.card,
                    border: `1px solid ${s.cardBorder}`,
                  }}
                >
                  <div className="text-2xl mb-3">{s.crown}</div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-3"
                    style={{ ...s.avatar, boxShadow: s.ring }}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-bold text-sm text-foreground truncate mb-0.5"
                    style={{ fontFamily: "'Cinzel', serif" }}>
                    {p.username}
                  </div>
                  <div className="text-[11px] mb-2" style={{ color: s.labelColor, fontWeight: 600 }}>{s.label}</div>
                  <div className="font-black tabular-nums gradient-text-gold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem" }}>
                    {p.rating}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {p.gamesPlayed}g · {Math.round((p.winRate ?? 0) * 100)}% win
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Gold divider */}
        <div className="divider-gold" />

        {/* ── Full Table ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(12,14,26,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}>

          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_5.5rem_4.5rem_9rem] gap-4 px-5 py-3.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
            {["Rank", "Player", "Rating", "Games", "Win Rate"].map((h, i) => (
              <div key={h} className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                i === 0 ? "text-center" : i > 1 ? "text-right" : "",
                "text-muted-foreground/60"
              )}>
                {h}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="p-5 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {rest.map((p: any, idx: number) => (
                <Link
                  key={p.playerId}
                  href={`/profile/${p.playerId}`}
                  className="grid grid-cols-[3rem_1fr_5.5rem_4.5rem_9rem] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.025] transition-all group cursor-pointer"
                >
                  <div className="flex justify-center">
                    <span className="text-xs font-black text-muted-foreground tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      #{p.rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.16)",
                        color: "#10B981",
                      }}>
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {p.username}
                      </div>
                      <div className="text-[11px] text-muted-foreground/60 truncate">
                        {p.gamesPlayed > 0 ? `${p.gamesPlayed} games played` : "No games yet"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="gradient-text-gold font-black text-base tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.rating}
                    </span>
                  </div>
                  <div className="text-right text-sm text-muted-foreground tabular-nums font-medium">
                    {p.gamesPlayed}
                  </div>
                  <div className="flex justify-end">
                    <WinBar winRate={p.winRate ?? 0} />
                  </div>
                </Link>
              ))}

              {rest.length === 0 && !isLoading && top3.length === 0 && (
                <div className="py-16 text-center">
                  <div className="text-5xl mb-4 opacity-10">♞</div>
                  <p className="text-muted-foreground text-sm">No players ranked yet. Be the first.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
