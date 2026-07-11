import fs from 'fs';
let content = fs.readFileSync('src/components/PublicAbsensi.tsx', 'utf-8');

content = content.replace(
  'const filteredMembers = searchQuery.trim() === "" \n     ? [] \n     : members.filter(m => \n         m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || \n         m.nim.includes(searchQuery)\n      );',
  'const filteredMembers = searchQuery.trim() === "" \n     ? members \n     : members.filter(m => \n         m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || \n         m.nim.includes(searchQuery)\n      );'
);

fs.writeFileSync('src/components/PublicAbsensi.tsx', content);
console.log('Patched public search');
