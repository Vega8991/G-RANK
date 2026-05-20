---
sidebar_position: 2
title: Environment Variables
---

# Environment Variables

G-RANK uses environment variables for configuration. The backend reads from `backend/.env` and the frontend reads from `frontend/.env`.

---

## Backend — `backend/.env`

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on |
| `NODE_ENV` | No | `development` | Runtime environment: `development` or `production` |

### Database

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | **Yes** | Full MongoDB connection string (Atlas or local) |

**Examples:**
```env
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/grank

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster0.abcde.mongodb.net/grank?retryWrites=true&w=majority
```

### Authentication (JWT)

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | **Yes** | Secret key for signing and verifying JWT tokens |
| `JWT_EXPIRE` | No | Token expiry duration (default: `7d`) |

:::caution Security
`JWT_SECRET` must be a long, random string. Never reuse a development secret in production. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
:::

**JWT_EXPIRE format** follows the `ms` library / jsonwebtoken conventions:
- `7d` — 7 days
- `24h` — 24 hours
- `3600` — 3600 seconds

### Email (Nodemailer / Gmail)

| Variable | Required | Description |
|---|---|---|
| `EMAIL_USER` | **Yes** | Gmail address used to send emails |
| `EMAIL_PASS` | **Yes** | Gmail App Password (not your account password) |
| `EMAIL_FROM` | No | Display name and address for outgoing emails |

```env
EMAIL_USER=grank.noreply@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop    # 16-character Gmail App Password
EMAIL_FROM=G-Rank <grank.noreply@gmail.com>
```

:::info Gmail App Passwords
To generate an App Password:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Create a new app password for "Mail"
4. Use the 16-character code as `EMAIL_PASS`
:::

### URLs

| Variable | Required | Description |
|---|---|---|
| `FRONTEND_URL` | **Yes** | Frontend origin for CORS and email links |
| `CLIENT_URL` | No | Alias for `FRONTEND_URL` (some features may use this) |

```env
# Development
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://grank.vercel.app
```

### Riot Games API

| Variable | Required | Description |
|---|---|---|
| `RIOT_API_KEY` | **Yes** (for LoL) | Development API key from developer.riotgames.com |
| `RIOT_CLIENT_ID` | Yes (for OAuth) | RSO OAuth application client ID |
| `RIOT_CLIENT_SECRET` | Yes (for OAuth) | RSO OAuth application client secret |
| `RIOT_REDIRECT_URI` | Yes (for OAuth) | OAuth callback URL registered in Riot dev portal |

```env
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
RIOT_CLIENT_ID=your-rso-client-id
RIOT_CLIENT_SECRET=your-rso-client-secret
RIOT_REDIRECT_URI=http://localhost:5000/api/riot/oauth/callback
```

:::info Riot API Keys
Development API keys from [developer.riotgames.com](https://developer.riotgames.com) expire every 24 hours. For production, apply for a personal or production application key.
:::

---

## Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Base URL of the backend API (no trailing slash) |

```env
# Development
VITE_API_URL=http://localhost:5000

# Production
VITE_API_URL=https://grank-api.railway.app
```

**Important:** Vite only exposes variables prefixed with `VITE_` to the browser bundle. Other variables remain server-side.

In code, access via:
```typescript
import.meta.env.VITE_API_URL
```

---

## Full Example — `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/grank

# JWT
JWT_SECRET=replace-with-a-very-long-random-string-at-least-64-chars
JWT_EXPIRE=7d

# Email
EMAIL_USER=grank.noreply@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=G-Rank <grank.noreply@gmail.com>

# URLs
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Riot Games
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
RIOT_CLIENT_ID=your-rso-client-id
RIOT_CLIENT_SECRET=your-rso-client-secret
RIOT_REDIRECT_URI=http://localhost:5000/api/riot/oauth/callback
```

---

## Full Example — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```
