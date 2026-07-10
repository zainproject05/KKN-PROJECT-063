const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Update column span
content = content.replace(
  '{/* Right Column: Camera & Submit */}\n        <div className="lg:col-span-6 space-y-6">',
  '{/* Right Column: Camera & Submit */}\n        <div className="lg:col-span-7 space-y-6">'
);

// Update button style
content = content.replace(
  `canSubmit && !isSubmitting 
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] cursor-pointer' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'`,
  `canSubmit && !isSubmitting 
                      ? 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400 hover:text-cyan-300 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] cursor-pointer' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'`
);

content = content.replace(
  `className={\`w-full py-5 rounded-lg font-bold flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest \${`,
  `className={\`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest \${`
);

// Remove the indigo line from Bukti Kehadiran header
content = content.replace(
  '<div className="w-1.5 h-6 bg-indigo-500 rounded-full" />',
  ''
);

// Make the submit button text say KIRIM ABSENSI as per reference image
content = content.replace(
  '<span>Kirim Absensi</span>',
  '<span>KIRIM ABSENSI</span>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated right column.");
