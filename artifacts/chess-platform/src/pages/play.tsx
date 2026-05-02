import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateAiGame, useCreateRoom } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "wouter";
import { Bot, Users, Zap, Clock, Hourglass, Shield, Loader2 } from "lucide-react";
import { useState } from "react";

const TIME_CONTROLS = [
  { label: "Bullet 1+0", initial: 60, increment: 0, icon: Zap, color: "from-amber-500 to-orange-600", textColor: "text-amber-50" },
  { label: "Bullet 2+1", initial: 120, increment: 1, icon: Zap, color: "from-orange-500 to-red-600", textColor: "text-orange-50" },
  { label: "Blitz 3+0", initial: 180, increment: 0, icon: Clock, color: "from-emerald-500 to-teal-600", textColor: "text-emerald-50" },
  { label: "Blitz 5+0", initial: 300, increment: 0, icon: Clock, color: "from-teal-500 to-cyan-600", textColor: "text-teal-50" },
  { label: "Blitz 5+3", initial: 300, increment: 3, icon: Clock, color: "from-cyan-500 to-blue-600", textColor: "text-cyan-50" },
  { label: "Rapid 10+0", initial: 600, increment: 0, icon: Hourglass, color: "from-blue-500 to-indigo-600", textColor: "text-blue-50" },
  { label: "Rapid 15+10", initial: 900, increment: 10, icon: Hourglass, color: "from-indigo-500 to-purple-600", textColor: "text-indigo-50" },
  { label: "Classical 30+0", initial: 1800, increment: 0, icon: Shield, color: "from-purple-500 to-pink-600", textColor: "text-purple-50" },
];

const AI_LEVELS = [
  { label: "Beginner", depth: 1, description: "Random legal moves" },
  { label: "Easy", depth: 2, description: "Basic tactics" },
  { label: "Medium", depth: 3, description: "Solid play" },
  { label: "Hard", depth: 4, description: "Strong opponent" },
];

export default function Play() {
  const { player } = useAuth();
  const [, setLocation] = useLocation();
  const createAiGame = useCreateAiGame();
  const createRoom = useCreateRoom();
  const [aiDepth, setAiDepth] = useState(3);
  const [mode, setMode] = useState<"ai" | "room">("ai");
  const [roomId, setRoomId] = useState("");

  if (!player) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <div className="text-6xl">♟</div>
          <h2 className="text-2xl font-bold">Sign in to play</h2>
          <p className="text-muted-foreground">Create an account or play as a guest to start a game</p>
          <Button size="lg" onClick={() => setLocation("/auth")}>Get Started</Button>
        </div>
      </Layout>
    );
  }

  const handleAiGame = (tc: typeof TIME_CONTROLS[0]) => {
    createAiGame.mutate({
      data: { playerId: player.id, playerColor: "random", timeControl: { initialSeconds: tc.initial, incrementSeconds: tc.increment, label: tc.label }, aiDepth }
    }, { onSuccess: (res) => setLocation(`/game/${res.id}`) });
  };

  const handleCreateRoom = () => {
    createRoom.mutate({
      data: { playerId: player.id, playerColor: "white", timeControl: { initialSeconds: 300, incrementSeconds: 0, label: "5 min" } }
    }, { onSuccess: (res) => setLocation(`/game/${res.game.id}`) });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Play Chess</h1>
          <p className="text-muted-foreground">Choose your game mode and time control</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode("ai")}
            className={`p-4 rounded-lg border text-left transition-all ${mode === "ai" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
          >
            <Bot className="w-6 h-6 mb-2 text-primary" />
            <div className="font-semibold">Play vs AI</div>
            <div className="text-sm text-muted-foreground">Practice against the computer</div>
          </button>
          <button
            onClick={() => setMode("room")}
            className={`p-4 rounded-lg border text-left transition-all ${mode === "room" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
          >
            <Users className="w-6 h-6 mb-2 text-primary" />
            <div className="font-semibold">Create Room</div>
            <div className="text-sm text-muted-foreground">Invite a friend with a link</div>
          </button>
        </div>

        {mode === "ai" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>AI Difficulty</CardTitle>
                <CardDescription>Select how strong you want the AI to play</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {AI_LEVELS.map((level) => (
                    <button
                      key={level.depth}
                      onClick={() => setAiDepth(level.depth)}
                      className={`p-3 rounded-lg border text-center transition-all ${aiDepth === level.depth ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <div className="font-semibold text-sm">{level.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-semibold mb-4">Choose Time Control</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIME_CONTROLS.map((tc) => {
                  const Icon = tc.icon;
                  return (
                    <Button
                      key={tc.label}
                      size="lg"
                      disabled={createAiGame.isPending}
                      onClick={() => handleAiGame(tc)}
                      className={`h-20 flex flex-col gap-1 bg-gradient-to-br ${tc.color} ${tc.textColor} border-0 hover:opacity-90`}
                    >
                      {createAiGame.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                      <span className="font-bold text-sm">{tc.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {mode === "room" && (
          <Card>
            <CardHeader>
              <CardTitle>Create a Private Room</CardTitle>
              <CardDescription>Share the game link with a friend to play together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleCreateRoom} disabled={createRoom.isPending} className="w-full" size="lg">
                {createRoom.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating room...</> : "Create Room"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
