import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, Plus, Trash2, Calendar, User, Clock, AlertTriangle, 
  CheckCircle2, X, Search, Sliders, Edit, Check, ArrowUpRight, Grid, List, Folder
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { PremiumEmptyState } from "../PremiumEmptyState";
import { PremiumExportButton } from "../PremiumExportButton";
import { PremiumMemberSelect } from "../PremiumMemberSelect";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  // Form State
  const [title, setTitle] = useState("");
  const [programId, setProgramId] = useState("");
  const [description, setDescription] = useState("");
  const [assignedMemberId, setAssignedMemberId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [notes, setNotes] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useRealtimeRefresh(() => {
    fetchTasks();
  });

  useEffect(() => {
    fetchTasks();
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      // Fetch active members
      const { data: dbMembers } = await supabase
        .from("members")
        .select("id, full_name, nim")
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      setMembers(dbMembers || []);

      // Fetch programs
      const { data: dbProgs } = await supabase
        .from("programs")
        .select("id, title")
        .order("title", { ascending: true });
      setPrograms(dbProgs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from("program_tasks")
        .select(`
          *,
          members!assigned_member_id(full_name),
          programs(title)
        `)
        .order("due_at", { ascending: true });
      
      if (!sbErr && data) {
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !assignedMemberId || !deadline || !submittedBy) {
      setError("Harap isi semua kolom wajib (Judul, Penanggung Jawab, Batas Waktu, Penginput).");
      return;
    }

    const payload = {
      title: title.trim(),
      program_id: programId || null,
      description: description.trim() || null,
      assigned_member_id: assignedMemberId,
      due_at: deadline,
      priority,
      status,
      notes: notes.trim() || null,
      created_by_member_id: submittedBy,
      updated_by_member_id: submittedBy
    };

    try {
      if (editingTaskId) {
        const { error: updErr } = await supabase
          .from("program_tasks")
          .update(payload)
          .eq("id", editingTaskId);
        if (updErr) throw updErr;

        await supabase.from("activity_logs").insert([{
          message: `Memperbarui Tugas: ${title.trim()}`,
          created_by_member_id: submittedBy
        }]);
      } else {
        const { error: insErr } = await supabase.from("program_tasks").insert([payload]);
        if (insErr) throw insErr;

        await supabase.from("activity_logs").insert([{
          message: `Membuat Tugas Baru: ${title.trim()}`,
          created_by_member_id: submittedBy
        }]);
      }

      // Reset
      setTitle("");
      setProgramId("");
      setDescription("");
      setAssignedMemberId("");
      setDeadline("");
      setPriority("Medium");
      setStatus("To Do");
      setNotes("");
      setEditingTaskId(null);
      setShowForm(false);
      fetchTasks();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan tugas.");
    }
  };

  const startEdit = (task: any) => {
    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setProgramId(task.program_id || "");
    setDescription(task.description || "");
    setAssignedMemberId(task.assigned_member_id || "");
    setDeadline(task.due_at || task.deadline || "");
    setPriority(task.priority || "Medium");
    setStatus(task.status || "To Do");
    setNotes(task.notes || "");
    setShowForm(true);
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus tugas "${title}"?`)) return;

    try {
      const { error: delErr } = await supabase.from("program_tasks").delete().eq("id", id);
      if (delErr) throw delErr;

      await supabase.from("activity_logs").insert([{
        message: `Menghapus Tugas: ${title}`
      }]);

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusChange = async (taskId: string, currentTitle: string, nextStatus: string) => {
    try {
      const { error: updErr } = await supabase
        .from("program_tasks")
        .update({ status: nextStatus })
        .eq("id", taskId);

      if (updErr) throw updErr;

      await supabase.from("activity_logs").insert([{
        message: `Mengubah status tugas "${currentTitle}" menjadi "${nextStatus}"`
      }]);

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
    const term = search.toLowerCase();
    const matchSearch = 
      (t.title || "").toLowerCase().includes(term) ||
      (t.description || "").toLowerCase().includes(term);

    const matchProg = filterProgram === "all" || t.program_id === filterProgram;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchAssignee = filterAssignee === "all" || t.assigned_member_id === filterAssignee;

    return matchSearch && matchProg && matchPriority && matchAssignee;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-green-500/10 text-green-400 border-green-500/20";
    }
  };

  const isOverdue = (task: any) => {
    if (task.status === "Completed" || task.status === "Selesai") return false;
    const dueStr = task.due_at || task.deadline;
    if (!dueStr) return false;
    return new Date(dueStr) < new Date();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
            OPERATIONAL TASKS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2.5">
            Daftar Pembagian Tugas ({filteredTasks.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pantau delegasi tugas, batas waktu pengerjaan, dan koordinasi harian antar anggota kelompok.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PremiumExportButton
            data={tasks}
            columns={[
              { key: "title", label: "Judul Tugas" },
              { key: "programs", label: "Program Kerja", formatter: (v: any) => v ? v.title : "-" },
              { key: "members", label: "Penerima Tugas", formatter: (v: any) => v ? v.full_name : "-" },
              { key: "due_at", label: "Tenggat Waktu" },
              { key: "priority", label: "Prioritas" },
              { key: "status", label: "Status" },
              { key: "notes", label: "Catatan" }
            ]}
            filename="daftar_tugas_kkn"
            title="Daftar Pembagian Tugas Kelompok KKN"
          />
          <div className="flex items-center rounded-xl bg-[#030406] border border-white/5 p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${viewMode === "kanban" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Grid size={13} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${viewMode === "table" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
            >
              <List size={13} />
              <span>Tabel</span>
            </button>
          </div>
          <button
            onClick={() => {
              setEditingTaskId(null);
              setTitle("");
              setProgramId("");
              setDescription("");
              setAssignedMemberId("");
              setDeadline("");
              setPriority("Medium");
              setStatus("To Do");
              setNotes("");
              setShowForm(!showForm);
            }}
            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span>{showForm ? "Batal" : "Tambah Tugas"}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#030406]/80 p-4 rounded-2xl border border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-10 pr-4 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          >
            <option value="all">Semua Program Kerja</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          >
            <option value="all">Semua Penerima Tugas</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Low">Low (Rendah)</option>
            <option value="Medium">Medium (Sedang)</option>
            <option value="High">High (Tinggi)</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddTask}
            className="p-6 rounded-[2rem] bg-[#030406] border border-cyan-500/10 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {editingTaskId ? "Formulir Edit Penugasan" : "Formulir Tambah Penugasan Baru"}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Judul Tugas (Wajib)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Belanja bahan PMT stunting"
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Terkait Program Kerja</label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                >
                  <option value="">Hubungkan dengan Proker</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <PremiumMemberSelect
                  label="Penerima Tugas / PIC (Wajib)"
                  placeholder="Pilih Anggota Kelompok"
                  selectedId={assignedMemberId}
                  onChange={(id) => setAssignedMemberId(id)}
                  members={members}
                  required={true}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Batas Waktu / Deadline (Wajib)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Skala Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                >
                  <option value="Low">Low (Rendah)</option>
                  <option value="Medium">Medium (Sedang)</option>
                  <option value="High">High (Tinggi)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Status Tugas</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                >
                  <option value="To Do">To Do (Belum Dikerjakan)</option>
                  <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                  <option value="Completed">Completed (Selesai)</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Deskripsi Tugas</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Isi instruksi pengerjaan tugas secara rinkas..."
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              {/* Submitted By Selection Dropdown (REQUIRED BY SECTION 19) */}
              <div className="space-y-1.5">
                <PremiumMemberSelect
                  label="Nama Penginput / Submitted By (Wajib)"
                  placeholder="Pilih Anggota Penginput"
                  selectedId={submittedBy}
                  onChange={(id) => setSubmittedBy(id)}
                  members={members}
                  required={true}
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 shadow-[0_4px_15px_rgba(6,182,212,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>{editingTaskId ? "Simpan Perubahan" : "Simpan Tugas"}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Sinkronisasi daftar tugas kelompok...</span>
        </div>
      ) : tasks.length === 0 ? (
        <PremiumEmptyState
          title="Belum Ada Pembagian Tugas"
          description="Database tugas kelompok masih kosong. Mulai delegasikan tanggung jawab ke anggota kelompok sekarang untuk menyukseskan program kerja!"
          actionLabel="Tambah Tugas"
          onAction={() => setShowForm(true)}
          icon={CheckSquare}
          glowColor="indigo"
        />
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center bg-[#030406]/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
          <CheckSquare size={36} className="text-slate-650 mb-3" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Daftar Tugas Kosong</h3>
          <p className="text-xs text-slate-550 mt-1">Tidak ada tugas ditemukan dengan filter yang dipilih.</p>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban Board Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" id="tasks_kanban_grid">
          {["To Do", "In Progress", "Completed"].map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col);
            return (
              <div key={col} className="bg-[#030406]/80 p-5 rounded-[2rem] border border-white/5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="font-mono text-[10px] font-black text-white uppercase tracking-widest">
                      {col} ({columnTasks.length})
                    </span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {columnTasks.map(task => {
                      const overdue = isOverdue(task);
                      return (
                        <div
                          key={task.id}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-cyan-500/15 transition-all text-left flex flex-col justify-between relative group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <span className={`px-2 py-0.5 rounded text-[7.5px] font-mono font-black border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => startEdit(task)}
                                  className="p-1 rounded bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                                >
                                  <Edit size={10} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id, task.title)}
                                  className="p-1 rounded bg-red-950/20 text-red-400 border border-red-500/10 hover:bg-red-900/30 transition-all cursor-pointer"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-wide leading-snug">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-[10px] text-slate-450 mt-1 leading-normal truncate">{task.description}</p>
                              )}
                              {task.programs?.title && (
                                <span className="inline-flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded text-[7.5px] bg-cyan-950/50 text-cyan-400 font-mono font-bold uppercase tracking-wider">
                                  <Folder size={8} />
                                  <span>{task.programs.title}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
                            <span className="text-slate-400 flex items-center gap-1 uppercase font-bold">
                              <User size={10} className="text-slate-500" />
                              {task.members?.full_name || "Tidak Ada"}
                            </span>
                            <span className={`flex items-center gap-1 font-bold ${overdue ? "text-red-400 uppercase" : "text-slate-500"}`}>
                              <Clock size={10} />
                              {task.due_at || task.deadline}
                            </span>
                          </div>

                          {overdue && (
                            <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-slate-950 px-2 py-0.5 rounded-full text-[7.5px] font-mono font-black uppercase tracking-widest flex items-center gap-0.5 animate-pulse shadow-md">
                              <AlertTriangle size={8} />
                              <span>OVERDUE</span>
                            </div>
                          )}

                          {/* Quick workflow transition click targets */}
                          <div className="mt-3.5 flex items-center justify-end gap-1 border-t border-white/[0.03] pt-2">
                            {col !== "To Do" && (
                              <button
                                onClick={() => handleQuickStatusChange(task.id, task.title, col === "Completed" ? "In Progress" : "To Do")}
                                className="px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-all cursor-pointer"
                              >
                                &larr; Prev
                              </button>
                            )}
                            {col !== "Completed" && (
                              <button
                                onClick={() => handleQuickStatusChange(task.id, task.title, col === "To Do" ? "In Progress" : "Completed")}
                                className="px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
                              >
                                Next &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500">
                  Total Tugas: {columnTasks.length}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#030406]/80 text-[11px] font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-white/5 text-slate-400 text-[9px] uppercase tracking-widest">
                <th className="p-4 font-black">Judul Tugas</th>
                <th className="p-4 font-black">Program Kerja</th>
                <th className="p-4 font-black">Penerima Tugas</th>
                <th className="p-4 font-black">Batas Waktu</th>
                <th className="p-4 font-black">Prioritas</th>
                <th className="p-4 font-black">Status</th>
                <th className="p-4 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <tr key={task.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                    <td className="p-4">
                      <span className="font-extrabold text-white text-xs uppercase block">{task.title}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-xs">{task.description}</span>
                    </td>
                    <td className="p-4 text-cyan-400 uppercase">{task.programs?.title || "-"}</td>
                    <td className="p-4 uppercase text-slate-300">{task.members?.full_name || "-"}</td>
                    <td className="p-4">
                      <span className={overdue ? "text-red-400 font-extrabold" : "text-slate-400"}>
                        {task.due_at || task.deadline}
                      </span>
                      {overdue && <span className="block text-[8px] font-black text-red-500">OVERDUE</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black border uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 uppercase font-bold text-slate-350">{task.status}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(task)}
                          className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="p-2 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-900/30 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
