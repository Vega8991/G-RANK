---
sidebar_position: 3
title: Using the Platform
---

# Using the Platform

Once registered and logged in, this guide explains how to use all major features of G-RANK.

---

## Dashboard

After logging in, you are taken to your **Dashboard** at `/dashboard`.

### What you see

| Widget | Description |
|---|---|
| **MMR** | Your current Matchmaking Rating |
| **Tier** | Your current rank (Bronze through Elite) |
| **Wins / Losses** | Your overall record |
| **Win Rate** | Percentage of matches won |
| **MMR Progress** | Progress bar toward the next tier |
| **Recent Lobbies** | Your last few lobbies |
| **Riot Account** | Link or manage your Riot Games account |

---

## Browsing and Joining Lobbies

Navigate to **Lobbies** (`/lobbies`) to see all available competitive lobbies.

### Filtering Lobbies

Use the filter controls at the top of the page:

| Filter | Options |
|---|---|
| **Game** | League of Legends, Pokemon Showdown, Valorant (planned) |
| **Status** | Open, Closed, Completed |

### Joining a Lobby

1. Find an **open** lobby with available spots.
2. Click the **Join** button on the `LobbyCard`.
3. You are now registered as a participant.

:::info
You can only join lobbies with status `open` and where `participantCount < maxParticipants`.
:::

### Leaving a Lobby

If you no longer want to participate in a lobby you joined:

1. Find the lobby in your **My Lobbies** view.
2. Click **Leave**.

---

## Creating a Lobby

1. On the Lobbies page, click **Create Lobby**.
2. Fill in the lobby details:

| Field | Description |
|---|---|
| **Name** | A descriptive name for your lobby |
| **Game** | Select the game for this lobby |
| **Max Participants** | Maximum number of players |
| **Description** (optional) | Extra context about the lobby |

3. Click **Create**. Your lobby appears with status `open`.

### Managing Your Lobby

As the creator, you can update the lobby status:

| Status | Meaning |
|---|---|
| `open` | Accepting new participants |
| `closed` | No new participants, match ongoing |
| `completed` | Match finished, ready for result submission |

---

## Submitting Match Results

After a match completes in the game, the result must be submitted to update MMR.

### Pokemon Showdown

1. After the battle, copy the **replay URL** from Pokemon Showdown (format: `https://replay.pokemonshowdown.com/...`).
2. Go to your lobby and click **Submit Result**.
3. Paste the replay URL and select the winner.
4. Submit — MMR is updated automatically.

### League of Legends

1. After the match, use the **Submit LoL Match** feature (requires linked Riot account).
2. The backend verifies the match via the Riot API.
3. MMR is updated based on the result.

---

## Leaderboard

Navigate to **Leaderboard** (`/leaderboard`) to see the global rankings.

The table shows all players sorted by MMR descending:

| Column | Description |
|---|---|
| **#** | Global rank position |
| **Player** | Username with tier badge |
| **MMR** | Current Matchmaking Rating |
| **Wins** | Total match wins |
| **Losses** | Total match losses |

Your row is **highlighted** so you can quickly find your position. Use the pagination controls to browse further down the rankings.

---

## Linking Your Riot Account

Linking your Riot Games account enables League of Legends match verification.

### Via RSO OAuth (Recommended)

1. On the Dashboard, find the **Riot Account** card.
2. Click **Link Riot Account**.
3. You will be redirected to the official Riot Games login page.
4. Log in with your Riot credentials and authorize G-RANK.
5. You are redirected back to the Dashboard with your Riot profile displayed.

### Unlinking

On the Dashboard, click **Unlink** on the Riot Account card. This removes the association (your match history is not deleted).

---

## Understanding Your MMR

### How MMR Changes

After each validated match:

- **Winner:** gains MMR based on their current tier
- **Loser:** loses MMR based on their current tier

See the [MMR & Ranking System](../backend/mmr-ranking.md) documentation for the exact gain/loss values per tier.

### Tier Promotions and Demotions

Your tier is determined solely by your MMR value — there are no promotion series or demotion protections. If your MMR drops below a tier threshold, your displayed tier updates immediately.

### MMR Floor

Your MMR cannot drop below `0`. If you lose a match at 0 MMR, it stays at 0.
