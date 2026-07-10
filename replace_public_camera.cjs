const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">1. Camera Preview</label>';
const endMarker = '{/* Submit Section */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find camera block in PublicAbsensi");
  process.exit(1);
}

const newBlock = `<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">1. Photo Selfie</label>
              
              <div className="bg-black border border-white/10 relative w-full h-[320px] sm:h-[400px] md:h-[480px] flex flex-col items-center justify-center mb-6 overflow-hidden">
                {!cameraActive && !photoDataUrl ? (
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-4 text-slate-500 hover:text-white transition-colors p-8 group cursor-pointer h-full w-full justify-center"
                  >
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold uppercase tracking-widest block text-white mb-1">Nyalakan Kamera</span>
                      <span className="text-[10px] font-mono">Pastikan wajah terlihat jelas</span>
                    </div>
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
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                    <button 
                      onClick={takePhoto}
                      className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center bg-black/20 backdrop-blur-sm active:scale-95 transition-all hover:bg-white/20 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-inner" />
                    </button>
                  </div>
                )}
              </div>

              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 mt-4">2. Validasi Foto</label>
              <div className="bg-black/50 border border-white/5 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className={\`w-2 h-2 rounded-full \${faceValidationStatus === "success" ? "bg-green-500" : faceValidationStatus === "failed" ? "bg-red-500" : "bg-slate-500"}\`} />
                  <span className="text-xs font-mono text-slate-300">
                    {faceValidationStatus === "idle" ? "Menunggu foto selfie..." : 
                     faceValidationStatus === "checking" ? "Menganalisis wajah..." : 
                     faceValidationStatus === "success" ? "Wajah terdeteksi dan valid." :
                     "Wajah tidak terdeteksi. Silakan foto ulang."}
                  </span>
                </div>
                {photoDataUrl && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      type="button" 
                      onClick={retakePhoto}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-white/30 rounded"
                    >
                      <RefreshCw size={12} />
                      Foto Ulang
                    </button>
                  </div>
                )}
              </div>

              `;

content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated PublicAbsensi camera section.");
