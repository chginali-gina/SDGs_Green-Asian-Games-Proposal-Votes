/**
 * SDGs Green Asian Games 提案匿名投票 — Google Apps Script 後台
 * 鳳新高中英文科李姬慧老師 X AI 彙整製作
 *
 * 匿名設計：
 *  - 「誰投過」只記在 Script Properties（投票碼 → 已投），不記投了什麼、不記時間。
 *  - 票數只存總數；贊成理由只存「組別＋理由文字」，沒有投票碼、沒有時間。
 *  - 揭曉時理由順序會打亂。
 */

const SH_PROPOSALS = '提案';
const SH_CODES = '投票碼';
const SH_RESULTS = '結果';
const SH_REASONS = '贊成理由';
const ROUNDS = 6;
const ROUND_MS = 60 * 1000;   // 每回合 60 秒
const GRACE_MS = 1500;        // 網路延遲寬限
const REASON_MAX = 120;

/* ---------- 試算表選單 ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🗳️ 投票系統')
    .addItem('① 初始化工作表', 'setup')
    .addItem('② 產生投票碼', 'promptCodes')
    .addItem('③ 設定老師密碼', 'promptPassword')
    .addSeparator()
    .addItem('⚠️ 清空所有投票紀錄', 'resetAll')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SH_PROPOSALS);
  if (!sh) {
    sh = ss.insertSheet(SH_PROPOSALS);
    const rows = [
      ['組別', '提案標題', '一句話說明'],
      ['第 1 組', '選手村零廢棄：可重複使用餐具租借站', '全場館改用押金制餐具，賽後清洗再循環'],
      ['第 2 組', '觀眾席太陽能充電座椅', '讓觀眾邊看比賽邊用綠電替手機充電'],
      ['第 3 組', '搭大眾運輸看比賽，門票打八折', '用票價誘因減少開車進場的碳排放'],
      ['第 4 組', '賽後場館變身社區運動中心', '避免蚊子館，讓場館在亞運後繼續被使用'],
      ['第 5 組', '回收寶特瓶做獎牌綬帶與志工服', '把觀眾丟的瓶子變成典禮的一部分'],
      ['第 6 組', '碳足跡 App：觀眾自己算、自己抵換', '交通與餐飲碳排一鍵計算，可認養植樹抵換'],
    ];
    sh.getRange(1, 1, rows.length, 3).setValues(rows);
    styleHeader_(sh, 3); sh.setColumnWidth(2, 360); sh.setColumnWidth(3, 420);
  }
  if (!ss.getSheetByName(SH_CODES)) {
    const c = ss.insertSheet(SH_CODES);
    c.getRange(1, 1).setValue('投票碼'); styleHeader_(c, 1);
  }
  if (!ss.getSheetByName(SH_RESULTS)) {
    const r = ss.insertSheet(SH_RESULTS);
    r.getRange(1, 1, 1, 6).setValues([['組別', '提案標題', '贊成', '不贊成', '贊成率', '結果']]);
    styleHeader_(r, 6);
  }
  if (!ss.getSheetByName(SH_REASONS)) {
    const s = ss.insertSheet(SH_REASONS);
    s.getRange(1, 1, 1, 2).setValues([['回合', '贊成理由（匿名）']]);
    styleHeader_(s, 2); s.setColumnWidth(2, 600);
  }
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_PW')) props.setProperty('ADMIN_PW', 'sdgs2026');
  const def = ss.getSheetByName('工作表1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  CacheService.getScriptCache().removeAll(['proposals', 'codes']);
  notify_('初始化完成！\n老師密碼預設為 sdgs2026（可用選單 ③ 修改）。\n請在「提案」工作表填入 6 組的提案，再用選單 ② 產生投票碼。');
}

/** 一鍵開始：初始化工作表＋產生 40 組投票碼（可直接在 Apps Script 編輯器執行） */
function quickStart() {
  setup();
  if (getCodes_().length === 0) generateCodes(40);
}

function notify_(msg) {
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

function styleHeader_(sh, n) {
  sh.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#0b3d2e').setFontColor('#ffffff');
  sh.setFrozenRows(1);
}

function promptCodes() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('產生投票碼', '要產生幾組？（每位學生一組，會覆蓋舊的投票碼）', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const n = Math.min(200, Math.max(1, parseInt(res.getResponseText(), 10) || 40));
  generateCodes(n);
  ui.alert('已產生 ' + n + ' 組投票碼。可到網站「列印投票卡」頁一次印出。');
}

function generateCodes(n) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 去掉 I O L 0 1
  const set = {};
  while (Object.keys(set).length < n) {
    let s = '';
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    set[s] = 1;
  }
  const sh = SpreadsheetApp.getActive().getSheetByName(SH_CODES);
  sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), 1).clearContent();
  sh.getRange(2, 1, n, 1).setValues(Object.keys(set).map(c => [c]));
  CacheService.getScriptCache().remove('codes');
}

