import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, Clock, CheckCircle2, ChevronRight, PlayCircle, 
  Flag, AlertCircle, Sparkles, Navigation, Bookmark, HelpCircle 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { audio } from "../utils/audioService";

interface Milestone {
  id: number;
  title: string;
  date: string;
  phase: string;
  description: string;
}

export default function KKNRoadmap() {
  const { t } = useLanguage();
  const [selectedPhase, setSelectedPhase] = useState<string>("Semua");
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  
  
  const phases = [
    { id: "Semua", name: "Semua" },
    { id: "Administrasi", name: "Administrasi" },
    { id: "Persiapan", name: "Persiapan" },
    { id: "Pembekalan", name: "Pembekalan" },
    { id: "Persiapan Lapangan", name: "Persiapan Lapangan" },
    { id: "Penerjunan", name: "Penerjunan" },
    { id: "Pelaksanaan Lapangan", name: "Pelaksanaan Lapangan" },
    { id: "Evaluasi", name: "Evaluasi" },
    { id: "Pelaporan", name: "Pelaporan" }
  ];

  const milestones = [
    {
      id: 1,
      title: "Pendaftaran Mahasiswa",
      date: "6 Mei - 26 Juni 2026",
      phase: "Administrasi",
      description: "Periode pendaftaran mahasiswa melalui sistem resmi KKN."
    },
    {
      id: 2,
      title: "Validasi",
      date: "27 Juni - 3 Juli 2026",
      phase: "Administrasi",
      description: "Validasi data mahasiswa dan kelengkapan administrasi peserta KKN."
    },
    {
      id: 3,
      title: "Pembagian Kelompok",
      date: "04 Juli 2026",
      phase: "Persiapan",
      description: "Pengumuman pembagian kelompok mahasiswa KKN."
    },
    {
      id: 4,
      title: "Pembagian Lokasi + DPL",
      date: "11 Juli 2026",
      phase: "Persiapan",
      description: "Pengumuman lokasi KKN dan Dosen Pembimbing Lapangan."
    },
    {
      id: 5,
      title: "Pembekalan Materi Khusus Mahasiswa",
      date: "13 Juli 2026",
      phase: "Pembekalan",
      description: "Pembekalan materi khusus bagi mahasiswa peserta KKN."
    },
    {
      id: 6,
      title: "Pembekalan Mahasiswa",
      date: "14 - 26 Juli 2026",
      phase: "Pembekalan",
      description: "Pembekalan umum mahasiswa sebelum pelaksanaan KKN di lapangan."
    },
    {
      id: 7,
      title: "Observasi",
      date: "11 - 26 Juli 2026",
      phase: "Persiapan Lapangan",
      description: "Observasi lokasi, identifikasi kebutuhan masyarakat, dan pengumpulan data awal."
    },
    {
      id: 8,
      title: "Penyusunan Proposal",
      date: "11 - 26 Juli 2026",
      phase: "Persiapan Lapangan",
      description: "Penyusunan proposal program kerja berdasarkan hasil observasi lapangan."
    },
    {
      id: 9,
      title: "Pembagian Logistik",
      date: "24 - 25 Juli 2026",
      phase: "Persiapan Lapangan",
      description: "Pembagian kebutuhan logistik untuk mendukung pelaksanaan KKN."
    },
    {
      id: 10,
      title: "Seremoni Penerjunan",
      date: "28 Juli 2026",
      phase: "Penerjunan",
      description: "Seremoni resmi penerjunan mahasiswa KKN."
    },
    {
      id: 11,
      title: "Penerjunan Lapangan",
      date: "29 Juli 2026",
      phase: "Penerjunan",
      description: "Mahasiswa mulai diterjunkan ke lokasi KKN masing-masing."
    },
    {
      id: 12,
      title: "Pelaksanaan",
      date: "29 Juli - 27 Agustus 2026",
      phase: "Pelaksanaan Lapangan",
      description: "Pelaksanaan program kerja dan kegiatan pengabdian masyarakat di lokasi KKN."
    },
    {
      id: 13,
      title: "Monitoring dan Evaluasi Lapangan",
      date: "10 - 20 Agustus 2026",
      phase: "Evaluasi",
      description: "Monitoring dan evaluasi kegiatan KKN oleh pihak terkait."
    },
    {
      id: 14,
      title: "Penarikan",
      date: "27 Agustus 2026",
      phase: "Penarikan",
      description: "Penarikan mahasiswa dari lokasi KKN."
    },
    {
      id: 15,
      title: "Pengumpulan Laporan dan Nilai Mahasiswa",
      date: "27 Agustus - 11 September 2026",
      phase: "Pelaporan",
      description: "Pengumpulan laporan akhir dan proses penilaian mahasiswa."
    },
    {
      id: 16,
      title: "Responsi",
      date: "27 Agustus - 11 September 2026",
      phase: "Pelaporan",
      description: "Pelaksanaan responsi dan evaluasi akhir kegiatan KKN."
    }
  ];

  const getMilestoneStatus = (dateStr: string) => {
    const months: Record<string, number> = {
      "Mei": 4, "Juni": 5, "Juli": 6, "Agustus": 7, "September": 8
    };
    const current = new Date(); // Actual system time

    const parseDate = (dStr: string, year: number) => {
      const parts = dStr.trim().split(" ");
      const day = parseInt(parts[0], 10);
      const month = months[parts[1]];
      return new Date(year, month, day);
    };

    try {
      const yearMatch = dateStr.match(/\d{4}$/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
      const withoutYear = dateStr.replace(/\d{4}$/, "").trim();

      if (withoutYear.includes("-")) {
        const parts = withoutYear.split("-");
        let startStr = parts[0].trim();
        let endStr = parts[1].trim();

        if (startStr.split(" ").length === 1) {
            const endMonth = endStr.split(" ")[1];
            startStr = `${startStr} ${endMonth}`;
        }
        
        const start = parseDate(startStr, year);
        start.setHours(0,0,0,0);
        const end = parseDate(endStr, year);
        end.setHours(23, 59, 59, 999);

        if (current > end) return "Selesai";
        if (current >= start && current <= end) return "Berjalan";
        return "Belum Dimulai";
      } else {
        const date = parseDate(withoutYear, year);
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);
        
        if (current > end) return "Selesai";
        if (current >= start && current <= end) return "Berjalan";
        return "Belum Dimulai";
      }
    } catch (e) {
      return "Belum Dimulai";
    }
  };

  const filteredMilestones = selectedPhase === "Semua" 
    ? milestones 
    : milestones.filter(m => m.phase === selectedPhase);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Selesai":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          nodeBg: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]",
          nodeBorder: "border-emerald-500/50",
          icon: CheckCircle2
        };
      case "Berjalan":
        return {
          bg: "bg-cyan-500/10 border-cyan-400/30 text-cyan-400",
          nodeBg: "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9)] animate-pulse",
          nodeBorder: "border-cyan-400",
          icon: PlayCircle
        };
      case "Belum Dimulai":
      default:
        return {
          bg: "bg-slate-500/5 border-white/5 text-slate-500",
          nodeBg: "bg-[#111322] border-white/15",
          nodeBorder: "border-white/10",
          icon: Clock
        };
    }
  };

  const handlePhaseClick = (phaseId: string) => {
    audio.playClick();
    setSelectedPhase(phaseId);
  };

  const handleCardHover = (id: number | null) => {
    if (id !== null && activeMilestone !== id) {
      audio.playClick();
    }
    setActiveMilestone(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="nm-card p-6 sm:p-8 w-full relative overflow-hidden border border-white/5 bg-gradient-to-b from-[#090b16]/95 to-[#04050a]/98 rounded-3xl shadow-[12px_12px_36px_rgba(0,0,0,0.95)]"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-5 border-b border-white/5 gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 rounded-lg text-[8.5px] font-mono uppercase tracking-widest font-black shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t("about.roadmap_badge", "KKN ROADMAP")}</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-none font-sans bg-gradient-to-r from-cyan-400 via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              {t("about.roadmap_title", "TIMELINE PELAKSANAAN KKN 2026")}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans font-medium max-w-2xl leading-relaxed">
              {t("about.roadmap_desc", "Roadmap resmi pelaksanaan KKN PersyarikatanMu 2026, mulai dari pendaftaran, validasi, pembagian kelompok, pembekalan, observasi, pelaksanaan lapangan, hingga pengumpulan laporan dan responsi.")}
            </p>
          </div>

          {/* Compact summary bar */}
          <div className="grid grid-cols-3 gap-3 bg-[#020305]/80 border border-white/5 p-3 rounded-2xl shadow-inner font-mono text-[8px] sm:text-[9px] uppercase tracking-widest shrink-0 self-start xl:self-center">
            <div className="text-left border-r border-white/5 pr-3">
              <span className="block text-slate-500 font-bold leading-none mb-1">START</span>
              <span className="text-white font-extrabold block">6 MEI 2026</span>
            </div>
            <div className="text-center border-r border-white/5 px-3">
              <span className="block text-cyan-400 font-bold leading-none mb-1">PENERJUNAN</span>
              <span className="text-cyan-300 font-extrabold block">29 JULI 2026</span>
            </div>
            <div className="text-right pl-3">
              <span className="block text-slate-500 font-bold leading-none mb-1">SELESAI</span>
              <span className="text-white font-extrabold block">11 SEPTEMBER 2026</span>
            </div>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => handlePhaseClick(phase.id)}
              className={`cursor-pointer px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase border tracking-wider transition-all duration-300 ${
                selectedPhase === phase.id
                  ? "bg-slate-900 border-cyan-400/30 text-cyan-300 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.9),0_0_15px_rgba(34,211,238,0.1)] translate-y-[1px]"
                  : "bg-transparent border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {phase.name}
            </button>
          ))}
        </div>

        {/* Timeline Container */}
        <div className="relative pt-8 pb-4 w-full">
          
          {/* Main Glowing Horizontal Connecting Line */}
          <div className="absolute top-[56px] left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/30 to-indigo-500/10 rounded-full z-0 pointer-events-none">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 rounded-full opacity-60 w-[50%] animate-pulse" />
          </div>

          {/* Horizontal scroll track */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 relative z-10 scrollbar-thin scrollbar-thumb-cyan-500/15 scrollbar-track-transparent select-none snap-x"
          >
            <AnimatePresence mode="popLayout">
              {filteredMilestones.map((milestone, idx) => {
                const calculatedStatus = getMilestoneStatus(milestone.date);
                const style = getStatusStyle(calculatedStatus);
                const Icon = style.icon;
                const isHovered = activeMilestone === milestone.id;

                return (
                  <motion.div
                    key={milestone.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    onMouseEnter={() => handleCardHover(milestone.id)}
                    onMouseLeave={() => handleCardHover(null)}
                    className="flex flex-col items-center shrink-0 w-[240px] snap-start relative pt-12"
                  >
                    {/* Visual Connector Node directly on the timeline line */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div 
                        className={`w-4 h-4 rounded-full border-2 bg-[#020305] flex items-center justify-center transition-all duration-300 ${
                          isHovered ? "border-cyan-400 scale-125" : style.nodeBorder
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${style.nodeBg}`} />
                      </div>
                      
                      {/* Connection indicator pin */}
                      <div className="w-[1.5px] h-6 bg-gradient-to-b from-white/10 to-transparent mt-1" />
                    </div>

                    {/* Milestone Card */}
                    <motion.div
                      animate={{
                        y: isHovered ? -4 : 0,
                        borderColor: isHovered ? "rgba(34, 211, 238, 0.25)" : "rgba(255,255,255,0.05)",
                        boxShadow: isHovered 
                          ? "0 12px 24px rgba(0,0,0,0.85), 0 0 15px rgba(6,182,212,0.08)"
                          : "0 4px 12px rgba(0,0,0,0.5)"
                      }}
                      className="w-full p-4.5 rounded-2xl bg-[#030409]/80 border border-white/5 backdrop-blur-sm text-left flex flex-col justify-between h-[180px] select-none transition-all duration-300"
                    >
                      <div className="space-y-2">
                        {/* Status/Phase Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-[7.5px] font-mono font-black text-slate-500 uppercase tracking-widest leading-none">
                            {milestone.phase}
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 py-0.5 px-2.5 rounded-md text-[7px] font-mono font-extrabold uppercase leading-none border ${style.bg}`}>
                            <Icon className="w-2.5 h-2.5" />
                            <span>{calculatedStatus}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-[11.5px] font-black text-white uppercase tracking-tight leading-all line-clamp-2 min-h-[2.5rem]">
                          {milestone.title}
                        </h4>
                        
                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-cyan-350 bg-cyan-500/5 border border-cyan-400/10 py-1 px-2.5 w-max rounded-lg">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          <span className="text-[8px] font-mono font-extrabold uppercase tracking-wide leading-none">{milestone.date}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[9px] text-slate-400 leading-relaxed font-semibold line-clamp-3 pt-2.5 border-t border-white/5">
                        {milestone.description}
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>

        {/* Small Disclaimer Footer note */}
        <p className="text-[9.5px] text-slate-500 font-sans font-medium text-left italic border-t border-white/5 pt-4">
          * {t("about.roadmap_footer_note", "Note: This roadmap is based on the KKN Persyarikatan Muhammadiyah DIY 2026 implementation schedule and serves as a structured timeline reference for the KKN Project workspace.")}
        </p>

      </div>
    </motion.div>
  );
}
