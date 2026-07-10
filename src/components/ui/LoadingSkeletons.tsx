import React from "react";

/**
 * Premium Obsidian-themed Loading Skeleton for the DatasetUpload component.
 * Uses high-contrast glass panels, glowing accent outlines, and custom pulse rates.
 */
export function DatasetUploadSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse" id="dataset_upload_skeleton">
      {/* 1. Header/Banner Area Skeleton */}
      <div className="p-6.5 bg-[#121422]/60 border border-white/5 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-indigo-500/15 border border-indigo-500/10 rounded-md w-1/4" />
          <div className="h-7 bg-white/5 border border-white/10 rounded-xl w-3/4" />
          <div className="h-3 bg-slate-500/10 rounded-md w-5/6" />
        </div>
        <div className="w-12 h-12 bg-[#030408] border border-white/10 rounded-2xl flex items-center justify-center shrink-0" />
      </div>

      {/* 2. Primary Layout Deck Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main interactive area skeleton */}
        <div className="lg:col-span-8 p-6.5 bg-gradient-to-br from-[#12141c] to-[#030406] border border-white/5 rounded-[24px] space-y-6 min-h-[300px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="h-5 bg-indigo-500/10 border border-indigo-500/5 rounded-md w-1/3" />
            <div className="h-4 bg-slate-500/10 rounded-md w-1/12" />
          </div>

          <div className="p-8 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-black/40 min-h-[180px]">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full animate-ping" />
            <div className="h-4 bg-white/5 rounded-md w-1/3" />
            <div className="h-3 bg-slate-500/10 rounded-md w-1/2" />
          </div>
        </div>

        {/* Sidebar overview panel skeleton */}
        <div className="lg:col-span-4 p-5.5 bg-zinc-950/40 border border-white/5 rounded-[24px] flex flex-col justify-between min-h-[300px] space-y-6">
          <div className="space-y-4">
            <div className="h-4 bg-white/5 rounded-md w-2/3" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-500/10 rounded-md w-full" />
              <div className="h-3 bg-slate-500/10 rounded-md w-5/6" />
              <div className="h-3 bg-slate-500/10 rounded-md w-4/5" />
            </div>
          </div>
          <div className="h-12 bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 rounded-2xl w-full" />
        </div>
      </div>

      {/* 3. Predefined Datasets Section Skeleton */}
      <div className="p-6.5 bg-[#0a0c14]/80 border border-white/5 rounded-[24px] space-y-5">
        <div className="h-5 bg-white/5 rounded-md w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-28 bg-[#0b0d16] border border-white/5 rounded-2xl" />
          <div className="h-28 bg-[#0b0d16] border border-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Obsidian-themed Loading Skeleton for the ModelPerformanceDashboard component.
 * Features 4 high-end stats cards pulsing and a structured mock metrics table.
 */
export function PerformanceDashboardSkeleton() {
  return (
    <div className="space-y-8 w-full animate-pulse" id="performance_dashboard_skeleton">
      {/* 1. Header/Banner Area Skeleton */}
      <div className="p-6 bg-[#121422]/60 border border-white/5 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2.5 flex-1">
          <div className="h-4 bg-emerald-500/15 border border-emerald-500/10 rounded-md w-1/5" />
          <div className="h-7 bg-white/5 border border-white/10 rounded-xl w-1/2" />
          <div className="h-3 bg-slate-500/10 rounded-md w-4/5" />
        </div>
        <div className="w-36 h-10 bg-white/5 border border-white/10 rounded-2xl shrink-0" />
      </div>

      {/* 2. Four Bento Matrix Metrics Cards Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6.5 space-y-4 bg-gradient-to-br from-[#12141c] to-[#030406] border border-white/5 rounded-3xl min-h-[145px] relative"
            style={{
              boxShadow: "10px 10px 25px rgba(0,0,0,0.85), inset 2px 2px 4px rgba(255,255,255,0.02)"
            }}
          >
            <div className="h-3 bg-slate-500/15 rounded w-1/2" />
            <div className="h-10 bg-white/10 rounded-xl w-3/4 mt-2" />
            <div className="h-2.5 bg-slate-500/10 rounded w-5/6" />
          </div>
        ))}
      </div>

      {/* 3. Primary Section Spotlight card */}
      <div className="p-8 bg-gradient-to-br from-[#12141e] to-[#030406] border border-white/10 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-3xl">
        <div className="flex items-center space-x-4 w-full">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl shrink-0" />
          <div className="space-y-2.5 w-full">
            <div className="h-3 bg-slate-500/15 rounded w-1/4" />
            <div className="h-6 bg-white/5 rounded-lg w-1/3" />
            <div className="h-3 bg-slate-500/10 rounded w-2/3" />
          </div>
        </div>
        <div className="w-20 h-12 bg-[#030406] border border-white/5 rounded-xl shrink-0" />
      </div>

      {/* 4. Comparison Table Skeleton */}
      <div className="p-8 bg-gradient-to-br from-[#0c0e17] to-[#020305] border border-white/10 rounded-[2.5rem] space-y-6">
        <div className="h-5 bg-white/5 rounded-md w-1/3" />
        <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-4 space-y-4">
          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-white/5">
            <div className="h-3 bg-slate-500/20 rounded w-1/2" />
            <div className="h-3 bg-slate-500/20 rounded w-1/3" />
            <div className="h-3 bg-slate-500/20 rounded w-1/4" />
            <div className="h-3 bg-slate-500/20 rounded w-1/5" />
          </div>
          {[1, 2, 3].map((r) => (
            <div key={r} className="grid grid-cols-4 gap-4 py-2 border-b border-white/5 last:border-0">
              <div className="h-5 bg-white/5 rounded-md w-3/4" />
              <div className="h-5 bg-[#030406] border border-white/5 rounded-xl w-1/2" />
              <div className="h-5 bg-[#030406] border border-white/5 rounded-xl w-2/3" />
              <div className="h-5 bg-[#030406] border border-white/5 rounded-xl w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
