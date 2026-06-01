---
id: overlay-socket
title: Overlay Socket
sidebar_label: Overlay Socket
---

`hooks/useOverlaySocket.ts` (`@h/useOverlaySocket`) - Real-time overlay state sync.

See [Socket Rooms](./socket-rooms) for general socket room usage. This doc covers the overlay-specific hook only.

## Two modes

| Mode | Who uses it | Socket |
|---|---|---|
| `"view"` | OBS Browser Sources, overlay pages | Fresh independent socket per page |
| `"control"` | Overlay dashboard (casters) | Shared singleton or API key socket |

View mode creates a new socket and disconnects it on unmount. Control mode reuses an existing socket or creates one via API key.

## Usage

### View mode (overlay page)

```tsx
import { useOverlaySocket } from "@h/useOverlaySocket";

function OverlayPage({ tournamentId, apiKey }) {
  const { overlayState, isConnected } = useOverlaySocket({
    mode: "view",
    tournamentId,
    apiKey, // optional
  });

  // overlayState.screen        - current screen config
  // overlayState.activeMatchId - active match UUID | null
  // overlayState.activePoolId  - active pool UUID | null
  // overlayState.audio         - per-player volume/mute state
}
```

### Control mode (dashboard)

```tsx
import { useOverlaySocket } from "@h/useOverlaySocket";
import { useAuth } from "@h/use-auth";

function OverlayDashboard({ tournamentId }) {
  const { socket } = useAuth();

  const {
    overlayState,
    setScreen,
    setActiveMatch,
    setActivePool,
    setAudio,
    reloadStream,
  } = useOverlaySocket({
    mode: "control",
    tournamentId,
    socket, // authenticated socket from useAuth
  });

  setScreen({ screen: "vs" });
  setActiveMatch(matchId);
  setActivePool(poolId);
  setAudio({ player: 0, muted: true, volume: 0.5 });
  reloadStream("both");
}
```

### Control mode with API key (no session)

```tsx
useOverlaySocket({
  mode: "control",
  tournamentId,
  apiKey: "tournament-api-key",
});
```

## `overlayState` shape

Full type → [`OverlayState`](../types/overlay#overlaystate). `screen` → [`OverlayScreenData`](../types/overlay#overlayscreendata).

```ts
{
  screen: OverlayScreenData;     // current screen config
  activeMatchId: string | null;  // active match
  activePoolId: string | null;   // active map pool
  audio: {
    player0Muted: boolean;
    player0Volume: number;       // 0-1
    player1Muted: boolean;
    player1Volume: number;       // 0-1
  };
}
```

### `OverlayScreenData` variants

```ts
{ screen: "idle" }
{ screen: "countdown" }
{ screen: "intermission" }
{ screen: "vs" }
{ screen: "picks_bans" }
{ screen: "play" }
{ screen: "bracket" }
{ screen: "map_overview"; songHash: string; difficulty?: string; characteristic?: string }
```

## Control functions

| Function | Emits | Description |
|---|---|---|
| `setScreen(screen)` | `overlay:set_screen` | Switch overlay to a screen |
| `setActiveMatch(matchId)` | `overlay:set_active_match` | Set active match (null = clear) |
| `setActivePool(poolId)` | `overlay:set_active_pool` | Set active map pool (null = clear) |
| `setAudio(cmd)` | `overlay:set_audio` | Mute/volume per player - [`OverlayAudioCommand`](../types/overlay#overlayaudiocommand) |
| `reloadStream(player)` | `overlay:reload_stream` | Trigger stream reconnect: `0`, `1`, or `"both"` |

## Events listened

| Socket event | Effect |
|---|---|
| `overlay:state` | Full state sync on join |
| `overlay:control_joined` | Control room confirmed, state seeded |
| `overlay:screen_changed` | Updates `overlayState.screen` |
| `overlay:active_match_changed` | Updates `overlayState.activeMatchId` |
| `overlay:active_pool_changed` | Updates `overlayState.activePoolId` |
| `overlay:audio_changed` | Updates `overlayState.audio` |
| `overlay:map_changed` | Switches to `map_overview` screen with song info |
| `overlay:error` | Logs error (no state change) |

## Notes

- View mode overlay pages load the public state - no auth needed unless the tournament is private
- Control mode requires either a valid session socket or a valid API key
- `map_overview` screen is set automatically by the server when TA sends a `loadSong` command - don't set it manually
- Audio changes are local to the overlay state - they don't mute the actual OBS audio sources, just the WebRTC streams in the overlay page

## Related

- [Socket Rooms](./socket-rooms) - underlying room join/event constants
- [Overlay Types](../types/overlay) - `OverlayState`, `OverlayScreenData`, `OverlayAudioCommand`
- [HUD Bridge Types](../types/hud-bridge) - `OverlayBridgePayload` sent to custom HUDs
- [Authentication](./auth) - API key auth used in control mode
