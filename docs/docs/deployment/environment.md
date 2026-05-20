---
sidebar_position: 2
title: Production Environment Variables
---

# Production Environment Variables

This page documents environment variable values specific to production deployments and how they differ from local development.

---

## Key Differences from Development

| Variable | Development | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `MONGO_URI` | Local or dev Atlas | Production Atlas cluster |
| `FRONTEND_URL` | `http://localhost:5173` | `https://your-app.vercel.app` |
| `RIOT_REDIRECT_URI` | `http://localhost:5000/...` | `https://your-api.railway.app/...` |
| `JWT_SECRET` | Any random string | Long, cryptographically random, never shared |

---

## Backend Production Environment

Set these in your hosting platform's environment variable dashboard (Railway / Render / etc.):

```env
# Server
PORT=5000
NODE_ENV=production

# Database — use production Atlas cluster
MONGO_URI=mongodb+srv://produser:prodpassword@prod-cluster.mongodb.net/grank?retryWrites=true&w=majority

# JWT — use a production-grade secret
JWT_SECRET=<64-character-random-hex-string>
JWT_EXPIRE=7d

# Email
EMAIL_USER=grank.noreply@gmail.com
EMAIL_PASS=<gmail-app-password>
EMAIL_FROM=G-Rank <grank.noreply@gmail.com>

# URLs — replace with actual deployed URLs
FRONTEND_URL=https://grank.vercel.app
CLIENT_URL=https://grank.vercel.app

# Riot Games — update redirect URI to production backend
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
RIOT_CLIENT_ID=your-rso-client-id
RIOT_CLIENT_SECRET=your-rso-client-secret
RIOT_REDIRECT_URI=https://grank-api.railway.app/api/riot/oauth/callback
```

---

## Frontend Production Environment

Set in Vercel → Project Settings → Environment Variables:

```env
VITE_API_URL=https://grank-api.railway.app
```

:::caution
Vercel injects these at **build time**. After changing env vars in Vercel, you must **redeploy** for the new values to take effect.
:::

---

## Generating a Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This produces a 128-character hex string. Use the full output as `JWT_SECRET`.

---

## Cookie Security in Production

When `NODE_ENV=production`, the server should set cookies with `secure: true`:

```javascript
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
});
```

This ensures cookies are only transmitted over HTTPS, preventing interception over plain HTTP.

---

## Riot RSO OAuth — Production Registration

For the Riot OAuth integration to work in production:

1. Go to [developer.riotgames.com](https://developer.riotgames.com)
2. Register or update your application with the production redirect URI:
   ```
   https://grank-api.railway.app/api/riot/oauth/callback
   ```
3. Update `RIOT_REDIRECT_URI` in the backend env accordingly.

Note: Riot production API keys require approval. Development keys (RGAPI-...) expire every 24 hours.

---

## MongoDB Atlas — Production Security

For production:

1. Create a **separate Atlas project** (do not share with development data).
2. Use a **separate database user** with only `readWrite` privileges on the `grank` database.
3. Under **Network Access**, restrict IP addresses to your backend host's IP range (more secure than `0.0.0.0/0`).
4. Enable **Atlas Backup** for data protection.

---

## Monitoring

No dedicated monitoring service is currently configured. For production, consider:

| Tool | Purpose | Free Tier |
|---|---|---|
| [UptimeRobot](https://uptimerobot.com) | Uptime monitoring and alerts | Yes |
| [Sentry](https://sentry.io) | Error tracking (frontend + backend) | Yes |
| [MongoDB Atlas Monitoring](https://cloud.mongodb.com) | DB performance metrics | Built-in |
