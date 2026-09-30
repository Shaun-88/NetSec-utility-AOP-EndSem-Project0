"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { PingLatencyData } from "./types";
import {
  Activity,
  Send,
  Zap,
  AlertTriangle,
  HelpCircle,
  Gamepad2,
  Video,
  PhoneCall,
  Globe,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";

const PRESET_TARGETS = [
  { label: "Cloudflare (1.1.1.1)", target: "1.1.1.1" },
  { label: "Google (google.com)", target: "google.com" },
  { label: "GitHub (github.com)", target: "github.com" },
  { label: "Vercel Edge (vercel.com)", target: "vercel.com" },
  { label: "Amazon AWS (aws.amazon.com)", target: "aws.amazon.com" },
];

export default function PingLatencyTool() {
  const [target, setTarget] = useState("");
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<PingLatencyData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBenchmarkGuide, setShowBenchmarkGuide] = useState(false);

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

  // Helper for rendering SVG sparkline chart
  const renderChart = () => {
    if (!latencyData || latencyData.probes.length === 0) return null;
    const successfulProbes = latencyData.probes.filter((p) => p.success);
    if (successfulProbes.length === 0) return null;

    const values = successfulProbes.map((p) => p.durationMs);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const width = 600;
    const height = 120;
    const paddingX = 40;
    const paddingY = 25;

    const points = successfulProbes.map((p, idx) => {
      const x =
        paddingX +
        (idx / Math.max(successfulProbes.length - 1, 1)) *
          (width - paddingX * 2);
      const normalizedY = (p.durationMs - minVal) / range;
      const y = height - paddingY - normalizedY * (height - paddingY * 2);
      return { x, y, duration: p.durationMs, seq: p.seq };
    });

    const pathData = points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`)
      .join(" ");

    const areaData = `${pathData} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

    // Median line calculation
    const medianNorm = (latencyData.medianLatencyMs - minVal) / range;
    const medianY = height - paddingY - medianNorm * (height - paddingY * 2);

    return (
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00e575]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Probe Latency Timeline (ms)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#00e575] inline-block rounded" />
              Probes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t border-dashed border-[#f59e0b] inline-block" />
              Median ({latencyData.medianLatencyMs} ms)
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-32 overflow-visible"
          >
            <defs>
              <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e575" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00e575" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid baseline */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="#182234"
              strokeWidth="1"
            />

            {/* Median guide line */}
            {medianY >= paddingY && medianY <= height - paddingY && (
              <line
                x1={paddingX}
                y1={medianY}
                x2={width - paddingX}
                y2={medianY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />
            )}

            {/* Area Fill */}
            <path d={areaData} fill="url(#latencyGrad)" />

            {/* Connecting Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#00e575"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Probe Points */}
            {points.map((pt) => (
              <g key={pt.seq}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#080b11"
                  stroke="#00e575"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="600"
                >
                  {pt.duration} ms
                </text>
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                >
                  #{pt.seq}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

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
                Network Timing &amp; Jitter
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Measure round-trip response delays, jitter consistency, and packet loss using RFC 3550 statistical sampling.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Plain-Language Explainer Card */}
      <div className="border border-[#182234] bg-gradient-to-br from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              What is ping / latency &amp; why does it matter?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Latency (often called &quot;ping&quot;)</strong> measures how quickly your network responds. It is the time in milliseconds (ms) it takes for a message to travel from your computer to a remote server and bounce back to you. Unlike download speed (bandwidth), which is like the number of lanes on a freeway, <strong className="text-[#00e575]">ping is the speed limit</strong>. Lower numbers are always better.
            </p>
          </div>
        </div>

        {/* Guide: How to read the numbers */}
        <div className="border-t border-[#182234] pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00e575]">
              <Clock className="w-4 h-4" />
              <span>Median vs. Average</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A single internet hiccup can inflate your average. The <strong className="text-slate-200">median</strong> represents the typical, authentic delay you actually feel during everyday usage.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f59e0b]">
              <Zap className="w-4 h-4" />
              <span>Jitter (Consistency)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Jitter measures how much your ping swings between probes. Low jitter (&lt; 10 ms) means rock-solid stability; high jitter creates stutter in games and robotic voices in calls.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
              <span>Packet Loss</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The percentage of signals that vanished in transit. On any healthy Wi-Fi or wired connection, packet loss should always be <strong className="text-[#00e575]">0%</strong>.
            </p>
          </div>
        </div>

        {/* Collapsible Benchmark Reference Guide */}
        <div className="border-t border-[#182234] pt-3">
          <button
            type="button"
            onClick={() => setShowBenchmarkGuide(!showBenchmarkGuide)}
            className="text-xs text-[#00e575] hover:underline flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showBenchmarkGuide ? "Hide Latency Guide" : "What counts as a good ping? (View Benchmark Guide)"}</span>
          </button>

          {showBenchmarkGuide && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 pt-2">
              <div className="p-3 rounded-lg bg-[#080b11] border border-[#00e575]/30">
                <span className="text-[11px] font-bold text-[#00e575] uppercase block">Under 30 ms</span>
                <span className="text-xs font-bold text-white block mt-0.5">Elite / Esports</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Imperceptible delay. Best-in-class performance for competitive gaming and cloud computing.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080b11] border border-[#38bdf8]/30">
                <span className="text-[11px] font-bold text-[#38bdf8] uppercase block">30 – 60 ms</span>
                <span className="text-xs font-bold text-white block mt-0.5">Great / Responsive</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Very responsive. Great for online gaming, 4K streaming, and HD video conferencing.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080b11] border border-[#f59e0b]/30">
                <span className="text-[11px] font-bold text-[#f59e0b] uppercase block">60 – 120 ms</span>
                <span className="text-xs font-bold text-white block mt-0.5">Normal Browsing</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Typical for cross-country connections. Smooth browsing, though minor delay in fast games.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080b11] border border-[#ef4444]/30">
                <span className="text-[11px] font-bold text-[#ef4444] uppercase block">Over 150 ms</span>
                <span className="text-xs font-bold text-white block mt-0.5">Noticeable Lag</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Noticeable audio pauses during calls, input delay in games, and slower webpage loading.
                </p>
              </div>
            </div>
          )}
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
                placeholder="e.g. google.com or cloudflare.com"
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
                <option value={3} className="bg-[#0d131f] text-white">3 Probes (Quick)</option>
                <option value={4} className="bg-[#0d131f] text-white">4 Probes (Standard)</option>
                <option value={5} className="bg-[#0d131f] text-white">5 Probes (Thorough)</option>
              </select>
            </div>
          </div>

          {/* Quick Target Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Popular Diagnostic Targets:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_TARGETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setTarget(preset.target);
                    handleSubmit(preset.target);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Sequential HTTP probes with SSRF filter and 100ms spacing</span>
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
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${
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

            {/* Plain-Language Rating Summary */}
            <p className="text-xs text-slate-300 leading-relaxed bg-[#080b11] p-3.5 rounded-xl border border-[#182234]">
              {latencyData.ratingSummary}
            </p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Median Latency */}
            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Median Latency
              </span>
              <div className="text-2xl font-black text-[#00e575]">
                {latencyData.medianLatencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">Typical response time</span>
            </div>

            {/* Average Latency */}
            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Average Latency
              </span>
              <div className="text-2xl font-black text-white">
                {latencyData.avgLatencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Min {latencyData.minLatencyMs} / Max {latencyData.maxLatencyMs} ms
              </span>
            </div>

            {/* Jitter */}
            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Jitter (RFC 3550)
              </span>
              <div className="text-2xl font-black text-white">
                {latencyData.jitterMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {latencyData.jitterMs <= 10
                  ? "Stable consistency"
                  : latencyData.jitterMs <= 25
                  ? "Moderate swing"
                  : "High fluctuation"}
              </span>
            </div>

            {/* Packet Loss */}
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

          {/* Activity Readiness Matrix (4 Cards) */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Practical Activity Readiness
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latencyData.activities.map((act) => {
                const icon =
                  act.category === "Gaming" ? (
                    <Gamepad2 className="w-4 h-4" />
                  ) : act.category === "Conferencing" ? (
                    <Video className="w-4 h-4" />
                  ) : act.category === "VoIP" ? (
                    <PhoneCall className="w-4 h-4" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  );

                const badgeColor =
                  act.status === "Optimal"
                    ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/30"
                    : act.status === "Good"
                    ? "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30"
                    : act.status === "Acceptable"
                    ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                    : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30";

                return (
                  <div
                    key={act.name}
                    className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="text-[#00e575]">{icon}</span>
                        <span>{act.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${badgeColor}`}>
                        {act.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {act.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latency Timeline Chart */}
          {renderChart()}

          {/* Individual Probe Breakdown Table */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Individual Probe Breakdown
              </span>
              <span className="text-xs text-slate-400">
                Protocol: HTTP HEAD (Safe SSRF Gateway)
              </span>
            </div>

            <div className="divide-y divide-[#182234] text-xs">
              {latencyData.probes.map((probe) => {
                const maxDuration = latencyData.maxLatencyMs || 1;
                const percentWidth = Math.min(Math.round((probe.durationMs / maxDuration) * 100), 100);

                return (
                  <div
                    key={probe.seq}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121927]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#182234] text-slate-300 flex items-center justify-center font-bold text-[10px]">
                        #{probe.seq}
                      </span>
                      <div>
                        <span className="text-white font-medium">Probe #{probe.seq}</span>
                        <span className="text-[11px] text-slate-500 ml-2">
                          {probe.success ? `HTTP ${probe.status}` : probe.error || "Failed"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Latency Bar */}
                      {probe.success && (
                        <div className="w-24 bg-[#080b11] rounded-full h-1.5 overflow-hidden border border-[#182234] hidden sm:block">
                          <div
                            className="bg-[#00e575] h-full rounded-full"
                            style={{ width: `${percentWidth}%` }}
                          />
                        </div>
                      )}

                      <div>
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
