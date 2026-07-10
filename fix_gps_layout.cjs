const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace Button
content = content.replace(
  'className="w-full py-5 bg-gradient-to-r from-slate-900 to-black hover:from-slate-800 hover:to-slate-900 border border-white/10 hover:border-cyan-500/30 rounded-2xl flex items-center justify-center gap-3 transition-all group disabled:opacity-50 cursor-pointer shadow-inner"',
  'className="w-full py-4 bg-black hover:bg-[#0a0a0a] border border-white/10 hover:border-white/30 rounded-lg flex items-center justify-center gap-3 transition-all group disabled:opacity-50 cursor-pointer"'
);

// Replace GPS Display Container
content = content.replace(
  'className="bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner"',
  'className="bg-black border border-white/10 rounded-lg p-5"'
);

// Replace Select Anggota Dropdown Container to be round-lg and less gradient if needed
content = content.replace(
  'className="w-full bg-[#05070a]/80 border border-white/[0.06] focus:border-cyan-400/50 p-4 rounded-2xl font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all appearance-none cursor-pointer hover:bg-white/[0.02]"',
  'className="w-full bg-black border border-white/10 focus:border-cyan-400 p-4 rounded-lg font-sans text-sm text-white focus:outline-none transition-all appearance-none cursor-pointer hover:bg-white/5"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated GPS and Select Anggota layouts.");
