/* ===== tests/sim.test.js — ทดสอบ CircuitSim engine (node, ไม่มี DOM) =====
 * รัน: node tests/sim.test.js
 */
'use strict';

global.window = {};
require('../js/engine/sim.js');
require('../js/engine/ff.js');
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

/* ---------- โครงสร้างพื้นฐาน ---------- */
var sim = new DL.CircuitSim();
ok('CircuitSim ถูก export ผ่าน DL', typeof DL.CircuitSim === 'function');
ok('มี addInput/addOutput/addGate/wire', typeof sim.addInput === 'function' &&
   typeof sim.addOutput === 'function' && typeof sim.addGate === 'function' &&
   typeof sim.wire === 'function');

/* ---------- AND gate ---------- */
var s2 = new DL.CircuitSim();
s2.addInput('a', { x: 40, y: 40, label: 'A' });
s2.addInput('b', { x: 40, y: 100, label: 'B' });
s2.addGate('g', 'AND', { x: 160, y: 70 });
s2.addOutput('led', { x: 280, y: 70, label: 'A·B' });
s2.wire('a', 'out', 'g', 0);
s2.wire('b', 'out', 'g', 1);
s2.wire('g', 'out', 'led', 'in');
s2.evaluate();
eq('AND 0·0 = 0', s2.outputValue('led'), 0);
s2.setInput('a', 1); s2.setInput('b', 1); s2.evaluate();
eq('AND 1·1 = 1', s2.outputValue('led'), 1);
s2.toggleInput('b'); s2.evaluate();
eq('toggle B แล้ว AND 1·0 = 0', s2.outputValue('led'), 0);
eq('wireValue บนสายออกของ gate', s2.wireValue('g', 'out'), 0);

/* ---------- truth ของ gate ทุกชนิด ---------- */
function gateOut(type, inputs, n) {
  var s = new DL.CircuitSim();
  s.addGate('g', type, { x: 0, y: 0, n: n || inputs.length });
  for (var i = 0; i < inputs.length; i++) {
    var id = 'i' + i;
    s.addInput(id, { x: -50, y: i * 40, label: id });
    s.wire(id, 'out', 'g', i);
  }
  s.addOutput('o', { x: 120, y: 0, label: 'o' });
  s.wire('g', 'out', 'o', 'in');
  inputs.forEach(function (v, i) { s.setInput('i' + i, v); });
  s.evaluate();
  return s.outputValue('o');
}
eq('AND 1,0', gateOut('AND', [1, 0]), 0);
eq('OR 0,1', gateOut('OR', [0, 1]), 1);
eq('OR 0,0', gateOut('OR', [0, 0]), 0);
eq('NOT 1', gateOut('NOT', [1]), 0);
eq('NOT 0', gateOut('NOT', [0]), 1);
eq('XOR 1,0', gateOut('XOR', [1, 0]), 1);
eq('XOR 1,1', gateOut('XOR', [1, 1]), 0);
eq('XOR 3-input odd parity 1,1,1', gateOut('XOR', [1, 1, 1], 3), 1);
eq('NAND 1,1', gateOut('NAND', [1, 1]), 0);
eq('NAND 1,0', gateOut('NAND', [1, 0]), 1);
eq('NOR 0,0', gateOut('NOR', [0, 0]), 1);
eq('NOR 1,0', gateOut('NOR', [1, 0]), 0);
eq('BUFFER 1', gateOut('BUFFER', [1]), 1);
eq('AND 3-input 1,1,1', gateOut('AND', [1, 1, 1], 3), 1);
eq('AND 3-input 1,0,1', gateOut('AND', [1, 0, 1], 3), 0);

