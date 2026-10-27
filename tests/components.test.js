/* ===== tests/components.test.js — ทดสอบ component combinational + บทพื้นฐาน =====
 * รัน: node tests/components.test.js
 * ทดสอบ "ผ่าน build function ตัวจริงที่เว็บใช้" ไม่ใช่ re-implement
 */
'use strict';

global.window = {};
require('../js/lessons.js');
require('../js/engine/sim.js');
require('../js/circuits/basics.js');
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

/* ---------- บทเรียนครบและเรียงลำดับถูก ---------- */
var wantOrder = ['number-system', 'logic-gates', 'boolean-algebra', 'half-adder',
                 'full-adder', 'mux', 'demux', 'decoder', 'encoder'];
eq('ลำดับบทพื้นฐานตรงแผน', wantOrder.filter(function (id) {
  return DL.ORDER.indexOf(id) >= 0;
}), wantOrder);
ok('ทุกบทพื้นฐานมี html + summary',
   wantOrder.every(function (id) {
     var L = DL.LESSONS[id];
     return L && L.html && L.summary;
   }));

/* ---------- ตัวช่วย: รัน build function ของบทจริงแล้วกด input ---------- */
function runCircuit(lessonId, circuitIdx, set) {
  var spec = DL.LESSONS[lessonId].circuits[circuitIdx];
  var sim = new DL.CircuitSim();
  spec.build(sim);
  Object.keys(set).forEach(function (k) { sim.setInput(k, set[k]); });
  sim.evaluate();
  return sim;
}

/* ---------- HALF ADDER: ทั้ง 4 combo ---------- */
var haWants = { '0,0': [0, 0], '0,1': [1, 0], '1,0': [1, 0], '1,1': [0, 1] };
Object.keys(haWants).forEach(function (k) {
  var ab = k.split(',');
  var s = runCircuit('half-adder', 0, { a: +ab[0], b: +ab[1] });
  eq('HA ' + k + ' → S,C', [s.outputValue('sLed'), s.outputValue('cLed')], haWants[k]);
});

/* ---------- FULL ADDER: ทั้ง 8 combo ตรง truth table ---------- */
var faWants = {
  '0,0,0': [0, 0], '0,0,1': [1, 0], '0,1,0': [1, 0], '0,1,1': [0, 1],
  '1,0,0': [1, 0], '1,0,1': [0, 1], '1,1,0': [0, 1], '1,1,1': [1, 1]
};
Object.keys(faWants).forEach(function (k) {
  var v = k.split(',');
  var s = runCircuit('full-adder', 0, { a: +v[0], b: +v[1], cin: +v[2] });
  eq('FA ' + k + ' → S,Cout', [s.outputValue('sLed'), s.outputValue('coutLed')], faWants[k]);
});

/* ---------- MUX 4-to-1: select กำหนดว่า d ไหนผ่าน ---------- */
var muxWants = [
  { s1: 0, s0: 0, pick: 0 }, { s1: 0, s0: 1, pick: 1 },
  { s1: 1, s0: 0, pick: 2 }, { s1: 1, s0: 1, pick: 3 }
];
muxWants.forEach(function (w) {
  var s = runCircuit('mux', 0, { d0: 1, d1: 0, d2: 1, d3: 0, s1: w.s1, s0: w.s0 });
  eq('MUX เลือก d' + w.pick + ' (s=' + w.s1 + w.s0 + ') → y',
     s.outputValue('yLed'), 1 - (w.pick % 2)); // d0=d2=1, d1=d3=0
});

/* ---------- DEMUX 1-to-4: ข้อมูลไปทางออกเดียว ---------- */
var dm = runCircuit('demux', 0, { d: 1, s1: 1, s0: 0 });   // เลือก y2
eq('DEMUX d=1 เลือก y2', dm.outputValue('y2Led'), 1);
eq('DEMUX เส้นอื่น = 0 (y0)', dm.outputValue('y0Led'), 0);
eq('DEMUX เส้นอื่น = 0 (y3)', dm.outputValue('y3Led'), 0);
var dm2 = runCircuit('demux', 0, { d: 0, s1: 0, s0: 1 });  // เลือก y1, ข้อมูล 0
eq('DEMUX d=0 เลือก y1 → 0', dm2.outputValue('y1Led'), 0);

/* ---------- DECODER 2-to-4: one-hot ---------- */
var decWants = {
  '00': [1, 0, 0, 0], '01': [0, 1, 0, 0], '10': [0, 0, 1, 0], '11': [0, 0, 0, 1]
};
Object.keys(decWants).forEach(function (k) {
  var s = runCircuit('decoder', 0, { a1: +k[0], a0: +k[1] });
  eq('DEC ' + k + ' → q3q2q1q0',
     [s.outputValue('q0Led'), s.outputValue('q1Led'), s.outputValue('q2Led'), s.outputValue('q3Led')],
     decWants[k]);
});

/* ---------- ENCODER (priority, ตัวสูงสุดชนะ) ---------- */
eq('ENC 0010 → 10 (i2)', (function () {
  var s = runCircuit('encoder', 0, { i0: 0, i1: 0, i2: 1, i3: 0 });
  return [s.outputValue('y1Led'), s.outputValue('y0Led')];
})(), [1, 0]);
eq('ENC 0011 → 11 (priority i3)', (function () {
  var s = runCircuit('encoder', 0, { i0: 0, i1: 1, i2: 1, i3: 1 });
  return [s.outputValue('y1Led'), s.outputValue('y0Led')];
})(), [1, 1]);
eq('ENC 0000 → 00', (function () {
  var s = runCircuit('encoder', 0, { i0: 0, i1: 0, i2: 0, i3: 0 });
  return [s.outputValue('y1Led'), s.outputValue('y0Led')];
})(), [0, 0]);

/* ---------- SEVENSEG: BCD → ลวดลาย segment ---------- */
var segWants = {
  0: '1111110', 1: '0110000', 2: '1101101', 3: '1111001', 4: '0110011',
  5: '1011011', 6: '1011111', 7: '1110000', 8: '1111111', 9: '1111011'
};
var segNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
Object.keys(segWants).forEach(function (digit) {
  var sim = new DL.CircuitSim();
  sim.addComponent('seg', 'SEVENSEG', { x: 0, y: 0 });
  // BCD จากบิต
  var d = +digit;
  var bits = { d0: d & 1, d1: (d >> 1) & 1, d2: (d >> 2) & 1, d3: (d >> 3) & 1 };
  Object.keys(bits).forEach(function (pin) {
    var id = 'in_' + pin;
    sim.addInput(id, { x: -60, y: 0, label: pin });
    sim.wire(id, 'out', 'seg', pin);
    sim.setInput(id, bits[pin]);
  });
  sim.evaluate();
  var got = segNames.map(function (sg) { return sim.nodes['seg'].out[sg]; }).join('');
  eq('7-seg เลข ' + digit, got, segWants[digit]);
});

/* ---------- สรุป ---------- */
console.log('ผลทดสอบ components.test.js: ' + pass + ' ผ่าน, ' + fail + ' พลาด');
console.log(names.join('\n'));
process.exit(fail ? 1 : 0);
