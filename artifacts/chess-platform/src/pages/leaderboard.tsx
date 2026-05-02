import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Trophy, TrendingUp, Minus } from "lucide-react";
import { Link } from "wouter";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-lg font-bold text-muted-foreground w-8 text-center">#{rank}</span>;
}

export default function Leaderboard() {
  const { data: players, isLoading } = useGetLeaderboard({ limit: 50 } as any);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Top rated players on the platform</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground grid grid-cols-[3rem_1fr_repeat(3,8rem)] gap-4">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Games</span>
              <span className="text-right">Win %</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/40 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(players ?? []).map((p: any) => (
                  <Link
                    key={p.playerId}
                    href={`/profile/${p.playerId}`}
                    className="grid grid-cols-[3rem_1fr_repeat(3,8rem)] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex justify-center">
                      <RankBadge rank={p.rank} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold group-hover:text-primary transition-colors">{p.username}</div>
                        <div className="text-xs text-muted-foreground">{p.gamesPlayed} games played</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-accent">{p.rating}</span>
                    </div>
                    <div className="text-right text-muted-foreground">{p.gamesPlayed}</div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/5">
                        {Math.round((p.winRate ?? 0) * 100)}%
                      </Badge>
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
