---
sidebar_position: 4
title: Database Models
---

# Database Models

G-RANK uses **MongoDB** with **Mongoose 9** as the ODM. The database contains four main collections.

---

## User

Stored in the `users` collection.

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | String | Yes | Unique display name |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Bcrypt-hashed password |
| `role` | String | Yes | `"USER"` or `"ADMIN"` (default: `"USER"`) |
| `mmr` | Number | Yes | Current MMR rating (default: `0`) |
| `wins` | Number | Yes | Total wins (default: `0`) |
| `losses` | Number | Yes | Total losses (default: `0`) |
| `emailVerified` | Boolean | Yes | Whether email is confirmed (default: `false`) |
| `emailVerificationToken` | String | No | Token for email verification link |
| `emailVerificationExpires` | Date | No | Expiry for verification token |
| `passwordResetToken` | String | No | Token for password reset link |
| `passwordResetExpires` | Date | No | Expiry for reset token |
| `riotId` | String | No | Linked Riot account ID |
| `riotGameName` | String | No | Riot game name (e.g., `Player#EUW`) |
| `riotTagLine` | String | No | Riot tag line |
| `riotAccessToken` | String | No | Riot RSO access token (encrypted/stored carefully) |
| `riotRefreshToken` | String | No | Riot RSO refresh token |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

**Schema snippet:**
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  mmr:      { type: Number, default: 0 },
  wins:     { type: Number, default: 0 },
  losses:   { type: Number, default: 0 },
  emailVerified: { type: Boolean, default: false },
  // ...verification/reset token fields
  // ...riot fields
}, { timestamps: true });
```

**Indexes:**
- `email` — unique index
- `username` — unique index
- `mmr` — descending index for leaderboard queries

---

## Lobby

Stored in the `lobbies` collection.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | Yes | Lobby display name |
| `game` | String | Yes | Game name (e.g., `"League of Legends"`) |
| `createdBy` | ObjectId | Yes | Reference to `users` collection |
| `maxParticipants` | Number | Yes | Maximum number of players allowed |
| `participantCount` | Number | Yes | Cached count (default: `0`) |
| `status` | String | Yes | `"open"`, `"closed"`, or `"completed"` (default: `"open"`) |
| `description` | String | No | Optional lobby description |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

**Schema snippet:**
```javascript
const lobbySchema = new mongoose.Schema({
  name:            { type: String, required: true },
  game:            { type: String, required: true },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maxParticipants: { type: Number, required: true },
  participantCount:{ type: Number, default: 0 },
  status:          { type: String, enum: ['open', 'closed', 'completed'], default: 'open' },
  description:     { type: String },
}, { timestamps: true });
```

**Indexes:**
- `status` — for filtering open lobbies
- `createdBy` — for user's created lobbies query
- `game` — for filtering by game

---

## LobbyParticipant

Stored in the `lobbyparticipants` collection. Represents the many-to-many relationship between users and lobbies.

| Field | Type | Required | Description |
|---|---|---|---|
| `lobby` | ObjectId | Yes | Reference to `lobbies` collection |
| `user` | ObjectId | Yes | Reference to `users` collection |
| `joinedAt` | Date | Yes | When the user joined (default: `Date.now`) |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

**Schema snippet:**
```javascript
const lobbyParticipantSchema = new mongoose.Schema({
  lobby:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lobby', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });
```

**Indexes:**
- `{ lobby, user }` — compound unique index (prevents duplicate registrations)
- `user` — for querying a user's joined lobbies

---

## MatchResult

Stored in the `matchresults` collection.

| Field | Type | Required | Description |
|---|---|---|---|
| `lobby` | ObjectId | Yes | Reference to `lobbies` |
| `submittedBy` | ObjectId | Yes | Reference to `users` (who submitted) |
| `winner` | ObjectId | Yes | Reference to `users` (who won) |
| `replayUrl` | String | Yes | Validated replay URL |
| `game` | String | Yes | Game identifier |
| `mmrChanges` | Array | No | Array of `{ user, oldMmr, newMmr, delta }` objects |
| `createdAt` | Date | Auto | Mongoose timestamp |

**Schema snippet:**
```javascript
const matchResultSchema = new mongoose.Schema({
  lobby:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lobby', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  winner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  replayUrl:   { type: String, required: true },
  game:        { type: String, required: true },
  mmrChanges: [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldMmr: Number,
    newMmr: Number,
    delta:  Number,
  }],
}, { timestamps: true });
```

---

## MongoDB Atlas Setup

G-RANK targets **MongoDB Atlas** for production. The connection is established via the `MONGO_URI` environment variable:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

For local development, you can also use:
```
MONGO_URI=mongodb://localhost:27017/grank
```

The connection is initialized in `backend/src/config/db.js` (or similar) using:

```javascript
import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};
```
