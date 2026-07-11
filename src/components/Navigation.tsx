"use client";

import React, { useState } from "react";
import { ActiveTab } from "../types";
import { 
  Home, 
  Layers, 
  Users, 
  Camera, 
  Award, 
  Menu, 
  X, 
  Sparkles,
  CheckCircle2, 
  Shield, 
  Calendar, 
  ClipboardCheck, 
  FolderGit2, 
  ListTodo, 
  Wallet, 
  FileSpreadsheet, 
  FolderOpen, 
  Megaphone, 
  MessageSquareCode, 
  DownloadCloud, 
  UserSquare2, 
  Settings2,
  LogOut
} from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { audio } from "../utils/audioService";

export function ModernPremiumLogo({ size = 10 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center select-none shrink-0" style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
      <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md opacity-75 animate-pulse" />
      <img
        src="https://res.cloudinary.com/df0razmlr/image/upload/v1783274113/LOGO_KKN_ccrsvs.png"
        alt="KKN PROJECT"
        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeSection: string;
  datasetLoaded: boolean;
  modelTrained: boolean;
  isLoggedIn: boolean;
  currentUser: { name: string; group: string; role: string } | null;
  onLogout: () => void;
}

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  activeSection, 
  datasetLoaded, 
  modelTrained,
  isLoggedIn,
  currentUser,
  onLogout
}: NavigationProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleItemClick = (id: string) => {
    if (id === "absensi") {
      window.location.href = "/absensi";
      return;
    }
    if (id === "about-project") {
      setActiveTab("about");
      return;
    }
    if (id === "home") {
      setActiveTab("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (activeTab === "home") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      sessionStorage.setItem("pendingScrollSection", id);
      setActiveTab("home");
    }
  };

  // Public Landing Page navigation items
  const publicItems = [
    { id: "home", name: language === "en" ? "Home" : "Beranda", icon: Home },
    { id: "absensi", name: language === "en" ? "Attendance" : "Absensi", icon: CheckCircle2 },
    { id: "kkn-workspace", name: language === "en" ? "KKN Workspace" : "Ruang KKN", icon: Layers },
    { id: "team-quotes", name: language === "en" ? "Team Quotes" : "Komentar Tim", icon: Users },
    { id: "gallery", name: language === "en" ? "Gallery" : "Galeri", icon: Camera },
    { id: "about-project", name: language === "en" ? "About Project" : "Tentang Proyek", icon: Award }
  ];

  // Authenticated workspace navigation modules
  const authenticatedModules = [
    { id: "dashboard", name: "Dashboard", icon: ClipboardCheck },
    { id: "attendance", name: "Attendance", icon: CheckCircle2 },
    { id: "programs", name: "Programs", icon: FolderGit2 },
    { id: "tasks", name: "Tasks", icon: ListTodo },
    { id: "finance", name: "Finance", icon: Wallet },
    { id: "reports", name: "Reports", icon: FileSpreadsheet },
    { id: "documents", name: "Documents", icon: FolderOpen },
    { id: "announcements", name: "Announcements", icon: Megaphone },
    { id: "agenda", name: "Agenda", icon: Calendar },
    { id: "whatsapp-templates", name: "WhatsApp Templates", icon: MessageSquareCode },
    { id: "report-templates", name: "Report Templates", icon: DownloadCloud },
    { id: "members", name: "Members", icon: UserSquare2 },
    { id: "settings", name: "Settings", icon: Settings2 }
  ];

  return (
    <div className="sticky top-0 left-0 right-0 z-50 w-full flex flex-col select-none print-hidden">
      <nav 
        className="w-full bg-[#050608]/95 backdrop-blur-3xl border-b border-white/10 px-6 py-4 flex items-center justify-between transition-all duration-300 shadow-[0_12px_45px_rgba(0,0,0,0.98),inset_0_1px_1px_rgba(255,255,255,0.08)]" 
        id="main_navigation_premium_integrated"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 blur-[0.5px] opacity-80" />

        {/* Pinned Left: Logo Section */}
        <div 
          className="flex items-center space-x-3.5 cursor-pointer shrink-0" 
          onClick={() => setActiveTab("home")} 
          id="nav_logo"
        >
          <ModernPremiumLogo size={11} />
          <div className="text-left flex flex-col justify-center h-11 space-y-1">
            <span className="font-sans font-black text-sm sm:text-[15px] text-white tracking-wider block uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent leading-none">
              KKN PROJECT
            </span>
            <span className="text-[8.2px] sm:text-[9.2px] text-cyan-400 font-bold tracking-[0.25em] uppercase block font-mono leading-none">
              GROUP 063 PERSYARIKATAN
            </span>
          </div>
        </div>

        {/* Center Section: Desktop Public Items (Only shown if NOT logged in) */}
        {!isLoggedIn ? (
          <div className="hidden lg:flex items-center gap-1.5 bg-[#030405] border border-white/5 px-2 py-1.5 rounded-[1.5rem] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.95)]">
            {publicItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === "home" 
                ? activeSection === item.id 
                : (activeTab === "about" && item.id === "about-project");
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "relative cursor-pointer text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 border border-transparent whitespace-nowrap",
                    active ? "text-cyan-400 bg-slate-950/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Icon size={14} className={cn(active ? "text-cyan-400 animate-pulse" : "text-slate-400")} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Right Section: Language, Login/Logout trigger */}
        <div className="flex items-center space-x-4 shrink-0">
          <div 
            onClick={() => setLanguage(language === "en" ? "id" : "en")}
            className="flex items-center justify-between p-0.5 rounded-lg bg-[#030405] border border-white/5 hover:border-cyan-400/35 cursor-pointer h-8 w-16 relative shadow-[inset_2px_2px_5px_rgba(0,0,0,0.95)] select-none transition-all duration-300 active:scale-95 shrink-0"
          >
            <motion.div 
              className="absolute top-0.5 bottom-0.5 w-[28px] bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-md flex items-center justify-center font-bold text-[9px] text-slate-950 shadow-[1px_1px_3px_rgba(0,0,0,0.8)]"
              animate={{ left: language === "en" ? "2px" : "32px" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              {language.toUpperCase()}
            </motion.div>
            <span className="w-full text-right pr-2 text-[8.5px] font-black text-slate-450 block leading-none">
              {language === "en" ? "ID" : "EN"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            {!isLoggedIn ? (
              <button
                onClick={() => {
                  audio.playPrimaryClick();
                  setActiveTab("login");
                }}
                className="font-sans font-black uppercase text-[10.5px] tracking-widest px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#0c101b] to-[#04060a] border border-white/5 text-cyan-400 hover:text-cyan-300 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                LOGIN
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-[10px] text-white font-black leading-none tracking-tight uppercase">
                    {currentUser?.name || "KKN Shared Workspace"}
                  </span>
                  <span className="text-[7.5px] text-indigo-400 font-mono font-extrabold uppercase tracking-widest mt-1">
                    {currentUser?.group || "PersyarikatanMu-063"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    audio.playSecondaryClick();
                    onLogout();
                  }}
                  className="font-mono font-black uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-900/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut size={11} />
                  <span>LOGOUT</span>
                </button>
              </div>
            )}
          </div>

          {/* Responsive Side Menu Trigger */}
          <div className="lg:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-xl border border-white/5 hover:bg-white/5 h-10 w-10 cursor-pointer">
                  <Menu className="size-5 text-slate-350" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                showClose={true}
                className="bg-[#050608]/98 border-l border-white/10 w-4/5 max-w-sm gap-0 backdrop-blur-3xl p-6 flex flex-col justify-between select-none"
              >
                <SheetTitle className="sr-only">KKN Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Access KKN Project workspace modules</SheetDescription>
                
                <div className="space-y-6">
                  <div className="flex flex-col space-y-4 pb-6 border-b border-white/5 text-left">
                    <div className="flex items-center space-x-3 h-10">
                      <ModernPremiumLogo size={10} />
                      <div className="flex flex-col justify-center h-10 space-y-0.5 text-left">
                        <span className="font-sans font-black text-xs sm:text-sm text-white tracking-wider block uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent leading-none">
                          KKN PROJECT
                        </span>
                        <span className="text-[7.8px] sm:text-[8.5px] text-cyan-400 font-bold tracking-[0.2em] uppercase block font-mono leading-none">
                          GROUP 063 UMY
                        </span>
                      </div>
                    </div>

                    <SheetClose asChild>
                      <div className="pt-2">
                        {!isLoggedIn ? (
                          <button
                            onClick={() => {
                              audio.playPrimaryClick();
                              setActiveTab("login");
                            }}
                            className="w-full text-center font-sans font-black uppercase text-[11px] tracking-widest py-3 rounded-xl bg-gradient-to-br from-[#0c101b] to-[#04060a] border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 active:scale-95 transition-all cursor-pointer"
                          >
                            LOGIN TO PORTAL
                          </button>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/5">
                            <div className="flex flex-col text-left">
                              <span className="text-[10px] text-white font-extrabold uppercase">{currentUser?.name}</span>
                              <span className="text-[7.5px] text-indigo-400 font-mono font-semibold uppercase tracking-wider mt-0.5">{currentUser?.group}</span>
                            </div>
                            <button
                              onClick={() => {
                                audio.playSecondaryClick();
                                onLogout();
                              }}
                              className="font-mono font-black uppercase text-[8px] tracking-wider px-2.5 py-1.5 rounded-lg bg-red-950/20 border border-red-500/25 text-red-400 active:scale-95 transition-all cursor-pointer"
                            >
                              LOGOUT
                            </button>
                          </div>
                        )}
                      </div>
                    </SheetClose>
                  </div>

                  {/* Mobile Menu Links */}
                  <div className="space-y-1.5 text-left max-h-[350px] overflow-y-auto pr-1">
                    {!isLoggedIn ? (
                      <>
                        <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-1 mb-2">Public Channels</span>
                        {publicItems.map((item) => {
                          const Icon = item.icon;
                          const active = activeTab === "home" 
                            ? activeSection === item.id 
                            : (activeTab === "about" && item.id === "about-project") || (activeTab === "gallery" && item.id === "gallery") || (activeTab === "team-quotes" && item.id === "team-quotes");
                          return (
                            <SheetClose asChild key={item.id}>
                              <button 
                                onClick={() => handleItemClick(item.id)}
                                className={`w-full p-3 rounded-xl border text-[10.5px] font-bold text-left uppercase flex items-center gap-2.5 transition-all cursor-pointer ${
                                  active ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300" : "border-transparent text-slate-300 hover:bg-white/5"
                                }`}
                              >
                                <Icon className="w-4 h-4 text-slate-400" />
                                <span>{item.name}</span>
                              </button>
                            </SheetClose>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block px-1 mb-2">KKN DIGITAL WORKSPACE</span>
                        {authenticatedModules.map((mod) => {
                          const Icon = mod.icon;
                          const active = activeTab === mod.id;
                          return (
                            <SheetClose asChild key={mod.id}>
                              <button 
                                onClick={() => setActiveTab(mod.id as ActiveTab)}
                                className={`w-full p-2.5 rounded-xl border text-[10px] font-bold text-left uppercase flex items-center gap-2.5 transition-all cursor-pointer ${
                                  active ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300" : "border-transparent text-slate-300 hover:bg-white/5"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5 text-slate-400" />
                                <span>{mod.name}</span>
                              </button>
                            </SheetClose>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 text-left">
                  <span className="text-[7.5px] font-mono font-bold text-slate-500 uppercase block tracking-widest leading-none mb-1">CREDITS & COURSE</span>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-tight">Universitas Muhammadiyah Yogyakarta</span>
                  <span className="text-[8px] text-indigo-400 font-bold uppercase block mt-1">KKN digital core system</span>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>


    </div>
  );
}
