const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The submit button text block currently looks like:
// <span>KIRIM ABSENSI</span>
// </>\n)

if(content.includes('<span>KIRIM ABSENSI</span>')) {
  content = content.replace(
    '<span>KIRIM ABSENSI</span>',
    '<span>KIRIM ABSENSI &rarr;</span>'
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated button icon.");
