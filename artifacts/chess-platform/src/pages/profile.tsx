import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetPlayer, useGetPlayerGames } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Trophy, TrendingUp, Swords, BarChart2, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

function ResultBadge({ result }: { result: "win" | "loss" | "draw" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-bold w-10 justify-center",
        result === "win" && "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
        result === "loss" && "border-red-400/40 bg-red-400/10 text-red-400",
        result === "draw" && "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
      )}
    >
      {result === "win" ? "1-0" : result === "loss" ? "0-1" : "½-½"}
    </Badge>
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
          <div className="h-40 bg-muted/20 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-muted/20 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return <Layout><div className="text-center py-20 text-muted-foreground">Player not found</div></Layout>;
  }

  const gamesPlayed = profile.gamesPlayed ?? 0;
  const wins = profile.wins ?? 0;
  const draws = profile.draws ?? 0;
  const losses = profile.losses ?? 0;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : null;
  const streak = profile.currentStreak ?? 0;
  const peakRating = profile.peakRating ?? profile.rating;
  const isMe = me?.id === playerId;
  const hasPlayedGames = gamesPlayed > 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Profile Hero */}
        <div className="relative glass-card rounded-2xl border border-card-border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/8 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 opacity-[0.05]"
            style={{ backgroundImage: "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)", backgroundSize: "32px 32px" }} />

          <div className="px-6 pb-5 -mt-10 flex items-end justify-between relative z-10">
            <div className="flex items-end gap-4">
              <div className="w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-4 border-background flex items-center justify-center font-black text-3xl text-primary shadow-xl flex-shrink-0">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{profile.username}</h1>
                  {profile.isGuest && (
                    <Badge variant="secondary" className="text-[10px] h-5">Guest</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            {isMe && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                onClick={() => setLocation("/play")}
              >
                ♟ Play
              </Button>
            )}
          </div>
        </div>

        {/* Rating strip — always shown */}
        <div className="glass-card rounded-xl border border-card-border p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Current Rating</div>
              <div className="gradient-text-gold font-black text-4xl font-mono">{profile.rating}</div>
            </div>
            {peakRating > 1200 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/8 border border-accent/20">
                <Star className="w-3.5 h-3.5 text-accent" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Peak</div>
                  <div className="text-sm font-bold text-accent">{peakRating}</div>
                </div>
              </div>
            )}
            {streak !== 0 && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border",
                streak > 0 ? "bg-emerald-400/8 border-emerald-400/20" : "bg-red-400/8 border-red-400/20"
              )}>
                <Flame className={cn("w-3.5 h-3.5", streak > 0 ? "text-emerald-400" : "text-red-400")} />
                <div>
                  <div className="text-[10px] text-muted-foreground">Streak</div>
                  <div className={cn("text-sm font-bold", streak > 0 ? "text-emerald-400" : "text-red-400")}>
                    {streak > 0 ? `+${streak}` : streak}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game stats — only show if games have been played */}
        {hasPlayedGames && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-4 border border-card-border text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Swords className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Games</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{gamesPlayed}</div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-card-border text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wins</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{wins}</div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-card-border text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Win Rate</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{winRate}%</div>
              </div>
            </div>

            {/* Results breakdown bar */}
            <div className="glass-card rounded-xl border border-card-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Results</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />W {wins}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />D {draws}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />L {losses}
                  </span>
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-px">
                {wins > 0 && (
                  <div className="bg-emerald-400 rounded-l-full" style={{ width: `${(wins / gamesPlayed) * 100}%` }} />
                )}
                {draws > 0 && (
                  <div className="bg-yellow-400" style={{ width: `${(draws / gamesPlayed) * 100}%` }} />
                )}
                {losses > 0 && (
                  <div className="bg-red-400 flex-1 rounded-r-full" />
                )}
              </div>
            </div>
          </>
        )}

        {/* Recent Games */}
        <Card className="glass-card border-card-border overflow-hidden">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Swords className="w-4 h-4 text-muted-foreground" /> Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {games.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl mb-3 opacity-30">♟</div>
                <p className="text-muted-foreground text-sm font-medium">No games played yet</p>
                {isMe && (
                  <Button
                    size="sm"
                    className="mt-4 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20"
                    onClick={() => setLocation("/play")}
                  >
                    Play first game
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
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
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-all cursor-pointer group"
                      onClick={() => setLocation(`/game/${g.id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ResultBadge result={myResult} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                            vs {opponent}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <span className="capitalize">{isWhite ? "White" : "Black"}</span>
                            {reason && <><span className="opacity-40">·</span><span className="capitalize">{reason}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(g.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setLocation(`/analysis/${g.id}`); }}
                          className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                          title="Analyse"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
