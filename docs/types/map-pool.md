---
id: map-pool
title: Map Pool Types
sidebar_label: map-pool
---

Types for map pool discussion sheets and playlist data.

## MapData

Used for pool-discussion on the "Sheet" - before a map is committed to a `MapPool`.

```ts
type MapData = {
  name: string;
  diff: "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";
  characteristic: "Standard" | "NoArrows" | "OneSaber" | "90Degree" | "360Degree" | "Lawless";
  id: string;
  category:
    | "Accuracy" | "Trueacc" | "Balanced" | "Midspeed" | "Speed"
    | "Tech" | "Challenge" | "Dance" | "Fitness" | "Other";
  pool?: string;
};
```

## PlaylistData

BeatSaber playlist export format.

```ts
type PlaylistData = {
  playlistTitle: string;
  playlistDescription?: string;
  playlistAuthor?: string;
  songs?: any[];
  image: string;
};
```

## Related

- [Tournament Types](./tournaments) - `MapPoolSong` (persisted map pool entries)
- [Match Types](./matches) - `MatchMapData` (match-time map shape)
