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

/* ---------- บท exam-srlatch: SR Latch มุมข้อสอบ — NAND vs NOR (q04, q22, q28) ---------- */
ok('exam-srlatch: ลงทะเบียนใน DL.LESSONS', !!DL.LESSONS['exam-srlatch']);
ok('exam-srlatch: group = exam', DL.LESSONS['exam-srlatch'] && DL.LESSONS['exam-srlatch'].group === 'exam');
eq('exam-srlatch: มี 2 วงจร', DL.LESSONS['exam-srlatch'] && DL.LESSONS['exam-srlatch'].circuits.length, 2);
ok('exam-srlatch: html อ้างโจทย์ q04 + q22',
   DL.LESSONS['exam-srlatch'].html.indexOf('docs/exam/q04.png') >= 0 &&
   DL.LESSONS['exam-srlatch'].html.indexOf('docs/exam/q22.png') >= 0);
ok('exam-srlatch: html มีตารางเทียบ NOR active-high / NAND active-low',
   DL.LESSONS['exam-srlatch'].html.indexOf('<table') >= 0 &&
   DL.LESSONS['exam-srlatch'].html.indexOf('active-high') >= 0 &&
   DL.LESSONS['exam-srlatch'].html.indexOf('active-low') >= 0);
ok('exam-srlatch: summary มีสมการ characteristic q28 (NOR: S + R̄Q, NAND: S̄ + RQ̄)',
   DL.LESSONS['exam-srlatch'].summary.indexOf('Q₊ = S + R̄Q') >= 0 &&
   DL.LESSONS['exam-srlatch'].summary.indexOf('Q₊ = S̄ + RQ̄') >= 0 &&
   DL.LESSONS['exam-srlatch'].summary.indexOf('q28') >= 0);

/* component SR_LATCH_NAND ลงทะเบียนถูกต้อง (active-low, transparent — ไม่ isFF) */
ok('SR_LATCH_NAND: ลงทะเบียน component แล้ว',
   typeof DL.LESSONS['exam-srlatch'] === 'object' &&
   (function () { try { var t = new DL.CircuitSim(); t.addComponent('x', 'SR_LATCH_NAND', {}); return true; } catch (e) { return false; } })());

/* วงจร 2: NAND latch (active-low) — set ด้วย S̄=0, hold เมื่อ S̄=R̄=1, reset ด้วย R̄=0, เสียสมมาตรที่ S̄=R̄=0 */
var nl = build('exam-srlatch', 1);
eq('q22: เริ่ม Q=0', nl.nodes['nl'].state.q, 0);
nl.setInput('r', 1);            // S̄=0 (default), R̄=1 → set (active-low)
eq('q22: S̄=0, R̄=1 → set Q=1 (ยิ่งกดต่ำยิ่งทำงาน)', nl.nodes['nl'].state.q, 1);
nl.setInput('s', 1);            // S̄=R̄=1 → hold
eq('q22: S̄=R̄=1 → hold Q คง 1 (ต่างจาก NOR ที่เป็น ?)', nl.nodes['nl'].state.q, 1);
nl.setInput('r', 0);            // R̄=0 → reset
eq('q22: R̄=0 → reset Q=0', nl.nodes['nl'].state.q, 0);
nl.setInput('s', 0);            // S̄=R̄=0 → เสียสมมาตร
eq('q22: S̄=R̄=0 → Q=1 และ Q̄=1 (เสียสมมาตร)', [nl.nodes['nl'].state.q, nl.nodes['nl'].state.qn], [1, 1]);
ok('q22: NAND latch เป็น transparent (ไม่ isFF)', !nl.nodes['nl'].def.isFF);
ok('q22: pinLabels S̄,R̄', nl.nodes['nl'].def.pinLabels.s === 'S̄' && nl.nodes['nl'].def.pinLabels.r === 'R̄');

/* วงจร 1: NOR latch (SR_LATCH เดิม) — S=R=1 → '?' ที่ขา Q ของ LED */
var rl = build('exam-srlatch', 0);
rl.setInput('s', 1);
eq('q04: S=1, R=0 → set Q=1', rl.outputValue('qLed'), 1);
rl.setInput('r', 1);
eq('q04: S=R=1 → forbidden Q=? ที่ขา LED', rl.outputValue('qLed'), '?');
ok('q04: ใช้ SR_LATCH (NOR) เดิม', rl.nodes['rl'].comp === 'SR_LATCH' && !rl.nodes['rl'].def.isFF);

