/* ===== tests/examquiz.test.js — ทดสอบความครบถ้วนของธนาคารข้อสอบ (node, ไม่มี DOM) =====
 * รัน: node tests/examquiz.test.js
 */
'use strict';

var fs = require('fs');
var path = require('path');

global.window = {};
require('../js/exam/questions.js');
var DL = global.window.DL;

var pass = 0, fail = 0, names = [];
function ok(name, cond) {
  if (cond) { pass++; names.push('  ✓ ' + name); }
  else { fail++; names.push('  ✗ ' + name); }
}

/* ---------- topics ---------- */
var TOPIC_IDS = ['counter', 'ff', 'reg', 'fsm', 'mem', 'adc', 'disp', 'timer'];
ok('มี DL.EXAM_TOPICS 8 topic', Array.isArray(DL.EXAM_TOPICS) && DL.EXAM_TOPICS.length === 8);
ok('topic id ตรงตามลำดับที่กำหนด', DL.EXAM_TOPICS && JSON.stringify(DL.EXAM_TOPICS.map(function (t) { return t.id; })) === JSON.stringify(TOPIC_IDS));
ok('topic ทุกอันมี name (ไม่ว่าง)', DL.EXAM_TOPICS && DL.EXAM_TOPICS.every(function (t) { return t.name && t.name.length > 0; }));

/* ---------- questions ---------- */
var qs = DL.EXAM_QUESTIONS;
ok('มี DL.EXAM_QUESTIONS ยาว 52', Array.isArray(qs) && qs.length === 52);

if (Array.isArray(qs) && qs.length === 52) {
  ok('id = q01..q52 เรียงถูกต้อง', qs.every(function (q, i) { return q.id === 'q' + String(i + 1).padStart(2, '0'); }));
  ok('num = 1..52 ตรงลำดับ', qs.every(function (q, i) { return q.num === i + 1; }));

  var topicMap = {};
  DL.EXAM_TOPICS.forEach(function (t) { topicMap[t.id] = true; });
  ok('topic ของทุกข้อชี้ topic ที่มีจริง', qs.every(function (q) { return topicMap[q.topic]; }));

  ok('ทุกข้อมี choices ครบ 4 ตัวเลือก', qs.every(function (q) { return Array.isArray(q.choices) && q.choices.length === 4; }));
  ok('ตัวเลือกทั้ง 4 ของทุกข้อไม่ซ้ำกัน', qs.every(function (q) { return new Set(q.choices).size === 4; }));
  ok('answer เป็น 0-3 ทุกข้อ', qs.every(function (q) { return Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3; }));
  ok('explain ยาว ≥ 20 ตัวอักษรทุกข้อ', qs.every(function (q) { return typeof q.explain === 'string' && q.explain.length >= 20; }));
  ok('ทุกข้อมี question ไม่ว่าง', qs.every(function (q) { return typeof q.question === 'string' && q.question.length > 0; }));

  ok('ไฟล์ภาพ docs/exam/qNN.png มีอยู่จริงทุกข้อ', qs.every(function (q) {
    return typeof q.img === 'string' && fs.existsSync(path.join(__dirname, '..', q.img));
  }));

  var LINKABLE = { 'counter': 1, 'ff': 1, 'reg': 1, 'fsm': 1, 'mem': 1, 'adc': 1, 'disp': 1, 'timer': 1,
    'register-memory': 1, 'multivibrator': 1, 'adc-dac': 1, 'latch-sr': 1, 'd-ff': 1, 'jk-ff': 1, 't-ff': 1,
    'seq-dff': 1, 'seq-sync': 1, 'decoder': 1, 'mux': 1, 'demux': 1, 'encoder': 1, 'student-id': 1,
    'number-system': 1, 'logic-gates': 1, 'boolean-algebra': 1, 'half-adder': 1, 'full-adder': 1, 'computer': 1 };
  ok('link เป็น null หรือ lesson id ที่มีจริง', qs.every(function (q) { return q.link === null || LINKABLE[q.link]; }));

  ok('id ไม่ซ้ำกัน', new Set(qs.map(function (q) { return q.id; })).size === 52);
}

/* ---------- ห้ามมี fetch/XHR ในซอร์ส ---------- */
var src = fs.readFileSync(path.join(__dirname, '..', 'js', 'exam', 'questions.js'), 'utf8');
ok('ซอร์สไม่มี fetch(', src.indexOf('fetch(') === -1);
ok('ซอร์สไม่มี XMLHttpRequest', src.indexOf('XMLHttpRequest') === -1);

