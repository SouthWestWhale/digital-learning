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
      'อ่านค่าเป็น <b>Q3Q2Q1Q0</b> จะได้ <b>0000 → 0001 → 0011 → 0111 → 1111 → 1110 → 1100 → 1000 → กลับ 0000</b> วน 8 สถานะพอดี</p></div>' +
      '<div class="note">Johnson counter n ตัววนได้ <b>2n สถานะ</b> (4 ตัว = 8) — ต่างจาก ring counter ธรรมดาที่วนแค่ n สถานะ ' +
      'สังเกตลวดลาย: 1 ไล่เข้าจาก Q0 ไป Q3 ครบ 4 ตัว แล้ว 0 ไล่เข้าตาม จนครบ 0000 อีกครั้ง</div>' +

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
          sim.explain('Q̄3 ย้อนกลับ D0 (twist) — เริ่ม 0000 แล้วกด pulse 8 ครั้ง อ่าน Q3Q2Q1Q0 จะได้ 0001,0011,0111,1111,1110,1100,1000,0000 วนครบ 2n=8');
        },
        steps: ['กด Pulse Clock ทีละครั้ง — อ่าน Q3Q2Q1Q0: 0000 → 0001 (1 วิ่งเข้าที่ Q0 ก่อน เพราะ D0 รับ Q̄3=1)', 'กดต่อถึง pulse ที่ 4 — 1 ไล่เข้าจาก Q0 ไป Q3 จนได้ 1111 (ครบทั้ง 4 ตัว)', 'กดต่อถึง pulse ที่ 8 — 0 ไล่เข้าแทนจนกลับ 0000 ครบ 8 สถานะพอดี (2n)'] },
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
  /* ================= Component: SR_LATCH_NAND — active-low SR latch (ข้อสอบ q22) =================
   * ขา s,r แทน S̄,R̄ (active-low — กด 0 เพื่อ set/reset)
   * s=0,r=1 → set ; s=1,r=0 → reset ; s=1,r=1 → hold ; s=0,r=0 → เสียสมมาตร (Q=Q̄=1 โชว์ให้เห็น)
   * transparent เหมือน SR_LATCH (NOR) — ไม่ isFF เปลี่ยนทันทีตามอินพุต
   */
  DL.registerComponent('SR_LATCH_NAND', {
    inputs: ['s', 'r'],
    outputs: ['q', 'qn'],
    w: 130, h: 64,
    pinLabels: { s: 'S̄', r: 'R̄', q: 'Q', qn: 'Q̄' },
    evalNode: function (node, v) {
      var q;
      if (!v.s && v.r) q = 1;                          // set (active-low)
      else if (v.s && !v.r) q = 0;                     // reset
      else if (v.s && v.r) q = node.state.q;           // hold — S̄=R̄=1 คือปกติ ไม่ใช่ forbidden!
      else q = 1;                                      // S̄=R̄=0 → เสียสมมาตร Q=Q̄=1
      node.state.q = q;
      node.state.qn = (!v.s && !v.r) ? 1 : (q ? 0 : 1);
      return { q: node.state.q, qn: node.state.qn };
    },
    initNode: function (node) { node.state = { q: 0, qn: 1 }; },
    shape: DL.FFShape('SR Latch (NAND)'),
    update: DL.FFUpdate
  });

  /* ================= บท: SR Latch มุมข้อสอบ — NAND vs NOR (q04, q22, q28) ================= */
  DL.registerLesson({
    id: 'exam-srlatch',
    group: 'exam',
    title: 'SR Latch มุมข้อสอบ — NAND vs NOR',
    subtitle: 'q04 · q22 · q28 — ตัวล็อกแบบ active-high (NOR) กับ active-low (NAND) ต่างกันตรงไหน พร้อมจุดหลอกของข้อสอบ',
    html:
      '<h2>SR Latch 2 แบบที่ข้อสอบชอบออก</h2>' +
      '<p>SR latch เป็นวงจรจำ 1 บิตที่ง่ายที่สุด แต่ข้อสอบหลอกเราด้วยการสลับ "ตารางค่าความจริง" ระหว่าง 2 แบบ: ' +
      '<b>แบบ NOR</b> ใช้ S,R <b>active-high</b> (กด 1 เพื่อ set/reset) ส่วน <b>แบบ NAND</b> ใช้ S̄,R̄ <b>active-low</b> ' +
      '(กด 0 เพื่อ set/reset) — ขาที่ชื่อมีขีดล่างพร้อม ๆ กันแปลว่า "ลอจิกต่ำ" คือสัญญาณทำงาน</p>' +

      '<h2>โจทย์ q04 — SR Latch แบบ NOR (active-high)</h2>' +
      '<div class="doc-card"><img src="docs/exam/q04.png" alt="โจทย์ q04" style="max-width:320px;width:100%;border-radius:6px">' +
      '<p><b>แนวคิด:</b> NOR latch: <b>S=1, R=0 → set Q=1</b> (S "สั่งติด"), R=1 → reset, S=R=0 → hold, ' +
      'และ <b>S=R=1 คือสถานะต้องห้าม</b> — Q กับ Q̄ พังไม่เป็นคู่กัน (แสดง ? ในวงจรข้างบน) ลองกด S=1 ดู</p></div>' +

      '<h2>โจทย์ q22 — SR Latch แบบ NAND (active-low) — จุดหลอกของข้อสอบ!</h2>' +
      '<div class="doc-card"><img src="docs/exam/q22.png" alt="โจทย์ q22" style="max-width:320px;width:100%;border-radius:6px">' +
      '<p><b>กับดัก:</b> ข้อสอบถามค่าเมื่อ <b>S̄=R̄=1 (ทั้งคู่ HIGH)</b> คนที่จำตาราง NOR มัวสนีจะตอบ "สถานะต้องห้าม/indeterminate" ' +
      '— <b>ผิด!</b> ใน NAND latch S̄=R̄=1 คือสภาวะ <b>ปกติของวงจร = hold</b> (คงค่าเดิมไว้) ' +
      'เพราะเป็น active-low: ขาทั้งคู่เฉย ๆ สูงไว้ วงจรจึงล็อกค่าเดิม ต้อง "กดต่ำ" ถึงจะสั่งงาน</p>' +
      '<div class="note">สังเกตในวงจรที่ 2: เริ่มมา Q=0 แล้วกด S̄ เป็น 0 → Q ติดทันที — <b>ยิ่งกดต่ำยิ่งทำงาน</b> ' +
      'ส่วน S̄=R̄=0 พร้อมกันคือสภาวะเสียสมมาตร Q=Q̄=1 ทั้งคู่ (ลองกดดู)</div>' +

      '<h2>ตารางเทียบ — จำให้แม่นก่อนสอบ</h2>' +
      '<table border="1" cellpadding="6" style="border-collapse:collapse">' +
      '<tr><th>วงจร</th><th>ชนิด</th><th>สั่ง set</th><th>สั่ง reset</th><th>เฉย ๆ (idle)</th><th>สถานะเสีย</th></tr>' +
      '<tr><td>NOR latch</td><td>active-high</td><td>S=1</td><td>R=1</td><td>S=R=0 → hold</td><td>S=R=1 → ⚠ Q=?</td></tr>' +
      '<tr><td>NAND latch</td><td>active-low</td><td>S̄=0</td><td>R̄=0</td><td>S̄=R̄=1 → hold</td><td>S̄=R̄=0 → เสียสมมาตร Q=Q̄=1</td></tr>' +
      '</table>' +
      '<p>สรุปสั้น ๆ: <b>NOR ห้ามที่ "1 คู่"</b> (S=R=1 → ?) แต่ <b>NAND hold ที่ "1 คู่"</b> (S̄=R̄=1) แล้วไปเสียที่ "0 คู่" แทน</p>',

    summary:
      '<ul>' +
      '<li>NOR latch (q04): S=1 → set, R=1 → reset, S=R=0 → hold, <b>S=R=1 → ⚠ forbidden Q=?</b></li>' +
      '<li>NAND latch (q22): active-low — S̄=0 → set, R̄=0 → reset, <b>S̄=R̄=1 → hold (ไม่ใช่ invalid!)</b>, S̄=R̄=0 → เสียสมมาตร Q=Q̄=1</li>' +
      '<li>สมการ characteristic (q28): NOR: <b>Q₊ = S + R̄Q</b> — NAND (active-low): <b>Q₊ = S̄ + RQ̄</b> (จำตามรูปที่ข้อสอบให้ตัวเลือกมา)</li>' +
      '<li>เคล็ดลับ: เห็นขีดบน S̄,R̄ = คิด active-low ทันที ตาราง NOR นำมาใช้ตรง ๆ ไม่ได้</li>' +
      '</ul>',

    circuits: [
      { title: 'โจทย์ q04: SR Latch แบบ NOR (active-high) — S=1 set, R=1 reset, S=R=1 → ?',
        build: function (sim) {
          sim.addInput('s', { x: 60, y: 110, label: 'S' });
          sim.addInput('r', { x: 60, y: 200, label: 'R' });
          sim.addComponent('rl', 'SR_LATCH', { x: 300, y: 155 });
          sim.addOutput('qLed', { x: 460, y: 120, label: 'Q' });
          sim.addOutput('qnLed', { x: 460, y: 200, label: 'Q̄' });
          sim.wire('s', 'out', 'rl', 's', [[140, 110], [220, 110], [220, 137]]);
          sim.wire('r', 'out', 'rl', 'r', [[140, 200], [220, 200], [220, 173]]);
          sim.wire('rl', 'q', 'qLed', 'in');
          sim.wire('rl', 'qn', 'qnLed', 'in');
          sim.explain('NOR latch active-high: S=1 → Q=1, R=1 → Q=0, S=R=0 → hold — และ S=R=1 คือสถานะต้องห้าม (Q โชว์ ?)');
        },
        steps: ['กด S เป็น 1 (R ปล่อย 0) — Q ติดทันที = set ตามเฉลย q04 (S=1,R=0 → Q=1)', 'ปล่อย S=0 — Q ยังคง 1 = hold วงจรจำค่าไว้', 'กด R เป็น 1 — Q ดับ = reset แล้วลองกด S=1 พร้อม R=1 เพื่อดูสถานะต้องห้าม ? ด้วยตาตัวเอง'] },
      { title: 'โจทย์ q22: SR Latch แบบ NAND (active-low) — S̄=R̄=1 → hold ไม่ใช่ invalid',
        build: function (sim) {
          sim.addInput('s', { x: 60, y: 110, label: 'S̄ (กด 0 = set)' });
          sim.addInput('r', { x: 60, y: 200, label: 'R̄ (กด 0 = reset)' });
          sim.addComponent('nl', 'SR_LATCH_NAND', { x: 320, y: 155 });
          sim.addOutput('qLed', { x: 480, y: 120, label: 'Q' });
          sim.addOutput('qnLed', { x: 480, y: 200, label: 'Q̄' });
          sim.wire('s', 'out', 'nl', 's', [[160, 110], [240, 110], [240, 137]]);
          sim.wire('r', 'out', 'nl', 'r', [[160, 200], [240, 200], [240, 173]]);
          sim.wire('nl', 'q', 'qLed', 'in');
          sim.wire('nl', 'qn', 'qnLed', 'in');
          sim.explain('NAND latch active-low: S̄=0 → set, R̄=0 → reset, S̄=R̄=1 → hold (ปกติ!) — S̄=R̄=0 → เสียสมมาตร Q=Q̄=1');
        },
        steps: ['กด S̄ เป็น 0 เพื่อ set — ยิ่งกดต่ำยิ่งทำงาน Q ติดทันที', 'ปล่อยกลับ S̄=R̄=1 (ทั้งคู่ HIGH) — Q คง 1 = hold นี่คือข้อที่ข้อสอบหลอกให้ตอบ invalid แต่จริง ๆ คือ hold', 'กด R̄ เป็น 0 — Q ดับ = reset แล้วกด S̄=R̄=0 พร้อมกันดูสภาวะเสียสมมาตร Q=Q̄=1'] }
    ]
  });

  /* ================= บท: T-FF นับสถานะ 2 บิต — ขึ้น/ลง (q05, q39, q40, q46) ================= */
  DL.registerLesson({
    id: 'exam-tff',
    group: 'exam',
    title: 'T-FF นับสถานะ 2 บิต — นับขึ้น/นับถอยหลัง',
    subtitle: 'q05 · q39 · q40 · q46 — sync down counter (T1=Q̄0) vs up counter (T1=Q0), จำนวนสถานะ = 2ⁿ',
    html:
      '<h2>T-FF คืออะไร — ตัวหารความถี่</h2>' +
      '<p><b>T-FF (Toggle FF)</b>: T=1 → ทุกขอบขึ้นของ clock ค่า Q จะ <b>สลับ</b> (0↔1) — ' +
      'สัญญาณที่ Q จึงมีความถี่เป็น <b>ครึ่งหนึ่ง</b> ของ clock (หาร 2) ส่วน T=0 → Q คงค่าเดิม (hold) ' +
      'จำสมการ characteristic: <b>Q₊ = T ⊕ Q = TQ̄ + T̄Q</b></p>' +

      '<h2>โจทย์ q40 — FF 2 ตัวมีกี่สถานะ?</h2>' +
      '<p>n ตัว FF เก็บบิตได้ n บิต → จำนวนสถานะ = <b>2ⁿ</b> — 2 ตัว = 2² = <b>4 สถานะ</b> (00, 01, 10, 11) ' +
      'ตรงตามเฉลย q40 3 ตัว = 8, 4 ตัว = 16 ไปเรื่อย ๆ</p>' +

      '<h2>โจทย์ q46 — Sync Down Counter: T0=1, T1=Q̄0 + Clock รวม</h2>' +
      '<div class="doc-card"><img src="docs/exam/q46.png" alt="โจทย์ q46 — 2×T-FF sync down counter" style="max-width:360px;width:100%;border-radius:6px">' +
      '<p><b>ทำไมถึงนับถอยหลัง:</b> ทั้ง 2 ตัวใช้ <b>Clock รวมสายเดียว (sync)</b> — ff0 รับ T=1 (สลับทุก pulse) ' +
      'ส่วน ff1 รับ <b>T ต่อจาก Q̄0</b> (สลับเฉพาะตอน Q0=0) เริ่ม 00 → pulse แรก Q̄0=1 เลย ff1 พลิกด้วย ได้ <b>11</b> (3) ' +
      '→ 10 (2) → 01 (1) → 00 (0) → วนกลับ 11 ค่า 2q1+q0 เดิน <b>3, 2, 1, 0, 3, …</b> ตรงเฉลยข้อสอบ 11, 10, 01, 00 ' +
      '(จำ: counter sync <b>นับถอยหลังต่อ T จาก Q̄ ของตัวหน้า</b> ส่วนนับขึ้นต่อจาก Q ของตัวหน้า)</p></div>' +

      '<h2>โจทย์ q39 — 2-bit UP Counter: T0=1, T1=Q0</h2>' +
      '<div class="doc-card"><img src="docs/exam/q39.png" alt="โจทย์ q39 — 2-bit up counter" style="max-width:360px;width:100%;border-radius:6px">' +
      '<p><b>แนวคิด:</b> ff0 รับ T=1 (สลับทุก pulse) ส่วน ff1 รับ <b>T ต่อจาก Q0</b> — ff1 จะสลับ <b>เฉพาะตอน Q0=1</b> ' +
      '(จำลอง "ตัวถัดไปทำงานเมื่อตัวหน้าเพิ่งพลิก 1→0") เริ่ม 00 → 01 → 10 → 11 → กลับ 00 ค่า 2q1+q0 เดิน ' +
      '<b>0, 1, 2, 3, 0, …</b> = นับขึ้น mod-4 พอดี</p></div>' +

      '<h2>โจทย์ q05 — วิธี trace present → next state ด้วยตาราง characteristic</h2>' +
      '<div class="doc-card"><img src="docs/exam/q05.png" alt="โจทย์ q05 — trace present to next state" style="max-width:360px;width:100%;border-radius:6px">' +
      '<p>ข้อสอบชอบให้ตาราง present state พร้อมค่า T หรือ J,K ที่ป้อน แล้วถาม <b>next state</b> — วิธีทำ: ดูแถวละ 1 FF ' +
      'แล้วใช้ตาราง characteristic ของชนิดนั้น: T-FF ใช้ <b>Q₊ = T ⊕ Q</b>, JK ใช้ (J=K=0 → hold, J=K=1 → toggle, J=1 → set, K=1 → reset) ' +
      'ลองตัวอย่างเดียวให้จบ: present <b>Q1Q0 = 01</b> และโจทย์ให้ T1=1, T0=1 → Q1₊ = 1⊕0 = <b>1</b>, Q0₊ = 1⊕1 = <b>0</b> ' +
      '→ next state = <b>10</b> ถ้าโจทย์ให้ J,K ก็เปลี่ยนไปใช้กฎ JK แทน (เช่น J1=1,K1=0 → set ให้ Q1₊=1 ไม่ต้องสนค่าเดิม) ' +
      'ทำทีละบิตแล้วเขียนตอบ ไม่ต้องเดา</p></div>',

    summary:
      '<ul>' +
      '<li>จำนวนสถานะ = <b>2ⁿ</b> — FF 2 ตัว = 4 สถานะ (q40), T-FF: Q₊ = T ⊕ Q (T=1 toggle หารความถี่ 2)</li>' +
      '<li><b>T0=1, T1=Q̄0 + Clock รวม (sync)</b> = นับถอยหลัง 00→11→10→01→00 (q46 — ตัวถัดไป toggle เมื่อตัวหน้า = 0)</li>' +
      '<li><b>T0=1, T1=Q0</b> + Clock รวม = นับขึ้น 00→01→10→11→00 (q39 — ตัวถัดไป toggle เมื่อตัวหน้า = 1)</li>' +
      '<li>q05: trace ทีละบิตด้วยตาราง characteristic — T: Q₊ = T⊕Q ; JK: 00 hold, 11 toggle, 10 set, 01 reset</li>' +
      '</ul>',
    circuits: [
      { title: 'โจทย์ q46: 2×T-FF sync down counter — T0=1, T1=Q̄0 + Clock รวม — นับถอยหลัง 3,2,1,0',
        build: function (sim) {
          sim.addInput('en', { x: 60, y: 150, label: 'T0=1' });
          sim.addComponent('ff0', 'TFF', { x: 320, y: 150 });   // primary clock
          sim.addComponent('ff1', 'TFF', { x: 500, y: 150 });   // primary clock — sync กัน
          sim.addOutput('q0Led', { x: 320, y: 260, label: 'Q0' });
          sim.addOutput('q1Led', { x: 500, y: 260, label: 'Q1' });
          sim.wire('en', 'out', 'ff0', 't', [[160, 150], [220, 150], [220, 132]]);
          sim.wire('ff0', 'qn', 'ff1', 't', [[390, 168], [440, 190], [440, 168]]);  // T1 = Q̄0 (ตามรูปข้อสอบ)
          sim.wire('ff0', 'q', 'q0Led', 'in');
          sim.wire('ff1', 'q', 'q1Led', 'in');
          sim.explain('ทั้ง 2 ตัวเป็น primary clock (CLK รวม) — ff0 toggle ทุก pulse (T0=1) ส่วน ff1 toggle เฉพาะเมื่อ Q0=0 (T1=Q̄0): 00→11→10→01→00 ค่า 2Q1+Q0 เดิน 3,2,1,0 ตามเฉลย q46');
        },
        steps: ['เปิด T0=1 แล้วกด Pulse Clock 1 ครั้ง — Q̄0=1 ดึงให้ Q1 toggle ด้วย = 11 (3) เริ่มนับถอยหลัง', 'กดครบ 4 ครั้ง — อ่านค่า 2Q1+Q0: 3 → 2 (10) → 1 (01) → 0 (00) ตรงเฉลย 11,10,01,00', 'กดอีกครั้ง — วนกลับ 11 (3) วงจรนับถอยหลัง mod-4 ตลอดกาล'] },
      { title: 'โจทย์ q39: 2-bit UP Counter — T0=1, T1=Q0 + Clock รวม — นับขึ้น 0,1,2,3',
        build: function (sim) {
          sim.addInput('en', { x: 60, y: 150, label: 'T0=1' });
          sim.addComponent('ff0', 'TFF', { x: 320, y: 150 });   // primary clock
          sim.addComponent('ff1', 'TFF', { x: 500, y: 150 });   // primary clock — sync กัน
          sim.addOutput('q0Led', { x: 320, y: 260, label: 'Q0' });
          sim.addOutput('q1Led', { x: 500, y: 260, label: 'Q1' });
          sim.wire('en', 'out', 'ff0', 't', [[160, 150], [220, 150], [220, 132]]);
          sim.wire('ff0', 'q', 'ff1', 't', [[390, 150], [440, 150], [440, 132]]);  // T1 = Q0
          sim.wire('ff0', 'q', 'q0Led', 'in');
          sim.wire('ff1', 'q', 'q1Led', 'in');
          sim.explain('ff0 toggle ทุก pulse (T0=1) ส่วน ff1 toggle เฉพาะเมื่อ Q0=1 (T1=Q0) — 00→01→10→11→00 นับขึ้น mod-4 ตาม pattern ข้อสอบ q39');
        },
        steps: ['เปิด T0=1 แล้วกด Pulse Clock 1 ครั้ง — Q0 ติด = 01 (1)', 'กดครั้งที่ 2 — Q0 ดับและตอนนั้น Q0=1 อยู่ จึงดึงให้ Q1 toggle ด้วย = 10 (2)', 'กดครบ 4 ครั้ง — อ่าน 2Q1+Q0: 0 → 1 → 2 → 3 แล้วกดครั้งที่ 5 วนกลับ 0 = นับขึ้น mod-4 ตรงเฉลย q39'] }
    ]
  });

  /* ================= บท: Shift ข้อมูลผ่านวงจร + UART (q18, q34, q50) ================= */
  DL.registerLesson({
    id: 'exam-shift',
    group: 'exam',
    title: 'Shift Register — ดูบิตไหลผ่านวงจรทีละ pulse + UART',
    subtitle: 'q18 · q34 · q50 — 1 pulse = เลื่อน 1 บิต, บิตเข้าก่อนออกก่อน (FIFO), บิตออกทางตัวสุดท้าย (serial out)',
    html:
      '<h2>Shift Register = FF ต่ออนุกรม — 1 pulse เลื่อน 1 บิต</h2>' +
      '<p><b>Shift register</b> คือ FF หลายตัวต่อกันเป็นสาย: D ของตัวถัดไปรับ Q ของตัวก่อนหน้า ' +
      'และทุกตัวใช้ <b>Clock รวมสายเดียว</b> — ทุกครั้งที่มี 1 pulse ข้อมูลจะ <b>เลื่อนไปข้างหน้า 1 ขั้นพอดี</b> ' +
      'บิตใหม่เข้าที่ขา in (ตัวแรกของสาย) และบิตเก่าถูก "ดัน" ออกที่ขา out ตัวสุดท้าย (<b>serial out</b>) — ' +
      'ดูป้าย in/out ในวงจรแต่ละบทเป็นหลัก ไม่ใช่ตำแหน่งซ้ายขวา ' +
      'กฎเดียวที่ต้องจำ: <b>บิตเข้าก่อน = เดินไกลสุด = ออกก่อน (FIFO)</b></p>' +

      '<h2>โจทย์ q18 — ป้อน 1100 แล้วอ่านบิตที่ "ออก" ทาง serial out</h2>' +
      '<div class="doc-card"><img src="docs/exam/q18.png" alt="โจทย์ q18 — 4-bit shift right register" style="max-width:520px;width:100%;border-radius:6px">' +
      '<p>ข้อสอบ: วงจร shift (right) register 4-bit serial-in/serial-out เคลียร์เป็น 0000 แล้วรับบิต ' +
      '<b>1, 1, 0, 0</b> (เรียงตามลำดับ pulse) — ถามว่า register มีค่าเป็นอะไร ' +
      'จากรูป บิตเข้าทาง <b>D</b> (ข้างซ้ายสุด) แล้วเลื่อนขวา D→C→B→A ทุก pulse ' +
      'ตาราง trace จึงเดินแบบนี้: pulse 1 → 1000, pulse 2 → 1100, pulse 3 → 0110, pulse 4 → <b>0011</b> ตรงเฉลยข้อ a ' +
      'อ่านให้เข้าใจ: หลังรับครบ 4 บิต register เก็บ "4 บิตล่าสุด" เรียงจาก <b>บิตใหม่สุดที่ D → บิตเก่าสุดที่ A</b> ' +
      '(บิต 1 ตัวแรกเดินไกลสุดไปอยู่ที่ A) และเมื่อคล็อกต่อไป (din=0) บิตเก่าจะถูกดัน <b>หลุดออกทาง A (serial out)</b> — ' +
      'ค่าที่ A หลัง pulse ที่ 4, 5, 6, 7 จะเรียงเป็น <b>1, 1, 0, 0</b> พอดีลำดับที่ป้อนเข้า ' +
      'นี่คือการอ่านให้เป็นว่า <b>บิตไหนออกเมื่อไหร่</b> (เข้าก่อน = ออกก่อน FIFO)</p>' +
      '<p><b>หมายเหตุ:</b> ในบทเรียน shift ก่อนหน้านี้ (โจทย์ IC ต่อสายแบบเข้าที่ Q0 ออกที่ Q3) ข้อมูลไหลซ้าย→ขวา แต่ในโจทย์ข้อนี้ภาพวงจรวาดกลับด้าน (เข้าที่ D ออกที่ A) — ' +
      'เพราะ IC วาดกลับหัว ให้ดูทิศจากป้าย in/out ของโจทย์เสมอ ไม่ใช่จากตำแหน่งซ้ายขวา</p></div>' +

      '<h2>โจทย์ q34 — trace JK ต่อ D-FF ทีละคล็อก</h2>' +
      '<div class="doc-card"><img src="docs/exam/q34.png" alt="โจทย์ q34 — JK ต่อ D-FF trace 3 คล็อก" style="max-width:520px;width:100%;border-radius:6px">' +
      '<p>โจทย์ให้ input I ต่อเข้า <b>J และ K พร้อมกัน</b> (I=1 → JK toggle ทุกคล็อก) แล้วเอา P (ขา Q ของ JK) ไปต่อ D ของ D-FF ตัวถัดไป ได้ Q ' +
      'เริ่มที่ P=0, Q=1 แล้วคล็อก 3 ครั้ง (I=1 ตลอด):</p>' +
      '<table border="1" cellpadding="6" style="border-collapse:collapse;margin:8px 0">' +
      '<tr><th>คล็อก</th><th>P (JK toggle)</th><th>Q (ตาม P ของคล็อก "ก่อนหน้า"!)</th></tr>' +
      '<tr><td>Start</td><td>0</td><td>1</td></tr>' +
      '<tr><td>P₁</td><td>1</td><td>0 (ลอก P ตอน Start)</td></tr>' +
      '<tr><td>P₂</td><td>0</td><td>1 (ลอก P ตอน P₁)</td></tr>' +
      '<tr><td>P₃</td><td>1</td><td>0 (ลอก P ตอน P₂)</td></tr>' +
      '</table>' +
      '<p>หลัง 3 คล็อก P,Q = <b>1, 0</b> — กุญแจสำคัญ: <b>D-FF ลอกค่า D จาก "ก่อนขอบคล็อก"</b> เสมอ ' +
      'ดังนั้น Q จะตามหลัง P ไป 1 คล็อก (เหมือน shift register 2 ขั้นนั่นเอง) อย่าเผลอให้ Q ก๊อป P "พร้อมกัน" ทุกคล็อก!</p>' +
      '<p>(เกร็ด: ในภาพข้อสอบ เฉลยลายมือเขียนแบบ latching/transparent ไว้ (1,1) แล้วถูกขีดฆ่า แต่อ่านแบบ edge-triggered ซึ่งถูกต้องทางกายภาพได้ (1,0) = ข้อ b)</p></div>' +

      '<h2>โจทย์ q50 — บล็อกของ UART</h2>' +
      '<div class="doc-card"><img src="docs/exam/q50.png" alt="โจทย์ q50 — บล็อกของ UART" style="max-width:520px;width:100%;border-radius:6px">' +
      '<p>UART สื่อสารแบบ <b>อนุกรม (ทีละบิต)</b> จึงต้องมีตัวแปลงขนาน↔อนุกรม 2 ฝั่ง:</p>' +
      '<ul>' +
      '<li><b>Transmitter (ฝั่งส่ง)</b> = <b>parallel-in/serial-out</b> (PISO) — รับข้อมูล 8 บิตพร้อมกัน แล้วส่งออกทีละบิต</li>' +
      '<li><b>Receiver (ฝั่งรับ)</b> = <b>serial-in/parallel-out</b> (SIPO) — รับบิตทีละบิต แล้วคืนเป็น 8 บิตพร้อมกัน</li>' +
      '</ul>' +
      '<p>ข้อที่ <b>"ไม่ใช่" บล็อกของ UART</b> คือ <b>Receiver แบบ parallel-in/serial-out</b> — มันกลับด้านผิด! ' +
      '(parallel-in/serial-out คือฝั่ง Transmitter ไม่ใช่ Receiver) เชื่อมกับบทเรียนวงจร shift register SIPO ที่เรียนไว้: SIPO คือ Receiver, PISO คือ Transmitter</p></div>',

    summary:
      '<ul>' +
      '<li><b>1 pulse = เลื่อน 1 บิต</b> — FF ต่อ Q→D ตัวถัดไป + Clock รวม บิตใหม่เข้า D0 บิตเก่าออกที่ Q ตัวสุดท้าย (serial out)</li>' +
      '<li><b>บิตเข้าก่อน = ออกก่อน (FIFO)</b> — q18: บิตเข้าที่ D เลื่อนขวา D→C→B→A, ป้อน 1,1,0,0 ครบ 4 pulse อ่าน D C B A = <b>0011</b> (เฉลยข้อ a); ค่าที่ A (serial out) หลัง pulse 4-7 เรียง 1,1,0,0 พอดีที่ป้อนเข้า</li>' +
      '<li>q34: JK (J=K=I) toggle → P, D-FF ลอก P <b>ของคล็อกก่อนหน้า</b> → Q ตามหลัง P 1 คล็อก — Start (0,1) คล็อก 3 ครั้ง (I=1) → P,Q = 1,0 (ข้อ b)</li>' +
      '<li>UART: <b>Tx = PISO (parallel-in/serial-out), Rx = SIPO (serial-in/parallel-out)</b> — ข้อไหนสลับฝั่งผิด (Receiver แบบ parallel-in/serial-out) = ไม่ใช่บล็อกของ UART (q50)</li>' +
      '</ul>',
    circuits: [
      { title: 'โจทย์ q18: 4×DFF Shift-Right (serial-in/serial-out) — บิตเข้าที่ D เลื่อนขวา D→C→B→A ออกทาง A ทีละ pulse',
        build: function (sim) {
          sim.addInput('din', { x: 60, y: 130, label: 'Din (บิตเข้าทีละ pulse)' });
          var xs = [300, 490, 680, 870];
          // เรียงซ้าย→ขวาตามรูปข้อสอบ: D C B A — บิตเข้าที่ D (ff3) แล้วเลื่อนขวาไหลออกที่ A (ff0)
          var ids = ['ff3', 'ff2', 'ff1', 'ff0'];
          var labels = ['D', 'C', 'B', 'A (out serial)'];
          for (var i = 0; i < 4; i++) {
            // ทุกตัวเป็น primary clock (ไม่มี clockFrom) — Pulse Clock หนึ่งครั้งเลื่อนทั้งสายพร้อมกัน
            sim.addComponent(ids[i], 'DFF', { x: xs[i], y: 110 });
            sim.addOutput(ledIds(i), { x: xs[i], y: 220, label: labels[i] });
            if (i === 0) sim.wire('din', 'out', 'ff3', 'd', [[160, 130], [220, 130], [220, 92]]);
            else sim.wire(ids[i - 1], 'q', ids[i], 'd', [[xs[i - 1] + 45, 92], [xs[i] - 45, 92]]);
            sim.wire(ids[i], 'q', ledIds(i), 'in');
          }
          function ledIds(k) { return ['dLed', 'cLed', 'bLed', 'outLed'][k]; }
          sim.explain('Shift ขวา 1 บิตต่อ pulse (ตามรูปข้อสอบ): Din → D → C → B → A — ป้อน 1,1,0,0 ครบ 4 pulse แล้วอ่าน D C B A = 0011 (บิต 1 ตัวแรกเดินไกลสุดไป A, บิตใหม่สุดอยู่ D) จากนั้นปล่อย Din=0 แล้วกดต่อ — ไฟที่ LED "A (out serial)" จะกระพริบตามลำดับบิตที่ป้อนเข้า 1,1,0,0 = บิตเข้าก่อนออกก่อน (FIFO)');
        },
        steps: ['ป้อน Din=1 แล้วกด Pulse Clock 2 ครั้ง — ดูบิต 1 วิ่งจาก D ไป C (เลื่อนขวาขั้นละ 1 pulse)', 'ป้อนลำดับ 1,1,0,0 ให้ครบ 4 pulse — อ่าน D C B A = 0011 ตรงเฉลย q18 ข้อ a (register เก็บ 4 บิตล่าสุด บิตเก่าสุดอยู่ A และกำลังจะหลุดออก)', 'ปล่อย Din=0 แล้วกดต่ออีก 3 pulse — จับตา LED A (out serial): ตอน pulse 4-7 มันแสดง 1,1,0,0 พอดีลำดับที่ป้อนเข้า = บิตออกทางอนุกรมเข้าก่อนออกก่อน แล้ว register กลับเป็น 0000'] },
      { title: 'โจทย์ q34: JK (J=K=I) → P → D-FF → Q — trace 3 คล็อก: Q ตามหลัง P ทีละคล็อก',
        build: function (sim) {
          sim.addInput('i', { x: 60, y: 150, label: 'I (ต่อ J=K)' });
          sim.addComponent('jk', 'JKFF', { x: 320, y: 130 });
          sim.addComponent('dff', 'DFF', { x: 560, y: 130 });
          sim.addOutput('pLed', { x: 320, y: 240, label: 'P' });
          sim.addOutput('qLed', { x: 560, y: 240, label: 'Q' });
          sim.wire('i', 'out', 'jk', 'j', [[160, 150], [220, 150], [220, 94]]);
          sim.wire('i', 'out', 'jk', 'k', [[190, 150], [250, 150], [250, 112]]);
          sim.wire('jk', 'q', 'dff', 'd', [[385, 112], [470, 112], [470, 112]]);
          sim.wire('jk', 'q', 'pLed', 'in');
          sim.wire('dff', 'q', 'qLed', 'in');
          sim.explain('I=1 → J=K=1 → P toggle ทุกคล็อก ส่วน Q ลอก P "ก่อนขอบคล็อก" จึงตามหลัง P ไป 1 คล็อกเสมอ — Start (P,Q)=(0,1) แล้วคล็อก 3 ครั้ง (I=1): P₁=(1,0) P₂=(0,1) P₃=(1,0) ตอบ P,Q = 1,0 ตรงเฉลย q34 ข้อ b');
        },
        steps: ['เปิด I=1 (J=K=1 = toggle mode) แล้วกด Pulse Clock — เห็น P สลับทุกคล็อก แต่ Q สลับ "ช้ากว่า 1 จังหวะ"', 'กด ↺ รีเซ็ต → ตั้ง I=1 แล้ว Pulse 2 ครั้ง → ได้ Start (P,Q)=(0,1) ตามตารางในโจทย์ จากนั้นนับพร้อมตาราง: P₁ (1,0) → P₂ (0,1) → P₃ (1,0)', 'สรุป: หลัง 3 คล็อก P,Q = 1,0 (ข้อ b) — จำไว้ว่า D-FF ใช้ค่า D "ก่อนขอบคล็อก" Q จึงเหมือนบิตที่ถูกเลื่อนไป 1 ขั้น'] }
    ]
  });
})();
