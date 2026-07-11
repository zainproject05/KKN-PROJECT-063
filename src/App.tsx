import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActiveTab } from "./types";

// Import modular screens
import LandingPage from "./components/LandingPage";
import AboutProject from "./components/AboutProject";
import { PhotoGallery } from "./components/ui/gallery";
import FacultyCommentsSection from "./components/sections/faculty-comments-section";
import LoginPage from "./components/LoginPage";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import ErrorBoundary from "./components/ErrorBoundary";

// Import KKN operational screens
import Dashboard from "./components/kkn/Dashboard";
import Attendance from "./components/kkn/Attendance";
import Programs from "./components/kkn/Programs";
import Finance from "./components/kkn/Finance";
import Reports from "./components/kkn/Reports";
import Members from "./components/kkn/Members";
import Picket from "./components/kkn/Picket";
import Settings from "./components/kkn/Settings";

import Tasks from "./components/kkn/Tasks";
import Documents from "./components/kkn/Documents";
import Announcements from "./components/kkn/Announcements";
import Agenda from "./components/kkn/Agenda";
import WhatsAppTemplates from "./components/kkn/WhatsAppTemplates";

import TemplateDivisi from "./components/kkn/TemplateDivisi";
import WorkspaceLayout from "./components/kkn/WorkspaceLayout";
import AttendanceCheckIn from "./components/kkn/AttendanceCheckIn";

import PublicAbsensi from "./components/PublicAbsensi";

