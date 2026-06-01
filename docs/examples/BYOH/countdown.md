---
id: countdown
title: Countdown Screen
sidebar_label: countdown.html
---

Full-screen countdown timer. Uses `countdownTarget` (Unix ms timestamp) from the bridge payload.

Shows "Starting Now" when the countdown reaches zero.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: transparent; color: white; font-family: Inter, sans-serif; overflow: hidden; }
    #root { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }

    .timer { font-size: 10rem; font-weight: 900; font-family: monospace; line-height: 1; letter-spacing: -0.02em; text-shadow: 0 0 60px rgba(255,255,255,0.25); }
    .starting-now { font-size: 2rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: var(--hud-primary, #3b82f6); opacity: 0; transition: opacity 2s ease; }
    .starting-now.visible { opacity: 1; }
    .waiting { font-size: 1.5rem; color: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div id="root">
    <div class="waiting">No countdown active</div>
  </div>

  <script>
    var intervalId = null;
    var currentTarget = null;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick(target) {
      var remaining = Math.max(0, target - Date.now());
      var totalSecs = Math.floor(remaining / 1000);
      var hours = Math.floor(totalSecs / 3600);
      var mins = Math.floor((totalSecs % 3600) / 60);
      var secs = totalSecs % 60;
      var timeStr = hours > 0
        ? pad(hours) + ':' + pad(mins) + ':' + pad(secs)
        : pad(mins) + ':' + pad(secs);

      var timerEl = document.getElementById('timer');
      var labelEl = document.getElementById('label');
      if (timerEl) timerEl.textContent = timeStr;
      if (labelEl) {
        if (remaining === 0) labelEl.classList.add('visible');
        else labelEl.classList.remove('visible');
      }
    }

    function startCountdown(target) {
      if (intervalId) clearInterval(intervalId);
      currentTarget = target;
      var root = document.getElementById('root');
      root.innerHTML =
        '<div class="timer" id="timer">00:00</div>' +
        '<div class="starting-now" id="label">Starting Now</div>';
      tick(target);
      intervalId = setInterval(function() { tick(target); }, 500);
    }

    function stopCountdown() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      currentTarget = null;
      document.getElementById('root').innerHTML = '<div class="waiting">No countdown active</div>';
    }

    window.addEventListener('message', function(e) {
      if (e.data?.type !== 'COMPSABER_STATE') return;
      var target = e.data.payload.countdownTarget;
      if (target && target !== currentTarget) startCountdown(target);
      else if (!target && currentTarget) stopCountdown();
    });
  </script>
</body>
</html>
```
