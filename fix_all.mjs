import fs from 'fs';

// Helper function to process strings
const replaceAll = (str, find, replace) => str.split(find).join(replace);

// --- 1. Fix src/components/kkn/Attendance.tsx ---
let attContent = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

// A. handleCreateSession
const oldCreateStart = 'const handleCreateSession = async (e: React.FormEvent) => {';
const newCreate = `const handleCreateSession = async (e: React.FormEvent) => {
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
      const startsAt = new Date(\`\${sessionDate}T\${startTime}:00+07:00\`).toISOString();
      const endsAt = new Date(\`\${sessionDate}T\${endTime}:00+07:00\`).toISOString();

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
          status: "scheduled",
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
  };`;

// We'll regex replace handleCreateSession block
attContent = attContent.replace(/const handleCreateSession = async \(e: React\.FormEvent\) => \{[\s\S]*?(?=const handleUpdateStatus|const getMemberPhotoUrl)/, newCreate + '\n\n  ');

// B. handleUpdateStatus
const newUpdate = `const handleUpdateStatus = async (session: any, memberId: string, newStatus: string) => {
    if (session.status === "closed") {
      showToast("Sesi presensi sudah ditutup dan tidak dapat diedit.", "error");
      return;
    }

    try {
      if (newStatus === "Belum Absen") {
        await supabase
          .from("attendance_records")
          .delete()
          .eq("attendance_session_id", session.id)
          .eq("member_id", memberId);
      } else {
        const internalStatus = STATUS_MAP[newStatus] || newStatus;
        const payload = {
          attendance_session_id: session.id,
          member_id: memberId,
          attendance_status: internalStatus,
          notes: "Ditandai manual oleh admin",
          check_in_at: new Date().toISOString(),
          attendance_source: "admin_manual",
          verification_status: "manual_verified",
          location_verified: false,
          selfie_verified: false,
          photo_verified: false,
          updated_by_member_id: null
        };
        
        // Upsert by constraint (attendance_session_id, member_id)
        const { error } = await supabase
          .from("attendance_records")
          .upsert(payload, { onConflict: 'attendance_session_id, member_id' });
          
        if (error) {
           // Fallback to update/insert if constraint fails or doesn't exist
           const { data: exist } = await supabase.from("attendance_records")
             .select("id").eq("attendance_session_id", session.id).eq("member_id", memberId).single();
           
           if (exist) {
             await supabase.from("attendance_records").update(payload).eq("id", exist.id);
           } else {
             await supabase.from("attendance_records").insert(payload);
           }
        }
      }
      
      showToast("Status presensi berhasil diperbarui.");
      fetchData();
    } catch (err: any) {
      console.error("Manual attendance update failed:", err);
      showToast("Status presensi gagal diperbarui.", "error");
    }
  };`;
attContent = attContent.replace(/const handleUpdateStatus = async \(session: any, memberId: string, newStatus: string\) => \{[\s\S]*?(?=const markAllPresent|const markAllAbsent|const resetAttendance)/, newUpdate + '\n\n  ');

// Let's just execute this and see if it hits.
fs.writeFileSync('src/components/kkn/Attendance.tsx', attContent);
