/* ===== Digital Learning — กลุ่ม C: Sequential (บท 14–15 จากสไลด์ PDF 07_1, 07_2) ===== */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  /* ---------- บทที่ 14: Sequential Circuit (PDF 07_1) ---------- */
  DL.registerLesson({
    id: 'seq-dff',
    group: 'sequential',
    title: 'Sequential Circuit — วงจรที่จำอดีต',
    subtitle: 'สไลด์บท 7.1 · วิเคราะห์วงจร sequential ที่ D = f(Q, X) — สมการ, ตาราง characteristic และ excitation',
    slide: 'docs/07_1_rev03 (Sequential).pdf',
    html:
      '<h2>Combinational vs Sequential</h2>' +
      '<p>วงจร combinational (บท 1–9) "ลืมทุกอย่าง" — output ขึ้นกับ input ปัจจุบันอย่างเดียว ' +
      '<b>Sequential circuit</b> เพิ่มสิ่งเดียวแต่เปลี่ยนทุกอย่าง: <b>output ของ FF ย้อนกลับมาผสมกับ input ภายนอก</b> ' +
      'ผ่าน combinational logic แล้วกลับเข้า FF อีกที ทำให้ output ขึ้นกับ <b>ประวัติ</b> ที่ผ่านมาด้วย</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">X ──→┌──────────┐\n     │ combin.  │── D ──→[D-FF]──→ Q\n  Q ─→┌──────────┘            │\n  ↑──────────────────────────┘  (feedback ผ่าน FF เท่านั้น!)</pre>' +
      '<div class="warn"><b>กฎเหล็ก:</b> feedback ต้องผ่าน flip-flop เสมอ ถ้า gate feedback กันเองตรงๆ วงจรจะระส่ำระสาย (วงจรจำลองของเราถึงกับปฏิเสธคำนวณ)</div>' +

      '<h2>วิธีวิเคราะห์ (ข้อสอบชอบให้ทำ 3 ขั้นนี้)</h2>' +
      '<ol>' +
      '<li>เขียน <b>สมการ input ของ FF</b> เช่น D = X ⊕ Q</li>' +
      '<li>แทนด้วย <b>characteristic equation</b> ของ FF (D-FF: Q<sup>+</sup> = D) → ได้ Q<sup>+</sup> = X ⊕ Q</li>' +
      '<li>สร้าง <b>state table</b>: ไล่ทุก Q ปัจจุบัน × ทุก input หา Q ถัดไป</li>' +
      '</ol>' +
      '<p>สำหรับวงจรตัวอย่าง D = X ⊕ Q จะได้ state table:</p>' +
      '<table class="tt"><tr><th>X</th><th>Q ปัจจุบัน</th><th>Q ถัดไป</th><th>พฤติกรรม</th></tr>' +
      '<tr><td>0</td><td>0</td><td>0</td><td rowspan="2">Hold — คงค่าเดิม</td></tr>' +
      '<tr><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>1</td><td>0</td><td>1</td><td rowspan="2">Toggle — สลับทุก pulse</td></tr>' +
      '<tr><td>1</td><td>1</td><td>0</td></tr></table>' +
      '<p>เห็นไหมว่า X=1 ทำให้วงจรกลายเป็น T-FF พอดี? — นี่คือวิธีสร้าง T-FF จาก D-FF แบบที่สอง (นอกจากใช้ JK ต่อ J=K)</p>' +

      '<h2>ตารางที่ต้องท่อง: Characteristic &amp; Excitation</h2>' +
      '<table class="tt"><tr><th>FF</th><th>Characteristic (แปลง input→Q+)</th><th>Excitation (แปลงอยากให้ Q ย้ายอย่างไร→ต้องใส่ input อะไร)</th></tr>' +
      '<tr><td rowspan="2">D</td><td>D=0 → Q⁺=0</td><td>0→0 : D=0 · 0→1 : D=1</td></tr>' +
      '<tr><td>D=1 → Q⁺=1</td><td>1→0 : D=0 · 1→1 : D=1 (D = Q⁺ เท่านั้น!)</td></tr>' +
      '<tr><td rowspan="2">JK</td><td>00 hold · 01 reset</td><td>0→0 : J=x,K=0 · 0→1 : J=1,K=x</td></tr>' +
      '<tr><td>10 set · 11 toggle</td><td>1→0 : J=x,K=1 · 1→1 : J=0,K=x</td></tr>' +
      '<tr><td rowspan="2">T</td><td>T=0 hold · T=1 toggle</td><td>0→0 / 1→1 : T=0</td></tr>' +
      '<tr><td>Q⁺ = T⊕Q</td><td>0→1 / 1→0 : T=1</td></tr></table>' +
      '<div class="note">เทคนิคจำ: <b>Excitation table คือ characteristic table กลับด้าน</b> — ตัวหนึ่งถาม "ใส่แล้วได้อะไร" อีกตัวถาม "อยากได้อะไรต้องใส่อะไร" ออกสอบ design ต้องใช้ excitation, ออกสอบ analysis ต้องใช้ characteristic</div>',
    summary:
      '<ul>' +
      '<li>Sequential = combinational + FF + <b>feedback ผ่าน FF</b> — จำประวัติได้</li>' +
      '<li>วิเคราะห์ 3 ขั้น: สมการ input FF → แทน characteristic → state table</li>' +
      '<li>Characteristic: D-FF Q⁺=D · JK 4 โหมด · T Q⁺=T⊕Q</li>' +
      '<li>Excitation: อยากให้ Q "ย้าย" → ดูตารางข้างบนหาค่า input ที่ต้องเตรียม</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลองวงจร sequential ที่ง่ายที่สุด — D = X ⊕ Q',
        build: function (sim) {
          sim.addInput('x', { x: 60, y: 130, label: 'X' });
          sim.addGate('x1', 'XOR', { x: 220, y: 95 });
          sim.addComponent('f', 'DFF', { x: 400, y: 95 });
          sim.addOutput('qLed', { x: 560, y: 60, label: 'Q' });
          sim.addOutput('qnLed', { x: 560, y: 135, label: 'Q̄' });
          sim.wire('x', 'out', 'x1', 0, [[150, 130], [150, 88]]);
          sim.wire('f', 'q', 'x1', 1, [[490, 60], [160, 60], [160, 102]]);
          sim.wire('x1', 'out', 'f', 'd', [[310, 95], [310, 80]]);
          sim.wire('f', 'q', 'qLed', 'in');
          sim.wire('f', 'qn', 'qnLed', 'in');
          sim.explain('X=0 → hold ลองกด pulse ดู Q นิ่ง แล้วเปิด X=1 แล้ว pulse — Q จะสลับ');
        },
        steps: ['ปล่อย X=0 กด pulse หลายครั้ง — Q นิ่ง (hold)', 'เปิด X=1 กด pulse — Q สลับทุกครั้ง (กลายเป็น T-FF)', 'สังเกตสายย้อนจาก Q กลับเข้า XOR — นี่คือ feedback ที่ทำให้จำอดีตได้'] }
    ]
  });

  /* ---------- บทที่ 15: Synchronous Sequential (PDF 07_2) ---------- */
  DL.registerLesson({
    id: 'seq-sync',
    group: 'sequential',
    title: 'Synchronous Sequential — ออกแบบเครื่องจักรสถานะ',
    subtitle: 'สไลด์บท 7.2 · ออกแบบวงจร FF หลายตัวที่เดินพร้อมกันตาม state table ที่กำหนด',
    slide: 'docs/07_2_rev03 (Synchronous).pdf',
    html:
      '<h2>Synchronous คืออะไร?</h2>' +
      '<p>เมื่อใช้ FF หลายตัว ถ้าแต่ละตัวเดินตามจังหวะของตัวเอง state จะพลาดง่าย ' +
      '<b>Synchronous design</b> คือการให้ FF <b>ทุกตัวใช้ clock สายเดียวกัน</b> แล้วคุมว่าจะเปลี่ยนเป็นอะไรด้วย ' +
      'logic ที่ป้อนเข้าขา D ทั้งหมดพร้อมกัน ณ ขอบเดียวกัน — ทุก state เปลี่ยน "พร้อมเพรียง" จึงวิเคราะห์ได้แน่นอน</p>' +

      '<h2>ขั้นตอนออกแบบ (ตำราเรียกว่า design procedure)</h2>' +
      '<ol>' +
      '<li>เขียน <b>state table</b> จากโจทย์ (อยากให้วนซ้ำยังไง)</li>' +
      '<li>แปลงด้วย <b>excitation table</b> → หาว่าแต่ละ FF ต้องการ input อะไร</li>' +
      '<li>ย่อด้วย <b>K-map</b> หาสมการที่ง่ายที่สุด</li>' +
      '<li>วาดวงจรจากสมการ</li>' +
      '</ol>' +

      '<h2>ตัวอย่าง: เครื่องเดิน 00 → 01 → 10 → 00 (วนซ้ำ)</h2>' +
      '<table class="tt"><tr><th>Q1 Q0 ปัจจุบัน</th><th>Q1 Q0 ถัดไป</th><th>D1 ที่ต้องใส่</th><th>D0 ที่ต้องใส่</th></tr>' +
      '<tr><td>0 0</td><td>0 1</td><td>0</td><td>1</td></tr>' +
      '<tr><td>0 1</td><td>1 0</td><td>1</td><td>0</td></tr>' +
      '<tr><td>1 0</td><td>0 0</td><td>0</td><td>0</td></tr></table>' +
      '<p>ย่อด้วย K-map (state 11 ไม่ใช้ — ใส่ x ปล่อยโดนใจ) จะได้:</p>' +
      '<p style="text-align:center;font-size:19px"><b>D1 = Q0 &nbsp;&nbsp;&nbsp; D0 = Q̅1 · Q̅0</b></p>' +
      '<p>อ่านสมการเป็นภาษาคน: "ถ้าตอนนี้ Q0 ติด ครั้งหน้า Q1 ติด" · "ถ้าตอนนี้ทุกบิตดับ ครั้งหน้า Q0 ติด" — สามสถานะวนเป็นวงกลมพอดี</p>' +
      '<div class="note">วงจรด้านล่างต่อตามสมการพอดี — กด pulse แล้วเทียบกับ state table ทีละแถว และลองดูว่าถ้าบังคับเริ่ม state 11 (ไม่ได้ใช้) มันจะกลับเข้าวงได้เองใน 1 จังหวะ (self-correcting ต้องเช็คในข้อสอบ design!)</div>',
    summary:
      '<ul>' +
      '<li>Synchronous = FF ทุกตัวใช้ clock เดียวกัน เปลี่ยน state พร้อมกันที่ขอบเดียว</li>' +
      '<li>Design 4 ขั้น: <b>state table → excitation table → K-map → วงจร</b></li>' +
      '<li>เช็คเสมอว่า state ที่ไม่ใช้ (don\'t care) ต้องกลับเข้าวงได้ (self-correcting)</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลองเครื่องสถานะ 00 → 01 → 10 → วนกลับ (2×D-FF)',
        build: function (sim) {
          sim.addComponent('f1', 'DFF', { x: 560, y: 60 });
          sim.addComponent('f0', 'DFF', { x: 560, y: 170 });
          sim.addGate('n1', 'NOT', { x: 380, y: 200 });
          sim.addGate('n2', 'NOT', { x: 380, y: 250 });
          sim.addGate('a1', 'AND', { x: 470, y: 225 });
          sim.addOutput('q1Led', { x: 710, y: 25, label: 'Q1' });
          sim.addOutput('q0Led', { x: 710, y: 135, label: 'Q0' });
          // D1 = Q0 : FF0.q → FF1.d
          sim.wire('f0', 'q', 'f1', 'd', [[640, 60], [500, 60], [500, 45]]);
          // D0 = NOT(Q1) AND NOT(Q0) : q1→n1, q0→n2, n1+n2→a1→FF0.d
          sim.wire('f1', 'q', 'n1', 0, [[490, 25], [440, 25], [440, 193]]);
          sim.wire('f0', 'q', 'n2', 0, [[490, 135], [465, 135], [465, 243]]);
          sim.wire('n1', 'out', 'a1', 0, [[420, 200], [420, 218]]);
          sim.wire('n2', 'out', 'a1', 1, [[420, 250], [420, 232]]);
          sim.wire('a1', 'out', 'f0', 'd', [[515, 225], [515, 155]]);
          sim.wire('f1', 'q', 'q1Led', 'in', [[660, 25], [660, 25]]);
          sim.wire('f0', 'q', 'q0Led', 'in', [[660, 135], [660, 135]]);
          sim.explain('เริ่ม Q1Q0 = 00 — กด pulse แล้วดูวงเดิน 01 → 10 → 00 วนซ้ำ');
        },
        steps: ['กด pulse ทีละครั้ง เทียบกับ state table: 00→01→10→00 วน 3 จังหวะ', 'กด pulse เพิ่ม — วงยังวนต่อไม่หลุด', 'กด pulse หลายครั้งติดๆ แล้วสังเกตว่า 11 ไม่เคยเกิดขึ้นเลย เพราะสมการไม่พาไป'] }
    ]
  });
})();
