import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateGuest, useLoginPlayer, useRegisterPlayer } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLoginPlayer();
  const registerMutation = useRegisterPlayer();
  const guestMutation = useCreateGuest();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ data: { username, password } }, {
      onSuccess: (res) => { login(res.player, res.token); setLocation("/"); },
      onError: () => setError("Invalid username or password"),
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    registerMutation.mutate({ data: { username, password } }, {
      onSuccess: (res) => { login(res.player, res.token); setLocation("/"); },
      onError: () => setError("Username already taken"),
    });
  };

  const handleGuest = () => {
    guestMutation.mutate({ data: {} }, {
      onSuccess: (res) => { login(res.player, res.token); setLocation("/"); },
    });
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-sm space-y-5">
          {/* Brand */}
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/25 mx-auto">
              ♞
            </div>
            <h1 className="font-display font-bold text-2xl text-white mt-3">
              Welcome to <span className="gradient-text">ChessForge</span>
            </h1>
            <p className="text-sm text-muted-foreground">Sign in to track your rating and games</p>
          </div>

          <Card className="glass-card border-card-border">
            <CardContent className="p-5">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-5 bg-muted/30">
                  <TabsTrigger value="login" className="data-[state=active]:bg-card data-[state=active]:text-foreground">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-card data-[state=active]:text-foreground">Register</TabsTrigger>
                </TabsList>

                {error && (
                  <div className="mb-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username</Label>
                      <Input
                        id="username"
                        autoComplete="username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(null); }}
                        className="bg-muted/30 border-border focus:border-primary/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(null); }}
                        className="bg-muted/30 border-border focus:border-primary/50"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</> : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-username" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username</Label>
                      <Input
                        id="reg-username"
                        autoComplete="username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(null); }}
                        className="bg-muted/30 border-border focus:border-primary/50"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(null); }}
                        className="bg-muted/30 border-border focus:border-primary/50"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account…</> : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-2 text-muted-foreground tracking-wider">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-border hover:bg-white/5 text-foreground/80 hover:text-foreground font-medium"
                onClick={handleGuest}
                disabled={guestMutation.isPending}
              >
                {guestMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting…</> : "♟ Continue as Guest"}
              </Button>

              <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
                Guest accounts are temporary. Register to save your progress.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
