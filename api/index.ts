import type { IncomingMessage, ServerResponse } from "http";

// Import the pre-built serverless bundle (compiled by api-server's build step).
// Using a JS import instead of TypeScript source avoids Vercel recompiling the
// entire api-server workspace with its own tsconfig, which causes type errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mod: any = null;

async function getServer() {
  if (!mod) {
    mod = await import("../artifacts/api-server/dist/serverless.mjs");
  }
  return mod.getServer();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const server = await getServer();
  server.emit("request", req, res);
}
