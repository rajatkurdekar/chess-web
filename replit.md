# ChessForge

A production-grade chess platform with full rule engine, real-time multiplayer WebSockets, AI opponent with minimax, ELO rating system, post-game analysis with eval bar, and a premium dark UI.

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
- `/play` — Full play page with AI difficulty + all time controls + room creation + invite link
- `/game/:id` — Live chess game with custom SVG board, real-time clocks, move list, resign/draw
- `/analysis/:id` — Post-game analysis with eval bar, move quality indicators, keyboard navigation
- `/leaderboard` — Ranked player table with ratings, games, win %
- `/profile/:id` — Player profile with stats and recent games

### Backend
- **chess-engine.ts** — chess.js wrapper with:
  - Full rule validation + move application (`validateAndApplyMove`)
  - Minimax AI with alpha-beta pruning + piece-square tables (`getBestAiMove`)
  - Material + positional evaluation function
- **game-manager.ts** — AI games, room creation, matchmaking queue, move processing, ELO finalization
- **elo.ts** — K-factor ELO calculator
- **websocket.ts** — Socket.io server at `/api/ws/socket.io`:
  - AI moves triggered automatically after each human move (200-600ms realistic delay)
  - `game:state` sends full moves history on join/resync
  - `aiThinking` Set prevents double AI moves
- **anti-cheat.ts** — Timing-based cheat detection (impossible speed, instant series, robotic consistency)
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
- `game:join` → server sends `game:state` with game + full moves history
- `game:move` → validated, confirmed with `move:confirmed`, AI triggered if AI game
- `game:resign` / `game:draw-offer` / `game:draw-accept` / `game:draw-decline`
- `move:confirmed` — Move accepted with updated FEN + clocks + SAN/UCI
- `game:over` — Game ended with result + reason
- `game:resync` — Full resync for reconnects

### Design System
- Dark mode exclusive; bg `#0D0F17`, card `#13161F`
- Board: `#F0D9B5` (light), `#B58863` (dark) — classic Lichess style
- Primary: Emerald `#22C55E`, Accent: Gold `#F59E0B`
- SVG chess pieces (Lichess-style) in `chess-pieces.tsx`
- Fonts: Inter + JetBrains Mono + Playfair Display (loaded via `<link>` in index.html ONLY)
- Custom CSS classes: `.glass-card`, `.board-shadow`, `.piece-lift`, `.clock-active`, `.clock-low`

## Key Technical Notes

- **AI Engine**: Minimax with alpha-beta pruning, piece-square tables. Depth 1 (beginner) to depth 4 (hard).
  Depth-1 shuffles moves for unpredictability. AI player ID is the string `"ai"`.
- **Move format**: All moves stored and transmitted as UCI (e.g. `e2e4`, `e7e8q`).
  chess.js requires `{from, to, promotion}` object — never pass raw UCI strings to `chess.move()`.
- **Analysis replay**: Uses `uciToMove()` helper to parse UCI → `{from,to,promotion}` object before calling chess.js.
- **Captured pieces**: Computed from FEN diff vs. starting position. Displayed in `PlayerBar` via `onCapturedUpdate` callback from `ChessBoard`.
- **Codegen**: After changes to `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`.
- **TypeScript**: Run `pnpm run typecheck` for full check (zero errors expected).
- **Logging**: Use `req.log` in route handlers and `logger` singleton elsewhere. No `console.log` in server code.
- **Time controls**: Stored as `{ initialSeconds, incrementSeconds, label }` in JSONB column.
- **CSS**: `@import "tailwindcss"` MUST be first line in `index.css`. No Google Fonts `@import url()` in CSS.

## Running
- API server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/chess-platform run dev`