function promptPassword() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('設定老師密碼', '大螢幕與列印投票卡會用到這組密碼：', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const pw = res.getResponseText().trim();
  if (pw.length < 4) { ui.alert('密碼至少 4 個字'); return; }
  PropertiesService.getScriptProperties().setProperty('ADMIN_PW', pw);
  ui.alert('密碼已更新');
}

function resetAll() {
  try {
    const ui = SpreadsheetApp.getUi();
    if (ui.alert('確定清空所有回合的票數與理由？', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  } catch (e) { /* 從編輯器執行時沒有對話框，直接清空 */ }
  const props = PropertiesService.getScriptProperties();
  const pw = props.getProperty('ADMIN_PW');
  props.deleteAllProperties();
  props.setProperty('ADMIN_PW', pw || 'sdgs2026');
  const ss = SpreadsheetApp.getActive();
  [SH_RESULTS, SH_REASONS].forEach(n => {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).clearContent();
  });
  notify_('已清空所有投票紀錄。');
}

/* ---------- Web API ---------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  let out;
  try {
    out = route_(p);
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function route_(p) {
  switch (p.a) {
    case 'state': return apiState_();
    case 'check': return apiCheck_(p.code);
    case 'vote': return apiVote_(p);
    case 'result': return apiResult_(parseInt(p.r, 10));
    case 'summary': return apiSummary_();
    case 'login': admin_(p.pw); return { ok: true };
    case 'start': admin_(p.pw); return apiStart_(parseInt(p.r, 10));
    case 'stop': admin_(p.pw); return apiStop_();
    case 'codes': admin_(p.pw); return { ok: true, codes: getCodes_() };
    default: return { ok: false, error: 'unknown action' };
  }
}

function admin_(pw) {
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_PW') || 'sdgs2026';
  if (String(pw || '') !== real) throw new Error('密碼錯誤');
}

function getProposals_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('proposals');
  if (hit) return JSON.parse(hit);
  const sh = SpreadsheetApp.getActive().getSheetByName(SH_PROPOSALS);
  const vals = sh.getRange(2, 1, ROUNDS, 3).getDisplayValues();
  const list = vals.map((v, i) => ({ g: v[0] || ('第 ' + (i + 1) + ' 組'), title: v[1] || '（尚未填寫提案）', desc: v[2] || '' }));
  cache.put('proposals', JSON.stringify(list), 60);
  return list;
}

function getCodes_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('codes');
  if (hit) return JSON.parse(hit);
  const sh = SpreadsheetApp.getActive().getSheetByName(SH_CODES);
  const last = sh.getLastRow();
  const codes = last < 2 ? [] : sh.getRange(2, 1, last - 1, 1).getDisplayValues().map(r => String(r[0]).trim().toUpperCase()).filter(Boolean);
  cache.put('codes', JSON.stringify(codes), 600);
  return codes;
}

function num_(props, k) { return parseInt(props[k] || '0', 10); }

function apiState_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const round = num_(props, 'round');
  const endAt = num_(props, 'endAt');
  const now = Date.now();
  const done = [];
  for (let r = 1; r <= ROUNDS; r++) if (props['closed_' + r] || (r === round && now >= endAt + GRACE_MS)) done.push(r);
  return {
    ok: true, now: now, round: round, endAt: endAt, roundMs: ROUND_MS,
    open: round > 0 && now < endAt,
    revealed: round > 0 && now >= endAt + GRACE_MS,
    turnout: round > 0 ? num_(props, 'y_' + round) + num_(props, 'n_' + round) : 0,
    totalCodes: getCodes_().length,
    proposals: getProposals_(),
    done: done,
  };
}

function apiCheck_(code) {
  code = String(code || '').trim().toUpperCase();
  if (getCodes_().indexOf(code) < 0) return { ok: false, error: '找不到這組投票碼' };
  const props = PropertiesService.getScriptProperties().getProperties();
  const used = [];
  for (let r = 1; r <= ROUNDS; r++) if (props['u_' + r + '_' + code]) used.push(r);
  return { ok: true, code: code, used: used };
}

function apiVote_(p) {
  const code = String(p.code || '').trim().toUpperCase();
  const r = parseInt(p.r, 10);
  const v = p.v === 'yes' ? 'yes' : p.v === 'no' ? 'no' : '';
  let reason = String(p.reason || '').replace(/\s+/g, ' ').trim().slice(0, REASON_MAX);
  if (!v) return { ok: false, error: '請選擇贊成或不贊成' };
  if (getCodes_().indexOf(code) < 0) return { ok: false, error: '投票碼無效' };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ps = PropertiesService.getScriptProperties();
    const props = ps.getProperties();
    const round = num_(props, 'round');
    const endAt = num_(props, 'endAt');
    if (r !== round) return { ok: false, error: '這一組目前沒有開放投票' };
    if (Date.now() > endAt + GRACE_MS) return { ok: false, error: '時間到了，這一輪已截止' };
    const usedKey = 'u_' + r + '_' + code;
    if (props[usedKey]) return { ok: false, error: '這組投票碼本輪已經投過了', already: true };

    const k = (v === 'yes' ? 'y_' : 'n_') + r;
    const upd = {};
    upd[usedKey] = '1';
    upd[k] = String(num_(props, k) + 1);
    ps.setProperties(upd);
    if (v === 'yes' && reason) {
      SpreadsheetApp.getActive().getSheetByName(SH_REASONS).appendRow([r, reason]);
    }
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

function apiResult_(r) {
  const props = PropertiesService.getScriptProperties().getProperties();
  const round = num_(props, 'round');
  const endAt = num_(props, 'endAt');
  const finished = props['closed_' + r] || (r === round && Date.now() >= endAt + GRACE_MS);
  if (!finished) return { ok: false, error: '還沒開票' };
  const yes = num_(props, 'y_' + r), no = num_(props, 'n_' + r);
  const sh = SpreadsheetApp.getActive().getSheetByName(SH_REASONS);
  const last = sh.getLastRow();
  let reasons = last < 2 ? [] : sh.getRange(2, 1, last - 1, 2).getDisplayValues()
    .filter(row => parseInt(row[0], 10) === r && row[1]).map(row => row[1]);
  reasons = shuffle_(reasons);
  writeResultRow_(r, yes, no);
  return { ok: true, r: r, yes: yes, no: no, reasons: reasons };
}

function writeResultRow_(r, yes, no) {
  const p = getProposals_()[r - 1];
  const total = yes + no;
  const verdict = yes > no ? '通過' : yes === no ? '平手' : '未通過';
  SpreadsheetApp.getActive().getSheetByName(SH_RESULTS).getRange(r + 1, 1, 1, 6)
    .setValues([[p.g, p.title, yes, no, total ? Math.round(yes / total * 100) + '%' : '-', verdict]]);
}

function apiSummary_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const round = num_(props, 'round');
  const endAt = num_(props, 'endAt');
  const list = getProposals_().map((p, i) => {
    const r = i + 1;
    const finished = !!(props['closed_' + r] || (r === round && Date.now() >= endAt + GRACE_MS));
    return { r: r, g: p.g, title: p.title, done: finished, yes: finished ? num_(props, 'y_' + r) : null, no: finished ? num_(props, 'n_' + r) : null };
  });
  return { ok: true, list: list };
}

function apiStart_(r) {
  if (!(r >= 1 && r <= ROUNDS)) throw new Error('組別錯誤');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ps = PropertiesService.getScriptProperties();
    const props = ps.getProperties();
    // 若上一輪已結束，標記 closed
    const prev = num_(props, 'round');
    if (prev && prev !== r) ps.setProperty('closed_' + prev, '1');
    // 重新開始這一組 → 清掉這一組舊資料
    Object.keys(props).forEach(k => { if (k.indexOf('u_' + r + '_') === 0) ps.deleteProperty(k); });
    ['y_' + r, 'n_' + r, 'closed_' + r].forEach(k => ps.deleteProperty(k));
    const sh = SpreadsheetApp.getActive().getSheetByName(SH_REASONS);
    const last = sh.getLastRow();
    if (last >= 2) {
      const keep = sh.getRange(2, 1, last - 1, 2).getValues().filter(row => parseInt(row[0], 10) !== r && row[1] !== '');
      sh.getRange(2, 1, last - 1, 2).clearContent();
      if (keep.length) sh.getRange(2, 1, keep.length, 2).setValues(keep);
    }
    CacheService.getScriptCache().remove('proposals');
    const endAt = Date.now() + ROUND_MS;
    ps.setProperties({ round: String(r), endAt: String(endAt) });
    return { ok: true, round: r, endAt: endAt, now: Date.now() };
  } finally {
    lock.releaseLock();
  }
}

function apiStop_() {
  const ps = PropertiesService.getScriptProperties();
  const endAt = num_(ps.getProperties(), 'endAt');
  const now = Date.now();
  if (endAt > now) ps.setProperty('endAt', String(now));
  return { ok: true };
}

function shuffle_(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
