import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

// For PRM template
const oldPRMText = `const text = \`Assalamu'alaikum Bapak Riyono.\\n\\nMohon izin, kami dari kelompok KKN PersyarikatanMu-063 yang akan melaksanakan kegiatan KKN di Padukuhan Klampok, Kalurahan Giripurwo, Kapanewon Purwosari, Kabupaten Gunungkidul.\\n\\nIzin menghubungi Bapak untuk koordinasi awal terkait lokasi, kegiatan, dan kebutuhan masyarakat setempat.\\n\\nTerima kasih, Pak.\\nWassalamu'alaikum warahmatullahi wabarakatuh.\`;`;
const newPRMText = `const text = \`Assalamu'alaikum Bapak Riyono.\\n\\nMohon izin, kami perwakilan dari kelompok KKN PersyarikatanMu-063 yang akan melaksanakan kegiatan KKN di Padukuhan Klampok, Kalurahan Giripurwo, Kapanewon Purwosari, Kabupaten Gunungkidul.\\n\\nIzin menghubungi Bapak untuk koordinasi awal terkait lokasi, kegiatan, dan kebutuhan masyarakat setempat.\\n\\nTerima kasih, Pak.\\nWassalamu'alaikum warahmatullahi wabarakatuh.\`;`;
content = content.replace(oldPRMText, newPRMText);

content = content.replace(
  'href="https://wa.me/6285104572666?text=Assalamu%E2%80%99alaikum%20Bapak%20Riyono.%0A%0AMohon%20izin%2C%20kami%20dari%20kelompok',
  'href="https://wa.me/6285104572666?text=Assalamu%E2%80%99alaikum%20Bapak%20Riyono.%0A%0AMohon%20izin%2C%20kami%20perwakilan%20dari%20kelompok'
);

// For DPL template
const oldDPLText = `const text = \`Assalamu'alaikum Bapak Sunarmo, S.H., M.Hum., Ph.D.\\n\\nMohon izin, kami dari perwakilan kelompok KKN PersyarikatanMu-063 yang berlokasi di Padukuhan Klampok, Kalurahan Giripurwo, Kapanewon Purwosari, Kabupaten Gunungkidul.\\n\\nIzin menghubungi Bapak terkait koordinasi kegiatan KKN dan arahan pelaksanaan program kerja kelompok kami.\\n\\nTerima kasih, Pak.\\nWassalamu'alaikum warahmatullahi wabarakatuh.\`;`;
const newDPLText = `const text = \`Assalamu'alaikum Bapak Sunarmo, S.H., M.Hum., Ph.D.\\n\\nMohon izin, kami perwakilan dari kelompok KKN PersyarikatanMu-063 yang berlokasi di Padukuhan Klampok, Kalurahan Giripurwo, Kapanewon Purwosari, Kabupaten Gunungkidul.\\n\\nIzin menghubungi Bapak terkait koordinasi kegiatan KKN dan arahan pelaksanaan program kerja kelompok kami.\\n\\nTerima kasih, Pak.\\nWassalamu'alaikum warahmatullahi wabarakatuh.\`;`;
content = content.replace(oldDPLText, newDPLText);

content = content.replace(
  'href="https://wa.me/628156852068?text=Assalamu%E2%80%99alaikum%20Bapak%20Sunarmo%2C%20S.H.%2C%20M.Hum.%2C%20Ph.D.%0A%0AMohon%20izin%2C%20kami%20dari%20perwakilan%20dari%20kelompok',
  'href="https://wa.me/628156852068?text=Assalamu%E2%80%99alaikum%20Bapak%20Sunarmo%2C%20S.H.%2C%20M.Hum.%2C%20Ph.D.%0A%0AMohon%20izin%2C%20kami%20perwakilan%20dari%20kelompok'
);

fs.writeFileSync('src/components/AboutProject.tsx', content);
