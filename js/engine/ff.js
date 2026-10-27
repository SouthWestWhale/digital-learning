/* ===== Digital Learning — flip-flop components =====
 * FF ทุกตัว positive-edge-triggered:
 * - DFF/JKFF/TFF/SRFF: มี pin CLK (โชว์อย่างเดียว) + opts.clocked → ปุ่ม Pulse Clock ขับ
 * - SR_LATCH: transparent — เปลี่ยนทันทีตาม S/R (ไม่มี clock)
 * Q เก็บใน node.state; เปลี่ยนได้เฉพาะ def.edge ที่ sim.clockEdge() เรียก
 * บท counter (M4) ต่อวงจร ripple ด้วย opts.clockFrom
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  var T = '?';

  function isHigh(x) { return x === 1; }

  // แชร์รูปทรง block FF ให้ component อื่น (astable/mono ใน course.js) ใช้ต่อ
  DL.FFShape = ffShape;
  DL.FFUpdate = ffUpdate;

  /* ---------- รูป block FF: กล่อง + pin labels + สามเหลี่ยม CLK + ค่า Q ---------- */
  function ffShape(labelText) {
    return function (g, node) {
      var w = node.opts.w || node.def.w || 130;
      var h = node.opts.h || node.def.h || 64;
      var S = DL.Render.svgEl;
      g.appendChild(S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 5, 'class': 'comp-body' }));
      var t = S('text', { x: 0, y: -h / 2 + 16, 'class': 'comp-label' });
      t.textContent = labelText;
      g.appendChild(t);
      // สามเหลี่ยม symbol ของ clock (dynamic/edge-triggered)
      var idx = node.def.inputs.indexOf('clk');
      if (idx >= 0) {
        var pinY = (idx - (node.def.inputs.length - 1) / 2) * 18;
        g.appendChild(S('path', {
          d: 'M' + (-w / 2) + ',' + (pinY - 6) + ' L' + (-w / 2 + 10) + ',' + pinY + ' L' + (-w / 2) + ',' + (pinY + 6),
          fill: 'none', stroke: '#0f172a', 'stroke-width': 2
        }));
      }
      // ค่า Q ปัจจุบันโชว์ในบล็อก
      var q = S('text', { x: w / 2 - 18, y: 10, 'class': 'comp-label', 'font-size': '16px' });
      q.setAttribute('data-q', '1');
      g.appendChild(q);
    };
  }

  function ffUpdate(g, node) {
    var q = g.querySelector('[data-q]');
    if (q) {
      q.textContent = String(node.out.q);
      q.setAttribute('fill', node.out.q === '?' ? '#d97706' : (node.out.q === 1 ? '#16a34a' : '#334155'));
    }
  }

  function registerFF(kind, labelText, inputs, edgeFn, explainFn, pinLabels, opts) {
    opts = opts || {};
    DL.registerComponent(kind, {
      inputs: inputs,
      outputs: ['q', 'qn'],
      isFF: true,
      w: opts.w || 130, h: opts.h || 64,
      pinLabels: pinLabels,
      evalNode: function (node, v) {   // ระหว่าง propagate Q ห้ามเปลี่ยน ยกเว้น async CLR
        if (v && v.clr === 1) {        // CLR = 1 → ล้างทันที ไม่รอ clock (async clear)
          node.state.q = 0;
          node.state.qn = 1;
        }
        return { q: node.state.q, qn: node.state.qn };
      },
      initNode: function (node) {
        node.state = { q: 0, qn: 1 };
        node._prevClk = undefined;
      },
      edge: edgeFn,
      explain: explainFn,
      shape: ffShape(labelText),
      update: ffUpdate
    });
  }

  /* ---------- SR_LATCH (transparent latch) ---------- */
  DL.registerComponent('SR_LATCH', {
    inputs: ['s', 'r'],
    outputs: ['q', 'qn'],
    w: 130, h: 64,
    pinLabels: { s: 'S', r: 'R', q: 'Q', qn: 'Q̄' },
    evalNode: function (node, v) {
      var q;
      if (isHigh(v.s) && !isHigh(v.r)) q = 1;          // set
      else if (!isHigh(v.s) && isHigh(v.r)) q = 0;     // reset
      else if (isHigh(v.s) && isHigh(v.r)) q = T;      // สถานะต้องห้าม
      else q = node.state.q;                           // hold
      node.state.q = q;
      node.state.qn = (q === T) ? T : (q ? 0 : 1);
      return { q: node.state.q, qn: node.state.qn };
    },
    initNode: function (node) { node.state = { q: 0, qn: 1 }; },
    shape: ffShape('SR Latch'),
    update: ffUpdate
  });

  /* ---------- D Flip-Flop: Q next = D ---------- */
  registerFF('DFF', 'D-FF', ['d', 'clk'],
    function (state, v) {
      return v.d === T ? T : (isHigh(v.d) ? 1 : 0);
    },
    function (n, before, after) {
      return 'CLK ▲: D=' + n.ins.d + ' → Q ' + before + '→' + after + ' (Q ตาม D เสมอ)';
    },
    { d: 'D', clk: 'CLK', q: 'Q', qn: 'Q̄' });

  /* ---------- JK Flip-Flop ---------- */
  registerFF('JKFF', 'JK-FF', ['j', 'k', 'clk'],
    function (state, v) {
      var j = isHigh(v.j), k = isHigh(v.k);
      if (j && k) return state.q === T ? 1 : (1 - state.q);   // toggle
      if (j) return 1;                                        // set
      if (k) return 0;                                        // reset
      return state.q;                                         // hold
    },
    function (n, before, after) {
      var j = isHigh(n.ins.j), k = isHigh(n.ins.k);
      var mode = (j && k) ? 'toggle (สลับ)' : j ? 'set (1)' : k ? 'reset (0)' : 'hold (คงเดิม)';
      return 'CLK ▲: J=' + n.ins.j + ', K=' + n.ins.k + ' → Q ' + before + '→' + after + ' (' + mode + ')';
    },
    { j: 'J', k: 'K', clk: 'CLK', q: 'Q', qn: 'Q̄' });

  /* ---------- T Flip-Flop (มี async CLR สำหรับ decade counter) ---------- */
  registerFF('TFF', 'T-FF', ['t', 'clr', 'clk'],
    function (state, v) {
      if (!isHigh(v.t)) return state.q;                       // hold
      return state.q === T ? 1 : (1 - state.q);               // toggle
    },
    function (n, before, after) {
      return 'CLK ▲: T=' + n.ins.t + ' → Q ' + before + '→' + after +
             (isHigh(n.ins.t) ? ' (toggle — หารความถี่เป็น 2)' : ' (hold)');
    },
    { t: 'T', clr: 'CLR', clk: 'CLK', q: 'Q', qn: 'Q̄' });

  /* ---------- SR Flip-Flop (มี clock) ---------- */
  registerFF('SRFF', 'SR-FF', ['s', 'r', 'clk'],
    function (state, v) {
      var s = isHigh(v.s), r = isHigh(v.r);
      if (s && r) return T;          // สถานะต้องห้าม
      if (s) return 1;
      if (r) return 0;
      return state.q;
    },
    function (n, before, after) {
      var s = isHigh(n.ins.s), r = isHigh(n.ins.r);
      var mode = (s && r) ? '⚠ ห้าม! S=R=1' : s ? 'set (1)' : r ? 'reset (0)' : 'hold (คงเดิม)';
      return 'CLK ▲: S=' + n.ins.s + ', R=' + n.ins.r + ' → Q ' + before + '→' + after + ' (' + mode + ')';
    },
    { s: 'S', r: 'R', clk: 'CLK', q: 'Q', qn: 'Q̄' });
})();
