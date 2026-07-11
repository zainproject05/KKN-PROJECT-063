import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

// Replace the delete block
const badBlockStart = content.indexOf('    // If changing to "Alfa" (Absent/Alfa), we delete the record from database');
const badBlockEnd = content.indexOf('    let updatedRecords = [...records];', badBlockStart);

if (badBlockStart !== -1 && badBlockEnd !== -1) {
  content = content.substring(0, badBlockStart) + content.substring(badBlockEnd);
  fs.writeFileSync('src/components/kkn/Attendance.tsx', content);
  console.log('Patched Attendance.tsx manual update logic');
} else {
  console.error('Could not find the block to patch');
}
