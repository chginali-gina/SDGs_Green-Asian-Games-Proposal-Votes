/* 共用：API、示範模式、音效、計時器 */
(function () {
  const CFG = window.VOTE_CONFIG || {};
  const qs = new URLSearchParams(location.search);
  const DEMO = !CFG.API_URL || qs.get('demo') === '1';
  const ROUNDS = 6;

  /* ---------------- 示範模式（同一台電腦、不同分頁共用 localStorage） ---------------- */
  const DEMO_KEY = 'sdgsVoteDemo_v1';
  const DEMO_PROPOSALS = [
    { g: '第 1 組', title: '選手村零廢棄：可重複使用餐具租借站', desc: '全場館改用押金制餐具，賽後清洗再循環' },
    { g: '第 2 組', title: '觀眾席太陽能充電座椅', desc: '讓觀眾邊看比賽邊用綠電替手機充電' },
    { g: '第 3 組', title: '搭大眾運輸看比賽，門票打八折', desc: '用票價誘因減少開車進場的碳排放' },
    { g: '第 4 組', title: '賽後場館變身社區運動中心', desc: '避免蚊子館，讓場館在亞運後繼續被使用' },
    { g: '第 5 組', title: '回收寶特瓶做獎牌綬帶與志工服', desc: '把觀眾丟的瓶子變成典禮的一部分' },
    { g: '第 6 組', title: '碳足跡 App：觀眾自己算、自己抵換', desc: '交通與餐飲碳排一鍵計算，可認養植樹抵換' },
  ];
  const DEMO_TOTAL = 36;
  const ROUND_MS = 60000, GRACE_MS = 1500;
  function dLoad() {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || null; } catch (e) { return null; }
  }
  function dGet() {
    return dLoad() || { round: 0, endAt: 0, y: {}, n: {}, used: {}, reasons: {}, closed: {} };
  }
  function dSave(s) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(s)); } catch (e) {} }
  function dFinished(s, r) { return !!(s.closed[r] || (r === s.round && Date.now() >= s.endAt + GRACE_MS)); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function demoApi(a, p) {
    const s = dGet();
    const now = Date.now();
    const r = parseInt(p.r, 10);
    switch (a) {
      case 'state': {
        const done = [];
        for (let i = 1; i <= ROUNDS; i++) if (dFinished(s, i)) done.push(i);
        return { ok: true, now, round: s.round, endAt: s.endAt, roundMs: ROUND_MS, open: s.round > 0 && now < s.endAt,
          revealed: s.round > 0 && now >= s.endAt + GRACE_MS,
          turnout: s.round ? (s.y[s.round] || 0) + (s.n[s.round] || 0) : 0, totalCodes: DEMO_TOTAL, proposals: DEMO_PROPOSALS, done };
      }
      case 'check': {
        const code = String(p.code || '').trim().toUpperCase();
        if (code.length < 4) return { ok: false, error: '找不到這組投票碼' };
        const used = [];
        for (let i = 1; i <= ROUNDS; i++) if (s.used[i + '_' + code]) used.push(i);
        return { ok: true, code, used };
      }
      case 'vote': {
        const code = String(p.code || '').trim().toUpperCase();
        if (r !== s.round) return { ok: false, error: '這一組目前沒有開放投票' };
        if (now > s.endAt + GRACE_MS) return { ok: false, error: '時間到了，這一輪已截止' };
        if (s.used[r + '_' + code]) return { ok: false, error: '這組投票碼本輪已經投過了', already: true };
        s.used[r + '_' + code] = 1;
        if (p.v === 'yes') {
          s.y[r] = (s.y[r] || 0) + 1;
          const reason = String(p.reason || '').trim();
          if (reason) (s.reasons[r] = s.reasons[r] || []).push(reason);
        } else s.n[r] = (s.n[r] || 0) + 1;
        dSave(s);
        return { ok: true };
      }
      case 'result':
        if (!dFinished(s, r)) return { ok: false, error: '還沒開票' };
        return { ok: true, r, yes: s.y[r] || 0, no: s.n[r] || 0, reasons: shuffle(s.reasons[r] || []) };
      case 'summary':
        return { ok: true, list: DEMO_PROPOSALS.map((pp, i) => {
          const rr = i + 1, d = dFinished(s, rr);
          return { r: rr, g: pp.g, title: pp.title, done: d, yes: d ? (s.y[rr] || 0) : null, no: d ? (s.n[rr] || 0) : null };
        }) };
      case 'login': return { ok: true };
      case 'start': {
        if (s.round && s.round !== r) s.closed[s.round] = 1;
        Object.keys(s.used).forEach(k => { if (k.indexOf(r + '_') === 0) delete s.used[k]; });
        s.y[r] = 0; s.n[r] = 0; s.reasons[r] = []; delete s.closed[r];
        s.round = r; s.endAt = now + ROUND_MS;
        dSave(s);
        return { ok: true, round: r, endAt: s.endAt, now };
      }
      case 'stop':
        if (s.endAt > now) { s.endAt = now; dSave(s); }
        return { ok: true };
      case 'codes': {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        const codes = [];
        for (let i = 0; i < DEMO_TOTAL; i++) { let c = ''; for (let j = 0; j < 5; j++) c += chars[Math.floor(Math.random() * chars.length)]; codes.push(c); }
        return { ok: true, codes };
      }
      case 'demoReset':
        localStorage.removeItem(DEMO_KEY);
        return { ok: true };
    }
    return { ok: false, error: 'unknown' };
  }

  /* 示範模式的「虛擬同學」，讓大螢幕看得到票數跳動 */
  const BOT_REASONS = ['減少一次性垃圾，真的做得到', '對環境好又不麻煩', '可以讓更多人注意到永續', '賽後還能繼續用，很划算',
    '我自己就會想參加！', '成本不高但效果明顯', '可以變成亞運的特色亮點', '讓觀眾也一起參與減碳', '這個點子很有創意',
    '對在地社區也有幫助', '可以教育下一代', '比現在的做法環保很多'];
  function demoBotTick() {
    const s = dGet();
    const now = Date.now();
    if (!s.round || now >= s.endAt) return;
    const r = s.round;
    const votes = (s.y[r] || 0) + (s.n[r] || 0);
    if (votes >= DEMO_TOTAL - 4) return;
    if (Math.random() < 0.45) {
      const yes = Math.random() < (0.35 + r * 0.07);
      const code = 'BOT' + Math.random().toString(36).slice(2, 7).toUpperCase();
      s.used[r + '_' + code] = 1;
      if (yes) {
        s.y[r] = (s.y[r] || 0) + 1;
        if (Math.random() < 0.55) (s.reasons[r] = s.reasons[r] || []).push(BOT_REASONS[Math.floor(Math.random() * BOT_REASONS.length)]);
      } else s.n[r] = (s.n[r] || 0) + 1;
      dSave(s);
    }
  }

  /* ---------------- 真正的 API ---------------- */
  async function api(a, params) {
    params = params || {};
    if (DEMO) {
      await new Promise(r => setTimeout(r, 120 + Math.random() * 120));
      return demoApi(a, params);
    }
    const u = new URL(CFG.API_URL);
    u.searchParams.set('a', a);
    Object.keys(params).forEach(k => u.searchParams.set(k, params[k]));
    u.searchParams.set('_', Date.now());
    const res = await fetch(u.toString(), { cache: 'no-store', redirect: 'follow' });
    return res.json();
  }

  /* ---------------- 伺服器時間校正 ---------------- */
  let offset = 0;
  function syncClock(serverNow, sentAt) {
    if (!serverNow) return;
    const rtt = Date.now() - sentAt;
    offset = serverNow + rtt / 2 - Date.now();
  }
  function serverNow() { return Date.now() + offset; }

  /* ---------------- 音效（Web Audio，不需要音檔） ---------------- */
  let ctx = null;
  let muted = false;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + (when || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noiseBurst(dur, vol, when, hp) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + (when || 0);
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
    const g = c.createGain(); g.gain.value = vol || 0.3;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t);
  }
  const SFX = {
    unlock() { ac(); },
    setMuted(m) { muted = m; },
    isMuted() { return muted; },
    tick() { tone(1200, 0.05, 'square', 0.05); },
    heartbeat() { tone(70, 0.18, 'sine', 0.5); tone(60, 0.2, 'sine', 0.4, 0.22); },
    beep(final) { tone(final ? 1320 : 880, final ? 0.5 : 0.14, 'square', 0.12); },
    pop() { tone(660, 0.08, 'triangle', 0.15); tone(990, 0.08, 'triangle', 0.1, 0.05); },
    start() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'square', 0.1, i * 0.09)); },
    buzzer() { tone(140, 0.9, 'sawtooth', 0.22); tone(146, 0.9, 'sawtooth', 0.18); },
    drumroll(sec) { const n = Math.floor(sec * 22); for (let i = 0; i < n; i++) noiseBurst(0.06, 0.06 + 0.12 * i / n, i / 22, 1500); },
    cymbal() { noiseBurst(1.2, 0.35, 0, 5000); },
    fanfare() { [[523, 0], [659, .12], [784, .24], [1047, .36], [784, .52], [1047, .64]].forEach(([f, w]) => { tone(f, 0.22, 'square', 0.1, w); tone(f / 2, 0.22, 'triangle', 0.1, w); }); },
    sad() { [[392, 0], [370, .25], [349, .5], [262, .8]].forEach(([f, w]) => tone(f, 0.35, 'triangle', 0.15, w)); },
    count() { tone(1500 + Math.random() * 300, 0.03, 'square', 0.03); },
    ding() { tone(1760, 0.25, 'sine', 0.12); },
  };

  /* ---------------- 彩帶 ---------------- */
  function confetti(n) {
    const colors = ['#c6ff3d', '#ffd23f', '#3ddcff', '#ff7ab6', '#ffffff', '#5cf2a0'];
    const box = document.createElement('div');
    box.className = 'confetti-box';
    document.body.appendChild(box);
    for (let i = 0; i < (n || 140); i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.8) + 's';
      p.style.animationDuration = (2.4 + Math.random() * 2) + 's';
      p.style.setProperty('--dx', (Math.random() * 40 - 20) + 'vw');
      p.style.setProperty('--rot', (Math.random() * 1440 - 720) + 'deg');
      if (Math.random() < 0.3) p.style.borderRadius = '50%';
      box.appendChild(p);
    }
    setTimeout(() => box.remove(), 5500);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function countUp(el, to, ms, onStep) {
    const start = performance.now();
    return new Promise(res => {
      function f(t) {
        const k = Math.min(1, (t - start) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        const v = Math.round(to * e);
        if (el.textContent !== String(v)) { el.textContent = v; if (onStep) onStep(v); }
        if (k < 1) requestAnimationFrame(f); else res();
      }
      requestAnimationFrame(f);
    });
  }

  function verdictOf(yes, no) { return yes > no ? 'pass' : yes === no ? 'tie' : 'fail'; }
  const VERDICT_TEXT = { pass: '通過！', tie: '平手', fail: '未通過' };

  /* 左上角計時器 */
  function mountTimer(label) {
    const el = document.createElement('div');
    el.className = 'timer idle';
    el.setAttribute('role', 'timer');
    el.innerHTML = '<svg viewBox="0 0 60 60"><circle class="track" cx="30" cy="30" r="25" fill="none" stroke-width="6"/>' +
      '<circle class="ring" cx="30" cy="30" r="25" fill="none" stroke-width="6" stroke-dasharray="157.08" stroke-dashoffset="0"/></svg>' +
      '<div><div class="num">60</div><div class="lbl">' + esc(label || '秒') + '</div></div>';
    document.body.appendChild(el);
    const num = el.querySelector('.num'), ring = el.querySelector('.ring'), lbl = el.querySelector('.lbl');
    return {
      el,
      set(msLeft, totalMs, text) {
        if (msLeft == null) {
          el.className = 'timer idle'; num.textContent = '--'; ring.style.strokeDashoffset = 157.08; lbl.textContent = text || '等待開始';
          return;
        }
        const s = Math.max(0, Math.ceil(msLeft / 1000));
        num.textContent = s;
        ring.style.strokeDashoffset = 157.08 * (1 - Math.max(0, msLeft) / totalMs);
        lbl.textContent = text || '秒';
        el.className = 'timer' + (msLeft <= 0 ? ' idle' : s <= 10 ? ' danger' : s <= 20 ? ' warn' : '');
      },
    };
  }

  function toast(msg, err) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.toggle('err', !!err);
    t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  window.VoteKit = { CFG, DEMO, ROUNDS, api, syncClock, serverNow, SFX, confetti, esc, countUp, demoBotTick, verdictOf, VERDICT_TEXT, mountTimer, toast };

  // 示範模式標籤
  document.addEventListener('DOMContentLoaded', () => {
    if (DEMO) {
      const b = document.createElement('div');
      b.className = 'demo-badge';
      b.textContent = '示範模式';
      b.title = '尚未連接 Google Sheets，資料只存在這台電腦的瀏覽器';
      document.body.appendChild(b);
    }
  });
})();
