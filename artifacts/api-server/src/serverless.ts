import { createServer } from "http";
import app from "./app.js";
import { createWebSocketServer } from "./lib/websocket.js";

// Singleton HTTP + Socket.io server reused across requests in the same container.
let httpServer: ReturnType<typeof createServer> | null = null;

export function getServer() {
  if (!httpServer) {
    httpServer = createServer(app);
    createWebSocketServer(httpServer);
  }
  return httpServer;
}
