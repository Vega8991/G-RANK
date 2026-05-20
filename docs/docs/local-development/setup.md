---
sidebar_position: 1
title: Local Setup
---

# Local Development Setup

This guide walks you through setting up G-RANK on your local machine for development.

---

## Prerequisites

| Requirement | Minimum Version | Installation |
|---|---|---|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Bundled with Node.js |
| MongoDB | 6.x (or Atlas) | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Git | Any recent | [git-scm.com](https://git-scm.com) |

:::tip
Using **MongoDB Atlas** (cloud-hosted free tier) is the simplest option — no local MongoDB installation needed. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
:::

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-org>/G-RANK.git
cd G-RANK
```

---

## Step 2 — Configure the Backend Environment

Create the environment file for the backend:

```bash
cp backend/.env.example backend/.env   # if an example exists
# or create it manually:
touch backend/.env
```

Edit `backend/.env` with your values. See [Environment Variables](./environment-variables.md) for a full reference.

Minimum required variables for local development:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/grank
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=G-Rank <your-gmail@gmail.com>
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

:::caution
Never commit `backend/.env` to version control. It is listed in `.gitignore`.
:::

---

## Step 3 — Configure the Frontend Environment

Create `frontend/.env`:

```bash
touch frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

---

## Step 4 — Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## Step 5 — Start the Development Servers

### Option A — Using `start.sh` (recommended)

From the repo root, run the provided shell script to start both servers simultaneously:

```bash
bash start.sh
```

Both servers will start in the same terminal window (or in separate panes, depending on your shell setup).

### Option B — Manual (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Step 6 — Access the Application

| Service | URL |
|---|---|
| Frontend (React SPA) | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:5000/api](http://localhost:5000/api) |

---

## Step 7 — Create an Admin Account (optional)

The first user registered via the API is a regular USER. To create an ADMIN:

1. Register a regular account normally.
2. Connect to your MongoDB and update the user's role:

```javascript
// In mongosh or MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

---

## Verifying the Setup

### Backend health

```bash
curl http://localhost:5000/api/leaderboard
```

Expected: a JSON response with `{ players: [], total: 0, ... }` (empty on a fresh database).

### Frontend

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the G-RANK landing page.

---

## Available Scripts

### Backend

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start with nodemon (auto-restart on changes) |
| Production | `npm start` | Start without nodemon |
| Tests | `npm test` | Run test suite |

### Frontend

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start Vite dev server with HMR |
| Build | `npm run build` | Production build to `dist/` |
| Preview | `npm run preview` | Preview the production build locally |
| Type check | `npm run typecheck` | Run TypeScript compiler checks |

---

## Troubleshooting

### MongoDB connection failed

- Ensure MongoDB is running locally (`mongod` or MongoDB service)
- Or verify your Atlas connection string is correct and your IP is whitelisted in Atlas Network Access

### Port already in use

```bash
# Find and kill the process on port 5000
lsof -ti:5000 | xargs kill -9
# Or port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS errors in the browser

Ensure `FRONTEND_URL` in `backend/.env` exactly matches the URL you are accessing the frontend from (including `http://` and the port number).

### Emails not sending

For local development, you can skip email verification by directly setting `emailVerified: true` in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { emailVerified: true } }
)
```
