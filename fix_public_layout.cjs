const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace card classes for Left Column
content = content.replace(
  'className="bg-gradient-to-b from-[#111318]/95 to-[#0a0c10]/95 backdrop-blur-3xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"',
  'className="bg-[#050505] border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl"'
);

// Replace card classes for Right Column (Camera)
content = content.replace(
  'className="bg-gradient-to-b from-[#111318]/95 to-[#0a0c10]/95 backdrop-blur-3xl border border-white/10 rounded-[28px] p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col"',
  'className="bg-[#050505] border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl flex flex-col h-full"'
);

// Also replace the layout structure for the "Belum ada sesi aktif" and "Data anggota belum tersedia"
// Find "Belum ada sesi aktif"
content = content.replace(
  'className="bg-[#05070a]/80 border border-white/[0.06] rounded-2xl p-8 flex flex-col items-center justify-center text-center"',
  'className="bg-black border border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center"'
);

// Find "Data anggota belum tersedia"
content = content.replace(
  'className="bg-[#05070a]/80 border border-white/[0.06] rounded-2xl p-6 flex items-center justify-center text-center text-[11px] font-mono text-slate-500"',
  'className="bg-black border border-white/10 rounded-lg p-6 flex items-center justify-center text-center text-xs font-medium text-slate-500"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated layout styles.");
