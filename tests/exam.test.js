/* ===== tests/exam.test.js — บทเรียนจากข้อสอบ (กลุ่ม exam) =====
 * รัน: node tests/exam.test.js — ทดสอบผ่าน build function ตัวจริงของบท
 * เริ่มที่บท exam-ripple (q01, q10, q14, q15)
 */
'use strict';

global.window = {};
require('../js/lessons.js');
require('../js/engine/sim.js');
require('../js/engine/ff.js');
require('../js/circuits/basics.js');
require('../js/circuits/flipflops.js');
require('../js/circuits/sequential.js');
require('../js/circuits/course.js');
require('../js/circuits/studentid.js');
require('../js/circuits/exam.js');
var DL = global.window.DL;

var pass = 0, fail = 0, names = [];
function ok(name, cond) {
  if (cond) { pass++; names.push('  ✓ ' + name); }
  else { fail++; names.push('  ✗ ' + name); }
}
function eq(name, got, want) {
  ok(name + ' (got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want) + ')',
     JSON.stringify(got) === JSON.stringify(want));
}
function build(lessonId, idx) {
  var sim = new DL.CircuitSim();
  DL.LESSONS[lessonId].circuits[idx].build(sim);
  return sim;
}
function pulse(sim, n) { for (var i = 0; i < n; i++) sim.clockEdge(); }

/* ---------- บทลงทะเบียนถูกต้อง ---------- */
ok('exam-ripple: ลงทะเบียนใน DL.LESSONS', !!DL.LESSONS['exam-ripple']);
ok('exam-ripple: group = exam', DL.LESSONS['exam-ripple'] && DL.LESSONS['exam-ripple'].group === 'exam');
eq('exam-ripple: มี 2 วงจร', DL.LESSONS['exam-ripple'] && DL.LESSONS['exam-ripple'].circuits.length, 2);
ok('exam-ripple: html อ้างโจทย์ q01 + q14',
   DL.LESSONS['exam-ripple'].html.indexOf('docs/exam/q01.png') >= 0 &&
   DL.LESSONS['exam-ripple'].html.indexOf('docs/exam/q14.png') >= 0);

/* ---------- วงจร 1: ripple 2×JKFF (q01) — นับขึ้น 00→01→10→11 ---------- */
var jk = build('exam-ripple', 0);
jk.setInput('jk', 1);
function st2(s) { return [s.outputValue('q1Led'), s.outputValue('q0Led')]; }
eq('q01: เริ่ม 00', st2(jk), [0, 0]);
pulse(jk, 1); eq('q01: pulse 1 → 01', st2(jk), [0, 1]);
pulse(jk, 1); eq('q01: pulse 2 → 10', st2(jk), [1, 0]);
pulse(jk, 1); eq('q01: pulse 3 → 11', st2(jk), [1, 1]);
pulse(jk, 1); eq('q01: pulse 4 → 00 (วนครบ mod-4)', st2(jk), [0, 0]);
ok('q01: ff1 ต่อ ripple จาก ff0:qn',
   jk.nodes['ff1'].opts.clockFrom === 'ff0:qn' && jk.nodes['ff1'].def.isFF);

/* ---------- วงจร 2: ripple 3×DFF Q̄→D (q14) — นับขึ้น 000→111 ---------- */
var df = build('exam-ripple', 1);
function val3(s) {
  return s.nodes['ff2'].state.q * 4 + s.nodes['ff1'].state.q * 2 + s.nodes['ff0'].state.q;
}
eq('q14: เริ่ม 0', val3(df), 0);
pulse(df, 1); eq('q14: 1 pulse → 1', val3(df), 1);
pulse(df, 1); eq('q14: 2 pulse → 2', val3(df), 2);
pulse(df, 1); eq('q14: 3 pulse → 3', val3(df), 3);
pulse(df, 1);
eq('q14: pulse รวม 4 ครั้ง → 4 (100)', val3(df), 4);
pulse(df, 4);
eq('q14: pulse อีก 4 ครั้ง → ครบ 8 วนกลับ 0', val3(df), 0);
ok('q14: d ของทุก FF ต่อจาก qn ของตัวเอง',
   df.wires.some(function (w) { return w.from.id === 'ff0' && w.from.pin === 'qn' && w.to.id === 'ff0' && w.to.pin === 'd'; }) &&
   df.wires.some(function (w) { return w.from.id === 'ff2' && w.from.pin === 'qn' && w.to.id === 'ff2' && w.to.pin === 'd'; }));
