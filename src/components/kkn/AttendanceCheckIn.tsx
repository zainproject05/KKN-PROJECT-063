import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, ArrowLeft, Info, Users, Clock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { audio } from "../../utils/audioService";

interface AttendanceCheckInProps {
  sessionToken: string;
  onBackToHome?: () => void;
}

export default function AttendanceCheckIn({ sessionToken, onBackToHome }: AttendanceCheckInProps) {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionToken]);

  const fetchSessionDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionErr } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .limit(1);

      if (sessionErr) throw sessionErr;
      if (!sessionData || sessionData.length === 0) {
        setError("Sesi presensi tidak ditemukan atau sudah tidak aktif.");
        setLoading(false);
        return;
      }

      setSession(sessionData[0]);
    } catch (err: any) {
      console.error("Gagal memuat detail sesi:", err);
      setError("Gagal memuat detail sesi presensi.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 font-mono text-xs">
        <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-cyan-400/80 animate-pulse tracking-widest uppercase">MENGHUBUNGKAN PANEL PRESENSI...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto px-4 py-12 text-left">
      {onBackToHome && (
        <button 
          onClick={() => {
            audio.playSecondaryClick();
            onBackToHome();
          }}
          className="mb-6 flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Beranda</span>
        </button>
      )}

      <div className="nm-card-3d p-6 sm:p-8 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-cyan-500" />

        {error ? (
          <div className="text-center py-6 space-y-4 font-mono">
            <Info size={32} className="text-red-400 mx-auto animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] text-red-400 font-bold uppercase tracking-wider">
              SESI TIDAK VALID
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-2">
              {error}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="space-y-2 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[8px] font-mono font-black tracking-widest text-cyan-300 uppercase">
                  MANUAL PRESENSI SYSTEM
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {session && (
                <h2 className="text-base font-black text-white uppercase tracking-wider font-sans">
                  {session.location || "Sesi Kegiatan KKN"}
                </h2>
              )}
            </div>

            {/* Main Info Card */}
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
                <CheckCircle size={24} className="text-cyan-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">PRESENSI DIKANTOR KOORDINATOR</h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Presensi KKN Kelompok 063 kini dikelola secara manual, cepat, dan real-time oleh Koordinator melalui Panel Kontrol.
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="nm-inset p-4 space-y-3 font-mono text-[10px] text-slate-300">
              <div className="flex items-center gap-2.5">
                <Users size={14} className="text-cyan-400 shrink-0" />
                <span>Setiap anggota wajib melakukan presensi mandiri di portal publik.</span>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.03]">
                <Clock size={14} className="text-cyan-400 shrink-0" />
                <span>Perubahan status (Hadir, Izin, Sakit, Alfa) dicatat langsung oleh Koordinator.</span>
              </div>
            </div>

            {/* Back button */}
            <div className="pt-2">
              <button
                onClick={() => onBackToHome?.()}
                className="nm-btn w-full py-3 text-cyan-400 font-sans font-black text-xs uppercase tracking-widest cursor-pointer"
              >
                MASUK KE WORKSPACE KKN
              </button>
            </div>

            {/* Secured Footer */}
            <div className="pt-3 border-t border-white/[0.04] text-center">
              <p className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Shield size={10} className="text-cyan-500/30" />
                KKN PERSYARIKATANMU-063 PORTAL
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
