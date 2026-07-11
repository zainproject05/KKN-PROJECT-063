import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

content = content.replace(
  '{t("about.map_label", "Gedung G6 Teknik Mesin UMY")}',
  '{t("about.map_label", "Padukuhan Klampok")}'
);

content = content.replace(
  'alt="Mechanical Lab G6"',
  'alt="KKN Group 063"'
);

content = content.replace(
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=320&h=180&fit=crop',
  'https://images.unsplash.com/photo-1593113580332-ceec88fc9e51?w=320&h=180&fit=crop'
);

content = content.replace(
  '<span>BUILDING G6</span>',
  '<span>KKN GROUP 063</span>'
);

content = content.replace(
  '{t("about.map_label", "Gedung G6 Teknik Mesin")}',
  '{t("about.map_label", "Padukuhan Klampok")}'
);

content = content.replace(
  'Civil & Mechanical Engineering, FT-UMY',
  'Giripurwo, Purwosari, Gunungkidul'
);

content = content.replace(
  '<span className="text-slate-400 uppercase">(CORE RESEARCH)</span>',
  '<span className="text-slate-400 uppercase">(LOKASI KKN)</span>'
);

// We need to also change the klampokCoords back to what user wants if needed? Wait. User said:
// -8.034789215438893, 110.4067402502076

content = content.replace(
  'klampokCoords = { lng: 110.3831698, lat: -8.0560764 }',
  'klampokCoords = { lng: 110.4067402502076, lat: -8.034789215438893 }'
);

content = content.replace(
  'COORDS -8.0560764, 110.3831698 | PADUKUHAN KLAMPOK, GIRIPURWO',
  'COORDS -8.034789, 110.406740 | PADUKUHAN KLAMPOK, GIRIPURWO'
);

content = content.replace(
  'href="https://maps.app.goo.gl/c4BWjXcbrCt5DRF48"',
  'href="https://maps.app.goo.gl/CU7PhaYKFmLZMr1V7"'
);

// We must replace it in multiple places. Let's make sure.
content = content.replaceAll(
  'https://maps.app.goo.gl/c4BWjXcbrCt5DRF48',
  'https://maps.app.goo.gl/CU7PhaYKFmLZMr1V7'
);

fs.writeFileSync('src/components/AboutProject.tsx', content);
console.log("Updated popup texts and coordinates");
