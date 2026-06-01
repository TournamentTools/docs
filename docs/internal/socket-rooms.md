---
id: socket-rooms
title: Socket Rooms
sidebar_label: Socket Rooms
---

Constants live in `types/rooms.ts` (`@t/rooms`). Hooks live in `hooks/`.

See [Socket Room & Event Types](../types/rooms) for the full constant reference.

## Room constants

Use `Room.*` instead of raw join-event strings:

```ts
// Before
socket.emit("join_coordinator_room", tournamentId);
socket.emit("join_tournament_room", tournamentId);
socket.emit("join_match_room", activeMatchId);

// After
import { Room, LeaveRoom } from "@t/rooms";
socket.emit(Room.Coordinator, tournamentId);
socket.emit(Room.Tournament, tournamentId);
socket.emit(Room.Match, activeMatchId);
socket.emit(LeaveRoom.Match, activeMatchId); // cleanup
```

Use `SocketEvents.*` for server-broadcast event names:

```ts
import { SocketEvents } from "@t/rooms";

socket.on(SocketEvents.matchUpdated, handler);
socket.on(SocketEvents.taRealtimeScore, handler);
socket.on(SocketEvents.overlayMapChanged, handler);
```

Use `RoomName.*` if you need the actual room string (e.g. for logging):

```ts
import { RoomName } from "@t/rooms";
console.log(RoomName.coordinator(tournamentId)); // "coordinator:abc123"
```

## `useMatchRoom` - spectator/viewer match data

For any page that needs live match data from a public match room.

```tsx
import { useMatchRoom } from "@h/useMatchRoom";

function MyMatchPage({ tournamentId, matchId, initialMatch }) {
  const { socket } = useAuth(); // or initSocket() for overlay pages

  const {
    taUsers,          // Record<string, { guid, platformId }>
    realtimeScores,   // Record<string, RealtimeScore> - keyed by TA guid
    liveScore,        // [number, number]
    liveState,        // "upcoming" | "live" | "completed" | ...
    liveWinner,       // string | null
    livePickBans,     // MatchPicksBansData[]
    livePlayData,     // MatchPlayData[]
    lastSongResults,  // Push_SongFinished[] - last 20
  } = useMatchRoom(socket, {
    tournamentId,
    matchId,
    // Seed initial values from SSR/fetch to avoid flash
    initialScore: initialMatch?.matchData.score,
    initialState: initialMatch?.state,
    initialWinner: initialMatch?.matchData.winner,
    initialPickBans: initialMatch?.matchData.pickBansDatas,
    initialPlayData: initialMatch?.matchData.playData,
  });
```

### Resolving realtimeScores to players

`realtimeScores` is keyed by TA guid. Players in the DB are matched via `platformId` (ScoreSaber or BeatLeader ID). `taUsers` maps guid → `{ guid, platformId }`.

Chain: `TA guid → platformId → playerSsIds/playerBlIds → player.id`

```ts
const players = initialMatch?.matchData.players ?? [];
const ssIds = initialMatch?.playerSsIds ?? [null, null];
const blIds = initialMatch?.playerBlIds ?? [null, null];

const liveScoresByPlayerId: Record<string, typeof realtimeScores[string]> = {};
for (const [guid, score] of Object.entries(realtimeScores)) {
  const taUser = taUsers[guid];
  if (!taUser) continue; // guid not yet mapped - resolves on next ta:matchUpdated
  const playerIdx = players.findIndex((_, i) =>
    (ssIds[i] && taUser.platformId === ssIds[i]) ||
    (blIds[i] && taUser.platformId === blIds[i])
  );
  if (playerIdx >= 0) {
    liveScoresByPlayerId[players[playerIdx].id] = score;
  }
}
```

### RealtimeScore fields examples

```ts
p0Score.scoreWithModifiers  // current score (with modifiers applied)
p0Score.accuracy            // 0.0 - 1.0, multiply by 100 for %
p0Score.combo               // current combo
p0Score.notesMissed         // total notes missed (since start of song)
p0Score.badCuts             // total bad cuts (since start of song)
p0Score.playerHealth        // 0.0 - 1.0
p0Score.songPosition        // seconds into song
p0Score.maxScore            // max possible score so far
p0Score.bombHits            // total bombs hit (since start of song)
p0Score.wallHits            // total walls hit (since start of song)
p0Score.leftHand?.hit       // per-hand data (optional)
p0Score.rightHand?.miss     
```

