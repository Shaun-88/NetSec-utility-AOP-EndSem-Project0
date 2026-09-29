"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { PingLatencyData } from "./types";
import {
  Activity,
  Send,
  Zap,
  AlertTriangle,
} from "lucide-react";

const PRESET_TARGETS = [
  { label: "Cloudflare (1.1.1.1)", target: "1.1.1.1" },
  { label: "Google (google.com)", target: "google.com" },
  { label: "GitHub (github.com)", target: "github.com" },
  { label: "Vercel Edge (vercel.com)", target: "vercel.com" },
];

export default function PingLatencyTool() {
  const [target, setTarget] = useState("");
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<PingLatencyData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (overrideTarget?: string) => {
    const queryTarget = overrideTarget !== undefined ? overrideTarget : target;
    if (!queryTarget.trim()) {
      setError("Please enter a target host or URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/ping-latency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: queryTarget.trim(),
          count,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Latency probe failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run ping latency test.");
    } finally {
      setLoading(false);
    }
  };

  const latencyData = result?.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Ping &amp; Latency Checker
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                HTTP Round-Trip Timing
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Calculate round-trip response latency, packet loss, and RFC 3550 jitter distributions across diagnostic HTTP probes.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Hostname or Web URL
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. google.com or https://cloudflare.com"
                className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Probe Samples
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              >
                <option value={3} className="bg-[#0d131f] text-white">3 Probes</option>
                <option value={4} className="bg-[#0d131f] text-white">4 Probes (Standard)</option>
                <option value={5} className="bg-[#0d131f] text-white">5 Probes (Thorough)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
              <span>Quick Targets:</span>
              {PRESET_TARGETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setTarget(preset.target);
                    handleSubmit(preset.target);
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-glow disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Probing Target..." : "Send Probes"}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Display */}
      {latencyData && (
        <div className="space-y-6">
          {/* Main Rating Banner */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00e575]" />
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Round-Trip Latency Results
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {latencyData.target}
              </h2>
              {latencyData.resolvedIp && (
                <span className="text-xs text-slate-400">
                  Resolved IP: <strong className="text-slate-300">{latencyData.resolvedIp}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                  latencyData.rating === "Excellent"
                    ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/40"
                    : latencyData.rating === "Good"
                    ? "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40"
                    : latencyData.rating === "Fair"
                    ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40"
                    : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40"
                }`}
              >
                {latencyData.rating} Quality
              </span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Average Latency
              </span>
              <div className="text-2xl font-black text-[#00e575]">
                {latencyData.avgLatencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">Median: {latencyData.medianLatencyMs} ms</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Min / Max
              </span>
              <div className="text-2xl font-black text-white">
                {latencyData.minLatencyMs} <span className="text-xs text-slate-400 font-normal">/ {latencyData.maxLatencyMs} ms</span>
              </div>
              <span className="text-[10px] text-slate-500">Latency spread</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Jitter
              </span>
              <div className="text-2xl font-black text-white">
                {latencyData.jitterMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">Deviation between probes</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Packet Loss
              </span>
              <div
                className={`text-2xl font-black ${
                  latencyData.packetLossPercent === 0 ? "text-[#00e575]" : "text-[#ef4444]"
                }`}
              >
                {latencyData.packetLossPercent}%
              </div>
              <span className="text-[10px] text-slate-500">
                {latencyData.probesReceived} of {latencyData.probesSent} received
              </span>
            </div>
          </div>

          {/* Individual Probe Breakdown Table */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Probe Sequence Logs
              </span>
              <span className="text-xs text-slate-400">
                Method: HTTP HEAD (Safe SSRF Gateway)
              </span>
            </div>

            <div className="divide-y divide-[#182234] text-xs">
              {latencyData.probes.map((probe) => (
                <div
                  key={probe.seq}
                  className="p-4 flex items-center justify-between hover:bg-[#121927]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#182234] text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      #{probe.seq}
                    </span>
                    <div>
                      <span className="text-white font-medium">Probe #{probe.seq}</span>
                      <span className="text-[10px] text-slate-500 ml-2">
                        {probe.success ? `HTTP ${probe.status}` : probe.error || "Failed"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {probe.success ? (
                      <span className="font-bold text-[#00e575] text-sm">
                        {probe.durationMs} ms
                      </span>
                    ) : (
                      <span className="font-bold text-[#ef4444] text-sm">
                        Lost
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
