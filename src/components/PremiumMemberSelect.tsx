import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronDown, Check, Search } from "lucide-react";
import { audio } from "../utils/audioService";

interface Member {
  id: string;
  full_name: string;
  nim?: string;
}

interface PremiumMemberSelectProps {
  label: string;
  placeholder?: string;
  selectedId: string;
  onChange: (id: string) => void;
  members: Member[];
  required?: boolean;
}

export function PremiumMemberSelect({
  label,
  placeholder = "Pilih Anggota KKN",
  selectedId,
  onChange,
  members,
  required = false
}: PremiumMemberSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedMember = members.find(m => m.id === selectedId);

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.nim && m.nim.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (memberId: string) => {
    audio.playPrimaryClick();
    onChange(memberId);
    setIsOpen(false);
    setSearch("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-1.5 relative text-left" ref={dropdownRef}>
      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-400 font-sans">*</span>}
      </label>

      {/* 3D Trigger Button with glassmorphism */}
      <div
        onClick={() => {
          audio.playSecondaryClick();
          setIsOpen(!isOpen);
        }}
        className={`w-full bg-[#030406] border hover:border-cyan-400/40 px-3.5 py-2.5 rounded-xl font-sans text-xs text-white focus:outline-none transition-all duration-300 shadow-[4px_4px_10px_rgba(0,0,0,0.5),inset_2px_2px_4px_rgba(255,255,255,0.05)] cursor-pointer flex items-center justify-between group ${isOpen ? "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "border-white/5"}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedMember ? (
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-[8.5px] text-slate-950 shrink-0 shadow-md">
              {getInitials(selectedMember.full_name)}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-md bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 shrink-0">
              <User size={10} />
            </div>
          )}
          <span className={`truncate font-mono ${selectedMember ? "text-slate-200" : "text-slate-500"}`}>
            {selectedMember ? selectedMember.full_name : placeholder}
          </span>
        </div>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-cyan-400" : ""}`} />
      </div>

      {/* Beautiful Animated Custom Dropdown list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mt-2 rounded-2xl bg-[#030406]/95 border border-white/[0.08] p-2 shadow-[10px_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-xl z-50 overflow-hidden"
          >
            {/* Soft background cyan glow */}
            <div className="absolute inset-x-0 -top-12 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

            {/* Micro search input inside dropdown */}
            <div className="relative mb-2 shrink-0">
              <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari anggota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#05070a] border border-white/5 focus:border-cyan-500/20 pl-8.5 pr-3 py-2 rounded-lg font-mono text-[10px] text-white focus:outline-none"
              />
            </div>

            {/* Scrollable list */}
            <div className="max-h-[180px] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
              {filteredMembers.length === 0 ? (
                <div className="py-4 text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  Anggota tidak ditemukan
                </div>
              ) : (
                filteredMembers.map(m => {
                  const isSelected = m.id === selectedId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelect(m.id)}
                      className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-all group ${isSelected ? "bg-gradient-to-r from-cyan-950/40 to-slate-950 border border-cyan-500/20 text-cyan-400" : "hover:bg-white/[0.02] border border-transparent text-slate-350"}`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center font-black text-[8px] shrink-0 shadow-md transition-colors ${isSelected ? "bg-cyan-400 text-slate-950" : "bg-slate-900 border border-white/5 text-slate-400 group-hover:bg-slate-800"}`}>
                          {getInitials(m.full_name)}
                        </div>
                        <div className="flex flex-col text-left overflow-hidden">
                          <span className={`text-[10.5px] font-sans font-bold leading-tight truncate ${isSelected ? "text-cyan-300" : "text-slate-200 group-hover:text-white"}`}>
                            {m.full_name}
                          </span>
                          {m.nim && (
                            <span className="text-[7.5px] font-mono text-slate-500 font-extrabold leading-none mt-0.5 tracking-wider truncate">
                              NIM {m.nim}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={12} className="text-cyan-400 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
