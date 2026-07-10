const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '{/* Left Column: Form & Info */}';
const endMarker = '{/* Right Column: Camera & Submit */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find left column markers.");
  process.exit(1);
}

const newLeftColumn = `{/* Left Column: Form & Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Detail Sesi */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#050505] border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-lg font-black text-white mb-6 tracking-tight">Detail Sesi</h2>
            
            {sessions.length === 0 ? (
              <div className="bg-black border border-white/5 rounded-lg p-6 text-center flex flex-col items-center justify-center">
                <p className="text-white font-bold text-sm">Belum ada sesi aktif</p>
                <p className="text-slate-500 text-xs mt-1.5 max-w-[250px]">Sesi absensi akan tampil otomatis saat admin membuka presensi.</p>
                <div className="mt-4 px-3 py-1.5 bg-blue-500/10 rounded-lg flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] text-blue-300 font-medium">Silakan hubungi admin jika sesi seharusnya dibuka.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Aktivitas</label>
                  <div className="relative">
                    <select 
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full bg-black border border-white/10 hover:border-white/20 rounded-lg p-3 text-slate-200 text-sm focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer font-semibold shadow-inner"
                    >
                      <option value="" disabled hidden>Pilih Sesi Absensi</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.activity_name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronLeft className="w-4 h-4 text-slate-400 -rotate-90" />
                    </div>
                  </div>
                </div>

                {selectedSession && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-4 pt-2"
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Waktu</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {new Date(selectedSession.starts_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSession.ends_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Lokasi</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedSession.location || 'Posko KKN'}
                      </div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status</span>
                      {isSessionOpen() ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-400 rounded text-[10px] font-bold">
                          Ditutup
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Card 2: Identitas */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#050505] border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-lg font-black text-white mb-4 tracking-tight">Identitas</h2>
            
            {members.length === 0 ? (
              <div className="bg-black border border-white/5 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Data anggota belum tersedia.</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-black border border-white/10 hover:border-white/20 rounded-lg p-3 text-slate-200 text-sm focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer font-semibold shadow-inner"
                >
                  <option value="" disabled hidden>Cari nama anggota...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} {m.nim ? \`(\${m.nim})\` : ''} {m.kkn_role ? \` - \${m.kkn_role}\` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronLeft className="w-4 h-4 text-slate-400 -rotate-90" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Card 3: Lokasi Perangkat */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#050505] border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-lg font-black text-white mb-4 tracking-tight">Lokasi Perangkat</h2>
            
            {!latitude ? (
              <button 
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full py-6 bg-black border border-white/10 hover:border-white/30 rounded-lg flex flex-col items-center justify-center gap-3 transition-all group disabled:opacity-50 cursor-pointer"
              >
                {isLocating ? (
                  <div className="w-6 h-6 border-2 border-slate-500 border-t-cyan-400 rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                      <MapPin className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors tracking-wide">Ambil Lokasi Saya</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-[140px] rounded-lg overflow-hidden border border-white/10 bg-black relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0}
                    marginWidth={0}
                    src={\`https://maps.google.com/maps?q=\${latitude},\${longitude}&hl=es;z=15&output=embed\`}
                    className="absolute inset-0 grayscale-[50%] contrast-[1.2]"
                  />
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] mix-blend-overlay bg-cyan-900/10" />
                </div>
                
                <div className="flex items-center justify-between bg-black p-3 rounded-lg border border-white/5">
                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Koordinat Saat Ini</div>
                    <div className="text-xs font-mono text-white mt-1">{latitude.toFixed(6)}, {longitude?.toFixed(6)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Akurasi</div>
                    <div className="text-xs font-mono text-slate-300 mt-1">±{Math.round(accuracy || 0)}m</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a 
                    href={\`https://www.google.com/maps?q=\${latitude},\${longitude}\`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Map className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">Buka Maps</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        `;

content = content.substring(0, startIndex) + newLeftColumn + content.substring(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated left column.");
