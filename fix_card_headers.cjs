const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<h2 className="text-lg font-black text-white mb-6 tracking-tight">Detail Sesi</h2>',
  '<h2 className="text-sm font-bold text-white mb-5 tracking-tight">Detail Sesi</h2>'
);

content = content.replace(
  '<h2 className="text-lg font-black text-white mb-4 tracking-tight">Identitas</h2>',
  '<h2 className="text-sm font-bold text-white mb-5 tracking-tight">Identitas</h2>'
);

content = content.replace(
  '<h2 className="text-lg font-black text-white mb-4 tracking-tight">Lokasi Perangkat</h2>',
  '<h2 className="text-sm font-bold text-white mb-5 tracking-tight">Lokasi Perangkat</h2>'
);

content = content.replace(
  '<h2 className="text-xl font-black text-white">Bukti Kehadiran</h2>',
  '<h2 className="text-sm font-bold text-white">Bukti Kehadiran</h2>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated card headers.");
