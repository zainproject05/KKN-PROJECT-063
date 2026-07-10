import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Plus, Trash2, Megaphone, CheckCircle, X, ShieldAlert, 
  Search, Sliders, Edit, Pin, AlertCircle, FileText, Folder, Calendar
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [programId, setProgramId] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submittedBy, setSubmittedBy] = useState("");

  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useRealtimeRefresh(() => {
    fetchAnnouncements();
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const { data: dbMembers } = await supabase
        .from("members")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      setMembers(dbMembers || []);

      const { data: dbProgs } = await supabase
        .from("programs")
        .select("id, title")
        .order("title", { ascending: true });
      setPrograms(dbProgs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from("announcements")
        .select(`
          *,
          programs(title)
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (!sbErr && data) {
        setAnnouncements(data);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error(err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim() || !submittedBy) {
      setError("Harap isi semua kolom wajib (Judul, Konten, Penginput).");
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      priority,
      program_id: programId || null,
      is_pinned: isPinned,
      created_by_member_id: submittedBy,
      updated_by_member_id: submittedBy
    };

    try {
      if (editingAnnouncementId) {
        const { error: updErr } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editingAnnouncementId);
        if (updErr) throw updErr;

        await supabase.from("activity_logs").insert([{
          message: `Memperbarui Pengumuman: ${title.trim()}`,
          created_by_member_id: submittedBy
        }]);
      } else {
        const { error: insErr } = await supabase.from("announcements").insert([payload]);
        if (insErr) throw insErr;

        await supabase.from("activity_logs").insert([{
          message: `Menerbitkan Pengumuman Baru: ${title.trim()}`,
          created_by_member_id: submittedBy
        }]);
      }

      // Reset
      setTitle("");
      setContent("");
      setProgramId("");
      setIsPinned(false);
      setEditingAnnouncementId(null);
      setShowForm(false);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan pengumuman.");
    }
  };

  const startEdit = (ann: any) => {
    setEditingAnnouncementId(ann.id);
    setTitle(ann.title || "");
    setContent(ann.content || "");
    setPriority(ann.priority || "Medium");
    setProgramId(ann.program_id || "");
    setIsPinned(ann.is_pinned || false);
    setShowForm(true);
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`)) return;

    try {
      const { error: delErr } = await supabase.from("announcements").delete().eq("id", id);
      if (delErr) throw delErr;

      await supabase.from("activity_logs").insert([{
        message: `Menghapus Pengumuman: ${title}`
      }]);

      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      const { error: updErr } = await supabase
        .from("announcements")
        .update({ is_pinned: !currentPin })
        .eq("id", id);
      if (updErr) throw updErr;

      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredAnnouncements = announcements.filter(a => {
    const term = search.toLowerCase();
    const matchSearch = 
      (a.title || "").toLowerCase().includes(term) ||
      (a.content || "").toLowerCase().includes(term);

    const matchPriority = filterPriority === "all" || a.priority === filterPriority;

    return matchSearch && matchPriority;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "High": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-green-500/10 text-green-400 border-green-500/20";
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
            BULLETIN BOARD
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2.5">
            Papan Pengumuman KKN
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mading koordinasi digital. Terbitkan informasi penting, arahan DPL, maupun reminder deadline mendesak.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingAnnouncementId(null);
              setTitle("");
              setContent("");
              setProgramId("");
              setIsPinned(false);
              setShowForm(!showForm);
            }}
            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span>{showForm ? "Batal" : "Buat Pengumuman"}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#030406]/80 p-4 rounded-2xl border border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari mading..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-10 pr-4 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          >
            <option value="all">Semua Prioritas</option>
            <option value="High">Tinggi (High)</option>
            <option value="Medium">Sedang (Medium)</option>
            <option value="Low">Rendah (Low)</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddAnnouncement}
            className="p-6 rounded-[2rem] bg-[#030406] border border-cyan-500/10 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {editingAnnouncementId ? "Formulir Edit Pengumuman" : "Formulir Terbit Pengumuman Baru"}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Judul Pengumuman (Wajib)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Kedatangan DPL dan Lembar Evaluasi"
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tingkat Kepentingan</label>
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
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Asosiasi Program Kerja (Opsional)</label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                >
                  <option value="">Tidak Ada</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nama Penginput / Submitted By (Wajib)</label>
                <select
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                >
                  <option value="">Pilih Anggota</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 flex items-center pt-6 pl-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-400 font-mono text-xs uppercase font-bold select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Sematkan Pengumuman (PIN)</span>
                </label>
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Detail Informasi / Isi Pengumuman (Wajib)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ketik isi pesan maklumat pengumuman di sini..."
                  rows={4}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 shadow-[0_4px_15px_rgba(6,182,212,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle size={15} />
                <span>{editingAnnouncementId ? "Simpan Perubahan" : "Terbitkan Maklumat"}</span>
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
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Sinkronisasi mading koordinasi...</span>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="py-16 text-center bg-[#030406]/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
          <Megaphone size={36} className="text-slate-650 mb-3" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Papan Pengumuman Kosong</h3>
          <p className="text-xs text-slate-550 mt-1">Belum ada mading koordinasi yang diterbitkan oleh tim.</p>
        </div>
      ) : (
        /* Bulletins List */
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5.5 rounded-3xl bg-[#030406]/85 border text-left flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative overflow-hidden group ${ann.is_pinned ? "border-cyan-500/20" : "border-white/5"}`}
            >
              {ann.is_pinned && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500/10 to-transparent pl-8 pr-4 py-1.5 flex items-center gap-1">
                  <Pin size={10} className="text-cyan-400 animate-pulse fill-cyan-400" />
                  <span className="text-[8.5px] font-mono font-black text-cyan-300 uppercase tracking-widest">PINNED NOTICE</span>
                </div>
              )}

              <div className="space-y-3.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black border uppercase tracking-wider ${getPriorityBadge(ann.priority)}`}>
                    {ann.priority}
                  </span>
                  {ann.programs?.title && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-950/50 text-cyan-400 border border-cyan-500/10 font-mono font-black uppercase tracking-wider flex items-center gap-1">
                      <Folder size={8} />
                      <span>{ann.programs.title}</span>
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{new Date(ann.created_at || Date.now()).toLocaleDateString("id-ID")}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => handleTogglePin(ann.id, ann.is_pinned)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${ann.is_pinned ? "bg-cyan-500/15 border-cyan-500/25 text-cyan-400" : "bg-slate-900 border-white/5 text-slate-500 hover:text-white"}`}
                  title="Sematkan / Unpin"
                >
                  <Pin size={12} className={ann.is_pinned ? "fill-cyan-400" : ""} />
                </button>
                <button
                  onClick={() => startEdit(ann)}
                  className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Edit"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                  className="p-2 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-900/30 transition-all cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
