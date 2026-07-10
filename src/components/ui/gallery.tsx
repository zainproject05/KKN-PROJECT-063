"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Calendar, MapPin, Sparkles, BookOpen, Clock } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { SectionHeader } from "./SectionHeader";

import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";

interface PhotoItem {
  id: number;
  order: number;
  x: string;
  y: string;
  zIndex: number;
  direction: "left" | "right";
  src: string;
  titleKey: string;
  defaultTitle: string;
  date: string;
  descKey: string;
  defaultDesc: string;
  location: string;
}

export const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 1,
    order: 0,
    x: "-380px",
    y: "15px",
    zIndex: 10,
    direction: "left",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo1.title",
    defaultTitle: "Sosialisasi Program Kerja",
    date: "22 Jan 2026",
    descKey: "gallery.photo1.desc",
    defaultDesc: "Pemaparan rencana program kerja KKN kelompok 063 kepada para tokoh masyarakat dan warga dusun untuk menyelaraskan tujuan pemberdayaan.",
    location: "Balai Desa, Yogyakarta",
  },
  {
    id: 2,
    order: 1,
    x: "-310px",
    y: "32px",
    zIndex: 20,
    direction: "left",
    src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo2.title",
    defaultTitle: "Pemberdayaan UMKM Digital",
    date: "05 Feb 2026",
    descKey: "gallery.photo2.desc",
    defaultDesc: "Pendampingan pelaku usaha mikro kecil menengah setempat dalam digitalisasi sistem pembayaran (QRIS) serta teknik pemasaran online.",
    location: "Sekretariat KKN, Yogyakarta",
  },
  {
    id: 3,
    order: 2,
    x: "-240px",
    y: "8px",
    zIndex: 30,
    direction: "right",
    src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo3.title",
    defaultTitle: "Penyuluhan Gizi & Stunting",
    date: "14 Feb 2026",
    descKey: "gallery.photo3.desc",
    defaultDesc: "Kolaborasi bersama Posyandu mengadakan sosialisasi pencegahan stunting dan demo memasak makanan bergizi seimbang untuk balita.",
    location: "Pos Kesehatan Desa",
  },
  {
    id: 4,
    order: 3,
    x: "-170px",
    y: "22px",
    zIndex: 40,
    direction: "right",
    src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo4.title",
    defaultTitle: "Bimbingan Belajar & Seni",
    date: "28 Feb 2026",
    descKey: "gallery.photo4.desc",
    defaultDesc: "Sesi bimbingan belajar menyenangkan, prakarya kreatif, dan melatih anak-anak dusun mengekspresikan diri lewat lukisan dan kerajinan tangan.",
    location: "Taman Belajar KKN",
  },
  {
    id: 5,
    order: 4,
    x: "-100px",
    y: "44px",
    zIndex: 50,
    direction: "left",
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo5.title",
    defaultTitle: "Malam Keakraban & Pelepasan",
    date: "05 Mar 2026",
    descKey: "gallery.photo5.desc",
    defaultDesc: "Malam penutupan yang hangat bersama seluruh warga desa, diisi dengan pertunjukan seni, pembagian kenang-kenangan, dan doa bersama.",
    location: "Halaman Utama Balai Dusun",
  },
  {
    id: 6,
    order: 5,
    x: "-30px",
    y: "12px",
    zIndex: 60,
    direction: "right",
    src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo6.title",
    defaultTitle: "Gotong Royong Kebersihan",
    date: "12 Feb 2026",
    descKey: "gallery.photo6.desc",
    defaultDesc: "Kolaborasi bersama pemuda desa untuk membersihkan saluran air, menanam tanaman obat keluarga (TOGA), dan mengecat papan himbauan lingkungan.",
    location: "Lingkungan Dusun III",
  },
  {
    id: 7,
    order: 6,
    x: "40px",
    y: "35px",
    zIndex: 70,
    direction: "left",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo7.title",
    defaultTitle: "Literasi Digital Anak Bangsa",
    date: "19 Feb 2026",
    descKey: "gallery.photo7.desc",
    defaultDesc: "Edukasi pengenalan dasar komputer, berselancar internet sehat dan aman, serta penggunaan aplikasi perkantoran sederhana bagi siswa sekolah dasar.",
    location: "SD Negeri 2 Karang Rejo",
  },
  {
    id: 8,
    order: 7,
    x: "110px",
    y: "20px",
    zIndex: 80,
    direction: "right",
    src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo8.title",
    defaultTitle: "Pemetaan Administrasi Desa",
    date: "24 Feb 2026",
    descKey: "gallery.photo8.desc",
    defaultDesc: "Penyusunan peta batas wilayah administratif desa serta visualisasi data demografi penduduk berbasis digital untuk efisiensi administrasi desa.",
    location: "Balai Desa Suka Maju",
  },
  {
    id: 9,
    order: 8,
    x: "180px",
    y: "40px",
    zIndex: 90,
    direction: "left",
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo9.title",
    defaultTitle: "Pelatihan Pertanian Modern",
    date: "01 Mar 2026",
    descKey: "gallery.photo9.desc",
    defaultDesc: "Sosialisasi metode hidroponik sederhana dan pembuatan pupuk organik cair bersama kelompok tani untuk memaksimalkan hasil kebun warga.",
    location: "Lahan Kebon Kreatif",
  },
  {
    id: 10,
    order: 9,
    x: "250px",
    y: "15px",
    zIndex: 100,
    direction: "right",
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo10.title",
    defaultTitle: "Pelestarian Budaya Lokal",
    date: "04 Mar 2026",
    descKey: "gallery.photo10.desc",
    defaultDesc: "Pendokumentasian sejarah dusun, lagu rakyat, serta kesenian tari tradisional dalam bentuk buklet digital guna melestarikan warisan leluhur.",
    location: "Sanggar Seni Desa",
  },
  {
    id: 11,
    order: 10,
    x: "320px",
    y: "30px",
    zIndex: 110,
    direction: "left",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo11.title",
    defaultTitle: "Pemeriksaan Kesehatan Gratis",
    date: "26 Feb 2026",
    descKey: "gallery.photo11.desc",
    defaultDesc: "Penyelenggaraan cek tensi, gula darah, dan konsultasi kesehatan gratis bagi warga lansia guna meningkatkan kesadaran hidup sehat.",
    location: "Posyandu Lansia Melati",
  },
  {
    id: 12,
    order: 11,
    x: "390px",
    y: "10px",
    zIndex: 120,
    direction: "right",
    src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&h=600&q=80",
    titleKey: "gallery.photo12.title",
    defaultTitle: "Lokakarya Kreatif Kepemudaan",
    date: "02 Mar 2026",
    descKey: "gallery.photo12.desc",
    defaultDesc: "Menyelenggarakan pelatihan melukis kreatif dan public speaking bersama remaja dusun untuk melatih kepercayaan diri dan bakat seni.",
    location: "Pondok Kreatif KKN",
  },
];

