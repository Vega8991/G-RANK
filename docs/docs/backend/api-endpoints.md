---
sidebar_position: 1
title: API Endpoints
---

# API Endpoints

All endpoints are prefixed with `/api`. The base URL in development is `http://localhost:5000/api`.

---

## Auth — `/api/auth`

These endpoints handle user registration, login, session management, and password recovery.

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user account |
| `POST` | `/auth/login` | No | Login and set JWT httpOnly cookie |
| `POST` | `/auth/logout` | No | Clear JWT cookie |
| `GET` | `/auth/profile` | Yes | Get the currently authenticated user's profile |
| `GET` | `/auth/verify-email` | No | Verify email address via token in query string |
| `POST` | `/auth/resend-verification` | No | Resend the email verification link |
| `POST` | `/auth/forgot-password` | No | Request a password reset email |
| `POST` | `/auth/reset-password` | No | Submit a new password using a reset token |
| `GET` | `/auth/users/:username` | No | Get a public user profile by username |

### POST `/auth/register`

**Request body:**
```json
{
  "username": "Player123",
  "email": "player@example.com",
  "password": "SecurePassword1!"
}
```

**Responses:**
- `201` — User created, verification email sent
- `400` — Validation error (missing fields, duplicate email/username)

---

### POST `/auth/login`

**Request body:**
```json
{
  "email": "player@example.com",
  "password": "SecurePassword1!"
}
```

**Responses:**
- `200` — Login successful; sets `token` (httpOnly) and `auth_info` cookies
- `400` — Invalid credentials or email not verified

---

### GET `/auth/verify-email`

**Query parameters:**
- `token` — The verification token sent by email

**Responses:**
- `200` — Email verified successfully
- `400` — Invalid or expired token

---

### POST `/auth/forgot-password`

**Request body:**
```json
{ "email": "player@example.com" }
```

**Responses:**
- `200` — If the email exists, a reset link is sent (always returns 200 to avoid email enumeration)

---

### POST `/auth/reset-password`

**Request body:**
```json
{
  "token": "<reset-token-from-email>",
  "newPassword": "NewSecurePassword1!"
}
```

**Responses:**
- `200` — Password updated
- `400` — Invalid or expired token

---

## Lobbies — `/api/lobbies`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/lobbies` | No | List all lobbies (filterable, paginated) |
| `POST` | `/lobbies` | Yes | Create a new lobby |
| `GET` | `/lobbies/:id` | No | Get a single lobby by ID |
| `GET` | `/lobbies/my-created` | Yes | Get lobbies created by the current user |
| `PATCH` | `/lobbies/:id/status` | Yes | Update lobby status (open/closed/completed) |
| `POST` | `/lobbies/sync-counts` | Yes | Sync participant count cache |

### GET `/lobbies` — Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |
| `status` | string | Filter by status: `open`, `closed`, `completed` |
| `game` | string | Filter by game name |

**Response:**
```json
{
  "lobbies": [...],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

### POST `/lobbies` — Create Lobby

**Request body:**
```json
{
  "name": "Ranked Match #1",
  "game": "League of Legends",
  "maxParticipants": 10,
  "description": "Competitive ranked lobby"
}
```

---

## Lobby Participants — `/api/lobby-participants`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/lobby-participants/register` | Yes | Join a lobby |
| `POST` | `/lobby-participants/leave` | Yes | Leave a lobby |
| `GET` | `/lobby-participants/my-lobbies` | Yes | Get all lobbies the current user has joined |

### POST `/lobby-participants/register`

**Request body:**
```json
{ "lobbyId": "64abc123..." }
```

### POST `/lobby-participants/leave`

**Request body:**
```json
{ "lobbyId": "64abc123..." }
```

---

## Match Results — `/api/match-results`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/match-results/submit-replay` | Yes | Submit match result with a replay URL |
| `GET` | `/match-results/lobby/:lobbyId` | No | Get all match results for a lobby |

### POST `/match-results/submit-replay`

**Request body:**
```json
{
  "lobbyId": "64abc123...",
  "replayUrl": "https://replay.pokemonshowdown.com/gen9randombattle-...",
  "winnerId": "64def456..."
}
```

**Validation:** The replay URL must match a supported game's pattern (e.g., `replay.pokemonshowdown.com`).

---

## Leaderboard — `/api/leaderboard`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/leaderboard` | No | Get ranked players sorted by MMR |

### GET `/leaderboard` — Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

**Response:**
```json
{
  "players": [
    {
      "rank": 1,
      "username": "TopPlayer",
      "mmr": 3200,
      "tier": "Elite",
      "wins": 50,
      "losses": 10
    }
  ],
  "total": 200,
  "page": 1,
  "pages": 10
}
```

---

## Riot Games — `/api/riot`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/riot/link` | Yes | Link a Riot account to the user profile |
| `DELETE` | `/riot/unlink` | Yes | Unlink Riot account |
| `GET` | `/riot/profile` | Yes | Get the current user's linked Riot profile |
| `GET` | `/riot/profile/:riotId` | No | Get a Riot profile by Riot ID |
| `POST` | `/riot/submit-lol-match` | Yes | Submit a League of Legends match |
| `GET` | `/riot/oauth/url` | Yes | Get the Riot OAuth authorization URL |
| `GET` | `/riot/oauth/callback` | No | OAuth callback (handled server-side) |

### GET `/riot/oauth/url`

Returns the Riot RSO OAuth URL to redirect the user to for account authorization.

**Response:**
```json
{
  "url": "https://auth.riotgames.com/authorize?client_id=..."
}
```

---

## Admin — `/api/admin`

All admin endpoints require an authenticated user with the `ADMIN` role.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/stats` | Platform-wide statistics |
| `GET` | `/admin/users` | List all users (paginated) |
| `POST` | `/admin/users` | Create a new user |
| `PATCH` | `/admin/users/:id` | Update a user's data or role |
| `DELETE` | `/admin/users/:id` | Delete a user |
| `GET` | `/admin/lobbies` | List all lobbies |
| `PATCH` | `/admin/lobbies/:id` | Update any lobby |
| `DELETE` | `/admin/lobbies/:id` | Delete any lobby |

### GET `/admin/stats`

**Response:**
```json
{
  "totalUsers": 1500,
  "totalLobbies": 320,
  "openLobbies": 45,
  "totalMatches": 980
}
```

### GET `/admin/users` — Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Results per page |
| `search` | string | Search by username or email |

---

## Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "message": "Human-readable error description",
  "error": "OPTIONAL_ERROR_CODE"
}
```

| HTTP Status | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (validation error, business rule violation) |
| `401` | Unauthorized (missing or invalid JWT) |
| `403` | Forbidden (insufficient role) |
| `404` | Not Found |
| `500` | Internal Server Error |
