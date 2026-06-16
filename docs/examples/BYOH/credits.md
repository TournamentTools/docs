---
id: credits
title: Credits Screen
sidebar_label: credits.html
---

Tournament staff credits screen, grouped by role.

Staff comes from the bridge payload as `payload.staff` (same shape as the players API), so no fetch is needed and it works for private tournaments.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: transparent; color: white; font-family: Inter, sans-serif; overflow: hidden; }
    #root { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 3rem 4rem; }

    .credits-wrap { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 1.5rem; }

    .role-group { display: flex; flex-direction: column; gap: 0.6rem; }
    .role-header { display: flex; align-items: center; gap: 0.75rem; }
    /* --role-color is set per group from ROLE_COLORS, matching the inbuilt overlay. */
    .role-accent { width: 4px; height: 20px; background: var(--role-color, rgba(255,255,255,0.4)); border-radius: 2px; flex-shrink: 0; }
    .role-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: var(--role-color, rgba(255,255,255,0.5)); }
    .role-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }

    .members { display: flex; flex-wrap: wrap; gap: 0.6rem; padding-left: 1rem; }
    .member { display: flex; align-items: center; gap: 0.6rem; background: var(--role-bg, rgba(19,19,19,0.5)); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.4rem 0.75rem; backdrop-filter: blur(4px); }
    .member img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
    .member .name { font-size: 0.9rem; font-weight: 600; }
    .member .flag { width: 16px; height: 16px; object-fit: contain; }

    .waiting { color: rgba(255,255,255,0.3); font-size: 1.25rem; }
  </style>
</head>
<body>
  <div id="root"><div class="waiting">Loading credits...</div></div>

  <script>
    var ROLES = ['host', 'tournament_admin', 'coordinator', 'map_pooler', 'caster', 'developer'];
    var ROLE_LABELS = {
      host: 'Organizer', tournament_admin: 'Admin', developer: 'Developer',
      coordinator: 'Coordinator', map_pooler: 'Map Pooler', caster: 'Caster',
    };
    // Per-role colors, matching getTournamentRoleInfo in the inbuilt overlay.
    // [accent/label color, chip background tint].
    var ROLE_COLORS = {
      host:             ['#a855f7', 'rgba(168,85,247,0.25)'],  // purple-500
      tournament_admin: ['#3b82f6', 'rgba(59,130,246,0.25)'],  // blue-500
      developer:        ['#22c55e', 'rgba(16,185,129,0.25)'],  // green-500 / emerald-500 bg
      coordinator:      ['#818cf8', 'rgba(129,140,248,0.1)'],  // indigo-400
      map_pooler:       ['#eab308', 'rgba(234,179,8,0.25)'],   // yellow-500
      caster:           ['#ef4444', 'rgba(239,68,68,0.25)'],   // red-500
    };
    var ROLE_DEFAULT = ['#6b7280', 'rgba(107,114,128,0.25)'];  // gray-500

    function render(staff) {
      var root = document.getElementById('root');
      if (!staff || staff.length === 0) {
        root.innerHTML = '<div class="waiting">No staff data</div>';
        return;
      }
      var nonPlayers = staff.filter(function(m) { return m.role !== 'player'; });
      var html = '<div class="credits-wrap">';
      ROLES.forEach(function(role) {
        var members = nonPlayers.filter(function(m) { return m.role === role; });
        if (members.length === 0) return;
        var label = ROLE_LABELS[role] + (members.length > 1 ? 's' : '');
        var colors = ROLE_COLORS[role] || ROLE_DEFAULT;
        var styleVars = '--role-color:' + colors[0] + ';--role-bg:' + colors[1] + ';';
        html += '<div class="role-group" style="' + styleVars + '"><div class="role-header"><div class="role-accent"></div><span class="role-label">' + label + '</span><div class="role-line"></div></div>';
        html += '<div class="members">';
        members.forEach(function(m) {
          var username = m.user?.username || m.username || '?';
          var avatar = m.user?.avatar_url || m.avatar_url || null;
          var country = m.user?.scoresaber_data?.country || null;
          html += '<div class="member">';
          if (avatar) html += '<img src="' + avatar + '" alt="">';
          html += '<span class="name">' + username + '</span>';
          if (country) html += '<img class="flag" src="https://hatscripts.github.io/circle-flags/flags/' + country.toLowerCase() + '.svg" alt="">';
          html += '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
      root.innerHTML = html;
    }

    // Staff arrives in the bridge payload (payload.staff) - no fetch needed.
    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      render(e.data.payload.staff);
    });
  </script>
</body>
</html>
```