/* ---------- บท exam-tff: T-FF นับสถานะ 2 บิต ขึ้น/ลง (q05, q39, q40, q46) ---------- */
ok('exam-tff: ลงทะเบียนใน DL.LESSONS', !!DL.LESSONS['exam-tff']);
ok('exam-tff: group = exam', DL.LESSONS['exam-tff'] && DL.LESSONS['exam-tff'].group === 'exam');
eq('exam-tff: มี 2 วงจร', DL.LESSONS['exam-tff'] && DL.LESSONS['exam-tff'].circuits.length, 2);
ok('exam-tff: html อ้างโจทย์ q46 + q39 + q05',
   DL.LESSONS['exam-tff'].html.indexOf('docs/exam/q46.png') >= 0 &&
   DL.LESSONS['exam-tff'].html.indexOf('docs/exam/q39.png') >= 0 &&
   DL.LESSONS['exam-tff'].html.indexOf('docs/exam/q05.png') >= 0);
ok('exam-tff: html สอนจำนวนสถานะ 2ⁿ (q40) + trace ตาราง characteristic (q05)',
   DL.LESSONS['exam-tff'].html.indexOf('2ⁿ') >= 0 &&
   DL.LESSONS['exam-tff'].html.indexOf('q40') >= 0 &&
   DL.LESSONS['exam-tff'].html.indexOf('characteristic') >= 0 &&
   DL.LESSONS['exam-tff'].html.indexOf('q05') >= 0);
ok('exam-tff: summary มีสูตรจำ (2ⁿ, นับถอยหลัง, นับขึ้น)',
   DL.LESSONS['exam-tff'].summary.indexOf('2ⁿ') >= 0 &&
   DL.LESSONS['exam-tff'].summary.indexOf('นับถอยหลัง') >= 0 &&
   DL.LESSONS['exam-tff'].summary.indexOf('นับขึ้น') >= 0);

/* วงจร 1: q46 — 2×TFF T=1 sync (CLK รวม primary ทั้งคู่) → นับถอยหลัง 3,2,1,0 */
var dwn = build('exam-tff', 0);
dwn.setInput('en', 1);
function tval(s) { return 2 * s.nodes['ff1'].state.q + s.nodes['ff0'].state.q; }
eq('q46: เริ่ม 0', tval(dwn), 0);
ok('q46: ทุก TFF เป็น primary clock (sync — ไม่มี clockFrom)',
   ['ff0', 'ff1'].every(function (id) { return !dwn.nodes[id].opts.clockFrom; }));
ok('q46: ff0 รับ T=1 จาก input en, ff1 รับ T จาก Q̄0 (ตามรูปข้อสอบ)',
   dwn.wires.some(function (w) { return w.from.id === 'en' && w.to.id === 'ff0' && w.to.pin === 't'; }) &&
   dwn.wires.some(function (w) { return w.from.id === 'ff0' && w.from.pin === 'qn' && w.to.id === 'ff1' && w.to.pin === 't'; }));
var seqDown = [0];
for (var dp = 1; dp <= 5; dp++) { pulse(dwn, 1); seqDown.push(tval(dwn)); }
eq('q46: นับถอยหลัง 3,2,1,0 แล้ววนกลับ 3 (ตรงเฉลย 11,10,01,00)', seqDown.slice(1), [3,2,1,0,3]);

/* วงจร 2: q39 — ff0 T=1, ff1 T ต่อจาก Q0, CLK รวม → นับขึ้น 1,2,3,0 */
var upc = build('exam-tff', 1);
upc.setInput('en', 1);
function uval(s) { return 2 * s.nodes['ff1'].state.q + s.nodes['ff0'].state.q; }
eq('q39: เริ่ม 0', uval(upc), 0);
ok('q39: ff1 T ต่อจาก Q ของ ff0, ทุกตัว primary clock',
   upc.wires.some(function (w) { return w.from.id === 'ff0' && w.from.pin === 'q' && w.to.id === 'ff1' && w.to.pin === 't'; }) &&
   ['ff0', 'ff1'].every(function (id) { return !upc.nodes[id].opts.clockFrom; }));
