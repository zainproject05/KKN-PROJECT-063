import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Copy, Check, MessageSquare, Plus, Trash2, 
  Edit, X, Search, CheckCircle, AlertCircle, Share2,
  Sparkles, User, Users, BookOpen, FileText, MessageCircle, 
  ExternalLink, ChevronRight, Phone, Sliders
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";

interface TemplatePreset {
  id: string;
  title: string;
  description: string;
  recipientDefault: string;
  phoneDefault: string;
  rawMessage: string;
}

// 4 Professional Indonesian KKN Presets (strictly formal, polite, no emojis/stickers/logos, optimized with bold/italic)
const PRESET_TEMPLATES: TemplatePreset[] = [
  {
    id: "preset-1",
    title: "Undangan Rapat Sosialisasi Proker",
    description: "Undangan resmi dan sangat sopan untuk mengundang Kepala Desa, RT, RW, atau tokoh masyarakat ke rapat sosialisasi program kerja.",
    recipientDefault: "Bapak Kepala Desa / Dukuh",
    phoneDefault: "628123456789",
    rawMessage: "Kepada Yth.\n*Bapak/Ibu {Penerima}*\ndi Tempat\n\n_Assalamu'alaikum Warahmatullahi Wabarakatuh,_\n\nSalam sejahtera untuk kita semua. Semoga Bapak/Ibu senantiasa dalam keadaan sehat wal'afiat dan dilancarkan dalam segala urusan.\n\nSehubungan dengan pelaksanaan program Kuliah Kerja Nyata (KKN) oleh *{Kelompok}* dari *{Universitas}*, kami bermaksud untuk menyelenggarakan koordinasi dan sosialisasi terkait program kerja yang akan dilaksanakan di wilayah ini.\n\nUntuk itu, kami mengharapkan kehadiran Bapak/Ibu pada:\n\nHari, Tanggal: *{Tanggal}*\nWaktu: *{Waktu} WIB*\nTempat: *{Tempat}*\nAgenda: *{Proker}*\n\nDemikian undangan ini kami sampaikan. Mengingat pentingnya agenda ini untuk pembangunan wilayah, kehadiran Bapak/Ibu sangat kami harapkan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\n_Wassalamu'alaikum Warahmatullahi Wabarakatuh._\n\nHormat kami,\nTim KKN *{Kelompok}*\nNarahubung: *{Kontak}* ({Telepon})"
  },
  {
    id: "preset-2",
    title: "Koordinasi Rapat dengan Karang Taruna",
    description: "Undangan diskusi interaktif dengan pemuda desa atau Karang Taruna untuk kolaborasi program kerja kepemudaan.",
    recipientDefault: "Ketua Karang Taruna",
    phoneDefault: "628987654321",
    rawMessage: "Kepada Yth.\n*Ketua & Rekan-rekan Karang Taruna {Tempat}*\ndi Tempat\n\n_Assalamu'alaikum Warahmatullahi Wabarakatuh,_\n\nSalam pemuda! Semoga rekan-rekan sekalian selalu dalam keadaan sehat dan penuh semangat.\n\nKami dari tim *{Kelompok} {Universitas}* ingin mengajak rekan-rekan pengurus dan anggota Karang Taruna untuk duduk bersama dalam forum koordinasi dan kolaborasi kegiatan kepemudaan serta program kerja KKN yang akan kami laksanakan.\n\nPertemuan rencananya akan diselenggarakan pada:\n\nHari, Tanggal: *{Tanggal}*\nWaktu: *{Waktu} WIB*\nTempat: *{Tempat}*\nAgenda: *Diskusi Kolaborasi Program Kerja {Proker}*\n\nKehadiran dan masukan dari rekan-rekan sangat krusial agar program ini dapat berjalan sukses dan bermanfaat bagi seluruh masyarakat desa.\n\nAtas perhatian, waktu, dan kerjasamanya, kami mengucapkan terima kasih banyak.\n\n_Wassalamu'alaikum Warahmatullahi Wabarakatuh._\n\nSalam hangat,\nTim KKN *{Kelompok}*\nNarahubung: *{Kontak}* ({Telepon})"
  },
  {
    id: "preset-3",
    title: "Pemberitahuan Kegiatan Bimbel Anak",
    description: "Pemberitahuan sopan dan informatif kepada orang tua/wali murid mengenai pembukaan program bimbingan belajar anak gratis.",
    recipientDefault: "Orang Tua / Wali Murid",
    phoneDefault: "628555444333",
    rawMessage: "Kepada Yth.\n*Bapak/Ibu Orang Tua / Wali Murid Dusun {Tempat}*\ndi Tempat\n\n_Assalamu'alaikum Warahmatullahi Wabarakatuh,_\n\nSemoga Bapak/Ibu beserta keluarga selalu berada dalam lindungan Tuhan Yang Maha Esa.\n\nSehubungan dengan salah satu program kerja pengabdian masyarakat oleh *{Kelompok} {Universitas}*, kami bermaksud untuk menyelenggarakan kegiatan *Bimbingan Belajar Gratis* bagi anak-anak tingkat SD dan SMP di wilayah Dusun {Tempat}.\n\nKegiatan bimbingan belajar ini akan kami mulai pada:\n\nHari, Tanggal: *{Tanggal}*\nWaktu: *{Waktu} WIB*\nTempat: *{Tempat}*\nMateri: *{Proker}*\n\nKami sangat mengharapkan Bapak/Ibu dapat memberikan izin dan mendukung putra-putrinya untuk mengikuti kegiatan belajar bersama ini guna menunjang prestasi akademis mereka.\n\nUntuk pendaftaran atau informasi lebih lanjut, Bapak/Ibu dapat menghubungi narahubung kami di bawah ini. Atas perhatian dan dukungan Bapak/Ibu, kami sampaikan terima kasih.\n\n_Wassalamu'alaikum Warahmatullahi Wabarakatuh._\n\nHormat kami,\nTim KKN *{Kelompok}*\nNarahubung: *{Kontak}* ({Telepon})"
  },
  {
    id: "preset-4",
    title: "Laporan Mingguan Kegiatan ke DPL",
    description: "Laporan perkembangan (progress) program kerja mingguan kelompok yang dikirimkan secara formal kepada Dosen Pembimbing Lapangan.",
    recipientDefault: "Dosen Pembimbing Lapangan (DPL)",
    phoneDefault: "628112233445",
    rawMessage: "Selamat pagi/siang Yth.\n*Bapak/Ibu Dosen Pembimbing Lapangan*\ndi Tempat\n\n_Assalamu'alaikum Warahmatullahi Wabarakatuh,_\n\nMohon maaf mengganggu waktunya Bapak/Ibu. Kami dari *{Kelompok} {Universitas}* ingin melaporkan ringkasan perkembangan pelaksanaan program kerja KKN kami hingga pekan ini.\n\nBerikut adalah beberapa rincian progress program:\n1. Program Kerja: *{Proker}*\n2. Waktu Pelaksanaan: *{Tanggal}*\n3. Lokasi: *{Tempat}*\n5. Status: *Telah Terlaksana / Sedang Berjalan*\n\nAlhamdulillah seluruh rangkaian kegiatan berjalan dengan lancar berkat partisipasi aktif warga setempat. Sebagai tindak lanjut, agenda kami berikutnya adalah koordinasi terkait persiapan program lanjutan.\n\nLaporan lengkap dalam bentuk dokumen terlampir sedang kami siapkan untuk bimbingan berikutnya.\n\nDemikian laporan berkala ini kami sampaikan. Kami sangat mengharapkan arahan, saran, serta masukan dari Bapak/Ibu untuk kelancaran program selanjutnya. Atas bimbingan dan waktu Bapak/Ibu, kami ucapkan terima kasih banyak.\n\n_Wassalamu'alaikum Warahmatullahi Wabarakatuh._\n\nHormat kami,\n**{Kelompok}**\nKetua Kelompok: *{Kontak}* ({Telepon})"
  }
];

