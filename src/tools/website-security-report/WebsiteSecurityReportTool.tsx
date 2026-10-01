"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { WebsiteSecurityReportData, SubToolResult } from "./types";
import type { TlsCheckerOutputData } from "@/tools/tls-checker/types";
import type { SecurityHeadersOutputData } from "@/tools/security-headers/types";
import type { WhoisOutputData } from "@/tools/whois/types";
import type { DnsLookupData } from "@/tools/dns-lookup/types";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  Globe,
  Lock,
  Server,
  ChevronDown,
  ChevronUp,
  XCircle,
  CheckCircle2,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "text-[#00e575] bg-[#00e575]/10 border-[#00e575]/40 shadow-glow";
  if (grade === "B") return "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/40";
  if (grade === "C") return "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40";
  return "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/40";
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return dateStr; }
}

// ── Sub-section component ────────────────────────────────────────────────────

interface SubSectionProps {
  title: string;
  icon: React.ReactNode;
  subResult: SubToolResult;
  children: (data: unknown) => React.ReactNode;
}

function SubSection({ title, icon, subResult, children }: SubSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 flex items-center justify-between gap-4 hover:bg-[#121927]/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#080b11] border border-[#182234] text-[#00e575] flex-shrink-0">
            {icon}
          </div>
          <div>
            <span className="text-sm font-bold text-white">{title}</span>
            {!subResult.success && (
              <div className="flex items-center gap-1 text-[11px] text-[#ef4444] mt-0.5">
                <XCircle className="w-3 h-3" />
                <span>Failed</span>
              </div>
            )}
            {subResult.success && (
              <div className="flex items-center gap-1 text-[11px] text-[#00e575] mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-[#182234] p-4">
          {!subResult.success ? (
            <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{subResult.error ?? "This check failed or was unavailable."}</span>
            </div>
          ) : (
            children(subResult.data)
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-section renderers ─────────────────────────────────────────────────────

function DnsSubContent(data: unknown) {
  const d = data as DnsLookupData | undefined;
  if (!d) return <p className="text-xs text-slate-400">No data.</p>;
  return (
    <div className="text-xs text-slate-300 space-y-1">
      <p>Domain: <strong className="text-white">{d.domain}</strong></p>
      <p>Total records: <strong className="text-[#00e575]">{d.totalRecordsFound}</strong> across {d.availableTypes.join(", ")}</p>
    </div>
  );
}

function TlsSubContent(data: unknown) {
  const d = data as TlsCheckerOutputData | undefined;
  if (!d) return <p className="text-xs text-slate-400">No data.</p>;
  const color = d.isExpired ? "text-[#ef4444]" : d.isExpiringSoon ? "text-[#f59e0b]" : "text-[#00e575]";
  return (
    <div className="text-xs text-slate-300 space-y-1.5">
      <p>Issuer: <strong className="text-white">{d.issuer.CN}</strong></p>
      <p>Protocol: <strong className="text-white">{d.protocol}</strong></p>
      <p>Expires: <strong className="text-white">{formatDate(d.validTo)}</strong> —{" "}
        <span className={`font-bold ${color}`}>
          {d.isExpired ? "EXPIRED" : `${d.daysUntilExpiry} days remaining`}
        </span>
      </p>
    </div>
  );
}

function HeadersSubContent(data: unknown) {
  const d = data as SecurityHeadersOutputData | undefined;
  if (!d) return <p className="text-xs text-slate-400">No data.</p>;
  const gc = gradeColor(d.grade);
  return (
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-black text-xl ${gc}`}>
        {d.grade}
      </div>
      <div className="text-xs text-slate-300 space-y-1">
        <p>Score: <strong className="text-white">{d.score} / 100</strong></p>
        <p>{d.auditedHeaders.filter(h => h.status === "pass").length} of {d.auditedHeaders.length} headers properly configured</p>
      </div>
    </div>
  );
}

function WhoisSubContent(data: unknown) {
  const d = data as WhoisOutputData | undefined;
  if (!d) return <p className="text-xs text-slate-400">No data.</p>;
  return (
    <div className="text-xs text-slate-300 space-y-1">
      <p>Registrar: <strong className="text-white">{d.registrar}</strong></p>
      <p>Registered: <strong className="text-white">{formatDate(d.registrationDate)}</strong></p>
      <p>Expires: <strong className="text-white">{formatDate(d.expiryDate)}</strong></p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WebsiteSecurityReportTool() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<WebsiteSecurityReportData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (overrideTarget?: string) => {
    const query = overrideTarget !== undefined ? overrideTarget : target;
    if (!query.trim()) {
      setError("Please enter a domain name.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/website-security-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: query.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ||
            `Report failed with status ${res.status}`,
        );
      }

      const data = (await res.json()) as ToolResult<WebsiteSecurityReportData>;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate security report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const reportData = result?.data;
  const gc = reportData ? gradeColor(reportData.grade) : "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00e575]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Website Security Report
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                4-in-1 Audit
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Parallel Execution
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Runs four checks <strong>simultaneously</strong> against a single domain: DNS records,
              TLS certificate validity, HTTP security headers, and domain registration age. The result
              is one combined <strong>letter grade</strong> — a fast way to assess your site&apos;s
              overall security posture without running each tool manually.
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
              Domain Name or URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. github.com or https://cloudflare.com"
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Running 4 checks..." : "Run Security Report"}</span>
              </button>
            </div>
          </div>

          {loading && (
            <div className="p-3 rounded-xl bg-[#00e575]/5 border border-[#00e575]/20 text-xs text-[#00e575] flex items-center gap-2">
              <div className="w-3 h-3 border border-[#00e575] border-t-transparent rounded-full animate-spin" />
              <span>Running DNS, TLS, Security Headers, and WHOIS checks in parallel…</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {reportData && (
        <div className="space-y-5">
          {/* Grade Banner */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <Globe className="w-4 h-4 text-[#00e575]" />
                <span>Security Posture for</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {reportData.domain}
              </h2>
              <p className="text-xs text-slate-400">
                Report generated at {new Date(reportData.ranAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-5 sm:self-center">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Security Score
                </div>
                <div className="text-3xl font-black text-white">
                  {reportData.score}
                  <span className="text-xs text-slate-500 font-normal"> / 100</span>
                </div>
              </div>
              <div
                className={`w-24 h-24 rounded-2xl border flex flex-col items-center justify-center font-black ${gc}`}
              >
                <span className="text-3xl leading-none">{reportData.grade}</span>
                <span className="text-[10px] tracking-wider uppercase mt-1 opacity-80">
                  Grade
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Sub-Sections */}
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
              Expand each check for details
            </p>

            <SubSection
              title="DNS Records"
              icon={<Server className="w-4 h-4" />}
              subResult={reportData.subResults.dns}
            >
              {DnsSubContent}
            </SubSection>

            <SubSection
              title="TLS Certificate"
              icon={<Lock className="w-4 h-4" />}
              subResult={reportData.subResults.tls}
            >
              {TlsSubContent}
            </SubSection>

            <SubSection
              title="Security Headers"
              icon={<ShieldCheck className="w-4 h-4" />}
              subResult={reportData.subResults.headers}
            >
              {HeadersSubContent}
            </SubSection>

            <SubSection
              title="WHOIS / Domain Registration"
              icon={<Globe className="w-4 h-4" />}
              subResult={reportData.subResults.whois}
            >
              {WhoisSubContent}
            </SubSection>
          </div>
        </div>
      )}
    </div>
  );
}
