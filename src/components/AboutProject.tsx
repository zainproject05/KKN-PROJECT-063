import React, { useState } from "react";
import { 
  GraduationCap, Award, ShieldCheck, Landmark, 
  MapPin, MessageSquare, Github, Instagram, Globe, BookOpen,
  Navigation, Star, ExternalLink, Heart, Shield, Workflow, Info
, Phone, Users, Copy} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Map, MapMarker, MarkerContent, MarkerLabel, MarkerPopup, MapControls, MapRoute } from "./ui/mapcn-marker-popup";
import { SectionHeader } from "./ui/SectionHeader";
import { useLanguage } from "../context/LanguageContext";
import { audio } from "../utils/audioService";
import ProgressTracker from "./ProgressTracker";
import KKNRoadmap from "./KKNRoadmap";

export default function AboutProject() {
  const { language, t } = useLanguage();
  const [subTab, setSubTab] = useState<"about" | "workflow" | "ethics">("about");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  // Precise coordinate of Gedung G6 Teknik Mesin UMY (Leader's Coordinate / Base camp)
  
  const klampokCoords = { lng: 110.4067402502076, lat: -8.034789215438893 };
  const umyCoords = { lng: 110.320347, lat: -7.807904 };
  
  const routeCoords: [number, number][] = [
    [110.320347, -7.807904], // UMY
    [110.329800, -7.887900], // Bantul
    [110.334000, -7.950000], // South Bantul
    [110.322800, -8.016300], // Parangtritis area
    [110.380000, -8.025000], // Purwosari approach
    [110.406740, -8.034789]  // Klampok
  ];

  const boundaryCoords: [number, number][] = [
    [110.398, -8.025],
    [110.415, -8.022],
    [110.418, -8.045],
    [110.400, -8.048],
    [110.395, -8.035],
    [110.398, -8.025] // close loop
  ];


  const handleSubTabChange = (targetTab: "about" | "workflow" | "ethics") => {
    audio.playTabSwitch();
    setSubTab(targetTab);
  };

  // Staggered intro animations
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.12,
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

  // Smooth Tab Switch Transitions with Staggered Entrance
  const tabContentVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.05,
        duration: 0.4, 
        ease: "easeOut" 
      } 
    },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.2, ease: "easeIn" } 
    },
  };

  const staggerChildVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    exit: { 
      opacity: 0, 
      y: -8, 
      transition: { duration: 0.2, ease: "easeIn" } 
    },
  };

  // Colored Hover glow configs based on subTab
  const getHoverConfig = () => {
    switch (subTab) {
      case "about":
        return {
          borderColor: "rgba(6, 182, 212, 0.45)", // Cyan
          glowColor: "rgba(6, 182, 212, 0.05)",
        };
      case "workflow":
        return {
          borderColor: "rgba(99, 102, 241, 0.45)", // Indigo
          glowColor: "rgba(99, 102, 241, 0.05)",
        };
      case "ethics":
        return {
          borderColor: "rgba(16, 185, 129, 0.45)", // Emerald
          glowColor: "rgba(16, 185, 129, 0.05)",
        };
      default:
        return {
          borderColor: "rgba(255, 255, 255, 0.15)",
          glowColor: "rgba(255, 255, 255, 0.01)",
        };
    }
  };

  const hoverStyle = getHoverConfig();

  return (
    <div className="space-y-8 py-4 text-left font-sans select-none" id="about_project_viewport">
      
      <SectionHeader
        badge={t("academic.research_badge", "KKN PROJECT OVERVIEW")}
        title={language === "en" ? "INTEGRATED KKN WORKSPACE" : "RUANG KERJA TERINTEGRASI"}
        highlightedTitle={language === "en" ? "AND GROUP PROFILE" : "DAN PROFIL KELOMPOK"}
        subtitle={t("academic.subtitle", "KKN Project is a centralized digital workspace developed for PersyarikatanMu-063 to support structured coordination, attendance management, financial administration, program planning, reporting, documentation, and collaborative execution throughout the KKN implementation period.")}
        icon={GraduationCap}
        className="mb-8"
      />

      {/* LUXURIOUS 3D NEUMORPHIC SUB-TAB REGULATION PANEL */}
      <div className="flex justify-center p-2 rounded-2xl bg-[#030409] border border-white/5 shadow-[inset_6px_6px_16px_rgba(0,0,0,0.95),_4px_4px_12px_rgba(255,255,255,0.01)]" id="neumorphic_subtab_dock">
        <div className="grid grid-cols-3 gap-2 w-full max-w-3xl">
          
          {/* SubTab 1: Group Profile */}
          <button
            onClick={() => handleSubTabChange("about")}
            className={`cursor-pointer relative py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
              subTab === "about"
                ? "bg-slate-900 border border-cyan-400/30 text-cyan-300 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.9),_2px_2px_4px_rgba(6,182,212,0.1)] font-extrabold translate-y-[1px]"
                : "border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02] shadow-[3px_3px_8px_rgba(0,0,0,0.4)]"
            }`}
          >
            <Info className={`w-4 h-4 ${subTab === "about" ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{t("about.tab1", "GROUP PROFILE")}</span>
            <span className="sm:hidden">{t("about.tab1", "PROFILE")}</span>
          </button>

          {/* SubTab 2: Workspace Scope */}
          <button
            onClick={() => handleSubTabChange("workflow")}
            className={`cursor-pointer relative py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
              subTab === "workflow"
                ? "bg-slate-900 border border-indigo-400/30 text-indigo-300 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.9),_2px_2px_4px_rgba(99,102,241,0.1)] font-extrabold translate-y-[1px]"
                : "border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02] shadow-[3px_3px_8px_rgba(0,0,0,0.4)]"
            }`}
          >
            <Workflow className={`w-4 h-4 ${subTab === "workflow" ? "text-indigo-400" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{t("about.tab2", "WORKSPACE SCOPE")}</span>
            <span className="sm:hidden">{t("about.tab2", "SCOPE")}</span>
          </button>

          {/* SubTab 3: Core Values */}
          <button
            onClick={() => handleSubTabChange("ethics")}
            className={`cursor-pointer relative py-3 px-4 rounded-xl text-[10px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
              subTab === "ethics"
                ? "bg-slate-900 border border-emerald-400/30 text-emerald-300 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.9),_2px_2px_4px_rgba(16,185,129,0.1)] font-extrabold translate-y-[1px]"
                : "border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02] shadow-[3px_3px_8px_rgba(0,0,0,0.4)]"
            }`}
          >
            <Shield className={`w-4 h-4 ${subTab === "ethics" ? "text-emerald-400" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{t("about.tab3", "CORE VALUES")}</span>
            <span className="sm:hidden">{t("about.tab3", "VALUES")}</span>
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC ACTIVE WORKSPACE TABS WITH SMOOTH TRANSITION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="space-y-8"
        >
          {/* TAB 1: GROUP PROFILE */}
          {subTab === "about" && (
            <div className="space-y-8">
              
              {/* Row 1: Equal-Sized Symmetrical Pair */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                
                {/* 1. KKN Group Profile Card */}
                <div className="flex flex-col h-full">
                  <motion.div 
                    variants={staggerChildVariants}
                    whileHover={{ 
                      y: -4, 
                      borderColor: hoverStyle.borderColor,
                      boxShadow: `0 20px 40px rgba(0,0,0,0.9), 0 0 25px ${hoverStyle.glowColor}`
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="nm-card p-8 flex flex-col justify-between h-full overflow-hidden relative border border-white/5"
                  >
                    
                    {/* Subtle cyber grid backlight */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-30 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="space-y-6 relative z-10">
                      {/* Creator Card header */}
                      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                        
                        {/* High-Contrast Neumorphic 3D Bezel Frame with Glassmorphism and Hover Glow */}
                        <div className="relative w-24 h-24 shrink-0 rounded-2xl p-1 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-cyan-400/50 shadow-[10px_10px_20px_rgba(0,0,0,0.8),_inset_2px_2px_4px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center overflow-hidden group transition-all duration-300">
                          {/* Premium radial glowing backdrop specifically for the transparent logo */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-slate-900/40 to-indigo-950/20 opacity-80" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] animate-pulse" />
                          <div className="w-[85%] h-[85%] rounded-xl overflow-hidden relative flex items-center justify-center p-1.5 z-10">
                            <img
                              src="https://res.cloudinary.com/df0razmlr/image/upload/v1783274113/LOGO_KKN_ccrsvs.png"
                              alt="PersyarikatanMu-063 Logo"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain select-none filter drop-shadow-[0_0_12px_rgba(6,182,212,0.3)] contrast-[105%] brightness-[110%] group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop";
                              }}
                            />
                          </div>
                          {/* 3D Hardware micro studs */}
                          <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-cyan-400/80 rounded-full blur-[0.5px]" />
                          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-indigo-500/80 rounded-full blur-[0.5px]" />
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500/60 rounded-full blur-[0.5px]" />
                        </div>
                        
                        <div className="text-center sm:text-left space-y-3 flex-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 rounded-lg text-[8.5px] font-mono uppercase tracking-widest font-black shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8),_1px_1px_2px_rgba(255,255,255,0.02)]">
                            <Award className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>{t("about.cert_researcher", "KKN GROUP PROFILE")}</span>
                          </span>

                          {/* Prominent Multi-Layer Raised 3D Name Panel */}
                          <div className="p-3.5 rounded-2xl bg-[#03050c] border border-cyan-500/20 shadow-[4px_4px_10px_rgba(0,0,0,0.9),_-2px_-2px_6px_rgba(255,255,255,0.01),inset_1px_1px_1px_rgba(255,255,255,0.05)] transform hover:-translate-y-0.5 transition-transform">
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-all font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-gradient-to-r from-cyan-400 via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                              PERSYARIKATANMU-063
                            </h3>
                          </div>

                          {/* Debossed Physical Channel for KKN role */}
                          <div className="px-3.5 py-2.5 rounded-xl bg-[#010103] border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.95)] flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase text-slate-500 font-extrabold tracking-widest">
                              {t("about.kkn_membership_label", "GROUP STATUS")}
                            </span>
                            <p className="text-[12px] text-cyan-400 font-extrabold font-mono tracking-widest uppercase bg-cyan-950/30 border border-cyan-500/20 px-2.5 py-0.5 rounded-md shadow-inner">
                              {t("about.kkn_membership_value", "ACTIVE WORKSPACE")}
                            </p>
                          </div>

                          {/* Premium Action Row for Direct Portal Access */}
                          <div className="pt-0.5">
                            <a
                              href="https://simkkn.umy.ac.id/"
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => audio.playClick()}
                              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/60 text-cyan-300 hover:text-white transition-all duration-300 shadow-[0_4px_15px_rgba(6,182,212,0.1)] group cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300 animate-pulse" />
                                <span className="font-extrabold text-[9px] uppercase tracking-wider">{t("about.simkkn_btn", "LAUNCH SIM KKN PORTAL")}</span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                                <ExternalLink className="w-3 h-3 text-cyan-400" />
                              </div>
                            </a>
                          </div>

                          <div className="pl-1">
                            <p className="text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                              {t("about.sub_campus_scholar", "KKN Persyarikatan Muhammadiyah  Universitas Muhammadiyah Yogyakarta")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Clean High-Level Credentials Grid */}
                      <div className="p-5.5 rounded-2xl bg-[#030409]/60 border border-white/5 shadow-[inset_6px_6px_16px_rgba(0,0,0,0.95)] grid grid-cols-1 gap-3 font-sans">
                        <span className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-1.5 mb-1">
                          {t("about.active_nodes", "GROUP INFORMATION")}
                        </span>
                        
                        <div className="flex items-center justify-between text-[11px] py-1 font-semibold border-b border-white/5">
                          <span className="text-slate-400">{t("about.sub_campus", "KKN Period")}</span>
                          <span className="text-white text-right font-bold uppercase font-sans tracking-wide">PersyarikatanMu-2026-Genap</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] py-1 font-semibold border-b border-white/5">
                          <span className="text-slate-400">{t("about.course_dept", "Total Members")}</span>
                          <span className="text-slate-202 text-right font-bold uppercase tracking-wide">10 Members</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] py-1 font-semibold border-b border-white/5">
                          <span className="text-slate-400">{t("about.academic_focus", "Main Focus")}</span>
                          <span className="text-slate-202 text-right font-bold tracking-wide">Coordination & Community Service</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] py-1 font-semibold">
                          <span className="text-slate-400">{t("about.system_coverage_label", "System Coverage")}</span>
                          <span className="text-cyan-400 text-right font-extrabold font-mono uppercase tracking-widest">ATTENDANCE, PROKER, FINANCE, REPORT</span>
                        </div>
                      </div>
                    </div>

                    {/* Secure Certification Footer */}
                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500 relative z-10">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest">
                        <Heart className="w-3 h-3 text-cyan-500 animate-pulse" />
                        <span>{t("about.crafted_by", "KKN PROJECT CORE SYSTEM")}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono tracking-widest font-black uppercase">
                        {t("about.online_status", "ACTIVE")}
                      </span>
                    </div>

                  </motion.div>
                </div>

                {/* 2. KKN Project Summary Synopsis Card */}
                <div className="flex flex-col h-full">
                  <motion.div 
                    variants={staggerChildVariants}
                    whileHover={{ 
                      y: -4, 
                      borderColor: hoverStyle.borderColor,
                      boxShadow: `0 20px 40px rgba(0,0,0,0.9), 0 0 25px ${hoverStyle.glowColor}`
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="nm-card p-8 flex flex-col justify-between h-full overflow-hidden relative border border-white/5"
                  >
                    
                    {/* Subtle hardware back plate */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="space-y-6 relative z-10">
                      {/* Title Section */}
                      <div className="space-y-2 pb-5 border-b border-white/5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[8.5px] font-mono tracking-widest font-black uppercase shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]">
                          {t("about.brand_core", "KKN PROJECT SUMMARY")}
                        </span>
                        <h3 className="text-xl font-extrabold text-white leading-snug uppercase tracking-tight font-display">
                          {t("about.thesis_title", "DIGITAL WORKSPACE FOR COORDINATION, ADMINISTRATION, AND COLLABORATIVE KKN IMPLEMENTATION")}
                        </h3>
                        <p className="text-[9.5px] text-indigo-405 font-mono uppercase tracking-widest font-black">
                          {t("about.thesis_subtitle", "PersyarikatanMu-063  Universitas Muhammadiyah Yogyakarta")}
                        </p>
                      </div>

                      {/* Core Statement Text Blocks */}
                      <div className="space-y-4 text-xs sm:text-[13px] text-slate-300 leading-relaxed font-semibold">
                        <p>
                          {t("about.abstract_part1", "KKN Project is designed as an integrated workspace that helps PersyarikatanMu-063 manage group activities in a more structured, transparent, and accountable way. The platform connects attendance tracking, work program planning, financial administration, reporting, documentation, and daily coordination in one digital environment.")}
                        </p>
                        <p className="text-slate-400 leading-relaxed text-xs font-normal">
                          {t("about.abstract_part2", "By centralizing operational information into one system, KKN Project supports stronger teamwork, clearer responsibilities, more effective collaboration, and better continuity in the implementation of community-oriented programs throughout the KKN period.")}
                        </p>
                      </div>
                    </div>

                    {/* Symmetrical Quality Credentials Indicators */}
                    <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-white/5 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#030409] border border-white/10 flex items-center justify-center shadow-md shrink-0">
                          <Landmark className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-[8px] text-slate-500 font-mono font-bold uppercase leading-none mb-0.5">{t("about.focus_label", "GROUP IDENTITY")}</p>
                          <p className="text-[10px] text-slate-200 font-extrabold uppercase leading-tight tracking-wide">{t("about.focus_value", "PERSYARIKATANMU-063")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 border-l border-white/5 pl-4">
                        <div className="w-8 h-8 rounded-lg bg-[#030409] border border-white/10 flex items-center justify-center shadow-md shrink-0">
                          <ShieldCheck className="w-4 h-4 text-cyan-450" />
                        </div>
                        <div className="text-left">
                          <p className="text-[8px] text-slate-500 font-mono font-bold uppercase leading-none mb-0.5">{t("about.integrity_label", "WORKSPACE STATUS")}</p>
                          <p className="text-[10px] text-slate-200 font-extrabold uppercase leading-tight tracking-wide">{t("about.integrity_value", "FULLY COORDINATED SYSTEM")}</p>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                </div>

              </div>

              {/* Row 2: FULL WIDTH MASSIVE SATELLITE MAP CORE */}
              <motion.div variants={staggerChildVariants} className="w-full" id="massive_satellite_map_row">
                <div className="nm-card p-6 w-full relative overflow-hidden transition-all duration-300 hover:border-cyan-400/30 group border border-white/5">
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <h4 className="font-mono text-[11px] font-black text-white uppercase tracking-widest flex items-center space-x-2.5">
                        <span className="flex h-2.5 w-2.5 items-center justify-center relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                        </span>
                        <span>{t("about.map_title", "KKN LOCATION COORDINATE HD SATELLITE MAP")}</span>
                      </h4>
                      <span className="text-[8.5px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        LOKASI KKN GROUP 063
                      </span>
                    </div>
                    
                    {/* Massive Satellite Map View */}
                    <div className="w-full h-[410px] rounded-2.5xl overflow-hidden border border-white/15 shadow-[inset_4px_4px_12px_rgba(0,0,0,0.95),0_10px_40px_rgba(0,0,0,0.85)] relative bg-[#010103]">
                      <Map 
                        center={[klampokCoords.lng, klampokCoords.lat]} 
                        zoom={14.0} 
                        pitch={0}
                        bearing={0}
                        className="w-full h-full"
                        styles={{
                          dark: {
                            version: 8,
                            sources: {
                              "satellite-tiles": {
                                type: "raster",
                                tiles: [
                                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                ],
                                tileSize: 256,
                                attribution: "Tiles &copy; Esri World Imagery"
                              }
                            },
                            layers: [
                              {
                                id: "satellite",
                                type: "raster",
                                source: "satellite-tiles",
                                minzoom: 0,
                                maxzoom: 17
                              }
                            ]
                          },
                          light: {
                            version: 8,
                            sources: {
                              "satellite-tiles": {
                                type: "raster",
                                tiles: [
                                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                ],
                                tileSize: 256,
                                attribution: "Tiles &copy; Esri World Imagery"
                              }
                            },
                            layers: [
                              {
                                id: "satellite",
                                type: "raster",
                                source: "satellite-tiles",
                                minzoom: 0,
                                maxzoom: 17
                              }
                            ]
                          }
                        }}
                      >
                        <MapControls showZoom={true} showLocate={true} showFullscreen={true} position="top-right" />
                        
                        <MapMarker longitude={klampokCoords.lng} latitude={klampokCoords.lat}>
                          <MarkerContent>
                            <div className="relative flex h-8 w-8 items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-400 border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.9)]"></span>
                            </div>
                            <MarkerLabel position="bottom" className="text-white font-black bg-slate-950/95 py-1 px-2.5 rounded-lg border border-white/10 text-[9px] font-mono uppercase tracking-widest whitespace-nowrap shadow-xl mt-1.5">
                              {t("about.map_label", "LOKASI KKN GROUP 063")}
                            </MarkerLabel>
                          </MarkerContent>
                          
                          <MarkerPopup className="w-64 p-0 border border-white/5 bg-[#0a0c10]/95 backdrop-blur-2xl overflow-hidden rounded-2xl shadow-[10px_10px_24px_rgba(0,0,0,0.95),-4px_-4px_16px_rgba(255,255,255,0.03)] text-left select-none ring-1 ring-white/5">
                            <div className="relative h-28 overflow-hidden">
                              <img 
                                src="https://images.unsplash.com/photo-1596404886617-640a232f05eb?w=320&h=180&fit=crop" 
                                alt="KKN Group 063" 
                                className="h-full w-full object-cover filter brightness-[80%] scale-102 hover:scale-105 transition-all duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/35" />
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md text-cyan-400 text-[8px] font-mono px-2 py-0.5 rounded-full font-black tracking-widest uppercase border border-white/5 shadow-md">
                                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                <span>KKN GROUP 063</span>
                              </div>
                            </div>
                            <div className="p-3.5 space-y-3 text-left bg-[#0c1018] relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                              <div className="flex items-center justify-between w-full rounded-xl bg-[#131822] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.06),_inset_-1px_-1px_3px_rgba(0,0,0,0.8),_3px_3px_6px_rgba(0,0,0,0.4)] border border-white/5 px-3 py-2.5">
                                <h4 className="text-cyan-300 text-[10px] font-black uppercase tracking-wider whitespace-nowrap truncate">
                                  KKN 063 <span className="text-slate-400 font-bold ml-1 tracking-normal">• GIRIPURWO</span>
                                </h4>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 filter drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]" />
                                  <span className="text-[9.5px] font-mono font-bold text-amber-500">5.0</span>
                                </div>
                              </div>
                              
                              <div>
                                <a 
                                  href="https://maps.app.goo.gl/CU7PhaYKFmLZMr1V7"
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => audio.playClick()}
                                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#1c222c] to-[#12161d] px-4 text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer shadow-[5px_5px_12px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(255,255,255,0.02),inset_0px_1px_1px_rgba(255,255,255,0.15)] uppercase tracking-widest active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.7),inset_-2px_-2px_6px_rgba(255,255,255,0.02)] active:scale-[0.98] border border-white/[0.08] whitespace-nowrap"
                                >
                                  <Navigation className="w-3 h-3 fill-current drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]" />
                                  <span className="drop-shadow-[0_0_2px_rgba(34,211,238,0.3)]">{t("about.directions", "GET DIRECTIONS")}</span>
                                </a>
                              </div>
                            </div>
                          </MarkerPopup>
                        </MapMarker>
                      </Map>
                    </div>
                  </div>

                  {/* Geographic Coordination metadata footer */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-4.5 pt-3.5 border-t border-white/5">
                    <span className="font-bold tracking-wider">COORDS -8.034789, 110.406740 | LOKASI KKN GROUP 063, GIRIPURWO</span>
                    <a 
                      href="https://maps.app.goo.gl/CU7PhaYKFmLZMr1V7" 
                      target="_blank"  
                      rel="noreferrer"
                      className="text-cyan-400 font-extrabold hover:underline flex items-center space-x-1 uppercase"
                    >
                      <span>{t("about.maps_link", "Google Maps Direct")}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>
              </motion.div>

              
              {/* Row 3: Support & Web Nodes */}
              <motion.div variants={staggerChildVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                
                {/* Unified Contact & Support Desk (Neumorphism 3D Style) */}
                <div className="relative rounded-3xl bg-[#0a0d14] border border-white/[0.03] p-6.5 overflow-hidden text-left flex flex-col justify-between shadow-[8px_8px_16px_rgba(0,0,0,0.8),-4px_-4px_12px_rgba(255,255,255,0.02),inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(0,0,0,0.5)]">
                  <div>
                    <h4 className="font-mono text-[10.5px] font-black text-cyan-400 uppercase tracking-widest flex items-center space-x-2 pb-3 border-b border-white/5 mb-5 shadow-[0_1px_0_rgba(0,0,0,0.5)]">
                      <MessageSquare className="w-4 h-4 text-cyan-400 filter drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]" />
                      <span>{t("about.contact_title", "PUSAT KOORDINASI & LAYANAN")}</span>
                    </h4>
                    
                    {/* Inner Contacts Section */}
                    <div className="space-y-4">
                      {/* PRM Contact */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11151f] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(0,0,0,0.8),2px_2px_5px_rgba(0,0,0,0.4)] border border-white/5 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0a0d14] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] border border-white/5 group-hover:border-emerald-500/30 transition-all">
                            <Phone className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Kontak PRM</p>
                            <p className="text-sm font-bold text-slate-200">Bapak Riyono</p>
                          </div>
                        </div>
                        <a 
                          href="https://wa.me/6285104572666?text=Assalamu%E2%80%99alaikum%20Bapak%20Riyono.%0A%0AMohon%20izin%20Pak%2C%20kami%20perwakilan%20dari%20kelompok%20KKN%20PersyarikatanMu-063%20yang%20berlokasi%20di%20Padukuhan%20Klampok%2C%20Kalurahan%20Giripurwo%2C%20Kapanewon%20Purwosari%2C%20Kabupaten%20Gunungkidul.%0A%0AIzin%20menghubungi%20Bapak%20untuk%20koordinasi%20awal%20terkait%20lokasi%2C%20kegiatan%2C%20dan%20kebutuhan%20masyarakat%20setempat.%0A%0ATerima%20kasih%2C%20Pak.%0AWassalamu%E2%80%99alaikum%20warahmatullahi%20wabarakatuh."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-4 rounded-xl bg-gradient-to-b from-[#18202b] to-[#0f141b] border border-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:text-emerald-300 hover:border-emerald-500/40 shadow-[3px_3px_6px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.02),inset_0_1px_1px_rgba(255,255,255,0.1)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-3.5 h-3.5 drop-shadow-[0_0_2px_rgba(16,185,129,0.3)]"><path fill="currentColor" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                          WhatsApp
                        </a>
                      </div>

                      {/* DPL Contact */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11151f] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),inset_-1px_-1px_3px_rgba(0,0,0,0.8),2px_2px_5px_rgba(0,0,0,0.4)] border border-white/5 group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0a0d14] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] border border-white/5 group-hover:border-indigo-400/30 transition-all">
                            <Users className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider mb-0.5">DPL KKN 063</p>
                            <p className="text-sm font-bold text-slate-200 truncate max-w-[140px]" title="Sunarmo, S.H., M.Hum., Ph.D.">Sunarmo, Ph.D.</p>
                          </div>
                        </div>
                        <a 
                          href="https://wa.me/628156852068?text=Assalamu%E2%80%99alaikum%20Bapak%20Sunarmo%2C%20S.H.%2C%20M.Hum.%2C%20Ph.D.%0A%0AMohon%20izin%2C%20kami%20perwakilan%20dari%20kelompok%20KKN%20PersyarikatanMu-063%20yang%20berlokasi%20di%20Padukuhan%20Klampok%2C%20Kalurahan%20Giripurwo%2C%20Kapanewon%20Purwosari%2C%20Kabupaten%20Gunungkidul.%0A%0AIzin%20menghubungi%20Bapak%20terkait%20koordinasi%20kegiatan%20KKN%20dan%20arahan%20pelaksanaan%20program%20kerja%20kelompok%20kami.%0A%0ATerima%20kasih%2C%20Pak.%0AWassalamu%E2%80%99alaikum%20warahmatullahi%20wabarakatuh."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-4 rounded-xl bg-gradient-to-b from-[#1a1e2c] to-[#12141f] border border-indigo-500/20 text-indigo-400 font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:text-indigo-300 hover:border-indigo-500/40 shadow-[3px_3px_6px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.02),inset_0_1px_1px_rgba(255,255,255,0.1)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-3.5 h-3.5 drop-shadow-[0_0_2px_rgba(99,102,241,0.3)]"><path fill="currentColor" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                          WhatsApp
                        </a>
                      </div>

                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-3">Admin & Developer Socials</p>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://wa.me/6281220010205"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/30 transition-all active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className="w-4 h-4"><path fill="currentColor" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd"/></svg>
                      </a>
                      <a
                        href="https://github.com/DaffazainTM23"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:border-white/30 transition-all active:scale-95"
                      >
                        <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                          <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="currentColor"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/daffazain_28/?__pwa=1#"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-pink-400 hover:text-pink-300 hover:border-pink-500/30 transition-all active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 264 264" className="w-4 h-4">
                          <path fill="currentColor" d="M132.345 33.973c-26.716 0-30.07.117-40.563.594-10.472.48-17.62 2.136-23.876 4.567-6.47 2.51-11.958 5.87-17.426 11.335-5.472 5.464-8.834 10.948-11.354 17.412-2.44 6.252-4.1 13.397-4.57 23.858-.47 10.486-.593 13.838-.593 40.535 0 26.697.119 30.037.594 40.522.482 10.465 2.14 17.609 4.57 23.859 2.515 6.465 5.876 11.95 11.346 17.414 5.466 5.468 10.955 8.834 17.42 11.345 6.26 2.431 13.41 4.088 23.881 4.567 10.493.477 13.844.594 40.559.594 26.719 0 30.061-.117 40.555-.594 10.472-.48 17.63-2.136 23.888-4.567 6.468-2.51 11.948-5.877 17.414-11.345 5.472-5.464 8.834-10.949 11.354-17.412 2.419-6.252 4.079-13.398 4.57-23.858.472-10.486.595-13.828.595-40.525s-.123-30.047-.594-40.533c-.492-10.465-2.152-17.608-4.57-23.858-2.521-6.466-5.883-11.95-11.355-17.414-5.472-5.468-10.944-8.827-17.42-11.335-6.271-2.431-13.424-4.088-23.897-4.567-10.493-.477-13.834-.594-40.558-.594zm-8.825 17.715c2.62-.004 5.542 0 8.825 0 26.266 0 29.38.094 39.752.565 9.591.438 14.797 2.04 18.264 3.385 4.591 1.782 7.864 3.912 11.305 7.352 3.443 3.44 5.575 6.717 7.362 11.305 1.346 3.46 2.951 8.663 3.388 18.247.47 10.363.573 13.475.573 39.71 0 26.233-.102 29.346-.573 39.709-.44 9.584-2.042 14.786-3.388 18.247-1.783 4.587-3.919 7.854-7.362 11.292-3.443 3.441-6.712 5.57-11.305 7.352-3.463 1.352-8.673 2.95-18.264 3.388-10.37.47-13.486.573-39.752.573-26.268 0-29.38-.102-39.751-.573-9.592-.443-14.797-2.044-18.267-3.39-4.59-1.781-7.87-3.911-11.313-7.352-3.443-3.44-5.574-6.709-7.362-11.298-1.346-3.461-2.95-8.663-3.387-18.247-.472-10.363-.566-13.476-.566-39.726s.094-29.347.566-39.71c.438-9.584 2.04-14.786 3.387-18.25 1.783-4.588 3.919-7.865 7.362-11.305 3.443-3.441 6.722-5.57 11.313-7.357 3.468-1.351 8.675-2.949 18.267-3.389 9.075-.41 12.592-.532 30.926-.553zm61.337 16.322c-6.518 0-11.805 5.277-11.805 11.792 0 6.512 5.287 11.796 11.805 11.796 6.517 0 11.804-5.284 11.804-11.796 0-6.513-5.287-11.796-11.805-11.796zm-52.512 13.782c-27.9 0-50.519 22.603-50.519 50.482 0 27.879 22.62 50.471 50.52 50.471s50.51-22.592 50.51-50.471c0-27.879-22.613-50.482-50.513-50.482zm0 17.715c18.11 0 32.792 14.67 32.792 32.767 0 18.096-14.683 32.767-32.792 32.767-18.11 0-32.791-14.671-32.791-32.767 0-18.098 14.68-32.767 32.791-32.767z"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.tiktok.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-xl bg-[#0c1017] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.6),3px_3px_8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-[#25f4ee] hover:text-[#1ec4be] hover:border-[#25f4ee]/30 transition-all active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" viewBox="0 0 352.28 398.67" className="w-4 h-4">
                          <defs><style>{`.cls-2-tk{fill:#fe2c55}.cls-3-tk{fill:currentColor}`}</style></defs>
                          <g id="Layer_1-2">
                            <path d="M137.17 156.98v-15.56c-5.34-.73-10.76-1.18-16.29-1.18C54.23 140.24 0 194.47 0 261.13c0 40.9 20.43 77.09 51.61 98.97-20.12-21.6-32.46-50.53-32.46-82.31 0-65.7 52.69-119.28 118.03-120.81Z" className="cls-3-tk"/>
                            <path d="M140.02 333c29.74 0 54-23.66 55.1-53.13l.11-263.2h48.08c-1-5.41-1.55-10.97-1.55-16.67h-65.67l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-9.24 0-17.95-2.31-25.61-6.34C105.3 323.9 121.6 333 140.02 333ZM333.13 106V91.37c-18.34 0-35.43-5.45-49.76-14.8 12.76 14.65 30.09 25.22 49.76 29.43Z" className="cls-3-tk"/>
                            <path d="M283.38 76.57c-13.98-16.05-22.47-37-22.47-59.91h-17.59c4.63 25.02 19.48 46.49 40.06 59.91ZM120.88 205.92c-30.44 0-55.21 24.77-55.21 55.21 0 21.2 12.03 39.62 29.6 48.86-6.55-9.08-10.45-20.18-10.45-32.2 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-67.05c-5.34-.73-10.76-1.18-16.29-1.18-.96 0-1.9.05-2.85.07v51.49c-5.16-1.61-10.61-2.55-16.29-2.55Z" className="cls-2-tk"/>
                            <path d="M333.13 106v51.04c-34.05 0-65.61-10.89-91.37-29.38v133.47c0 66.66-54.23 120.88-120.88 120.88-25.76 0-49.64-8.12-69.28-21.91 22.08 23.71 53.54 38.57 88.42 38.57 66.66 0 120.88-54.23 120.88-120.88V144.33c25.76 18.49 57.32 29.38 91.37 29.38v-65.68c-6.57 0-12.97-.71-19.14-2.03Z" className="cls-2-tk"/>
                            <path d="M241.76 261.13V127.66c25.76 18.49 57.32 29.38 91.37 29.38V106c-19.67-4.21-37-14.77-49.76-29.43-20.58-13.42-35.43-34.88-40.06-59.91h-48.08l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-18.42 0-34.72-9.1-44.75-23.01-17.57-9.25-29.6-27.67-29.6-48.86 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-51.49C71.83 158.5 19.14 212.08 19.14 277.78c0 31.78 12.34 60.71 32.46 82.31C71.23 373.87 95.12 382 120.88 382c66.65 0 120.88-54.23 120.88-120.88Z" fill="#fff"/>
                          </g>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* University Web Resources */}
                <div className="relative rounded-3xl bg-gradient-to-b from-[#090b16]/95 to-[#04050a]/98 border border-white/10 p-6.5 shadow-[12px_12px_36px_rgba(0,0,0,0.95)] overflow-hidden text-left flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-[10.5px] font-black text-slate-300 uppercase tracking-widest flex items-center space-x-2 pb-3 border-b border-white/5 mb-4">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>{t("about.institutional_nodes", "UNIVERSITAS MUHAMMADIYAH NODES")}</span>
                    </h4>

                     <div className="flex flex-col space-y-2.5">
                      {/* SIM KKN UMY Portal */}
                      <a
                        href="https://simkkn.umy.ac.id/"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => audio.playClick()}
                        className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 transition-all duration-300 text-xs font-mono text-cyan-300 hover:text-white cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.1)]"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Landmark className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span className="font-extrabold uppercase tracking-wide text-[10px]">{t("about.simkkn_portal", "SIM KKN UMY Portal")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 uppercase tracking-widest font-black">PORTAL</span>
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                        </div>
                      </a>

                      {/* UMY Website */}
                      <a
                        href="https://www.umy.ac.id/"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => audio.playClick()}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/5 hover:border-indigo-400/35 hover:bg-indigo-950/20 transition-all text-xs font-mono text-slate-300 hover:text-white cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Globe className="w-4 h-4 text-indigo-400" />
                          <span className="font-extrabold uppercase tracking-wide text-[10px]">{t("about.umy_website", "Official UMY Website")}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </a>

                      {/* KRS portal */}
                      <a
                        href="https://krs.umy.ac.id/Beranda.aspx"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => audio.playClick()}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/5 hover:border-indigo-400/35 hover:bg-indigo-950/20 transition-all text-xs font-mono text-slate-300 hover:text-white cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center space-x-2.5">
                          <BookOpen className="w-4 h-4 text-amber-500" />
                          <span className="font-extrabold uppercase tracking-wide text-[10px]">{t("about.krs_portal", "Academic KRS Portal")}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[8.5px] text-slate-600 mt-4.5 pt-2 tracking-widest border-t border-white/5 uppercase">
                    <span>EST. 1981 YOGYAKARTA</span>
                    <span>SECURED CREDENTIALS</span>
                  </div>
                </div>
              </motion.div>

            </div>
          )}

          {/* TAB 2: WORKSPACE SCOPE */}
          {subTab === "workflow" && (
            <div className="space-y-8">
              <motion.div variants={staggerChildVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* Tab 2 Left Card */}
              <div className="flex flex-col h-full">
                <motion.div 
                  whileHover={{ 
                    y: -4, 
                    borderColor: hoverStyle.borderColor,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.95), 0 0 25px ${hoverStyle.glowColor}`
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="nm-card p-8 flex flex-col justify-between h-full overflow-hidden relative border border-white/5"
                >
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                      
                      {/* High-Contrast Neumorphic 3D Bezel Frame with glowing Workflow icon */}
                      <div className="relative w-24 h-24 shrink-0 rounded-2xl p-1 bg-[#020305] border border-indigo-400/30 shadow-[10px_10px_20px_rgba(0,0,0,0.9),_inset_4px_4px_8px_rgba(0,0,0,0.95)] flex items-center justify-center">
                        <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-indigo-950/40 to-slate-900">
                          <Workflow className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
                        </div>
                        {/* 3D Hardware micro studs */}
                        <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-indigo-400/80 rounded-full blur-[0.5px]" />
                        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-cyan-500/80 rounded-full blur-[0.5px]" />
                      </div>

                      <div className="text-center sm:text-left space-y-3 flex-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 rounded-lg text-[8.5px] font-mono uppercase tracking-widest font-black shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]">
                          <Workflow className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          <span>{t("about.tab2.left_badge", "WORKSPACE OVERVIEW")}</span>
                        </span>

                        <div className="p-3.5 rounded-2xl bg-[#03050c] border border-indigo-500/20 shadow-[4px_4px_10px_rgba(0,0,0,0.9),_inset_1px_1px_1px_rgba(255,255,255,0.05)]">
                          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-all font-sans bg-gradient-to-r from-indigo-400 via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                            {t("about.tab2.left_title", "KKN PROJECT MODULES")}
                          </h3>
                        </div>

                        <div className="px-3.5 py-2.5 rounded-xl bg-[#010103] border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.95)] flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase text-slate-500 font-extrabold tracking-widest">
                            {t("about.tab2.left_strip_lbl", "SYSTEM STATUS")}
                          </span>
                          <p className="text-[12px] text-indigo-405 font-extrabold font-mono tracking-widest uppercase bg-indigo-950/30 border border-indigo-500/20 px-2.5 py-0.5 rounded-md shadow-inner">
                            {t("about.tab2.left_strip_val", "INTEGRATED MODULES")}
                          </p>
                        </div>

                        <div className="pl-1">
                          <p className="text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                            {t("about.tab2.left_subline", "One connected workspace for all essential KKN operations")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Table representing System Coverage */}
                    <div className="p-5.5 rounded-2xl bg-[#030409]/60 border border-white/5 shadow-[inset_6px_6px_16px_rgba(0,0,0,0.95)] grid grid-cols-1 gap-3 font-sans">
                      <span className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-1.5 mb-1">
                        {t("about.tab2.left_table_title", "SYSTEM COVERAGE")}
                      </span>
                      
                      <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">Attendance</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab2.row1_val", "Meetings, field activities, and member participation")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">Programs</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab2.row2_val", "Planning, progress tracking, and follow-up actions")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">Finance</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab2.row3_val", "Cash flow, activity expenses, and financial documentation")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] py-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">Reports</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab2.row4_val", "Daily notes, weekly summaries, and structured reporting")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500 relative z-10">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest">
                      <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t("about.tab2.left_footer", "KKN PROJECT MODULE CORE")}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono tracking-widest font-black uppercase">
                      ACTIVE
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Tab 2 Right Card */}
              <div className="flex flex-col h-full">
                <motion.div 
                  whileHover={{ 
                    y: -4, 
                    borderColor: hoverStyle.borderColor,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.95), 0 0 25px ${hoverStyle.glowColor}`
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="nm-card p-8 flex flex-col justify-between h-full overflow-hidden relative border border-white/5"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2 pb-5 border-b border-white/5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[8.5px] font-mono tracking-widest font-black uppercase">
                        {t("about.tab2.right_badge", "WORKSPACE SCOPE")}
                      </span>
                      <h3 className="text-xl font-extrabold text-white leading-snug uppercase tracking-tight font-display">
                        {t("about.tab2.right_title", "ONE PLATFORM FOR MULTIPLE OPERATIONAL NEEDS")}
                      </h3>
                      <p className="text-[9.5px] text-indigo-405 font-mono uppercase tracking-widest font-black">
                        {t("about.tab2.right_subtitle", "Integrated system for structured KKN execution")}
                      </p>
                    </div>

                    <div className="space-y-4 text-xs sm:text-[13px] text-slate-300 leading-relaxed font-semibold">
                      <p>
                        {t("about.tab2.right_p1", "KKN Project provides a centralized workspace where all key KKN functions can be managed in a more coordinated and accessible way. The system helps members monitor attendance, organize work programs, manage finance, prepare reports, and maintain documentation without relying on scattered manual records.")}
                      </p>
                      <p className="text-slate-400 leading-relaxed text-xs font-normal">
                        {t("about.tab2.right_p2", "With a connected digital workflow, PersyarikatanMu-063 can reduce administrative fragmentation, improve internal communication, and strengthen the continuity of each activity from planning to reporting.")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#030409] border border-white/10 flex items-center justify-center shadow-md shrink-0">
                        <Workflow className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] text-slate-500 font-mono font-bold uppercase leading-none mb-0.5">{t("about.tab2.right_lbl_left", "MODULE COVERAGE")}</p>
                        <p className="text-[10px] text-slate-202 font-extrabold uppercase leading-tight tracking-wide">{t("about.tab2.right_val_left", "ATTENDANCE, PROKER, FINANCE")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-l border-white/5 pl-4">
                      <div className="w-8 h-8 rounded-lg bg-[#030409] border border-white/10 flex items-center justify-center shadow-md shrink-0">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] text-slate-500 font-mono font-bold uppercase leading-none mb-0.5">{t("about.tab2.right_lbl_right", "OPERATIONAL VALUE")}</p>
                        <p className="text-[10px] text-slate-202 font-extrabold uppercase leading-tight tracking-wide">{t("about.tab2.right_val_right", "STRUCTURED AND ACCOUNTABLE")}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

            </motion.div>

            {/* Progress Tracker Section */}
            <ProgressTracker />

            {/* KKN Roadmap Section */}
            <KKNRoadmap />

            </div>
          )}

          {/* TAB 3: CORE VALUES */}
          {subTab === "ethics" && (
            <motion.div variants={staggerChildVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* Tab 3 Left Card */}
              <div className="flex flex-col h-full">
                <motion.div 
                  whileHover={{ 
                    y: -4, 
                    borderColor: hoverStyle.borderColor,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.95), 0 0 25px ${hoverStyle.glowColor}`
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="nm-card p-8 flex flex-col justify-between h-full overflow-hidden relative border border-white/5"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-25 pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                      
                      {/* High-Contrast Neumorphic 3D Bezel Frame with glowing emerald ShieldCheck icon */}
                      <div className="relative w-24 h-24 shrink-0 rounded-2xl p-1 bg-[#020305] border border-emerald-400/30 shadow-[10px_10px_20px_rgba(0,0,0,0.9),_inset_4px_4px_8px_rgba(0,0,0,0.95)] flex items-center justify-center">
                        <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center bg-gradient-to-br from-emerald-950/40 to-slate-900">
                          <ShieldCheck className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                        </div>
                        {/* 3D Hardware micro studs */}
                        <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-emerald-400/80 rounded-full blur-[0.5px]" />
                        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-indigo-500/80 rounded-full blur-[0.5px]" />
                      </div>

                      <div className="text-center sm:text-left space-y-3 flex-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 rounded-lg text-[8.5px] font-mono uppercase tracking-widest font-black shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]">
                          <Shield className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>{t("about.tab3.left_badge", "TEAM VALUES")}</span>
                        </span>

                        <div className="p-3.5 rounded-2xl bg-[#03050c] border border-emerald-500/20 shadow-[4px_4px_10px_rgba(0,0,0,0.9),_inset_1px_1px_1px_rgba(255,255,255,0.05)]">
                          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-all font-sans bg-gradient-to-r from-emerald-400 via-slate-100 to-teal-300 bg-clip-text text-transparent">
                            {t("about.tab3.left_title", "PERSYARIKATANMU-063")}
                          </h3>
                        </div>

                        <div className="px-3.5 py-2.5 rounded-xl bg-[#010103] border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.95)] flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase text-slate-500 font-extrabold tracking-widest">
                            {t("about.tab3.left_strip_lbl", "GROUP CHARACTER")}
                          </span>
                          <p className="text-[12px] text-emerald-400 font-extrabold font-mono tracking-widest uppercase bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-0.5 rounded-md shadow-inner">
                            {t("about.tab3.left_strip_val", "SOLID, COMMIT, RESPONSIBLE")}
                          </p>
                        </div>

                        <div className="pl-1">
                          <p className="text-[9.5px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                            {t("about.tab3.left_subline", "Shared principles that guide the team throughout the KKN journey")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Table representing Core Principles */}
                    <div className="p-5.5 rounded-2xl bg-[#030409]/60 border border-white/5 shadow-[inset_6px_6px_16px_rgba(0,0,0,0.95)] grid grid-cols-1 gap-3 font-sans">
                      <span className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-1.5 mb-1">
                        {t("about.tab3.left_table_title", "CORE PRINCIPLES")}
                      </span>
                      
                      <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">{t("about.tab3.row1_lbl", "Solidarity")}</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab3.row1_val", "Working together with mutual support and shared purpose")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">{t("about.tab3.row2_lbl", "Commitment")}</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab3.row2_val", "Carrying out responsibilities with discipline and consistency")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">{t("about.tab3.row3_lbl", "Responsibility")}</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab3.row3_val", "Ensuring every task and contribution is accountable")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] py-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9.5px] shrink-0 w-24">{t("about.tab3.row4_lbl", "Impact")}</span>
                        <span className="text-white text-right font-semibold font-sans">{t("about.tab3.row4_val", "Creating meaningful value for the community")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500 relative z-10">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t("about.tab3.left_footer", "GROUP VALUE SYSTEM")}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono tracking-widest font-black uppercase">
                      ACTIVE
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Tab 3 Right Card */}
              <div className="flex flex-col h-full">
                <motion.div 
                  whileHover={{ 
                    y: -4, 
                    borderColor: hoverStyle.borderColor,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.95), 0 0 25px ${hoverStyle.glowColor}`
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="nm-card p-8 flex flex-col justify-between h-full overflow-hidden relative border border-white/5"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2 pb-5 border-b border-white/5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[8.5px] font-mono tracking-widest font-black uppercase">
                        {t("about.tab3.right_badge", "CORE VALUES")}
                      </span>
                      <h3 className="text-xl font-extrabold text-white leading-snug uppercase tracking-tight font-display">
                        {t("about.tab3.right_title", "SOLIDARITY, COMMITMENT, AND RESPONSIBLE ACTION")}
                      </h3>
                      <p className="text-[9.5px] text-emerald-400 font-mono uppercase tracking-widest font-black">
                        {t("about.tab3.right_subtitle", "Foundational principles of PersyarikatanMu-063")}
                      </p>
                    </div>

                    <div className="space-y-4 text-xs sm:text-[13px] text-slate-300 leading-relaxed font-semibold">
                      <p>
                        {t("about.tab3.right_p1", "The strength of PersyarikatanMu-063 lies not only in shared tasks, but in the spirit of solidarity that connects every member. KKN Project reflects this spirit by providing a common space where responsibilities, ideas, and progress can be managed collectively.")}
                      </p>
                      <p className="text-slate-400 leading-relaxed text-xs font-normal">
                        {t("about.tab3.right_p2", "Commitment and responsibility remain central to every activity carried out by the team. Through disciplined coordination and accountable implementation, PersyarikatanMu-063 seeks to create meaningful community impact while strengthening collaboration and organizational maturity.")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#030409] border border-white/10 flex items-center justify-center shadow-md shrink-0">
                        <Heart className="w-4 h-4 text-emerald-450" />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] text-slate-500 font-mono font-bold uppercase leading-none mb-0.5">{t("about.tab3.right_lbl_left", "TEAM FOUNDATION")}</p>
                        <p className="text-[10px] text-slate-202 font-extrabold uppercase leading-tight tracking-wide">{t("about.tab3.right_val_left", "SOLIDARITY AND COMMITMENT")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-l border-white/5 pl-4">
                      <div className="w-8 h-8 rounded-lg bg-[#030409] border border-white/10 flex items-center justify-center shadow-md shrink-0">
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] text-slate-500 font-mono font-bold uppercase leading-none mb-0.5">{t("about.tab3.right_lbl_right", "MISSION ORIENTATION")}</p>
                        <p className="text-[10px] text-slate-202 font-extrabold uppercase leading-tight tracking-wide">{t("about.tab3.right_val_right", "COMMUNITY IMPACT")}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Premium 3D Glowing Cyber Watermark Plate moved here as the standalone page footer */}
      <motion.div 
        id="academic_footer_banner"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ 
          scale: 1.01,
          borderColor: "rgba(34, 211, 238, 0.4)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.95), 0 0 40px rgba(6, 182, 212, 0.25), inset 0 1px 1px rgba(255,255,255,0.1)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#03050b] via-[#070b1a] to-[#03050b] border border-white/[0.06] p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.03)] select-none text-center md:text-left cursor-default group mt-12"
      >
        {/* Sleek moving light sweep effect at the top */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-indigo-500/40 pointer-events-none" />
        <div className="absolute -inset-y-12 w-1/3 bg-white/[0.01] blur-3xl transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out pointer-events-none" />
        
        {/* Left Segment: Course Title */}
        <div className="flex-1 flex justify-center md:justify-start items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />
          <span className="font-mono font-black text-[10px] md:text-xs tracking-widest bg-gradient-to-r from-indigo-200 via-white to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
            {t("footer.course", "KKN PROJECT DIGITAL WORKSPACE")}
          </span>
        </div>

        {/* Dynamic Glowing 3D Laser Separation Beam */}
        <span className="text-cyan-400/80 font-mono text-[11px] font-black hidden md:block select-none animate-pulse drop-shadow-[0_0_6px_rgba(34,211,238,0.7)] px-2">
          ||
        </span>

        {/* Middle Segment: Institution */}
        <div className="flex-1 flex justify-center items-center">
          <span className="font-mono font-extrabold text-[10px] md:text-xs tracking-wider text-slate-100 hover:text-cyan-300 transition-colors duration-300 drop-shadow-sm uppercase">
            {t("footer.institution", "UNIVERSITAS MUHAMMADIYAH YOGYAKARTA")}
          </span>
        </div>

        {/* Dynamic Glowing 3D Laser Separation Beam */}
        <span className="text-indigo-400/85 font-mono text-[11px] font-black hidden md:block select-none animate-pulse drop-shadow-[0_0_6px_rgba(99,102,241,0.7)] px-2">
          ||
        </span>

        {/* Right Segment: Creator Signature */}
        <div className="flex-1 flex justify-center md:justify-end items-center">
          <span className="font-mono font-black text-[11px] md:text-sm tracking-widest bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.4)] relative">
            {t("footer.creator", "KKN BERSAMA")}
            <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-400/10 via-cyan-400 to-indigo-400/10 scale-x-50 group-hover:scale-x-100 transition-transform duration-500" />
          </span>
        </div>
      </motion.div>

    </div>
  );
}
