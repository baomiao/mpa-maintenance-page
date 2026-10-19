(() => {
  'use strict';
  const root = document.getElementById('mpa-maintenance-preview');
  const q = selector => root.querySelector(selector);
  let startsAt = NaN;
  let endsAt = NaN;
  let configured = false;

  // Require explicit Beijing time; reject invalid calendar dates and ambiguous local dates.
  function parseBeijing(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/.test(value)) return NaN;
    const stamp = Date.parse(value);
    if (!Number.isFinite(stamp)) return NaN;
    return new Date(stamp + 8 * 3600000).toISOString().slice(0, 19) === value.slice(0, 19) ? stamp : NaN;
  }

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
    const scheduled = phase === 'before';
    document.title = `${scheduled ? 'Scheduled maintenance' : 'Under maintenance'} | Marketing Power App`;
    q('#mpa-state-en').textContent = scheduled ? 'SCHEDULED MAINTENANCE' : 'UNDER MAINTENANCE';
    q('#mpa-state-zh').textContent = scheduled ? '维护预告' : '维护中';
    q('#mpa-en-heading').textContent = scheduled
      ? 'Marketing Power App is scheduled for maintenance and upgrades.'
      : 'Sorry to inform you that Marketing Power App is under maintenance for upgrades.';
    q('#mpa-zh-heading').textContent = scheduled
      ? 'Marketing Power App将按计划进行维护和升级。'
      : '抱歉的通知您，Marketing Power App正在进行紧急维护和升级。';
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

  function applyConfig(config) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return;
    const nextStart = parseBeijing(config.startsAt);
    const nextEnd = parseBeijing(config.expectedEndsAt);
    const cleared = config.startsAt === null && config.expectedEndsAt === null;
    const valid = Number.isFinite(nextStart) && Number.isFinite(nextEnd) && nextEnd > nextStart;
    // Ignore partial or invalid updates; two explicit nulls intentionally clear the schedule.
    if (!valid && !cleared) return;
    startsAt = nextStart;
    endsAt = nextEnd;
    configured = valid;
    q('#mpa-start').dateTime = valid ? config.startsAt : '';
    q('#mpa-end').dateTime = valid ? config.expectedEndsAt : '';
    q('#mpa-start').textContent = valid ? format.format(startsAt) : '';
    q('#mpa-end').textContent = valid ? format.format(endsAt) : '';
    update();
  }

  function update() {
    q('#mpa-progress-area').hidden = !configured;
    if (!configured) {
      setCopy('unknown', null);
      root.dataset.phase = 'unknown';
      delete root.dataset.progress;
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

  let refreshing = false;
  async function refreshConfig() {
    // file:// remains usable with the initial script configuration, without failed fetches.
    if (!/^https?:$/.test(window.location.protocol) || refreshing) return;
    refreshing = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const url = new URL('maintenance-config.js', window.location.href);
      url.searchParams.set('_refresh', String(Date.now()));
      const response = await fetch(url, { cache: 'no-store', credentials: 'omit', signal: controller.signal });
      if (!response.ok) return;
      const text = await response.text();
      // Parse only our JSON data wrapper. Never execute downloaded JavaScript (eval/script injection).
      const match = text.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)?window\.MPA_MAINTENANCE_CONFIG\s*=\s*Object\.freeze\(([\s\S]*)\);\s*$/);
      if (match && !controller.signal.aborted) applyConfig(JSON.parse(match[1]));
    } catch {
      // Network, timeout and parse failures are silent; keep the last valid schedule and retry later.
    } finally {
      window.clearTimeout(timeout);
      refreshing = false;
    }
  }

  applyConfig(window.MPA_MAINTENANCE_CONFIG);
  update();
  window.setInterval(update, 1000);
  window.setInterval(refreshConfig, 60000);
  document.addEventListener('visibilitychange', () => {
    update();
    if (!document.hidden) refreshConfig();
  });
  window.addEventListener('pageshow', event => {
    update();
    if (event.persisted) refreshConfig();
  });
  window.addEventListener('online', refreshConfig);
  refreshConfig();
})();
