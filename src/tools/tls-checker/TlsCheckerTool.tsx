"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { TlsCheckerOutputData } from "./types";
import {
  Lock,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
  Calendar,
  Shield,
  Info,
} from "lucide-react";

const PRESET_DOMAINS = ["github.com", "cloudflare.com", "google.com", "expired.badssl.com"];

export default function TlsCheckerTool() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<TlsCheckerOutputData> | null>(null);
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
      const res = await fetch("/api/tools/tls-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: query.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ||
            `TLS check failed with status ${res.status}`,
        );
      }

      const data = (await res.json()) as ToolResult<TlsCheckerOutputData>;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check TLS certificate.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cert = result?.data;

  const expiryColor = cert?.isExpired
    ? "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/40"
    : cert?.isExpiringSoon
    ? "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40"
    : "text-[#00e575] bg-[#00e575]/10 border-[#00e575]/40";

  const expiryIcon = cert?.isExpired ? (
    <XCircle className="w-5 h-5 text-[#ef4444]" />
  ) : cert?.isExpiringSoon ? (
    <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
  ) : (
    <CheckCircle2 className="w-5 h-5 text-[#00e575]" />
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header / Explainer */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00e575]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                TLS/SSL Certificate Checker
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                SSRF-Hardened
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              <strong>What is a TLS certificate?</strong> Think of it as an official ID card for a
              website. It proves the website is who it claims to be and encrypts your connection so
              no one can eavesdrop on your data in transit. An <strong>expired certificate</strong>{" "}
              breaks HTTPS for all visitors, shows browser warnings, and signals poor site
              maintenance. Certificates expiring soon need immediate renewal.
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
              Domain Name (no https://)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. github.com or cloudflare.com"
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Connecting..." : "Check Certificate"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
            <span className="font-semibold text-slate-300">Quick Benchmarks:</span>
            {PRESET_DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => {
                  setTarget(domain);
                  handleSubmit(domain);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white transition-colors"
              >
                {domain}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {cert && (
        <div className="space-y-5">
          {/* Summary Banner */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <Globe className="w-4 h-4 text-[#00e575]" />
                <span>TLS Certificate for</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{cert.domain}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#080b11] border border-[#182234] text-slate-300">
                  {cert.protocol}
                </span>
                <span>•</span>
                <span>Issued by {cert.issuer.CN}</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${expiryColor}`}
            >
              {expiryIcon}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {cert.isExpired
                    ? "Expired"
                    : cert.isExpiringSoon
                    ? "Expiring Soon"
                    : "Valid"}
                </div>
                <div className="text-2xl font-black leading-none mt-0.5">
                  {cert.isExpired
                    ? `${Math.abs(cert.daysUntilExpiry)}d ago`
                    : `${cert.daysUntilExpiry}d`}
                </div>
                {!cert.isExpired && (
                  <div className="text-[10px] opacity-70 mt-0.5">days remaining</div>
                )}
              </div>
            </div>
          </div>

          {/* Expired Warning */}
          {cert.isExpired && (
            <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-3">
              <XCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">This certificate is expired.</strong> All visitors
                will see a browser security warning. HTTPS is effectively broken. Renew
                immediately via your hosting provider or Let&apos;s Encrypt.
              </p>
            </div>
          )}

          {/* Expiring Soon Warning */}
          {cert.isExpiringSoon && !cert.isExpired && (
            <div className="p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Certificate expiring in {cert.daysUntilExpiry} days.</strong>{" "}
                Schedule renewal now to prevent downtime. Most CAs send renewal reminders at 30 days.
              </p>
            </div>
          )}

          {/* Certificate Detail Card */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00e575]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Certificate Details
              </span>
            </div>

            <div className="divide-y divide-[#182234]">
              {[
                {
                  label: "Subject (Common Name)",
                  value: cert.subject.CN,
                  icon: <Globe className="w-3.5 h-3.5 text-[#00e575]" />,
                },
                cert.subject.O
                  ? { label: "Subject Organisation", value: cert.subject.O, icon: null }
                  : null,
                {
                  label: "Issuer",
                  value: cert.issuer.CN,
                  icon: <Shield className="w-3.5 h-3.5 text-sky-400" />,
                },
                cert.issuer.O
                  ? { label: "Issuer Organisation", value: cert.issuer.O, icon: null }
                  : null,
                {
                  label: "Valid From",
                  value: new Date(cert.validFrom).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }),
                  icon: <Calendar className="w-3.5 h-3.5 text-slate-400" />,
                },
                {
                  label: "Valid Until",
                  value: new Date(cert.validTo).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }),
                  icon: <Calendar className="w-3.5 h-3.5 text-slate-400" />,
                },
                {
                  label: "Protocol",
                  value: cert.protocol,
                  icon: <Lock className="w-3.5 h-3.5 text-[#00e575]" />,
                },
                cert.serialNumber
                  ? {
                      label: "Serial Number",
                      value: cert.serialNumber,
                      icon: null,
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((row) => {
                  if (!row) return null;
                  return (
                    <div
                      key={row.label}
                      className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#121927]/30 transition-colors"
                    >
                      <span className="text-slate-400 flex items-center gap-1.5 flex-shrink-0">
                        {row.icon}
                        {row.label}
                      </span>
                      <span className="text-white font-semibold text-right break-all font-sans">
                        {row.value}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Protocol Info Card */}
          <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] flex items-start gap-3">
            <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">TLS 1.3</strong> is the gold standard — faster
              and more secure than TLS 1.2.{" "}
              <strong className="text-slate-300">TLS 1.2</strong> is still acceptable but lacks
              TLS 1.3&apos;s improved cipher suite restrictions. TLS 1.0 and 1.1 are deprecated and
              indicate an outdated server configuration.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
