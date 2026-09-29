"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { PortCheckerData } from "./types";
import { ALLOWED_PORTS } from "./schema";
import {
  ShieldAlert,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Lock,
} from "lucide-react";

export default function PortCheckerTool() {
  const [target, setTarget] = useState("");
  const [port, setPort] = useState(443);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<PortCheckerData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (overrideTarget?: string, overridePort?: number) => {
    const queryTarget = overrideTarget !== undefined ? overrideTarget : target;
    const queryPort = overridePort !== undefined ? overridePort : port;

    if (!queryTarget.trim()) {
      setError("Please enter a target host or domain.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/port-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: queryTarget.trim(),
          port: queryPort,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Port check failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify port reachability.");
    } finally {
      setLoading(false);
    }
  };

  const portData = result?.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Port Reachability Checker
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Service Diagnostic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verify connectivity and reachability on your authorized diagnostic services with strict port allowlisting and SSRF protection.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Hostname or IP
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. your-server.com or cloudflare.com"
                className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Diagnostic Port
              </label>
              <select
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value, 10))}
                className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              >
                {ALLOWED_PORTS.map((p) => (
                  <option key={p.port} value={p.port} className="bg-[#0d131f] text-white">
                    Port {p.port} — {p.service} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Port Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Common Service Ports:
            </span>
            <div className="flex flex-wrap gap-2">
              {[80, 443, 22, 3306, 5432, 8080].map((pNum) => {
                const def = ALLOWED_PORTS.find((p) => p.port === pNum);
                const isSelected = port === pNum;
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPort(pNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#00e575] text-[#080b11]"
                        : "bg-[#080b11] border border-[#182234] text-slate-300 hover:text-white hover:border-[#00e575]/40"
                    }`}
                  >
                    {pNum} ({def?.service})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Strict port allowlisting active per security policy</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-glow disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? "Checking Port..." : "Check Reachability"}</span>
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
      {portData && (
        <div className="space-y-6">
          {/* Main Status Card */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3.5 rounded-2xl border ${
                  portData.status === "open"
                    ? "bg-[#00e575]/10 border-[#00e575]/40 text-[#00e575]"
                    : portData.status === "closed"
                    ? "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]"
                    : "bg-[#f59e0b]/10 border-[#f59e0b]/40 text-[#f59e0b]"
                }`}
              >
                {portData.status === "open" ? (
                  <CheckCircle className="w-7 h-7" />
                ) : portData.status === "closed" ? (
                  <XCircle className="w-7 h-7" />
                ) : (
                  <Clock className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Port {portData.port} — {portData.serviceName}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Target: {portData.target}</span>
                  <span>•</span>
                  <span>IP: {portData.resolvedIp}</span>
                  <span>•</span>
                  <span>Category: {portData.serviceCategory}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
                  portData.status === "open"
                    ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/40"
                    : portData.status === "closed"
                    ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40"
                    : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40"
                }`}
              >
                {portData.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Technical Diagnostics
              </span>

              <div className="divide-y divide-[#182234] text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Protocol</span>
                  <span className="text-white font-medium">TCP</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Response Handshake Time</span>
                  <span className="text-white font-medium">{portData.latencyMs} ms</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Service Description</span>
                  <span className="text-white font-medium">{portData.serviceDescription}</span>
                </div>
              </div>
            </div>

            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-[#00e575]" />
                <span>Security Guidance</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {portData.securityRecommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
