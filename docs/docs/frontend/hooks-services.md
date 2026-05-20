---
sidebar_position: 4
title: Hooks & Services
---

# Custom Hooks & Services

---

## Custom Hooks — `src/hooks/`

Hooks encapsulate data fetching, state management, and side effects for each feature area. They are the primary interface between pages and the API service layer.

---

### `useAdmin.ts`

Manages all admin panel data and operations.

**State managed:**
- Users list (paginated)
- Lobbies list
- Platform stats
- Loading and error states
- Modal visibility and selected item

**Methods exposed:**
| Method | Description |
|---|---|
| `fetchStats()` | Load platform statistics from `GET /api/admin/stats` |
| `fetchUsers(page, search)` | Load paginated user list from `GET /api/admin/users` |
| `createUser(data)` | Create user via `POST /api/admin/users` |
| `updateUser(id, data)` | Update user via `PATCH /api/admin/users/:id` |
| `deleteUser(id)` | Delete user via `DELETE /api/admin/users/:id` |
| `fetchLobbies()` | Load all lobbies from `GET /api/admin/lobbies` |
| `updateLobby(id, data)` | Update lobby via `PATCH /api/admin/lobbies/:id` |
| `deleteLobby(id)` | Delete lobby via `DELETE /api/admin/lobbies/:id` |

**Usage:**
```tsx
const {
  users, stats, fetchUsers, deleteUser, loading
} = useAdmin();
```

---

### `useDashboard.ts`

Loads and manages the authenticated user's profile and dashboard data.

**State managed:**
- User profile (username, email, MMR, wins, losses, tier, Riot info)
- Loading and error states

**Methods exposed:**
| Method | Description |
|---|---|
| `fetchProfile()` | Loads user data from `GET /api/auth/profile` |
| `linkRiotAccount()` | Initiates Riot OAuth flow via `GET /api/riot/oauth/url` |
| `unlinkRiotAccount()` | Calls `DELETE /api/riot/unlink` |

**Usage:**
```tsx
const { profile, loading, fetchProfile } = useDashboard();
```

---

### `useLobbies.ts`

Handles all lobby-related interactions from the Lobbies page.

**State managed:**
- Lobbies list (paginated)
- User's joined lobbies
- User's created lobbies
- Filters (game, status)
- Loading and error states
- Create lobby modal state

**Methods exposed:**
| Method | Description |
|---|---|
| `fetchLobbies(filters)` | Load lobbies from `GET /api/lobbies` |
| `fetchMyLobbies()` | Load user's joined lobbies from `GET /api/lobby-participants/my-lobbies` |
| `fetchMyCreated()` | Load user's created lobbies from `GET /api/lobbies/my-created` |
| `createLobby(data)` | Create via `POST /api/lobbies` |
| `joinLobby(lobbyId)` | Join via `POST /api/lobby-participants/register` |
| `leaveLobby(lobbyId)` | Leave via `POST /api/lobby-participants/leave` |
| `updateStatus(id, status)` | Update status via `PATCH /api/lobbies/:id/status` |

**Usage:**
```tsx
const { lobbies, joinLobby, leaveLobby, loading } = useLobbies();
```

---

### `useViewportPrefetch.ts`

Prefetches route component bundles when a link enters the viewport (hover or intersection), reducing perceived navigation latency.

**How it works:**
1. Attaches an `IntersectionObserver` to navigation links
2. When a link is visible/hovered, triggers `import()` for that route's lazy chunk
3. The chunk is downloaded and cached before the user actually clicks

**Usage:**
```tsx
// Applied globally in App.tsx or NavBar
useViewportPrefetch();
```

---

## API Services — `src/services/`

Services are thin wrappers over `apiClient` that define typed request functions. Each service maps to a backend route module.

---

### `apiClient.ts`

The shared Axios instance used by all services.

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
});

// Response interceptor: redirect to /login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### `authService.ts`

| Function | Method | Endpoint |
|---|---|---|
| `register(data)` | POST | `/auth/register` |
| `login(data)` | POST | `/auth/login` |
| `logout()` | POST | `/auth/logout` |
| `getProfile()` | GET | `/auth/profile` |
| `verifyEmail(token)` | GET | `/auth/verify-email?token=` |
| `resendVerification(email)` | POST | `/auth/resend-verification` |
| `forgotPassword(email)` | POST | `/auth/forgot-password` |
| `resetPassword(token, newPassword)` | POST | `/auth/reset-password` |
| `getPublicProfile(username)` | GET | `/auth/users/:username` |

---

### `lobbyService.ts`

| Function | Method | Endpoint |
|---|---|---|
| `getLobbies(params)` | GET | `/lobbies` |
| `getLobby(id)` | GET | `/lobbies/:id` |
| `createLobby(data)` | POST | `/lobbies` |
| `getMyCreated()` | GET | `/lobbies/my-created` |
| `updateStatus(id, status)` | PATCH | `/lobbies/:id/status` |
| `syncCounts()` | POST | `/lobbies/sync-counts` |
| `joinLobby(lobbyId)` | POST | `/lobby-participants/register` |
| `leaveLobby(lobbyId)` | POST | `/lobby-participants/leave` |
| `getMyLobbies()` | GET | `/lobby-participants/my-lobbies` |

---

### `matchService.ts`

| Function | Method | Endpoint |
|---|---|---|
| `submitReplay(data)` | POST | `/match-results/submit-replay` |
| `getLobbyResults(lobbyId)` | GET | `/match-results/lobby/:lobbyId` |

---

### `leaderboardService.ts`

| Function | Method | Endpoint |
|---|---|---|
| `getLeaderboard(page, limit)` | GET | `/leaderboard` |

---

### `riotService.ts`

| Function | Method | Endpoint |
|---|---|---|
| `linkAccount(data)` | POST | `/riot/link` |
| `unlinkAccount()` | DELETE | `/riot/unlink` |
| `getRiotProfile()` | GET | `/riot/profile` |
| `getRiotProfileById(riotId)` | GET | `/riot/profile/:riotId` |
| `submitLolMatch(data)` | POST | `/riot/submit-lol-match` |
| `getOAuthUrl()` | GET | `/riot/oauth/url` |

---

### `adminService.ts`

| Function | Method | Endpoint |
|---|---|---|
| `getStats()` | GET | `/admin/stats` |
| `getUsers(params)` | GET | `/admin/users` |
| `createUser(data)` | POST | `/admin/users` |
| `updateUser(id, data)` | PATCH | `/admin/users/:id` |
| `deleteUser(id)` | DELETE | `/admin/users/:id` |
| `getLobbies()` | GET | `/admin/lobbies` |
| `updateLobby(id, data)` | PATCH | `/admin/lobbies/:id` |
| `deleteLobby(id)` | DELETE | `/admin/lobbies/:id` |
