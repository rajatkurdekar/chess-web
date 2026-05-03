import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateGuest, useLoginPlayer, useRegisterPlayer } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Loader2, ArrowRight } from "lucide-react";

const QUOTES = [
  { text: "Chess is the gymnasium of the mind.", author: "Blaise Pascal" },
  { text: "Every chess master was once a beginner.", author: "Irving Chernev" },
  { text: "Chess is life in miniature.", author: "Garry Kasparov" },
];
const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

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
    <div className="min-h-screen chess-pattern-bg grain-overlay flex">

      {/* ── Left Panel: Chess Imagery ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">

        {/* Background photo */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
          }} />
        <div className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(6,8,16,0.97) 0%, rgba(6,8,16,0.85) 50%, rgba(6,8,16,0.75) 100%)",
          }} />
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(16,185,129,0.06) 0%, transparent 60%)",
          }} />

        {/* Chess grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.016) 0% 25%, transparent 0% 50%)",
            backgroundSize: "52px 52px",
          }} />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black"
              style={{
                background: "linear-gradient(135deg, #059669, #10B981)",
                boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
                color: "#fff",
              }}>
              ♞
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: "1.1rem" }}>
              <span style={{ color: "#E2E8F4" }}>Chess</span>
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #E8C875)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Forge</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Decorative piece */}
          <div className="text-[120px] leading-none select-none float-anim"
            style={{ color: "#C9A84C", opacity: 0.15, fontFamily: "serif" }}>
            ♛
          </div>

          {/* Quote */}
          <div className="space-y-3 max-w-sm">
            <div className="w-8 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            <blockquote className="text-xl font-light leading-relaxed"
              style={{ color: "rgba(226,232,244,0.8)", fontFamily: "'Cinzel', serif" }}>
              "{quote.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground font-medium">— {quote.author}</p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["ELO Ratings", "Real-time Play", "Game Analysis", "No Bots"].map(f => (
              <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(226,232,244,0.6)",
                }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-[400px] space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black"
              style={{ background: "linear-gradient(135deg, #059669, #10B981)", color: "#fff" }}>
              ♞
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: "1.1rem" }}>
              <span style={{ color: "#E2E8F4" }}>Chess</span>
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #E8C875)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Forge</span>
            </span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              Enter the Board
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to track your rating, games, and ranking.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl p-6 space-y-5"
            style={{
              background: "rgba(12,14,26,0.85)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
            }}>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-5 rounded-xl p-1"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <TabsTrigger value="login"
                  className="rounded-lg text-sm font-semibold data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground ring-0 shadow-none">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register"
                  className="rounded-lg text-sm font-semibold data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground">
                  Register
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 text-xs text-red-400 rounded-xl px-4 py-3 font-medium"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  {error}
                </div>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Username
                    </Label>
                    <Input
                      id="username"
                      autoComplete="username"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(null); }}
                      className="h-11 rounded-xl input-premium bg-transparent border-white/[0.08] focus:border-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(null); }}
                      className="h-11 rounded-xl input-premium bg-transparent border-white/[0.08] focus:border-primary/50"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-emerald w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
                      : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Username
                    </Label>
                    <Input
                      id="reg-username"
                      autoComplete="username"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(null); }}
                      className="h-11 rounded-xl input-premium bg-transparent border-white/[0.08] focus:border-primary/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Password
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(null); }}
                      className="h-11 rounded-xl input-premium bg-transparent border-white/[0.08] focus:border-primary/50"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-emerald w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</>
                      : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Guest */}
            <button
              className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "#C4CFDF",
              }}
              onClick={handleGuest}
              disabled={guestMutation.isPending}
            >
              {guestMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Starting…</>
                : "♟ Continue as Guest"}
            </button>

            <p className="text-[11px] text-muted-foreground/50 text-center">
              Guest accounts are temporary. Register to save your stats.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground/40">
            No AI. No bots. Pure human chess.
          </p>
        </div>
      </div>
    </div>
  );
}
