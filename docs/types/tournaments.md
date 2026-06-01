---
id: tournaments
title: Tournament Types
sidebar_label: tournaments
---

Types for tournaments, participants, map pools, and song data.

## Tournament

```ts
interface Tournament {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  rules?: string;
  start_date: string;
  end_date?: string;
  status: "upcoming" | "ongoing" | "ended";
  type: "solo" | "team" | "ffa";
  max_participants?: number;
  discord_link?: string;
  host_id?: string;
  host_username?: string;
  host_avatar_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  bracket_type: TournamentBracketType;
  rounds: number;
  best_of: number;
  bracket_generated: boolean;
  settings: string;
  signups_open: boolean;
  public: boolean;
  twitch_link?: string;
  qualifiers: boolean;
  quals_cutoff: number;
  participant_count?: number;
}

type TournamentBracketType = "single_elimination" | "double_elimination";
```

## TournamentRole

```ts
type TournamentRole =
  | "host"
  | "tournament_admin"
  | "developer"
  | "coordinator"
  | "map_pooler"
  | "caster"
  | "player";
```

## TournamentPlayer

```ts
interface TournamentPlayer {
  id: string;
  tournament_id: string;
  user_id: string;
  role: TournamentRole;
  joined_at: string;
  user?: User;
}
```

## TournamentPlayerExpanded

Includes joined ranking data from ScoreSaber / BeatLeader.

```ts
interface TournamentPlayerExpanded {
  id: string;
  user_id: string;
  username: string;
  discord_username: string;
  avatar_url: string;
  role: TournamentRole;
  joined_at: string;
  scoresaber_id?: string;
  beatleader_id?: string;
  user?: {
    username: string;
    discord_id: string;
    avatar_url: string;
    scoresaber_data?: { id: string; pp: number | null; rank: number | null; country: string; countryRank: number | null; profilePicture: string | null };
    beatleader_data?: { id: string; pp: number | null; rank: number | null; country: string; countryRank: number | null; avatarUrl: string | null };
  };
}
```

## MapPool

```ts
interface MapPool {
  id: string;
  tournament_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  song_count?: number;
  songs?: MapPoolSong[];
  qualifier?: boolean;
  qualifier_attempts?: number;
  public?: boolean;
}
```

## MapPoolSong

`song_data` → [`SongData`](#songdata) below. `scores` → [`QualifierScore`](./qual-score#qualifierscore) in Qualifier Score Types.

```ts
interface MapPoolSong {
  id: string;
  map_pool_id: string;
  beatsaver_key: string;
  song_name: string;
  song_hash: string;
  difficulty: string;
  characteristic: string;
  category: string;
  song_data: SongData;       // → SongData below
  order_index: number;
  added_by: string;
  created_at: string;
  scoresaber_leaderboard: string;
  beatleader_leaderboard: string;
  scores?: QualifierScore[]; // → QualifierScore in qual-score.md
}
```

## SongData

```ts
interface SongData {
  coverURL: string;
  metadata: {
    bpm: number;
    duration: number;
    songName: string;
    songSubName: string;
    songAuthorName: string;
    levelAuthorName: string;
  };
  selectedDiff: {
    difficulty: string;
    characteristic: string;
    njs: number;
    nps: number;
    notes: number;
    bombs: number;
    obstacles: number;
    seconds: number;
    maxScore: number;
    stars?: number;
    blStars?: number;
    // ...other diff fields
  };
}
```

## MapPoolMap

Processed map shape (post-normalization). `song_data` → [`SongData`](#songdata) above.

```ts
interface MapPoolMap {
  id: string;
  category: string;
  beatsaver_key: string;
  song_data: SongData; // → SongData above
  scoresaber_leaderboard: string;
  beatleader_leaderboard: string;
}
```

## Related

- [Match Types](./matches) - `MatchMapData` is the match-time map shape; `MapMetaData` mirrors `SongData.metadata`
- [Qualifier Score Types](./qual-score) - `QualifierScore` attached to `MapPoolSong.scores`; `QualifierMapPoolSong` also uses `SongData`
- [User Types](./user) - `User` referenced in `TournamentPlayer`
- [BeatSaver Types](/docs/types/overlay/beatsaver) - `BeatSaverMapInfo` is the raw API response before `SongData` is extracted
