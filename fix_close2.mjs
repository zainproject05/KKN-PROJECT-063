import fs from 'fs';
let content = fs.readFileSync('src/components/PublicAbsensi.tsx', 'utf-8');

const newClose = `const closeExpiredSessions = async () => {
    try {
      await supabase.rpc("close_expired_attendance_sessions");
    } catch (e) {
      console.error("RPC Error:", e);
    }
  };`;

// Insert it right after the component declaration
content = content.replace(/(export default function PublicAbsensi\(\{ onBackToHome \}: \{ onBackToHome: \(\) => void \}\) \{[\s\S]*?const \[submitSuccess, setSubmitSuccess\] = useState\(false\);)/, '$1\n  ' + newClose);

fs.writeFileSync('src/components/PublicAbsensi.tsx', content);

