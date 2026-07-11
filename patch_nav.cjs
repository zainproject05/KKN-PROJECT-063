const fs = require('fs');
const path = './src/components/Navigation.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /const publicItems = \[\s*\{ id: "home", name: "Home", icon: Home \},\s*\{ id: "absensi", name: "Absensi", icon: CheckCircle2 \},\s*\{ id: "kkn-workspace", name: "KKN Workspace", icon: Layers \},\s*\{ id: "team-quotes", name: language === "en" \? "Team Quotes" : "Suara Tim", icon: Users \},\s*\{ id: "gallery", name: language === "en" \? "Gallery" : "Galeri", icon: Camera \},\s*\{ id: "about-project", name: "About Project", icon: Award \}\s*\];/,
  `const publicItems = [
    { id: "home", name: language === "en" ? "Home" : "Beranda", icon: Home },
    { id: "absensi", name: language === "en" ? "Attendance" : "Absensi", icon: CheckCircle2 },
    { id: "kkn-workspace", name: language === "en" ? "KKN Workspace" : "Ruang KKN", icon: Layers },
    { id: "team-quotes", name: language === "en" ? "Team Quotes" : "Komentar Tim", icon: Users },
    { id: "gallery", name: language === "en" ? "Gallery" : "Galeri", icon: Camera },
    { id: "about-project", name: language === "en" ? "About Project" : "Tentang Proyek", icon: Award }
  ];`
);
fs.writeFileSync(path, content);