/* ---------- ลำดับประกาศ node ไม่มีผล (topological eval) ---------- */
var s3 = new DL.CircuitSim();
s3.addGate('g1', 'XOR', { x: 100, y: 40 });
s3.addOutput('led', { x: 220, y: 40, label: 'led' });
s3.wire('g1', 'out', 'led', 'in');
s3.addInput('x1', { x: 0, y: 0, label: 'x1' });
s3.addInput('x2', { x: 0, y: 60, label: 'x2' });
s3.wire('x1', 'out', 'g1', 0);
s3.wire('x2', 'out', 'g1', 1);
s3.setInput('x1', 1); s3.setInput('x2', 0);
s3.evaluate();
eq('declare gate ก่อน input — XOR ยังถูกต้อง', s3.outputValue('led'), 1);

/* ---------- สายโซ่ NOT → NOT ---------- */
var s4 = new DL.CircuitSim();
s4.addInput('a', { x: 0, y: 0, label: 'A' });
s4.addGate('n1', 'NOT', { x: 60, y: 0 });
s4.addGate('n2', 'NOT', { x: 140, y: 0 });
s4.addOutput('led', { x: 240, y: 0, label: 'A' });
s4.wire('a', 'out', 'n1', 0);
s4.wire('n1', 'out', 'n2', 0);
s4.wire('n2', 'out', 'led', 'in');
s4.setInput('a', 0); s4.evaluate();
eq('NOT ซ้อน 2 ชั้น คืนค่าเดิม', s4.outputValue('led'), 0);

/* ---------- '?' กระจายผ่าน gate ---------- */
var s5 = new DL.CircuitSim();
s5.addInput('a', { x: 0, y: 0, label: 'A' });
s5.addGate('g', 'AND', { x: 80, y: 0 });
s5.addOutput('led', { x: 200, y: 0, label: 'o' });
s5.wire('a', 'out', 'g', 0);
s5.wire('g', 'out', 'led', 'in');
s5.setEval('g', function () { return '?'; });   // จำลองสถานะต้องห้าม
s5.setInput('a', 1); s5.addInput('b', { x: 0, y: 40, label: 'B' });
s5.wire('b', 'out', 'g', 1);
s5.evaluate();
eq("'?' จาก setEval วิ่งถึง LED", s5.outputValue('led'), '?');

/* ---------- custom component (registerComponent) ---------- */
DL.registerComponent('PASS2', {
  inputs: ['p', 'q'],
  outputs: ['y'],
  eval: function (v) { return { y: v.q }; }
});
var s6 = new DL.CircuitSim();
s6.addInput('a', { x: 0, y: 0, label: 'A' });
s6.addComponent('c', 'PASS2', { x: 80, y: 0 });
s6.addOutput('led', { x: 200, y: 0, label: 'o' });
s6.wire('a', 'out', 'c', 'p');
s6.wire('a', 'out', 'c', 'q');
s6.wire('c', 'y', 'led', 'in');
s6.setInput('a', 1); s6.evaluate();
eq('component custom — PASS2 ส่งค่า q ออก', s6.outputValue('led'), 1);
s6.setInput('a', 0); s6.evaluate();
eq('component custom — เปลี่ยน input แล้วอัปเดต', s6.outputValue('led'), 0);

/* ---------- guard: component ไม่รู้จัก / ลูปย้อนกลับ / pin ซ้ำ ---------- */
var s7 = new DL.CircuitSim();
var threw = false;
try { s7.addComponent('x', 'NOPE_KIND', { x: 0, y: 0 }); }
catch (e) { threw = true; }
ok('addComponent ชนิดไม่รู้จัก → throw', threw);

var s8 = new DL.CircuitSim();
s8.addGate('g1', 'NOT', { x: 0, y: 0 });
s8.addGate('g2', 'NOT', { x: 60, y: 0 });
s8.wire('g1', 'out', 'g2', 0);
s8.wire('g2', 'out', 'g1', 0);
threw = false;
try { s8.evaluate(); }
catch (e) { threw = /loop|ลูป/i.test(e.message); }
ok('combinational feedback loop → throw บอกเหตุผล', threw);

