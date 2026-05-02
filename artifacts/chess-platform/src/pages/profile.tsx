import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetPlayer, useGetPlayerGames } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Trophy, Target, TrendingUp, Swords, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-card-border">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

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
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-40 bg-muted/20 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted/20 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return <Layout><div className="text-center py-20 text-muted-foreground">Player not found</div></Layout>;
  }

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;
  const losses = profile.gamesPlayed - profile.wins - (profile.draws ?? 0);
  const isMe = me?.id === playerId;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Profile Hero */}
        <div className="relative glass-card rounded-2xl border border-card-border overflow-hidden">
          {/* Gradient banner */}
          <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          {/* Chess pattern overlay */}
          <div className="absolute top-0 left-0 right-0 h-28 opacity-[0.06]"
            style={{ backgroundImage: "repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)", backgroundSize: "32px 32px" }} />

          <div className="px-6 pb-5 -mt-12 flex items-end justify-between relative z-10">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-4 border-background flex items-center justify-center font-black text-3xl text-primary shadow-xl flex-shrink-0">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{profile.username}</h1>
                  {profile.isGuest && (
                    <Badge variant="secondary" className="text-[10px] h-5">Guest</Badge>
                  )}
                  <div className="gradient-text-gold font-black text-lg font-mono">{profile.rating}</div>
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="ELO Rating" value={profile.rating} icon={TrendingUp} color="bg-primary/15 text-primary border border-primary/20" />
          <StatCard label="Games" value={profile.gamesPlayed} icon={Swords} color="bg-blue-400/10 text-blue-400 border border-blue-400/20" />
          <StatCard label="Wins" value={profile.wins} icon={Trophy} color="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" />
          <StatCard label="Win Rate" value={`${winRate}%`} icon={Target} color="bg-accent/10 text-accent border border-accent/20" />
        </div>

        {/* Win/Draw/Loss bar */}
        {profile.gamesPlayed > 0 && (
          <div className="glass-card rounded-xl border border-card-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Results Breakdown</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />W: {profile.wins}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />D: {profile.draws ?? 0}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />L: {losses}</span>
              </div>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
              {profile.wins > 0 && <div className="bg-emerald-400" style={{ width: `${(profile.wins / profile.gamesPlayed) * 100}%` }} />}
              {(profile.draws ?? 0) > 0 && <div className="bg-yellow-400" style={{ width: `${((profile.draws ?? 0) / profile.gamesPlayed) * 100}%` }} />}
              {losses > 0 && <div className="bg-red-400 flex-1" />}
            </div>
          </div>
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
              <div className="p-8 text-center">
                <p className="text-muted-foreground text-sm">No games yet</p>
                <Button size="sm" className="mt-3 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20" onClick={() => setLocation("/play")}>
                  Play first game
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {games.map((g: any) => {
                  const isWhite = g.whitePlayerId === playerId;
                  const opponent = isWhite ? (g.blackUsername ?? "Opponent") : g.whiteUsername;
                  const myColor = isWhite ? "white" : "black";
                  const myResult: "win" | "loss" | "draw" = g.result === "draw" ? "draw" : g.result === myColor ? "win" : "loss";

                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-all cursor-pointer group"
                      onClick={() => setLocation(`/game/${g.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <ResultBadge result={myResult} />
                        <div>
                          <div className="text-sm font-semibold group-hover:text-primary transition-colors">
                            vs {opponent}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {g.timeControl?.label ?? "—"} · {isWhite ? "White" : "Black"} · {g.resultReason ?? g.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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
