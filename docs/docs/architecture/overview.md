---
sidebar_position: 1
title: Architecture Overview
---

# Architecture Overview

G-RANK follows a classic **client/server** architecture with a clear separation between the React SPA frontend and the Express REST API backend. Both live in the same monorepo but are independently deployable.

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                              │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                React 19 SPA — Vite 7                           │  │
│  │                                                                │  │
│  │   React Router v7  ──  URL-based routing, lazy-loaded pages   │  │
│  │   Tailwind CSS v4  ──  Utility-first styling                  │  │
│  │   Framer Motion    ──  Page transitions and micro-animations  │  │
│  │   Three.js / R3F   ──  WebGL effects on landing page          │  │
│  │   Axios            ──  HTTP client (withCredentials: true)    │  │
│  └───────────────────────────────┬────────────────────────────────┘  │
│                                  │                                    │
│            HTTP + httpOnly Cookie (JWT) + JSON body                  │
└──────────────────────────────────┼────────────────────────────────────┘
                                   │
                    REST API calls on port 5000
                                   │
┌──────────────────────────────────▼────────────────────────────────────┐
│                         SERVER (Node.js 18+)                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                Express 5 — REST API                            │  │
│  │                                                                │  │
│  │  Middleware Stack:                                             │  │
│  │    CORS (origin: FRONTEND_URL, credentials: true)             │  │
│  │    cookie-parser                                               │  │
│  │    express.json()                                              │  │
│  │    authMiddleware  (verifyToken — JWT from httpOnly cookie)    │  │
│  │    adminMiddleware (requireAdmin — role check)                 │  │
│  │                                                                │  │
│  │  Route Modules:                                                │  │
│  │    /api/auth           → authController                        │  │
│  │    /api/lobbies        → lobbyController                       │  │
│  │    /api/lobby-participants → participantController             │  │
│  │    /api/match-results  → matchResultController                 │  │
│  │    /api/leaderboard    → leaderboardController                 │  │
│  │    /api/riot           → riotController                        │  │
│  │    /api/admin          → adminController                       │  │
│  └───────────────────────────────┬────────────────────────────────┘  │
│                                  │                                    │
│          Mongoose ODM (schema validation + query builder)            │
└──────────────────────────────────┼────────────────────────────────────┘
                                   │
             ┌─────────────────────┴──────────────────────┐
             │                                            │
             ▼                                            ▼
┌────────────────────────┐              ┌─────────────────────────────┐
│  MongoDB Atlas / Local │              │      External Services      │
│                        │              │                             │
│  Collections:          │              │  Riot Games API (RGAPI)    │
│  • users               │              │  Riot RSO OAuth             │
│  • lobbies             │              │  Gmail SMTP (Nodemailer)    │
│  • lobbyparticipants   │              └─────────────────────────────┘
│  • matchresults        │
└────────────────────────┘
```

---

## Communication Pattern

| Aspect | Detail |
|---|---|
| Protocol | HTTP/HTTPS (REST) |
| Data format | JSON |
| Authentication | JWT token sent as `token` httpOnly cookie |
| CORS | Restricted to `FRONTEND_URL` with `credentials: true` |
| Cookie scope | `httpOnly: true`, `sameSite: strict`, `secure` in production |
| Supplementary cookie | `auth_info` — non-httpOnly, contains `username` + `role` for client-side UI hints |

---

## Version Requirements

| Technology | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.x | Required for modern crypto APIs and ESM |
| npm | 9.x | Bundled with Node 18+ |
| MongoDB | 6.x (local) or Atlas | Mongoose 9 targets MongoDB 6+ wire protocol |
| Express | 5.x | Used for improved async error handling |
| React | 19.x | Concurrent features, Server Components ready |
| Vite | 7.x | Faster builds, improved TypeScript support |

---

## Data Flow — Authenticated Request

```
1. Browser sends GET /api/lobbies
   ↳ Cookie header includes: token=<JWT>

2. Express middleware (authMiddleware.verifyToken)
   ↳ Reads cookie → verifies JWT signature → attaches req.user

3. Controller (lobbyController.getLobbies)
   ↳ Builds Mongoose query with filters/pagination
   ↳ Returns JSON { lobbies, total, page, pages }

4. Frontend (lobbyService.getLobbies)
   ↳ Receives data → React state update → re-render
```

---

## Data Flow — Authentication

```
1. POST /api/auth/login  { email, password }

2. Server:
   a. Find user by email (Mongoose)
   b. Compare password hash (bcrypt.compare)
   c. Check emailVerified === true
   d. Sign JWT (jwt.sign, expires 7d)
   e. Set httpOnly cookie: res.cookie('token', jwt, { httpOnly, sameSite, secure })
   f. Set readable cookie: res.cookie('auth_info', JSON.stringify({ username, role }))

3. Client:
   a. Browser stores cookies automatically
   b. authService reads auth_info cookie for UI state
   c. All subsequent requests automatically include cookies
```

---

## Separation of Concerns

| Layer | Responsibility |
|---|---|
| **Routes** (`routes/`) | Define URL → middleware → controller mapping |
| **Middleware** (`middleware/`) | Cross-cutting concerns: auth, role checks |
| **Controllers** (`controllers/`) | Request parsing, response formatting, orchestration |
| **Services** (`services/`) | Business logic, external API calls (Riot), email |
| **Models** (`models/`) | Mongoose schemas, virtuals, instance methods |
| **Config** (`config/`) | DB connection setup, environment loading |

---

## Scalability Considerations

- **Stateless API:** JWT-based auth means no server-side session storage — horizontal scaling is straightforward.
- **MongoDB Atlas:** Managed cloud database with built-in replication and auto-scaling.
- **Vite SPA:** Static build output can be served from CDN (Vercel Edge Network).
- **No WebSockets:** Real-time features are not yet implemented; polling or SSE would be the next step.
