/* ===== tests/studentid.test.js — บท Lab: จอเลื่อนรหัสนักศึกษา =====
 * รัน: node tests/studentid.test.js — ทดสอบลอจิก lookup + วงจรจริงในบท
 * อ้างอิงผลจำลองไฟล์ Logisim 68010659.circ (นับขึ้น: 6801→8010→0106→1065→
 * 0659→6596→5968→9680 วนวงกลม · นับลง: 0→9680→5968→…)
 */
'use strict';

global.window = {};
require('../js/lessons.js');
require('../js/engine/sim.js');
require('../js/engine/ff.js');
require('../js/circuits/basics.js');
require('../js/circuits/flipflops.js');
require('../js/circuits/course.js');
require('../js/circuits/studentid.js');
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
  sim.evaluate();   // ตามสัญญาของ engine: build แล้วต้อง evaluate รอบแรก (CircuitPanel ทำเช่นนี้)
  return sim;
}
function pulse(sim, n) { for (var i = 0; i < n; i++) sim.clockEdge(); }

/* ---------- helpers ล้วน (ไม่พึ่ง DOM) ---------- */
var SID = DL.STUDENTID;
var ID = [6, 8, 0, 1, 0, 6, 5, 9];   // 68010659

eq('windowAt: v=0 → 6801', SID.windowAt(ID, 0), [6, 8, 0, 1]);
eq('windowAt: v=3 → 1065', SID.windowAt(ID, 3), [1, 0, 6, 5]);
eq('windowAt: v=5 → วนกลับ 6596', SID.windowAt(ID, 5), [6, 5, 9, 6]);
eq('windowAt: v=7 → วนกลับ 9680', SID.windowAt(ID, 7), [9, 6, 8, 0]);
eq('windowAt: v=8 → วนรอบใหม่ = v=0', SID.windowAt(ID, 8), [6, 8, 0, 1]);
eq('parseID: ตัวเลขปกติ', SID.parseID('68010659'), ID);
eq('parseID: ตัดวรรคออกได้', SID.parseID(' 6801 0659 '), ID);
eq('parseID: ตัวอักษร → null', SID.parseID('68o1o659'), null);
eq('parseID: สั้นเกิน → null', SID.parseID('123'), null);
eq('parseID: ยาวเกิน → null', SID.parseID('123456789'), null);

/* ---------- วงจรแผง 1 (faithful 68010659): นับขึ้นครบ 8 สถานะ ---------- */
function windows(sim) {
  return [0, 1, 2, 3].map(function (i) {
    return sim.nodes['seg' + i].out._digit;
  });
}
function vOf(sim) { return SID.currentV(sim); }

var up = build('student-id', 0);
eq('วงจร: เริ่ม v=0', vOf(up), 0);
eq('วงจร: จอเริ่ม 6801', windows(up), [6, 8, 0, 1]);
pulse(up, 1); eq('นับขึ้น 1 pulse → v=1 จอ 8010', windows(up), [8, 0, 1, 0]);
pulse(up, 2); eq('นับขึ้นรวม 3 pulse → v=3 จอ 1065', windows(up), [1, 0, 6, 5]);
pulse(up, 5); eq('ครบ 8 pulse → v=0 วนกลับ 6801', [vOf(up), windows(up)], [0, [6, 8, 0, 1]]);
pulse(up, 7); eq('อีก 7 pulse → v=7 จอ 9680', windows(up), [9, 6, 8, 0]);
pulse(up, 1); eq('วนกลับหา v=0 ได้ (วงจรวนรอบไม่หลุด)', vOf(up), 0);

/* ---------- ทิศทาง: Y=1 นับลง (ตรงจำลอง Logisim) ---------- */
up.setInput('y', 1);
pulse(up, 1);
eq('Y=1 pulse → v=7 (นับลง 0→7)', vOf(up), 7);
eq('จอตอน v=7 → 9680', windows(up), [9, 6, 8, 0]);
pulse(up, 3);
eq('Y=1 อีก 3 pulse → v=4 (7→6→5→4)', vOf(up), 4);
up.setInput('y', 0);
pulse(up, 1);
eq('สลับ Y=0 กลับมานับขึ้น → v=5', vOf(up), 5);

