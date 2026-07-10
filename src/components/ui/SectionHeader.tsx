import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge: string;
  title: string;
  highlightedTitle?: string;
  subtitle: string;
  icon?: LucideIcon;
  badgeColorClass?: string;
  titleClassName?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  highlightedTitle,
  subtitle,
  icon: Icon = Sparkles,
  badgeColorClass,
  titleClassName,
  className
}: SectionHeaderProps) {
  // Staggered intro animations
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "max-w-4xl mx-auto text-center px-4 mb-12 flex flex-col items-center select-none space-y-5 relative z-20",
        className
      )}
    >
      {/* Refined Tactile 3D Soft Embossed Badge */}
      <motion.div
        variants={itemVariants}
        className={cn(
          "inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#050814] text-cyan-400 font-mono text-[10px] font-black uppercase tracking-[0.25em] shadow-[4px_4px_12px_rgba(0,0,0,0.8),-2px_-2px_6px_rgba(255,255,255,0.01),inset_1px_1px_1px_rgba(255,255,255,0.03)] border border-white/5",
          badgeColorClass
        )}
      >
        <Icon className="w-3.5 h-3.5 animate-pulse shrink-0" />
        <span>{badge}</span>
      </motion.div>

      {/* Majestic Styled Typography - Consistent, Dense, and Premium */}
      <motion.h2
        variants={itemVariants}
        className={cn(
          "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.1] font-sans drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]",
          titleClassName
        )}
      >
        {title}{" "}
        {highlightedTitle && (
          <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-sky-250 to-white bg-clip-text text-transparent">
            {highlightedTitle}
          </span>
        )}
      </motion.h2>

      {/* Readable Elegant Subtitle Paragraph */}
      <motion.p
        variants={itemVariants}
        className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed font-sans font-medium tracking-normal"
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}
