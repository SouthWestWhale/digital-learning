/* ===== Digital Learning — CircuitSim engine =====
 * โมเดลวงจรดิจิทัล: nodes + wires + topological evaluation
 * - ค่า logic คือ 1, 0 หรือ '?' (สถานะต้องห้าม/ไม่กำหนด)
 * - Gate เป็น pure function; flip-flop (M3) เก็บ state และอัปเดตเฉพาะ clockEdge()
 * - ไฟล์นี้ต้องไม่พึ่ง DOM — ทดสอบใน node ได้ (ดู tests/sim.test.js)
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  /* ---------- ตาราง eval ของ gate (รับ array ค่า input, คืนค่าเดียว) ---------- */
  var GATES = {
    AND:    function (v) { return v.every(function (x) { return x === 1; }) ? 1 : 0; },
    OR:     function (v) { return v.some(function (x) { return x === 1; }) ? 1 : 0; },
    NOT:    function (v) { return v[0] === 1 ? 0 : 1; },
    XOR:    function (v) { // n-input = odd parity
              var c = 0;
              v.forEach(function (x) { if (x === 1) c++; });
              return c % 2 === 1 ? 1 : 0; },
    NAND:   function (v) { return GATES.AND(v) ? 0 : 1; },
    NOR:    function (v) { return GATES.OR(v) ? 0 : 1; },
    BUFFER: function (v) { return v[0]; }
  };
  DL.GATE_TYPES = Object.keys(GATES);

  /* ---------- ทะเบียน component ขยายได้ (MUX/DFF/... จะลงทะเบียนในไฟล์บทเรียน) ---------- */
  var COMPONENTS = {};
  DL.registerComponent = function (kind, def) {
    if (!def || !Array.isArray(def.inputs) || !Array.isArray(def.outputs) ||
        (typeof def.eval !== 'function' && typeof def.evalNode !== 'function')) {
      throw new Error('registerComponent(' + kind + '): ต้องมี inputs[], outputs[] และ eval() หรือ evalNode()');
    }
    COMPONENTS[kind] = def;
  };

  function CircuitSim() {
    this.nodes = {};     // id -> node
    this.wires = [];     // {from:{id,pin}, to:{id,pin}, waypoints, value}
    this.order = [];     // ลำดับการสร้าง (ใช้วาด)
    this.listeners = [];
    this.lastEvent = null;
  }

  CircuitSim.prototype._add = function (node) {
    if (this.nodes[node.id]) throw new Error('id ซ้ำ: ' + node.id);
    this.nodes[node.id] = node;
    this.order.push(node.id);
    return node;
  };

  /* ---------- สร้างชิ้นส่วน ---------- */
  CircuitSim.prototype.addInput = function (id, opts) {
    opts = opts || {};
    return this._add({ kind: 'input', id: id, value: 0,
                       label: opts.label || id, x: opts.x || 0, y: opts.y || 0,
                       out: 0 });
  };

  CircuitSim.prototype.addOutput = function (id, opts) {
    opts = opts || {};
    return this._add({ kind: 'output', id: id, label: opts.label || id,
                       color: opts.color || 'green', x: opts.x || 0, y: opts.y || 0,
                       ins: null });
  };

  CircuitSim.prototype.addGate = function (id, type, opts) {
    opts = opts || {};
    if (!GATES[type]) throw new Error('gate ไม่รู้จักชนิด: ' + type);
    var n = opts.n || (type === 'NOT' || type === 'BUFFER' ? 1 : 2);
    return this._add({ kind: 'gate', id: id, type: type, n: n,
                       x: opts.x || 0, y: opts.y || 0,
                       ins: new Array(n).fill(0), out: 0 });
  };

  CircuitSim.prototype.addComponent = function (id, kind, opts) {
    opts = opts || {};
    var def = COMPONENTS[kind];
    if (!def) {
      throw new Error('component ไม่รู้จักชนิด "' + kind + '" — ต้อง DL.registerComponent ก่อน');
    }
    var node = this._add({ kind: 'comp', id: id, comp: kind, def: def,
                           x: opts.x || 0, y: opts.y || 0, opts: opts,
                           ins: {}, out: {} });
    if (def.initNode) def.initNode(node);   // FF/latch: สร้าง state เริ่มต้น
    return node;
  };

  /* ---------- สายไฟ ---------- */
  CircuitSim.prototype.wire = function (fromId, fromPin, toId, toPin, waypoints) {
    var from = this.nodes[fromId];
    var to = this.nodes[toId];
    if (!from) throw new Error('wire: ไม่พบ node ต้นทาง "' + fromId + '"');
    if (!to) throw new Error('wire: ไม่พบ node ปลายทาง "' + toId + '"');
    // ห้ามสองสายยึด input pin เดียวกัน
    for (var i = 0; i < this.wires.length; i++) {
      var w = this.wires[i];
      if (w.to.id === toId && String(w.to.pin) === String(toPin)) {
        throw new Error('wire: pin "' + toPin + '" ของ "' + toId + '" ถูกต่อสายไว้แล้ว');
      }
    }
    return this.wires.push({ from: { id: fromId, pin: fromPin },
                             to: { id: toId, pin: toPin },
                             waypoints: waypoints || [], value: 0 }) - 1;
  };

  /* ---------- ค่า input / eval เฉพาะตัว ---------- */
  CircuitSim.prototype.setInput = function (id, v) {
    var n = this.nodes[id];
    if (!n || n.kind !== 'input') throw new Error('setInput: "' + id + '" ไม่ใช่ input');
    v = v ? 1 : 0;
    if (n.value === v) return;           // ค่าเดิม → ไม่ evaluate ไม่ยิง onChange
    n.value = v;
    this.evaluate();
    this._fire();
  };

  CircuitSim.prototype.toggleInput = function (id) {
    var n = this.nodes[id];
    if (!n || n.kind !== 'input') throw new Error('toggleInput: "' + id + '" ไม่ใช่ input');
    this.setInput(id, n.value ? 0 : 1);
  };

  CircuitSim.prototype.setEval = function (id, fn) {
    var n = this.nodes[id];
    if (!n) throw new Error('setEval: ไม่พบ node "' + id + '"');
    n.customEval = fn;
  };

  /* ---------- ค่าที่อ่านได้ ---------- */
  CircuitSim.prototype.outputValue = function (id) {
    var n = this.nodes[id];
    if (!n || n.kind !== 'output') throw new Error('outputValue: "' + id + '" ไม่ใช่ output');
    return n.ins;
  };

  CircuitSim.prototype.wireValue = function (id, pin) {
    for (var i = 0; i < this.wires.length; i++) {
      var w = this.wires[i];
      if (w.from.id === id && String(w.from.pin) === String(pin)) return w.value;
    }
    throw new Error('wireValue: ไม่พบสายจาก "' + id + '" pin "' + pin + '"');
  };

  /* ---------- คำอธิบายทีละขั้น ---------- */
  CircuitSim.prototype.explain = function (text, warn) {
    this.lastEvent = { text: text, warn: !!warn };
  };

  CircuitSim.prototype.onChange = function (fn) {
    this.listeners.push(fn);
  };
  CircuitSim.prototype._fire = function () {
    for (var i = 0; i < this.listeners.length; i++) this.listeners[i](this);
  };

  /* ---------- evaluation ---------- */
  function upstreamsOf(sim) {
    var ups = {};   // nodeId -> [sourceId...] (ไม่ซ้ำ)
    Object.keys(sim.nodes).forEach(function (id) { ups[id] = []; });
    sim.wires.forEach(function (w) {
      if (ups[w.to.id].indexOf(w.from.id) < 0) ups[w.to.id].push(w.from.id);
    });
    return ups;
  }

  function topoSort(sim, ups) {
    var indeg = {}, keys = Object.keys(sim.nodes), i;
    keys.forEach(function (id) { indeg[id] = ups[id].length; });
    var queue = keys.filter(function (id) { return indeg[id] === 0; });
    var order = [];
    while (queue.length) {
      var id = queue.shift();
      order.push(id);
      sim.wires.forEach(function (w) {
        if (w.from.id !== id) return;
        indeg[w.to.id] -= 1;
        if (indeg[w.to.id] === 0) queue.push(w.to.id);
      });
    }
    if (order.length !== keys.length) {
      throw new Error('วงจรมี feedback loop ระดับ combinational — ห้ามต่อสายย้อนกลับโดยไม่ผ่าน flip-flop');
    }
    return order;
  }

  // ค่า pin ต้นทาง "สด" ของสาย — topo order รับประกันว่าต้นทางถูกคำนวณก่อนผู้บริโภค
  function srcValue(sim, w) {
    var src = sim.nodes[w.from.id];
    if (src.kind === 'input') return src.value;
    if (src.kind === 'gate') return src.out;
    if (src.kind === 'comp') return src.out[w.from.pin];
    return src.ins;
  }

  function pinValues(sim, node) {
    // รวบรวมค่า input ของ node หนึ่ง: gate → array ตาม index, comp → map ตามชื่อ, output → ค่าเดียว
    var arr, map;
    if (node.kind === 'gate') {
      arr = new Array(node.n).fill(0);
      sim.wires.forEach(function (w) {
        if (w.to.id !== node.id) return;
        arr[Number(w.to.pin)] = srcValue(sim, w);
      });
      return arr;
    }
    if (node.kind === 'comp') {
      map = {};
      node.def.inputs.forEach(function (name) { map[name] = 0; });
      sim.wires.forEach(function (w) {
        if (w.to.id !== node.id) return;
        map[w.to.pin] = srcValue(sim, w);
      });
      return map;
    }
    var v = 0;
    sim.wires.forEach(function (w) {
      if (w.to.id === node.id) v = srcValue(sim, w);
    });
    return v;
  }

  function evalNode(sim, node, vals) {
    var hasQ = function (list) {
      return list.some ? list.some(function (x) { return x === '?'; })
                       : list === '?';
    };
    if (node.kind === 'input') return node.value;
    if (node.kind === 'output') return vals;
    if (node.kind === 'gate') {
      if (node.customEval) return node.customEval(vals);
      if (hasQ(vals)) return '?';
      return GATES[node.type](vals);
    }
    // comp — def.evalNode (stateful: latch/FF อ่าน-เขียน node.state) มาก่อน customEval;
    // ถ้ามี input เป็น '?' กระจาย '?' ทุก output
    if (node.def.evalNode) return node.def.evalNode(node, vals);
    if (node.customEval) return node.customEval(vals);
    var names = Object.keys(vals);
    var bad = false;
    for (var i = 0; i < names.length; i++) {
      if (vals[names[i]] === '?') { bad = true; break; }
    }
    if (bad) {
      var outQ = {};
      node.def.outputs.forEach(function (p) { outQ[p] = '?'; });
      return outQ;
    }
    return node.def.eval(vals);
  }

  CircuitSim.prototype.evaluate = function () {
    var sim = this;
    var ups = upstreamsOf(sim);
    var order = topoSort(sim, ups);
    order.forEach(function (id) {
      var node = sim.nodes[id];
      var vals = pinValues(sim, node);
      node.ins = vals;   // เก็บค่า input ปัจจุบันไว้ที่ node (clockEdge อ่านตอน edge)
      var out = evalNode(sim, node, vals);
      if (node.kind === 'input') node.out = out;
      else if (node.kind === 'output') node.ins = out;
      else if (node.kind === 'gate') node.out = out;
      else node.out = out;
    });
    // อัปเดตค่าบนสายจาก pin ต้นทาง
    sim.wires.forEach(function (w) {
      var src = sim.nodes[w.from.id];
      var pin = w.from.pin;
      if (src.kind === 'input') w.value = src.value;
      else if (src.kind === 'gate') w.value = src.out;
      else if (src.kind === 'comp') w.value = src.out[pin];
      else w.value = src.ins;
    });
    return this;
  };

  /* ---------- รายการ input ทั้งหมด (controls ใช้สร้างปุ่ม) ---------- */
  CircuitSim.prototype.inputList = function () {
    var sim = this;
    return this.order.filter(function (id) {
      return sim.nodes[id].kind === 'input';
    }).map(function (id) { return sim.nodes[id]; });
  };
  CircuitSim.prototype.outputList = function () {
    var sim = this;
    return this.order.filter(function (id) {
      return sim.nodes[id].kind === 'output';
    }).map(function (id) { return sim.nodes[id]; });
  };
  CircuitSim.prototype.hasClock = function () {
    var sim = this;
    return this.order.some(function (id) {
      var n = sim.nodes[id];
      return n.kind === 'comp' && (n.comp === 'CLOCK' || /FF/.test(n.comp) || !!n.opts.needClock);
    });
  };

  /* ---------- clock: ขอบขึ้นต่อการเรียก 1 ครั้ง ----------
   * FF แบบ primary (opts.clocked) — ทุก clockEdge() คือ 1 ขอบขั้น
   * FF แบบ ripple (opts.clockFrom = 'ffId' หรือ 'ffId:qn') — ยิงเมื่อค่า clock
   *   ต้นทาง "ขอบขึ้น" (0→1) ณ ตอนที่ถึงคิวของตัวเอง (ประมวลผลตามลำดับประกาศ
   *   จึงเหมือน ripple จริงที่ค่อยๆ ไหลทีละตัว)
   * ห้าม evaluate Q ใหม่ระหว่าง propagate — Q เปลี่ยนเฉพาะที่นี่เท่านั้น
   */
  CircuitSim.prototype.clockEdge = function () {
    var sim = this;
    this.evaluate();   // รีเฟรชค่า D/J/K/T/S/R รอบ FF

    var msgs = [];
    this.order.forEach(function (id) {
      var n = sim.nodes[id];
      if (n.kind !== 'comp' || !n.def.isFF) return;

      var edge = false;
      var primary = (n.opts.clocked !== undefined)
        ? n.opts.clocked
        : (n.def.inputs.indexOf('clk') >= 0);   // FF ที่มี pin clk = primary โดยดีฟอลต์
      if (n.opts.clockFrom !== undefined) primary = false;  // ripple — ขับด้วย FF ตัวอื่น
      if (primary) {
        edge = true;
      } else if (n.opts.clockFrom !== undefined) {
        var parts = String(n.opts.clockFrom).split(':');
        var src = sim.nodes[parts[0]];
        if (!src || src.kind !== 'comp' || !src.def.isFF) {
          throw new Error('clockFrom ต้องชี้ไปที่ flip-flop: ' + n.opts.clockFrom);
        }
        var clkVal = parts[1] === 'qn' ? src.state.qn : src.state.q;
        if (n._prevClk === undefined) {
          n._prevClk = clkVal;          // จับค่าเริ่มต้นไว้ก่อน — ไม่ยิง edge ครั้งแรก
        } else {
          edge = (n._prevClk === 0 && clkVal === 1);
          n._prevClk = clkVal;
        }
      }
      if (!edge) return;

      var before = n.state.q;
      var after = n.def.edge(n.state, n.ins, n);
      n.state.q = after;
      n.state.qn = (after === '?') ? '?' : (after ? 0 : 1);
      msgs.push(n.def.explain ? n.def.explain(n, before, after)
                              : (id + ': Q ' + before + '→' + after));
    });

    this.evaluate();   // propagate Q ใหม่ไปทั้งวงจร
    this.explain(msgs.length ? msgs.join(' | ') : 'CLK ▲ — ทุก flip-flop คงค่าเดิม (hold)');
    this._fire();
  };

  /* ---------- รีเซ็ต FF ทุกตัวกลับ Q=0 ---------- */
  CircuitSim.prototype.reset = function () {
    var sim = this;
    this.order.forEach(function (id) {
      var n = sim.nodes[id];
      if (n.kind === 'comp' && n.def.isFF) {
        n.state.q = (n.def.initQ !== undefined) ? n.def.initQ : 0;
        n.state.qn = n.state.q ? 0 : 1;
        n._prevClk = undefined;
      }
    });
    this.evaluate();
    this.explain('รีเซ็ต — flip-flop ทุกตัวกลับสู่ Q = 0');
    this._fire();
  };

  DL.CircuitSim = CircuitSim;
})();
