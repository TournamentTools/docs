---
id: player
title: Overlay Player Type
sidebar_label: player
slug: /types/overlay/player
---

Player shape used inside overlay screens.

## OverlayPlayer

```ts
type OverlayPlayer = {
  id: string;
  username: string;
  country: string;
  avatarURL?: string;
  ranks: [number, number]; // [ScoreSaber global rank, BeatLeader global rank]
};
```

## Related

- [HUD Bridge Types](../hud-bridge) - `BridgePlayer` is the bridge-side equivalent
- [Overlay Types](../overlay) - screen types that reference players
- [Player Data Types](../player-data) - raw ranking data from external APIs
