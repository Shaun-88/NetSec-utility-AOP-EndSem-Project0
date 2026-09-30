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
  Lock,
  EyeOff,
  Code2,
  HelpCircle,
} from "lucide-react";

interface PresetDomain {
  domain: string;
  label: string;
  expectedTier: string;
}

const PRESET_DOMAINS: PresetDomain[] = [
  { domain: "github.com", label: "GitHub", expectedTier: "Hardened (A+)" },
  { domain: "cloudflare.com", label: "Cloudflare", expectedTier: "Hardened (A+)" },
  { domain: "mozilla.org", label: "Mozilla", expectedTier: "Strict (A+)" },
  { domain: "example.com", label: "Example.com", expectedTier: "Baseline (F)" },
];

export default function SecurityHeadersTool() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<SecurityHeadersOutputData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSubmit = async (overrideTarget?: string) => {
    const queryTarget = overrideTarget !== undefined ? overrideTarget : target;
    if (!queryTarget.trim()) {
      setError("Please enter a domain or website URL.");
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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const auditData = result?.data;

  const gradeColor =
    auditData?.grade === "A+" || auditData?.grade === "A"
      ? "text-[#00e575] bg-[#00e575]/10 border-[#00e575]/40 shadow-glow"
      : auditData?.grade === "B"
      ? "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/40"
      : auditData?.grade === "C"
      ? "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40"
      : "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/40";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Plain-Language Explainer Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00e575]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  HTTP Security Header Analyzer
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                  SSRF-Hardened
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  OWASP Best Practice
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Analyze and grade website HTTP response headers to verify defenses against cross-site scripting (XSS), clickjacking, and eavesdropping.
              </p>
            </div>
          </div>
        </div>

        {/* Educational Explainer Cards */}
        <div className="mt-5 pt-5 border-t border-[#182234]/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#00e575]" />
              The Browser Guardrails
            </span>
            <p className="text-slate-400 leading-relaxed">
              Security headers are direct safety instructions a website sends to a visitor&apos;s browser — telling it to block unauthorized scripts, enforce encrypted connections, and reject hidden frame overlays.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-[#f59e0b]" />
              Threats Defended
            </span>
            <p className="text-slate-400 leading-relaxed">
              Stops Cross-Site Scripting (XSS), Clickjacking (invisible iframe traps), Man-in-the-Middle Wi-Fi downgrades, and browser MIME-type confusion attacks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              How to Read Your Grade
            </span>
            <p className="text-slate-400 leading-relaxed">
              <span className="text-[#00e575] font-semibold">A+/A</span> indicates modern hardened protection. <span className="text-sky-400 font-semibold">B</span> has minor gaps. <span className="text-[#f59e0b] font-semibold">C</span> lacks key defenses. <span className="text-[#ef4444] font-semibold">D/F</span> leaves visitors exposed.
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
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Auditing Headers..." : "Analyze Headers"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
            <span className="font-semibold text-slate-300">Quick Benchmarks:</span>
            {PRESET_DOMAINS.map((item) => (
              <button
                key={item.domain}
                type="button"
                onClick={() => {
                  setTarget(item.domain);
                  handleSubmit(item.domain);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-500">({item.expectedTier})</span>
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
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <Globe className="w-4 h-4 text-[#00e575]" />
                <span>Audited Endpoint Posture</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight break-all">
                {auditData.targetUrl}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#080b11] border border-[#182234] text-slate-300">
                  HTTP {auditData.statusCode}
                </span>
                <span>•</span>
                <span className="truncate max-w-md">Final URL: {auditData.finalUrl}</span>
              </div>
            </div>

            <div className="flex items-center gap-5 sm:self-center">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Posture Score
                </div>
                <div className="text-3xl font-black text-white">
                  {auditData.score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </div>
              </div>

              <div
                className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center font-black ${gradeColor}`}
              >
                <span className="text-3xl leading-none">{auditData.grade}</span>
                <span className="text-[10px] tracking-wider uppercase mt-1 opacity-80">Grade</span>
              </div>
            </div>
          </div>

          {/* Audited Security Headers List */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00e575]" />
                Security Headers Audit Checklist
              </span>
              <span className="text-xs text-slate-400">
                {auditData.auditedHeaders.filter((h) => h.status === "pass").length} of{" "}
                {auditData.auditedHeaders.length} Configured Properly
              </span>
            </div>

            <div className="divide-y divide-[#182234]">
              {auditData.auditedHeaders.map((item) => (
                <div key={item.header} className="p-5 space-y-3 hover:bg-[#121927]/30 transition-colors">
                  <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      {item.status === "pass" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00e575] flex-shrink-0" />
                      ) : item.status === "warn" ? (
                        <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{item.header}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#182234] text-slate-300 font-semibold">
                          {item.importance} Priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-400">
                        {item.pointsEarned} / {item.pointsPossible} pts
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
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

                  <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                    {item.recommendation}
                  </p>

                  {/* Current Active Value */}
                  {item.value && (
                    <div className="pl-7 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Active Header Received:
                      </span>
                      <div className="p-2.5 rounded-xl bg-[#080b11] border border-[#182234] text-[11px] text-slate-300 font-sans break-all select-all">
                        {item.value}
                      </div>
                    </div>
                  )}

                  {/* Remediation Guidance Snippet */}
                  {item.status !== "pass" && item.remediationExample && (
                    <div className="pl-7 pt-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Code2 className="w-3 h-3 text-[#00e575]" />
                          Suggested Remediation Directive:
                        </span>
                        <button
                          onClick={() => handleCopy(item.remediationExample || "", item.header)}
                          className="text-[11px] text-[#00e575] hover:underline flex items-center gap-1 transition-colors"
                        >
                          {copiedKey === item.header ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Directive</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#080b11] border border-[#00e575]/20 text-[11px] text-emerald-300 font-sans break-all select-all">
                        {item.remediationExample}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Leaked Information Headers Card */}
          {auditData.leakedInfoHeaders.length > 0 && (
            <div className="border border-[#f59e0b]/30 bg-[#f59e0b]/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Information Disclosure Headers Detected (-{auditData.leakedInfoHeaders.length * 5} pts)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The server response leaks backend software or framework versions. Attackers and automated vulnerability scanners use this data to target known CVEs against specific software releases.
              </p>
              <div className="divide-y divide-[#f59e0b]/20 pt-1 text-xs">
                {auditData.leakedInfoHeaders.map((l) => (
                  <div key={l.header} className="py-2 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-slate-300 font-semibold">{l.header}:</span>
                    <span className="text-white px-2.5 py-0.5 rounded bg-[#080b11] border border-[#f59e0b]/30 font-sans">
                      {l.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Remediation: Disable in your web server config (e.g. Nginx: <span className="text-white">server_tokens off;</span> or Express: <span className="text-white">app.disable(&apos;x-powered-by&apos;);</span>).
              </p>
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
                    onClick={() => handleCopy(JSON.stringify(auditData.rawHeaders, null, 2), "raw-headers")}
                    className="text-xs text-[#00e575] hover:underline flex items-center gap-1.5"
                  >
                    {copiedKey === "raw-headers" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "raw-headers" ? "Copied JSON" : "Copy Headers JSON"}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-200 overflow-x-auto font-sans leading-relaxed">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(auditData.rawHeaders, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
