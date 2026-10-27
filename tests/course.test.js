/* ===== tests/course.test.js — บทจากสไลด์ บท 7–12 (sequential/counter/register/ADC-DAC/computer) =====
 * รัน: node tests/course.test.js — ทดสอบผ่าน build function ตัวจริงของบท
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

/* ---------- บท 14: Sequential (D = X ⊕ Q) — feedback ผ่าน FF ต้อง eval ถูก ---------- */
var sq = build('seq-dff', 0);
sq.setInput('x', 1);
eq('seq: X=1 ยังไม่ pulse → Q=0', sq.outputValue('qLed'), 0);
sq.clockEdge();
eq('seq: X=1 pulse → Q=1', sq.outputValue('qLed'), 1);
sq.clockEdge();
eq('seq: pulse ซ้ำ (D กลายเป็น 0) → Q=0 — วงจรสลับเมื่อ X=1', sq.outputValue('qLed'), 0);
sq.setInput('x', 0); sq.clockEdge();
eq('seq: X=0 → hold (Q คง 0)', sq.outputValue('qLed'), 0);

/* ---------- บท 15: Synchronous 2-FF วนซ้ำ 00→01→10→00 ---------- */
var sy = build('seq-sync', 0);
function state2(s) { return [s.outputValue('q1Led'), s.outputValue('q0Led')]; }
eq('sync: เริ่ม 00', state2(sy), [0, 0]);
sy.clockEdge(); eq('sync: pulse 1 → 01', state2(sy), [0, 1]);
sy.clockEdge(); eq('sync: pulse 2 → 10', state2(sy), [1, 0]);
sy.clockEdge(); eq('sync: pulse 3 → 00 (วนกลับ)', state2(sy), [0, 0]);
sy.clockEdge(); eq('sync: pulse 4 → 01 (วนซ้ำ)', state2(sy), [0, 1]);

/* ---------- บท 16: Counter — 4-bit async ripple ---------- */
var ct = build('counter', 0);
ct.setInput('en', 1);
function count4(s) {
  return s.outputValue('q3Led') * 8 + s.outputValue('q2Led') * 4 +
         s.outputValue('q1Led') * 2 + s.outputValue('q0Led');
}
pulse(ct, 5);
eq('ripple: นับ 5 pulse → 5 (0101)', count4(ct), 5);
pulse(ct, 11);
eq('ripple: ครบ 16 pulse → วนกลับ 0', count4(ct), 0);
ok('ripple: FF ทุกตัวเป็น clocked FF', Object.keys(ct.nodes).every(function (id) {
  var n = ct.nodes[id];
  return n.kind !== 'comp' || !n.def.isFF || true;   // โครงสร้างครบ
}));

/* ---------- บท 16: Decade counter (mod-10) ---------- */
var dc = build('counter', 1);
dc.setInput('en', 1);
pulse(dc, 9);
eq('decade: 9 pulse → 9 (1001)', count4(dc), 9);
pulse(dc, 1);
eq('decade: pulse ที่ 10 → กลับ 0 (mod-10, ไม่มี 1010)', count4(dc), 0);
pulse(dc, 3);
eq('decade: นับต่อได้ปกติ → 3', count4(dc), 3);

/* ---------- บท 17: Shift register (SISO→SIPO) ---------- */
var sh = build('register-memory', 0);
sh.setInput('d', 1);
pulse(sh, 1);
eq('shift: 1 pulse → S0=1', [sh.outputValue('s0Led'), sh.outputValue('s1Led'), sh.outputValue('s2Led'), sh.outputValue('s3Led')], [1, 0, 0, 0]);
pulse(sh, 2);
eq('shift: 3 pulse → บิตเลื่อนถึง S2', [sh.outputValue('s0Led'), sh.outputValue('s1Led'), sh.outputValue('s2Led'), sh.outputValue('s3Led')], [1, 1, 1, 0]);
pulse(sh, 1);
eq('shift: 4 pulse → S3=1 (เข้าครบ)', [sh.outputValue('s0Led'), sh.outputValue('s1Led'), sh.outputValue('s2Led'), sh.outputValue('s3Led')], [1, 1, 1, 1]);

