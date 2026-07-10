const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"',
  'className="fixed top-24 right-4 z-[100] w-full max-w-sm"'
);

content = content.replace(
  'initial={{ opacity: 0, y: -20 }}',
  'initial={{ opacity: 0, x: 20 }}'
);
content = content.replace(
  'animate={{ opacity: 1, y: 0 }}',
  'animate={{ opacity: 1, x: 0 }}'
);
content = content.replace(
  'exit={{ opacity: 0, y: -20 }}',
  'exit={{ opacity: 0, x: 20 }}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated toast position to top-right.");
