import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight, Printer, 
  AlertCircle, CheckCircle, X, Search, Edit, Check, Upload, FileText, Settings, Download
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { PremiumEmptyState } from "../PremiumEmptyState";
import { PremiumExportButton } from "../PremiumExportButton";
import { audio } from "../../utils/audioService";

// Helper function to compress image and convert it to Base64 data URL
const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      // PDF or non-image files get loaded as data URL as-is
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress quality to 0.7 for optimal base64 database length
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (error) => reject(error);
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function Finance() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Views
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetTypedText, setResetTypedText] = useState("");

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");

  // Form State
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Iuran Member");
  const [amount, setAmount] = useState<number>(0);
  const [displayAmount, setDisplayAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [programId, setProgramId] = useState("");
  const [description, setDescription] = useState("");
  const [proofPath, setProofPath] = useState<string | null>(null);
  const [proofExternalUrl, setProofExternalUrl] = useState("");
  const [submittedBy, setSubmittedBy] = useState("m1");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formProofSignedUrl, setFormProofSignedUrl] = useState<string | null>(null);

  // Lightbox Proof View State
  const [lightboxTransaction, setLightboxTransaction] = useState<any | null>(null);
  const [lightboxSignedUrl, setLightboxSignedUrl] = useState<string | null>(null);
  const [lightboxLoading, setLightboxLoading] = useState(false);

  // Action Pending State
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Silently sync from Supabase Realtime
  useRealtimeRefresh(() => {
    fetchTransactions(true);
  });

  useEffect(() => {
    fetchTransactions(false);
    fetchLookups();

    // Auto-load operator member id
    const activeMemberId = localStorage.getItem("kkn_active_member_id");
    if (activeMemberId) {
      setSubmittedBy(activeMemberId);
    }

    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, []);

  // Show Toast helper matching the project visual identity
  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    const toastContainerId = "finance-toast-container";
    let container = document.getElementById(toastContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = toastContainerId;
      container.className = "fixed top-5 right-5 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0";
      document.body.appendChild(container);
    } else {
      container.innerHTML = ""; // Replaces previous toast instantly
    }

    const toast = document.createElement("div");
    toast.className = `p-4 rounded-2xl bg-[#030406]/95 border ${
      type === "success" 
        ? "border-cyan-500/30 text-cyan-400" 
        : type === "error" 
        ? "border-red-500/30 text-red-400" 
        : "border-amber-500/30 text-amber-400"
    } shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-3 pointer-events-auto transition-all duration-300 ease-out opacity-100`;

    const iconColor = type === "success" ? "#22d3ee" : type === "error" ? "#f87171" : "#fbbf24";
    const iconSvg = type === "success" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
      : type === "error"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

    toast.innerHTML = `
      <div class="flex-shrink-0 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        ${iconSvg}
      </div>
      <div class="flex-grow min-w-0">
        <div class="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">KEUANGAN KKN</div>
        <div class="text-[11px] font-sans text-slate-200 mt-0.5 leading-relaxed font-semibold">
          ${message}
        </div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
        if (container && container.childElementCount === 0) {
          container.remove();
        }
      }, 300);
    }, 4000);
  };

  const fetchLookups = async () => {
    try {
      const { data: dbMembers } = await supabase
        .from("members")
        .select("id, full_name, nim")
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      setMembers(dbMembers || []);

      const { data: dbProgs } = await supabase
        .from("programs")
        .select("id, title")
        .order("title", { ascending: true });
      setPrograms(dbProgs || []);
    } catch (err) {
      console.error("Lookup error:", err);
    }
  };

  const fetchTransactions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from("financial_transactions")
        .select(`
          id,
          transaction_type,
          category,
          amount,
          transaction_date,
          program_id,
          description,
          proof_path,
          proof_external_url,
          created_by_member_id,
          updated_by_member_id,
          created_at,
          updated_at,
          programs(title)
        `)
        .order("transaction_date", { ascending: false });
      
      if (!sbErr && data) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Transactions load error:", err);
      setTransactions([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const cleanupLocalPreview = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ["png", "jpg", "jpeg", "webp", "pdf"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      showToast("Format file belum didukung.", "error");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("Ukuran file terlalu besar.", "error");
      return;
    }

    cleanupLocalPreview();

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setFormProofSignedUrl(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setAmount(0);
      setDisplayAmount("");
      return;
    }
    const numericVal = parseInt(rawValue, 10);
    
    setAmount(numericVal);
    setDisplayAmount(new Intl.NumberFormat("id-ID").format(numericVal));
    
    if (numericVal > 0 && formError && (formError.includes("Nominal") || formError.includes("nominal"))) {
      setFormError(null);
    }
  };

  const openFormForCreate = () => {
    audio.playSecondaryClick();
    cleanupLocalPreview();
    setEditingTransactionId(null);
    setTransactionType("expense");
    setCategory("Iuran Member");
    setAmount(0);
    setDisplayAmount("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setProgramId("");
    setDescription("");
    setProofPath(null);
    setProofExternalUrl("");
    setFormProofSignedUrl(null);
    setFormError(null);

    // Default to active member from local storage if exists
    const storedMemberId = localStorage.getItem("kkn_active_member_id");
    setSubmittedBy(storedMemberId || "m1");

    setShowForm(true);
  };

  const startEdit = async (tx: any) => {
    audio.playSecondaryClick();
    cleanupLocalPreview();
    setEditingTransactionId(tx.id);
    setTransactionType(tx.transaction_type === "income" ? "income" : "expense");
    setCategory(tx.category || "Iuran Member");
    setAmount(tx.amount || 0);
    setDisplayAmount(tx.amount ? new Intl.NumberFormat("id-ID").format(tx.amount) : "");
    setTransactionDate(tx.transaction_date || new Date().toISOString().split("T")[0]);
    setProgramId(tx.program_id || "");
    setDescription(tx.description || "");
    setProofPath(tx.proof_path);
    setProofExternalUrl(tx.proof_external_url || "");
    setSubmittedBy(tx.updated_by_member_id || tx.created_by_member_id || "m1");
    setFormError(null);
    
    if (tx.proof_path) {
      try {
        const { data } = await supabase.storage
          .from("financial-proofs")
          .createSignedUrl(tx.proof_path, 3600);
        setFormProofSignedUrl(data?.signedUrl || tx.proof_external_url || null);
      } catch (err) {
        console.error("Error loading signed URL for edit form:", err);
        setFormProofSignedUrl(tx.proof_external_url || null);
      }
    } else {
      setFormProofSignedUrl(tx.proof_external_url || null);
    }

    setShowForm(true);
  };

  const resolveTxPrograms = (tx: any, progsList: any[]) => {
    if (!tx) return tx;
    if (tx.program_id && !tx.programs) {
      const prog = progsList.find(p => p.id === tx.program_id);
      return {
        ...tx,
        programs: prog ? { id: prog.id, title: prog.title } : null
      };
    }
    return tx;
  };

  const createTransaction = async (payload: {
    transaction_type: "income" | "expense";
    category: string;
    amount: number;
    transaction_date: string;
    program_id?: string | null;
    description?: string | null;
    proof_path?: string | null;
    proof_external_url?: string | null;
    created_by_member_id?: string | null;
    updated_by_member_id?: string | null;
  }) => {
    const { data, error } = await supabase
      .from("financial_transactions")
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  const handleSaveTransaction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setFormError(null);

      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        throw new Error("Nominal transaksi wajib diisi.");
      }

      if (numericAmount > 999999999) {
        throw new Error("Nominal terlalu besar. Periksa kembali jumlah transaksi.");
      }

      if (!description.trim()) {
        throw new Error("Deskripsi transaksi wajib diisi.");
      }

      if (!submittedBy) {
        throw new Error("Nama penginput wajib dipilih.");
      }

      let uploadedProofPath: string | null = proofPath || null;
      let finalProofExternalUrl: string | null = proofExternalUrl.trim() || null;

      // Robust Compression & direct database base64 storage fallback + Storage Upload
      if (selectedFile) {
        setUploading(true);
        try {
          // 1. Convert to high-quality compressed Base64 data URL
          const base64Data = await compressAndGetBase64(selectedFile);
          finalProofExternalUrl = base64Data;
        } catch (err) {
          console.error("Image compression failed, using standard file details", err);
        }

        // 2. Also attempt upload to standard storage in background
        const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `transactions/temp-${Date.now()}/${Date.now()}-${sanitizedFileName}`;

        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("financial-proofs")
            .upload(storagePath, selectedFile, {
              upsert: false,
              contentType: selectedFile.type
            });

          if (!uploadError && uploadData) {
            uploadedProofPath = uploadData.path;
          }
        } catch (uploadErr) {
          console.error("Storage upload failed, falling back to secure base64:", uploadErr);
        }
      }

      let resultTx: any = null;

      if (editingTransactionId) {
        const updatePayload = {
          transaction_type: transactionType,
          category,
          amount: numericAmount,
          transaction_date: transactionDate,
          program_id: null,
          description: description.trim(),
          proof_path: uploadedProofPath,
          proof_external_url: finalProofExternalUrl,
          updated_by_member_id: submittedBy
        };

        const { data: updatedTx, error: updErr } = await supabase
          .from("financial_transactions")
          .update(updatePayload)
          .eq("id", editingTransactionId)
          .select()
          .single();

        if (updErr) throw updErr;
        resultTx = updatedTx;

        // Log action in background
        await supabase.from("activity_logs").insert([{
          message: `Memperbarui Transaksi Kas: Rp${numericAmount.toLocaleString()} (${description.trim()})`,
          created_by_member_id: submittedBy
        }]);

        // Client-side relation mapping
        const mappedTx = resolveTxPrograms(resultTx, programs);
        setTransactions(prev => prev.map(t => t.id === editingTransactionId ? mappedTx : t));
        showToast("Transaksi berhasil diperbarui.", "success");
      } else {
        const newTransaction = await createTransaction({
          transaction_type: transactionType as "income" | "expense",
          category,
          amount: numericAmount,
          transaction_date: transactionDate,
          program_id: null,
          description: description.trim(),
          proof_path: uploadedProofPath,
          proof_external_url: finalProofExternalUrl,
          created_by_member_id: submittedBy,
          updated_by_member_id: submittedBy
        });

        resultTx = newTransaction;

        // Log action in background
        await supabase.from("activity_logs").insert([{
          message: `Mencatat Transaksi Kas Baru: Rp${numericAmount.toLocaleString()} (${description.trim()})`,
          created_by_member_id: submittedBy
        }]);

        // Client-side relation mapping
        const mappedTx = resolveTxPrograms(resultTx, programs);
        setTransactions(prev => [mappedTx, ...prev]);
        showToast("Transaksi berhasil dicatat.", "success");
      }

      cleanupLocalPreview();
      setShowForm(false);
    } catch (error: any) {
      console.error("Finance transaction save failed:", error);
      const msg = error instanceof Error ? error.message : "Transaksi gagal disimpan. Silakan coba lagi.";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
      setUploading(false);
    }
  };

  const triggerDelete = (tx: any) => {
    audio.playSecondaryClick();
    setShowDeleteConfirm(tx);
  };

  const handleDeleteConfirmed = async () => {
    if (!showDeleteConfirm) return;
    setIsSaving(true);

    const txId = showDeleteConfirm.id;
    const pathToDelete = showDeleteConfirm.proof_path;

    try {
      await supabase
        .from("documents")
        .update({ transaction_id: null })
        .eq("transaction_id", txId);

      const { error: delErr } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", txId);

      if (delErr) throw delErr;

      setTransactions(prev => prev.filter(t => t.id !== txId));
      showToast("Transaksi berhasil dihapus.", "success");

      if (pathToDelete) {
        supabase.storage
          .from("financial-proofs")
          .remove([pathToDelete])
          .catch(e => console.error(e));
      }

      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      showToast(`Terjadi kesalahan: ${err?.message || "Gagal menghapus transaksi."}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfirmed = async () => {
    if (resetTypedText !== "HAPUS SEMUA KAS") {
      showToast("Teks konfirmasi tidak sesuai.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const { error: resetErr } = await supabase
        .from("financial_transactions")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (resetErr) throw resetErr;

      await supabase.from("activity_logs").insert([{
        message: "RESET SELURUH DATA TRANSAKSI KAS KELOMPOK KE RP0"
      }]);

      setTransactions([]);
      showToast("Seluruh data transaksi kas berhasil direset.", "success");
      setShowResetConfirm(false);
      setResetTypedText("");
    } catch (err) {
      console.error("Reset failed:", err);
      showToast("Gagal melakukan reset data kas.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const viewProofLightbox = async (tx: any) => {
    audio.playSecondaryClick();
    setLightboxTransaction(tx);
    setLightboxSignedUrl(null);
    setLightboxLoading(true);

    if (tx.proof_path) {
      try {
        const { data, error } = await supabase.storage
          .from("financial-proofs")
          .createSignedUrl(tx.proof_path, 3600);
        if (!error && data) {
          setLightboxSignedUrl(data.signedUrl);
        } else {
          console.error("Signed URL retrieval failed:", error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLightboxLoading(false);
      }
    } else {
      setLightboxLoading(false);
    }
  };

  // Calculations
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    const val = Number(t.amount) || 0;
    const type = (t.transaction_type || "").toLowerCase();
    if (type === "income") {
      totalIncome += val;
    } else {
      totalExpense += val;
    }
  });

  const netBalance = totalIncome - totalExpense;

  // Filter list
  const filteredTransactions = transactions.filter(t => {
    const term = search.toLowerCase();
    const matchSearch = 
      (t.description || "").toLowerCase().includes(term) || 
      (t.category || "").toLowerCase().includes(term);

    const type = (t.transaction_type || "").toLowerCase();
    const matchType = 
      filterType === "all" || 
      (filterType === "income" && type === "income") || 
      (filterType === "expense" && type === "expense");

    const matchCategory = filterCategory === "all" || t.category === filterCategory;
    const matchProgram = filterProgram === "all" || t.program_id === filterProgram;

    return matchSearch && matchType && matchCategory && matchProgram;
  });

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(absVal);
    
    return val < 0 ? `-${formatted}` : formatted;
  };

  // Highly Polished Formal PDF/Print Export Template with Official UMY KKN standards
  const handleCetakBuku = () => {
    audio.playPrimaryClick();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Gagal mencetak. Harap izinkan pop-up.", "error");
      return;
    }

    const totalIncomeFormatted = formatCurrency(totalIncome);
    const totalExpenseFormatted = formatCurrency(totalExpense);
    const netBalanceFormatted = formatCurrency(netBalance);

    const rowsHtml = filteredTransactions.map((tx, idx) => {
      const isInc = (tx.transaction_type || "").toLowerCase() === "income";
      return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace;">${tx.transaction_date}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${tx.description || "-"}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${tx.category || "-"}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; font-family: monospace; color: ${isInc ? "#10b981" : "#ef4444"};">
            ${isInc ? "+" : "-"} Rp${Number(tx.amount || 0).toLocaleString("id-ID")}
          </td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
      <html>
        <head>
          <title>Buku Kas Keuangan KKN - Kelompok 063</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
            body { 
              font-family: 'Plus Jakarta Sans', sans-serif; 
              padding: 50px; 
              color: #1e293b; 
              background-color: #ffffff; 
              line-height: 1.6;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              border-bottom: 3px double #0f172a;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .header-logo {
              width: 80px;
              text-align: center;
              vertical-align: middle;
            }
            .header-text {
              text-align: center;
              vertical-align: middle;
            }
            .header-text h1 { 
              margin: 0; 
              font-size: 20px; 
              font-weight: 800;
              text-transform: uppercase; 
              letter-spacing: 0.5px; 
              color: #0f172a; 
            }
            .header-text h2 { 
              margin: 4px 0 0; 
              font-size: 13px; 
              font-weight: 700; 
              color: #0891b2;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-text h3 {
              margin: 4px 0 0;
              font-size: 11px;
              font-weight: 500;
              color: #64748b;
            }
            .meta-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px; 
              font-size: 11px; 
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
            }
            .meta-info div { line-height: 1.8; }
            .kpi-container { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px; 
              margin-bottom: 35px; 
            }
            .kpi-card { 
              border: 1px solid #e2e8f0; 
              border-radius: 12px; 
              padding: 16px; 
              background-color: #ffffff;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .kpi-title { 
              font-size: 9px; 
              font-weight: 800; 
              text-transform: uppercase; 
              color: #64748b; 
              margin-bottom: 6px; 
              letter-spacing: 0.5px;
            }
            .kpi-value { 
              font-size: 18px; 
              font-weight: 800; 
              color: #0f172a; 
              font-family: 'JetBrains Mono', monospace;
            }
            table.ledger-table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 11px; 
              margin-bottom: 45px; 
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
            }
            table.ledger-table th { 
              background-color: #0f172a; 
              color: #ffffff; 
              text-align: left; 
              padding: 14px 10px; 
              font-weight: 700; 
              text-transform: uppercase; 
              letter-spacing: 0.5px;
              border: none;
            }
            table.ledger-table th:first-child {
              border-top-left-radius: 8px;
              border-bottom-left-radius: 8px;
            }
            table.ledger-table th:last-child {
              border-top-right-radius: 8px;
              border-bottom-right-radius: 8px;
            }
            table.ledger-table tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .signatures-container {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              page-break-inside: avoid;
            }
            .signature-block {
              text-align: center;
              width: 240px;
            }
            .signature-space {
              height: 75px;
            }
            .signature-line {
              border-bottom: 1.5px solid #0f172a;
              font-weight: 700;
              margin: 0 auto;
              width: 180px;
            }
            .footer { 
              border-top: 1px solid #e2e8f0; 
              padding-top: 20px; 
              text-align: center; 
              font-size: 10px; 
              color: #94a3b8; 
              margin-top: 60px;
            }
          </style>
        </head>
        <body>
          
          <!-- Kop Surat Resmi KKN UMY -->
          <table class="header-table">
            <tr>
              <td class="header-logo">
                <img src="https://upload.wikimedia.org/wikipedia/id/c/c5/Logo_UMY.png" alt="UMY Logo" style="height: 65px; object-contain: fit;" />
              </td>
              <td class="header-text">
                <h1>LAPORAN PERTANGGUNGJAWABAN KEUANGAN KELOMPOK</h1>
                <h2>KKN PERSYARIKATAN KELOMPOK 063</h2>
                <h3>Universitas Muhammadiyah Yogyakarta • Periode Operasional KKN 2026</h3>
              </td>
            </tr>
          </table>

          <div class="meta-info">
            <div>
              <strong>KATEGORI LAPORAN:</strong> BUKU BESAR KAS UTAMA KELOMPOK<br />
              <strong>FILTER ALIRAN DANA:</strong> ${filterType === "all" ? "Seluruh Aliran Dana (Debit & Kredit)" : filterType === "income" ? "Hanya Aliran Masuk (Debit)" : "Hanya Aliran Keluar (Kredit)"}<br />
              <strong>KATEGORI TRANSAKSI:</strong> ${filterCategory === "all" ? "Semua Kategori" : filterCategory}
            </div>
            <div style="text-align: right;">
              <strong>TANGGAL CETAK:</strong> ${new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br />
              <strong>WAKTU DOWNLOAD:</strong> ${new Date().toLocaleTimeString("id-ID")} WIB<br />
              <strong>JUMLAH REKOR DATA:</strong> ${filteredTransactions.length} Baris Pencatatan
            </div>
          </div>

          <!-- KPI Cards Grid -->
          <div class="kpi-container">
            <div class="kpi-card" style="border-top: 4px solid #10b981;">
              <div class="kpi-title">Total Aliran Debit (Pemasukan)</div>
              <div class="kpi-value" style="color: #10b981;">${totalIncomeFormatted}</div>
            </div>
            <div class="kpi-card" style="border-top: 4px solid #ef4444;">
              <div class="kpi-title">Total Aliran Kredit (Pengeluaran)</div>
              <div class="kpi-value" style="color: #ef4444;">${totalExpenseFormatted}</div>
            </div>
            <div class="kpi-card" style="border-top: 4px solid #06b6d4;">
              <div class="kpi-title">Sisa Saldo Kas Aktif</div>
              <div class="kpi-value" style="color: #0891b2;">${netBalanceFormatted}</div>
            </div>
          </div>

          <!-- Ledger Table -->
          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 15%; text-align: center;">Tanggal</th>
                <th style="width: 45%;">Deskripsi Transaksi</th>
                <th style="width: 20%;">Kategori Dana</th>
                <th style="width: 15%; text-align: right;">Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="5" style="text-align: center; padding: 25px; color: #94a3b8; font-weight: 500;">Belum ada pencatatan kas keuangan kelompok tercatat</td></tr>'}
            </tbody>
          </table>

          <!-- Official Signature Block -->
          <div class="signatures-container">
            <div class="signature-block">
              <p>Menyetujui & Mengetahui,</p>
              <p style="font-weight: 700; margin-top: 5px; color: #0f172a;">Ketua Kelompok KKN 063</p>
              <div class="signature-space"></div>
              <div class="signature-line"></div>
              <p style="margin-top: 6px; color: #64748b; font-weight: 600; font-size: 11px;">KOORDINATOR KELOMPOK</p>
            </div>
            <div class="signature-block">
              <p>Yogyakarta, ${new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="font-weight: 700; margin-top: 5px; color: #0f172a;">Bendahara Kelompok 063</p>
              <div class="signature-space"></div>
              <div class="signature-line"></div>
              <p style="margin-top: 6px; color: #64748b; font-weight: 600; font-size: 11px;">BENDAHARA UTAMA</p>
            </div>
          </div>

          <div class="footer">
            <p>Laporan ini merupakan dokumen pertanggungjawaban resmi yang dicetak secara digital melalui KKN Workspace Team Portal - Kelompok 063 © 2026</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const categories = ["Iuran Member", "Donasi", "Sponsorship", "Konsumsi", "Transportasi", "Perlengkapan", "Lain-lain"];

  return (
    <div className="space-y-6 text-left" id="finance-viewport">
      
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-white/[0.04]">
        <div className="space-y-1.5 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-400 text-[9px] font-mono font-black tracking-widest uppercase shadow-[inset_0_1px_4px_rgba(6,182,212,0.15)] border border-cyan-500/20">
            TREASURY LEDGER
          </span>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider mt-1.5 font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Buku Kas & Keuangan KKN
          </h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Transparan dan tertata. Kelola arus dana masuk, pengeluaran program kerja, dan rekam nota fisik kelompok 063.
          </p>
        </div>
        
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <div className="shrink-0">
            <PremiumExportButton
              data={filteredTransactions}
              columns={[
                { key: "transaction_date", label: "Tanggal" },
                { key: "description", label: "Keterangan" },
                { key: "category", label: "Kategori" },
                { key: "transaction_type", label: "Tipe", formatter: (v: any) => v === "income" ? "Pemasukan (+)" : "Pengeluaran (-)" },
                { key: "amount", label: "Jumlah (IDR)", formatter: (v: any) => v ? `Rp${Number(v).toLocaleString()}` : "Rp0" }
              ]}
              filename="keuangan_kkn"
              title="Arus Kas Keuangan Kelompok KKN"
            />
          </div>

          <button
            onClick={openFormForCreate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white hover:brightness-110 text-xs font-sans font-black uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(6,182,212,0.2)] border border-cyan-400/20 whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Slimmer, Highly Polished 3D Neumorphic Cash Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="finance_ledger_header">
        
        {/* Card 1: Income */}
        <div className="nm-card-3d p-6 relative overflow-hidden flex flex-col justify-between text-left border border-white/5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-emerald-500 block">
                Total Debit (Pemasukan)
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight leading-none mt-2 font-mono">
                {formatCurrency(totalIncome)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/[0.04] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.95)]">
              <ArrowUpRight size={20} className="text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Card 2: Expense */}
        <div className="nm-card-3d p-6 relative overflow-hidden flex flex-col justify-between text-left border border-white/5 transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-red-500 block">
                Total Kredit (Pengeluaran)
              </span>
              <div className="text-xl sm:text-2xl font-black text-red-400 tracking-tight leading-none mt-2 font-mono">
                {formatCurrency(totalExpense)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/[0.04] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.95)]">
              <ArrowDownRight size={20} className="text-red-400" />
            </div>
          </div>
        </div>

        {/* Card 3: Net Balance */}
        <div className="nm-card-3d p-6 relative overflow-hidden flex flex-col justify-between text-left border border-white/5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-cyan-400 block">
                Sisa Saldo Kas Aktif
              </span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 tracking-tight leading-none mt-2 font-mono">
                {formatCurrency(netBalance)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/[0.04] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.95)]">
              <Wallet size={20} className="text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Deficit Alert when balance is negative */}
      {netBalance < 0 && (
        <div className="p-4 rounded-xl nm-card-3d border border-red-500/20 text-red-400 flex items-start gap-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
          <div className="text-xs font-sans text-left">
            <span className="font-bold uppercase block text-[10px] tracking-wider">Kas Mengalami Defisit</span>
            Saldo kas saat ini bernilai negatif. Harap periksa kembali pencatatan pengeluaran atau tambahkan dana masuk.
          </div>
        </div>
      )}

      {/* Filters toolbar in Inward Neumorphic tray */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 nm-inset p-4 rounded-2xl">
        <div className="relative col-span-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari deskripsi, kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 font-mono text-xs text-white nm-input border border-white/[0.01] focus:outline-none focus:border-cyan-500/20 transition-all"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2.5 font-mono text-xs text-white nm-input border border-white/[0.01] focus:outline-none focus:border-cyan-500/20 transition-all cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-2.5 font-mono text-xs text-white nm-input border border-white/[0.01] focus:outline-none focus:border-cyan-500/20 transition-all cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Sinkronisasi buku kas keuangan kelompok...</span>
        </div>
      ) : transactions.length === 0 ? (
        <PremiumEmptyState
          title="Belum ada transaksi kas"
          description="Catat pemasukan atau pengeluaran pertama untuk mulai membangun buku kas kelompok."
          actionLabel="Catat Transaksi"
          onAction={openFormForCreate}
          icon={Wallet}
          glowColor="emerald"
        />
      ) : filteredTransactions.length === 0 ? (
        <div className="py-16 text-center nm-card-3d flex flex-col items-center justify-center">
          <Wallet size={36} className="text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak Ada Pencatatan</h3>
          <p className="text-xs text-slate-500 mt-1">Tidak ada rekam kas keuangan ditemukan dengan filter ini.</p>
        </div>
      ) : (
        /* Financial Ledger Table View in Premium 3D Neumorphic Container */
        <div className="nm-card-3d overflow-hidden text-[11px] font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#07090f] border-b border-white/[0.03] text-slate-400 text-[9px] uppercase tracking-widest">
                <th className="p-4 font-black">Tanggal</th>
                <th className="p-4 font-black">Keterangan</th>
                <th className="p-4 font-black">Kategori</th>
                <th className="p-4 font-black">Bukti</th>
                <th className="p-4 font-black">Nominal</th>
                <th className="p-4 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isInc = (tx.transaction_type || "").toLowerCase() === "income";
                return (
                  <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 text-slate-400 font-bold uppercase">{tx.transaction_date}</td>
                    <td className="p-4">
                      <span className="font-extrabold text-white text-xs uppercase block">{tx.description}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider bg-[#06080e] shadow-[inset_-1px_-1px_3px_rgba(255,255,255,0.01),_inset_1px_1px_3px_rgba(0,0,0,0.5)] border-white/[0.01]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {tx.proof_path || tx.proof_external_url ? (
                        <button
                          onClick={() => viewProofLightbox(tx)}
                          className="px-2 py-1 rounded text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-0.5 cursor-pointer shadow-[-1px_-1px_3px_rgba(255,255,255,0.01),_1px_1px_3px_rgba(0,0,0,0.4)]"
                        >
                          Lihat Bukti
                        </button>
                      ) : (
                        <span className="text-slate-600">Tidak ada bukti</span>
                      )}
                    </td>
                    <td className={`p-4 font-extrabold text-xs ${isInc ? "text-cyan-400" : "text-red-400"}`}>
                      {isInc ? "+" : "-"} {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(tx)}
                          className="p-2 rounded-lg bg-[#0b0e17] shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),_2px_2px_6px_rgba(0,0,0,0.5)] border border-white/[0.01] text-slate-400 hover:text-white transition-all active:shadow-[inset_-1px_-1px_4px_rgba(255,255,255,0.01),_1px_1px_4px_rgba(0,0,0,0.5)] cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => triggerDelete(tx)}
                          className="p-2 rounded-lg bg-[#0e0a0d] shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),_2px_2px_6px_rgba(0,0,0,0.5)] border border-red-500/10 text-red-400 hover:bg-red-900/30 transition-all active:shadow-[inset_-1px_-1px_4px_rgba(255,255,255,0.01),_1px_1px_4px_rgba(0,0,0,0.5)] cursor-pointer"
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

      {/* COMPACT & HIGHLY POLISHED CREATE & EDIT FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/85 z-[999] flex items-start justify-center p-4 pt-16 md:pt-24 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="nm-card-3d max-w-md w-full relative max-h-[85vh] flex flex-col overflow-hidden my-auto"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] p-5 shrink-0">
                <div>
                  <span className="text-[7.5px] font-mono font-black tracking-widest text-cyan-400 block uppercase">
                    {editingTransactionId ? "MUTASI ARUS KAS KKN" : "PENCATATAN BARU"}
                  </span>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mt-0.5 font-sans">
                    {editingTransactionId ? "Ubah Mutasi Kas" : "Catat Transaksi Kas"}
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    cleanupLocalPreview();
                    setShowForm(false);
                  }} 
                  className="p-1.5 rounded-xl bg-[#0b0e17] shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),_2px_2px_6px_rgba(0,0,0,0.5)] border border-white/[0.01] text-slate-400 hover:text-white transition-all active:shadow-[inset_-1px_-1px_4px_rgba(255,255,255,0.01),_inset_1px_1px_4px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form with scrollable body and fixed footer */}
              <form onSubmit={handleSaveTransaction} className="flex flex-col flex-1 min-h-0 text-left">
                
                {/* Scrollable Form Body */}
                <div className="overflow-y-auto flex-1 p-5 space-y-4">
                  
                  {/* Tipe Transaksi */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Tipe Transaksi</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value as "income" | "expense")}
                      className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="expense" className="bg-slate-950 text-white">Pengeluaran</option>
                      <option value="income" className="bg-slate-950 text-white">Pemasukan</option>
                    </select>
                  </div>

                  {/* Kategori */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Kategori Dana</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      {categories.map((c, idx) => (
                        <option key={idx} value={c} className="bg-slate-950 text-white">{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount / Nominal */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Nominal Transaksi (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500 font-bold">Rp</span>
                      <input
                        type="text"
                        value={displayAmount}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full h-11 nm-input pl-9 pr-4 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Tanggal Pencatatan
                    </label>
                    <input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full h-11 nm-input px-4 text-xs font-semibold"
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Keterangan / Deskripsi Transaksi
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (e.target.value.trim() && formError === "Deskripsi transaksi wajib diisi.") {
                          setFormError(null);
                        }
                      }}
                      placeholder="Contoh: Belanja bahan plang petunjuk jalan dusun..."
                      className="w-full h-11 nm-input px-4 text-xs font-semibold"
                    />
                  </div>

                  {/* Bukti Transaksi File Upload Section */}
                  <div className="border-t border-white/[0.04] pt-4 space-y-3">
                    <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest block">BUKTI TRANSAKSI (UNGGAH NOTA / PDF)</span>
                    
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#06080e] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.01),_inset_2px_2px_6px_rgba(0,0,0,0.6)] border border-dashed border-white/10 hover:border-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer font-mono text-xs">
                        <Upload size={14} className="text-cyan-400" />
                        <span className="font-sans font-bold text-[10px]">{uploading ? "Memproses berkas..." : "Ambil / Unggah Nota Fisik"}</span>
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-mono">Format PNG, JPG, WEBP, PDF (Max 10MB)</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      
                      {/* Active File Upload Previews */}
                      {localPreviewUrl && (
                        <div className="p-2 rounded-xl bg-[#0b0e17] shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),_2px_2px_6px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={15} className="text-cyan-400 shrink-0" />
                            <div className="truncate text-[10px] text-left">
                              <span className="text-white block truncate font-semibold font-sans">{selectedFile?.name}</span>
                              <span className="text-slate-500 font-mono">{(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={cleanupLocalPreview}
                            className="p-1 rounded bg-[#06080e] hover:text-red-400 text-slate-400 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Edit Current Proof Preview if exists */}
                    {!selectedFile && formProofSignedUrl && (
                      <div className="p-3 bg-[#080b12] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.01),_inset_2px_2px_6px_rgba(0,0,0,0.6)] rounded-xl border border-cyan-500/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-semibold font-sans">Bukti tersimpan saat ini aktif:</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setProofPath(null);
                              setProofExternalUrl("");
                              setFormProofSignedUrl(null);
                            }}
                            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer transition-colors border border-red-500/10"
                            title="Hapus berkas bukti"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compact Confirmation Summary Card - "Penginput" removed as requested */}
                  {amount > 0 && description.trim() && (
                    <div className="p-3.5 rounded-xl bg-[#080b12] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.01),_inset_2px_2px_6px_rgba(0,0,0,0.6)] border border-cyan-500/15 space-y-1.5 font-mono text-xs text-slate-300">
                      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 mb-1">
                        <Search size={10} />
                        <span>Ringkasan Konfirmasi Transaksi:</span>
                      </span>
                      <div>• <strong className="text-white font-sans">Jenis:</strong> {transactionType === "income" ? "Pemasukan" : "Pengeluaran"}</div>
                      <div>• <strong className="text-white font-sans">Nominal:</strong> <span className={transactionType === "income" ? "text-cyan-400 font-bold" : "text-red-400 font-bold"}>Rp{new Intl.NumberFormat("id-ID").format(amount)}</span></div>
                      <div>• <strong className="text-white font-sans">Kategori:</strong> {category}</div>
                      <div>• <strong className="text-white font-sans">Keterangan:</strong> {description}</div>
                    </div>
                  )}

                  {formError && (
                    <p className="text-xs text-red-400 font-mono flex items-center gap-1.5 bg-red-500/5 p-3 rounded-lg border border-red-500/15">
                      <AlertCircle size={12} className="text-red-400" />
                      <span>{formError}</span>
                    </p>
                  )}

                </div>

                {/* Footer buttons ALWAYS visible at the bottom */}
                <div className="flex justify-end gap-3 p-5 border-t border-white/[0.04] shrink-0 bg-[#0b0e17]">
                  <button
                    type="button"
                    onClick={() => {
                      cleanupLocalPreview();
                      setShowForm(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#0b0e17] shadow-[-3px_-3px_8px_rgba(255,255,255,0.02),_3px_3px_8px_rgba(0,0,0,0.5)] border border-white/[0.02] text-slate-400 hover:text-white text-xs font-mono font-bold uppercase transition-all active:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.01),_inset_2px_2px_5px_rgba(0,0,0,0.5)] active:translate-y-[1px] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || uploading || !amount || amount <= 0 || !description.trim() || !category || !transactionDate}
                    className="px-5.5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 text-xs font-sans font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-[-3px_-3px_10px_rgba(255,255,255,0.05),_3px_3px_10px_rgba(0,0,0,0.6)] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menyimpan...
                      </span>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        <span>{editingTransactionId ? "Simpan Perubahan" : "Simpan Arus Kas"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX PROOF VIEW MODAL IN 3D NEUMORPHIC STYLE */}
      <AnimatePresence>
        {lightboxTransaction && (
          <div className="fixed inset-0 bg-black/95 z-[9999] flex items-start justify-center p-4 pt-12 md:pt-20 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b0e17] border border-cyan-500/20 rounded-2xl max-w-xl w-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),_0_0_30px_rgba(6,182,212,0.15)] relative my-auto"
            >
              <div className="p-4 bg-gradient-to-r from-[#07090f] via-[#090d16] to-[#07090f] border-b border-cyan-500/10 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-cyan-400 block">BUKTI TRANSAKSI FISIK</span>
                  <h4 className="text-xs font-bold text-white uppercase truncate font-sans tracking-wide mt-0.5">{lightboxTransaction.description}</h4>
                </div>
                <button
                  onClick={() => {
                    setLightboxTransaction(null);
                    setLightboxSignedUrl(null);
                  }}
                  className="p-1.5 rounded-xl bg-[#0b0e17] shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),_2px_2px_6px_rgba(0,0,0,0.5)] border border-white/[0.01] hover:border-cyan-500/30 text-slate-400 hover:text-white transition-all active:shadow-[inset_-1px_-1px_4px_rgba(255,255,255,0.01),_inset_1px_1px_4px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Lightbox Content Container - prioritized Base64 secure render */}
              <div className="p-6 bg-[#06080e] flex flex-col items-center justify-center min-h-[300px]">
                {lightboxLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <svg className="animate-spin h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-2">Sinkronisasi berkas lampiran aman...</span>
                  </div>
                ) : (
                  <>
                    {/* Priority 1: Base64 secure data URL */}
                    {lightboxTransaction.proof_external_url?.startsWith("data:") ? (
                      <div className="w-full max-h-[500px] bg-[#030407] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] rounded-xl overflow-y-auto border border-cyan-500/10 flex items-center justify-center p-2">
                        <img
                          src={lightboxTransaction.proof_external_url}
                          alt="Bukti Asli"
                          className="max-w-full max-h-[460px] object-contain rounded-lg shadow-md transition-all duration-300 hover:scale-[1.01]"
                        />
                      </div>
                    ) : lightboxTransaction.proof_path ? (
                      /* Priority 2: Storage Path (Render PDF fallback or direct Image) */
                      <>
                        {lightboxTransaction.proof_path.toLowerCase().endsWith(".pdf") ? (
                          <div className="text-center p-8 space-y-4 w-full bg-[#030407] rounded-xl border border-cyan-500/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                            <div className="w-16 h-16 rounded-2xl bg-[#0b0e17] shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),_2px_2px_6px_rgba(0,0,0,0.5)] border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                              <FileText size={32} />
                            </div>
                            <div className="text-xs font-mono">
                              <span className="text-white block font-bold uppercase tracking-wider">Format File PDF</span>
                              <p className="text-slate-400 text-[10px] mt-1.5">Bukti dalam format dokumen PDF.</p>
                            </div>
                            {lightboxSignedUrl && (
                              <a
                                href={lightboxSignedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black tracking-wider text-[10px] uppercase shadow-md transition-all active:scale-95 mt-2"
                              >
                                <Download size={13} />
                                <span>Buka / Unduh PDF</span>
                              </a>
                            )}
                          </div>
                        ) : lightboxSignedUrl ? (
                          <div className="w-full h-[380px] sm:h-[480px] bg-[#030407] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border border-cyan-500/10 relative flex items-center justify-center p-2">
                            <img
                              src={lightboxSignedUrl}
                              alt="Bukti"
                              className="max-w-full max-h-full object-contain rounded-lg transition-all duration-300 hover:scale-[1.01]"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = document.getElementById("lightbox-fallback-text");
                                if (fallback) fallback.style.display = "block";
                              }}
                            />
                            <div id="lightbox-fallback-text" className="hidden text-center text-slate-500 text-[10px]">
                              Preview tidak tersedia
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Preview tidak tersedia</span>
                        )}
                      </>
                    ) : lightboxTransaction.proof_external_url ? (
                      /* Priority 3: External URL */
                      <div className="w-full h-[380px] sm:h-[480px] bg-[#030407] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border border-cyan-500/10 flex items-center justify-center p-2">
                        <img
                          src={lightboxTransaction.proof_external_url}
                          alt="Bukti Eksternal"
                          className="max-w-full max-h-full object-contain rounded-lg transition-all duration-300 hover:scale-[1.01]"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = document.getElementById("lightbox-fallback-text-ext");
                            if (fallback) fallback.style.display = "block";
                          }}
                        />
                        <div id="lightbox-fallback-text-ext" className="hidden text-center text-slate-500 text-[10px]">
                          Preview tidak tersedia
                        </div>
                      </div>
                    ) : (
                      /* Priority 4: Neutral state */
                      <div className="p-10 text-center text-slate-500 text-xs font-mono">
                        Belum ada bukti transaksi.
                      </div>
                    )}

                    {/* Premium Metadata Grid Display */}
                    <div className="mt-5 w-full bg-[#080b12]/95 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)] p-4 rounded-xl border border-cyan-500/10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
                      <div className="space-y-1 bg-[#05070a]/60 p-2.5 rounded-lg border border-white/[0.02]">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">NOMINAL</span>
                        <span className="text-cyan-400 font-bold font-mono text-sm">
                          Rp{Number(lightboxTransaction.amount).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="space-y-1 bg-[#05070a]/60 p-2.5 rounded-lg border border-white/[0.02]">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">KATEGORI</span>
                        <span className="text-slate-200 font-semibold truncate block">
                          {lightboxTransaction.category}
                        </span>
                      </div>
                      <div className="space-y-1 bg-[#05070a]/60 p-2.5 rounded-lg border border-white/[0.02]">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">TANGGAL REKOR</span>
                        <span className="text-slate-300 font-mono">
                          {lightboxTransaction.transaction_date}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DESTRUCTIVE DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0e17] border border-red-500/15 rounded-3xl max-w-sm w-full p-6 shadow-[-10px_-10px_30px_rgba(255,255,255,0.02),_10px_10px_30px_rgba(0,0,0,0.8)] relative text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#080a10] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.02),_inset_2px_2px_6px_rgba(0,0,0,0.6)] border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
                <Trash2 size={22} />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 font-sans">Hapus Transaksi Kas?</h4>
              
              <div className="my-4 p-3 bg-[#06080e] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.01),_inset_2px_2px_6px_rgba(0,0,0,0.6)] rounded-xl border border-white/[0.01] font-mono text-[10px] text-left text-slate-400 space-y-1">
                <div>• <strong className="text-white font-sans">Tanggal:</strong> {showDeleteConfirm.transaction_date}</div>
                <div>• <strong className="text-white font-sans">Keterangan:</strong> {showDeleteConfirm.description}</div>
                <div>• <strong className="text-white font-sans">Kategori:</strong> {showDeleteConfirm.category}</div>
                <div>• <strong className="text-white font-sans">Nominal:</strong> <span className="text-red-400 font-bold">Rp{Number(showDeleteConfirm.amount).toLocaleString("id-ID")}</span></div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-sans">
                Yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0e17] shadow-[-3px_-3px_8px_rgba(255,255,255,0.02),_3px_3px_8px_rgba(0,0,0,0.5)] border border-white/[0.02] text-slate-400 hover:text-white text-xs font-mono font-bold uppercase transition-all active:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.01),_inset_2px_2px_5px_rgba(0,0,0,0.5)] active:translate-y-[1px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-mono font-bold uppercase transition-all disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
                >
                  {isSaving ? "Menghapus..." : "Hapus Transaksi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DESTRUCTIVE RESET ALL KAS CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0e17] border border-red-500/20 rounded-3xl max-w-md w-full p-6 shadow-[-10px_-10px_30px_rgba(255,255,255,0.02),_10px_10px_30px_rgba(0,0,0,0.8)] relative text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#080a10] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.02),_inset_2px_2px_6px_rgba(0,0,0,0.6)] border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
                <AlertCircle size={22} />
              </div>
              <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-2 font-sans">Tindakan Sangat Destruktif</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
                Tindakan ini akan menghapus seluruh transaksi kas kelompok. Saldo, pemasukan, dan pengeluaran akan kembali Rp0.
              </p>

              <div className="p-3 bg-[#0f0a0a] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.01),_inset_2px_2px_6px_rgba(0,0,0,0.6)] rounded-xl border border-red-500/15 text-left mb-4">
                <p className="text-[10px] text-red-300 leading-relaxed font-mono">
                  <strong>PENTING:</strong> Tindakan ini hanya menghapus tabel transaksi kas keuangan kelompok. Anggota kelompok, program kerja, presensi kehadiran, laporan kerja, dan berkas arsip lainnya akan tetap tersimpan aman.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block text-left">
                  Ketik teks berikut untuk konfirmasi: <strong className="text-white block font-mono text-[10.5px] tracking-wide mt-1 select-none">HAPUS SEMUA KAS</strong>
                </label>
                <input
                  type="text"
                  value={resetTypedText}
                  onChange={(e) => setResetTypedText(e.target.value)}
                  placeholder="Ketik persis di sini..."
                  className="w-full p-3 font-mono text-xs text-white bg-[#06080e] shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.01),_inset_2px_2px_6px_rgba(0,0,0,0.6)] border border-red-500/20 focus:border-red-500/50 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetTypedText("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0e17] shadow-[-3px_-3px_8px_rgba(255,255,255,0.02),_3px_3px_8px_rgba(0,0,0,0.5)] border border-white/[0.02] text-slate-400 hover:text-white text-xs font-mono font-bold uppercase transition-all active:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.01),_inset_2px_2px_5px_rgba(0,0,0,0.5)] active:translate-y-[1px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetConfirmed}
                  disabled={isSaving || resetTypedText !== "HAPUS SEMUA KAS"}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-mono font-bold uppercase transition-all disabled:opacity-30 cursor-pointer shadow-md active:scale-95"
                >
                  {isSaving ? "Mereset..." : "RESET SELURUH KAS"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
