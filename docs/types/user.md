---
id: user
title: User Types
sidebar_label: user
---

Types for authenticated users and their profiles.

## UserRole

```ts
type UserRole =
  | "player"
  | "tournament_host"
  | "moderator"
  | "developer"
  | "admin";
```

## User

Full user record from the database.
`scoresaber_data` / `beatleader_data` → [`ScoreSaberData` / `BeatLeaderData`](./player-data).

```ts
interface User {
  id: string;
  discord_id: string;
  username: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  socials: Record<string, string>;
  scoresaber_id?: string;
  beatleader_id?: string;
  scoresaber_data?: ScoreSaberData;
  beatleader_data?: BeatLeaderData;
  ranks: number[];
  country_ranks: number[];
  last_api_update?: string;
  created_at: string;
  updated_at: string;
  banned?: boolean;
  ta_mock_banned?: boolean;
  mock_client_limit?: number;
}
```

## ProfileData

Public-facing profile shape (subset of `User`). Same `ScoreSaberData` / `BeatLeaderData` references → [Player Data Types](./player-data).

```ts
interface ProfileData {
  id?: string;
  username: string;
  avatar_url?: string;
  role?: string;
  bio?: string;
  socials: Record<string, string>;
  scoresaber_id?: string;
  beatleader_id?: string;
  scoresaber_data?: ScoreSaberData;
  beatleader_data?: BeatLeaderData;
  ranks?: {
    scoresaber?: { rank: number; date: string }[];
    beatleader?: { rank: number; date: string }[];
  };
  country_ranks?: {
    scoresaber?: { rank: number; date: string }[];
    beatleader?: { rank: number; date: string }[];
  };
  created_at?: string;
  banned?: boolean;
  streamKey?: string;
}
```

## Related

- [Player Data Types](./player-data) - `ScoreSaberData`, `BeatLeaderData` (used in both `User` and `ProfileData`)
- [Tournament Types](./tournaments) - `TournamentPlayer.user?: User`; `TournamentPlayerExpanded` has inline `scoresaber_data` / `beatleader_data` subsets
