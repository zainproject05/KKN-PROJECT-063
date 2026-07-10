import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StartupLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 2000; // Fast, elegant startup duration
    const intervalTime = 16;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(Math.floor(currentProgress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 200);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="loader-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 bg-[#04060a] text-white flex items-center justify-center font-sans z-[9999] overflow-hidden select-none"
    >
      {/* Soft atmospheric gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.04) 0%, transparent 70%)
          `
        }} 
      />

      {/* Clean Premium Neumorphic Plaque Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center w-[92%] max-w-[460px] px-8 py-10 rounded-[32px] border border-white/5 bg-gradient-to-b from-[#090b12] to-[#040508] shadow-[30px_30px_70px_rgba(0,0,0,0.9),-10px_-10px_30px_rgba(255,255,255,0.01),inset_1px_1px_2px_rgba(255,255,255,0.05),inset_0_15px_30px_rgba(255,255,255,0.005)]"
      >
        {/* Top subtle highlight */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        {/* Central Inset Logo Frame with Dotted Outer Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          {/* Subtle Outer Dashed Orbit */}
          <div className="absolute inset-0 rounded-full border border-dashed border-white/10 animate-[spin_40s_linear_infinite]" />
          
          {/* 3D Inset Circular Holder */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#06080d] to-[#010204] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.95),inset_-4px_-4px_10px_rgba(255,255,255,0.015),0_4px_10px_rgba(0,0,0,0.4)] p-[14px] flex items-center justify-center relative overflow-hidden border border-white/5">
            <motion.img
              src="https://res.cloudinary.com/df0razmlr/image/upload/v1783274113/LOGO_KKN_ccrsvs.png"
              alt="KKN Project Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(6,182,212,0.3)]"
              referrerPolicy="no-referrer"
              animate={{
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* Dense Formal Typography */}
        <div className="text-center space-y-1.5 mb-8">
          <h1 className="text-[21px] sm:text-[23px] font-black tracking-[0.24em] text-white uppercase font-sans leading-none">
            KKN PROJECT
          </h1>
          <p className="text-[8.5px] tracking-[0.22em] font-extrabold text-cyan-400 font-mono uppercase">
            PERSYARIKATAN MUHAMMADIYAH 063
          </p>
        </div>

        {/* Premium Horizontal Progress Pill Track */}
        <div className="w-full max-w-[320px] space-y-3.5">
          {/* Progress bar capsule */}
          <div className="w-full h-[6px] bg-slate-950/90 rounded-full overflow-hidden p-[0.5px] border border-white/5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.9)]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status and Percentage underneath */}
          <div className="flex justify-between items-center text-[9px] font-mono font-bold tracking-[0.16em] uppercase px-1 leading-none">
            <span className="text-[#64748b]">COMPILING RUNTIME</span>
            <span className="text-cyan-400 font-extrabold">{progress}%</span>
          </div>
        </div>

        {/* Subtle Horizontal Divider Line */}
        <div className="w-full max-w-[320px] h-[1px] bg-white/5 mt-8 mb-5" />

        {/* Clean, high-end footer text with academic credit lines */}
        <div className="flex flex-col items-center justify-center space-y-1.5 text-[8.5px] font-mono tracking-wider text-[#475569] uppercase leading-none font-bold text-center">
          <div>KELOMPOK KKN 063</div>
          <div className="text-[#334155] text-[7.5px] font-medium font-sans">UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
