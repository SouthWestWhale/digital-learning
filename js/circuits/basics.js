/* ===== Digital Learning — บทพื้นฐาน (กลุ่ม A) =====
 * component combinational + บทเรียน 9 บท:
 * 1 เลขฐาน → 2 Logic Gates → 3 Boolean → 4 HA → 5 FA → 6 MUX → 7 DEMUX → 8 Decoder → 9 Encoder
 * ลำดับ sidebar = ลำดับ registerLesson ในไฟล์นี้
 * ตรรกะทั้งหมดถูกทดสอบใน tests/components.test.js (ผ่าน build function ตัวจริง)
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  /* ================= COMPONENTS ================= */

  // MUX 4-to-1: s1s0 เลือกว่า d ไหนทะลุออกไป
  DL.registerComponent('MUX4TO1', {
    inputs: ['d0', 'd1', 'd2', 'd3', 's1', 's0'],
    outputs: ['y'],
    pinLabels: { d0: 'D0', d1: 'D1', d2: 'D2', d3: 'D3', s1: 'S1', s0: 'S0', y: 'Y' },
    eval: function (v) {
      var idx = (v.s1 ? 2 : 0) + (v.s0 ? 1 : 0);
      return { y: [v.d0, v.d1, v.d2, v.d3][idx] };
    }
  });

  // DEMUX 1-to-4: ข้อมูล d ถูกแจกไปยังเส้นทางออกที่ select ชี้ (เส้นอื่น = 0)
  DL.registerComponent('DEMUX1TO4', {
    inputs: ['d', 's1', 's0'],
    outputs: ['y0', 'y1', 'y2', 'y3'],
    pinLabels: { d: 'D', s1: 'S1', s0: 'S0', y0: 'Y0', y1: 'Y1', y2: 'Y2', y3: 'Y3' },
    eval: function (v) {
      var idx = (v.s1 ? 2 : 0) + (v.s0 ? 1 : 0);
      var o = {};
      ['y0', 'y1', 'y2', 'y3'].forEach(function (p, i) { o[p] = (i === idx) ? v.d : 0; });
      return o;
    }
  });

  // DECODER 2-to-4: เปิด one-hot ทางออกเดียวตามเลขฐานสอง a1a0
  DL.registerComponent('DECODER2TO4', {
    inputs: ['a1', 'a0'],
    outputs: ['q0', 'q1', 'q2', 'q3'],
    pinLabels: { a1: 'A1', a0: 'A0', q0: 'Q0', q1: 'Q1', q2: 'Q2', q3: 'Q3' },
    eval: function (v) {
      var idx = (v.a1 ? 2 : 0) + (v.a0 ? 1 : 0);
      var o = {};
      ['q0', 'q1', 'q2', 'q3'].forEach(function (p, i) { o[p] = (i === idx) ? 1 : 0; });
      return o;
    }
  });

  // ENCODER 4-to-2 แบบ priority: หลาย input เป็น 1 พร้อมกัน → ใช้เบอร์สูงสุด
  DL.registerComponent('ENCODER4TO2', {
    inputs: ['i0', 'i1', 'i2', 'i3'],
    outputs: ['y1', 'y0'],
    pinLabels: { i0: 'I0', i1: 'I1', i2: 'I2', i3: 'I3', y1: 'Y1', y0: 'Y0' },
    eval: function (v) {
      if (v.i3) return { y1: 1, y0: 1 };
      if (v.i2) return { y1: 1, y0: 0 };
      if (v.i1) return { y1: 0, y0: 1 };
      return { y1: 0, y0: 0 };
    }
  });

  // 7-segment display: BCD 4 บิต → ลวดลายไฟ 7 ช่อง (a..g)
  var SEG_TABLE = {
    0: [1, 1, 1, 1, 1, 1, 0], 1: [0, 1, 1, 0, 0, 0, 0], 2: [1, 1, 0, 1, 1, 0, 1],
    3: [1, 1, 1, 1, 0, 0, 1], 4: [0, 1, 1, 0, 0, 1, 1], 5: [1, 0, 1, 1, 0, 1, 1],
    6: [1, 0, 1, 1, 1, 1, 1], 7: [1, 1, 1, 0, 0, 0, 0], 8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1]
  };
  DL.SEG_TABLE = SEG_TABLE;
  DL.registerComponent('SEVENSEG', {
    inputs: ['d3', 'd2', 'd1', 'd0'],
    outputs: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    pinLabels: { d3: 'D3', d2: 'D2', d1: 'D1', d0: 'D0' },
    w: 110, h: 96,
    eval: function (v) {
      var n = (v.d3 ? 8 : 0) + (v.d2 ? 4 : 0) + (v.d1 ? 2 : 0) + (v.d0 ? 1 : 0);
      var t = SEG_TABLE[n] || [0, 0, 0, 0, 0, 0, 0];
      var o = {};
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(function (p, i) { o[p] = t[i]; });
      o._digit = n;   // ไว้ให้ update แสดงตัวเลขกำกับ
      return o;
    },
    shape: function (g, node) {
      // กรอบจอ + ช่องไฟ 7 ช่อง (rect มี data-seg ให้ update จับสี)
      var rects = {
        a: [-12, -37, 24, 6], b: [10, -30, 6, 26], c: [10, 4, 6, 26],
        d: [-12, 31, 24, 6], e: [-16, 4, 6, 26], f: [-16, -30, 6, 26],
        g: [-10, -3, 20, 6]
      };
      g.appendChild(DL.Render.svgEl('rect', { x: -24, y: -42, width: 48, height: 84, rx: 5, fill: '#1e293b' }));
      Object.keys(rects).forEach(function (k) {
        var r = rects[k];
        var el = DL.Render.svgEl('rect', { x: r[0], y: r[1], width: r[2], height: r[3], rx: 2, 'class': 'seg-off' });
        el.setAttribute('data-seg', k);
        g.appendChild(el);
      });
      var t = DL.Render.svgEl('text', { x: 36, y: 6, 'class': 'comp-pin-label' });
      t.setAttribute('data-digit', '1');
      g.appendChild(t);
    },
    update: function (g, node) {
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(function (k) {
        var el = g.querySelector('[data-seg="' + k + '"]');
        if (el) el.setAttribute('class', node.out[k] === 1 ? 'seg-on' : 'seg-off');
      });
      var t = g.querySelector('[data-digit]');
      if (t) t.textContent = node.out._digit <= 9 ? String(node.out._digit) : '-';
    }
  });

  /* ================= BUILD HELPERS (บทเรียน + test ใช้ร่วมกัน) ================= */

  // Half Adder: S = A⊕B, C = A·B
  function buildHalfAdder(sim) {
    sim.addInput('a', { x: 60, y: 60, label: 'A' });
    sim.addInput('b', { x: 60, y: 125, label: 'B' });
    sim.addGate('x1', 'XOR', { x: 215, y: 75 });
    sim.addGate('a1', 'AND', { x: 215, y: 145 });
    sim.addOutput('sLed', { x: 370, y: 60, label: 'Sum (S)' });
    sim.addOutput('cLed', { x: 370, y: 135, label: 'Carry (C)' });
    sim.wire('a', 'out', 'x1', 0, [[135, 60], [135, 68]]);
    sim.wire('b', 'out', 'x1', 1, [[135, 125], [135, 82]]);
    sim.wire('a', 'out', 'a1', 0, [[165, 60], [165, 138]]);
    sim.wire('b', 'out', 'a1', 1, [[165, 125], [165, 152]]);
    sim.wire('x1', 'out', 'sLed', 'in', [[300, 75], [300, 60]]);
    sim.wire('a1', 'out', 'cLed', 'in');
    sim.explain('เริ่มต้น: A=B=0 → S=0, C=0 — ลองกดดูว่าเลข 0+1, 1+0, 1+1 ได้อะไร');
    return sim;
  }

  // Full Adder: S = A⊕B⊕Cin, Cout = AB + Cin(A⊕B)
  function buildFullAdder(sim) {
    sim.addInput('a', { x: 55, y: 40, label: 'A' });
    sim.addInput('b', { x: 55, y: 105, label: 'B' });
    sim.addInput('cin', { x: 55, y: 185, label: 'Cin' });
    sim.addGate('x1', 'XOR', { x: 205, y: 72 });
    sim.addGate('x2', 'XOR', { x: 340, y: 105 });
    sim.addGate('a1', 'AND', { x: 205, y: 165 });
    sim.addGate('a2', 'AND', { x: 340, y: 205 });
    sim.addGate('o1', 'OR', { x: 470, y: 185 });
    sim.addOutput('sLed', { x: 490, y: 105, label: 'Sum (S)' });
    sim.addOutput('coutLed', { x: 590, y: 185, label: 'Cout' });
    sim.wire('a', 'out', 'x1', 0, [[125, 40], [125, 65]]);
    sim.wire('b', 'out', 'x1', 1, [[125, 105], [125, 79]]);
    sim.wire('a', 'out', 'a1', 0, [[160, 40], [160, 158]]);
    sim.wire('b', 'out', 'a1', 1, [[160, 105], [160, 172]]);
    sim.wire('x1', 'out', 'x2', 0, [[275, 72], [275, 98]]);
    sim.wire('cin', 'out', 'x2', 1, [[290, 185], [290, 112]]);
    sim.wire('x1', 'out', 'a2', 0, [[300, 72], [300, 198]]);
    sim.wire('cin', 'out', 'a2', 1, [[330, 185], [330, 212]]);
    sim.wire('x2', 'out', 'sLed', 'in', [[430, 105], [430, 105]]);
    sim.wire('a1', 'out', 'o1', 0, [[280, 165], [280, 178]]);
    sim.wire('a2', 'out', 'o1', 1, [[415, 205], [415, 192]]);
    sim.wire('o1', 'out', 'coutLed', 'in');
    sim.explain('เริ่มต้น: 0+0+0 = 0 — กดสวิตช์ลองบวกเลขฐานสองดู เช่น 1+1+1 ต้องได้ Cout=1, S=1 (คือ 11₂ = 3)');
    return sim;
  }

  /* ================= บทที่ 1: เลขฐาน ================= */
  DL.registerLesson({
    id: 'number-system',
    group: 'basics',
    title: 'ระบบเลขฐาน — Binary · Octal · Decimal · Hex',
    subtitle: 'ภาษาที่วงจรดิจิทัลพูดกัน — อ่านบทนี้ก่อนจะเข้าใจทุกวงจรที่เหลือ',
    html:
      '<h2>ฐาน (Base) คืออะไร?</h2>' +
      '<p>เลขที่เราใช้ปกติคือ "ฐานสิบ" เพราะมีเลขใช้ 10 ตัว (0–9) ตัวเลขแต่ละหลักมี "ค่าตำแหน่ง" เป็นยกกำลังของฐาน ' +
      'เช่น 205 คือ 2×100 + 0×10 + 5×1</p>' +
      '<p><b>ฐานสอง (binary)</b> ใช้เลขแค่ 0 กับ 1 ค่าตำแหน่งเป็นยกกำลัง 2: … 8, 4, 2, 1</p>' +
      '<table class="tt"><tr><th>ค่าตำแหน่ง</th><td>8</td><td>4</td><td>2</td><td>1</td></tr>' +
      '<tr><th>บิต</th><td>1</td><td>1</td><td>0</td><td>1</td></tr>' +
      '<tr><th>ค่า</th><td>8</td><td>4</td><td>0</td><td>1</td></tr></table>' +
      '<p>1101₂ = 8+4+0+1 = <b>13</b> ในฐานสิบ</p>' +

      '<h2>แปลงฐานสิบ → ฐานสอง: หาร 2 เก็บเศษ</h2>' +
      '<p>หารเลขด้วย 2 ซ้ำๆ เขียนเศษเก็บไว้ แล้วอ่านจากล่างขึ้นบน:</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">13 ÷ 2 = 6 เศษ <b>1</b>\n 6 ÷ 2 = 3 เศษ <b>0</b>\n 3 ÷ 2 = 1 เศษ <b>1</b>\n 1 ÷ 2 = 0 เศษ <b>1</b>   → อ่านล่างขึ้นบน = 1101₂</pre>' +

      '<h2>ฐานสิบหก (Hexadecimal)</h2>' +
      '<p>ใช้เลข 0–9 และตัวอักษร A–F (A=10, B=11, …, F=15) ข้อดีคือ <b>1 หลัก hex = 4 บิตพอดี</b> เลยใช้ย่อ binary ให้อ่านง่าย:</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">1101 1010₂\n   ↓    ↓\n  D₁₆  A₁₆  →  11011010₂ = DA₁₆ = 218₁₀</pre>' +
      '<p>ในการเขียนโปรแกรม hex มักมี 0x นำหน้า เช่น <code>0xDA</code> ส่วนฐานแปด (octal) จับกลุ่ม 3 บิตต่อ 1 หลัก — พบน้อยลงแต่ออกสอบได้</p>' +
      '<div class="note">เคล็ด: เปลี่ยนฐาน 2 ↔ 16 ทำ "ทีละกลุ่ม 4 บิต" ไม่ต้องแวะผ่านฐาน 10 เลย ส่วน 2 ↔ 8 ใช้กลุ่ม 3 บิต</div>',
    summary:
      '<table class="tt"><tr><th>ฐาน 10</th><th>ฐาน 2</th><th>ฐาน 8</th><th>ฐาน 16</th></tr>' +
      '<tr><td>0</td><td>0000</td><td>0</td><td>0</td></tr>' +
      '<tr><td>1</td><td>0001</td><td>1</td><td>1</td></tr>' +
      '<tr><td>2</td><td>0010</td><td>2</td><td>2</td></tr>' +
      '<tr><td>3</td><td>0011</td><td>3</td><td>3</td></tr>' +
      '<tr><td>4</td><td>0100</td><td>4</td><td>4</td></tr>' +
      '<tr><td>5</td><td>0101</td><td>5</td><td>5</td></tr>' +
      '<tr><td>6</td><td>0110</td><td>6</td><td>6</td></tr>' +
      '<tr><td>7</td><td>0111</td><td>7</td><td>7</td></tr>' +
      '<tr><td>8</td><td>1000</td><td>10</td><td>8</td></tr>' +
      '<tr><td>9</td><td>1001</td><td>11</td><td>9</td></tr>' +
      '<tr><td>10</td><td>1010</td><td>12</td><td>A</td></tr>' +
      '<tr><td>11</td><td>1011</td><td>13</td><td>B</td></tr>' +
      '<tr><td>12</td><td>1100</td><td>14</td><td>C</td></tr>' +
      '<tr><td>13</td><td>1101</td><td>15</td><td>D</td></tr>' +
      '<tr><td>14</td><td>1110</td><td>16</td><td>E</td></tr>' +
      '<tr><td>15</td><td>1111</td><td>17</td><td>F</td></tr></table>' +
      '<p>ท่องตารางนี้ให้ได้ — แปลงทุกอย่างในข้อสอบอ้างอิงจาก 16 ตัวนี้ทั้งหมด</p>',
    circuits: []
  });

  /* ================= บทที่ 2: Logic Gates (จาก M1) ================= */
  function gateCircuit(type) {
    return function (sim) {
      var single = (type === 'NOT');
      if (single) {
        sim.addInput('a', { x: 60, y: 70, label: 'A' });
        sim.addGate('g', type, { x: 200, y: 70 });
        sim.addOutput('led', { x: 350, y: 70, label: 'ผลลัพธ์' });
        sim.wire('a', 'out', 'g', 0);
        sim.wire('g', 'out', 'led', 'in');
      } else {
        sim.addInput('a', { x: 60, y: 45, label: 'A' });
        sim.addInput('b', { x: 60, y: 105, label: 'B' });
        sim.addGate('g', type, { x: 200, y: 75 });
        sim.addOutput('led', { x: 360, y: 75, label: 'ผลลัพธ์' });
        sim.wire('a', 'out', 'g', 0, [[130, 45], [130, 62]]);
        sim.wire('b', 'out', 'g', 1, [[130, 105], [130, 88]]);
        sim.wire('g', 'out', 'led', 'in');
      }
      sim.explain('เริ่มต้น: ทุก input เป็น 0 — ลองกดสวิตช์ดู');
    };
  }

  DL.registerLesson({
    id: 'logic-gates',
    group: 'basics',
    title: 'Logic Gates — ประตูตรรกะ',
    subtitle: 'หัวใจของทุกวงจรดิจิทัล — เริ่มต้นที่นี่ก่อนบทอื่นทั้งหมด',
    html:
      '<h2>สัญญาณดิจิทัลคืออะไร?</h2>' +
      '<p>วงจรดิจิทัลรู้จักแรงดันเพียง <b>2 ระดับ</b> เท่านั้น:</p>' +
      '<ul>' +
      '<li><b>0</b> = แรงดันต่ำ (~0V) = "ปิด" / false</li>' +
      '<li><b>1</b> = แรงดันสูง (~5V หรือ 3.3V) = "เปิด" / true</li>' +
      '</ul>' +
      '<p>เพราะมีแค่ 2 ค่า สัญญาณรบกวนเล็กๆ จึงไม่ทำให้ค่าเปลี่ยน — นี่คือเหตุผลที่คอมพิวเตอร์ทั้งโลกใช้ระบบเลขฐานสอง (binary)</p>' +
      '<div class="note"><b>Logic gate</b> คือ "กล่องคิด" เล็กๆ ที่รับ input เป็น 0/1 ตั้งแต่ 1 ตัวขึ้นไป ' +
      'แล้วส่ง output เป็น 0/1 ตามกฎตายตัว จำได้ง่ายๆ ว่า <i>"เปิดไฟตอนไหน?"</i></div>' +

      '<h2>AND — ไฟติดเมื่อ "ครบทุกตัว"</h2>' +
      '<p>นึกถึงสวิตช์ไฟ 2 ตัว <b>อนุกรม</b> (ต่อไปเรื่องๆ) ไฟจะติดต่อเมื่อปิดสวิตช์ครบทั้ง 2 ตัว เขียนแทนด้วย <code>A·B</code> หรือ <code>A AND B</code></p>' +
      '<table class="tt"><tr><th>A</th><th>B</th><th>A·B</th></tr>' +
      '<tr><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>1</td><td>0</td></tr>' +
      '<tr><td>1</td><td>0</td><td>0</td></tr><tr><td>1</td><td>1</td><td>1</td></tr></table>' +

      '<h2>OR — ไฟติดเมื่อ "มีตัวใดตัวหนึ่ง"</h2>' +
      '<p>เหมือนสวิตช์ 2 ตัว <b>ขนาน</b> กัน กดตัวไหนก็ได้ไฟติด เขียนแทน <code>A+B</code></p>' +
      '<table class="tt"><tr><th>A</th><th>B</th><th>A+B</th></tr>' +
      '<tr><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>1</td><td>0</td><td>1</td></tr><tr><td>1</td><td>1</td><td>1</td></tr></table>' +

      '<h2>NOT — กลับค่า (Inverter)</h2>' +
      '<p>รับ 0 คืน 1 รับ 1 คืน 0 เขียนแทน <code>A̅</code> (A-bar) สัญลักษณ์วงจรเป็นสามเหลี่ยมมีวงกลมที่ปลาย (bubble = กลับค่า)</p>' +
      '<table class="tt"><tr><th>A</th><th>A̅</th></tr>' +
      '<tr><td>0</td><td>1</td></tr><tr><td>1</td><td>0</td></tr></table>' +

      '<h2>NAND และ NOR — กลับค่าของ AND / OR</h2>' +
      '<p>NAND = NOT+AND, NOR = NOT+OR ดูจาก "bubble" ที่ปลายสัญลักษณ์</p>' +
      '<p>NAND กับ NOR เจ๋งตรงที่ <b>ใช้ตัวเดียวต่อกันหลายลูกสร้างวงจรอะไรก็ได้</b> เลยถูกเรียกว่า universal gates ' +
      '(ชิปจริงในโรงงานมักผลิตจาก NAND เป็นหลัก)</p>' +

      '<h2>XOR — ไฟติดเมื่อ "สอง input ต่างกัน"</h2>' +
      '<p>XOR (exclusive OR) ให้ 1 เฉพาะเมื่อ A, B <b>ไม่เท่ากัน</b> เขียนแทน <code>A⊕B</code> ' +
      'เป็น gate ที่ใช้บ่อยมากในการ <b>บวกเลข</b> (เจออีกทีในบท Half/Full Adder)</p>' +
      '<table class="tt"><tr><th>A</th><th>B</th><th>A⊕B</th></tr>' +
      '<tr><td>0</td><td>0</td><td>0</td></tr><tr><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>1</td><td>0</td><td>1</td></tr><tr><td>1</td><td>1</td><td>0</td></tr></table>' +

      '<h2>XOR ตัวปลอมจาก AND + OR + NOT</h2>' +
      '<p>ถ้าโจทย์ให้สร้าง XOR โดยใช้แต่ AND/OR/NOT จะได้สูตร <code>(A+B)·(A̅·B̅)̅</code> หรืออ่านง่ายๆ ว่า ' +
      '"(มีตัวใดตัวหนึ่งเป็น 1) และ (ไม่ใช่ ทั้งคู่เป็น 1)" — วงจรด้านล่างเทียบให้เห็นว่าผลลัพธ์เหมือน XOR ตัวจริงทุกกรณี</p>',
    summary:
      '<table class="tt"><tr><th>Gate</th><th>ไฟติด (output=1) เมื่อ</th><th>สัญลักษณ์</th></tr>' +
      '<tr><td>AND</td><td>input เป็น 1 ครบทุกตัว</td><td>A·B</td></tr>' +
      '<tr><td>OR</td><td>มี input เป็น 1 อย่างน้อย 1 ตัว</td><td>A+B</td></tr>' +
      '<tr><td>NOT</td><td>input เป็น 0</td><td>A̅</td></tr>' +
      '<tr><td>NAND</td><td>AND แล้วกลับค่า (มี 0 อยู่)</td><td>(A·B)̅</td></tr>' +
      '<tr><td>NOR</td><td>OR แล้วกลับค่า (ทุกตัวเป็น 0)</td><td>(A+B)̅</td></tr>' +
      '<tr><td>XOR</td><td>input มีจำนวน 1 เป็น "เลขคี่" (2 input = ต่างกัน)</td><td>A⊕B</td></tr></table>' +
      '<p>จำแบบสั้นๆ: <b>AND = อนุกรม, OR = ขนาน, NOT = กลับค่า, XOR = ต่างกัน</b> — bubble ที่ปลาย gate แปลว่า "กลับค่าออก"</p>',
    circuits: [
      { title: 'ทดลองวงจร AND', build: gateCircuit('AND'),
        steps: ['กด A และ B ให้เป็น 1 ทั้งคู่ — LED ติดเป็นครั้งแรก', 'กด B กลับเป็น 0 — LED ดับทันที เพราะ AND ต้องการ "ครบทุกตัว"'] },
      { title: 'ทดลองวงจร OR', build: gateCircuit('OR'),
        steps: ['กด A อย่างเดียว — LED ติดแล้ว', 'กด B เพิ่ม — ยังติดเหมือนเดิม (OR ไม่สนจำนวน)'] },
      { title: 'ทดลองวงจร NOT', build: gateCircuit('NOT'),
        steps: ['กด A สลับ 0↔1 ดูว่า LED ตรงข้ามกับ input เสมอ'] },
      { title: 'ทดลองวงจร NAND', build: gateCircuit('NAND'),
        steps: ['กด A=B=1 — LED ดับ (เพราะ AND=1 แล้ว NOT กลับเป็น 0)', 'กดอย่างอื่นที่ไม่ใช่ 1,1 — LED ติดหมด'] },
      { title: 'ทดลองวงจร NOR', build: gateCircuit('NOR'),
        steps: ['ปล่อยทุกอย่างเป็น 0 — LED ติด (กรณีเดียวที่ติด!)', 'กด A — LED ดับ'] },
      { title: 'ทดลองวงจร XOR', build: gateCircuit('XOR'),
        steps: ['กด A อย่างเดียว — ติด (ต่างกัน)', 'กด B ด้วย — ดับ (เท่ากันแล้ว)'] },
      { title: 'XOR สร้างจาก AND+OR+NOT (เทียบกับ XOR ตัวจริง)',
        build: function (sim) {
          sim.addInput('a', { x: 55, y: 40, label: 'A' });
          sim.addInput('b', { x: 55, y: 115, label: 'B' });
          sim.addGate('or1', 'OR', { x: 200, y: 60 });
          sim.addGate('and1', 'AND', { x: 200, y: 150 });
          sim.addGate('not1', 'NOT', { x: 310, y: 150 });
          sim.addGate('and2', 'AND', { x: 420, y: 95 });
          sim.addOutput('led', { x: 545, y: 95, label: '(A+B)·(AB)̅' });
          sim.wire('a', 'out', 'or1', 0, [[120, 40], [120, 53]]);
          sim.wire('b', 'out', 'or1', 1, [[120, 115], [120, 67]]);
          sim.wire('a', 'out', 'and1', 0, [[160, 40], [160, 143]]);
          sim.wire('b', 'out', 'and1', 1, [[160, 115], [160, 157]]);
          sim.wire('and1', 'out', 'not1', 0);
          sim.wire('or1', 'out', 'and2', 0, [[355, 60], [355, 88]]);
          sim.wire('not1', 'out', 'and2', 1, [[355, 150], [355, 102]]);
          sim.wire('and2', 'out', 'led', 'in');
          sim.explain('ลองกด A, B ทุกแบบแล้วเทียบกับวงจร XOR ตัวจริงด้านบน — ผลลัพธ์ต้องตรงกันทุกกรณี');
        },
        steps: ['กด A=1, B=0 — ทางบน (OR) ได้ 1 ทางล่าง (A·B แล้ว NOT) ได้ 1 → AND สุดท้าย = 1', 'กด B ด้วย — OR ยังเป็น 1 แต่ NOT(A·B) กลายเป็น 0 → ผลลัพธ์ดับ ตรงกับ XOR'] }
    ]
  });

  /* ================= บทที่ 3: Boolean Algebra ================= */
  DL.registerLesson({
    id: 'boolean-algebra',
    group: 'basics',
    title: 'Boolean Algebra & De Morgan',
    subtitle: 'เครื่องมือย่อวงจร — ลดจำนวน gate ให้เหลือน้อยที่สุด',
    html:
      '<h2>ตัวแปรและสัญลักษณ์</h2>' +
      '<p>ตัวแปร Boolean มีค่า 0 หรือ 1 เท่านั้น การคูณเขียนเป็น <code>·</code> (AND), การบวกเป็น <code>+</code> (OR), ' +
      'การกลับค่าเป็นเครื่องหมาย bar <code>A̅</code> (NOT)</p>' +

      '<h2>กฎพื้นฐานที่ต้องรู้</h2>' +
      '<table class="tt"><tr><th>ชื่อกฎ</th><th>รูป OR</th><th>รูป AND</th></tr>' +
      '<tr><td>Identity</td><td>A + 0 = A</td><td>A · 1 = A</td></tr>' +
      '<tr><td>Null</td><td>A + 1 = 1</td><td>A · 0 = 0</td></tr>' +
      '<tr><td>Idempotent</td><td>A + A = A</td><td>A · A = A</td></tr>' +
      '<tr><td>Complement</td><td>A + A̅ = 1</td><td>A · A̅ = 0</td></tr>' +
      '<tr><td>Involution</td><td colspan="2">A̿ = A</td></tr>' +
      '<tr><td>Commutative</td><td>A + B = B + A</td><td>AB = BA</td></tr>' +
      '<tr><td>Associative</td><td>(A+B)+C = A+(B+C)</td><td>(AB)C = A(BC)</td></tr>' +
      '<tr><td>Distributive</td><td>A(B+C) = AB + AC</td><td>A + BC = (A+B)(A+C)</td></tr></table>' +

      '<h2>De Morgan — ที่ออกสอบบ่อยที่สุด</h2>' +
      '<p>"ทลาย bar แล้วเปลี่ยนเครื่องหมาย + ↔ ·"</p>' +
      '<p style="text-align:center;font-size:20px"><b>(A·B)̅ = A̅ + B̅ &nbsp;&nbsp;|&nbsp;&nbsp; (A+B)̅ = A̅ · B̅</b></p>' +
      '<p>พิสูจน์ด้วย truth table (ลองครบทุกแถวแล้วทั้งสองฝั่งเท่ากัน):</p>' +
      '<table class="tt"><tr><th>A</th><th>B</th><th>(A·B)̅</th><th>A̅+B̅</th></tr>' +
      '<tr><td>0</td><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>0</td><td>1</td><td>1</td><td>1</td></tr>' +
      '<tr><td>1</td><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>1</td><td>1</td><td>0</td><td>0</td></tr></table>' +
      '<div class="note">ความหมายในชีวิตจริง: "ไม่ใช่ (ทั้งคู่)" = "อย่างน้อยหนึ่งตัวไม่ใช่" และ "ไม่ใช่ (มีสักตัว)" = "ทั้งคู่ไม่ใช่"</div>' +

      '<h2>ย่อสมการ — ตัวอย่างคลาสสิก</h2>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">F = AB + A̅B\n  = B(A + A̅)   ← แยกตัวประกอบ (Distributive)\n  = B · 1       ← Complement\n  = B           ← Identity\n→ วงจร 3 gate (2 AND + 1 OR) เหลือแค่ตัว B ตัวเดียว!</pre>',
    summary:
      '<p><b>4 กฎที่ใช้แก้ข้อสอบบ่อยสุด:</b></p>' +
      '<ol>' +
      '<li>A + A̅ = 1 และ A · A̅ = 0 (complement)</li>' +
      '<li>De Morgan: <b>(AB)̅ = A̅+B̅</b>, <b>(A+B)̅ = A̅·B̅</b> — ทลาย bar เปลี่ยนเครื่องหมาย</li>' +
      '<li>A + AB = A และ A + A̅B = A + B (absorption)</li>' +
      '<li>AB + A̅B = B และ (A+B)(A+B̅) = A</li>' +
      '</ol>' +
      '<p>แนวทางย่อ: แยกตัวประกอบ → หาคู่ complement → ทิ้งด้วยกฎ identity ทำทีละบรรทัด อย่าข้ามขั้น</p>',
    circuits: []
  });

  /* ================= บทที่ 4: Half Adder ================= */
  DL.registerLesson({
    id: 'half-adder',
    group: 'basics',
    title: 'Half Adder — วงจรบวกเลขเล็กสุด',
    subtitle: 'บวกบิตเดียว 2 ตัว ได้ผลลัพธ์ 2 บิต (S และ C)',
    html:
      '<h2>โจทย์ของวงจรบวก</h2>' +
      '<p>เราอยากให้วงจร "บวกเลข" ได้ เริ่มจากง่ายสุด: บวกบิตเดียว 2 ตัว A + B</p>' +
      '<ul>' +
      '<li>0+0 = 0 → ผลลัพธ์ (00₂)</li>' +
      '<li>0+1 = 1 → ผลลัพธ์ (01₂)</li>' +
      '<li>1+0 = 1 → ผลลัพธ์ (01₂)</li>' +
      '<li><b>1+1 = 10₂</b> ← มี 2 บิต! ต้องมีทางออก 2 เส้น</li>' +
      '</ul>' +
      '<p>เลยต้องมี output 2 ตัว: <b>S (Sum)</b> = บิตหลักหน่วย และ <b>C (Carry)</b> = บิตทด</p>' +

      '<h2>วิเคราะห์หา gate ที่ต้องใช้</h2>' +
      '<p>ดูคอลัมน์ใน truth table แล้วจะเจอ gate เก่าคู่ใจ:</p>' +
      '<ul>' +
      '<li>S = 1 เมื่อ A, B <b>ต่างกัน</b> → นั่นคือ <b>XOR</b>! (S = A⊕B)</li>' +
      '<li>C = 1 เมื่อ A, B <b>เป็น 1 ครบ</b> → นั่นคือ <b>AND</b>! (C = A·B)</li>' +
      '</ul>' +
      '<table class="tt"><tr><th>A</th><th>B</th><th>C (Carry)</th><th>S (Sum)</th></tr>' +
      '<tr><td>0</td><td>0</td><td>0</td><td>0</td></tr>' +
      '<tr><td>0</td><td>1</td><td>0</td><td>1</td></tr>' +
      '<tr><td>1</td><td>0</td><td>0</td><td>1</td></tr>' +
      '<tr><td>1</td><td>1</td><td>1</td><td>0</td></tr></table>' +
      '<div class="note">สังเกตว่า 1+1 = 10₂ : S=0, C=1 — ลองกด A=B=1 ในวงจรด้านล่างดู จะเห็น Carry ติดส่วน Sum ดับ</div>' +

      '<h2>จุดอ่อนของ Half Adder</h2>' +
      '<p>บวกจริงต้องรับ <b>ตัวทดจากหลักที่ต่ำกว่า</b> ด้วย (ลองบวก 11 + 11 ดู — หลักหน่วยบวกแล้วมีทด) ' +
      'HA รับ input แค่ 2 ตัว จึงใช้ต่อหลายบิตไม่ได้ → ต้องมี <a href="#/lesson/full-adder">Full Adder</a> ตัวต่อไป</p>',
    summary:
      '<p><b>Half Adder = XOR (สำหรับ S) + AND (สำหรับ C)</b></p>' +
      '<ul>' +
      '<li>S = A ⊕ B — บิตผลลัพธ์</li>' +
      '<li>C = A · B — ตัวทด (1 เฉพาะ 1+1)</li>' +
      '</ul>' +
      '<p>ข้อสอบชอบถาม: สร้าง HA จาก truth table → เขียนสมการ → วาดวงจร ให้ทำตาม 3 ขั้นนี้เป๊ะๆ</p>',
    circuits: [
      { title: 'ทดลอง Half Adder — บวกเลขฐานสองหลักเดียว',
        build: buildHalfAdder,
        steps: ['กด A=1 (B=0) — ได้ 1+0 = 1: S ติด C ดับ', 'กด B ด้วย — ได้ 1+1 = 10₂: C ติด S ดับ ตรงตามทฤษฎี'] }
    ]
  });

  /* ================= บทที่ 5: Full Adder ================= */
  DL.registerLesson({
    id: 'full-adder',
    group: 'basics',
    title: 'Full Adder — บวกพร้อมตัวทดเข้า',
    subtitle: 'รับ 3 input (A, B, Cin) — บล็อกพื้นฐานของการบวกหลายบิตทุกรูปแบบ',
    html:
      '<h2>ทำไม Half Adder ยังไม่พอ?</h2>' +
      '<p>บวกเลขหลายบิต เช่น 11₂ + 11₂ หลักหน่วยบวก 1+1 แล้วได้ "10" บิตทดต้อง <b>ไหลไปใส่หลักถัดไป</b> ' +
      'ดังนั้นหลักที่สองต้องบวก 3 ตัวพร้อมกัน: A + B + <b>Cin (carry in)</b> — Full Adder จึงเกิดมา</p>' +

      '<h2>สมการของ Full Adder</h2>' +
      '<p style="text-align:center;font-size:19px"><b>S = A ⊕ B ⊕ Cin</b><br><b>Cout = AB + Cin(A⊕B)</b></p>' +
      '<p>อ่านสมการ Cout ได้ว่า: "ตัวทดออกเมื่อ (สองตัวเป็น 1 พร้อมกัน) หรือ (บวกแล้วได้ทดจาก Cin)"</p>' +
      '<table class="tt"><tr><th>A</th><th>B</th><th>Cin</th><th>Cout</th><th>S</th><th>= ฐาน 10</th></tr>' +
      '<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0+0+0</td></tr>' +
      '<tr><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>0</td><td>1</td><td>1</td><td>1</td><td>0</td><td>2 = 10₂</td></tr>' +
      '<tr><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>' +
      '<tr><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>2 = 10₂</td></tr>' +
      '<tr><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>2 = 10₂</td></tr>' +
      '<tr><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>3 = 11₂</td></tr></table>' +

      '<h2>มองว่า 2×Half Adder ต่อกัน</h2>' +
      '<p>โครงสร้างที่จำง่าย: HA ตัวแรกบวก A+B → HA ตัวที่สองบวกผลกับ Cin → Carry จริง = OR ของ carry สองทาง</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">A ─┐\n   ├─[HA1]─ S1 ──┐\nB ─┘   └─C1     ├─[HA2]─ S (คำตอบ)\n        Cin ───┘  └─C2\nC1 ─[OR]─ C2 ──→ Cout</pre>' +
      '<div class="note">วงจรด้านล่างต่อจาก gate จริงตามสมการ ไม่ได้ใช้กล่อง HA สำเร็จรูป — สังเกต XOR ซ้อนกันสองตัว (S) และ AND สองตัวบวกด้วย OR (Cout)</div>' +

      '<h2>จาก Full Adder สู่เครื่องคิดเลข</h2>' +
      '<p>ต่อ FA 4 ตัวโยง Cout→Cin กันจะได้ <b>4-bit Ripple Carry Adder</b> บวกเลข 0–15 ได้ทั้งหมด ' +
      '— CPU ที่บวกเลขได้ก็เริ่มจากบล็อกเล็กๆ นี้ (ต่อยอดในบท <a href="#/lesson/computer">Computer</a>)</p>',
    summary:
      '<p><b>สมการที่ต้องจำ:</b> S = A⊕B⊕Cin · Cout = AB + Cin(A⊕B)</p>' +
      '<ul>' +
      '<li>เช็คเร็ว: จำนวน input เป็น 1 ถ้า ≤1 ตัว → Cout=0; ถ้า 2–3 ตัว → Cout=1</li>' +
      '<li>S = 1 เมื่อจำนวน input เป็น 1 เป็น "เลขคี่" (XOR ใหญ่)</li>' +
      '<li>โครงสร้าง: HA + HA + OR</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง Full Adder — บวก 3 บิต (ลองครบทั้ง 8 แบบ)',
        build: buildFullAdder,
        steps: ['กด A=B=1 (Cin=0) — 1+1 = 10₂ : Cout ติด S ดับ', 'กด Cin ด้วย (1+1+1) — ได้ 11₂ : ทั้ง Cout และ S ติดพร้อมกัน', 'ไล่กดทุก combo เทียบกับตาราง 8 แถวด้านบน'] }
    ]
  });

  /* ================= บทที่ 6: MUX ================= */
  DL.registerLesson({
    id: 'mux',
    group: 'basics',
    title: 'MUX — Multiplexer (ตัวเลือกสัญญาณ)',
    subtitle: 'หลาย input เลือกมาให้เส้นเดียวออก — สวิตช์เลือกทางของโลกดิจิทัล',
    html:
      '<h2>MUX ทำอะไร?</h2>' +
      '<p>Multiplexer คือ "สวิตช์เลือกทาง" มีข้อมูลหลายเส้น (data inputs) แต่ต้องการส่งออกทางเดียว ' +
      'จึงใช้สาย <b>select</b> เป็นตัวชี้ว่า "ให้เส้นไหนผ่าน"</p>' +
      '<p><b>กฎจำง่าย:</b> มี input ได้ 2<sup>N</sup> เส้น ต้องใช้ select N เส้น — MUX 4-to-1 มี input 4 เส้น (2²) จึงใช้ select 2 เส้น (S1 S0)</p>' +
      '<table class="tt"><tr><th>S1</th><th>S0</th><th>Y = เส้นไหนผ่าน</th></tr>' +
      '<tr><td>0</td><td>0</td><td>D0</td></tr>' +
      '<tr><td>0</td><td>1</td><td>D1</td></tr>' +
      '<tr><td>1</td><td>0</td><td>D2</td></tr>' +
      '<tr><td>1</td><td>1</td><td>D3</td></tr></table>' +
      '<p>อ่าน select แบบเลขฐานสอง: S1S0 = 10₂ = 2 → เลือก D2 (S1 คือบิตสูง)</p>' +

      '<h2>ใช้ทำอะไรในจริง?</h2>' +
      '<ul>' +
      '<li><b>เลือกแหล่งข้อมูล</b> — เช่น CPU จะเอาค่าจาก register ไหนมาคำนวณ (MUX หน้า ALU)</li>' +
      '<li><b>แชร์สายสื่อสาร</b> — ส่งข้อมูลหลายช่องทางบนสายเดียวสลับกันไป</li>' +
      '<li><b>สร้าง logic function</b> — ต่อ input เข้า select แล้วตั้งค่า D ตามตารางความจริง ก็ได้วงจรที่ต้องการโดยไม่ต้องใช้ gate เลย</li>' +
      '</ul>' +
      '<div class="note">วงจรด้านล่างตั้ง D0=D2=1, D1=D3=0 ไว้ให้ — ลองเปลี่ยน S1 S0 แล้วดูว่า LED ตาม "เลขที่ select ชี้" เสมอ</div>',
    summary:
      '<ul>' +
      '<li><b>MUX 2<sup>N</sup>-to-1 ใช้ select N เส้น</b> — 4→1 ใช้ 2, 8→1 ใช้ 3</li>' +
      '<li>Y = D(S1S0) — ค่า output มาจากเลขฐานสองที่ select ชี้</li>' +
      '<li>MUX ใหญ่สร้างจาก MUX เล็กต่อกัน (4-to-1 = 2-to-1 สามตัว)</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง MUX 4-to-1 — กด select แล้วดูว่า D ไหนผ่าน',
        build: function (sim) {
          sim.addInput('d0', { x: 60, y: 40, label: 'D0=1' });
          sim.addInput('d1', { x: 60, y: 100, label: 'D1=0' });
          sim.addInput('d2', { x: 60, y: 160, label: 'D2=1' });
          sim.addInput('d3', { x: 60, y: 220, label: 'D3=0' });
          sim.addInput('s1', { x: 60, y: 300, label: 'S1' });
          sim.addInput('s0', { x: 60, y: 360, label: 'S0' });
          sim.addComponent('mx', 'MUX4TO1', { x: 300, y: 150, w: 130, h: 120, label: 'MUX 4→1' });
          sim.addOutput('yLed', { x: 470, y: 150, label: 'Y' });
          sim.wire('d0', 'out', 'mx', 'd0', [[180, 40], [180, 68]]);
          sim.wire('d1', 'out', 'mx', 'd1', [[180, 100], [180, 86]]);
          sim.wire('d2', 'out', 'mx', 'd2', [[180, 160], [180, 104]]);
          sim.wire('d3', 'out', 'mx', 'd3', [[180, 220], [180, 122]]);
          sim.wire('s1', 'out', 'mx', 's1', [[230, 300], [230, 141]]);
          sim.wire('s0', 'out', 'mx', 's0', [[260, 360], [260, 159]]);
          sim.wire('mx', 'y', 'yLed', 'in');
          sim.explain('S1S0 = 00 → Y ตาม D0 (ตอนนี้ D0=1)');
        },
        steps: ['ปล่อย S1=S0=0 → Y = D0 = 1 (LED ติด)', 'กด S0 ขึ้น → select = 01 → Y = D1 = 0 (LED ดับ)', 'กด S1 ขึ้น, S0 ลง → select = 10 → Y = D2 = 1 (ติด)', 'กด S0 ขึ้นด้วย → 11 → Y = D3 = 0'] }
    ]
  });

  /* ================= บทที่ 7: DEMUX ================= */
  DL.registerLesson({
    id: 'demux',
    group: 'basics',
    title: 'DEMUX — Demultiplexer (ตัวแจกสัญญาณ)',
    subtitle: 'ตรงข้าม MUX — ข้อมูลเส้นเดียว แจกลงหนึ่งในหลายทางออก',
    html:
      '<h2>DEMUX ทำอะไร?</h2>' +
      '<p>ถ้า MUX คือ "หลายทางเข้า → ทางเดียวออก" DEMUX ก็คือ <b>"ทางเดียวเข้า → แจกไปหลายทางออก"</b> ' +
      'โดย select บอกว่า "แจกลงเส้นไหน" ที่เหลือติด 0 หมด</p>' +
      '<table class="tt"><tr><th>S1</th><th>S0</th><th>ทางที่ได้ข้อมูล</th></tr>' +
      '<tr><td>0</td><td>0</td><td>Y0 = D (ที่เหลือ 0)</td></tr>' +
      '<tr><td>0</td><td>1</td><td>Y1 = D</td></tr>' +
      '<tr><td>1</td><td>0</td><td>Y2 = D</td></tr>' +
      '<tr><td>1</td><td>1</td><td>Y3 = D</td></tr></table>' +

      '<h2>ความสัมพันธ์กับ Decoder</h2>' +
      '<p>DEMUX = <a href="#/lesson/decoder">Decoder</a> + สายข้อมูล D ต่อเข้า pin เปิดใช้งาน (enable) ' +
      '— decoder เปิดเส้นที่ select ชี้ แล้วสาย D เลือกว่า "เปิดจริง (ค่า 1)" หรือ "เปิดแต่ค่า 0"</p>' +

      '<h2>ใช้ทำอะไร?</h2>' +
      '<ul>' +
      '<li>ส่งข้อมูลจากต้นทางเดียวไปยัง <b>อุปกรณ์หลายตัว</b> โดยเลือกปลายทางด้วย select</li>' +
      '<li>คู่กับ MUX ยอดนิยม: MUX รวมหลายเส้นขึ้นสายเดียว → DEMUX แจกกลับที่ปลายทาง (จำลองสายหลายเส้นด้วยสายเดียว)</li>' +
      '</ul>' +
      '<div class="note">ลองกด D=1 แล้วเลื่อน S1S0 ดู — จะมี LED ติด "เส้นเดียว" ตามเลขที่ select ชี้เสมอ</div>',
    summary:
      '<ul>' +
      '<li>DEMUX 1-to-2<sup>N</sup> ใช้ select N เส้น เหมือน MUX</li>' +
      '<li>เส้นที่ถูกเลือกได้ค่า D เส้นอื่น = 0 เสมอ</li>' +
      '<li>DEMUX = Decoder + enable input</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง DEMUX 1-to-4 — ข้อมูลไหลลงทางเดียวที่ select ชี้',
        build: function (sim) {
          sim.addInput('d', { x: 60, y: 60, label: 'D' });
          sim.addInput('s1', { x: 60, y: 140, label: 'S1' });
          sim.addInput('s0', { x: 60, y: 200, label: 'S0' });
          sim.addComponent('dx', 'DEMUX1TO4', { x: 290, y: 125, w: 120, h: 110, label: 'DEMUX 1→4' });
          sim.addOutput('y0Led', { x: 470, y: 45, label: 'Y0' });
          sim.addOutput('y1Led', { x: 470, y: 100, label: 'Y1' });
          sim.addOutput('y2Led', { x: 470, y: 155, label: 'Y2' });
          sim.addOutput('y3Led', { x: 470, y: 210, label: 'Y3' });
          sim.wire('d', 'out', 'dx', 'd', [[190, 60], [190, 108]]);
          sim.wire('s1', 'out', 'dx', 's1', [[230, 140], [230, 126]]);
          sim.wire('s0', 'out', 'dx', 's0', [[260, 200], [260, 144]]);
          sim.wire('dx', 'y0', 'y0Led', 'in', [[400, 45], [400, 45]]);
          sim.wire('dx', 'y1', 'y1Led', 'in', [[400, 100], [400, 100]]);
          sim.wire('dx', 'y2', 'y2Led', 'in');
          sim.wire('dx', 'y3', 'y3Led', 'in');
          sim.explain('D=0 อยู่ ลองกด D ขึ้น 1 แล้วเลื่อน select ดู');
        },
        steps: ['กด D=1 (S=00) — Y0 ติด เส้นอื่นดับ', 'กด S0 → select=01 — ไฟย้ายไป Y1', 'ลด S0 กด S1 → select=10 — ไฟย้ายไป Y2'] }
    ]
  });

  /* ================= บทที่ 8: Decoder ================= */
  DL.registerLesson({
    id: 'decoder',
    group: 'basics',
    title: 'Decoder & จอ 7 ช่อง (7-Segment)',
    subtitle: 'แปลงเลขฐานสอง n บิต → เปิด 1 ใน 2ⁿ เส้นออก + แสดงผลเลขจริงด้วย 7-segment',
    html:
      '<h2>Decoder คืออะไร?</h2>' +
      '<p>Decoder รับเลขฐานสอง n บิต แล้วเปิด <b>ทางออกเดียว</b> จาก 2<sup>n</sup> เส้นตาม "เลขที่อ่านได้" (เรียกว่า one-hot) ' +
      'เหมือนโรงแรมมีห้อง 4 ห้อง เลข 10₂ คือ "เปิดห้อง 2 ห้องเดียว"</p>' +
      '<table class="tt"><tr><th>A1</th><th>A0</th><th>Q0</th><th>Q1</th><th>Q2</th><th>Q3</th></tr>' +
      '<tr><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>' +
      '<tr><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>' +
      '<tr><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>' +
      '<tr><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td></tr></table>' +

      '<h2>7-Segment — decoder ที่ใช้ทุกวัน</h2>' +
      '<p>จอแสดงเลขดิจิทัล (เครื่องคิดเลข นาฬิกา ไมโครคอนโทรลเลอร์) ใช้ไฟ 7 ช่องตั้งชื่อ <b>a–g</b> ' +
      'วงจร <b>BCD-to-7-segment decoder</b> (เช่น ชิป 7447/7448) แปลงเลขฐานสอง 4 บิต (0000–1001 = 0–9) ให้เป็นลวดลายไฟที่เห็นเป็นตัวเลข</p>' +
      '<p>เช่น เลข 3 = 0011₂ ต้องเปิดช่อง a, b, c, d, g (ดูจากวงจรด้านล่าง — กด 0011 แล้วนับช่องที่ติดให้ครบ 5 ช่อง)</p>' +
      '<div class="note">เลข >9 (1010–1111) ไม่มีรูปเลขมาตรฐาน จอจะดับทั้งหมด — ลองกดดู</div>' +

      '<h2>ใช้ทำอะไร?</h2>' +
      '<ul>' +
      '<li><b>เลือกชิป/หน่วยความจำ</b> — CPU ปล่อย address แล้ว decoder เลือกว่าจะคุยกับ chip ไหน (เจอในบท <a href="#/lesson/register-memory">Memory</a>)</li>' +
      '<li><b>แปลง counter เป็นตัวเลข</b> — ผลนับจากบท <a href="#/lesson/counter">Counter</a> จะถ่ายลงจอ 7-segment ผ่าน decoder พอดี</li>' +
      '</ul>',
    summary:
      '<ul>' +
      '<li>Decoder n→2<sup>n</sup> : input 10₂ เปิด Q2 เส้นเดียว (one-hot)</li>' +
      '<li>Q_i = 1 เมื่อ (A) เท่ากับเลขฐานสองของ i — เขียนสมการแต่ละเส้นด้วย AND</li>' +
      '<li>BCD→7-seg: จำ 3 รูปเลขที่ "เต็ม" คือ 8 (ทุกช่อง) — เลขอื่นเทียบจาก 8 แล้วตัดช่องออก: 1 ใช้ b,c; 7 ใช้ a,b,c; 4 ใช้ b,c,f,g</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง Decoder 2-to-4 — one-hot ตามเลข A1A0',
        build: function (sim) {
          sim.addInput('a1', { x: 60, y: 80, label: 'A1' });
          sim.addInput('a0', { x: 60, y: 150, label: 'A0' });
          sim.addComponent('dc', 'DECODER2TO4', { x: 280, y: 105, w: 120, h: 100, label: 'DEC 2→4' });
          sim.addOutput('q0Led', { x: 460, y: 40, label: 'Q0' });
          sim.addOutput('q1Led', { x: 460, y: 90, label: 'Q1' });
          sim.addOutput('q2Led', { x: 460, y: 140, label: 'Q2' });
          sim.addOutput('q3Led', { x: 460, y: 190, label: 'Q3' });
          sim.wire('a1', 'out', 'dc', 'a1', [[190, 80], [190, 92]]);
          sim.wire('a0', 'out', 'dc', 'a0', [[230, 150], [230, 118]]);
          sim.wire('dc', 'q0', 'q0Led', 'in');
          sim.wire('dc', 'q1', 'q1Led', 'in');
          sim.wire('dc', 'q2', 'q2Led', 'in');
          sim.wire('dc', 'q3', 'q3Led', 'in');
          sim.explain('A1A0 = 00 → Q0 เปิด (ห้อง 0)');
        },
        steps: ['กด A0 → select=01 — ไฟย้ายจาก Q0 ไป Q1', 'กด A1 ลด A0 → select=10 — ไฟอยู่ที่ Q2', 'กดทั้งคู่ → 11 — Q3 ติดเส้นเดียว'] },
      { title: 'ทดลอง BCD → 7-Segment — กดเลขฐานสองแล้วอ่านตัวเลข',
        build: function (sim) {
          sim.addInput('d3', { x: 60, y: 45, label: 'D3' });
          sim.addInput('d2', { x: 60, y: 115, label: 'D2' });
          sim.addInput('d1', { x: 60, y: 185, label: 'D1' });
          sim.addInput('d0', { x: 60, y: 255, label: 'D0' });
          sim.addComponent('seg', 'SEVENSEG', { x: 320, y: 150 });
          sim.wire('d3', 'out', 'seg', 'd3', [[220, 45], [220, 96]]);
          sim.wire('d2', 'out', 'seg', 'd2', [[250, 115], [250, 114]]);
          sim.wire('d1', 'out', 'seg', 'd1', [[280, 185], [280, 132]]);
          sim.wire('d0', 'out', 'seg', 'd0', [[300, 255], [300, 150]]);
          sim.explain('D3D2D1D0 = 0000 → จอแสดง 0');
        },
        steps: ['กด D2 กับ D0 → 0101 = เลข 5 — นับช่องที่ติด: a,c,d,f,g', 'กดทุกสวิตช์ → 1111 = 15 → จอดับ (เลขไม่มีรูป)', 'ตั้ง 1000 → เลข 8 ทุกช่องติด ตั้ง 1001 → 9'] }
    ]
  });

  /* ================= บทที่ 9: Encoder ================= */
  DL.registerLesson({
    id: 'encoder',
    group: 'basics',
    title: 'Encoder — ทำงานกลับ Decoder',
    subtitle: '2ⁿ เส้นเข้า → เลขฐานสอง n บิตออก (แบบ priority)',
    html:
      '<h2>Encoder ทำอะไร?</h2>' +
      '<p>Encoder ทำงาน <b>กลับด้าน</b> กับ decoder: รับเส้นหลายเส้น (มีได้ 2<sup>n</sup> เส้น) แล้วส่งออกเป็นเลขฐานสอง n บิต ' +
      'บอกว่า "เส้นไหนถูกกด/มีสัญญาณ"</p>' +
      '<p>เช่น encoder 4-to-2: กด I2 → output 10₂ = 2</p>' +

      '<h2>Priority Encoder</h2>' +
      '<p>ถ้ากดหลายเส้นพร้อมกันล่ะ? Encoder แบบ <b>priority</b> จะเลือก <b>เบอร์สูงสุด</b>เสมอ เช่น I3 กับ I1 กดพร้อมกัน → output 11 (เบอร์ 3 ชนะ)</p>' +
      '<table class="tt"><tr><th>I3</th><th>I2</th><th>I1</th><th>I0</th><th>Y1 Y0</th><th>หมายเหตุ</th></tr>' +
      '<tr><td>0</td><td>0</td><td>0</td><td>1</td><td>0 0</td><td>เบอร์ 0</td></tr>' +
      '<tr><td>0</td><td>0</td><td>1</td><td>x</td><td>0 1</td><td>เบอร์ 1</td></tr>' +
      '<tr><td>0</td><td>1</td><td>x</td><td>x</td><td>1 0</td><td>เบอร์ 2</td></tr>' +
      '<tr><td>1</td><td>x</td><td>x</td><td>x</td><td>1 1</td><td>เบอร์ 3 ชนะหมด</td></tr></table>' +
      '<p>(x = เป็นอะไรก็ได้ — ไม่สน เพราะเบอร์สูงกว่ารับไปแล้ว)</p>' +

      '<h2>ใช้ทำอะไร?</h2>' +
      '<ul>' +
      '<li><b>คีย์บอร์ด</b> — กดปุ่มเดียวใน 104 ปุ่ม encoder แปลงเป็นรหัสบิต</li>' +
      '<li><b>จัดลำดับความสำคัญ (interrupt priority)</b> — อุปกรณ์หลายตัวขอความสนใจพร้อมกัน ตัวเบอร์สูงสุด (สำคัญสุด) ได้ก่อน</li>' +
      '</ul>',
    summary:
      '<ul>' +
      '<li>Encoder = กลับของ decoder: 2<sup>n</sup> input → n output</li>' +
      '<li>แบบ priority: เบอร์สูงสุดชนะเสมอ — I3=1 → 11 ทันที ไม่สนเส้นอื่น</li>' +
      '<li>เส้นทั้งหมดเป็น 0 → output 00 (แยกไม่ออกจาก "กด I0" — encoder จริงมี pin Valid ช่วยแยก)</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง Priority Encoder 4-to-2',
        build: function (sim) {
          sim.addInput('i0', { x: 60, y: 40, label: 'I0' });
          sim.addInput('i1', { x: 60, y: 100, label: 'I1' });
          sim.addInput('i2', { x: 60, y: 160, label: 'I2' });
          sim.addInput('i3', { x: 60, y: 220, label: 'I3' });
          sim.addComponent('en', 'ENCODER4TO2', { x: 300, y: 130, w: 120, h: 115, label: 'ENC 4→2' });
          sim.addOutput('y1Led', { x: 470, y: 100, label: 'Y1' });
          sim.addOutput('y0Led', { x: 470, y: 165, label: 'Y0' });
          sim.wire('i0', 'out', 'en', 'i0', [[190, 40], [190, 86]]);
          sim.wire('i1', 'out', 'en', 'i1', [[210, 100], [210, 104]]);
          sim.wire('i2', 'out', 'en', 'i2', [[230, 160], [230, 122]]);
          sim.wire('i3', 'out', 'en', 'i3', [[250, 220], [250, 140]]);
          sim.wire('en', 'y1', 'y1Led', 'in', [[400, 100], [400, 100]]);
          sim.wire('en', 'y0', 'y0Led', 'in');
          sim.explain('ยังไม่มีใครกด → Y = 00');
        },
        steps: ['กด I1 → Y = 01 (เบอร์ 1)', 'กด I3 เพิ่ม → Y = 11 (เบอร์ 3 ชนะ priority)', 'ลด I3 เหลือ I1+I2 → Y = 10 (เบอร์ 2 ชนะ)'] }
    ]
  });
})();
