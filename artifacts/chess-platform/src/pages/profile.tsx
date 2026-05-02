import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetPlayer, useGetPlayerGames } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Trophy, Target, TrendingUp, Swords } from "lucide-react";

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent?: string }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accent ?? "bg-primary/10"}`}>
          <Icon className={`w-6 h-6 ${accent ? "text-white" : "text-primary"}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const playerId = params?.id ?? "";
  const { player: me } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading } = useGetPlayer(playerId, { query: { enabled: !!playerId } } as any);
  const { data: gamesData } = useGetPlayerGames(playerId, { limit: 10 } as any, { query: { enabled: !!playerId } } as any);
  const games = gamesData?.games;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-32 bg-muted/40 rounded-lg animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted/40 rounded-lg animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return <Layout><div className="text-center py-20 text-muted-foreground">Player not found</div></Layout>;
  }

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />
          <CardContent className="p-6 -mt-12 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-xl bg-card border-4 border-background flex items-center justify-center font-black text-4xl text-primary shadow-lg">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="mb-1">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                  {profile.isGuest && <Badge variant="secondary">Guest</Badge>}
                </div>
              </div>
            </div>
            {me?.id === playerId && (
              <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
                Play Now
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Rating" value={profile.rating} icon={TrendingUp} />
          <StatCard label="Games Played" value={profile.gamesPlayed} icon={Swords} />
          <StatCard label="Wins" value={profile.wins} icon={Trophy} accent="bg-emerald-500" />
          <StatCard label="Win Rate" value={`${winRate}%`} icon={Target} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!games || games.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No games yet</div>
            ) : (
              <div className="divide-y divide-border">
                {games.map((g: any) => {
                  const isWhite = g.whitePlayerId === playerId;
                  const opponent = isWhite ? (g.blackUsername ?? "AI") : g.whiteUsername;
                  const myResult = g.result === "draw" ? "draw" : (g.result === (isWhite ? "white" : "black") ? "win" : "loss");
                  return (
                    <div key={g.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => setLocation(`/game/${g.id}`)}>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            myResult === "win" ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30" :
                            myResult === "loss" ? "bg-red-500/20 text-red-400 border-red-400/30" :
                            "bg-muted text-muted-foreground"
                          }
                          variant="outline"
                        >
                          {myResult.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="font-medium">vs {opponent}</div>
                          <div className="text-xs text-muted-foreground">{g.timeControl?.label ?? "—"} · {g.resultReason ?? g.status}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(g.createdAt).toLocaleDateString()}</div>
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
