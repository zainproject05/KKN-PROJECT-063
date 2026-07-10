import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Check, Sparkles, BookOpen, AlertCircle, Plus, Trash2, X, Globe, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { generateTemplate } from "../../utils/templateGenerator";

export default function ReportTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Language preferences state (Section 17)
  const [language, setLanguage] = useState<"id" | "en">("id");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useRealtimeRefresh(() => {
    fetchTemplates();
  });

  useEffect(() => {
    fetchTemplates();
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

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!sbErr && data && data.length > 0) {
        setTemplates(data);
      } else {
        // Fallback to static UMY templates as default
        const defaults = [
          {
            id: "proposal",
            title: "Proposal Kegiatan KKN (Standard UMY)",
            description: "Format baku proposal pengajuan program kerja tingkat desa/kecamatan kepada LPPM UMY.",
            file_url: "#",
            file_size: "142 KB",
            language: "id"
          },
          {
            id: "logbook",
            title: "Logbook Harian Anggota Kelompok",
            description: "Template logbook harian individu untuk melaporkan kontribusi waktu & kegiatan lapangan.",
            file_url: "#",
            file_size: "88 KB",
            language: "id"
          },
          {
            id: "lpj",
            title: "LPJ Keuangan & Pertanggungjawaban",
            description: "Format kuitansi, nota pembelian, rekapitulasi pengeluaran kas kelompok untuk kelayakan audit LPPM.",
            file_url: "#",
            file_size: "310 KB",
            language: "id"
          },
          {
            id: "final-report-en",
            title: "KKN Final Report Template (Academic English Edition)",
            description: "Standard Bab outline for international publication or English-medium final reporting.",
            file_url: "#",
            file_size: "1.2 MB",
            language: "en"
          }
        ];
        setTemplates(defaults);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (tpl: any) => {
    setDownloadedId(tpl.id);
    
    try {
      if (tpl.file_url === "#" || !tpl.file_url) {
        // Generate real professional template file on the fly
        const { blob, filename } = generateTemplate(tpl.id, tpl.title, tpl.description || tpl.desc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Use uploaded template url
        const link = document.createElement("a");
        link.href = tpl.file_url;
        link.setAttribute("download", `${tpl.title}.docx`);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Gagal mengunduh template:", err);
      alert("Terjadi kesalahan saat mengunduh berkas template.");
    } finally {
      setTimeout(() => {
        setDownloadedId(null);
      }, 1200);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `templates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("report-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("report-attachments")
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
      const dm = 2;
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB"];
      const i = Math.floor(Math.log(file.size) / Math.log(k));
      const formattedSize = parseFloat((file.size / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
      setFileSize(formattedSize);
      if (!title) {
        setTitle(file.name);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal mengunggah template: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !fileUrl || !submittedBy) {
      setError("Harap isi semua kolom wajib (Judul, Berkas, Penginput).");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      file_url: fileUrl,
      file_size: fileSize || "0 KB",
      language,
      created_by_member_id: submittedBy,
      updated_by_member_id: submittedBy
    };

    try {
      const { error: sbErr } = await supabase.from("report_templates").insert([payload]);
      if (sbErr) throw sbErr;

      setTitle("");
      setDescription("");
      setFileUrl("");
      setFileSize("");
      setShowForm(false);
      fetchTemplates();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan template baru.");
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (id.startsWith("proposal") || id.startsWith("logbook") || id.startsWith("lpj") || id.startsWith("final")) {
      alert("Template bawaan sistem tidak dapat dihapus.");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus template "${name}"?`)) return;

    try {
      const { error: delErr } = await supabase.from("report_templates").delete().eq("id", id);
      if (delErr) throw delErr;
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter based on language preference (Section 17)
  const filteredTemplates = templates.filter(t => t.language === language);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
            ACADEMIC RESOURCE CENTRE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2.5">
            Template & Panduan LPJ / Proposal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unduh draf baku standar Universitas Muhammadiyah Yogyakarta untuk proposal kegiatan, draf logbook harian, dan pertanggungjawaban LPJ keuangan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-[#030406] border border-white/5 p-1">
            <button
              onClick={() => setLanguage("id")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${language === "id" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Globe size={11} />
              <span>Bahasa Indonesia (ID)</span>
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${language === "en" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Globe size={11} />
              <span>English (EN)</span>
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span>{showForm ? "Batal" : "Tambah Template"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddTemplate}
            className="p-6 rounded-[2rem] bg-[#030406] border border-cyan-500/10 space-y-4 shadow-xl text-left"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                Formulir Unggah Template Panduan Baru
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Judul Template Baku (Wajib)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Template Laporan Keuangan LPJ Revisi"
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest font-extrabold text-cyan-400">Berkas Template (Wajib)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#05070a] border border-dashed border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer font-mono text-xs">
                    <Download size={14} />
                    <span>{uploading ? "Mengunggah..." : "Pilih File"}</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {fileUrl && (
                    <div className="px-3 py-1.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[9px] font-bold shrink-0">
                      OK
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Pilih Bahasa Pendukung</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "id" | "en")}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                >
                  <option value="id">Bahasa Indonesia (ID)</option>
                  <option value="en">Academic English (EN)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nama Penginput / Submitted By (Wajib)</label>
                <select
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                >
                  <option value="">Pilih Anggota Kelompok</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Deskripsi / Peruntukan Template</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan sistematika bab atau format lampiran berkas..."
                  className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 shadow-[0_4px_15px_rgba(6,182,212,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle size={15} />
                <span>Simpan Template</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5.5 rounded-[2rem] bg-[#030406]/85 border border-white/5 flex flex-col justify-between shadow-lg text-left"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider leading-relaxed">
                    {tpl.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium font-sans">
                    {tpl.description || tpl.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    className="p-2 rounded-lg bg-red-950/20 text-red-400 border border-red-500/10 hover:bg-red-900/30 transition-all cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4.5 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                <span>FORMAT: DOCX / XLSX</span>
                <span>SIZE: {tpl.file_size || tpl.size}</span>
              </div>
            </div>

            <div className="mt-5.5 pt-3.5 border-t border-white/5 flex justify-end">
              <button
                onClick={() => handleDownload(tpl)}
                disabled={downloadedId === tpl.id}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#0c101b] to-[#04060a] border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/35 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
              >
                {downloadedId === tpl.id ? <Check size={14} className="stroke-[3]" /> : <Download size={14} />}
                <span>{downloadedId === tpl.id ? "MENYIAPKAN..." : "UNDUH TEMPLATE"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
