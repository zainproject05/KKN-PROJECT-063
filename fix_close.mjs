import fs from 'fs';
let content = fs.readFileSync('src/components/PublicAbsensi.tsx', 'utf-8');

const newClose = `const closeExpiredSessions = async () => {
    try {
      await supabase.rpc("close_expired_attendance_sessions");
    } catch (e) {
      console.error("RPC Error:", e);
    }
  };`;
  
content = content.replace(/const closeExpiredSessions = async \(\) => \{[\s\S]*?(?=const fetchSessions)/, newClose + '\n\n  ');

fs.writeFileSync('src/components/PublicAbsensi.tsx', content);

let attContent = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');
attContent = attContent.replace(/const closeExpiredSessions = async \(\) => \{[\s\S]*?(?=const fetchData =)/, newClose + '\n\n  ');
fs.writeFileSync('src/components/kkn/Attendance.tsx', attContent);