/* ---------- บทพิสูจน์สมการ T: ลำดับ T-FF ตรง counter1 จาก Logisim ---------- */
var up2 = build('student-id', 0);
var seq = [vOf(up2)];
for (var i = 0; i < 16; i++) { up2.clockEdge(); seq.push(vOf(up2)); }
eq('นับ 16 pulse วน 0..7 ซ้ำ 2 รอบ', seq.join(','), '0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0');

/* ---------- แผง 2 (playground): เปลี่ยนรหัสได้ ---------- */
var pg = build('student-id', 1);
eq('playground: เริ่มด้วยรหัสดีฟอลต์ 68010659', windows(pg), [6, 8, 0, 1]);

ok('applyID: ใส่รหัสใหม่ได้', SID.applyID(pg, '12345678') === true);
pg.evaluate();
pulse(pg, 1);
eq('รหัสใหม่: pulse 1 → จอ 2345', windows(pg), [2, 3, 4, 5]);
pulse(pg, 6);
eq('รหัสใหม่: pulse 7 → v=7 จอ 8123 (วนกลับรหัส)', windows(pg), [8, 1, 2, 3]);

ok('applyID: เลขผิด (มีตัวอักษร) ถูกปฏิเสธ', SID.applyID(pg, '12ab5678') === false);
eq('หลังปฏิเสธ จอคงค่าเดิม', windows(pg), [8, 1, 2, 3]);
ok('applyID: ยาวไม่ครบ 8 ถูกปฏิเสธ', SID.applyID(pg, '123') === false);

/* ---------- โหมดวิ่งไป-กลับ (bounce): กดสวิตช์ทิศที่ v ชนขอบ ---------- */
var bb = build('student-id', 1);
SID.setBounce(bb, true);            // เปิดโหมด — เปลี่ยนทิศอัตโนมัติที่ขอบ 0/7
pulse(bb, 7);
eq('bounce: 7 pulse → v=7 แล้วสลับเป็นถอยหลังเอง', [vOf(bb), bb.nodes['y'].value], [7, 1]);
pulse(bb, 7);
eq('bounce: ถอยหลัง 7 pulse → กลับ v=0 แล้วสลับเป็นเดินหน้าเอง', [vOf(bb), bb.nodes['y'].value], [0, 0]);
pulse(bb, 1);
eq('bounce: เดินหน้าต่อได้ปกติ', vOf(bb), 1);
SID.setBounce(bb, false);
ok('ปิด bounce แล้วจอแสดงปกติ', Array.isArray(windows(bb)) && windows(bb).length === 4);

/* ---------- โครงสร้างบทเรียน: ลงทะเบียน/กลุ่ม/เนื้อหาครบ ---------- */
var L = DL.LESSONS['student-id'];
ok('บท student-id ลงทะเบียนแล้ว', !!L);
ok('อยู่กลุ่ม lab', L && L.group === 'lab');
ok('มีบทเรียน 2 แผง', L && L.circuits && L.circuits.length === 2);
ok('มีเนื้อหา html อธิบายหลักการ', L && typeof L.html === 'string' && L.html.length > 200);
ok('มีสรุปท้ายบท', L && typeof L.summary === 'string' && L.summary.length > 50);
ok('กลุ่ม lab มีอยู่ใน DL.GROUPS', DL.GROUPS.some(function (g) { return g.id === 'lab'; }));

/* ---------- สรุป ---------- */
console.log('tests/studentid.test.js');
console.log(names.join('\n'));
console.log('ผ่าน ' + pass + ' | พลาด ' + fail);
process.exit(fail ? 1 : 0);
