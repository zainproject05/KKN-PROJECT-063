const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'className="bg-black border border-white/10 relative w-full h-[320px] sm:h-[400px] md:h-[480px] flex flex-col items-center justify-center mb-6 overflow-hidden"',
  'className="bg-black border border-white/10 rounded-xl relative w-full h-[320px] sm:h-[400px] md:h-[480px] flex flex-col items-center justify-center mb-6 overflow-hidden"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Added rounded corners to camera.");
