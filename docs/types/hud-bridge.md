---
id: hud-bridge
title: HUD Bridge Types
sidebar_label: hud-bridge
---

Types for the `window.postMessage` payload that CompSaber sends into custom HUD iframes.

The payload shape is `OverlayBridgePayload`. See [Custom HUD Bridge](../external/custom-hud-bridge) for usage.

Type cross-references: `hudConfig` → [`HudThemeConfig`](./hud-config); `activeMatch` → [`BridgeMatchData`](#bridgematchdata); `audio` → [`BridgeAudio`](#bridgeaudio); `allMatches` → [`BridgeScheduleMatch[]`](#bridgeschedulematch); `tournament` → [`BridgeTournamentInfo`](#bridgetournamentinfo).

## OverlayBridgePayload

```ts
interface OverlayBridgePayload {
  type: "COMPSABER_STATE";
  version: 2;
  payload: {
    tournamentId: string;
    tournament: BridgeTournamentInfo | null;
    activeMatch: BridgeMatchData | null;
    allMatches: BridgeScheduleMatch[];
    hudConfig: HudThemeConfig;
    audio: BridgeAudio;
    bracketView: "upper" | "lower" | null;
    countdownTarget: number | null;
    streamReload: [number, number];
  };
}
```

Listen for it with:

```js
window.addEventListener('message', (e) => {
  if (e.data?.type !== 'COMPSABER_STATE') return;
  const { activeMatch, hudConfig, audio } = e.data.payload;
});
```

## BridgeMatchData

`player1` / `player2` → [`BridgePlayer`](#bridgeplayer). `mapPool` → [`BridgeMap[]`](#bridgemap).

```ts
interface BridgeMatchData {
  matchId: string;
  matchRound: string;
  score: [number, number];
  player1: BridgePlayer;     // → BridgePlayer below
  player2: BridgePlayer;     // → BridgePlayer below
  activePoolId: string | null;
  mapPool: BridgeMap[];      // → BridgeMap below
}
```

## BridgePlayer

`liveScore` → [`BridgeLiveScore`](#bridgelivescore) below.

```ts
interface BridgePlayer {
  id: string;
  username: string;
  avatarURL: string | null;
  country: string | null;
  ranks: [number, number] | null;
  liveScore: BridgeLiveScore | null; // → BridgeLiveScore below
}
```

## BridgeLiveScore

```ts
interface BridgeLiveScore {
  score: number;
  accuracy: number;
  combo: number;
  notesMissed: number;
  badCuts: number;
}
```

## BridgeMap

```ts
interface BridgeMap {
  id: string;
  songHash: string;
  difficulty: string;
  songName: string | null;
  songAuthorName: string | null;
  levelAuthorName: string | null;
  coverURL: string | null;
  bpm: number | null;
  duration: number | null;
  beatSaverKey: string | null;
}
```

## BridgeScheduleMatch

Used in `allMatches` - full schedule for the bracket/intermission screen.

```ts
interface BridgeScheduleMatch {
  id: string;
  matchNumber: number;
  roundName: string;
  state: string;
  startTime: string | null;
  score: [number, number];
  winnerId: string | null;
  player1: { id: string; username: string; avatarURL: string | null; country: string | null } | null;
  player2: { id: string; username: string; avatarURL: string | null; country: string | null } | null;
}
```

## BridgeTournamentInfo

```ts
interface BridgeTournamentInfo {
  id: string;
  title: string;
  status: string;
  bracketType: string | null;
  imageUrl: string | null;
}
```

## BridgeAudio

```ts
interface BridgeAudio {
  player0Volume: number;
  player0Muted: boolean;
  player1Volume: number;
  player1Muted: boolean;
}
```

## CustomHud

```ts
type CustomHudSourceType = "inline" | "upload" | "url";

interface CustomHud {
  id: string;
  tournamentId: string;
  label: string;
  sourceType: CustomHudSourceType;
  sourceUrl: string | null;
  s3Object: string | null;
  htmlContent: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Related

- [Custom HUD Bridge](../external/custom-hud-bridge) - how to use this payload
- [HUD Config Types](./hud-config) - `HudThemeConfig` shape
- [Overlay Types](./overlay) - screen/state types for the overlay system
- [BYOH Examples](../examples/BYOH/vs) - example HUDs consuming this payload
