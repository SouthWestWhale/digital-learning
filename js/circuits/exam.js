/* ===== Digital Learning — กลุ่ม F: บทเรียนจากข้อสอบจริง =====
 * แต่ละบทสร้างวงจร "ตรงตามโจทย์ข้อสอบ" (docs/exam/qNN.png) แล้วให้ผู้เรียนกดจับจริง
 * เริ่มที่บท exam-ripple (q01 ripple counter, q10 async, q14 ทิศทางนับ, q15 down counter)
 * บทถัดไป (exam-7476, exam-modn, …) จะ append ต่อท้ายไฟล์นี้ด้วย registerLesson เพิ่ม
 * ทดสอบใน tests/exam.test.js
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  /* ================= บท: Ripple Counter จากข้อสอบ (q01, q10, q14, q15) ================= */
  DL.registerLesson({
    id: 'exam-ripple',
    group: 'exam',
    title: 'Ripple Counter จากข้อสอบ — กดจับวงจรจริง',
    subtitle: 'ข้อสอบ q01 · q10 · q14 · q15 — สร้างวงจรตามรูปโจทย์แล้วกด Pulse Clock เอง',
    html:
      '<h2>ตัวนับแบบ Ripple (Asynchronous Counter)</h2>' +
      '<p>วงจรตัวนับที่ FF แต่ละตัว "ได้ clock จากขาออกของตัวก่อนหน้า" (ไม่ใช่จากสาย clock กลาง) ' +
      'เรียกว่า <b>ripple counter</b> — ข้อสอบ q10 ถามชื่อของมัน คำตอบคือ <b>asynchronous counter</b> ' +
      'เพราะ FF ไม่ได้ยิงพร้อมกัน สัญญาณไหลทีละตัวเหมือนน้ำซึม (ripple)</p>' +

      '<h2>โจทย์ q01 — Ripple Counter 2 ขั้นจาก JK-FF</h2>' +
      '<div class="doc-card"><img src="docs/exam/q01.png" alt="โจทย์ q01" style="max-width:320px;width:100%;border-radius:6px">' +
      '<p><b>แนวคิด:</b> JK-FF ต่อ J=K=1 จะเป็นโหมด toggle (สลับทุกขอบขึ้น) ตัวที่สองเอา Q̄ ของตัวแรกไปเป็น clock ' +
      '→ ได้ตัวนับ 2 บิต วน <b>00 → 01 → 10 → 11 → 00…</b> (mod-4) ลองในวงจรที่ 1 เลย</p></div>' +
      '<div class="note">ทำไมต่อด้วย Q̄? FF ของเราเป็นขอบขั้น (ขอบขึ้น) ตัวถัดไปต้องยิงตอน Q ของตัวก่อน "ลด" (1→0) ' +
      'ซึ่งเป็นจังหวะที่ Q̄ "ขึ้น" พอดี — เหมือนบท Counter จากสไลด์</div>' +

      '<h2>โจทย์ q14 — 3×D-FF ต่อ Q̄ กลับเข้า D</h2>' +
      '<div class="doc-card"><img src="docs/exam/q14.png" alt="โจทย์ q14" style="max-width:320px;width:100%;border-radius:6px">' +
      '<p><b>แนวคิด:</b> D-FF ที่ต่อ <b>Q̄ → D</b> ของตัวเอง = toggle ทุกขอบขึ้น (Q(next) = Q̄ ทุก pulse) ' +
      'แล้วเอา Q̄ ของแต่ละตัวไปขับ clock ตัวถัดไป → ตัวนับ 3 บิต นับขึ้น 000 → 001 → … → 111 แล้ววนกลับ</p></div>' +

      '<h2>โจทย์ q15 — ถ้าต่อด้วย Q ตรงๆ จะนับลง</h2>' +
      '<p>q15 เป็น 3×JK-FF ที่ต่อ clock จาก <b>Q ของตัวก่อน (ไม่ใช่ Q̄)</b> เริ่ม 000 แล้วไล่สถานะ: ' +
      '<b>000 → 111 → 110 → 101 → …</b> นับ "ลง"! เพราะตัวถัดไปยิงตอน Q ของตัวก่อน "ขึ้น" (0→1) ' +
      '— ซึ่งเท่ากับจังหวะที่เลขรวมลดลง สรุป: <b>ต่อ Q̄ = นับขึ้น, ต่อ Q = นับลง</b> (กับ FF ขอบขึ้น)</p>',
    summary:
      '<ul>' +
      '<li>Ripple counter = FF ต่อ clock จากขาออกตัวก่อน ชื่อเต็ม <b>asynchronous counter</b> (q10)</li>' +
      '<li>JK-FF ต่อ J=K=1 → toggle — โยง Q̄ ไป clock ตัวถัด = นับขึ้น (q01)</li>' +
      '<li>D-FF ต่อ Q̄→D ตัวเอง = toggle เหมือนกัน (q14)</li>' +
      '<li>ต่อ clock ด้วย Q ตรงๆ (FF ขอบขึ้น) = ตัวนับลง: 000→111,110,101 (q15)</li>' +
      '</ul>',
    circuits: [
      { title: 'โจทย์ q01: Ripple Counter 2×JK-FF (J=K=1) — วน 00→01→10→11',
        build: function (sim) {
          sim.addInput('jk', { x: 60, y: 150, label: 'J=K (ปล่อย 1 ไว้)' });
          // ประกาศ FF ต้นทางก่อนเสมอ (ff0 → ff1) — engine ตรวจลำดับนี้
          sim.addComponent('ff0', 'JKFF', { x: 300, y: 110 });
          sim.addComponent('ff1', 'JKFF', { x: 480, y: 110, clockFrom: 'ff0:qn' });
          sim.addOutput('q0Led', { x: 300, y: 210, label: 'Q0' });
          sim.addOutput('q1Led', { x: 480, y: 210, label: 'Q1' });
          sim.wire('jk', 'out', 'ff0', 'j', [[170, 150], [170, 92]]);
          sim.wire('jk', 'out', 'ff0', 'k', [[200, 150], [200, 110]]);
          sim.wire('jk', 'out', 'ff1', 'j', [[230, 150], [230, 92]]);
          sim.wire('jk', 'out', 'ff1', 'k', [[260, 150], [260, 110]]);
          sim.wire('ff0', 'q', 'q0Led', 'in');
          sim.wire('ff1', 'q', 'q1Led', 'in');
          sim.explain('J=K=1 ทุกตัว → toggle ทุก pulse — ff1 ยิงเมื่อ Q̄0 ขึ้น (คือตอน Q0 ลด)');
        },
        steps: ['ตั้ง J=K=1 (ปล่อยไว้ตลอด) แล้วกด Pulse Clock 1 ครั้ง — Q0 ติด (01)', 'กดอีก 1 ครั้ง — Q0 ดับ Q1 ติด (10) สังเกต ff1 สลับตอน Q0 "ลด" เท่านั้น', 'กดต่อจนครบ 4 ครั้ง — วนกลับ 00 ครบ mod-4 ตรงตามเฉลย q01'] },
      { title: 'โจทย์ q14: Ripple 3×D-FF (Q̄→D ตัวเอง) — นับขึ้น 000→111',
        build: function (sim) {
          var xs = [280, 460, 640];
          var leds = ['aLed', 'bLed', 'cLed'];
          // ประกาศ ff0 → ff1 → ff2 ตามลำดับ (ripple ไหลตามลำดับประกาศ)
          for (var i = 0; i < 3; i++) {
            sim.addComponent('ff' + i, 'DFF', { x: xs[i], y: 110,
              clockFrom: i > 0 ? ('ff' + (i - 1) + ':qn') : undefined });
            sim.addOutput(leds[i], { x: xs[i], y: 210, label: String.fromCharCode(65 + i) });
            // Q̄ ย้อนกลับเข้า D ของตัวเอง → toggle ทุกขอบขึ้น
            sim.wire('ff' + i, 'qn', 'ff' + i, 'd', [[xs[i] + 45, 80], [xs[i] + 45, 65], [xs[i] - 45, 65], [xs[i] - 45, 92]]);
            sim.wire('ff' + i, 'q', leds[i], 'in');
          }
          sim.explain('D-FF ต่อ Q̄→D = toggle ทุก pulse — QA หารความถี่ 2, QB หาร 4, QC หาร 8 (เทียบ q01 ที่ใช้ JK แทน)');
        },
        steps: ['กด Pulse Clock ทีละครั้ง — อ่าน QC QB QA เป็นเลขฐานสอง: 000→001→010→011→100', 'กดครบ 7 ครั้ง — ถึง 111 (QC QB QA ติดหมด)', 'กดอีก 1 ครั้ง — วนกลับ 000 ครบ mod-8 ตรงตามเฉลย q14'] }
    ]
  });
  /* ================= บท: วงจร 7476 — Shift Register SIPO จากข้อสอบ (q06, q16, q42) ================= */
  DL.registerLesson({
    id: 'exam-7476',
    group: 'exam',
    title: 'วงจร 7476 จากข้อสอบ — Shift Register แบบ SIPO',
    subtitle: 'โจทย์เดียวกันออกซ้ำ 3 ครั้ง (q06 · q16 · q42) — ตอบ "register แบบ Serial in, Parallel out"',
    html:
      '<h2>วงจร 7476 ที่ออกสอบซ้ำ 3 ครั้ง</h2>' +
      '<p>โจทย์ชุดนี้ให้ดูวงจร <b>4×JK-FF (ชิป 7476)</b> เรียงต่อกัน ทุกตัวใช้ <b>Clock รวมสายเดียว</b> ' +
      'และมี Clear รวม — ข้อมูลเข้าทาง J ของตัวแรก แล้วไหลต่อไปทีละตัว: Q ของ ff0 ไปเป็น J ของ ff1 ' +
      'Q ของ ff1 ไปเป็น J ของ ff2 ไล่ตามลำดับ ส่วน K ของแต่ละตัวได้สัญญาณ "กลับค่า" ของ J ผ่าน <b>7404 (NOT)</b> ' +
      'ตามรูปในข้อสอบ — J=ข้อมูล, K=ข้อมูลกลับ จึงทำงานเหมือน <b>D-FF</b> (Q ถัดไป = D)</p>' +

      '<h2>โจทย์ q06 — วงจรนี้คือ register แบบอะไร?</h2>' +
      '<div class="doc-card"><img src="docs/exam/q06.png" alt="โจทย์ q06 — วงจร 7476 4 ตัว" style="max-width:380px;width:100%;border-radius:6px">' +
      '<p><b>เฉลย:</b> register แบบ <b>Serial in, Parallel out (SIPO)</b> — ข้อมูลเข้า "ทีละบิต" ทางเดียว ' +
      '(serial in ที่ J ของตัวแรก) แต่อ่านผลได้ "พร้อมกัน 4 บิต" ที่ Q0-Q3 (parallel out) ' +
      '<b>โจทย์เดียวกันนี้ออกซ้ำ 3 ครั้ง (q06, q16, q42)</b> จำเฉลยเดียวพอ!</p></div>' +

      '<h2>ทำไมไม่ใช่ counter?</h2>' +
      '<div class="note">ใน counter แต่ละ FF จะ "toggle" หรือได้ clock จากตัวก่อนหน้า — ค่ารวมเปลี่ยนไปตามลำดับการนับ ' +
      'แต่วงจรนี้ <b>แต่ละขั้นแค่ "ลอก" Q ของขั้นก่อนหน้ามาไว้ที่ตัวเองตอนขอบ clock</b> (J=data, K=datā → Q(next)=D) ' +
      'ไม่มีสายย้อนกลับ (feedback) ไปที่ขั้นก่อนหน้าเลย จึงไม่มีอะไร "นับ" — มันแค่ "เลื่อนข้อมูล" (shift) ทีละบิต</div>' +
      '<p>ลองเลื่อนบิตตามข้อสอบ: ป้อน <b>1, 0, 1, 1</b> (เรียงตามเวลา) ครบ 4 pulse แล้วอ่าน Q0-Q3 พร้อมกัน — ' +
      'บิตที่ป้อน "ก่อน" สุดจะไหลไปสุดปลาย (Q3) บิตที่ป้อน "หลัง" สุดอยู่ที่ Q0</p>',

    summary:
      '<ul>' +
      '<li>JK-FF ต่อแบบ <b>J = ข้อมูล, K = ข้อมูลกลับ (ผ่าน NOT/7404)</b> → ทำงานเหมือน D-FF: Q ถัดไปตาม J เสมอ</li>' +
      '<li>4×FF ต่อ Q→J ตัวถัดไป + Clock รวม = <b>Shift Register</b> — ข้อมูลเลื่อนขวาทีละบิตทุก pulse</li>' +
      '<li>เข้าทีละบิต (serial in) อ่านพร้อมกันที่ Q0-Q3 (parallel out) = <b>SIPO</b> — เฉลยของ q06, q16, q42 (โจทย์ซ้ำ 3 ครั้ง)</li>' +
      '<li>ไม่ใช่ counter เพราะแต่ละขั้นแค่ลอกค่าขั้นก่อนหน้า ไม่มี feedback กลับ — ไม่มีการนับ</li>' +
      '</ul>',

    circuits: [
      { title: 'โจทย์ q06: Shift Register 4×JK-FF (7476) — Serial in, Parallel out',
        build: function (sim) {
          sim.addInput('din', { x: 60, y: 150, label: 'Din (ข้อมูลเข้า)' });
          var xs = [300, 480, 660, 840];
          var ledIds = ['q0Led', 'q1Led', 'q2Led', 'q3Led'];
          var src = { id: 'din', pin: 'out' };   // ต้นทางของขั้นแรก = din
          for (var i = 0; i < 4; i++) {
            // ทุกตัวเป็น primary clock (ไม่มี clockFrom) — Pulse Clock หนึ่งครั้งขับทั้ง 4 ตัวพร้อมกัน
            sim.addComponent('ff' + i, 'JKFF', { x: xs[i], y: 110 });
            sim.addGate('not' + i, 'NOT', { x: xs[i], y: 195 });
            sim.addOutput(ledIds[i], { x: xs[i], y: 260, label: 'Q' + i });
            // J = ข้อมูลจากขั้นก่อน (ตรง), K = ข้อมูลกลับผ่าน NOT (ตาม 7404 ในรูปข้อสอบ) → พฤติกรรมเหมือน D-FF
            sim.wire(src.id, src.pin, 'ff' + i, 'j', [[(xs[i] - 80), 150], [(xs[i] - 80), 92]]);
            sim.wire(src.id, src.pin, 'not' + i, 0, [[(xs[i] - 110), 150], [(xs[i] - 110), 195]]);
            sim.wire('not' + i, 'out', 'ff' + i, 'k', [[(xs[i] - 55), 195], [(xs[i] - 55), 128]]);
            sim.wire('ff' + i, 'q', ledIds[i], 'in');
            src = { id: 'ff' + i, pin: 'q' };    // ขั้นถัดไปลอกจาก Q ของขั้นนี้
          }
          sim.explain('ทุก FF ได้ CLK จากสายกลาง (primary) — ป้อนบิตที่ Din แล้วกด Pulse Clock ข้อมูลจะเลื่อนไปทีละขั้น อ่านพร้อมกันที่ Q0-Q3 = SIPO');
        },
        steps: ['ตั้ง Din=1 แล้วกด Pulse Clock 1 ครั้ง — Q0 ติด ที่เหลือดับ (บิตแรกเข้ามาแล้ว)', 'ตั้ง Din=0 กดอีกครั้ง — บิตแรกไหลไป Q1, Q0 ดับ (เลื่อนขวาทีละขั้น)', 'ป้อนบิตต่อ 1 แล้ว 1 (ครบลำดับ 1,0,1,1 ตามข้อสอบ) — กดครบ 4 pulse', 'อ่าน Q0-Q3 "พร้อมกัน": Q3=1, Q2=0, Q1=1, Q0=1 — บิตป้อนก่อนไหลไปสุด Q3 = SIPO ตรงเฉลย q06/q16/q42'] }
    ]
  });
})();