/* ---------- quiz UI logic (DL.EXAMQ) ---------- */
// stub localStorage ในหน่วยความจำ ก่อน require examquiz.js
function makeStorage(throwOnAccess) {
  var mem = {};
  return {
    getItem: function (k) { if (throwOnAccess) throw new Error('boom'); return mem.hasOwnProperty(k) ? mem[k] : null; },
    setItem: function (k, v) { if (throwOnAccess) throw new Error('boom'); mem[k] = String(v); },
    removeItem: function (k) { if (throwOnAccess) throw new Error('boom'); delete mem[k]; }
  };
}
global.localStorage = makeStorage(false);
require('../js/lessons.js');      // ให้มี DL.GROUPS / DL.registerLesson จริงตามหน้าเว็บ
require('../js/exam/examquiz.js');

var Q = DL.EXAMQ;
ok('มี DL.EXAMQ (filterByTopic/check/loadPicks/savePick/buildExamQuiz เป็น function)',
  !!Q && typeof Q.filterByTopic === 'function' && typeof Q.check === 'function' &&
  typeof Q.loadPicks === 'function' && typeof Q.savePick === 'function' && typeof DL.buildExamQuiz === 'function');

if (Q) {
  ok('filterByTopic all คืนครบ 52', Q.filterByTopic(qs, 'all').length === 52);
  var firstTopic = DL.EXAM_TOPICS[0].id;
  var filtered = Q.filterByTopic(qs, firstTopic);
  ok('filterByTopic topic แรกได้ > 0 ข้อ', filtered.length > 0);
  ok('filterByTopic ทุกข้อที่ได้ topic ตรง', filtered.every(function (q) { return q.topic === firstTopic; }));

  ok('check ถูก (idx === answer)', Q.check({ answer: 2 }, 2) === true);
  ok('check ผิด (idx !== answer)', Q.check({ answer: 2 }, 1) === false);

  // savePick/loadPicks กลมกลืน
  global.localStorage = makeStorage(false);
  Q.savePick('q01', { picked: 2, correct: false });
  Q.savePick('q07', { picked: 3, correct: true });
  var picks = Q.loadPicks();
  ok('savePick/loadPicks กลมกลืน (q01)', picks.q01 && picks.q01.picked === 2 && picks.q01.correct === false);
  ok('savePick/loadPicks กลมกลืน (q07)', picks.q07 && picks.q07.picked === 3 && picks.q07.correct === true);

  // stub ที่ throw — ต้องไม่ crash
  global.localStorage = makeStorage(true);
  var throwsPicks = null;
  try { throwsPicks = Q.loadPicks(); } catch (e) { throwsPicks = 'THREW'; }
  ok('localStorage พัง → loadPicks คืน {} ไม่ throw', throwsPicks !== null && typeof throwsPicks === 'object' && !(throwsPicks instanceof Array) && Object.keys(throwsPicks).length === 0);
  var saveOk = true;
  try { Q.savePick('q01', { picked: 0, correct: true }); } catch (e) { saveOk = false; }
  ok('localStorage พัง → savePick เงียบ ไม่ throw', saveOk === true);
  global.localStorage = makeStorage(false);
}

/* ---------- บทเรียน + กลุ่ม ---------- */
ok('มีบท exam-quiz ลงทะเบียนแล้ว', !!(DL.LESSONS && DL.LESSONS['exam-quiz']));
ok('บท exam-quiz อยู่กลุ่ม exam', DL.LESSONS && DL.LESSONS['exam-quiz'] && DL.LESSONS['exam-quiz'].group === 'exam');
var examGroup = (DL.GROUPS || []).filter(function (g) { return g.id === 'exam'; })[0];
ok('DL.GROUPS มี group exam ชื่อมีคำว่า ติวฟินอล', !!examGroup && examGroup.name.indexOf('ติวฟินอล') !== -1);
ok('group exam อยู่หลัง lab', examGroup && DL.GROUPS.map(function (g) { return g.id; }).indexOf('lab') < DL.GROUPS.map(function (g) { return g.id; }).indexOf('exam'));

/* ---------- ห้ามมี fetch/XHR/setInterval ใน examquiz.js ---------- */
var quizSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'exam', 'examquiz.js'), 'utf8');
ok('examquiz.js ไม่มี fetch(', quizSrc.indexOf('fetch(') === -1);
ok('examquiz.js ไม่มี XMLHttpRequest', quizSrc.indexOf('XMLHttpRequest') === -1);
ok('examquiz.js ไม่มี setInterval', quizSrc.indexOf('setInterval') === -1);

/* ---------- สรุป ---------- */
console.log('\n=== examquiz.test.js ===');
names.forEach(function (n) { console.log(n); });
console.log('\nผ่าน ' + pass + ' / ' + (pass + fail));
if (fail > 0) { process.exit(1); }
