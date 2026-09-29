"use client";

import React from "react";
import { Terminal, Shield, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

interface PlaceholderToolProps {
  toolId: string;
  name: string;
  description: string;
  category: "network" | "cybersecurity";
  phase: string;
}

export default function PlaceholderTool({
  name,
  description,
  category,
  phase,
}: PlaceholderToolProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/home"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-[#00e575] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Armoury Dashboard</span>
      </Link>

      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-8 space-y-6 relative overflow-hidden">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30 capitalize">
                  {category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled for {phase}</span>
          </div>
        </div>

        <div className="border border-[#182234] bg-[#080b11] rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-[#00e575]" />
            <span>Module Invariant Specifications</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            This module will follow the standard template architecture under{" "}
            <code className="text-[#00e575]">src/tools/</code> with dedicated pure computation
            routines, SSRF-hardened fetch guards, and tenant-isolated history persistence.
          </p>
        </div>
      </div>
    </div>
  );
}
