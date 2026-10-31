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

/* ---------- สรุป ---------- */
console.log('\n=== examquiz.test.js ===');
names.forEach(function (n) { console.log(n); });
console.log('\nผ่าน ' + pass + ' / ' + (pass + fail));
if (fail > 0) { process.exit(1); }
