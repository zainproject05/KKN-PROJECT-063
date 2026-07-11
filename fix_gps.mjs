import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

// GPS 
content = content.replace(/<span className="text-\[9px\] text-slate-600 flex items-center gap-1 font-mono"><MapPin className="w-3 h-3 opacity-30" \/> -<\/span>/g, '<span className="text-[9px] text-slate-600 flex items-center gap-1 font-mono"><MapPin className="w-3 h-3 opacity-30" /> No GPS</span>');

// Photo
content = content.replace(/<span className="text-\[9px\] text-slate-600 flex items-center gap-1 font-mono"><Camera className="w-3 h-3 opacity-30" \/> -<\/span>/g, '<span className="text-[9px] text-slate-600 flex items-center gap-1 font-mono"><Camera className="w-3 h-3 opacity-30" /> No Photo</span>');

// For the image photo path, it used rec?.photo_path. Wait, parsedRecord returns selfie_path!
content = content.replace(/rec\?\.photo_path/g, 'rec?.selfie_path');

fs.writeFileSync('src/components/kkn/Attendance.tsx', content);

