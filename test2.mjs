import fs from 'fs';
const c = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');
console.log("Has markAllPresent:", c.includes('const markAllPresent ='));
