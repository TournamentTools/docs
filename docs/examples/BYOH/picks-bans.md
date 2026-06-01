---
id: picks-bans
title: Picks & Bans Screen
sidebar_label: picks-bans.html
---

Map pool grid showing all maps with difficulty color bars. Uses `activeMatch.mapPool` from the bridge payload.

Each map includes `action`, `picker`, and `tiebreaker` fields, so the example can style picks, bans, and tiebreakers directly from the bridge payload. The ordered history is also available as `activeMatch.pickBans`.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: transparent; color: white; font-family: Inter, sans-serif; overflow: hidden; }
    #root { position: fixed; inset: 0; display: flex; flex-direction: column; }

    .header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem; background: rgba(0,0,0,0.6); flex-shrink: 0; }
    .player-name { font-size: 1.25rem; font-weight: 700; }
    .player-name.right { text-align: right; }
    .round { font-size: 0.8rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
    .score { font-size: 1.5rem; font-weight: 900; letter-spacing: 0.1em; }

    .pool { flex: 1; display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 1rem; padding: 1.5rem 3rem; }

    .map-card {
      display: flex; align-items: center; gap: 0.6rem;
      background: rgba(20,20,20,0.7); backdrop-filter: blur(4px);
      border-radius: 12px; padding: 0.5rem; width: 360px;
      border: 1px solid rgba(255,255,255,0.08);
      transition: border-color 0.3s;
    }
    .map-card.picked { background: rgba(23,86,38,0.5); border-color: rgba(74,222,128,0.4); }
    .map-card.banned { background: rgba(94,21,21,0.5); border-color: rgba(248,113,113,0.4); opacity: 0.55; }
    .map-card.tiebreaker { background: rgba(240,191,33,0.15); border-color: rgba(240,191,33,0.4); }

    .map-card img.cover { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .map-card .cover-placeholder { width: 80px; height: 80px; border-radius: 8px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
    .diff-bar { width: 5px; height: 80px; border-radius: 3px; flex-shrink: 0; }
    .meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
    .meta .author { font-size: 0.8rem; color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; }
    .meta .name { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta .mapper { font-size: 0.75rem; color: rgba(255,255,255,0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; flex-shrink: 0; }
    .meta-right .key { font-size: 0.75rem; color: rgba(255,255,255,0.6); font-weight: 600; }
    .meta-right .bpm { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
    .status { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; }
    .status.pick { color: #86efac; }
    .status.ban { color: #fca5a5; }
    .status.tiebreaker { color: #facc15; }

    .footer { height: 80px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .footer-text { font-size: 3rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; }

    .waiting { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); font-size: 1.25rem; }
  </style>
</head>
<body>
  <div id="root"><div class="waiting">Waiting for match data...</div></div>

  <script>
    var DIFF_COLORS = {
      Easy: '#3bba4c', Normal: '#59b0f4', Hard: '#f1912b',
      Expert: '#bf2a42', ExpertPlus: '#8f48db',
    };

    function diffColor(diff) { return DIFF_COLORS[diff] || '#888'; }
    function diffLabel(diff) { return diff === 'ExpertPlus' ? 'Expert+' : diff; }

    function render(payload) {
      var match = payload.activeMatch;
      var hud = payload.hudConfig;
      var showMapStats = !hud || hud.showMapStats;
      var root = document.getElementById('root');

      if (!match) {
        root.innerHTML = '<div class="waiting">Waiting for match data...</div>';
        return;
      }

      var p1 = match.player1;
      var p2 = match.player2;
      var maps = match.mapPool || [];

      var header =
        '<div class="header">' +
        '<div class="player-name">' + p1.username + '</div>' +
        '<div>' +
          '<div class="round">' + match.matchRound + '</div>' +
          '<div class="score">' + match.score[0] + ' - ' + match.score[1] + '</div>' +
        '</div>' +
        '<div class="player-name right">' + p2.username + '</div>' +
        '</div>';

      var poolHtml = maps.map(function(map) {
        var color = diffColor(map.difficulty);
        var stateClass = map.tiebreaker ? 'tiebreaker' : map.action === 'pick' ? 'picked' : map.action === 'ban' ? 'banned' : '';
        var statusText = map.tiebreaker ? 'Tiebreaker' : map.action === 'pick' ? 'Pick' : map.action === 'ban' ? 'Ban' : '';
        var statusClass = map.tiebreaker ? 'tiebreaker' : map.action || '';
        var coverHtml = map.coverURL
          ? '<img class="cover" src="' + map.coverURL + '" alt="">'
          : '<div class="cover-placeholder"></div>';
        var statusHtml = statusText
          ? '<div class="status ' + statusClass + '">' + statusText + '</div>' : '';
        var bpmHtml = showMapStats && map.bpm != null
          ? '<div class="bpm">BPM: <strong>' + Math.round(map.bpm) + '</strong></div>' : '';
        var keyHtml = showMapStats && map.beatSaverKey
          ? '<div class="key">' + map.beatSaverKey + '</div>' : '';
        return (
          '<div class="map-card ' + stateClass + '">' +
          coverHtml +
          '<div class="diff-bar" style="background:' + color + '"></div>' +
          '<div class="meta">' +
            '<div class="author">' + (map.songAuthorName || '') + '</div>' +
            '<div class="name">' + (map.songName || map.songHash) + '</div>' +
            '<div class="mapper">' + (map.levelAuthorName || '') + '</div>' +
          '</div>' +
          '<div class="meta-right">' + statusHtml + keyHtml + bpmHtml + '</div>' +
          '</div>'
        );
      }).join('');

      root.innerHTML =
        header +
        '<div class="pool">' + (maps.length === 0 ? '<div class="waiting">No map pool loaded</div>' : poolHtml) + '</div>' +
        '<div class="footer"><div class="footer-text">Picks &amp; Bans</div></div>';
    }

    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      render(e.data.payload);
    });
  </script>
</body>
</html>
```
