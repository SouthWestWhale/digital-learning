/* ===== js/exam/examquiz.js — หน้าติวฟินอล: ธนาคารข้อสอบ 52 ข้อ ตรวจทันที =====
 * ใช้ข้อมูลจาก js/exam/questions.js (DL.EXAM_TOPICS / DL.EXAM_QUESTIONS)
 * ความคืบหน้าเก็บ localStorage key 'dl-exam-progress' = { q01: {picked: 2, correct: false}, … }
 * ไม่มี fetch / ไม่มี timer วนลูป — วาดครั้งเดียวตอนเข้าบท และ render ใหม่ตอนกด filter
 */
(function () {
  'use strict';

  window.DL = window.DL || {};
  var DL = window.DL;
  DL.LESSONS = DL.LESSONS || {};
  DL.ORDER = DL.ORDER || [];

  var STORE_KEY = 'dl-exam-progress';

  // localStorage ในเบราว์เซอร์ = window.localStorage; ใน node test = global.localStorage
  function LS() {
    if (window.localStorage) return window.localStorage;
    if (typeof localStorage !== 'undefined') return localStorage;
    return null;
  }

  /* ---------- logic ---------- */
  DL.EXAMQ = {
    // คืนข้อที่อยู่ใน topic (topicId 'all' = ทั้งหมด)
    filterByTopic: function (list, topicId) {
      if (topicId === 'all') return (list || []).slice();
      return (list || []).filter(function (q) { return q.topic === topicId; });
    },

    // ตอบ idx ถูกไหม
    check: function (q, idx) {
      return idx === q.answer;
    },

    // อ่านความคืบหน้า — localStorage พังคืน {}
    loadPicks: function () {
      try {
        var raw = LS().getItem(STORE_KEY);
        if (!raw) return {};
        var obj = JSON.parse(raw);
        return (obj && typeof obj === 'object') ? obj : {};
      } catch (e) {
        return {};
      }
    },

    // บันทึกคำตอบ 1 ข้อ — localStorage พังเงียบ ๆ
    savePick: function (id, picked) {
      try {
        var all = DL.EXAMQ.loadPicks();
        all[id] = picked;
        LS().setItem(STORE_KEY, JSON.stringify(all));
      } catch (e) { /* เงียบ */ }
    },

    // ล้างความคืบหน้าทั้งหมด
    clearAll: function () {
      try { LS().removeItem(STORE_KEY); } catch (e) { /* เงียบ */ }
    }
  };

  /* ---------- บทเรียน ---------- */
  var lessonSpec = {
    id: 'exam-quiz',
    group: 'exam',
    title: 'ติวฟินอล — ธนาคารข้อสอบจริง 52 ข้อ',
    subtitle: 'ทำเลย — กดเลือก ตรวจทันที มีวิธีคิดทุกข้อ + ลิงก์บทที่เกี่ยว',
    html: '<div id="examQuiz"></div>',
    circuits: [],
    summary: null
  };
  if (typeof DL.registerLesson === 'function') {
    DL.registerLesson(lessonSpec);
  } else {
    // node test (ไม่โหลด lessons.js) — ลงทะเบียนแบบเดียวกับ registerLesson
    DL.LESSONS[lessonSpec.id] = lessonSpec;
    DL.ORDER.push(lessonSpec.id);
  }

  /* ---------- UI ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined && html !== null) e.innerHTML = html;
    return e;
  }

  DL.buildExamQuiz = function (container) {
    container.innerHTML = '';
    var state = { topic: 'all' };

    function render() {
      container.innerHTML = '';
      var picks = DL.EXAMQ.loadPicks();
      var done = 0, correct = 0;
      DL.EXAM_QUESTIONS.forEach(function (q) {
        if (picks[q.id]) { done++; if (picks[q.id].correct) correct++; }
      });

      /* --- แถวหัว: คะแนน + ล้างความคืบหน้า --- */
      var head = el('div', 'note', null);
      head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;';
      head.appendChild(el('strong', null,
        'คะแนนสรุป: ถูก <span style="color:#1a7f37">' + correct + '</span> / ทำแล้ว ' + done + ' จาก ' + DL.EXAM_QUESTIONS.length));
      var clearBtn = el('button', 'btn', 'ล้างความคืบหน้า');
      clearBtn.type = 'button';
      clearBtn.addEventListener('click', function () {
        if (window.confirm('ล้างความคืบหน้าทั้งหมด ' + done + ' ข้อ? ทำแล้วทำซ้ำไม่ได้')) {
          DL.EXAMQ.clearAll();
          render();
        }
      });
      head.appendChild(clearBtn);
      container.appendChild(head);

      /* --- filter chips --- */
      var chipRow = el('div', null, null);
      chipRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:12px 0;';
      var topics = [{ id: 'all', name: 'ทั้งหมด' }].concat(DL.EXAM_TOPICS);
      topics.forEach(function (t) {
        var n = DL.EXAMQ.filterByTopic(DL.EXAM_QUESTIONS, t.id).length;
        var chip = el('button', 'btn', t.name + ' (' + n + ')');
        chip.type = 'button';
        chip.style.cssText = state.topic === t.id
          ? 'background:#1f6feb;color:#fff;border-color:#1f6feb;'
          : '';
        chip.addEventListener('click', function () {
          state.topic = t.id;
          render();
        });
        chipRow.appendChild(chip);
      });
      container.appendChild(chipRow);

      /* --- การ์ดคำถาม --- */
      DL.EXAMQ.filterByTopic(DL.EXAM_QUESTIONS, state.topic).forEach(function (q) {
        container.appendChild(buildCard(q, picks[q.id] || null, render));
      });
    }

    render();
  };

  /* การ์ด 1 ข้อ: prev = {picked, correct} ถ้าเคยทำ */
  function buildCard(q, prev, rerender) {
    var topicName = q.topic;
    for (var i = 0; i < DL.EXAM_TOPICS.length; i++) {
      if (DL.EXAM_TOPICS[i].id === q.topic) { topicName = DL.EXAM_TOPICS[i].name; break; }
    }

    var card = el('div', 'doc-card', null);

    /* ป้ายหัวการ์ด */
    card.appendChild(el('div', 'tt', 'ข้อที่ ' + q.num + ' · ' + topicName));

    /* ภาพโจทย์ */
    var img = document.createElement('img');
    img.src = q.img;
    img.alt = 'โจทย์ข้อที่ ' + q.num;
    img.style.cssText = 'width:100%;max-width:640px;display:block;margin:8px auto;border:1px solid #c9d1d9;border-radius:8px;background:#fff;';
    card.appendChild(img);

    /* ข้อความโจทย์ */
    card.appendChild(el('p', null, '<strong>' + q.question + '</strong>'));

    /* ปุ่มตัวเลือก + กล่องคำอธิบาย */
    var choiceRow = el('div', null, null);
    choiceRow.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin:8px 0;';
    var explainBox = el('div', null, null);
    var linkRow = null;

    function answer(idx) {
      var okAns = DL.EXAMQ.check(q, idx);
      DL.EXAMQ.savePick(q.id, { picked: idx, correct: okAns });
      rerender();   // render() วาดสถานะที่เลือกไว้ใหม่ทั้งการ์ดจาก prev ใน buildCard ที่เดียว
    }

    q.choices.forEach(function (c, i) {
      var btn = el('button', 'btn', String.fromCharCode(65 + i) + '. ' + c);
      btn.type = 'button';
      btn.style.cssText = 'text-align:left;';
      btn.addEventListener('click', function () { answer(i); });
      choiceRow.appendChild(btn);
    });
    card.appendChild(choiceRow);
    card.appendChild(explainBox);

    /* เคยทำแล้ว → แสดงสถานะเดิมทันที (ปุ่ม disabled) */
    if (prev) {
      Array.prototype.forEach.call(choiceRow.children, function (btn, i) {
        btn.disabled = true;
        if (i === q.answer) {
          btn.style.cssText = 'text-align:left;background:#d4f7d4;border-color:#1a7f37;color:#1a7f37;font-weight:600;';
        } else if (i === prev.picked && !prev.correct) {
          btn.style.cssText = 'text-align:left;background:#fde0e0;border-color:#cf222e;color:#cf222e;';
        }
      });
      explainBox.className = prev.correct ? 'note' : 'warn';
      explainBox.innerHTML = (prev.correct ? '<strong>✓ ถูกต้อง!</strong> ' : '<strong>✗ ยังไม่ถูก — เฉลยข้อ ' +
        String.fromCharCode(65 + q.answer) + '</strong> ') + q.explain;
      if (q.link) {
        linkRow = el('div', null, '<a href="#/lesson/' + q.link + '">ดูวงจรที่เกี่ยว →</a>');
        linkRow.style.cssText = 'margin-top:8px;';
        card.appendChild(linkRow);
      }
    }

    return card;
  }

})();
