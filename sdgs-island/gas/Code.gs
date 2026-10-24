/**
 * SDGs 永續島 學習軌跡後端（Google Apps Script）
 * Gina的SDGs多元選修課
 *
 * 1. 在 Google 試算表中：擴充功能 → Apps Script，貼上本檔全部內容。
 * 2. 把下面的 TEACHER_KEY 改成你自己的老師密碼（儀表板登入用）。
 * 3. 部署 → 新增部署作業 → 類型選「網頁應用程式」
 *    執行身分：我；誰可以存取：所有人 → 部署，複製網址（結尾是 /exec）。
 */
const TEACHER_KEY = 'change-this-key';
const SHEET_NAME = 'Events';
const HEADERS = ['timestamp', 'version', 'class', 'id', 'name', 'type', 'island', 'option', 'correct', 'detail_json', 'client_time', 'session'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Blocks spreadsheet formula injection from student-typed text.
function clean_(v, max) {
  let s = v === null || v === undefined ? '' : String(v);
  s = s.slice(0, max || 100);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const events = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
    const rows = events
      .filter(ev => ev && (ev.v === 'basic' || ev.v === 'pro') && ev.id && ev.type)
      .map(ev => [
        new Date(),
        ev.v,
        clean_(ev.cls, 20),
        clean_(ev.id, 40),
        clean_(ev.name, 40),
        clean_(ev.type, 20),
        Number(ev.island) || '',
        ev.option === null || ev.option === undefined ? '' : Number(ev.option),
        ev.correct === null || ev.correct === undefined ? '' : Boolean(ev.correct),
        clean_(JSON.stringify(ev.d || {}), 5000),
        clean_(ev.t, 40),
        clean_(ev.sid, 20)
      ]);
    if (rows.length) {
      const sh = sheet_();
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== TEACHER_KEY) return json_({ ok: false, error: 'wrong_key' });
  const values = sheet_().getDataRange().getValues();
  values.shift();
  let rows = values.map(r => ({
    ts: r[0], v: r[1], cls: String(r[2]), id: String(r[3]), name: String(r[4]), type: r[5],
    island: r[6] === '' ? null : Number(r[6]),
    option: r[7] === '' ? null : Number(r[7]),
    correct: r[8] === '' ? null : r[8] === true || r[8] === 'TRUE',
    d: parse_(r[9]), sid: r[11]
  }));
  if (p.v) rows = rows.filter(r => r.v === p.v);
  if (p.cls) rows = rows.filter(r => r.cls === p.cls);
  return json_({ ok: true, rows: rows });
}

function parse_(s) {
  try { return JSON.parse(String(s).replace(/^'/, '')); } catch (err) { return {}; }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
