# G-RANK

Competitive esports tournament platform with an MMR-based ranking system. Players register, join lobbies, submit match results, and climb the leaderboard across multiple games.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Overview](#api-overview)
- [Ranking System](#ranking-system)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Features

- User registration with email verification
- JWT authentication via httpOnly cookies
- Competitive lobby creation and management
- MMR-based ranking system (Bronze → Elite)
- Leaderboard with top players
- Riot Games account linking (League of Legends, Valorant)
- Match result submission and replay review
- Admin panel: manage users, lobbies, and platform stats
- Password reset via email
- Route prefetching and animated UI

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19.2, TypeScript 5.9, Vite 7, Tailwind CSS v4, React Router v7, Framer Motion, Axios |
| **Backend** | Node.js 18+, Express 5.2, MongoDB, Mongoose 9, JWT, Bcryptjs, Resend |
| **Auth** | httpOnly cookies (JWT token + readable auth_info cookie) |
| **3D / UI** | Three.js, @react-three/fiber, OGL, GSAP, Lucide Icons, Radix UI, shadcn/ui |
| **Testing** | Vitest 4 + Testing Library (frontend), Jest 30 + mongodb-memory-server (backend) |
| **Docs** | Docusaurus 3 — deployed at https://g-rank-docs.vercel.app |

---

## Project Structure

```
G-RANK/
├── backend/
│   ├── server.js                   # Express entry point
│   └── src/
│       ├── config/                 # Database connection
│       ├── controllers/            # HTTP request handlers
│       ├── middlewares/            # Auth and admin guards
│       ├── models/                 # Mongoose schemas
│       ├── routes/                 # Route definitions
│       ├── services/               # Business logic (email, MMR, Riot)
│       └── utils/                  # Shared utilities
├── frontend/
│   └── src/
│       ├── components/             # UI components (admin, auth, common, dashboard, lobbies, landing…)
│       ├── constants/              # App-wide constants
│       ├── hooks/                  # Custom React hooks
│       ├── layouts/                # AppLayout wrapper
│       ├── lib/                    # Utility helpers (cn, etc.)
│       ├── pages/                  # Page components
│       ├── services/               # API service functions
│       ├── types/                  # TypeScript interfaces
│       └── test/                   # Vitest test suites
├── docs/                           # Docusaurus documentation site
├── start.sh                        # Dev startup script (runs both servers)
└── G-RANK API.postman_collection.json
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Resend account** (free tier at [resend.com](https://resend.com) — for email verification and password reset)
- **Riot Games API key** (optional — required for Riot account linking)

---

## Installation

```bash
git clone https://github.com/Vega8991/G-RANK.git
cd G-RANK

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/grank

# Auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=G-Rank <noreply@grank.vega8991.com>

# URLs
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Riot Games API (optional)
RIOT_API_KEY=your_riot_api_key
RIOT_CLIENT_ID=your_rso_client_id
RIOT_CLIENT_SECRET=your_rso_client_secret
RIOT_REDIRECT_URI=http://localhost:5000/api/riot/oauth/callback
```

### Getting a Resend API Key

1. Create a free account at [resend.com](https://resend.com)
2. Go to **Domains → Add Domain** and add your sending domain
3. Add the DNS records provided by Resend in your DNS provider
4. Once the domain is verified, go to **API Keys → Create API Key**
5. Paste the key as `RESEND_API_KEY` in your `.env`

---

## Running the App

**Option 1 — startup script (recommended):**

```bash
./start.sh
```

**Option 2 — manually in two terminals:**

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## Production Deployment

| Service | URL |
|---------|-----|
| Frontend | https://grank.vega8991.com |
| Backend API | https://grank-backend.onrender.com |
| Docs | https://g-rank-docs.vercel.app |

### Render — Backend environment variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret |
| `JWT_EXPIRE` | `7d` |
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `EMAIL_FROM` | `G-Rank <noreply@grank.vega8991.com>` |
| `FRONTEND_URL` | `https://grank.vega8991.com` |
| `CLIENT_URL` | `https://grank.vega8991.com` |
| `RIOT_API_KEY` | Riot Games API key |
| `RIOT_CLIENT_ID` | Riot OAuth client ID |
| `RIOT_CLIENT_SECRET` | Riot OAuth client secret |
| `RIOT_REDIRECT_URI` | `https://grank-backend.onrender.com/api/riot/oauth/callback` |

### Render — Frontend environment variables (build time)

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://grank-backend.onrender.com/api` |

> The frontend also ships a `frontend/.env.production` file with this value as a fallback for builds where the env var is not explicitly set.

### MongoDB Atlas

Allow network access from any IP (`0.0.0.0/0`) since Render uses dynamic IPs.

---

## API Overview

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | — | Register new user |
| `POST` | `/login` | — | Login (sets cookies) |
| `POST` | `/logout` | ✓ | Logout (clears cookies) |
| `GET` | `/profile` | ✓ | Get own profile |
| `GET` | `/verify-email` | — | Verify email from token |
| `POST` | `/resend-verification` | — | Resend verification email |
| `POST` | `/forgot-password` | — | Request password reset |
| `POST` | `/reset-password` | — | Submit new password |
| `GET` | `/users/:username` | — | Get public user profile |

### Lobbies — `/api/lobbies`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | List all lobbies |
| `POST` | `/` | ✓ | Create lobby |
| `GET` | `/:id` | — | Get lobby by ID |
| `GET` | `/my-created` | ✓ | Get own created lobbies |
| `PATCH` | `/:id/status` | ✓ | Update lobby status |
| `POST` | `/sync-counts` | — | Sync participant counts |

### Lobby Participants — `/api/lobby-participants`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | ✓ | Join a lobby |
| `POST` | `/leave` | ✓ | Leave a lobby |
| `GET` | `/my-lobbies` | ✓ | Get joined lobbies |

### Match Results — `/api/match-results`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/submit-replay` | ✓ | Submit match replay URL |
| `GET` | `/lobby/:lobbyId` | — | Get results for a lobby |

### Leaderboard — `/api/leaderboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | — | Get ranked players |

### Riot Integration — `/api/riot`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/link` | ✓ | Link Riot account |
| `DELETE` | `/unlink` | ✓ | Unlink Riot account |
| `GET` | `/profile` | ✓ | Get own Riot profile |
| `GET` | `/profile/:riotId` | — | Get profile by Riot ID |
| `POST` | `/submit-lol-match` | ✓ | Submit a LoL match |
| `GET` | `/oauth/url` | ✓ | Get Riot OAuth URL |
| `GET` | `/oauth/callback` | — | OAuth callback handler |

### Admin — `/api/admin` (admin role required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/stats` | Platform statistics |
| `GET` | `/users` | List all users |
| `POST` | `/users` | Create user |
| `PATCH` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Delete user |
| `GET` | `/lobbies` | List all lobbies |
| `PATCH` | `/lobbies/:id` | Update lobby |
| `DELETE` | `/lobbies/:id` | Delete lobby |

---

## Ranking System

MMR is awarded or deducted after each match. Higher ranks earn less and lose more to reflect increased competition.

| Rank | MMR Range | Win | Loss |
|------|-----------|-----|------|
| Bronze | 0 – 499 | +50 | −25 |
| Silver | 500 – 999 | +40 | −20 |
| Gold | 1000 – 1499 | +32 | −18 |
| Platinum | 1500 – 1999 | +30 | −20 |
| Diamond | 2000 – 2499 | +25 | −25 |
| Master | 2500 – 2999 | +20 | −25 |
| Elite | 3000+ | +15 | −30 |

---

## Testing

### Frontend (Vitest)

```bash
cd frontend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Coverage report is generated in `frontend/coverage/index.html`.

### Backend (Jest)

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

---

## Documentation

Full documentation is hosted with Docusaurus and deployed on Vercel:

**https://g-rank-docs.vercel.app**

To run the docs site locally:

```bash
cd docs
npm install
npm start
```

Then open **http://localhost:3000**.

To build a static production version:

```bash
cd docs && npm run build
```