// Import luxury UI assets
import InteractiveBlueprintBackground from "./components/InteractiveBlueprintBackground";
import { CinematicFooter } from "@/components/ui/motion-footer";
import StartupLoader from "./components/StartupLoader";
import { audio } from "./utils/audioService";
import Navigation from "./components/Navigation";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [activeSection, setActiveSection] = useState<string>("home");
  const [navigationResetTick, setNavigationResetTick] = useState<number>(0);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("kkn_is_logged_in") === "true";
  });
  const [currentUser, setCurrentUser] = useState<{ name: string; group: string; role: string } | null>(() => {
    const cached = localStorage.getItem("kkn_current_user");
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch (e) {
      localStorage.removeItem("kkn_current_user");
      return null;
    }
  });

  const [activeSessionToken, setActiveSessionToken] = useState<string | null>(() => {
    const pathname = window.location.pathname;
    let token = null;
    if (pathname.includes("/attendance/check-in/")) {
      const parts = pathname.split("/");
      token = parts[parts.indexOf("check-in") + 1];
    }
    const tokenFromQuery = new URLSearchParams(window.location.search).get("token");
    return token || tokenFromQuery;
  });

  const [isPublicAbsensi, setIsPublicAbsensi] = useState<boolean>(() => {
    return window.location.pathname === "/absensi";
  });

  const handleNavigateToTab = (tab: any) => {
    // Intercept deprecated routes and redirect them accordingly
    let targetTab: ActiveTab = tab;

    if (tab === "tasks") {
      targetTab = "programs";
    } else if (tab === "documents") {
      sessionStorage.setItem("reports_active_subtab", "documents");
      targetTab = "reports";
    } else if (
      tab === "announcements" ||
      tab === "agenda" ||
      tab === "whatsapp-templates" ||
      tab === "report-templates"
    ) {
      targetTab = "dashboard";
    }

    // List of tabs that require authentication
    const securedTabs: ActiveTab[] = [
      "dashboard", "attendance", "programs", "finance", "reports", "members", "settings"
    ];
    
    audio.playTabSwitch();
    
    if (securedTabs.includes(targetTab) && !isLoggedIn) {
      setActiveTab("login");
      sessionStorage.setItem("post_login_redirect_tab", targetTab);
    } else {
      setActiveTab(targetTab);
    }
    
    setNavigationResetTick(prev => prev + 1);
    
    // Scroll to top
    if (!sessionStorage.getItem("pendingScrollSection")) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const handleLoginSuccess = (userData: { name: string; group: string; role: string }) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    localStorage.setItem("kkn_is_logged_in", "true");
    localStorage.setItem("kkn_current_user", JSON.stringify(userData));
    
    // Redirect to dashboard after login
    const redirectTab = (sessionStorage.getItem("post_login_redirect_tab") as ActiveTab) || "dashboard";
    sessionStorage.removeItem("post_login_redirect_tab");
    
    setTimeout(() => {
      setActiveTab(redirectTab);
    }, 100);
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("kkn_is_logged_in");
    localStorage.removeItem("kkn_current_user");
    await supabase.auth.signOut();
    setActiveTab("home");
  };

  // Automatic clean slate trigger to start with zero data and clear obsolete mock data
  useEffect(() => {
    const clearedKey = "kkn_clean_slate_v5_final";
    if (!localStorage.getItem(clearedKey)) {
      // Requested obsolete keys
      localStorage.removeItem("kkn-demo-data");
      localStorage.removeItem("kkn-mock-data");
      localStorage.removeItem("kkn-seed-data");
      localStorage.removeItem("kkn-sample-members");
      localStorage.removeItem("kkn-sample-programs");
      localStorage.removeItem("kkn-local-transactions");
      localStorage.removeItem("kkn-local-attendance");
      localStorage.removeItem("mech-ai-data");
      localStorage.removeItem("mech-ai-dataset");

      // App's own local storage databases
      localStorage.removeItem("kkn_local_members");
      localStorage.removeItem("kkn_local_programs");
      localStorage.removeItem("kkn_local_program_tasks");
      localStorage.removeItem("kkn_local_financial_transactions");
      localStorage.removeItem("kkn_local_attendance_records");
      localStorage.removeItem("kkn_local_attendance_sessions");
      localStorage.removeItem("kkn_local_agendas");
      localStorage.removeItem("kkn_local_activity_logs");
      localStorage.removeItem("kkn_local_whatsapp_templates");
      localStorage.removeItem("kkn_local_report_templates");
      localStorage.removeItem("kkn_local_documents");
      localStorage.removeItem("kkn_local_announcements");
      localStorage.removeItem("kkn_local_reports");

      localStorage.setItem(clearedKey, "true");
    }
  }, []);

  // Viewport Scroll Spy to highlight the landing-page navbar
  useEffect(() => {
    if (activeTab !== "home") return;

    const handleScroll = () => {
      const sections = ["home", "kkn-workspace", "team-quotes", "gallery"];
      let currentSection = "home";
      const navbarHeight = 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navbarHeight && rect.bottom > navbarHeight) {
            currentSection = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  // Handle cross-tab smooth scroll anchors
  useEffect(() => {
    if (activeTab === "home") {
      const pendingSection = sessionStorage.getItem("pendingScrollSection");
      if (pendingSection) {
        sessionStorage.removeItem("pendingScrollSection");
        setTimeout(() => {
          const element = document.getElementById(pendingSection);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    }
  }, [activeTab]);

  const [theme, setTheme] = useState<"navy" | "contrast">("navy");
  const [isStartingUp, setIsStartingUp] = useState(true);

  // Render active sheet view
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <LandingPage setActiveTab={handleNavigateToTab} datasetLoaded={false} />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigateToTab} />;
      case "attendance":
        return <Attendance />;
      case "programs":
        return <Programs />;
      case "finance":
        return <Finance />;
      case "reports":
        return <Reports />;
      case "template-divisi":
        return <TemplateDivisi />;
      case "members":
        return <Members />;
      case "picket":
        return <Picket />;
      case "settings":
        return <Settings />;

      case "tasks":
        return <Tasks />;
      case "documents":
        return <Documents />;
      case "announcements":
        return <Announcements />;
      case "agenda":
        return <Agenda />;
      case "whatsapp-templates":
        return <WhatsAppTemplates />;

      case "about":
        return <AboutProject />;
      case "gallery":
        return <PhotoGallery />;
      case "team-quotes":
        return <FacultyCommentsSection />;
      case "login":
        return (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => setActiveTab("home")}
          />
        );
      default:
        return <LandingPage setActiveTab={handleNavigateToTab} datasetLoaded={false} />;
    }
  };

  
  
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-[#0a0a0d] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Konfigurasi Supabase Belum Valid</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Pastikan <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> sudah diisi dengan benar.
          </p>
          <div className="bg-black/50 border border-white/5 rounded-lg p-4 text-left space-y-3">
            <p className="text-xs text-slate-500 font-mono">
              VITE_SUPABASE_URL harus berbentuk URL:<br/>
              <span className="text-cyan-400">https://xxxxx.supabase.co</span>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              (Jika Anda memasukkan nilai yang dimulai dengan "sb_publishable_" atau "eyJ...", itu mungkin adalah Key, bukan URL.)
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSessionToken) {
    return (
      <div className="relative min-h-screen bg-[#020408] overflow-hidden flex items-center justify-center">
        {theme === "navy" && <InteractiveBlueprintBackground />}
        <AttendanceCheckIn 
          sessionToken={activeSessionToken} 
          onBackToHome={() => {
            setActiveSessionToken(null);
            window.history.pushState({}, "", "/");
          }} 
        />
      </div>
    );
  }

  if (isPublicAbsensi) {
    return (
      <div className="relative min-h-screen bg-[#020408] overflow-hidden flex items-center justify-center">
        {theme === "navy" && (
          <ErrorBoundary>
            <InteractiveBlueprintBackground />
          </ErrorBoundary>
        )}
        <ErrorBoundary>
          <PublicAbsensi 
            onBackToHome={() => {
              setIsPublicAbsensi(false);
              window.history.pushState({}, "", "/");
            }} 
          />
        </ErrorBoundary>
      </div>
    );
  }

  const securedTabs = [
    "dashboard", "attendance", "programs", "finance", "reports", "template-divisi", "members", "picket", "settings",
    "tasks", "documents", "announcements", "agenda", "whatsapp-templates"
  ];
  const isSecuredTabActive = isLoggedIn && securedTabs.includes(activeTab);

  if (isSecuredTabActive) {
    return (
      <div className="relative min-h-screen bg-[#020306] overflow-hidden">
        <AnimatePresence mode="wait">
          {isStartingUp ? (
            <motion.div
              key="loader-overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-0 z-[9999] bg-[#04060a]"
            >
              <StartupLoader onComplete={() => setIsStartingUp(false)} />
            </motion.div>
          ) : (
            <WorkspaceLayout
              key="workspace-main"
              activeTab={activeTab}
              setActiveTab={handleNavigateToTab}
              currentUser={currentUser}
              onLogout={handleLogout}
            >
              <ErrorBoundary>
                {renderTabContent()}
              </ErrorBoundary>
            </WorkspaceLayout>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020408] overflow-hidden">
      {/* Main App Container */}
      <motion.div
        key="app-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: isStartingUp ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`min-h-screen min-w-[320px] flex flex-col relative overflow-x-hidden font-sans transition-colors duration-300 ${
          theme === "contrast" 
            ? "theme-contrast bg-[#f9fafc] text-slate-800" 
            : "theme-navy bg-[#000000] text-slate-100"
        }`}
        id="kkn_project_workspace"
      >
        {/* Interactive premium ambient background glow wrapper */}
        {theme === "navy" && (
          <ErrorBoundary>
            <InteractiveBlueprintBackground />
          </ErrorBoundary>
        )}

        {/* MODULAR RADI-X PREMIUM NAVIGATION HEADER DOCK */}
        <ErrorBoundary>
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={handleNavigateToTab} 
            activeSection={activeSection}
            datasetLoaded={false} 
            modelTrained={false} 
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </ErrorBoundary>

        {/* MASTER SCREEN MAIN CONTENT VIEWPORT */}
        <main className="relative z-10 flex-grow w-full max-w-[97%] mx-auto px-2 sm:px-6 lg:px-8 mt-6 shrink-0 transition-all duration-300" id="app_main_viewport_shell">
          
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0a0a0d]/95 via-[#030305]/98 to-[#000001]/100 border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.95)] shadow-indigo-500/[0.02]">
            
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] z-0" />
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-pulse z-10" />

            <div className="relative flex-grow p-4 sm:p-8 lg:p-10 min-h-[520px] transition-all duration-300 rounded-3xl z-10">
              
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full h-full"
              >
                <ErrorBoundary>
                  {renderTabContent()}
                </ErrorBoundary>
              </motion.div>

            </div>
          </div>

        </main>

        <div className="mt-16 print-hidden" id="cinematic_footer_workspace">
          <ErrorBoundary>
            <CinematicFooter />
          </ErrorBoundary>
        </div>
      </motion.div>

      {/* OVERLAY LOADER */}
      <AnimatePresence>
        {isStartingUp && (
          <motion.div
            key="loader-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-[#04060a]"
          >
            <StartupLoader onComplete={() => setIsStartingUp(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
