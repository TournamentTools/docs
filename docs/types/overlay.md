---
id: overlay
title: Overlay Types
sidebar_label: overlay
---

Types for the overlay screen state machine and audio control, used by the overlay dashboard and socket events.

## Pages in this category

- [Accuracy Graph](/docs/types/overlay/acc-graph) - accuracy graph data used by overlay screens.
- [BeatSaver](/docs/types/overlay/beatsaver) - BeatSaver metadata used by overlay displays.
- [Player](/docs/types/overlay/player) - player data used inside overlay payloads.

## OverlayState

```ts
type OverlayState = {
  screen: OverlayScreenData;
  activeMatchId: string | null;
  activePoolId: string | null;
  audio: OverlayAudioState;
};
```

## OverlayScreenData

Discriminated union - `screen` field determines which screen is active.
`intermission.matches` → [`IntermissionMatch[]`](#intermissionmatch) below.

```ts
type OverlayScreenData =
  | { screen: "idle" }
  | { screen: "countdown"; targetTimestamp: number; label?: string }
  | { screen: "intermission"; matches: IntermissionMatch[] } // → IntermissionMatch below
  | { screen: "vs" }
  | { screen: "picks_bans" }
  | { screen: "map_overview"; songHash: string; difficulty?: string; characteristic?: string }
  | { screen: "play" }
  | { screen: "bracket"; bracketView?: "upper" | "lower" };
```

## IntermissionMatch

```ts
type IntermissionMatch = {
  matchId: string;
  roundName: string;
  player1: string | null;
  player2: string | null;
  scheduledTime?: string;
};
```

## OverlayAudioState

```ts
type OverlayAudioState = {
  player0Muted: boolean;
  player1Muted: boolean;
  player0Volume: number;
  player1Volume: number;
};
```

## OverlayAudioCommand

Command sent from the control panel via `SocketEvents.overlaySetAudio`. See [Socket Rooms](/docs/internal/socket-rooms).

```ts
type OverlayAudioCommand = {
  player: 0 | 1 | "both";
  muted: boolean;
  volume?: number;
};
```

## Related

- [Socket Rooms](/docs/internal/socket-rooms) - `overlayState` event carries `OverlayState`; `overlaySetAudio` carries `OverlayAudioCommand`; `overlayScreenChanged` carries `OverlayScreenData`
- [HUD Bridge Types](/docs/types/hud-bridge) - `OverlayBridgePayload` delivered to custom HUDs (uses `OverlayState` data)
- [Overlay Player Types](/docs/types/overlay/player) - `OverlayPlayer` shape used inside overlay screens
- [Match Types](/docs/types/matches) - `Match` is what `activeMatchId` resolves to
