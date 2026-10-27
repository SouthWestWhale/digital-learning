/* ===== Digital Learning — บทพื้นฐาน (กลุ่ม A) =====
 * บท: 2. Logic Gates (บทอื่นๆ ของกลุ่ม A จะประกาศ "เหนือ" บทนี้ในไฟล์เดียวกัน
 *      เพื่อคงลำดับ sidebar ตามแผน)
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  /* ---------- ตัวช่วยสร้างวงจร gate เดี่ยว (A,B → LED) ---------- */
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

  /* ---------- บทที่ 2: Logic Gates ---------- */
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
})();
