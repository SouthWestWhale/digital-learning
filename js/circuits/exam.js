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
  /* ================= บท: Mod-N, Johnson Counter และสูตรนับ FF จากข้อสอบ (q26, q27, q38, q41, q48, q49) ================= */
  DL.registerLesson({
    id: 'exam-modn',
    group: 'exam',
    title: 'Mod-N + Johnson Counter — สูตรนับ FF จากข้อสอบ',
    subtitle: 'q26 · q27 · q38 · q41 · q48 · q49 — Johnson 4 บิต, mod-6 ด้วย async clear และ 3 สูตรที่ออกซ้ำ',
    html:
      '<h2>Johnson Counter (Twisted Ring) — โจทย์ q38</h2>' +
      '<div class="doc-card"><img src="docs/exam/q38.png" alt="โจทย์ q38" style="max-width:360px;width:100%;border-radius:6px">' +
      '<p><b>แนวคิด:</b> 4×D-FF ใช้ <b>Clock รวมสายเดียว</b> แล้วเอา <b>Q̄ ของตัวท้าย (Q̄3) ย้อนกลับไปเป็น D ของตัวแรก</b> ' +
      '(twisted feedback) ส่วน D ของตัวถัดไปรับ Q ของตัวก่อนตรงๆ — เริ่ม 0000 แล้วกด pulse จะเดิน ' +
      '<b>0000 → 1000 → 1100 → 1110 → 1111 → 0111 → 0011 → 0001 → กลับ 0000</b> วน 8 สถานะพอดี</p></div>' +
      '<div class="note">Johnson counter n ตัววนได้ <b>2n สถานะ</b> (4 ตัว = 8) — ต่างจาก ring counter ธรรมดาที่วนแค่ n สถานะ ' +
      'สังเกตลวดลาย: 1 ไล่เข้าจากทางซ้ายครบ 4 ตัว แล้ว 0 ไล่เข้าตาม จนครบ 0000 อีกครั้ง</div>' +

      '<h2>Mod-6 ด้วย Async Clear — โจทย์ q41</h2>' +
      '<div class="doc-card"><img src="docs/exam/q41.png" alt="โจทย์ q41" style="max-width:360px;width:100%;border-radius:6px">' +
      '<p><b>แนวคิด:</b> 3×T-FF (T=1 toggle ทุก pulse) นับ 0–7 ได้ 8 ค่า แต่เราต้องการวนแค่ 0–5 (mod-6) ' +
      'วิธีเดียวกับ decade counter: วาง <b>AND ตรวจจับค่า 6 (110₂ = Q2=1 พร้อม Q1=1)</b> แล้วเอาผลลัพธ์ไปเข้าขา <b>CLR</b> ' +
      'ของทุก FF — CLR เป็น <b>async</b> ล้างเป็น 0 ทันทีที่ 1 ไม่ต้องรอ clock ดังนั้นค่า 6 โผล่มาแวบเดียวแล้วถูกล้างกลับ 0 ' +
      'ผู้เรียนจึงเห็นแค่ 0,1,2,3,4,5 วนตลอด ไม่มี 6 หรือ 7</p></div>' +

      '<h2>สูตรข้อสอบ 1 — Cascade คูณกัน (q27): mod-5 × mod-5 = mod-25</h2>' +
      '<p>เอาตัวนับ mod-5 สองตัวมาต่อ cascade กัน ค่ารวมวน <b>5 × 5 = 25 สถานะ</b> ตอบ mod-25 ' +
      '(ตัวเลือกที่ตอบ 125 ผิด — 125 คือ 5³ ซึ่งต้องใช้ 3 ตัว mod-5 ต่อกัน แต่โจทย์ให้มาแค่ 2 ตัว ' +
      'ข้อสอบจับคนผิดด้วยการยัดตัวเลข 5³ มาหลอก) จำ: <b>ต่อ cascade N สตับ = คูณ mod กัน</b></p>' +

      '<h2>สูตรข้อสอบ 2 — จำนวน FF จาก 2ⁿ ≥ N (q26): mod-273 ต้องใช้ 9 ตัว</h2>' +
      '<p>ตัวนับ n บิตนับได้สูงสุด 2ⁿ ค่า ต้องการ mod-N จึงเลือก n ที่ <b>2ⁿ ≥ N</b> เล็กที่สุด ' +
      'q26 ถาม mod-273: 2⁸ = 256 &lt; 273 → ไม่พอ, 2⁹ = 512 ≥ 273 → ตอบ <b>9 ตัว</b> ' +
      '(ถ้าโจทย์เป็น mod-256 พอดีเป๊ะจะใช้ 8 ตัว แต่ 273 เกิน 256 พอดี จึงต้องขยับเป็น 9)</p>' +

      '<h2>สูตรข้อสอบ 3 — JK Excitation (q48, q49): คิดว่า FF ไหนต้อง toggle ตอนไหน</h2>' +
      '<p>J=K=1 → <b>toggle ทุกขอบ</b> (ข้อสอบชอบถามค่า J,K ที่ทำให้ FF สลับ) ถ้าจะออกแบบตัวนับ sync ที่กระโดดข้ามสถานะ ' +
      'ให้เดินสถานะทีละ pulse แล้วถามว่า <b>FF ตัวไหนต้องพลิกบ้างในแต่ละจังหวะ</b> — ตัวที่พลิกทุกจังหวะให้ J=K=1, ' +
      'ตัวที่พลิกเฉพาะบางจังหวะให้ J,K ได้จาก logic ของ Q ตัวอื่น (เช่น J1=K1=1 พลิกทุก pulse แต่ J2=K2=Q1·Q̄0 ' +
      'พลิกเฉพาะเมื่อ Q1=1 และ Q0=0) — ไอเดียนี้เรียกว่า excitation table ไม่ต้องวาดวงจรจริงก็ตอบได้จากการไล่สถานะ</p>',
    summary:
      '<ul>' +
      '<li>Johnson counter: Q̄ ตัวท้าย → D ตัวหน้า + CLK รวม = วน <b>2n สถานะ</b> (4 ตัว = 8) — q38</li>' +
      '<li>Mod-N ด้วย async clear: AND ตรวจค่า N → CLR ทุก FF ล้างทันที (q41: mod-6 = AND(Q2,Q1)→CLR)</li>' +
      '<li>Cascade: mod-A ต่อ mod-B = <b>mod (A×B)</b> — q27: 5×5 = mod-25 (ไม่ใช่ 125)</li>' +
      '<li>จำนวน FF = n เล็กสุดที่ <b>2ⁿ ≥ N</b> — q26: 273 → 2⁹=512 → 9 ตัว</li>' +
      '<li>J=K=1 = toggle; ออกแบบตัวนับ sync โดยไล่ว่า FF ไหนต้องพลิกจังหวะไหน (excitation) — q48/q49</li>' +
      '</ul>',
    circuits: [
      { title: 'โจทย์ q38: Johnson Counter 4×D-FF (Q̄3→D0) — วน 8 สถานะ',
        build: function (sim) {
          var xs = [300, 480, 660, 840];
          // ประกาศ ff0 → ff3 ตามลำดับ — ทุกตัวเป็น primary clock (CLK รวม)
          for (var i = 0; i < 4; i++) {
            sim.addComponent('ff' + i, 'DFF', { x: xs[i], y: 120 });
            sim.addOutput('q' + i + 'Led', { x: xs[i], y: 220, label: 'Q' + i });
            sim.wire('ff' + i, 'q', 'q' + i + 'Led', 'in');
          }
          // twisted feedback: Q̄3 → D0 ; ส่วน D1←Q0, D2←Q1, D3←Q2
          sim.wire('ff3', 'qn', 'ff0', 'd', [[880, 90], [920, 90], [920, 60], [260, 60], [260, 105]]);
          sim.wire('ff0', 'q', 'ff1', 'd', [[345, 120], [435, 105]]);
          sim.wire('ff1', 'q', 'ff2', 'd', [[525, 120], [615, 105]]);
          sim.wire('ff2', 'q', 'ff3', 'd', [[705, 120], [795, 105]]);
          sim.explain('Q̄3 ย้อนกลับ D0 (twist) — เริ่ม 0000 แล้วกด pulse 8 ครั้ง จะได้ 1000,1100,1110,1111,0111,0011,0001,0000 วนครบ 2n=8');
        },
        steps: ['กด Pulse Clock ทีละครั้ง — อ่าน Q3Q2Q1Q0: 0000 → 1000 (1 วิ่งเข้าตัวแรก)', 'กดต่อถึง pulse ที่ 4 — ได้ 1111 (1 ครบทั้ง 4 ตัว)', 'กดต่อถึง pulse ที่ 8 — 0 ไล่เข้าแทนจนกลับ 0000 ครบ 8 สถานะพอดี (2n)'] },
      { title: 'โจทย์ q41: Mod-6 Counter 3×T-FF + AND(Q2,Q1)→CLR — วน 0..5',
        build: function (sim) {
          sim.addInput('en', { x: 60, y: 200, label: 'T=1' });
          var xs = [270, 420, 570];
          // ประกาศ ff0 → ff2 — ff0 primary, ff1/ff2 ripple จาก Q̄ ตัวก่อน (pattern decade counter)
          for (var i = 0; i < 3; i++) {
            sim.addComponent('ff' + i, 'TFF', { x: xs[i], y: 120,
              clockFrom: i > 0 ? ('ff' + (i - 1) + ':qn') : undefined });
            sim.addOutput('q' + i + 'Led', { x: xs[i], y: 220, label: 'Q' + i });
            sim.wire('en', 'out', 'ff' + i, 't', [[130 + i * 8, 200], [130 + i * 8, 90 + i * 8]]);
            sim.wire('ff' + i, 'q', 'q' + i + 'Led', 'in');
          }
          // CLR = AND(Q2, Q1) — ตรวจจับค่า 6 (110) ตาม pattern decade counter
          sim.addGate('and1', 'AND', { x: 420, y: 320, n: 2 });
          sim.wire('ff2', 'q', 'and1', 0, [[615, 140], [660, 140], [660, 300], [390, 300], [390, 313]]);
          sim.wire('ff1', 'q', 'and1', 1, [[465, 140], [500, 140], [500, 327]]);
          for (var j = 0; j < 3; j++) {
            sim.wire('and1', 'out', 'ff' + j, 'clr', [[465, 320], [480, 320], [480, 250 - j * 22]]);
          }
          sim.explain('T=1 ทุกตัว + ripple (Q̄ ตัวก่อน → CLK ตัวถัด) → นับขึ้น — พอแตะ 6 (110) AND ยิง CLR ล้างกลับ 0 ทันที (async) จึงวน 0,1,2,3,4,5 ไม่มี 6 หรือ 7');
        },
        steps: ['เปิด T=1 แล้วกด Pulse Clock — นับ 0,1,2,3,4,5 ตามเลขฐานสอง Q2Q1Q0', 'ที่ 5 (101) กดอีกครั้ง — FF กำลังจะเป็น 110 แต่ AND(Q2,Q1) ยิง CLR ล้างกลับ 000 ทันที', 'กดต่อไปเรื่อยๆ — วน 0..5 ตลอด ไม่เห็น 6 (110) หรือ 7 (111) เลย ตรงเฉลย q41'] }
    ]
  });
})();
