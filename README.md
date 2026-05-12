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
- [Swagger Docs](#swagger-docs)

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
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Framer Motion, Axios |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer |
| **Auth** | httpOnly cookies (JWT token + readable auth_info cookie) |
| **3D / UI** | Three.js, @react-three/fiber, GSAP, Lucide Icons, Radix UI |
| **Testing** | Vitest + Testing Library (frontend), Jest (backend) |

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
│       ├── components/             # UI components (admin, auth, dashboard, lobbies…)
│       ├── hooks/                  # Custom React hooks
│       ├── layouts/                # AppLayout wrapper
│       ├── pages/                  # Page components
│       ├── services/               # API service functions
│       ├── types/                  # TypeScript interfaces
│       └── test/                   # Vitest test suites
├── Doc_G-RANK/                     # Swagger API documentation server
├── start.sh                        # Dev startup script (runs both servers)
└── G-RANK API.postman_collection.json
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Gmail account** with App Password enabled (for email verification)
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

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=G-Rank <your-email@gmail.com>

# URLs
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Riot Games API (optional)
RIOT_API_KEY=your_riot_api_key
RIOT_CLIENT_ID=your_rso_client_id
RIOT_CLIENT_SECRET=your_rso_client_secret
RIOT_REDIRECT_URI=http://localhost:5000/api/riot/oauth/callback
```

### Getting Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to **Google Account → Security → App passwords**
3. Generate a new app password for "G-Rank"
4. Paste it as `EMAIL_PASS` in your `.env`

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
npm test -- --coverage
```

---

## Swagger Docs

Interactive API documentation is available via the included Swagger server:

```bash
cd Doc_G-RANK
npm install
npm start
```

Then open:

- **Swagger UI:** http://localhost:8080/docs
- **API base URL:** http://localhost:8080
