---
id: custom-overlay-bridge
title: Custom Overlay Bridge API
sidebar_label: Custom Overlay Bridge
---

Custom Overlays are self-contained HTML files that receive live match data from CompSaber via `window.postMessage`. You load them through the Custom Overlay screen routes (e.g. `/overlay/{id}/custom/vs`), which stream data into your page as an iframe.

## How it works

1. You create a Custom Overlay in your tournament's **Custom Overlay** tab (inline editor, file upload, or external URL).
2. You activate it.
3. The overlay dashboard toggle switches your overlay links to `/custom/[screen]` URLs.
4. OBS loads those URLs as Browser Sources instead of the built-in ones.
5. CompSaber streams live data into your page via `window.postMessage` every time match state changes.

Your HTML runs in a sandboxed iframe - it has no access to cookies, localStorage, or the parent page. All data you need is delivered via postMessage.

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
  // payload.bracket         - full bracket (upper/lower rounds) | null
  // payload.results         - standings + top_3 podium | null
  // payload.staff           - tournament staff/credits list | null
});
```

Messages are sent on every state change (match switch, score update, audio change, pool change, etc.). Your handler will be called multiple times - write it to be idempotent.

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
    bracket: FullBracket | null;     // bracket screen data
    results: { standings: ResultsPlayer[]; top_3: ResultsPlayer[] } | null;
    staff: StaffMember[] | null;     // credits screen data
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

`null` when no match is active. Otherwise the full current match:

```typescript
{
  matchId: string;
  matchRound: string;        // e.g. "Grand Finals"
  score: [number, number];   // [p1 wins, p2 wins]
  activePoolId: string | null;
  mapPool: BridgeMap[];      // current active map pool
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

Full match schedule for the tournament, live-patched as scores/states change. Same data the intermission screen uses.

```typescript
Array<{
  id: string;
  matchNumber: number;
  roundName: string;
  state: string;                  // "upcoming" | "live" | "completed"
  startTime: string | null;       // ISO 8601
  score: [number, number];        // [p1 wins, p2 wins]
  winnerId: string | null;
  player1: {
    id: string;
    username: string;
    avatarURL: string | null;
    country: string | null;
  } | null;
  player2: { ... } | null;        // same shape as player1
}>
```

### hudConfig

Tournament theme settings configured in the "Overlay" tab. Use these to respect the tournament's branding.

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

Current stream audio state as set by the caster via the overlay dashboard. Useful if your overlay renders volume indicators or reacts to mute state.

### bracketView

Non-null only when the caster has activated bracket view. `"upper"` = winners bracket, `"lower"` = losers bracket. Use this on `/custom/bracket` to know which half to render.

### countdownTarget

Non-null only when a countdown is active. Unix ms timestamp of when the countdown ends. Use `countdownTarget - Date.now()` to get remaining ms.

### streamReload

Two-element array of incrementing counters - one per player (`[p0, p1]`). When the caster clicks "Reload Stream" in the overlay dashboard, the relevant counter increments. Compare to your previous value to know which stream to reconnect.

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

### bracket

Full bracket for the `bracket` screen, or `null` until loaded. Pair with [`bracketView`](#bracketview) to decide which half to show. Re-sent live as matches complete.

```typescript
{
  upperBracket: BracketRound[];
  lowerBracket: BracketRound[];   // empty for single-elimination
}
// each round: { name: string, matches: { player1, player2, winnerId, ... }[] }
```

```javascript
var view = payload.bracketView || 'upper';
var rounds = view === 'lower' ? payload.bracket.lowerBracket : payload.bracket.upperBracket;
```

### results

Standings for the `results` screen, or `null` until loaded. `standings` is every player ranked; `top_3` is the podium (`standings.slice(0, 3)`). The Grand Finals winner is pinned to rank 1.

```typescript
{
  standings: ResultsPlayer[];
  top_3: ResultsPlayer[];
}

type ResultsPlayer = {
  rank: number;
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  country: string | null;        // ISO code, e.g. "US"
  wins: number;
  bracket: "upper" | "lower" | null;
  matchNumber: number | null;
  isWinner: boolean;             // Grand Finals winner
};
```

### staff

Tournament staff for the `credits` screen, or `null` until loaded. Same shape as the players API. Filter `role !== "player"` for the credits roll.

```typescript
type StaffMember = {
  user_id: string;
  role: string;                  // "host" | "tournament_admin" | "caster" | ... | "player"
  username: string | null;
  user: {
    username: string | null;
    avatar_url: string | null;
    scoresaber_data: { country?: string | null } | null;
  } | null;
};
```

## Update frequency

| Data | When it updates |
|---|---|
| `tournament` | Once on load |
| `activeMatch.score` | Every score change (live) |
| `activeMatch.mapPool` | When active pool changes |
| `activeMatch.pickBans` / `activeMatch.mapPool[].action` | Every pick/ban change |
| `activeMatch` (players, round) | When active match switches |
| `allMatches` scores/states | Every `match:updated` socket event (live) |
| `hudConfig` | When tournament theme is saved |
| `audio` | When caster changes volume/mute |
| `bracketView` | When caster switches bracket view |
| `countdownTarget` | When caster starts/changes countdown |
| `streamReload` | When caster clicks reload stream in dashboard |

## Starter template

This is the default template inserted when you create a new inline overlay:

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

External URL overlays work identically to inline/uploaded ones. CompSaber loads your URL in the same sandboxed iframe and calls `iframe.contentWindow.postMessage(payload, "*")` on every state change. No sockets, no special server setup - your page just needs the `window.addEventListener('message', ...)` listener.

**Setup steps:**

1. Host your HTML file somewhere with an HTTPS URL (GitHub Pages, Netlify, Vercel, your own server, etc.)
2. In the **Custom Overlay** tab, create a new Overlay and pick **External URL**
3. Paste your HTTPS URL and hit **Create**
4. Click **Activate**
5. In the overlay dashboard, toggle to **Custom Overlay** mode - your per-screen links will now point to `/custom/vs`, `/custom/play`, etc.
6. Point OBS Browser Sources at those URLs

**CORS:** Your page does not need CORS headers. postMessage works cross-origin by design.

**Private tournaments:** All data (match schedule, player info, map pool, bracket, standings, staff) is delivered via postMessage. Your overlay does not need to fetch anything - data works regardless of whether the tournament is public or private. (The sandboxed iframe has a `null` origin, so any `fetch` it makes is cross-origin and CORS-blocked - read everything from the payload.)

**Multiple screens:** You can use one HTML file for all screens (check `bracketView`/`countdownTarget` to adapt), or host separate files per screen and register them as separate Overlays (only one can be active at a time).

## Player streams

Custom Overlays can embed live player POV streams using the same WebRTC infrastructure as the built-in overlay.

CompSaber uses [MediaMTX](https://github.com/bluenviron/mediamtx) with WHEP. The reader library is hosted at:

```
https://compsaber.com/reader.js
```

Stream URL pattern: `{WEBRTC_BASE}/{playerId}/whep` where `WEBRTC_BASE` is the WebRTC server base URL for the tournament (e.g. `https://webrtc.csaber.ovh`). Player IDs are available in `payload.activeMatch.player1.id` and `payload.activeMatch.player2.id`.

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

      // Apply volume/mute from dashboard controls
      if (p1El) { p1El.muted = payload.audio.player0Muted; p1El.volume = payload.audio.player0Volume; }
      if (p2El) { p2El.muted = payload.audio.player1Muted; p2El.volume = payload.audio.player1Volume; }

      // Start streams on new match or on reload
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
- Load `reader.js` via its absolute URL - relative paths are blocked in the sandbox
- WHEP URL = stream base URL + `/whep` (no trailing slash on player ID segment)
- Re-initialize readers when `activeMatch` changes (player IDs change between matches)
- `muted` required on `<video>` for autoplay to work in most browsers
- Apply `payload.audio.player0Volume` / `player0Muted` to `<video>` elements to respect dashboard audio controls
- Watch `payload.streamReload[i]` increments to reconnect streams when the caster clicks reload in the dashboard

## Type Reference

Full TypeScript type definitions for the bridge payload:

- [Overlay Bridge Types](../types/overlay-bridge) - `OverlayBridgePayload`, `BridgeMatchData`, `BridgePlayer`, `BridgeMap`, `BridgePickBan`, `BridgeLiveScore`, `BridgeScheduleMatch`, `BridgeTournamentInfo`, `BridgeAudio`
- [Overlay Config Types](../types/overlay-config) - `HudThemeConfig` (the `hudConfig` field)
- [Overlay Types](../types/overlay) - `OverlayState`, `OverlayScreenData`

## Constraints

Your overlay runs in a sandboxed iframe (`sandbox="allow-scripts allow-popups"`). This means:

- **No cookies** - cannot read `document.cookie`
- **No localStorage / sessionStorage** - state must come from postMessage only
- **No credentialed fetch** - cannot make requests that carry auth headers or cookies
- **No parent DOM access** - cannot access `window.parent` or `window.top`
- **No relative paths** - all external resources (fonts, images, scripts) must use absolute HTTPS URLs

These restrictions exist to protect tournament organizers from malicious overlays.

Inline overlays are limited to **200KB**. Uploaded HTML files are limited to **2MB**. External URLs must use **HTTPS**.
