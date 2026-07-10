const fs = require('fs');
const filePath = 'src/components/PublicAbsensi.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const cameraBlockToReplace = `{cameraActive && !photoDataUrl && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">`;

const replacement = `{cameraActive && !photoDataUrl && (
                  <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex justify-between w-full">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg" />
                      <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg" />
                    </div>
                    
                    <div className="flex justify-between w-full">
                      <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg" />
                      <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg" />
                    </div>
                  </div>
                )}
                
                {cameraActive && !photoDataUrl && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">`;

if(content.includes(cameraBlockToReplace)) {
  content = content.replace(cameraBlockToReplace, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated camera frame overlays.");
} else {
  console.log("Could not find camera block to replace.");
}

