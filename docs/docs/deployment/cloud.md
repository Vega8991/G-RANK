---
sidebar_position: 1
title: Cloud Deployment
---

# Cloud Deployment

G-RANK is designed for deployment with:

| Component | Recommended Platform | Free Tier |
|---|---|---|
| **Frontend** | Vercel | Yes |
| **Backend** | Railway or Render | Yes (with limits) |
| **Database** | MongoDB Atlas | Yes (512 MB) |

---

## MongoDB Atlas Setup

Set up the database first since both backend and frontend need the connection string.

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Create a new **Shared (M0 free)** cluster.
3. Create a database user (username + password — store these securely).
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from any IP (or restrict to your backend host's IP range).
5. Click **Connect** → **Connect your application** → copy the connection string.

The connection string format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, and `<dbname>` (`grank` recommended) with your values.

---

## Backend — Railway

[Railway](https://railway.app) offers simple Node.js hosting with automatic deploys from GitHub.

### Setup

1. Sign up at [railway.app](https://railway.app) and connect your GitHub account.
2. Click **New Project** → **Deploy from GitHub repo** → select the G-RANK repository.
3. Railway detects Node.js automatically.

### Configuration

In Railway's project settings, set the **Root Directory** to `backend/` (since it is a monorepo).

Set the **Start Command** to:
```
npm start
```

Or ensure `package.json` in `backend/` has a `start` script:
```json
"scripts": {
  "start": "node src/server.js"
}
```

### Environment Variables

In Railway → Settings → Variables, add all backend environment variables:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<production-secret>
JWT_EXPIRE=7d
EMAIL_USER=grank.noreply@gmail.com
EMAIL_PASS=<gmail-app-password>
EMAIL_FROM=G-Rank <grank.noreply@gmail.com>
FRONTEND_URL=https://your-frontend.vercel.app
CLIENT_URL=https://your-frontend.vercel.app
RIOT_API_KEY=RGAPI-...
RIOT_CLIENT_ID=...
RIOT_CLIENT_SECRET=...
RIOT_REDIRECT_URI=https://your-backend.railway.app/api/riot/oauth/callback
```

Railway provides a public URL like `https://grank-api-production.up.railway.app`. Use this as your backend URL.

---

## Backend — Render (Alternative)

[Render](https://render.com) is another popular Node.js hosting platform.

### Setup

1. Sign up at [render.com](https://render.com) and connect GitHub.
2. Click **New** → **Web Service** → select the G-RANK repo.
3. Set **Root Directory** to `backend/`.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Choose the **Free** instance type.

### Environment Variables

Same as Railway — add all backend variables in the Render dashboard under Environment.

Render provides a URL like `https://grank-api.onrender.com`.

:::caution Free Tier Spin-Down
Render free tier services spin down after 15 minutes of inactivity and take ~30 seconds to wake up on the next request. Consider Railway or a paid Render plan for production use.
:::

---

## Frontend — Vercel

[Vercel](https://vercel.com) is the recommended platform for the React/Vite frontend.

### Setup

1. Sign up at [vercel.com](https://vercel.com) and connect your GitHub account.
2. Click **Add New Project** → select the G-RANK repository.
3. In **Configure Project**, set:
   - **Root Directory:** `frontend/`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:

```
VITE_API_URL=https://your-backend.railway.app
```

5. Click **Deploy**.

Vercel provides a URL like `https://grank.vercel.app`.

### Custom Domain

In Vercel → Settings → Domains, add your custom domain and follow the DNS configuration instructions.

---

## Post-Deployment Checklist

After deploying both services, verify the following:

- [ ] Backend responds at `https://<backend-url>/api/leaderboard`
- [ ] Frontend loads at `https://<frontend-url>`
- [ ] `FRONTEND_URL` in backend env matches the Vercel URL exactly
- [ ] `VITE_API_URL` in frontend env matches the Railway/Render URL exactly
- [ ] `RIOT_REDIRECT_URI` points to the production backend callback URL
- [ ] MongoDB Atlas IP whitelist includes the backend host (or `0.0.0.0/0`)
- [ ] SSL/HTTPS is enabled on both services (Vercel and Railway/Render provide this automatically)
- [ ] Register a test account and confirm email verification works
- [ ] Login and access the Dashboard

---

## Deployment Workflow

G-RANK does not have automated CI/CD. The current workflow is **manual deploy**:

1. Develop on the `dev` branch
2. Create a PR from `dev` → `main`
3. Tests pass on the `testing` branch
4. Merge PR to `main`
5. In Vercel and Railway: click **Redeploy** (or set up automatic deploys from `main`)

Future improvement: add GitHub Actions workflows to auto-deploy on push to `main`.
