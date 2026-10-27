/* ===== Digital Learning — app: router, sidebar, progress =====
 * รันบน file:// โดยตรง — ห้ามใช้ fetch/ES modules, ใช้ hash routing เท่านั้น
 */
(function () {
  'use strict';
  window.DL = window.DL || {};

  /* ---------- progress (localStorage, wrap try/catch กัน file:// ที่ปิดสิทธิ์) ---------- */
  var PROGRESS_KEY = 'dl-progress';
  var LAST_KEY = 'dl-last-lesson';

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) { /* ยอมให้เงียบ */ }
  }
  function setLastLesson(id) {
    try { localStorage.setItem(LAST_KEY, id); } catch (e) { /* เงียบ */ }
  }
  function getLastLesson() {
    try { return localStorage.getItem(LAST_KEY) || null; } catch (e) { return null; }
  }

  /* ---------- จัดการวงจรที่กำลังเปิดอยู่ (กัน interval leak) ---------- */
  var activeSims = [];
  DL.registerActiveSim = function (sim) {
    activeSims.push(sim);
  };
  function destroyActiveSims() {
    for (var i = 0; i < activeSims.length; i++) {
      try { activeSims[i].destroy(); } catch (e) { /* เงียบ */ }
    }
    activeSims = [];
  }

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ---------- sidebar ---------- */
  function renderSidebar(currentId) {
    var sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    var progress = loadProgress();
    var n = 0;

    DL.GROUPS.forEach(function (g) {
      var lessonsInGroup = DL.ORDER.filter(function (id) {
        return DL.LESSONS[id].group === g.id;
      });
      if (!lessonsInGroup.length) return;

      var wrap = el('div', 'side-group');
      wrap.appendChild(el('h3', null, g.name));
      lessonsInGroup.forEach(function (id) {
        n += 1;
        var L = DL.LESSONS[id];
        var a = el('a', 'side-link' + (id === currentId ? ' active' : ''));
        a.href = '#/lesson/' + id;
        a.innerHTML =
          '<span class="side-num">' + n + '</span>' +
          '<span class="side-title">' + L.title + '</span>' +
          (progress[id] ? '<span class="done">✓</span>' : '');
        wrap.appendChild(a);
      });
      sidebar.appendChild(wrap);
    });
  }

  /* ---------- หน้าแรก ---------- */
  function renderHome() {
    var content = document.getElementById('content');
    content.innerHTML = '';

    var hero = el('div', 'home-hero');
    var last = getLastLesson();
    var resumeHtml = (last && DL.LESSONS[last])
      ? '<p style="margin-top:10px"><a class="btn" style="background:#fff;color:#1d4ed8" href="#/lesson/' + last + '">เรียนต่อจากบทล่าสุด: ' + DL.LESSONS[last].title + ' →</a></p>'
      : '';
    hero.innerHTML =
      '<h1>เรียน Digital แบบเข้าใจง่าย</h1>' +
      '<p>เลือกบทเรียนด้านซ้าย หรือกดเข้าบทแรกเลย — ทุกบทมีวงจรให้กดเล่นจริง + คำอธิบายไทย + สรุปก่อนสอบ</p>' +
      '<p style="margin-top:8px"><a class="btn" style="background:#fff;color:#1d4ed8" href="#/lesson/' + (DL.ORDER[0] || 'demo') + '">เริ่มบทแรก →</a></p>' +
      resumeHtml;
    content.appendChild(hero);

    var cards = el('div', 'home-cards');
    var n = 0;
    DL.GROUPS.forEach(function (g) {
      DL.ORDER.forEach(function (id) {
        if (DL.LESSONS[id].group !== g.id) return;
        n += 1;
        var L = DL.LESSONS[id];
        var c = el('a', 'home-card');
        c.href = '#/lesson/' + id;
        c.innerHTML =
          '<div class="hc-group">' + g.name + ' · บทที่ ' + n + '</div>' +
          '<h4>' + L.title + '</h4>' +
          '<p>' + (L.subtitle || '') + '</p>';
        cards.appendChild(c);
      });
    });
    content.appendChild(cards);
  }

  /* ---------- หน้าบทเรียน ---------- */
  function renderLesson(id) {
    var L = DL.LESSONS[id];
    var content = document.getElementById('content');
    content.innerHTML = '';
    if (!L) {
      content.appendChild(el('h1', null, 'ไม่พบบทเรียนนี้'));
      content.appendChild(el('p', null, 'ลองเลือกบทจากเมนูด้านซ้ายอีกครั้ง'));
      return;
    }

    setLastLesson(id);

    var head = el('div', 'lesson-head');
    head.appendChild(el('div', 'hc-group', DL.groupName(L.group)));
    head.appendChild(el('h1', null, L.title));
    if (L.subtitle) head.appendChild(el('p', 'lesson-sub', L.subtitle));
    content.appendChild(head);

    var body = el('div', 'lesson-body');
    body.innerHTML = L.html || '';
    content.appendChild(body);

    // วงจร interactive — engine (DL.CircuitPanel) จะมาใน M1; ก่อนหน้านั้นข้าม
    if (L.circuits && L.circuits.length && typeof DL.CircuitPanel === 'function') {
      L.circuits.forEach(function (spec) {
        content.appendChild(DL.CircuitPanel(spec));
      });
    }

    // กล่องสรุปสำหรับสอบ
    if (L.summary) {
      var s = el('div', 'summary-box');
      s.appendChild(el('h3', null, '📌 สรุปสำหรับสอบ'));
      var sbody = el('div', null, L.summary);
      s.appendChild(sbody);
      content.appendChild(s);
    }

    // ปุ่มอ่านแล้ว
    var progress = loadProgress();
    var doneBtn = el('button', 'btn done-btn' + (progress[id] ? ' is-done' : ''),
      progress[id] ? '✓ อ่านแล้ว' : 'ทำเครื่องหมายว่าอ่านแล้ว');
    doneBtn.addEventListener('click', function () {
      var p = loadProgress();
      p[id] = Date.now();
      saveProgress(p);
      doneBtn.textContent = '✓ อ่านแล้ว';
      doneBtn.classList.add('is-done');
      renderSidebar(id);
    });
    content.appendChild(doneBtn);

    // ไปบทก่อนหน้า / ถัดไป
    var idx = DL.ORDER.indexOf(id);
    var pager = el('div', 'pager');
    if (idx > 0) {
      var prev = el('a', 'prev', DL.LESSONS[DL.ORDER[idx - 1]].title);
      prev.href = '#/lesson/' + DL.ORDER[idx - 1];
      pager.appendChild(prev);
    } else {
      pager.appendChild(el('span'));
    }
    if (idx < DL.ORDER.length - 1 && idx >= 0) {
      var next = el('a', 'next', DL.LESSONS[DL.ORDER[idx + 1]].title);
      next.href = '#/lesson/' + DL.ORDER[idx + 1];
      pager.appendChild(next);
    }
    content.appendChild(pager);
  }

  /* ---------- router ---------- */
  function route() {
    destroyActiveSims();
    var h = location.hash || '#/home';
    var m = h.match(/^#\/lesson\/([A-Za-z0-9_-]+)/);
    var currentId = null;
    if (m && DL.LESSONS[m[1]]) {
      currentId = m[1];
      renderLesson(currentId);
    } else if (m) {
      var content = document.getElementById('content');
      content.innerHTML = '';
      content.appendChild(el('h1', null, 'ไม่พบบทเรียน "' + m[1] + '"'));
      content.appendChild(el('p', null, 'เลือกบทจากเมนูด้านซ้าย หรือ <a href="#/home">กลับหน้าแรก</a>'));
    } else {
      renderHome();
    }
    renderSidebar(currentId);
    closeDrawer();
    window.scrollTo(0, 0);
  }

  /* ---------- drawer มือถือ ---------- */
  function closeDrawer() {
    var sb = document.getElementById('sidebar');
    var scrim = document.getElementById('scrim');
    sb.classList.remove('open');
    scrim.classList.remove('show');
  }
  function initDrawer() {
    document.getElementById('menuBtn').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('scrim').classList.toggle('show');
    });
    document.getElementById('scrim').addEventListener('click', closeDrawer);
  }

  /* ---------- เริ่มระบบ ---------- */
  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', function () {
    initDrawer();
    route();
  });
})();
