import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, MapPin, User, Users, Plus, Trash2, Edit, 
  CheckCircle2, Search, Filter, RefreshCw, X, Info, AlertTriangle, ChevronRight, UserPlus, HelpCircle
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { audio } from "../../utils/audioService";
import { cn } from "@/lib/utils";

export default function Picket() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View & Filters State
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Schedule Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [dayName, setDayName] = useState("Senin");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Assignment Modal State
  const [assigningSchedule, setAssigningSchedule] = useState<any | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Realtime subscription refresh
  useRealtimeRefresh(() => {
    fetchData();
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Picket Schedules
      const { data: schedData, error: schedErr } = await supabase
        .from("picket_schedules")
        .select("*")
        .order("created_at", { ascending: true });

      if (schedErr) throw schedErr;
      setSchedules(schedData || []);

      // 2. Fetch Assignments
      const { data: assignData, error: assignErr } = await supabase
        .from("picket_assignments")
        .select(`
          id,
          picket_schedule_id,
          member_id
        `);

      if (assignErr) throw assignErr;
      setAssignments(assignData || []);

      // 3. Fetch Members
      const { data: memData, error: memErr } = await supabase
        .from("members")
        .select("id, full_name, nim, kkn_role, is_active")
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (memErr) throw memErr;
      setMembers(memData || []);

    } catch (err: any) {
      console.error("Error fetching picket data:", err);
      setError("Gagal memuat data piket: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  };

  // Create or Update Schedule
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    audio.playPrimaryClick();
    setError(null);

    if (!location.trim()) {
      showNotification("Lokasi piket wajib diisi", "error");
      return;
    }

    const payload = {
      day_name: dayName,
      start_time: startTime,
      end_time: endTime,
      location: location.trim(),
      description: description.trim()
    };

    try {
      if (editingSchedule) {
        // Update
        const { error: updateErr } = await supabase
          .from("picket_schedules")
          .update(payload)
          .eq("id", editingSchedule.id);

        if (updateErr) throw updateErr;
        showNotification("Jadwal piket berhasil diperbarui!");
      } else {
        // Insert
        const { error: insertErr } = await supabase
          .from("picket_schedules")
          .insert([payload]);

        if (insertErr) throw insertErr;
        showNotification("Jadwal piket baru berhasil dibuat!");
      }

      // Reset Form
      setDayName("Senin");
      setStartTime("08:00");
      setEndTime("12:00");
      setLocation("");
      setDescription("");
      setShowAddForm(false);
      setEditingSchedule(null);
      fetchData();

    } catch (err: any) {
      showNotification("Gagal menyimpan jadwal: " + err.message, "error");
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (id: string, day: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jadwal piket hari ${day}? Semua penugasan anggota di jadwal ini juga akan terhapus.`)) return;
    audio.playSecondaryClick();

    try {
      // 1. Delete associated assignments first
      await supabase
        .from("picket_assignments")
        .delete()
        .eq("picket_schedule_id", id);

      // 2. Delete schedule
      const { error: delErr } = await supabase
        .from("picket_schedules")
        .delete()
        .eq("id", id);

      if (delErr) throw delErr;
      showNotification("Jadwal piket berhasil dihapus.");
      fetchData();
    } catch (err: any) {
      showNotification("Gagal menghapus jadwal: " + err.message, "error");
    }
  };

  // Add Member Assignment
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    audio.playPrimaryClick();

    if (!selectedMemberId) {
      showNotification("Silakan pilih anggota terlebih dahulu", "error");
      return;
    }

    // Check if already assigned
    const exists = assignments.some(
      a => a.picket_schedule_id === assigningSchedule.id && a.member_id === selectedMemberId
    );

    if (exists) {
      showNotification("Anggota ini sudah ditugaskan pada jadwal piket ini", "error");
      return;
    }

    try {
      const { error: insErr } = await supabase
        .from("picket_assignments")
        .insert([{
          picket_schedule_id: assigningSchedule.id,
          member_id: selectedMemberId
        }]);

      if (insErr) throw insErr;
      showNotification("Anggota berhasil ditugaskan ke piket!");
      setSelectedMemberId("");
      fetchData();
    } catch (err: any) {
      showNotification("Gagal menambahkan penugasan: " + err.message, "error");
    }
  };

  // Delete Assignment
  const handleRemoveAssignment = async (assignmentId: string) => {
    audio.playSecondaryClick();
    try {
      const { error: delErr } = await supabase
        .from("picket_assignments")
        .delete()
        .eq("id", assignmentId);

      if (delErr) throw delErr;
      showNotification("Penugasan anggota berhasil dihapus.");
      fetchData();
    } catch (err: any) {
      showNotification("Gagal menghapus penugasan: " + err.message, "error");
    }
  };

  const startEdit = (sched: any) => {
    audio.playPrimaryClick();
    setEditingSchedule(sched);
    setDayName(sched.day_name);
    setStartTime(sched.start_time);
    setEndTime(sched.end_time);
    setLocation(sched.location);
    setDescription(sched.description || "");
    setShowAddForm(true);
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(s => {
    const matchDay = selectedDayFilter === "all" || s.day_name === selectedDayFilter;
    const matchSearch = !searchQuery.trim() || 
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchDay && matchSearch;
  });

  // Group assignments by schedule ID
  const getAssignedMembersForSchedule = (scheduleId: string) => {
    const scheduleAssignments = assignments.filter(a => a.picket_schedule_id === scheduleId);
    return scheduleAssignments.map(a => {
      const member = members.find(m => m.id === a.member_id);
      return {
        assignmentId: a.id,
        memberId: a.member_id,
        full_name: member?.full_name || "Anggota Tidak Diketahui",
        nim: member?.nim || "-",
        kkn_role: member?.kkn_role || "Anggota"
      };
    });
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06] relative">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/20 text-[9px] font-mono font-black tracking-widest text-pink-400 uppercase">
              KKN SYSTEM ROSTER
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Mako Posko KKN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider font-display">
            JADWAL PIKET HARIAN
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Sistem koordinasi piket posko harian. Mengatur petugas kebersihan posko, piket layanan, 
            penyambutan tamu desa, serta kesiapan koordinasi internal tim mahasiswa KKN.
          </p>
        </div>
        
        <button
          onClick={() => {
            audio.playPrimaryClick();
            setShowAddForm(true);
            setEditingSchedule(null);
            setDayName("Senin");
            setStartTime("08:00");
            setEndTime("12:00");
            setLocation("");
            setDescription("");
          }}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-sans font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-pink-500/15 hover:shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-pink-400/20"
        >
          <Plus size={14} className="stroke-[3px]" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 text-emerald-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-3 shadow-lg"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <CheckCircle2 size={14} className="stroke-[2.5px]" />
            </div>
            <span>{successMsg}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-950/20 border border-red-500/25 text-red-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-3 shadow-lg"
          >
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
              <AlertTriangle size={14} className="stroke-[2.5px]" />
            </div>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="nm-card-3d p-5.5 flex items-center gap-4.5 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 to-rose-600 shadow-[0_1px_8px_rgba(236,72,153,0.3)]" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
          <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/25 text-pink-400 shrink-0 shadow-inner">
            <Calendar size={20} className="stroke-[2.2px]" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">TOTAL SESI PIKET</p>
            <h4 className="text-2xl font-black text-white mt-2 leading-none font-display">{schedules.length} Sesi</h4>
            <p className="text-[9px] font-mono text-slate-400 mt-1.5 uppercase tracking-wider">Terjadwal dalam sepekan</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="nm-card-3d p-5.5 flex items-center gap-4.5 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_1px_8px_rgba(6,182,212,0.3)]" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0 shadow-inner">
            <Users size={20} className="stroke-[2.2px]" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">TOTAL PENUGASAN</p>
            <h4 className="text-2xl font-black text-white mt-2 leading-none font-display">{assignments.length} Petugas</h4>
            <p className="text-[9px] font-mono text-slate-400 mt-1.5 uppercase tracking-wider">Tersebar di seluruh jadwal</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="nm-card-3d p-5.5 flex items-center gap-4.5 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_1px_8px_rgba(16,185,129,0.3)]" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 shadow-inner">
            <Clock size={20} className="stroke-[2.2px]" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">STATUS POSKO UTAMA</p>
            <h4 className="text-2xl font-black text-white mt-2 leading-none font-display">Ready</h4>
            <p className="text-[9px] font-mono text-slate-400 mt-1.5 uppercase tracking-wider">Sesuai jam operasional harian</p>
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="nm-card-3d p-4.5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full md:w-auto">
          {/* Day Filter */}
          <div className="relative">
            <select
              value={selectedDayFilter}
              onChange={(e) => {
                audio.playSecondaryClick();
                setSelectedDayFilter(e.target.value);
              }}
              className="nm-input pl-3.5 pr-9 py-2.5 font-mono text-xs text-white focus:outline-none cursor-pointer bg-[#0c1322] focus:border-cyan-500/30 w-full"
            >
              <option value="all">Semua Hari</option>
              {daysOfWeek.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial min-w-[240px]">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari lokasi, tugas atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nm-input pl-9.5 pr-4 py-2.5 font-mono text-xs text-white focus:outline-none placeholder:text-slate-600 focus:border-cyan-500/30 w-full"
            />
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1.5 rounded-xl border border-white/[0.04] w-full sm:w-auto md:self-auto shadow-inner mt-2 md:mt-0">
          <button
            onClick={() => {
              audio.playSecondaryClick();
              setViewMode("calendar");
            }}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
              viewMode === "calendar" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm" : "text-slate-400 hover:text-white"
            )}
          >
            Bento Kalender
          </button>
          <button
            onClick={() => {
              audio.playSecondaryClick();
              setViewMode("list");
            }}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
              viewMode === "list" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm" : "text-slate-400 hover:text-white"
            )}
          >
            Daftar Detail
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSaveSchedule}
            className="nm-card-3d p-6.5 space-y-5.5 relative overflow-hidden"
          >
            {/* Elegant accent border inside form */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 to-pink-500" />
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-3.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">
                  {editingSchedule ? "Edit Jadwal Piket" : "Buat Jadwal Piket Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playSecondaryClick();
                  setShowAddForm(false);
                  setEditingSchedule(null);
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={11} className="text-pink-400" />
                  <span>Hari</span>
                </label>
                <select
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none bg-[#0c1322] focus:border-cyan-500/30 cursor-pointer"
                >
                  {daysOfWeek.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={11} className="text-cyan-400" />
                  <span>Waktu Mulai</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none focus:border-cyan-500/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={11} className="text-pink-400" />
                  <span>Waktu Selesai</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none focus:border-cyan-500/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={11} className="text-emerald-400" />
                  <span>Lokasi Piket</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Posko Utama"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none focus:border-cyan-500/30 placeholder:text-slate-650"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Info size={11} className="text-cyan-400" />
                <span>Deskripsi Tugas (Opsional)</span>
              </label>
              <textarea
                placeholder="Contoh: Bertanggung jawab menjaga kebersihan ruang tamu, menyambut tamu posko, dan menyiapkan makan siang."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="nm-input w-full p-3.5 font-mono text-xs text-white focus:outline-none placeholder:text-slate-650 resize-none focus:border-cyan-500/30"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  audio.playSecondaryClick();
                  setShowAddForm(false);
                  setEditingSchedule(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-950/20 hover:bg-cyan-950/45 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 font-mono text-[10px] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                {editingSchedule ? "Simpan Perubahan" : "Buat Jadwal"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Roster Views */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 nm-card-3d">
          <RefreshCw className="animate-spin text-cyan-400" size={26} />
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Sinkronisasi database jadwal piket...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="nm-card-3d p-14 text-center space-y-4.5 flex flex-col items-center justify-center border-dashed">
          <div className="p-4 rounded-full bg-slate-950 border border-white/5 text-slate-500 shadow-inner">
            <Calendar size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Belum Ada Jadwal Piket</h3>
            <p className="text-[11px] font-mono text-slate-500 max-w-md uppercase tracking-wider leading-relaxed">
              Tidak ditemukan data jadwal piket harian yang sesuai filter. Klik "Tambah Jadwal" untuk membuat roster baru.
            </p>
          </div>
        </div>
      ) : viewMode === "calendar" ? (
        /* Bento Kalender View (Grid of Days) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {daysOfWeek.map(day => {
            const daySchedules = filteredSchedules.filter(s => s.day_name === day);
            const hasSchedules = daySchedules.length > 0;

            return (
              <div 
                key={day} 
                className={cn(
                  "nm-card-3d p-6.5 space-y-5.5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 min-h-[380px] h-auto",
                  hasSchedules 
                    ? "border-t-[3px] border-t-pink-500 shadow-md hover:shadow-pink-500/5 hover:scale-[1.01]" 
                    : "opacity-40 hover:opacity-60"
                )}
              >
                <div className="space-y-4">
                  {/* Day Title Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        hasSchedules ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.7)]" : "bg-slate-650"
                      )} />
                      <span className="text-sm font-black text-white uppercase tracking-widest font-display">{day}</span>
                    </div>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[8.5px] font-mono font-black uppercase tracking-wider",
                      hasSchedules ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "bg-slate-900 text-slate-500 border border-white/5"
                    )}>
                      {daySchedules.length} Sesi
                    </span>
                  </div>

                  {/* Sesi List inside Day card */}
                  {hasSchedules ? (
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                      {daySchedules.map(sched => {
                        const roster = getAssignedMembersForSchedule(sched.id);

                        return (
                          <div 
                            key={sched.id} 
                            className="p-4 rounded-2xl bg-gradient-to-b from-[#0a0f1d] to-[#04060c] border border-white/[0.05] hover:border-cyan-500/25 transition-all duration-300 space-y-3.5 relative overflow-hidden group shadow-md"
                          >
                            {/* Inner Accent Line */}
                            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-500 to-blue-500" />

                            {/* Schedule info */}
                            <div className="flex items-start justify-between gap-2.5 pt-1">
                              <div className="space-y-1.5 min-w-0 text-left">
                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-extrabold uppercase tracking-wide">
                                  <Clock size={12} className="text-cyan-400 shrink-0" />
                                  <span>{sched.start_time} - {sched.end_time} WIB</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wide">
                                  <MapPin size={12} className="text-pink-500 shrink-0" />
                                  <span className="truncate max-w-[150px]">{sched.location}</span>
                                </div>
                              </div>
                              
                              {/* Quick controls - visible on mobile and reveals cleanly on hover */}
                              <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => startEdit(sched)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                                  title="Edit Jadwal"
                                >
                                  <Edit size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSchedule(sched.id, sched.day_name)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-red-400 hover:border-red-500/25 active:scale-95 transition-all cursor-pointer"
                                  title="Hapus Jadwal"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Description brief task box */}
                            {sched.description && (
                              <div className="bg-slate-950/40 border-l-2 border-cyan-500/35 pl-3 py-1.5 rounded-r-lg text-[10px] text-slate-400 font-mono italic leading-relaxed">
                                "{sched.description}"
                              </div>
                            )}

                            {/* Assigned members (Petugas) team list */}
                            <div className="space-y-2.5 border-t border-white/[0.04] pt-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                                  PETUGAS PIKET ({roster.length})
                                </span>
                                <button
                                  onClick={() => {
                                    audio.playPrimaryClick();
                                    setAssigningSchedule(sched);
                                  }}
                                  className="text-[9.5px] font-mono text-cyan-400 hover:text-cyan-300 font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Plus size={10} className="stroke-[3.5px]" />
                                  <span>TUGASKAN</span>
                                </button>
                              </div>

                              {roster.length === 0 ? (
                                <div className="py-2.5 px-3 rounded-xl bg-slate-950/20 border border-dashed border-white/5 text-center">
                                  <p className="text-[9px] font-mono text-slate-600 uppercase italic">Belum ada petugas</p>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  {roster.map(r => {
                                    const initials = r.full_name
                                      .split(" ")
                                      .slice(0, 2)
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase();

                                    return (
                                      <div 
                                        key={r.assignmentId}
                                        className="flex items-center justify-between p-2 rounded-xl bg-[#0d1221] border border-white/[0.04] hover:border-pink-500/20 transition-all group/member"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-[8px] font-black text-white flex items-center justify-center shrink-0 shadow-sm uppercase font-mono">
                                            {initials}
                                          </div>
                                          <div className="min-w-0 text-left">
                                            <p className="text-[10px] font-bold text-white uppercase truncate tracking-wide leading-none">{r.full_name}</p>
                                            <p className="text-[8px] font-mono text-slate-500 uppercase mt-1 leading-none truncate">{r.nim} ● {r.kkn_role}</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleRemoveAssignment(r.assignmentId)}
                                          className="p-1 rounded bg-slate-900 border border-white/5 text-slate-500 hover:text-red-400 hover:border-red-500/25 shrink-0 cursor-pointer transition-colors"
                                          title="Hapus Penugasan"
                                        >
                                          <X size={9} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-white/[0.04] rounded-2xl bg-slate-950/10 p-4">
                      <HelpCircle size={20} className="text-slate-650 animate-pulse" />
                      <p className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest mt-3">Tidak Ada Piket</p>
                      <p className="text-[8.5px] font-mono text-slate-650 uppercase mt-1">Hari libur atau belum terjadwal</p>
                    </div>
                  )}
                </div>

                {/* Day Card Footer styling */}
                {hasSchedules && (
                  <div className="pt-2 border-t border-white/[0.03] text-right mt-3">
                    <span className="text-[8.5px] font-mono text-pink-500/40 font-extrabold uppercase tracking-widest">
                      KKN POSKO ROSTER ACTIVE ●
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* List Detail View */
        <div className="space-y-4.5">
          {filteredSchedules.map(sched => {
            const roster = getAssignedMembersForSchedule(sched.id);

            return (
              <div 
                key={sched.id} 
                className="nm-card-3d p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden group border-l-4 border-l-cyan-500 bg-gradient-to-br from-[#101322] to-[#04060d] hover:border-l-pink-500 transition-all duration-300"
              >
                {/* Visual glow overlay on card hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Main Schedule Meta */}
                <div className="space-y-3.5 flex-1 min-w-0 text-left relative z-10 w-full">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
                      HARI {sched.day_name}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-slate-300 font-bold bg-slate-950/40 px-2.5 py-1 rounded-lg border border-white/5">
                      <Clock size={12} className="text-cyan-400 shrink-0" />
                      <span>{sched.start_time} - {sched.end_time} WIB</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={14} className="text-pink-500 shrink-0" />
                      <span>{sched.location}</span>
                    </h3>
                    {sched.description && (
                      <p className="text-xs font-mono text-slate-400 mt-1 leading-relaxed max-w-4xl bg-slate-950/30 border-l border-white/10 pl-3 py-1.5">
                        {sched.description}
                      </p>
                    )}
                  </div>

                  {/* Roster profiles inline */}
                  <div className="pt-3 border-t border-white/[0.04] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        PETUGAS TERDAFTAR ({roster.length})
                      </span>
                    </div>
                    {roster.length === 0 ? (
                      <span className="inline-block text-[10px] font-mono text-slate-600 uppercase italic">Belum ada petugas piket ditugaskan pada sesi ini</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {roster.map(r => {
                          const initials = r.full_name
                            .split(" ")
                            .slice(0, 2)
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase();

                          return (
                            <div 
                              key={r.assignmentId} 
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/5 text-[10px] font-mono text-slate-300 hover:border-pink-500/35 transition-all shadow-sm group/tag"
                            >
                              <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-[8px] font-black text-white flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <span className="font-extrabold text-slate-200 uppercase">{r.full_name}</span>
                              <span className="text-[9px] text-slate-550">({r.kkn_role})</span>
                              <button
                                onClick={() => handleRemoveAssignment(r.assignmentId)}
                                className="text-slate-500 hover:text-red-400 ml-1.5 cursor-pointer transition-colors"
                                title="Hapus Penugasan"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right action control columns */}
                <div className="flex lg:flex-col items-center lg:items-end gap-3 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0 relative z-10">
                  <button
                    onClick={() => {
                      audio.playPrimaryClick();
                      setAssigningSchedule(sched);
                    }}
                    className="px-4.5 py-2.5 rounded-xl bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md w-full lg:w-auto"
                  >
                    <UserPlus size={13} />
                    <span>TUGASKAN ANGGOTA</span>
                  </button>
                  
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <button
                      onClick={() => startEdit(sched)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 active:scale-95 transition-all cursor-pointer shadow-sm flex-1 lg:flex-initial flex justify-center"
                      title="Edit Jadwal"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(sched.id, sched.day_name)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all cursor-pointer shadow-sm flex-1 lg:flex-initial flex justify-center"
                      title="Hapus Jadwal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Assign Modal */}
      <AnimatePresence>
        {assigningSchedule && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 text-left">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssigningSchedule(null)}
              className="absolute inset-0 bg-[#000]/75 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="nm-card-3d w-full max-w-md p-6.5 space-y-5.5 relative z-10 overflow-hidden"
            >
              {/* Glowing accent header for modal */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 to-pink-500" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
                <div className="text-left">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Tugaskan Anggota KKN
                  </h4>
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mt-1">
                    Piket Hari {assigningSchedule.day_name} ({assigningSchedule.start_time} - {assigningSchedule.end_time} WIB)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssigningSchedule(null)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-500 hover:text-white transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Assignments Form */}
              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <UserPlus size={11} className="text-pink-400" />
                    <span>Pilih Anggota Kelompok</span>
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none bg-[#0c1322] cursor-pointer focus:border-cyan-500/30"
                  >
                    <option value="">Pilih Anggota Kelompok</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.kkn_role || "Anggota"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssigningSchedule(null)}
                    className="px-4.5 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/35 hover:border-cyan-500/55 text-cyan-400 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Tugaskan Anggota
                  </button>
                </div>
              </form>

              {/* Current assigned list inside Modal */}
              <div className="space-y-3.5 border-t border-white/[0.06] pt-4 text-left">
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-slate-450" />
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                    Anggota Yang Sudah Ditugaskan ({getAssignedMembersForSchedule(assigningSchedule.id).length}):
                  </span>
                </div>
                {getAssignedMembersForSchedule(assigningSchedule.id).length === 0 ? (
                  <p className="text-[10px] font-mono text-slate-600 uppercase italic pl-1">Belum ada anggota yang ditugaskan</p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                    {getAssignedMembersForSchedule(assigningSchedule.id).map(r => {
                      const initials = r.full_name
                        .split(" ")
                        .slice(0, 2)
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase();

                      return (
                        <div 
                          key={r.assignmentId} 
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d15] border border-white/[0.02]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-[8px] font-black text-white flex items-center justify-center shrink-0 shadow-sm uppercase font-mono">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-white uppercase truncate tracking-wide leading-none">{r.full_name}</p>
                              <p className="text-[8px] font-mono text-slate-500 uppercase mt-1 leading-none">{r.nim} ● {r.kkn_role}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(r.assignmentId)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-500 hover:text-red-400 hover:border-red-500/25 cursor-pointer transition-colors"
                            title="Hapus Penugasan"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
