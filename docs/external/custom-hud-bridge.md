---
id: custom-hud-bridge
title: Custom HUD Bridge API
sidebar_label: Custom HUD Bridge
---

Custom HUDs are self-contained HTML files that receive live match data from CompSaber via `window.postMessage`. Load them through the Custom HUD screen routes (e.g. `/overlay/{id}/custom/vs`), which stream data into your page as an iframe.

## How it works

1. Create a Custom HUD in your tournament's **Custom HUD** tab (inline editor, file upload, or external URL)
2. Activate it
3. The overlay dashboard toggle switches your overlay links to `/custom/[screen]` URLs
4. OBS loads those URLs as Browser Sources instead of the built-in ones
5. CompSaber streams live data into your page via `window.postMessage` on every state change

Your HTML runs in a sandboxed iframe - no access to cookies, localStorage, or the parent page. All data is delivered via postMessage.

## Listening for data

```javascript
window.addEventListener('message', function(e) {
  if (e.data?.type !== 'COMPSABER_STATE') return;

  var payload = e.data.payload;
  // payload.tournament      - tournament info (title, status, etc.)
  // payload.activeMatch     - current match data (null if no active match)
  // payload.allMatches      - full match schedule (all matches, live-updated)
  // payload.hudConfig       - tournament theme settings
  // payload.audio           - stream volume/mute state per player
  // payload.bracketView     - "upper" | "lower" | null
  // payload.countdownTarget - unix ms timestamp | null
  // payload.streamReload    - [number, number] - increment = reconnect that player's stream
});
```

Messages fire on every state change. Write your handler to be idempotent.

## Payload reference

Full payload shape (TypeScript):

```typescript
{
  type: "COMPSABER_STATE";
  version: 2;
  payload: {
    tournamentId: string;
    tournament: BridgeTournamentInfo | null;
    activeMatch: BridgeMatchData | null;
    allMatches: BridgeScheduleMatch[];
    hudConfig: HudThemeConfig;
    audio: {
      player0Volume: number;   // 0-1
      player0Muted: boolean;
      player1Volume: number;
      player1Muted: boolean;
    };
    bracketView: "upper" | "lower" | null;
    countdownTarget: number | null;  // Date.now()-style ms timestamp
    streamReload: [number, number];  // increment counters - watch for changes to trigger reader reconnect
  };
}
```

### tournament

Basic tournament metadata. `null` only if the fetch failed.

```typescript
{
  id: string;
  title: string;
  status: string;           // "upcoming" | "active" | "completed"
  bracketType: string | null;
  imageUrl: string | null;
}
```

### activeMatch

`null` when no match is active.

```typescript
{
  matchId: string;
  matchRound: string;        // e.g. "Grand Finals"
  score: [number, number];   // [p1 wins, p2 wins]
  activePoolId: string | null;
  mapPool: BridgeMap[];
  pickBans: BridgePickBan[];  // ordered pick/ban history
  player1: BridgePlayer;
  player2: BridgePlayer;
}
```

Each `BridgeMap`:

```typescript
{
  id: string;
  songHash: string;
  difficulty: string;             // "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus"
  songName: string | null;
  songAuthorName: string | null;
  levelAuthorName: string | null;
  coverURL: string | null;
  bpm: number | null;
  duration: number | null;        // seconds
  beatSaverKey: string | null;    // e.g. "1a2b3"
  action: "pick" | "ban" | null;  // current action for this map
  picker: string | null;          // player id, null for auto tiebreaker/no action
  tiebreaker: boolean;
}
```

Each `BridgePickBan` entry:

```typescript
{
  mapId: string;
  songHash: string;
  action: "pick" | "ban";
  picker: string | null;          // player id
  tiebreaker: boolean;
}
```

Each `BridgePlayer`:

```typescript
{
  id: string;
  username: string;
  avatarURL: string | null;
  country: string | null;         // ISO 3166-1 alpha-2, e.g. "NO"
  ranks: [number, number] | null; // [global rank, country rank]
  liveScore: {
    score: number;
    accuracy: number;             // 0-1, multiply by 100 for %
    combo: number;
    notesMissed: number;
    badCuts: number;
  } | null;
}
```

