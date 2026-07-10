const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<div className="w-11 h-11" /> {/* Spacer */}',
  `<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
        </div>`
);

// We should also make the titles align left to match the design (the reference shows title on top-left).
// The reference image shows:
// Portal Absensi KKN (Left)
// KKN PMU-063 (Left, smaller)
// Online badge (Right)

// Let's replace the whole header.
const oldHeader = `{/* Header */}
      <div className="w-full px-4 md:px-8 py-5 flex items-center justify-between bg-[#0a0c10]/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToHome}
            className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <ModernPremiumLogo size={10} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-lg md:text-xl font-black text-white tracking-tight">Portal Absensi KKN</h1>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">KKN PersyarikatanMu-063</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
        </div>
      </div>`;

// Wait, I replaced the spacer first, let's find the header section and replace it.
const startMarker = '{/* Header */}';
const endMarker = '<div className="flex-1 w-full';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if(startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + `{/* Header */}
      <div className="w-full px-4 md:px-8 py-5 flex items-center justify-between border-b border-white/5 relative z-50">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-2xl font-black text-white tracking-tight">Portal Absensi KKN</h1>
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">KKN PMU-063</p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
        </div>
      </div>
      
      ` + content.substring(endIndex);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated header layout.");
