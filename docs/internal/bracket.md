---
id: bracket
title: Bracket System
sidebar_label: Bracket System
---

Bracket generation lives in `lib/bracket/` and `hooks/use-bracketgen.ts`.

## Overview

Brackets are generated from a sorted participant list. The system:

1. Pads participants to nearest power-of-2 with BYE entries
2. Seeds participants (1 vs last, 2 vs second-last, etc.)
3. Generates match structure with named rounds
4. Writes matches to the `tournament_matches` DB table

## Supported types

| Type | Description |
|---|---|
| `single_elimination` | Winners-only bracket, one loss = eliminated |
| `double_elimination` | Upper + lower bracket, two losses = eliminated |

## `use-bracketgen` hook

```ts
import { generateTournamentBracket } from "@h/use-bracketgen";

const bracket = await generateTournamentBracket(
  tournamentId,
  participants,  // Participant[] - sorted by seed (index 0 = seed 1)
  "double_elimination",
);

// bracket.upperBracket - FullBracket["upperBracket"]
// bracket.lowerBracket - FullBracket["lowerBracket"] (null for single_elim)
```

`Participant` must have: `{ id, username, seed, ... }`.

## Round naming

### Single elimination

Rounds counted from finals backward:

| Round (from end) | Name |
|---|---|
| 0 | Finals |
| 1 | Semifinals |
| 2 | Quarterfinals |
| 3 | Round 1 - Round of 16 |
| 4+ | Round N - Round of X |

### Double elimination

**Upper bracket:**

| Round (from end) | Name |
|---|---|
| 0 | Winners Finals |
| 1 | Winners Semifinals |
| 2 | Winners Quarterfinals |
| 3+ | Winners Round N |

**Lower bracket:**

| Round | Name |
|---|---|
| Last | Grand Finals |
| Second-to-last | Losers Finals |
| Third-to-last | Losers Semifinals |
| Earlier | Losers Round N |

## Bracket utils (`lib/bracket/bracketUtils.ts`)

```ts
import { getNextPowerOfTwo, fillWithByes, calculateRounds } from "@l/bracket/bracketUtils";

const size   = getNextPowerOfTwo(6);    // 8
const rounds = calculateRounds(8);      // 3
const padded = fillWithByes(participants, 8); // pads with { id: "bye", username: "BYE", ... }
```

## DB operations (`lib/bracket/bracketDBUtils.ts`)

When generating a bracket, matches are written to `tournament_matches`. Each match gets:
- `tournament_id`
- `bracket_round` (round name string)
- `bracket_position` (position in round)
- `bracket_side` (`"upper"` | `"lower"`)
- Initial state: `upcoming`

:::warning
Existing bracket matches are deleted before regenerating - this is destructive. Confirm before calling.
:::

## Bracket display (`lib/bracket/bracketMatches.ts`)

Converts DB match rows to bracket UI format for rendering. Used on the bracket page and overlay bracket screen.

```ts
import { buildBracketFromMatches } from "@l/bracket/bracketMatches";

const display = buildBracketFromMatches(matches, bracketType);
// Returns nested structure for bracket rendering component
```

## Notes

- BYE matches auto-advance the non-BYE player (handled in bracket generation logic)
- Grand Finals in double elimination can have a bracket reset if the lower bracket winner wins game 1
- Bracket generation is not reversible without re-generating from scratch

## Related

- [Qualifier Math](./qualifier-math) - seeding order that feeds into bracket generation
- [Match Types](../types/matches) - `Match` shape written to `tournament_matches`
- [Tournament Types](../types/tournaments) - `TournamentBracketType`
- [Socket Rooms](./socket-rooms) - `bracketUpdated` socket event fired after generation
