---
sidebar_position: 1
title: Repository Structure
---

# Repository Structure

G-RANK is organized as a **monorepo** — the frontend, backend, and documentation all live in the same Git repository.

---

## Monorepo Layout

```
G-RANK/                           # Repository root
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/               # Database connection, env setup
│   │   ├── controllers/          # Request handlers (auth, lobby, match, riot, admin)
│   │   ├── middleware/           # authMiddleware, adminMiddleware
│   │   ├── models/               # Mongoose schemas (User, Lobby, LobbyParticipant, MatchResult)
│   │   ├── routes/               # Express routers
│   │   └── services/             # Business logic, external API calls
│   ├── tests/                    # Backend test files
│   ├── package.json
│   └── .env                      # Not committed — see .gitignore
│
├── frontend/                     # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── components/           # Reusable UI components (by domain)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Route-level page components
│   │   └── services/             # Axios-based API service modules
│   ├── public/                   # Static assets
│   ├── package.json
│   └── .env                      # Not committed
│
├── docs/                         # Docusaurus documentation site (this site)
│   ├── docs/                     # Markdown documentation pages
│   ├── src/                      # Docusaurus custom components/pages
│   └── docusaurus.config.ts
│
├── start.sh                      # Convenience script: start backend + frontend
├── README.md                     # Project overview
├── .gitignore
└── package-lock.json             # Root-level lock (if any shared tooling)
```

---

## Branch Strategy

The repository uses a **three-branch workflow**:

| Branch | Purpose | Merges into |
|---|---|---|
| `main` | Production-ready code | — (protected) |
| `dev` | Active development | `main` |
| `testing` | QA and automated tests | `dev` |

### Workflow

```
feature-branch → dev → testing → dev → main
```

1. **Feature development:** Create a feature branch from `dev`.
2. **Pull Request to `dev`:** Open a PR, request review, merge after approval.
3. **Testing:** Periodically merge `dev` into `testing`; run the full test suite.
4. **Release:** After tests pass, merge `dev` into `main` via PR.
5. **Deploy:** Manually trigger redeploy on Vercel and Railway.

### Branch Protection

- `main` is the production branch and should be protected:
  - Require PR reviews before merging
  - Require tests to pass
  - No direct pushes

---

## `.gitignore` Key Entries

```gitignore
# Environment files
backend/.env
frontend/.env
.env

# Dependencies
node_modules/
*/node_modules/

# Build outputs
frontend/dist/
docs/.docusaurus/
docs/build/

# Coverage reports
coverage/
*/coverage/

# IDE files
.vscode/
.idea/
```

---

## Package Management

Both `backend/` and `frontend/` have their own `package.json` and `node_modules/`. They are **not** workspaces — each is installed independently.

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install

# Install docs dependencies
cd docs && npm install
```
