import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Plus, Trash2, Clock, MapPin, Tag, CheckCircle, X, 
  Search, Sliders, Edit, AlertCircle, ArrowUpRight, CalendarDays
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { PremiumEmptyState } from "../PremiumEmptyState";
import { PremiumExportButton } from "../PremiumExportButton";
import { PremiumMemberSelect } from "../PremiumMemberSelect";

export default function Agenda() {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setMinutes(0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");

  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useRealtimeRefresh(() => {
    fetchAgenda();
  });

  useEffect(() => {
    fetchAgenda();
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
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from("agendas")
        .select("*")
        .order("start_time", { ascending: true });
      
      if (!sbErr && data) {
        setAgendas(data);
      } else {
        setAgendas([]);
      }
    } catch (err) {
      console.error(err);
      setAgendas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !startTime || !endTime || !location.trim() || !submittedBy) {
      setError("Harap isi semua kolom wajib (Judul, Tanggal Mulai/Selesai, Lokasi, Penginput).");
      return;
    }

    if (new Date(startTime) > new Date(endTime)) {
      setError("Waktu selesai tidak boleh mendahului waktu mulai.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      start_time: startTime,
      end_time: endTime,
      location: location.trim(),
      created_by_member_id: submittedBy,
      updated_by_member_id: submittedBy
    };

    try {
      if (editingAgendaId) {
        const { error: updErr } = await supabase
          .from("agendas")
          .update(payload)
          .eq("id", editingAgendaId);
        if (updErr) throw updErr;

        await supabase.from("activity_logs").insert([{
          message: `Memperbarui Agenda Koordinasi: ${title.trim()}`,
          created_by_member_id: submittedBy
        }]);
      } else {
        const { error: insErr } = await supabase.from("agendas").insert([payload]);
        if (insErr) throw insErr;

        await supabase.from("activity_logs").insert([{
          message: `Membuat Agenda Baru: ${title.trim()}`,
          created_by_member_id: submittedBy
        }]);
      }

      // Reset
      setTitle("");
      setDescription("");
      setLocation("");
      setEditingAgendaId(null);
      setShowForm(false);
      fetchAgenda();
    } catch (err: any) {
      setError(err?.message || "Gagal menjadwalkan agenda.");
    }
  };

  const startEdit = (agenda: any) => {
    setEditingAgendaId(agenda.id);
    setTitle(agenda.title || "");
    setDescription(agenda.description || "");
    
    // Parse formatting safely
    if (agenda.start_time) {
      setStartTime(new Date(agenda.start_time).toISOString().slice(0, 16));
    }
    if (agenda.end_time) {
      setEndTime(new Date(agenda.end_time).toISOString().slice(0, 16));
    }
    
    setLocation(agenda.location || "");
    setShowForm(true);
  };

  const handleDeleteAgenda = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin membatalkan agenda "${name}"?`)) return;

    try {
      const { error: delErr } = await supabase.from("agendas").delete().eq("id", id);
      if (delErr) throw delErr;

      await supabase.from("activity_logs").insert([{
        message: `Membatalkan Agenda Koordinasi: ${name}`
      }]);

      fetchAgenda();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredAgendas = agendas.filter(a => {
    const term = search.toLowerCase();
    const matchSearch = 
      (a.title || "").toLowerCase().includes(term) ||
      (a.description || "").toLowerCase().includes(term) ||
      (a.location || "").toLowerCase().includes(term);

    const matchDate = !filterDate || (a.start_time && a.start_time.startsWith(filterDate));

    return matchSearch && matchDate;
  });

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "-";
    const dateObj = new Date(isoString);
    return dateObj.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
            KKN EVENT TRACKER
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2.5">
            Agenda Kegiatan & Rapat
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Atur koordinasi, agenda kunjungan DPL, penyuluhan masyarakat, hingga rapat evaluasi berkala.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PremiumExportButton
            data={agendas}
            columns={[
              { key: "start_time", label: "Waktu Mulai", formatter: (v: any) => v ? new Date(v).toLocaleString("id-ID") : "-" },
              { key: "end_time", label: "Waktu Selesai", formatter: (v: any) => v ? new Date(v).toLocaleString("id-ID") : "-" },
              { key: "title", label: "Agenda" },
              { key: "description", label: "Deskripsi" },
              { key: "location", label: "Lokasi" }
            ]}
            filename="agenda_kkn"
            title="Agenda & Kegiatan Koordinasi Kelompok KKN"
          />
          <button
            onClick={() => {
              setEditingAgendaId(null);
              setTitle("");
              setDescription("");
              setLocation("");
              setShowForm(!showForm);
            }}
            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span>{showForm ? "Batal" : "Buat Agenda"}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#030406]/80 p-4 rounded-2xl border border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari agenda, lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-10 pr-4 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddAgenda}
            className="p-6 rounded-[2rem] bg-[#030406] border border-cyan-500/10 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {editingAgendaId ? "Formulir Edit Jadwal Agenda" : "Formulir Tambah Jadwal Agenda Baru"}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nama Agenda / Kegiatan (Wajib)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kunjungan Lapangan DPL Pertama"
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Lokasi Pertemuan (Wajib)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Ruang Rapat Balai Desa"
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Waktu Mulai (Wajib)</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Waktu Selesai (Wajib)</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              {/* Submitted By (REQUIRED BY SECTION 19) */}
              <div className="space-y-1.5">
                <PremiumMemberSelect
                  label="Nama Penginput / Submitted By (Wajib)"
                  placeholder="Pilih Anggota Kelompok"
                  selectedId={submittedBy}
                  onChange={(id) => setSubmittedBy(id)}
                  members={members}
                  required={true}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Deskripsi / Detail Rapat</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail poin pembahasan atau instruksi tambahan..."
                  rows={2}
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
                <span>{editingAgendaId ? "Simpan Perubahan" : "Jadwalkan Agenda"}</span>
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
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Memuat jadwal agenda koordinasi...</span>
        </div>
      ) : agendas.length === 0 ? (
        <PremiumEmptyState
          title="Belum Ada Jadwal Agenda"
          description="Database agenda koordinasi kelompok masih kosong. Jadwalkan pertemuan, rapat evaluasi, atau penyuluhan perdana sekarang!"
          actionLabel="Buat Agenda"
          onAction={() => setShowForm(true)}
          icon={CalendarDays}
          glowColor="cyan"
        />
      ) : filteredAgendas.length === 0 ? (
        <div className="py-16 text-center bg-[#030406]/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
          <CalendarDays size={36} className="text-slate-650 mb-3" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Agenda Kosong</h3>
          <p className="text-xs text-slate-550 mt-1">Tidak ada agenda ditemukan dengan filter yang dipilih.</p>
        </div>
      ) : (
        /* Timeline Agenda list */
        <div className="space-y-4">
          {filteredAgendas.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-[#030406]/85 border border-white/5 hover:border-cyan-500/20 transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex flex-col items-center justify-center font-mono text-cyan-400 shrink-0">
                  <span className="text-[10px] uppercase font-black leading-none">
                    {new Date(item.start_time).toLocaleString("id-ID", { month: "short" })}
                  </span>
                  <span className="text-lg font-black leading-none mt-1">
                    {new Date(item.start_time).getDate()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{item.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1 uppercase">
                      <Clock size={11} className="text-slate-650" />
                      {formatDateTime(item.start_time)} s.d. {formatDateTime(item.end_time)}
                    </span>
                    <span className="flex items-center gap-1 uppercase">
                      <MapPin size={11} className="text-slate-650" />
                      {item.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => startEdit(item)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <Edit size={13} />
                </button>
                <button
                  onClick={() => handleDeleteAgenda(item.id, item.title)}
                  className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-900/30 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
