---
id: ta-client
title: TournamentAssistant Client
sidebar_label: TA Client
---

Files in `lib/taClient/`:
- `TAClient.ts` - init, qualifier score handling
- `TAMatchBridge.ts` - real-time match event routing
- `TAHandlers.ts` - logging helper

Package: `moons-ta-client`

## Architecture

```
TA Server (WebSocket)
    |
    v
TAClient (moons-ta-client)
    |
    +-- TAClient.ts        - connects, joins tournaments, handles qualifier scores
    |
    +-- TAMatchBridge.ts   - listens to match/user/song events, routes to Socket.IO rooms
```

The bridge maintains in-memory maps to route TA events (which use TA GUIDs) to DB IDs and Socket.IO rooms.

## Initialization (server startup)

Called once in `server.ts` after the DB pool is ready:

```ts
import { taClientInitialize } from "@l/taClient/TAClient";
import { startTAMatchBridge } from "@l/taClient/TAMatchBridge";

const ta = await taClientInitialize();
if (ta) startTAMatchBridge(ta);
```

`taClientInitialize()`:
1. Creates `TAClient` instance with auth token from `MAIN_AUTH_TOKEN` env var
2. Connects to `TA_IP:TA_WS_PORT`
3. For each TA tournament with a matching `ta_tournament_guid` in DB: joins it + sets score update frequency to 30 FPS
4. Registers bridge maps (TA GUID → DB tournament ID, TA match GUID → DB match ID)
5. Attaches `qualifierScoreSubmitted` handler

## Getting the client instance

```ts
import { getTAClient, isTaEnabled } from "@l/taClient/TAClient";

const enabled = await isTaEnabled();
if (!enabled) return NextResponse.json({ error: "TA disabled" }, { status: 503 });

const ta = getTAClient();
if (!ta) return NextResponse.json({ error: "TA not connected" }, { status: 503 });
```

`isTaEnabled()` reads `system_settings` table, key `ta_integration`. Returns `false` if TA is disabled in admin settings.

## Bridge maps (TAMatchBridge)

The bridge uses five in-memory maps to route events:

| Map | Key | Value | Purpose |
|---|---|---|---|
| `taTournamentToDbId` | TA tournament GUID | DB tournament UUID | Route tournament events |
| `matchTournamentMap` | TA match GUID | DB tournament UUID | Route match events to tournament room |
| `taMatchToDbMatchId` | TA match GUID | DB match UUID | Route match events to match room |
| `userMatchMap` | TA user GUID | TA match GUID | Route realtime scores |
| `pendingMatchReplace` | TA tournament GUID | `{ oldMatchGuid, ts }` | Handle TA delete+recreate on map change |

Register/unregister when linking matches:

```ts
import {
  registerTATournament, unregisterTATournament,
  registerTAMatch, unregisterTAMatch,
  registerTAMatchDbId, unregisterTAMatchDbId,
} from "@l/taClient/TAMatchBridge";

registerTAMatch(taMatchGuid, dbTournamentId);
registerTAMatchDbId(taMatchGuid, dbMatchId);

unregisterTAMatch(taMatchGuid);
unregisterTAMatchDbId(taMatchGuid);
```

## Events the bridge handles

### From `TAClient` (direct events)

| Event | Action |
|---|---|
| `realtimeScore` | Broadcasts `ta:realtimeScore` to `coordinator:{id}` and `match:{id}` rooms |
| `songFinished` | Accumulates per-player scores; when both finish (or 8s timeout), calls `flushBucket()` |
| `qualifierScoreSubmitted` | Upserts score to `song_scores` table |

### From `TAClient.stateManager` (state events)

| Event | Action |
|---|---|
| `matchCreated` | Registers bridge maps, broadcasts `ta:matchCreated`, shows "Match Started" prompt to players |
| `matchUpdated` | Broadcasts `ta:matchUpdated`, persists `currentMap` to DB |
| `matchDeleted` | Clears bridge maps, broadcasts `ta:matchDeleted`, tracks for delete+recreate pattern |
| `userConnected` | Broadcasts `ta:userUpdated` |
| `userDisconnected` | Broadcasts `ta:userDisconnected` |
| `userUpdated` | Broadcasts `ta:userUpdated` |
| `tournamentCreated` | Auto-joins tournament if found in DB |

## Song finish flow (1v1)

TA sends one `songFinished` event per player. The bridge accumulates both before writing to DB:

1. First player finishes → stored in `pendingScores` bucket, 8-second timeout started
2. Second player finishes → timeout cancelled, `flushBucket()` called immediately
3. If second player never fires → timeout fires, their score saved as 0
4. `flushBucket()` updates `tournament_matches.match_info.playData`, recalculates match score, broadcasts `match:updated`
5. `fireShowPrompt()` sends score summary to players' TA screens

### `returningToMenu` flag

If coordinator clicked "Return to Menu" during a play, `match_info.returningToMenu` is set to `true`. `flushBucket()` detects this, discards the incoming scores, and clears the flag.

## Qualifier score flow

When a player submits a qualifier score in TA:

1. TA emits `qualifierScoreSubmitted`
2. Bridge looks up `map_pool_songs` via `ta_qualifier_map_guid` + `ta_qualifier_guid`
3. Looks up user via `scoresaber_id`
4. Upserts to `song_scores` (only updates if new score is higher - handled by `ON CONFLICT`)
5. Increments `attempts_used`

:::note
Only scores from tournaments with `status != 'ended'` are accepted.
:::

## TA delete+recreate pattern

When a non-leader updates the match map, TA deletes the match and creates a new one with a different GUID. The bridge handles this:

1. `matchDeleted` fires: stores `{ oldMatchGuid, ts }` in `pendingMatchReplace[taTournamentGuid]`
2. `matchCreated` fires within 5 seconds: detects pending replace, updates `ta_match_guid` in DB, re-registers bridge maps

## Env vars

| Var | Description |
|---|---|
| `TA_IP` | TA server hostname/IP |
| `TA_WS_PORT` | TA WebSocket port |
| `MAIN_AUTH_TOKEN` | TA authentication token |
| `TA_DEBUG` | Set to `"true"` for verbose logging |

## Debugging

Set `TA_DEBUG=true` in `.env` to enable verbose `[TAMatchBridge]` and `[QualScore]` logs.

`taLog()` in `TAHandlers.ts` gates output on `TA_DEBUG` - no log spam in production.

## Related

- [Socket Rooms](./socket-rooms) - socket events broadcast by the bridge (`ta:realtimeScore`, `ta:matchUpdated`, etc.)
- [Match Utils](./match-utils) - `buildGameplayParameters` consumed when starting songs
- [Qualifier Math](./qualifier-math) - qualifier scores submitted via TA feed into this calculator
- [TA Types](../types/ta) - `LiveScore` shape broadcast via `ta:realtimeScore`
