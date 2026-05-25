---
sidebar_position: 1
title: Frontend Overview
---

# Frontend Overview

The G-RANK frontend is a **React 19 Single Page Application** built with Vite 7 and TypeScript. It communicates with the backend REST API via Axios and uses React Router v7 for client-side routing.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI library with concurrent features |
| TypeScript | 5.x | Type safety throughout the codebase |
| Vite | 7 | Build tooling and dev server (port 5173) |
| Tailwind CSS | v4 | Utility-first styling |
| React Router | v7 | Client-side routing with lazy loading |
| Framer Motion | Latest | Page transitions and component animations |
| Three.js + R3F | Latest | WebGL 3D effects (landing page) |
| GSAP | Latest | Advanced timeline animations |
| Axios | Latest | HTTP client (withCredentials: true) |

---

## Directory Structure

```
frontend/
├── public/                   # Static assets served directly
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/             # ProtectedRoute
│   │   ├── common/           # Button, Card, Label, ErrorBoundary, Spinner
│   │   ├── landing/          # Landing page sections
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── lobbies/          # Lobby list components
│   │   ├── admin/            # Admin panel components
│   │   ├── ui/               # WebGL/3D visual components
│   │   └── cursor/           # Custom cursor
│   ├── hooks/                # Custom React hooks
│   │   ├── useAdmin.ts
│   │   ├── useDashboard.ts
│   │   ├── useLobbies.ts
│   │   └── useViewportPrefetch.ts
│   ├── pages/                # Route-level page components
│   │   ├── LandingPage.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Lobbies.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Admin.tsx
│   │   └── ...
│   ├── services/             # API client modules
│   │   ├── apiClient.ts      # Axios instance
│   │   ├── authService.ts
│   │   ├── lobbyService.ts
│   │   ├── matchService.ts
│   │   ├── leaderboardService.ts
│   │   ├── riotService.ts
│   │   └── adminService.ts
│   ├── App.tsx               # Root component + route definitions
│   └── main.tsx              # React DOM render entry point
├── .env                      # VITE_API_URL (not committed)
├── index.html
├── vite.config.ts
└── tsconfig.json
```

---

## Routing

Routes are defined in `App.tsx` using React Router v7. Pages are **lazy-loaded** to reduce initial bundle size.

```
/                     → LandingPage        (public)
/login                → Login              (public, redirect if authed)
/register             → Register           (public, redirect if authed)
/forgot-password      → ForgotPassword     (public)
/reset-password       → ResetPassword      (public)
/verify-email         → VerifyEmail        (public)
/dashboard            → Dashboard          (protected — USER)
/lobbies              → Lobbies            (protected — USER)
/leaderboard          → Leaderboard        (protected — USER)
/admin                → Admin              (protected — ADMIN)
*                     → NotFound           (404 fallback)
```

### Route Protection

`ProtectedRoute` wraps private routes. It reads the `auth_info` cookie to determine authentication state and role, then redirects unauthenticated users to `/login` and non-admin users away from `/admin`.

```tsx
// components/auth/ProtectedRoute.tsx
<ProtectedRoute requiredRole="ADMIN">
  <Admin />
</ProtectedRoute>
```

---

## API Client

All backend calls go through a single Axios instance:

```typescript
// services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true, // Include httpOnly JWT cookie
});

export default apiClient;
```

Response interceptors handle `401` responses by redirecting to `/login`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL (no trailing slash) | `http://localhost:5000` |

Vite exposes env variables prefixed with `VITE_` to the browser via `import.meta.env.VITE_*`.

---

## Build Output

```bash
cd frontend
npm run build
```

Produces an optimized static bundle in `frontend/dist/` suitable for deployment to Vercel, Netlify, or any static host.

The build includes:
- Code splitting per route (lazy imports)
- Asset hashing for cache busting
- Tree-shaken Tailwind CSS
- TypeScript type checking
