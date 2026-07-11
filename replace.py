import re

with open('src/components/AboutProject.tsx', 'r') as f:
    content = f.read()

# Replace from Row 2.5 to University Web Resources
pattern = re.compile(r'\{\/\*\s*Row 2\.5: KKN Location & Field Coordination\s*\*\/\}.*?\{\/\*\s*University Web Resources\s*\*\/\}', re.DOTALL)

replacement = """{/* Row 3: Support & Web Nodes */}
              <motion.div variants={staggerChildVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                
                {/* Unified Contact & Support Desk (Neumorphism 3D Style) */}
                <div className="relative rounded-3xl bg-[#0a0d14] border border-white/[0.03] p-6.5 overflow-hidden text-left flex flex-col justify-between shadow-[8px_8px_16px_rgba(0,0,0,0.8),-4px_-4px_12px_rgba(255,255,255,0.02),inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(0,0,0,0.5)]">
                  <div>
                    <h4 className="font-mono text-[10.5px] font-black text-cyan-400 uppercase tracking-widest flex items-center space-x-2 pb-3 border-b border-white/5 mb-5 shadow-[0_1px_0_rgba(0,0,0,0.5)]">
                      <MessageSquare className="w-4 h-4 text-cyan-400 filter drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]" />
                      <span>{t("about.contact_title", "PUSAT KOORDINASI & LAYANAN")}</span>
                    </h4>
                    
                    {/* Inner Contacts Section */}
                    <div className="space-y-4">
                      {/* PRM Contact */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11151f] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(0,0,0,0.8),2px_2px_5px_rgba(0,0,0,0.4)] border border-white/5 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0a0d14] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] border border-white/5 group-hover:border-emerald-500/30 transition-all">
                            <Phone className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Kontak PRM</p>
                            <p className="text-sm font-bold text-slate-200">Bapak Riyono</p>
                          </div>
                        </div>
                        <a 
                          href="https://wa.me/6285104572666?text=Assalamu%E2%80%99alaikum%20Bapak%20Riyono.%0A%0AMohon%20izin%20Pak%2C%20kami%20perwakilan%20dari%20kelompok%20KKN%20PersyarikatanMu-063%20yang%20berlokasi%20di%20Padukuhan%20Klampok%2C%20Kalurahan%20Giripurwo%2C%20Kapanewon%20Purwosari%2C%20Kabupaten%20Gunungkidul.%0A%0AIzin%20menghubungi%20Bapak%20untuk%20koordinasi%20awal%20terkait%20lokasi%2C%20kegiatan%2C%20dan%20kebutuhan%20masyarakat%20setempat.%0A%0ATerima%20kasih%2C%20Pak.%0AWassalamu%E2%80%99alaikum%20warahmatullahi%20wabarakatuh."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-4 rounded-xl bg-gradient-to-b from-[#18202b] to-[#0f141b] border border-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:text-emerald-300 hover:border-emerald-500/40 shadow-[3px_3px_6px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.02),inset_0_1px_1px_rgba(255,255,255,0.1)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-3.5 h-3.5 drop-shadow-[0_0_2px_rgba(16,185,129,0.3)]"><path fill="currentColor" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                          WhatsApp
                        </a>
                      </div>

                      {/* DPL Contact */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11151f] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(0,0,0,0.8),2px_2px_5px_rgba(0,0,0,0.4)] border border-white/5 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0a0d14] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] border border-white/5 group-hover:border-indigo-400/30 transition-all">
                            <Users className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider mb-0.5">DPL KKN 063</p>
                            <p className="text-sm font-bold text-slate-200 truncate max-w-[140px]" title="Sunarmo, S.H., M.Hum., Ph.D.">Sunarmo, Ph.D.</p>
                          </div>
                        </div>
                        <a 
                          href="https://wa.me/628156852068?text=Assalamu%E2%80%99alaikum%20Bapak%20Sunarmo%2C%20S.H.%2C%20M.Hum.%2C%20Ph.D.%0A%0AMohon%20izin%2C%20kami%20perwakilan%20dari%20kelompok%20KKN%20PersyarikatanMu-063%20yang%20berlokasi%20di%20Padukuhan%20Klampok%2C%20Kalurahan%20Giripurwo%2C%20Kapanewon%20Purwosari%2C%20Kabupaten%20Gunungkidul.%0A%0AIzin%20menghubungi%20Bapak%20terkait%20koordinasi%20kegiatan%20KKN%20dan%20arahan%20pelaksanaan%20program%20kerja%20kelompok%20kami.%0A%0ATerima%20kasih%2C%20Pak.%0AWassalamu%E2%80%99alaikum%20warahmatullahi%20wabarakatuh."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-4 rounded-xl bg-gradient-to-b from-[#1a1e2c] to-[#12141f] border border-indigo-500/20 text-indigo-400 font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:text-indigo-300 hover:border-indigo-500/40 shadow-[3px_3px_6px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.02),inset_0_1px_1px_rgba(255,255,255,0.1)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-3.5 h-3.5 drop-shadow-[0_0_2px_rgba(99,102,241,0.3)]"><path fill="currentColor" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                          WhatsApp
                        </a>
                      </div>

                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-3">Admin & Developer Socials</p>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://wa.me/6281220010205"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/30 transition-all active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-4 h-4"><path fill="currentColor" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                      </a>
                      <a
                        href="https://github.com/DaffazainTM23"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/30 transition-all active:scale-95"
                      >
                        <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                          <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="currentColor"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/daffazain_28/?__pwa=1#"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-pink-400 hover:text-pink-300 hover:border-pink-500/30 transition-all active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 264 264" className="w-4 h-4">
                          <path fill="currentColor" d="M132.345 33.973c-26.716 0-30.07.117-40.563.594-10.472.48-17.62 2.136-23.876 4.567-6.47 2.51-11.958 5.87-17.426 11.335-5.472 5.464-8.834 10.948-11.354 17.412-2.44 6.252-4.1 13.397-4.57 23.858-.47 10.486-.593 13.838-.593 40.535 0 26.697.119 30.037.594 40.522.482 10.465 2.14 17.609 4.57 23.859 2.515 6.465 5.876 11.95 11.346 17.414 5.466 5.468 10.955 8.834 17.42 11.345 6.26 2.431 13.41 4.088 23.881 4.567 10.493.477 13.844.594 40.559.594 26.719 0 30.061-.117 40.555-.594 10.472-.48 17.63-2.136 23.888-4.567 6.468-2.51 11.948-5.877 17.414-11.345 5.472-5.464 8.834-10.949 11.354-17.412 2.419-6.252 4.079-13.398 4.57-23.858.472-10.486.595-13.828.595-40.525s-.123-30.047-.594-40.533c-.492-10.465-2.152-17.608-4.57-23.858-2.521-6.466-5.883-11.95-11.355-17.414-5.472-5.468-10.944-8.827-17.42-11.335-6.271-2.431-13.424-4.088-23.897-4.567-10.493-.477-13.834-.594-40.558-.594zm-8.825 17.715c2.62-.004 5.542 0 8.825 0 26.266 0 29.38.094 39.752.565 9.591.438 14.797 2.04 18.264 3.385 4.591 1.782 7.864 3.912 11.305 7.352 3.443 3.44 5.575 6.717 7.362 11.305 1.346 3.46 2.951 8.663 3.388 18.247.47 10.363.573 13.475.573 39.71 0 26.233-.102 29.346-.573 39.709-.44 9.584-2.042 14.786-3.388 18.247-1.783 4.587-3.919 7.854-7.362 11.292-3.443 3.441-6.712 5.57-11.305 7.352-3.463 1.352-8.673 2.95-18.264 3.388-10.37.47-13.486.573-39.752.573-26.268 0-29.38-.102-39.751-.573-9.592-.443-14.797-2.044-18.267-3.39-4.59-1.781-7.87-3.911-11.313-7.352-3.443-3.44-5.574-6.709-7.362-11.298-1.346-3.461-2.95-8.663-3.387-18.247-.472-10.363-.566-13.476-.566-39.726s.094-29.347.566-39.71c.438-9.584 2.04-14.786 3.387-18.25 1.783-4.588 3.919-7.865 7.362-11.305 3.443-3.441 6.722-5.57 11.313-7.357 3.468-1.351 8.675-2.949 18.267-3.389 9.075-.41 12.592-.532 30.926-.553zm61.337 16.322c-6.518 0-11.805 5.277-11.805 11.792 0 6.512 5.287 11.796 11.805 11.796 6.517 0 11.804-5.284 11.804-11.796 0-6.513-5.287-11.796-11.805-11.796zm-52.512 13.782c-27.9 0-50.519 22.603-50.519 50.482 0 27.879 22.62 50.471 50.52 50.471s50.51-22.592 50.51-50.471c0-27.879-22.613-50.482-50.513-50.482zm0 17.715c18.11 0 32.792 14.67 32.792 32.767 0 18.096-14.683 32.767-32.792 32.767-18.11 0-32.791-14.671-32.791-32.767 0-18.098 14.68-32.767 32.791-32.767z"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.tiktok.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-[#25f4ee] hover:text-[#1ec4be] hover:border-[#25f4ee]/30 transition-all active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" viewBox="0 0 352.28 398.67" className="w-4 h-4">
                          <defs><style>{`.cls-2-tk{fill:#fe2c55}.cls-3-tk{fill:currentColor}`}</style></defs>
                          <g id="Layer_1-2">
                            <path d="M137.17 156.98v-15.56c-5.34-.73-10.76-1.18-16.29-1.18C54.23 140.24 0 194.47 0 261.13c0 40.9 20.43 77.09 51.61 98.97-20.12-21.6-32.46-50.53-32.46-82.31 0-65.7 52.69-119.28 118.03-120.81Z" className="cls-3-tk"/>
                            <path d="M140.02 333c29.74 0 54-23.66 55.1-53.13l.11-263.2h48.08c-1-5.41-1.55-10.97-1.55-16.67h-65.67l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-9.24 0-17.95-2.31-25.61-6.34C105.3 323.9 121.6 333 140.02 333ZM333.13 106V91.37c-18.34 0-35.43-5.45-49.76-14.8 12.76 14.65 30.09 25.22 49.76 29.43Z" className="cls-3-tk"/>
                            <path d="M283.38 76.57c-13.98-16.05-22.47-37-22.47-59.91h-17.59c4.63 25.02 19.48 46.49 40.06 59.91ZM120.88 205.92c-30.44 0-55.21 24.77-55.21 55.21 0 21.2 12.03 39.62 29.6 48.86-6.55-9.08-10.45-20.18-10.45-32.2 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-67.05c-5.34-.73-10.76-1.18-16.29-1.18-.96 0-1.9.05-2.85.07v51.49c-5.16-1.61-10.61-2.55-16.29-2.55Z" className="cls-2-tk"/>
                            <path d="M333.13 106v51.04c-34.05 0-65.61-10.89-91.37-29.38v133.47c0 66.66-54.23 120.88-120.88 120.88-25.76 0-49.64-8.12-69.28-21.91 22.08 23.71 53.54 38.57 88.42 38.57 66.66 0 120.88-54.23 120.88-120.88V144.33c25.76 18.49 57.32 29.38 91.37 29.38v-65.68c-6.57 0-12.97-.71-19.14-2.03Z" className="cls-2-tk"/>
                            <path d="M241.76 261.13V127.66c25.76 18.49 57.32 29.38 91.37 29.38V106c-19.67-4.21-37-14.77-49.76-29.43-20.58-13.42-35.43-34.88-40.06-59.91h-48.08l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-18.42 0-34.72-9.1-44.75-23.01-17.57-9.25-29.6-27.67-29.6-48.86 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-51.49C71.83 158.5 19.14 212.08 19.14 277.78c0 31.78 12.34 60.71 32.46 82.31C71.23 373.87 95.12 382 120.88 382c66.65 0 120.88-54.23 120.88-120.88Z" fill="#fff"/>
                          </g>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* University Web Resources */}"""

content = pattern.sub(replacement, content)

with open('src/components/AboutProject.tsx', 'w') as f:
    f.write(content)

