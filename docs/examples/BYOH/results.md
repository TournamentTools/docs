---
id: results
title: Results Screen
sidebar_label: results.html
---

Tournament top-3 podium. The Grand Finals winner is always rank 1 (pinned by the API) and is shown crowned + raised in the center; 2nd sits left, 3rd right.

:::note
Standings come from the bridge payload as `payload.results` (`{ standings, top_3 }`), so no fetch is needed and it works for private tournaments. This example renders `top_3`. See [Custom Overlay Bridge → results](../../external/custom-overlay-bridge#results) for the full shape.
:::

```html
<!DOCTYPE html>
<!--
  results.html - Tournament top-3 podium.
  The Grand Finals winner is always rank 1 (pinned by the API) and is shown crowned + raised in the center.
-->
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-image: url("https://s3-eu.compsaber.com/compsaber/overlayAssets/BackgroundOverlay.png"); color: white; font-family: Inter, sans-serif; overflow: hidden; }
    #root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 3rem 4rem; }

    .podium { display: flex; align-items: flex-end; justify-content: center; gap: 6rem; }

    .place { display: flex; flex-direction: column; align-items: center; width: 13rem; flex-shrink: 0; }
    .place.p2 { transform: translateY(1.5rem); }
    .place.p3 { transform: translateY(2.5rem); }

    .avatar-wrap { position: relative; overflow: hidden; border: 4px solid rgba(255,255,255,0.2); border-radius: 12px; background: rgba(19,19,19,0.33); }
    .avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .place.p1 .avatar-wrap { width: 168px; height: 168px; outline: 4px solid rgb(252,211,77); box-shadow: 0 0 40px -4px rgba(251,191,36,0.6); }
    .place.p2 .avatar-wrap { width: 132px; height: 132px; outline: 2px solid rgba(203,213,225,0.7); }
    .place.p3 .avatar-wrap { width: 132px; height: 132px; outline: 2px solid rgba(194,65,12,0.7); }

    .crown { position: absolute; top: -2.75rem; left: 50%; transform: translateX(-50%); font-size: 2.25rem; filter: drop-shadow(0 0 8px rgba(251,191,36,0.8)); }

    .name { margin-top: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; min-height: 3.5rem; padding: 0 0.25rem; }
    .name .flag { width: 1.5rem; height: 1.5rem; object-fit: contain; flex-shrink: 0; }
    .name .username { text-align: center; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.01em; line-height: 1.1; word-break: break-word; }

    .pedestal { margin-top: 0.75rem; width: 11rem; border-radius: 8px 8px 0 0; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; padding-top: 0.5rem; }
    .place.p1 .pedestal { height: 7rem; background: linear-gradient(to bottom, rgba(252,211,77,0.3), transparent); }
    .place.p2 .pedestal { height: 6rem; background: linear-gradient(to bottom, rgba(203,213,225,0.25), transparent); }
    .place.p3 .pedestal { height: 5rem; background: linear-gradient(to bottom, rgba(194,65,12,0.25), transparent); }

    .rank { font-size: 1.875rem; font-weight: 900; }
    .place.p1 .rank { color: rgb(252,211,77); }
    .place.p2 .rank { color: rgb(226,232,240); }
    .place.p3 .rank { color: rgb(253,186,116); }
    .wins { font-size: 0.875rem; font-weight: 500; color: rgba(255,255,255,0.6); }

    .waiting { color: rgba(255,255,255,0.3); font-size: 1.25rem; }
  </style>
</head>
<body>
  <div id="root"><div class="waiting">Awaiting final standings...</div></div>

  <script>
    // Render 2nd on the left, winner in the middle, 3rd on the right.
    var ORDER = [2, 1, 3];

    function flagUrl(country) {
      return 'https://hatscripts.github.io/circle-flags/flags/' + country.toLowerCase() + '.svg';
    }

    function render(top) {
      var root = document.getElementById('root');
      if (!top || top.length === 0) {
        root.innerHTML = '<div class="waiting">Awaiting final standings...</div>';
        return;
      }

      function byPlace(place) {
        for (var i = 0; i < top.length; i++) {
          if (top[i].rank === place) return top[i];
        }
        return null;
      }

      var html = '<div class="podium">';
      ORDER.forEach(function(place) {
        var pl = byPlace(place);
        if (!pl) return;

        var avatar = pl.avatarUrl || (pl.country ? flagUrl(pl.country) : null);
        var winLabel = pl.wins + (pl.wins === 1 ? ' win' : ' wins');
        var username = pl.username || 'Unknown';

        html += '<div class="place p' + place + '">';
        html += '<div class="avatar-wrap">';
        if (place === 1) html += '<div class="crown">👑</div>';
        if (avatar) html += '<img src="' + avatar + '" alt="">';
        html += '</div>';

        html += '<div class="name">';
        if (pl.country) html += '<img class="flag" src="' + flagUrl(pl.country) + '" alt="">';
        html += '<span class="username">' + username + '</span>';
        html += '</div>';

        html += '<div class="pedestal"><span class="rank">#' + pl.rank + '</span><span class="wins">' + winLabel + '</span></div>';
        html += '</div>';
      });
      html += '</div>';

      root.innerHTML = html;
    }

    // Standings arrive in the bridge payload (payload.results) - no fetch needed.
    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      var results = e.data.payload.results;
      render(results ? results.top_3 : []);
    });
  </script>
</body>
</html>
```
