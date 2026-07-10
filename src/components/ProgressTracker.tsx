import React, { useState } from "react";
import { motion } from "motion/react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, CheckSquare, Layers, Award, Activity, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { audio } from "../utils/audioService";

export default function ProgressTracker() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Completed KKN programs stats
  const aggregateProgress = 83.75; // overall %
  
  const programData = [
    { name: "Digital & Administration", progress: 100, completed: 5, total: 5, color: "#10b981" },
    { name: "SME Economic Empowerment", progress: 85, completed: 6, total: 7, color: "#06b6d4" },
    { name: "Environmental Waste Mgmt", progress: 80, completed: 4, total: 5, color: "#6366f1" },
    { name: "Community Health & Care", progress: 90, completed: 9, total: 10, color: "#a855f7" },
    { name: "Youth Education & Literacy", progress: 65, completed: 4, total: 6, color: "#f59e0b" },
  ];

  const pieData = [
    { name: "Completed", value: 83.75, color: "#06b6d4" },
    { name: "In Progress", value: 16.25, color: "#1e293b" },
  ];

  const handleBarHover = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const name = state.activePayload[0].payload.name;
      if (activeCategory !== name) {
        setActiveCategory(name);
        audio.playClick();
      }
    } else {
      setActiveCategory(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="nm-card p-6 sm:p-8 w-full relative overflow-hidden border border-white/5 bg-gradient-to-b from-[#090b16]/95 to-[#04050a]/98 rounded-3xl shadow-[12px_12px_36px_rgba(0,0,0,0.95)]"
    >
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.01)_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 rounded-lg text-[8.5px] font-mono uppercase tracking-widest font-black shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8)]">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("about.progress_badge", "PROGRAMS PROGRESS TRACKER")}</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-none font-sans bg-gradient-to-r from-indigo-400 via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              {t("about.progress_title", "KKN PROGRAM COMPLETION MONITOR")}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans font-medium max-w-2xl leading-relaxed">
              {t("about.progress_desc", "Real-time program completion monitoring of the KKN Persyarikatan Muhammadiyah programs across different operational modules.")}
            </p>
          </div>
          
          <div className="px-4 py-2 bg-[#020305]/80 border border-white/5 rounded-xl flex items-center gap-3 shadow-inner font-mono shrink-0">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="text-left leading-none">
              <span className="text-[7.5px] text-slate-500 font-bold block uppercase tracking-wider">AGGREGATE RATING</span>
              <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase">83.75% COMPLETE</span>
            </div>
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Column 1: Donut progress chart (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#030409]/60 border border-white/5 relative h-[260px] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="w-full h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={84}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="url(#donutGlow)" />
                    <Cell fill="#111322" stroke="rgba(255,255,255,0.05)" />
                  </Pie>
                  
                  {/* Glowing gradients definition */}
                  <defs>
                    <linearGradient id="donutGlow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </PieChart>
              </ResponsiveContainer>

              {/* Absolute Position Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">OVERALL</span>
                <span className="text-3xl font-black text-white font-sans tracking-tight mt-1 leading-none drop-shadow-[0_2px_8px_rgba(34,211,238,0.3)]">
                  {aggregateProgress}%
                </span>
                <span className="text-[7.5px] font-mono font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 leading-none">
                  ON PROGRESS
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Program breakdown Bar Chart (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between p-6 rounded-2xl bg-[#030409]/60 border border-white/5 h-[260px]">
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={programData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                  onMouseMove={handleBarHover}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700, fontFamily: "Inter, sans-serif" }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.02)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#04050a]/95 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md font-sans">
                            <p className="text-[10px] font-extrabold text-white uppercase tracking-tight mb-1">{data.name}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-[12px] font-black font-mono text-cyan-400">{data.progress}%</span>
                              <span className="text-[9px] text-slate-400 font-semibold font-mono">({data.completed}/{data.total} Programs)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="progress" 
                    radius={[0, 6, 6, 0]}
                    barSize={12}
                    background={{ fill: "#090b15", radius: 6 }}
                  >
                    {programData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={activeCategory === entry.name ? "#22d3ee" : entry.color} 
                        className="transition-all duration-300"
                        style={{
                          filter: activeCategory === entry.name ? "drop-shadow(0 0 6px rgba(34,211,238,0.6))" : "none"
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Micro details panel under Bar Chart */}
            <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-3 font-mono text-[8.5px] text-slate-500 uppercase tracking-widest">
              <div className="text-left">
                <span className="block font-bold">TOTAL ACTIVITIES</span>
                <span className="text-[10px] text-slate-300 font-extrabold">34 PLANNED</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">EXECUTED</span>
                <span className="text-[10px] text-emerald-400 font-extrabold">28 SUCCESS</span>
              </div>
              <div className="text-right">
                <span className="block font-bold">REMAINING</span>
                <span className="text-[10px] text-amber-500 font-extrabold">6 ON SCHEDULE</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