/* ---------- onChange ยิงเมื่อ input เปลี่ยน ---------- */
var s9 = new DL.CircuitSim();
s9.addInput('a', { x: 0, y: 0, label: 'A' });
var fired = 0;
s9.onChange(function () { fired++; });
s9.setInput('a', 1);
s9.setInput('a', 1);   // ค่าเดิม — ไม่ควรยิง
eq('onChange ยิงเฉพาะค่าที่เปลี่ยนจริง', fired, 1);

/* ---------- explain / lastEvent ---------- */
var s10 = new DL.CircuitSim();
s10.addInput('a', { x: 0, y: 0, label: 'A' });
s10.explain('ทดสอบข้อความไทย');
ok('explain เก็บข้อความไว้ใน lastEvent', s10.lastEvent && s10.lastEvent.text === 'ทดสอบข้อความไทย');
s10.explain('เตือน', true);
ok('explain รับ flag warn', s10.lastEvent && s10.lastEvent.warn === true);

/* ---------- guard: clockFrom ต้องชี้ FF ต้นทางที่ประกาศ "ก่อน" ตัวเอง ---------- */
var s11 = new DL.CircuitSim();
s11.addComponent('bFF', 'DFF', { x: 0, y: 0, clockFrom: 'aFF' });
s11.addComponent('aFF', 'DFF', { x: 0, y: 0 });
threw = false;
try { s11.clockEdge(); }
catch (e) { threw = /ลำดับ|order|ก่อน/.test(e.message); }
ok('clockFrom ชี้ FF ที่ประกาศทีหลังตัวเอง → throw บอกลำดับ', threw);

/* ---------- guard: ทิศทางสาย wire ต้องถูกต้อง (ออกจาก output → เข้า input) ---------- */
var s12 = new DL.CircuitSim();
s12.addInput('ia', { x: 0, y: 0, label: 'A' });
s12.addInput('ib', { x: 0, y: 40, label: 'B' });
threw = false;
try { s12.wire('ia', 'out', 'ib', 'out'); }
catch (e) { threw = true; }
ok('wire จาก output ยิงเข้า node ที่ไม่มี input pin → throw', threw);

var s13 = new DL.CircuitSim();
s13.addInput('ia', { x: 0, y: 0, label: 'A' });
s13.addGate('g', 'AND', { x: 60, y: 0 });
threw = false;
try { s13.wire('g', 'out', 'ia', 'zz'); }
catch (e) { threw = true; }
ok('wire เข้า pin ชื่อผิดของ input node → throw', threw);

var s14 = new DL.CircuitSim();
s14.addInput('ia', { x: 0, y: 0, label: 'A' });
s14.addComponent('c', 'PASS2', { x: 0, y: 0 });
threw = false;
try { s14.wire('c', 'y', 'ia', 'in'); }
catch (e) { threw = true; }
ok('wire จาก node ปลายทาง (output/LED) กลับออก → throw', threw);

var s15 = new DL.CircuitSim();
s15.addInput('ia', { x: 0, y: 0, label: 'A' });
s15.addComponent('c', 'PASS2', { x: 0, y: 0 });
s15.addOutput('o', { x: 0, y: 0, label: 'o' });
threw = false;
try {
  s15.wire('ia', 'out', 'c', 'p');
  s15.wire('ia', 'out', 'c', 'q');
  s15.wire('c', 'y', 'o', 'in');
  s15.setInput('ia', 1);
} catch (e) { threw = true; }
ok('wire ทิศถูกต้อง (input→comp→LED) ยังใช้ได้ปกติ', !threw && s15.outputValue('o') === 1);

/* ---------- สรุป ---------- */
console.log('ผลทดสอบ sim.test.js: ' + pass + ' ผ่าน, ' + fail + ' พลาด');
console.log(names.join('\n'));
process.exit(fail ? 1 : 0);
