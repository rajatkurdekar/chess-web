let mod = null;

async function getServer() {
  if (!mod) {
    mod = await import("../artifacts/api-server/dist/serverless.mjs");
  }
  return mod.getServer();
}

export default async function handler(req, res) {
  const server = await getServer();
  server.emit("request", req, res);
}
