---
id: vs
title: VS Screen
sidebar_label: vs.html
---

Full-screen VS screen showing both players and the first map in the pool as a preview.

Uses `activeMatch` from the bridge payload.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: transparent; color: white; font-family: Inter, sans-serif; overflow: hidden; }
    #root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }

    .vs-layout { display: flex; align-items: center; gap: 3rem; width: 100%; padding: 2rem; }

    .player { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .player img.avatar { width: 160px; height: 160px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(255,255,255,0.2); }
    .player .name { font-size: 2rem; font-weight: 900; text-align: center; }
    .player .flag { width: 32px; height: 32px; object-fit: contain; }
    .player .rank { color: rgba(255,255,255,0.5); font-size: 1rem; }

    .center { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; min-width: 320px; }
    .vs-text { font-size: 5rem; font-weight: 900; color: rgba(255,255,255,0.6); letter-spacing: 0.2em; }
    .map-cover { width: 240px; height: 240px; object-fit: cover; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2); }
    .map-cover-placeholder { width: 240px; height: 240px; background: rgba(255,255,255,0.05); border-radius: 8px; }
    .map-name { font-size: 1.25rem; font-weight: 700; text-align: center; }
    .map-author { font-size: 0.9rem; color: rgba(255,255,255,0.5); text-align: center; }
    .map-diff { font-size: 0.85rem; font-weight: 600; text-align: center; padding: 0.2rem 0.75rem; border-radius: 4px; background: rgba(255,255,255,0.1); }
    .map-stats { display: flex; gap: 1.5rem; }
    .map-stat { display: flex; flex-direction: column; align-items: center; }
    .map-stat .val { font-size: 1.1rem; font-weight: 700; font-family: monospace; }
    .map-stat .lbl { font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; }

    .waiting { font-size: 1.5rem; color: rgba(0, 0, 0, 0.822); }
  </style>
</head>
<body>
  <div id="root">
    <div class="waiting">Waiting for match data...</div>
  </div>

  <script>
    var state = { match: null, hudConfig: null };

    function render() {
      var match = state.match;
      var hud = state.hudConfig;
      var root = document.getElementById('root');

      if (!match) {
        root.innerHTML = '<div class="waiting">Waiting for match data...</div>';
        return;
      }

      var p1 = match.player1;
      var p2 = match.player2;
      var map = match.mapPool && match.mapPool[0];

      var mapHtml = '';
      if (map) {
        mapHtml =
          '<div class="center">' +
          (map.coverURL
            ? '<img class="map-cover" src="' + map.coverURL + '" alt="">'
            : '<div class="map-cover-placeholder"></div>') +
          '<div class="map-name">' + (map.songName || map.songHash) + '</div>' +
          '<div class="map-author">' + (map.songAuthorName || '') + '</div>' +
          '<div class="map-diff">' + (map.difficulty === 'ExpertPlus' ? 'Expert+' : map.difficulty) + '</div>' +
          '<div class="map-stats">' +
            (map.bpm != null ? '<div class="map-stat"><div class="val">' + Math.round(map.bpm) + '</div><div class="lbl">BPM</div></div>' : '') +
            (map.duration != null ? '<div class="map-stat"><div class="val">' + fmtDur(map.duration) + '</div><div class="lbl">Length</div></div>' : '') +
          '</div>' +
          '</div>';
      } else {
        mapHtml = '<div class="center"><div class="vs-text">VS</div></div>';
      }

      root.innerHTML =
        '<div class="vs-layout">' +
        playerHtml(p1, 'left', hud) +
        mapHtml +
        playerHtml(p2, 'right', hud) +
        '</div>';
    }

    function playerHtml(p, side, hud) {
      var showFlags = !hud || hud.showPlayerFlags;
      var showRanks = !hud || hud.showPlayerRanks;
      var ranks = p.ranks;
      return (
        '<div class="player">' +
        (p.avatarURL ? '<img class="avatar" src="' + p.avatarURL + '" alt="">' : '') +
        '<div class="name">' +
        (showFlags && p.country ? '<img class="flag" src="https://hatscripts.github.io/circle-flags/flags/' + p.country.toLowerCase() + '.svg" alt="">' : '') +
        p.username +
        '</div>' +
        (showRanks && ranks ? '<div class="rank">#' + ranks[0].toLocaleString() + ' Global</div>' : '') +
        '</div>'
      );
    }

    function fmtDur(secs) {
      var m = Math.floor(secs / 60);
      var s = Math.floor(secs % 60);
      return m + ':' + String(s).padStart(2, '0');
    }

    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      state.match = e.data.payload.activeMatch;
      state.hudConfig = e.data.payload.hudConfig;
      render();
    });
  </script>
</body>
</html>
```