### allMatches

Full match schedule, live-patched as scores/states change.

```typescript
Array<{
  id: string;
  matchNumber: number;
  roundName: string;
  state: string;                  // "upcoming" | "live" | "completed"
  startTime: string | null;       // ISO 8601
  score: [number, number];
  winnerId: string | null;
  player1: {
    id: string;
    username: string;
    avatarURL: string | null;
    country: string | null;
  } | null;
  player2: { /* same shape as player1 */ } | null;
}>
```

### hudConfig

Tournament theme settings. Use these to respect the tournament's branding.

```typescript
{
  primaryColor: string;       // CSS color, e.g. "#3b82f6"
  accentColor: string;
  backgroundColor: string;
  backgroundOpacity: number;  // 0-1
  textColor: string;
  fontFamily: "Inter" | "Rajdhani" | "Exo2" | "Oxanium" | "custom";
  customFontUrl: string | null;
  logoPosition: "top-left" | "top-center" | "top-right" | "hidden";
  showLogo: boolean;
  showPlayerFlags: boolean;
  showPlayerRanks: boolean;
  showMapStats: boolean;
  cornerRadius: "sharp" | "rounded" | "pill";
  scoreStyle: "indicators" | "numbers";
}
```

### audio

Current stream audio state as set by the caster. Useful for volume indicators or mute state.

### bracketView

Non-null only when the caster has activated bracket view. `"upper"` = winners bracket, `"lower"` = losers bracket.

### countdownTarget

Non-null when a countdown is active. Unix ms timestamp. Use `countdownTarget - Date.now()` for remaining ms.

### streamReload

Two-element array `[p0, p1]` of incrementing counters. When the caster clicks **Reload Stream**, the relevant counter increments.

```javascript
var prevReload = [0, 0];

window.addEventListener('message', function(e) {
  if (e.data?.type !== 'COMPSABER_STATE') return;
  var reload = e.data.payload.streamReload;

  if (reload[0] !== prevReload[0]) reconnectStream(0);
  if (reload[1] !== prevReload[1]) reconnectStream(1);
  prevReload = [reload[0], reload[1]];
});
```

## Update frequency

| Data | When it updates |
|---|---|
| `tournament` | Once on load |
| `activeMatch.score` | Every score change (live) |
| `activeMatch.mapPool` | When active pool changes |
| `activeMatch.pickBans` / `activeMatch.mapPool[].action` | Every pick/ban change |
| `activeMatch` (players, round) | When active match switches |
| `allMatches` scores/states | Every `match:updated` socket event |
| `hudConfig` | When tournament theme is saved |
| `audio` | When caster changes volume/mute |
| `bracketView` | When caster switches bracket view |
| `countdownTarget` | When caster starts/changes countdown |
| `streamReload` | When caster clicks reload stream |

## Starter template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: transparent; color: white; font-family: Inter, sans-serif; }
    #app { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
    .match-info { text-align: center; }
    .score { font-size: 4rem; font-weight: 900; }
    .players { font-size: 1.5rem; display: flex; gap: 2rem; justify-content: center; }
  </style>
</head>
<body>
  <div id="app"><p>Waiting for match data...</p></div>
  <script>
    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      var payload = e.data.payload;
      var match = payload.activeMatch;
      if (!match) {
        document.getElementById('app').innerHTML = '<p>No active match</p>';
        return;
      }
      document.getElementById('app').innerHTML =
        '<div class="match-info">' +
        '<div class="players">' +
          '<span>' + match.player1.username + '</span>' +
          '<span>vs</span>' +
          '<span>' + match.player2.username + '</span>' +
        '</div>' +
        '<div class="score">' + match.score[0] + ' - ' + match.score[1] + '</div>' +
        '</div>';
    });
  </script>
