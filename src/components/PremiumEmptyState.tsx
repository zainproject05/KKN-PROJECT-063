import React from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { audio } from "../utils/audioService";

interface PremiumEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<any>;
  glowColor?: "cyan" | "indigo" | "rose" | "emerald" | "amber";
}

export function PremiumEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Sparkles,
  glowColor = "cyan"
}: PremiumEmptyStateProps) {
  
  const glowClasses = {
    cyan: "from-cyan-500/20 to-sky-500/10 border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)]",
    indigo: "from-indigo-500/20 to-purple-500/10 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)]",
    rose: "from-rose-500/20 to-pink-500/10 border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.15)]",
    emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)]",
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)]"
  };

  const textColors = {
    cyan: "text-cyan-400",
    indigo: "text-indigo-400",
    rose: "text-rose-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400"
  };

  const handleActionClick = () => {
    audio.playPrimaryClick();
    if (onAction) {
      onAction();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full max-w-xl mx-auto p-8 rounded-[2.5rem] bg-gradient-to-b ${glowClasses[glowColor]} border backdrop-blur-2xl text-center flex flex-col items-center justify-center space-y-6 overflow-hidden`}
    >
      {/* Background radial accent */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating animated 3D Icon Container */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative flex items-center justify-center w-20 h-20 rounded-[1.8rem] bg-slate-950/80 border border-white/[0.08] shadow-[5px_5px_15px_rgba(0,0,0,0.5),inset_2px_2px_4px_rgba(255,255,255,0.05)]"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${glowColor === "cyan" ? "from-cyan-400/20" : "from-indigo-400/20"} to-transparent rounded-[1.8rem] blur-sm`} />
        <Icon className={`w-9 h-9 ${textColors[glowColor]} filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]`} />
      </motion.div>

      {/* Text Content */}
      <div className="space-y-2.5 max-w-sm">
        <h3 className="font-sans font-black text-white text-base uppercase tracking-wider">
          {title}
        </h3>
        <p className="font-mono text-[11px] text-slate-450 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleActionClick}
          className={`px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-white/[0.1] hover:border-cyan-500/30 text-white font-sans font-black uppercase text-[10px] tracking-widest transition-all duration-300 shadow-[5px_5px_15px_rgba(0,0,0,0.4)] flex items-center gap-2 cursor-pointer group`}
        >
          <Plus size={13} className="text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
          <span>{actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
}
