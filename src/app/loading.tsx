import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#080b11] text-[#f1f5f9] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#0d131f] border border-[#00e575]/40 flex items-center justify-center shadow-glow">
          <div className="w-5 h-5 border-2 border-[#00e575] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-white tracking-wide block uppercase">
            NetSec Armoury
          </span>
          <span className="text-[11px] text-slate-500 font-sans block">
            Calibrating secure diagnostic interface...
          </span>
        </div>
      </div>
    </div>
  );
}
