import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Trophy, Swords, Home } from "lucide-react";
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
    <div className="min-h-screen flex flex-col chess-pattern-bg grain-overlay">

      {/* ── Premium Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.05]"
        style={{ background: "rgba(6,8,16,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>

        {/* Top gold accent line */}
        <div className="h-px w-full"
          style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)" }} />

        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-xl font-black"
                style={{
                  background: "linear-gradient(135deg, #059669, #10B981)",
                  boxShadow: "0 4px 20px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                  color: "#fff",
                }}>
                ♞
              </div>
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.02em" }}>
              <span style={{ color: "#E2E8F4" }}>Chess</span>
              <span style={{
                background: "linear-gradient(135deg, #C9A84C, #E8C875)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Forge</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = location === href || (href !== "/" && location.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {player ? (
              <Link
                href={`/profile/${player.id}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all group cursor-pointer"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.08))",
                    border: "1px solid rgba(16,185,129,0.35)",
                    color: "#10B981",
                  }}>
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-foreground leading-tight">{player.username}</div>
                  <div className="text-[10px] font-bold leading-tight gradient-text-gold">{player.rating}</div>
                </div>
              </Link>
            ) : (
              <Button
                size="sm"
                onClick={() => setLocation("/auth")}
                className="font-semibold text-xs px-4"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #E8C875)",
                  color: "#1a0f00",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 fade-in-up pb-20 md:pb-8">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(6,8,16,0.96)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-semibold transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]")} />
                {label}
              </Link>
            );
          })}
          {player && (
            <Link
              href={`/profile/${player.id}`}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-semibold transition-all",
                location.startsWith("/profile") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[9px]"
                style={{
                  background: location.startsWith("/profile")
                    ? "rgba(16,185,129,0.25)"
                    : "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10B981",
                }}>
                {player.username.charAt(0).toUpperCase()}
              </div>
              Profile
            </Link>
          )}
        </div>
      </nav>

      {/* ── Footer ── */}
      <footer className="hidden md:block border-t border-white/[0.04]"
        style={{ background: "rgba(6,8,16,0.6)" }}>
        <div className="max-w-7xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: "0.9rem" }}>
                <span style={{ color: "#E2E8F4", opacity: 0.5 }}>Chess</span>
                <span style={{
                  background: "linear-gradient(135deg, #C9A84C, #E8C875)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  opacity: 0.6,
                }}>Forge</span>
              </span>
              <span className="text-[11px] text-muted-foreground/40">
                Elite chess · Real rivals · No bots
              </span>
            </div>
            <div className="flex items-center gap-6 text-[11px] text-muted-foreground/40">
              <span>ELO Ratings</span>
              <span>Real-time Play</span>
              <span>Game Analysis</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
