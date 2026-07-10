import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { audio } from "../utils/audioService";
import { ShieldAlert, User, LogIn, Lock, CheckCircle2, ArrowLeft, Mail, Eye, EyeOff, HelpCircle, X, PhoneCall } from "lucide-react";
import { signInWithPassword, isSupabaseConfigured } from "../lib/supabaseClient";


interface LoginPageProps {
  onLoginSuccess: (userData: { name: string; group: string; role: string }) => void;
  onBackToHome: () => void;
}

export default function LoginPage({ onLoginSuccess, onBackToHome }: LoginPageProps) {
  const { language } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    audio.playPrimaryClick();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(
        language === "en" 
          ? "Please fill in all security credentials." 
          : "Harap isi semua kredensial keamanan."
      );
      return;
    }

    if (!username.includes("@")) {
      setError(
        language === "en"
          ? "Please enter a valid email address."
          : "Harap masukkan alamat email yang valid."
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error: sbError } = await signInWithPassword(
          username.trim(),
          password
        );

        if (sbError) {
          throw new Error(sbError.message);
        }

        setIsSuccess(true);
        audio.playTabSwitch();
        setTimeout(() => {
          onLoginSuccess({
            name: "KKN Shared Workspace",
            group: "PersyarikatanMu-063",
            role: "KKN Member",
          });
        }, 1200);
      } else {
        const isCorrect = 
          username.trim().toLowerCase() === "kknumy063@mail.umy.ac.id" && 
          password === "adminkkn063";

        setTimeout(() => {
          if (isCorrect) {
            setIsSuccess(true);
            audio.playTabSwitch();
            setTimeout(() => {
              onLoginSuccess({
                name: "KKN Shared Workspace",
                group: "PersyarikatanMu-063",
                role: "KKN Member",
              });
            }, 1200);
          } else {
            setIsLoading(false);
            setError(
              language === "en"
                ? "Invalid Security Credentials. Please try again."
                : "Kredensial Keamanan Salah. Silakan coba lagi."
            );
          }
        }, 1200);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || (language === "en" ? "Authentication failed." : "Autentikasi gagal."));
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 relative select-none">
      {/* Decorative backdrop cyan grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(34,211,238,0.03)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="login-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[500px] relative p-10 rounded-[2.5rem] bg-[#05070a]/90 backdrop-blur-2xl border border-white/5"
            style={{
              boxShadow: "20px 20px 40px #010203, -20px -20px 40px rgba(255, 255, 255, 0.02), inset 1px 1px 1px rgba(255, 255, 255, 0.05)"
            }}
          >
            {/* Top Premium Back Button */}
            <button
              onClick={() => {
                audio.playSecondaryClick();
                onBackToHome();
              }}
              className="absolute top-6 left-8 text-slate-450 hover:text-cyan-400 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer group transition-all"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              <span>{language === "en" ? "HOME" : "BERANDA"}</span>
            </button>

            {/* Glowing active lightbar indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px]" />

            {/* Logo web premium block */}
            <div className="flex flex-col items-center mt-6 mb-8">
              {/* Premium 3D Neumorphic Outer Frame for Official KKN Logo */}
              <div 
                className="relative flex items-center justify-center select-none shrink-0 w-[150px] h-[150px] rounded-full bg-gradient-to-br from-[#0c0f17] to-[#040609]"
                style={{
                  boxShadow: "10px 10px 20px #010204, -10px -10px 20px rgba(255, 255, 255, 0.03), inset 1px 1px 0px rgba(255, 255, 255, 0.05)"
                }}
              >
                <div 
                  className="w-[84%] h-[84%] rounded-full bg-[#030508] flex items-center justify-center relative overflow-hidden"
                  style={{
                    boxShadow: "inset 6px 6px 12px #010204, inset -6px -6px 12px rgba(255,255,255,0.02)"
                  }}
                >
                  <img 
                    src="https://res.cloudinary.com/df0razmlr/image/upload/v1783274113/LOGO_KKN_ccrsvs.png"
                    alt="KKN Logo"
                    className="w-[82%] h-[82%] object-contain select-none pointer-events-none drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-sans font-black text-white tracking-[0.15em] uppercase text-center bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent">
                KKN PROJECT
              </h2>
              <p className="text-[10px] font-mono font-extrabold tracking-[0.25em] text-cyan-400 uppercase mt-1.5 animate-pulse text-center">
                {language === "en" ? "WELCOME TO KKN PROJECT" : "SELAMAT DATANG DI KKN PROJECT"}
              </p>
              <p className="text-[9.5px] font-sans font-medium text-slate-400/80 tracking-wide text-center mt-2.5 max-w-[320px] leading-relaxed">
                {language === "en" 
                  ? "Enter your credentials to unlock the premium KKN operational workspace & coordination portal." 
                  : "Masukkan kredensial Anda untuk mengakses workspace operasional & portal koordinasi KKN premium."}
              </p>
            </div>

            {/* Form structure */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Address Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block pl-2">
                  EMAIL ADDRESS
                </label>
                <div 
                  className="relative rounded-2xl bg-[#030406] border border-white/5 p-1 flex items-center transition-all duration-300 focus-within:border-cyan-500/30"
                  style={{
                    boxShadow: "inset 4px 4px 8px #010203, inset -4px -4px 8px rgba(255,255,255,0.01)"
                  }}
                >
                  <div className="p-3 text-slate-500 shrink-0">
                    <Mail size={16} className="text-slate-450" />
                  </div>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Email"
                    disabled={isLoading}
                    className="w-full bg-transparent border-none text-sm text-white font-mono placeholder:text-slate-650 focus:outline-none focus:ring-0 px-1 py-2"
                  />
                </div>
              </div>

              {/* Password Field with Eye View/Hide toggle and neat Forgot link */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      audio.playSecondaryClick();
                      setShowForgotModal(true);
                    }}
                    className="text-[9px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer uppercase tracking-wider hover:underline"
                  >
                    {language === "en" ? "Forgot Password?" : "Lupa Password?"}
                  </button>
                </div>
                <div 
                  className="relative rounded-2xl bg-[#030406] border border-white/5 p-1 flex items-center transition-all duration-300 focus-within:border-cyan-500/30"
                  style={{
                    boxShadow: "inset 4px 4px 8px #010203, inset -4px -4px 8px rgba(255,255,255,0.01)"
                  }}
                >
                  <div className="p-3 text-slate-500 shrink-0">
                    <Lock size={16} className="text-slate-450" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    disabled={isLoading}
                    className="w-full bg-transparent border-none text-sm text-white font-mono placeholder:text-slate-650 focus:outline-none focus:ring-0 px-1 py-2 pr-12"
                  />
                  
                  {/* Password Show/Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      audio.playSecondaryClick();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-4 p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error messages block with Neumorphic Error glow */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 flex items-center gap-2.5"
                    style={{
                      boxShadow: "0 0 15px rgba(239, 68, 68, 0.05)"
                    }}
                  >
                    <ShieldAlert size={14} className="text-red-400 shrink-0" />
                    <span className="text-[10px] font-medium text-red-300 text-left leading-tight">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Neumorphic 3D Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-2xl font-sans font-black uppercase text-xs tracking-widest cursor-pointer select-none transition-all duration-300 flex items-center justify-center gap-2 border relative overflow-hidden ${
                  isLoading
                    ? "bg-[#030406] text-slate-500 border-white/5"
                    : "bg-gradient-to-br from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 border-cyan-400/20 active:scale-[0.98]"
                }`}
                style={
                  isLoading
                    ? { boxShadow: "inset 4px 4px 8px #010203" }
                    : { boxShadow: "6px 6px 15px rgba(6,182,212,0.15), -4px -4px 10px rgba(255,255,255,0.02)" }
                }
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
                      {language === "en" ? "DECRYPTING SECURITY KEY..." : "MENSINKRONKAN KUNCI..."}
                    </span>
                  </div>
                ) : (
                  <>
                    <LogIn size={14} className="text-slate-950 font-black" />
                    <span className="font-sans font-black tracking-widest">
                      LOGIN DASHBOARD
                    </span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm p-8 rounded-[2.5rem] bg-[#05070a] border border-cyan-500/20 text-center relative"
            style={{
              boxShadow: "0 0 50px rgba(6,182,212,0.15), inset 1px 1px 1px rgba(255, 255, 255, 0.05)"
            }}
          >
            {/* Absolute radial green/cyan flash highlight */}
            <div className="absolute inset-0 bg-cyan-400/[0.02] rounded-[2.5rem] pointer-events-none" />

            <div className="flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-full bg-[#030508] flex items-center justify-center border border-cyan-400/30 relative mb-6"
                style={{
                  boxShadow: "inset 4px 4px 8px #010203, inset -4px -4px 8px rgba(255,255,255,0.02)"
                }}
              >
                <CheckCircle2 size={36} className="text-cyan-400 animate-pulse" />
              </div>

              <h3 className="text-xl font-sans font-black text-white uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                {language === "en" ? "ACCESS GRANTED" : "AKSES DITERIMA"}
              </h3>
              <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase mt-1">
                {language === "en" ? "DECRYPTION SUCCESSFUL" : "SINKRONISASI SUKSES"}
              </p>

              <div className="w-12 h-[2px] bg-cyan-500/30 my-5" />

              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[240px]">
                {language === "en"
                  ? "Welcome back, Operator. Opening KKN Group 063 premium digital workspace..."
                  : "Selamat datang kembali, Operator. Membuka workspace digital premium Kelompok 063..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal Overlay */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010204]/80 backdrop-blur-md"
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-8 rounded-[2rem] bg-[#05070a] border border-cyan-500/20 text-center"
              style={{
                boxShadow: "0 10px 40px rgba(6,182,212,0.15), inset 1px 1px 1px rgba(255, 255, 255, 0.05)"
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  audio.playSecondaryClick();
                  setShowForgotModal(false);
                }}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center">
                <div 
                  className="w-14 h-14 rounded-full bg-[#030508] flex items-center justify-center border border-cyan-500/20 mb-4"
                  style={{
                    boxShadow: "inset 4px 4px 8px #010203"
                  }}
                >
                  <HelpCircle size={28} className="text-cyan-400 animate-pulse" />
                </div>

                <h3 className="text-lg font-sans font-black text-white uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  {language === "en" ? "PASSWORD RECOVERY" : "PEMULIHAN KATA SANDI"}
                </h3>
                
                <div className="w-10 h-[2px] bg-cyan-500/30 my-4" />

                <p className="text-xs text-slate-300 leading-relaxed text-center mb-6 px-2">
                  {language === "en" 
                    ? "If you forgot the portal security password or need credential access, please contact the main administrator directly." 
                    : "Jika Anda lupa password keamanan portal atau membutuhkan akses kredensial, silakan hubungi kontak utama administrator."}
                </p>

                {/* Predefined credentials card */}
                <div 
                  className="w-full p-4 rounded-xl bg-[#030406] border border-white/5 text-left space-y-3 mb-6"
                  style={{
                    boxShadow: "inset 4px 4px 8px #010203"
                  }}
                >
                  <div>
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                      {language === "en" ? "KKN SHARED WORKSPACE" : "WORKSPACE KKN BERSAMA"}
                    </span>
                    <span className="text-xs font-sans font-bold text-cyan-300 block mt-1">
                      PersyarikatanMu-063
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">
                      {language === "en" ? "WHATSAPP HOTLINE" : "HOTLINE WHATSAPP"}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-300 block mt-1">
                      0812-2001-0205
                    </span>
                  </div>
                </div>

                {/* Confirm/Ok and WhatsApp button */}
                <div className="flex flex-col gap-2.5 w-full">
                  <a
                    href="https://wa.me/6281220010205?text=Halo%20Admin%20KKN,%20saya%20lupa%20password%20untuk%20KKN%20Project"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      audio.playPrimaryClick();
                    }}
                    className="w-full py-3.5 px-6 rounded-xl font-sans font-black uppercase text-xs tracking-widest cursor-pointer select-none transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-center flex items-center justify-center gap-2"
                  >
                    <PhoneCall size={14} className="stroke-[3]" />
                    <span>{language === "en" ? "CONTACT VIA WHATSAPP" : "HUBUNGI VIA WHATSAPP"}</span>
                  </a>

                  <button
                    onClick={() => {
                      audio.playSecondaryClick();
                      setShowForgotModal(false);
                    }}
                    className="w-full py-3 px-6 rounded-xl font-sans font-black uppercase text-[10px] tracking-widest cursor-pointer select-none transition-all duration-300 bg-gradient-to-br from-[#0c101b] to-[#04060a] border border-white/5 text-slate-400 hover:text-white hover:border-white/10 active:scale-95"
                  >
                    {language === "en" ? "DISMISS PORTAL HELP" : "SAYA MENGERTI"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
