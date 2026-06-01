---
id: matches
title: Match Types
sidebar_label: matches
---

Types for match state, live scores, picks/bans, and map/score data.

## Match

```ts
type Match = {
  id: string;
  state: "upcoming" | "live" | "completed" | "forfeit";
  matchData: MatchDeepData;
  timestampz: string;
  taMatchGuid?: string | null;
  matchNumber?: number | null;
  matchRound?: string | null;
  replayUsed?: Record<string, boolean>;
  replayedMaps?: Record<string, boolean>;
  playerSsIds?: [string | null, string | null];
  playerBlIds?: [string | null, string | null];
  currentMap?: {
    guid: string;
    gameplayParameters?: { beatmap?: { name?: string; levelId?: string } };
  } | null;
};
```

## MatchDeepData

Internal shape nested inside `Match.matchData`.
`mapPool` → [`MatchMapPool`](#matchmappool) below. `coordinator` → [`MatchPlayerData`](#matchplayerdata) below.

```ts
type MatchDeepData = {
  players: MatchPlayerData[];
  pickBansDatas: MatchPicksBansData[];
  playData: MatchPlayData[];
  mapPool?: MatchMapPool;       // → MatchMapPool below
  winner: string | null;
  score: [number, number];
  coordinator: MatchPlayerData; // → MatchPlayerData below
};
```

## MatchMapPool

```ts
type MatchMapPool = {
  id: string;
  name: string;
  maps: MatchMapData[]; // → MatchMapData below
};
```

## MatchPlayerData

```ts
type MatchPlayerData = {
  id: string;
  username: string;
  avatarURL: string;
  country?: string | null;
  globalRank?: number | null;
  countryRank?: number | null;
};
```

## MatchPlayData

`replayData` → [`ReplayData`](#replaydata) below.

```ts
type MatchPlayData = {
  mapData: MatchMapData;        // → MatchMapData below
  scoreData: MatchScoreData[];  // → MatchScoreData below
  replayData: ReplayData;       // → ReplayData below
  isPlaying?: boolean;
  songHash?: string;
  gameplayParameters?: { beatmap?: { name?: string; levelId?: string } };
};
```

## MatchMapData

```ts
type MatchMapData = {
  id: string;
  poolId: string;
  beatSaverKey: string;
  songHash: string;
  difficulty: "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";
  characteristic: "Standard" | "NoArrows" | "OneSaber" | "90Degree" | "360Degree" | "Lawless";
  category: "Accuracy" | "Trueacc" | "Balanced" | "Midspeed" | "Speed" | "Tech" | "Challenge" | "Dance" | "Fitness" | "Other";
  metaData: MapMetaData;
  picker?: string;
  tiebreaker?: boolean;
};

type MapMetaData = {
  coverURL: string;
  songName: string;
  songAuthorName: string;
  levelAuthorName: string;
  bpm: number;
  duration: number;
};
```

## MatchScoreData

```ts
type MatchScoreData = {
  playerId: string;
  score: number;
  accuracy: number;
  misses: number;
  badCuts: number;
  maxCombo: number;
};
```

## MatchPicksBansData

```ts
type MatchPicksBansData = {
  map: MatchMapData;
  action: "pick" | "ban";
  picker: string;
  tiebreaker: boolean;
};
```

## ReplayData

```ts
type ReplayData = {
  replay: boolean;
  replayerId?: string;
  scoreData?: MatchScoreData[]; // → MatchScoreData above
  superseded?: boolean;
};
```

## LiveScoreEntry

Real-time score pushed via socket during an active map.

```ts
type LiveScoreEntry = {
  score: number;
  accuracy: number;
  combo: number;
  notesMissed: number;
  badCuts: number;
};
```

## Related

- [HUD Bridge Types](./hud-bridge) - `BridgeMatchData`, `BridgeLiveScore` (bridge-side equivalents of `MatchDeepData`, `LiveScoreEntry`)
- [TA Types](./ta) - `LiveScore` (extended real-time score; `LiveScoreEntry` is the lighter match-display version)
- [Tournament Types](./tournaments) - `MapPoolSong` / `SongData` (pool-side map shape vs `MatchMapData`)
- [Socket Rooms](../internal/socket-rooms) - `SocketEvents.matchUpdated` carries `Match`; `SocketEvents.taRealtimeScore` carries live scores
