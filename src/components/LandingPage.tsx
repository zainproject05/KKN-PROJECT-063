import { useState, useEffect } from "react";
import { ActiveTab } from "../types";
import { 
  ArrowRight, UploadCloud, Cpu, Play, Pause,
  Settings, Layers, TrendingUp, HelpCircle, GraduationCap, Code, Sparkles, Database,
  Gauge, Flame, Sliders, Activity, Search, BookOpen, Scale, Info, Workflow, Compass, ChevronRight,
  MapPin, RotateCw, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { useLanguage } from "../context/LanguageContext";
import { SectionHeader } from "./ui/SectionHeader";
import { GooeyText } from "./ui/gooey-text-morphing";
import InkReveal from "./ui/ink-reveal";
import AnimatedGenerateButton from "./ui/animated-generate-button-shadcn-tailwind";
import FacultyCommentsSection from "./sections/faculty-comments-section";
import { PhotoGallery } from "./ui/gallery";

interface LandingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  datasetLoaded: boolean;
}

export default function LandingPage({ setActiveTab, datasetLoaded }: LandingPageProps) {
  const { t, language } = useLanguage();
  const [searchVal, setSearchVal] = useState<string>("");

  const searchItems = [
    { label: "KKN Operational Dashboard", tab: "dashboard" as ActiveTab },
    { label: "Attendance & Group Presence logs", tab: "attendance" as ActiveTab },
    { label: "Proker Work Programs progress tracking", tab: "programs" as ActiveTab },
    { label: "Tasks delegate board", tab: "tasks" as ActiveTab },
    { label: "Finance ledger & cash book", tab: "finance" as ActiveTab },
    { label: "Download official report templates", tab: "report-templates" as ActiveTab },
    { label: "About KKN Group 063 Project", tab: "about" as ActiveTab },
  ];

  const filteredSearch = searchVal 
    ? searchItems.filter(item => item.label.toLowerCase().includes(searchVal.toLowerCase()))
    : [];

  const benefits = [
    {
      title: language === "en" ? "MANAGE ATTENDANCE" : "KELOLA KEHADIRAN",
      description: language === "en"
        ? "Record meeting attendance, field activity participation, and member presence in a structured and accessible format for the entire group."
        : "Mencatat kehadiran rapat, partisipasi aktivitas lapangan, dan kehadiran anggota dalam format yang terstruktur dan mudah diakses oleh seluruh kelompok.",
      icon: Activity,
      label: "MODULE 01",
    },
    {
      title: language === "en" ? "MONITOR PROGRAM WORK" : "PANTAU PROGRAM KERJA",
      description: language === "en"
        ? "Track program plans, timelines, progress, obstacles, and follow-up actions to ensure each work program is documented and well managed."
        : "Melacak rencana program, lini masa, kemajuan, hambatan, dan tindakan lanjut untuk memastikan setiap program kerja didokumentasikan dan dikelola dengan baik.",
      icon: Workflow,
      label: "MODULE 02",
    },
    {
      title: language === "en" ? "ORGANIZE GROUP FINANCE" : "KAS & KEUANGAN KELOMPOK",
      description: language === "en"
        ? "Manage income, expenses, activity budgets, and financial records through a transparent and centralized administration system."
        : "Mengelola pemasukan, pengeluaran, anggaran kegiatan, dan catatan keuangan melalui sistem administrasi yang transparan dan terpusat.",
      icon: Scale,
      label: "MODULE 03",
    },
    {
      title: language === "en" ? "WRITE REPORTS AND LOGBOOKS" : "TULIS LAPORAN & LOGBOOK",
      description: language === "en"
        ? "Create daily notes, weekly reports, activity summaries, and structured documentation to support accurate and accountable reporting."
        : "Membuat catatan harian, laporan mingguan, ringkasan aktivitas, dan dokumentasi terstruktur untuk mendukung pelaporan yang akurat dan akuntabel.",
      icon: BookOpen,
      label: "MODULE 04",
    },
    {
      title: language === "en" ? "STORE DOCUMENTS AND FILES" : "SIMPAN DOKUMEN & BERKAS",
      description: language === "en"
        ? "Keep important files, proposals, reports, and supporting documentation organized in one connected digital repository."
        : "Menyimpan berkas penting, proposal, laporan, dan dokumentasi pendukung yang teratur dalam satu repositori digital yang terhubung.",
      icon: UploadCloud,
      label: "MODULE 05",
    },
    {
      title: language === "en" ? "COORDINATE TASKS AND AGENDA" : "KOORDINASI TUGAS & AGENDA",
      description: language === "en"
        ? "Arrange team tasks, activity schedules, reminders, and internal coordination so every member can work more effectively."
        : "Menyontrol tugas tim, jadwal aktivitas, pengingat, dan koordinasi internal sehingga setiap anggota dapat bekerja lebih efektif.",
      icon: Settings,
      label: "MODULE 06",
    },
  ];

  return (
    <div className="space-y-16 py-4 text-left relative overflow-hidden" id="landing_page_viewport">
      
      {/* GLOSSY METALLIC CONTAINER INSIDE CENTRAL BODY */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/[0.08]" style={{ background: "linear-gradient(180deg, #050507 0%, #000000 100%)" }}>
        
        {/* Decorative highlights */}
        <div className="absolute top-0 left-[-10%] w-[320px] h-[320px] bg-gradient-to-tr from-indigo-500/[0.06] via-transparent to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] bg-gradient-to-br from-indigo-600/[0.05] via-transparent to-transparent rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full pt-8" />

        {/* Hero Section */}
        <div id="home" className="scroll-mt-24 max-w-7xl mx-auto text-center px-4 sm:px-8 md:px-12 pt-20 pb-20 relative z-10 flex flex-col items-center overflow-hidden">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-2 mb-8 relative z-10 select-none"
            id="premium_hud_badge"
          >
            <div className="relative flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-cyan-950/40 via-slate-900/50 to-indigo-950/40 border border-cyan-500/30 rounded-full text-[10px] sm:text-[11px] font-mono tracking-widest text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.18)] backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-slate-100 to-indigo-300">
                {t("hero.badge_text", "KKN DIGITAL HUB • ACTIVE STATE")}
              </span>
              <div className="absolute inset-x-0 -bottom-px h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </div>

            <div className="flex items-center gap-2 opacity-70 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 animate-pulse" />
              <span className="w-10 h-[1.5px] bg-cyan-500/30" />
              <span className="text-[8.5px] font-mono text-slate-400 tracking-[0.25em] uppercase font-black">GROUP 063 PORTAL</span>
              <span className="w-10 h-[1.5px] bg-cyan-500/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 animate-pulse" />
            </div>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-sans font-black tracking-tight leading-[1.05] text-white uppercase text-center relative z-10">
            {t("hero.title_part1", "KKN PERSYARIKATAN")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent font-black block mt-2">
              {t("hero.title_part2", "MUHAMMADIYAH 063")}
            </span>
            <span className="text-cyan-100/90 text-2xl sm:text-4xl md:text-5xl font-black tracking-wide block mt-4">
              {t("hero.title_part3", "UNITED IN SERVICE. DRIVEN BY IMPACT.")}
            </span>
          </h1>

          <p className="text-slate-300 text-[14px] sm:text-[16px] max-w-4xl font-normal mt-6 leading-relaxed text-center">
            {t("hero.subtitle", "KKN Project is an integrated digital workspace for KKN Persyarikatan Muhammadiyah Group 063, Universitas Muhammadiyah Yogyakarta. It brings attendance, program planning, financial administration, reporting, documentation, and daily coordination into one connected system, strengthening solidarity, accountability, and meaningful community impact throughout the KKN journey.")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 mt-10">
            <AnimatedGenerateButton
              labelIdle={t("btn.kkn_workspace", "Open KKN Workspace")}
              onClick={() => setActiveTab("dashboard")}
            />
            <AnimatedGenerateButton
              labelIdle={language === "en" ? "GALLERY" : "GALERI"}
              onClick={() => {
                const element = document.getElementById("gallery");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            />
            <AnimatedGenerateButton
              labelIdle={t("nav.about", "ABOUT PROJECT")}
              onClick={() => {
                setActiveTab("about");
              }}
            />
          </div>

        </div>
      </div>

      {/* Workspace Modules Section */}
      <div className="scroll-mt-24 space-y-8" id="kkn-workspace">
        <SectionHeader
          badge={language === "en" ? "WORKSPACE MODULES" : "MODUL WORKSPACE"}
          title={language === "en" ? "INTEGRATED WORKSPACE" : "KEMAMPUAN UTAMA"}
          highlightedTitle={language === "en" ? "CAPABILITIES" : "WORKSPACE TERINTEGRASI"}
          subtitle={language === "en"
            ? "KKN Project brings attendance, program planning, financial administration, reporting, documentation, and daily coordination into one connected system."
            : "Proyek KKN mengintegrasikan absensi, perencanaan program, administrasi keuangan, pelaporan, dokumentasi, dan koordinasi harian ke dalam satu sistem terhubung."}
          icon={Workflow}
          className="mb-8"
        />

        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          id="benefits_grid"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
            >
              <FeatureCard feature={b} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Team Quotes Section */}
      <div className="scroll-mt-24 w-full" id="team-quotes">
        <FacultyCommentsSection />
      </div>

      {/* Photo Gallery Section */}
      <div className="scroll-mt-24 w-full" id="gallery">
        <PhotoGallery />
      </div>

    </div>
  );
}
