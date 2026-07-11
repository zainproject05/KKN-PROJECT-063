import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

content = content.replace(/REV_STATUS_MAP\[rec\.status\]/g, 'REV_STATUS_MAP[rec.attendance_status]');
content = content.replace(/rec\.status/g, 'rec.attendance_status');

// Fix counts in Attendance.tsx
const oldCounts = 'const indStatus = rec ? (REV_STATUS_MAP[rec.attendance_status] || "Hadir") : (isSessionActive ? "Belum Absen" : "Alfa");';
// Wait, the counts calculation usually goes through members mapping. Let's see how counts are calculated in the file.
fs.writeFileSync('src/components/kkn/Attendance.tsx', content);
