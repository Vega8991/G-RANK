---
sidebar_position: 2
title: How to Login
---

# How to Login

This guide covers logging in to G-RANK, recovering a forgotten password, and understanding session management.

---

## Prerequisites

- A registered account with a verified email address

---

## Step 1 — Go to the Login Page

Navigate to `/login` or click **Login** in the navigation bar.

---

## Step 2 — Enter Your Credentials

| Field | Description |
|---|---|
| **Email** | The email address you registered with |
| **Password** | Your account password |

Click **Login**.

---

## Step 3 — Session Established

On successful login, the server:

1. Validates your credentials
2. Checks that your email is verified
3. Issues a **JWT token** stored in a secure httpOnly cookie (valid for 7 days)
4. Sets a readable `auth_info` cookie with your username and role
5. Redirects you to `/dashboard`

Your session will persist for **7 days** without needing to log in again, as long as you don't log out or clear your browser cookies.

---

## Forgot Password

If you cannot remember your password:

1. Click **Forgot password?** on the Login page.
2. Enter your registered email address and submit.
3. Check your inbox for a password reset email from `grank.noreply@gmail.com`.
4. Click the reset link — it will take you to a form to enter a new password.
5. After resetting, log in with your new password.

:::caution
Password reset links expire after a limited time. If yours has expired, request a new one by repeating the process.
:::

---

## Logging Out

Click your username or account menu and select **Logout**. This calls `POST /api/auth/logout`, which clears both the `token` and `auth_info` cookies from your browser.

After logging out, protected pages will redirect you to `/login`.

---

## Session Security

| Detail | Value |
|---|---|
| Token storage | httpOnly cookie (not accessible to JavaScript) |
| Token expiry | 7 days |
| Transmission | Sent automatically with every request (same-origin) |
| Invalidation | Cleared on logout; no server-side blacklist |

Because tokens are stored in httpOnly cookies, they are not vulnerable to XSS attacks. However, logging out does not invalidate the token server-side — it simply removes it from the browser. If a token is compromised, it remains valid until its 7-day expiry.

---

## Troubleshooting

### "Invalid credentials"

- Double-check your email address (must be the exact address you registered with).
- Passwords are case-sensitive.
- If you have forgotten your password, use the **Forgot password?** flow.

### "Email not verified"

Your account exists but the email address has not been confirmed. Check your inbox for the verification email, or click **Resend verification email** on the login page.

### I am redirected to login immediately after logging in

This usually indicates a cookie issue:
- Ensure your browser accepts cookies from the platform domain.
- Ensure you are not using a private/incognito mode with strict cookie blocking.
- Check that the `FRONTEND_URL` backend env var matches the URL you are using.
