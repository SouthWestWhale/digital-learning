/* ===== Digital Learning — แผงวงจร interactive =====
 * DL.CircuitPanel(spec) → DOM element (div.circuit-panel)
 * spec = { title, build(sim), steps: [...], wide?, height? }
 * ประกอบ: หัวเรื่อง → SVG วงจร → ปุ่ม input/clock/auto/reset → กล่องคำอธิบายทีละขั้น
 * destroy() เคลียร์ interval ของโหมดเดินอัตโนมัติ (app.js เรียกตอนเปลี่ยนหน้า)
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  DL.CircuitPanel = function (spec) {
    var sim = new DL.CircuitSim();
    spec.build(sim);

    var panel = el('div', 'circuit-panel');
    if (spec.title) panel.appendChild(el('div', 'circuit-title', spec.title));

    var scroll = el('div', 'circuit-scroll');
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    scroll.appendChild(svg);
    panel.appendChild(scroll);

    /* ---------- ปุ่มควบคุม ---------- */
    var controls = el('div', 'circuit-controls');
    var swButtons = {};   // id -> button

    function syncButtons() {
      sim.inputList().forEach(function (n) {
        var b = swButtons[n.id];
        if (!b) return;
        b.classList.toggle('on', n.value === 1);
        b.textContent = n.label + ' = ' + n.value;
      });
    }

    var swGroup = el('div', 'ctrl-group');
    sim.inputList().forEach(function (n) {
      var b = el('button', 'sw-btn');
      b.addEventListener('click', function () { sim.toggleInput(n.id); });
      swButtons[n.id] = b;
      swGroup.appendChild(b);
    });
    controls.appendChild(swGroup);

    var clkGroup = el('div', 'ctrl-group');
    var autoTimer = null;
    var autoChk = null, speed = null, speedLab = null;

    // เคลียร์ interval — uncheck=true ใช้ตอนทำลาย/รีเซ็ต (ปิดโหมดอัตโนมัติจริง)
    function clearAuto(uncheck) {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      if (uncheck && autoChk) autoChk.checked = false;
    }
    function startAuto() {
      var hz = Number(speed.value) * 0.5;   // 1–8 → 0.5–4 Hz
      autoTimer = setInterval(function () {
        sim.clockEdge();
        syncAll();
      }, Math.round(1000 / hz));
    }

    if (sim.hasClock()) {
      var pulse = el('button', 'clk-btn', '⏫ Pulse Clock');
      pulse.addEventListener('click', function () {
        sim.clockEdge();
        syncAll();
      });
      clkGroup.appendChild(pulse);

      autoChk = el('input');
      autoChk.type = 'checkbox';
      autoChk.id = 'auto-' + Math.floor(Math.random() * 1e9);
      var autoLab = el('label', 'ctrl-label', 'เดินอัตโนมัติ');
      autoLab.htmlFor = autoChk.id;
      clkGroup.appendChild(autoChk);
      clkGroup.appendChild(autoLab);

      speed = el('input');
      speed.type = 'range'; speed.min = '1'; speed.max = '8'; speed.value = '3';
      speed.title = 'ความเร็ว';
      clkGroup.appendChild(speed);
      speedLab = el('span', 'ctrl-label', 'เร็ว 3');
      clkGroup.appendChild(speedLab);

      autoChk.addEventListener('change', function () {
        clearAuto(false);                       // เคลียร์ interval เก่า (คงสถานะเช็คไว้)
        if (autoChk.checked) startAuto();
      });
      speed.addEventListener('input', function () {
        speedLab.textContent = 'เร็ว ' + speed.value;
        if (autoTimer) { clearAuto(false); startAuto(); }   // เปลี่ยนความเร็วระหว่างเดิน
      });

      var reset = el('button', 'reset-btn', '↺ รีเซ็ต');
      reset.addEventListener('click', function () {
        clearAuto(true);                        // รีเซ็ต = ปิดเดินอัตโนมัติด้วย
        if (sim.reset) sim.reset();
        syncAll();
      });
      clkGroup.appendChild(reset);
    }
    controls.appendChild(clkGroup);
    panel.appendChild(controls);

    /* ---------- กล่องคำอธิบายทีละขั้น ---------- */
    var explain = el('div', 'explain-box');
    explain.appendChild(el('div', 'ex-title', 'คำอธิบายล่าสุด'));
    var exText = el('div', 'ex-text', 'กดสวิตช์หรือปุ่มด้านบนเพื่อทดลองวงจร');
    explain.appendChild(exText);
    panel.appendChild(explain);

    /* ---------- ขั้นตอนการทดลอง ---------- */
    if (spec.steps && spec.steps.length) {
      var steps = el('div', 'note');
      steps.innerHTML = '<b>🔬 ลองทำตาม:</b><ol style="margin:6px 0 0 18px">' +
        spec.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>';
      panel.appendChild(steps);
    }

    /* ---------- วิดเจ็ตเสริมเฉพาะบท (เช่นช่องใส่รหัสนักศึกษา) ----------
     * spec.extra(sim, syncAll) คืน DOM element — แทรกไว้เหนือกล่องคำอธิบาย
     */
    if (typeof spec.extra === 'function') {
      var custom = spec.extra(sim, function () { syncAll(); });
      if (custom) panel.insertBefore(custom, explain);
    }

    /* ---------- sync ทุกอย่างเมื่อ sim เปลี่ยน ---------- */
    function syncAll() {
      DL.Render.update(sim);
      syncButtons();
      if (sim.lastEvent) {
        exText.textContent = sim.lastEvent.text;
        exText.classList.toggle('warn', !!sim.lastEvent.warn);
      }
    }
    sim.onChange(syncAll);

    sim.evaluate();   // คำนวณรอบแรกก่อนวาด — สายไฟ/LED/ตารางโชว์ค่าเริ่มต้นถูกต้อง
    DL.Render.mount(sim, svg, { wide: spec.wide });

    /* ---------- destroy: เคลียร์ interval ---------- */
    var destroyed = false;
    panel.destroy = function () {
      if (destroyed) return;
      destroyed = true;
      panel.destroyed = true;
      clearAuto(true);
    };
    // app.js จะเรียก destroy ตอนเปลี่ยนหน้า — กัน interval ของโหมดเดินอัตโนมัติค้าง
    if (DL.registerActiveSim) DL.registerActiveSim(panel);

    syncAll();
    return panel;
  };
})();
