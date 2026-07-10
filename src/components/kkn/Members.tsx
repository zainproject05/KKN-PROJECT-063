import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, Trash2, Mail, Phone, Award, Edit, 
  CheckCircle, X, Search, Grid, List, Check, Upload, ArrowUpRight, KeyRound, MessageSquare, Send
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { audio } from "../../utils/audioService";
import { cn } from "@/lib/utils";

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 360 362" className={className}>
    <path fill="#25D366" fillRule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clipRule="evenodd" />
  </svg>
);

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [allActiveMembers, setAllActiveMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");

  // Form State
  const [fullName, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [gender, setGender] = useState("Laki-laki");
  const [faculty, setFaculty] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [kknRole, setKknRole] = useState("Anggota");
  const [isActive, setIsActive] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [submittedBy, setSubmittedBy] = useState("");

  // Editing State
  const [editingMember, setEditingMember] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // PIN Setup States
  const [pinMember, setPinMember] = useState<any | null>(null);
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  // WhatsApp Template Modal States
  const [waModalMember, setWaModalMember] = useState<any | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("attendance");
  const [waMessageText, setWaMessageText] = useState<string>("");

  const whatsappTemplates = [
    {
      id: "attendance",
      title: "Pengingat Kehadiran / Absensi KKN",
      text: (name: string) => `Halo *${name}*, jangan lupa untuk melakukan presensi/absensi KKN hari ini ya. Silakan buka dashboard KKN dan masukkan PIN Anda untuk check-in. Terima kasih!`
    },
    {
      id: "program",
      title: "Koordinasi Program Kerja KKN",
      text: (name: string) => `Halo *${name}*, mohon kehadirannya untuk rapat koordinasi program kerja KKN kita hari ini. Kita akan membahas kelanjutan program kerja. Tetap semangat!`
    },
    {
      id: "finance",
      title: "Pengingat Iuran / Kas KKN",
      text: (name: string) => `Halo *${name}*, ini adalah pengingat ramah untuk pembayaran iuran kas kelompok KKN kita. Mohon segera melunasi iuran ke bendahara ya. Terima kasih!`
    },
    {
      id: "urgent",
      title: "Pengumuman Penting & Urgent",
      text: (name: string) => `PENTING: Halo *${name}*, mohon segera merapat ke posko KKN kita sekarang untuk koordinasi darurat/briefing penting. Harap segera konfirmasi pesan ini. Terima kasih!`
    },
    {
      id: "custom",
      title: "Tulis Pesan Kustom Anda Sendiri",
      text: (name: string) => `Halo *${name}*, `
    }
  ];

  const handleSendWA = () => {
    if (!waModalMember) return;
    const num = getWA(waModalMember);
    let clean = num.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    const encodedText = encodeURIComponent(waMessageText);
    const url = `https://wa.me/${clean}?text=${encodedText}`;
    window.open(url, "_blank");
    setWaModalMember(null);
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess(false);

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinError("PIN harus terdiri dari 6 digit angka.");
      return;
    }

    try {
      // Hash the PIN using SHA-256 Web Crypto
      const msgBuffer = new TextEncoder().encode(newPin);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const isSupabaseConfigured = !((supabase as any).tableName && (supabase as any).tableName === "MockSupabaseQueryBuilder");

      if (!isSupabaseConfigured) {
        // Mock implementation updates localStorage
        const key = "kkn_local_member_attendance_pins";
        const storedPins = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = storedPins.filter((p: any) => p.member_id !== pinMember.id);
        const updated = [...filtered, {
          id: "pin_" + Math.random().toString(36).substring(2, 10),
          member_id: pinMember.id,
          pin_hash: hashHex,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }];
        localStorage.setItem(key, JSON.stringify(updated));
      } else {
        // Check if pin exists
        const { data: existing, error: getErr } = await supabase
          .from("member_attendance_pins")
          .select("id")
          .eq("member_id", pinMember.id);

        if (getErr) throw getErr;

        if (existing && existing.length > 0) {
          const { error: updErr } = await supabase
            .from("member_attendance_pins")
            .update({ pin_hash: hashHex, updated_at: new Date().toISOString() })
            .eq("member_id", pinMember.id);
          if (updErr) throw updErr;
        } else {
          const { error: insErr } = await supabase
            .from("member_attendance_pins")
            .insert([{
              member_id: pinMember.id,
              pin_hash: hashHex
            }]);
          if (insErr) throw insErr;
        }
      }

      setPinSuccess(true);
      setNewPin("");
      setTimeout(() => {
        setPinMember(null);
        setPinSuccess(false);
      }, 1500);

    } catch (err: any) {
      setPinError(err?.message || "Gagal menyimpan PIN.");
    }
  };

  // Subscribe to realtime database changes
  useRealtimeRefresh(() => {
    fetchMembers();
  });

  useEffect(() => {
    fetchMembers();
  }, []);

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

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
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
          is_public_profile,
          kkn_role
        `)
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      
      if (!fetchErr && data) {
        const mapped = data.map((m: any) => ({
          ...m,
          whatsapp: m.whatsapp_number || m.whatsapp || "",
          is_public: m.is_public_profile !== undefined ? m.is_public_profile : (m.is_public !== undefined ? m.is_public : true)
        }));
        setMembers(mapped);
        setAllActiveMembers(mapped);
      } else {
        setMembers([]);
        setAllActiveMembers([]);
      }
    } catch (err) {
      console.error(err);
      setMembers([]);
      setAllActiveMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `member-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get signed URL or Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("member-photos")
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError("Gagal mengunggah foto: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !nim.trim() || !whatsapp.trim() || !faculty.trim() || !studyProgram.trim()) {
      setError("Harap isi semua kolom wajib.");
      return;
    }

    const authorId = submittedBy || (allActiveMembers && allActiveMembers.length > 0 ? allActiveMembers[0].id : "00000000-0000-0000-0000-000000000000");

    const payload = {
      full_name: fullName.trim(),
      nim: nim.trim(),
      whatsapp: whatsapp.trim(),
      gender,
      faculty: faculty.trim(),
      study_program: studyProgram.trim(),
      photo_url: photoUrl.trim() || null,
      kkn_role: kknRole,
      is_active: isActive,
      is_public: isPublic,
      created_by_member_id: authorId,
      updated_by_member_id: authorId
    };

    try {
      const { error: insertErr } = await supabase.from("members").insert([payload]);
      if (insertErr) throw insertErr;

      // Add log
      await supabase.from("activity_logs").insert([{
        message: `Mendaftarkan anggota baru: ${fullName.trim()} (${kknRole})`,
        created_by_member_id: authorId
      }]);

      // Reset
      setFullName("");
      setNim("");
      setWhatsapp("");
      setGender("Laki-laki");
      setFaculty("");
      setStudyProgram("");
      setPhotoUrl("");
      setKknRole("Anggota");
      setIsActive(true);
      setIsPublic(true);
      setShowAddForm(false);
      fetchMembers();
    } catch (err: any) {
      setError(err?.message || "Gagal menambahkan anggota.");
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setError(null);

    if (!fullName.trim() || !nim.trim() || !whatsapp.trim() || !faculty.trim() || !studyProgram.trim()) {
      setError("Harap isi semua kolom wajib.");
      return;
    }

    const authorId = submittedBy || (allActiveMembers && allActiveMembers.length > 0 ? allActiveMembers[0].id : "00000000-0000-0000-0000-000000000000");

    const payload = {
      full_name: fullName.trim(),
      nim: nim.trim(),
      whatsapp: whatsapp.trim(),
      gender,
      faculty: faculty.trim(),
      study_program: studyProgram.trim(),
      photo_url: photoUrl.trim() || null,
      kkn_role: kknRole,
      is_active: isActive,
      is_public: isPublic,
      updated_by_member_id: authorId
    };

    try {
      const { error: updateErr } = await supabase
        .from("members")
        .update(payload)
        .eq("id", editingMember.id);

      if (updateErr) throw updateErr;

      // Add log
      await supabase.from("activity_logs").insert([{
        message: `Memperbarui profil anggota: ${fullName.trim()} (${kknRole})`,
        created_by_member_id: authorId
      }]);

      setEditingMember(null);
      setFullName("");
      setNim("");
      setWhatsapp("");
      setGender("Laki-laki");
      setFaculty("");
      setStudyProgram("");
      setPhotoUrl("");
      setKknRole("Anggota");
      setIsActive(true);
      setIsPublic(true);
      fetchMembers();
    } catch (err: any) {
      setError(err?.message || "Gagal memperbarui profil.");
    }
  };

  const handleDeleteMember = async (id: string, memberName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan anggota ${memberName}?`)) return;

    try {
      const { error: delErr } = await supabase
        .from("members")
        .update({ is_active: false })
        .eq("id", id);

      if (delErr) throw delErr;

      // Add log
      await supabase.from("activity_logs").insert([{
        message: `Menonaktifkan anggota: ${memberName}`,
      }]);

      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const getWA = (m: any) => {
    if (!m) return "";
    return m.whatsapp || m.phone || m.no_wa || m.whatsapp_number || m.phone_number || "";
  };

  const startEdit = (member: any) => {
    setEditingMember(member);
    setFullName(member.full_name || "");
    setNim(member.nim || "");
    setWhatsapp(getWA(member));
    setGender(member.gender || "Laki-laki");
    setFaculty(member.faculty || "");
    setStudyProgram(member.study_program || "");
    setPhotoUrl(member.photo_url || "");
    setKknRole(member.kkn_role || "Anggota");
    setIsActive(member.is_active);
    setIsPublic(member.is_public);
    setShowAddForm(false);
  };

  const handleWAUrl = (num: string) => {
    let clean = num.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  // Filter Logic
  const filteredMembers = members.filter(m => {
    const term = search.toLowerCase();
    const matchSearch = 
      (m.full_name || "").toLowerCase().includes(term) ||
      (m.nim || "").toLowerCase().includes(term) ||
      (m.faculty || "").toLowerCase().includes(term) ||
      (m.study_program || "").toLowerCase().includes(term) ||
      (m.kkn_role || "").toLowerCase().includes(term);

    const matchFaculty = selectedFaculty === "all" || m.faculty === selectedFaculty;
    const matchGender = selectedGender === "all" || m.gender === selectedGender;

    return matchSearch && matchFaculty && matchGender;
  });

  const uniqueFaculties = Array.from(new Set(members.map(m => m.faculty).filter(Boolean)));

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
            MEMBERSHIP DIRECTORY
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider mt-2.5">
            KKN GROUP MEMBERS ({filteredMembers.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar resmi peserta KKN Group 063 Persyarikatan Muhammadiyah UMY.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-[#030406] border border-white/5 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25" : "text-slate-500 hover:text-slate-300"}`}
            >
              <List size={15} />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingMember(null);
              setFullName("");
              setNim("");
              setWhatsapp("");
              setGender("Laki-laki");
              setFaculty("");
              setStudyProgram("");
              setPhotoUrl("");
              setIsActive(true);
              setIsPublic(true);
              setShowAddForm(!showAddForm);
            }}
            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 hover:from-cyan-400 hover:to-indigo-500 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer"
          >
            {showAddForm ? <X size={15} /> : <UserPlus size={15} />}
            <span>{showAddForm ? "Batal" : "Tambah Anggota"}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 nm-card-3d p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, NIM, fakultas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="nm-input w-full pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="nm-input w-full p-2.5 font-mono text-xs text-white focus:outline-none"
          >
            <option value="all" className="bg-[#0c1322] text-white">Semua Fakultas</option>
            {uniqueFaculties.map((f, idx) => (
              <option key={idx} value={f} className="bg-[#0c1322] text-white">{f}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="nm-input w-full p-2.5 font-mono text-xs text-white focus:outline-none"
          >
            <option value="all" className="bg-[#0c1322] text-white">Semua Gender</option>
            <option value="Laki-laki" className="bg-[#0c1322] text-white">Laki-laki</option>
            <option value="Perempuan" className="bg-[#0c1322] text-white">Perempuan</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {(showAddForm || editingMember) && (
          <motion.form
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={editingMember ? handleUpdateMember : handleAddMember}
            className="nm-card-3d p-6 space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {editingMember ? "Formulir Edit Anggota" : "Formulir Pendaftaran Anggota Baru"}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMember(null);
                }}
                className="text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Ahmad Dahlan"
                  className="nm-input w-full p-3 font-mono text-xs text-white placeholder:text-slate-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">NIM (Nomor Induk Mahasiswa)</label>
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Contoh: 20260130001"
                  className="nm-input w-full p-3 font-mono text-xs text-white placeholder:text-slate-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="nm-input w-full p-3 font-mono text-xs text-white placeholder:text-slate-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none"
                >
                  <option value="Laki-laki" className="bg-[#0c1322] text-white">Laki-laki</option>
                  <option value="Perempuan" className="bg-[#0c1322] text-white">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Fakultas</label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="Contoh: Teknik"
                  className="nm-input w-full p-3 font-mono text-xs text-white placeholder:text-slate-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Program Studi</label>
                <input
                  type="text"
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  placeholder="Contoh: Teknologi Informasi"
                  className="nm-input w-full p-3 font-mono text-xs text-white placeholder:text-slate-650 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Jabatan / Divisi KKN</label>
                <select
                  value={kknRole}
                  onChange={(e) => setKknRole(e.target.value)}
                  className="nm-input w-full p-3 font-mono text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Ketua" className="bg-[#0c1322] text-white">Ketua</option>
                  <option value="Sekretaris" className="bg-[#0c1322] text-white">Sekretaris</option>
                  <option value="Bendahara" className="bg-[#0c1322] text-white">Bendahara</option>
                  <option value="Acara" className="bg-[#0c1322] text-white">Acara</option>
                  <option value="Humas" className="bg-[#0c1322] text-white">Humas</option>
                  <option value="Perlengkapan" className="bg-[#0c1322] text-white">Perlengkapan</option>
                  <option value="Konsumsi" className="bg-[#0c1322] text-white">Konsumsi</option>
                  <option value="PDD" className="bg-[#0c1322] text-white">PDD</option>
                  <option value="Anggota" className="bg-[#0c1322] text-white">Anggota</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">URL Foto (Opsional / Link Saja)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="nm-input flex-1 p-3 font-mono text-xs text-white placeholder:text-slate-650 focus:outline-none"
                  />
                  {photoUrl && photoUrl.trim() !== "" && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/30 shrink-0 shadow-lg ring-2 ring-cyan-500/20">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="nm-btn px-5 py-3 text-cyan-400 text-xs font-sans font-black uppercase tracking-wider flex items-center gap-2"
              >
                <CheckCircle size={15} />
                <span>{editingMember ? "Simpan Perubahan" : "Daftarkan Anggota"}</span>
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
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Sinkronisasi database anggota...</span>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-16 text-center bg-[#030406]/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
          <Users size={36} className="text-slate-650 mb-3" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak Ada Anggota</h3>
          <p className="text-xs text-slate-550 mt-1">Daftar anggota kosong atau filter tidak cocok.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const waNum = getWA(member);
            return (
              <div
                key={member.id}
                className="nm-card-3d p-6.5 flex flex-col justify-between group transition-all duration-300 border border-white/5 text-left relative overflow-hidden rounded-3xl"
              >
                {/* 3D Decorative Top Light Accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Interactive Background Radial Glow */}
                <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/5 via-indigo-500/3 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

                <div className="space-y-5.5 relative z-10">
                  <div className="flex items-center gap-4.5">
                    {/* Luxurious Avatar Container with neon ring */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c101d] to-[#04060c] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center font-black text-white text-lg ring-2 ring-cyan-500/10 group-hover:ring-cyan-500/35 transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                      {getMemberPhotoUrl(member) ? (
                        <img referrerPolicy="no-referrer" src={getMemberPhotoUrl(member)!} alt={member.full_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="text-cyan-400 font-black tracking-wider text-sm bg-cyan-500/5 w-full h-full flex items-center justify-center">
                          {member.full_name ? member.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="text-[13.5px] font-black text-white uppercase tracking-wider truncate" title={member.full_name}>
                        {member.full_name}
                      </h3>
                      <p className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest leading-none">
                        {member.nim}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 truncate uppercase tracking-wider font-semibold">
                        {member.study_program}
                      </p>
                    </div>
                  </div>

                  {/* Premium metadata list with clean custom-styled key-values */}
                  <div className="space-y-3 bg-slate-950/40 border border-white/[0.03] p-4.5 rounded-2xl text-[10.5px] text-slate-300 font-sans shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-2.5">
                      <span className="text-slate-500 text-[8.5px] uppercase tracking-wider font-black font-mono">Fakultas</span>
                      <span className="text-slate-200 font-bold truncate max-w-[170px] text-right" title={member.faculty || "-"}>{member.faculty || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-2.5">
                      <span className="text-slate-500 text-[8.5px] uppercase tracking-wider font-black font-mono flex items-center gap-1.5">
                        <Phone size={9} className="text-cyan-400 shrink-0" />
                        <span>WhatsApp</span>
                      </span>
                      <span className="text-cyan-400 font-mono font-black tracking-wider text-[10px]">{waNum || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-2.5">
                      <span className="text-slate-500 text-[8.5px] uppercase tracking-wider font-black font-mono">Gender</span>
                      <span className="uppercase text-slate-300 font-black text-[9px] font-mono">{member.gender}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-2.5">
                      <span className="text-slate-500 text-[8.5px] uppercase tracking-wider font-black font-mono">Sektor Sesi</span>
                      <span className="px-2 py-0.5 rounded-full text-[8px] bg-[#0d1527] text-cyan-400 font-black uppercase tracking-widest border border-cyan-500/20 shadow-sm font-mono">
                        Active Member
                      </span>
                    </div>
                    {/* Role (Jabatan) at the bottom! */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500 text-[8.5px] uppercase tracking-wider font-black font-mono">Jabatan KKN</span>
                      <span className="px-3 py-1 rounded-xl text-[8.5px] bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-pink-500/15 text-white border border-cyan-400/30 font-black uppercase tracking-wider shadow-[0_2px_10px_rgba(6,182,212,0.1)]">
                        {member.kkn_role || "Anggota"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.04] flex justify-between items-center relative z-10">
                  {waNum ? (
                    <button
                      onClick={() => {
                        audio.playSecondaryClick();
                        setWaModalMember(member);
                        setSelectedTemplate("attendance");
                        setWaMessageText(whatsappTemplates[0].text(member.full_name));
                      }}
                      className="text-[9.5px] font-sans font-black text-emerald-400 hover:text-emerald-350 flex items-center gap-2 uppercase tracking-wider cursor-pointer bg-emerald-500/5 hover:bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Hubungi WA</span>
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 bg-white/[0.02] rounded-xl border border-white/5">
                      No WA Number
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(member)}
                      className="p-2.5 rounded-xl bg-[#090d16] border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 active:scale-90 transition-all cursor-pointer shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
                      title="Edit Profil"
                    >
                      <Edit size={12.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.full_name)}
                      className="p-2.5 rounded-xl bg-red-950/10 border border-red-500/10 text-red-400 hover:bg-red-500/10 hover:text-red-350 active:scale-90 transition-all cursor-pointer shadow-[2px_2px_4px_rgba(0,0,0,0.8)]"
                      title="Hapus / Nonaktifkan"
                    >
                      <Trash2 size={12.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#030406]/80 text-[11px] font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-white/5 text-slate-400 text-[9px] uppercase tracking-widest">
                <th className="p-4 font-black">Profil</th>
                <th className="p-4 font-black">NIM</th>
                <th className="p-4 font-black">Jabatan</th>
                <th className="p-4 font-black">WhatsApp</th>
                <th className="p-4 font-black">Fakultas / Prodi</th>
                <th className="p-4 font-black">Gender</th>
                <th className="p-4 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const waNum = getWA(member);
                return (
                  <tr key={member.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center font-black text-white shrink-0">
                        {getMemberPhotoUrl(member) ? (
                          <img referrerPolicy="no-referrer" src={getMemberPhotoUrl(member)!} alt={member.full_name} className="w-full h-full object-cover" />
                        ) : (
                          member.full_name ? member.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "?"
                        )}
                      </div>
                      <span className="font-extrabold text-white text-xs uppercase">{member.full_name}</span>
                    </td>
                    <td className="p-4">{member.nim}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-extrabold uppercase tracking-widest">
                        {member.kkn_role || "Anggota"}
                      </span>
                    </td>
                    <td className="p-4 text-cyan-400 font-extrabold font-mono">{waNum || "-"}</td>
                    <td className="p-4">
                      <span className="text-white uppercase font-semibold">{member.faculty}</span>
                      <span className="block text-[10px] text-slate-500">{member.study_program}</span>
                    </td>
                    <td className="p-4 uppercase">{member.gender}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {waNum && (
                          <button
                            onClick={() => {
                              audio.playSecondaryClick();
                              setWaModalMember(member);
                              setSelectedTemplate("attendance");
                              setWaMessageText(whatsappTemplates[0].text(member.full_name));
                            }}
                            className="p-2 rounded-lg bg-slate-900 border border-white/5 hover:bg-[#0c1a15] text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center justify-center"
                            title="Kirim WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(member)}
                          className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
                          title="Edit Profil"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, member.full_name)}
                          className="p-2 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-900/30 cursor-pointer"
                          title="Hapus / Nonaktifkan"
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

      {/* PIN Modification Modal */}
      <AnimatePresence>
        {pinMember && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPinMember(null)}
              className="absolute inset-0 bg-[#000]/70 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-[2rem] bg-gradient-to-b from-[#0e1222] to-[#03050a] border border-cyan-500/20 p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.95)] text-left overflow-hidden"
            >
              {/* Top light bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound size={16} className="text-amber-400" />
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                    PENGATURAN KEAMANAN PIN
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPinMember(null)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">
                    {pinMember.full_name}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                    NIM: {pinMember.nim}
                  </p>
                </div>

                <form onSubmit={handleSetPin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Masukkan 6-Digit PIN Baru
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      pattern="\d*"
                      inputMode="numeric"
                      value={newPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewPin(val);
                        setPinError("");
                      }}
                      placeholder="• • • • • •"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-amber-500/40 p-3 rounded-xl font-mono text-center text-lg tracking-[0.5em] text-white placeholder:text-slate-700 placeholder:tracking-normal focus:outline-none"
                    />
                    <p className="text-[9px] font-mono text-slate-500 leading-normal uppercase">
                      * PIN ini akan digunakan oleh anggota untuk memverifikasi kehadiran saat melakukan scan QR Code presensi.
                    </p>
                  </div>

                  {pinError && (
                    <p className="text-[10px] font-mono text-red-400">
                      {pinError}
                    </p>
                  )}

                  {pinSuccess && (
                    <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold uppercase">
                      <CheckCircle size={12} />
                      PIN BERHASIL DISIMPAN & DI-HASH!
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPinMember(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(245,158,11,0.25)] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={12} />
                      Simpan PIN
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* WhatsApp Template Modal */}
        {waModalMember && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWaModalMember(null)}
              className="absolute inset-0 bg-[#000]/70 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-[2rem] bg-gradient-to-b from-[#0e1222] to-[#03050a] border border-emerald-500/25 p-6 sm:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.95)] text-left overflow-hidden"
            >
              {/* Top light bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <WhatsAppIcon className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                    PORTAL WHATSAPP KKN
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setWaModalMember(null)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wide">
                    Kirim Pesan ke: {waModalMember.full_name}
                  </h4>
                  <p className="text-[9.5px] font-mono text-emerald-400 uppercase tracking-widest mt-0.5">
                    WhatsApp: {getWA(waModalMember)}
                  </p>
                </div>

                {/* Template Selector Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    PILIH TEMPLATE PESAN
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      audio.playPrimaryClick();
                      const tplId = e.target.value;
                      setSelectedTemplate(tplId);
                      const chosen = whatsappTemplates.find(t => t.id === tplId);
                      if (chosen) {
                        setWaMessageText(chosen.text(waModalMember.full_name));
                      }
                    }}
                    className="w-full bg-[#05070a] border border-white/5 focus:border-emerald-500/40 p-3 rounded-xl font-mono text-xs text-emerald-300 focus:outline-none cursor-pointer"
                  >
                    {whatsappTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id} className="bg-[#0c1322] text-white">
                        {tpl.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Editor Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    EDIT ISI PESAN (KUSTOMISASI)
                  </label>
                  <textarea
                    rows={4}
                    value={waMessageText}
                    onChange={(e) => setWaMessageText(e.target.value)}
                    className="w-full bg-[#05070a] border border-white/5 focus:border-emerald-500/40 p-3.5 rounded-xl font-mono text-xs text-white leading-relaxed focus:outline-none placeholder:text-slate-700"
                    placeholder="Tulis pesan Anda di sini..."
                  />
                  <p className="text-[8px] font-mono text-slate-500 leading-normal uppercase">
                    * Pesan akan otomatis dikirim menggunakan format teks tebal/miring sesuai kaidah WhatsApp.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setWaModalMember(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWA}
                    className="px-4.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                    Kirim ke WhatsApp
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
