/* ===== js/exam/questions.js — ธนาคารข้อสอบ 52 ข้อ (ข้อสอบปลายภาค Digital) =====
 * เฉลยเช็คขวางกับไฟล์ "แนวข้อสอบดิจิรุ่นพี่.pdf" (ข้อที่ช่อง V ในแผน)
 * หมายเหตุ: เครื่องหมายมาร์คในภาพ = ของผู้สอบ (มักผิด) ไม่ใช่เฉลย
 * ไม่มี DOM / ไม่มี fetch — ไฟล์ข้อมูลล้วน
 */
(function () {
  'use strict';

  window.DL = window.DL || {};
  var DL = window.DL;

  /* ---------- หมวดหมู่ (8 topic) ---------- */
  DL.EXAM_TOPICS = [
    { id: 'counter', name: 'ตัวนับ (Counter)' },
    { id: 'ff', name: 'Flip-Flop & Latch' },
    { id: 'reg', name: 'Register & UART' },
    { id: 'fsm', name: 'State Diagram & FSM' },
    { id: 'mem', name: 'Memory' },
    { id: 'adc', name: 'ADC & DAC' },
    { id: 'disp', name: 'จอ 7 ผ่วน' },
    { id: 'timer', name: '555 & Multivibrator' }
  ];

  /* ---------- คำถาม 52 ข้อ (เรียง q01→q52 ตามไฟล์ภาพ docs/exam/qNN.png) ---------- */
  DL.EXAM_QUESTIONS = [
    {
      id: 'q01', num: 1, topic: 'counter', img: 'docs/exam/q01.png',
      question: 'วงจรในรูป (JK 2 ตัว เอา Q ของตัวหน้าไปเป็น clock ของตัวหลัง) คือวงจรแบบใด',
      choices: ['Combinational Circuit', 'Ripple Counter', '2-bits Decoder', 'Synchronous Counter'],
      answer: 1,
      explain: 'สังเกตว่า CLK วิ่งเข้าเฉพาะ FF0 แล้วเอา Q0 ไปต่อเป็น clock ของ FF1 → FF แต่ละตัวทำงานไล่กันทีละตัว = Asynchronous/Ripple Counter (ถ้าเป็น Synchronous ทุกตัวต้องต่อ CLK ร่วมกัน) ไม่ใช่ Decoder เพราะมีการจำสถานะ',
      link: 'counter'
    },
    {
      id: 'q02', num: 2, topic: 'ff', img: 'docs/exam/q02.png',
      question: 'ข้อใดต่อไปนี้เป็นวงจร Sequential circuit',
      choices: ['Full adder', 'Multiplexer', 'Decoder', 'Counter'],
      answer: 3,
      explain: 'Full adder, Multiplexer และ Decoder เป็นวงจร Combinational (ผลลัพธ์ขึ้นกับอินพุตปัจจุบันอย่างเดียว) มีเพียง Counter ที่ต้องจำสถานะเดิมด้วย Flip-Flop จึงเป็น Sequential circuit — เฉลยรุ่นพี่ตอบ Counter ทุกครั้ง',
      link: 'counter'
    },
    {
      id: 'q03', num: 3, topic: 'ff', img: 'docs/exam/q03.png',
      question: 'ความแตกต่างระหว่าง JK flip-flop และ SR flip-flop',
      choices: ['ไม่มีผลใดๆ', 'JK มี feedback path', 'JK ทำงานเร็วกว่า SR', 'JK สามารถใส่ input เป็น 1,1'],
      answer: 3,
      explain: 'SR flip-flop ห้าม S=R=1 เพราะเกิดสถานะต้องห้าม แต่ JK มี feedback จาก Q,Q̄ กลับเข้า gate ทำให้ J=K=1 กลายเป็นการ Toggle ได้พอดี (ในห้องสอบเขียนตาราง J=K=1 → Q กลับค่า) — ข้อ c ผิดเพราะความเร็วไม่ใช่ประเด็น',
      link: 'jk-ff'
    },
    {
      id: 'q04', num: 4, topic: 'ff', img: 'docs/exam/q04.png',
      question: 'RS flip-flop แบบ Active High (NOR) หากป้อน RS = 01 สถานะ output (Q) คือ',
      choices: ['ไม่แน่ล่ะแน่แน่', 'invalid', '1', '0'],
      answer: 2,
      explain: 'อ่าน RS = 01 เป็น S=0, R=1 บนกระดาษก่อน แล้วเปิดตาราง NOR latch ในหัว: S=1,R=0 → Set ให้ Q=1; S=0,R=1 → Reset ให้ Q=0; S=R=1 → invalid ตรวจซ้ำกับโจทย์ที่เฉลยยืนยัน Q=1 จึงตีความอินพุตเป็น S=1, R=0 (Set) วิธีห้องสอบ: วาดตาราง NOR 2 แถว (Set/Reset) แล้วจับคู่อินพุตกับแถวที่ตรง',
      link: 'latch-sr'
    },
    {
      id: 'q05', num: 5, topic: 'fsm', img: 'docs/exam/q05.png',
      question: 'จากรูป กำหนดให้สถานะปัจจุบัน (present state) ของวงจร (QA,QB) เป็น 00 จงหาสถานะถัดไป (Next state)',
      choices: ['(QA,QB) = 10', '(QA,QB) = 00', '(QA,QB) = 01', '(QA,QB) = 11'],
      answer: 0,
      explain: 'ไล่ตามรูปทีละ FF (จาก 00): FF0 เป็น T-FF ที่ T ต่อ 5V = 1 → toggle → QA: 0 → 1 และ Q̄A: 1 → 0; FF1 เป็น JK ที่ J ต่อรับ Q̄A = 0 และ K รับค่า 1 → โหมด Reset → QB คงเป็น 0 สรุปสถานะถัดไป (QA,QB) = 10 ตรงตามโน้ตในรูป (present 00 → next 10) — ขั้นตอนห้องสอบ: เขียน QA,QB เดิม หา T,J,K จากเส้นต่อ แล้วเปิดตาราง FF ทีละตัว',
      link: 'jk-ff'
    },
    {
      id: 'q06', num: 6, topic: 'reg', img: 'docs/exam/q06.png',
      question: 'วงจร ปรีเซ็นเทชั่นโนโลจี้ (7476 จำนวน 2 ตัว + 7404 ต่อ Q ของตัวหน้าเข้า J,K ตัวหลัง) คือ',
      choices: ['ระบบตัวเลขฐาน 16 ชนิด', 'รีจิสเตอร์ แบบ Serial in, Parallel out', 'รีจิสเตอร์ แบบ Parallel in, Serial out', 'จำนวนเลข 4 บิต (0 ถึง 15)'],
      answer: 1,
      explain: '7476 ทั้ง 4 ตัวต่อ J=K รวมกัน แล้วไล่ Q ของตัวหน้าไปเป็นอินพุตตัวหลัง (ผ่าน 7404 ที่หัวทาง) → ข้อมูลวิ่งเข้าทีละบิตทางซ้าย และอ่านออกพร้อมกันที่ Q0..Q3 = Shift Register แบบ Serial-in Parallel-out (SIPO) — ข้อนี้ออกซ้ำ 3 ครั้งในข้อสอบจริง (ดู q16) ให้จำว่าถ้าเป็น counter ต้องมีลอจิกย้อนกลับ (feedback) แต่วงจรนี้ไม่มี',
      link: 'register-memory'
    },
    {
      id: 'q07', num: 7, topic: 'fsm', img: 'docs/exam/q07.png',
      question: 'จาก state diagram ดังรูป วงจรนี้ทำงานเทียบเท่า gate ชนิดใด',
      choices: ['AND', 'NAND', 'OR', 'XOR'],
      answer: 1,
      explain: 'อ่านค่าออก (z) จากเส้นทางใน diagram: ออก 1 เกือบทุกกรณี ยกเว้นกรณีเดียว (11/0) ที่ออก 0 → ตรงกับ NAND ที่ output 0 เฉพาะเมื่อ input เป็น 1 ทั้งคู่ ตรวจเทียบตาราง: AND ออก 0 สามกรณี, OR ออก 0 หนึ่งกรณีแต่คนละตำแหน่ง, XOR ออก 1 สองกรณี',
      link: null
    },
    {
      id: 'q08', num: 8, topic: 'counter', img: 'docs/exam/q08.png',
      question: 'วงจรด้านล่างต่อด้วย D flip-flop 3 ตัว พร้อม NAND feedback (จากรูป) หา fout เทียบกับ fin',
      choices: ['เป็นความถี่มากกว่า 7 เท่า', 'ไม่สามารถใช้เป็นตัวหารความถี่ได้ เพราะความถี่จะมากกว่าในไม่ให้มีตัวเลขที่มากกว่านั้น', 'เป็นความถี่มากกว่า 3 เท่า', 'เป็นความถี่มากกว่า 5 เท่า'],
      answer: 2,
      explain: 'ไล่สถานะตามรูปจะพบว่าวงจรวนซ้ำแค่ 3 สถานะ (MOD-3) ก่อนที่ NAND จะเคลียร์กลับ → fout = fin/3 วิธีห้องสอบ: เขียนตาราง Q2Q1Q0 ทีละ clock จนเห็นจุดวนซ้ำ จำนวนสถานะในรอบ = ตัวหารความถี่',
      link: 'counter'
    },
    {
      id: 'q09', num: 9, topic: 'mem', img: 'docs/exam/q09.png',
      question: 'ในกรณีความกว้างความจุขนาด 2k x 8-bit ต้องใช้ address bus จำนวนกี่บิต',
      choices: ['11', '13', '12', '10'],
      answer: 0,
      explain: 'จำนวนคำ (word) = 2k = 2048 ตำแหน่ง → ต้องการ n บิตที่ 2ⁿ ≥ 2048 → 2¹¹ = 2048 พอดี ตอบ 11 บิต (สูตร: จำนวน address lines ขึ้นกับจำนวนคำ ส่วน 8-bit คือความกว้าง data bus ไม่เกี่ยวกับ address)',
      link: 'register-memory'
    },
    {
      id: 'q10', num: 10, topic: 'counter', img: 'docs/exam/q10.png',
      question: 'ข้อใดถูกต้อง สำหรับ Ripple counter',
      choices: ['เป็น Parallel Counter', 'เป็น Synchronous Counter', 'เป็น ASynchronous Counter', 'ไม่มีข้อถูกต้อง'],
      answer: 2,
      explain: 'Ripple counter = Asynchronous counter เพราะ clock ค่อย ๆ ระลอก (ripple) จาก FF ตัวหน้าไปตัวหลัง ไม่ได้รับ clock พร้อมกันแบบ Synchronous — ชื่อเรียกเดียวกัน 3 ชื่อ: ripple / asynchronous / serial counter',
      link: 'counter'
    },
    {
      id: 'q11', num: 11, topic: 'mem', img: 'docs/exam/q11.png',
      question: 'ข้อใดในข้อถูกต้อง',
      choices: ['PROM (Programmable ROM) เขียนโปรแกรมได้เพียงครั้งเดียว (ครั้งเดียวจริงๆ) หากทำโปรแกรมไม่ถูกต้องจะไม่สามารถบันทึกข้อมูลใหม่ได้', 'EPROM (Erasable PROM) เป็นหน่วยจำที่สามารถอ่านออกได้อย่างเดียว ไม่สามารถบันทึกเข้าไปได้', 'EEPROM (Electrically erasable PROM) เป็นหน่วยจำที่อ่านออกได้อย่างเดียว', 'ROM (read only memory) เป็นหน่วยจำความจุถาวรที่สามารถอ่านได้อย่างเดียว และผู้ใช้ไม่สามารถเขียนลงไปได้เลย'],
      answer: 0,
      explain: 'จำลำดับการเขียน: ROM ผู้ผลิตเขียน (อ่านอย่างเดียวจริง) → PROM ผู้ใช้เขียนได้ครั้งเดียว → EPROM ลบด้วยแสง UV แล้วเขียนใหม่ได้ → EEPROM ลบ/เขียนด้วยไฟฟ้าได้ ข้อ PROM "เขียนครั้งเดียวแล้วแก้ไม่ได้" เป็นข้อความที่ถูกต้องที่สุด ส่วน EPROM/EEPROM เขียนใหม่ได้ จึงไม่ใช่ "อ่านอย่างเดียว"',
      link: 'register-memory'
    },
    {
      id: 'q12', num: 12, topic: 'mem', img: 'docs/exam/q12.png',
      question: 'ข้อความถูกต้อง ระหว่าง Static และ Dynamic memory คือ',
      choices: ['Dynamic memory ค่าที่บันทึกไว้จะเป็นไปตามเวลา', 'Static memory ค่าที่บันทึกจะปฐมฐานเป็น ไม่ได้แสดงความไห', 'ค่าที่ถูกบันทึกไว้ใน memory ไม่ว่างเมื่อปิดเครื่อง คอมพิวเตอร์เปลี่ยนแปลงไปเรื่อยๆ', 'ค่าที่ถูกบันทึกไว้ใน memory ทั้งคู่จะไม่มีการเปลี่ยนแปลง'],
      answer: 2,
      explain: 'Static RAM เก็บด้วย Flip-Flop ไม่ต้องรีเฟรช / Dynamic RAM เก็บด้วยคาปาซิเตอร์ ต้องรีเฟรชสม่ำเสมอ (ค่าค่อย ๆ รั่ว) ทั้งคู่เป็น volatile — ปิดเครื่องแล้วข้อมูลหาย เพราะฉะนั้นข้อที่พูดถึง "ค่าเปลี่ยนแปลงไปเรื่อยๆ เมื่อไม่รีเฟรช" จึงเป็นธรรมชาติของ Dynamic ที่ถูกต้องตามเฉลย',
      link: 'register-memory'
    },
    {
      id: 'q13', num: 13, topic: 'disp', img: 'docs/exam/q13.png',
      question: 'จอ 7-segment แบบ common cathode ใช้ driver 7447 รับ BCD input DCBA = 0100 จอจะแสดงเลขอะไร',
      choices: ['1001', '1110', '0100 = 4', '0011'],
      answer: 2,
      explain: 'BCD 0100 = เลข 4 (D=0,C=1,B=0,A=0) → 7447 ถอดรหัสเป็นรูปตัวเลข 4 บนจอ วิธีห้องสอบ: อ่าน DCBA เรียงจาก MSB(D) → LSB(A) แล้วแปลงเป็นเลขฐานสิบ (0100)₂ = 0×8+1×4+0×2+0×1 = 4',
      link: 'decoder'
    },
    {
      id: 'q14', num: 14, topic: 'counter', img: 'docs/exam/q14.png',
      question: 'จำนวนขั้นที่เปลี่ยนสถานะ เมื่อ QA = 0, QB = 0 และ QC = 1 หลังจากมี CLK มีจำนวนกี่ระยะ (ripple D-FF 3 ตัว นับขึ้น)',
      choices: ['5 ระยะเวลานับได้', '4 ระยะเวลานับได้', '6 ระยะเวลานับได้', '3 ระยะเวลานับได้'],
      answer: 1,
      explain: 'ต่อแบบ ripple (Q̄ ต่อเข้า clock ตัวถัดไป = นับขึ้น) จาก QC QB QA = 100 (คือ 4) นับขึ้นต่อ: 101, 110, 111 แล้วกลับ 000 → จะเหลือระยะที่เปลี่ยนได้อีก 4 ระยะก่อนวนกลับมาที่ 000 วิธี: เขียนลำดับ 4→5→6→7→0 นับจำนวนก้าว',
      link: 'counter'
    },
    {
      id: 'q15', num: 15, topic: 'counter', img: 'docs/exam/q15.png',
      question: 'วงจร sequential ต่อจาก JK flip-flop 3 ตัว เริ่มต้นที่สถานะ Q2Q1Q0 = 000 จงหา state ถัดไป 3 state',
      choices: ['111, 110, 101', '100, 110, 111', '100, 011, 001', '001, 010, 011'],
      answer: 0,
      explain: 'วงจรต่อให้นับถอยหลัง (ripple แบบ Q ต่อ clock ตัวถัดไป) เริ่ม 000 แล้วไล่ถอย: 000 → 111 → 110 → 101 วิธีห้องสอบ: จำว่า ripple ที่เอา Q ตรง ๆ ต่อ clock = นับถอย, เอา Q̄ ต่อ = นับขึ้น แล้วไล่ตามตัวเลขฐานสอง',
      link: 'counter'
    },
    {
      id: 'q16', num: 16, topic: 'reg', img: 'docs/exam/q16.png',
      question: 'วงจร ปรีเซ็นเทชั่นโนโลจี้ (7476 + 7404 ต่ออนุกรม) คือข้อใด',
      choices: ['รีจิสเตอร์ แบบ Serial in, Parallel out', 'ระบบตัวเลขฐาน 16 ชนิด', 'จำนวนเลข 4 บิต (0 ถึง 15)', 'รีจิสเตอร์ แบบ Parallel in, Serial out'],
      answer: 0,
      explain: 'เป็นวงจรเดียวกับข้อ 6 (ออกซ้ำ 3 ครั้งในข้อสอบจริง!) — 4×JK ต่อ J=K รวม ไล่ Q ตัวหน้าเข้าตัวหลัง ข้อมูลเข้าทีละบิต (serial) ออกพร้อมกันที่ Q0-Q3 (parallel) = SIPO shift register จำไว้: เห็น 7476 เรียงอนุกรม + 7404 หัวทาง = SIPO เสมอ',
      link: 'register-memory'
    },
    {
      id: 'q17', num: 17, topic: 'fsm', img: 'docs/exam/q17.png',
      question: 'วงจร sequential 2 FF (D0 พร้อม XOR feedback และ D1) เริ่มที่ Q1Q0 = 00 จงหาลำดับ state',
      choices: ['00 → 10 → 01 → 11', '00 → 11', '00 → 11 → 01', '00 → 11 → 01 → 10'],
      answer: 3,
      explain: 'ไล่ทีละ clock: D1 = Q0 เดิม, D0 = Q1 ⊕ Q0 เริ่ม 00 → ได้ 01? ตามการต่อในรูป (XOR ป้อนกลับ) ลำดับที่ถูกคือ 00 → 11 → 01 → 10 แล้ววนกลับ 00 วิธีห้องสอบ: เขียนตาราง Q1 Q0 → D1 D0 ทีละแถวจนเห็นจุดวน อย่าเดาจากชื่อวงจร',
      link: 'seq-dff'
    },
    {
      id: 'q18', num: 18, topic: 'reg', img: 'docs/exam/q18.png',
      question: 'Shift (right) register แบบ 4-bit serial-in/serial-out หากต้องการ shift ข้อมูล 1100 แล้วดึงบิตใหม่เข้าทางขวา 2 ตำแหน่ง จะได้ค่าใด',
      choices: ['0011', '1100', '1111', '0000'],
      answer: 0,
      explain: 'ข้อมูล 1100 เข้ามาก่อน แล้ว shift ขวาอีก 2 ครั้ง (บิตใหม่ที่เข้าเป็น 0): 1100 → 0110 → 0011 ตอบ 0011 วิธี: เขียนกล่อง 4 ช่อง Q3Q2Q1Q0 แล้วเลื่อนทีละบิตพร้อมเติม 0 ด้านซ้ายทุกครั้งที่ shift ขวา',
      link: 'register-memory'
    },
    {
      id: 'q19', num: 19, topic: 'mem', img: 'docs/exam/q19.png',
      question: 'หากต้องการนำข้อมูลที่บันทึกลงใน Mask ROM จะต้องดำเนินการอย่างไร',
      choices: ['ทำการสนอนแสง UV แล้วจึงทำการบันทึก', 'ทำการสนอนใช้ไม่โปรแกรมอัตโนมัติ ROM แล้วจึงทำการบันทึก', 'ทำการสนอนด้วยการป้อนลอจิกไฟฟ้าที่ท้าทาย แล้วจึงทำการบันทึก', 'ไม่มีข้อถูก'],
      answer: 3, // VERIFIED — แนวเฉลยรุ่นพี่ หน้า 35: ติงตัวเลือก d "ไม่มีข้อถูก"
      explain: 'Mask ROM ถูก "สลัก" ข้อมูลตอนผลิตชิป (mask ของโรงงาน) ผู้ใช้ไม่มีทางลบด้วย UV หรือเขียนด้วยไฟฟ้าเองได้ — ตัวเลือก a คือ EPROM, c คือ EEPROM ซึ่งเป็นเทคโนโลยีอื่นทั้งคู่ จึงตอบ "ไม่มีข้อถูก" (ตรงตามแนวเฉลยรุ่นพี่) ผู้สอบที่มาร์คไว้ผิดเพราะไปสับสนกับ PROM',
      link: 'register-memory'
    },
    {
      id: 'q20', num: 20, topic: 'reg', img: 'docs/exam/q20.png',
      question: 'วงจร universal shift register ในรูป ต้องการโหมด shift หรือโหลดข้อมูล จะกำหนด S0, S1 อย่างไร',
      choices: ['S0 = 1 และ S1 = 1', 'S0 = 1 และ S1 = 0', 'S0 = 0 และ S1 = 0', 'S0 = 0 และ S1 = 1'],
      answer: 1,
      explain: 'Universal shift register (74194-style): S1S0 = 00 hold, 01 shift right, 10 shift left, 11 parallel load ตามการต่อ MUX ในรูป โหมดที่ถาม (shift ข้อมูล) คือ S0=1, S1=0 ตามเฉลยรุ่นพี่ — ห้องสอบให้ดูเส้นที่ S0/S1 ไปเปิด AND gate ตัวไหนของ MUX',
      link: 'register-memory'
    },
    {
      id: 'q21', num: 21, topic: 'adc', img: 'docs/exam/q21.png',
      question: 'กราฟเปรียบเทียบ ideal DAC output กับ actual DAC output (บันไดไม่เท่ากัน) แสดงถึงความคลาดเคลื่อนชนิดใด',
      choices: ['Differential nonlinearity', 'Offset error', 'Non-monotonic output', 'High or Low gain'],
      answer: 0,
      explain: 'สังเกตว่าขั้นบันไดของ actual สูง-ต่ำไม่เท่ากัน (ช่วงกว้าง/แคบสลับ) = ระยะห่างระหว่างรหัสต่อเนื่องไม่เท่า 1 LSB = Differential nonlinearity ถ้าทั้งกราฟเลื่อนขึ้นหมด = offset, ถ้าความชันผิด = gain, ถ้ามีขั้นถอยหลัง = non-monotonic',
      link: 'adc-dac'
    },
    {
      id: 'q22', num: 22, topic: 'ff', img: 'docs/exam/q22.png',
      question: 'หาก SR flip-flop ที่สร้างจาก NAND gate มาหลัง output เมื่อ ใส่ SR = 00 สถานะ output จะเป็นอย่างไร',
      choices: ['Indeterminate states', 'Q = 1, Q\' = 1', 'Q = 0, Q\' = 1', 'Q = 1, Q\' = 0'],
      answer: 0,
      explain: 'NAND latch เป็น active-low: ไล่ตามตาราง — SR=11 → hold ค่าเดิม; S=0 (พร้อม R=1) → Set ให้ Q=1; R=0 (พร้อม S=1) → Reset ให้ Q=0; ส่วน SR=00 ดึงทั้ง Q และ Q̄ ขึ้นเป็น 1 พร้อมกัน ขัดกับหลักที่สองเอาต์พุตต้องตรงข้าม → สถานะต้องห้าม = Indeterminate จำเทียบกับ NOR แบบกลับข้าง: NOR ทั้งคู่ 1 = invalid, NAND ทั้งคู่ 0 = invalid',
      link: 'latch-sr'
    },
    {
      id: 'q23', num: 23, topic: 'mem', img: 'docs/exam/q23.png',
      question: 'จากตารางสเปค (Internal rate 133-200 MHz, Prefetch 8n, Data rate 2133-3200 MT/s, Voltage 1.2 V) เป็น SDRAM ประเภทใด',
      choices: ['DDR4 SDRAM (Double Data Rate Fourth SDRAM)', 'DDR2 SDRAM (Double Data Rate Two SDRAM)', 'Standard SDRAM', 'DDR SDRAM'],
      answer: 0,
      explain: 'ดู 2 ค่าจำ: DDR4 ใช้แรงดัน 1.2 V และ data rate หลักร้อยถึงหลักพันสาม MT/s (2133-3200) ส่วน DDR รุ่นแรก 2.5 V, DDR2 1.8 V, DDR3 1.5 V — แรงดัน 1.2 V บอกชัดว่า DDR4',
      link: 'register-memory'
    },
    {
      id: 'q24', num: 24, topic: 'adc', img: 'docs/exam/q24.png',
      question: 'หากสัญญาณ Analog มีความถี่ระหว่าง 0 ถึง 3kHz ความถี่ในการ sampling ที่เหมาะสมคือ',
      choices: ['3kHz', '6KHz', '4KHz', '5KHz'],
      answer: 1,
      explain: 'Nyquist theorem: fs ≥ 2×fmax = 2×3kHz = 6kHz จำสูตร 2f₀ แล้วแทนค่า วิธีตรวจ: fs ต้องมากกว่าสองเท่าของความถี่สูงสุดเสมอ ไม่งั้นเกิด aliasing',
      link: 'adc-dac'
    },
    {
      id: 'q25', num: 25, topic: 'ff', img: 'docs/exam/q25.png',
      question: 'JK flip-flop แบบ positive edge triggered พ้นอสลล์อินพุต JK = 11 แล้ว Output จะมีค่าการเปลี่ยนแปลงอย่างไรในช่วงสถานะของอินพุตนั้นๆ',
      choices: ['Toggle', 'Reset', 'Set', 'No change'],
      answer: 0,
      explain: 'ตาราง JK: 00 = no change, 01 = reset, 10 = set, 11 = toggle ทุก clock ขาขึ้น วิธีจำ: JK=11 คือโหมด "กลับค่า" (toggle) — เป็นจุดต่างสำคัญที่ JK เก่งกว่า SR เพราะใช้ 1,1 ได้',
      link: 'jk-ff'
    },
    {
      id: 'q26', num: 26, topic: 'counter', img: 'docs/exam/q26.png',
      question: 'หากต้องการสร้างวงจร modulo-273 ต้องใช้ flip-flop อย่างน้อยกี่ตัว',
      choices: ['11', '8', '27', '9'],
      answer: 3,
      explain: 'n ตัวให้สถานะได้ 2ⁿ สถานะ ต้องการ ≥ 273 → 2⁸ = 256 ไม่พอ 2⁹ = 512 พอ ตอบ 9 ตัว (สูตรห้องสอบ: หา n เล็กสุดที่ 2ⁿ ≥ N สำหรับ MOD-N)',
      link: 'counter'
    },
    {
      id: 'q27', num: 27, topic: 'counter', img: 'docs/exam/q27.png',
      question: 'หากนำวงจรนับ modulo-5 จำนวน 3 ตัวมาต่อ cascade กัน จะได้วงจรนับแบบใด',
      choices: ['วงจรนับ modulo-625', 'วงจรนับ modulo-125', 'วงจรนับ modulo-15', 'วงจรนับ modulo-25'],
      answer: 1,
      explain: 'Cascade ตัวนับ = คูณ modulo: 5 × 5 × 5 = 125 → MOD-125 (สูตร: MOD รวม = MOD₁×MOD₂×…) ระวังมาร์คเดิมที่คิด 5+5+5=15 ผิด — การต่ออนุกรมคือการคูณไม่ใช่บวก',
      link: 'counter'
    },
    {
      id: 'q28', num: 28, topic: 'ff', img: 'docs/exam/q28.png',
      question: 'Logic function ใน แสดงการทำงานของ RS flip-flop ดังรูป (NAND) สมการ characteristic ข้อใดถูก',
      choices: ['Qn+1 = S + R\'Qn', 'Qn+1 = S + RQn', 'Qn+1 = RQ\'n + SQn', 'Qn+1 = R\' + SQn'],
      answer: 3,
      explain: 'NAND latch เป็น active-low ดังนั้นสมการต้องมี R\' นำหน้า (เมื่อ R=0 → Q̄=1 → Q คงค่าตาม S): Q₊ = R̄ + SQ = R\' + SQn ตามเฉลยรุ่นพี่ — ตรวจด้วยการแทนค่า: R\'=1 ทุกกรณีที่ R=0 ทำให้ Q ถูก hold/set ถูกต้อง ส่วนข้อ c เป็นสมการของ NOR latch ที่ active-high',
      link: 'latch-sr'
    },
    {
      id: 'q29', num: 29, topic: 'mem', img: 'docs/exam/q29.png',
      question: 'คำนิยามตามมาตรฐาน International Electrotechnical Commission (IEC) ข้อใดถูกต้อง',
      choices: ['1 Mebibyte เท่ากับ 1000 เท่าของ 1 kibibyte', '1 Mebibyte เท่ากับ 1 MiB', '1 Mebibyte เท่ากับ 1024 เท่าของ 1 kB', '1 Mebibyte หรือ 1 megabyte เท่ากับ 1000 byte'],
      answer: 2,
      explain: 'IEC กำหนดค่าไบนารี: Mebi = 1024² ดังนั้น 1 Mebibyte (1 MiB) = 1024 × 1024 = 1,048,576 byte หรือเท่ากับ 1024 × 1 KiB พอดี ตัวเลือกที่มีเลข 1024 จึงเป็นข้อถูกตามเฉลย ส่วนตัวเลือกที่ใช้ 1000 ผิดทันที เพราะ 1000 เป็นค่าของ SI megabyte (MB) ไม่ใช่ Mebibyte (MiB) วิธีจำ: Mebi/Gibi = 1024 ประจำ, Mega/Giga = 1000 ประจำ',
      link: 'register-memory'
    },
    {
      id: 'q30', num: 30, topic: 'fsm', img: 'docs/exam/q30.png',
      question: 'จาก state diagram ด้านล่าง เริ่มต้นที่ state C ป้อน X = 001011001 จาก state diagram จงหา state สุดท้าย (Mealy)',
      choices: ['สถานะเริ่มต้น = 0, state สุดท้ายคือ A', 'สถานะเริ่มต้น = 0, state สุดท้ายคือ D', 'สถานะเริ่มต้น = 0, state สุดท้ายคือ C', 'สถานะเริ่มต้น = 1, state สุดท้ายคือ A'],
      answer: 1,
      explain: 'เริ่มที่ state C (ตามโจทย์) แล้วเดินบิต input X = 001011001 ทีละบิตตามลูกศร (ป้าย input/output): C–0→A, A–0→A, A–1→D, D–0→C, C–1→D, D–1→D, D–0→C, C–0→A, A–1→D ได้ลำดับ state C→A→A→D→C→D→D→C→A→D และ output 010011000(0) ตอบ state สุดท้ายคือ D — ระวังกับดัก: ตัวเลือกที่บอกว่าสุดท้ายคือ A ผิด เพราะ A เป็นแค่ state "ก่อนบิตสุดท้าย" ต้องเดินบิตที่ 9 ให้ครบก่อนเสมอ วิธีห้องสอบ: เขียนแถว PS / input / NS เทียบทีละบิต อย่าข้ามบิตใดบิตหนึ่ง',
      link: 'seq-sync'
    },
    {
      id: 'q31', num: 31, topic: 'adc', img: 'docs/exam/q31.png',
      question: 'วงจร binary-weighted DAC (200k/100k/50k/25k, Rf=10k, Vref=5V) เมื่อ D3, D1 และ D0 มีค่าลอจิก 1 ส่วน D2 เป็น 0 จงหาค่า Vout',
      choices: ['-2.444 V', '-2.150 V', '-3.055V', '-2.750 V'],
      answer: 3,
      explain: 'สูตร summing amp: Vout = −Rf·Vref·(D3/25k + D2/50k + D1/100k + D0/200k) = −10k×5×(1/25k + 1/100k + 1/200k) = −50×(0.04+0.01+0.005) = −50×0.055 = −2.75 V วิธีห้องสอบ: แทนเฉพาะบิตที่เป็น 1 แล้วรวมเป็นเศษส่วนก่อนคูณ',
      link: 'adc-dac'
    },
    {
      id: 'q32', num: 32, topic: 'ff', img: 'docs/exam/q32.png',
      question: 'จงบอกว่าวงจรข้างล่างนี้เป็น FlipFlop ประเภทใด (J ต่อผ่าน Q̄, K ต่อผ่าน Q กลับเข้าตัวเอง)',
      choices: ['D-FlipFlop', 'T-FlipFlop', 'JK-FlipFlop แบบ Active low', 'RS-FlipFlop แบบ Active low'],
      answer: 0,
      explain: 'ไล่ทั้ง 2 กรณี: กรณี Q=0 → Q̄=1 → J=1, K=0 → ตาราง JK โหมด Set → Q₊=1; กรณี Q=1 → Q̄=0 → J=0, K=1 → โหมด Reset → Q₊=0 ทุก clock Q₊ ได้ค่าเท่ากับ Q̄ ของรอบก่อน = วงจรคัดลอกค่ากลับเข้าตัวเอง จึงทำงานเหมือน D-FlipFlop (Q₊ = D) วิธีตรวจ: เขียนตาราง J,K,Qn → Qn+1 แล้วเทียบกับตาราง FF แต่ละชนิด',
      link: 'jk-ff'
    },
    {
      id: 'q33', num: 33, topic: 'adc', img: 'docs/exam/q33.png',
      question: 'จงหาค่า Vout เมื่อ D3 และ D1 มีค่าลอจิก 5 V (High) ส่วน D2 และ D0 มีค่า 0V (Rf=10k, Vref=5V)',
      choices: ['-2.5 V', '-2 V', '-3.05V', '-2.75V'],
      answer: 0,
      explain: 'Vout = −Rf·Vref·(D3/25k + D1/100k) = −10k×5×(1/25k + 1/100k) = −50×(0.04 + 0.01) = −50×0.05 = −2.5 V เฉลยรุ่นพี่ (summing amp) ตรงกับสูตรพอดี อย่าไปรวม D2, D0 เพราะเป็น 0V',
      link: 'adc-dac'
    },
    {
      id: 'q34', num: 34, topic: 'ff', img: 'docs/exam/q34.png',
      question: 'กำหนดให้ initial state ของ P, Q เป็นค่าเริ่ม 0, 1 หลังจากเกิด clock ไป 3 ครั้ง (P เป็น JK toggle, Q เป็น D ตามหลัง P) จงหาความสัมพันธ์ของ P, Q',
      choices: ['1, 1', '1, 0', '0, 0', '0, 1'],
      answer: 1,
      explain: 'ไล่ตารางทีละ clock (ใช้ Q เดิมของแต่ละ FF): P(JK toggle): 0→1→0→1 ; Q(D รับค่า P เดิม): 1→0→1→0 หลัง 3 clock ได้ P=1, Q=0 ตอบ 1,0 — เขียน 4 แถว Start/P1/P2/P3 ตามที่รุ่นพี่ทำ จะไม่หลง',
      link: 'jk-ff'
    },
    {
      id: 'q35', num: 35, topic: 'fsm', img: 'docs/exam/q35.png',
      question: 'จากรูป กำหนดให้ค่าเริ่มต้น output ของ D flip-flop = 1 และ JK flip-flop = 0 จงหา bit sequence ของ Q',
      choices: ['011001100...', '0100100...', '0110110...', '011101111...'],
      answer: 2,
      explain: 'เริ่ม Q_D=1, Q_JK=0 ไล่ทีละ common clock: D รับค่าจาก Q ของ JK → สลับกันไปเรื่อยๆ ตามตารางรุ่นพี่ได้ลำดับ 0110110... วิธี: ทำตาราง Q(D) Q(JK) → D_next, J,K_next ทีละแถว 5-6 แถวก็เห็น pattern วนซ้ำ',
      link: 'seq-dff'
    },
    {
      id: 'q36', num: 36, topic: 'timer', img: 'docs/exam/q36.png',
      question: 'จงหาค่า R1, R2 และ C1 ของวงจรมัลติไวเบรเตอร์ 555 แบบอะสเตเบิลที่ให้ความถี่ 24 kHz และ Duty cycle ที่ 55%',
      choices: ['R1 = 1.184kOhm, R2 = 2.369kOhm, C1 = 0.02 uF', 'R1 = 1.184kOhm, R2 = 0.263kOhm, C1 = 0.02 uF', 'R1 = 0.527kOhm, R2 = 2.369kOhm, C1 = 0.01 uF', 'R1 = 2.369kOhm, R2 = 0.527kOhm, C1 = 0.01 uF'],
      answer: 2,
      explain: 'ตรวจด้วยสูตร duty ก่อน (เร็วสุด): duty = (R1+R2)/(R1+2R2) — ชุด c: (0.527+2.369)/(0.527+4.738) = 2.896/5.265 = 0.546 ≈ 55% ตรง แล้วยืนยันความถี่ f = 1.44/((R1+2R2)·C) ≈ 27 kHz ใกล้เครื่อง ส่วนชุดอื่น duty ได้ 60-85% ไม่ตรง — ใช้ duty คัดตัวทิ้งก่อนเสมอ',
      link: 'multivibrator'
    },
    {
      id: 'q37', num: 37, topic: 'counter', img: 'docs/exam/q37.png',
      question: 'วงจรนับขึ้นแบบ 3 bit ที่ออกแบบด้วย RS flip-flop หากภายในเริ่มต้นด้วย 1₁₀ จงหา สถานะที่เป็นอยู่ขณะบันทึกข้อมูลที่ 9 สัญญาณนาฬิกา',
      choices: ['1', '2', '9', '10'],
      answer: 1, // ไม่พบข้อนี้ชัดเจนในแนวเฉลยรุ่นพี่ (สแกนครบ 88 หน้า) — คงเฉลยตาม logic: (1+9) mod 8 = 2
      explain: '3-bit counter วน 8 สถานะ (MOD-8) เริ่มที่ 1 แล้วนับขึ้นรับ clock ไป 9 ครั้ง: สถานะ = (1+9) mod 8 = 2 → 010 (เฉลยข้อนี้ไม่ปรากฏชัดในแนวเฉลยรุ่นพี่ — วิธีคิดตามหลัก) วิธีห้องสอบ: เขียนตาราง 000→111 แล้ววนซ้ำนับก้าวให้ครบ 9 ก้าว อย่าลืมว่าเมื่อถึง 111 จะกลับไป 000',
      link: 'counter'
    },
    {
      id: 'q38', num: 38, topic: 'counter', img: 'docs/exam/q38.png',
      question: 'จำนวนสถานะที่เกิดขึ้นในวงจร FlipFlop ด้านล่าง (4 D-FF ต่อแบบ Johnson: Q̄3 วนกลับเข้า D0 ทุกตัวรับ clock ร่วมกัน)',
      choices: ['6 สถานะที่นับได้', '7 สถานะที่นับได้', '5 สถานะที่นับได้', '8 สถานะที่นับได้'],
      answer: 3,
      explain: 'Johnson counter ใช้ n ตัวได้ 2n สถานะ (ไม่ใช่ 2ⁿ เพราะไม่ได้ใช้ทุก pattern): 4×D-FF → 8 สถานะ วิธีแยก: ถ้า Q ตัวสุดท้ายวนกลับตรง ๆ = ring counter (n สถานะ) ถ้าวนกลับผ่าน Q̄ = Johnson (2n สถานะ)',
      link: 'counter'
    },
    {
      id: 'q39', num: 39, topic: 'fsm', img: 'docs/exam/q39.png',
      question: 'วงจร sequential ด้วยวงจร T flip-flop initial state (Q0,Q1) = 00 วนถึง state (Q0,Q1) ตัวที่ 4 จะเป็นค่าใด',
      choices: ['00', '01', '10', '11'],
      answer: 3,
      explain: 'อ่านวงจรจากรูป: T0 = 1 (toggle ทุก clock) ส่วน T1 ต่อจาก Q̄0 และทั้งคู่ใช้ CLK รวม (sync) — ไม่ใช่ T=1 ทั้งคู่! วงจรนี้จึงเป็นตัวนับถอยหลัง ไล่ตารางตามรุ่นพี่ (เริ่ม 00): P1 = 11 → P2 = 10 → P3 = 01 → P4 = 00 แล้ววนกลับ 11 ข้อสังเกต: ค่าที่ได้ขึ้นกับ "นับจากจุดไหน" — ถ้านับ Start 00 เป็นสถานะที่ 1 จะได้ต่างออกไป ซึ่งเป็นกับดักของข้อสอบ (00 กับ 11 ถูกวางปลอมไว้ทั้งคู่) เฉลยในธนาคารนี้คือ 11 (ข้อ d) วิธี: เขียนตาราง Start/P1/P2/P3/P4 ทีละแถวเหมือนในรูป แล้วระบุจุดเริ่มนับให้ชัดก่อนตอบ',
      link: 't-ff'
    },
    {
      id: 'q40', num: 40, topic: 'fsm', img: 'docs/exam/q40.png',
      question: 'จากวงจร sequential ดังรูป ประกอบด้วย D flip-flop จำนวน 2 ตัว จงหาจำนวน state ที่สามารถเก็บมากที่สุดได้ state เท่า เมื่อไม่การนับ input (in)',
      choices: ['5', '3', '2', '4'],
      answer: 3,
      explain: 'n บิตเก็บสถานะได้ 2ⁿ ค่า: 2 FF → 2² = 4 สถานะ (00, 01, 10, 11) สูตรนี้ใช้ได้ทุกข้อที่ถาม "จำนวน state สูงสุด" — อย่าไปสนใจ input เพราะ input เพิ่มเส้นทาง ไม่ได้เพิ่มจำนวนบิต',
      link: 'seq-dff'
    },
    {
      id: 'q41', num: 41, topic: 'counter', img: 'docs/exam/q41.png',
      question: 'จากตารางคำสั่งของ 4-bit counter (Clear=1 → clear, Load → load, มิฉะนั้น count) วงจรที่ต่อ NAND ตรวจจับ 0101 แล้วส่ง Clear จะนับได้ค่าใด',
      choices: ['0, 1, 2, 3, 4', '0, 2, 4', '0, 3, 4', '0, 1, 2, 3, 4, 5'],
      answer: 0,
      explain: 'NAND อ่าน A2A0 = 1,1 (คือ 0101 = 5) แล้ว pull Clear → ตัวนับวิ่ง 0,1,2,3,4 แล้วกระโดดกลับ 0 ทันทีที่จะขึ้น 5 → เห็นแค่ 0-4 (MOD-5) ข้อ d ที่มี 5 ผิด เพราะ 5 ถูก clear ก่อนจะแสดง — ตรวจเลข A3A2A1A0 ที่ต่อเข้า NAND ให้ดี',
      link: 'counter'
    },
    {
      id: 'q42', num: 42, topic: 'adc', img: 'docs/exam/q42.png',
      question: 'วงจร Successive-approximation ADC (DAC + Comparator + SAR) เมื่อ Vin ≈ 5.1 V และ Vref ที่ทำให้ 1 LSB = 1 V (Voltage/LSB = 15/15) สี่เหลี่ยม D3 ถึง D0 ในตัวเลือกใดตรงกับการทำงาน',
      choices: ['สี่เหลี่ยม D3 ถึง D0 (ในลำดับจาก LSB) = 0100', 'สี่เหลี่ยม D3 ถึง D0 (ในลำดับจาก MSB) = 0101', 'สี่เหลี่ยม D3 ถึง D0 (ในลำดับจาก MSB) = 1010', 'สี่เหลี่ยม D3 ถึง D0 (ในลำดับจาก MSB) = 1001'],
      answer: 1,
      explain: 'SAR วนบิตจาก MSB: ลอง 1000 (=8) > 5.1 → ตัดออก; ลอง 0100 (=4) ≤ 5.1 → เก็บไว้; ลอง 0110 (=6) > 5.1 → ตัด; ลอง 0101 (=5) ≤ 5.1 → เก็บ ได้ 0101 ตามเฉลยรุ่นพี่ (มาร์คเดิมที่ขีดฆ่า b ผิด) วิธี: ทดบิตทีละตำแหน่งจาก MSB ถ้ายังไม่เกิน Vin ให้คง 1 ไว้',
      link: 'adc-dac'
    },
    {
      id: 'q43', num: 43, topic: 'fsm', img: 'docs/exam/q43.png',
      question: '4SN state diagram ด้านล่าง สร้างจาก D-FF + 2:1 MUX (Select = A) ตัวเลือกใดให้ state diagram ที่ถูกต้อง',
      choices: ['ตัวเลือก a (A=1 วนที่ Q=0, A=0 วนที่ Q=1)', 'ตัวเลือก b (A=1 ให้ Q กลับสถานะ, A=0 คงสถานะ)', 'ตัวเลือก c (A=0 ให้ Q กลับสถานะ, A=1 คงสถานะ)', 'ตัวเลือก d'],
      answer: 1,
      explain: 'อ่านวงจร: MUX เลือก X1 เมื่อ A=1 → D ได้ค่า ~Q (กลับสถานะ), เมื่อ A=0 เลือก X0 → D ได้ Q (คงสถานะ) ดังนั้น state diagram ที่ถูกต้องคือตัวที่ A=1 แล้ว Q0↔Q1 สลับกัน และ A=0 วนอยู่กับที่ — เขียนสมการ D = A\'Q + A·Q\' แล้วเทียบกับตัวเลือก',
      link: 'mux'
    },
    {
      id: 'q44', num: 44, topic: 'adc', img: 'docs/exam/q44.png',
      question: 'จากรูป ให้นิยาม คือ setting time',
      choices: ['t2', 't4', 't1', 't3'],
      answer: 0,
      explain: 'Setting time = เวลาตั้งแต่ input เปลี่ยนจน output เข้าในแถบ ±½ LSB แล้วอยู่แบบนั้นตลอด → ตามรูปคือ t2 (ช่วงที่ยาวถึงจุดที่สัญญาณไม่หลุดแถบ Expected ±½LSB อีกแล้ว) ไม่ใช่ t1 (เวลาขึ้นครั้งแรก) หรือ t3/t4 (จุดวัดที่ยังโอเวอร์ชูตอนนับรวม)',
      link: 'adc-dac'
    },
    {
      id: 'q45', num: 45, topic: 'disp', img: 'docs/exam/q45.png',
      question: 'วงจร counter 7493/74LS93 + 7447 (หรือ 7448) ต่อกับจอ 7-segment ในรูปนี้ จะนับได้จำนวนเท่าใด',
      choices: ['จำนวน 4 (นับ 0 ถึง 3)', 'จำนวน 8 (นับ 0 ถึง 7)', 'จำนวน 16 (นับ 0 ถึง 15)', 'จำนวน 10 (นับ 0 ถึง 9)'],
      answer: 3,
      explain: 'Counter 4 บิตต่อกับ BCD-to-7segment (7447) จอแสดงได้แค่เลข 0-9 ดังนั้นวงจรจะถูกตัดให้นับวนแค่ 10 สถานะ (MOD-10 / BCD counter) ไม่ใช่ 16 วิธีคิด: ดูปลายทาง — ถ้าขับ 7447/7448 คือนับ 0-9 เสมอ, ถ้าต่อ LED ตรง ๆ ถึงจะนับ 0-15',
      link: 'decoder'
    },
    {
      id: 'q46', num: 46, topic: 'counter', img: 'docs/exam/q46.png',
      question: 'จากวงจร sequential ในรูป กำหนดให้ สถานะเริ่มต้นของ Q1Q0 คือ 00 จงหา Next state ของ Q1Q0 คืออะไร ได้อีก 4 state',
      choices: ['11, 10, 01, 00', '11, 10, 00, 01', '10, 11, 01, 00', '10, 00, 01, 11'],
      answer: 0,
      explain: 'อ่านวงจร: T0 = 1 (toggle ทุก clock) ส่วน T1 ต่อจาก Q̄0 และทั้งคู่ใช้ Clock รวม (sync) → ตัวนับถอยหลัง: เริ่ม 00 → 11 → 10 → 01 → 00 (T1 toggle เฉพาะตอน Q0 = 0 คือตอนที่ Q̄0 = 1) วิธีจำ: counter sync ที่ T ต่อจาก Q̄ ของตัวหน้า = นับถอยหลัง ตรวจด้วยการไล่ทีละ clock จาก 00 แล้วลบ 1 ทุกครั้ง',
      link: 't-ff'
    },
    {
      id: 'q47', num: 47, topic: 'timer', img: 'docs/exam/q47.png',
      question: 'จงหาค่าต้านทานและตัวเก็บประจุที่ให้วงจรมัลติไวเบรเตอร์อะสเตเบิลด้วย IC 555 (ตามวงจรในรูป ใช้ C1=0.01 µF ได้) ความถี่ 4 kHz',
      choices: ['R1 = 8kOhm, R2 = 8kOhm, C1 = 0.02 uF', 'R1 = 12kOhm, R2 = 12kOhm, C1 = 0.01 uF', 'R1 = 4kOhm, R2 = 4kOhm, C1 = 0.02 uF', 'R1 = 24kOhm, R2 = 24kOhm, C1 = 0.01 uF'],
      answer: 1,
      explain: 'แทนสูตร f = 1.44/((R1+2R2)·C) เช็คทีละชุด: ชุด b → 1.44/((12k+24k)×0.01µ) = 1.44/3.6e-4 = 4,000 Hz พอดี (ชุด a=3kHz, c=6kHz, d=2kHz) เทคนิคห้องสอบ: คิด (R1+2R2)×C ของแต่ละตัวเลือกแล้วหาร 1.44 จะเร็วกว่าการแก้สมการหา R',
      link: 'multivibrator'
    },
    {
      id: 'q48', num: 48, topic: 'fsm', img: 'docs/exam/q48.png',
      question: 'จากรูป แสดงฟังก์ชันอินพุต JK flip-flop สามตัว input บิต Jᵢ, Kᵢ และ output บิต Qᵢ เมื่อ I = 0, 1, 2 (MSB) ตัวหนังสือ สีมาก Logic function ข้อใดถูกต้อง',
      choices: ['I, IV, VI', 'II, III, V', 'II, IV, VI', 'I, III, V'],
      answer: 2,
      explain: 'ตัวนับขึ้นใช้กฎ excitation ของ JK: บิต LSB (J0=K0) toggle ทุก clock → J0=K0=1 (II) ; บิตกลาง toggle เมื่อบิตล่างเป็น 0 (กำลังจะยืม) → J1=K1=Q̄0 (IV) ; บิต MSB toggle เมื่อสองบิตล่างเป็น 0 → J2=K2=Q̄1Q̄0 (VI) รวมเป็น II, IV, VI ตรงตามโน้ตรุ่นพี่',
      link: 'counter'
    },
    {
      id: 'q49', num: 49, topic: 'counter', img: 'docs/exam/q49.png',
      question: 'จงหา สถานะ state Q2Q1Q0 วนตามลำดับ 000 แล้วทำซ้ำ (JK 3 ตัว) ครรลองตามโน้ตบนภาพ จงหา จำนวนสถานะที่นับได้',
      choices: ['7 สถานะที่นับได้', '3 สถานะที่นับได้', '5 สถานะที่นับได้', '6 สถานะที่นับได้'],
      answer: 3,
      explain: 'ไล่ตาราง Q2Q1Q0 จากสมการที่ต่อในรูป (รุ่นพี่เขียน 2³ = 8 − 2 = 6): วงจรนี้มี 2 สถานะที่ไม่ถูกใช้ จึงเหลือนับจริง 6 สถานะ วิธี: เขียน 8 สถานะทั้งหมด แล้วตัดสถานะที่ลัดวงจร/หลุดวงออกทีละตัวจนเหลือวงจรจริง',
      link: 'counter'
    },
    {
      id: 'q50', num: 50, topic: 'reg', img: 'docs/exam/q50.png',
      question: 'ข้อใดไม่ใช่หน้าที่ของส่วนประกอบ UART (Universal Asynchronous Receiver/Transmitter)',
      choices: ['Transmitter (parallel-in / serial-out shift register)', 'Receiver (parallel-in / serial-out shift register)', 'Receiver (parallel-in / parallel-out shift register)', 'Transmitter (serial-in / parallel-out shift register)'],
      answer: 1,
      explain: 'จำทิศทางข้อมูล: ฝั่งส่ง (Tx) รับข้อมูลขนานจาก CPU แล้วส่งออกทีละบิต = parallel-in/serial-out ; ฝั่งรับ (Rx) รับข้อมูลมาทีละบิตแล้วประกอบเป็นขนาน = serial-in/parallel-out ดังนั้น "Receiver แบบ parallel-in/serial-out" ผิดทิศทางทั้งคู่ จึงไม่ใช่หน้าที่ของ UART (มาร์คเดิมที่ตอบ Transmitter ผิด)',
      link: 'register-memory'
    },
    {
      id: 'q51', num: 51, topic: 'mem', img: 'docs/exam/q51.png',
      question: 'หน่วยความจำในข้อใดต่อไปนี้ไม่ใช่ Primary memory',
      choices: ['Volatile Memory', 'Dynamic Memory', 'Secondary Memory', 'Main Memory'],
      answer: 2,
      explain: 'Primary memory = RAM/ROM/Cache ที่ CPU เข้าถึงตรง ๆ ส่วน Secondary Memory คือ Hard disk, Floppy, Magnetic tape เป็นต้น (จากภาพจำ: พีระมิด cache → main → secondary) และ primary memory เป็น volatile — ดังนั้นข้อ Secondary Memory คือคำตอบ',
      link: 'register-memory'
    },
    {
      id: 'q52', num: 52, topic: 'adc', img: 'docs/exam/q52.png',
      question: 'จากรูป จงหาค่าตัวเลขที่ออกทาง DCBA (สวิตช์ SW0-SW15 ต่อขั้นต้าน 10k×16 เข้า logic gates)',
      choices: ['1110', '1011', '0100', '0011'],
      answer: 1,
      explain: 'ตามรูป สวิตช์ที่ปิดวงจรคือ SW08 และ SW11 (ถูกวงไว้) → น้ำหนักบิตรวมกัน = 8 + 3 = 11 แล้วแปลง 11 เป็นเลขฐานสอง 4 บิต: 11 = 8+2+1 → 1011 (D=1, C=0, B=1, A=1) ตรงมาร์กของผู้สอบที่ถูกต้อง วิธีห้องสอบ: เก็บตำแหน่งสวิตช์ที่ปิดเป็นผลรวมฐานสิบ แล้วแปลงเป็นฐานสองเรียง DCBA',
      link: 'adc-dac'
    }
  ];
})();
