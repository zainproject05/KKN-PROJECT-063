import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

// The specific PRM template with Ananda Nur Daffa Zain might be in DPL actually.
// Wait, DPL:
content = content.replace(
  "saya Ananda Nur Daffa Zain dari kelompok",
  "kami dari perwakilan kelompok"
);

fs.writeFileSync('src/components/AboutProject.tsx', content);
