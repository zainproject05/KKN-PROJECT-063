const fs = require('fs');
const filePath = 'src/components/kkn/Attendance.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const tableStartStr = '                  <table className="w-full text-left border-collapse">';
const tableEndStr = '                  </table>';

const startIndex = content.indexOf(tableStartStr);
const endIndex = content.indexOf(tableEndStr, startIndex) + tableEndStr.length;

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find table block");
  process.exit(1);
}

const newTable = `                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 text-[8px] uppercase tracking-widest">
                        <th className="p-3 font-black">Anggota KKN</th>
                        <th className="p-3 font-black">NIM</th>
                        <th className="p-3 font-black text-center">Status & Waktu</th>
                        <th className="p-3 font-black text-center">Data Presensi</th>
                        <th className="p-3 font-black text-right">Aksi Manual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => {
                        const rec = records.find(r => r.member_id === member.id);
                        const rawStatus = rec?.status || "Absent";
                        const indStatus = REV_STATUS_MAP[rawStatus] || "Alfa";
                        
                        return (
                          <tr key={member.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                            <td className="p-3 flex items-center gap-3">
                              {getMemberPhotoUrl(member) ? (
                                <img 
                                  src={getMemberPhotoUrl(member)!} 
                                  alt={member.full_name} 
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover border border-cyan-500/20 shadow-inner shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-[9px] font-bold text-cyan-400 shrink-0 font-mono">
                                  {getInitials(member.full_name)}
                                </div>
                              )}
                              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{member.full_name}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-mono text-slate-400">{member.nim || "-"}</span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <span className={\`text-[10px] font-black uppercase px-2 py-0.5 rounded border \${
                                  indStatus === "Hadir" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]" :
                                  indStatus === "Izin" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                                  indStatus === "Sakit" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                  "bg-red-500/10 text-red-400 border-red-500/30"
                                }\`}>
                                  {indStatus}
                                </span>
                                {rec?.created_at ? (
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    {new Date(rec.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-600 font-mono">-</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col items-center gap-2">
                                {rec?.source === "public_web" && (
                                  <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Via Web Publik</span>
                                )}
                                <div className="flex justify-center gap-2">
                                  {rec?.latitude && rec?.longitude ? (
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={\`https://www.google.com/maps?q=\${rec.latitude},\${rec.longitude}\`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={\`Buka Maps (Akurasi: ±\${Math.round(rec.gps_accuracy_meters || 0)}m)\`}
                                        className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors group/btn relative"
                                      >
                                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                      </a>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(\`\${rec.latitude},\${rec.longitude}\`);
                                          showToast("Koordinat disalin.", "info");
                                        }}
                                        title="Salin Koordinat"
                                        className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors"
                                      >
                                        <Copy className="w-3 h-3 text-slate-400" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-slate-600 italic">No GPS</div>
                                  )}
                                  
                                  {rec?.selfie_path ? (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const { data } = await supabase.storage.from('attendance-selfies').createSignedUrl(rec.selfie_path!, 60);
                                          if (data?.signedUrl) {
                                            window.open(data.signedUrl, '_blank');
                                          } else {
                                            showToast("Gagal memuat foto", "error");
                                          }
                                        } catch (e) {
                                          showToast("Gagal memuat foto", "error");
                                        }
                                      }}
                                      title="Lihat Foto Selfie"
                                      className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors"
                                    >
                                      <Camera className="w-3.5 h-3.5 text-green-400" />
                                    </button>
                                  ) : (
                                    <div className="w-7 h-7 flex items-center justify-center">
                                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <select
                                value={indStatus}
                                onChange={(e) => handleUpdateStatus(member.id, member.full_name, e.target.value)}
                                className="bg-black/60 border border-white/10 rounded-md text-[10px] font-bold text-slate-300 py-1.5 px-2 focus:border-cyan-500/50 outline-none hover:bg-white/5 cursor-pointer ml-auto block"
                                disabled={submitting}
                              >
                                <option value="Hadir">Hadir</option>
                                <option value="Izin">Izin</option>
                                <option value="Sakit">Sakit</option>
                                <option value="Alfa">Alfa</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>`;

const newContent = content.substring(0, startIndex) + newTable + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Written table logic.");
