/* ===== Digital Learning — กลุ่ม B: Latch & Flip-Flop (บท 10–13) =====
 * บท 10 SR Latch / SR FF · 11 D-FF · 12 JK-FF · 13 T-FF
 * ตรรกะ FF ทดสอบใน tests/sequential.test.js ผ่าน build ของบทนี้
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  /* ---------- บทที่ 10: SR Latch ---------- */
  DL.registerLesson({
    id: 'latch-sr',
    group: 'flipflop',
    title: 'SR Latch & SR Flip-Flop — วงจรจำ 1 บิต',
    subtitle: 'จุดเริ่มของหน่วยความจำทั้งหมด — S ตั้ง 1, R ล้าง 0',
    html:
      '<h2>จาก gate สู่ความจำ</h2>' +
      '<p>ทุกวงจรที่ผ่านมาลืมค่าทันทีที่ input เปลี่ยน (combinational) — ถ้าต่อ gate 2 ตัว <b>ไขว้กลับกัน</b> ' +
      '(output ของตัวหนึ่งเข้า input อีกตัว) มันจะ <b>จำค่าไว้ได้</b> วงจรง่ายสุดคือ SR latch ทำจาก NOR 2 ตัว:</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">S ──[NOR]──┬──→ Q\n        └───┼──\n            │  │(ไขว้กลับ)\n            ├──┘\nR ──[NOR]──┴──→ Q̄</pre>' +
      '<p>พฤติกรรม (S=1 เรียกว่า set — ตั้ง Q เป็น 1 / R=1 เรียกว่า reset — ล้างเป็น 0):</p>' +
      '<table class="tt"><tr><th>S</th><th>R</th><th>Q</th><th>เรียกว่า</th></tr>' +
      '<tr><td>0</td><td>0</td><td>คงเดิม</td><td>Hold — จำค่าไว้ (นี่คือ "หน่วยความจำ"!)</td></tr>' +
      '<tr><td>1</td><td>0</td><td>1</td><td>Set</td></tr>' +
      '<tr><td>0</td><td>1</td><td>0</td><td>Reset</td></tr>' +
      '<tr><td>1</td><td>1</td><td>⚠</td><td>ห้ามใช้ (forbidden)</td></tr></table>' +
      '<div class="warn"><b>ทำไม S=R=1 ห้ามใช้?</b> Q กับ Q̄ จะเป็น 0 ทั้งคู่ (ขัดกับชื่อ) และพอปล่อย S,R กลับ 0 พร้อมกัน ' +
      'ค่าที่จำได้จะขึ้นกับ "ใครช้ากว่า" แบบสุ่ม — วงจรของเราโชว์เป็นไฟสีเหลือง ? ให้เห็นชัดๆ</div>' +

      '<h2>Latch vs Flip-Flop — ต่างกันตรงไหน?</h2>' +
      '<ul>' +
      '<li><b>Latch</b> = ตอบสนองระดับสัญญาณ (level) — S เปลี่ยนเมื่อไหร่ Q เปลี่ยนตามทันที (transparent)</li>' +
      '<li><b>Flip-Flop</b> = ตอบสนองขอบสัญญาณ (edge) — เปลี่ยนเฉพาะจังหวะขอบขึ้นของสัญญาณ CLK เท่านั้น ทำให้ควบคุมเวลาได้แม่นยำ</li>' +
      '</ul>' +
      '<p>SR flip-flop คือ latch ที่ใส่ประตู clock ครอบไว้ — กด Pulse Clock ในวงจรที่สองเทียบกับ latch ตัวแรกดู</p>',
    summary:
      '<ul>' +
      '<li>SR latch = <b>NOR 2 ตัวไขว้</b> (S,R active-high) → จำ 1 บิต (S=1 → Q=1, R=1 → Q=0, S=R=0 → จำเดิม)</li>' +
      '<li>แบบ NAND 2 ตัวก็มี แต่ input เป็น active-low (S̅,R̅) ตรงข้าม — ข้อสอบระวังอ่านชื่อให้ดี</li>' +
      '<li>S=R=1 คือ <b>สถานะต้องห้าม</b> ห้ามใช้ในข้อสอบและวงจรจริง</li>' +
      '<li>Latch ตอบสนองระดับ (level), Flip-Flop ตอบสนองขอบ (edge) — ทุก FF ต่อจากนี้เป็น edge-triggered</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง SR Latch — จำ 1 บิต (เปลี่ยนตาม S/R ทันที)',
        build: function (sim) {
          sim.addInput('s', { x: 60, y: 60, label: 'S' });
          sim.addInput('r', { x: 60, y: 130, label: 'R' });
          sim.addComponent('l', 'SR_LATCH', { x: 300, y: 95 });
          sim.addOutput('qLed', { x: 480, y: 60, label: 'Q' });
          sim.addOutput('qnLed', { x: 480, y: 135, label: 'Q̄' });
          sim.wire('s', 'out', 'l', 's', [[200, 60], [200, 80]]);
          sim.wire('r', 'out', 'l', 'r', [[230, 130], [230, 98]]);
          sim.wire('l', 'q', 'qLed', 'in', [[400, 60], [400, 60]]);
          sim.wire('l', 'qn', 'qnLed', 'in');
          sim.explain('S=R=0 → latch จำค่าเดิม (เริ่มที่ Q=0)');
        },
        steps: ['กด S — Q ติดทันที (set)', 'ปิด S — Q ยังติด! (นี่คือการจำ — input หายไปแล้วค่ายังอยู่)', 'กด R — Q ดับ (reset)', 'กด S+R พร้อมกัน — เห็นไฟเหลือง ? = สถานะต้องห้าม'] },
      { title: 'ทดลอง SR Flip-Flop (แบบมี CLK) — เทียบกับ latch',
        build: function (sim) {
          sim.addInput('s', { x: 60, y: 60, label: 'S' });
          sim.addInput('r', { x: 60, y: 130, label: 'R' });
          sim.addComponent('f', 'SRFF', { x: 320, y: 95 });
          sim.addOutput('qLed', { x: 500, y: 60, label: 'Q' });
          sim.addOutput('qnLed', { x: 500, y: 135, label: 'Q̄' });
          sim.wire('s', 'out', 'f', 's', [[210, 60], [210, 80]]);
          sim.wire('r', 'out', 'f', 'r', [[240, 130], [240, 98]]);
          sim.wire('f', 'q', 'qLed', 'in');
          sim.wire('f', 'qn', 'qnLed', 'in');
          sim.explain('ตั้ง S/R ก่อน แล้วค่อยกด Pulse Clock — Q จะเปลี่ยนตอนขอบขึ้นเท่านั้น');
        },
        steps: ['กด S=1 แต่ยังไม่ pulse — Q ยังเป็น 0 (ต่างจาก latch!)', 'กด Pulse Clock — Q ติด ณ จังหวะขอบขึ้นพอดี', 'S=R=1 แล้ว pulse — เห็น Q เป็น ? (ห้าม) แล้วลอง S=1,R=0 pulse เพื่อกลับมาปกติ'] }
    ]
  });

  /* ---------- บทที่ 11: D Flip-Flop ---------- */
  DL.registerLesson({
    id: 'd-ff',
    group: 'flipflop',
    title: 'D Flip-Flop — ตัวเก็บข้อมูลมาตรฐาน',
    subtitle: 'Q ตาม D ตอนขอบขึ้นของ clock — บล็อกพื้นฐานของ register ทุกตัว',
    html:
      '<h2>แก้ปัญหา "ห้าม" ของ SR ด้วยการเลิกให้มีสองสวิตช์</h2>' +
      '<p>ปัญหาของ SR คือมีสถานะต้องห้าม วิธีแก้แบบเรียบร้อยสุด: ใช้ input เดียวชื่อ <b>D (Data)</b> ' +
      'แล้วยัด D เข้า S และ D̅ (ผ่าน NOT) เข้า R — คราวนี้ S กับ R ไม่มีทางเป็น 1 พร้อมกันได้เลย</p>' +
      '<p style="text-align:center;font-size:19px"><b>Q(next) = D</b> — เมื่อไหร่มีขอบขึ้นของ CLK เมื่อนั้น Q ก๊อปค่า D</p>' +
      '<table class="tt"><tr><th>D</th><th>CLK</th><th>Q(next)</th></tr>' +
      '<tr><td>0</td><td>▲</td><td>0</td></tr>' +
      '<tr><td>1</td><td>▲</td><td>1</td></tr>' +
      '<tr><td>x</td><td>0 หรือ 1 (ไม่ขึ้น)</td><td>คงเดิม</td></tr></table>' +

      '<h2>รู้จัก "edge-triggered" ให้ขึ้นใจ</h2>' +
      '<p>วงจรด้านล่าง: ลองเปลี่ยน D โดยที่ยังไม่กด Pulse Clock — <b>Q ไม่ขยับเลย</b> แม้ D เปลี่ยนกี่รอบ ' +
      'Q จะยอมเปลี่ยนเฉพาะวินาทีที่กด pulse (ขอบขั้น) เท่านั้น นี่คือเหตุผลที่ระบบดิจิทัลใหญ่คุมจังหวะทุกอย่างด้วย clock ตัวเดียวได้</p>' +
      '<div class="note">D-FF ตัวเดียว = หน่วยความจำ 1 บิต เอามา 8 ตัวเรียงกัน = <b>8-bit register</b> ' +
      'ที่เก็บ 1 ไบต์ (เจอต่อในบท <a href="#/lesson/register-memory">Register &amp; Memory</a>)</div>',
    summary:
      '<ul>' +
      '<li>D-FF: <b>Q(next) = D</b> — ก๊อปข้อมูลตอนขอบขั้นของ CLK</li>' +
      '<li>ระหว่างขอบ Q แข็งค่าไม่ขยับ (สร้าง register/บัฟเฟอร์ได้)</li>' +
      '<li>โจทย์คลาสสิก: D=1 ก่อนขอบ แล้ว D=0 หลังขอบ → Q จับ 1 (ค่า ณ จังหวะขอบเท่านั้นที่มีผล)</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง D Flip-Flop — Q ก๊อป D ตอนขอบขึ้นเท่านั้น',
        build: function (sim) {
          sim.addInput('d', { x: 60, y: 60, label: 'D' });
          sim.addComponent('f', 'DFF', { x: 320, y: 95 });
          sim.addOutput('qLed', { x: 500, y: 60, label: 'Q' });
          sim.addOutput('qnLed', { x: 500, y: 135, label: 'Q̄' });
          sim.wire('d', 'out', 'f', 'd', [[210, 60], [210, 80]]);
          sim.wire('f', 'q', 'qLed', 'in');
          sim.wire('f', 'qn', 'qnLed', 'in');
          sim.explain('D=0, Q=0 — กด D ดูก่อน แล้วค่อย pulse');
        },
        steps: ['กด D=1 — สังเกตว่า Q ยังเป็น 0 (ยังไม่ถึงขอบ)', 'กด Pulse Clock — Q ก๊อป 1 ทันที', 'ปิด D กลับ 0 — Q ยังคง 1 ไม่ขยับจนกว่าจะ pulse อีกครั้ง'] }
    ]
  });

  /* ---------- บทที่ 12: JK Flip-Flop ---------- */
  DL.registerLesson({
    id: 'jk-ff',
    group: 'flipflop',
    title: 'JK Flip-Flop — ราชาแห่ง Flip-Flop',
    subtitle: 'SR ที่กล้า toggle ได้ — 4 โหมดครบในตัวเดียว (universal FF)',
    html:
      '<h2>JK = SR ที่ไม่มีสถานะต้องห้าม</h2>' +
      '<p>JK พัฒนาต่อจาก SR เปลี่ยนชื่อ S→J, R→K แต่ที่เจ๋งคือกรณี "ทั้งคู่เป็น 1" ซึ่ง SR ห้าม กลายเป็นโหมดใหม่ที่มีประโยชน์สุดๆ: ' +
      '<b>toggle — สลับค่า Q</b></p>' +
      '<table class="tt"><tr><th>J</th><th>K</th><th>Q(next)</th><th>โหมด</th></tr>' +
      '<tr><td>0</td><td>0</td><td>คงเดิม</td><td>Hold</td></tr>' +
      '<tr><td>1</td><td>0</td><td>1</td><td>Set</td></tr>' +
      '<tr><td>0</td><td>1</td><td>0</td><td>Reset</td></tr>' +
      '<tr><td>1</td><td>1</td><td>สลับ (0↔1)</td><td><b>Toggle</b></td></tr></table>' +

      '<h2>Race-Around —กับดัก ของ JK ที่อาจารย์ชอบถาม</h2>' +
      '<div class="warn"><b>Race around condition:</b> ถ้า JK เป็นแบบ level-triggered (ตอบสนองระดับ) และ CLK สูงนานกว่า ' +
      'เวลาที่วงจรประมวลผล ตอน J=K=1 Q จะ <b>สลับวนซ้ำไม่หยุด</b> ตลอดที่ CLK ยังสูง — ค่าสุดท้ายคาดเดาไม่ได้</div>' +
      '<p>วิธีแก้ 2 ทาง: ใช้ FF แบบ <b>edge-triggered</b> (จับแค่จังหวะขอบเดียว) หรือใช้โครง <b>master-slave</b> ' +
      '— วงจรจำลองของเราเป็น edge-triggered จึงกด pulse 1 ครั้ง สลับ 1 ครั้งพอดีเป๊ะ ลองกด J=K=1 แล้ว pulse ไปเรื่อยๆ ดู Q สลับทีละครั้ง</p>' +

      '<h2>ทำไมถูกเรียกว่า universal?</h2>' +
      '<ul>' +
      '<li>ต่อ J กับ K เข้าด้วยกันผ่านสวิตช์เดียว → ได้ <b>T-FF</b> (บทถัดไป)</li>' +
      '<li>ต่อ K = J̅ (ผ่าน NOT) → ได้ <b>D-FF</b></li>' +
      '<li>J=1,K=0 / J=0,K=1 → ใช้เป็น SR ได้</li>' +
      '</ul>',
    summary:
      '<ul>' +
      '<li>จำ 4 โหมด: <b>00 hold · 10 set · 01 reset · 11 toggle</b></li>' +
      '<li>J=K=1 ไม่ห้ามอีกต่อไป — สลับ Q ทุกขอบขั้น</li>' +
      '<li>Race-around เกิดกับ level-triggered ที่ CLK กว้าง — แก้ด้วย edge-triggered หรือ master-slave</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง JK Flip-Flop — กด J=K=1 แล้ว pulse ไปเรื่อยๆ',
        build: function (sim) {
          sim.addInput('j', { x: 60, y: 50, label: 'J' });
          sim.addInput('k', { x: 60, y: 115, label: 'K' });
          sim.addComponent('f', 'JKFF', { x: 320, y: 100, h: 74 });
          sim.addOutput('qLed', { x: 500, y: 65, label: 'Q' });
          sim.addOutput('qnLed', { x: 500, y: 140, label: 'Q̄' });
          sim.wire('j', 'out', 'f', 'j', [[200, 50], [200, 70]]);
          sim.wire('k', 'out', 'f', 'k', [[235, 115], [235, 88]]);
          sim.wire('f', 'q', 'qLed', 'in');
          sim.wire('f', 'qn', 'qnLed', 'in');
          sim.explain('J=K=0 → hold — กด pulse กี่ครั้ง Q ก็ไม่ขยับ');
        },
        steps: ['กด J=1 (K=0) pulse → set Q=1', 'กด K=1 (J=0) pulse → reset Q=0', 'กดทั้งคู่ (J=K=1) แล้ว pulse ซ้ำๆ — Q สลับ 0,1,0,1 ทีละครั้งพอดี', 'อ่านกล่องคำอธิบายด้านล่างวงจร — บอกโหมดที่ใช้ทุกครั้ง'] }
    ]
  });

  /* ---------- บทที่ 13: T Flip-Flop ---------- */
  DL.registerLesson({
    id: 't-ff',
    group: 'flipflop',
    title: 'T Flip-Flop — Toggle และการหารความถี่',
    subtitle: 'JK ที่ต่อ J=K รวมเป็นสวิตช์เดียว — พื้นฐานของตัวนับทุกตัว',
    html:
      '<h2>T = Toggle</h2>' +
      '<p>เอา JK มาต่อ J กับ K เข้าด้วยกันเป็นสวิตช์เดียวชื่อ <b>T</b> เหลือ 2 โหมดพอดี:</p>' +
      '<table class="tt"><tr><th>T</th><th>Q(next)</th><th>ผลที่เกิด</th></tr>' +
      '<tr><td>0</td><td>คงเดิม</td><td>Hold — นิ่ง</td></tr>' +
      '<tr><td>1</td><td>สลับ 0↔1</td><td>Toggle — กะพริบทุกขอบ</td></tr></table>' +

      '<h2>คุณสมบัติมหัศจรรย์: หารความถี่เป็นสอง</h2>' +
      '<p>เมื่อ T=1 Q จะสลับ "ครึ่งความถี่" ของ clock เสมอ — clock ขึ้น 2 ครั้ง Q สลับครบ 1 รอบ ' +
      'ดังนั้นความถี่ของ Q = f<sub>clock</sub> ÷ 2 พอดี</p>' +
      '<pre style="background:#e2e8f0;border-radius:8px;padding:10px 14px">CLK:  ▔▔▁▁▔▔▁▁▔▔▁▁\nQ:    ▁▁▔▔▁▁▔▔▁▁▔▔   ← ช้าลงเป็น 2 เท่า</pre>' +
      '<p>ต่อ T-FF หลายตัวโยงกัน (FF ตัวถัดไปใช้ Q ของตัวก่อนเป็น clock) → หาร 2, 4, 8, 16 … ' +
      'นั่นแหละคือ <b>binary counter</b> ทั้งตระกูล — เจอแบบเต็มๆ ในบท <a href="#/lesson/counter">Counter</a></p>' +
      '<div class="note">T-FF มีขายไม่มากในชิปจริง ส่วนใหญ่ได้มาจากการต่อ JK ให้ J=K=1 ตลอด (ลองกด T ในวงจรแล้วนึกถึง JK)</div>',
    summary:
      '<ul>' +
      '<li>T=1 → toggle ทุกขอบ · T=0 → hold</li>' +
      '<li><b>f(Q) = f(CLK) ÷ 2</b> เสมอเมื่อ T=1 — หารความถี่</li>' +
      '<li>T-FF โยงกันหลายตัว = counter หาร 2/4/8/16</li>' +
      '</ul>',
    circuits: [
      { title: 'ทดลอง T Flip-Flop — กะพริบครึ่งความถี่',
        build: function (sim) {
          sim.addInput('t', { x: 60, y: 70, label: 'T' });
          sim.addComponent('f', 'TFF', { x: 320, y: 95 });
          sim.addOutput('qLed', { x: 500, y: 60, label: 'Q' });
          sim.addOutput('qnLed', { x: 500, y: 135, label: 'Q̄' });
          sim.wire('t', 'out', 'f', 't', [[210, 70], [210, 80]]);
          sim.wire('f', 'q', 'qLed', 'in');
          sim.wire('f', 'qn', 'qnLed', 'in');
          sim.explain('T=0 → hold — กด pulse ดู Q นิ่ง');
        },
        steps: ['กด T=1 แล้ว pulse ไปเรื่อยๆ — Q สลับทุกครั้ง (นับจำนวน pulse เป็นเลขคู่/คี่)', 'ปิด T=0 pulse — Q หยุดนิ่งทันที', 'เปิด T=1 กด 4 ครั้ง — Q สลับครบ 2 รอบ = หารความถี่ 2 ตามทฤษฎี'] }
    ]
  });
})();
