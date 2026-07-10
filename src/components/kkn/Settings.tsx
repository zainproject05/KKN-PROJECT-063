import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, Shield, User, Globe, HelpCircle, Save, CheckCircle, 
  Database, Info, Mail, Phone, Award, Cpu, AlertCircle, Image, Link, Calendar, 
  MapPin, RotateCcw, Edit3, Sliders, Eye 
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { DEFAULT_PHOTOS } from "../ui/gallery";

export default function Settings() {
  const [members, setMembers] = useState<any[]>([]);
  const [activeMemberId, setActiveMemberId] = useState("");
  const [profileName, setProfileName] = useState("KKN Shared Workspace");
  const [phone, setPhone] = useState("0812-2001-0205");
  const [email, setEmail] = useState("adminkkn063@mail.umy.ac.id");
  const [role, setRole] = useState("KORTEL (GROUP 063)");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tab state: 'profile' or 'gallery'
  const [activeTab, setActiveTab] = useState<"profile" | "gallery">(() => {
    const savedTab = localStorage.getItem("kkn_settings_active_tab");
    if (savedTab === "gallery") {
      localStorage.removeItem("kkn_settings_active_tab");
      return "gallery";
    }
    return "profile";
  });

  // Gallery Management States
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [editingPhotoId, setEditingPhotoId] = useState<number | null>(null);

  // Form states for the currently edited photo
  const [editSrc, setEditSrc] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");

  useEffect(() => {
    fetchMembers();
    loadGallerySettings();

    // Load local profile defaults
    const storedMemberId = localStorage.getItem("kkn_active_member_id");
    if (storedMemberId) setActiveMemberId(storedMemberId);

    const storedName = localStorage.getItem("kkn_admin_name");
    if (storedName) setProfileName(storedName);

    const storedPhone = localStorage.getItem("kkn_admin_phone");
    if (storedPhone) setPhone(storedPhone);

    const storedEmail = localStorage.getItem("kkn_admin_email");
    if (storedEmail) setEmail(storedEmail);

    const storedRole = localStorage.getItem("kkn_admin_role");
    if (storedRole) setRole(storedRole);
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await supabase
        .from("members")
        .select("id, full_name, whatsapp, email, kkn_role")
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGallerySettings = async () => {
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
        console.error(e);
      }
    }
    setGalleryPhotos(currentPhotos);

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
          setGalleryPhotos(merged);
          localStorage.setItem("kkn_custom_gallery", JSON.stringify(merged));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMemberChange = (memberId: string) => {
    setActiveMemberId(memberId);
    if (!memberId) {
      setRole("KORTEL (GROUP 063)");
      return;
    }

    const selected = members.find(m => m.id === memberId);
    if (selected) {
      setProfileName(selected.full_name || "");
      if (selected.whatsapp) setPhone(selected.whatsapp);
      if (selected.email) setEmail(selected.email);
      if (selected.kkn_role) setRole(selected.kkn_role);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save preferences
    localStorage.setItem("kkn_active_member_id", activeMemberId);
    localStorage.setItem("kkn_admin_name", profileName);
    localStorage.setItem("kkn_admin_phone", phone);
    localStorage.setItem("kkn_admin_email", email);
    localStorage.setItem("kkn_admin_role", role);

    // Sync to currentUser format if they customized the main name
    const currentUserRaw = localStorage.getItem("kkn_current_user");
    if (currentUserRaw) {
      try {
        const uObj = JSON.parse(currentUserRaw);
        uObj.name = profileName;
        uObj.role = role;
        localStorage.setItem("kkn_current_user", JSON.stringify(uObj));
      } catch (e) {
        console.error(e);
      }
    }

    // Dispatch custom event to let other parts of the app know settings have changed
    window.dispatchEvent(new Event("kkn-settings-updated"));

    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    }, 800);
  };

  // Gallery Editing Controls
  const startEditing = (photo: any) => {
    setEditingPhotoId(photo.id);
    setEditSrc(photo.src || "");
    setEditTitle(photo.defaultTitle || "");
    setEditDesc(photo.defaultDesc || "");
    setEditDate(photo.date || "");
    setEditLocation(photo.location || "");
  };

  const savePhotoEdit = async (id: number) => {
    setLoading(true);
    const updated = galleryPhotos.map(p => {
      if (p.id === id) {
        return {
          ...p,
          src: editSrc,
          defaultTitle: editTitle,
          defaultDesc: editDesc,
          date: editDate,
          location: editLocation
        };
      }
      return p;
    });

    setGalleryPhotos(updated);
    localStorage.setItem("kkn_custom_gallery", JSON.stringify(updated));
    window.dispatchEvent(new Event("kkn-gallery-updated"));

    // Optional Supabase Save
    if (isSupabaseConfigured) {
      try {
        await supabase.from("gallery_photos").upsert(updated);
      } catch (e) {
        console.warn("Failed to sync to gallery_photos table, saved locally first:", e);
      }
    }

    setEditingPhotoId(null);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetPhotoToDefault = async (id: number) => {
    const defaultPhoto = DEFAULT_PHOTOS.find(p => p.id === id);
    if (!defaultPhoto) return;

    const updated = galleryPhotos.map(p => {
      if (p.id === id) {
        return { ...defaultPhoto };
      }
      return p;
    });

    setGalleryPhotos(updated);
    localStorage.setItem("kkn_custom_gallery", JSON.stringify(updated));
    window.dispatchEvent(new Event("kkn-gallery-updated"));

    // Optional Supabase Save
    if (isSupabaseConfigured) {
      try {
        await supabase.from("gallery_photos").upsert(updated);
      } catch (e) {
        console.error(e);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetAllToDefaults = async () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan semua foto galeri ke pengaturan default bawaan kelompok?")) {
      setLoading(true);
      setGalleryPhotos(DEFAULT_PHOTOS);
      localStorage.setItem("kkn_custom_gallery", JSON.stringify(DEFAULT_PHOTOS));
      window.dispatchEvent(new Event("kkn-gallery-updated"));

      if (isSupabaseConfigured) {
        try {
          await supabase.from("gallery_photos").upsert(DEFAULT_PHOTOS);
        } catch (e) {
          console.error(e);
        }
      }

      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-8 text-left pb-12" id="kkn_settings_container">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-7 nm-card-3d">
        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-mono font-black tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.15)]">
            CONFIGURATOR CONTROL
          </span>
          <h2 className="text-2xl font-black text-white tracking-wide uppercase font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Pengaturan Workspace & Galeri
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-xl leading-relaxed">
            Sesuaikan profil operator penginput, kelola link foto galeri beranda secara dinamis, dan singkronisasikan data ke database Supabase Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4.5 py-3 rounded-2xl nm-inset text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
            <span>Sesi Aktif</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex border-b border-white/5 pb-0.5 gap-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-1 text-xs font-mono font-black uppercase tracking-widest transition-all relative cursor-pointer ${
            activeTab === "profile" 
              ? "text-cyan-400 border-b-2 border-cyan-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <span className="flex items-center gap-2 select-none">
            <User size={13} />
            Profil Operator & Sesi
          </span>
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`pb-3 px-1 text-xs font-mono font-black uppercase tracking-widest transition-all relative cursor-pointer ${
            activeTab === "gallery" 
              ? "text-cyan-400 border-b-2 border-cyan-400" 
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <span className="flex items-center gap-2 select-none">
            <Globe size={13} />
            Kustomisasi Galeri Beranda
          </span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}
      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Form Settings - Left Column */}
          <form onSubmit={handleSave} className="lg:col-span-7 nm-card-3d p-7 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <User size={16} className="text-cyan-400" />
                <h3 className="font-mono text-[10.5px] font-black text-white uppercase tracking-wider">
                  Konfigurasi Profil Operator
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Dropdown Select Member */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Identitas Anggota KKN Anda (Untuk Otomatisasi Penginputan)
                  </label>
                  <select
                    value={activeMemberId}
                    onChange={(e) => handleMemberChange(e.target.value)}
                    className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-950 text-slate-400">Pilih Anggota Kelompok Anda</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id} className="bg-slate-950 text-white">
                        {m.full_name} ({m.kkn_role || "Anggota"})
                      </option>
                    ))}
                  </select>
                  <div className="p-3.5 rounded-xl nm-inset text-[10px] text-slate-400 leading-relaxed font-semibold flex items-start gap-2.5 mt-2">
                    <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>Memilih nama Anda di sini akan otomatis mendeteksi peran divisi & mengisi kolom nama penginput pada formulir presensi, proker, kas keuangan, dan logbook.</span>
                  </div>
                </div>

                {/* Nama Panggilan Aktif */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Nama Panggilan Sesi
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Contoh: Admin KKN"
                    className="w-full h-11 nm-input px-4 text-xs font-semibold"
                  />
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Nomor Telepon (WhatsApp)
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 0812-xxxx-xxxx"
                    className="w-full h-11 nm-input px-4 text-xs font-semibold"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Alamat Email Sesi
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: operator@mail.umy.ac.id"
                    className="w-full h-11 nm-input px-4 text-xs font-semibold"
                  />
                </div>

                {/* Jabatan / Role */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Jabatan / Divisi KKN
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Contoh: KORTEL (GROUP 063) / Bendahara"
                    className="w-full h-11 nm-input px-4 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 text-[10px] font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-sans cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-cyan-400/30 disabled:opacity-50"
              >
                {saved ? <CheckCircle size={14} className="stroke-[3px]" /> : <Save size={14} className="stroke-[3px]" />}
                <span>{loading ? "Menyimpan Sesi..." : saved ? "Tersimpan!" : "Simpan Pengaturan"}</span>
              </button>
            </div>
          </form>

          {/* Live Identity Card Preview & System Info - Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 3D Neumorphic operator Identity Card */}
            <div className="nm-card-3d p-6 relative overflow-hidden flex flex-col justify-between group h-full min-h-[300px]">
              <div className="absolute -right-16 -top-16 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-indigo-600/30 rounded-full blur-3xl opacity-60 group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl opacity-40" />

              <div className="space-y-6 relative z-10">
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-black text-xs text-slate-950 shadow-lg">
                      {profileName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[7.5px] font-mono font-black tracking-widest text-slate-400 block uppercase">
                        KARTU IDENTITAS OPERATOR
                      </span>
                      <span className="text-[10px] font-black text-white tracking-wide uppercase font-sans">
                        KKN WORKSPACE SESI
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#030406] border border-cyan-500/20 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,1)]" />
                    <span className="text-[7.5px] font-mono font-black text-cyan-400 tracking-wider">LIVE PREVIEW</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-black tracking-widest text-slate-500 uppercase">OPERATOR NAME:</span>
                    <div className="text-base font-black text-white tracking-wide uppercase bg-white/[0.01] border border-white/5 p-3 rounded-xl nm-inset">
                      {profileName || "BELUM DIATUR"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-black tracking-widest text-slate-500 uppercase">JABATAN / DIVISI:</span>
                    <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase text-left">
                      {role || "ANGGOTA KELOMPOK"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-300 font-medium bg-white/[0.01] border border-white/5 p-2.5 rounded-xl">
                      <Phone size={12} className="text-slate-500" />
                      <span className="truncate">{phone || "No HP Kosong"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-300 font-medium bg-white/[0.01] border border-white/5 p-2.5 rounded-xl">
                      <Mail size={12} className="text-slate-500" />
                      <span className="truncate">{email || "Email Kosong"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between relative z-10">
                <div className="flex flex-col text-left">
                  <span className="text-[7px] font-mono font-bold text-slate-500 tracking-widest uppercase">GROUP DESIGNATION:</span>
                  <span className="text-[10px] font-black text-white font-mono tracking-wider uppercase">KELOMPOK KKN 063</span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] font-mono font-bold text-slate-500 tracking-widest uppercase block">STATUS:</span>
                  <span className="text-[9px] font-black text-emerald-400 font-mono tracking-widest uppercase">VERIFIED ACTIVE</span>
                </div>
              </div>
            </div>

            {/* System Constants & Interconnect */}
            <div className="nm-card-3d p-6 space-y-5">
              <h3 className="font-mono text-[10.5px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Database size={13} className="text-cyan-400 animate-pulse" />
                <span>Konstanta Sesi & Database</span>
              </h3>
              
              <div className="space-y-3.5 text-xs text-slate-300 font-medium text-left">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest">ORGANIZATION:</span>
                  <span className="font-black text-white uppercase tracking-wider font-mono text-[11px]">Kelompok KKN 063</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest">HOST UNIVERSITY:</span>
                  <span className="font-bold text-white font-mono text-[11px]">UMY</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest">DATABASE STATUS:</span>
                  <span className="font-black text-emerald-400 font-mono text-[11px] tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,1)]" />
                    {isSupabaseConfigured ? "SUPABASE ONLINE" : "OFFLINE PERSISTENCE"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest">SYSTEM VERSION:</span>
                  <span className="font-bold text-slate-400 font-mono text-[11px]">V3.5-DYNAMIC-GALLERY</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* DYNAMIC GALLERY MANAGEMENT INTERFACE */
        <div className="space-y-6" id="gallery_settings_panel">
          {/* Section Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 nm-card-3d bg-[#06080c]/50">
            <div className="space-y-1">
              <h3 className="font-mono text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Image size={15} className="text-cyan-400 animate-pulse" />
                <span>Manajemen Galeri Landing Page</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Pilih salah satu dari 12 foto kolase di bawah untuk memperbarui link, judul cerita, deskripsi, tanggal, atau lokasi. Dukungan tautan langsung dari Cloudinary, Drive, Imgur, dll.
              </p>
            </div>
            <button
              onClick={resetAllToDefaults}
              className="px-4 py-2.5 rounded-xl border border-rose-500/10 hover:border-rose-500/30 text-rose-400 font-mono text-[9px] font-black uppercase tracking-wider bg-rose-500/5 hover:bg-rose-500/10 transition-all flex items-center gap-2 self-start sm:self-center cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset Semua ke Default
            </button>
          </div>

          {/* Grid of 12 Photo Editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryPhotos.map((photo) => {
              const isEditing = editingPhotoId === photo.id;

              return (
                <div 
                  key={photo.id}
                  className={`nm-card-3d p-5 flex flex-col justify-between transition-all duration-300 ${
                    isEditing ? "border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.08)] bg-[#03060a]" : "hover:border-white/5"
                  }`}
                >
                  {/* Photo Info Display */}
                  <div className="flex gap-4 items-start">
                    {/* Image preview box */}
                    <div className="w-20 h-20 rounded-xl bg-slate-950 border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center">
                      {photo.src ? (
                        <img 
                          src={photo.src} 
                          alt={photo.defaultTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If invalid link, show warning placeholder
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300";
                          }}
                        />
                      ) : (
                        <Image size={24} className="text-slate-700" />
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-cyan-400 border border-cyan-500/20">
                        #{photo.id}
                      </span>
                    </div>

                    {/* Metadata summary */}
                    <div className="flex-grow space-y-1 min-w-0 text-left">
                      <h4 className="text-xs font-black text-white truncate uppercase tracking-wide">
                        {photo.defaultTitle || "Judul Momen"}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {photo.defaultDesc || "Belum ada deskripsi cerita."}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5px] font-mono font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} className="text-slate-600" />
                          {photo.date || "2026"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="text-slate-600" />
                          {photo.location || "Yogyakarta"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inline edit form or Action controls */}
                  {isEditing ? (
                    <div className="mt-5 pt-5 border-t border-white/5 space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[8.5px] font-mono font-black text-cyan-400 uppercase tracking-widest block">
                          Tautan Link Gambar (Cloudinary, Drive, Unsplash, Imgur, dll.)
                        </label>
                        <div className="relative">
                          <Link size={12} className="absolute left-3 top-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={editSrc}
                            onChange={(e) => setEditSrc(e.target.value)}
                            placeholder="Tempel link URL gambar di sini..."
                            className="w-full h-10 nm-input pl-9 pr-4 text-[11px] font-medium"
                          />
                        </div>
                        <p className="text-[8px] text-slate-500 font-semibold leading-relaxed">
                          Saran: Gunakan Cloudinary, Google Drive (direct link), Imgur, atau Unsplash untuk kualitas visual premium.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Judul */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                            Judul Momen Kegiatan
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full h-10 nm-input px-3.5 text-[11px] font-semibold"
                          />
                        </div>

                        {/* Tanggal */}
                        <div className="space-y-1.5">
                          <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                            Tanggal Kegiatan
                          </label>
                          <input
                            type="text"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            placeholder="Contoh: 12 Feb 2026"
                            className="w-full h-10 nm-input px-3.5 text-[11px] font-semibold"
                          />
                        </div>

                        {/* Lokasi */}
                        <div className="space-y-1.5">
                          <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                            Lokasi Kegiatan
                          </label>
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            placeholder="Contoh: Balai Desa, Yogyakarta"
                            className="w-full h-10 nm-input px-3.5 text-[11px] font-semibold"
                          />
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                            Deskripsi Cerita Lengkap Kegiatan
                          </label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={3}
                            placeholder="Tuliskan cerita detail dibalik momen foto kegiatan ini..."
                            className="w-full nm-input p-3.5 text-[11px] font-medium resize-none focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Editing Actions */}
                      <div className="pt-3 border-t border-white/5 flex justify-end gap-3.5">
                        <button
                          onClick={() => setEditingPhotoId(null)}
                          className="px-4 py-2 rounded-xl text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => savePhotoEdit(photo.id)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-sans text-[9px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Simpan #{photo.id}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Default view action row */
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between gap-3">
                      <button
                        onClick={() => resetPhotoToDefault(photo.id)}
                        className="p-2 rounded-lg border border-transparent hover:border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-900/40 transition-all cursor-pointer"
                        title="Kembalikan Foto Ini ke Default"
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        onClick={() => startEditing(photo)}
                        className="px-4 py-2 rounded-xl nm-btn hover:border-cyan-500/10 text-cyan-400 text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={11} />
                        Edit Link & Cerita
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
