---
id: bracket
title: Bracket Screen
sidebar_label: bracket.html
---

Bracket display that fetches bracket data from the public API and switches between upper/lower based on `bracketView` from the bridge payload.

:::note
Full bracket data is not in the bridge payload. This example fetches it from the public API:
```
/api/tournaments/{tournamentId}/bracket
```
For private tournaments, this fetch will fail - you'd need to add bracket data to the bridge payload.
:::

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: transparent; color: white; font-family: Inter, sans-serif; overflow: hidden; }
    #root { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; padding: 2rem; }

    .bracket-title { font-size: 3rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.6); }

    .bracket-wrap { display: flex; gap: 0; align-items: stretch; }
    .round-col { display: flex; flex-direction: column; justify-content: space-around; gap: 0.5rem; padding: 0 0.75rem; }
    .round-label { font-size: 0.7rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; text-align: center; margin-bottom: 0.5rem; }
    .match-node { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.4rem 0.75rem; min-width: 160px; }
    .match-node .pname { font-size: 0.9rem; font-weight: 600; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .match-node .pname:last-child { border-bottom: none; }
    .match-node .pname.winner { color: #4ade80; }
    .match-node .pname.tbd { color: rgba(255,255,255,0.3); font-style: italic; }

    .waiting { color: rgba(255,255,255,0.3); font-size: 1.25rem; }
  </style>
</head>
<body>
  <div id="root"><div class="waiting">Loading bracket...</div></div>

  <script>
    var state = { bracketView: null, tournamentId: null, bracket: null };

    function buildBracket(rounds, view) {
      if (!rounds || rounds.length === 0) return '<div class="waiting">No bracket data</div>';
      var html = '<div class="bracket-wrap">';
      rounds.forEach(function(round) {
        html += '<div class="round-col"><div class="round-label">' + (round.name || 'Round') + '</div>';
        (round.matches || []).forEach(function(match) {
          var p1 = match.player1 || match.homePlayer;
          var p2 = match.player2 || match.awayPlayer;
          var winner = match.winner || match.winnerId;
          html += '<div class="match-node">';
          html += '<div class="pname' + (winner && p1 && winner === (p1.id || p1) ? ' winner' : (!p1 ? ' tbd' : '')) + '">' + (p1?.username || p1?.name || 'TBD') + '</div>';
          html += '<div class="pname' + (winner && p2 && winner === (p2.id || p2) ? ' winner' : (!p2 ? ' tbd' : '')) + '">' + (p2?.username || p2?.name || 'TBD') + '</div>';
          html += '</div>';
        });
        html += '</div>';
      });
      html += '</div>';
      return html;
    }

    function render() {
      var root = document.getElementById('root');
      var view = state.bracketView || 'upper';
      var titleHtml = '<div class="bracket-title">' + (view === 'lower' ? 'Losers Bracket' : 'Winners Bracket') + '</div>';

      if (!state.bracket) {
        root.innerHTML = titleHtml + '<div class="waiting">Fetching bracket...</div>';
        return;
      }

      var rounds = view === 'lower' ? state.bracket.lowerBracket : state.bracket.upperBracket;
      root.innerHTML = titleHtml + buildBracket(rounds, view);
    }

    function fetchBracket(tournamentId) {
      fetch('/api/tournaments/' + tournamentId + '/bracket')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) { if (data) { state.bracket = data; render(); } })
        .catch(function() {});
    }

    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      var payload = e.data.payload;
      var newView = payload.bracketView || 'upper';
      var viewChanged = newView !== state.bracketView;
      state.bracketView = newView;

      if (!state.tournamentId) {
        state.tournamentId = payload.tournamentId;
        fetchBracket(payload.tournamentId);
      }

      if (viewChanged) render();
    });
  </script>
</body>
</html>
```
