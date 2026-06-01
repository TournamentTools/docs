---
id: qual-score
title: Qualifier Score Types
sidebar_label: qual-score
---

Types for qualifier map pools, per-map scores, and player rankings.

## QualsData

```ts
interface QualsData {
  id: string;
  tournament_id: string;
  name: string;
  description: string;
  round_name: string | null;
  icon: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  qualifier: boolean;
  qualifier_attempts?: number;
  ta_qualifier_guid?: string;
  public: boolean;
  songCount: number;
  songs: QualifierMapPoolSong[];
  playerRankings: PlayerRanking[];
}
```

## QualifierMapPoolSong

`song_data` shape → [`SongData`](./tournaments#songdata) (defined in Tournament Types).
`scores` → [`QualifierScore[]`](#qualifierscore) below.

```ts
interface QualifierMapPoolSong {
  id: string;
  map_pool_id: string;
  beatsaver_key: string;
  song_name: string;
  song_hash: string;
  difficulty: string;
  characteristic: string;
  category: string;
  song_data: SongData;       // → SongData in tournaments.md
  order_index: number;
  added_by: string;
  created_at: string;
  scoresaber_leaderboard: string;
  beatleader_leaderboard: string;
  ta_qualifier_map_guid?: string;
  highestScore: number;
  scores?: QualifierScore[]; // → QualifierScore below
  equalizationMultiplier: number;
  highestScoreEqualized: number;
}
```

## QualifierScore

```ts
interface QualifierScore {
  id: string;
  map_pool_songs_id: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  scoresaber_id?: string;
  song_score: number;
  song_fc: boolean;
  accuracy: number;
  equalizedAcc: number;
  equalizedScore: number;
  totalEqualizedScore: number;
  attempts_used: number;
}
```

## PlayerRanking

Aggregated leaderboard entry across all qualifier maps.

```ts
interface PlayerRanking {
  user_id: string;
  username: string;
  avatar_url: string;
  totalEqualizedScore: number;
  mapScores: {
    mapId: string;
    score: number;
    equalizedScore: number;
    accuracy: number;
  }[];
  averageAccuracy: number;
}
```

## Related

- [Tournament Types](./tournaments) - `SongData` (used in `QualifierMapPoolSong.song_data`), `MapPoolSong.scores` references `QualifierScore`
- [TA Types](./ta) - real-time score from TA during qualifier playback
