---
id: match-utils
title: Match Utilities
sidebar_label: Match Utilities
---

`lib/matchUtils.ts` (`@l/matchUtils`) - Beat Saber match config, modifier flags, download state.

## Pool size → Best-of calculation

Pool layout convention: `2 bans + picks + 1 tiebreaker`

For a pool of N maps: `BO = N - 2` (clamped to nearest odd number ≥ 1).

```ts
import { winsNeeded } from "@l/matchUtils";

const wins = winsNeeded(poolSize); // number | null
// null if pool too small (< 3 maps)
// poolSize 5 -> BO3 -> 2 wins needed
// poolSize 7 -> BO5 -> 3 wins needed
```

| Pool Size | Best Of | Wins Needed |
|---|---|---|
| 3 | BO1 | 1 |
| 5 | BO3 | 2 |
| 7 | BO5 | 3 |
| 9 | BO7 | 4 |
| 4 | BO1 (even - clamps down) | 1 |
| 6 | BO3 (even - clamps down) | 2 |

## Building TA gameplay parameters

`buildGameplayParameters(map, opts)` constructs the payload sent to TournamentAssistant when starting a song.

```ts
import { buildGameplayParameters } from "@l/matchUtils";
import type { SongOptions } from "@l/matchUtils";

const opts: SongOptions = {
  disablePause: false,
  disableFail: false,
  disableScoresaberSubmission: false,
  disableCustomNotesOnStream: false,
  gameModifiers: 0, // bitfield - see GAME_MODIFIER_FLAGS
};

const params = buildGameplayParameters(map, opts);
// Pass to TAClient.playSong() or the TA API route
```

Difficulty string → TA int mapping:

| String | TA int |
|---|---|
| `Easy` | 0 |
| `Normal` | 1 |
| `Hard` | 2 |
| `Expert` | 3 |
| `ExpertPlus` | 4 |

## Game modifier flags

`GAME_MODIFIER_FLAGS` - array of `{ label, bit }`. Combine with bitwise OR.

```ts
import { GAME_MODIFIER_FLAGS } from "@l/matchUtils";

const selected = ["No Fail", "Ghost Notes"];
const modifiers = GAME_MODIFIER_FLAGS
  .filter(f => selected.includes(f.label))
  .reduce((acc, f) => acc | f.bit, 0);
```

| Label | Bit |
|---|---|
| No Fail | 1 |
| No Bombs | 2 |
| No Arrows | 4 |
| No Walls | 8 |
| Slow Song | 16 |
| InstaFail | 32 |
| Fail On Saber Clash | 64 |
| Battery Energy | 128 |
| Fast Notes | 256 |
| Fast Song | 512 |
| Disappearing Arrows | 1024 |
| Ghost Notes | 2048 |
| Strict Angles | 16384 |
| Pro Mode | 32768 |
| Zen Mode | 65536 |
| Small Cubes | 131072 |
| Super Fast Song | 262144 |

## Download state

Map download state from TA (used in coordinator panel badges).

```ts
import { DOWNLOAD_STATE_LABEL, DOWNLOAD_STATE_BADGE } from "@l/matchUtils";

const label = DOWNLOAD_STATE_LABEL[state]; // "Idle" | "Downloading" | "Downloaded" | "Failed"
const badgeClass = DOWNLOAD_STATE_BADGE[state]; // Tailwind classes
```

| State | Label | Color |
|---|---|---|
| 0 | Idle | muted |
| 1 | Downloading | yellow |
| 2 | Downloaded | green |
| 3 | Failed | red |

## Related

- [TA Client](./ta-client) - `TAClient.playSong()` consumes `buildGameplayParameters` output
- [Match Types](../types/matches) - `MatchMapData` shape passed to `buildGameplayParameters`
- [Socket Rooms](./socket-rooms) - `match:updated` event fired after score flush
