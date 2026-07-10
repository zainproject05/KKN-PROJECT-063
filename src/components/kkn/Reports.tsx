import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileSpreadsheet, Eye, Printer, Calendar, Download, Plus, Trash2, 
  CheckCircle, Clock, FileText, X, Search, Sliders, Edit, AlertCircle,
  Folder, Shield, Upload, ExternalLink, Link
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { PremiumEmptyState } from "../PremiumEmptyState";
import { PremiumExportButton } from "../PremiumExportButton";
import { PremiumMemberSelect } from "../PremiumMemberSelect";

export default function Reports() {
  // Core Tabs
  const [activeSubTab, setActiveSubTab] = useState<"logbook" | "documents" >(() => {
    const cached = sessionStorage.getItem("reports_active_subtab");
    if (cached === "documents") {
      sessionStorage.removeItem("reports_active_subtab");
      return "documents";
    }
    return "logbook";
  });

  // Common Lookups Data
  const [members, setMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // TAB 1: LOGBOOK/REPORTS STATE
  // ==========================================
  const [reports, setReports] = useState<any[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Report Form Inputs
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("Logbook Harian");
  const [reportProgramId, setReportProgramId] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [reportStatus, setReportStatus] = useState("Drafting");
  const [reportSubmittedBy, setReportSubmittedBy] = useState("");
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // ==========================================
  // TAB 2: DOCUMENT ARCHIVE STATE
  // ==========================================
  const [documents, setDocuments] = useState<any[]>([]);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docSearch, setDocSearch] = useState("");
  const [filterDocCategory, setFilterDocCategory] = useState("all");

  // Doc Form Inputs
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("Laporan");
  const [docDescription, setDocDescription] = useState("");
  const [docExternalUrl, setDocExternalUrl] = useState("");
  const [docSelectedMemberId, setDocSelectedMemberId] = useState("");
  const [docSelectedFile, setDocSelectedFile] = useState<File | null>(null);
  const [docProgramId, setDocProgramId] = useState("");
  const [docReportId, setDocReportId] = useState("");
  const [docTransactionId, setDocTransactionId] = useState("");
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  // ==========================================
  // REAL-TIME SYNC & LIFECYCLE
  // ==========================================
  useRealtimeRefresh(() => {
    if (activeSubTab === "logbook") {
      fetchReports();
    } else {
      fetchDocuments();
    }
  });

  useEffect(() => {
    fetchLookups();
    fetchReports();
    fetchDocuments();
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

      const { data: dbFinance } = await supabase
        .from("financial_transactions")
        .select("id, description, amount")
        .order("created_at", { ascending: false });
      setTransactions(dbFinance || []);
    } catch (err) {
      console.error("Error fetching lookups:", err);
    }
  };

  // ==========================================
  // TAB 1: LOGBOOK CRUDS
  // ==========================================
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          programs(title)
        `)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);

    if (!reportTitle.trim() || !reportSummary.trim() || !reportSubmittedBy) {
      setReportError("Harap isi semua kolom wajib (Judul, Ringkasan, Penginput).");
      return;
    }

    const payload = {
      title: reportTitle.trim(),
      report_type: reportType,
      program_id: reportProgramId || null,
      summary: reportSummary.trim(),
      content_jsonb: reportContent.trim() ? { text: reportContent.trim() } : null,
      status: reportStatus,
      created_by_member_id: reportSubmittedBy,
      updated_by_member_id: reportSubmittedBy
    };

    try {
      if (editingReportId) {
        const { error: updErr } = await supabase
          .from("reports")
          .update(payload)
          .eq("id", editingReportId);
        if (updErr) throw updErr;

        await supabase.from("activity_logs").insert([{
          message: `Memperbarui Laporan/Logbook: ${reportTitle.trim()}`,
          created_by_member_id: reportSubmittedBy
        }]);
      } else {
        const { error: insErr } = await supabase.from("reports").insert([payload]);
        if (insErr) throw insErr;

        await supabase.from("activity_logs").insert([{
          message: `Menerbitkan Laporan/Logbook Baru: ${reportTitle.trim()}`,
          created_by_member_id: reportSubmittedBy
        }]);
      }

      // Reset
      resetReportForm();
      fetchReports();
    } catch (err: any) {
      setReportError(err?.message || "Gagal menyimpan laporan.");
    }
  };

  const startEditReport = (rep: any) => {
    setEditingReportId(rep.id);
    setReportTitle(rep.title || "");
    setReportType(rep.report_type || "Logbook Harian");
    setReportProgramId(rep.program_id || "");
    setReportSummary(rep.summary || "");
    setReportStatus(rep.status || "Drafting");
    setReportSubmittedBy(rep.created_by_member_id || "");
    
    if (rep.content_jsonb && typeof rep.content_jsonb === "object") {
      setReportContent(rep.content_jsonb.text || "");
    } else {
      setReportContent("");
    }
    setShowReportForm(true);
  };

  const resetReportForm = () => {
    setReportTitle("");
    setReportSummary("");
    setReportContent("");
    setReportProgramId("");
    setReportSubmittedBy("");
    setEditingReportId(null);
    setReportError(null);
    setShowReportForm(false);
  };

  const handleDeleteReport = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus laporan "${title}"?`)) return;

    try {
      const { error: delErr } = await supabase.from("reports").delete().eq("id", id);
      if (delErr) throw delErr;

      await supabase.from("activity_logs").insert([{
        message: `Menghapus Laporan/Logbook: ${title}`
      }]);

      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Approved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Submitted": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default: return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  // ==========================================
  // TAB 2: DOCUMENT ARCHIVE CRUDS
  // ==========================================
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocError(null);

    if (file.size > 25 * 1024 * 1024) {
      setDocError("Ukuran file terlalu besar. Maksimum adalah 25MB.");
      return;
    }

    const allowedExtensions = ["pdf", "docx", "doc", "xlsx", "xls", "zip", "png", "jpg", "jpeg", "webp"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setDocError("Format berkas tidak didukung. Harap unggah PDF, DOCX, XLSX, ZIP, atau Gambar.");
      return;
    }

    setDocSelectedFile(file);
    if (!docTitle) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf("."));
      setDocTitle(nameWithoutExt || file.name);
    }
  };

  const handleAddOrUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError(null);

    if (!docTitle.trim()) {
      setDocError("Judul dokumen wajib diisi.");
      return;
    }
    if (!docCategory) {
      setDocError("Kategori dokumen wajib dipilih.");
      return;
    }
    
    const hasFile = docSelectedFile || (editingDoc && (editingDoc.storage_path || editingDoc.file_url));
    if (!hasFile && !docExternalUrl.trim()) {
      setDocError("Silakan pilih berkas atau masukkan tautan dokumen.");
      return;
    }

    if (!docSelectedMemberId) {
      setDocError("Nama penginput wajib dipilih.");
      return;
    }

    setDocUploading(true);

    try {
      let bucketId = editingDoc?.bucket_id || null;
      let storagePath = editingDoc?.storage_path || null;
      let finalFileUrl = editingDoc?.file_url || null;
      let originalFileName = editingDoc?.original_file_name || null;
      let mimeType = editingDoc?.mime_type || null;
      let fileSize = editingDoc?.file_size || null;

      if (docSelectedFile) {
        const fileExt = docSelectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `docs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("kkn-documents")
          .upload(filePath, docSelectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("kkn-documents")
          .getPublicUrl(filePath);

        bucketId = "kkn-documents";
        storagePath = filePath;
        finalFileUrl = publicUrl;
        originalFileName = docSelectedFile.name;
        mimeType = docSelectedFile.type;
        fileSize = docSelectedFile.size;
      }

      if (editingDoc) {
        const updatePayload: any = {
          title: docTitle.trim(),
          category: docCategory,
          description: docDescription?.trim() || null,
          external_url: docExternalUrl.trim() || null,
          program_id: docProgramId || null,
          report_id: docReportId || null,
          transaction_id: docTransactionId || null,
          updated_by_member_id: docSelectedMemberId
        };

        if (docSelectedFile) {
          updatePayload.bucket_id = bucketId;
          updatePayload.storage_path = storagePath;
          updatePayload.original_file_name = originalFileName;
          updatePayload.mime_type = mimeType;
          updatePayload.file_size = fileSize;
          updatePayload.file_url = finalFileUrl;
        }

        const { error: updateErr } = await supabase
          .from("documents")
          .update(updatePayload)
          .eq("id", editingDoc.id);

        if (updateErr) throw updateErr;

        await supabase.from("activity_logs").insert([{
          message: `Mengubah Dokumen: ${docTitle.trim()}`,
          created_by_member_id: docSelectedMemberId
        }]);

      } else {
        const documentPayload = {
          title: docTitle.trim(),
          category: docCategory,
          description: docDescription?.trim() || null,
          bucket_id: bucketId,
          storage_path: storagePath,
          external_url: docExternalUrl.trim() || null,
          original_file_name: originalFileName,
          mime_type: mimeType,
          file_size: fileSize,
          file_url: finalFileUrl,
          program_id: docProgramId || null,
          report_id: docReportId || null,
          transaction_id: docTransactionId || null,
          uploaded_by_member_id: docSelectedMemberId,
          updated_by_member_id: docSelectedMemberId
        };

        const { error: insertErr } = await supabase
          .from("documents")
          .insert(documentPayload);

        if (insertErr) throw insertErr;

        await supabase.from("activity_logs").insert([{
          message: `Mengunggah Dokumen Baru: ${docTitle.trim()}`,
          created_by_member_id: docSelectedMemberId
        }]);
      }

      resetDocForm();
      fetchDocuments();
    } catch (err: any) {
      console.error(err);
      setDocError("Dokumen gagal disimpan. Periksa koneksi Supabase.");
    } finally {
      setDocUploading(false);
    }
  };

  const startEditDoc = (doc: any) => {
    setEditingDoc(doc);
    setDocTitle(doc.title || "");
    setDocCategory(doc.category || "Laporan");
    setDocDescription(doc.description || "");
    setDocExternalUrl(doc.external_url || "");
    setDocSelectedMemberId(doc.updated_by_member_id || doc.uploaded_by_member_id || "");
    setDocProgramId(doc.program_id || "");
    setDocReportId(doc.report_id || "");
    setDocTransactionId(doc.transaction_id || "");
    setDocSelectedFile(null);
    setDocError(null);
    setShowDocForm(true);
  };

  const resetDocForm = () => {
    setDocTitle("");
    setDocCategory("Laporan");
    setDocDescription("");
    setDocExternalUrl("");
    setDocSelectedMemberId("");
    setDocSelectedFile(null);
    setDocProgramId("");
    setDocReportId("");
    setDocTransactionId("");
    setEditingDoc(null);
    setDocError(null);
    setShowDocForm(false);
  };

  const handleDeleteDoc = async (id: string, title: string, bucketId: string, storagePath: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${title}"?`)) return;

    try {
      if (bucketId && storagePath) {
        await supabase.storage.from(bucketId).remove([storagePath]);
      }

      const { error: delErr } = await supabase.from("documents").delete().eq("id", id);
      if (delErr) throw delErr;

      await supabase.from("activity_logs").insert([{
        message: `Menghapus Dokumen Arsip: ${title}`
      }]);

      fetchDocuments();
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const handleDownloadOrPreviewDoc = async (doc: any) => {
    try {
      if (doc.external_url) {
        window.open(doc.external_url, "_blank", "noopener,noreferrer");
        return;
      }

      if (doc.bucket_id && doc.storage_path) {
        const { data, error: signedUrlError } = await supabase.storage
          .from(doc.bucket_id)
          .createSignedUrl(doc.storage_path, 120);

        if (signedUrlError) throw signedUrlError;
        if (data?.signedUrl) {
          window.open(data.signedUrl, "_blank", "noopener,noreferrer");
        }
      } else if (doc.file_url) {
        window.open(doc.file_url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      console.error("Error generating signed URL:", err);
      alert("Gagal mengunduh dokumen: " + (err.message || "Masalah otorisasi berkas."));
    }
  };

  // Helper Lookups
  const getMemberName = (id: string) => {
    if (!id) return "-";
    const found = members.find(m => m.id === id);
    return found ? found.full_name : "-";
  };

  const getProgramTitle = (id: string) => {
    if (!id) return null;
    const found = programs.find(p => p.id === id);
    return found ? found.title : null;
  };

  const getReportTitle = (id: string) => {
    if (!id) return null;
    const found = reports.find(r => r.id === id);
    return found ? found.title : null;
  };

  const getTransactionDesc = (id: string) => {
    if (!id) return null;
    const found = transactions.find(t => t.id === id);
    return found ? `${found.description} (Rp ${found.amount?.toLocaleString()})` : null;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // ==========================================
  // FILTERS LOGIC
  // ==========================================
  const filteredReports = reports.filter(rep => {
    const term = reportSearch.toLowerCase();
    const matchSearch = 
      (rep.title || "").toLowerCase().includes(term) ||
      (rep.summary || "").toLowerCase().includes(term);

    const matchType = filterType === "all" || rep.report_type === filterType;
    const matchStatus = filterStatus === "all" || rep.status === filterStatus;

    return matchSearch && matchType && matchStatus;
  });

  const filteredDocuments = documents.filter(doc => {
    const term = docSearch.toLowerCase();
    const matchSearch = 
      (doc.title || "").toLowerCase().includes(term) || 
      (doc.category || "").toLowerCase().includes(term) ||
      (doc.description || "").toLowerCase().includes(term);
    const matchCategory = filterDocCategory === "all" || doc.category === filterDocCategory;
    return matchSearch && matchCategory;
  });

  const docCategories = ["Laporan", "Proposal", "Surat-menyurat", "Media/Desain", "Lain-lain"];

  return (
    <div className="space-y-6 text-left" id="reports_module_root">
      
      {/* 1. Header with Glassmorphic Tabs Toggle */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#0c1322]/80 via-[#040609]/95 to-slate-950 border border-white/[0.06] shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.02] rounded-full blur-[80px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-450 animate-ping" />
              <span className="text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
                REPORTS & DOCUMENTS CORE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mt-3 font-sans bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              {activeSubTab === "logbook" ? "Logbook & Progress Reports" : "Arsip Dokumen Kelompok"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {activeSubTab === "logbook" 
                ? "Rekam aktivitas harian tim KKN, draf draf rancangan laporan mingguan, dan kelola pertanggungjawaban kegiatan kelompok."
                : "Pusat penyimpanan berkas digital kelompok. Simpan proposal program, MoU kemitraan, surat dinas resmi, hingga media dokumentasi."
              }
            </p>
          </div>

          {/* Subtabs Controls */}
          <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-white/[0.05] shadow-[inset_1px_2px_4px_rgba(0,0,0,0.6)] shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setActiveSubTab("logbook");
                resetDocForm();
              }}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-mono font-black tracking-wider uppercase transition-all duration-200 flex items-center gap-2 ${
                activeSubTab === "logbook"
                  ? "bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30 shadow-md"
                  : "text-slate-450 hover:text-slate-200 border border-transparent"
              }`}
            >
              <FileText size={13} />
              <span>LOGBOOK KEGIATAN</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab("documents");
                resetReportForm();
              }}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-mono font-black tracking-wider uppercase transition-all duration-200 flex items-center gap-2 ${
                activeSubTab === "documents"
                  ? "bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30 shadow-md"
                  : "text-slate-450 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Folder size={13} />
              <span>ARSIP DOKUMEN</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SUBTAB VIEW 1: LOGBOOK KEGIATAN */}
      {/* ======================================================= */}
      {activeSubTab === "logbook" && (
        <div className="space-y-6" id="reports_logbook_pane">
          
          {/* Action Trigger Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base font-black text-white uppercase tracking-wider">Daftar Logbook & Laporan Kerja</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <PremiumExportButton
                data={reports}
                columns={[
                  { key: "created_at", label: "Tanggal Dibuat", formatter: (v: any) => v ? new Date(v).toLocaleDateString("id-ID") : "-" },
                  { key: "report_type", label: "Tipe Laporan" },
                  { key: "title", label: "Judul Laporan" },
                  { key: "summary", label: "Ringkasan" },
                  { key: "status", label: "Status" }
                ]}
                filename="laporan_logbook_kkn"
                title="Laporan Logbook & Kegiatan KKN"
              />
              <button
                onClick={() => {
                  setEditingReportId(null);
                  setReportTitle("");
                  setReportSummary("");
                  setReportContent("");
                  setReportProgramId("");
                  setReportSubmittedBy("");
                  setShowReportForm(!showReportForm);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                {showReportForm ? <X size={15} /> : <Plus size={15} />}
                <span>{showReportForm ? "Batal" : "Buat Logbook"}</span>
              </button>
            </div>
          </div>

          {/* Search Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#030406]/80 p-4 rounded-2xl border border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari draf laporan..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-10 pr-4 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
              >
                <option value="all">Semua Tipe Laporan</option>
                <option value="Logbook Harian">Logbook Harian</option>
                <option value="Laporan Mingguan">Laporan Mingguan</option>
                <option value="Laporan Akhir">Laporan Akhir</option>
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="Drafting">Drafting (Penyusunan)</option>
                <option value="Submitted">Submitted (Diajukan)</option>
                <option value="Approved">Approved (Disetujui DPL)</option>
              </select>
            </div>
          </div>

          {/* Form Overlay/Drawer */}
          <AnimatePresence>
            {showReportForm && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleAddReport}
                className="nm-card-3d p-6 space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest">
                    {editingReportId ? "Formulir Edit Laporan / Logbook" : "Formulir Penyusunan Laporan Baru"}
                  </h3>
                  <button type="button" onClick={resetReportForm} className="text-slate-500 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Judul Laporan / Aktivitas (Wajib)</label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="Contoh: Logbook Harian Kelompok Posko 1 Minggu Pertama"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tipe Laporan</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    >
                      <option value="Logbook Harian">Logbook Harian</option>
                      <option value="Laporan Mingguan">Laporan Mingguan</option>
                      <option value="Laporan Akhir">Laporan Akhir</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Asosiasi Program Kerja (Opsional)</label>
                    <select
                      value={reportProgramId}
                      onChange={(e) => setReportProgramId(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    >
                      <option value="">Tidak Ada Proker</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Status Laporan</label>
                    <select
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    >
                      <option value="Drafting">Drafting (Penyusunan)</option>
                      <option value="Submitted">Submitted (Diajukan)</option>
                      <option value="Approved">Approved (Disetujui)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <PremiumMemberSelect
                      label="Nama Penginput / Submitted By (Wajib)"
                      placeholder="Pilih Anggota Kelompok"
                      selectedId={reportSubmittedBy}
                      onChange={(id) => setReportSubmittedBy(id)}
                      members={members}
                      required={true}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Ringkasan Aktivitas / Hasil (Wajib)</label>
                    <input
                      type="text"
                      value={reportSummary}
                      onChange={(e) => setReportSummary(e.target.value)}
                      placeholder="Ringkasan singkat berupa capaian target dan agenda..."
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-3">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Konten / Isi Lengkap Laporan (Opsional)</label>
                    <textarea
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      placeholder="Isi narasi deskripsi details laporan kerja kelompok secara rinci..."
                      rows={4}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {reportError && <p className="text-xs text-red-400 font-mono font-extrabold">{reportError}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 shadow-[0_4px_15px_rgba(6,182,212,0.25)] flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    <span>{editingReportId ? "Simpan Perubahan" : "Simpan Laporan"}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Loader or Content */}
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Sinkronisasi logbook dan draf laporan...</span>
            </div>
          ) : reports.length === 0 ? (
            <PremiumEmptyState
              title="Belum Ada Logbook / Laporan"
              description="Belum ada logbook laporan KKN. Tulis catatan harian pertama Anda untuk mendokumentasikan kegiatan."
              actionLabel="Buat Laporan"
              onAction={() => setShowReportForm(true)}
              icon={FileText}
              glowColor="rose"
            />
          ) : filteredReports.length === 0 ? (
            <div className="py-16 text-center bg-[#030406]/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
              <FileText size={36} className="text-slate-650 mb-3" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Laporan Kosong</h3>
              <p className="text-xs text-slate-550 mt-1">Tidak ada laporan ditemukan dengan filter yang dipilih.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((rep) => {
                const hasText = rep.content_jsonb && typeof rep.content_jsonb === "object" && rep.content_jsonb.text;
                return (
                  <div
                    key={rep.id}
                    className="nm-card-3d p-5.5 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all text-left flex flex-col sm:flex-row sm:items-start justify-between gap-5 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/10 font-mono font-black uppercase tracking-wider">
                          {rep.report_type}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black border uppercase tracking-wider ${getStatusBadge(rep.status)}`}>
                          {rep.status}
                        </span>
                        {rep.programs?.title && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-900 text-slate-400 border border-white/5 font-mono font-black uppercase tracking-wider flex items-center gap-1">
                            <Folder size={8} />
                            <span>{rep.programs.title}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Calendar size={10} className="text-slate-500" />
                          <span>{new Date(rep.created_at || Date.now()).toLocaleDateString("id-ID")}</span>
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                          {rep.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{rep.summary}</p>
                        {hasText && (
                          <div className="mt-2.5 p-3 rounded-2xl bg-black border border-white/5 text-[11px] text-slate-500 font-mono leading-relaxed whitespace-pre-line max-h-24 overflow-y-auto">
                            {rep.content_jsonb.text}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                      <button
                        onClick={() => startEditReport(rep)}
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Edit Laporan"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(rep.id, rep.title)}
                        className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-900/30 transition-all cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* SUBTAB VIEW 2: ARSIP DOKUMEN */}
      {/* ======================================================= */}
      {activeSubTab === "documents" && (
        <div className="space-y-6" id="reports_documents_pane">
          
          {/* Action Trigger Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base font-black text-white uppercase tracking-wider">Repository Arsip Berkas Digital</h2>
            </div>
            
            <button
              onClick={() => {
                if (showDocForm) {
                  resetDocForm();
                } else {
                  setShowDocForm(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              {showDocForm ? <X size={15} /> : <Plus size={15} />}
              <span>{showDocForm ? "Batal" : "Unggah Arsip"}</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#030406]/80 p-4 rounded-2xl border border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari arsip dokumen..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-10 pr-4 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <select
                value={filterDocCategory}
                onChange={(e) => setFilterDocCategory(e.target.value)}
                className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                {docCategories.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Overlay */}
          <AnimatePresence>
            {showDocForm && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleAddOrUpdateDoc}
                className="nm-card-3d p-6 space-y-5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 opacity-60" />

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest">
                    {editingDoc ? "Formulir Ubah Arsip Berkas" : "Formulir Unggah Arsip Berkas Baru"}
                  </h3>
                  <button type="button" onClick={resetDocForm} className="text-slate-500 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Judul / Nama Dokumen (Wajib)</label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="Contoh: Proposal Program Kerja Kelompok 063"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Kategori Dokumen</label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    >
                      {docCategories.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest font-extrabold text-cyan-400">Berkas Digital (PDF/Word/Excel/ZIP/Img)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-grow flex items-center justify-center gap-2 p-3 rounded-xl bg-[#05070a] border border-dashed border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer font-mono text-xs">
                        <Upload size={14} />
                        <span className="truncate max-w-[150px]">{docSelectedFile ? docSelectedFile.name : (editingDoc?.original_file_name || "Pilih File")}</span>
                        <input
                          type="file"
                          onChange={handleDocFileChange}
                          className="hidden"
                        />
                      </label>
                      {(docSelectedFile || editingDoc?.storage_path) && (
                        <div className="px-3 py-1.5 rounded-lg bg-cyan-950/20 text-cyan-400 border border-cyan-500/25 font-mono text-[9px] font-black uppercase shrink-0">
                          FILE OK
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tautan Luar / External URL</label>
                    <input
                      type="url"
                      value={docExternalUrl}
                      onChange={(e) => setDocExternalUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <PremiumMemberSelect
                      label="Nama Penginput / Submitted By (Wajib)"
                      placeholder="Pilih Anggota Kelompok"
                      selectedId={docSelectedMemberId}
                      onChange={(id) => setDocSelectedMemberId(id)}
                      members={members}
                      required={true}
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-3">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Deskripsi Dokumen (Opsional)</label>
                    <textarea
                      rows={2}
                      value={docDescription}
                      onChange={(e) => setDocDescription(e.target.value)}
                      placeholder="Berikan keterangan singkat atau catatan penting mengenai berkas ini..."
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  {/* Connections */}
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest font-extrabold text-slate-500">Kaitkan ke Program Kerja</label>
                    <select
                      value={docProgramId}
                      onChange={(e) => setDocProgramId(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    >
                      <option value="">Tidak Ada</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest font-extrabold text-slate-500">Kaitkan ke Logbook Kegiatan</label>
                    <select
                      value={docReportId}
                      onChange={(e) => setDocReportId(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    >
                      <option value="">Tidak Ada</option>
                      {reports.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest font-extrabold text-slate-500">Kaitkan ke Transaksi Kas</label>
                    <select
                      value={docTransactionId}
                      onChange={(e) => setDocTransactionId(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                    >
                      <option value="">Tidak Ada</option>
                      {transactions.map(t => (
                        <option key={t.id} value={t.id}>{t.description} (Rp {t.amount?.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {docError && <p className="text-xs text-red-400 font-mono font-extrabold">{docError}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={docUploading}
                    className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 shadow-[0_4px_15px_rgba(6,182,212,0.25)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle size={15} />
                    <span>{docUploading ? "Sedang memproses..." : (editingDoc ? "Simpan Perubahan" : "Simpan Dokumen Arsip")}</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Loader or Documents List */}
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Sinkronisasi repositori arsip berkas...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-16 text-center bg-[#030406]/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
              <Folder size={36} className="text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Arsip Dokumen Kosong</h3>
              <p className="text-xs text-slate-550 mt-1">Belum ada berkas dokumen. Unggah proposal, surat, atau media dokumentasi kegiatan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDocuments.map((doc) => {
                const progTitle = getProgramTitle(doc.program_id);
                const repTitle = getReportTitle(doc.report_id);
                const txDesc = getTransactionDesc(doc.transaction_id);

                return (
                  <motion.div
                    key={doc.id}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="nm-card-3d p-5.5 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all flex flex-col justify-between text-left relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {doc.external_url ? <Link size={18} /> : <FileText size={18} />}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h4 className="text-sm font-black text-white uppercase tracking-wider truncate group-hover:text-cyan-300 transition-colors">
                            {doc.title}
                          </h4>
                          <p className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase mt-0.5 tracking-wider flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Folder size={10} />
                              <span>{doc.category}</span>
                            </span>
                            {doc.file_size && (
                              <>
                                <span className="text-slate-600 font-sans">•</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <span>SIZE: {formatBytes(doc.file_size)}</span>
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {doc.description && (
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans bg-black/30 border border-white/[0.02] p-2.5 rounded-xl">
                          {doc.description}
                        </p>
                      )}

                      {/* Connections details ledger */}
                      <div className="space-y-1.5 text-[10px] font-mono text-slate-500 bg-black/20 p-3 rounded-xl border border-white/[0.02]">
                        <div className="flex justify-between items-center">
                          <span>Submitted By:</span>
                          <span className="text-slate-300 font-extrabold">{getMemberName(doc.uploaded_by_member_id)}</span>
                        </div>
                        {doc.updated_by_member_id && doc.updated_by_member_id !== doc.uploaded_by_member_id && (
                          <div className="flex justify-between items-center">
                            <span>Updated By:</span>
                            <span className="text-slate-300 font-extrabold">{getMemberName(doc.updated_by_member_id)}</span>
                          </div>
                        )}
                        {progTitle && (
                          <div className="flex justify-between items-start gap-2 pt-1 border-t border-white/[0.04] mt-1.5">
                            <span className="shrink-0 text-cyan-500">PROKER:</span>
                            <span className="text-slate-400 text-right truncate max-w-[180px] font-semibold">{progTitle}</span>
                          </div>
                        )}
                        {repTitle && (
                          <div className="flex justify-between items-start gap-2 pt-1 border-t border-white/[0.04]">
                            <span className="shrink-0 text-indigo-400 font-bold">LOGBOOK:</span>
                            <span className="text-slate-400 text-right truncate max-w-[180px] font-semibold">{repTitle}</span>
                          </div>
                        )}
                        {txDesc && (
                          <div className="flex justify-between items-start gap-2 pt-1 border-t border-white/[0.04]">
                            <span className="shrink-0 text-amber-500 font-bold">TRANSAKSI:</span>
                            <span className="text-slate-400 text-right truncate max-w-[180px] font-semibold">{txDesc}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-4.5 pt-3 border-t border-white/[0.05]">
                      <button
                        onClick={() => handleDownloadOrPreviewDoc(doc)}
                        className="text-[10px] font-mono font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider hover:underline cursor-pointer bg-cyan-500/5 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/10 hover:border-cyan-500/20 transition-all duration-300"
                      >
                        <span>{doc.external_url ? "Buka Link" : "Unduh File"}</span>
                        {doc.external_url ? <ExternalLink size={11} /> : <Download size={11} />}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEditDoc(doc)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                          title="Edit Dokumen"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title, doc.bucket_id, doc.storage_path)}
                          className="p-1.5 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-900/30 transition-all cursor-pointer"
                          title="Hapus Dokumen"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
