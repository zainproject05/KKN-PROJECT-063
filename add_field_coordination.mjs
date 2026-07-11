import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

const fieldCoordinationHTML = `
              {/* Row 2.5: KKN Location & Field Coordination */}
              <motion.div variants={staggerChildVariants} className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Location Card */}
                  <div className="relative rounded-3xl bg-gradient-to-b from-[#090b16]/95 to-[#04050a]/98 border border-white/10 p-6.5 shadow-[12px_12px_36px_rgba(0,0,0,0.95)] overflow-hidden text-left flex flex-col justify-between group hover:border-cyan-500/20 transition-all duration-300">
                    <div>
                      <h4 className="font-mono text-[10.5px] font-black text-slate-300 uppercase tracking-widest flex items-center space-x-2 pb-3 border-b border-white/5 mb-4">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>Lokasi KKN</span>
                      </h4>
                      <div className="space-y-1 text-sm font-semibold text-white mb-6">
                        <p>Padukuhan Klampok</p>
                        <p>Kalurahan Giripurwo</p>
                        <p>Kapanewon Purwosari</p>
                        <p>Kabupaten Gunungkidul</p>
                        <p className="text-slate-400 text-xs mt-1">Daerah Istimewa Yogyakarta</p>
                      </div>
                    </div>
                    <a 
                      href="https://maps.app.goo.gl/c4BWjXcbrCt5DRF48"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs uppercase tracking-wider text-center hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Buka Maps
                    </a>
                  </div>

                  {/* PRM Contact Card */}
                  <div className="relative rounded-3xl bg-gradient-to-b from-[#090b16]/95 to-[#04050a]/98 border border-white/10 p-6.5 shadow-[12px_12px_36px_rgba(0,0,0,0.95)] overflow-hidden text-left flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-300">
                    <div>
                      <h4 className="font-mono text-[10.5px] font-black text-slate-300 uppercase tracking-widest flex items-center space-x-2 pb-3 border-b border-white/5 mb-4">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span>Kontak PRM</span>
                      </h4>
                      <div className="mb-6">
                        <p className="text-xl font-bold text-white">Bapak Riyono</p>
                        <p className="text-slate-400 font-mono mt-1 text-sm">0851-0457-2666</p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <button 
                        onClick={() => {
                          const text = \`Assalamu'alaikum Bapak Riyono.\\n\\nMohon izin, kami dari kelompok KKN PersyarikatanMu-063 yang akan melaksanakan kegiatan KKN di Padukuhan Klampok, Kalurahan Giripurwo, Kapanewon Purwosari, Kabupaten Gunungkidul.\\n\\nIzin menghubungi Bapak untuk koordinasi awal terkait lokasi, kegiatan, dan kebutuhan masyarakat setempat.\\n\\nTerima kasih, Pak.\\nWassalamu'alaikum warahmatullahi wabarakatuh.\`;
                          navigator.clipboard.writeText(text).then(() => showToast("Template chat berhasil disalin.")).catch(() => showToast("Gagal menyalin template."));
                        }}
                        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider text-center hover:bg-white/10 hover:border-white/20 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Salin Template Chat
                      </button>
                      <a 
                        href="https://wa.me/6285104572666?text=Assalamu%E2%80%99alaikum%20Bapak%20Riyono.%0A%0AMohon%20izin%2C%20kami%20dari%20kelompok%20KKN%20PersyarikatanMu-063%20yang%20akan%20melaksanakan%20kegiatan%20KKN%20di%20Padukuhan%20Klampok%2C%20Kalurahan%20Giripurwo%2C%20Kapanewon%20Purwosari%2C%20Kabupaten%20Gunungkidul.%0A%0AIzin%20menghubungi%20Bapak%20untuk%20koordinasi%20awal%20terkait%20lokasi%2C%20kegiatan%2C%20dan%20kebutuhan%20masyarakat%20setempat.%0A%0ATerima%20kasih%2C%20Pak.%0AWassalamu%E2%80%99alaikum%20warahmatullahi%20wabarakatuh."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider text-center hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-3.5 h-3.5"><path fill="#25D366" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                        Hubungi via WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* DPL Contact Card */}
                  <div className="relative rounded-3xl bg-gradient-to-b from-[#090b16]/95 to-[#04050a]/98 border border-white/10 p-6.5 shadow-[12px_12px_36px_rgba(0,0,0,0.95)] overflow-hidden text-left flex flex-col justify-between group hover:border-indigo-500/20 transition-all duration-300">
                    <div>
                      <h4 className="font-mono text-[10.5px] font-black text-slate-300 uppercase tracking-widest flex items-center space-x-2 pb-3 border-b border-white/5 mb-4">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Dosen Pembimbing Lapangan</span>
                      </h4>
                      <div className="mb-6">
                        <p className="text-[15px] font-bold text-white">Sunarmo, S.H., M.Hum., Ph.D.</p>
                        <p className="text-slate-400 font-mono mt-1 text-sm">0815-6852-068</p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <button 
                        onClick={() => {
                          const text = \`Assalamu'alaikum Bapak Sunarmo, S.H., M.Hum., Ph.D.\\n\\nMohon izin, saya Ananda Nur Daffa Zain dari kelompok KKN PersyarikatanMu-063 yang berlokasi di Padukuhan Klampok, Kalurahan Giripurwo, Kapanewon Purwosari, Kabupaten Gunungkidul.\\n\\nIzin menghubungi Bapak terkait koordinasi kegiatan KKN dan arahan pelaksanaan program kerja kelompok kami.\\n\\nTerima kasih, Pak.\\nWassalamu'alaikum warahmatullahi wabarakatuh.\`;
                          navigator.clipboard.writeText(text).then(() => showToast("Template chat berhasil disalin.")).catch(() => showToast("Gagal menyalin template."));
                        }}
                        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider text-center hover:bg-white/10 hover:border-white/20 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Salin Template Chat
                      </button>
                      <a 
                        href="https://wa.me/628156852068?text=Assalamu%E2%80%99alaikum%20Bapak%20Sunarmo%2C%20S.H.%2C%20M.Hum.%2C%20Ph.D.%0A%0AMohon%20izin%2C%20saya%20Ananda%20Nur%20Daffa%20Zain%20dari%20kelompok%20KKN%20PersyarikatanMu-063%20yang%20berlokasi%20di%20Padukuhan%20Klampok%2C%20Kalurahan%20Giripurwo%2C%20Kapanewon%20Purwosari%2C%20Kabupaten%20Gunungkidul.%0A%0AIzin%20menghubungi%20Bapak%20terkait%20koordinasi%20kegiatan%20KKN%20dan%20arahan%20pelaksanaan%20program%20kerja%20kelompok%20kami.%0A%0ATerima%20kasih%2C%20Pak.%0AWassalamu%E2%80%99alaikum%20warahmatullahi%20wabarakatuh."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-wider text-center hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-3.5 h-3.5"><path fill="#25D366" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                        Hubungi via WhatsApp
                      </a>
                    </div>
                  </div>

                </div>
              </motion.div>
`;

content = content.replace('{/* Row 3: Symmetrical Bottom Channels */}', fieldCoordinationHTML + '\n              {/* Row 3: Symmetrical Bottom Channels */}');

// Add the required icons to lucide-react imports if missing: MapPin, Phone, Users, Copy
const iconMatch = content.match(/import \{([^}]+)\} from "lucide-react";/);
if (iconMatch) {
  let icons = iconMatch[1];
  const newIcons = ['MapPin', 'Phone', 'Users', 'Copy'];
  for (const icon of newIcons) {
    if (!icons.includes(icon)) {
      icons += `, ${icon}`;
    }
  }
  content = content.replace(iconMatch[0], `import {${icons}} from "lucide-react";`);
}

fs.writeFileSync('src/components/AboutProject.tsx', content);
console.log("Added Field Coordination section");
