const fs = require('fs');

const filePath = 'src/components/PublicAbsensi.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Find the index of the start of the return statement
const returnIndex = content.indexOf('return (\n    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 z-10">');

if (returnIndex === -1) {
  console.error("Could not find the return statement to replace");
  process.exit(1);
}

const newReturn = `return (
    <div className="w-full min-h-screen flex flex-col z-10 overflow-y-auto">
      {/* Header */}
      <div className="w-full px-4 md:px-8 py-4 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToHome}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <ModernPremiumLogo size={10} />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-lg md:text-xl font-black text-white tracking-tight">Portal Absensi</h1>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">KKN PersyarikatanMu-063</p>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-24">
        
        {/* Left Column: Info & Session */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-[#111318]/90 to-[#0a0c10]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.5)]"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Detail Presensi</h2>
              <p className="text-xs text-slate-400 mt-1">Silakan lengkapi data absensi Anda</p>
            </div>

            <div className="space-y-6">
              {/* Session Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pilih Sesi Absensi</label>
                {sessions.length === 0 ? (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-300 font-bold">Belum ada sesi aktif</p>
                    <p className="text-slate-500 text-xs mt-1">Sesi absensi akan muncul di sini saat dibuka oleh admin.</p>
                  </div>
                ) : (
                  <select 
                    value={selectedSession?.id || ""}
                    onChange={(e) => setSelectedSession(sessions.find(s => s.id === e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-cyan-500/50 outline-none transition-colors appearance-none cursor-pointer font-medium"
                  >
                    <option value="" disabled hidden>Pilih Sesi Absensi</option>
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.activity_name}</option>
                    ))}
                  </select>
                )}
                
                {selectedSession && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 p-4 bg-cyan-950/10 border border-cyan-500/20 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</span>
                      {isSessionOpen() ? (
                        <span className="text-cyan-400 font-bold flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          TERBUKA
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold px-2 py-1 bg-red-500/10 rounded-md">
                          DITUTUP
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-slate-300" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Waktu Sesi</div>
                        <div className="text-sm font-bold text-white">
                          {new Date(selectedSession.starts_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSession.ends_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Member Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pilih Anggota</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 text-sm focus:border-cyan-500/50 outline-none transition-colors appearance-none cursor-pointer font-medium"
                >
                  <option value="" disabled hidden>Pilih Nama Anda</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} ({m.nim})</option>
                  ))}
                </select>
              </div>

              {/* GPS Location */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lokasi (GPS)</label>
                {!latitude ? (
                  <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full py-4 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20 hover:border-blue-500/40 rounded-xl flex items-center justify-center gap-2 transition-colors group disabled:opacity-50 cursor-pointer shadow-inner"
                  >
                    {isLocating ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        <span className="text-sm font-bold text-blue-300 group-hover:text-blue-200 transition-colors tracking-wide">Pindai Lokasi GPS</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Koordinat</div>
                        <div className="text-sm font-mono text-cyan-400 font-bold mt-1">{latitude.toFixed(6)}, {longitude?.toFixed(6)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Akurasi</div>
                        <div className="text-sm font-medium text-slate-300 mt-1">±{Math.round(accuracy || 0)}m</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <a 
                        href={\`https://www.google.com/maps?q=\${latitude},\${longitude}\`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Map className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-300">Buka Maps</span>
                      </a>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(\`\${latitude}, \${longitude}\`);
                          alert("Koordinat disalin.");
                        }}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-300">Salin Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Camera & Submit */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-[#111318]/90 to-[#0a0c10]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.5)] h-full flex flex-col"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Verifikasi Wajah</h2>
                <p className="text-xs text-slate-400 mt-1">Ambil swafoto untuk bukti kehadiran</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-black/60 border border-white/5 rounded-2xl overflow-hidden relative aspect-video md:aspect-[4/3] lg:aspect-auto lg:h-[400px] w-full flex flex-col items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
                {!cameraActive && !photoDataUrl ? (
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-4 text-slate-400 hover:text-cyan-400 transition-colors p-8 group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-cyan-500/10 flex items-center justify-center transition-colors">
                      <Camera className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Aktifkan Kamera</span>
                  </button>
                ) : null}
                
                <video 
                  ref={videoRef} 
                  className={\`w-full h-full object-cover \${cameraActive && !photoDataUrl ? 'block' : 'hidden'}\`}
                  playsInline
                  muted
                />
                
                {photoDataUrl && (
                  <img src={photoDataUrl} alt="Selfie" className="w-full h-full object-cover" />
                )}
                
                <canvas ref={canvasRef} className="hidden" />
                
                {cameraActive && !photoDataUrl && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <button 
                      onClick={takePhoto}
                      className="w-20 h-20 rounded-full border-[6px] border-white/20 flex items-center justify-center bg-transparent active:scale-95 transition-all hover:border-cyan-500/50"
                    >
                      <div className="w-14 h-14 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                    </button>
                  </div>
                )}
              </div>
              
              {photoDataUrl && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className={\`flex-1 p-3.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 \${faceDetected ? 'bg-green-950/30 border-green-500/30 text-green-400' : 'bg-red-950/30 border-red-500/30 text-red-400'}\`}>
                    {photoValidMsg}
                  </div>
                  
                  <button 
                    onClick={retakePhoto}
                    className="py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm font-bold text-slate-300"
                  >
                    <Camera className="w-4 h-4" />
                    Ulangi Foto
                  </button>
                </div>
              )}

              {/* Submit */}
              <div className="mt-auto pt-6 border-t border-white/5">
                <button 
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className={\`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-base uppercase tracking-widest \${
                    canSubmit && !isSubmitting 
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] cursor-pointer' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  }\`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                      <span>{loadingMsg || "Memproses Data..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Absensi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
`;

const newContent = content.substring(0, returnIndex) + newReturn;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully replaced PublicAbsensi.tsx return layout.");
