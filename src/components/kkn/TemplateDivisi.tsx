import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderOpen, FileText, Wallet, Calendar, Megaphone, Package, 
  Plus, Search, Edit, AlertCircle, Copy, ExternalLink, X, 
  CheckCircle2, FolderSync, HeartHandshake, RefreshCw
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { audio } from "../../utils/audioService";

export default function TemplateDivisi() {
  const [templateLinks, setTemplateLinks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("Semua Divisi");

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDivision, setFormDivision] = useState("File Lengkap");
  const [formDriveUrl, setFormDriveUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmittedBy, setFormSubmittedBy] = useState("");

  const divisions = [
    "File Lengkap",
    "Sekretaris",
    "Bendahara",
    "Acara",
    "Humas",
    "Perlengkapan",
    "Konsumsi"
  ];

  // Helper to trigger elegant single toast notifications (Top-Right)
  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    const toastContainerId = "template-toast-container";
    let container = document.getElementById(toastContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = toastContainerId;
      container.className = "fixed top-5 right-5 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0";
      document.body.appendChild(container);
    } else {
      container.innerHTML = ""; // Replaces previous toast instantly! No stacking.
    }

    const toast = document.createElement("div");
    toast.className = `p-4 rounded-2xl bg-[#030406]/95 border ${
      type === "success" ? "border-cyan-500/30 text-cyan-400" : type === "error" ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-400"
    } shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-3 pointer-events-auto transition-all duration-300 ease-out`;

    const iconColor = type === "success" ? "#22d3ee" : type === "error" ? "#f87171" : "#fbbf24";
    const iconSvg = type === "success" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

    toast.innerHTML = `
      <div class="flex-shrink-0 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        ${iconSvg}
      </div>
      <div class="flex-grow min-w-0">
        <div class="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">TEMPLATE KKN</div>
        <div class="text-[11px] font-sans text-slate-200 mt-0.5 leading-relaxed font-semibold">
          ${message}
        </div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-[-10px]");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  };

  // Realtime subscription
  useRealtimeRefresh(() => {
    fetchTemplateLinks();
  });

  useEffect(() => {
    fetchTemplateLinks();
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (!error && data) {
        setMembers(data);
        if (data.length > 0) {
          setFormSubmittedBy(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const fetchTemplateLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kkn_template_links")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data) {
        // Filter out 'Ketua' and 'PDD' if any slip through database policies
        const filtered = data.filter(
          (item: any) => item.division !== "Ketua" && item.division !== "PDD"
        );
        setTemplateLinks(filtered);
      } else {
        console.error("Supabase error fetching template links:", error);
        setTemplateLinks([]);
      }
    } catch (err) {
      console.error("Catch error fetching template links:", err);
      setTemplateLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url: string) => {
    audio.playPrimaryClick();
    if (!url) return;
    navigator.clipboard.writeText(url);
    showToast("Link berhasil disalin.", "success");
  };

  const handleOpenModal = (item?: any) => {
    audio.playPrimaryClick();
    if (item) {
      setEditingId(item.id);
      setFormTitle(item.title || "");
      setFormDivision(item.division || "File Lengkap");
      setFormDriveUrl(item.drive_url || "");
      setFormDescription(item.description || "");
      setFormIsActive(item.is_active !== false);
      setFormSubmittedBy(item.created_by_member_id || (members[0]?.id || ""));
    } else {
      setEditingId(null);
      setFormTitle("");
      setFormDivision("File Lengkap");
      setFormDriveUrl("");
      setFormDescription("");
      setFormIsActive(true);
      if (members.length > 0) {
        setFormSubmittedBy(members[0].id);
      }
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    audio.playSecondaryClick();
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError("Judul Template wajib diisi.");
      return;
    }
    if (!formDivision.trim()) {
      setFormError("Divisi wajib dipilih.");
      return;
    }
    if (!formDriveUrl.trim()) {
      setFormError("Google Drive URL wajib diisi.");
      return;
    }
    if (!formDriveUrl.startsWith("https://drive.google.com/")) {
      setFormError("URL harus berupa link Google Drive valid (dimulai dengan https://drive.google.com/).");
      return;
    }

    // Determine display order based on division
    const divOrders: Record<string, number> = {
      "File Lengkap": 1,
      "Sekretaris": 2,
      "Bendahara": 3,
      "Acara": 4,
      "Humas": 5,
      "Perlengkapan": 6,
      "Konsumsi": 7
    };
    const displayOrder = divOrders[formDivision] || 10;

    const payload = {
      title: formTitle.trim(),
      division: formDivision,
      drive_url: formDriveUrl.trim(),
      description: formDescription.trim(),
      is_active: formIsActive,
      display_order: displayOrder,
      updated_by_member_id: formSubmittedBy || null
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("kkn_template_links")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        showToast("Link template berhasil diperbarui.", "success");
      } else {
        const insertPayload = {
          ...payload,
          created_by_member_id: formSubmittedBy || null
        };
        const { error } = await supabase
          .from("kkn_template_links")
          .insert([insertPayload]);

        if (error) throw error;
        showToast("Link template berhasil ditambahkan.", "success");
      }

      setShowModal(false);
      fetchTemplateLinks();
    } catch (err: any) {
      console.error("Error saving template link:", err);
      setFormError(err?.message || "Gagal menyimpan template link.");
    }
  };

  // Icon selector based on division
  const getDivisionIcon = (div: string) => {
    switch (div) {
      case "File Lengkap":
        return <FolderOpen className="text-cyan-400" size={20} />;
      case "Sekretaris":
        return <FileText className="text-emerald-400" size={20} />;
      case "Bendahara":
        return <Wallet className="text-amber-400" size={20} />;
      case "Acara":
        return <Calendar className="text-rose-400" size={20} />;
      case "Humas":
        return <Megaphone className="text-indigo-400" size={20} />;
      case "Perlengkapan":
        return <Package className="text-violet-400" size={20} />;
      case "Konsumsi":
        return <HeartHandshake className="text-pink-400" size={20} />;
      default:
        return <FolderOpen className="text-slate-400" size={20} />;
    }
  };

  const getDivisionColorClass = (div: string) => {
    switch (div) {
      case "File Lengkap":
        return "text-cyan-400 bg-cyan-400/5 border-cyan-400/20";
      case "Sekretaris":
        return "text-emerald-400 bg-emerald-400/5 border-emerald-400/20";
      case "Bendahara":
        return "text-amber-400 bg-amber-400/5 border-amber-400/20";
      case "Acara":
        return "text-rose-400 bg-rose-400/5 border-rose-400/20";
      case "Humas":
        return "text-indigo-400 bg-indigo-400/5 border-indigo-400/20";
      case "Perlengkapan":
        return "text-violet-400 bg-violet-400/5 border-violet-400/20";
      case "Konsumsi":
        return "text-pink-400 bg-pink-400/5 border-pink-400/20";
      default:
        return "text-slate-400 bg-slate-400/5 border-slate-400/20";
    }
  };

  // Filtering & Searching logic
  const filteredTemplates = templateLinks.filter((item) => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.division?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivision = 
      selectedDivision === "Semua Divisi" || item.division === selectedDivision;

    return matchesSearch && matchesDivision;
  });

  return (
    <div className="space-y-8 text-left pb-12" id="kkn_template_divisi_view">
      
      {/* 1. Header / Control Center style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-7 nm-card-3d">
        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-mono font-black tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.15)] animate-pulse">
            KKN TEMPLATE CENTER
          </span>
          <h2 className="text-2xl font-black text-white tracking-wide uppercase font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            TEMPLATE DIVISI KKN
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-xl leading-relaxed">
            Akses cepat folder template administrasi setiap divisi KKN PersyarikatanMu-063.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              audio.playPrimaryClick();
              fetchTemplateLinks();
            }}
            className="p-3.5 rounded-2xl nm-btn flex items-center justify-center transition-all duration-300"
            title="Refresh Data"
          >
            <RefreshCw size={15} className="text-cyan-400" />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-sans cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-cyan-400/30"
          >
            <Plus size={14} className="stroke-[3px]" />
            Tambah Link Template
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Bar */}
        <div className="md:col-span-5 relative flex items-center">
          <Search size={14} className="absolute left-4.5 text-slate-400 pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari template divisi..."
            className="w-full h-12 nm-input pl-12 pr-4 text-xs font-medium placeholder:text-slate-600 focus:border-cyan-500/40"
          />
        </div>

        {/* Division Horizontal Filter Selectors */}
        <div className="md:col-span-7 flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none items-center">
          <style dangerouslySetInnerHTML={{__html: `
            .scrollbar-none::-webkit-scrollbar { display: none; }
            .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />
          <button
            onClick={() => { audio.playPrimaryClick(); setSelectedDivision("Semua Divisi"); }}
            className={`px-4 h-12 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 cursor-pointer ${
              selectedDivision === "Semua Divisi"
                ? "nm-inset border border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[0.98]"
                : "nm-btn text-slate-400 hover:text-white"
            }`}
          >
            Semua Divisi
          </button>
          {divisions.map((div) => (
            <button
              key={div}
              onClick={() => { audio.playPrimaryClick(); setSelectedDivision(div); }}
              className={`px-4 h-12 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 cursor-pointer ${
                selectedDivision === div
                  ? "nm-inset border border-cyan-500/30 text-cyan-400 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[0.98]"
                  : "nm-btn text-slate-400 hover:text-white"
              }`}
            >
              {div}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Content Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 space-y-4">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest text-slate-500 uppercase animate-pulse">
            Mengambil Data Template...
          </span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        
        /* 4. Empty State template */
        <div className="flex flex-col items-center justify-center p-12 py-24 nm-card-3d text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl nm-inset flex items-center justify-center text-slate-500 shadow-2xl">
            <FolderOpen size={32} className="stroke-[1.5px] text-cyan-400/80" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">
              Belum ada link template divisi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Tambahkan link Google Drive untuk menyimpan template administrasi tiap divisi KKN.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-3.5 text-[9px] font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-sans cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-2"
          >
            <Plus size={12} className="stroke-[3px]" />
            Tambah Link Template
          </button>
        </div>
      ) : (
        
        /* 5. Active Glassmorphism Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((item) => {
            return (
              <div 
                key={item.id}
                className="flex flex-col p-6 justify-between relative transition-all duration-300 nm-card-3d group"
              >
                
                {/* Upper row: icon and Edit */}
                <div className="flex items-start justify-between">
                  <div className="p-3.5 rounded-2xl nm-inset flex items-center justify-center">
                    {getDivisionIcon(item.division)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[8px] font-mono font-extrabold border uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${getDivisionColorClass(item.division)}`}>
                      {item.division}
                    </span>
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2 rounded-xl nm-btn text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Edit template"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>

                {/* Info area */}
                <div className="space-y-2 mt-5 text-left">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider leading-snug group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-450 leading-relaxed font-semibold min-h-[40px] line-clamp-2">
                    {item.description || "Tidak ada deskripsi."}
                  </p>
                </div>

                {/* Status Indicator & Bottom Actions */}
                <div className="border-t border-white/[0.04] pt-5 mt-5 flex items-center justify-between gap-2 shrink-0">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    <span className="text-[8px] font-mono font-black tracking-widest text-emerald-400 uppercase">
                      Link Aktif
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(item.drive_url)}
                      className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider nm-btn text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      title="Salin Link"
                    >
                      <Copy size={11} />
                      <span className="hidden sm:inline">Salin</span>
                    </button>
                    {item.drive_url ? (
                      <a
                        href={item.drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/35 hover:to-indigo-500/35 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 hover:text-white hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all flex items-center gap-1.5"
                      >
                        <ExternalLink size={11} />
                        Buka Folder
                      </a>
                    ) : (
                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                        No Drive URL
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 6. MODAL DIALOG CONTAINER - FIXED SIZE PORTAL DRAWER */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md nm-card-3d overflow-hidden p-6"
            >
              
              {/* Header */}
              <div className="pb-5 border-b border-white/[0.05] flex items-center justify-between">
                <div>
                  <span className="text-[7.5px] font-mono font-black tracking-widest text-cyan-400 uppercase">
                    {editingId ? "UBAH DATA LINK TEMPLATE" : "TAMBAH DATA BARU"}
                  </span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">
                    {editingId ? "Edit Link Template" : "Tambah Link Template"}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl nm-btn text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                
                {formError && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 flex items-start gap-2.5 text-[10px] leading-relaxed">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Judul Template */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Judul Template <span className="text-cyan-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Template Laporan Keuangan Kelompok"
                    className="w-full h-11 nm-input px-4 text-xs font-semibold"
                  />
                </div>

                {/* Divisi Dropdown */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Divisi <span className="text-cyan-500">*</span>
                  </label>
                  <select
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {divisions.map((div) => (
                      <option key={div} value={div} className="bg-slate-950 text-slate-300">
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Google Drive URL */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Google Drive URL <span className="text-cyan-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formDriveUrl}
                    onChange={(e) => setFormDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full h-11 nm-input px-4 text-xs font-semibold"
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Deskripsi
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Masukkan detail kegunaan folder template..."
                    rows={3}
                    className="w-full nm-input p-4 text-xs font-semibold resize-none"
                  />
                </div>

                {/* Submitted By / Nama Penginput */}
                <div className="space-y-2">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                    Nama Penginput / Submitted By
                  </label>
                  <select
                    value={formSubmittedBy}
                    onChange={(e) => setFormSubmittedBy(e.target.value)}
                    className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-950 text-slate-300">
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Aktif */}
                <div className="flex items-center justify-between p-4 rounded-2xl nm-inset">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status Aktif
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      audio.playPrimaryClick();
                      setFormIsActive(!formIsActive);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                      formIsActive ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-slate-800"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 bg-white rounded-full shadow"
                      animate={{ x: formIsActive ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Buttons block */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.05]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-3.5 text-[9px] font-black uppercase tracking-wider nm-btn text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5.5 py-3.5 text-[9px] font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-sans cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                  >
                    {editingId ? "Simpan Perubahan" : "Simpan Link"}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
