import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { LogOut, User, Trophy, Swords, BarChart2, Home, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/play", label: "Play", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Layout({ children }: { children: ReactNode }) {
  const { player, logout } = useAuth();
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col chess-pattern-bg">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0D0F17]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-black text-base shadow-lg shadow-primary/20">
              ♞
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              <span className="text-white">Chess</span>
              <span className="gradient-text">Forge</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = location === href || (href !== "/" && location.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {player ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${player.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-all group"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-foreground leading-tight">{player.username}</div>
                    <div className="text-[10px] text-muted-foreground gradient-text-gold font-bold">{player.rating}</div>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); setLocation("/"); }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setLocation("/auth")}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                  onClick={() => setLocation("/auth")}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 fade-in-up">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-display font-bold text-foreground/40">ChessForge</span>
          <span>Real-time chess · ELO ratings · AI opponent</span>
        </div>
      </footer>
    </div>
  );
}