ok('q39: ff0 รับ T=1 จาก input en',
   upc.wires.some(function (w) { return w.from.id === 'en' && w.to.id === 'ff0' && w.to.pin === 't'; }));
var seqUp = [0];
for (var up = 1; up <= 5; up++) { pulse(upc, 1); seqUp.push(uval(upc)); }
eq('q39: นับขึ้น 1,2,3,0 แล้ววนกลับ 1 (mod-4)', seqUp.slice(1), [1,2,3,0,1]);

/* ---------- บท exam-shift: Shift ข้อมูลผ่านวงจร + UART (q18, q34, q50) ---------- */
ok('exam-shift: ลงทะเบียนใน DL.LESSONS', !!DL.LESSONS['exam-shift']);
ok('exam-shift: group = exam', DL.LESSONS['exam-shift'] && DL.LESSONS['exam-shift'].group === 'exam');
eq('exam-shift: มี 2 วงจร', DL.LESSONS['exam-shift'] && DL.LESSONS['exam-shift'].circuits.length, 2);
ok('exam-shift: html อ้างโจทย์ q18 + q34 + q50',
   DL.LESSONS['exam-shift'].html.indexOf('docs/exam/q18.png') >= 0 &&
   DL.LESSONS['exam-shift'].html.indexOf('docs/exam/q34.png') >= 0 &&
   DL.LESSONS['exam-shift'].html.indexOf('docs/exam/q50.png') >= 0);
ok('exam-shift: html สอน UART — Tx = parallel-in/serial-out (PISO), Rx = serial-in/parallel-out (SIPO)',
   DL.LESSONS['exam-shift'].html.indexOf('parallel-in/serial-out') >= 0 &&
   DL.LESSONS['exam-shift'].html.indexOf('serial-in/parallel-out') >= 0);
ok('exam-shift: html ไม่ซ้ำ framing ของ exam-7476 (ไม่สอน "7476" ซ้ำ — เน้นดูบิตไหลออก serial)',
   DL.LESSONS['exam-shift'].html.indexOf('7476') < 0 &&
   DL.LESSONS['exam-shift'].html.indexOf('serial-out') >= 0);
ok('exam-shift: summary มีกฎจำ (1 pulse = เลื่อน 1 บิต, FIFO, UART Tx=PISO/Rx=SIPO)',
   DL.LESSONS['exam-shift'].summary.indexOf('เลื่อน 1 บิต') >= 0 &&
   DL.LESSONS['exam-shift'].summary.indexOf('ออกก่อน') >= 0 &&
   DL.LESSONS['exam-shift'].summary.indexOf('PISO') >= 0 &&
   DL.LESSONS['exam-shift'].summary.indexOf('SIPO') >= 0);

/* วงจร 1: q18 — 4×DFF shift ขวาตามรูปข้อสอบ (din→q3/D, เลื่อน D→C→B→A, บิตออกที่ q0/A)
 * ทิศยืนยันจากภาพ q18: header "in: D C B A" + ตาราง P1=1000, P2=1100, P3=0110, P4=0011 + เฉลย ข้อ a = 0011 */
var sr = build('exam-shift', 0);
ok('q18: ใช้ DFF 4 ตัว เป็น primary clock ทั้งหมด (CLK รวม)',
   ['ff0', 'ff1', 'ff2', 'ff3'].every(function (id) {
     return sr.nodes[id] && sr.nodes[id].comp === 'DFF' && !sr.nodes[id].opts.clockFrom;
   }));
