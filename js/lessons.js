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

  // บท placeholder — ใช้พิสูจน์ router ตอน M0 (จะถูกแทนที่ด้วยบทจริงใน M1)
  DL.registerLesson({
    id: 'demo',
    group: 'basics',
    title: '(บทตัวอย่าง — กำลังสร้าง)',
    subtitle: 'ใช้ทดสอบว่า sidebar และ router ทำงานได้',
    html:
      '<h2>บทนี้ยังไม่มีเนื้อหา</h2>' +
      '<p>เป็นบท placeholder สำหรับทดสอบโครงเว็บ ถ้าคุณเห็นข้อความนี้แปลว่า ' +
      'เว็บโหลดได้ ภาษาไทยไม่เพี้ยน และ router เปลี่ยนหน้าได้แล้ว 🎉</p>',
    summary: '<p>placeholder — ไม่มีสรุป</p>',
    circuits: []
  });
})();
