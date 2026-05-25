---
slug: /
sidebar_position: 1
title: Introduction
---

# G-RANK — Competitive Gaming Platform

G-RANK is a full-stack web application built as a **Final Degree Project (TFG)**. It provides a competitive esports platform with MMR-based ranking, lobby management, match tracking, and official Riot Games account integration.

---

## What G-RANK Does

| Feature | Description |
|---|---|
| **MMR Ranking** | Custom rating system with 7 tiers and tier-specific gain/loss rates |
| **Lobby System** | Create and join competitive lobbies for registered games |
| **Match Tracking** | Submit and validate match results (replay URLs, Riot API) |
| **Riot Integration** | Link official Riot accounts via RSO OAuth |
| **Leaderboard** | Global ranked leaderboard paginated and sorted by MMR |
| **Admin Panel** | Full user and lobby management for administrators |
| **Email Verification** | Mandatory email verification before first login |

---

## Tech Stack at a Glance

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose 9) — MongoDB Atlas or local
- **Auth:** JWT stored in httpOnly cookies
- **Email:** Nodemailer (Gmail SMTP)
- **Security:** Bcrypt password hashing

### Frontend
- **Library:** React 19 + TypeScript
- **Bundler:** Vite 7
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Animations:** Framer Motion, GSAP
- **3D/WebGL:** Three.js + React Three Fiber

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│                                                          │
│  React SPA (Vite)  ───── port 5173                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Pages: Landing, Login, Dashboard, Lobbies,      │   │
│  │         Leaderboard, Admin, Riot linking...       │   │
│  └──────────────────────┬───────────────────────────┘   │
│                          │ Axios (REST calls)            │
└──────────────────────────┼──────────────────────────────┘
                           │ HTTP / JSON
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   Backend (Express 5)                    │
│                                                          │
│   Express Server ──── port 5000                         │
│   ┌───────────────┐  ┌────────────────┐                 │
│   │  REST Routes  │  │  Middleware    │                 │
│   │  /api/auth    │  │  authMiddleware│                 │
│   │  /api/lobbies │  │  adminMiddleware│                │
│   │  /api/riot    │  │  CORS / Cookie │                 │
│   │  /api/admin   │  └────────────────┘                 │
│   └───────┬───────┘                                     │
│           │ Mongoose ODM                                 │
└───────────┼──────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────┐   ┌────────────────────┐
│     MongoDB (Atlas / Local)   │   │   Riot Games API   │
│                               │   │   (RSO OAuth +     │
│  Collections:                 │   │    Match data)     │
│  users, lobbies,              │   └────────────────────┘
│  lobbyparticipants,           │
│  matchresults                 │
└───────────────────────────────┘
```

---

## Repository Structure

```
G-RANK/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # DB connection, env
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, admin guards
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   └── services/     # Business logic
│   └── .env              # Environment variables (not committed)
├── frontend/             # React + TypeScript SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Route-level page components
│   │   └── services/     # API client modules
│   └── .env              # Frontend env (not committed)
├── docs/                 # This documentation site
├── start.sh              # Launch both servers simultaneously
└── README.md
```

---

## Games Supported

| Game | Integration | Status |
|---|---|---|
| Pokemon Showdown | Replay URL validation | Available |
| League of Legends | Riot API + RSO OAuth | Available |
| Valorant | Riot API | Planned |

---

## Quick Start

1. Clone the repo and install dependencies for both frontend and backend.
2. Create a `.env` file in `backend/` with all required variables.
3. Run `bash start.sh` from the repo root to start both servers.
4. Frontend: [http://localhost:5173](http://localhost:5173)
5. Backend API: [http://localhost:5000/api](http://localhost:5000/api)

See [Local Development → Setup](./local-development/setup.md) for detailed instructions.
