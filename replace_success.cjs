const fs = require('fs');

const filePath = 'src/components/PublicAbsensi.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const successReturnIndex = content.indexOf('    return (\n      <div className="w-full max-w-lg mx-auto p-4 md:p-8">');
const nextReturnIndex = content.indexOf('  return (\n    <div className="w-full min-h-screen');

if (successReturnIndex === -1 || nextReturnIndex === -1) {
  console.error("Could not find the success return block");
  process.exit(1);
}

const newSuccess = `    return (
      <div className="w-full min-h-screen flex flex-col z-10 overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-gradient-to-b from-[#111318]/90 to-[#0a0c10]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_12px_45px_rgba(0,0,0,0.5)] flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
            
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-3">Verifikasi Berhasil</h2>
            <p className="text-slate-400 text-sm mb-10 max-w-md mx-auto">Data absensi dan bukti kehadiran Anda telah berhasil diverifikasi dan tersimpan aman di pusat data KKN Project.</p>
            
            <div className="w-full bg-black/40 rounded-2xl p-6 text-left space-y-4 border border-white/5 mb-10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Nama Anggota</div>
                  <div className="text-sm font-semibold text-white">{successData.member_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Sesi Presensi</div>
                  <div className="text-sm font-semibold text-white">{successData.session_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Waktu Tercatat</div>
                  <div className="text-sm font-semibold text-white">{new Date(successData.timestamp).toLocaleString("id-ID")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status GPS</div>
                  <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>Terverifikasi (±{Math.round(successData.accuracy)}m)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <a 
                href={\`https://www.google.com/maps?q=\${successData.latitude},\${successData.longitude}\`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm font-bold text-slate-300"
              >
                <Map className="w-4 h-4" />
                <span className="tracking-wide">Lihat di Maps</span>
              </a>
              
              <button 
                onClick={onBackToHome}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer text-sm tracking-wide"
              >
                Kembali ke Beranda
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

`;

const newContent = content.substring(0, successReturnIndex) + newSuccess + content.substring(nextReturnIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully replaced PublicAbsensi.tsx success block.");
