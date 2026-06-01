---
id: permissions
title: Permissions
sidebar_label: Permissions
---

Two layers: **website roles** (global) and **tournament roles** (per-tournament).

- Client-side definitions: `lib/permissions-client.ts` (`@l/permissions-client`)
- Server-side checks: `lib/permissions.ts` (`@l/permissions`)

## Role Hierarchy

### Website Roles

Stored on `users.role`.

| Role | Description |
|---|---|
| `admin` | Full access everywhere |
| `developer` | Site dev access, can manage overlays + settings |
| `moderator` | Admin panel access, can manage users |
| `tournament_host` | Can create tournaments |
| *(none)* | Regular user / player |

### Tournament Roles

Stored in `tournament_participants.role`. Per-tournament.

| Role | Description |
|---|---|
| `host` | Full tournament control |
| `tournament_admin` | Most management actions |
| `coordinator` | Runs matches, edits brackets |
| `map_pooler` | Edits map pools and qualifiers |
| `caster` | View-only staff access |
| `developer` | Overlay + view access |
| `player` | Joined as participant |

## Permission Matrices

### Website staff permissions

```ts
import { websiteStaffPermissions } from "@l/permissions-client";

websiteStaffPermissions.canView              // ["admin", "developer", "moderator"]
websiteStaffPermissions.canEditUser          // ["admin", "developer", "moderator"]
websiteStaffPermissions.canChangeUsername    // ["admin", "developer", "moderator"]
websiteStaffPermissions.canChangeConnections // ["admin", "developer"]
websiteStaffPermissions.canChangeRoles       // ["admin"]
websiteStaffPermissions.canRestrictPlayers   // ["admin"]
websiteStaffPermissions.canHandleBlogPosts   // ["admin", "developer"]
websiteStaffPermissions.accessToWebsiteSettings // ["admin", "developer", "moderator"]
```

### Website tournament permissions

```ts
import { websiteTournamentPermissions } from "@l/permissions-client";

websiteTournamentPermissions.canView          // ["admin", "tournament_host", "moderator", "developer"]
websiteTournamentPermissions.canCreate        // ["admin", "tournament_host", "moderator", "developer"]
websiteTournamentPermissions.canManageGlobal  // ["admin", "moderator"] - overrides tournament role checks
websiteTournamentPermissions.canManageOverlays // ["admin", "developer"]
websiteTournamentPermissions.canDelete        // ["admin"]
websiteTournamentPermissions.canMockClient    // ["admin", "developer", "tournament_host"]
```

### Tournament-level permissions

```ts
import { tournamentPermissions } from "@l/permissions-client";

tournamentPermissions.canView          // staff who can see the management panel
tournamentPermissions.canEditMapPool   // ["host", "tournament_admin", "map_pooler"]
tournamentPermissions.canEditBrackets  // ["host", "tournament_admin", "coordinator"]
tournamentPermissions.canEditQualifier // ["host", "tournament_admin", "map_pooler", "coordinator"]
tournamentPermissions.canEditSettings  // ["host", "tournament_admin"]
tournamentPermissions.canEditPlayers   // ["host", "tournament_admin"]
tournamentPermissions.canEditOverlay   // ["host", "tournament_admin", "developer"]
tournamentPermissions.canDelete        // ["host"]
tournamentPermissions.canJoin          // ["player"]
```

## Server-side checks (API routes)

Import from `@l/permissions`. All functions are async (query `tournament_participants`).

```ts
import {
  mapPoolPermissions,
  bracketPermissions,
  settingsPermissions,
  userPermissions,
  viewPermissions,
  deletePermissions,
  overlayConfigPermissions,
  qualifierPermissions,
  createTournamentPermissions,
} from "@l/permissions";

const allowed = await mapPoolPermissions({ tournamentId, user });
if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

Each check passes if **either**:
- User's tournament role is in the allowed tournament roles list, **or**
- User's website role is in the global override list (usually `canManageGlobal`)

`createTournamentPermissions` only checks website role (no tournament context needed):

```ts
const allowed = await createTournamentPermissions({ user });
```

## Usage pattern in routes

```ts
const cookieStore = await cookies();
const token = cookieStore.get("session_token")?.value;
const user = token ? await validateSession(token) : null;
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const allowed = await settingsPermissions({ tournamentId, user });
if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

## Client-side usage

`@l/permissions-client` is safe to import in client components - no DB calls.

```tsx
import { websiteStaffPermissions, tournamentPermissions } from "@l/permissions-client";

if (websiteStaffPermissions.canView.includes(user.role)) {
  // show admin link
}

if (tournamentPermissions.canEditMapPool.includes(userTournamentRole)) {
  // show edit button
}
```

## Related

- [Authentication](./auth) - session validation that precedes permission checks
- [User Types](../types/user) - `UserRole`, `TournamentRole`
- [Tournament Types](../types/tournaments) - `TournamentRole` enum
