import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

const newFuncs = `
  const handlePresentAll = markAllPresent;
  const handleResetAll = resetAttendance;

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
`;

content = content.replace(/(const resetAttendance = async \(session: any\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\n  \};\n)/, '$1' + newFuncs);

fs.writeFileSync('src/components/kkn/Attendance.tsx', content);

