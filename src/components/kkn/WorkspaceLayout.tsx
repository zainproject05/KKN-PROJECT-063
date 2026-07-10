import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, 
  CheckCircle2, 
  FolderGit2, 
  ListTodo, 
  Wallet, 
  FileSpreadsheet, 
  FolderOpen, 
  Megaphone, 
  Calendar, 
  MessageSquareCode, 
  DownloadCloud, 
  UserSquare2, 
  Settings2,
  Menu, 
  X, 
  Home, 
  LogOut,
  Search,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { audio } from "../../utils/audioService";
import { cn } from "@/lib/utils";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import InteractiveBlueprintBackground from "../InteractiveBlueprintBackground";

interface WorkspaceLayoutProps {
  key?: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentUser: { name: string; group: string; role: string } | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export function MiniPremiumLogo() {
  return (
    <div className="relative flex items-center justify-center select-none shrink-0 w-9 h-9">
      <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md opacity-75 animate-pulse" />
      <img
        src="https://res.cloudinary.com/df0razmlr/image/upload/v1783274113/LOGO_KKN_ccrsvs.png"
        alt="KKN LOGO"
        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function WorkspaceLayout({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  children
}: WorkspaceLayoutProps) {
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);

  // Dynamic user profile settings loaded and updated reactively
  const [displayUserName, setDisplayUserName] = useState(() => {
    const storedName = localStorage.getItem("kkn_admin_name");
    return storedName || currentUser?.name || "KKN Workspace";
  });

  const [displayUserRole, setDisplayUserRole] = useState(() => {
    const storedRole = localStorage.getItem("kkn_admin_role");
    return storedRole || currentUser?.role || "KORTEL (GROUP 063)";
  });

  useEffect(() => {
    const updateProfileDisplay = () => {
      const storedName = localStorage.getItem("kkn_admin_name");
      if (storedName) setDisplayUserName(storedName);

      const storedRole = localStorage.getItem("kkn_admin_role");
      if (storedRole) setDisplayUserRole(storedRole);
    };

    window.addEventListener("kkn-settings-updated", updateProfileDisplay);
    return () => window.removeEventListener("kkn-settings-updated", updateProfileDisplay);
  }, [currentUser]);

  // Sidebar collapse states & preference persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("kkn-project-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("kkn-project-sidebar-collapsed", sidebarCollapsed ? "true" : "false");
  }, [sidebarCollapsed]);

  // Profile Dropdown States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close profile dropdown when pressing Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keep connection alive globally
  useRealtimeRefresh();

  const getTableFriendlyName = (table: string) => {
    switch (table) {
      case "members": return "Anggota Kelompok";
      case "programs": return "Program Kerja (Proker)";
      case "tasks": return "Daftar Tugas";
      case "financial_transactions": return "Kas & Keuangan";
      case "reports": return "Logbook Kegiatan";
      case "agendas": return "Agenda & Jadwal";
      case "documents": return "Berkas & Dokumen";
      case "announcements": return "Pengumuman";
      case "picket_schedules": return "Jadwal Piket";
      default: return "Sistem Workspace";
    }
  };

