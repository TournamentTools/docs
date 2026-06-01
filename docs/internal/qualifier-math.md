---
id: qualifier-math
title: Qualifier Calculator
sidebar_label: Qualifier Math
---

`lib/qualifierMath.ts` (`@l/qualifierMath`) - Equalized scoring for qualifier rounds.

## Purpose

Qualifier maps vary in difficulty and max possible score. Raw scores can't be compared directly across maps. The equalization algorithm normalizes scores so a player who crushes an easy map doesn't outrank someone who nearly FCs a harder one.

## Equations

Let:
- $N$ = total number of maps in qualifier pool
- $H_i$ = highest score submitted by any player on map $i$
- $S = \sum_{i=1}^{N} H_i$ (sum of all per-map highest scores)
- $s_{p,i}$ = raw score submitted by player $p$ on map $i$
- $k$ = number of maps player $p$ has played $(k \leq N)$
- $u = N - k$ = maps player $p$ has NOT played

### Step 1 - Equalization multiplier (per map)

$$M_i = \frac{1}{N} \cdot \frac{S}{H_i} = \frac{S}{N \cdot H_i}$$

Maps where $H_i$ is low (fewer points possible) get a higher multiplier - upweighted to be worth the same as harder maps.

### Step 2 - Equalized score (per player per map)

$$\text{EqScore}_{p,i} = s_{p,i} \cdot M_i$$

### Step 3 - Equalized accuracy (per player per map)

$$\text{EqAcc}_{p,i} = \frac{\text{EqScore}_{p,i}}{H_i \cdot M_i} \times 100 = \frac{s_{p,i} \cdot M_i}{H_i \cdot M_i} \times 100 = \frac{s_{p,i}}{H_i} \times 100$$

The multiplier cancels. $\text{EqAcc}_{p,i}$ is the player's score as a percentage of the best score on that map - this is the metric used for ranking.

### Step 4 - Average equalized accuracy (per player)

Unplayed maps contribute 0. Average **always divides by $N$**:

$$\text{AvgEqAcc}_p = \frac{1}{N} \sum_{i \in \text{played}} \text{EqAcc}_{p,i}$$

Unplayed maps implicitly add 0, so the penalty scales linearly with maps missed.

Example: 4 maps, player averages 95% on played maps.

| Maps played | Calculation | $\text{AvgEqAcc}$ |
|---|---|---|
| 4/4 | $(4 \times 95) / 4$ | 95.0 |
| 3/4 | $(3 \times 95) / 4$ | 71.25 |
| 2/4 | $(2 \times 95) / 4$ | 47.5 |
| 1/4 | $(1 \times 95) / 4$ | 23.75 |

### Step 5 - Ranking

Players sorted by $\text{AvgEqAcc}_p$ descending. Seed 1 = highest value.

### Note on `totalEqualizedScore`

$\sum_i \text{EqScore}_{p,i}$ is computed and stored per player but is **not** used for ranking. Rankings are determined solely by $\text{AvgEqAcc}_p$.

## Usage

```ts
import { qualifierCalculator } from "@l/qualifierMath";

const result = await qualifierCalculator({
  tournamentId: "...",
  hasAccess: true,   // false = only public qualifier pools visible
  bracketGen: false, // true = strips song details (used by bracket generator)
});

if (!result) {
  // No qualifier pool found for tournament
}

result.playerRankings  // sorted array, index 0 = top seed
result.songs           // per-map scores + equalization data (absent if bracketGen=true)
result.songCount       // total map count
```

### `playerRankings` shape

See [`PlayerRanking`](../types/qual-score#playerranking) in Qualifier Score Types.

```ts
[
  {
    user_id: string;
    username: string;
    avatar_url: string | null;
    totalEqualizedScore: number;
    averageAccuracy: number;     // sort key
    mapScores: Array<{
      mapId: string;
      score: number;             // raw
      equalizedScore: number;
      accuracy: number;          // raw acc %
      equalizedAcc: number;      // equalized acc %
    }>;
  }
]
```

### `songs[n]` shape (when `bracketGen: false`)

See [`QualifierMapPoolSong`](../types/qual-score#qualifiermappoolsong).

```ts
{
  id: string;
  highestScore: number;
  equalizationMultiplier: number;
  highestScoreEqualized: number;
  scores: Array<{
    user_id: string;
    username: string;
    song_score: number;
    equalizedScore: number;
    equalizedAcc: number;
    accuracy: number;   // raw acc % based on maxScore from selectedDiff
  }>;
}
```

## Bracket seeding

`bracketGen: true` strips song data from the response - use this when generating brackets to avoid sending unnecessary data. `playerRankings` is still populated and sorted, seed 1 = index 0.

```ts
const data = await qualifierCalculator({ tournamentId, hasAccess: true, bracketGen: true });
const seeds = data?.playerRankings ?? [];
// seeds[0] = 1st seed, seeds[1] = 2nd seed, etc.
```

## Notes

- `hasAccess: true` required to see private qualifier pools. Pass the result of `qualifierPermissions()` check.
- Only one qualifier pool per tournament is supported (first matching pool is used).
- If `mapHighestScore === 0` (no scores on a map), that map's multiplier is 0 - scores on it contribute nothing.
- `accuracy` (normal) uses `selectedDiff.maxScore` from the stored song data, not the equalized max.

## Related

- [Bracket System](./bracket) - `qualifierCalculator` output feeds directly into bracket seeding
- [Qualifier Score Types](../types/qual-score) - `QualifierScore`, `QualifierMapPoolSong`, `PlayerRanking`
- [Permissions](./permissions) - `qualifierPermissions()` used to determine `hasAccess`
- [TA Client](./ta-client) - qualifier scores submitted via TA flow
