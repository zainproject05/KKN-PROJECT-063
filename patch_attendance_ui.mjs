import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

if (!content.includes('import { PremiumExportButton } from "../PremiumExportButton";')) {
  content = content.replace(
    'import { SessionCountdown } from "./SessionCountdown";',
    'import { SessionCountdown } from "./SessionCountdown";\nimport { PremiumExportButton } from "../PremiumExportButton";'
  );
}

const findStart = content.indexOf('  const handlePrintPDFReport = (session: any) => {');
const findEnd = content.indexOf('    setIsOpen(false);', findStart); // Wait, this doesn't have setIsOpen(false) in Attendance.tsx

// Let's replace the button directly first
const oldButton = '<button onClick={() => handlePrintPDFReport(session)} className="nm-btn text-rose-400 px-3.5 py-1.5 text-[9.5px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"><Printer size={12} /><span>Export PDF</span></button>';

if (content.includes(oldButton)) {
  const newButton = `
<PremiumExportButton 
  title={\`Laporan Kehadiran KKN - \${session.activity_name}\`}
  filename={\`presensi_kkn_\${session.id}\`}
  data={members.map((member, i) => {
    const rec = records.find(r => r.member_id === member.id);
    const rawStatus = rec?.status || "Absent";
    const indStatus = REV_STATUS_MAP[rawStatus] || "Alfa";
    return {
      index: i + 1,
      name: member.full_name,
      nim: member.nim,
      status: rec ? indStatus.toUpperCase() : "BELUM DICATAT",
      timeIn: rec?.check_in_at ? new Date(rec.check_in_at).toLocaleTimeString("id-ID") : "-"
    };
  })}
  columns={[
    { key: "index", label: "NO" },
    { key: "name", label: "NAMA LENGKAP" },
    { key: "nim", label: "NIM" },
    { key: "status", label: "STATUS" },
    { key: "timeIn", label: "WAKTU PRESENSI" }
  ]}
  customHtmlTemplate={generateAttendanceHTML(session, members, records, REV_STATUS_MAP)}
/>
  `;
  content = content.replace(oldButton, newButton);
  fs.writeFileSync('src/components/kkn/Attendance.tsx', content);
  console.log('Button replaced successfully');
} else {
  console.error('Could not find oldButton');
}
