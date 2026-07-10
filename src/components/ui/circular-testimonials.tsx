"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

interface Testimonial {
  name: string;
  quote: string;
  src: string;
}

interface CircularTestimonialsProps {
  testimonials: Testimonial[];
}

export const CircularTestimonials = ({ testimonials }: CircularTestimonialsProps) => {
  const { t } = useLanguage();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedLecturer, setSelectedLecturer] = useState<Testimonial | null>(null);

  // Parse initials correctly for initials-based fallback
  const getInitials = (name: string) => {
    const cleanName = name
      .replace(/Prof\.|Drs\.|Dr\.|Ir\.|S\.T\.|M\.Eng\.|M\.T\.|Ph\.D\.|IPU|ASEAN|Eng|IPP|IPM|Sc/g, "")
      .replace(/,\s*/g, " ")
      .trim();
    
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "UMY";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleImageError = (src: string) => {
    setFailedImages((prev) => ({ ...prev, [src]: true }));
  };

  // Split testimonials into two rows
  const midIndex = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, midIndex);
  const row2 = testimonials.slice(midIndex);

  // Duplicate for seamless infinite scrolling
  const marqueeRow1 = [...row1, ...row1, ...row1];
  const marqueeRow2 = [...row2, ...row2, ...row2];

  return (
    <div className="w-full flex flex-col space-y-8 py-4 relative overflow-visible" id="testimonials-scrolling-marquee-deck">
      {/* Dynamic Keyframes Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-scroll-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.3333%, 0, 0);
          }
        }
        @keyframes marquee-scroll-right {
          0% {
            transform: translate3d(-33.3333%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-marquee-left {
          animation: marquee-scroll-left 42s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-scroll-right 45s linear infinite;
        }
        .marquee-container:hover .animate-marquee-left,
        .marquee-container:hover .animate-marquee-right {
          animation-play-state: paused;
        }
      ` }} />

      {/* Row 1: Scrolling Left */}
      <div className="w-full overflow-hidden marquee-container relative py-2" id="marquee-row-1">
        <div className="flex w-max space-x-6 animate-marquee-left px-4">
          {marqueeRow1.map((item, idx) => {
            const actsFailed = failedImages[item.src] || !item.src;
            return (
              <motion.div
                key={`row1-${idx}`}
                onClick={() => setSelectedLecturer(item)}
                className="w-[380px] sm:w-[420px] shrink-0 cursor-pointer p-6 rounded-[24px] bg-gradient-to-br from-[#0c0f1d] to-[#040508] shadow-[12px_12px_28px_rgba(0,0,0,0.85),-6px_-6px_20px_rgba(255,255,255,0.015),inset_1.5px_1.5px_3px_rgba(255,255,255,0.04),inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.95)] hover:shadow-[16px_16px_38px_rgba(0,0,0,0.95),-8px_-8px_24px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.95)] transition-all duration-300 hover:scale-[1.02] active:scale-98 select-none overflow-hidden relative group"
              >
                {/* Header info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a0c16] to-[#020305] shadow-[inset_2.5px_2.5px_5px_rgba(0,0,0,0.95),inset_-2.5px_-2.5px_5px_rgba(255,255,255,0.01)] p-0.5 flex items-center justify-center relative overflow-hidden shrink-0">
                    {!actsFailed ? (
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover object-top rounded-full filter brightness-105"
                        onError={() => handleImageError(item.src)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                        <span className="font-mono text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-indigo-300 to-white">
                          {getInitials(item.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[8px] font-mono font-extrabold tracking-[0.2em] text-cyan-400 uppercase block">
                      {t("lecturer.title_badge", "KKN MEMBER")}
                    </span>
                    <h4 className="text-xs sm:text-[13.5px] font-sans font-black text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors duration-300 truncate max-w-[280px]">
                      {item.name}
                    </h4>
                  </div>
                </div>

                {/* Quote body */}
                <div className="mt-4 text-left">
                  <p className="text-slate-300 font-sans italic text-[12.5px] leading-relaxed line-clamp-2">
                    "{item.quote}"
                  </p>
                </div>

                {/* Subtitle bottom */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">
                    GROUP 063
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-cyan-400/80 font-bold uppercase">
                    ACTIVE MEMBER
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Scrolling Right */}
      <div className="w-full overflow-hidden marquee-container relative py-2" id="marquee-row-2">
        <div className="flex w-max space-x-6 animate-marquee-right px-4">
          {marqueeRow2.map((item, idx) => {
            const actsFailed = failedImages[item.src] || !item.src;
            return (
              <motion.div
                key={`row2-${idx}`}
                onClick={() => setSelectedLecturer(item)}
                className="w-[380px] sm:w-[420px] shrink-0 cursor-pointer p-6 rounded-[24px] bg-gradient-to-br from-[#0c0f1d] to-[#040508] shadow-[12px_12px_28px_rgba(0,0,0,0.85),-6px_-6px_20px_rgba(255,255,255,0.015),inset_1.5px_1.5px_3px_rgba(255,255,255,0.04),inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.95)] hover:shadow-[16px_16px_38px_rgba(0,0,0,0.95),-8px_-8px_24px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.95)] transition-all duration-300 hover:scale-[1.02] active:scale-98 select-none overflow-hidden relative group"
              >
                {/* Header info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a0c16] to-[#020305] shadow-[inset_2.5px_2.5px_5px_rgba(0,0,0,0.95),inset_-2.5px_-2.5px_5px_rgba(255,255,255,0.01)] p-0.5 flex items-center justify-center relative overflow-hidden shrink-0">
                    {!actsFailed ? (
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover object-top rounded-full filter brightness-105"
                        onError={() => handleImageError(item.src)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                        <span className="font-mono text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-indigo-300 to-white">
                          {getInitials(item.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[8px] font-mono font-extrabold tracking-[0.2em] text-cyan-400 uppercase block">
                      {t("lecturer.title_badge", "KKN MEMBER")}
                    </span>
                    <h4 className="text-xs sm:text-[13.5px] font-sans font-black text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors duration-300 truncate max-w-[280px]">
                      {item.name}
                    </h4>
                  </div>
                </div>

                {/* Quote body */}
                <div className="mt-4 text-left">
                  <p className="text-slate-300 font-sans italic text-[12.5px] leading-relaxed line-clamp-2">
                    "{item.quote}"
                  </p>
                </div>

                {/* Subtitle bottom */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase">
                    GROUP 063
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-indigo-400 font-bold uppercase">
                    ACTIVE MEMBER
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FULL-SCREEN FOCUS OVERLAY CARD: Neumorphic Masterpiece Focus Showcase Modal */}
      <AnimatePresence>
        {selectedLecturer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010204]/92 backdrop-blur-md">
            {/* Modal dismiss click region */}
            <div className="absolute inset-0" onClick={() => setSelectedLecturer(null)} />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#121626] to-[#030407] shadow-[24px_24px_50px_rgba(0,0,0,0.95),-12px_-12px_30px_rgba(255,255,255,0.015),inset_2px_2px_4px_rgba(255,255,255,0.06),inset_-2px_-2px_4px_rgba(0,0,0,0.95)] relative overflow-hidden z-10 flex flex-col items-center text-center justify-between min-h-[400px] border-0"
            >
              <div className="absolute top-5 left-6 text-cyan-400 font-mono text-[9px] font-bold uppercase tracking-[0.22em] opacity-60">
                KKN PERSYARIKATAN 063
              </div>
              <div className="absolute top-5 right-6 text-slate-500 font-mono text-[9px] font-bold uppercase tracking-[0.22em] opacity-60">
                UMY 2026
              </div>

              {/* Large Neumorphic Avatar Centerpiece */}
              <div className="relative mt-8 mb-4 flex items-center justify-center">
                <div className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 blur-lg opacity-75" />
                
                {/* Bevel Bezel */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#06080e] to-[#020305] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.95),inset_-4px_-4px_10px_rgba(255,255,255,0.01)] p-1.5 flex items-center justify-center relative overflow-hidden select-none border-0">
                  {failedImages[selectedLecturer.src] || !selectedLecturer.src ? (
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center border-0">
                      <span className="font-mono text-xl font-black tracking-widest text-[#22d3ee]">
                        {getInitials(selectedLecturer.name)}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={selectedLecturer.src}
                      alt={selectedLecturer.name}
                      className="w-full h-full object-cover object-top select-none rounded-full"
                      onError={() => handleImageError(selectedLecturer.src)}
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              {/* Details and quote content */}
              <div className="space-y-4 w-full flex flex-col items-center px-2">
                <div className="flex items-center justify-center py-2 px-5 rounded-full bg-gradient-to-br from-[#0c0f1c] to-[#030406] shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.05),inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.85),2px_2px_6px_rgba(0,0,0,0.5)] border-0 text-[9.5px] font-mono font-bold uppercase tracking-[0.22em] text-cyan-400 select-none">
                  {t("lecturer.status", "KKN MEMBER")}
                </div>

                <h3 className="text-lg sm:text-xl font-sans font-black text-white tracking-tight text-center leading-snug">
                  {selectedLecturer.name}
                </h3>

                <div className="relative pt-2 px-4 max-h-[160px] overflow-y-auto">
                  <p className="text-slate-150 font-sans italic leading-relaxed sm:text-[18px] text-[15px] text-center font-normal">
                    "{selectedLecturer.quote}"
                  </p>
                </div>
              </div>

              {/* Back button */}
              <button
                onClick={() => setSelectedLecturer(null)}
                className="mt-8 px-8 py-3 rounded-xl bg-gradient-to-br from-[#101324] to-[#040508] shadow-[4px_4px_10px_rgba(0,0,0,0.7),-4px_-4px_10px_rgba(255,255,255,0.01),inset_2px_2px_4px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.85)] active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.95),inset_-2px_-2px_6px_rgba(255,255,255,0.01)] text-[9.5px] font-mono font-extrabold uppercase tracking-[0.22em] text-cyan-400 hover:text-white transition-all duration-300 border-0 active:scale-98 cursor-pointer"
              >
                {t("lecturer.dismiss", "CLOSE")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircularTestimonials;
