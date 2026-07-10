import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Check, X, CheckCircle, Clock, Plus, Trash2, 
  UserCheck, AlertCircle, RefreshCw, ClipboardList, Info,
  MapPin, Eye, FileText, Users, Printer, Folder, ChevronDown, ChevronUp, Lock, Camera
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { audio } from "../../utils/audioService";
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
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  
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
    if (selectedSession) {
      fetchSessionRecords(selectedSession.id);
      setShowSyncIndicator(true);
      setTimeout(() => setShowSyncIndicator(false), 3000);
    }
  });

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

      // 3. Fetch Sessions
      const { data: dbSessions } = await supabase
        .from("attendance_sessions")
        .select(`
          *,
          programs(title)
        `)
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
              updated_at: new Date().toISOString(),
              closed_at: new Date().toISOString()
            })
            .eq("id", session.id);
        }

        const updatedSession = { ...session, status: "closed" };
        setSelectedSession(updatedSession);
        
        setAutoClosedMessage(true);
        setTimeout(() => setAutoClosedMessage(false), 6000);

        fetchData();
      } catch (err) {
        console.error("Gagal melakukan penutupan sesi otomatis:", err);
      }
    }
  };

  useEffect(() => {
    if (selectedSession) {
      checkAutoClose(selectedSession);
    }
  }, [selectedSession]);

  // Periodic silent auto-close checker
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSession) {
        checkAutoClose(selectedSession);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedSession]);

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

    const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const startsAt = `${sessionDate}T${startTime}:00+07:00`;
    const endsAt = `${sessionDate}T${endTime}:00+07:00`;

    const sessionData = {
      activity_name: activityName.trim(),
      activity_type: "Program Kerja",
      date: sessionDate,
      opens_at: startTime,
      closes_at: endTime,
      status: "scheduled",
      location_name: locationName.trim() || "Posko KKN Kelompok 063",
      latitude: -7.821008,
      longitude: 110.370001,
      gps_posko_input: "",
      session_token: token,
      program_id: null,
      created_by_member_id: activeSubmittedBy,
      updated_by_member_id: activeSubmittedBy,
      description: description.trim(),
      is_public: isPublic,
      require_gps: requireGps,
      require_selfie: requireSelfie,
      require_photo_face_check: requirePhotoFaceCheck,
      auto_close_enabled: autoCloseEnabled
    };

    const serializedName = serializeSession(sessionData);

    const payload = {
      activity_name: serializedName,
      program_id: null,
      starts_at: startsAt,
      ends_at: endsAt,
      location: locationName.trim() || "Posko KKN Kelompok 063",
      description: description.trim() || null,
      created_by_member_id: activeSubmittedBy,
      updated_by_member_id: activeSubmittedBy,
      status: "scheduled",
      activity_type: "Program Kerja",
      is_public: isPublic,
      require_gps: requireGps,
      require_selfie: requireSelfie,
      require_photo_face_check: requirePhotoFaceCheck,
      auto_close_enabled: autoCloseEnabled
    };

    try {
      const { data, error: insErr } = await supabase.from("attendance_sessions").insert([payload]).select();
      if (insErr) throw insErr;

      const createdSession = data?.[0];
      if (createdSession) {
        // Automatically create default 'Present' records for ALL active members instantly
        const recordInserts = members.map((m: any) => {
          const recordData = {
            session_id: createdSession.id,
            member_id: m.id,
            status: "Present",
            manual_override: false,
            manual_override_reason: "",
            check_in_at: new Date().toISOString(),
            notes: "Hadir Otomatis via Sesi Baru"
          };
          const serializedNotes = serializeRecord(recordData, "Hadir Otomatis via Sesi Baru");
          return {
            attendance_session_id: createdSession.id,
            member_id: m.id,
            attendance_status: "Present",
            notes: serializedNotes,
            created_by_member_id: activeSubmittedBy,
            updated_by_member_id: activeSubmittedBy
          };
        });

        if (recordInserts.length > 0) {
          const { error: recErr } = await supabase.from("attendance_records").insert(recordInserts);
          if (recErr) console.error("Gagal membuat default rekap:", recErr);
        }
      }

      await supabase.from("activity_logs").insert([{
        message: `Membuat sesi presensi baru: ${activityName} dan otomatis mempresensi seluruh anggota.`,
        created_by_member_id: activeSubmittedBy
      }]);

      // Reset Form fields
      setActivityName("");
      setLocationName("");
      setDescription("");
      setRelatedProgramId("");
      setShowCreateModal(false);
      showToast("Sesi presensi berhasil dibuat. Semua anggota ditandai hadir.", "success");
      audio.playSuccess();
      
      // Reload all data
      fetchData();
    } catch (err: any) {
      setError(err?.message || "Gagal membuat sesi presensi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Close Session Now
  const handleCloseSessionNow = async () => {
    if (!selectedSession) return;
    triggerConfirm(
      "Tutup Sesi Presensi",
      "Apakah Anda yakin ingin menutup sesi presensi ini? Sesi yang ditutup tidak dapat diedit lagi.",
      "danger",
      async () => {
        audio.playPrimaryClick();

        try {
          const { data: dbSess } = await supabase
            .from("attendance_sessions")
            .select("*")
            .eq("id", selectedSession.id)
            .limit(1);

          if (dbSess && dbSess[0]) {
            const parsed = parseSession(dbSess[0]);
            parsed.status = "closed";
            const serializedName = serializeSession(parsed);
            
            const { error: updErr } = await supabase
              .from("attendance_sessions")
              .update({ 
                activity_name: serializedName, 
                updated_at: new Date().toISOString(),
                closed_at: new Date().toISOString()
              })
              .eq("id", selectedSession.id);

            if (updErr) throw updErr;
          }

          await supabase.from("activity_logs").insert([{
            message: `Menutup sesi presensi secara manual: ${selectedSession.activity_name}`
          }]);

          showToast("Sesi presensi berhasil ditutup.", "success");
          fetchData();
        } catch (err: any) {
          console.error(err);
          showToast("Gagal menutup sesi presensi.", "error");
        }
      }
    );
  };

  // Hadirkan Semua (Bulk Attendance Upgrade)
  const handlePresentAll = async () => {
    if (!selectedSession) return;
    if (selectedSession.status === "closed") {
      showToast("Sesi presensi sudah ditutup.", "error");
      return;
    }

    const executePresentAll = async () => {
      // Optimistic UI updates
      const optimisticRecords = members.map(m => {
        const existing = records.find(r => r.member_id === m.id);
        return {
          id: existing?.id || `temp-${m.id}`,
          member_id: m.id,
          session_id: selectedSession.id,
          status: "present",
          notes: "Hadir Semua",
          check_in_at: existing?.check_in_at || new Date().toISOString()
        };
      });

      setRecords(optimisticRecords);
      showToast("Semua anggota aktif berhasil ditandai hadir.", "success");
      audio.playSuccess();

      try {
        const promises = members.map(async (m) => {
          const existing = records.find(r => r.member_id === m.id);
          const recordData = {
            session_id: selectedSession.id,
            member_id: m.id,
            status: "present",
            manual_override: true,
            manual_override_reason: "Hadir Semua via Koordinator",
            check_in_at: existing?.check_in_at || new Date().toISOString(),
            notes: "Hadir Semua"
          };
          const serializedNotes = serializeRecord(recordData, "Hadir Semua");

          if (existing) {
            return supabase
              .from("attendance_records")
              .update({
                attendance_status: "present",
                notes: serializedNotes,
                updated_at: new Date().toISOString()
              })
              .eq("id", existing.id);
          } else {
            return supabase
              .from("attendance_records")
              .insert([{
                attendance_session_id: selectedSession.id,
                member_id: m.id,
                attendance_status: "present",
                notes: serializedNotes
              }]);
          }
        });

        await Promise.all(promises);

        await supabase.from("activity_logs").insert([{
          message: `Mepresensi seluruh anggota aktif untuk sesi: ${selectedSession.activity_name}`
        }]);

        fetchSessionRecords(selectedSession.id);
      } catch (err: any) {
        console.error(err);
        showToast("Terjadi kesalahan saat menghadirkan semua anggota.", "error");
      }
    };

    const hasManualRecords = records.some(r => r.status && r.status.toLowerCase() !== "present");
    if (hasManualRecords) {
      triggerConfirm(
        "Hadirkan Semua Anggota",
        "Tindakan ini akan menimpa seluruh status (Izin, Sakit, Alfa) menjadi Hadir. Lanjutkan?",
        "warning",
        executePresentAll
      );
    } else {
      executePresentAll();
    }
  };

  // Reset Semua Presensi
  const handleResetAll = async () => {
    if (!selectedSession) return;
    triggerConfirm(
      "Reset Semua Presensi",
      "Apakah Anda yakin ingin meriset seluruh presensi untuk sesi ini? Semua data kehadiran akan dihapus.",
      "warning",
      async () => {
        setRecords([]);
        showToast("Seluruh data presensi sesi berhasil direset.", "warning");
        audio.playSecondaryClick();

        try {
          const { error: delErr } = await supabase
            .from("attendance_records")
            .delete()
            .eq("attendance_session_id", selectedSession.id);

          if (delErr) throw delErr;

          await supabase.from("activity_logs").insert([{
            message: `Mereset seluruh catatan presensi untuk sesi: ${selectedSession.activity_name}`
          }]);

          fetchSessionRecords(selectedSession.id);
        } catch (err: any) {
          console.error(err);
          showToast("Gagal meriset data presensi.", "error");
        }
      }
    );
  };

  // Hapus Sesi
  const handleDeleteSession = async () => {
    if (!selectedSession) return;
    triggerConfirm(
      "Hapus Sesi Presensi",
      "Apakah Anda yakin ingin menghapus sesi presensi ini? Sesi beserta seluruh data di dalamnya akan dihapus secara permanen.",
      "danger",
      async () => {
        showToast("Sesi presensi beserta seluruh datanya berhasil dihapus.", "error");
        audio.playPrimaryClick();

        try {
          await supabase
            .from("attendance_records")
            .delete()
            .eq("attendance_session_id", selectedSession.id);

          const { error: delErr } = await supabase
            .from("attendance_sessions")
            .delete()
            .eq("id", selectedSession.id);

          if (delErr) throw delErr;

          await supabase.from("activity_logs").insert([{
            message: `Menghapus sesi presensi: ${selectedSession.activity_name}`
          }]);

          const remainingSessions = sessions.filter(s => s.id !== selectedSession.id);
          setSessions(remainingSessions);
          if (remainingSessions.length > 0) {
            setSelectedSession(remainingSessions[0]);
            fetchSessionRecords(remainingSessions[0].id);
          } else {
            setSelectedSession(null);
            setRecords([]);
          }
          
          fetchData();
        } catch (err: any) {
          console.error(err);
          showToast("Gagal menghapus sesi presensi.", "error");
        }
      }
    );
  };

  // View Recap & Scroll Smoothly
  const handleViewRecap = () => {
    audio.playSecondaryClick();
    setIsRecapExpanded(true);
    setTimeout(() => {
      const el = document.getElementById("attendance-recap-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  // Update Individual Member Status
  const handleUpdateStatus = async (memberId: string, newStatus: string) => {
    if (!selectedSession) return;
    if (selectedSession.status === "closed") {
      showToast("Sesi presensi sudah ditutup dan tidak dapat diedit.", "error");
      return;
    }

    const internalStatus = STATUS_MAP[newStatus] || newStatus;
    const prevRecords = [...records];
    const existingIndex = records.findIndex(r => r.member_id === memberId);
    let updatedRecords = [...records];

    const recordData = {
      session_id: selectedSession.id,
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
        session_id: selectedSession.id,
        status: internalStatus,
        notes: "Diperbarui oleh Koordinator KKN",
        check_in_at: new Date().toISOString()
      });
    }

    setRecords(updatedRecords);
    const memberName = members.find(m => m.id === memberId)?.full_name || "Anggota KKN";

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
          attendance_session_id: selectedSession.id,
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
        message: `Status ${memberName} diperbarui menjadi ${newStatus}. Sesi: ${selectedSession.activity_name}`
      }]);

      showToast(`Status ${memberName} diperbarui menjadi ${newStatus}.`, "success");
      audio.playSuccess();
      
      fetchSessionRecords(selectedSession.id);
    } catch (err: any) {
      console.error(err);
      setRecords(prevRecords); // Rollback
      showToast(`Gagal memperbarui status ${memberName}: ${err.message || "Kesalahan server"}`, "error");
    }
  };

  // PDF Official Clean Layout Generator
  const handlePrintPDFReport = () => {
    audio.playPrimaryClick();
    if (!selectedSession) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const list = members.map((member, i) => {
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
    });

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Kehadiran KKN - ${selectedSession.activity_name}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #0f172a;
              padding: 50px;
              line-height: 1.5;
            }
            .header-table {
              width: 100%;
              border-bottom: 3px double #020617;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: 900;
              color: #020617;
              letter-spacing: 1px;
              margin: 0;
            }
            .sub-logo {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              color: #475569;
              letter-spacing: 2px;
              margin-top: 5px;
            }
            .report-title {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 25px;
              letter-spacing: 1px;
            }
            .meta-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
              font-size: 11px;
            }
            .meta-item {
              line-height: 1.8;
            }
            .meta-item strong {
              color: #020617;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11px;
            }
            th {
              background-color: #0f172a;
              color: #ffffff;
              text-align: left;
              padding: 12px;
              font-weight: bold;
              text-transform: uppercase;
              border: 1px solid #0f172a;
            }
            td {
              padding: 12px;
              border: 1px solid #e2e8f0;
              color: #334155;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .badge-hadir { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-izin { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-sakit { background: #f3e8ff; color: #6b21a8; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-alfa { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .footer-info {
              margin-top: 50px;
              text-align: right;
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="logo-text">KKN PERSYARIKATAN MUHAMMADIYAH</div>
                <div class="sub-logo">Kelompok 063 • Universitas Muhammadiyah Yogyakarta</div>
              </td>
            </tr>
          </table>

          <div class="report-title">LAPORAN REKAPITULASI PRESENSI KEHADIRAN</div>

          <div class="meta-grid">
            <div class="meta-item">
              <strong>Nama Aktivitas:</strong> ${selectedSession.activity_name}<br>
              <strong>Program Kerja:</strong> ${selectedSession.programs?.title || "Umum / Non-Proker"}<br>
              <strong>Tanggal Sesi:</strong> ${new Date(selectedSession.date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div class="meta-item">
              <strong>Jam Presensi:</strong> ${selectedSession.opens_at} - ${selectedSession.closes_at} WIB<br>
              <strong>Lokasi / Posko:</strong> ${selectedSession.location_name}<br>
              <strong>Status Sesi:</strong> ${selectedSession.status === "open" ? "AKTIF" : "SELESAI"}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%">No</th>
                <th style="width: 45%">Nama Lengkap Anggota</th>
                <th style="width: 20%">NIM</th>
                <th style="width: 15%; text-align: center;">Status</th>
                <th style="width: 15%">Waktu Dicatat</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(r => {
                const badgeClass = r.status === "HADIR" ? "badge-hadir" : r.status === "IZIN" ? "badge-izin" : r.status === "SAKIT" ? "badge-sakit" : "badge-alfa";
                return `
                  <tr>
                    <td>${r.index}</td>
                    <td><strong>${r.name}</strong></td>
                    <td>${r.nim}</td>
                    <td style="text-align: center;"><span class="${badgeClass}">${r.status}</span></td>
                    <td>${r.timeIn}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>

          <div class="footer-info">
            <p>Laporan Resmi Rekapitulasi Presensi Kelompok KKN 063 • Dicetak pada ${new Date().toLocaleString("id-ID")}</p>
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

      {/* Session selector */}
      <div className="nm-card-3d p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1 w-full">
          <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
            PILIH SESI PRESENSI
          </label>
          <select
            value={selectedSession?.id || ""}
            onChange={(e) => {
              const sess = sessions.find(s => s.id === e.target.value);
              if (sess) handleSelectSession(sess);
            }}
            className="w-full nm-inset p-2.5 rounded-xl font-mono text-xs text-cyan-400 focus:outline-none bg-transparent cursor-pointer"
          >
            {sessions.length === 0 ? (
              <option value="">Belum Ada Sesi</option>
            ) : (
              sessions.map((session) => (
                <option key={session.id} value={session.id} className="bg-[#0b0e14] text-white">
                  [{session.status === "open" ? "AKTIF" : "SELESAI"}] {session.activity_name} ({session.date})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-cyan-400/80 animate-pulse">Sinkronisasi Database Presensi...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Session details block */}
          {selectedSession ? (
            <div className="nm-card-3d p-6 space-y-4 relative overflow-hidden border border-white/5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${selectedSession.status === "open" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${selectedSession.status === "open" ? "text-emerald-400" : "text-red-400"}`}>
                    {selectedSession.status === "open" ? "SESI PRESENSI AKTIF" : "SESI DITUTUP"}
                  </span>
                  {showSyncIndicator && (
                    <span className="text-[9px] font-mono text-cyan-400 animate-pulse font-bold ml-2">
                      (Data diperbarui)
                    </span>
                  )}
                </div>

                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-[8px] font-mono text-slate-400">
                  {selectedSession.activity_type || "Program Kerja"}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  {selectedSession.activity_name}
                </h3>
                {selectedSession.description && (
                  <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">
                    {selectedSession.description}
                  </p>
                )}
              </div>

              {/* Informational grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 nm-inset p-3.5 font-mono text-[10px] text-slate-300">
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Waktu Presensi</span>
                  <span className="text-white flex items-center gap-1.5 font-bold">
                    <Clock size={12} className="text-cyan-400" />
                    {selectedSession.opens_at} - {selectedSession.closes_at}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Lokasi Kegiatan</span>
                  <span className="text-white flex items-center gap-1.5 font-bold truncate">
                    <MapPin size={12} className="text-cyan-400" />
                    {selectedSession.location_name}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Kehadiran (Hadir / Total)</span>
                  <span className="text-cyan-300 flex items-center gap-1.5 font-bold">
                    <Users size={12} className="text-cyan-300" />
                    {presentCount} / {members.length} Hadir
                  </span>
                </div>
              </div>

              {/* Functional Toolbar Actions Bar (Section I) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 z-30 relative pointer-events-auto">
                <button
                  type="button"
                  onClick={handlePresentAll}
                  disabled={selectedSession.status === "closed"}
                  className={`nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer z-40 relative pointer-events-auto ${selectedSession.status === "closed" ? "opacity-50 pointer-events-none" : "text-cyan-400"}`}
                >
                  <CheckCircle size={12} />
                  <span>Hadirkan Semua</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAll}
                  disabled={selectedSession.status === "closed"}
                  className={`nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer z-40 relative pointer-events-auto ${selectedSession.status === "closed" ? "opacity-50 pointer-events-none" : "text-amber-400"}`}
                >
                  <RefreshCw size={12} />
                  <span>Reset Semua Presensi</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSession}
                  className="nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-red-400 cursor-pointer z-40 relative pointer-events-auto"
                >
                  <Trash2 size={12} />
                  <span>Hapus Sesi</span>
                </button>

                <button
                  type="button"
                  onClick={handleViewRecap}
                  className="nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-300 cursor-pointer z-40 relative pointer-events-auto"
                >
                  <ClipboardList size={12} className="text-cyan-400" />
                  <span>Lihat Rekap Absen</span>
                </button>

                {selectedSession.status === "open" && (
                  <button
                    type="button"
                    onClick={handleCloseSessionNow}
                    className="nm-btn px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 text-red-400 border border-red-500/25 cursor-pointer hover:border-red-500/40 z-40 relative pointer-events-auto"
                  >
                    <Lock size={12} />
                    <span>Tutup Sesi Sekarang</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="nm-card-3d p-10 flex flex-col items-center justify-center text-center">
              <Info size={30} className="text-slate-500 mb-3 animate-pulse" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum Ada Sesi Presensi</h3>
              <p className="text-[10.5px] text-slate-400 mt-1 max-w-sm font-mono">
                Belum ada sesi presensi KKN. Buat sesi pertama untuk memulai pencatatan kehadiran manual.
              </p>
            </div>
          )}

          {/* Folder recap section (Section H) */}
          {selectedSession && (
            <div className="nm-card-3d overflow-hidden" id="attendance-recap-section">
              
              {/* Folder Collapse Header Bar */}
              <button
                type="button"
                onClick={() => setIsRecapExpanded(!isRecapExpanded)}
                className="w-full p-4.5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Folder className="text-cyan-400 shrink-0" size={18} />
                  <div>
                    <h4 className="text-[11px] font-mono font-black tracking-widest text-white uppercase">REKAP PRESENSI</h4>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      Sesi: {selectedSession.activity_name} • (Hadir: {presentCount}, Izin: {permissionCount}, Sakit: {sickCount}, Alfa: {absentCount})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-mono font-bold text-cyan-400/80 mr-2">
                    {isRecapExpanded ? "Tutup Folder" : "Klik untuk melihat rekap"}
                  </span>
                  {isRecapExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isRecapExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-6 space-y-6">
                      
                      {/* Sub header rekap */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                          <span className="text-[8.5px] font-mono font-extrabold text-cyan-400 uppercase tracking-widest">Laporan Data Sesi</span>
                          <h4 className="text-xs font-black text-slate-300 font-mono uppercase mt-0.5">Ringkasan Grafik Kehadiran</h4>
                        </div>

                        <button
                          onClick={handlePrintPDFReport}
                          className="nm-btn text-rose-400 px-3.5 py-2 text-[9.5px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={12} />
                          <span>Export PDF</span>
                        </button>
                      </div>

                      {/* Summary counters metrics */}
                      <div className="grid grid-cols-4 gap-2.5 text-center font-mono">
                        <div className="nm-inset p-2.5 border border-cyan-500/10">
                          <span className="block text-cyan-400 font-extrabold text-sm">{presentCount}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Hadir</span>
                        </div>
                        <div className="nm-inset p-2.5 border border-amber-500/10">
                          <span className="block text-amber-400 font-extrabold text-sm">{permissionCount}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Izin</span>
                        </div>
                        <div className="nm-inset p-2.5 border border-indigo-500/10">
                          <span className="block text-indigo-400 font-extrabold text-sm">{sickCount}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Sakit</span>
                        </div>
                        <div className="nm-inset p-2.5 border border-red-500/10">
                          <span className="block text-red-400 font-extrabold text-sm">{absentCount}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block mt-0.5">Alfa</span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* Compact Member Participant Attendance Table */}
          {selectedSession && (
            <div className="nm-card-3d p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                  DAFTAR PESERTA KEHADIRAN (10 ANGGOTA KKN)
                </span>
                {selectedSession.status === "closed" && (
                  <span className="text-[9px] font-mono text-red-400 flex items-center gap-1 uppercase font-bold">
                    <Lock size={11} /> Sesi Terkunci
                  </span>
                )}
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
                        const rec = records.find(r => r.member_id === member.id);
                        const rawStatus = rec?.status || "Absent";
                        const indStatus = REV_STATUS_MAP[rawStatus] || "Alfa";
                        
                        return (
                          <tr key={member.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                            <td className="p-3 flex items-center gap-3">
                              {getMemberPhotoUrl(member) ? (
                                <img 
                                  src={getMemberPhotoUrl(member)!} 
                                  alt={member.full_name} 
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover border border-cyan-500/20 shadow-inner shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-[9px] font-bold text-cyan-400 shrink-0 font-mono">
                                  {getInitials(member.full_name)}
                                </div>
                              )}
                              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{member.full_name}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-mono text-slate-400">{member.nim || "-"}</span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                  indStatus === "Hadir" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]" :
                                  indStatus === "Izin" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                                  indStatus === "Sakit" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                  "bg-red-500/10 text-red-400 border-red-500/30"
                                }`}>
                                  {indStatus}
                                </span>
                                {rec?.created_at ? (
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    {new Date(rec.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-600 font-mono">-</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col items-center gap-2">
                                {rec?.source === "public_web" && (
                                  <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Via Web Publik</span>
                                )}
                                <div className="flex justify-center gap-2">
                                  {rec?.latitude && rec?.longitude ? (
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={`https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={`Buka Maps (Akurasi: ±${Math.round(rec.gps_accuracy_meters || 0)}m)`}
                                        className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors group/btn relative"
                                      >
                                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                                      </a>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(`${rec.latitude},${rec.longitude}`);
                                          showToast("Koordinat disalin.", "info");
                                        }}
                                        title="Salin Koordinat"
                                        className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors"
                                      >
                                        <Copy className="w-3 h-3 text-slate-400" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-slate-600 italic">No GPS</div>
                                  )}
                                  
                                  {rec?.selfie_path ? (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const { data } = await supabase.storage.from('attendance-selfies').createSignedUrl(rec.selfie_path!, 60);
                                          if (data?.signedUrl) {
                                            window.open(data.signedUrl, '_blank');
                                          } else {
                                            showToast("Gagal memuat foto", "error");
                                          }
                                        } catch (e) {
                                          showToast("Gagal memuat foto", "error");
                                        }
                                      }}
                                      title="Lihat Foto Selfie"
                                      className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-colors"
                                    >
                                      <Camera className="w-3.5 h-3.5 text-green-400" />
                                    </button>
                                  ) : (
                                    <div className="w-7 h-7 flex items-center justify-center">
                                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <select
                                value={indStatus}
                                onChange={(e) => handleUpdateStatus(member.id, e.target.value)}
                                className="bg-black/60 border border-white/10 rounded-md text-[10px] font-bold text-slate-300 py-1.5 px-2 focus:border-cyan-500/50 outline-none hover:bg-white/5 cursor-pointer ml-auto block"
                                disabled={submitting}
                              >
                                <option value="Hadir">Hadir</option>
                                <option value="Izin">Izin</option>
                                <option value="Sakit">Sakit</option>
                                <option value="Alfa">Alfa</option>
                              </select>
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

        </div>
      )}

      {/* PREMIUM MODAL FOR NEW SESSION */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#030406] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/5"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-cyan-500/10 blur-[80px] pointer-events-none" />

              <div className="relative p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-black text-white tracking-widest uppercase">Sesi Presensi Baru</h3>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Buat sesi absensi digital untuk anggota</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-white/5 group"
                  >
                    <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400 font-mono leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreateSession} className="space-y-6">
                  {/* Activity Name */}
                  <div className="space-y-2 relative group/input">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Nama Kegiatan</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                        placeholder="Contoh: Rapat Mingguan, Gotong Royong..."
                        className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-sans text-sm text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Date */}
                    <div className="space-y-2 group/input">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                      />
                    </div>

                    {/* Time Window */}
                    <div className="space-y-2 group/input">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Jam Aktif</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          required
                          value={opensAt}
                          onChange={(e) => setOpensAt(e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-3 py-3.5 text-center rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        />
                        <span className="text-slate-600 font-mono text-xs">-</span>
                        <input
                          type="time"
                          required
                          value={closesAt}
                          onChange={(e) => setClosesAt(e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-3 py-3.5 text-center rounded-xl font-mono text-xs text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Posko */}
                  <div className="space-y-2 group/input">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center justify-between">
                      <span>Lokasi Presensi</span>
                      <span className="text-cyan-500/50 font-normal">Opsional</span>
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Nama lokasi atau titik koordinat..."
                      className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-sans text-sm text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 group/input">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block flex items-center justify-between">
                      <span>Deskripsi Sesi</span>
                      <span className="text-cyan-500/50 font-normal">Opsional</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tambahkan catatan khusus untuk sesi ini..."
                      rows={2}
                      className="w-full bg-[#080a0f] border border-white/[0.08] group-hover/input:border-white/[0.15] focus:border-cyan-500/50 px-4 py-3.5 rounded-xl font-sans text-sm text-white focus:outline-none resize-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div className="bg-[#080a0f] border border-white/[0.06] rounded-xl overflow-hidden mt-2">
                    <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
                      <Lock size={12} className="text-cyan-400" />
                      <h4 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Keamanan & Validasi</h4>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={isPublic} 
                            onChange={(e) => setIsPublic(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Buka Presensi Publik</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={requireGps} 
                            onChange={(e) => setRequireGps(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Wajib Sinkron GPS</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={requireSelfie} 
                            onChange={(e) => setRequireSelfie(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Wajib Foto Selfie</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group/cb">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={autoCloseEnabled} 
                            onChange={(e) => setAutoCloseEnabled(e.target.checked)} 
                            className="peer appearance-none w-4 h-4 rounded-md border border-white/20 bg-black/50 checked:bg-cyan-500 checked:border-cyan-400 transition-all cursor-pointer"
                          />
                          <Check size={10} className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        </div>
                        <span className="text-xs text-slate-400 group-hover/cb:text-slate-200 transition-colors font-mono">Otomatis Tutup Sesi</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-white/[0.06] mt-8">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider cursor-pointer text-center"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all text-xs font-sans font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          BUAT SESI BARU
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
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