// Helper to convert WhatsApp style *bold* and _italic_ markup to styled HTML
function renderWhatsAppFormatting(text: string) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Replace **word** or *word* with bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-white'>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<strong class='font-bold text-white'>$1</strong>");
  
  // Replace _word_ with italic
  html = html.replace(/_(.*?)_/g, "<em class='italic text-slate-300'>$1</em>");
  
  // Replace newlines with <br />
  html = html.replace(/\n/g, "<br />");
  return html;
}

export default function WhatsAppTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search Filter
  const [search, setSearch] = useState("");

  // Form State
  const [recipient, setRecipient] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [message, setMessage] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Template Variables Configurator State
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [varGroup, setVarGroup] = useState("Kelompok 063 Persyarikatan");
  const [varUniversity, setVarUniversity] = useState("Universitas Muhammadiyah Yogyakarta");
  const [varProker, setVarProker] = useState("");
  const [varTanggal, setVarTanggal] = useState("Senin, 13 Juli 2026");
  const [varWaktu, setVarWaktu] = useState("19.30");
  const [varTempat, setVarTempat] = useState("Balai Desa Kedungriri");
  const [varKontak, setVarKontak] = useState("");
  const [varTelepon, setVarTelepon] = useState("");

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Interactive Dispatch Modal (Kirim Settings) State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchRecipient, setDispatchRecipient] = useState("");
  const [dispatchPhone, setDispatchPhone] = useState("");
  const [dispatchMessage, setDispatchMessage] = useState("");
  const [dispatchCopied, setDispatchCopied] = useState(false);

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
        .select("id, full_name, whatsapp")
        .eq("is_active", true)
        .order("full_name", { ascending: true });
      setMembers(dbMembers || []);

      const { data: dbPrograms } = await supabase
        .from("programs")
        .select("id, name")
        .order("name", { ascending: true });
      setPrograms(dbPrograms || []);
    } catch (err) {
      console.error("Gagal memuat lookup data:", err);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error: sbErr } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!sbErr && data && data.length > 0) {
        setTemplates(data);
      } else {
        // Fallback seed templates if database table is empty
        const defaults = [
          {
            id: "default-1",
            recipient: "Bapak Kepala Desa / Dukuh",
            whatsapp_number: "628123456789",
            message: "Yth. Bapak Kepala Desa,\n\nMohon maaf mengganggu waktunya Bapak. Saya perwakilan mahasiswa KKN Kelompok 063 ingin menginfokan agenda musyawarah sosialisasi program kerja besok malam bertempat di Balai Desa.\n\nKehadiran Bapak sangat kami harapkan. Terima kasih Bapak."
          },
          {
            id: "default-2",
            recipient: "Ketua Karang Taruna",
            whatsapp_number: "628987654321",
            message: "Halo teman Karang Taruna!\n\nKami mengundang diskusi koordinasi proker kepemudaan besok malam di basecamp KKN 063. Jangan lupa bawa draf ide ya! Sampai jumpa di lokasi."
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

  // Populate form fields with variables replaced whenever preset or values change
  useEffect(() => {
    if (selectedPresetId) {
      const preset = PRESET_TEMPLATES.find(p => p.id === selectedPresetId);
      if (preset) {
        setRecipient(preset.recipientDefault);
        setWhatsappNumber(preset.phoneDefault);
        
        // Build replacements
        const replacements: Record<string, string> = {
          Penerima: recipient || preset.recipientDefault,
          Kelompok: varGroup,
          Universitas: varUniversity,
          Proker: varProker,
          Tanggal: varTanggal,
          Waktu: varWaktu,
          Tempat: varTempat,
          Kontak: varKontak,
          Telepon: varTelepon
        };

        let resolvedMsg = preset.rawMessage;
        Object.entries(replacements).forEach(([key, val]) => {
          resolvedMsg = resolvedMsg.replace(new RegExp(`{${key}}`, "g"), val || `[${key}]`);
        });

        setMessage(resolvedMsg);
      }
    }
  }, [selectedPresetId, varGroup, varUniversity, varProker, varTanggal, varWaktu, varTempat, varKontak, varTelepon, recipient]);

  // Handle member contact person selection
  const handleContactPersonChange = (memberId: string) => {
    const selectedMem = members.find(m => m.id === memberId);
    if (selectedMem) {
      setVarKontak(selectedMem.full_name);
      setVarTelepon(selectedMem.whatsapp || "");
    } else {
      setVarKontak("");
      setVarTelepon("");
    }
  };

  const handleCopyText = (id: string, txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipient.trim() || !whatsappNumber.trim() || !message.trim() || !submittedBy) {
      setError("Harap lengkapi semua kolom wajib (Penerima, Nomor WhatsApp, Isi Pesan, dan Penginput).");
      return;
    }

    // Clean and format WhatsApp phone number to start with country code (e.g., 62)
    let formattedPhone = whatsappNumber.trim().replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("8")) {
      formattedPhone = "62" + formattedPhone;
    }

    const payload = {
      recipient: recipient.trim(),
      whatsapp_number: formattedPhone,
      message: message.trim(),
      created_by_member_id: submittedBy,
      updated_by_member_id: submittedBy
    };

    try {
      if (editingTemplateId && !editingTemplateId.startsWith("default")) {
        const { error: updErr } = await supabase
          .from("whatsapp_templates")
          .update(payload)
          .eq("id", editingTemplateId);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from("whatsapp_templates").insert([payload]);
        if (insErr) throw insErr;
      }

      setRecipient("");
      setWhatsappNumber("");
      setMessage("");
      setSelectedPresetId("");
      setEditingTemplateId(null);
      setShowForm(false);
      fetchTemplates();
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan draf template.");
    }
  };

  const startEdit = (tpl: any) => {
    setEditingTemplateId(tpl.id);
    setRecipient(tpl.recipient || "");
    setWhatsappNumber(tpl.whatsapp_number || "");
    setMessage(tpl.message || "");
    setSelectedPresetId("");
    setShowForm(true);
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (id.startsWith("default")) {
      alert("Template bawaan sistem tidak dapat dihapus.");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus template untuk "${name}"?`)) return;

    try {
      const { error: delErr } = await supabase.from("whatsapp_templates").delete().eq("id", id);
      if (delErr) throw delErr;
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  // Open the interactive send modal instead of directly linking
  const handleOpenDispatch = (tpl: any) => {
    setDispatchRecipient(tpl.recipient || "");
    setDispatchPhone(tpl.whatsapp_number || "");
    setDispatchMessage(tpl.message || "");
    setDispatchCopied(false);
    setDispatchModalOpen(true);
  };

  const executeSendWhatsApp = () => {
    const cleanPhone = dispatchPhone.replace(/[^0-9]/g, "");
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(dispatchMessage)}`;
    window.open(url, "_blank");
  };

  const handleCopyDispatchText = () => {
    navigator.clipboard.writeText(dispatchMessage);
    setDispatchCopied(true);
    setTimeout(() => {
      setDispatchCopied(false);
    }, 2000);
  };

  // Auto-fill Dispatch recipient with an active group member
  const handleDispatchRecipientSelect = (memberId: string) => {
    const selectedMem = members.find(m => m.id === memberId);
    if (selectedMem) {
      setDispatchRecipient(selectedMem.full_name);
      let phone = selectedMem.whatsapp || "";
      if (phone.startsWith("0")) {
        phone = "62" + phone.slice(1);
      } else if (phone.startsWith("8")) {
        phone = "62" + phone;
      }
      setDispatchPhone(phone);
    }
  };

  // Quick Preset Roles for village contacts
  const VILLAGE_ROLES = [
    { role: "Kepala Desa", name: "Bapak Lurah / Kades" },
    { role: "Ketua RT", name: "Bapak RT Setempat" },
    { role: "Ketua RW", name: "Bapak RW Setempat" },
    { role: "Ketua Karang Taruna", name: "Ketua Pemuda Karang Taruna" },
    { role: "Dosen Pembimbing Lapangan", name: "Dosen Pembimbing (DPL)" },
    { role: "Pemilik Basecamp", name: "Pemilik Basecamp KKN" }
  ];

  const handleSelectVillageRole = (roleName: string) => {
    setDispatchRecipient(roleName);
  };

  // Filter templates list based on search input
  const filteredTemplates = templates.filter(t => {
    const term = search.toLowerCase();
    return (
      (t.recipient || "").toLowerCase().includes(term) ||
      (t.message || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 text-left">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[9px] font-mono font-black tracking-widest text-indigo-300 uppercase">
            COMMUNICATION SHIELD
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mt-3">
            Draf Siaran WhatsApp
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Draf pesan koordinasi formal untuk warga, tokoh masyarakat, bimbingan belajar, dan laporan DPL. Dilengkapi pembuat otomatis bebas logo & emot, serta pengaturan pengiriman interaktif.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingTemplateId(null);
              setRecipient("");
              setWhatsappNumber("");
              setMessage("");
              setSelectedPresetId("");
              setShowForm(!showForm);
            }}
            className="px-5 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            <span>{showForm ? "Batal" : "Buat Draf Baru"}</span>
          </button>
        </div>
      </div>

      {/* Preset Catalog Section - Only shows when not editing or when form is open */}
      {showForm && !editingTemplateId && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Pilih Preset Template Profesional (Otomatis)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_TEMPLATES.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`p-4.5 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isSelected 
                      ? "bg-cyan-950/20 border-cyan-400/40 shadow-md shadow-cyan-500/5" 
                      : "bg-[#030406]/70 border-white/5 hover:border-white/10 hover:bg-[#030406]/90"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-black text-white uppercase tracking-wide truncate pr-2">
                        {preset.title}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3">
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase">
                    <span>Sopan & Rapi</span>
                    <ChevronRight size={10} className={isSelected ? "text-cyan-400" : "text-slate-600"} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Form for Custom Drafting or Preset Customization */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddTemplate}
            className="p-6 sm:p-8 rounded-[2rem] bg-[#030406] border border-cyan-500/10 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/20 via-indigo-500/30 to-cyan-500/20" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} className="text-cyan-400" />
                  {editingTemplateId ? "Ubah Draf Siaran" : "Konfigurasi Draf Siaran Baru"}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Isi otomatis variabel KKN di bawah untuk memperbarui isi teks draf secara langsung.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Dynamic Preset Variables (Only shown when a preset is active) */}
            {selectedPresetId && (
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Sparkles size={12} />
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest">VARIABEL TEMPLATE OTOMATIS</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Kelompok KKN</label>
                    <input
                      type="text"
                      value={varGroup}
                      onChange={(e) => setVarGroup(e.target.value)}
                      placeholder="Kelompok KKN"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Universitas</label>
                    <input
                      type="text"
                      value={varUniversity}
                      onChange={(e) => setVarUniversity(e.target.value)}
                      placeholder="Nama Universitas"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Program Kerja (Agenda)</label>
                    <select
                      value={varProker}
                      onChange={(e) => setVarProker(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    >
                      <option value="">Pilih Program Kerja</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Hari & Tanggal Rapat</label>
                    <input
                      type="text"
                      value={varTanggal}
                      onChange={(e) => setVarTanggal(e.target.value)}
                      placeholder="e.g., Senin, 13 Juli 2026"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Waktu Acara</label>
                    <input
                      type="text"
                      value={varWaktu}
                      onChange={(e) => setVarWaktu(e.target.value)}
                      placeholder="e.g., 19.30"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Tempat Acara</label>
                    <input
                      type="text"
                      value={varTempat}
                      onChange={(e) => setVarTempat(e.target.value)}
                      placeholder="e.g., Balai Desa / Basecamp"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Hubungkan Narahubung (CP)</label>
                    <select
                      onChange={(e) => handleContactPersonChange(e.target.value)}
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    >
                      <option value="">Pilih Kontak Anggota</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nama CP Terpilih</label>
                    <input
                      type="text"
                      value={varKontak}
                      onChange={(e) => setVarKontak(e.target.value)}
                      placeholder="Nama Kontak CP"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nomor Telepon CP</label>
                    <input
                      type="text"
                      value={varTelepon}
                      onChange={(e) => setVarTelepon(e.target.value)}
                      placeholder="No Telepon CP"
                      className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Main Template Core Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input fields */}
              <div className="space-y-4 lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nama Sasaran / Penerima (Wajib)</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Contoh: Bapak RT 02 / Ibu Dukuh"
                        className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-9 pr-3 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nomor HP / WhatsApp Penerima (Wajib)</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-9 pr-3 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Anggota KKN Penginput Draf (Wajib)</label>
                  <select
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-3 rounded-xl font-mono text-xs text-white focus:outline-none"
                  >
                    <option value="">Pilih Nama Anda</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Isi Teks Pesan Siaran (Dapat Diedit Langsung)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tulis draf pesan koordinasi formal di sini. Gunakan *tebal* atau _miring_ untuk penekanan..."
                    rows={11}
                    className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 p-4 rounded-2xl font-mono text-xs text-white focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Real-time styled live mobile-screen preview of the WhatsApp bubble */}
              <div className="space-y-3 lg:col-span-5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MessageCircle size={12} className="text-emerald-400" />
                    Pratinjau Tampilan WhatsApp (Real-Time)
                  </label>
                  
                  {/* WhatsApp chat interface mockup */}
                  <div className="rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[340px] bg-[#0b141a]">
                    {/* Mock Chat Header */}
                    <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-white/[0.03]">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {recipient ? recipient.substring(0, 2) : "WA"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{recipient || "Penerima Siaran"}</div>
                        <div className="text-[9px] text-emerald-400">online</div>
                      </div>
                    </div>
                    {/* Mock Chat Canvas */}
                    <div className="flex-grow p-4 overflow-y-auto bg-[#0b141a] space-y-3 flex flex-col justify-end">
                      <div className="self-end bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none max-w-[85%] text-[11px] font-sans shadow-md relative leading-relaxed whitespace-pre-wrap">
                        <div 
                          className="space-y-1"
                          dangerouslySetInnerHTML={{ __html: renderWhatsAppFormatting(message) || "<span class='text-slate-400 italic'>Belum ada isi pesan...</span>" }} 
                        />
                        <div className="text-[8px] text-white/50 text-right mt-1.5">09:00</div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/15 flex items-center gap-2.5 text-red-400 text-xs font-mono">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-sans font-black uppercase tracking-wider transition-all active:scale-95 shadow-[0_4px_20px_rgba(6,182,212,0.25)] flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    <span>{editingTemplateId ? "Perbarui Draf" : "Simpan Ke Database"}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Search and Layout Controls */}
      <div className="grid grid-cols-1 gap-4 bg-[#030406]/85 p-4.5 rounded-2xl border border-white/5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari berdasarkan sasaran atau penggalan isi draf..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/45 pl-10 pr-4 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Mensinkronisasi draf koordinasi kelompok...</span>
        </div>
      ) : (
        /* Styled Template Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5.5 rounded-[2rem] bg-[#030406]/85 border border-white/5 flex flex-col justify-between shadow-xl text-left relative overflow-hidden group transition-all duration-300 hover:border-cyan-500/20 hover:shadow-cyan-500/[0.02]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-1 rounded-full text-[8.5px] font-mono font-black tracking-widest uppercase bg-cyan-950/40 text-cyan-400 border border-cyan-500/10">
                      SASARAN: {tpl.recipient}
                    </span>
                    <h3 className="text-xs font-mono font-bold text-slate-500 mt-2 uppercase tracking-wide">
                      No. Tujuan: <span className="text-slate-300">+{tpl.whatsapp_number}</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(tpl)}
                      className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all cursor-pointer"
                    >
                      <Edit size={13} />
                    </button>
                    {!tpl.id.startsWith("default") && (
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.recipient)}
                        className="p-2 rounded-xl bg-red-950/10 text-red-400 border border-red-500/10 hover:bg-red-950/20 hover:border-red-500/25 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Styled chat container */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  <div 
                    className="space-y-1"
                    dangerouslySetInnerHTML={{ __html: renderWhatsAppFormatting(tpl.message) }} 
                  />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                <button
                  onClick={() => handleCopyText(tpl.id, tpl.message)}
                  className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:text-cyan-400 text-[10px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer text-slate-400"
                >
                  {copiedId === tpl.id ? <Check size={12} className="text-cyan-400" /> : <Copy size={12} />}
                  <span>{copiedId === tpl.id ? "Berhasil Disalin" : "Salin Teks"}</span>
                </button>
                
                {/* Premium interactive dispatch trigger */}
                <button
                  onClick={() => handleOpenDispatch(tpl)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/35 hover:border-cyan-400 text-cyan-300 text-[10px] font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send size={12} />
                  <span>Kirim WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive WhatsApp Dispatch Drawer/Modal (Kirim Settings popup) */}
      <AnimatePresence>
        {dispatchModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDispatchModalOpen(false)}
              className="absolute inset-0 bg-[#020305]/85 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#030406] border border-cyan-500/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-950/50 border-b border-white/5 flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[8px] font-mono font-bold tracking-widest text-emerald-300 uppercase">
                    INTERACTIVE DISPATCH PANEL
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider mt-1.5">
                    Pengaturan Kontak WhatsApp Tujuan
                  </h3>
                </div>
                <button
                  onClick={() => setDispatchModalOpen(false)}
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-all"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                
                {/* 1. Quick Recipient Selection Controls */}
                <div className="space-y-3">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    PILIH SASARAN KONTAK SECARA INSTAN
                  </span>
                  
                  {/* Select group members */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Pilih dari Anggota Tim KKN</label>
                      <select
                        onChange={(e) => handleDispatchRecipientSelect(e.target.value)}
                        className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                      >
                        <option value="">Pilih Anggota Kelompok</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Predefined Role-Based Quick Targets */}
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Perangkat Desa / Jabatan Lokal</label>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/[0.01] border border-white/5 rounded-xl">
                        {VILLAGE_ROLES.map((v, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectVillageRole(v.role)}
                            className="px-2 py-1 text-[9px] font-sans font-medium text-slate-300 bg-white/[0.03] border border-white/5 rounded-lg hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
                          >
                            {v.role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Phone and Recipient Settings */}
                <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Sliders size={12} />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest">Rincian Kontak & Tujuan</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nama Penerima</label>
                      <input
                        type="text"
                        value={dispatchRecipient}
                        onChange={(e) => setDispatchRecipient(e.target.value)}
                        placeholder="Nama Penerima"
                        className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nomor HP / WhatsApp Tujuan</label>
                      <input
                        type="text"
                        value={dispatchPhone}
                        onChange={(e) => setDispatchPhone(e.target.value)}
                        placeholder="Nomor Telepon (Contoh: 62812...)"
                        className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-400/40 p-2.5 rounded-xl font-mono text-[11px] text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Pre-send Chat Preview (Editable Message Area) */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    SIAP DIKIRIM (PRATINJAU WHATSAPP)
                  </span>
                  
                  <div className="rounded-2xl border border-white/5 overflow-hidden flex flex-col bg-[#0b141a]">
                    <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between border-b border-white/[0.03]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {dispatchRecipient ? dispatchRecipient.substring(0, 2) : "WA"}
                        </div>
                        <span className="text-[11px] font-bold text-white">{dispatchRecipient || "Penerima"}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">+{dispatchPhone}</span>
                    </div>

                    <div className="p-4 bg-[#0b141a] max-h-52 overflow-y-auto flex flex-col">
                      <div className="self-start bg-[#202c33] text-white p-3.5 rounded-2xl rounded-tl-none max-w-[85%] text-[11px] font-sans shadow-md leading-relaxed whitespace-pre-wrap">
                        <div 
                          className="space-y-1"
                          dangerouslySetInnerHTML={{ __html: renderWhatsAppFormatting(dispatchMessage) }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Action Footer */}
              <div className="p-6 bg-slate-950/50 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleCopyDispatchText}
                  className="w-full sm:w-auto px-4.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:text-cyan-400 text-[10px] font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-400"
                >
                  {dispatchCopied ? <Check size={12} className="text-cyan-400" /> : <Copy size={12} />}
                  <span>{dispatchCopied ? "Berhasil Disalin" : "Salin Seluruh Teks"}</span>
                </button>

                <div className="flex w-full sm:w-auto gap-3">
                  <button
                    onClick={() => setDispatchModalOpen(false)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.04] text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeSendWhatsApp}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-[10px] font-sans font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <ExternalLink size={13} />
                    <span>Luncurkan WhatsApp</span>
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
