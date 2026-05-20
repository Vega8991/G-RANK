---
sidebar_position: 99
title: Design Decisions
---

# Design Decisions

This page documents the key architectural and technical choices made in G-RANK and explains the rationale behind each.

---

## 1. JWT in httpOnly Cookies (not localStorage)

**Decision:** JWT tokens are stored in `httpOnly` cookies, not in `localStorage` or `sessionStorage`.

**Rationale:**
- `localStorage` tokens are accessible to any JavaScript running on the page, making them vulnerable to **XSS (Cross-Site Scripting)** attacks.
- `httpOnly` cookies cannot be read by JavaScript — even if an XSS injection occurs, the attacker cannot steal the token.
- Cookies are automatically sent by the browser on every same-origin request, simplifying the client-side auth implementation.

**Trade-offs:**
- `httpOnly` cookies require careful CORS configuration (`credentials: true` on both client and server).
- CSRF attacks become a concern (mitigated by `sameSite: strict`).
- Slightly more complex setup compared to putting a token in an Authorization header.

---

## 2. MongoDB for Flexible Schema

**Decision:** MongoDB with Mongoose instead of a relational database (PostgreSQL, MySQL).

**Rationale:**
- Different games have fundamentally different match data structures. A document database handles this variability without complex JOIN tables or schema migrations.
- Lobby metadata, Riot API responses, and match results all have varying shapes — MongoDB accommodates this naturally.
- MongoDB Atlas provides a generous free tier, simple scaling, and built-in replication.

**Trade-offs:**
- No referential integrity enforced at the database level (handled by Mongoose validators and application logic).
- Complex aggregation queries are harder to express than SQL JOINs.

---

## 3. Custom MMR System (not Elo)

**Decision:** A custom tier-based MMR system with fixed gain/loss rates per tier, rather than Elo or TrueSkill.

**Rationale:**
- Standard Elo uses opponent rating to calculate expected outcome, which requires knowing opponent strength. G-RANK lobbies may have multiple participants, making pairwise Elo complex.
- The tier-based approach is intuitive and transparent — players know exactly how much MMR they gain or lose.
- Higher tiers have progressively smaller gains and larger losses, creating **meaningful prestige** at the top.
- Simpler to implement and explain than Elo or TrueSkill.

**Trade-offs:**
- Does not account for opponent strength — a win against an Elite opponent gives the same reward as a win against a Bronze opponent.
- Fixed rates may need seasonal rebalancing if the distribution of players across tiers becomes skewed.

---

## 4. React 19 + Vite 7

**Decision:** Use the latest React 19 with Vite as the build tool.

**Rationale:**
- React 19 introduces concurrent features and improved hydration, positioning the project for future server-side rendering if needed.
- Vite offers significantly faster HMR (Hot Module Replacement) and build times compared to webpack-based setups (CRA, etc.).
- Vite's native TypeScript support and plugin ecosystem align well with modern React development.

**Trade-offs:**
- React 19 was relatively new at project start — some third-party libraries may have compatibility issues.
- Team must stay aware of React 19 behavioral changes (especially around hooks and concurrent mode).

---

## 5. Tailwind CSS v4

**Decision:** Use Tailwind CSS v4 for styling instead of CSS Modules, styled-components, or traditional CSS.

**Rationale:**
- Utility-first styling eliminates the need to name CSS classes and avoids style conflicts in a large component tree.
- Tailwind v4 introduces native CSS variables and improved tree-shaking, reducing bundle size.
- Co-locating styles with markup reduces context-switching during development.

**Trade-offs:**
- JSX can become visually noisy with many Tailwind classes.
- Tailwind v4 is still maturing — some tooling compatibility issues may arise.

---

## 6. Three.js / WebGL for Visual Effects

**Decision:** Use Three.js + React Three Fiber for the landing page visual effects instead of pure CSS animations.

**Rationale:**
- The landing page needs to feel **premium and distinctive** to stand out as a competitive gaming platform.
- WebGL effects (reactive backgrounds, particle fields, shaders) are not achievable with CSS alone.
- React Three Fiber (R3F) integrates Three.js cleanly into the React component model, enabling declarative 3D scenes.

**Trade-offs:**
- WebGL effects have a performance cost, especially on lower-end devices. Implemented with fallback considerations.
- Bundle size increases with Three.js (~600 KB minified). Mitigated by loading only on the landing page (lazy import).
- Development complexity is higher — requires understanding of 3D/shader concepts.

---

## 7. Email Verification Required Before Login

**Decision:** Users cannot log in until their email address is verified.

**Rationale:**
- Prevents fake or mistyped email accounts from participating in ranked matches.
- Ensures there is a verified communication channel for password resets.
- Discourages throwaway accounts for griefing or stat manipulation.

**Trade-offs:**
- Adds friction to the onboarding process.
- Requires reliable email sending infrastructure (Gmail SMTP).
- Requires handling edge cases: expired tokens, email delivery failures, resend flow.

---

## 8. Riot RSO OAuth for Account Linking

**Decision:** Use Riot's official **RSO (Riot Sign-On) OAuth 2.0** for Riot account linking instead of allowing users to self-report their game names.

**Rationale:**
- **Prevents impersonation** — a user cannot claim they are a professional player by typing any game name.
- Match verification via the Riot API requires the official Riot account ID, which RSO provides reliably.
- OAuth is the official, supported integration path from Riot Games.

**Trade-offs:**
- Requires Riot developer application approval for production (development keys expire every 24 hours).
- More complex OAuth flow (redirect, callback, token exchange) compared to a simple form field.
- Riot's API rate limits apply — bulk match validation may hit limits.

---

## 9. Monorepo Structure

**Decision:** Frontend and backend in the same repository instead of separate repos.

**Rationale:**
- Simplifies development — a single `git clone` gives everything needed.
- Atomic commits can span both frontend and backend changes.
- Shared context for pull requests (no cross-repo PRs).
- Simpler for a small team / TFG project scope.

**Trade-offs:**
- Build pipelines must be configured to only deploy the relevant subdirectory.
- Repository grows larger over time.
- Would need to be split if backend and frontend teams diverge in size/pace.
