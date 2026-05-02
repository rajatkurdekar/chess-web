import { io, Socket } from "socket.io-client";
import { useEffect, useState, useRef, useCallback } from "react";
import type { Game, GameResult } from "@workspace/api-client-react";

let socketInstance: Socket | null = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      path: "/api/ws/socket.io",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

interface MoveEntry { san: string; uci: string; moveNumber: number }
type GameState = Game;

export function useGameSocket(gameId: string | undefined, playerId: string | undefined) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [moves, setMoves] = useState<MoveEntry[]>([]);
  const [drawOfferFrom, setDrawOfferFrom] = useState<string | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!gameId || !playerId) return;
    joinedRef.current = false;
    setMoves([]);
    setDrawOfferFrom(null);

    const socket = getSocket();

    const joinGame = () => {
      if (!joinedRef.current) {
        joinedRef.current = true;
        socket.emit("game:join", { gameId, playerId });
      }
    };

    const onConnect = () => { setConnected(true); joinGame(); };
    const onDisconnect = () => { setConnected(false); joinedRef.current = false; };

    const onGameState = (data: { game: GameState; moves?: MoveEntry[] }) => {
      setGameState(data.game);
      if (data.moves) setMoves(data.moves);
    };

    const onMoveConfirmed = (data: {
      san?: string; uci?: string; moveNumber?: number;
      fen?: string; whiteTimeMs?: number; blackTimeMs?: number;
      isGameOver?: boolean; result?: GameResult; resultReason?: string | null;
    }) => {
      if (data.fen) {
        setGameState((prev) => prev ? {
          ...prev,
          fen: data.fen!,
          whiteTimeMs: data.whiteTimeMs ?? prev.whiteTimeMs,
          blackTimeMs: data.blackTimeMs ?? prev.blackTimeMs,
          status: data.isGameOver ? ("finished" as const) : prev.status,
          result: data.result !== undefined ? data.result : prev.result,
          resultReason: data.resultReason !== undefined ? data.resultReason : prev.resultReason,
        } : prev);
      }
      if (data.san && data.uci) {
        setMoves((prev) => [...prev, { san: data.san!, uci: data.uci!, moveNumber: data.moveNumber ?? prev.length + 1 }]);
      }
      // Clear draw offer once a move is made
      setDrawOfferFrom(null);
    };

    const onGameOver = (data: { result?: GameResult; resultReason?: string | null }) => {
      setGameState((prev) => prev ? {
        ...prev,
        status: "finished" as const,
        result: data.result ?? null,
        resultReason: data.resultReason ?? null,
      } : prev);
    };

    const onDrawOffered = (data: { offeredBy: string }) => {
      setDrawOfferFrom(data.offeredBy);
    };

    const onDrawDeclined = () => {
      setDrawOfferFrom(null);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("game:state", onGameState);
    socket.on("move:confirmed", onMoveConfirmed);
    socket.on("game:over", onGameOver);
    socket.on("game:draw-offered", onDrawOffered);
    socket.on("game:draw-declined", onDrawDeclined);

    if (socket.connected) { setConnected(true); joinGame(); }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("game:state", onGameState);
      socket.off("move:confirmed", onMoveConfirmed);
      socket.off("game:over", onGameOver);
      socket.off("game:draw-offered", onDrawOffered);
      socket.off("game:draw-declined", onDrawDeclined);
    };
  }, [gameId, playerId]);

  const makeMove = useCallback((uci: string) => {
    if (!gameId || !playerId) return;
    getSocket().emit("game:move", { gameId, playerId, uci, clientTime: Date.now() });
  }, [gameId, playerId]);

  const resign = useCallback(() => {
    if (!gameId || !playerId) return;
    getSocket().emit("game:resign", { gameId, playerId });
  }, [gameId, playerId]);

  const drawOffer = useCallback(() => {
    if (!gameId || !playerId) return;
    getSocket().emit("game:draw-offer", { gameId, playerId });
  }, [gameId, playerId]);

  const drawAccept = useCallback(() => {
    if (!gameId || !playerId) return;
    getSocket().emit("game:draw-accept", { gameId, playerId });
    setDrawOfferFrom(null);
  }, [gameId, playerId]);

  const drawDecline = useCallback(() => {
    if (!gameId || !playerId) return;
    getSocket().emit("game:draw-decline", { gameId, playerId });
    setDrawOfferFrom(null);
  }, [gameId, playerId]);

  return {
    socket: getSocket(),
    connected,
    gameState,
    moves,
    drawOfferFrom,
    makeMove,
    resign,
    drawOffer,
    drawAccept,
    drawDecline,
  };
}
