---
id: auth
title: Authentication
sidebar_label: Authentication
---

Session and socket auth live in `lib/auth.ts` (`@l/auth`).

## Session Auth (HTTP)

### Flow

1. User hits `GET /api/auth/discord` - redirects to Discord OAuth with CSRF state cookie
2. Discord redirects to `GET /api/auth/discord/callback`
3. Server validates state, exchanges code for Discord token, fetches user info
4. `createOrUpdateUser()` upserts the user in `users` table
5. `createSession()` writes a 30-day token to `user_sessions`
6. Cookie `session_token` (HttpOnly, Secure, SameSite=Lax) set on response

### Validating a request (API routes)

```ts
import { validateSession } from "@l/auth";
import { cookies } from "next/headers";

const cookieStore = await cookies();
const token = cookieStore.get("session_token")?.value;
if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const user = await validateSession(token);
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

`validateSession()` joins `user_sessions` and `users`, checks `expires_at > NOW()`. Returns `User | null`.

### Session expiry

Sessions last 30 days. No sliding expiry - after 30 days the user must re-auth via Discord.

`cleanupExpiredSessions()` exists but is not called automatically - hook it into a cron job if needed.

## Socket Auth (WebSocket)

Socket tokens are short-lived (2 min) HMAC-SHA256 tokens used to authenticate Socket.IO connections.

### Flow

1. Client fetches `GET /api/auth/me` - returns `{ user, socketToken }` if session valid
2. Client passes `socketToken` to `initSocket(token)` - socket connects with `auth: { token }`
3. Server validates via `GET /api/auth/socket/[token]` (or inline in socket middleware)
4. Socket is associated with the user

### Token format

```
base64url( userId:expMs:hmacSig )
```

- Payload: `userId:expMs`
- Sig: `HMAC-SHA256(payload, SOCKET_SECRET)`
- `SOCKET_SECRET` env var required

### Creating / verifying

```ts
import { createSocketToken, verifySocketToken } from "@l/auth";

const token = createSocketToken(userId);         // call after session validated
const result = verifySocketToken(token);         // { userId } | null
if (!result) { /* reject connection */ }
```

### API key auth (overlays)

Overlay pages that don't have a user session use a tournament API key instead. Socket.IO middleware checks `auth.apiKey` against `tournament_api_keys` table.

## User upsert

`createOrUpdateUser(discordUser, existingProfileData?)` - called on every OAuth callback.

- Inserts on first login (if registration is open)
- Updates `username`, `avatar_url`, `socials.discord` on subsequent logins
- Returns full `User` record

Username and avatar only update from Discord if `existingProfileData` is not provided (i.e. profile not yet customized).

## Reference

| Function | Description |
|---|---|
| `createSession(userId)` | Creates 30-day session token, writes to DB. Returns token string. |
| `validateSession(token)` | Validates session token. Returns `User` or `null`. |
| `deleteSession(token)` | Deletes session (logout). |
| `createSocketToken(userId)` | Creates 2-min HMAC socket token. |
| `verifySocketToken(token)` | Validates socket token. Returns `{ userId }` or `null`. |
| `getUserById(id)` | Fetches user by UUID from DB. |
| `createOrUpdateUser(discord, profile?)` | Upserts user on Discord OAuth. Returns `User`. |
| `cleanupExpiredSessions()` | Deletes expired sessions. Not scheduled by default. |

## Related

- [Permissions](./permissions) - role checks that follow session validation
- [Socket Rooms](./socket-rooms) - socket events authenticated via socket tokens
- [User Types](../types/user) - `User` shape returned by `validateSession`