  useEffect(() => {
    const handleRealtimeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const table = customEvent.detail?.table || "";
      const friendlyName = getTableFriendlyName(table);
      setRealtimeNotice(`Data ${friendlyName} telah diperbarui secara realtime.`);
      
      const timer = setTimeout(() => {
        setRealtimeNotice(null);
      }, 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener("supabase-realtime-update", handleRealtimeUpdate);
    return () => window.removeEventListener("supabase-realtime-update", handleRealtimeUpdate);
  }, []);

  // SEVEN MAIN NAVIGATION ITEMS (Indonesian labels handled dynamically)
  const navigationItems = [
    { id: "dashboard", name: language === "en" ? "Dashboard" : "Dashboard", icon: ClipboardCheck, color: "text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 border-cyan-500/10" },
    { id: "attendance", name: language === "en" ? "Attendance" : "Absensi", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10" },
    { id: "picket", name: language === "en" ? "Duty Schedule" : "Jadwal Piket", icon: Calendar, color: "text-pink-400 bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/10" },
    { id: "programs", name: language === "en" ? "Programs" : "Program Kerja", icon: FolderGit2, color: "text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/10" },
    { id: "finance", name: language === "en" ? "Finance" : "Keuangan", icon: Wallet, color: "text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10" },
    { id: "reports", name: language === "en" ? "Reports" : "Laporan", icon: FileSpreadsheet, color: "text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10" },
    { id: "template-divisi", name: language === "en" ? "Division Templates" : "Template Divisi", icon: FolderOpen, color: "text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 border-cyan-500/10" },
    { id: "members", name: language === "en" ? "Members" : "Anggota", icon: Users, color: "text-violet-400 bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/10" },
    { id: "settings", name: language === "en" ? "Settings" : "Pengaturan", icon: Settings2, color: "text-slate-400 bg-slate-500/5 hover:bg-slate-500/10 border-slate-500/10" }
  ];

  const handleTabSelect = (tabId: string) => {
    audio.playPrimaryClick();
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const currentModule = navigationItems.find(item => item.id === activeTab) || {
    name: activeTab === "members" 
      ? (language === "en" ? "Group Members" : "Anggota Kelompok") 
      : activeTab === "settings" 
        ? (language === "en" ? "Settings" : "Pengaturan") 
        : "WORKSPACE"
  };

  return (
    <div className="flex min-h-screen bg-[#020306] text-slate-100 font-sans antialiased overflow-hidden relative">
      <InteractiveBlueprintBackground />
      
      {/* 3D Modern Sidebar (Desktop View) */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col shrink-0 border-r border-white/[0.04] bg-[#030407]/95 backdrop-blur-3xl relative z-30 select-none h-screen justify-between shadow-[2px_0_30px_rgba(0,0,0,0.85)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden",
          sidebarCollapsed ? "w-0 p-0 border-r-0 opacity-0 pointer-events-none" : "w-[280px] p-5"
        )}
      >
        <div className="space-y-6 flex-grow flex flex-col min-h-0">
          
          {/* Logo Header with Compact Collapse Button next to it */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
            <div 
              onClick={() => handleTabSelect("dashboard")} 
              className="flex items-center space-x-3 cursor-pointer group text-left"
            >
              <MiniPremiumLogo />
              <div className="flex flex-col justify-center">
                <span className="font-sans font-black text-xs text-white tracking-widest block uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform">
                  KKN WORKSPACE
                </span>
                <span className="text-[7.5px] text-cyan-400 font-extrabold tracking-[0.25em] uppercase block font-mono mt-0.5">
                  GROUP 063 PERSYARIKATAN
                </span>
              </div>
            </div>

            {/* Compact Hide Sidebar Button */}
            <button
              onClick={() => {
                audio.playPrimaryClick();
                setSidebarCollapsed(true);
              }}
              className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 hover:border-cyan-500/20 cursor-pointer transition-all duration-200"
              title={language === "en" ? "Hide sidebar" : "Sembunyikan sidebar"}
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Nav Links list - Custom 3D Rounded items - STRICTLY NO SCROLLBAR */}
          <div className="flex-grow space-y-2.5 pt-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={cn(
                    "w-full text-left cursor-pointer text-[10px] font-bold uppercase tracking-widest px-4.5 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group border relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-cyan-500/10 via-cyan-500/[0.02] to-transparent border-white/[0.02] text-cyan-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05)]" 
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.02] hover:translate-x-1"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon size={14} className={cn("transition-transform duration-300 group-hover:scale-110", isActive ? "text-cyan-400" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </div>
                  {isActive ? (
                    <>
                      <motion.div 
                        layoutId="sidebarActiveIndicatorLine"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      />
                      <motion.div 
                        layoutId="sidebarActiveIndicatorDot"
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)] shrink-0 ml-2"
                      />
                    </>
                  ) : null}
                </button>
              );
            })}

            {/* Premium Obsidian Sidebar Logout Button */}
            <button
              onClick={() => {
                audio.playSecondaryClick();
                onLogout();
              }}
              className="w-full text-left cursor-pointer text-[10px] font-bold uppercase tracking-widest px-4.5 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 border border-transparent text-red-400 hover:text-red-300 hover:bg-red-500/[0.04] mt-2 group hover:translate-x-1"
            >
              <LogOut size={14} className="text-red-400 transition-transform duration-300 group-hover:scale-110" />
              <span>{language === "en" ? "Logout Portal" : "Portal Logout"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area on Right */}
      <div 
        className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden relative z-10"
      >
        
        {/* Workspace Top Navigation Bar */}
        <header className="h-[76px] shrink-0 border-b border-white/[0.06] bg-[#05070a]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-4">
            
            {/* Mobile Sidebar Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Desktop Sidebar Expand Trigger (Only visible on desktop when sidebar is collapsed) */}
            {sidebarCollapsed && (
              <button
                onClick={() => {
                  audio.playPrimaryClick();
                  setSidebarCollapsed(false);
                }}
                className="hidden lg:flex p-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer transition-all duration-200"
                title={language === "en" ? "Show sidebar" : "Tampilkan sidebar"}
              >
                <ChevronRight size={18} />
              </button>
            )}

            {/* Breadcrumb Title */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                KKN GROUP 063 Persyarikatan
              </span>
              <h1 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">
                {currentModule?.name || "WORKSPACE"}
              </h1>
            </div>
          </div>

          {/* Cosmetic Search Bar matching reference style */}
          <div className="hidden md:flex items-center w-64 relative">
            <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features / files..."
              className="w-full nm-input p-2.5 pl-9.5 rounded-[1rem] font-sans text-[11px] text-white placeholder:text-slate-600 focus:outline-none transition-all"
            />
          </div>

          {/* Controls: Language, Workspace Profile Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 select-none">
            
            {/* Elegant Language Switcher */}
            <div 
              onClick={() => {
                audio.playPrimaryClick();
                setLanguage(language === "en" ? "id" : "en");
              }}
              className="flex items-center justify-between p-0.5 rounded-lg cursor-pointer h-7.5 w-14 relative nm-inset transition-all duration-300 active:scale-95 shrink-0"
            >
              <motion.div 
                className="absolute top-0.5 bottom-0.5 w-[24px] bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-md flex items-center justify-center font-bold text-[8px] text-slate-950 shadow-[1px_1px_2px_rgba(0,0,0,0.8)]"
                animate={{ left: language === "en" ? "2px" : "26px" }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              >
                {language.toUpperCase()}
              </motion.div>
              <span className="w-full text-right pr-2.5 text-[8px] font-black text-slate-500 block leading-none">
                {language === "en" ? "ID" : "EN"}
              </span>
            </div>

            {/* Workspace Profile Badge (Dynamic reactive profile display) */}
            <div className="flex items-center gap-2.5 p-1 px-3.5 rounded-xl h-9.5 nm-card-3d border border-white/[0.02] select-none">
              {/* Avatar */}
              <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-[9px] text-slate-950 shadow-md shrink-0 uppercase">
                {displayUserName.charAt(0) || "K"}
              </div>
              {/* Labels */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-white font-black leading-none tracking-tight uppercase">
                  {displayUserName}
                </span>
                <span className="text-[7.5px] text-indigo-400 font-mono font-extrabold uppercase tracking-widest mt-1">
                  {displayUserRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Frame with Hidden Webkit scrollbar but natural scrolling */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 relative scrollbar-none">
          <style dangerouslySetInnerHTML={{__html: `
            main.scrollbar-none::-webkit-scrollbar {
              width: 0px;
              height: 0px;
              background: transparent;
            }
            main.scrollbar-none {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}} />
          
          {/* Core Content Card View Wrapper */}
          <div className="relative z-10 w-full h-full">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Responsive Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-[#040609] border-r border-white/10 p-5 flex flex-col justify-between z-50 lg:hidden select-none"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.05]">
                  <div className="flex items-center space-x-2.5">
                    <MiniPremiumLogo />
                    <div className="text-left flex flex-col">
                      <span className="font-sans font-black text-[10px] text-white tracking-wider block uppercase">
                        KKN WORKSPACE
                      </span>
                      <span className="text-[7px] text-cyan-400 font-extrabold tracking-widest block font-mono mt-0.5">
                        GROUP 063 UMY
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-white/5 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Mobile list */}
                <div className="space-y-1.5 overflow-y-auto max-h-[70vh] pr-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabSelect(item.id)}
                        className={cn(
                          "w-full text-left cursor-pointer text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all flex items-center justify-between border",
                          isActive 
                            ? "bg-slate-900 border-cyan-500/20 text-cyan-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.9)]" 
                            : "bg-transparent border-transparent text-slate-400 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={14} className={isActive ? "text-cyan-400 animate-pulse" : "text-slate-400"} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <div className="w-1 h-1 rounded-full bg-cyan-400" />}
                      </button>
                    );
                  })}

                  {/* Mobile Logout item inside list */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      audio.playSecondaryClick();
                      onLogout();
                    }}
                    className="w-full text-left cursor-pointer text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all flex items-center gap-3 border border-transparent text-red-400 hover:text-red-300 hover:bg-red-500/[0.04]"
                  >
                    <LogOut size={14} className="text-red-400" />
                    <span>{language === "en" ? "Logout Portal" : "Portal Logout"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Realtime Notification Toast */}
      <AnimatePresence>
        {realtimeNotice && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.25)] flex items-center gap-3 max-w-sm backdrop-blur-md text-left"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="flex-grow">
              <h5 className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider">Sync Realtime</h5>
              <p className="text-[11px] text-white mt-0.5 leading-tight">{realtimeNotice}</p>
            </div>
            <button
              onClick={() => setRealtimeNotice(null)}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
