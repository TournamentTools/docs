---
id: ta
title: TA Types
sidebar_label: ta
---

Types for TournamentAssistant real-time score data received via socket events.

## LiveScore

Extended from the TA client's `RealtimeScore`. Required fields mirror the base `LiveScore` shape; additional TA fields are optional.

```ts
type LiveScore = {
  userGuid: string;
  score: number;
  scoreWithModifiers: number;
  accuracy: number;
  combo: number;
  notesMissed: number;
  badCuts: number;
  maxCombo: number;
  songPosition: number;
  // Additional RealtimeScore fields from moons-ta-client
  playerHealth?: number;
  maxScore?: number;
  maxScoreWithModifiers?: number;
  bombHits?: number;
  wallHits?: number;
  leftHand?: { hit: number; miss: number; badCut: number };
  rightHand?: { hit: number; miss: number; badCut: number };
};
```

Delivered via the `ta:realtimeScore` socket event. See [Socket Rooms](../internal/socket-rooms).

## Related

- [Socket Rooms](../internal/socket-rooms) - `SocketEvents.taRealtimeScore`
- [Match Types](./matches) - `LiveScoreEntry` (lighter shape used in match display)
- [HUD Bridge Types](./hud-bridge) - `BridgeLiveScore` (bridge-side live score)
