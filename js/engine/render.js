/* ===== Digital Learning — SVG renderer =====
 * วาดวงจรจากโมเดล CircuitSim: สายไฟ (สีตามค่า), gate ทรงมาตรฐาน,
 * สวิตช์กดได้, LED, component ที่ลงทะเบียน (def.shape / def.update / def.pinPos)
 * ไม่รู้จักเนื้อหาบทเรียน — รู้จักแค่โมเดล
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  var SVGNS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ---------- ขนาด/ตำแหน่ง pin ---------- */
  var GATE_W = 64, GATE_H = 44, PIN_GAP = 15;
  // จุด pin ออกของ gate แต่ละชนิด (offset จาก x กลาง — NAND/NOR/NOT เผื่อ bubble)
  var GATE_OUTX = { AND: 32, OR: 32, XOR: 32, NOT: 21, NAND: 43, NOR: 43, BUFFER: 21 };

  function pinPos(node, pin) {
    if (node.kind === 'input') return { x: node.x + 28, y: node.y };
    if (node.kind === 'output') return { x: node.x - 14, y: node.y };
    if (node.kind === 'gate') {
      if (pin === 'out') return { x: node.x + (GATE_OUTX[node.type] || 32), y: node.y };
      var i = Number(pin);
      return { x: node.x - 32, y: node.y + (i - (node.n - 1) / 2) * PIN_GAP };
    }
    // comp — def.pinPos ถ้านิยามเอง, ไม่งั้นกล่อง default: input ซ้าย/ output ขวา
    var def = node.def;
    var w = node.opts.w || (def.w || 110);
    var h = node.opts.h || (def.h || 64);
    if (def.pinPos) return def.pinPos(node, pin, w, h);
    var inIdx = def.inputs.indexOf(pin);
    if (inIdx >= 0) {
      return { x: node.x - w / 2, y: node.y + (inIdx - (def.inputs.length - 1) / 2) * 18 };
    }
    var outIdx = def.outputs.indexOf(pin);
    return { x: node.x + w / 2, y: node.y + (outIdx - (def.outputs.length - 1) / 2) * 18 };
  }

  /* ---------- ทรง gate ---------- */
  function drawGate(g, node) {
    var t = node.type;
    var body;
    if (t === 'AND' || t === 'NAND') {
      body = svgEl('path', { d: 'M-32,-22 L4,-22 C24,-22 32,-10 32,0 C32,10 24,22 4,22 L-32,22 Z' });
    } else if (t === 'OR' || t === 'NOR' || t === 'XOR') {
      body = svgEl('path', { d: 'M-30,-22 C-14,-22 12,-18 28,0 C12,18 -14,22 -30,22 C-21,12 -21,-12 -30,-22 Z' });
    } else { // NOT / BUFFER: สามเหลี่ยม
      body = svgEl('path', { d: 'M-30,-22 L6,0 L-30,22 Z' });
    }
    body.setAttribute('class', 'comp-body');
    g.appendChild(body);
    if (t === 'XOR') {
      g.appendChild(svgEl('path', {
        d: 'M-38,-20 C-29,-8 -29,8 -38,20',
        'class': 'comp-body', fill: 'none'
      }));
    }
    if (t === 'NOT' || t === 'NAND' || t === 'NOR') {
      g.appendChild(svgEl('circle', { cx: 17.5, cy: 0, r: 5.5, 'class': 'comp-body' }));
    }
    var label = svgEl('text', { x: -8, y: 5, 'class': 'comp-label' });
    label.textContent = t;
    g.appendChild(label);
  }

  /* ---------- ทรง input switch / output LED ---------- */
  function drawInput(g, node) {
    var body = svgEl('rect', { x: -28, y: -16, width: 56, height: 32, rx: 8 });
    body.setAttribute('class', node.value ? 'sw-body-1' : 'sw-body-0');
    g.appendChild(body);
    var t = svgEl('text', { x: 0, y: 5, 'class': node.value ? 'sw-text-1' : 'sw-text-0' });
    t.textContent = node.value ? '1' : '0';
    g.appendChild(t);
    var lab = svgEl('text', { x: 0, y: -24, 'class': 'comp-pin-label' });
    lab.textContent = node.label;
    g.appendChild(lab);
    // จุดกดขยาย — กดง่ายบนจอสัมผัส
    var hit = svgEl('circle', { cx: 0, cy: 0, r: 34, 'class': 'sw-hit' });
    g.appendChild(hit);
    g.classList.add('svg-switch');
  }

  function drawOutput(g, node) {
    var c = svgEl('circle', { cx: 0, cy: 0, r: 12, 'class': 'comp-body' });
    g.appendChild(c);
    var lab = svgEl('text', { x: 0, y: 30, 'class': 'comp-pin-label' });
    lab.textContent = node.label;
    g.appendChild(lab);
  }

  /* ---------- สายไฟ ---------- */
  function wirePoints(sim, w) {
    var from = sim.nodes[w.from.id], to = sim.nodes[w.to.id];
    var pts = [pinPos(from, w.from.pin)];
    (w.waypoints || []).forEach(function (p) { pts.push({ x: p[0], y: p[1] }); });
    pts.push(pinPos(to, w.to.pin));
    return pts;
  }

  /* ---------- mount วงจรทั้งหมดลง svg ---------- */
  function mount(sim, svg, opts) {
    opts = opts || {};
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var gWires = svgEl('g', {}), gNodes = svgEl('g', {});
    svg.appendChild(gWires);
    svg.appendChild(gNodes);

    // 1) สายไฟ
    var wireEls = [];
    sim.wires.forEach(function (w) {
      var pts = wirePoints(sim, w).map(function (p) { return p.x + ',' + p.y; });
      var pl = svgEl('polyline', { points: pts.join(' '), 'class': 'wire w0' });
      gWires.appendChild(pl);
      w._el = pl;
      wireEls.push(w);
      // จุดกึ่ง waypoints (junction)
      (w.waypoints || []).forEach(function (p) {
        var dot = svgEl('circle', { cx: p[0], cy: p[1], r: 3.5, 'class': 'junction j0' });
        gWires.appendChild(dot);
        w._dots = w._dots || [];
        w._dots.push(dot);
      });
    });

    // 2) ชิ้นส่วน
    sim.order.forEach(function (id) {
      var node = sim.nodes[id];
      var g = svgEl('g', {});
      g.setAttribute('transform', 'translate(' + node.x + ',' + node.y + ')');
      if (node.kind === 'input') drawInput(g, node);
      else if (node.kind === 'output') drawOutput(g, node);
      else if (node.kind === 'gate') drawGate(g, node);
      else if (node.kind === 'comp' && node.def.shape) node.def.shape(g, node);
      else if (node.kind === 'comp') { // กล่อง default + pin labels
        var w2 = node.opts.w || node.def.w || 110, h2 = node.opts.h || node.def.h || 64;
        g.appendChild(svgEl('rect', { x: -w2 / 2, y: -h2 / 2, width: w2, height: h2, rx: 4, 'class': 'comp-body' }));
        var lbl = svgEl('text', { x: 0, y: 5, 'class': 'comp-label' });
        lbl.textContent = node.opts.label || node.comp;
        g.appendChild(lbl);
        node.def.inputs.forEach(function (name) {
          var p = pinPos(node, name, w2, h2);
          var t = svgEl('text', { x: p.x - node.x + 10, y: p.y - node.y + 4, 'class': 'comp-pin-label', 'text-anchor': 'start' });
          t.textContent = (node.def.pinLabels && node.def.pinLabels[name]) || name;
          g.appendChild(t);
        });
        node.def.outputs.forEach(function (name) {
          var p = pinPos(node, name, w2, h2);
          var t = svgEl('text', { x: p.x - node.x - 10, y: p.y - node.y + 4, 'class': 'comp-pin-label', 'text-anchor': 'end' });
          t.textContent = (node.def.pinLabels && node.def.pinLabels[name]) || name;
          g.appendChild(t);
        });
      }
      g.setAttribute('data-node', id);
      gNodes.appendChild(g);
      node._g = g;
    });

    // 3) สวิตช์กดได้
    sim.order.forEach(function (id) {
      var node = sim.nodes[id];
      if (node.kind !== 'input') return;
      node._g.addEventListener('click', function () { sim.toggleInput(id); });
    });

    // 4) viewBox — คำนวณจากขอบเขตจริง
    var minX = 0, minY = 0, maxX = 0, maxY = 0;
    sim.order.forEach(function (id) {
      var n = sim.nodes[id];
      var hw = 90, hh = 50;
      if (n.kind === 'comp') { hw = (n.opts.w || n.def.w || 110) / 2 + 40; hh = (n.opts.h || n.def.h || 64) / 2 + 36; }
      minX = Math.min(minX, n.x - hw); minY = Math.min(minY, n.y - hh);
      maxX = Math.max(maxX, n.x + hw); maxY = Math.max(maxY, n.y + hh);
    });
    var pad = 8;
    svg.setAttribute('viewBox',
      (minX - pad) + ' ' + (minY - pad) + ' ' + (maxX - minX + pad * 2) + ' ' + (maxY - minY + pad * 2));
    if ((maxX - minX) > 640 || opts.wide) svg.classList.add('wide');

    update(sim);
  }

  /* ---------- อัปเดตสี/สถานะตามค่า logic ปัจจุบัน ---------- */
  var VAL_CLASS = { 0: 'wire w0', 1: 'wire w1', '?': 'wire wq' };
  function update(sim) {
    sim.wires.forEach(function (w) {
      w._el.setAttribute('class', VAL_CLASS[w.value] || 'wire wq');
      (w._dots || []).forEach(function (d) {
        d.setAttribute('class', w.value === 1 ? 'junction' : 'junction j0');
      });
    });
    sim.order.forEach(function (id) {
      var n = sim.nodes[id];
      if (n.kind === 'input' && n._g) {
        var body = n._g.querySelector('rect'), t = n._g.querySelector('text');
        if (body) body.setAttribute('class', n.value ? 'sw-body-1' : 'sw-body-0');
        if (t) { t.setAttribute('class', n.value ? 'sw-text-1' : 'sw-text-0'); t.textContent = n.value ? '1' : '0'; }
      }
      if (n.kind === 'output' && n._g) {
        var c = n._g.querySelector('circle');
        if (c) {
          if (n.ins === 1) {
            c.setAttribute('class', 'comp-body led-glow-' + (n.color === 'red' ? 'red' : 'on'));
            c.setAttribute('fill', n.color === 'red' ? '#ef4444' : '#22c55e');
          } else if (n.ins === '?') {
            c.setAttribute('class', 'comp-body');
            c.setAttribute('fill', '#f59e0b');
          } else {
            c.setAttribute('class', 'comp-body');
            c.setAttribute('fill', '#94a3b8');
          }
        }
      }
      if (n.kind === 'comp' && n.def && n.def.update) n.def.update(n._g, n);
    });
  }

  DL.Render = { mount: mount, update: update, pinPos: pinPos, svgEl: svgEl };
})();
