---
id: play
title: Play Screen (Live 1v1)
sidebar_label: play.html
---

Live 1v1 screen with POV WebRTC streams, live score overlay, and tug-of-war accuracy bar.

**Requires:** `reader.js` from `https://compsaber.com/reader.js`

Update `WEBRTC_BASE` to your tournament's WebRTC server URL before use.

Uses `activeMatch`, `audio`, and `streamReload` from the bridge payload.

```html
<!DOCTYPE html>
<!--
  play.html - Live 1v1 screen with POV streams + live scores
  Requires: reader.js from https://compsaber.com/reader.js
  Stream URL pattern: WEBRTC_BASE + "/" + playerId + "/"
  Update WEBRTC_BASE to your tournament's WebRTC server URL.
-->
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { color: white; font-family: Inter, sans-serif; overflow: hidden; }

    #root { position: fixed; inset: 0; display: flex; flex-direction: column; }

    .header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem; background: rgba(0,0,0,0.6); flex-shrink: 0; }
    .header .player-name { font-size: 1.25rem; font-weight: 700; flex: 1; }
    .header .player-name.right { text-align: right; }
    .header .score-boxes { display: flex; gap: 0.5rem; align-items: center; }
    .header .score-box { width: 36px; height: 36px; border: 2px solid rgba(255,255,255,0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; }
    .header .score-box.win { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.8); }
    .header .round { font-size: 0.8rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; padding: 0 1rem; }

    .streams { flex: 1; display: flex; min-height: 0; }
    .stream-wrap { flex: 1; position: relative; overflow: hidden; }
    video { width: 100%; height: 100%; object-fit: cover; display: block; }
    .stream-offline { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); font-size: 1.25rem; }

    .live-scores { position: absolute; bottom: 1rem; right: 1rem; text-align: right; pointer-events: none; }
    .stream-wrap:first-child .live-scores { right: auto; left: 1rem; text-align: left; }
    .live-combo { font-size: 2rem; font-weight: 900; font-family: monospace; line-height: 1; }
    .live-acc { font-size: 1rem; color: rgba(255,255,255,0.7); font-family: monospace; }
    .live-score { font-size: 0.85rem; color: rgba(255,255,255,0.5); font-family: monospace; }
    .live-fc { color: #facc15; font-size: 0.85rem; font-weight: 700; }
    .live-misses { color: #f87171; font-size: 0.85rem; font-weight: 700; }

    .tug { height: 4px; display: flex; flex-shrink: 0; }
    .tug-p1 { background: #ef4444; height: 4px; transition: width 0.3s ease; }
    .tug-p2 { background: #3b82f6; height: 4px; transition: width 0.3s ease; }

    .waiting { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; color: rgba(0, 0, 0, 0.822); font-size: 1.5rem; }
  </style>
</head>
<body>
  <div id="root">
    <div class="waiting">Standing by...</div>
  </div>

  <script src="https://compsaber.com/reader.js"></script>
  <script>
    var WEBRTC_BASE = 'https://webrtc.csaber.ovh';

    var state = { match: null, audio: null, liveScores: {} };
    var readers = {};
    var prevReload = [0, 0];

    function startStream(playerId, videoEl, idx) {
      if (readers[playerId]) { readers[playerId].close(); }
      var url = WEBRTC_BASE + '/' + playerId + '/whep';
      readers[playerId] = new MediaMTXWebRTCReader({
        url: url,
        onTrack: function(evt) { videoEl.srcObject = evt.streams[0]; hideOffline(idx); },
        onError: function() { showOffline(idx); }
      });
    }

    function hideOffline(idx) {
      var el = document.getElementById('offline-' + idx);
      if (el) el.style.display = 'none';
    }
    function showOffline(idx) {
      var el = document.getElementById('offline-' + idx);
      if (el) el.style.display = 'flex';
    }

    function buildScoreHtml(playerId) {
      var s = state.liveScores[playerId];
      if (!s) return '';
      var misses = (s.notesMissed || 0) + (s.badCuts || 0);
      var fcHtml = misses === 0 ? '<div class="live-fc">FC</div>' : '<div class="live-misses">' + misses + 'x</div>';
      return (
        '<div class="live-scores">' +
        '<div class="live-combo">' + (s.combo || 0) + 'x</div>' +
        fcHtml +
        '<div class="live-acc">' + ((s.accuracy || 0) * 100).toFixed(2) + '%</div>' +
        '<div class="live-score">' + (s.score || 0).toLocaleString() + '</div>' +
        '</div>'
      );
    }

    function renderHeader(match) {
      var p1 = match.player1;
      var p2 = match.player2;
      var score = match.score;
      var winsNeeded = Math.ceil((match.mapPool?.length || 7) / 2 + 0.5);

      var boxes1 = '', boxes2 = '';
      for (var i = 0; i < winsNeeded; i++) {
        boxes1 += '<div class="score-box' + (i < score[0] ? ' win' : '') + '">' + (i < score[0] ? score[0] : '') + '</div>';
        boxes2 += '<div class="score-box' + (i < score[1] ? ' win' : '') + '">' + (i < score[1] ? score[1] : '') + '</div>';
      }

      return (
        '<div class="header">' +
        '<div class="player-name">' + p1.username + '</div>' +
        '<div class="score-boxes">' + boxes1 + '</div>' +
        '<div class="round">' + match.matchRound + '</div>' +
        '<div class="score-boxes">' + boxes2 + '</div>' +
        '<div class="player-name right">' + p2.username + '</div>' +
        '</div>'
      );
    }

    function render() {
      var match = state.match;
      var root = document.getElementById('root');
      if (!match) {
        root.innerHTML = '<div class="waiting">Standing by...</div>';
        return;
      }

      var p1 = match.player1;
      var p2 = match.player2;
      var audio = state.audio || {};

      var acc1 = state.liveScores[p1.id]?.accuracy || 0;
      var acc2 = state.liveScores[p2.id]?.accuracy || 0;
      var hasLive = acc1 > 0 || acc2 > 0;
      var tug1 = hasLive ? Math.max(5, Math.min(95, 50 - (acc2 - acc1) * 500)) : 50;
      var tug2 = 100 - tug1;

      root.innerHTML =
        renderHeader(match) +
        '<div class="streams">' +
        '<div class="stream-wrap">' +
        '<video id="vid-0" autoplay playsinline muted></video>' +
        '<div id="offline-0" class="stream-offline">Stream Offline</div>' +
        buildScoreHtml(p1.id) +
        '</div>' +
        '<div class="stream-wrap">' +
        '<video id="vid-1" autoplay playsinline muted></video>' +
        '<div id="offline-1" class="stream-offline">Stream Offline</div>' +
        buildScoreHtml(p2.id) +
        '</div>' +
        '</div>' +
        '<div class="tug"><div class="tug-p1" style="width:' + tug1 + '%"></div><div class="tug-p2" style="width:' + tug2 + '%"></div></div>';

      var v0 = document.getElementById('vid-0');
      var v1 = document.getElementById('vid-1');
      v0.muted = audio.player0Muted !== false;
      v1.muted = audio.player1Muted !== false;
      v0.volume = audio.player0Volume ?? 1;
      v1.volume = audio.player1Volume ?? 1;

      if (!readers[p1.id]) startStream(p1.id, v0, 0);
      else v0.srcObject = readers[p1.id]._stream || null;

      if (!readers[p2.id]) startStream(p2.id, v1, 1);
      else v1.srcObject = readers[p2.id]._stream || null;
    }

    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      var payload = e.data.payload;
      var prevMatch = state.match;
      state.match = payload.activeMatch;
      state.audio = payload.audio;

      if (state.match) {
        [state.match.player1, state.match.player2].forEach(function(p) {
          if (p.liveScore) state.liveScores[p.id] = p.liveScore;
        });
      }

      var reload = payload.streamReload || [0, 0];
      if (state.match) {
        var players = [state.match.player1, state.match.player2];
        if (reload[0] !== prevReload[0] && players[0]) {
          var vid0 = document.getElementById('vid-0');
          if (vid0) startStream(players[0].id, vid0, 0);
        }
        if (reload[1] !== prevReload[1] && players[1]) {
          var vid1 = document.getElementById('vid-1');
          if (vid1) startStream(players[1].id, vid1, 1);
        }
      }
      prevReload = [reload[0], reload[1]];

      if (state.match) {
        var p1id = state.match.player1.id;
        var p2id = state.match.player2.id;
        if (prevMatch && (prevMatch.player1.id !== p1id || prevMatch.player2.id !== p2id)) {
          Object.values(readers).forEach(function(r) { r.close(); });
          readers = {};
        }
      }

      render();
    });
  </script>
</body>
</html>
```
