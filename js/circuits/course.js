/* ===== Digital Learning — กลุ่ม D: บทเรียนจากสไลด์ บท 8–12 (บทที่ 16–20) =====
 * component ประกอบ: ASTABLE, MONO, RAM4, R2RDAC, VMETER, ADC4, CPUDEMO
 * ตรรกะทดสอบใน tests/course.test.js ผ่าน build ของบท
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;
  var S = function () { return DL.Render.svgEl.apply(null, arguments); };

  /* ================= COMPONENTS ================= */

  /* --- 555 astable (จำลองเป็น toggle อัตโนมัติทุกครึ่งจังหวะ) --- */
  DL.registerComponent('ASTABLE', {
    inputs: [], outputs: ['q'], isFF: true, w: 130, h: 64,
    pinLabels: { q: 'OUT' },
    evalNode: function (node) { return { q: node.state.q }; },
    initNode: function (node) { node.state = { q: 0 }; },
    edge: function (state) { return state.q ? 0 : 1; },
    explain: function (n, before, after) {
      return '555 astable (จำลอง): ครึ่งจังหวะถัดไป OUT ' + before + '→' + after +
             ' — สัญญาณกะพริบต่อเนื่องเอง ไม่มี input ให้ควบคุม';
    },
    shape: DL.FFShape('555 Astable'), update: DL.FFUpdate
  });

  /* --- monostable one-shot: trigger แล้วยิง 1 ชั่วคราว (3 จังหวะจำลอง) --- */
  DL.registerComponent('MONO', {
    inputs: ['trg'], outputs: ['q'], isFF: true, w: 130, h: 74,
    pinLabels: { trg: 'TRG', q: 'OUT' },
    evalNode: function (node, v) {
      if (v.trg === 1 && node.state.prevTrg === 0) node.state.armed = true;  // ขอบขึ้นของ trigger
      node.state.prevTrg = v.trg;
      return { q: node.state.q };
    },
    initNode: function (node) { node.state = { q: 0, count: 0, prevTrg: 0, armed: false }; },
    edge: function (state) {
      if (state.armed) { state.armed = false; state.count = 3; return 1; }  // ยิง one-shot
      if (state.q === 1) {
        state.count--;
        if (state.count <= 0) return 0;                                     // หมดเวลา ดับเอง
      }
      return state.q;
    },
    explain: function (n, before, after) {
      if (after === 1) return 'Monostable: โดน trigger → OUT ยิง 1 ชั่วคราว (จำลอง 3 จังหวะ)';
      if (before === 1 && after === 0) return 'Monostable: ครบเวลา → OUT ดับกลับสถานะนิ่งเอง';
      return 'Monostable: OUT = ' + after + ' (รอ trigger)';
    },
    shape: DL.FFShape('One-shot'), update: DL.FFUpdate
  });

  /* --- RAM 4 คำ × 2 บิต (level write เมื่อ WE=1) --- */
  DL.registerComponent('RAM4', {
    inputs: ['a1', 'a0', 'd1', 'd0', 'we'],
    outputs: ['o1', 'o0'], w: 160, h: 128,
    pinLabels: { a1: 'A1', a0: 'A0', d1: 'D1', d0: 'D0', we: 'WE', o1: 'O1', o0: 'O0' },
    evalNode: function (node, v) {
      var a = (v.a1 ? 2 : 0) + (v.a0 ? 1 : 0);
      if (v.we === 1) node.state.mem[a] = (v.d1 ? 2 : 0) + (v.d0 ? 1 : 0);
      var val = node.state.mem[a];
      return { o1: (val >> 1) & 1, o0: val & 1 };
    },
    initNode: function (node) { node.state = { mem: [0, 0, 0, 0] }; },
    shape: function (g, node) {
      g.appendChild(S('rect', { x: -80, y: -64, width: 160, height: 128, rx: 6, 'class': 'comp-body' }));
      var t = S('text', { x: 0, y: -48, 'class': 'comp-label' });
      t.textContent = 'RAM 4×2';
      g.appendChild(t);
      for (var r = 0; r < 4; r++) {
        var row = S('text', { x: 10, y: -26 + r * 20, 'class': 'comp-pin-label', 'text-anchor': 'start' });
        row.setAttribute('data-row', r);
        g.appendChild(row);
      }
    },
    update: function (g, node) {
      for (var r = 0; r < 4; r++) {
        var row = g.querySelector('[data-row="' + r + '"]');
        if (row) {
          row.textContent = r + ': ' + node.state.mem[r];
          row.setAttribute('fill', node.state.mem[r] ? '#16a34a' : '#94a3b8');
        }
      }
    }
  });

  /* --- R-2R DAC: 4 บิต → แรงดัน (จำลอง 0–15 หน่วย) --- */
  DL.registerComponent('R2RDAC', {
    inputs: ['b3', 'b2', 'b1', 'b0'], outputs: ['v'], w: 130, h: 108,
    pinLabels: { b3: 'B3', b2: 'B2', b1: 'B1', b0: 'B0', v: 'V' },
    eval: function (v) {
      return { v: (v.b3 ? 8 : 0) + (v.b2 ? 4 : 0) + (v.b1 ? 2 : 0) + (v.b0 ? 1 : 0) };
    }
  });

  /* --- มาตรวัดแรงดันจำลอง (แสดง bar + ตัวเลข) --- */
  DL.registerComponent('VMETER', {
    inputs: ['v'], outputs: [], w: 120, h: 150,
    evalNode: function (node, v) {
      node.state.v = (typeof v.v === 'number') ? v.v : 0;
      return {};
    },
    initNode: function (node) { node.state = { v: 0 }; },
    shape: function (g, node) {
      g.appendChild(S('rect', { x: -60, y: -75, width: 120, height: 150, rx: 6, 'class': 'comp-body' }));
      g.appendChild(S('rect', { x: -44, y: -58, width: 30, height: 116, rx: 3, fill: '#e2e8f0' }));
      var bar = S('rect', { x: -44, y: 58, width: 30, height: 0, rx: 3, fill: '#22c55e' });
      bar.setAttribute('data-bar', '1');
      g.appendChild(bar);
      var txt = S('text', { x: 20, y: -62, 'class': 'comp-pin-label', 'text-anchor': 'start', 'font-size': '15px' });
      txt.setAttribute('data-vtxt', '1');
      g.appendChild(txt);
      var lab = S('text', { x: 20, y: -44, 'class': 'comp-pin-label', 'text-anchor': 'start', 'font-size': '11px' });
      lab.textContent = '(จำลอง 0–15)';
      g.appendChild(lab);
    },
    update: function (g, node) {
      var v = node.state.v;
      var bar = g.querySelector('[data-bar]');
      if (bar) {
        var h = v / 15 * 116;
        bar.setAttribute('height', h);
        bar.setAttribute('y', 58 - h);
      }
      var txt = g.querySelector('[data-vtxt]');
      if (txt) txt.textContent = v + ' V';
    }
  });

  /* --- SAR ADC 4 บิต: ทายทีละบิตด้วย successive approximation --- */
  DL.registerComponent('ADC4', {
    inputs: ['t3', 't2', 't1', 't0'], outputs: ['done'],
    isFF: true, w: 150, h: 100, hasQ: false,
    pinLabels: { t3: 'T3', t2: 'T2', t1: 'T1', t0: 'T0', done: 'DONE' },
    evalNode: function (node, v) {
      node.state.target = (v.t3 ? 8 : 0) + (v.t2 ? 4 : 0) + (v.t1 ? 2 : 0) + (v.t0 ? 1 : 0);
      return { done: node.state.done };
    },
    initNode: function (node) { node.state = { step: 0, acc: 0, done: 0, target: 0 }; },
    edge: function (state) {
      if (state.done) return undefined;                      // ทายเสร็จแล้ว — ไม่ทำอะไร
      var bit = 3 - state.step;
      var test = state.acc | (1 << bit);
      if (test <= state.target) state.acc = test;            // ทายสูงขึ้นได้ → เก็บบิต
      state.step++;
      if (state.step >= 4) state.done = 1;
      return undefined;
    },
    explain: function (n, before, after) {
      var st = n.state;
      if (st.done && st.step >= 4) {
        return 'ADC SAR: ทายครบ 4 บิต → ผลลัพธ์ ' + st.acc +
               ' (' + ((st.acc >> 3) & 1) + ((st.acc >> 2) & 1) + ((st.acc >> 1) & 1) + (st.acc & 1) + '₂) ตรง target ✓';
      }
      var bit = 4 - st.step;
      return 'ADC SAR: จังหวะที่ ' + st.step + '/' + 4 + ' — ลองบิตที่ ' + bit +
             ': รวมชั่วคราว ' + st.acc + ' (≤ target ' + st.target + ' เก็บ, มากกว่า → ทิ้ง)';
    },
    shape: function (g, node) {
      g.appendChild(S('rect', { x: -75, y: -50, width: 150, height: 100, rx: 6, 'class': 'comp-body' }));
      var t = S('text', { x: 0, y: -30, 'class': 'comp-label' });
      t.textContent = 'ADC (SAR)';
      g.appendChild(t);
      var a = S('text', { x: 0, y: 12, 'class': 'comp-label', 'font-size': '17px' });
      a.setAttribute('data-acc', '1');
      g.appendChild(a);
      var s = S('text', { x: 0, y: 34, 'class': 'comp-pin-label' });
      s.setAttribute('data-step', '1');
      g.appendChild(s);
    },
    update: function (g, node) {
      var st = node.state;
      var bits = ((st.acc >> 3) & 1) + '' + ((st.acc >> 2) & 1) + '' + ((st.acc >> 1) & 1) + '' + (st.acc & 1);
      var a = g.querySelector('[data-acc]');
      if (a) {
        a.textContent = st.done ? bits + '₂ ✓' : bits;
        a.setAttribute('fill', st.done ? '#16a34a' : '#334155');
      }
      var s = g.querySelector('[data-step]');
      if (s) s.textContent = st.done ? 'done' : ('ทายบิต ' + (4 - st.step) + '/4 · target ' + st.target);
    }
  });

  /* --- mini CPU: fetch-execute โปรแกรม 4 คำสั่ง --- */
  var CPU_PROG = [
    { op: 'LDA', arg: 3, th: 'LOAD 3: ACC ← MEM[3]' },
    { op: 'ADD', arg: 2, th: 'ADD 2: ACC ← ACC + MEM[2]' },
    { op: 'STO', arg: 1, th: 'STORE 1: MEM[1] ← ACC' },
    { op: 'HALT', arg: 0, th: 'HALT: หยุดทำงาน' }
  ];
  DL.registerComponent('CPUDEMO', {
    inputs: [], outputs: ['halt'],
    isFF: true, w: 210, h: 170, hasQ: false,
    pinLabels: { halt: 'HALT' },
    evalNode: function (node) { return { halt: node.state.halted ? 1 : 0 }; },
    initNode: function (node) {
      node.state = { pc: 0, ir: null, acc: 0, halted: false, mem: [0, 0, 2, 7], last: 'รอ pulse...' };
    },
    edge: function (state) {
      if (state.halted) { state.last = 'HALT อยู่แล้ว — กด รีเซ็ต เพื่อเริ่มใหม่'; return undefined; }
      var ins = CPU_PROG[state.pc];
      state.ir = ins;
      if (ins.op === 'LDA') { state.acc = state.mem[ins.arg]; state.last = 'execute: ' + ins.th + ' → ACC = ' + state.acc; }
      else if (ins.op === 'ADD') { state.acc += state.mem[ins.arg]; state.last = 'execute: ' + ins.th + ' → ACC = ' + state.acc; }
      else if (ins.op === 'STO') { state.mem[ins.arg] = state.acc; state.last = 'execute: ' + ins.th + ' → MEM[1] = ' + state.mem[1]; }
      else { state.halted = true; state.last = 'execute: HALT — โปรแกรมจบ'; return undefined; }
      state.pc++;
      return undefined;
    },
    explain: function (n) {
      var st = n.state;
      var ins = CPU_PROG[st.pc];
      if (st.halted) return 'CPU: HALT — เสร็จสมบูรณ์ (ACC = ' + st.acc + ', MEM[1] = ' + st.mem[1] + ')';
      return 'CPU: fetch ที่ PC=' + st.pc + ' → IR = ' + ins.op + ' ' + ins.arg +
             ' (' + ins.th + ')';
    },
    shape: function (g, node) {
      g.appendChild(S('rect', { x: -105, y: -85, width: 210, height: 170, rx: 8, 'class': 'comp-body' }));
      var t = S('text', { x: 0, y: -65, 'class': 'comp-label' });
      t.textContent = 'CPU (จำลอง fetch-execute)';
      g.appendChild(t);
      var rows = S('text', { x: -95, y: -40, 'class': 'comp-pin-label', 'text-anchor': 'start', 'font-size': '12.5px' });
      rows.setAttribute('data-rows', '1');
      g.appendChild(rows);
    },
    update: function (g, node) {
      var st = node.state;
      var rows = g.querySelector('[data-rows]');
      if (rows) {
        var ins = st.ir;
        var lines = [
          'PC = ' + st.pc + '   IR = ' + (ins ? ins.op + ' ' + ins.arg : '—'),
          'ACC = ' + st.acc,
          'MEM = [' + st.mem.join(', ') + ']',
          st.last
        ];
        rows.textContent = lines.join('\n');
      }
    }
  });

  /* ================= บทที่ 16: Counter (PDF 08) ================= */
  DL.registerLesson({
    id: 'counter',
    group: 'course',
    title: 'Counter — ตัวนับ 4 บิต & Decade',
    subtitle: 'สไลด์บท 8 · ต่อ T-FF โยงกันได้ตัวนับ — แบบ async (ripple) และ decade (mod-10)',
    slide: '08 Counter.pdf',
    html:
      '<h2>จาก T-FF สู่ตัวนับ</h2>' +
      '<p>บทที่ 13 เราเห็นว่า T-FF หารความถี่ 2 ถ้าเอา <b>Q ของ FF ตัวหน้า</b> ไปเป็น clock ของตัวถัดไป ' +
      'ความถี่จะถูกหารซ้ำเป็น 2, 4, 8, 16 — ถ้ามองสถานะ Q3Q2Q1Q0 รวมกันเป็นเลขฐานสอง มันจะ <b>นับ 0,1,2,3,…</b> เองด้วย!</p>' +

      '<h2>Asynchronous (Ripple) Counter</h2>' +
      '<p>ชื่อ "async" เพราะ FF แต่ละตัวได้ clock จาก "FF ตัวก่อนหน้า" ไม่ใช่จากสาย clock กลาง — สัญญาณจึง <b>ไหลทีละตัว</b> เหมือนกระดานโดมิโน (ริปเปิล) ข้อดีคือวงจรง่าย ข้อเสียคือช้าลงตามจำนวนบิต (แต่ละตัวรอตัวก่อน) และเวลาอ่านค่ากลางๆ อาจเจอค่าชั่วคราว (glitch)</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">CLK→[FF0]─Q0─→[FF1]─Q1─→[FF2]─Q2─→[FF3]─Q3\n    (ขอบขึ้น: ต่อด้วย Q̄ ของตัวก่อนเพื่อให้นับ "ขึ้น")</pre>' +
      '<div class="note">ทำไมต่อด้วย Q̄? FF ของเราเป็นขอบขั้น (positive-edge) นับขึ้นต้องให้ตัวถัดไปยิงเมื่อ Q ของตัวก่อน "ลด" (1→0) — ซึ่งเท่ากับ Q̄ "ขึ้น" นั่นเอง ถ้าต่อด้วย Q ตรงๆ จะได้ตัวนับลด (down counter)</div>' +

      '<h2>Decade Counter (Mod-10)</h2>' +
      '<p>มนุษย์ชอบเลขฐานสิบ เราจึงเอาตัวนับ 4 บิต (นับได้ 0–15) มา <b>บังคับให้วนแค่ 0–9</b>: วาง logic คอยดู ' +
      'ถ้าค่ากำลังจะเป็น 10 (1010₂ คือ Q3=1 พร้อม Q1=1) ให้ยิงสัญญาณ <b>CLR</b> (async clear) ล้างทุกบิตเป็น 0 ทันที</p>' +
      '<p>ลองกด pulse ในวงจรที่สองแล้วดู: นับถึง 9 แล้ว แตะ 10 ตื่น → โดนล้างกลับ 0 ในจังหวะเดียว</p>' +
      '<div class="warn">7-segment แสดงได้แค่ 0–9 ค่า 10–15 จอจะดับ (สังเกตได้ในวงจร ripple ตัวแรก — นับเกิน 9 แล้วดูจอ)</div>',
    summary:
      '<ul>' +
      '<li>T-FF โยงกัน (Q̄ ตัวก่อน → CLK ตัวถัด) = <b>async ripple up-counter</b> หารความถี่ 2,4,8,16</li>' +
      '<li>ต่อด้วย Q ตรงๆ = นับลด (down counter)</li>' +
      '<li>Decade counter = ripple + <b>AND(Q3,Q1) → CLR</b> บังคับวน 0–9 (mod-10)</li>' +
      '<li>Synchronous counter (FF ทุกตัวใช้ CLK เดียว) เร็วกว่า ไม่มี glitch แต่ logic ยุ่งกว่า</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง 4-bit Async Ripple Counter + จอ 7 ช่อง (ลองเปิดเดินอัตโนมัติ!)',
        wide: true,
        build: function (sim) {
          sim.addInput('en', { x: 60, y: 200, label: 'EN' });
          var xs = [270, 400, 530, 660];
          for (var i = 0; i < 4; i++) {
            sim.addComponent('ff' + i, 'TFF', { x: xs[i], y: 110,
              clockFrom: i > 0 ? ('ff' + (i - 1) + ':qn') : undefined });
            sim.addOutput('q' + i + 'Led', { x: xs[i], y: 210, label: 'Q' + i });
            sim.wire('en', 'out', 'ff' + i, 't', [[150 + i * 8, 200], [150 + i * 8, 78 + i * 8]]);
            sim.wire('ff' + i, 'q', 'q' + i + 'Led', 'in');
          }
          sim.addComponent('seg', 'SEVENSEG', { x: 830, y: 110 });
          sim.wire('ff3', 'q', 'seg', 'd3', [[725, 95], [750, 95], [750, 96]]);
          sim.wire('ff2', 'q', 'seg', 'd2', [[700, 110], [760, 110], [760, 114]]);
          sim.wire('ff1', 'q', 'seg', 'd1', [[675, 125], [770, 125], [770, 132]]);
          sim.wire('ff0', 'q', 'seg', 'd0', [[725, 140], [780, 140], [780, 150]]);
          sim.explain('EN=1 แล้วกด Pulse Clock ทีละครั้ง — หรือติ๊ก "เดินอัตโนมัติ" ให้นับเอง');
        },
        steps: ['เปิด EN แล้วกด pulse — ดูค่า Q3Q2Q1Q0 วน 0000 → 1111 ตรงเลขฐานสอง', 'นับเกิน 9 (1010) สังเกตจอ 7-seg ดับ — ค่าที่จอไม่รู้จัก', 'ติ๊กเดินอัตโนมัติ + เลื่อนความเร็ว แล้วกดรีเซ็ตเริ่มใหม่'] },
      { title: 'ทดลอง Decade Counter (mod-10) — วนแค่ 0 ถึง 9',
        wide: true,
        build: function (sim) {
          sim.addInput('en', { x: 60, y: 220, label: 'EN' });
          var xs = [270, 400, 530, 660];
          for (var i = 0; i < 4; i++) {
            sim.addComponent('ff' + i, 'TFF', { x: xs[i], y: 120,
              clockFrom: i > 0 ? ('ff' + (i - 1) + ':qn') : undefined });
            sim.addOutput('q' + i + 'Led', { x: xs[i], y: 230, label: 'Q' + i });
            sim.wire('en', 'out', 'ff' + i, 't', [[150 + i * 8, 220], [150 + i * 8, 90 + i * 8]]);
            sim.wire('ff' + i, 'q', 'q' + i + 'Led', 'in');
          }
          // CLR = AND(Q3, Q1) — ตรวจจับค่า 10 (1010)
          sim.addGate('clr1', 'AND', { x: 465, y: 320, n: 2 });
          sim.wire('ff3', 'q', 'clr1', 0, [[660, 140], [700, 140], [700, 300], [430, 300], [430, 313]]);
          sim.wire('ff1', 'q', 'clr1', 1, [[400, 140], [440, 140], [440, 327]]);
          for (var j = 0; j < 4; j++) {
            sim.wire('clr1', 'out', 'ff' + j, 'clr', [[520, 320], [540, 320], [540, 250 - j * 22]]);
          }
          sim.addComponent('seg', 'SEVENSEG', { x: 830, y: 120 });
          sim.wire('ff3', 'q', 'seg', 'd3', [[725, 100], [750, 100], [750, 66]]);
          sim.wire('ff2', 'q', 'seg', 'd2', [[700, 115], [760, 115], [760, 84]]);
          sim.wire('ff1', 'q', 'seg', 'd1', [[675, 130], [770, 130], [770, 102]]);
          sim.wire('ff0', 'q', 'seg', 'd0', [[725, 145], [780, 145], [780, 120]]);
          sim.explain('นับถึง 9 แล้ว pulse อีกครั้ง — AND(Q3,Q1) จะยิง CLR ล้างกลับ 0 ทันที');
        },
        steps: ['เปิด EN กด pulse นับไปเรื่อยๆ — จะเห็น 0…9 แล้วกลับ 0 วนตลอด (ไม่มี 1010 ค้าง)', 'อ่านกล่องอธิบายตอนจังหวะ 9→0 — FF ถูก CLR ล้างกลาง pulse', 'เทียบกับวงจรแรก: ripple วน 16 ค่า decade วน 10 ค่า'] }
    ]
  });

  /* ================= บทที่ 17: Register & Memory (PDF 09) ================= */
  DL.registerLesson({
    id: 'register-memory',
    group: 'course',
    title: 'Register & Memory — จาก 1 บิต สู่ 1 ไบต์',
    subtitle: 'สไลด์บท 9 · Shift register เลื่อนบิต และ RAM เขียน/อ่านด้วย address',
    slide: '09 Register and Memory.pdf',
    html:
      '<h2>Register — FF หลายตัวมือถือม้วนเดียวกัน</h2>' +
      '<p>เอา D-FF มา 4 ตัว <b>ใช้ CLK สายเดียวกัน</b> (synchronous พอดีบทที่ 15) จะได้ register เก็บ 4 บิตพร้อมกัน ' +
      '— ถ้าต่อข้อมูล "โยงต่อกัน" (FF ตัวหน้าส่ง Q ให้ตัวถัดไป) จะกลายเป็น <b>Shift register</b> ที่เลื่อนบิตทีละตำแหน่งทุก pulse</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">Din →[FF0]→[FF1]→[FF2]→[FF3]→  (แต่ละ pulse บิตเลื่อนขวา 1 ช่อง)\n      Q0   Q1   Q2   Q3</pre>' +
      '<ul>' +
      '<li><b>SISO</b> (Serial-In Serial-Out): เข้าทีละบิต ออกทีละบิต — ใช้ส่งข้อมูลข้ามสายเดียว</li>' +
      '<li><b>SIPO</b> (Serial-In Parallel-Out): เข้าทีละบิต อ่านออกครั้งเดียว 4 บิต — วงจรของเราคือแบบนี้</li>' +
      '</ul>' +

      '<h2>Memory — จำทั้งชุดด้วย address</h2>' +
      '<p>Register เก็บได้ทีละคำ ถ้าอยากเก็บหลายคำ ต้องมี "เลขที่บ้าน" ให้แต่ละคำ: นั่นคือ <b>address</b> ' +
      'RAM ในวงจรของเรามี 4 คำ (address 2 บิต: 00–11) ประกอบด้วย</p>' +
      '<ul>' +
      '<li><b>WE (Write Enable)</b> = 1 → ค่าที่ D บังคับเข้าไปเก็บในช่อง address ที่ชี้ (เขียน)</li>' +
      '<li>WE = 0 → วงจรส่งค่าของ address ที่ชี้ออกมาทาง O (อ่าน) ไม่มีการเปลี่ยนแปลง</li>' +
      '</ul>' +
      '<div class="note">อย่าสับสน: การ "เขียน" ต้องระบุ 2 อย่าง — <b>address (เก็บที่ไหน)</b> และ <b>data (เก็บอะไร)</b> ส่วนการอ่านระบุแค่ address</div>' +
      '<div class="warn">RAM ของจริงเป็น volatile — ตัดไฟข้อมูลหายหมด ต่างจาก ROM/แฟลชที่จำข้ามไฟ (สไลด์บท 9 ครอบคลุมทั้งสอง)</div>',
    summary:
      '<ul>' +
      '<li>Register = FF หลายตัว + CLK ร่วม · Shift register เลื่อนบิตทีละช่องต่อ pulse</li>' +
      '<li>SISO/SIPO: serial ประหยัดสาย, parallel เร็ว</li>' +
      '<li>RAM: เขียน = address + data + WE=1 · อ่าน = address · ทุกช่องจำค่าด้วย latch/FF ของตัวเอง</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง Shift Register (SIPO) — บิตเดินหน้าทีละช่อง',
        wide: true,
        build: function (sim) {
          sim.addInput('d', { x: 60, y: 120, label: 'Din' });
          var xs = [250, 390, 530, 670];
          for (var i = 0; i < 4; i++) {
            sim.addComponent('ff' + i, 'DFF', { x: xs[i], y: 110 });
            sim.addOutput('s' + i + 'Led', { x: xs[i], y: 205, label: 'S' + i });
            sim.wire('ff' + i, 'q', 's' + i + 'Led', 'in');
            if (i > 0) sim.wire('ff' + (i - 1), 'q', 'ff' + i, 'd', [[xs[i - 1] + 60, 75], [xs[i - 1] + 85, 75], [xs[i - 1] + 85, 65]]);
          }
          sim.wire('d', 'out', 'ff0', 'd', [[160, 120], [160, 95]]);
          sim.explain('Din=0 ทุกตัว — เปิด Din=1 แล้วกด pulse ดูบิตวิ่ง');
        },
        steps: ['เปิด Din=1 กด pulse 1 ครั้ง — S0 ติด', 'กดอีก 3 ครั้ง — ไฟเลื่อนไป S1, S2, S3 ทีละช่อง (สังเกตตอน S0 ดับเพราะ Din กลับเป็น 0 ก็ได้)', 'ปิด Din=0 กด pulse — เห็น "0" ไล่ดับตามหลัง'] },
      { title: 'ทดลอง RAM 4 คำ — เขียน/อ่านด้วย address + WE',
        wide: true,
        build: function (sim) {
          sim.addInput('a1', { x: 60, y: 45, label: 'A1' });
          sim.addInput('a0', { x: 60, y: 105, label: 'A0' });
          sim.addInput('d1', { x: 60, y: 175, label: 'D1' });
          sim.addInput('d0', { x: 60, y: 235, label: 'D0' });
          sim.addInput('we', { x: 60, y: 310, label: 'WE' });
          sim.addComponent('ram', 'RAM4', { x: 330, y: 170 });
          sim.addOutput('o1Led', { x: 560, y: 130, label: 'O1' });
          sim.addOutput('o0Led', { x: 560, y: 210, label: 'O0' });
          sim.wire('a1', 'out', 'ram', 'a1', [[200, 45], [200, 121]]);
          sim.wire('a0', 'out', 'ram', 'a0', [[220, 105], [220, 139]]);
          sim.wire('d1', 'out', 'ram', 'd1', [[240, 175], [240, 157]]);
          sim.wire('d0', 'out', 'ram', 'd0', [[260, 235], [260, 175]]);
          sim.wire('we', 'out', 'ram', 'we', [[200, 310], [300, 310], [300, 193]]);
          sim.wire('ram', 'o1', 'o1Led', 'in');
          sim.wire('ram', 'o0', 'o0Led', 'in');
          sim.explain('WE=0 → โหมดอ่าน: O ตามค่าใน address ที่ชี้ (ตอนนี้ทุกช่อง = 00)');
        },
        steps: ['ตั้ง A=01, D=10 แล้วเปิด WE — ตารางในกล่อง RAM ช่อง 1 เปลี่ยนเป็น 10 และ O อ่านได้ 10', 'ปิด WE แล้วเปลี่ยน D — ค่าในช่อง 1 ไม่หวั่นไหว (จำไว้แล้ว)', 'เปลี่ยน A=10 — O อ่านช่อง 2 ซึ่งยังว่าง = 00', 'กลับ A=01 (WE ปิด) — อ่านเจอ 10 เดิม ตรงตามที่เขียนไว้'] }
    ]
  });

  /* ================= บทที่ 18: Multivibrator (PDF 10) ================= */
  DL.registerLesson({
    id: 'multivibrator',
    group: 'course',
    title: 'Multivibrator — 555 และเพื่อนนิวเคลียร์สามตระกูล',
    subtitle: 'สไลด์บท 10 · Bistable / Monostable / Astable — วงจรจำ, วงจรยิงครั้งเดียว, วงจรกะพริบ',
    slide: '10 Multivibrator_rev03.pdf',
    html:
      '<h2>Multivibrator คืออะไร?</h2>' +
      '<p>ตระกูลวงจร 2 สถานะ (ติด/ดับ) ที่เกิดจากการ feedback แบบ RC+gate หรือ 555 IC แบ่งตาม "ความนิ่ง" 3 แบบ:</p>' +
      '<table class="tt"><tr><th>ชนิด</th><th>สถานะนิ่ง</th><th>พฤติกรรม</th><th>ตัวอย่างใช้จริง</th></tr>' +
      '<tr><td><b>Bistable</b></td><td>2 สถานะนิ่งถาวร</td><td>อยู่ 0 หรือ 1 ตามที่สั่ง จนกว่าจะสั่งใหม่</td><td>= SR latch ที่เราเรียนแล้ว! ใช้ทำ memory, สวิตช์ไฟกด-ปล่อย</td></tr>' +
      '<tr><td><b>Monostable</b></td><td>นิ่งสถานะเดียว</td><td>โดน trigger แล้วยิง 1 ชั่วครู่ (ตาม RC) แล้วกลับ 0 เอง</td><td>ตัวตั้งเวลา, debounce สวิตช์, สัญญาณ one-shot</td></tr>' +
      '<tr><td><b>Astable</b></td><td>ไม่นิ่งเลย</td><td>กะพริบ 0↔1 วนตลอด (ตาม RC)</td><td>สัญญาณ clock, ไฟกระพริบ, เสียงบัซเซอร์</td></tr></table>' +

      '<h2>555 Timer — ไอคอนของวงการ</h2>' +
      '<p>ชิป 555 มีขา 8 ขา ตั้งเป็น astable ได้โดยใช้ R 2 ตัว + C 1 ตัว: ตัวเก็บประจุชาร์จผ่าน R1+R2 ขึ้นถึง ⅔Vcc แล้ววงจรในชิปตัดไฟดิสชาร์จผ่าน R2 ลงถึง ⅓Vcc แล้ววนใหม่ ' +
      'คาบเวลา T = 0.693×(R1+2R2)×C — ค่าจริงเป็น analog ต่อเนื่อง วงจรจำลองของเราย่อให้เห็นเฉพาะ "พฤติกรรมกะพริบ" ทีละครึ่งจังหวะ</p>' +
      '<div class="note">ในวงจร astable ด้านล่าง ลองติ๊ก <b>เดินอัตโนมัติ</b> — LED จะกระพริบเองไม่หยุด เหมือน 555 จริง (ทุก pulse แทน "ครึ่งคาบ" หนึ่งครั้ง)</div>' +
      '<div class="warn">ความแตกต่างจากวงจรจริง: RC จริงต่อเนื่องเชิงเวลา ส่วนจำลองเราข้ามทีละจังหวะ — ตัวเลขคาบเวลาให้ใช้สูตร T = 0.693(R1+2R2)C จากสไลด์</div>',
    summary:
      '<ul>' +
      '<li><b>Bistable</b> = 2 สถานะนิ่ง = SR latch (บท 10)</li>' +
      '<li><b>Monostable</b> = นิ่งสถานะเดียว + ยิง one-shot ตาม RC แล้วดับเอง</li>' +
      '<li><b>Astable</b> = ไม่มีสถานะนิ่ง กะพริบตลอด · 555 astable: T = 0.693(R1+2R2)C</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง Astable (จำลอง 555) — กะพริบต่อเนื่อง',
        build: function (sim) {
          sim.addComponent('osc', 'ASTABLE', { x: 300, y: 100, clocked: true });
          sim.addOutput('blinkLed', { x: 500, y: 65, label: 'OUT' });
          sim.wire('osc', 'q', 'blinkLed', 'in');
          sim.explain('กด pulse = ข้ามครึ่งคาบหนึ่ง — หรือติ๊กเดินอัตโนมัติให้กระพริบเอง');
        },
        steps: ['ติ๊ก "เดินอัตโนมัติ" — LED กะพริบไม่หยุด (astable มีสถานะนิ่งเป็น 0)', 'ปิดอัตโนมัติ กด pulse ทีละครั้ง — นับว่า ON 1 จังหวะ OFF 1 จังหวะ (duty 50%)'] },
      { title: 'ทดลอง Monostable (One-shot) — ยิงครั้งเดียวแล้วดับเอง',
        build: function (sim) {
          sim.addInput('trg', { x: 60, y: 115, label: 'TRG' });
          sim.addComponent('mono', 'MONO', { x: 330, y: 105, clocked: true });
          sim.addOutput('oneLed', { x: 540, y: 65, label: 'OUT' });
          sim.wire('trg', 'out', 'mono', 'trg', [[200, 115], [200, 88]]);
          sim.wire('mono', 'q', 'oneLed', 'in');
          sim.explain('TRG=0 → OUT นิ่ง 0 — ยิงโดยการเปิด TRG (ขอบขึ้น) แล้วกด pulse');
        },
        steps: ['เปิด TRG=1 (เกิดขอบขึ้น) แล้วกด Pulse Clock — OUT ยิงติด', 'กด pulse ต่ออีก 3 ครั้ง — OUT ดับกลับเอง (จำลอง RC ครบเวลา)', 'ปล่อย TRG=0 แล้วยิงใหม่ — ทำซ้ำได้ไม่จำกัด'] }
    ]
  });

  /* ================= บทที่ 19: ADC-DAC (PDF 11) ================= */
  DL.registerLesson({
    id: 'adc-dac',
    group: 'course',
    title: 'ADC & DAC — โลก analog เชื่อมดิจิทัล',
    subtitle: 'สไลด์บท 11 · R-2R DAC แปลงบิตเป็นแรงดัน และ SAR ADC ทายค่าทีละบิต',
    slide: '11 ADC-DAC_rev03.pdf',
    html:
      '<h2>ทำไมต้องแปลง?</h2>' +
      '<p>เสียง อุณหภูมิ แสง แรงดัน คือ analog (ต่อเนื่อง) แต่ CPU กินเลขฐานสอง การเชื่อมสองโลกต้องมี:</p>' +
      '<ul>' +
      '<li><b>DAC (Digital-to-Analog)</b>: เลขฐานสอง → แรงดัน เช่น 1010₂ → 10 หน่วย</li>' +
      '<li><b>ADC (Analog-to-Digital)</b>: แรงดัน → เลขฐานสอง (ต้อง "จับ" และปัดเป็นขั้น)</li>' +
      '</ul>' +

      '<h2>R-2R Ladder DAC — ตัวเก่งด้วยตัวต้านทาน 2 ค่า</h2>' +
      '<p>โครงสายตัวต้านทานเรียงเป็นบันไดโดยใช้ค่า R กับ 2R เท่านั้น (ผลิตง่าย แม่น) บิตสูง (B3) มี "น้ำหนัก" มากสุด:</p>' +
      '<p style="text-align:center"><code>Vout = Vref × (B3×8 + B2×4 + B1×2 + B0×1) / 16</code></p>' +
      '<p>เลข 4 บิตแทนได้ 16 ขั้น (0–15) — ขั้นมากขึ้นด้วยบิตเพิ่ม เช่น 8 บิตได้ 256 ขั้น เสียงซีดีใช้ 16 บิต = 65,536 ขั้น</p>' +

      '<h2>Successive Approximation ADC — ทายแบบเกมทายเลข</h2>' +
      '<p>วิธียอดนิยมในไมโครคอนโทรลเลอร์: ทายทีละบิตจากบิตสูงสุด โดยใช้ <b>DAC ในตัว</b> เทียบกับค่าจริง:</p>' +
      '<ol>' +
      '<li>ทายบิต 3 = 1 (คือ 8) → ถ้า 8 ≤ ค่าจริง เก็บไว้ ถ้าเกิน ทิ้ง</li>' +
      '<li>ทายบิต 2 = 1 (รวม 12 หรือ 4) → เทียบอีกครั้ง…</li>' +
      '<li>ทำครบ 4 บิต → ได้คำตอบเป๊ะภายใน 4 จังหวะ clock (n บิตใช้ n จังหวะ เร็วมาก)</li>' +
      '</ol>' +
      '<div class="note">เหมือนเกม "ทายเลข 1–15 ด้วยคำถามน้อยสุด" — ตั้ง target ในวงจร (T3–T0) แล้วกด pulse ดูวงจรทายทีละบิตในกล่องคำอธิบาย</div>',
    summary:
      '<ul>' +
      '<li>DAC 4 บิต: Vout = Vref×(ค่าฐานสอง)/16 — 16 ขั้น</li>' +
      '<li>R-2R ladder ใช้ตัวต้านทาน 2 ค่า ผลิตง่าย แม่นยำ</li>' +
      '<li>SAR ADC: ทายบิตสูง→ต่ำ ใช้ DAC ในตัวเทียบ n บิตจบใน n จังหวะ</li>' +
      '<li>ความละเอียดเพิ่ม = เพิ่มบิต (8 บิต 256 ขั้น, 16 บิต 65,536 ขั้น)</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง R-2R DAC — เลขฐานสองกลายเป็นแรงดัน',
        build: function (sim) {
          sim.addInput('b3', { x: 60, y: 40, label: 'B3 (8)' });
          sim.addInput('b2', { x: 60, y: 100, label: 'B2 (4)' });
          sim.addInput('b1', { x: 60, y: 160, label: 'B1 (2)' });
          sim.addInput('b0', { x: 60, y: 220, label: 'B0 (1)' });
          sim.addComponent('dac', 'R2RDAC', { x: 280, y: 130 });
          sim.addComponent('meter', 'VMETER', { x: 500, y: 130 });
          sim.wire('b3', 'out', 'dac', 'b3', [[180, 40], [180, 91]]);
          sim.wire('b2', 'out', 'dac', 'b2', [[200, 100], [200, 109]]);
          sim.wire('b1', 'out', 'dac', 'b1', [[220, 160], [220, 127]]);
          sim.wire('b0', 'out', 'dac', 'b0', [[240, 220], [240, 145]]);
          sim.wire('dac', 'v', 'meter', 'v');
          sim.explain('ทุกบิต 0 → V = 0 — กดบิตแล้วดูแท่งวัด');
        },
        steps: ['กด B0=1 → V = 1', 'กด B3=1 → V = 8 (บิตสูงมีน้ำหนักสูงสุด)', 'กดทั้งคู่ → V = 9 (8+1 = 1001₂)', 'เปิดหมด → V = 15 เต็ม'] },
      { title: 'ทดลอง SAR ADC — วงจรทายค่าทีละบิต',
        build: function (sim) {
          sim.addInput('t3', { x: 60, y: 45, label: 'T3 (target)' });
          sim.addInput('t2', { x: 60, y: 115, label: 'T2' });
          sim.addInput('t1', { x: 60, y: 185, label: 'T1' });
          sim.addInput('t0', { x: 60, y: 255, label: 'T0' });
          sim.addComponent('adc', 'ADC4', { x: 330, y: 145, clocked: true });
          sim.addOutput('doneLed', { x: 530, y: 110, label: 'Done' });
          sim.wire('t3', 'out', 'adc', 't3', [[200, 45], [200, 109]]);
          sim.wire('t2', 'out', 'adc', 't2', [[220, 115], [220, 127]]);
          sim.wire('t1', 'out', 'adc', 't1', [[240, 185], [240, 145]]);
          sim.wire('t0', 'out', 'adc', 't0', [[260, 255], [260, 163]]);
          sim.wire('adc', 'done', 'doneLed', 'in');
          sim.explain('ตั้ง target แล้วกด pulse 4 ครั้ง — วงจรจะทาย 8, 4, 2, 1 ตามลำดับ');
        },
        steps: ['ตั้ง target = 1010 (T3+T1 = 10) แล้วกด pulse — จังหวะแรกลอง 8 ≤ 10 → เก็บ', 'pulse ต่อ: ลอง 12 (8+4) มากกว่า 10 → ทิ้งบิต 2', 'จังหวะที่ 3: 10 (8+2) ≤ 10 → เก็บ · จังหวะที่ 4: ลอง 11 ทิ้ง → Done ติด ได้ 1010 พอดี', 'เปลี่ยน target เป็นอื่น กด pulse ใหม่ (ต้องรีเซ็ตก่อนนับรอบใหม่)'] }
    ]
  });

  /* ================= บทที่ 20: Computer (PDF 12) ================= */
  DL.registerLesson({
    id: 'computer',
    group: 'course',
    title: 'Computer — รวมทุกอย่างเป็นคอมพิวเตอร์',
    subtitle: 'สไลด์บท 12 · fetch-execute cycle: PC, IR, ACC และหน่วยความจำทำงานร่วมกันยังไง',
    slide: '12 Computer.pdf',
    html:
      '<h2>คอมพิวเตอร์ = วงจรที่เรียนมาทั้งหมด ประกอบกัน</h2>' +
      '<ul>' +
      '<li><b>PC (Program Counter)</b> = counter จากบท 16 — จำ "คำสั่งถัดไปอยู่ที่ address ไหน"</li>' +
      '<li><b>IR (Instruction Register)</b> = register จากบท 17 — จำคำสั่งที่กำลังทำ</li>' +
      '<li><b>ACC (Accumulator)</b> = register ตัวสะสมผลคำนวณ (บวกด้วย adder บท 5!)</li>' +
      '<li><b>MEM</b> = RAM จากบท 17 — เก็บทั้งโปรแกรมและข้อมูล (stored program concept)</li>' +
      '</ul>' +

      '<h2>Fetch-Execute Cycle — จังหวะเต้นของ CPU</h2>' +
      '<ol>' +
      '<li><b>Fetch</b>: ยิง address จาก PC ไปที่ RAM → ได้คำสั่ง → ยัดใส่ IR</li>' +
      '<li><b>Decode</b>: วงจรถอดรหัสว่าคำสั่งนี้ต้องทำอะไร (decoder บท 8!)</li>' +
      '<li><b>Execute</b>: ทำงาน เช่น ดึงข้อมูล บวก เก็บ หรือหยุด</li>' +
      '<li>PC +1 → วนกลับขั้น 1 (จนกว่าเจอ HALT)</li>' +
      '</ol>' +

      '<h2>โปรแกรมตัวอย่างในวงจร</h2>' +
      '<table class="tt"><tr><th>Address</th><th>คำสั่ง</th><th>ความหมาย</th></tr>' +
      '<tr><td>0</td><td>LDA 3</td><td>ACC ← MEM[3] (คือ 7)</td></tr>' +
      '<tr><td>1</td><td>ADD 2</td><td>ACC ← ACC + MEM[2] (7+2 = 9)</td></tr>' +
      '<tr><td>2</td><td>STO 1</td><td>MEM[1] ← ACC (เก็บ 9)</td></tr>' +
      '<tr><td>3</td><td>HALT</td><td>หยุด</td></tr></table>' +
      '<p>ข้อมูลเริ่มต้นใน MEM: [0, 0, 2, 7] — กด pulse ทีละครั้งในวงจร แล้วดู PC เดิน IR เปลี่ยน ACC สะสม และ MEM แก้ไขตามจริง</p>' +
      '<div class="note">CPU จริงทำ 3 ขั้นนี้ "แยกจังหวะย่อย" ภายใน 1 clock และมี ALU, ตัวถอดรหัสซับซ้อนกว่ามาก แต่หลัก fetch-decode-execute ไม่เปลี่ยน — โทรศัพท์ในมือคุณก็เต้นวงจรนี้หลายพันล้านครั้งต่อวินาที</div>',
    summary:
      '<ul>' +
      '<li>PC ชี้คำสั่งถัดไป · IR จำคำสั่งปัจจุบัน · ACC สะสมผล · MEM เก็บโปรแกรม+ข้อมูล</li>' +
      '<li>วงจรหลัก: <b>Fetch → Decode → Execute → PC+1</b> วนจน HALT</li>' +
      '<li>บล็อกทั้งหมดมาจากบทเรียนที่ผ่านมา: counter + register + RAM + adder + decoder</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง fetch-execute — กด pulse ไล่ดู CPU ทำงานทีละคำสั่ง',
        build: function (sim) {
          sim.addComponent('cpu', 'CPUDEMO', { x: 330, y: 120, clocked: true });
          sim.addOutput('haltLed', { x: 600, y: 75, label: 'HALT' });
          sim.wire('cpu', 'halt', 'haltLed', 'in');
          sim.explain('PC=0 รอ pulse — กดทีละครั้งแล้วอ่านกล่องคำอธิบายว่า CPU กำลังทำขั้นไหน');
        },
        steps: ['pulse 1 — fetch LDA 3 แล้ว ACC = 7 (MEM[3])', 'pulse 2 — ADD 2 ได้ ACC = 9', 'pulse 3 — STORE 1 ตาราง MEM เปลี่ยน: MEM[1] = 9', 'pulse 4 — HALT ไฟติด กด pulse เพิ่มไม่มีอะไรเกิด (ลองรีเซ็ตเริ่มใหม่)'] }
    ]
  });
})();
