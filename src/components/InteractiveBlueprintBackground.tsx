import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import gsap from "gsap";

export default function InteractiveBlueprintBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  // High performance motion values for framer-motion cursor spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    // GSAP floating animation for secondary decorative luxury glow balls
    const ctx = gsap.context(() => {
      gsap.to(".glowing-orb-1", {
        x: "random(-40, 40)",
        y: "random(-40, 40)",
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".glowing-orb-2", {
        x: "random(-35, 35)",
        y: "random(-35, 35)",
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".glowing-orb-3", {
        x: "random(-30, 30)",
        y: "random(-30, 30)",
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      // Update framer-motion hardware accelerated values
      mouseX.set(localX);
      mouseY.set(localY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ctx.revert();
    };
  }, []);

  // Mask string template matching mouse position for active highlight spot
  const maskImage = useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, rgba(0,0,0,1), transparent 80%)`;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#020306]"
      id="global_mechanical_infinite_canvas"
    >
      {/* Deep Rich Obsidian Noir Base Shader */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030408] via-[#05070c] to-[#010204]" />
      
      {/* Subtle Radial Inward Shadow (Vignette) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)]" />

      {/* GSAP Managed Organic Glowing Ambient Emitters for Premium visual depth */}
      <div className="absolute top-[10%] left-[15%] w-[45%] h-[45%] rounded-full bg-cyan-500/[0.04] blur-[140px] glowing-orb-1" />
      <div className="absolute bottom-[15%] right-[15%] w-[45%] h-[45%] rounded-full bg-indigo-500/[0.035] blur-[150px] glowing-orb-2" />
      <div className="absolute top-[40%] right-[30%] w-[35%] h-[35%] rounded-full bg-emerald-500/[0.02] blur-[120px] glowing-orb-3" />

      {/* 1. Underlying Base Micro Dot-Matrix (Very clean & luxurious) */}
      <div 
        className="absolute inset-0 opacity-[0.065]"
        style={{ 
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* 2. Interactive Spotlight Accent Dot-Matrix Layer (Slightly brighter, cyan tint, shown on mouse hover) */}
      <motion.div 
        className="absolute inset-0 opacity-[0.25]" 
        style={{ 
          maskImage, 
          WebkitMaskImage: maskImage,
          backgroundImage: "radial-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* 3. Soft Interactive Spotlight Glow Ring at Mouse position */}
      <motion.div
        className="absolute inset-0 opacity-[0.12] mix-blend-screen"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          background: useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.05), transparent)`
        }}
      />
    </div>
  );
}
