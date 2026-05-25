---
sidebar_position: 2
title: Authentication & Authorization
---

# Authentication & Authorization

G-RANK uses **JWT (JSON Web Tokens)** stored in **httpOnly cookies** for session management. This approach prevents XSS attacks from stealing tokens since JavaScript cannot read httpOnly cookies.

---

## Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Auth Flow                                    │
│                                                                  │
│  1. User submits email + password to POST /api/auth/login        │
│                                                                  │
│  2. Server:                                                      │
│     a. Finds user by email                                       │
│     b. Compares password with bcrypt hash                        │
│     c. Verifies emailVerified === true                           │
│     d. Signs JWT with JWT_SECRET (expires JWT_EXPIRE = 7d)       │
│     e. Sets two cookies on the response:                         │
│        • token      — httpOnly, secure, sameSite=strict          │
│        • auth_info  — readable by JS, contains username+role     │
│                                                                  │
│  3. Subsequent requests:                                         │
│     Browser automatically includes cookies in every request      │
│     → authMiddleware reads & validates the token cookie          │
│     → req.user is populated for downstream handlers              │
└──────────────────────────────────────────────────────────────────┘
```

---

## JWT Configuration

| Setting | Value |
|---|---|
| Storage | httpOnly cookie named `token` |
| Expiry | `7d` (configurable via `JWT_EXPIRE` env var) |
| Secret | `JWT_SECRET` environment variable |
| Algorithm | HS256 (default for jsonwebtoken) |
| Payload | `{ id, username, role, iat, exp }` |

---

## Cookies

### `token` (httpOnly)

```
Set-Cookie: token=<JWT>;
            HttpOnly;
            Secure (production only);
            SameSite=Strict;
            Max-Age=604800
```

- Cannot be read by JavaScript — protects against XSS
- Automatically sent on every same-origin request
- Cleared on logout via `res.clearCookie('token')`

### `auth_info` (readable)

```
Set-Cookie: auth_info={"username":"Player123","role":"USER"};
            SameSite=Strict;
            Max-Age=604800
```

- Readable by the frontend JS to display username/role in UI
- Does **not** grant any server-side permissions — only the `token` cookie is verified

---

## User Roles

| Role | Value | Permissions |
|---|---|---|
| **User** | `"USER"` | Default role. Access to own profile, lobbies, match submission |
| **Admin** | `"ADMIN"` | Full access including admin dashboard, user/lobby management |

Roles are stored in the `User` document and embedded in the JWT payload.

---

## Middleware

### `authMiddleware.js` — `verifyToken`

Applied to all routes requiring authentication.

```javascript
// Pseudocode
function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
```

### `adminMiddleware.js` — `requireAdmin`

Applied after `verifyToken` on admin-only routes.

```javascript
// Pseudocode
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
```

---

## Email Verification Flow

Registration requires email verification before the user can log in.

```
1. POST /api/auth/register
   → Server creates user with emailVerified: false
   → Generates a crypto random token stored on user document
   → Sends email with link: {FRONTEND_URL}/verify-email?token=<token>

2. User clicks link → frontend calls GET /api/auth/verify-email?token=<token>
   → Server finds user by token
   → Sets emailVerified: true, clears the token
   → Returns success

3. POST /api/auth/login
   → If emailVerified === false → 400 error
   → If emailVerified === true  → sets JWT cookies
```

---

## Password Reset Flow

```
1. POST /api/auth/forgot-password { email }
   → Server generates reset token + expiry (e.g. 1 hour)
   → Stores hashed token on user document
   → Sends email with: {FRONTEND_URL}/reset-password?token=<token>

2. POST /api/auth/reset-password { token, newPassword }
   → Server finds user by token (checks expiry)
   → Hashes new password with bcrypt
   → Clears reset token fields
   → Returns success (user must login again)
```

---

## Password Security

- Passwords are hashed using **bcrypt** with a cost factor of 12 before storage.
- Plain-text passwords are never stored or logged.
- Password comparison uses `bcrypt.compare()` (constant-time comparison, not vulnerable to timing attacks).

---

## CORS Configuration

The server requires CORS to be configured to allow credentials from the frontend origin:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // e.g., http://localhost:5173
  credentials: true,                // Allow cookies to be sent cross-origin
}));
```

The frontend Axios client must also be configured with:

```typescript
// src/services/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true, // Send cookies with every request
});
```

---

## Logout

```
POST /api/auth/logout
```

The server calls `res.clearCookie('token')` and `res.clearCookie('auth_info')`, removing both cookies from the browser. No token blacklisting is implemented — the token simply becomes unreadable to the client.
