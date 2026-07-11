import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, XCircle, Calendar, Check, X, CheckCircle, Clock, Plus, Trash2, 
  UserCheck, AlertCircle, RefreshCw, ClipboardList, Info,
  MapPin, Eye, FileText, Users, Printer, Folder, ChevronDown, ChevronUp, Lock, Unlock, Camera, Copy
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { audio } from "../../utils/audioService";
import { SessionCountdown } from "./SessionCountdown";
import { PremiumExportButton } from "../PremiumExportButton";
import { 
  parseSession, 
  serializeSession, 
  parseRecord, 
  serializeRecord 
} from "../../utils/attendanceHelper";

// Status translation mapping
const STATUS_MAP: Record<string, string> = {
  "Hadir": "present",
  "Izin": "permission",
  "Sakit": "sick",
  "Alfa": "absent"
};

const REV_STATUS_MAP: Record<string, string> = {
  "present": "Hadir",
  "permission": "Izin",
  "sick": "Sakit",
  "absent": "Alfa",
  "Present": "Hadir",
  "Permission": "Izin",
  "Sick": "Sakit",
  "Absent": "Alfa"
};

export default function Attendance() {
  const [members, setMembers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRecapExpanded, setIsRecapExpanded] = useState(true);
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);
  const [autoClosedMessage, setAutoClosedMessage] = useState(false);

  // Premium Custom Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {}
  });

  const triggerConfirm = (
    title: string,
    message: string,
    type: "success" | "danger" | "warning" | "info",
    onConfirm: () => void
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Form State for Session Creation
  const [activityName, setActivityName] = useState("");
  const [relatedProgramId, setRelatedProgramId] = useState("");
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [opensAt, setOpensAt] = useState("08:00");
  const [closesAt, setClosesAt] = useState("10:00");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [requireGps, setRequireGps] = useState(true);
  const [requireSelfie, setRequireSelfie] = useState(true);
  const [requirePhotoFaceCheck, setRequirePhotoFaceCheck] = useState(true);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);
  const [submittedBy, setSubmittedBy] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Helper to trigger elegant single toast notifications (Top-Right, replaces old)
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const toastContainerId = "attendance-toast-container";
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
      type === "success" ? "border-cyan-500/30 text-cyan-400" : type === "error" ? "border-red-500/30 text-red-400" : type === "warning" ? "border-amber-500/30 text-amber-400" : "border-white/10 text-slate-300"
    } shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-3 pointer-events-auto transition-all duration-300 ease-out`;

    const iconColor = type === "success" ? "#22d3ee" : type === "error" ? "#f87171" : type === "warning" ? "#fbbf24" : "#94a3b8";
    const iconSvg = type === "success" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
      : type === "error"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
      : type === "warning"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    toast.innerHTML = `
      <div class="flex-shrink-0 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        ${iconSvg}
      </div>
      <div class="flex-grow min-w-0">
        <div class="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">PRESENSI KKN</div>
        <div class="text-[11px] font-sans text-slate-200 mt-0.5 leading-relaxed font-semibold">
          ${message}
        </div>
      </div>
    `;

    container.appendChild(toast);

    const dismiss = () => {
      toast.className = toast.className.replace("opacity-100", "opacity-0");
      setTimeout(() => {
        toast.remove();
        if (container && container.childElementCount === 0) {
          container.remove();
        }
      }, 300);
    };

    setTimeout(dismiss, 3000);
  };

  // Subscribe to real-time events on Supabase silently
  useRealtimeRefresh(() => {
    fetchData();
    setShowSyncIndicator(true);
    setTimeout(() => setShowSyncIndicator(false), 3000);
  });

  const handlePresentAll = async (session: any) => {
    if (session.status === "closed") {
      showToast("Sesi presensi sudah ditutup.", "error");
      return;
    }
    if (!confirm("Yakin ingin menandai semua anggota sebagai Hadir?")) return;
    try {
      for (const member of members) {
        const payload = {
          attendance_session_id: session.id,
          member_id: member.id,
          attendance_status: "present",
          notes: "Ditandai hadir manual secara massal oleh admin",
          check_in_at: new Date().toISOString(),
          attendance_source: "admin_manual_bulk",
          verification_status: "manual_verified",
          location_verified: false,
          selfie_verified: false,
          photo_verified: false,
          updated_by_member_id: null
        };
        const { error } = await supabase.from("attendance_records").upsert(payload, { onConflict: 'attendance_session_id, member_id' });
        if (error) {
           const { data: exist } = await supabase.from("attendance_records")
             .select("id").eq("attendance_session_id", session.id).eq("member_id", member.id).single();
           if (exist) {
             await supabase.from("attendance_records").update(payload).eq("id", exist.id);
           } else {
             await supabase.from("attendance_records").insert(payload);
           }
        }
      }
      showToast("Semua anggota telah ditandai Hadir.");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Gagal menandai semua anggota.", "error");
    }
  };

  const handleResetAll = async (session: any) => {
    if (!confirm("Yakin ingin mereset semua presensi untuk sesi ini? Ini akan menghapus semua record untuk sesi ini.")) return;
    try {
      await supabase
        .from("attendance_records")
        .delete()
        .eq("attendance_session_id", session.id);
      showToast("Presensi berhasil di-reset.");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Gagal mereset presensi.", "error");
    }
  };

  const handleDeleteSession = async (session: any) => {
    if (!confirm("Yakin ingin menghapus sesi ini beserta semua presensinya?")) return;
    try {
      await supabase.from("attendance_sessions").delete().eq("id", session.id);
      showToast("Sesi berhasil dihapus.");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus sesi.", "error");
    }
  };

  const handleCloseSessionNow = async (session: any) => {
    if (!confirm("Yakin ingin menutup sesi ini sekarang?")) return;
    try {
      await supabase.from("attendance_sessions").update({ status: "closed" }).eq("id", session.id);
      showToast("Sesi berhasil ditutup.");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Gagal menutup sesi.", "error");
    }
  };

  const handleOpenSessionNow = async (session: any) => {
    if (!confirm("Yakin ingin membuka sesi ini sekarang?")) return;
    try {
      await supabase.from("attendance_sessions").update({ status: "open" }).eq("id", session.id);
      showToast("Sesi berhasil dibuka kembali.");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Gagal membuka sesi.", "error");
    }
  };

  const getMemberPhotoUrl = (member: any) => {
    if (member.photo_url && member.photo_url.trim() !== "") {
      return member.photo_url;
    }
    if (member.photo_path && member.photo_path.trim() !== "") {
      const { data } = supabase.storage.from("members").getPublicUrl(member.photo_path);
      return data?.publicUrl || null;
    }
    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Active Members with strict column selections
      const { data: dbMembers } = await supabase
        .from("members")
        .select(`
          id,
          full_name,
          nim,
          whatsapp_number,
          gender,
          faculty,
          study_program,
          photo_url,
          photo_path,
          is_active,
          is_public_profile
        `)
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      const activeMembers = dbMembers || [];
      setMembers(activeMembers);

      if (activeMembers.length > 0) {
        setSubmittedBy(activeMembers[0].id);
      }

      // 2. Fetch Programs
      const { data: dbPrograms } = await supabase
        .from("programs")
        .select("id, title")
        .order("title", { ascending: true });
      setPrograms(dbPrograms || []);

      // 3. Fetch All Records
      const { data: dbRecords } = await supabase
        .from("attendance_records")
        .select("*");
      setAllRecords((dbRecords || []).map(parseRecord));

      // 4. Fetch Sessions
      const { data: dbSessions } = await supabase
        .from("attendance_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      
      const sessionList = (dbSessions || []).map(parseSession);
      setSessions(sessionList);

      // Auto-select session
      if (sessionList.length > 0) {
        const activeSess = sessionList.find(s => s.status === "open") || sessionList[0];
        setSelectedSession(activeSess);
        fetchSessionRecords(activeSess.id);
      } else {
        setSelectedSession(null);
        setRecords([]);
      }
    } catch (err) {
      console.error("Gagal memuat data presensi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionRecords = async (sessionId: string) => {
    try {
      const { data: dbRecords } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("attendance_session_id", sessionId);
      
      const parsedRecords = (dbRecords || []).map(parseRecord);
      setRecords(parsedRecords);
    } catch (err) {
      console.error("Gagal memuat rekap absensi:", err);
    }
  };

  const handleSelectSession = (session: any) => {
    audio.playSecondaryClick();
    setSelectedSession(session);
    fetchSessionRecords(session.id);
  };

  // Check auto close session based on system/Jakarta time
  const checkAutoClose = async (session: any) => {
    if (!session || session.status === "closed") return;
    
    const endsAtTime = session.ends_at ? new Date(session.ends_at) : null;
    if (endsAtTime && new Date() > endsAtTime) {
      try {
        const { data: dbSess } = await supabase
          .from("attendance_sessions")
          .select("*")
          .eq("id", session.id)
          .limit(1);

        if (dbSess && dbSess[0]) {
          const parsed = parseSession(dbSess[0]);
          parsed.status = "closed";
          const serializedName = serializeSession(parsed);
          await supabase
            .from("attendance_sessions")
            .update({ 
              activity_name: serializedName, 
              status: "closed",
              updated_at: new Date().toISOString(),
              closed_at: new Date().toISOString()
            })
            .eq("id", session.id);
        }

        const updatedSession = { ...session, status: "closed" };
        setSelectedSession(updatedSession);
        
        setAutoClosedMessage(true);
        setTimeout(() => setAutoClosedMessage(false), 6000);

        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: "closed" } : s));
      } catch (err) {
        console.error("Gagal melakukan penutupan sesi otomatis:", err);
      }
    }
  };


  // Periodic silent auto-close checker
  useEffect(() => {
    const interval = setInterval(() => {
      sessions.forEach(session => checkAutoClose(session));
    }, 30000);
    return () => clearInterval(interval);
  }, [sessions]);

  // Handle Session Creation
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    audio.playPrimaryClick();

    if (!activityName.trim()) {
      setError("Harap masukkan nama kegiatan.");
      setSubmitting(false);
      return;
    }

    const activeSubmittedBy = submittedBy || (members && members.length > 0 ? members[0].id : null);
    if (!activeSubmittedBy) {
      setError("Tidak ada anggota kelompok aktif yang terdaftar untuk membuat sesi.");
      setSubmitting(false);
      return;
    }

    const startTime = opensAt;
    const endTime = closesAt;
    
    if (endTime <= startTime) {
      setError("Jam ditutup harus lebih lambat dibanding jam dibuka.");
      setSubmitting(false);
      return;
    }

    try {
      const startsAt = new Date(`${sessionDate}T${startTime}:00+07:00`).toISOString();
      const endsAt = new Date(`${sessionDate}T${endTime}:00+07:00`).toISOString();

      const { data, error: insertError } = await supabase
        .from("attendance_sessions")
        .insert([{
          activity_name: activityName.trim(),
          starts_at: startsAt,
          ends_at: endsAt,
          location: locationName.trim() || "Posko",
          description: description.trim(),
          is_public: isPublic,
          require_gps: requireGps,
          require_selfie: requireSelfie,
          require_photo_face_check: true,
          auto_close_enabled: true,
          status: "open",
          created_by_member_id: activeSubmittedBy
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      showToast("Sesi presensi berhasil dibuat.");
      setShowCreateModal(false);
      fetchData();
    } catch (err: any) {
      console.error("Create session error:", err);
      setError("Gagal membuat sesi: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (session: any, memberId: string, newStatus: string) => {

    if (session.status === "closed") {
      showToast("Sesi presensi sudah ditutup dan tidak dapat diedit.", "error");
      return;
    }

    const internalStatus = STATUS_MAP[newStatus] || newStatus;
    const prevRecords = [...records];
    const existingIndex = records.findIndex(r => r.member_id === memberId);
    const memberName = members.find(m => m.id === memberId)?.full_name || "Anggota KKN";

    let updatedRecords = [...records];
    const recordData = {
      session_id: session.id,
      member_id: memberId,
      status: internalStatus,
      manual_override: true,
      manual_override_reason: "Diperbarui oleh Koordinator KKN",
      check_in_at: new Date().toISOString(),
      notes: "Diperbarui oleh Koordinator KKN"
    };

    const serializedNotes = serializeRecord(recordData, "Diperbarui oleh Koordinator KKN");

    if (existingIndex > -1) {
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        status: internalStatus,
        notes: "Diperbarui oleh Koordinator KKN"
      };
    } else {
      updatedRecords.push({
        id: `temp-${Date.now()}`,
        member_id: memberId,
        session_id: session.id,
        status: internalStatus,
        notes: "Diperbarui oleh Koordinator KKN",
        check_in_at: new Date().toISOString()
      });
    }

    setRecords(updatedRecords);

    try {
      if (existingIndex > -1) {
        const existingRecord = records[existingIndex];
        const { error: updErr } = await supabase
          .from("attendance_records")
          .update({
            attendance_status: internalStatus,
            notes: serializedNotes,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingRecord.id);

        if (updErr) throw updErr;
      } else {
        const payload = {
          attendance_session_id: session.id,
          member_id: memberId,
          attendance_status: internalStatus,
          notes: serializedNotes
        };

        const { error: insErr } = await supabase
          .from("attendance_records")
          .insert([payload]);

        if (insErr) throw insErr;
      }

      await supabase.from("activity_logs").insert([{
        message: `Status ${memberName} diperbarui menjadi ${newStatus}. Sesi: ${session.activity_name}`
      }]);

      showToast(`Status ${memberName} diperbarui menjadi ${newStatus}.`, "success");
      audio.playSuccess();
      
      fetchSessionRecords(session.id);
    } catch (err: any) {
      console.error(err);
      setRecords(prevRecords); // Rollback
      showToast(`Gagal memperbarui status ${memberName}: ${err.message || "Kesalahan server"}`, "error");
    }
  };

  // PDF Official Clean Layout Generator

  const generateAttendanceHTML = (session: any, membersList: any[], recordsList: any[], revStatusMap: Record<string, string>) => {
    const list = membersList.map((member, i) => {
      const rec = recordsList.find(r => r.member_id === member.id);
      const rawStatus = rec?.status || "Absent";
      const indStatus = revStatusMap[rawStatus] || "Alfa";
      
      return {
        index: i + 1,
        name: member.full_name,
        nim: member.nim,
        status: rec ? indStatus.toUpperCase() : "BELUM DICATAT",
        timeIn: rec?.check_in_at ? new Date(rec.check_in_at).toLocaleTimeString("id-ID") : "-"
      };
    });

    return `
      <html>
        <head>
          <title>Laporan Kehadiran KKN - ${session.activity_name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; padding: 50px; line-height: 1.5; background: #ffffff; }
            .header-table { width: 100%; border-bottom: 3px double #020617; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-text { font-size: 24px; font-weight: 900; color: #020617; letter-spacing: 1px; margin: 0; }
            .sub-logo { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; letter-spacing: 2px; margin-top: 5px; }
            .report-title { text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 11px; }
            .meta-item { line-height: 1.8; }
            .meta-item strong { color: #020617; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 12px; font-weight: bold; text-transform: uppercase; border: 1px solid #0f172a; }
            td { padding: 12px; border: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge-hadir { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-izin { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-sakit { background: #f3e8ff; color: #6b21a8; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-alfa { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .footer-info { margin-top: 50px; text-align: right; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .signature-container { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
            .sig-box { text-align: center; width: 28%; }
            .sig-title { font-size: 10px; font-weight: 600; color: #64748b; margin-bottom: 60px; }
            .sig-line { border-bottom: 1.5px solid #0f172a; width: 80%; margin: 0 auto 6px; }
            .sig-name { font-size: 9.5px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .sig-sub { font-size: 8px; color: #64748b; margin: 2px 0 0; font-weight: 600; text-transform: uppercase; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="logo-text">KKN PERSYARIKATAN MUHAMMADIYAH</div>
                <div class="sub-logo">Kelompok 063 &bull; Universitas Muhammadiyah Yogyakarta</div>
              </td>
            </tr>
          </table>
          <div class="report-title">LAPORAN REKAPITULASI PRESENSI KEHADIRAN</div>
          <div class="meta-grid">
            <div class="meta-item">
              <strong>Nama Aktivitas:</strong> ${session.activity_name}<br>
              <strong>Program Kerja:</strong> ${session.programs?.title || "Umum / Non-Proker"}<br>
              <strong>Tanggal Sesi:</strong> ${new Date(session.date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div class="meta-item">
              <strong>Jam Presensi:</strong> ${session.opens_at} - ${session.closes_at} WIB<br>
              <strong>Lokasi / Posko:</strong> ${session.location_name}<br>
              <strong>Status Sesi:</strong> ${session.status === "open" ? "AKTIF" : "SELESAI"}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%">No</th>
                <th style="width: 45%">Nama Lengkap Anggota</th>
                <th style="width: 20%">NIM</th>
                <th style="width: 15%">Waktu</th>
                <th style="width: 15%">Status</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(item => `
                <tr>
                  <td style="text-align: center">${item.index}</td>
                  <td><strong>${item.name}</strong></td>
                  <td style="font-family: monospace">${item.nim || "-"}</td>
                  <td style="text-align: center">${item.timeIn}</td>
                  <td style="text-align: center">
                    <span class="badge-${item.status.toLowerCase().replace("belum dicatat", "alfa")} ">${item.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="signature-container">
            <div class="sig-box">
              <p class="sig-title">Mengetahui,</p>
              <div class="sig-line"></div>
              <p class="sig-name">KETUA KELOMPOK KKN</p>
              <p class="sig-sub">Kordinator Lapangan 063</p>
            </div>
            
            <div class="sig-box">
              <p class="sig-title">Disetujui Oleh,</p>
              <div class="sig-line"></div>
              <p class="sig-name">DOSEN PEMBIMBING</p>
              <p class="sig-sub">DPL KKN UMY Yogyakarta</p>
            </div>
          </div>
          
          <div class="footer-info">
            Dicetak pada: ${new Date().toLocaleString("id-ID")} melalui Sistem KKN Workspace Kelompok 063
          </div>
        </body>
      </html>
    `;
  };


  const getInitials = (name: string) => {
    if (!name) return "KKN";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Divide records state counters
  const presentCount = records.filter(r => r.status === "Present" || r.status === "Hadir").length;
  const permissionCount = records.filter(r => r.status === "Permission" || r.status === "Izin").length;
  const sickCount = records.filter(r => r.status === "Sick" || r.status === "Sakit").length;
  const absentCount = members.length - (presentCount + permissionCount + sickCount);

  return (
    <div className="space-y-6 text-left animate-fade-in w-full max-w-7xl mx-auto" id="attendance_full_layout">
      
      {/* Top Banner section */}
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono font-black tracking-widest text-cyan-400 uppercase">
            OPERATIONAL ATTENDANCE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2.5">
            PRESENSI KEHADIRAN KKN
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola presensi kegiatan kelompok secara cepat, rapi, dan terpusat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              triggerConfirm(
                "Kosongkan Semua Data Presensi",
                "Apakah Anda yakin ingin mengosongkan SELURUH data presensi? Tindakan ini akan menghapus semua sesi dan catatan secara permanen.",
                "danger",
                async () => {
                  audio.playPrimaryClick();
                  localStorage.removeItem("kkn_local_attendance_sessions");
                  localStorage.removeItem("kkn_local_attendance_records");
                  showToast("Berhasil mengosongkan semua data presensi.", "success");
                  setSessions([]);
                  setSelectedSession(null);
                  setRecords([]);
                  await fetchData();
                }
              );
            }}
            className="nm-btn px-4 py-2.5 text-red-400 text-xs font-sans font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            title="Kosongkan Semua Data"
          >
            <Trash2 size={13} />
            <span>Kosongkan Presensi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowCreateModal(true);
            }}
            className="nm-btn px-4 py-2.5 text-cyan-400 text-xs font-sans font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Buat Sesi</span>
          </button>
        </div>
      </div>

      {/* Dynamic inline warning messages */}
      {autoClosedMessage && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-mono flex items-center gap-2 animate-pulse">
          <Info size={14} className="text-amber-400 shrink-0" />
          <span>Sesi ditutup otomatis karena waktu presensi telah berakhir.</span>
        </div>
      )}

            <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <svg className="animate-spin h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-cyan-400/80 animate-pulse">Sinkronisasi Database Presensi...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="nm-card-3d p-10 flex flex-col items-center justify-center text-center">
            <Info size={30} className="text-slate-500 mb-3 animate-pulse" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum Ada Sesi Presensi</h3>
            <p className="text-[10.5px] text-slate-400 mt-1 max-w-sm font-mono">
              Belum ada sesi presensi KKN. Buat sesi pertama untuk memulai pencatatan kehadiran manual.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sessions.map((session) => {
              const sessionRecords = allRecords.filter(r => r.attendance_session_id === session.id);
              
              const presentCount = sessionRecords.filter(r => r.status === "Present" || r.status === "Hadir").length;
              const permissionCount = sessionRecords.filter(r => r.status === "Permission" || r.status === "Izin").length;
              const sickCount = sessionRecords.filter(r => r.status === "Sick" || r.status === "Sakit").length;
              const absentCount = sessionRecords.filter(r => r.status === "Absent" || r.status === "Alfa").length;

              const isExpanded = expandedSessionId === session.id;

              return (
                <div key={session.id} className="space-y-6">
                  {/* Open session block */}
                  {session.status !== "closed" && (
                    <div className="nm-card-3d p-6 space-y-4 relative overflow-hidden border border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400">
                            SESI PRESENSI AKTIF
                          </span>
                          {showSyncIndicator && (
                            <span className="text-[9px] font-mono text-cyan-400 animate-pulse font-bold ml-2">
                              (Data diperbarui)
                            </span>
                          )}
                          <div className="ml-2">
                            <SessionCountdown closesAt={session.closes_at} date={session.date} />
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[8px] font-mono text-slate-400">
                          {session.activity_type || "Program Kerja"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-wider">{session.activity_name}</h3>
                        {session.description && <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">{session.description}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 nm-inset p-3.5 font-mono text-[10px] text-slate-300">
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Waktu Presensi</span>
                          <span className="text-white flex items-center gap-1.5 font-bold"><Clock size={12} className="text-cyan-400" />{session.opens_at} - {session.closes_at}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Lokasi Kegiatan</span>
                          <span className="text-white flex items-center gap-1.5 font-bold truncate"><MapPin size={12} className="text-cyan-400" />{session.location_name}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Kehadiran (Hadir / Total)</span>
                          <span className="text-cyan-300 flex items-center gap-1.5 font-bold"><Users size={12} className="text-cyan-300" />{presentCount} / {members.length} Hadir</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-2 z-30 relative pointer-events-auto">
                        <button type="button" onClick={() => handlePresentAll(session)} className="nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer z-40 relative pointer-events-auto text-cyan-400"><CheckCircle size={12} /><span>Hadirkan Semua</span></button>
                        <button type="button" onClick={() => handleResetAll(session)} className="nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer z-40 relative pointer-events-auto text-amber-400"><RefreshCw size={12} /><span>Reset Semua Presensi</span></button>
                        <button type="button" onClick={() => handleDeleteSession(session)} className="nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-red-400 cursor-pointer z-40 relative pointer-events-auto"><Trash2 size={12} /><span>Hapus Sesi</span></button>
                        <button type="button" onClick={() => handleCloseSessionNow(session)} className="nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-red-400 border border-red-500/25 cursor-pointer hover:border-red-500/40 z-40 relative pointer-events-auto"><Lock size={12} /><span>Tutup Sesi Sekarang</span></button>
                      </div>
                    </div>
                  )}

                  {/* Compact Member Participant Attendance Table (Shown only for open session) */}
                  {session.status !== "closed" && (
                    <div className="nm-card-3d p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">DAFTAR PESERTA KEHADIRAN</span>
                      </div>
                      <div className="rounded-2xl border border-white/5 overflow-hidden bg-black/30 text-[10.5px] font-mono">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 text-[8px] uppercase tracking-widest">
                                <th className="p-3 font-black">Anggota KKN</th>
                                <th className="p-3 font-black">NIM</th>
                                <th className="p-3 font-black text-center">Status & Waktu</th>
                                <th className="p-3 font-black text-center">Data Presensi</th>
                                <th className="p-3 font-black text-right">Aksi Manual</th>
                              </tr>
                            </thead>
                            <tbody>
                              {members.map((member) => {
                                const rec = sessionRecords.find(r => r.member_id === member.id);
                                const isSessionActive = session.status !== "closed";
                                let indStatus = "Alfa";
                                if (rec) { indStatus = REV_STATUS_MAP[rec.attendance_status] || "Hadir"; } else if (isSessionActive) { indStatus = "Belum Absen"; }
                                
                                return (
                                  <tr key={member.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                                    <td className="p-3 flex items-center gap-3">
                                      {getMemberPhotoUrl(member) ? (
                                        <img src={getMemberPhotoUrl(member)!} alt={member.full_name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-cyan-500/20 shadow-inner shrink-0"/>
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-[9px] font-bold text-cyan-400 shrink-0 font-mono">{getInitials(member.full_name)}</div>
                                      )}
                                      <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{member.full_name}</span>
                                    </td>
                                    <td className="p-3"><span className="text-xs font-mono text-slate-400">{member.nim || "-"}</span></td>
                                    <td className="p-3 text-center">
                                      <div className="flex flex-col items-center justify-center gap-1.5">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                          indStatus === "Hadir" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]" :
                                          indStatus === "Izin" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                                          indStatus === "Sakit" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                          indStatus === "Belum Absen" ? "bg-slate-500/10 text-slate-400 border-slate-500/25" :
                                          "bg-red-500/10 text-red-400 border-red-500/30"
                                        }`}>{indStatus}</span>
                                        {rec?.created_at ? (
                                          <span className="text-[9px] text-slate-500 font-mono">{new Date(rec.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                        ) : (<span className="text-[9px] text-slate-600 font-mono">-</span>)}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex flex-col items-center gap-2">
                                        {rec?.source === "public_web" && <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Via Web Publik</span>}
                                        <div className="flex justify-center gap-2">
                                          {rec?.latitude && rec?.longitude ? (
                                            <div className="flex items-center gap-1">
                                              <a href={`https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`} target="_blank" rel="noreferrer" title={`Buka Maps (Akurasi: ±${Math.round(rec.gps_accuracy_meters || 0)}m)`} className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors group/btn relative"><MapPin className="w-3.5 h-3.5 text-cyan-400" /></a>
                                            </div>
                                          ) : (<span className="text-[9px] text-slate-600 flex items-center gap-1 font-mono"><MapPin className="w-3 h-3 opacity-30" /> No GPS</span>)}
                                          
                                          {rec?.selfie_path ? (
                                            <button onClick={() => { window.open(supabase.storage.from("attendance-selfies").getPublicUrl(rec.photo_path).data.publicUrl, "_blank"); }} title="Lihat Foto Wajah" className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors"><Camera className="w-3.5 h-3.5 text-emerald-400" /></button>
                                          ) : (<span className="text-[9px] text-slate-600 flex items-center gap-1 font-mono"><Camera className="w-3 h-3 opacity-30" /> No Photo</span>)}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleUpdateStatus(session, member.id, "Hadir")} className="w-6 h-6 rounded bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-colors border border-transparent hover:border-cyan-500/30" title="Set Hadir"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleUpdateStatus(session, member.id, "Alfa")} className="w-6 h-6 rounded bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors border border-transparent hover:border-red-500/30" title="Set Alfa"><XCircle className="w-3.5 h-3.5" /></button>
                                        <select value={indStatus} onChange={(e) => handleUpdateStatus(session, member.id, e.target.value)} className="w-16 h-6 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-mono border border-white/10 focus:outline-none focus:border-cyan-400/50 cursor-pointer">
                                          <option value="Hadir">Hadir</option>
                                          <option value="Izin">Izin</option>
                                          <option value="Sakit">Sakit</option>
                                          <option value="Alfa">Alfa</option>
                                          <option value="Belum Absen">Belum Absen</option>
                                        </select>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Folder recap section for closed session */}
                  {session.status === "closed" && (
                    <div className="nm-card-3d overflow-hidden">
                      <button type="button" onClick={() => setExpandedSessionId(isExpanded ? null : session.id)} className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <Folder className="text-amber-400 shrink-0" size={18} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-[11px] font-mono font-black tracking-widest text-white uppercase">REKAP PRESENSI</h4>
                              <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">SELESAI</span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase">Sesi: {session.activity_name} • (Hadir: {presentCount}, Izin: {permissionCount}, Sakit: {sickCount}, Alfa: {absentCount})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-mono font-bold text-amber-400 mr-2">{isExpanded ? "Tutup" : "Lihat Detail"}</span>
                          {isExpanded ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden border-t border-white/5">
                            <div className="p-6 space-y-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                <div>
                                  <span className="text-[8.5px] font-mono font-extrabold text-amber-400 uppercase tracking-widest">Laporan Data Sesi</span>
                                  <h4 className="text-xs font-black text-slate-300 font-mono uppercase mt-0.5">Ringkasan Grafik Kehadiran</h4>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button type="button" onClick={() => handleOpenSessionNow(session)} className="nm-btn px-3 py-1.5 text-[9px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-400 border border-emerald-500/25 cursor-pointer hover:border-emerald-500/40"><Unlock size={11} /> Buka Kembali Sesi</button>
                                  <button type="button" onClick={() => handleDeleteSession(session)} className="nm-btn px-3 py-1.5 text-[9px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-red-400 border border-red-500/25 cursor-pointer hover:border-red-500/40"><Trash2 size={11} /> Hapus Sesi</button>
                                  
<PremiumExportButton 
  title={`Laporan Kehadiran KKN - ${session.activity_name}`}
  filename={`presensi_kkn_${session.id}`}
  data={members.map((member, i) => {
    const rec = records.find(r => r.member_id === member.id);
    const rawStatus = rec?.status || "Absent";
    const indStatus = REV_STATUS_MAP[rawStatus] || "Alfa";
    return {
      index: i + 1,
      name: member.full_name,
      nim: member.nim,
      status: rec ? indStatus.toUpperCase() : "BELUM DICATAT",
      timeIn: rec?.check_in_at ? new Date(rec.check_in_at).toLocaleTimeString("id-ID") : "-"
    };
  })}
  columns={[
    { key: "index", label: "NO" },
    { key: "name", label: "NAMA LENGKAP" },
    { key: "nim", label: "NIM" },
    { key: "status", label: "STATUS" },
    { key: "timeIn", label: "WAKTU PRESENSI" }
  ]}
  customHtmlTemplate={generateAttendanceHTML(session, members, records, REV_STATUS_MAP)}
/>
  
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-2.5 text-center font-mono">
                                <div className="nm-inset p-2.5 border border-cyan-500/10"><span className="block text-cyan-400 font-extrabold text-sm">{presentCount}</span><span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Hadir</span></div>
                                <div className="nm-inset p-2.5 border border-amber-500/10"><span className="block text-amber-400 font-extrabold text-sm">{permissionCount}</span><span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Izin</span></div>
                                <div className="nm-inset p-2.5 border border-indigo-500/10"><span className="block text-indigo-400 font-extrabold text-sm">{sickCount}</span><span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Sakit</span></div>
                                <div className="nm-inset p-2.5 border border-red-500/10"><span className="block text-red-400 font-extrabold text-sm">{absentCount}</span><span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Alfa</span></div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>


            {/* COMPACT MODAL FOR NEW SESSION */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="nm-card-3d max-w-md w-full relative max-h-[85vh] min-h-0 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] p-5 shrink-0">
                <div>
                  <span className="text-[7.5px] font-mono font-black tracking-widest text-cyan-400 block uppercase">
                    PENCATATAN BARU
                  </span>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mt-0.5 font-sans">
                    Sesi Presensi Baru
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-xl bg-[#0b0e17] shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),_2px_2px_6px_rgba(0,0,0,0.5)] border border-white/[0.01] text-slate-400 hover:text-white transition-all active:shadow-[inset_-1px_-1px_4px_rgba(255,255,255,0.01),_inset_1px_1px_4px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {error && (
                <div className="px-5 pt-4">
                  <p className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleCreateSession} className="flex flex-col flex-1 min-h-0 text-left">
                {/* Scrollable Form Body */}
                <div className="overflow-y-auto flex-1 p-5 space-y-4">
                  {/* Activity Name */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Nama Kegiatan</label>
                    <input
                      type="text"
                      required
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      placeholder="Nama kegiatan (contoh: Rapat Mingguan)..."
                      className="w-full h-11 nm-input px-3.5 text-xs font-semibold placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Date & Time Window */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Jam Aktif</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        required
                        value={opensAt}
                        onChange={(e) => setOpensAt(e.target.value)}
                        className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none text-center"
                      />
                      <input
                        type="time"
                        required
                        value={closesAt}
                        onChange={(e) => setClosesAt(e.target.value)}
                        className="w-full h-11 nm-input px-3.5 text-xs font-semibold focus:outline-none text-center"
                      />
                    </div>
                  </div>

                  {/* Location Posko */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Lokasi</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Nama lokasi atau posko..."
                      className="w-full h-11 nm-input px-3.5 text-xs font-semibold placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Deskripsi</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Keterangan singkat..."
                      rows={2}
                      className="w-full nm-input px-3.5 py-3 text-xs font-semibold placeholder:text-slate-600 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="p-5 border-t border-white/[0.04] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#0b0e17] shadow-[-3px_-3px_8px_rgba(255,255,255,0.02),_3px_3px_8px_rgba(0,0,0,0.5)] border border-white/[0.02] text-slate-400 hover:text-white text-xs font-mono font-bold uppercase transition-all active:shadow-[inset_-2px_-2px_5px_rgba(255,255,255,0.01),_inset_2px_2px_5px_rgba(0,0,0,0.5)] active:translate-y-[1px] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !activityName || !sessionDate || !opensAt || !closesAt}
                    className="px-5.5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 text-xs font-sans font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-[-3px_-3px_10px_rgba(255,255,255,0.05),_3px_3px_10px_rgba(0,0,0,0.6)] active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Membuka...
                      </span>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        <span>BUAT SESI</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Premium Confirm Modal */}
      <AnimatePresence>
        {confirmState.isOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm nm-card-3d border border-white/5 p-6 text-center overflow-hidden z-10"
            >
              {/* Glowing accent header for modal based on type */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${
                confirmState.type === "danger" 
                  ? "from-red-500 to-rose-600 shadow-[0_1px_8px_rgba(239,68,68,0.3)]" 
                  : confirmState.type === "warning"
                  ? "from-amber-500 to-orange-600 shadow-[0_1px_8px_rgba(245,158,11,0.3)]"
                  : confirmState.type === "success"
                  ? "from-emerald-500 to-teal-600 shadow-[0_1px_8px_rgba(16,185,129,0.3)]"
                  : "from-cyan-500 to-indigo-500 shadow-[0_1px_8px_rgba(6,182,212,0.3)]"
              }`} />

              <div className="flex flex-col items-center gap-4">
                <div className={`p-3 rounded-full bg-white/[0.02] border ${
                  confirmState.type === "danger"
                    ? "border-red-500/30 text-red-400"
                    : confirmState.type === "warning"
                    ? "border-amber-500/30 text-amber-400"
                    : confirmState.type === "success"
                    ? "border-emerald-500/30 text-emerald-400"
                    : "border-cyan-500/30 text-cyan-400"
                }`}>
                  {confirmState.type === "danger" && <Trash2 size={24} />}
                  {confirmState.type === "warning" && <RefreshCw size={24} className="animate-spin" style={{ animationDuration: "3s" }} />}
                  {confirmState.type === "success" && <CheckCircle size={24} />}
                  {confirmState.type === "info" && <Info size={24} />}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    {confirmState.title}
                  </h4>
                  <p className="text-[10.5px] text-slate-400 font-mono leading-relaxed px-2">
                    {confirmState.message}
                  </p>
                </div>

                <div className="flex w-full gap-3 pt-3 border-t border-white/[0.05] mt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmState.onConfirm}
                    className={`flex-1 px-4 py-2.5 rounded-xl transition-all text-xs font-sans font-black uppercase tracking-wider cursor-pointer border-0 ${
                      confirmState.type === "danger"
                        ? "bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                        : confirmState.type === "warning"
                        ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                        : confirmState.type === "success"
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    }`}
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