Always guard with optional chaining - score may be absent before a song starts.

### What `useMatchRoom` handles automatically

- Joins `match:{matchId}` on mount, leaves on unmount
- Reconnect (re-joins on socket `connect` event)
- `ta:realtimeScore`, `ta:songFinished`, `ta:matchUpdated`, `ta:userUpdated`, `match:updated`
- Unknown-guid fallback fetch to `/ta/users`
- `mergePlayData` logic for `livePlayData`

### What it does NOT handle

- `overlay:map_changed`, `tournament:bracketUpdated`
- Tournament room (`Room.Tournament`) - join separately

### `onReloadStream` callback

```ts
useMatchRoom(socket, {
  tournamentId,
  matchId,
  onReloadStream: (player) => {
    // player is 0 | 1 | "both"
  },
});
```

## `useCoordinatorRoom` - coordinator panel data

For coordinator/staff pages that need the protected coordinator room.

```tsx
import { useCoordinatorRoom } from "@h/useCoordinatorRoom";

function MyCoordinatorPage({ tournamentId }) {
  const { socket } = useAuth();
  const [matches, setMatches] = useState([]);

  const { roomJoined, realtimeScores, lastSongResults } = useCoordinatorRoom(
    socket,
    tournamentId,
    {
      onRoomJoined: () => fetchData(),
      onRoomError: (error) => {
        toast({ title: "Access Denied", description: error });
        router.push("/");
      },
      onMatchCreated: () => fetchData(),
      onMatchDeleted: (matchGuid) => {
        setMatches(prev => prev.map(m =>
          m.ta_match_guid === matchGuid ? { ...m, ta_match_guid: null } : m
        ));
      },
    }
  );
}
```

**Handles automatically:**
- Joins `coordinator:{tournamentId}` on mount, leaves on unmount
- Reconnect on socket `connect`
- `coordinator_room_joined`, `coordinator_room_error`
- `ta:realtimeScore`, `ta:songFinished`, `ta:matchCreated`, `ta:matchDeleted`

## Combining hooks

A page needing both coordinator auth AND live match data:

```tsx
function MatchPanelPage({ tournamentId, matchId }) {
  const { socket } = useAuth();
  const [match, setMatch] = useState(null);

  useCoordinatorRoom(socket, tournamentId, {
    onRoomJoined: () => fetchMatch(),
  });

  const { taUsers, realtimeScores, songResultModal } = useMatchSocket(socket, {
    onPickBansUpdate: setPickBans,
    onMatchScoreUpdate: setMatchScore,
    onMatchUpdate: setMatch,
  });
  // Note: useMatchSocket does NOT join a room - coordinator room already
  // carries all match events for the tournament.
}
```

## Overlay rooms

Use `useOverlaySocket` - do not emit `Room.OverlayView` or `Room.OverlayControl` directly.

```tsx
import { useOverlaySocket } from "@h/useOverlaySocket";

// Viewer (public)
const { overlayState, socket } = useOverlaySocket({
  mode: "view",
  tournamentId,
  apiKey, // optional
});

// Controller (requires auth or apiKey)
const { overlayState, setScreen, setActiveMatch } = useOverlaySocket({
  mode: "control",
  tournamentId,
  socket: authSocket,
});
```

## One-off events

```tsx
import { SocketEvents } from "@t/rooms";

useEffect(() => {
  if (!socket) return;
  const handler = () => setBracketSignal(n => n + 1);
  socket.on(SocketEvents.bracketUpdated, handler);
  return () => socket.off(SocketEvents.bracketUpdated, handler);
}, [socket]);
```

## Reference

| Constant | Purpose |
|---|---|
| `Room.Match` | Join event for match room (public) |
| `Room.Tournament` | Join event for tournament room (public) |
| `Room.Coordinator` | Join event for coordinator room (requires auth) |
| `Room.OverlayView` | Join event for overlay viewer room (use `useOverlaySocket`) |
| `Room.OverlayControl` | Join event for overlay control room (use `useOverlaySocket`) |
| `LeaveRoom.Match` | Leave event for match room |
| `LeaveRoom.Tournament` | Leave event for tournament room |
| `LeaveRoom.Coordinator` | Leave event for coordinator room |
| `RoomName.match(id)` | Server room string `match:{id}` |
| `RoomName.coordinator(id)` | Server room string `coordinator:{id}` |
| `SocketEvents.*` | All socket broadcast/emit event name strings |
