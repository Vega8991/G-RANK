---
sidebar_position: 3
title: MMR & Ranking System
---

# MMR & Ranking System

G-RANK uses a **custom MMR (Matchmaking Rating) system** — not Elo. Each tier has different gain and loss rates designed to incentivize continued play at higher tiers while making progression feel meaningful.

---

## Rank Tiers

| Tier | MMR Range | Win Gain | Loss Deduction |
|---|---|---|---|
| **Bronze** | 0 – 499 | +50 | -25 |
| **Silver** | 500 – 999 | +40 | -20 |
| **Gold** | 1000 – 1499 | +32 | -18 |
| **Platinum** | 1500 – 1999 | +30 | -20 |
| **Diamond** | 2000 – 2499 | +25 | -25 |
| **Master** | 2500 – 2999 | +20 | -25 |
| **Elite** | 3000+ | +15 | -30 |

---

## Tier Design Rationale

| Tier | Philosophy |
|---|---|
| **Bronze/Silver** | High win gains (+50/+40) to encourage new players and reward early progress |
| **Gold/Platinum** | Moderate gains; the system starts to demand consistency |
| **Diamond** | Symmetric gain/loss (+25/-25) — the inflection point |
| **Master** | Gains fall below losses (-25 > +20) — must win more than lose to climb |
| **Elite** | Hardest to climb (+15/-30) — position is actively contested |

This design means higher-tier players must **maintain** a positive win rate to stay in their tier, preventing rating inflation at the top.

---

## MMR Calculation

MMR is adjusted after each validated match result:

```javascript
function calculateNewMmr(currentMmr, won) {
  const tier = getTierFromMmr(currentMmr);

  if (won) {
    return Math.max(0, currentMmr + tier.winGain);
  } else {
    return Math.max(0, currentMmr - tier.lossPenalty);
  }
}

function getTierFromMmr(mmr) {
  if (mmr >= 3000) return { name: 'Elite',    winGain: 15, lossPenalty: 30 };
  if (mmr >= 2500) return { name: 'Master',   winGain: 20, lossPenalty: 25 };
  if (mmr >= 2000) return { name: 'Diamond',  winGain: 25, lossPenalty: 25 };
  if (mmr >= 1500) return { name: 'Platinum', winGain: 30, lossPenalty: 20 };
  if (mmr >= 1000) return { name: 'Gold',     winGain: 32, lossPenalty: 18 };
  if (mmr >= 500)  return { name: 'Silver',   winGain: 40, lossPenalty: 20 };
  return              { name: 'Bronze',   winGain: 50, lossPenalty: 25 };
}
```

**Key rules:**
- MMR floor is `0` — cannot go negative.
- Tier is calculated from the player's MMR **at the time of the match result**, not the current tier.
- MMR updates are triggered when a match result is submitted and validated.

---

## Match Result Submission

Match results are submitted via `POST /api/match-results/submit-replay`. The flow is:

```
1. Player submits: { lobbyId, replayUrl, winnerId }

2. Server validates:
   a. lobbyId exists and is in 'completed' status (or transitions it)
   b. replayUrl matches the game's accepted pattern
   c. winnerId is a valid participant of the lobby

3. Server records match result in matchresults collection

4. Server updates MMR:
   - Winner: currentMmr + tier.winGain
   - Loser(s): currentMmr - tier.lossPenalty (capped at 0)

5. Win/loss counters on User document are incremented
```

---

## Leaderboard

The leaderboard is served from `GET /api/leaderboard` and returns users sorted by `mmr` descending.

```json
{
  "players": [
    {
      "rank": 1,
      "username": "ElitePlayer",
      "mmr": 4200,
      "tier": "Elite",
      "wins": 180,
      "losses": 40
    },
    {
      "rank": 2,
      "username": "MasterGrind",
      "mmr": 2890,
      "tier": "Master",
      "wins": 120,
      "losses": 60
    }
  ],
  "total": 1500,
  "page": 1,
  "pages": 75
}
```

---

## MMR Display on Dashboard

The Dashboard page shows:
- Current MMR value
- Current tier name and badge
- Progress bar from current tier floor to next tier threshold
- Win/loss record

```
Example for a Gold player at 1250 MMR:
  Gold threshold:     1000
  Platinum threshold: 1500
  Progress:           (1250 - 1000) / (1500 - 1000) = 50%
```

---

## Future Considerations

- **Season resets:** Planned seasonal MMR soft resets (e.g., compress all MMR toward the tier midpoint).
- **Placement matches:** Initial unranked placement matches to seed new players above Bronze.
- **Per-game MMR:** Separate MMR per game (LoL MMR vs Showdown MMR) is a potential future feature.
