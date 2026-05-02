import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Player } from "@workspace/api-client-react";

interface AuthContextType {
  player: Player | null;
  token: string | null;
  login: (player: Player, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [player, setPlayer] = useState<Player | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const storedPlayer = localStorage.getItem("chess_player");
    const storedToken = localStorage.getItem("chess_token");
    if (storedPlayer && storedToken) {
      try {
        setPlayer(JSON.parse(storedPlayer));
        setToken(storedToken);
        return;
      } catch {
        // Invalid JSON — fall through to create guest
      }
    }
    fetch("/api/players/guest", { method: "POST" })
      .then(res => (res.ok ? res.json() : null))
      .then((data: { player: Player; token: string } | null) => {
        if (data?.player && data?.token) {
          setPlayer(data.player);
          setToken(data.token);
          localStorage.setItem("chess_player", JSON.stringify(data.player));
          localStorage.setItem("chess_token", data.token);
        }
      })
      .catch(() => {});
  }, []);

  const login = (newPlayer: Player, newToken: string) => {
    setPlayer(newPlayer);
    setToken(newToken);
    localStorage.setItem("chess_player", JSON.stringify(newPlayer));
    localStorage.setItem("chess_token", newToken);
    queryClient.invalidateQueries();
  };

  const logout = () => {
    setPlayer(null);
    setToken(null);
    localStorage.removeItem("chess_player");
    localStorage.removeItem("chess_token");
    queryClient.invalidateQueries();
  };

  return (
    <AuthContext.Provider value={{ player, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
