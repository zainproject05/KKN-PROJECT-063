import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

// Center map to Klampok exactly
content = content.replace(
  'center={[(umyCoords.lng + klampokCoords.lng) / 2, (umyCoords.lat + klampokCoords.lat) / 2]}',
  'center={[klampokCoords.lng, klampokCoords.lat]}'
);
content = content.replace(
  'zoom={11.0}',
  'zoom={14.0}'
);

// Update route colors
// Old: <MapRoute coordinates={routeCoords} color="#06b6d4" width={4} opacity={0.8} dashArray={[2, 2]} />
// Old: <MapRoute coordinates={boundaryCoords} color="#10b981" width={2} opacity={0.6} dashArray={[4, 4]} />
content = content.replace(
  '<MapRoute coordinates={routeCoords} color="#06b6d4" width={4} opacity={0.8} dashArray={[2, 2]} />',
  '<MapRoute coordinates={routeCoords} color="#3b82f6" width={5} opacity={0.9} />'
);
content = content.replace(
  '<MapRoute coordinates={boundaryCoords} color="#10b981" width={2} opacity={0.6} dashArray={[4, 4]} />',
  '<MapRoute coordinates={boundaryCoords} color="#ef4444" width={3} opacity={0.8} dashArray={[5, 5]} />'
);

// Update popup styling
content = content.replace(
  'MarkerPopup className="w-64 p-0 border border-white/10 bg-slate-950/98 backdrop-blur-xl overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-left select-none"',
  'MarkerPopup className="w-64 p-0 border border-white/5 bg-[#0a0c10]/95 backdrop-blur-2xl overflow-hidden rounded-2xl shadow-[10px_10px_24px_rgba(0,0,0,0.95),-4px_-4px_16px_rgba(255,255,255,0.03)] text-left select-none ring-1 ring-white/5"'
);

content = content.replace(
  'className="p-3.5 space-y-2.5 text-left bg-gradient-to-b from-slate-950/30 to-slate-950/95 relative z-10"',
  'className="p-4 space-y-3 text-left bg-gradient-to-b from-[#0a0c10]/50 to-[#050608]/98 relative z-10"'
);

// Update image to a group picture
content = content.replace(
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=320&h=180&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953eb1b5b4?w=320&h=180&fit=crop'
);

// Fix GET DIRECTIONS button to match Neumorphism style
const oldBtn = 'className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl bg-cyan-400 px-3 text-[9px] font-bold text-slate-950 hover:bg-cyan-300 transition-all cursor-pointer shadow-[0_4px_12px_rgba(34,211,238,0.2)] uppercase tracking-wider active:scale-[0.98]"';
const newBtn = 'className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 px-3 text-[9px] font-bold text-slate-950 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer shadow-[4px_4px_10px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.4)] uppercase tracking-wider active:scale-[0.98] border border-cyan-300/20"';
content = content.replace(oldBtn, newBtn);

fs.writeFileSync('src/components/AboutProject.tsx', content);