</body>
</html>
```

## Hosting externally

External URL HUDs work identically to inline/uploaded ones. No sockets or special server required - just a `window.addEventListener('message', ...)` listener on an HTTPS page.

**Setup:**
1. Host your HTML file (GitHub Pages, Netlify, Vercel, etc.)
2. In the **Custom HUD** tab, create a new HUD → pick **External URL**
3. Paste your HTTPS URL → **Create** → **Activate**
4. In the overlay dashboard, toggle to **Custom HUD** mode
5. Point OBS Browser Sources at the resulting `/custom/vs`, `/custom/play`, etc. URLs

**Notes:**
- No CORS headers needed - postMessage works cross-origin by design
- All data delivered via postMessage - no fetching required, works for private tournaments
- Use one HTML file for all screens (check `bracketView`/`countdownTarget`) or separate files per screen (only one HUD active at a time)

## Player streams

Custom HUDs can embed live player POV streams via WebRTC (MediaMTX / WHEP).

```
https://compsaber.com/reader.js
```

Stream URL pattern: `{WEBRTC_BASE}/{playerId}/whep`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #000; }
    .streams { display: flex; width: 100vw; height: 100vh; }
    video { width: 50%; height: 100%; object-fit: cover; }
  </style>
</head>
<body>
  <div class="streams">
    <video id="p1" autoplay playsinline muted></video>
    <video id="p2" autoplay playsinline muted></video>
  </div>
  <script src="https://compsaber.com/reader.js"></script>
  <script>
    var WEBRTC_BASE = 'https://webrtc.csaber.ovh';
    var readers = {};
    var prevReload = [0, 0];
    var prevMatch = null;

    function startStream(playerId, videoEl) {
      if (readers[playerId]) readers[playerId].close();
      readers[playerId] = new MediaMTXWebRTCReader({
        url: WEBRTC_BASE + '/' + playerId + '/whep',
        onTrack: function(evt) { videoEl.srcObject = evt.streams[0]; },
        onError: function() { console.warn('Stream offline:', playerId); }
      });
    }

    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      var payload = e.data.payload;
      var match = payload.activeMatch;
      if (!match) return;

      var p1El = document.getElementById('p1');
      var p2El = document.getElementById('p2');

      if (p1El) { p1El.muted = payload.audio.player0Muted; p1El.volume = payload.audio.player0Volume; }
      if (p2El) { p2El.muted = payload.audio.player1Muted; p2El.volume = payload.audio.player1Volume; }

      var reload = payload.streamReload || [0, 0];
      var matchChanged = !prevMatch || prevMatch.matchId !== match.matchId;
      if (matchChanged || reload[0] !== prevReload[0]) startStream(match.player1.id, p1El);
      if (matchChanged || reload[1] !== prevReload[1]) startStream(match.player2.id, p2El);

      prevReload = [reload[0], reload[1]];
      prevMatch = match;
    });
  </script>
</body>
</html>
```

**Notes:**
- Load `reader.js` via its absolute URL - relative paths blocked in the sandbox
- Re-initialize readers when `activeMatch` changes (player IDs change between matches)
- `muted` required on `<video>` for autoplay in most browsers
- Watch `payload.streamReload[i]` to reconnect streams when the caster clicks reload

## Type Reference

Full TypeScript type definitions for the bridge payload:

- [HUD Bridge Types](../types/hud-bridge) - `OverlayBridgePayload`, `BridgeMatchData`, `BridgePlayer`, `BridgeMap`, `BridgePickBan`, `BridgeLiveScore`, `BridgeScheduleMatch`, `BridgeTournamentInfo`, `BridgeAudio`
- [HUD Config Types](../types/hud-config) - `HudThemeConfig` (the `hudConfig` field)
- [Overlay Types](../types/overlay) - `OverlayState`, `OverlayScreenData`

## Constraints

Your HUD runs in `sandbox="allow-scripts allow-popups"`. This means:

| Restriction | Details |
|---|---|
| No cookies | `document.cookie` inaccessible |
| No localStorage/sessionStorage | State must come from postMessage only |
| No credentialed fetch | No requests with auth headers or cookies |
| No parent DOM access | No `window.parent` or `window.top` |
| No relative paths | All external resources must use absolute HTTPS URLs |

**Size limits:** Inline HUDs ≤ 200KB · Uploaded HTML ≤ 2MB · External URLs must use HTTPS
