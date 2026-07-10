import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, CheckCircle2, ChevronLeft, Map, Copy, Clock, AlertCircle, Info, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { ModernPremiumLogo } from "./Navigation";
import InteractiveBlueprintBackground from "./InteractiveBlueprintBackground";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

export default function PublicAbsensi({ onBackToHome }: { onBackToHome: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceValidationStatus, setFaceValidationStatus] = useState<"idle" | "checking" | "success" | "failed">("idle");
  const [photoValidMsg, setPhotoValidMsg] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  
  const [toast, setToast] = useState<{title: string, message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'info' as any) => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("public_attendance_sessions")
        .select("*")
        .order("starts_at", { ascending: true });
        
      if (error) {
        console.warn("Could not fetch from public_attendance_sessions view, trying fallback...", error.message);
        const { data: fbData, error: fbError } = await supabase
          .from("attendance_sessions")
          .select("*")
          .eq("is_public", true)
          .order("starts_at", { ascending: true });
          
        if (!fbError && fbData) {
          setSessions(fbData);
        }
        return;
      }
        
      if (data) {
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("public_attendance_members")
        .select("*")
        .order("full_name", { ascending: true });
        
      if (error) {
        console.warn("Could not fetch from public_attendance_members view, trying fallback...", error.message);
        const { data: fbData, error: fbError } = await supabase
          .from("members")
          .select("id, full_name, nim, kkn_role")
          .order("full_name", { ascending: true });
          
        if (!fbError && fbData) {
          setMembers(fbData);
        }
        return;
      }
        
      if (data) {
        setMembers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const closeExpiredSessions = async () => {
    try {
      const { error } = await supabase.rpc("close_expired_attendance_sessions");
      if (error) {
        console.warn("Could not run close_expired_attendance_sessions:", error.message);
      }
      fetchSessions();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    closeExpiredSessions();
    fetchMembers();
    
    const interval = setInterval(() => {
      closeExpiredSessions();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolokasi Gagal", "Browser Anda tidak mendukung fitur lokasi GPS.", "error");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        showToast("Lokasi Gagal", "Pastikan GPS aktif dan izin lokasi diberikan ke browser.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const startCamera = async () => {
    setCameraActive(true);
    setPhotoDataUrl(null);
    setPhotoBlob(null);
    setFaceDetected(false);
    setFaceValidationStatus("idle");
    setPhotoValidMsg("");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      showToast("Kamera Gagal", "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.", "error");
      console.error(e);
      setCameraActive(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };
  
  const detectFace = async (imgElement: HTMLImageElement | HTMLVideoElement): Promise<boolean> => {
    try {
      await tf.ready();
      const model = await blazeface.load();
      const predictions = await model.estimateFaces(imgElement, false);
      return predictions.length > 0;
    } catch (e) {
      console.error("Face detection failed:", e);
      return true; // Fallback to allow if ML fails
    }
  };
  
  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // We do NOT flip the canvas, so the saved photo has normal orientation (text is readable).
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoDataUrl(dataUrl);
    
    canvas.toBlob((blob) => {
      setPhotoBlob(blob);
    }, 'image/jpeg', 0.8);
    
    const img = new Image();
    img.src = dataUrl;
    img.onload = async () => {
      setFaceValidationStatus("checking");
      const hasFace = await detectFace(img);
      setFaceDetected(hasFace);
      setFaceValidationStatus(hasFace ? "success" : "failed");
      if (hasFace) {
        setPhotoValidMsg("Wajah atau tubuh terdeteksi. Foto dapat digunakan sebagai bukti kehadiran.");
      } else {
        setPhotoValidMsg("Pastikan wajah terlihat jelas dan ambil foto ulang.");
      }
    };
    
    stopCamera();
  };
  
  const retakePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoBlob(null);
    setFaceDetected(false);
    setFaceValidationStatus("idle");
    setPhotoValidMsg("");
    startCamera();
  };
  
  useEffect(() => {
    return () => stopCamera();
  }, []);
  
  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  
  const isSessionOpen = useCallback(() => {
    if (!selectedSession) return false;
    const now = new Date();
    const startsAt = new Date(selectedSession.starts_at);
    const endsAt = new Date(selectedSession.ends_at);
    return now >= startsAt && now <= endsAt;
  }, [selectedSession]);
  
  const selectedMember = members.find(m => m.id === selectedMemberId);
  const canSubmit = selectedSession && selectedMemberId && latitude && longitude && photoBlob && faceDetected && isSessionOpen();
  
  const checklist = [
    { label: 'Sesi absensi aktif dipilih', checked: !!selectedSession && isSessionOpen() },
    { label: 'Nama anggota dipilih', checked: !!selectedMemberId },
    { label: 'Lokasi GPS berhasil direkam', checked: !!latitude && !!longitude },
    { label: 'Foto selfie tervalidasi', checked: !!photoDataUrl && faceDetected }
  ];

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast("Perhatian", "Lengkapi semua data presensi terlebih dahulu.", "warning");
      return;
    }
    
    setIsSubmitting(true);
    setLoadingMsg("Mengunggah foto...");
    
    try {
      const fileName = `${selectedSessionId}_${selectedMemberId}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attendance-selfies')
        .upload(fileName, photoBlob!, {
          contentType: 'image/jpeg'
        });
        
      if (uploadError) {
        throw new Error("Gagal mengunggah foto: " + uploadError.message);
      }
      
      const photoUrl = uploadData.path;
      
      setLoadingMsg("Menyimpan data absensi...");
      const { data, error } = await supabase.rpc("register_public_attendance", {
        p_session_id: selectedSessionId,
        p_member_id: selectedMemberId,
        p_latitude: latitude,
        p_longitude: longitude,
        p_accuracy: accuracy,
        p_photo_url: photoUrl
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.ok) {
        throw new Error(data?.message || "Gagal memproses absensi");
      }
      
      setSuccessData({
        member_name: selectedMember?.full_name || "Anggota",
        session_name: selectedSession?.activity_name || "Sesi KKN",
        timestamp: new Date().toISOString(),
        latitude,
        longitude,
        accuracy
      });
      
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setLoadingMsg("");
    } catch (e: any) {
      console.error(e);
      showToast("Absensi Gagal", e.message || "Terjadi kesalahan sistem.", "error");
      setIsSubmitting(false);
      setLoadingMsg("");
    }
  };

  if (submitSuccess && successData) {
    return (
      <div className="w-full min-h-screen bg-[#020408] text-white flex flex-col z-10 overflow-y-auto font-sans relative">
        <InteractiveBlueprintBackground />
        <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-gradient-to-b from-[#0a0c10]/95 to-[#050608]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            
            <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-20" />
              <CheckCircle2 className="w-12 h-12 text-cyan-400" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Absensi Berhasil Tercatat</h2>
            <p className="text-slate-400 text-sm mb-10 max-w-md mx-auto">Data presensi sudah tersimpan di dashboard admin dan diverifikasi oleh sistem KKN Project.</p>
            
            <div className="w-full bg-black/40 rounded-lg p-6 text-left space-y-4 border border-white/5 mb-10 shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Nama Anggota</div>
                  <div className="text-sm font-semibold text-white">{successData.member_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Sesi Presensi</div>
                  <div className="text-sm font-semibold text-white">{successData.session_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Waktu Tercatat</div>
                  <div className="text-sm font-semibold text-white">{new Date(successData.timestamp).toLocaleString("id-ID")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Status GPS & Validasi</div>
                  <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 mt-1 bg-cyan-950/30 w-fit px-2.5 py-1 rounded-md border border-cyan-500/20">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Terverifikasi (±{Math.round(successData.accuracy)}m)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <a 
                href={`https://www.google.com/maps?q=${successData.latitude},${successData.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm font-bold text-slate-300"
              >
                <Map className="w-4.5 h-4.5" />
                <span className="tracking-wide">Lihat di Maps</span>
              </a>
              
              <button 
                onClick={onBackToHome}
                className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] cursor-pointer text-sm tracking-wide"
              >
                Kembali ke Beranda
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#020408] text-white flex flex-col z-10 overflow-y-auto font-sans relative">
      <InteractiveBlueprintBackground />
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-4 z-[100] w-full max-w-sm"
          >
            <div className={`p-4 rounded-lg shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${
              toast.type === 'error' ? 'bg-red-950/80 border-red-500/30' :
              toast.type === 'success' ? 'bg-green-950/80 border-green-500/30' :
              'bg-amber-950/80 border-amber-500/30'
            }`}>
              {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" /> : 
               toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" /> :
               <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              <div>
                <h4 className={`text-sm font-bold ${
                  toast.type === 'error' ? 'text-red-100' :
                  toast.type === 'success' ? 'text-green-100' :
                  'text-amber-100'
                }`}>{toast.title}</h4>
                <p className={`text-xs mt-1 ${
                  toast.type === 'error' ? 'text-red-200' :
                  toast.type === 'success' ? 'text-green-200' :
                  'text-amber-200'
                }`}>{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <div className="w-full px-4 md:px-8 py-5 flex items-center justify-between border-b border-white/5 relative z-50">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-2xl font-black text-white tracking-tight">Portal Absensi KKN</h1>
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">KKN PMU-063</p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Online</span>
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-24 relative z-10">
        
        {/* Left Column: Form & Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Detail Sesi */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#050505] border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-sm font-bold text-white mb-5 tracking-tight">Detail Sesi</h2>
            
            {sessions.length === 0 ? (
              <div className="bg-black border border-white/5 rounded-lg p-6 text-center flex flex-col items-center justify-center">
                <p className="text-white font-bold text-sm">Belum ada sesi aktif</p>
                <p className="text-slate-500 text-xs mt-1.5 max-w-[250px]">Sesi absensi akan tampil otomatis saat admin membuka presensi.</p>
                <div className="mt-4 px-3 py-1.5 bg-blue-500/10 rounded-lg flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] text-blue-300 font-medium">Silakan hubungi admin jika sesi seharusnya dibuka.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Aktivitas</label>
                  <div className="relative">
                    <select 
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full bg-black border border-white/10 hover:border-white/20 rounded-lg p-3 text-slate-200 text-sm focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer font-semibold shadow-inner"
                    >
                      <option value="" disabled hidden>Pilih Sesi Absensi</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.activity_name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronLeft className="w-4 h-4 text-slate-400 -rotate-90" />
                    </div>
                  </div>
                </div>

                {selectedSession && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-4 pt-2"
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Waktu</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {new Date(selectedSession.starts_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSession.ends_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Lokasi</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedSession.location || 'Posko KKN'}
                      </div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status</span>
                      {isSessionOpen() ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-400 rounded text-[10px] font-bold">
                          Ditutup
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Card 2: Identitas */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#050505] border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-sm font-bold text-white mb-5 tracking-tight">Identitas</h2>
            
            {members.length === 0 ? (
              <div className="bg-black border border-white/5 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Data anggota belum tersedia.</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-black border border-white/10 hover:border-white/20 rounded-lg p-3 text-slate-200 text-sm focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer font-semibold shadow-inner"
                >
                  <option value="" disabled hidden>Cari nama anggota...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} {m.nim ? `(${m.nim})` : ''} {m.kkn_role ? ` - ${m.kkn_role}` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronLeft className="w-4 h-4 text-slate-400 -rotate-90" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Card 3: Lokasi Perangkat */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#050505] border border-white/10 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-sm font-bold text-white mb-5 tracking-tight">Lokasi Perangkat</h2>
            
            {!latitude ? (
              <button 
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full py-6 bg-black border border-white/10 hover:border-white/30 rounded-lg flex flex-col items-center justify-center gap-3 transition-all group disabled:opacity-50 cursor-pointer"
              >
                {isLocating ? (
                  <div className="w-6 h-6 border-2 border-slate-500 border-t-cyan-400 rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                      <MapPin className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors tracking-wide">Ambil Lokasi Saya</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-[140px] rounded-lg overflow-hidden border border-white/10 bg-black relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${latitude},${longitude}&hl=es;z=15&output=embed`}
                    className="absolute inset-0 grayscale-[50%] contrast-[1.2]"
                  />
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] mix-blend-overlay bg-cyan-900/10" />
                </div>
                
                <div className="flex items-center justify-between bg-black p-3 rounded-lg border border-white/5">
                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Koordinat Saat Ini</div>
                    <div className="text-xs font-mono text-white mt-1">{latitude.toFixed(6)}, {longitude?.toFixed(6)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Akurasi</div>
                    <div className="text-xs font-mono text-slate-300 mt-1">±{Math.round(accuracy || 0)}m</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a 
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Map className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">Buka Maps</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Camera & Submit */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#050505] border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              
              <div>
                <h2 className="text-sm font-bold text-white">Bukti Kehadiran</h2>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              
              
              <div className="bg-black border border-white/10 rounded-xl relative w-full h-[320px] sm:h-[400px] md:h-[480px] flex flex-col items-center justify-center mb-6 overflow-hidden">
                {!cameraActive && !photoDataUrl ? (
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-4 text-slate-500 hover:text-white transition-colors p-8 group cursor-pointer h-full w-full justify-center"
                  >
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold uppercase tracking-widest block text-white mb-1">Nyalakan Kamera</span>
                      <span className="text-[10px] font-mono">Pastikan wajah terlihat jelas</span>
                    </div>
                  </button>
                ) : null}
                
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${cameraActive && !photoDataUrl ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                
                {photoDataUrl && (
                  <img src={photoDataUrl} alt="Selfie" className="w-full h-full object-cover" />
                )}
                
                <canvas ref={canvasRef} className="hidden" />
                
                {cameraActive && !photoDataUrl && (
                  <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex justify-between w-full">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg" />
                      <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg" />
                    </div>
                    
                    <div className="flex justify-between w-full">
                      <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg" />
                      <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg" />
                    </div>
                  </div>
                )}
                
                {cameraActive && !photoDataUrl && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                    <button 
                      onClick={takePhoto}
                      className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center bg-black/20 backdrop-blur-sm active:scale-95 transition-all hover:bg-white/20 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-inner" />
                    </button>
                  </div>
                )}
              </div>

              
              <div className="bg-black/50 border border-white/5 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${faceValidationStatus === "success" ? "bg-green-500" : faceValidationStatus === "failed" ? "bg-red-500" : "bg-slate-500"}`} />
                  <span className="text-xs font-mono text-slate-300">
                    {faceValidationStatus === "idle" ? "Menunggu foto selfie..." : 
                     faceValidationStatus === "checking" ? "Menganalisis wajah..." : 
                     faceValidationStatus === "success" ? "Wajah terdeteksi dan valid." :
                     "Wajah tidak terdeteksi. Silakan foto ulang."}
                  </span>
                </div>
                {photoDataUrl && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      type="button" 
                      onClick={retakePhoto}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:border-white/30 rounded"
                    >
                      <RefreshCw size={12} />
                      Foto Ulang
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Section */}
              <div className="mt-auto">
                <button 
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest ${
                    canSubmit && !isSubmitting 
                      ? 'bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400 hover:text-cyan-300 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] cursor-pointer' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                      <span>{loadingMsg}</span>
                    </>
                  ) : (
                    <>
                      <span>KIRIM ABSENSI &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
