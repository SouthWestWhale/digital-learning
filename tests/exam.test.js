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

/* ---------- สรุป ---------- */
console.log('ผลทดสอบ exam.test.js: ' + pass + ' ผ่าน, ' + fail + ' พลาด');
console.log(names.join('\n'));
process.exit(fail ? 1 : 0);
