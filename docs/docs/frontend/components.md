---
sidebar_position: 2
title: Component Catalog
---

# Component Catalog

All components live under `frontend/src/components/`. They are organized by domain/feature area.

---

## Auth Components — `components/auth/`

### `ProtectedRoute.tsx`

Wraps route elements to enforce authentication and role requirements.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `children` | ReactNode | The page component to render if authorized |
| `requiredRole` | `"USER" \| "ADMIN"` | Minimum role required (default: `"USER"`) |

**Behavior:**
- Reads `auth_info` cookie to check login state
- If not authenticated → redirects to `/login`
- If authenticated but insufficient role → redirects to `/dashboard`
- If authorized → renders `children`

---

## Common Components — `components/common/`

Shared UI primitives used throughout the application.

### `Button.tsx`

Styled button with variant support.

| Variant | Description |
|---|---|
| `primary` | Filled button (default action) |
| `secondary` | Outlined/ghost button |
| `danger` | Red destructive button |

### `Card.tsx`

A container with rounded corners, shadow, and consistent padding. Used as a layout wrapper for content sections.

### `Label.tsx`

Form label component, typically paired with input fields for accessibility.

### `ErrorBoundary.tsx`

React class component that catches rendering errors in a subtree and displays a fallback UI instead of crashing the entire page.

### `Spinner.tsx`

Loading indicator. Used during async data fetches. Supports `size` prop (`sm`, `md`, `lg`).

---

## Landing Components — `components/landing/`

These components build the public-facing landing page at `/`.

### `HeroSection.tsx`

Full-screen hero with the G-RANK title, tagline, and call-to-action buttons (Register / Login). Uses GSAP for entrance animations and integrates the `ReactiveBackground` WebGL effect.

### `FeaturesSection.tsx`

Grid of `FeatureCard` components highlighting key platform features (MMR system, lobbies, Riot integration, etc.).

### `FeatureCard.tsx`

Individual feature card with an icon, title, and description.

### `RankSection.tsx`

Visual display of all 7 rank tiers using `RankCard` components, arranged in ascending order.

### `RankCard.tsx`

Displays a single rank tier with its name, MMR range, and visual badge/color theme.

### `CTASection.tsx`

Bottom call-to-action section encouraging registration.

### `SponsorsMarquee.tsx`

Horizontally scrolling marquee of sponsor/partner logos using CSS animation.

### `ReactiveBackground.tsx`

WebGL canvas background using Three.js + React Three Fiber. Renders animated particle fields or shader effects that react subtly to mouse movement.

### `Footer.tsx`

Site-wide footer with navigation links and copyright.

---

## Dashboard Components — `components/dashboard/`

Used exclusively on the `/dashboard` page.

### `DashboardBackground.tsx`

Animated background for the dashboard page (lighter effect than landing page).

### `StatCard.tsx`

Displays a single statistic (e.g., Total Wins, MMR, Win Rate) with a label, value, and optional trend indicator.

### `MmrProgressCard.tsx`

Shows the user's current MMR, tier badge, and a progress bar toward the next tier. Includes tier thresholds and the exact MMR needed to promote.

### `RecentLobbiesCard.tsx`

Lists the user's most recently joined or created lobbies with status badges and links.

### `RiotAccountCard.tsx`

Shows the linked Riot account information (game name, tag, region) with an option to link or unlink. Triggers the Riot RSO OAuth flow.

### `DashboardFooter.tsx`

Footer component specific to the authenticated dashboard layout.

---

## Lobby Components — `components/lobbies/`

### `LobbiesBackground.tsx`

Animated background for the lobbies listing page.

### `LobbyCard.tsx`

Displays a single lobby in the list view.

**Displayed information:**
- Lobby name and game
- Status badge (open / closed / completed)
- Current participants / max participants
- Join button (if open and user has not joined)
- Created by username

---

## Admin Components — `components/admin/`

Used exclusively on the `/admin` page (ADMIN role required).

### `UsersTable.tsx`

Paginated data table of all users. Columns: username, email, role, MMR, wins, losses, email verified, actions.

### `UserModal.tsx`

Modal dialog for creating a new user or editing an existing user's data and role.

### `LobbiesTable.tsx`

Paginated data table of all lobbies. Columns: name, game, status, participants, created by, actions.

### `LobbyModal.tsx`

Modal dialog for editing a lobby's name, status, or max participants.

### `StatCard.tsx` (Admin variant)

Platform-wide stat card (total users, total lobbies, open lobbies, total matches). Similar to dashboard StatCard but styled for the admin theme.

### `RankBadge.tsx`

Colored badge displaying a tier name (Bronze, Silver, Gold, etc.) based on an MMR value.

### `StatusBadge.tsx`

Colored badge for lobby status: green for `open`, yellow for `closed`, gray for `completed`.

### `AdminToast.tsx`

Toast notification component for success/error feedback on admin CRUD operations.

### `ConfirmDialog.tsx`

Modal confirmation dialog for destructive actions (delete user, delete lobby).

---

## UI / Visual Components — `components/ui/`

WebGL and shader-based visual effects. These are decorative and enhance the premium feel of the platform.

### `Aurora.tsx`

Animated aurora borealis shader effect using Three.js custom shaders. Used on the landing page hero.

### `LiquidEther.tsx`

Fluid simulation shader creating a liquid metal / ether effect.

### `LineWaves.tsx`

Animated line wave effect using GSAP and SVG or Three.js geometry.

### `LightPillar.tsx`

Vertical light beam effect, used to create atmospheric depth on dark backgrounds.

### `Silk.tsx`

Smooth, flowing silk/cloth simulation using Three.js geometry and shaders.

---

## Cursor Component — `components/cursor/`

### `TargetCursor.tsx`

Custom cursor that replaces the default OS cursor with a crosshair/target design that follows mouse movement with a slight lag for a premium feel. Implemented using `mousemove` events and CSS transforms.

The cursor changes state (e.g., enlarges or changes color) when hovering over interactive elements like buttons and links.
