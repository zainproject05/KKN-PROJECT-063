const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update takePhoto
const takePhotoStr = `  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // We do NOT flip the canvas, so the saved photo has normal orientation (text is readable).
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoDataUrl(dataUrl);
    
    canvas.toBlob((blob) => {
      setPhotoBlob(blob);
    }, 'image/jpeg', 0.8);
    
    const img = new Image();`;

// Replace takePhoto completely
const oldTakePhotoStart = `  const takePhoto = async () => {`;
const oldTakePhotoEnd = `    const img = new Image();`;

const startIndexTakePhoto = content.indexOf(oldTakePhotoStart);
const endIndexTakePhoto = content.indexOf(oldTakePhotoEnd, startIndexTakePhoto) + oldTakePhotoEnd.length;

if (startIndexTakePhoto !== -1 && endIndexTakePhoto !== -1) {
  content = content.substring(0, startIndexTakePhoto) + takePhotoStr + content.substring(endIndexTakePhoto);
}

// 2. Update Camera Preview layout
const oldCameraPreviewStart = `              <div className="bg-black/80 border border-white/10 rounded-[22px] overflow-hidden relative aspect-[4/3] md:h-[360px] w-full flex flex-col items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">`;
const oldCameraPreviewEnd = `                  </div>
                )}
              </div>`;

const newCameraPreviewStr = `              <div className="bg-[#050505] border border-white/10 overflow-hidden relative aspect-[3/4] md:aspect-[4/3] w-full flex flex-col items-center justify-center mb-6 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                {!cameraActive && !photoDataUrl ? (
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-4 text-slate-400 hover:text-white transition-colors p-8 group cursor-pointer h-full w-full justify-center"
                  >
                    <div className="w-20 h-20 bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 flex items-center justify-center transition-all">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-black uppercase tracking-widest block text-cyan-400 mb-1">Inisialisasi Kamera</span>
                      <span className="text-[10px] text-slate-500 font-mono">Pastikan pencahayaan cukup</span>
                    </div>
                  </button>
                ) : null}
                
                <video 
                  ref={videoRef} 
                  className={\`w-full h-full object-cover transform scale-x-[-1] \${cameraActive && !photoDataUrl ? 'block' : 'hidden'}\`}
                  playsInline
                  muted
                />
                
                {photoDataUrl && (
                  <img src={photoDataUrl} alt="Selfie" className="w-full h-full object-cover transform scale-x-[-1]" />
                )}
                
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Premium Firm Overlay Guide */}
                {cameraActive && !photoDataUrl && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="relative w-[70%] max-w-[280px] aspect-[3/4]">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/80"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/80"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/80"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/80"></div>
                    </div>
                  </div>
                )}
                
                {cameraActive && !photoDataUrl && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                    <button 
                      onClick={takePhoto}
                      className="w-16 h-16 rounded-full border-[3px] border-white/40 flex items-center justify-center bg-transparent active:scale-95 transition-all hover:border-cyan-400 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                    </button>
                  </div>
                )}
              </div>`;

const startIndexPreview = content.indexOf(oldCameraPreviewStart);
const endIndexPreview = content.indexOf(oldCameraPreviewEnd, startIndexPreview) + oldCameraPreviewEnd.length;

if (startIndexPreview !== -1 && endIndexPreview !== -1) {
  content = content.substring(0, startIndexPreview) + newCameraPreviewStr + content.substring(endIndexPreview);
} else {
  console.log("Could not find camera preview block");
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated camera logic and UI.");
