import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

// Fix the dropdown option "Belum Absen" to be selectable
content = content.replace(
  '<option value="Belum Absen" disabled>Belum</option>',
  '<option value="Belum Absen">Belum Absen</option>'
);

// We should fix markAllPresent / bulk actions
const newBulk = `const markAllPresent = async (session: any) => {
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

  const resetAttendance = async (session: any) => {
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
  };`;
content = content.replace(/const markAllPresent = async \(session: any\) => \{[\s\S]*?(?=const handleDeleteSession)/, newBulk + '\n\n  ');

fs.writeFileSync('src/components/kkn/Attendance.tsx', content);
