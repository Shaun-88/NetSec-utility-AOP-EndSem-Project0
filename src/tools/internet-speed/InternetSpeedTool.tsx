"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { SpeedTestOutputData } from "./types";
import {
  Gauge,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  Zap,
  Play,
  RotateCcw,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function InternetSpeedTool() {
  const [testing, setTesting] = useState(false);
  const [stage, setStage] = useState<"idle" | "ping" | "download" | "upload" | "complete">("idle");
  const [liveMbps, setLiveMbps] = useState(0);
  const [result, setResult] = useState<ToolResult<SpeedTestOutputData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSpeedTest = async () => {
    setTesting(true);
    setResult(null);
    setError(null);
    setStage("ping");
    setLiveMbps(0);

    // Simulate active UI stage progression while server runs full timed benchmark
    const pingTimer = setTimeout(() => setStage("download"), 800);
    const dlInterval = setInterval(() => {
      setLiveMbps((prev) => {
        if (prev < 45) return prev + Math.floor(Math.random() * 8) + 4;
        return prev + (Math.random() > 0.5 ? 2 : -1);
      });
    }, 150);

    try {
      const res = await fetch("/api/tools/internet-speed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      clearInterval(dlInterval);
      clearTimeout(pingTimer);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Speed test failed with status ${res.status}`);
      }

      setStage("upload");
      await new Promise((r) => setTimeout(r, 600));

      const data = await res.json();
      setResult(data);
      setLiveMbps(data.data?.downloadMbps || 0);
      setStage("complete");
    } catch (err) {
      clearInterval(dlInterval);
      clearTimeout(pingTimer);
      setError(err instanceof Error ? err.message : "Internet speed test failed.");
      setStage("idle");
    } finally {
      setTesting(false);
    }
  };

  const speedData = result?.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Internet Speed &amp; Bandwidth Test
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Timed Transfer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Measure real-time download bandwidth, upload capacity, and round-trip ping latency.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Speedometer Console */}
      <div className="border border-[#182234] bg-gradient-to-b from-[#0d131f] to-[#090d16] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        {/* Animated Background Ring */}
        <div className="relative w-64 h-64 flex flex-col items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full border-4 border-[#182234] transition-all duration-700 ${
              testing
                ? "border-t-[#00e575] border-r-[#00e575]/50 animate-spin"
                : stage === "complete"
                ? "border-[#00e575]/60 shadow-[0_0_30px_rgba(0,229,117,0.2)]"
                : ""
            }`}
          />

          <div className="relative z-10 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
              {stage === "idle" && "READY TO TEST"}
              {stage === "ping" && "CALIBRATING LATENCY..."}
              {stage === "download" && "MEASURING DOWNLOAD..."}
              {stage === "upload" && "MEASURING UPLOAD..."}
              {stage === "complete" && "TEST COMPLETE"}
            </span>

            <div className="text-5xl font-black text-white tracking-tight">
              {testing ? liveMbps : speedData ? speedData.downloadMbps : "0.0"}
            </div>

            <span className="text-xs font-bold text-[#00e575] tracking-wider block">
              MBPS DOWNLOAD
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={runSpeedTest}
            disabled={testing}
            className="px-8 py-3 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-bold text-sm rounded-xl transition-all shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Running Diagnostics...</span>
              </>
            ) : stage === "complete" ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Run Another Test</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Speed Test</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Display */}
      {speedData && (
        <div className="space-y-6">
          {/* Main Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d131f] border border-[#182234] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <ArrowDownCircle className="w-4 h-4 text-[#00e575]" />
                <span className="uppercase tracking-wider">Download</span>
              </div>
              <div className="text-3xl font-black text-white">
                {speedData.downloadMbps}{" "}
                <span className="text-xs text-slate-400 font-normal">Mbps</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {(speedData.bytesDownloaded / 1_000_000).toFixed(2)} MB transferred
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d131f] border border-[#182234] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <ArrowUpCircle className="w-4 h-4 text-[#38bdf8]" />
                <span className="uppercase tracking-wider">Upload</span>
              </div>
              <div className="text-3xl font-black text-white">
                {speedData.uploadMbps}{" "}
                <span className="text-xs text-slate-400 font-normal">Mbps</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {(speedData.bytesUploaded / 1_000_000).toFixed(2)} MB transferred
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d131f] border border-[#182234] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Activity className="w-4 h-4 text-[#f59e0b]" />
                <span className="uppercase tracking-wider">Latency</span>
              </div>
              <div className="text-3xl font-black text-white">
                {speedData.latencyMs}{" "}
                <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Jitter: {speedData.jitterMs} ms
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d131f] border border-[#182234] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Zap className="w-4 h-4 text-[#a855f7]" />
                <span className="uppercase tracking-wider">Tier</span>
              </div>
              <div className="text-lg font-bold text-[#00e575] truncate">
                {speedData.tier}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Test duration: {speedData.durationSeconds}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
