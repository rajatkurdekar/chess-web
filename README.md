# ♞ ChessForge

**ChessForge** is a production-grade online chess platform built with React, Express 5, Socket.io, and PostgreSQL. Challenge friends with a private invite code, play local pass-and-play duels, track your ELO rating, and analyse every game move by move.

---

## Features

| Feature | Description |
|---|---|
| **Local Duel** | Pass-and-play on one device — no account needed |
| **Invite to Duel** | Create a private room, share a 6-char code, play in real time from anywhere |
| **ELO Ratings** | Industry-standard ELO system — win to climb, lose to fall |
| **Live Clocks** | Configurable time controls with per-player countdown |
| **Game Analysis** | Full move history with piece capture tracking |
| **Anti-cheat** | Server-side timing analysis flags suspicious patterns |
| **AI Opponent** | Minimax engine with configurable depth |
| **Leaderboard** | Live global rankings |

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 7** — instant HMR, fast production builds
- **Tailwind CSS v4** — utility-first styling
- **Socket.io-client** — real-time game events
- **chess.js** — move validation and game logic
- **TanStack Query** — server state management
- **Wouter** — lightweight SPA routing

### Backend
- **Express 5** — modern async request handling
- **Socket.io** — bidirectional real-time communication
- **Drizzle ORM** + **PostgreSQL** — type-safe database layer
- **JWT** + **bcrypt** — authentication and password hashing
- **Pino** — structured JSON logging

### Infrastructure
- **pnpm workspaces** — monorepo with shared type-safe API contracts
- **OpenAPI + Zod** — schema-first API with generated React Query hooks
- **Vercel** — frontend static deployment + serverless API functions

---

## Project Structure

```
chess-web/
├── artifacts/
│   ├── chess-platform/      # React + Vite frontend
│   └── api-server/          # Express 5 + Socket.io backend
├── lib/
│   ├── db/                  # Drizzle ORM schema + migrations
│   ├── api-spec/            # OpenAPI specification
│   ├── api-zod/             # Generated Zod validators
│   └── api-client-react/    # Generated React Query hooks
├── api/
│   └── index.js             # Vercel serverless entry point
└── vercel.json              # Vercel deployment config
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 10+ (`npm install -g pnpm`)
- **PostgreSQL** database (local or hosted, e.g. [Neon](https://neon.tech))

### 1. Clone the repo

```bash
git clone https://github.com/rajatkurdekar/chess-web.git
cd chess-web
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create `artifacts/api-server/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname
SESSION_SECRET=your-secret-key-at-least-32-chars
PORT=3000
BASE_PATH=/api
```

Create `artifacts/chess-platform/.env`:

```env
PORT=5173
BASE_PATH=/
```

### 4. Run database migrations

```bash
pnpm --filter @workspace/db run migrate
```

### 5. Start development servers

In two separate terminals:

```bash
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/chess-platform run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import project on Vercel

Go to [vercel.com](https://vercel.com) → **Add New Project** → select your GitHub repo.

### 3. Set environment variables

In Vercel dashboard → **Settings** → **Environment Variables**:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `SESSION_SECRET` | A random 32+ character secret |
| `PORT` | `3000` |
| `BASE_PATH` | `/` |

### 4. Deploy

Vercel auto-deploys on every push to `main`. The build command and output directory are configured in `vercel.json`.

---

## API Overview

All endpoints are prefixed with `/api`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/players/register` | Register a new account |
| `POST` | `/api/players/login` | Sign in, returns JWT |
| `POST` | `/api/players/guest` | Create a temporary guest account |
| `POST` | `/api/games/ai` | Start a game against the AI |
| `POST` | `/api/games/room` | Create a private invite room |
| `POST` | `/api/games/room/:code/join` | Join a room by code |
| `GET` | `/api/games/:id` | Get game state |
| `GET` | `/api/leaderboard` | Global rankings |
| `GET` | `/api/stats` | Platform statistics |

### WebSocket Events (`/api/ws/socket.io`)

| Event (emit) | Payload | Description |
|---|---|---|
| `game:join` | `{ gameId, playerId }` | Join a game room |
| `game:move` | `{ gameId, playerId, uci }` | Submit a move |
| `game:resign` | `{ gameId, playerId }` | Resign the game |
| `game:draw-offer` | `{ gameId, playerId }` | Offer a draw |
| `game:draw-accept` | `{ gameId, playerId }` | Accept a draw offer |
| `game:draw-decline` | `{ gameId, playerId }` | Decline a draw offer |

| Event (on) | Description |
|---|---|
| `game:state` | Full game state on join or resync |
| `move:confirmed` | Move accepted, includes new FEN and clocks |
| `move:rejected` | Move was illegal |
| `game:over` | Game ended, includes result and reason |
| `game:draw-offered` | Opponent offered a draw |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT © ChessForge contributors
