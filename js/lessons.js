/* ===== Digital Learning — ทะเบียนบทเรียน =====
 * ทุกไฟล์บทเรียนเรียก DL.registerLesson({...}) เพื่อขึ้นทะเบียนบทของตัวเอง
 * app.js อ่าน DL.LESSONS / DL.ORDER / DL.GROUPS ไป render sidebar และหน้าบท
 */
(function () {
  'use strict';
  window.DL = window.DL || {};
  var DL = window.DL;

  DL.LESSONS = {};   // id -> lesson object
  DL.ORDER = [];     // ลำดับบทเรียนตามที่ประกาศ

  // กลุ่มบทเรียน (ตามลำดับที่แสดงใน sidebar)
  DL.GROUPS = [
    { id: 'basics',     name: 'พื้นฐาน' },
    { id: 'flipflop',   name: 'Latch & Flip-Flop' },
    { id: 'sequential', name: 'Sequential (จากสไลด์)' },
    { id: 'course',     name: 'บทเรียนจากสไลด์ บท 7–12' },
    { id: 'docs',       name: 'เอกสารประกอบ' }
  ];

  DL.registerLesson = function (lesson) {
    if (!lesson || !lesson.id) throw new Error('registerLesson: ต้องมี id');
    if (DL.LESSONS[lesson.id]) {
      throw new Error('registerLesson: id ซ้ำ — ' + lesson.id);
    }
    lesson.group = lesson.group || 'basics';
    DL.LESSONS[lesson.id] = lesson;
    DL.ORDER.push(lesson.id);
  };

  DL.groupName = function (gid) {
    for (var i = 0; i < DL.GROUPS.length; i++) {
      if (DL.GROUPS[i].id === gid) return DL.GROUPS[i].name;
    }
    return gid;
  };

})();
