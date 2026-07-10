import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Calendar, Wallet, Layers, Clock, CheckCircle, 
  ArrowUpRight, AlertCircle, PlusCircle, Sparkles, Send, FileText, MapPin, FolderOpen
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell 
} from "recharts";
import { TrendingUp, PieChart as PieIcon, BarChart2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";

interface DashboardProps {
  onNavigate: (tab: any) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    attendanceRate: 0,
    cashBalance: 0,
    activePrograms: 0,
    completedPrograms: 0,
    tasksNearDeadline: 0,
  });

  const [programsData, setProgramsData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingAgenda, setUpcomingAgenda] = useState<any[]>([]);
  const [monthlyFinance, setMonthlyFinance] = useState<any[]>([]);
  const [categoryFinance, setCategoryFinance] = useState<any[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Subscribe to real-time events on all relevant tables to refresh immediately
  useRealtimeRefresh(() => {
    fetchDashboardData();
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Total Members count where is_active = true
      const { count: memberCount, error: memberErr } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const fetchedMembersCount = memberErr ? 0 : (memberCount || 0);

      // 2. Attendance Rate: present records / total records * 100
      let fetchedAttendanceRate = 0;
      const { data: records, error: recordsErr } = await supabase
        .from("attendance_records")
        .select("status");
      
      if (!recordsErr && records && records.length > 0) {
        const presentCount = records.filter(
          (r: any) => r.status === "Present" || r.status === "Hadir"
        ).length;
        fetchedAttendanceRate = Math.round((presentCount / records.length) * 100);
      }

      // 3. Cash Balance: total income - total expense from financial_transactions
      let fetchedCashBalance = 0;
      const { data: transactions, error: transErr } = await supabase
        .from("financial_transactions")
        .select("amount, transaction_type, transaction_date, category, created_at");
      
      if (!transErr && transactions) {
        let totalIn = 0;
        let totalOut = 0;
        transactions.forEach((f: any) => {
          const val = Number(f.amount) || 0;
          const typeLower = (f.transaction_type || "").toLowerCase();
          if (typeLower === "income" || typeLower === "pemasukan") {
            totalIn += val;
          } else {
            totalOut += val;
          }
        });
        fetchedCashBalance = totalIn - totalOut;
      }

      // 4. Active & Completed Programs
      let fetchedActiveProkers = 0;
      let fetchedCompletedProkers = 0;
      let programsList: any[] = [];
      const { data: progs, error: progsErr } = await supabase
        .from("programs")
        .select("*")
        .order("title", { ascending: true });

      if (!progsErr && progs) {
        programsList = progs;
        fetchedActiveProkers = progs.filter(
          (p: any) => (p.status || "").toLowerCase() === "in_progress" || (p.status || "").toLowerCase() === "active" || (p.status || "").toLowerCase() === "berjalan"
        ).length;
        fetchedCompletedProkers = progs.filter(
          (p: any) => (p.status || "").toLowerCase() === "completed" || (p.status || "").toLowerCase() === "selesai"
        ).length;
      }

      // 5. Tasks Near Deadline: not completed and within 7 days
      let fetchedTasksNearDeadline = 0;
      const { data: tasks, error: taskErr } = await supabase
        .from("program_tasks")
        .select("*");

      if (!taskErr && tasks) {
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);

        fetchedTasksNearDeadline = tasks.filter((t: any) => {
          const statLower = (t.status || "").toLowerCase();
          const isCompleted = statLower === "completed" || statLower === "selesai";
          const dueStr = t.due_at || t.deadline || t.due_date;
          if (isCompleted || !dueStr) return false;
          const dueDate = new Date(dueStr);
          return dueDate >= now && dueDate <= sevenDaysLater;
        }).length;
      }

      // 6. Upcoming Meetings / Agenda (agendas)
      let agendaList: any[] = [];
      const { data: meetings, error: meetErr } = await supabase
        .from("agendas")
        .select("*")
        .order("start_time", { ascending: true })
        .limit(3);

      if (!meetErr && meetings) {
        agendaList = meetings;
      }

      // 7. Recent Operations Logs (activity_logs)
      let logsList: any[] = [];
      const { data: rawLogs, error: logErr } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!logErr && rawLogs) {
        logsList = rawLogs;
      }

      // Group transactions for Chart trend (monthly) and Category breakdown
      const groupedFinance: { [key: string]: { income: number; expense: number } } = {};
      const categoryGroup: { [key: string]: number } = {};

      if (transactions && transactions.length > 0) {
        transactions.forEach((f: any) => {
          const dateVal = f.transaction_date || f.created_at || new Date();
          const monthKey = new Date(dateVal).toLocaleDateString("id-ID", { month: "short" });
          if (!groupedFinance[monthKey]) {
            groupedFinance[monthKey] = { income: 0, expense: 0 };
          }
          const val = Number(f.amount) || 0;
          const typeLower = (f.transaction_type || "").toLowerCase();
          if (typeLower === "income" || typeLower === "pemasukan") {
            groupedFinance[monthKey].income += val;
          } else {
            groupedFinance[monthKey].expense += val;
            
            // Collect expenses for Category Distribution Pie Chart
            const cat = f.category || "Operasional";
            categoryGroup[cat] = (categoryGroup[cat] || 0) + val;
          }
        });
      }

      const formattedFinance = Object.keys(groupedFinance).map(month => ({
        name: month,
        Income: groupedFinance[month].income,
        Expense: groupedFinance[month].expense,
        Net: groupedFinance[month].income - groupedFinance[month].expense
      }));

      const formattedCategories = Object.keys(categoryGroup).map((cat, index) => ({
        name: cat,
        value: categoryGroup[cat],
        color: [
          "#22d3ee", // cyan
          "#6366f1", // indigo
          "#f43f5e", // rose
          "#fbbf24", // amber
          "#a855f7", // purple
          "#10b981", // emerald
          "#ec4899"  // pink
        ][index % 7]
      })).sort((a,b) => b.value - a.value);

      setMetrics({
        totalMembers: fetchedMembersCount,
        attendanceRate: fetchedAttendanceRate,
        cashBalance: fetchedCashBalance,
        activePrograms: fetchedActiveProkers,
        completedPrograms: fetchedCompletedProkers,
        tasksNearDeadline: fetchedTasksNearDeadline,
      });

      setProgramsData(programsList);
      setUpcomingAgenda(agendaList);
      setRecentActivities(logsList);
      setMonthlyFinance(formattedFinance);
      setCategoryFinance(formattedCategories);

    } catch (err) {
      console.error("Gagal memuat statistik dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  const dashboardCards = [
    {
      title: "Total Members",
      value: metrics.totalMembers,
      subtitle: `${metrics.totalMembers} Peserta Aktif`,
      icon: Users,
      color: "from-cyan-500/10 via-cyan-500/[0.02] to-transparent border-cyan-500/20 text-cyan-400 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]",
      targetTab: "members"
    },
    {
      title: "Attendance Rate",
      value: `${metrics.attendanceRate}%`,
      subtitle: "Rata-rata Presensi",
      icon: Calendar,
      color: "from-indigo-500/10 via-indigo-500/[0.02] to-transparent border-indigo-500/20 text-indigo-400 hover:border-indigo-400/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]",
      targetTab: "attendance"
    },
    {
      title: "Cash Balance",
      value: formatRupiah(metrics.cashBalance),
      subtitle: "Saldo Kas Bersama",
      icon: Wallet,
      color: "from-emerald-500/10 via-emerald-500/[0.02] to-transparent border-emerald-500/20 text-emerald-400 hover:border-emerald-400/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
      targetTab: "finance"
    },
    {
      title: "Active Programs",
      value: metrics.activePrograms,
      subtitle: `${metrics.completedPrograms} Proker Selesai`,
      icon: Layers,
      color: "from-sky-500/10 via-sky-500/[0.02] to-transparent border-sky-500/20 text-sky-400 hover:border-sky-400/40 hover:shadow-[0_0_25px_rgba(14,165,233,0.15)]",
      targetTab: "programs"
    },
  ];

  return (
    <div className="space-y-8 text-left" id="kkn_dashboard_shell">
      {/* 1. Header Banner */}
      <div className="relative nm-card-3d p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.03] rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/[0.02] rounded-full blur-[60px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
                CONTROL CENTER
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider mt-3.5 font-sans bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              KKN Project Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium max-w-2xl leading-relaxed">
              Selamat datang kembali di pusat kendali kelompok. Pantau koordinasi, administrasi logbook kegiatan, program kerja, dan arus kas keuangan secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="nm-btn px-5 py-3 text-xs font-mono font-black tracking-widest text-slate-300 hover:text-cyan-300 flex items-center gap-2.5"
            >
              {loading ? (
                <svg className="animate-spin h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Sparkles size={14} className="text-cyan-400" />
              )}
              <span>REFRESH STATS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Operational Metrics Grid - 3D Neumorphic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard_metrics_grid">
        {dashboardCards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.targetTab)}
              className="nm-card-3d p-6 relative overflow-hidden flex flex-col justify-between cursor-pointer group text-left border border-white/5 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 text-left">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 block">
                    {card.title}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mt-2 font-sans flex items-baseline">
                    {loading ? (
                      <span className="inline-block w-20 h-8 bg-white/5 rounded-xl animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/[0.04] group-hover:border-white/20 transition-all shadow-[inset_2px_2px_5px_rgba(0,0,0,0.95)]">
                  <CardIcon size={20} className="text-cyan-400" />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                <span>{card.subtitle}</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  BUKA MODUL <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Empty States Action Banner */}
      {metrics.totalMembers === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="nm-card-3d p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-500/20"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle size={22} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-black text-white uppercase tracking-widest">Workspace Masih Kosong</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[500px] leading-relaxed">
                Database anggota kelompok masih kosong. Daftarkan anggota terlebih dahulu untuk mengaktifkan seluruh analisis Command Center secara akurat.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("members")}
            className="nm-btn px-5 py-3 text-amber-400 text-xs font-sans font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
          >
            <PlusCircle size={15} />
            <span>Daftarkan Anggota Pertama</span>
          </button>
        </motion.div>
      ) : (
        metrics.activePrograms === 0 && metrics.completedPrograms === 0 && metrics.cashBalance === 0 && recentActivities.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="nm-card-3d p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-cyan-500/20"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <AlertCircle size={22} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-black text-white uppercase tracking-widest">Workspace Kosong</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[500px] leading-relaxed">
                  Belum ada aktivitas operasional. Mulai dengan membuat proker, transaksi, laporan, atau sesi presensi.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("programs")}
              className="nm-btn px-5 py-3 text-cyan-400 text-xs font-sans font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
            >
              <PlusCircle size={15} />
              <span>Mulai Aktivitas</span>
            </button>
          </motion.div>
        )
      )}

      {/* 4. Secondary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fade-in" id="dashboard_analytics_grid">
        
        {/* Left Column: Financial Cash Flow Analysis (Bar & Line Chart) - 8 cols */}
        <div className="lg:col-span-8 nm-card-3d p-8 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] mb-5 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <BarChart2 size={16} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-black text-white uppercase tracking-wider">
                  Analisis Arus Kas Kelompok
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Visualisasi Real-time Pemasukan & Pengeluaran</p>
              </div>
            </div>
            
            {/* High-end Neon Segment Toggler */}
            <div className="flex bg-[#07090e] border border-white/[0.05] p-1 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  chartType === "bar"
                    ? "bg-cyan-500 text-black font-black shadow-[0_2px_10px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart2 size={12} />
                <span>Bar Chart</span>
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  chartType === "line"
                    ? "bg-indigo-500 text-white font-black shadow-[0_2px_10px_rgba(99,102,241,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp size={12} />
                <span>Line Chart</span>
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full" id="finance_chart_viewport">
            {monthlyFinance.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-2xl border border-white/[0.04]">
                <Wallet size={36} className="text-slate-600 mb-3 animate-pulse" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belum Ada Transaksi</p>
                <p className="text-[10px] text-slate-500 mt-1">Masukkan data pemasukan atau pengeluaran di modul Kas Keuangan.</p>
              </div>
            ) : chartType === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFinance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.015)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#06080c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="rect" />
                  <Bar dataKey="Income" fill="url(#barIncome)" radius={[4, 4, 0, 0]} name="Pemasukan (Rp)" />
                  <Bar dataKey="Expense" fill="url(#barExpense)" radius={[4, 4, 0, 0]} name="Pengeluaran (Rp)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyFinance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.015)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#06080c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="Net" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} name="Saldo Bersih (Rp)" />
                  <Line type="monotone" dataKey="Income" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="3 3" name="Pemasukan" />
                  <Line type="monotone" dataKey="Expense" stroke="#ec4899" strokeWidth={1.5} strokeDasharray="3 3" name="Pengeluaran" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column: Allocation Category Distribution (Pie Chart) - 4 cols */}
        <div className="lg:col-span-4 nm-card-3d p-8 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <PieIcon size={16} className="animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <div>
                <h3 className="font-sans text-sm font-black text-white uppercase tracking-wider">
                  Alokasi Anggaran
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Diagram Alur Pengeluaran</p>
              </div>
            </div>
          </div>

          {categoryFinance.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-2xl border border-white/[0.04]">
              <PieIcon size={36} className="text-slate-600 mb-3" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belum Ada Pengeluaran</p>
              <p className="text-[10px] text-slate-500 mt-1">Catat pengeluaran di menu Kas Keuangan untuk melihat analisis alokasi anggaran.</p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-between gap-4">
              <div className="h-[180px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryFinance}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryFinance.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(v: any) => `Rp${Number(v).toLocaleString()}`}
                      contentStyle={{ backgroundColor: "#06080c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">Total Belanja</span>
                  <span className="text-xs font-sans font-black text-white mt-0.5">
                    Rp{categoryFinance.reduce((acc: any, curr: any) => acc + curr.value, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Custom Premium List Legend */}
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                {categoryFinance.map((item: any, idx: number) => {
                  const total = categoryFinance.reduce((acc: any, curr: any) => acc + curr.value, 0) || 1;
                  const percentage = Math.round((item.value / total) * 100);
                  return (
                    <div key={idx} className="flex items-center justify-between text-[10px] font-mono py-1 border-b border-white/[0.02]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 truncate font-sans font-bold uppercase">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="text-white font-bold">Rp{item.value.toLocaleString()}</span>
                        <span className="text-slate-500 text-[8px] font-black">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. Unified 3-Panel Widget Row (Program Progress, Upcoming Agenda, Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch" id="dashboard_3panel_layout_grid">
        
        {/* Panel A: Program Work Progress */}
        <div className="nm-card-3d p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
            <h3 className="font-mono text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2.5">
              <Layers size={15} className="text-sky-400 animate-pulse" />
              <span>Program Work Progress</span>
            </h3>
            <span className="text-[8.5px] font-mono font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-sky-500/10">
              Proker Timeline
            </span>
          </div>

          <div className="flex-grow flex flex-col justify-center space-y-4">
            {programsData.length === 0 ? (
              <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/[0.04] text-center flex flex-col items-center justify-center min-h-[220px]">
                <Layers size={32} className="text-slate-600 mb-3" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belum Ada Program Kerja</p>
                <p className="text-[10px] text-slate-500 mt-1">Buat program kerja baru di modul Programs untuk memantau progres kegiatan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {programsData.slice(0, 4).map((prog, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-black truncate max-w-[160px] uppercase tracking-wider text-[11px]">{prog.title}</span>
                      <span className="font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-[9px]">{prog.progress_percentage || prog.progress || 0}%</span>
                    </div>
                    <div className="w-full h-3 nm-inset overflow-hidden p-0.5 rounded-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${prog.progress_percentage || prog.progress || 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          (prog.progress_percentage || prog.progress) === 100 
                            ? "from-emerald-500 to-teal-500" 
                            : (prog.progress_percentage || prog.progress) >= 50 
                              ? "from-cyan-400 to-indigo-500" 
                              : "from-indigo-600 to-purple-600"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel B: Upcoming Agenda Meetings */}
        <div className="nm-card-3d p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
            <h3 className="font-mono text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2.5">
              <Calendar size={15} className="text-indigo-400 animate-pulse" />
              <span>Upcoming Agenda Meetings</span>
            </h3>
            <span className="text-[8.5px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-500/10">
              Meetings Ledger
            </span>
          </div>

          <div className="flex-grow space-y-3 flex flex-col justify-center">
            {upcomingAgenda.length === 0 ? (
              <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/[0.04] text-center flex flex-col items-center justify-center min-h-[220px]">
                <Calendar size={32} className="text-slate-600 mb-3" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Agenda Kosong</p>
                <p className="text-[10px] text-slate-500 mt-1">Belum ada agenda rapat koordinasi kelompok terjadwal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAgenda.slice(0, 3).map((ag, idx) => {
                  const dateObj = new Date(ag.start_time || ag.date || new Date());
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/[0.04] flex items-start gap-3 hover:border-indigo-500/30 transition-all text-left shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-center shrink-0 w-11 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05)]">
                        <span className="block text-sm font-black leading-none">{dateObj.getDate()}</span>
                        <span className="block text-[7.5px] uppercase font-bold mt-1">{dateObj.toLocaleDateString("id-ID", { month: "short" })}</span>
                      </div>
                      <div className="text-left space-y-1 flex-grow min-w-0">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider truncate">{ag.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate">{ag.description || "Pertemuan KKN Kelompok 063"}</p>
                        <span className="inline-flex items-center gap-1 text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                          <MapPin size={9} />
                          <span>{ag.location || "Basecamp 063"}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel C: Recent Activity Logs */}
        <div className="nm-card-3d p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
            <h3 className="font-mono text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2.5">
              <Sparkles size={15} className="text-cyan-400 animate-pulse" />
              <span>Recent Workspace Logs</span>
            </h3>
            <span className="text-[8.5px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-cyan-500/10">
              Operations Audit
            </span>
          </div>

          <div className="flex-grow space-y-2.5 flex flex-col justify-center">
            {recentActivities.length === 0 ? (
              <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/[0.04] text-center flex flex-col items-center justify-center min-h-[220px]">
                <Sparkles size={32} className="text-slate-600 mb-3" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belum Ada Aktivitas</p>
                <p className="text-[10px] text-slate-500 mt-1">Log perubahan database dan operasi logbook akan otomatis tercatat.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.slice(0, 4).map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/[0.04] text-[10px] text-slate-300 hover:border-cyan-500/20 transition-all text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                      <span className="font-medium text-slate-400 truncate">{act.message}</span>
                    </div>
                    <span className="text-[8.5px] font-mono text-slate-500 shrink-0 uppercase tracking-widest pl-2 font-bold">
                      {new Date(act.created_at || act.date || new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. Quick Actions Dock */}
      <div className="nm-card-3d p-8 relative overflow-hidden" id="dashboard_quick_actions">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
          <h3 className="font-mono text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2.5">
            <ArrowUpRight size={15} className="text-cyan-400 animate-pulse" />
            <span>Interactive Operational Shortcuts</span>
          </h3>
          <span className="text-[8.5px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-cyan-500/10">
            Quick Ingress
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <button
            onClick={() => onNavigate("attendance")}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <Users size={18} className="text-cyan-400" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-cyan-300">Check-In Presensi</span>
          </button>

          <button
            onClick={() => onNavigate("programs")}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <Layers size={18} className="text-indigo-400" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-indigo-300">Program Kerja</span>
          </button>

          <button
            onClick={() => onNavigate("finance")}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <Wallet size={18} className="text-emerald-400" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-emerald-300">Kas Keuangan</span>
          </button>

          <button
            onClick={() => onNavigate("reports")}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <FileText size={18} className="text-rose-400" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-rose-300">Logbook Laporan</span>
          </button>

          <button
            onClick={() => onNavigate("template-divisi")}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <FolderOpen size={18} className="text-cyan-400" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-cyan-300 font-bold">Template Divisi</span>
          </button>

          <button
            onClick={() => onNavigate("members")}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <Users size={18} className="text-cyan-400" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-cyan-300">Anggota Kelompok</span>
          </button>

          <button
            onClick={() => {
              localStorage.setItem("kkn_settings_active_tab", "gallery");
              onNavigate("settings");
            }}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer border border-cyan-500/10"
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <Sparkles size={18} className="text-cyan-400 animate-pulse" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-cyan-300">Pengaturan Galeri</span>
          </button>

          <button
            onClick={() => onNavigate("settings")}
            className="nm-btn p-5 flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20 shadow-[inset_1px_1.5px_3px_rgba(0,0,0,0.8)]">
              <Sparkles size={18} className="text-slate-400" />
            </div>
            <span className="font-mono text-[8.5px] font-black tracking-widest uppercase text-slate-400 group-hover:text-slate-300">Workspace Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
