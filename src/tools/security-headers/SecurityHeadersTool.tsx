"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { SecurityHeadersOutputData } from "./types";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PRESET_DOMAINS = ["github.com", "cloudflare.com", "google.com", "mozilla.org"];

export default function SecurityHeadersTool() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<SecurityHeadersOutputData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const handleSubmit = async (overrideTarget?: string) => {
    const queryTarget = overrideTarget !== undefined ? overrideTarget : target;
    if (!queryTarget.trim()) {
      setError("Please enter a domain or URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/security-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: queryTarget.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Header audit failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to audit security headers.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRaw = () => {
    if (!result?.data?.rawHeaders) return;
    navigator.clipboard.writeText(JSON.stringify(result.data.rawHeaders, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 1500);
  };

  const auditData = result?.data;

  const gradeColor =
    auditData?.grade === "A+" || auditData?.grade === "A"
      ? "text-[#00e575] bg-[#00e575]/10 border-[#00e575]/40"
      : auditData?.grade === "B"
      ? "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/40"
      : auditData?.grade === "C"
      ? "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40"
      : "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/40";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                HTTP Security Header Analyzer
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                SSRF-Hardened Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Audit and grade HTTP response headers for Content-Security-Policy (CSP), HSTS, X-Frame-Options, and information leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Query Form */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Website URL or Domain Name
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. github.com or https://example.com"
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Auditing Headers..." : "Analyze Headers"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
            <span>Quick Benchmarks:</span>
            {PRESET_DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => {
                  setTarget(domain);
                  handleSubmit(domain);
                }}
                className="px-2.5 py-1 rounded-md bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white transition-colors"
              >
                {domain}
              </button>
            ))}
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
      {auditData && (
        <div className="space-y-6">
          {/* Main Grade Banner */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <Globe className="w-4 h-4 text-[#00e575]" />
                <span>Security Posture Rating</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {auditData.targetUrl}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Status: HTTP {auditData.statusCode}</span>
                <span>•</span>
                <span>Final URL: {auditData.finalUrl}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Score
                </div>
                <div className="text-2xl font-black text-white">
                  {auditData.score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </div>
              </div>

              <div
                className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl font-black shadow-glow ${gradeColor}`}
              >
                {auditData.grade}
              </div>
            </div>
          </div>

          {/* Audited Security Headers List */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Security Headers Audit Checklist
              </span>
              <span className="text-xs text-slate-400">
                {auditData.auditedHeaders.filter((h) => h.status === "pass").length} of{" "}
                {auditData.auditedHeaders.length} Configured
              </span>
            </div>

            <div className="divide-y divide-[#182234]">
              {auditData.auditedHeaders.map((item) => (
                <div key={item.header} className="p-5 space-y-2 hover:bg-[#121927]/30 transition-colors">
                  <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      {item.status === "pass" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00e575] flex-shrink-0" />
                      ) : item.status === "warn" ? (
                        <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-sm font-bold text-white">{item.header}</span>
                        <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-[#182234] text-slate-300">
                          {item.importance} Priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-400">
                        {item.pointsEarned} / {item.pointsPossible} pts
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "pass"
                            ? "bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30"
                            : item.status === "warn"
                            ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30"
                            : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 pl-7">{item.recommendation}</p>

                  {item.value && (
                    <div className="pl-7 pt-1">
                      <div className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-[11px] text-slate-400 font-sans break-all">
                        {item.value}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Leaked Information Headers Card */}
          {auditData.leakedInfoHeaders.length > 0 && (
            <div className="border border-[#f59e0b]/30 bg-[#f59e0b]/10 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Information Disclosure Headers Detected</span>
              </div>
              <p className="text-xs text-slate-300">
                The server response leaks server software or backend framework versions. Consider disabling or stripping these in your reverse proxy:
              </p>
              <div className="divide-y divide-[#f59e0b]/20 pt-1 text-xs">
                {auditData.leakedInfoHeaders.map((l) => (
                  <div key={l.header} className="py-1.5 flex justify-between">
                    <span className="text-slate-400 font-semibold">{l.header}:</span>
                    <span className="text-white font-mono">{l.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Raw Response Headers */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <span>Inspect All Raw Response Headers ({Object.keys(auditData.rawHeaders).length})</span>
              {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showRaw && (
              <div className="p-4 border-t border-[#182234] space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={handleCopyRaw}
                    className="text-xs text-[#00e575] hover:underline flex items-center gap-1"
                  >
                    {copiedRaw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRaw ? "Copied" : "Copy Headers JSON"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-200 overflow-x-auto font-sans leading-relaxed">
                  {JSON.stringify(auditData.rawHeaders, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
