# Chess Platform

A production-grade, scalable chess platform with full rule engine, real-time multiplayer, AI opponent, ELO rating, post-game analysis, and a premium dark UI.

## Architecture

### Monorepo Structure
```
artifacts/
  api-server/     — Express 5 REST + Socket.io backend (port 8080, path /api)
  chess-platform/ — React + Vite frontend (port 23109, path /)
lib/
  db/             — Drizzle ORM schema + migrations (@workspace/db)
  api-spec/       — OpenAPI spec + Orval codegen config
  api-zod/        — Zod schemas generated from OpenAPI
  api-client-react/ — React Query hooks generated from OpenAPI
```

### Frontend Pages
- `/` — Home lobby with quick-play buttons (Bullet/Blitz/Rapid), platform stats
- `/auth` — Login / Register / Play as Guest
- `/play` — Full play page with AI difficulty + all time controls + room creation
- `/game/:id` — Live chess game with custom board, real-time clocks, move list, resign
- `/analysis/:id` — Post-game analysis with move navigation and game info
- `/leaderboard` — Ranked player table with ratings, games, win %
- `/profile/:id` — Player profile with stats and recent games

### Backend
- **chess-engine.ts** — chess.js wrapper with full rule validation, move application
- **game-manager.ts** — AI games, room creation, matchmaking queue, move processing, ELO finalization
- **elo.ts** — K-factor ELO calculator
- **websocket.ts** — Socket.io server at `/api/ws/socket.io` for real-time events
- **Routes**: `/api/players`, `/api/games`, `/api/matchmaking`, `/api/analysis`, `/api/leaderboard`, `/api/stats`, `/api/healthz`

### Database (PostgreSQL + Drizzle ORM)
Tables: `players`, `games`, `moves`, `rating_history`

Seeded demo players: Magnus (2840), Hikaru (2780), AliReza (2760), Demo (1500)

### Auth
- JWT-based auth via `SESSION_SECRET` env var
- bcryptjs password hashing
- Guest account creation
- Tokens stored in localStorage (`chess_token`, `chess_player`)

### WebSocket Events
- `game:join` — Join a game room
- `game:move` — Make a move (UCI format)
- `game:resign` — Resign
- `game:state` — Full game state broadcast
- `move:confirmed` — Move accepted with updated FEN + clocks
- `game:over` — Game ended with result

### Design System
- Dark mode exclusive: `#0B0F19` background
- Board colors: `#f0d9b5` (light), `#b58863` (dark) — classic chess.com style
- Primary: Emerald `#10B981`
- Accent: Amber `#F59E0B`
- Custom CSS Grid chessboard with Unicode pieces, selection + legal move hints

## Key Technical Notes

- **Codegen**: After changes to `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`. Keep `lib/api-zod/src/index.ts` as single `export * from "./generated/api"` after codegen.
- **TypeScript**: Run `pnpm run typecheck:libs` then `pnpm run typecheck` for full check.
- **Logging**: Use `req.log` in route handlers and `logger` singleton elsewhere. No `console.log` in server code.
- **Time controls**: Stored as `{ initialSeconds, incrementSeconds, label }` in JSONB column.
- **AI opponent**: Random legal moves from chess.js on backend (`game-manager.ts`).

## Running
- API server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/chess-platform run dev`
