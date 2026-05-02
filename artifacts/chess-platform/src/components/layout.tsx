import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { LogOut, User, Menu } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { player, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
            ♞ <span className="text-foreground">Chess</span>Platform
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/play" className="text-sm font-medium hover:text-primary transition-colors">Play</Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">Leaderboard</Link>
          </nav>

          <div className="flex items-center gap-4">
            {player ? (
              <div className="flex items-center gap-4">
                <Link href={`/profile/${player.id}`} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{player.username}</span>
                  <span className="text-muted-foreground">({player.rating})</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => { logout(); setLocation("/"); }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setLocation("/auth")}>Login</Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