export const PhotoGallery = ({
  animationDelay = 0.5,
}: {
  animationDelay?: number;
}) => {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);

  const loadGallery = async () => {
    // 1. Try local storage first
    const localData = localStorage.getItem("kkn_custom_gallery");
    let currentPhotos = DEFAULT_PHOTOS;
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure layout parameters exist
          currentPhotos = DEFAULT_PHOTOS.map(p => {
            const match = parsed.find((item: any) => item.id === p.id);
            return match ? { ...p, ...match } : p;
          });
        }
      } catch (e) {
        console.error("Failed to parse local gallery settings:", e);
      }
    }
    setPhotos(currentPhotos);

    // 2. Try Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("gallery_photos")
          .select("*")
          .order("id", { ascending: true });

        if (!error && data && data.length > 0) {
          const merged = DEFAULT_PHOTOS.map(p => {
            const match = data.find((item: any) => item.id === p.id || Number(item.id) === p.id);
            return match ? { ...p, ...match } : p;
          });
          setPhotos(merged);
          localStorage.setItem("kkn_custom_gallery", JSON.stringify(merged));
        }
      } catch (err) {
        console.error("Failed to fetch gallery from Supabase:", err);
      }
    }
  };

  useEffect(() => {
    loadGallery();

    const handleUpdate = () => {
      loadGallery();
    };

    window.addEventListener("kkn-gallery-updated", handleUpdate);
    return () => {
      window.removeEventListener("kkn-gallery-updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    // First make the container visible with a fade-in
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay * 1000);

    // Then start the photo animations after a short delay
    const animationTimer = setTimeout(
      () => {
        setIsLoaded(true);
      },
      (animationDelay + 0.4) * 1000
    );

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(animationTimer);
    };
  }, [animationDelay]);

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  // Animation variants for each photo (1:1 uniform box layout)
  const photoVariants = {
    hidden: () => ({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
    }),
    visible: (custom: { x: any; y: any; order: number }) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 12,
        mass: 1,
        delay: custom.order * 0.15,
      },
    }),
  };

  return (
    <div className="relative pt-8 pb-16">
      {/* Blueprint background lines matching premium aesthetic */}
      <div className="absolute inset-0 max-md:hidden top-[120px] -z-10 h-[380px] w-full bg-transparent bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-25 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]" />

      <SectionHeader
        badge={t("gallery.badge", "VISUAL DIARY")}
        title={t("gallery.subtitle_sub", "A Journey Through Visual Stories")}
        highlightedTitle={t("gallery.heading_accent", "Welcome to Our Stories")}
        subtitle={t("gallery.description", "Setiap lembar gambar menyimpan kisah perjuangan, tawa, dan rasa kebersamaan kami selama mengabdi di masyarakat. Klik gambar untuk membaca cerita lengkap dibalik momen tersebut.")}
        icon={Sparkles}
        className="mb-12"
      />

      {/* Gallery Stack Section */}
      <div className="relative mb-6 h-[340px] w-full items-center justify-center flex select-none">
        <motion.div
          className="relative mx-auto flex w-full max-w-7xl justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="relative flex w-full justify-center"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <div className="relative h-[220px] w-[220px]">
              {[...photos].reverse().map((photo) => (
                <motion.div
                  key={photo.id}
                  className="absolute left-0 top-0 cursor-pointer"
                  style={{ zIndex: photo.zIndex }}
                  variants={photoVariants}
                  custom={{
                    x: photo.x,
                    y: photo.y,
                    order: photo.order,
                  }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Photo
                    width={220}
                    height={220}
                    src={photo.src}
                    alt={t(photo.titleKey, photo.defaultTitle)}
                    direction={photo.direction}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Details Lightbox Dialog / Modal Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dark glass backdrop with blur */}
            <div 
              className="absolute inset-0 bg-[#020306]/90 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedPhoto(null)}
            />

            {/* Modal Body: Styled exactly matching the premium navy/dark HUD theme */}
            <motion.div
              className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e111d] to-[#04050a] border border-white/[0.12] rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden text-left z-10 select-text"
              initial={{ scale: 0.92, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 15, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Premium light glow streak at the top */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* 1:1 Aspect Ratio Photo matching prompt instructions with slight oval rounded corners */}
                <div className="relative aspect-square w-full bg-slate-950 border border-white/5 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group select-none">
                  <img
                    src={selectedPhoto.src}
                    alt={t(selectedPhoto.titleKey, selectedPhoto.defaultTitle)}
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020306]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Details Content */}
                <div className="flex flex-col h-full justify-between py-1 space-y-5">
                  <div className="space-y-3 text-left">
                    {/* Badge event details */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono tracking-widest font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{selectedPhoto.date}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono tracking-widest font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{selectedPhoto.location}</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-snug">
                      {t(selectedPhoto.titleKey, selectedPhoto.defaultTitle)}
                    </h3>

                    {/* Separator line */}
                    <div className="h-[1px] w-12 bg-cyan-500/40" />

                    <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed font-sans font-medium text-justify">
                      {t(selectedPhoto.descKey, selectedPhoto.defaultDesc)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Elegant decorative branding label at the bottom */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[8.5px] font-mono tracking-widest text-slate-500 font-extrabold uppercase">
                        KKN PERSYARIKATAN 063
                      </span>
                      <span className="text-[8.5px] font-mono tracking-widest text-cyan-400/80 font-bold uppercase flex items-center gap-1 select-none">
                        <Clock className="w-3 h-3" /> MEMORY
                      </span>
                    </div>

                    {/* Premium Close Button matching the testmonial quote pattern */}
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="w-full py-3 rounded-xl bg-gradient-to-br from-[#101324] to-[#040508] shadow-[4px_4px_10px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.01),inset_2px_2px_4px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.85)] active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.95),inset_-2px_-2px_6px_rgba(255,255,255,0.01)] text-[9px] font-mono font-extrabold uppercase tracking-[0.22em] text-cyan-400 hover:text-white transition-all duration-300 border border-white/[0.04] hover:border-cyan-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t("lecturer.dismiss", "TUTUP")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getRandomNumberInRange(min: number, max: number): number {
  if (min >= max) {
    throw new Error("Min value should be less than max value");
  }
  return Math.random() * (max - min) + min;
}

type Direction = "left" | "right";

export const Photo = ({
  src,
  alt,
  className,
  direction,
  width,
  height,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  direction?: Direction;
  width: number;
  height: number;
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  useEffect(() => {
    const randomRotation =
      getRandomNumberInRange(1.5, 4.5) * (direction === "left" ? -1 : 1);
    setRotation(randomRotation);
  }, [direction]);

  function handleMouse(event: {
    currentTarget: { getBoundingClientRect: () => any };
    clientX: number;
    clientY: number;
  }) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const resetMouse = () => {
    x.set(200);
    y.set(200);
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileTap={{ scale: 1.15, zIndex: 999 }}
      whileHover={{
        scale: 1.08,
        rotateZ: 1.5 * (direction === "left" ? -1 : 1),
        zIndex: 999,
      }}
      whileDrag={{
        scale: 1.08,
        zIndex: 999,
      }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      style={{
        width,
        height,
        perspective: 400,
        transform: `rotate(0deg) rotateX(0deg) rotateY(0deg)`,
        zIndex: 1,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: "none",
      }}
      className={cn(
        className,
        "relative mx-auto shrink-0 cursor-grab active:cursor-grabbing"
      )}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      draggable={false}
      tabIndex={0}
    >
      {/* Box layout is strictly 1:1, slight oval corners (rounded-[2rem]) with an elegant high-contrast premium thin outline */}
      <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] border border-white/[0.08] shadow-[0_12px_24px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-400/30 transition-shadow duration-300 bg-slate-950">
        <img
          className={cn("rounded-[2.2rem] h-full w-full object-cover select-none pointer-events-none filter brightness-[95%] hover:brightness-[100%] transition-all duration-300")}
          src={src}
          alt={alt}
          {...props}
          draggable={false}
        />
        {/* Soft edge ambient light glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] rounded-[2.2rem] pointer-events-none" />
      </div>
    </motion.div>
  );
};
