import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Trophy } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl leading-none">🥇</span>;
  if (rank === 2) return <span className="text-2xl leading-none">🥈</span>;
  if (rank === 3) return <span className="text-2xl leading-none">🥉</span>;
  return (
    <span className="text-sm font-bold text-muted-foreground font-mono">
      #{rank}
    </span>
  );
}

function WinBar({ winRate }: { winRate: number }) {
  const pct = Math.round(winRate * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-foreground/70 tabular-nums w-7">{pct}%</span>
    </div>
  );
}

export default function Leaderboard() {
  const { data: players, isLoading } = useGetLeaderboard({ limit: 50 } as any);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Top rated players on the platform</p>
          </div>
        </div>

        <Card className="glass-card border-card-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_6rem_5rem_10rem] gap-4 px-5 py-3 border-b border-white/[0.05]">
            {["Rank", "Player", "Rating", "Games", "Win Rate"].map((h, i) => (
              <div key={h} className={cn("text-xs font-bold uppercase tracking-wider text-muted-foreground/70", i > 1 && "text-right")}>
                {h}
              </div>
            ))}
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {(players ?? []).map((p: any, idx: number) => (
                  <Link
                    key={p.playerId}
                    href={`/profile/${p.playerId}`}
                    className={cn(
                      "grid grid-cols-[3rem_1fr_6rem_5rem_10rem] gap-4 px-5 py-3.5 items-center",
                      "hover:bg-white/[0.03] transition-all group cursor-pointer",
                      idx < 3 && "bg-gradient-to-r from-accent/[0.03] to-transparent"
                    )}
                  >
                    <div className="flex justify-center items-center h-8">
                      <RankBadge rank={p.rank} />
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all",
                        idx === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-400/30" :
                        idx === 1 ? "bg-zinc-400/15 text-zinc-300 border border-zinc-400/25" :
                        idx === 2 ? "bg-orange-600/15 text-orange-400 border border-orange-400/25" :
                        "bg-primary/10 text-primary border border-primary/20"
                      )}>
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {p.username}
                        </div>
                        <div className="text-[11px] text-muted-foreground/70 truncate">
                          {p.gamesPlayed > 0 ? `${p.gamesPlayed} games` : "No games yet"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="gradient-text-gold font-bold text-base tabular-nums">{p.rating}</span>
                    </div>

                    <div className="text-right text-sm text-muted-foreground tabular-nums">
                      {p.gamesPlayed}
                    </div>

                    <div className="flex justify-end">
                      <WinBar winRate={p.winRate ?? 0} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
