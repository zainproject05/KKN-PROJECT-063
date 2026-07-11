import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

// The bucket name was 'attendance_photos', we should change to 'attendance-selfies'
content = content.replace(/"attendance_photos"/g, '"attendance-selfies"');

fs.writeFileSync('src/components/kkn/Attendance.tsx', content);

