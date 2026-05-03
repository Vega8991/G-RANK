# G-RANK

A competitive esports platform with a full MMR ranking system, Riot Games account integration, lobby management, and an admin panel. Built with a React + TypeScript frontend and a Node.js + Express + MongoDB backend.

---

## Features

- **Authentication** — Register, login, email verification, forgot/reset password
- **Riot Games Integration** — Link your League of Legends or TFT account to display in-game stats on your profile
- **Lobby System** — Create, join, and leave competitive lobbies with configurable game settings
- **MMR Ranking** — Dynamic ranking system across 7 tiers based on match results
- **Leaderboard** — Global ranking table sorted by MMR
- **Dashboard** — Personal overview of stats, linked accounts, and active lobbies
- **Profile** — View and manage your account, linked Riot profile, and match history
- **Admin Panel** — Full user and tournament management for admins

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4 |
| **UI / Animation** | Framer Motion, GSAP, Three.js, Radix UI, shadcn/ui, Lucide React |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose |
| **Auth** | JWT, bcryptjs, Nodemailer |
| **External APIs** | Riot Games API (via axios) |

---

## Requirements

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Gmail account (for email verification and password reset)
- Riot Games API key ([developer.riotgames.com](https://developer.riotgames.com))

---

## Installation

```bash
git clone https://github.com/Vega8991/G-RANK.git
cd G-RANK
cd backend && npm install
cd ../frontend && npm install
```

---

## Configuration

Create a `.env` file inside the `backend/` folder:

```env
# Database
MONGO_URI=mongodb://localhost:27017/grank

# Auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Server
PORT=5000

# Email (Nodemailer via Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=G-Rank <your-email@gmail.com>

# URLs
FRONTEND_URL=http://localhost:5173

# Riot Games
RIOT_API_KEY=your_riot_api_key
```

### Getting `EMAIL_PASS`
1. Enable 2-factor authentication on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an app password for "G-Rank" and paste it as `EMAIL_PASS`

### Getting `RIOT_API_KEY`
1. Sign in at [developer.riotgames.com](https://developer.riotgames.com)
2. Generate a development key (refreshes every 24 hours) or register a production app for a persistent key

---

## Running the App

From the project root, run both services at once:

```bash
./start.sh
```

Or start them separately:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## API Documentation (Swagger)

Interactive API docs are served from the `Doc_G-RANK/` folder:

```bash
cd Doc_G-RANK
npm install
npm start
```

| Resource | URL |
|---|---|
| Swagger UI | http://localhost:8080/docs |
| API Base | http://localhost:8080 |

A Postman collection is also available at the root: `G-RANK API.postman_collection.json`

---

## Ranking System

MMR starts at 0 and adjusts after every match result.

| Rank | MMR Range | Win | Loss |
|---|---|---|---|
| Bronze | 0 – 499 | +50 | −25 |
| Silver | 500 – 999 | +40 | −20 |
| Gold | 1000 – 1499 | +32 | −18 |
| Platinum | 1500 – 1999 | +30 | −20 |
| Diamond | 2000 – 2499 | +25 | −25 |
| Master | 2500 – 2999 | +20 | −25 |
| Elite | 3000+ | +15 | −30 |

---

## Project Structure

```
G-RANK/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middlewares/   # Auth & admin guards
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers
│   │   └── services/      # Business logic (MMR, email, Riot API)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level views
│   │   ├── services/      # API client functions
│   │   └── types/         # TypeScript interfaces
│   └── index.html
├── Doc_G-RANK/            # Swagger API documentation server
├── start.sh               # One-command dev launcher
└── G-RANK API.postman_collection.json
```

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready releases |
| `dev` | Integration branch — all features merged here first |
| `frontend` | Frontend-only work |
| `backend` | Backend-only work |