ok('q18: สายตามรูปข้อสอบ — din→ff3.d (D), ff3.q→ff2.d, ff2.q→ff1.d, ff1.q→ff0.d, ff0.q→out (serial ที่ A)',
   sr.wires.some(function (w) { return w.from.id === 'din' && w.to.id === 'ff3' && w.to.pin === 'd'; }) &&
   sr.wires.some(function (w) { return w.from.id === 'ff3' && w.from.pin === 'q' && w.to.id === 'ff2' && w.to.pin === 'd'; }) &&
   sr.wires.some(function (w) { return w.from.id === 'ff2' && w.from.pin === 'q' && w.to.id === 'ff1' && w.to.pin === 'd'; }) &&
   sr.wires.some(function (w) { return w.from.id === 'ff1' && w.from.pin === 'q' && w.to.id === 'ff0' && w.to.pin === 'd'; }) &&
   sr.wires.some(function (w) { return w.from.id === 'ff0' && w.from.pin === 'q' && w.to.id === 'outLed' && w.to.pin === 'in'; }));
function qall(s) { return ['ff3', 'ff2', 'ff1', 'ff0'].map(function (id) { return s.nodes[id].state.q; }); }
eq('q18: เริ่ม 0000', qall(sr), [0, 0, 0, 0]);
var feed = [1, 1, 0, 0];
for (var fp = 0; fp < 4; fp++) { sr.setInput('din', feed[fp]); pulse(sr, 1); }
eq('q18: หลัง pulse ครบ 4 (din = 1,1,0,0): D C B A = [q3,q2,q1,q0] = [0,0,1,1] = 0011 (ตรงเฉลยข้อสอบ q18 ข้อ a)', qall(sr), [0, 0, 1, 1]);
var exitStream = [sr.nodes['ff0'].state.q];   // บิตที่ 1 อยู่ที่ A แล้วตอนจบ pulse 4 กำลังจะหลุดออก
for (var ep = 5; ep <= 7; ep++) { sr.setInput('din', 0); pulse(sr, 1); exitStream.push(sr.nodes['ff0'].state.q); }
eq('q18: บิตออกทาง A (serial out) หลัง pulse 4,5,6,7 = 1,1,0,0 (ตรงลำดับที่ป้อนเข้า — เข้าก่อนออกก่อน FIFO)', exitStream, [1, 1, 0, 0]);
eq('q18: คล็อก 0 ต่อจนครบ 7 pulse → register กลับว่าง = 0000', qall(sr), [0, 0, 0, 0]);

/* วงจร 2: q34 — JK (J=K=I) → P, P → D-FF → Q — trace 3 คล็อกจาก Start P=0,Q=1 */
var tq = build('exam-shift', 1);
ok('q34: วงจรตามรูป — input I ต่อ J และ K ของ JK, P (JK.q) → D ของ DFF, CLK รวม primary',
   tq.wires.some(function (w) { return w.from.id === 'i' && w.to.id === 'jk' && w.to.pin === 'j'; }) &&
   tq.wires.some(function (w) { return w.from.id === 'i' && w.to.id === 'jk' && w.to.pin === 'k'; }) &&
   tq.wires.some(function (w) { return w.from.id === 'jk' && w.from.pin === 'q' && w.to.id === 'dff' && w.to.pin === 'd'; }) &&
   !tq.nodes['jk'].opts.clockFrom && !tq.nodes['dff'].opts.clockFrom);
tq.setInput('i', 1);
pulse(tq, 2);   // ตั้ง initial state ให้ตรง Start ในภาพข้อสอบ: P=0, Q=1
function pq(s) { return [s.nodes['jk'].state.q, s.nodes['dff'].state.q]; }
eq('q34: ตั้ง Start ให้ตรงภาพข้อสอบ: P=0, Q=1', pq(tq), [0, 1]);
var trace = [];
for (var tp = 1; tp <= 3; tp++) { pulse(tq, 1); trace.push(pq(tq)); }
eq('q34: trace 3 คล็อก (I=1): P1=(1,0), P2=(0,1), P3=(1,0) — Q ตาม P ของคล็อกก่อนหน้าเสมอ', trace, [[1, 0], [0, 1], [1, 0]]);
eq('q34: หลัง 3 คล็อก P,Q = 1,0 (ตรงเฉลยข้อสอบ q34 ข้อ b)', pq(tq), [1, 0]);

/* ---------- สรุป ---------- */
console.log('ผลทดสอบ exam.test.js: ' + pass + ' ผ่าน, ' + fail + ' พลาด');
console.log(names.join('\n'));
process.exit(fail ? 1 : 0);
