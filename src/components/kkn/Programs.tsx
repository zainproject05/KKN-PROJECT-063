import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, Plus, FolderPlus, Trash2, CheckSquare, Hourglass, 
  Sliders, CheckCircle, X, Search, Info, Target, Calendar, 
  MapPin, HelpCircle, AlertTriangle, Edit, User, DollarSign, ListTodo
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { PremiumEmptyState } from "../PremiumEmptyState";
import { PremiumExportButton } from "../PremiumExportButton";
import { PremiumMemberSelect } from "../PremiumMemberSelect";

export default function Programs() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Related Sublists
  const [relatedTasks, setRelatedTasks] = useState<any[]>([]);
  const [relatedFinance, setRelatedFinance] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Fisik");
  const [description, setDescription] = useState("");
  const [background, setBackground] = useState("");
  const [objectives, setObjectives] = useState("");
  const [targetParticipants, setTargetParticipants] = useState("");
  const [picMemberId, setPicMemberId] = useState("");
  const [involvedMemberIds, setInvolvedMemberIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [targetOutput, setTargetOutput] = useState("");
  const [plannedBudget, setPlannedBudget] = useState(0);
  const [status, setStatus] = useState("Planned");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [obstacles, setObstacles] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");

  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useRealtimeRefresh(() => {
    fetchPrograms();
    if (selectedProgram) {
      loadRelatedData(selectedProgram.id);
    }
  });

  useEffect(() => {
    fetchPrograms();
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await supabase
        .from("members")
        .select("id, full_name, nim")
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from("programs")
        .select(`
          *,
          members!pic_member_id(full_name)
        `)
        .order("title", { ascending: true });
      
      if (!sbErr && data) {
        setPrograms(data);
        if (data.length > 0 && !selectedProgram) {
          handleSelectProgram(data[0]);
        }
      } else {
        setPrograms([]);
      }
    } catch (err) {
      console.error(err);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProgram = async (prog: any) => {
    setSelectedProgram(prog);
    loadRelatedData(prog.id);
  };

  const loadRelatedData = async (programId: string) => {
    try {
      // 1. Fetch related tasks
      const { data: dbTasks } = await supabase
        .from("program_tasks")
        .select("*")
        .eq("program_id", programId);
      setRelatedTasks(dbTasks || []);

      // 2. Fetch related finance transactions
      const { data: dbFinance } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("program_id", programId);
      setRelatedFinance(dbFinance || []);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateProgramProgress = (startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) return { progress: 0, status: "Planned" };
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const today = new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const totalMs = end.getTime() - start.getTime();
    const totalDays = Math.round(totalMs / (1000 * 60 * 60 * 24)) + 1;
    
    if (totalDays <= 0) return { progress: 0, status: "Planned" };
    
    const elapsedMs = today.getTime() - start.getTime();
    const elapsedDays = Math.round(elapsedMs / (1000 * 60 * 60 * 24)) + 1;
    
    if (today < start) {
      return { progress: 0, status: "Planned" };
    } else if (today > end) {
      return { progress: 100, status: "Completed" };
    } else {
      const progress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
      return { progress, status: "In Progress" };
    }
  };

  // Helper to trigger elegant single toast notifications (Top-Right)
  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    const toastContainerId = "program-toast-container";
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
        <div class="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">PROGRAM KERJA</div>
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

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !picMemberId || !startDate || !endDate || !location.trim()) {
      setError("Harap isi semua kolom wajib (Judul, Deskripsi, PIC, Lokasi, Tanggal Mulai, Tanggal Selesai).");
      return;
    }

    const calc = calculateProgramProgress(startDate, endDate);
    const authorId = picMemberId || "00000000-0000-0000-0000-000000000000";

    const payload = {
      title: title.trim(),
      category,
      description: description.trim(),
      background: background.trim() || null,
      objectives: objectives.trim() || null,
      target_participants: targetParticipants.trim() || null,
      pic_member_id: picMemberId,
      involved_member_ids: involvedMemberIds.length > 0 ? involvedMemberIds : null,
      start_date: startDate || null,
      end_date: endDate || null,
      location: location.trim() || null,
      target_output: targetOutput.trim() || null,
      planned_budget: Number(plannedBudget) || 0,
      status: calc.status,
      progress_percentage: calc.progress,
      obstacles: obstacles.trim() || null,
      follow_up: followUp.trim() || null,
      created_by_member_id: authorId,
      updated_by_member_id: authorId
    };

    try {
      if (editingProgramId) {
        const { error: updErr } = await supabase
          .from("programs")
          .update(payload)
          .eq("id", editingProgramId);
        if (updErr) throw updErr;

        await supabase.from("activity_logs").insert([{
          message: `Memperbarui Program Kerja: ${title.trim()}`,
          created_by_member_id: authorId
        }]);
        showToast("Program kerja berhasil diperbarui!");
      } else {
        const { error: insErr } = await supabase.from("programs").insert([payload]);
        if (insErr) throw insErr;

        await supabase.from("activity_logs").insert([{
          message: `Membuat Program Kerja baru: ${title.trim()}`,
          created_by_member_id: authorId
        }]);
        showToast("Program kerja baru berhasil disimpan!");
      }

      // Reset
      setTitle("");
      setDescription("");
      setBackground("");
      setObjectives("");
      setTargetParticipants("");
      setPicMemberId("");
      setInvolvedMemberIds([]);
      setStartDate("");
      setEndDate("");
      setLocation("");
      setTargetOutput("");
      setPlannedBudget(0);
      setStatus("Planned");
      setProgressPercentage(0);
      setObstacles("");
      setFollowUp("");
      setEditingProgramId(null);
      setShowAddForm(false);
      fetchPrograms();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan program.");
      showToast(err?.message || "Gagal menyimpan program.", "error");
    }
  };

  const startEdit = (prog: any) => {
    setEditingProgramId(prog.id);
    setTitle(prog.title || "");
    setCategory(prog.category || "Fisik");
    setDescription(prog.description || "");
    setBackground(prog.background || "");
    setObjectives(prog.objectives || "");
    setTargetParticipants(prog.target_participants || "");
    setPicMemberId(prog.pic_member_id || "");
    setInvolvedMemberIds(prog.involved_member_ids || []);
    setStartDate(prog.start_date || "");
    setEndDate(prog.end_date || "");
    setLocation(prog.location || "");
    setTargetOutput(prog.target_output || "");
    setPlannedBudget(prog.planned_budget || 0);
    setStatus(prog.status || "Planned");
    setProgressPercentage(prog.progress_percentage || 0);
    setObstacles(prog.obstacles || "");
    setFollowUp(prog.follow_up || "");
    setShowAddForm(true);
  };

  const handleDeleteProgram = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Program Kerja "${title}"?`)) return;

    try {
      const { error: delErr } = await supabase.from("programs").delete().eq("id", id);
      if (delErr) throw delErr;

      await supabase.from("activity_logs").insert([{
        message: `Menghapus Program Kerja: ${title}`
      }]);

      showToast("Program kerja berhasil dihapus!");
      setSelectedProgram(null);
      fetchPrograms();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus program.", "error");
    }
  };

  // Filter Logic
  const filteredPrograms = programs.filter(p => {
    const term = search.toLowerCase();
    const matchSearch = 
      (p.title || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term);

    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;

    return matchSearch && matchStatus && matchCat;
  });

  const activeProgram = filteredPrograms.find(p => p.id === selectedProgram?.id) || filteredPrograms[0];

  useEffect(() => {
    if (activeProgram) {
      loadRelatedData(activeProgram.id);
    }
  }, [activeProgram?.id]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
            PROGRAM WORKBOARD
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2.5">
            Daftar Program Kerja KKN
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pantau perancangan, realisasi anggaran, target kegiatan, dan progres implementasi program pengabdian.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PremiumExportButton
            data={programs}
            columns={[
              { key: "title", label: "Judul Program Kerja" },
              { key: "category", label: "Kategori" },
              { key: "description", label: "Deskripsi" },
              { key: "location", label: "Lokasi" },
              { key: "planned_budget", label: "Anggaran Direncanakan (IDR)", formatter: (v: any) => v ? `Rp${Number(v).toLocaleString()}` : "Rp0" },
              { key: "status", label: "Status" },
              { key: "progress_percentage", label: "Progres (%)", formatter: (v: any) => `${v || 0}%` },
              { key: "start_date", label: "Tanggal Mulai" },
              { key: "end_date", label: "Tanggal Selesai" },
            ]}
            filename="program_kerja_kkn"
            title="Laporan Program Kerja KKN"
          />
          <button
            onClick={() => {
              setEditingProgramId(null);
              setTitle("");
              setCategory("Fisik");
              setDescription("");
              setBackground("");
              setObjectives("");
              setTargetParticipants("");
              setPicMemberId("");
              setInvolvedMemberIds([]);
              setStartDate("");
              setEndDate("");
              setLocation("");
              setTargetOutput("");
              setPlannedBudget(0);
              setStatus("Planned");
              setProgressPercentage(0);
              setObstacles("");
              setFollowUp("");
              setShowAddForm(!showAddForm);
            }}
            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
          >
            {showAddForm ? <X size={15} /> : <Plus size={15} />}
            <span>{showAddForm ? "Batal" : "Tambah Proker"}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 nm-card-3d p-5">
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Pencarian Proker</label>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nm-input w-full pl-10 pr-4 py-2.5 font-mono text-xs text-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Status Kegiatan</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="nm-input w-full p-2.5 font-mono text-xs text-white focus:outline-none"
          >
            <option value="all" className="bg-[#0c1322] text-white">Semua Status</option>
            <option value="Planned" className="bg-[#0c1322] text-white">Planned (Direncanakan)</option>
            <option value="In Progress" className="bg-[#0c1322] text-white">In Progress (Berjalan)</option>
            <option value="Completed" className="bg-[#0c1322] text-white">Completed (Selesai)</option>
            <option value="On Hold" className="bg-[#0c1322] text-white">On Hold (Ditunda)</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Kategori Bidang</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="nm-input w-full p-2.5 font-mono text-xs text-white focus:outline-none"
          >
            <option value="all" className="bg-[#0c1322] text-white">Semua Kategori</option>
            <option value="Fisik" className="bg-[#0c1322] text-white">Fisik (Infrastruktur)</option>
            <option value="Non-Fisik" className="bg-[#0c1322] text-white">Non-Fisik (Sosial/Edukasi)</option>
            <option value="Mitra" className="bg-[#0c1322] text-white">Mitra UMKM / Instansi</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1.5">Pilih Program Kerja</label>
          <select
            value={activeProgram?.id || ""}
            onChange={(e) => {
              const selected = programs.find(p => p.id === e.target.value);
              if (selected) handleSelectProgram(selected);
            }}
            className="nm-input w-full p-2.5 font-mono text-xs text-cyan-400 focus:outline-none font-bold"
          >
            {filteredPrograms.length === 0 ? (
              <option value="" className="bg-[#0c1322] text-slate-400">Tidak Ada Proker</option>
            ) : (
              filteredPrograms.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0c1322] text-white">
                  {p.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddProgram}
            className="nm-card-3d p-8 space-y-6 text-left mb-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {editingProgramId ? "Formulir Edit Program Kerja" : "Formulir Tambah Program Kerja"}
              </h3>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Core Required Fields Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Judul Proker (Wajib)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Sosialisasi Pencegahan Stunting"
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Kategori (Wajib)</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                >
                  <option value="Fisik" className="bg-[#0c1322] text-white">Fisik</option>
                  <option value="Non-Fisik" className="bg-[#0c1322] text-white">Non-Fisik</option>
                  <option value="Mitra" className="bg-[#0c1322] text-white">Mitra</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <PremiumMemberSelect
                  label="Penanggung Jawab / PIC (Wajib)"
                  placeholder="Pilih PIC"
                  selectedId={picMemberId}
                  onChange={(id) => setPicMemberId(id)}
                  members={members}
                  required={true}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Deskripsi Ringkas (Wajib)</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan ringkas mengenai detail teknis proker..."
                  rows={2}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Lokasi Kegiatan (Wajib)</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Balai RW 02"
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tanggal Mulai (Wajib)</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tanggal Selesai (Wajib)</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Anggaran Direncanakan (IDR, Wajib)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={plannedBudget}
                  onChange={(e) => setPlannedBudget(Number(e.target.value))}
                  placeholder="Anggaran dana..."
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Collapsible Advanced Fields Section */}
            <div className="border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2.5 px-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-left text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between transition-all"
              >
                <span>Detail Lanjutan (Opsional)</span>
                <span>{showAdvanced ? "▲ Sembunyikan" : "▼ Tampilkan"}</span>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Latar Belakang</label>
                        <input
                          type="text"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          placeholder="Sebab proker ini diadakan..."
                          className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tujuan Kegiatan (Objectives)</label>
                        <input
                          type="text"
                          value={objectives}
                          onChange={(e) => setObjectives(e.target.value)}
                          placeholder="Target kualitatif proker..."
                          className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Target Partisipan</label>
                        <input
                          type="text"
                          value={targetParticipants}
                          onChange={(e) => setTargetParticipants(e.target.value)}
                          placeholder="Contoh: Ibu-ibu Posyandu, 50 Orang"
                          className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Target Output</label>
                        <input
                          type="text"
                          value={targetOutput}
                          onChange={(e) => setTargetOutput(e.target.value)}
                          placeholder="Contoh: Modul edukasi gizi dan PMT"
                          className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Hambatan / Kendala</label>
                        <input
                          type="text"
                          value={obstacles}
                          onChange={(e) => setObstacles(e.target.value)}
                          placeholder="Kendala di lapangan..."
                          className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tindak Lanjut (Follow-Up)</label>
                        <input
                          type="text"
                          value={followUp}
                          onChange={(e) => setFollowUp(e.target.value)}
                          placeholder="Solusi kendala..."
                          className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                        <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Anggota Terlibat</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#030406] border border-white/5 p-4 rounded-xl max-h-40 overflow-y-auto">
                          {members.map(m => {
                            const isChecked = involvedMemberIds.includes(m.id);
                            return (
                              <label key={m.id} className="flex items-center gap-2 cursor-pointer group text-left">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setInvolvedMemberIds([...involvedMemberIds, m.id]);
                                    } else {
                                      setInvolvedMemberIds(involvedMemberIds.filter(id => id !== m.id));
                                    }
                                  }}
                                  className="rounded border-white/10 text-cyan-500 focus:ring-cyan-500 bg-slate-900 w-3.5 h-3.5"
                                />
                                <span className="text-[10px] font-mono text-slate-300 group-hover:text-white truncate">{m.full_name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="nm-btn px-5 py-3 text-cyan-400 text-xs font-sans font-black uppercase tracking-wider flex items-center gap-2"
              >
                <CheckCircle size={15} />
                <span>{editingProgramId ? "Simpan Perubahan" : "Simpan Proker"}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="w-full">
        {loading ? (
          <div className="nm-card-3d p-16 text-center flex flex-col items-center justify-center space-y-4">
            <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Memuat database program kerja...</span>
          </div>
        ) : programs.length === 0 ? (
          <div className="nm-card-3d p-10 flex flex-col items-center justify-center text-center">
            <PremiumEmptyState
              title="Belum Ada Program Kerja"
              description="Belum ada program kerja. Tambahkan proker pertama untuk mulai merencanakan kegiatan KKN."
              actionLabel="Tambah Proker"
              onAction={() => setShowAddForm(true)}
              icon={Layers}
              glowColor="cyan"
            />
          </div>
        ) : !activeProgram ? (
          <div className="nm-card-3d p-16 text-center flex flex-col items-center justify-center space-y-4">
            <Layers size={40} className="text-slate-600 animate-bounce" />
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ada program ditemukan</h4>
            <p className="text-xs text-slate-500 font-mono">Coba sesuaikan filter status atau kata kunci pencarian di atas.</p>
          </div>
        ) : (
          <div className="nm-card-3d p-8 relative overflow-hidden flex flex-col justify-between text-left space-y-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.015] rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
              <div>
                <span className="px-2.5 py-1 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-extrabold uppercase tracking-widest border border-cyan-500/20">
                  PROGRAM DETAILS PANEL (FULLSCREEN WORKBOARD)
                </span>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mt-3">
                  {activeProgram.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => startEdit(activeProgram)}
                  className="nm-btn px-4 py-2.5 text-cyan-400 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider"
                  title="Edit Proker"
                >
                  <Edit size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteProgram(activeProgram.id, activeProgram.title)}
                  className="nm-btn px-4 py-2.5 text-red-400 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider"
                  title="Hapus Proker"
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] font-mono">Progres Implementasi Program</span>
                <span className="font-mono font-black text-cyan-400 text-sm">{activeProgram.progress_percentage || activeProgram.progress || 0}%</span>
              </div>
              <div className="w-full h-4 rounded-full bg-slate-950 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8)] overflow-hidden p-[1.5px] border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${activeProgram.progress_percentage || activeProgram.progress || 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600"
                />
              </div>
            </div>

            {/* Detailed Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 text-[10.5px] font-mono text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 space-y-1 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.5)]">
                <span className="text-slate-500 text-[8.5px] uppercase tracking-wider block">Kategori</span>
                <span className="text-white uppercase font-bold text-[11px]">{activeProgram.category}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 space-y-1 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.5)]">
                <span className="text-slate-500 text-[8.5px] uppercase tracking-wider block">PIC (Penanggung Jawab)</span>
                <span className="text-cyan-400 uppercase font-bold text-[11px]">{activeProgram.members?.full_name || "Tidak Ada"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 space-y-1 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.5)]">
                <span className="text-slate-500 text-[8.5px] uppercase tracking-wider block">Periode Kegiatan</span>
                <span className="text-white font-bold text-[11px]">{activeProgram.start_date || "-"} s.d. {activeProgram.end_date || "-"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 space-y-1 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.5)]">
                <span className="text-slate-500 text-[8.5px] uppercase tracking-wider block">Lokasi Kegiatan</span>
                <span className="text-white font-bold uppercase text-[11px]">{activeProgram.location || "Basecamp 063"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/30 border border-white/5 space-y-1 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.5)]">
                <span className="text-slate-500 text-[8.5px] uppercase tracking-wider block">Anggaran Direncanakan</span>
                <span className="text-emerald-400 font-bold text-[11px]">{formatCurrency(activeProgram.planned_budget)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#030406] border border-cyan-500/10 space-y-1 shadow-[inset_1px_1px_4px_rgba(6,182,212,0.15)]">
                <span className="text-slate-500 text-[8.5px] uppercase tracking-wider block">Target Output Utama</span>
                <span className="text-white font-bold text-[11px]">{activeProgram.target_output || "Modul / Kehadiran Sosial"}</span>
              </div>
            </div>

            {/* Text Fields Expanded (Beautifully aligned cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="nm-inset p-5 rounded-2xl text-left space-y-2 flex flex-col justify-start">
                <h4 className="font-mono text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info size={11} />
                  <span>Deskripsi Kegiatan</span>
                </h4>
                <p className="text-slate-400 leading-relaxed font-sans text-[11.5px]">{activeProgram.description}</p>
              </div>

              <div className="nm-inset p-5 rounded-2xl text-left space-y-2 flex flex-col justify-start">
                <h4 className="font-mono text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Target size={11} />
                  <span>Latar Belakang</span>
                </h4>
                <p className="text-slate-400 leading-relaxed font-sans text-[11.5px]">{activeProgram.background || "Latar belakang kegiatan belum diinput."}</p>
              </div>

              <div className="nm-inset p-5 rounded-2xl text-left space-y-2 flex flex-col justify-start">
                <h4 className="font-mono text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle size={11} />
                  <span>Tujuan Utama (Objectives)</span>
                </h4>
                <p className="text-slate-400 leading-relaxed font-sans text-[11.5px]">{activeProgram.objectives || "Tujuan utama kegiatan belum diinput."}</p>
              </div>
            </div>

            {activeProgram.obstacles && (
              <div className="nm-inset border border-red-500/15 p-5 rounded-2xl text-left space-y-2">
                <h4 className="font-mono text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle size={12} />
                  <span>Kendala di Lapangan & Hambatan</span>
                </h4>
                <p className="text-slate-400 leading-relaxed font-sans text-[11.5px]">{activeProgram.obstacles}</p>
              </div>
            )}

            {/* Sublists block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Associated Tasks */}
              <div className="nm-inset p-6 rounded-2xl text-left space-y-4">
                <h4 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <ListTodo size={14} className="text-cyan-400" />
                  <span>Daftar Tugas Terkait</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-[11px] font-mono">
                  {relatedTasks.length === 0 ? (
                    <span className="text-slate-500 italic">Tidak ada tugas terkait program ini.</span>
                  ) : (
                    relatedTasks.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/5">
                        <span className="text-slate-300 truncate max-w-[200px]">{t.title}</span>
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${t.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"}`}>{t.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Associated Finance */}
              <div className="nm-inset p-6 rounded-2xl text-left space-y-4">
                <h4 className="font-mono text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-400" />
                  <span>Alokasi Kas Keuangan</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-[11px] font-mono">
                  {relatedFinance.length === 0 ? (
                    <span className="text-slate-500 italic">Belum ada realisasi kas terkait program ini.</span>
                  ) : (
                    relatedFinance.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/5">
                        <span className="text-slate-300 truncate max-w-[200px]">{f.description}</span>
                        <span className="text-[10px] font-black text-emerald-400">{formatCurrency(f.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
