import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateAiGame, useGetPlatformStats } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Loader2, Zap, Clock, Hourglass } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { player } = useAuth();
  const createAiGame = useCreateAiGame();
  const { data: stats } = useGetPlatformStats();

  const handleQuickPlay = (initialSeconds: number, incrementSeconds: number, label: string) => {
    if (!player) {
      setLocation("/auth");
      return;
    }
    createAiGame.mutate({
      data: {
        playerId: player.id,
        playerColor: "random",
        timeControl: { initialSeconds, incrementSeconds, label },
        aiDepth: 3
      }
    }, {
      onSuccess: (game) => {
        setLocation(`/game/${game.id}`);
      }
    });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border rounded-lg p-8 shadow-sm">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Play Chess Online</h1>
            <p className="text-muted-foreground mb-8 text-lg">Challenge players from around the world or practice against AI.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                size="lg" 
                className="h-24 flex flex-col gap-2 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-amber-50 border-0"
                onClick={() => handleQuickPlay(60, 0, "1 min")}
                disabled={createAiGame.isPending}
              >
                <Zap className="w-6 h-6" />
                <span className="font-bold text-lg">Bullet 1+0</span>
              </Button>
              
              <Button 
                size="lg" 
                className="h-24 flex flex-col gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-emerald-50 border-0"
                onClick={() => handleQuickPlay(300, 0, "5 min")}
                disabled={createAiGame.isPending}
              >
                <Clock className="w-6 h-6" />
                <span className="font-bold text-lg">Blitz 5+0</span>
              </Button>
              
              <Button 
                size="lg" 
                className="h-24 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-blue-50 border-0"
                onClick={() => handleQuickPlay(600, 0, "10 min")}
                disabled={createAiGame.isPending}
              >
                <Hourglass className="w-6 h-6" />
                <span className="font-bold text-lg">Rapid 10+0</span>
              </Button>
            </div>
            
            {createAiGame.isPending && <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Starting game...</p>}
          </section>
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Platform Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Players</span>
                    <span className="font-medium">{stats.totalPlayers}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Active Games</span>
                    <span className="font-medium text-emerald-500">{stats.activeGames}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Games Today</span>
                    <span className="font-medium">{stats.gamesPlayedToday}</span>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse flex flex-col gap-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
