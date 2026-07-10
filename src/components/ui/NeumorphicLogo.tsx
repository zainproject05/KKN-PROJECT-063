import React from "react";
import { motion } from "framer-motion";

interface NeumorphicLogoProps {
  className?: string;
  size?: number; // width and height in px
}

export function NeumorphicLogo({ className = "", size = 120 }: NeumorphicLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Outer 3D Beveled Neumorphic Ring */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0c0f17] to-[#040609] flex items-center justify-center"
        style={{
          boxShadow: "8px 8px 16px #010204, -8px -8px 16px rgba(255, 255, 255, 0.03), inset 1px 1px 0px rgba(255, 255, 255, 0.05)"
        }}
      >
        {/* Inset carved circle */}
        <div 
          className="w-[82%] h-[82%] rounded-full bg-[#030508] flex items-center justify-center relative overflow-hidden"
          style={{
            boxShadow: "inset 6px 6px 12px #010204, inset -6px -6px 12px rgba(255,255,255,0.02)"
          }}
        >
          {/* Animated Cyber Hologram lines inside the carved circle */}
          <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(18,180,229,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(18,180,229,0.15)_1px,transparent_1px)] bg-[size:10px_10px] animate-pulse" />
          
          {/* Cyan core ambient glow */}
          <div className="absolute w-[60%] h-[60%] bg-gradient-to-tr from-cyan-500/20 to-indigo-500/10 rounded-full blur-xl" />

          {/* Central 3D Raised Button/Medallion */}
          <motion.div 
            className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#0f1422] to-[#05070a] flex items-center justify-center relative cursor-pointer group"
            style={{
              boxShadow: "6px 6px 12px #010204, -4px -4px 10px rgba(255, 255, 255, 0.04)"
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Extremely crisp bezel edge */}
            <div className="absolute inset-[1px] rounded-full bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />

            {/* Glowing circular active rim indicator */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#neonGradient)"
                strokeWidth="1.5"
                strokeDasharray="276"
                strokeDashoffset="60"
                className="animate-[spin_8s_linear_infinite]"
              />
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Emblem: High-resolution stylized logo elements */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Custom 3D Glowing Shield / Star Icon */}
              <svg 
                className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] group-hover:scale-110 transition-transform duration-300" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                {/* Neumorphic 3D Star/Diamond geometry */}
                <polygon points="12,2 15.5,9.5 23,12 15.5,14.5 12,22 8.5,14.5 1,12 8.5,9.5" className="fill-cyan-500/10" />
                <circle cx="12" cy="12" r="3" className="fill-cyan-400 stroke-cyan-200" />
              </svg>
              
              <span className="text-[7.5px] text-indigo-300 font-mono font-extrabold tracking-[0.25em] uppercase block mt-1">
                G-063
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating external sleek orbit nodes for maximum high-end Sci-Fi luxury detail */}
      <div className="absolute w-[110%] h-[110%] border border-cyan-500/10 rounded-full pointer-events-none animate-[spin_24s_linear_infinite]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] scale-90" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_6px_#6366f1] scale-90" />
      </div>
    </div>
  );
}
