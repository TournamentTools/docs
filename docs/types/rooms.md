---
id: rooms
title: Socket Room & Event Types
sidebar_label: rooms
---

Constants for socket room names and event names. See [Socket Rooms](../internal/socket-rooms) for full usage documentation.

## Room

Emit these to join a room.

```ts
const Room = {
  Match:       "join_match_room",
  Tournament:  "join_tournament_room",
  Coordinator: "join_coordinator_room",
  OverlayView: "overlay:join_view",
  OverlayControl: "overlay:join_control",
} as const;
```

## LeaveRoom

```ts
const LeaveRoom = {
  Match:       "leave_match_room",
  Tournament:  "leave_tournament_room",
  Coordinator: "leave_coordinator_room",
} as const;
```

## RoomName

Server-side room string builders (for reference/logging).

```ts
const RoomName = {
  match:          (matchId: string)      => `match:${matchId}`,
  tournament:     (tournamentId: string) => `tournament:${tournamentId}`,
  coordinator:    (tournamentId: string) => `coordinator:${tournamentId}`,
  overlay:        (tournamentId: string) => `overlay:${tournamentId}`,
  overlayControl: (tournamentId: string) => `overlay_control:${tournamentId}`,
  user:           (userId: string)       => `user:${userId}`,
} as const;
```

## SocketEvents

All socket event names - both server→client broadcasts and client→server control commands.

```ts
const SocketEvents = {
  // Match / TA
  matchUpdated:         "match:updated",
  taRealtimeScore:      "ta:realtimeScore",
  taSongFinished:       "ta:songFinished",
  taMatchUpdated:       "ta:matchUpdated",
  taUserUpdated:        "ta:userUpdated",
  taUserDisconnected:   "ta:userDisconnected",
  taMatchDeleted:       "ta:matchDeleted",
  taMatchCreated:       "ta:matchCreated",
  // Coordinator room
  coordinatorRoomJoined: "coordinator_room_joined",
  coordinatorRoomError:  "coordinator_room_error",
  // Tournament
  bracketUpdated:       "tournament:bracketUpdated",
  // Overlay state (server → client)
  overlayState:              "overlay:state",
  overlayControlJoined:      "overlay:control_joined",
  overlayScreenChanged:      "overlay:screen_changed",
  overlayActiveMatchChanged: "overlay:active_match_changed",
  overlayActivePoolChanged:  "overlay:active_pool_changed",
  overlayAudioChanged:       "overlay:audio_changed",
  overlayMapChanged:         "overlay:map_changed",
  overlayClearMap:           "overlay:clear_map",
  overlayReloadStream:       "overlay:reload_stream",
  overlayError:              "overlay:error",
  // Overlay control commands (client → server)
  overlaySetScreen:      "overlay:set_screen",
  overlaySetActiveMatch: "overlay:set_active_match",
  overlaySetActivePool:  "overlay:set_active_pool",
  overlaySetAudio:       "overlay:set_audio",
  overlaySetMap:         "overlay:set_map",
  overlayPlayPreview:    "overlay:play_preview",
} as const;
```

## Related

- [Socket Rooms](../internal/socket-rooms) - full room join/event usage guide
- [TA Types](./ta) - `LiveScore` carried by `taRealtimeScore`
- [Match Types](./matches) - `Match` carried by `matchUpdated`
- [Overlay Types](./overlay) - `OverlayState` carried by `overlayState`
