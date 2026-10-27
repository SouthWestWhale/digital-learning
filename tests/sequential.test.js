/* ===== tests/sequential.test.js — ทดสอบ flip-flop + clockEdge =====
 * รัน: node tests/sequential.test.js
 * ทดสอบผ่าน build function ตัวจริงของบทเรียน (latch-sr, d-ff, jk-ff, t-ff)
 */
'use strict';

global.window = {};
require('../js/lessons.js');
require('../js/engine/sim.js');
require('../js/engine/ff.js');
require('../js/circuits/basics.js');
require('../js/circuits/flipflops.js');
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

function buildLessonCircuit(lessonId, idx) {
  var sim = new DL.CircuitSim();
  DL.LESSONS[lessonId].circuits[idx].build(sim);
  return sim;
}

/* ---------- D Flip-Flop: Q ตาม D เฉพาะตอนขอบขึ้นของ clock ---------- */
var dff = buildLessonCircuit('d-ff', 0);
dff.setInput('d', 1);
eq('D=1 แต่ยังไม่ pulse → Q ยังเป็น 0', dff.outputValue('qLed'), 0);
dff.clockEdge();
eq('pulse ครั้งแรก → Q = 1', dff.outputValue('qLed'), 1);
eq('Q̄ = 0', dff.outputValue('qnLed'), 0);
dff.setInput('d', 0);
eq('D เปลี่ยนแต่ไม่ pulse → Q คง 1 (edge-triggered)', dff.outputValue('qLed'), 1);
dff.clockEdge();
eq('pulse ครั้งที่สอง → Q = 0', dff.outputValue('qLed'), 0);
eq('Q̄ = 1', dff.outputValue('qnLed'), 1);

/* ---------- SR Latch (transparent): เปลี่ยนเมื่อ S/R เปลี่ยนเลย ---------- */
var sr = buildLessonCircuit('latch-sr', 0);
sr.setInput('s', 1);
eq('latch S=1 → Q=1 ทันที (ไม่ต้องมี clock)', sr.outputValue('qLed'), 1);
sr.setInput('s', 0); sr.setInput('r', 0);
eq('S=R=0 → hold ค่าเดิม Q=1', sr.outputValue('qLed'), 1);
sr.setInput('r', 1);
eq('R=1 → Q=0 (reset)', sr.outputValue('qLed'), 0);
sr.setInput('r', 0);
eq('hold อีกครั้ง Q=0', sr.outputValue('qLed'), 0);
sr.setInput('s', 1); sr.setInput('r', 1);
eq('S=R=1 → สถานะต้องห้าม Q=?', sr.outputValue('qLed'), '?');

/* ---------- JK Flip-Flop: 4 โหมด + toggle ครั้งเดียวต่อพัลส์ ---------- */
var jk = buildLessonCircuit('jk-ff', 0);
jk.setInput('j', 1); jk.clockEdge();
eq('J=1 K=0 → set Q=1', jk.outputValue('qLed'), 1);
jk.clockEdge();
eq('J=1 K=0 pulse ซ้ำ → คง 1', jk.outputValue('qLed'), 1);
jk.setInput('j', 0); jk.setInput('k', 1); jk.clockEdge();
eq('J=0 K=1 → reset Q=0', jk.outputValue('qLed'), 0);
jk.setInput('j', 1); jk.clockEdge();
eq('J=1 K=0 ตั้ง Q=1 ก่อนทดสอบ hold', jk.outputValue('qLed'), 1);
jk.setInput('j', 0); jk.setInput('k', 0); jk.clockEdge();
eq('J=K=0 pulse → hold คง 1', jk.outputValue('qLed'), 1);
jk.clockEdge();
eq('J=K=0 pulse ซ้ำ → ยัง hold 1', jk.outputValue('qLed'), 1);
jk.setInput('j', 1); jk.setInput('k', 1); jk.clockEdge();
eq('J=K=1 pulse 1 → toggle 0→...→1', jk.outputValue('qLed'), 0);
jk.clockEdge();
eq('J=K=1 pulse 2 → toggle กลับเป็น 1 (สลับครั้งเดียวต่อพัลส์)', jk.outputValue('qLed'), 1);

/* ---------- T Flip-Flop: T=1 toggle, T=0 hold ---------- */
var tf = buildLessonCircuit('t-ff', 0);
tf.setInput('t', 1);
tf.clockEdge(); eq('T=1 pulse 1 → Q=1', tf.outputValue('qLed'), 1);
tf.clockEdge(); eq('T=1 pulse 2 → Q=0', tf.outputValue('qLed'), 0);
tf.clockEdge(); eq('T=1 pulse 3 → Q=1 (หารความถี่ 2 พอดี)', tf.outputValue('qLed'), 1);
tf.setInput('t', 0);
tf.clockEdge(); eq('T=0 → hold Q=1', tf.outputValue('qLed'), 1);

/* ---------- SR Flip-Flop (แบบมี clock): forbidden state เป็น ? ---------- */
var srf = buildLessonCircuit('latch-sr', 1);
srf.setInput('s', 1); srf.clockEdge();
eq('SRFF S=1 R=0 pulse → Q=1', srf.outputValue('qLed'), 1);
srf.setInput('s', 0); srf.setInput('r', 1); srf.clockEdge();
eq('SRFF S=0 R=1 pulse → Q=0', srf.outputValue('qLed'), 0);
srf.setInput('s', 1); srf.setInput('r', 1); srf.clockEdge();
eq('SRFF S=R=1 pulse → Q=? (forbidden)', srf.outputValue('qLed'), '?');
srf.setInput('r', 0); srf.clockEdge();
eq('ออกจาก forbidden ด้วย S=1,R=0 → Q=1 กลับมาปกติ', srf.outputValue('qLed'), 1);

/* ---------- reset: กลับสู่สถานะเริ่มต้น ---------- */
var rr = buildLessonCircuit('t-ff', 0);
rr.setInput('t', 1); rr.clockEdge(); rr.clockEdge();
eq('ก่อน reset Q=0', rr.outputValue('qLed'), 0);
rr.clockEdge();
eq('ก่อน reset (pulse) Q=1', rr.outputValue('qLed'), 1);
rr.reset();
eq('reset() → Q กลับ 0', rr.outputValue('qLed'), 0);

/* ---------- clockEdge ต้องอธิบายเหตุการณ์เป็นไทย ---------- */
var ex = buildLessonCircuit('d-ff', 0);
ex.setInput('d', 1); ex.clockEdge();
ok('clockEdge เขียน lastEvent ภาษาไทยมีคำว่า Q',
   ex.lastEvent && /Q/.test(ex.lastEvent.text) && /[0-1]/.test(ex.lastEvent.text));

/* ---------- สรุป ---------- */
console.log('ผลทดสอบ sequential.test.js: ' + pass + ' ผ่าน, ' + fail + ' พลาด');
console.log(names.join('\n'));
process.exit(fail ? 1 : 0);