eq('q14: ff2 ต่อ ripple จาก ff1:qn', df.nodes['ff2'].opts.clockFrom, 'ff1:qn');

/* ---------- บท exam-7476: Shift Register SIPO จาก 7476 (q06, q16, q42) ---------- */
ok('exam-7476: ลงทะเบียนใน DL.LESSONS', !!DL.LESSONS['exam-7476']);
ok('exam-7476: group = exam', DL.LESSONS['exam-7476'] && DL.LESSONS['exam-7476'].group === 'exam');
eq('exam-7476: มี 1 วงจร', DL.LESSONS['exam-7476'] && DL.LESSONS['exam-7476'].circuits.length, 1);
ok('exam-7476: html อ้างโจทย์ q06 + q16 + q42',
   DL.LESSONS['exam-7476'].html.indexOf('docs/exam/q06.png') >= 0 &&
   DL.LESSONS['exam-7476'].html.indexOf('q16') >= 0 &&
   DL.LESSONS['exam-7476'].html.indexOf('q42') >= 0);
ok('exam-7476: html ตอบ Serial in, Parallel out (SIPO)',
   DL.LESSONS['exam-7476'].html.indexOf('Serial in, Parallel out') >= 0);

var sr = build('exam-7476', 0);
function q4(s) {
  return [s.nodes['ff3'].state.q, s.nodes['ff2'].state.q, s.nodes['ff1'].state.q, s.nodes['ff0'].state.q];
}
function led4(s) {
  return [s.outputValue('q3Led'), s.outputValue('q2Led'), s.outputValue('q1Led'), s.outputValue('q0Led')];
}
eq('7476: เริ่ม 0000', q4(sr), [0, 0, 0, 0]);

sr.setInput('din', 1);
pulse(sr, 1);
eq('7476: din=1 pulse 1 → Q0=1 ที่เหลือ 0', led4(sr), [0, 0, 0, 1]);
eq('7476: (state ตรงกัน)', q4(sr), [0, 0, 0, 1]);

sr.setInput('din', 0); pulse(sr, 1);
sr.setInput('din', 1); pulse(sr, 1);
sr.setInput('din', 1); pulse(sr, 1);
eq('7476: ป้อน 1,0,1,1 ครบ 4 pulse → [Q3,Q2,Q1,Q0]=[1,0,1,1]', led4(sr), [1, 0, 1, 1]);
eq('7476: (state ตรงกัน — บิตเข้าก่อนไหลไปสุด Q3)', q4(sr), [1, 0, 1, 1]);

ok('7476: ทุก JKFF เป็น primary clock (ไม่มี clockFrom)',
   ['ff0', 'ff1', 'ff2', 'ff3'].every(function (id) { return !sr.nodes[id].opts.clockFrom; }));
ok('7476: ff1 J,K ได้จาก Q ของ ff0 ผ่าน NOT (J ตรง K กลับ) — พฤติกรรมเหมือน D',
   sr.wires.some(function (w) { return w.from.id === 'ff0' && w.from.pin === 'q' && w.to.id === 'ff1' && w.to.pin === 'j'; }) &&
   sr.wires.some(function (w) { return w.from.id === 'not1' && w.from.pin === 'out' && w.to.id === 'ff1' && w.to.pin === 'k'; }));
ok('7476: ff0 J รับ din ตรง, K ผ่าน NOT (7404 ตามรูป q06)',
   sr.wires.some(function (w) { return w.from.id === 'din' && w.from.pin === 'out' && w.to.id === 'ff0' && w.to.pin === 'j'; }) &&
   sr.wires.some(function (w) { return w.from.id === 'not0' && w.from.pin === 'out' && w.to.id === 'ff0' && w.to.pin === 'k'; }));

/* ---------- บท exam-modn: Johnson counter (q38) + mod-6 async clear (q41) ---------- */
ok('exam-modn: ลงทะเบียนใน DL.LESSONS', !!DL.LESSONS['exam-modn']);
ok('exam-modn: group = exam', DL.LESSONS['exam-modn'] && DL.LESSONS['exam-modn'].group === 'exam');
eq('exam-modn: มี 2 วงจร', DL.LESSONS['exam-modn'] && DL.LESSONS['exam-modn'].circuits.length, 2);
ok('exam-modn: html อ้างโจทย์ q38 + q41',
   DL.LESSONS['exam-modn'].html.indexOf('docs/exam/q38.png') >= 0 &&
   DL.LESSONS['exam-modn'].html.indexOf('docs/exam/q41.png') >= 0);
