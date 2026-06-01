---
id: intermission
title: Intermission / Schedule Screen
sidebar_label: intermission.html
---

Match schedule screen grouped by status (Live/Today, Later, Unplanned, Ended).

Uses `allMatches` from the bridge payload - live-patched on every `match:updated` event.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: transparent; color: white; font-family: Inter, sans-serif; overflow: hidden; }
    #root { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; padding: 3rem 4rem; gap: 1.5rem; }

    h1 { font-size: 1.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.7); flex-shrink: 0; }

    .schedule { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-height: 0; overflow: hidden; }

    .divider { display: flex; align-items: center; gap: 1rem; padding: 0.4rem 0; }
    .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.15); }
    .divider-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.35); flex-shrink: 0; }

    .match-row { display: grid; align-items: center; border-radius: 10px; padding: 0.75rem 1.25rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.4); grid-template-columns: 1fr auto 1fr; }
    .match-row.live { background: rgba(127,0,0,0.3); border-color: rgba(255,0,0,0.25); }
    .match-row.completed { background: rgba(0,80,0,0.2); border-color: rgba(0,200,0,0.2); }

    .p1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; font-weight: 700; }
    .p1.winner { color: #4ade80; }
    .p2 { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; font-size: 1.1rem; font-weight: 700; }
    .p2.winner { color: #4ade80; }
    .p1 .meta { color: rgba(255,255,255,0.35); font-size: 0.75rem; font-weight: 400; }
    .center-cell { text-align: center; padding: 0 1.5rem; }
    .vs-label { color: rgba(255,255,255,0.3); font-weight: 700; font-size: 0.9rem; }
    .score-label { color: rgba(255,255,255,0.7); font-weight: 700; font-size: 1.1rem; }
    .live-label { color: #f87171; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }
    .time-label { color: rgba(255,255,255,0.4); font-size: 0.85rem; }
    .flag { width: 20px; height: 20px; object-fit: contain; }

    .waiting { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); font-size: 1.25rem; }
  </style>
</head>
<body>
  <div id="root"><div class="waiting">Loading schedule...</div></div>

  <script>
    var state = { allMatches: [], hudConfig: null };

    function relTime(iso) {
      var diff = new Date(iso).getTime() - Date.now();
      var abs = Math.abs(diff);
      var past = diff < 0;
      var mins = Math.floor(abs / 60000);
      var hours = Math.floor(abs / 3600000);
      if (abs < 60000) return 'now';
      if (hours >= 1) return past ? hours + 'h ago' : 'in ' + hours + 'h';
      return past ? mins + 'm ago' : 'in ' + mins + 'm';
    }

    function flagHtml(country, showFlags) {
      if (!showFlags || !country) return '';
      return '<img class="flag" src="https://hatscripts.github.io/circle-flags/flags/' + country.toLowerCase() + '.svg" alt="">';
    }

    function render() {
      var matches = state.allMatches;
      var hud = state.hudConfig;
      var showFlags = !hud || hud.showPlayerFlags;
      var root = document.getElementById('root');

      if (!matches || matches.length === 0) {
        root.innerHTML = '<div class="waiting">No matches scheduled</div>';
        return;
      }

      var todayStr = new Date().toDateString();
      var isToday = function(iso) { return iso ? new Date(iso).toDateString() === todayStr : false; };

      var groups = [
        { label: 'Live / Today', items: matches.filter(function(m) { return m.state !== 'completed' && (m.state === 'live' || isToday(m.startTime)); }) },
        { label: 'Later', items: matches.filter(function(m) { return m.state !== 'completed' && m.state !== 'live' && m.startTime && !isToday(m.startTime); }) },
        { label: 'Unplanned', items: matches.filter(function(m) { return m.state !== 'completed' && m.state !== 'live' && !m.startTime; }) },
        { label: 'Ended', items: matches.filter(function(m) { return m.state === 'completed'; }) },
      ].filter(function(g) { return g.items.length > 0; });

      var html = '<h1>Schedule</h1><div class="schedule">';
      groups.forEach(function(group) {
        html += '<div class="divider"><div class="divider-line"></div><span class="divider-label">' + group.label + '</span><div class="divider-line"></div></div>';
        group.items.forEach(function(m) {
          var isLive = m.state === 'live';
          var isDone = m.state === 'completed';
          var p1Win = isDone && m.winnerId === m.player1?.id;
          var p2Win = isDone && m.winnerId === m.player2?.id;
          var p1name = m.player1?.username || 'TBD';
          var p2name = m.player2?.username || 'TBD';

          var centerHtml;
          if (isDone) centerHtml = '<div class="score-label">' + m.score[0] + ' : ' + m.score[1] + '</div>';
          else if (isLive) centerHtml = '<div class="live-label">LIVE</div>';
          else centerHtml = '<div class="vs-label">VS</div>';

          var timeHtml = '';
          if (isDone) timeHtml = '<span class="time-label">Ended</span>';
          else if (m.startTime) timeHtml = '<span class="time-label">' + relTime(m.startTime) + '</span>';

          html +=
            '<div class="match-row' + (isLive ? ' live' : isDone ? ' completed' : '') + '">' +
            '<div class="p1' + (p1Win ? ' winner' : '') + '">' +
              '<span class="meta">#' + m.matchNumber + ' ' + m.roundName + '</span>' +
              flagHtml(m.player1?.country, showFlags) + p1name +
            '</div>' +
            '<div class="center-cell">' + centerHtml + '</div>' +
            '<div class="p2' + (p2Win ? ' winner' : '') + '">' +
              p2name + flagHtml(m.player2?.country, showFlags) + timeHtml +
            '</div>' +
            '</div>';
        });
      });
      html += '</div>';
      root.innerHTML = html;
    }

    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      state.allMatches = e.data.payload.allMatches;
      state.hudConfig = e.data.payload.hudConfig;
      render();
    });
  </script>
</body>
</html>
```
