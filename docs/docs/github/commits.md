---
sidebar_position: 2
title: Commit Convention
---

# Commit Convention

G-RANK follows the **Conventional Commits** specification for all commit messages. This makes the history readable, enables automated changelogs, and clearly communicates intent.

---

## Format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer]
```

- **type** — what kind of change this is (required)
- **scope** — what part of the codebase changed (optional but encouraged)
- **description** — short imperative summary, lowercase, no period at the end
- **body** — longer explanation if needed (why, not what)
- **footer** — breaking changes, issue references

---

## Types

| Type | When to Use | Example |
|---|---|---|
| `feat` | A new feature | `feat(auth): add email verification flow` |
| `fix` | A bug fix | `fix(lobby): prevent duplicate join on double-click` |
| `docs` | Documentation changes | `docs: update API endpoints reference` |
| `refactor` | Code restructuring (no behavior change) | `refactor(mmr): extract tier config to constants` |
| `test` | Adding or updating tests | `test(auth): add unit tests for login controller` |
| `chore` | Build, CI, dependency updates | `chore: update mongoose to 9.2.0` |
| `style` | Formatting, whitespace, no logic change | `style: apply prettier formatting` |
| `perf` | Performance improvements | `perf(leaderboard): add mmr index to users collection` |
| `ci` | CI/CD configuration changes | `ci: add GitHub Actions workflow for testing` |
| `revert` | Reverts a previous commit | `revert: feat(auth): revert OAuth implementation` |

---

## Real Examples from the Repository

```
feat: add MMR calculation service with tier-based gain/loss rates
fix: update authentication error handling and improve user feedback in login process
fix: update .gitignore to include coverage directory and ensure .env is ignored
fix: update getAllLobbies test to include pagination parameters in API call
test: add unit tests for models, routes, and services
```

---

## Scopes (Recommended)

Use scopes to clarify which part of the system changed:

| Scope | Covers |
|---|---|
| `auth` | Authentication, registration, JWT |
| `lobby` | Lobby creation, status management |
| `participant` | Lobby participant join/leave |
| `match` | Match result submission |
| `mmr` | MMR calculation, ranking |
| `riot` | Riot Games API integration |
| `admin` | Admin panel |
| `leaderboard` | Leaderboard query |
| `frontend` | Frontend-only changes |
| `backend` | Backend-only changes |
| `docs` | Documentation |
| `deps` | Dependency updates |

---

## Breaking Changes

If a commit introduces a breaking change (e.g., API contract change, DB schema change), indicate it in the footer:

```
feat(auth)!: change JWT cookie name from 'jwt' to 'token'

BREAKING CHANGE: Clients storing or referencing the old cookie name 'jwt'
must update to 'token'. All existing sessions will be invalidated.
```

The `!` after the type also signals a breaking change at a glance.

---

## Why Conventional Commits?

1. **Readable history** — `git log --oneline` tells a clear story of changes.
2. **Automated changelogs** — tools like `conventional-changelog` or `release-it` can generate changelogs automatically.
3. **Semantic versioning** — `feat` → minor bump, `fix` → patch, breaking change → major.
4. **PR descriptions** — well-structured commits make PR summaries easier to write.

---

## Git Tips

```bash
# View recent commits with conventional format
git log --oneline -20

# Amend the last commit message (before pushing)
git commit --amend -m "fix(auth): correct token expiry calculation"

# Interactive rebase to clean up commits before PR
git rebase -i HEAD~5
```
