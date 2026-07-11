const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newInjection = `
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-[#0a0a0d] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Konfigurasi Supabase Belum Valid</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Pastikan <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> sudah diisi dengan benar.
          </p>
          <div className="bg-black/50 border border-white/5 rounded-lg p-4 text-left space-y-3">
            <p className="text-xs text-slate-500 font-mono">
              VITE_SUPABASE_URL harus berbentuk URL:<br/>
              <span className="text-cyan-400">https://xxxxx.supabase.co</span>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              (Jika Anda memasukkan nilai yang dimulai dengan "sb_publishable_" atau "eyJ...", itu mungkin adalah Key, bukan URL.)
            </p>
          </div>
        </div>
      </div>
    );
  }
`;

code = code.replace(/if \(!isSupabaseConfigured\) \{[\s\S]*?\n  \}[\s\n]*if \(activeSessionToken\) \{/, newInjection + "\n  if (activeSessionToken) {");
fs.writeFileSync('src/App.tsx', code);
