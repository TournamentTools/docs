---
id: player-data
title: Player Data Types
sidebar_label: player-data
---

Ranking data fetched from ScoreSaber and BeatLeader APIs.

## ScoreSaberData

```ts
type ScoreSaberData = {
  id: string;
  profilePicture: string | null;
  rank: number | null;
  pp: number | null;
  country: string;
  countryRank: number | null;
  [key: string]: unknown;
};
```

## BeatLeaderData

```ts
type BeatLeaderData = {
  id: string;
  avatarUrl: string | null;
  pp: number | null;
  rank: number | null;
  country: string;
  countryRank: number | null;
  [key: string]: unknown;
};
```

## Related

- [User Types](./user) - `User.scoresaber_data` / `User.beatleader_data`
- [Overlay Player Types](./overlay/player) - `OverlayPlayer.ranks` tuple `[ssRank, blRank]`
