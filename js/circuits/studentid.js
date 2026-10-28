/* ===== Digital Learning — กลุ่ม E: Lab โปรเจ็กต์จริง (บทที่ 21) =====
 * จอเลื่อนรหัสนักศึกษา — สร้างจากวงจร Logisim-evolution จริง (68010659.circ,
 * ลง FPGA BLACKBOARD) ผ่านการจำลองตรวจสอบครบ 8 สถานะ:
 *   นับขึ้น: 6801 → 8010 → 0106 → 1065 → 0659 → 6596 → 5968 → 9680 → วนกลับ
 *   นับลง:   0 → 9680 → 5968 → … (สวิตช์ Y เลือกทิศ)
 * โครงสร้างตามวงจรจริง: T-FF 3 ตัว (sync) + ลอจิกเลือกทิศ
 *   T₃ = 1, T₂ = Q₀ ⊕ Y, T₁ = Ȳ·Q₁Q₀ + Y·Q̄₁Q̄₀
 *   + ตารางค้นหา (ROM) 4 ตัว → จอ 7 ผ่วน 4 ตัว
 * component: CONST1, IDROM · ทดสอบใน tests/studentid.test.js
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;
  var S = function () { return DL.Render.svgEl.apply(null, arguments); };

  var SID = DL.STUDENTID = {
    DEFAULT_ID: '68010659'
  };

  /* ================= ลอจิกล้วน (ไม่พึ่ง DOM — ทดสอบใน node ได้) ================= */

  // สตริง → เลข 8 หลัก (array) หรือ null ถ้าไม่ผ่าน
  SID.parseID = function (str) {
    if (typeof str !== 'string') return null;
    var s = str.replace(/\s+/g, '');
    if (!/^\d{8}$/.test(s)) return null;
    var out = [];
    for (var i = 0; i < 8; i++) out.push(+s[i]);
    return out;
  };

  // หน้าต่าง 4 หลักที่จอแสดง เมื่อตัวนับชี้ตำแหน่ง v (วนวงกลม mod 8)
  SID.windowAt = function (digits, v) {
    var w = [];
    for (var i = 0; i < 4; i++) w.push(digits[(((v % 8) + 8 + i) % 8)]);
    return w;
  };

  // ค่าตัวนับปัจจุบัน v = 4·Q2 + 2·Q1 + Q0 (จาก state ของ FF ในวงจร)
  SID.currentV = function (sim) {
    return sim.nodes.ff2.state.q * 4 + sim.nodes.ff1.state.q * 2 + sim.nodes.ff0.state.q;
  };

  // ตั้งรหัสใหม่ทั้งวงจร — คืน true ถ้าสำเร็จ (ต้องเป็นเลข 0-9 ครบ 8 หลัก)
  SID.applyID = function (sim, str) {
    var d = SID.parseID(str);
    if (!d) return false;
    Object.keys(sim.nodes).forEach(function (id) {
      var n = sim.nodes[id];
      if (n.kind === 'comp' && n.comp === 'IDROM') n.state.digits = d.slice();
    });
    sim.evaluate();
    sim.explain('ตั้งรหัสใหม่: ' + d.join('') + ' — กด Pulse Clock (หรือเดินอัตโนมัติ) เพื่อดูจอเลื่อน');
    sim._fire();
    return true;
  };

  // โหมดวิ่งไป-กลับ: เปลี่ยนทิศอัตโนมัติเมื่อตัวนับถึงขอบ (v=7 → ถอยหลัง, v=0 → เดินหน้า)
  SID.setBounce = function (sim, on) {
    sim._sidBounce = !!on;
    if (!sim._sidBounceHook) {           // ติดตัวฟังครั้งเดียวต่อวงจร
      sim._sidBounceHook = true;
      sim.onChange(function () {
        if (!sim._sidBounce) return;
        var v = SID.currentV(sim);
        var y = sim.nodes.y.value;
        if (v === 7 && y === 0) sim.setInput('y', 1);          // สุดขอบขวา → กลับทิศ
        else if (v === 0 && y === 1) sim.setInput('y', 0);     // สุดขอบซ้าย → กลับทิศ
      });
    }
    return sim._sidBounce;
  };

  /* ================= COMPONENTS ================= */

  // ค่าคงที่ 1 (แทน Constant ใน Logisim — ต่อเข้า T₃ ให้นับทุกจังหวะ)
  DL.registerComponent('CONST1', {
    inputs: [], outputs: ['y'],
    pinLabels: { y: '1' },
    w: 40, h: 40,
    eval: function () { return { y: 1 }; }
  });

  // ตารางค้นหา 1 หลัก: Q2Q1Q0 (สถานะ v) → BCD ของหลักที่ (v+offset) mod 8
  // ตัวแทน "codestudent" ในวงจร Logisim (48 เกต SOP) — ที่นี่ใช้ lookup เพื่ออ่านง่าย
  DL.registerComponent('IDROM', {
    inputs: ['q2', 'q1', 'q0'],
    outputs: ['d3', 'd2', 'd1', 'd0'],
    pinLabels: { q2: 'Q2', q1: 'Q1', q0: 'Q0', d3: 'D3', d2: 'D2', d1: 'D1', d0: 'D0' },
    w: 150, h: 84,
    evalNode: function (node, v) {
      var val = (v.q2 ? 4 : 0) + (v.q1 ? 2 : 0) + (v.q0 ? 1 : 0);
      var d = node.state.digits[(val + node.opts.offset) % 8];
      node.state.cur = d;
      node.state.v = val;
      return { d3: (d >> 3) & 1, d2: (d >> 2) & 1, d1: (d >> 1) & 1, d0: d & 1 };
    },
    initNode: function (node) {
      var d = node.opts.digits || SID.parseID(SID.DEFAULT_ID);
      node.state = { digits: d.slice(), cur: d[0], v: 0 };
    },
    shape: function (g, node) {
      g.appendChild(S('rect', { x: -75, y: -42, width: 150, height: 84, rx: 6, 'class': 'comp-body' }));
      var t = S('text', { x: 0, y: -22, 'class': 'comp-label' });
      t.textContent = node.opts.title || 'ROM';
      g.appendChild(t);
      var line = S('text', { x: 0, y: 6, 'class': 'comp-label', 'font-size': '17px' });
      line.setAttribute('data-line', '1');
      g.appendChild(line);
      var sub = S('text', { x: 0, y: 28, 'class': 'comp-pin-label', 'font-size': '11px' });
      sub.setAttribute('data-sub', '1');
      g.appendChild(sub);
    },
    update: function (g, node) {
      var line = g.querySelector('[data-line]');
      if (line) {
        line.textContent = 'v=' + node.state.v + ' → ' + node.state.cur;
        line.setAttribute('fill', '#16a34a');
      }
      var sub = g.querySelector('[data-sub]');
      if (sub) sub.textContent = 'เก็บรหัส: ' + node.state.digits.join('');
    }
  });

  /* ================= สร้างวงจรทั้งบล็อก (ใช้ทั้ง 2 แผง) ================= */

  function buildIdCircuit(sim, msg) {
    // --- input ทิศทาง (Input_1 ในวงจรจริง) ---
    sim.addInput('y', { x: 60, y: 230, label: 'Y ทิศ' });

    // --- ลอจิกเลือกทิศ (ตรงสมการจากวงจรจริง) ---
    sim.addComponent('const1', 'CONST1', { x: 60, y: 102 });        // T₃ = 1
    sim.addGate('ny', 'NOT', { x: 170, y: 300 });                    // Ȳ
    sim.addGate('nq1', 'NOT', { x: 170, y: 390 });                   // Q̄₁
    sim.addGate('nq0', 'NOT', { x: 170, y: 450 });                   // Q̄₀
    sim.addGate('a1', 'AND', { x: 330, y: 330, n: 3 });              // Ȳ·Q₁·Q₀
    sim.addGate('a2', 'AND', { x: 330, y: 430, n: 3 });              // Y·Q̄₁·Q̄₀
    sim.addGate('o1', 'OR', { x: 450, y: 380 });                     // T₁
    sim.addGate('x1', 'XOR', { x: 330, y: 180 });                    // T₂ = Q₀⊕Y

    // --- ตัวนับ 3 บิต (T-FF 3 ตัว ใช้ clock เดียวกัน = synchronous) ---
    sim.addComponent('ff0', 'TFF', { x: 620, y: 120 });              // Q₀ (บิตต่ำ)
    sim.addComponent('ff1', 'TFF', { x: 620, y: 250 });              // Q₁
    sim.addComponent('ff2', 'TFF', { x: 620, y: 380 });              // Q₂ (บิตสูง)

    // --- ตารางค้นหา 4 ตัว (หน้าต่างหลักที่ v, v+1, v+2, v+3) ---
    var DEFAULT = SID.parseID(SID.DEFAULT_ID);
    var romTitles = ['หลักที่ v', 'หลัก v+1', 'หลัก v+2', 'หลัก v+3'];
    for (var i = 0; i < 4; i++) {
      sim.addComponent('rom' + i, 'IDROM', {
        x: 910, y: 40 + i * 100, offset: i, title: romTitles[i], digits: DEFAULT
      });
      sim.addComponent('seg' + i, 'SEVENSEG', { x: 1130, y: 40 + i * 100 });
    }

    /* ---------- เดินสาย: ลอจิก T ---------- */
    sim.wire('const1', 'y', 'ff0', 't', [[80, 102], [400, 102], [555, 102]]);
    sim.wire('y', 'out', 'ny', 0, [[88, 230], [110, 230], [110, 300], [138, 300]]);
    sim.wire('y', 'out', 'x1', 1, [[88, 230], [260, 230], [260, 195], [298, 195]]);
    sim.wire('y', 'out', 'a2', 0, [[88, 230], [120, 230], [120, 400], [298, 400]]);
    sim.wire('ny', 'out', 'a1', 0, [[192, 300], [298, 300]]);
    sim.wire('a1', 'out', 'o1', 0, [[362, 330], [400, 330], [400, 365], [418, 365]]);
    sim.wire('a2', 'out', 'o1', 1, [[362, 430], [395, 430], [395, 395], [418, 395]]);
    sim.wire('o1', 'out', 'ff2', 't', [[482, 380], [520, 380], [520, 362], [555, 362]]);
    sim.wire('x1', 'out', 'ff1', 't', [[362, 180], [500, 180], [500, 232], [555, 232]]);

    /* ---------- เดินสาย: feedback Q กลับเข้าลอจิก (ผ่าน FF เท่านั้น) ---------- */
    sim.wire('ff0', 'q', 'x1', 0, [[685, 111], [700, 111], [700, 520], [240, 520], [240, 165], [298, 165]]);
    sim.wire('ff0', 'q', 'nq0', 0, [[685, 111], [695, 111], [695, 530], [150, 530], [150, 450], [138, 450]]);
    sim.wire('ff0', 'q', 'a1', 2, [[685, 111], [690, 111], [690, 565], [270, 565], [270, 360], [298, 360]]);
    sim.wire('ff1', 'q', 'a1', 1, [[685, 241], [706, 241], [706, 555], [280, 555], [280, 330], [298, 330]]);
    sim.wire('ff1', 'q', 'nq1', 0, [[685, 241], [712, 241], [712, 545], [145, 545], [145, 390], [138, 390]]);
    sim.wire('nq1', 'out', 'a2', 1, [[192, 390], [240, 390], [240, 430], [298, 430]]);
    sim.wire('nq0', 'out', 'a2', 2, [[192, 450], [220, 450], [220, 460], [298, 460]]);

    /* ---------- เดินสาย: Q → ROM ทั้ง 4 (bus ขนาน) ---------- */
    var romY = [40, 140, 240, 340];
    var bx0 = [760, 770, 780, 790], bx1 = [730, 736, 742, 748], bx2 = [720, 726, 732, 738];
    for (var k = 0; k < 4; k++) {
      var ry = romY[k];
      sim.wire('ff0', 'q', 'rom' + k, 'q0', [[685, 111], [bx0[k], 111], [bx0[k], ry + 18], [835, ry + 18]]);
      sim.wire('ff1', 'q', 'rom' + k, 'q1', [[685, 241], [bx1[k], 241], [bx1[k], ry], [835, ry]]);
      sim.wire('ff2', 'q', 'rom' + k, 'q2', [[685, 371], [bx2[k], 371], [bx2[k], ry - 18], [835, ry - 18]]);
      /* ROM → จอ 7 ผ่วน (BCD 4 บิต สายตรงแนวขนาน) */
      var sy = 40 + k * 100;
      sim.wire('rom' + k, 'd3', 'seg' + k, 'd3', [[985, sy - 27], [1075, sy - 27]]);
      sim.wire('rom' + k, 'd2', 'seg' + k, 'd2', [[985, sy - 9], [1075, sy - 9]]);
      sim.wire('rom' + k, 'd1', 'seg' + k, 'd1', [[985, sy + 9], [1075, sy + 9]]);
      sim.wire('rom' + k, 'd0', 'seg' + k, 'd0', [[985, sy + 27], [1075, sy + 27]]);
    }

    sim.explain(msg);
    return sim;
  }

  /* ================= วิดเจ็ตห้องทดลอง (ช่องใส่รหัส + ทิศทาง + วิ่งไป-กลับ) ================= */

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function makePlayground(sim, syncAll) {
    var SID2 = DL.STUDENTID;
    var wrap = el('div', 'id-editor');

    /* --- แถวช่องใส่รหัส --- */
    var row1 = el('div', 'id-row');
    row1.appendChild(el('span', 'ctrl-label', 'รหัส 8 หลัก:'));
    var input = el('input', 'id-input');
    input.type = 'text';
    input.maxLength = 12;
    input.placeholder = 'เช่น 68010659';
    input.value = SID2.DEFAULT_ID;
    row1.appendChild(input);
    var setBtn = el('button', 'sw-btn', 'ตั้งค่าวงจร');
    row1.appendChild(setBtn);
    var msg = el('span', 'id-status', '');
    row1.appendChild(msg);
    wrap.appendChild(row1);

    setBtn.addEventListener('click', function () {
      var okSet = SID2.applyID(sim, input.value);
      msg.textContent = okSet ? '✓ ตั้งรหัส ' + input.value.replace(/\s+/g, '') + ' แล้ว — กด Pulse/เดินอัตโนมัติ'
                              : '✗ ต้องเป็นตัวเลข 0-9 ครบ 8 หลัก';
      msg.classList.toggle('id-ok', okSet);
      msg.classList.toggle('id-err', !okSet);
      syncAll();
    });

    /* --- แถวทิศทาง + โหมดวิ่งไป-กลับ --- */
    var row2 = el('div', 'id-row');
    var fwd = el('button', 'sw-btn', '▶ เดินหน้า');
    var back = el('button', 'sw-btn', '◀ ถอยหลัง');
    fwd.title = 'Y = 0 — ตัวนับนับขึ้น จอเลื่อนไปทางซ้าย';
    back.title = 'Y = 1 — ตัวนับนับลง จอเลื่อนกลับทางขวา';
    row2.appendChild(fwd);
    row2.appendChild(back);
    var bounceChk = el('input');
    bounceChk.type = 'checkbox';
    var bounceId = 'bounce-' + Math.floor(Math.random() * 1e9);
    bounceChk.id = bounceId;
    var bounceLab = el('label', 'ctrl-label', '⇄ วิ่งไป-วิ่งกลับอัตโนมัติ (สลับทิศที่ขอบ)');
    bounceLab.htmlFor = bounceId;
    row2.appendChild(bounceChk);
    row2.appendChild(bounceLab);
    wrap.appendChild(row2);

    fwd.addEventListener('click', function () { sim.setInput('y', 0); });
    back.addEventListener('click', function () { sim.setInput('y', 1); });
    bounceChk.addEventListener('change', function () {
      SID2.setBounce(sim, bounceChk.checked);
      syncAll();
    });

    /* --- บรรทัดสถานะปัจจุบัน --- */
    var pos = el('div', 'id-pos', '');
    wrap.appendChild(pos);

    sim.onChange(function () {
      var y = sim.nodes.y.value;
      fwd.classList.toggle('on', y === 0);
      back.classList.toggle('on', y === 1);
      var v = SID2.currentV(sim);
      var digits = sim.nodes.rom0.state.digits;
      var win = SID2.windowAt(digits, v).join('');
      pos.textContent = 'สถานะ v = ' + v + ' → จอแสดง ' + win +
        ' · ทิศ: ' + (y === 0 ? 'เดินหน้า ▶' : 'ถอยหลัง ◀') +
        (sim._sidBounce ? ' · โหมดวิ่งไป-กลับ' : '');
    });

    return wrap;
  }

  /* ================= บทที่ 21 ================= */

  DL.registerLesson({
    id: 'student-id',
    group: 'lab',
    title: 'Lab: จอเลื่อนรหัสนักศึกษา',
    subtitle: 'จากวงจร Logisim จริงที่ลงบอร์ด FPGA BLACKBOARD · ตัวนับ 3 บิต + ตารางค้นหา + จอ 7 ผ่วน 4 ตัว — เปลี่ยนรหัสแล้วรันเองได้',
    html:
      '<h2>โจทย์จริง: ใส่รหัสนักศึกษาลงจอ แล้วให้วิ่งทีละหลัก</h2>' +
      '<p>งานนี้มาจากวงจร Logisim จริง (<code>68010659.circ</code>) ที่ออกแบบให้ <b>รหัสนักศึกษา 68010659 เลื่อนวนไปบนจอ 7 ผ่วน 4 ตัว</b> ' +
      'แล้วลง (download) ไปยังบอร์ด FPGA BLACKBOARD ทุกครั้งที่ clock เต้น 1 ครั้ง จอจะเลื่อนหน้าต่างไป 1 ตำแหน่ง:</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">เริ่ม   →  [6][8][0][1]   ← เห็น 4 หลักแรกของ 68010659\npulse  →  [8][0][1][0]   ← เลื่อนซ้าย หลักใหม่โผล่ทางขวา\npulse  →  [0][1][0][6]\n   … ครบ 8 จังหวะ วนกลับไป [6][8][0][1] ใหม่ (วงจรวนรอบไม่มีวันหลุด)</pre>' +

      '<h2>แนวคิดหลัก 3 อย่าง</h2>' +
      '<ol>' +
      '<li><b>ตัวนับ = ตัวชี้ตำแหน่ง (pointer)</b> — รหัสมี 8 หลัก เราจึงใช้ตัวนับ 3 บิต (2³ = 8 สถานะพอดี) ' +
      'แทน "ตอนนี้มองอยู่ตำแหน่งไหนของรหัส" นับขึ้น = เลื่อนไปข้างหน้า, นับลง = เลื่อนย้อนกลับ</li>' +
      '<li><b>ตารางค้นหา = ROM ย่อยเดินได้</b> — วงจรชื่อ <code>codestudent</code> ในไฟล์จริงใช้เกต AND/OR 48 ตัว (SOP) ' +
      'ทำหน้าที่เหมือนสมุดทะเบียน: "ถ้าสถานะเป็น v ให้ส่งหลักที่ v, v+1, v+2, v+3 ออกไป 4 ชุด" ' +
      '— นี่คือ ROM/lookup table ที่ถูก "วาด" ด้วยเกต ไม่ใช่ชิปหน่วยความจำจริง (หลักการเดียวกับบทที่ 17)</li>' +
      '<li><b>หน้าต่างบานเลื่อนวงกลม (circular window)</b> — จอ 4 ตัวโชว์ทีละ 4 หลัก พอชี้ถึงท้ายรหัสก็วนกลับหัว ' +
      '(หลักที่ (v+3) mod 8) เลยไม่มีวัน "หลุดจอ" — สังเกตได้จากตารางด้านล่าง: v=5 จอแสดง 6596 คือ 6,5,9 จากท้าย + วนกลับไอ่ 6 ตัวแรก</li>' +
      '</ol>' +

      '<h2>ตารางค้นหาของ 68010659 (หัวใจของวงจร)</h2>' +
      '<table class="tt"><tr><th>v (Q₂Q₁Q₀)</th><th>จอ 1</th><th>จอ 2</th><th>จอ 3</th><th>จอ 4</th><th>อ่านว่า</th></tr>' +
      '<tr><td>0 (000)</td><td>6</td><td>8</td><td>0</td><td>1</td><td>ต้นรหัส 6801</td></tr>' +
      '<tr><td>1 (001)</td><td>8</td><td>0</td><td>1</td><td>0</td><td>เลื่อนไป 1</td></tr>' +
      '<tr><td>2 (010)</td><td>0</td><td>1</td><td>0</td><td>6</td><td>เลื่อนไป 2</td></tr>' +
      '<tr><td>3 (011)</td><td>1</td><td>0</td><td>6</td><td>5</td><td>กลางรหัส 1065</td></tr>' +
      '<tr><td>4 (100)</td><td>0</td><td>6</td><td>5</td><td>9</td><td>ท้ายรหัส 0659</td></tr>' +
      '<tr><td>5 (101)</td><td>6</td><td>5</td><td>9</td><td>6</td><td>เริ่มวนกลับ ↺</td></tr>' +
      '<tr><td>6 (110)</td><td>5</td><td>9</td><td>6</td><td>8</td><td>วนกลับต่อ</td></tr>' +
      '<tr><td>7 (111)</td><td>9</td><td>6</td><td>8</td><td>0</td><td>วนกลับ แล้วกลับ v=0</td></tr></table>' +
      '<div class="note">ทุกแถวในตารางนี้ "ตรวจสอบแล้ว" ด้วยการจำลองวงจรจริงครบทั้ง 8 สถานะ ทั้งนับขึ้นและนับลง — วงจรในไฟล์ทำงานถูกต้อง 100%</div>' +

      '<h2>หลักการทำงานทีละส่วน</h2>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">Y ──→ ┌────────────────┐      ┌─────┐         ┌──────┐  D3..D0 ┌─────────┐\n      │ ลอจิกเลือกทิศ   │ T→[T-FF 3 ตัว]→ Q₂Q₁Q₀ →│ ตาราง │────────→│ จอ 7 ผ่วน │ ×4\n      │ (XOR/AND/OR)   │      │ sync │         │ (ROM) │         └─────────┘\n  Q ──→└────────────────┘  CLK ─┴─────┴─────────┴──────┘</pre>' +
      '<p><b>ส่วนที่ 1 — ตัวนับ 3 บิต (T-FF 3 ตัวแบบ synchronous):</b> ทุกตัวใช้ clock สายเดียวกัน (บทที่ 15) ' +
      'T ของแต่ละตัวถูกคุมด้วยสมการที่ออกแบบจาก excitation table (บทที่ 15):</p>' +
      '<p style="text-align:center;font-size:18px"><b>T₃ = 1 &nbsp;&nbsp;·&nbsp;&nbsp; T₂ = Q₀ ⊕ Y &nbsp;&nbsp;·&nbsp;&nbsp; T₁ = Ȳ·Q₁Q₀ + Y·Q̄₁Q̄₀</b></p>' +
      '<ul>' +
      '<li><b>T₃ = 1</b> (ค่าคงที่ — ต่อจาก Constant ใน Logisim): บิตต่ำสุด toggle ทุก pulse ไงครับ หัวใจของตัวนับ (บทที่ 16)</li>' +
      '<li><b>T₂ = Q₀ ⊕ Y</b> — เจ้า XOR ตัวเดียวคือเวทมนตร์ของวงจร: Y=0 ได้ T₂=Q₀ (นับขึ้นปกติ), Y=1 ได้ T₂=Q̄₀ (กลายเป็นเงื่อนไขนับลง!) ' +
      'เขียนสมการเดียวครอบทั้งสองโหมดเลย</li>' +
      '<li><b>T₁ = Ȳ·Q₁Q₀ + Y·Q̄₁Q̄₀</b> — OR สองทาง: โหมดเดินหน้า toggle เมื่อ Q₁Q₀=11, โหมดถอยหลัง toggle เมื่อ Q₁Q₀=00 ' +
      '(สังเกตว่า <b>สมการไม่ใช้ Q₂ เลย</b> — ในไฟล์จริง pin Q₂ ของ counter เลยไม่มีสายต่อ ซึ่งถูกต้องแล้ว เพราะสมการมาตรฐานของ up/down counter ไม่จำเป็นต้องใช้บิตสูงสุด)</li>' +
      '</ul>' +
      '<p><b>ส่วนที่ 2 — ตารางค้นหา:</b> ในไฟล์จริงเป็นเกต 48 ตัวรับ Q₂Q₁Q₀ แล้วคาย BCD ออก 16 เส้น (4 จอ × 4 บิต) ' +
      'ในบทเรียนนี้เราจัดกลุ่มใหม่เป็นบล็อก "ROM หลักที่ v / v+1 / v+2 / v+3" ให้เห็นภาพหน้าต่างเลื่อนชัดขึ้น — หลักการเดียวกัน</p>' +
      '<p><b>ส่วนที่ 3 — จอ + การสแกน (MUX):</b> วงจรจริงมี MUX 4 ทาง + ตัวนับ 2 บิต (วน 0-3) สแกนดึงจอทีละตัวไปโชว์ที่จอจริงตัวเดียวของบอร์ด ' +
      '(เทคนิค <b>multiplexed display</b> — ประหยัดขา FPGA โดยสลับจอเร็ว ๆ จนตาลวงว่าติดพร้อมกัน หลักเดียวกับ LED บนบอร์ดไมโครคอนโทรลเลอร์ทั่วไป)</p>' +
      '<div class="warn">บอร์ด BLACKBOARD ไฟล์นี้ตั้งค่า boardmap ไว้เรียบร้อย (Input_1 = ปุ่มบนบอร์ด, จอ 7 ผ่วน, Output_bus) — เปิดใน Logisim-evolution แล้วกด download ลงบอร์ดได้เลย ในเว็บนี้เราจำลองพฤติกรรมเดียวกันทั้งระบบ</div>',

    summary:
      '<ul>' +
      '<li>ตัวนับ 3 บิต = ตัวชี้ตำแหน่งในรหัส 8 หลัก · ตารางค้นหา (SOP gates = ROM จำลอง) ดึงหน้าต่าง 4 หลัก (v..v+3 mod 8)</li>' +
      '<li>สมการตัวนับ: <b>T₃=1 · T₂=Q₀⊕Y · T₁=ȲQ₁Q₀+YQ̄₁Q̄₀</b> — XOR ตัวเดียวสลับโหมด นับขึ้น/นับลง</li>' +
      '<li>วงจรวนรอบ (mod 8) จึงเลื่อนไม่มีวันหลุด — ลำดับ 6801→8010→0106→1065→0659→6596→5968→9680→วนกลับ</li>' +
      '<li>จอจริงบนบอร์ดใช้เทคนิค <b>multiplexing</b>: ตัวนับ 0-3 + MUX สแกนทีละหลักเร็ว ๆ ประหยัดขา FPGA</li>' +
      '<li>ครบทั้งสามบท: counter (16) + ROM/lookup (17) + synchronous design (15) มาประกอบเป็นโปรเจ็กต์จริง</li>' +
      '</ul>',

    circuits: [
      {
        title: 'วงจรต้นฉบับ — รหัส 68010659 (สวิตช์ Y เลือก เดินหน้า/ถอยหลัง)',
        wide: true,
        build: function (sim) {
          buildIdCircuit(sim,
            'Y=0 (เดินหน้า) — กด Pulse Clock ทีละครั้งแล้วดูจอ 4 ตัวเลื่อนรหัส 68010659 ไปทีละตำแหน่ง หรือติ๊กเดินอัตโนมัติ');
        },
        steps: [
          'กด Pulse Clock ทีละครั้ง — เทียบจอกับตารางด้านบน: 6801 → 8010 → 0106 → … → 9680 → วนกลับ 6801',
          'สังเกตบล็อก ROM: "v=3 → 1" หมายถึง ตอนนี้ตัวนับชี้ v=3 และบล็อกนี้ส่งหลักที่ 3 (คือ 1) ออกไป',
          'กดสวิตช์ Y = 1 (ถอยหลัง) แล้ว pulse — จอเลื่อนกลับทางขวา: 6801 → 9680 → 5968 → …',
          'ติ๊กเดินอัตโนมัติ เลื่อนความเร็ว แล้วนั่งดูรหัสวิ่งวนรอบ — สาย Q ที่ไหลย้อนกลับเข้าเกตคือ feedback ผ่าน FF จากบทที่ 14'
        ]
      },
      {
        title: 'ห้องทดลอง — ใส่รหัส 8 หลักของคุณเอง แล้วให้วิ่งไป-วิ่งกลับ',
        wide: true,
        build: function (sim) {
          buildIdCircuit(sim,
            'แก้ช่องรหัสด้านบน (เช่นรหัสเพื่อนคุณ) กด "ตั้งค่าวงจร" แล้ว pulse — ตารางค้นหาจะถูกเขียนใหม่ทันที');
        },
        extra: function (sim, syncAll) { return makePlayground(sim, syncAll); },
        steps: [
          'พิมพ์รหัส 8 หลักอื่น (เช่น 12345678) กด "ตั้งค่าวงจร" — บล็อก ROM ทุกตัวเปลี่ยนข้อมูลทันที แล้ว pulse ดูจอเลื่อนเลขใหม่',
          'ใช้ปุ่ม ▶/◀ สลับทิศระหว่างรันได้เลย — ไม่ต้องหยุดก่อน',
          'ติ๊ก "วิ่งไป-วิ่งกลับอัตโนมัติ" แล้วเปิดเดินอัตโนมัติ — ถึง v=7 จะกลับทิศเอง ถึง v=0 ก็กลับอีก วิ่งไป-มาไม่รู้จบ',
          'ลองพิมพ์เลขผิด ๆ ดู (ตัวอักษร/ไม่ครบ 8 หลัก) — วงจรปฏิเสธและคงรหัสเดิม ป้องกันการพังแบบเดียวกับ input validation จริง'
        ]
      }
    ]
  });
})();
