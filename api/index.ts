import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "http";
import app from "../artifacts/api-server/src/app";
import { createWebSocketServer } from "../artifacts/api-server/src/lib/websocket";

// Singleton HTTP+Socket.io server — reused across requests in the same container instance.
// This keeps Socket.io room/state alive between polling requests on Vercel.
let httpServer: ReturnType<typeof createServer> | null = null;

function getServer() {
  if (!httpServer) {
    httpServer = createServer(app);
    createWebSocketServer(httpServer);
  }
  return httpServer;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Forward the request to the Express + Socket.io server
  getServer().emit("request", req, res);
}
