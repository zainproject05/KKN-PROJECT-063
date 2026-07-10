const fs = require('fs');
const filePath = 'src/components/kkn/Attendance.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const modalStartMarker = '{/* COMPACT MODAL FOR NEW SESSION */}';
const modalEndMarker = '      {/* Custom Premium Confirm Modal */}';

const startIndex = content.indexOf(modalStartMarker);
const endIndex = content.indexOf(modalEndMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find modal block");
  process.exit(1);
}

const newModal = `{/* PREMIUM MODAL FOR NEW SESSION */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#030406] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/5"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-cyan-500/10 blur-[80px] pointer-events-none" />

              <div className="relative p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-black text-white tracking-widest uppercase">Sesi Presensi Baru</h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Buat sesi absensi digital untuk anggota</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-white/5 group"
                  >
                    <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400 font-mono leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreateSession} className="space-y-6">
                  {/* Activity Name */}
                  <div className="space-y-2 relative group/input">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Nama Kegiatan</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                        placeholder="Contoh: Rapat Mingguan, Gotong Royong..."
                        className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-sans text-sm text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Date */}
                    <div className="space-y-2 group/input">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                      />
                    </div>

                    {/* Time Window */}
                    <div className="space-y-2 group/input">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Jam Aktif</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          required
                          value={opensAt}
                          onChange={(e) => setOpensAt(e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-3 py-3.5 text-center rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        />
                        <span className="text-slate-600 font-mono text-xs">-</span>
                        <input
                          type="time"
                          required
                          value={closesAt}
                          onChange={(e) => setClosesAt(e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-3 py-3.5 text-center rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Posko */}
                  <div className="space-y-2 group/input">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center justify-between">
                      <span>Lokasi Presensi</span>
                      <span className="text-cyan-500/50 font-normal">Opsional</span>
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Nama lokasi atau titik koordinat..."
                      className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-sans text-sm text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 group/input">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center justify-between">
                      <span>Deskripsi Sesi</span>
                      <span className="text-cyan-500/50 font-normal">Opsional</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tambahkan catatan khusus untuk sesi ini..."
                      rows={2}
                      className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-sans text-sm text-white focus:outline-none resize-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="bg-[#080a0f] border border-white/[0.06] rounded-xl overflow-hidden mt-2">
                    <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
                      <Lock size={12} className="text-cyan-400" />
                      <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Keamanan & Validasi</h4>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={isPublic} 
                            onChange={(e) => setIsPublic(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Buka Presensi Publik</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={requireGps} 
                            onChange={(e) => setRequireGps(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Wajib Sinkron GPS</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={requireSelfie} 
                            onChange={(e) => setRequireSelfie(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Wajib Foto Selfie</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={autoCloseEnabled} 
                            onChange={(e) => setAutoCloseEnabled(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Otomatis Tutup Sesi</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-white/[0.06] mt-8">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider cursor-pointer text-center"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all text-xs font-sans font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          BUAT SESI BARU
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Premium Confirm Modal */}`;

const newContent = content.substring(0, startIndex) + newModal + content.substring(endIndex + modalEndMarker.length);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Updated Create Session Modal to premium layout.");
