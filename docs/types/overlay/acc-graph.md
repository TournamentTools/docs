---
id: overlay-acc-graph
title: Accuracy Graph Types
sidebar_label: acc-graph
slug: /types/overlay/acc-graph
---

Types for the per-note accuracy graph overlay component.

## AccPoint

One data point in the accuracy graph timeline.

```ts
type AccPoint = {
  position: number;    // note index
  accuracy: number;    // cumulative accuracy at this point
  notesMissed: number;
  badCuts: number;
  bombHits: number;
};
```

## CasterPlayer

Minimal player shape used by caster-facing graph overlay.

```ts
type CasterPlayer = {
  id: string;
  username: string;
  avatarURL?: string;
};
```

## Related

- [TA Types](../ta) - `LiveScore` provides the per-note data that generates `AccPoint[]`
- [Overlay Player Types](./player) - full player shape with ranks
