(() => {
  'use strict';
  const root = document.getElementById('mpa-maintenance-preview');
  const q = selector => root.querySelector(selector);
  const config = window.MPA_MAINTENANCE_CONFIG || {};

  // Require explicit Beijing time; reject invalid calendar dates and ambiguous local dates.
  function parseBeijing(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/.test(value)) return NaN;
    const stamp = Date.parse(value);
    if (!Number.isFinite(stamp)) return NaN;
    return new Date(stamp + 8 * 3600000).toISOString().slice(0, 19) === value.slice(0, 19) ? stamp : NaN;
  }

  const startsAt = parseBeijing(config.startsAt);
  const endsAt = parseBeijing(config.expectedEndsAt);
  const configured = Number.isFinite(startsAt) && Number.isFinite(endsAt) && endsAt > startsAt;
  let timeZone = 'Asia/Shanghai';
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) {
      new Intl.DateTimeFormat('en-GB', { timeZone: detected }).format(startsAt || Date.now());
      timeZone = detected;
    }
  } catch { /* Retain the Beijing fallback. */ }
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone, month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });

  let previousState = '';
  let previousRemaining = null;
  function setCopy(phase, remaining) {
    if (phase === previousState && remaining === previousRemaining) return;
    if (phase === 'almost') {
      q('#mpa-en-time').textContent = 'Almost there. Please wait a moment.';
      q('#mpa-zh-time').textContent = '马上好了，请稍候。';
    } else if (phase === 'unknown') {
      q('#mpa-en-time').textContent = 'Expected completion time to be confirmed.';
      q('#mpa-zh-time').textContent = '预计完成时间待确认。';
    } else if (phase === 'before') {
      q('#mpa-en-time').innerHTML = `Maintenance has not started yet. Expected duration: <strong>${remaining} mins.</strong>`;
      q('#mpa-zh-time').innerHTML = `尚未到计划开始时间，预计维护时长为<strong>${remaining}分钟</strong>。`;
    } else {
      q('#mpa-en-time').innerHTML = `Expected to complete in <strong>${remaining} mins.</strong>`;
      q('#mpa-zh-time').innerHTML = `预计在<strong>${remaining}分钟</strong>后完成。`;
    }
    // Announce only status transitions, not each second or each animation frame.
    if (previousState && phase !== previousState) {
      q('#mpa-announcement').textContent = q('#mpa-en-time').textContent + ' ' + q('#mpa-zh-time').textContent;
    }
    previousState = phase;
    previousRemaining = remaining;
  }

  if (configured) {
    q('#mpa-start').dateTime = config.startsAt;
    q('#mpa-end').dateTime = config.expectedEndsAt;
    q('#mpa-start').textContent = format.format(startsAt);
    q('#mpa-end').textContent = format.format(endsAt);
  }

  function update() {
    q('#mpa-progress-area').hidden = !configured;
    if (!configured) {
      setCopy('unknown', null);
      root.dataset.phase = 'unknown';
      return;
    }
    // Use wall-clock timestamps on every update: refresh and background tabs cannot reset progress.
    const now = Date.now();
    const phase = now >= endsAt ? 'almost' : now < startsAt ? 'before' : 'running';
    const percent = Math.min(99, Math.max(0, Math.floor((now - startsAt) / (endsAt - startsAt) * 100)));
    // Before the window, show its duration rather than including the wait until it starts.
    const remaining = Math.max(0, Math.ceil((endsAt - Math.max(now, startsAt)) / 60000));
    setCopy(phase, remaining);
    q('#mpa-start-label').textContent = phase === 'before' ? 'Scheduled start / 计划开始' : 'Started / 开始';
    q('#mpa-percent').textContent = percent + '%';
    q('#mpa-fill').style.width = percent + '%';
    q('#mpa-meter').setAttribute('aria-valuenow', String(percent));
    q('#mpa-meter').setAttribute('aria-valuetext', phase === 'almost' ? '99%. Almost there.' : `${percent}%, estimated from the maintenance window`);
    root.dataset.phase = phase;
    root.dataset.progress = String(percent);
  }

  update();
  if (configured) {
    window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('pageshow', update);
  }
})();
