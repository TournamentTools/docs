---
id: welcome
title: Welcome
sidebar_label: Welcome
slug: /
sidebar_position: 1
---

# Welcome to CompSaber Docs

CompSaber is a tournament platform for competitive Beat Saber events. These docs cover the pieces around running, streaming, customizing, and integrating with CompSaber tournaments.

If you are here to get a stream online, start with the OBS overlay setup. If you are building a custom overlay or tool, start with the Custom HUD Bridge and then use the type reference pages as your source of truth.

## Quick start

| I want to... | Start here |
|---|---|
| Setup the tournament stream-overlay in OBS | [OBS Overlay Setup](./external/obs-overlay-setup) |
| Build my own HUD or overlay screen | [Custom HUD Bridge](./external/custom-hud-bridge) |
| Look up the live HUD payload shape | [HUD Bridge Types](./types/hud-bridge) |
| Style a HUD using tournament theme settings | [HUD Config Types](./types/hud-config) |
| Find copy-pasteable HUD examples | [BYOH Examples](./examples/BYOH/vs) |
| Understand internal tournament systems | [Internal Docs](./internal/auth) |

## What is documented here?

### External setup guides

The external docs are written for tournament organizers, streamers, and overlay builders. They explain how to use CompSaber from the outside:

- [OBS Overlay Setup](./external/obs-overlay-setup) - importing the official scene collection, setting up sources, and preparing a stream layout.
- [Custom HUD Bridge](./external/custom-hud-bridge) - receiving live tournament data in a custom HTML HUD via `window.postMessage`.
- [Overlay Custom Classes](./external/overlay-custom-classes) - CSS hooks for customizing built-in overlay screens.

### Type references

The type docs describe the data shapes used by CompSaber APIs, overlays, matches, rooms, tournaments, players, and HUD configuration.

Use these when you need exact field names, nullable fields, or TypeScript interfaces:

- [HUD Bridge Types](./types/hud-bridge)
- [HUD Config Types](./types/hud-config)
- [Overlay Types](./types/overlay)
- [Match Types](./types/matches)
- [Tournament Types](./types/tournaments)
- [Player Data Types](./types/player-data)

### Examples

The examples section contains ready-to-adapt overlay and HUD snippets:

- [BYOH VS Screen](./examples/BYOH/vs)
- [BYOH Play Screen](./examples/BYOH/play)
- [BYOH Picks/Bans](./examples/BYOH/picks-bans)
- [BYOH Intermission](./examples/BYOH/intermission)
- [TypeScript 1v1 Match Page](./examples/typescript/1v1-match-page)

### Internal notes

The internal docs explain implementation details for people working on CompSaber itself:

- Authentication and permissions
- Tournament Assistant client integration
- Socket rooms and overlay socket behavior
- Bracket and match utilities
- Qualifier scoring math
- Notifications

These pages are useful when changing platform behavior or debugging how live tournament state moves through the system.

## Core concepts

### Tournament overlay

The CompSaber overlay is the browser-based stream package used in OBS. Organizers control it from the tournament overlay dashboard, and OBS loads each screen as a Browser Source.

Most streamers should use the official scene collection first, then customize sources as needed.

### Custom HUD

A Custom HUD is a self-contained HTML page loaded inside the overlay. CompSaber sends it live state with `window.postMessage`, including the active match, players, scores, map pool, schedule, audio state, countdown state, and tournament theme settings.

Custom HUDs do not need direct API access for normal overlay data. Listen for `COMPSABER_STATE`, render from the payload, and make your rendering idempotent because messages are sent whenever state changes.

### Bridge payload

The bridge payload is the contract between CompSaber and custom HUDs. Its top-level shape is `OverlayBridgePayload`.

Start with:

```js
window.addEventListener('message', (event) => {
  if (event.data?.type !== 'COMPSABER_STATE') return;

  const { activeMatch, hudConfig, audio } = event.data.payload;
});
```

Then use [HUD Bridge Types](./types/hud-bridge) for the full payload reference.

## Getting help

For setup help, stream support, or questions while building custom overlays, join the [CompSaber Discord](https://discord.gg/8C46dpTeqR).
