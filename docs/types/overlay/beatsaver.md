---
id: overlay-beatsaver
title: BeatSaver Types (Overlay)
sidebar_label: beatsaver
slug: /types/overlay/beatsaver
---

BeatSaver API shapes used by the overlay for map metadata display.

`BeatSaverDiff` fields feed into [`SongData.selectedDiff`](../tournaments#songdata) after being persisted. `BeatSaverMapInfo.metadata` maps directly to [`SongData.metadata`](../tournaments#songdata).

## BeatSaverDiff

```ts
type BeatSaverDiff = {
  difficulty: string;
  characteristic: string;
  njs: number;
  nps: number;
  notes: number;
  bombs: number;
  obstacles: number;
  seconds: number;
  maxScore: number;
};
```

## BeatSaverMapInfo

```ts
type BeatSaverMapInfo = {
  id: string;
  name: string;
  metadata: {
    bpm: number;
    duration: number;
    songName: string;
    songSubName?: string;
    songAuthorName: string;
    levelAuthorName: string;
  };
  versions: {
    hash: string;
    state: string;
    coverURL?: string;
    previewURL?: string;
    diffs: BeatSaverDiff[];
  }[];
};
```

## Related

- [Tournament Types](../tournaments) - [`SongData`](../tournaments#songdata) is the persisted form (extracted from `BeatSaverMapInfo`); [`MapPoolSong`](../tournaments#mappoolsong) stores `song_data: SongData`
- [Match Types](../matches) - [`MapMetaData`](../matches#matchmapdata) is the match-time metadata subset
