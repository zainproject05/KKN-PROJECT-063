import React from "react";
import { motion } from "motion/react";
import { MessageSquare, Github, Instagram, Linkedin, Mail, Users, Award, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { audio } from "../utils/audioService";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar: string;
  contacts: {
    whatsapp?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
}

export default function TeamGallery() {
  const { t } = useLanguage();

  const members: TeamMember[] = [
    {
      id: 1,
      name: "Ananda Nur Daffa Zain",
      role: "Group Leader",
      department: "Mechanical Engineering",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281220010205",
        github: "https://github.com/DaffazainTM23",
        instagram: "https://www.instagram.com/daffazain_28/?__pwa=1#",
        email: "mailto:ananda.daffa.2023@ft.umy.ac.id"
      }
    },
    {
      id: 2,
      name: "Alya Rahmawati",
      role: "Group Secretary",
      department: "Medicine",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000001",
        instagram: "https://www.instagram.com/",
        email: "mailto:alya.rahma.2023@med.umy.ac.id"
      }
    },
    {
      id: 3,
      name: "Bagas Triatmojo",
      role: "Logistics Coordinator",
      department: "Electrical Engineering",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000002",
        github: "https://github.com/",
        email: "mailto:bagas.tri.2023@ft.umy.ac.id"
      }
    },
    {
      id: 4,
      name: "Citra Lestari",
      role: "Group Treasurer",
      department: "Accounting",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000003",
        instagram: "https://www.instagram.com/",
        email: "mailto:citra.lestari.2023@fe.umy.ac.id"
      }
    },
    {
      id: 5,
      name: "Dwi Kurniawan",
      role: "Technology Support",
      department: "Information Technology",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000004",
        github: "https://github.com/",
        email: "mailto:dwi.kurnia.2023@ft.umy.ac.id"
      }
    },
    {
      id: 6,
      name: "Eka Putri Utami",
      role: "Health Programs Head",
      department: "Nursing",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000005",
        instagram: "https://www.instagram.com/",
        email: "mailto:eka.putri.2023@med.umy.ac.id"
      }
    },
    {
      id: 7,
      name: "Fajar Ramadhan",
      role: "External Relations",
      department: "Law",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000006",
        instagram: "https://www.instagram.com/",
        email: "mailto:fajar.ramadhan.2023@law.umy.ac.id"
      }
    },
    {
      id: 8,
      name: "Gita Prasetya",
      role: "Community Welfare",
      department: "Psychology",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000007",
        instagram: "https://www.instagram.com/",
        email: "mailto:gita.prasetya.2023@fe.umy.ac.id"
      }
    },
    {
      id: 9,
      name: "Hadi Sulistyo",
      role: "Agro & Eco Head",
      department: "Agrotechnology",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000008",
        github: "https://github.com/",
        email: "mailto:hadi.sulis.2023@agri.umy.ac.id"
      }
    },
    {
      id: 10,
      name: "Indah Permatasari",
      role: "Education & Literacy",
      department: "English Education",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      contacts: {
        whatsapp: "https://wa.me/6281200000009",
        instagram: "https://www.instagram.com/",
        email: "mailto:indah.permata.2023@fip.umy.ac.id"
      }
    }
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="nm-card p-6 sm:p-8 w-full relative overflow-hidden border border-white/5 bg-gradient-to-b from-[#090b16]/95 to-[#04050a]/98 rounded-3xl shadow-[12px_12px_36px_rgba(0,0,0,0.95)]"
    >
      {/* Grid backlight */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        {/* Header Title block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/5 gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 rounded-lg text-[8.5px] font-mono uppercase tracking-widest font-black shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]">
              <Users className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{t("about.team_badge", "TEAM MEMBERS")}</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-none font-sans bg-gradient-to-r from-cyan-400 via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              {t("about.team_title", "PERSYARIKATANMU-063 TEAM GALLERY")}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans font-medium max-w-2xl leading-relaxed">
              {t("about.team_desc", "The dedicated members of the KKN Persyarikatan Muhammadiyah DIY 2026 group, executing community service with professionalism and division of responsibility.")}
            </p>
          </div>
          
          <div className="px-4 py-2 bg-[#020305]/80 border border-white/5 rounded-xl flex items-center gap-3 shadow-inner self-start md:self-center font-mono shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-none">
              <span className="text-[7.5px] text-slate-500 font-bold block uppercase tracking-wider">VERIFIED ROSTER</span>
              <span className="text-[10px] text-white font-extrabold tracking-widest uppercase">10 NODES ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Members Grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {members.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              whileHover={{ 
                y: -6, 
                borderColor: "rgba(34, 211, 238, 0.3)",
                boxShadow: "0 15px 30px rgba(0,0,0,0.8), 0 0 15px rgba(6, 182, 212, 0.1)"
              }}
              className="flex flex-col items-center p-4 rounded-2xl bg-[#030409]/60 border border-white/5 transition-all duration-300 text-center relative group"
            >
              {/* Outer circular glowing bezel */}
              <div className="relative w-20 h-20 rounded-full p-1 bg-white/[0.02] border border-white/10 group-hover:border-cyan-400/40 shadow-md flex items-center justify-center overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/10 via-slate-900/30 to-indigo-950/10 opacity-80" />
                <div className="w-[90%] h-[90%] rounded-full overflow-hidden relative z-10">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-[95%] contrast-[105%]"
                  />
                </div>
                {/* Profile Avatar Image */}
              </div>

              {/* Name and Major */}
              <div className="mt-4 space-y-1.5 w-full">
                <h4 className="text-[12px] font-black text-white uppercase tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-350 transition-colors">
                  {member.name}
                </h4>
                
                <div className="flex flex-col gap-1 px-1">
                  <span className="text-[8.5px] font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 rounded-md py-0.5 px-1.5 tracking-wider uppercase leading-none block">
                    {member.role}
                  </span>
                  <span className="text-[8px] font-sans font-bold text-slate-500 uppercase tracking-wide leading-tight line-clamp-1">
                    {member.department}
                  </span>
                </div>
              </div>

              {/* Interactive Contact Buttons reveal on hover / persistent */}
              <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-center gap-2">
                {member.contacts.whatsapp && (
                  <a
                    href={member.contacts.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      audio.playClick();
                    }}
                    className="p-1.5 rounded-lg bg-[#020305] border border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-200 cursor-pointer"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.contacts.github && (
                  <a
                    href={member.contacts.github}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      audio.playClick();
                    }}
                    className="p-1.5 rounded-lg bg-[#020305] border border-white/5 text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                    title="GitHub"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.contacts.instagram && (
                  <a
                    href={member.contacts.instagram}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      audio.playClick();
                    }}
                    className="p-1.5 rounded-lg bg-[#020305] border border-white/5 text-slate-400 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all duration-200 cursor-pointer"
                    title="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.contacts.email && (
                  <a
                    href={member.contacts.email}
                    onClick={(e) => {
                      e.stopPropagation();
                      audio.playClick();
                    }}
                    className="p-1.5 rounded-lg bg-[#020305] border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-200 cursor-pointer"
                    title="Campus Mail"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