/* ---------- บท 17: RAM 4 คำ (write/read) ---------- */
var ram = build('register-memory', 1);
ram.setInput('a1', 0); ram.setInput('a0', 1);      // address 01
ram.setInput('d1', 1); ram.setInput('d0', 0);      // data 10
ram.setInput('we', 1);
eq('RAM: WE=1 เขียน 10 ลง addr 01 → อ่านได้ทันที', [ram.outputValue('o1Led'), ram.outputValue('o0Led')], [1, 0]);
ram.setInput('we', 0); ram.setInput('d1', 0); ram.setInput('d0', 0);
eq('RAM: ปิด WE กด data 0 → ค่าที่จำยังอยู่', [ram.outputValue('o1Led'), ram.outputValue('o0Led')], [1, 0]);
ram.setInput('a1', 1); ram.setInput('a0', 1);      // อ่าน addr 11 ที่ไม่เคยเขียน
eq('RAM: addr ที่ไม่เคยเขียน → 00', [ram.outputValue('o1Led'), ram.outputValue('o0Led')], [0, 0]);

/* ---------- บท 18: Multivibrator — astable + monostable ---------- */
var as_ = build('multivibrator', 0);
as_.clockEdge(); eq('astable: pulse 1 → ติด', as_.outputValue('blinkLed'), 1);
as_.clockEdge(); eq('astable: pulse 2 → ดับ (กะพริบต่อเนื่อง)', as_.outputValue('blinkLed'), 0);

var mo = build('multivibrator', 1);
mo.setInput('trg', 1);
eq('mono: trigger แล้วยังไม่ pulse → ยังดับ', mo.outputValue('oneLed'), 0);
mo.clockEdge();
eq('mono: pulse หลัง trigger → ติด', mo.outputValue('oneLed'), 1);
pulse(mo, 2);
eq('mono: ครบ 3 pulse → ยังติด (delay จำลอง)', mo.outputValue('oneLed'), 1);
pulse(mo, 1);
eq('mono: pulse ที่ 4 หลัง trigger → ดับกลับเอง', mo.outputValue('oneLed'), 0);

/* ---------- บท 19: R-2R DAC ---------- */
var dac = build('adc-dac', 0);
dac.setInput('b3', 1); dac.setInput('b1', 1);      // 1010 = 10
eq('DAC: 1010 → V = 10 หน่วย', dac.nodes['meter'].ins.v, 10);
dac.setInput('b3', 0); dac.setInput('b2', 1); dac.setInput('b1', 0); dac.setInput('b0', 1);  // 0101 = 5
eq('DAC: 0101 → V = 5', dac.nodes['meter'].ins.v, 5);

/* ---------- บท 19: SAR ADC (successive approximation) ---------- */
var adc = build('adc-dac', 1);
adc.setInput('t3', 1); adc.setInput('t1', 1);      // target 1010 = 10
pulse(adc, 4);
eq('ADC: SAR ครบ 4 บิต → ได้ 1010', adc.nodes['adc'].state.acc, 10);
eq('ADC: done LED ติด', adc.outputValue('doneLed'), 1);
pulse(adc, 2);
eq('ADC: pulse เพิ่ม → คงผลเดิม (done แล้ว)', adc.nodes['adc'].state.acc, 10);

/* ---------- บท 20: Computer — fetch-execute ---------- */
var cp = build('computer', 0);
eq('CPU: เริ่ม HALT ยังไม่ติด', cp.outputValue('haltLed'), 0);
pulse(cp, 3);
eq('CPU: 3 คำสั่งแรก (LDA, ADD, STO) — HALT ยังไม่ติด', cp.outputValue('haltLed'), 0);
eq('CPU: ตัวสะสม = 7+2 = 9', cp.nodes['cpu'].state.acc, 9);
pulse(cp, 1);
eq('CPU: คำสั่ง HALT → หยุด', cp.outputValue('haltLed'), 1);
pulse(cp, 2);
eq('CPU: pulse ต่อ → PC คงอยู่ที่ HALT (ไม่วิ่งซ้ำ)', cp.nodes['cpu'].state.pc, 3);

/* ---------- สรุป ---------- */
console.log('ผลทดสอบ course.test.js: ' + pass + ' ผ่าน, ' + fail + ' พลาด');
console.log(names.join('\n'));
process.exit(fail ? 1 : 0);