ok('exam-modn: html สอน 3 สูตร (cascade คูณ, 2^n≥N, excitation JK)',
   DL.LESSONS['exam-modn'].html.indexOf('5 × 5') >= 0 &&
   DL.LESSONS['exam-modn'].html.indexOf('273') >= 0 &&
   DL.LESSONS['exam-modn'].html.indexOf('9 ตัว') >= 0 &&
   DL.LESSONS['exam-modn'].html.indexOf('J=K=1') >= 0);

/* วงจร 1: Johnson 4×DFF — d0←qn3, d1←q0, d2←q1, d3←q2, CLK รวม */
var jh = build('exam-modn', 0);
function johnState(s) {
  return [s.nodes['ff3'].state.q, s.nodes['ff2'].state.q, s.nodes['ff1'].state.q, s.nodes['ff0'].state.q];
}
ok('q38: d0 ต่อจาก qn3 (twisted feedback)',
   jh.wires.some(function (w) { return w.from.id === 'ff3' && w.from.pin === 'qn' && w.to.id === 'ff0' && w.to.pin === 'd'; }));
ok('q38: d1←q0, d2←q1, d3←q2',
   jh.wires.some(function (w) { return w.from.id === 'ff0' && w.from.pin === 'q' && w.to.id === 'ff1' && w.to.pin === 'd'; }) &&
   jh.wires.some(function (w) { return w.from.id === 'ff1' && w.from.pin === 'q' && w.to.id === 'ff2' && w.to.pin === 'd'; }) &&
   jh.wires.some(function (w) { return w.from.id === 'ff2' && w.from.pin === 'q' && w.to.id === 'ff3' && w.to.pin === 'd'; }));
ok('q38: ทุก DFF เป็น primary clock (CLK รวม)',
   ['ff0', 'ff1', 'ff2', 'ff3'].every(function (id) { return !jh.nodes[id].opts.clockFrom; }));

var initJohn = johnState(jh);
eq('q38: เริ่ม 0000', initJohn, [0, 0, 0, 0]);
var seen = [initJohn.join('')];
for (var p = 1; p <= 8; p++) {
  pulse(jh, 1);
  seen.push(johnState(jh).join(''));
}
var uniq = {};
seen.forEach(function (s) { uniq[s] = 1; });
eq('q38: 8 สถานะไม่ซ้ำ (8 distinct states)', Object.keys(uniq).length, 8);
eq('q38: pulse ครบ 8 → กลับสถานะเริ่มต้น', johnState(jh), initJohn);

/* วงจร 2: mod-6 3×TFF + AND(q2,q1) → clr ทุกตัว */
var m6 = build('exam-modn', 1);
m6.setInput('en', 1);
function m6val(s) {
  return s.nodes['ff2'].state.q * 4 + s.nodes['ff1'].state.q * 2 + s.nodes['ff0'].state.q;
}
eq('q41: เริ่ม 0', m6val(m6), 0);
ok('q41: AND รับ q2,q1 → clr ของทุก TFF',
   m6.wires.some(function (w) { return w.from.id === 'and1' && w.from.pin === 'out' && w.to.id === 'ff0' && w.to.pin === 'clr'; }) &&
   m6.wires.some(function (w) { return w.from.id === 'and1' && w.from.pin === 'out' && w.to.id === 'ff2' && w.to.pin === 'clr'; }) &&
   m6.wires.some(function (w) { return w.from.id === 'ff2' && w.from.pin === 'q' && w.to.id === 'and1'; }) &&
   m6.wires.some(function (w) { return w.from.id === 'ff1' && w.from.pin === 'q' && w.to.id === 'and1'; }));
var seq6 = [0];
var neverBad = true;
for (var q = 0; q < 12; q++) {
  pulse(m6, 1);
  var v = m6val(m6);
  seq6.push(v);
  if (v === 6 || v === 7) neverBad = false;
}
ok('q41: 12 pulse ไม่เคยเป็น 6 หรือ 7', neverBad);
eq('q41: วน 0..5 ซ้ำ 2 รอบครบ', seq6, [0,1,2,3,4,5,0,1,2,3,4,5,0]);

/* ---------- สรุป ---------- */
console.log('ผลทดสอบ exam.test.js: ' + pass + ' ผ่าน, ' + fail + ' พลาด');
console.log(names.join('\n'));
process.exit(fail ? 1 : 0);
