const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">1. Photo Selfie</label>',
  ''
);

content = content.replace(
  '<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 mt-4">2. Validasi Foto</label>',
  ''
);

content = content.replace(
  '<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">3. Submit Status</label>',
  ''
);

// We should also remove the 3. Submit Status box completely or clean it up.
// Let's remove the "Syarat Absensi" box entirely since the reference image only has the submit button at the bottom.
const submitStatusStart = '{/* Submit Section */}';
const submitButtonStart = '<button \n                  onClick={handleSubmit}';
const submitStatusEndIndex = content.indexOf(submitButtonStart);
const submitStatusStartIndex = content.indexOf(submitStatusStart);

if (submitStatusStartIndex !== -1 && submitStatusEndIndex !== -1) {
  content = content.substring(0, submitStatusStartIndex) + '{/* Submit Section */}\n              <div className="mt-auto">\n                <button \n                  onClick={handleSubmit}' + content.substring(submitStatusEndIndex + submitButtonStart.length);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Removed numbered labels and submit status box.");
