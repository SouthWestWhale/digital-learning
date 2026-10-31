# Exam-Prep Mode (ติวฟินอลจากข้อสอบจริง) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มกลุ่มบทเรียน "ติวฟินอล" ใน digital-learning — ธนาคารข้อสอบจริง 52 ข้อ (ภาพโจทย์จริง + เฉลย + คำอธิบาย + ตรวจทันที) และวงจรจำลองกดเล่นได้ 9 บท ที่สร้างตามวงจรในข้อสอบ

**Architecture:** ต่อยอดโครงเดิมทั้งหมด — ข้อมูลข้อสอบเป็นไฟล์ JS ธรรมดา (`js/exam/questions.js`), UI ของ quiz เป็นฟังก์ชัน `DL.buildExamQuiz(container)` ที่ app.js เรียกแบบ special-case เดียวกับหน้า documents, วงจรใหม่อยู่ `js/circuits/exam.js` ลงทะเบียนผ่าน `DL.registerLesson`/`DL.registerComponent` เหมือนบทเดิมทุกอย่าง ภาพโจทย์ตัดจาก PDF ด้วยสคริปต์ Python (`tools/extract_exam.py`) เก็บเป็น `docs/exam/qNN.png`

**Tech Stack:** Vanilla JS (IIFE + `window.DL`, ห้าม fetch/ES module — เปิดจาก file://), SVG render ผ่าน engine เดิม, ทดสอบด้วย node script ล้วน (`node tests/xxx.test.js`), Python 3.13 + pymupdf (+ numpy) สำหรับตัดภาพเท่านั้น

**Spec:** แผนที่คุยกันในแชท 31 ต.ค. 2026 (อนุมัติด้วยคำว่า "จัดเลย") — สรุป: M7 ธนาคารข้อสอบครบ 52 ข้อ, M8 วงจรกลุ่ม counter/FF 5 บท, M9 วงจรกลุ่ม register/FSM/display/DAC 4 บท

## Global Constraints

- เปิดจาก `file://` ตรง ๆ: **ห้าม fetch / XHR / ES modules / bundler** — โหลดด้วย `<script>` ตามลำดับใน index.html เท่านั้น
- ทุกไฟล์ JS เป็น IIFE แนบ `window.DL` + `'use strict'` ตาม style เดิม; comment/สำนวนภาษาไทยตามไฟล์เดิม
- ภาพข้อสอบตั้งชื่อ ASCII เท่านั้น: `docs/exam/q01.png` … `q52.png` (ห้ามชื่อไทย/เว้นวรรคใน path)
- เฉลยทุกข้อต้องผ่านการเช็คขวางกับ `แนวข้อสอบดิจิรุ่นพี่.pdf` (ข้อเรียงลำดับเดียวกับไฟล์ข้อสอบ) — ห้ามใช้เครื่องหมายที่ผู้สอบมาร์กไว้ในไฟล์ข้อสอบเป็นเฉลยโดยตรง เพราะบางข้อมาร์กผิด (ยืนยันแล้วอย่างน้อย Q27)
- ทดสอบทุกชิ้นรันได้ด้วย `node tests/<file>.test.js` (pattern: `global.window = {}` + `require(...)`, ไม่ใช้ DOM)
- วงจร sequential ต้องผ่านกฎ engine: FF เท่านั้นที่ feedback ได้, ripple ต้องประกาศ FF ต้นทางก่อน (`clockFrom`), ห้าม combinational loop (NAND/NOR latch ต้องเป็น registered component ไม่ใช่ gate ต่อไขว้)
- commit ตาม convention เดิม: prefix `M7:` / `M8:` / `M9:` + คำอธิบายไทยสั้น
- ไฟล์ชั่วคราวอยู่ใน `.tmp-exam/` (untracked) — ลบทิ้งใน task สุดท้าย

## สถานะเฉลยที่รู้แล้ว (จากการอ่านไฟล์ข้อสอบทั้ง 17 หน้า)

ตารางนี้คือ answer key ตั้งต้น — ช่อง **V** = ต้องเช็คกับไฟล์เฉลยรุ่นพี่ก่อนใส่ใน questions.js, ช่อง ✓ = ยืนยันแล้วทั้งจากเครื่องหมายและตรรกะ (ค่าในวงเล็บ = เนื้อคำตอบ)

| ข้อ | เฉลย | | ข้อ | เฉลย | | ข้อ | เฉลย |
|---|---|---|---|---|---|---|---|
| q01 | ✓ Ripple Counter | | q19 | V ไม่เกี่ยวกับการโปรแกรม Mask ROM | | q37 | V (ดูตาราง state) |
| q02 | V ข้อที่ไม่ใช่ sequential | | q20 | V (นับจากวงจร Logisim) | | q38 | ✓ 8 สถานะ (Johnson 4×DFF) |
| q03 | ✓ J=K=1 → toggle | | q21 | ✓ differential nonlinearity | | q39 | ✓ สถานะที่ 4 = 11 |
| q04 | ✓ NOR S=1,R=0 → Q=1 | | q22 | V NAND latch S=R=1 → hold | | q40 | V 2 FF = 4 states |
| q05 | V present→next state | | q23 | ✓ DDR4 SDRAM | | q41 | V sequence ที่ถูก |
| q06 | V register SIPO | | q24 | ✓ 2×3k = 6 kHz (Nyquist) | | q42 | V register SIPO (ซ้ำ q06) |
| q07 | ✓ NAND | | q25 | V toggle | | q43 | V state diagram ที่ถูก |
| q08 | V f_out จาก MOD-N | | q26 | ✓ 9 FF (2⁹=512 ≥ 273) | | q44 | ✓ settling time = t2 |
| q09 | ✓ 11 address lines | | q27 | ✓ mod-25 (5×5; มาร์ก 125 ผิด) | | q45 | V counter 4-bit 0-15 |
| q10 | ✓ Asynchronous Counter | | q28 | V สมการ NAND latch | | q46 | ✓ 11,10,01,00 (down) |
| q11 | V PROM | | q29 | ✓ 1 MiB = 1024² bytes | | q47 | V 555 design (ซ้ำ q36) |
| q12 | V static vs dynamic | | q30 | V trace Mealy → state | | q48 | V ชุดสมการ II,IV,VI |
| q13 | V 7447 BCD→จอ | | q31 | V ค่า Vout ที่คิดได้ | | q49 | V จำนวนสถานะวงจรนับ |
| q14 | V นับขึ้น/ลง กี่ขั้น | | q32 | ✓ JK ต่อได้เป็น D-FF | | q50 | ✓ Receiver (PI/SO) ไม่ใช่ UART |
| q15 | ✓ 111,110,101 (down) | | q33 | ✓ −2.5 V (D1+D3) | | q51 | ✓ Secondary Memory |
| q16 | V register SIPO (ซ้ำ q06) | | q34 | V trace shift 2 FF | | q52 | ✓ 1011 (SW11 = เลข 11) |
| q17 | V sequence 2-FF FSM | | q35 | V sequence D+JK | | | |
| q18 | V shift 1100 → 0011 | | q36 | V R1/R2/C จากสูตร 555 | | | |

เลขข้อ q01–q52 = ลำดับที่ปรากฏในไฟล์ข้อสอบ (ข้อสอบจริงไม่แสดงเลขข้อให้เห็นครบ) — ใช้เลขนี้เป็น id และแสดงเป็น "ข้อที่ N ของชุด"

## File Structure

```
tools/extract_exam.py            (ใหม่, M7) สคริปต์ Python ตัดภาพข้อสอบ → docs/exam/qNN.png + contact sheet
docs/exam/q01.png … q52.png      (ใหม่, M7) ภาพโจทย์แต่ละข้อ
js/exam/questions.js             (ใหม่, M7) DL.EXAM_TOPICS + DL.EXAM_QUESTIONS (ข้อมูลล้วน ไม่พึ่ง DOM)
js/exam/examquiz.js              (ใหม่, M7) DL.EXAMQ (logic ล้วน ทดสอบใน node) + DL.buildExamQuiz(container) (UI)
js/circuits/exam.js              (ใหม่, M8-M9) บทวงจร 9 บท + component SR_LATCH_NAND, WEIGHTED_DAC
js/lessons.js                    (แก้, M7) เพิ่ม group { id:'exam', name:'ติวฟินอล — ข้อสอบจริง' } หลัง 'lab'
js/app.js                        (แก้, M7) hook 1 บรรทัดใน renderLesson ต่อจาก if (id === 'documents')
index.html                       (แก้, M7/M8) <script> js/exam/*.js และ js/circuits/exam.js ก่อน app.js
tests/examquiz.test.js           (ใหม่, M7) integrity ข้อมูล + logic ของ EXAMQ
tests/exam.test.js               (ใหม่, M8-M9) วงจรทั้ง 9 บทผ่าน build จริง
docs/exam/_contact_*.png         (ชั่วคราว, M7) แผ่นตรวจภาพ — ลบทิ้งก่อน commit
README.txt                       (แก้, M9) เพิ่มวิธีใช้กลุ่มติวฟินอล
```

## Review Focus

1. **เฉลยผิดจากการมาร์กในไฟล์ข้อสอบ** — เครื่องหมายใน PDF คือของผู้สอบ ไม่ใช่เฉลย (Q27 มาร์ก mod-125 แต่ถูกคือ mod-25) → ทุกข้อที่ช่อง V ต้องเปิดไฟล์เฉลยรุ่นพี่ยืนยันก่อนเขียนลง questions.js; test: ใน `tests/examquiz.test.js` ไม่ assert เนื้อเฉลย แต่ task M7-T3 มี step ตรวจทานจากไฟล์เฉลยจริง
2. **ภาพ crop ตก/เกินขอบ/โหลดไม่ขึ้นบน file://** — ผู้ใช้เห็นกล่องภาพว่างแล้วเข้าใจว่าข้อมูลหาย → task M7-T2 step ตรวจ contact sheet ทีละแผ่น (52 ภาพต้องครบ อ่านโจทย์ได้ครบทุกใบ) + integrity test ตรวจไฟล์มีจริงบนดิสก์
3. **localStorage ถูกปิดสิทธิ์บน file://** — quiz พังทันทีตอนบันทึกคะแนน → ครอบทุกการเขียน localStorage ด้วย try/catch เหมือน app.js (test: เรียก DL.EXAMQ.save/load โดยปลอม storage ที่ throw แล้วต้องไม่ crash)
4. **script โหลดผิดลำดับใน index.html** — quiz/circuit ใช้ engine ต้องโหลดหลัง sim.js/ff.js และก่อน app.js → ใส่ก่อน `<script src="js/app.js">` เสมอ; test: ไม่มี (ตรวจด้วยตาใน step)
5. **น้ำหนัก repo/โฟลเดอร์ docs บวม** — ภาพ 52 ใบถ้า render 300dpi เกิน 30MB → ใช้ dpi 150 และตัดเฉพาะการ์ด (เป้า < ~10MB รวม)

---

# M7 — ธนาคารข้อสอบ

### Task 1: ตัดภาพโจทย์ทั้ง 52 ข้อ

**Files:**
- Create: `tools/extract_exam.py`
- Create: `docs/exam/q01.png` … `q52.png` (output)
- Create: `docs/exam/_contact_*.png` (ชั่วคราวเพื่อตรวจ ห้าม commit)

**Interfaces:**
- Produces: ไฟล์ `docs/exam/qNN.png` (N = 01..52, เรียงตามลำดับที่การ์ดคำถามปรากฏใน PDF ข้อสอบ) — Task 2 อ้าง path นี้ตรง ๆ

- [ ] **Step 1: เขียน `tools/extract_exam.py`** — ใช้ pymupdf: ลอง `page.get_images()` + `page.get_image_rects()` ก่อน (ถ้าแต่ละการ์ดเป็น image object แยกอยู่แล้ว จะได้ bbox ฟรี); ถ้าทั้งหน้าเป็นภาพเดียว ให้ตัดด้วยสี: render หน้า dpi 150 → หา band แนวนอนที่เป็นสีน้ำเงินอ่อนของการ์ด (#e8f2fa ประมาณ: B > R, ความสว่าง > 0.88) แล้วแบ่งเป็นกล่อง; หน้าที่มีสองคอลัมน์ (เช่น หน้า 9) ให้ตัดแนวตั้งครึ่งซ้าย/ขวาก่อนแล้วค่อยแบ่ง band ต่อครึ่ง; บันทึกแต่ละกล่องเป็น `docs/exam/qNN.png` (เรียงบน→ลบ, ซ้าย→ขวา) และประกอบ contact sheet (ตาราง 4 คอลัมน์) ที่ `docs/exam/_contact_NN.png`; กรณีกล่องที่ตรวจแล้วยังไม่ตรง ให้ hardcode กล่อง manual เป็น dict `{page: [(x0,y0,x1,y1), …]}` (หน่วยเศษส่วน 0-1 ของหน้า) ในไฟล์เดียวกัน
- [ ] **Step 2: รันและตรวจ** — `py tools/extract_exam.py` แล้วเปิด contact sheet ทุกแผ่นด้วย Read: ต้องได้ครบ 52 ใบ ภาพคมพออ่านโจทย์ไทยได้ ไม่มีใบตกขอบ/ติดการ์ดข้าง ๆ (ใบไหนเพี้ยน แก้ box แล้วรันซ้ำเฉพาะใบนั้น)
- [ ] **Step 3: ตรวจขนาดรวม** — `du -sh docs/exam` ต้อง < 15MB (ถ้าเกิน ลด dpi เหลือ 130 แล้วรันใหม่)
- [ ] **Step 4: Commit**

```bash
git add tools/extract_exam.py docs/exam
git commit -m "M7(a): ตัดภาพโจทย์ทั้ง 52 ข้อจาก PDF ข้อสอบจริง"
```

### Task 2: ฐานข้อมูลข้อสอบ `js/exam/questions.js` (โครง + integrity test)

**Files:**
- Create: `js/exam/questions.js`
- Create: `tests/examquiz.test.js`

**Interfaces:**
- Produces:
  - `DL.EXAM_TOPICS` — array `{ id, name }` ตามลำดับ: `counter`(ตัวนับ), `ff`(Flip-Flop & Latch), `reg`(Register & UART), `fsm`(State Diagram & FSM), `mem`(Memory), `adc`(ADC & DAC), `disp`(จอ 7 ผ่วน), `timer`(555 & Multivibrator)
  - `DL.EXAM_QUESTIONS` — array 52 อัน เรียง q01→q52 แต่ละอัน: `{ id:'q01', num:1, topic:'counter', img:'docs/exam/q01.png', question:'<โจทย์ภาษาไทยสั้นจากภาพ>', choices:['a','b','c','d'], answer:0-3, explain:'<วิธีคิดแบบเขียนในห้องสอบ>', link:'<lessonId|null>' }`
- Consumes: ไฟล์ `docs/exam/qNN.png` จาก Task 1 (integrity test เช็ค `fs.existsSync`)

- [ ] **Step 1: เขียน test ตรวจความครบถ้วน (fail ก่อน)** — `tests/examquiz.test.js` โครงแบบเดียวกับ tests/sim.test.js (`global.window = {}`, require `../js/exam/questions.js`), asserts: `DL.EXAM_TOPICS` มี 8 topic id ไม่ซ้ำ; `DL.EXAM_QUESTIONS` ยาว 52; id = `q01`..`q52` เรียงถูก; `num` ตรงลำดับ; `topic` ชี้ topic ที่มีจริง; `choices.length === 4`; `answer` เป็น 0-3; `explain` ยาว ≥ 20 ตัวอักษร; `fs.existsSync(img)` ทุกข้อ; ห้ามมี `fetch(`/`XMLHttpRequest` ในซอร์ส (อ่านไฟล์เป็น string แล้ว indexOf)
- [ ] **Step 2: รันยืนยัน fail** — `node tests/examquiz.test.js` → FAIL (questions.js ยังไม่มี)
- [ ] **Step 3: เขียน questions.js** — กรอกครบ 52 ข้อ: ข้อความ/ตัวเลือกอ่านจากภาพ `docs/exam/qNN.png` (เปิดด้วย Read ทีละกลุ่ม), เฉลยจากตาราง answer key ด้านบน — ข้อที่ช่อง **V** ต้องเปิดไฟล์เฉลย (render หน้าที่เกี่ยวของ `แนวข้อสอบดิจิรุ่นพี่.pdf` ด้วย pymupdf ชั่วครอบ `.tmp-exam/` แล้ว Read หาข้อเดียวกัน — เรียงลำดับเดียวกับข้อสอบ) ยืนยันก่อนเขียน `answer` และเขียน `explain` จากวิธีคิดในไฟล์เฉลยนั้น; `link` ชี้บทเดิมที่เกี่ยว เช่น q01→`counter`, q03/q25→`jk-ff`, q04→`latch-sr`, q18/q34→`register-memory`, q36/q47→`multivibrator`, q21/q31/q33/q52→`adc-dac`, q13/q45→`decoder-7seg`, q30→`seq-sync` (เปิด js/circuits/*.js เช็ค id จริงก่อนใส่, ไม่มีบทที่เกี่ยวตรง ๆ ให้เป็น null)
- [ ] **Step 4: รันยืนยัน pass** — `node tests/examquiz.test.js` → PASS ครบ
- [ ] **Step 5: Commit**

```bash
git add js/exam/questions.js tests/examquiz.test.js
git commit -m "M7(b): ธนาคารข้อสอบ 52 ข้อ — เฉลยเช็คขวางกับแนวรุ่นพี่ + คำอธิบายวิธีคิด"
```

### Task 3: UI ตรวจทันที `js/exam/examquiz.js` + เชื่อมเข้าเว็บ

**Files:**
- Create: `js/exam/examquiz.js`
- Modify: `js/lessons.js` (เพิ่ม group 'exam' หลัง 'lab')
- Modify: `js/app.js` (hook 1 บรรทัดใน renderLesson ต่อจาก `if (id === 'documents') buildDocList(body);`)
- Modify: `index.html` (เพิ่ม `<script src="js/exam/questions.js">` และ `<script src="js/exam/examquiz.js">` ก่อน js/app.js)
- Modify: `tests/examquiz.test.js` (เพิ่มชุดทดสอบ logic)

**Interfaces:**
- Consumes: `DL.EXAM_QUESTIONS`, `DL.EXAM_TOPICS` (Task 2), รูปแบบบทเรียน `DL.registerLesson`
- Produces:
  - `DL.EXAMQ.filterByTopic(list, topicId)` → array (topicId `'all'` = คืนทั้งหมด)
  - `DL.EXAMQ.check(q, idx)` → true เมื่อ idx === q.answer
  - `DL.EXAMQ.loadPicks()` / `DL.EXAMQ.savePick(id, picked)` → อ่าน/เขียน localStorage key `'dl-exam-progress'` เป็น `{ q01: {picked: 2, correct: false}, … }` — ครอบ try/catch ทั้งสอง (localStorage พัง = คืน `{}` / เงียบ)
  - `DL.buildExamQuiz(container)` — วาด UI ทั้งหมดลง container (element ที่ app.js ส่งให้)
- บทเรียนใหม่: `DL.registerLesson({ id:'exam-quiz', group:'exam', title:'ติวฟินอล — ธนาคารข้อสอบจริง 52 ข้อ', subtitle:'ทำเลย — กดเลือก ตรวจทันที มีวิธีคิดทุกข้อ + ลิงก์บทที่เกี่ยว', html:'<div id="examQuiz"></div>', circuits: [], summary: null })` ลงทะเบียนใน examquiz.js

- [ ] **Step 1: เขียน test logic (fail ก่อน)** — ต่อท้าย tests/examquiz.test.js: require `../js/exam/examquiz.js`; `filterByTopic(DL.EXAM_QUESTIONS,'all').length === 52`; กรอง topic แรกให้ยาว > 0 และทุกอัน topic ตรง; `check({answer:2},2) === true`, `check({answer:2},1) === false`; `savePick`/`loadPicks` กลมกลืน (stub `global.localStorage` เก็บในหน่วยความจำ) และเมื่อ stub throw แล้ว `loadPicks()` ต้องคืน `{}` ไม่ throw; มีบท `DL.LESSONS['exam-quiz']` ลงทะเบียนแล้วและ group เป็น `'exam'`; `DL.GROUPS` มี group id `'exam'` ชื่อมีคำว่า "ติวฟินอล"
- [ ] **Step 2: รันยืนยัน fail** — `node tests/examquiz.test.js` → FAIL
- [ ] **Step 3: เขียน examquiz.js** — (ก) logic `DL.EXAMQ` ตาม interface ข้างบน (ข) `DL.buildExamQuiz`: หัวมุมบน = คะแนนสรุป "ถูก X / ทำแล้ว Y จาก 52" + ปุ่ม "ล้างความคืบหน้า" (confirm ด้วย confirm() แล้วลบ key); แถว filter chip "ทั้งหมด" + ทุก topic (แสดงจำนวนข้อในวงเล็บ) กดแล้ว render ใหม่; การ์ดต่อข้อ: ป้าย "ข้อที่ N · <topic>", `<img src=img>` (กว้างเต็มการ์ด, มี border เหมือน .circuit-panel), ข้อความโจทย์, ปุ่มตัวเลือก 4 ปุ่ม — กดแล้ว: ถูก → ปุ่มเขียว + กล่องคำอธิบายเขียว, ผิด → ปุ่มที่เลือกแดง + ปุ่มเฉลยเขียว + กล่องคำอธิบาย, ปุ่มทั้งการ์ด disabled, ถ้าเคยทำ (loadPicks มีข้อมูล) แสดงสถานะเดิมทันทีตอน render; ท้ายการ์ด: ถ้า `link` ไม่ null → `<a href="#/lesson/<id>">ดูวงจรที่เกี่ยว →</a>`; ใช้ class CSS เดิมให้มากที่สุด (`.note`, `.warn`, `.doc-card`, `.btn`) + inline style เฉพาะจุด ห้ามแตะ css/ ไฟล์เดิม; ห้าม setInterval ใด ๆ (ไม่ต้อง registerActiveSim)
- [ ] **Step 4: แก้ lessons.js + app.js + index.html** — group ใหม่ใน `DL.GROUPS` หลัง entry 'lab'; hook ใน renderLesson: `if (id === 'exam-quiz' && typeof DL.buildExamQuiz === 'function') DL.buildExamQuiz(body);` วางต่อจากบรรทัด `if (id === 'documents') buildDocList(body);`; script tag สองบรรทัดก่อน js/app.js
- [ ] **Step 5: รัน test ทั้งหมดยืนยัน pass** — `node tests/examquiz.test.js && node tests/sim.test.js && node tests/course.test.js && node tests/components.test.js && node tests/sequential.test.js && node tests/studentid.test.js` → PASS ทุกไฟล์ (รวมเดิม 143 ต้องไม่หาย)
- [ ] **Step 6: เปิดเว็บจริง** — เปิด index.html ในเบราว์เซอร์ (start ผ่าน `cmd /c start index.html` หรือบอกผู้ใช้เปิดเอง): กลุ่ม "ติวฟินอล" โผล่ใน sidebar, เข้าบท quiz, กดตอบ 2-3 ข้อ ภาพโหลด เช็คถูกผิด รีเฟรชแล้วคะแนนค้าง
- [ ] **Step 7: Commit**

```bash
git add js/exam/examquiz.js js/lessons.js js/app.js index.html tests/examquiz.test.js
git commit -m "M7(c): quiz UI ตรวจทันที + กลุ่มติวฟินอลใน sidebar"
```

---

# M8 — วงจรจากข้อสอบ ชุดแรก (ตัวนับ + FF)

**โครงร่วมทุก task ของ M8/M9:** ไฟล์ `js/circuits/exam.js` เริ่มที่ Task 4 — IIFE, `'use strict'`, header comment อธิบายที่มาจากข้อสอบ; ทุกบทมี 3 ส่วน: `html` (ทฤษฎีสั้น + การ์ด "โจทย์จากข้อสอบ" ฝัง `<img src="docs/exam/qNN.png">` ของข้อที่อ้าง + เฉลยสั้น), `circuits` (วงจรกดเล่นจริง + steps ให้ลองตาม), `summary` (สรุปสำหรับสอบ); ทดสอบใน `tests/exam.test.js` รูปแบบเดียวกับ tests/course.test.js (`build(lessonId, idx)` + `pulse(sim, n)`)

### Task 4: บท `exam-ripple` — Ripple Counter จากข้อสอบ (q01, q10, q14, q15)

**Files:**
- Create: `js/circuits/exam.js`, `tests/exam.test.js`
- Modify: `index.html` (เพิ่ม `<script src="js/circuits/exam.js">` ก่อน app.js)

**Interfaces:**
- Produces: บท `exam-ripple` (group 'exam') มี 2 circuits:
  1. ripple 2×JKFF (จาก q01): ff0 `JKFF` (j,k ผูก 1 ตลอด — ต่อจาก input 'one' ที่ตั้งค่า 1 ไว้ หรือใช้ input ให้ผู้เรียนกดได้), ff1 `JKFF` + `clockFrom:'ff0:qn'` (ลอก pattern ripple จาก js/circuits/course.js บท counter), ขาออก q0,q1 → LED
  2. ripple 3×DFF Q̄→D (จาก q14): ff0-ff2 `DFF`, แต่ละตัว `d` ต่อจาก `qn` ของตัวเอง, ff1/ff2 `clockFrom:'ffN:qn'`, LED QA,QB,QC
- Test (ต้อง pass ก่อน commit): circuit 2 — หลัง `pulse(4)` ค่า `ff2.state.q*4+ff1.state.q*2+ff0.state.q === 4` (นับขึ้น 000→001→010→011→100), `pulse(4)` ซ้ำกลับ 0; circuit 1 — หลัง pulse(4) วนครบ 00→01→10→11

- [ ] Step 1: เขียน test (fail) — node tests/exam.test.js
- [ ] Step 2: เขียนบทใน exam.js — html เชื่อมโจทย์ q01 (Ripple Counter), q10 (async), q14 (ทิศทางนับ), q15 (down counter JK จาก 000 → 111,110,101 อธิบายว่าทำไม ripple แบบ Q̄ จึงนับลง); steps ให้กด Pulse Clock แล้วอ่านค่า
- [ ] Step 3: รัน node tests/exam.test.js (PASS) + ทดสอบเดิมทั้ง 6 ไฟล์ (ยัง PASS)
- [ ] Step 4: Commit `git add js/circuits/exam.js tests/exam.test.js index.html && git commit -m "M8(a): บทวงจร ripple counter จากข้อสอบ (q01,q10,q14,q15)"`

### Task 5: บท `exam-7476` — วงจร 7476 ที่ออกซ้ำ 3 ครั้ง = Shift Register SIPO (q06, q16, q42)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Produces: บท `exam-7476` มี 1 circuit: 4×`JKFF` (ff0-ff3), J กับ K ของแต่ละตัวต่อรวมกัน (wire เดียวเข้าสอง pin), ff0 รับจาก input `din` ผ่าน gate `NOT` (ตาม 7404 ในภาพข้อสอบ), ff1-ff3 รับจาก Q ตัวก่อนหน้า, CLK รวม (ทุกตัว primary), ขาออก Q0-Q3 → LED 4 ดวง (parallel out)
- Test: ตั้ง din=1 pulse → q0=1 ที่เหลือ 0; เลื่อนลำดับ din 1,0,1,1 ครบ 4 pulse แล้ว `[q3,q2,q1,q0]` = `[1,0,1,1]` (บิตเข้าก่อนไหลไปสุด q3 — อ่านเรียงตามเวลาที่ป้อน); อธิบายใน html: ข้อมูลเข้าทีละบิต (serial in) แต่อ่านพร้อมกันที่ Q0-Q3 (parallel out) → ตอบ "register แบบ Serial in, Parallel out" ตรงกับเฉลยทั้ง 3 ข้อ

- [ ] Step 1: test (fail) — เลื่อนบิตตามข้างบน
- [ ] Step 2: เขียนบท (html เชื่อมภาพ q06 + ระบุว่าโจทย์เดียวกันออก 3 ครั้ง q16, q42)
- [ ] Step 3: รัน test ใหม่ + เดิมทั้งหมด PASS
- [ ] Step 4: Commit `… -m "M8(b): บท 7476 shift register SIPO — โจทย์ออกซ้ำ 3 ครั้ง (q06,q16,q42)"`

### Task 6: บท `exam-modn` — mod-N, Johnson, การนับ FF (q26, q27, q38, q41, q48, q49)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Consumes: `TFF` มี pin `clr` async อยู่แล้ว (js/engine/ff.js:129)
- Produces: บท `exam-modn` มี 2 circuits:
  1. Johnson counter (จาก q38): ff0-ff3 `DFF`, d0←qn3, d1←q0, d2←q1, d3←q2, CLK รวม
  2. mod-6 ด้วย async clear (pattern q41): ff0-ff2 `TFF` (t=1), gate `AND` รับ q2,q1 → `clr` ของทุกตัว (ลอก pattern decade counter จาก course.js)
- Test: Johnson — เก็บ snapshot state หลังทุก pulse ครบ 8 ครั้ง: ได้ 8 สถานะไม่ซ้ำ และ pulse ครบ 8 กลับ 0000; mod-6 — ค่า `4q2+2q1+q0` เดิน 0,1,2,3,4,5,0,… ไม่เคยเป็น 6 หรือ 7 (pulse 12 ครั้งเช็คทุกจังหวะ)
- html อธิบายสูตรข้อสอบ: cascade คูณ (q27: 5×5=25), จำนวน FF จาก 2ⁿ≥N (q26: 273→9 ตัว), excitation JK (q48/q49: โต้ตอบตาราง J=K=1, J1=K1=1, J2=K2=Q1·Q̄0)

- [ ] Step 1: test (fail) — Johnson 8 สถานะ + mod-6 ไม่ล้ำ
- [ ] Step 2: เขียนบท
- [ ] Step 3: test ใหม่+เดิม PASS
- [ ] Step 4: Commit `… -m "M8(c): บท mod-N + Johnson + สูตรนับ FF (q26,q27,q38,q41,q48,q49)"`

### Task 7: บท `exam-srlatch` — SR Latch มุมข้อสอบ: NAND vs NOR (q04, q22, q28)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Produces:
  - component `SR_LATCH_NAND` (ลงทะเบียนใน exam.js): inputs `['s','r']` (แปลว่า S̄,R̄ — active-low), outputs `['q','qn']`, ไม่ isFF (transparent เหมือน SR_LATCH เดิม), shape ใช้ `DL.FFShape('SR Latch (NAND)')` + `DL.FFUpdate`; evalNode: s=0,r=1 → q=1 (set, active-low); s=1,r=0 → q=0; s=1,r=1 → hold; s=0,r=0 → q=1,qn=1 (เสียสมมาตร — โชว์ให้เห็น); pinLabels `{s:'S̄', r:'R̄', q:'Q', qn:'Q̄'}`
  - บท `exam-srlatch` มี 2 circuits: (1) `SR_LATCH` เดิม (NOR) + โจทย์ q04 (S=1,R=0 → Q=1); (2) `SR_LATCH_NAND` + โจทย์ q22 (S̄=R̄=1 → hold — จุดที่ข้อสอบหลอก)
- Test: NAND latch — เริ่ม q=0; s=0 (active-low set) → q=1; s=1,r=1 → คง 1; r=0 → q=0; s=0,r=0 พร้อมกัน → q=1 และ qn=1; NOR latch — s=1,r=1 → '?'

- [ ] Step 1: test (fail)
- [ ] Step 2: เขียน component + บท (html มีตารางเทียบ NOR active-high / NAND active-low + สมการ characteristic q28: NOR: Q₊ = S + R̄Q, NAND: Q₊ = S̄ + RQ̄)
- [ ] Step 3: test ใหม่+เดิม PASS
- [ ] Step 4: Commit `… -m "M8(d): บท SR latch NAND vs NOR + component SR_LATCH_NAND (q04,q22,q28)"`

### Task 8: บท `exam-tff` — T-FF นับสถานะ 2 บิต (q05, q39, q40, q46)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Produces: บท `exam-tff` มี 2 circuits: (1) 2×`TFF` T=1 sync (จาก q46 — นับถอยหลัง 00→11→10→01); (2) 2×`TFF` (ff0 t=1, ff1 t ต่อจาก q0 — นับขึ้น 00→01→10→11, pattern ของ q39)
- Test: (1) ค่า `2q1+q0` หลัง pulse ทีละครั้ง = [3,2,1,0,3] เริ่มจาก 0; (2) = [1,2,3,0,1]
- html: จำนวนสถานะ = 2ⁿ (q40: 2 ตัว = 4 สถานะ), วิธี trace present→next state ด้วยตาราง characteristic (q05)

- [ ] Step 1: test (fail) — sequence ทั้งสองวงจร
- [ ] Step 2: เขียนบท
- [ ] Step 3: test ใหม่+เดิม PASS
- [ ] Step 4: Commit `… -m "M8(e): บท T-FF นับสถานะ ขึ้น/ลง (q05,q39,q40,q46)"`

---

# M9 — วงจรจากข้อสอบ ชุดสอง (register/FSM/display/DAC)

### Task 9: บท `exam-shift` — Shift ข้อมูลผ่านวงจร + UART (q18, q34, q50)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Produces: บท `exam-shift` มี 2 circuits: (1) 4×`DFF` เลื่อนขวา serial: d0←input `din`, d1←q0, … (q18 — ใส่บิต 1,1,0,0 ตามลำดับ pulse แล้วดับเบิลเป็น parallel และเห็นบิตไหลออกที่ q3); (2) 2×`DFF` chain (q34 trace สั้น)
- Test: (1) ป้อน din ตามลำดับ 1,1,0,0 ที่ pulse ที่ 1-4 → หลัง pulse ครบ 4: `[q3,q2,q1,q0] = [1,1,0,0]` (บิตเข้าก่อนอยู่ที่ q3 — อ่านจากภาพ q18 ยืนยันทิศก่อนเขียน assert); pulse ต่อ din=0 ที่ pulse 5-7 → ค่า q3 หลังแต่ละ pulse = 1,0,0… รวมกับตอน pulse 4 คือบิตออกทาง q3 เรียง 1,1,0,0
- html: q50 UART — Transmitter = parallel-in/serial-out, Receiver = serial-in/parallel-out, ข้อที่ "ไม่ใช่ UART" = Receiver แบบ parallel-in/serial-out

- [ ] Step 1: test (fail) — ตรวจทิศการเลื่อนจากภาพ q18 ก่อน fix assert
- [ ] Step 2: เขียนบท
- [ ] Step 3: test ใหม่+เดิม PASS
- [ ] Step 4: Commit `… -m "M9(a): บท shift register + UART (q18,q34,q50)"`

### Task 10: บท `exam-fsm` — State Diagram, Mealy, MUX+FF (q07, q17, q30, q43)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Produces: บท `exam-fsm` มี 2 circuits: (1) NAND จาก state diagram (q07): inputs `x1`,`x0` → gate `NAND` → LED, steps ให้กดครบ 4 คู่แล้วเทียบว่า output 0 เฉพาะ 11 ตรงกับ diagram; (2) MUX+DFF (q43): gate ตามภาพ q43 — `MUX` ไม่มีใน engine เป็น gate ให้ประกอบจาก gates (sel=0→x, sel=1→y: `AND(x, NOT s)` OR `AND(y, s)`) → `DFF` → LED, input `s`,`x`,`y` + Pulse Clock
- Test: (1) ตาราง NAND ครบ 4 คู่; (2) s=0,x=1 pulse → q=1; เปลี่ยน s=1,y=0 pulse → q=0
- html: สัญลักษณ์ Mealy (input/output บนเส้นลูกศร) + วิธี trace สตริง input ทีละบิต (q30) — เดินตารางให้ดูจบใน html

- [ ] Step 1: test (fail)
- [ ] Step 2: เขียนบท
- [ ] Step 3: test ใหม่+เดิม PASS
- [ ] Step 4: Commit `… -m "M9(b): บท state diagram/Mealy + MUX+FF (q07,q17,q30,q43)"`

### Task 11: บท `exam-7447` — 7447 + จอ 7 ผ่วน (q13, q45)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Consumes: component `SEVENSEG` และ pattern วงจร BCD→7 segment จาก js/circuits/basics.js บท decoder; decade counter pattern จาก course.js
- Produces: บท `exam-7447` มี 1 circuit: decade counter (4×TFF + AND clear) → ป้อน BCD ให้ decoder (ประกอบจาก gates ตาม basics.js) → `SEVENSEG` แสดง 0-9; steps: กด pulse ทีละหลัก, สังเกต BCD 0100 → จอโชว์ 4 (q13), counter+จอ = วงจรใน q45
- Test: บังคับสถานะตัวนับเป็น 4 (reset + pulse 4 ครั้ง) → ผล segment จาก decoder ตรงรูปเลข 4 (อ่าน pattern ที่ถูกจากวงจร BCD ใน basics.js แล้ว assert ค่า output ทุกเส้น)

- [ ] Step 1: อ่านวงจร BCD→7seg ใน basics.js แล้วเขียน test (fail) ด้วย pattern ของเลข 4
- [ ] Step 2: เขียนบท (html อธิบาย common anode/cathode + active-low ของ 7447 ตามโน้ตใน q13)
- [ ] Step 3: test ใหม่+เดิม PASS
- [ ] Step 4: Commit `… -m "M9(c): บท 7447 + จอ 7 ผ่วน พร้อม counter (q13,q45)"`

### Task 12: บท `exam-dac` — DAC คำนวณ Vout แบบข้อสอบ (q21, q31, q33, q52 + ทฤษฎี q08, q24, q44)

**Files:** Modify `js/circuits/exam.js`, `tests/exam.test.js`

**Interfaces:**
- Consumes: pattern component แบบ numeric output จาก `VMETER` ใน course.js (อ่านก่อนเขียน)
- Produces:
  - component `WEIGHTED_DAC` (ใน exam.js): inputs `['d0','d1','d2','d3']`, outputs `['v']` — ค่า `v` เป็นตัวเลข: `v = -Rf*Vref*(d0/200e3 + d1/100e3 + d2/50e3 + d3/25e3)` โดย Rf=10e3, Vref=5 (ตามวงจร q31/q33); shape กล่องโชว์ตัวเลข 3 ตำแหน่ง (ลอก style VMETER)
  - บท `exam-dac` มี 1 circuit: inputs d0-d3 (สวิตช์) → `WEIGHTED_DAC` → โชว์ Vout
- Test: d1=1 → −0.5; d1=d3=1 → −2.5 (ตรงเฉลย q33); ทั้ง 4 = −3.75; หมายเหตุ q31: ยังไม่รู้สวิตช์ตัวไหน — หลังเช็คไฟล์เฉลย (ช่อง V) แล้วใส่กรณีตามเฉลยจริงเพิ่มใน html
- html: สูตร −Rf·Σ(Vi/Ri) วิธีคิดทีละขั้นแบบเขียนในห้องสอบ; กล่องทฤษฎี q21 (DNL — บันไดไม่เท่ากัน), q44 (settling = จุดที่เข้า ±½LSB แล้วอยู่), q24 (Nyquist 2×f), q52 (บันไดสวิตช์ → อ่านเลขฐานสอง: SW11 = 1011)

- [ ] Step 1: test (fail) — 3 กรณี Vout
- [ ] Step 2: เขียน component + บท
- [ ] Step 3: test ใหม่+เดิม PASS
- [ ] Step 4: Commit `… -m "M9(d): บท weighted DAC คำนวณ Vout + component WEIGHTED_DAC (q21,q31,q33,q52)"`

### Task 13: เก็บกวาด + README + รีวิวรวม

**Files:**
- Modify: `README.txt` (เพิ่มหัว "ติวฟินอล — กดทำข้อสอบจริง 52 ข้อ + วงจร 9 บทจากข้อสอบ")
- Delete: `.tmp-exam/` ทั้งโฟลเดอร์ + `docs/exam/_contact_*.png`

- [ ] Step 1: ลบไฟล์ชั่วคราว
- [ ] Step 2: แก้ README.txt
- [ ] Step 3: รัน test ครบทั้ง 7 ไฟล์ ยืนยัน PASS ทุกตัว (เดิม 143 + ใหม่ทั้งหมด)
- [ ] Step 4: เปิด index.html เดินทั้งกลุ่มติวฟินอลจริง 1 รอบ (quiz สุ่ม 5 ข้อ + เข้าครบ 9 บทวงจร)
- [ ] Step 5: Commit `git add -A && git commit -m "M9(e): README + เก็บกวาดไฟล์ชั่วคราว — จบโหมดติวฟินอล"`
