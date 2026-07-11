import fs from 'fs';
// We'll read Attendance.tsx
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

// I'll replace the create session logic to ONLY insert the session, not records.
const newHandleCreateSession = `
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
      fetchData(); // Refetch sessions
    } catch (err: any) {
      console.error("Create session error:", err);
      setError("Gagal membuat sesi: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };
`;
// Let's first search for handleCreateSession in Attendance.tsx
console.log("Searching for handleCreateSession...");
