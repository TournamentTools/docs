---
id: notifications
title: Notifications
sidebar_label: Notifications
---

Two files:
- `lib/notifications.ts` (`@l/notifications`) - type registry, styling
- `lib/notifications.server.ts` (`@l/notifications-server`) - server action to create notifications

Client hook: `hooks/use-notifications.ts` (`@h/use-notifications`)

## Notification types

| Type | Use |
|---|---|
| `tournament_invite` | User invited to a tournament |
| `match_scheduled` | Match time set |
| `match_started` | Match is now live |
| `match_completed` | Match result recorded |
| `tournament_status` | Tournament started/ended |
| `regular` | General info message |
| `warning` | Warning or attention needed |

Each type has associated label, color, dot color, and row background (Tailwind classes) accessible via the registry in `lib/notifications.ts`.

## Creating a notification (server)

```ts
import { createNotification } from "@l/notifications-server";

await createNotification({
  userId: "...",           // receiver user UUID
  type: "match_scheduled",
  message: "Your match vs PlayerX starts at 20:00",
  link: `/tournaments/${tournamentId}/match/${matchId}`, // optional
});
```

This inserts into `user_notifications` and emits a `notification` socket event to `user:{userId}` room.

## Reading notifications (client)

```tsx
import { useNotifications } from "@h/use-notifications";

function NotificationBell() {
  const {
    notifications, // UserNotification[]
    unreadCount,   // number
    markRead,      // (id: string) => void
    markAllRead,   // () => void
    dismiss,       // (id: string) => void
    dismissAll,    // () => void
  } = useNotifications();

  return <span>{unreadCount > 0 ? unreadCount : ""}</span>;
}
```

Fetches from `GET /api/users/notifications` on mount. Listens to `notification` socket event for real-time delivery.

## `UserNotification` shape

```ts
{
  id: string;
  receiver_id: string;
  type: NotificationType;
  message: string;
  link: string | null;   // relative URL for router.push, or null
  read: boolean;
  created_at: string;    // ISO 8601
}
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users/notifications` | List all notifications for current user |
| `PATCH` | `/api/users/notifications` | Mark notification as read (`{ id }`) |
| `DELETE` | `/api/users/notifications` | Delete notification (`{ id }`) or all (`{ all: true }`) |

## Real-time delivery

When `createNotification()` is called server-side, it also emits to the user's socket room:

```
room:  user:{userId}
event: notification
payload: UserNotification
```

The `useNotifications` hook prepends new notifications to the list without refetching.

## Related

- [Socket Rooms](./socket-rooms) - `RoomName.user(userId)` room used for delivery
- [Authentication](./auth) - user session required to receive notifications
