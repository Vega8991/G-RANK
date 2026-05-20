---
sidebar_position: 3
title: Pages
---

# Pages

Each page corresponds to a route in the application. Pages are lazy-loaded via React Router v7 dynamic imports.

---

## LandingPage — `/`

**Access:** Public (no authentication required)

The public-facing home page of G-RANK. It is the first impression for new visitors and includes:

| Section | Component | Description |
|---|---|---|
| Hero | `HeroSection` | Full-screen intro with title, tagline, and CTA buttons |
| Features | `FeaturesSection` | Grid of platform feature highlights |
| Rank Tiers | `RankSection` | Visual showcase of all 7 MMR tiers |
| Call-to-Action | `CTASection` | Final signup/login prompt |
| Sponsors | `SponsorsMarquee` | Scrolling sponsor logos |
| Footer | `Footer` | Links and copyright |

**Special effects:**
- `ReactiveBackground` — Three.js WebGL canvas behind the hero
- GSAP entrance animations on scroll
- Custom `TargetCursor` active

---

## Login — `/login`

**Access:** Public (redirects to `/dashboard` if already logged in)

Email and password login form. On submit, calls `POST /api/auth/login`.

**Features:**
- Form validation (required fields, email format)
- Inline error messages from API responses
- "Forgot password?" link to `/forgot-password`
- "Don't have an account?" link to `/register`
- Loading state during API call

---

## Register — `/register`

**Access:** Public (redirects to `/dashboard` if already logged in)

New account creation form. On submit, calls `POST /api/auth/register`.

**Fields:** Username, Email, Password, Confirm Password

**Features:**
- Client-side validation (password strength, match confirmation)
- Success message prompting the user to check their email
- Link back to `/login`

---

## ForgotPassword — `/forgot-password`

**Access:** Public

Single-field form (email). Calls `POST /api/auth/forgot-password`.

**Behavior:**
- Always shows a success message after submission (even if email not found) to prevent email enumeration
- Link back to `/login`

---

## ResetPassword — `/reset-password`

**Access:** Public (requires `?token=` query parameter from email link)

New password form. Calls `POST /api/auth/reset-password` with the URL token and new password.

**Features:**
- Token extracted from URL search params
- Password + confirm password fields
- Error display for expired/invalid tokens

---

## VerifyEmail — `/verify-email`

**Access:** Public (requires `?token=` query parameter from email link)

No visible form — automatically calls `GET /api/auth/verify-email?token=<token>` when the page loads.

**Behavior:**
- Shows a loading spinner while verifying
- On success: success message + link to login
- On failure: error message with option to resend verification email (calls `POST /api/auth/resend-verification`)

---

## Dashboard — `/dashboard`

**Access:** Protected (USER role required)

The main authenticated user area. Aggregates user stats and activity at a glance.

| Widget | Component | Description |
|---|---|---|
| Stat Cards | `StatCard` | MMR, wins, losses, win rate |
| MMR Progress | `MmrProgressCard` | Current tier + progress to next |
| Recent Lobbies | `RecentLobbiesCard` | Last 5 joined/created lobbies |
| Riot Account | `RiotAccountCard` | Linked Riot account or link prompt |

**Data source:** `useDashboard` hook → `GET /api/auth/profile`

---

## Lobbies — `/lobbies`

**Access:** Protected (USER role required)

Browse and interact with competitive lobbies.

**Features:**
| Feature | Description |
|---|---|
| Lobby list | Paginated grid of `LobbyCard` components |
| Filtering | Filter by game and/or status |
| Join lobby | Authenticated users can join open lobbies |
| Leave lobby | Users can leave lobbies they've joined |
| Create lobby | Modal form to create a new lobby |
| My lobbies | Tab/filter to show only user's own lobbies |

**Data source:** `useLobbies` hook → various `/api/lobbies` and `/api/lobby-participants` endpoints

---

## Leaderboard — `/leaderboard`

**Access:** Protected (USER role required)

Global ranking table of all players sorted by MMR descending.

| Column | Description |
|---|---|
| Rank # | Absolute position |
| Username | Player display name |
| Tier | Badge (Bronze → Elite) |
| MMR | Numeric rating |
| Wins | Total wins |
| Losses | Total losses |

**Features:**
- Pagination (20 players per page)
- Current user's row is highlighted
- Tier badges color-coded per tier

**Data source:** `GET /api/leaderboard`

---

## Admin — `/admin`

**Access:** Protected (ADMIN role required)

Full platform management dashboard.

**Tabs / Sections:**
| Section | Description |
|---|---|
| Stats | Platform-wide statistics (users, lobbies, matches) |
| Users | Paginated user table with search, edit, create, delete |
| Lobbies | Paginated lobby table with edit and delete |

**Components used:** `UsersTable`, `UserModal`, `LobbiesTable`, `LobbyModal`, `StatCard`, `RankBadge`, `StatusBadge`, `AdminToast`, `ConfirmDialog`

**Data source:** `useAdmin` hook → `/api/admin/*` endpoints

---

## NotFound — `*`

**Access:** Public

Rendered for any unmatched route.

**Features:**
- Clear 404 message
- Link back to home (`/`)
- Styled consistently with the rest of the app
