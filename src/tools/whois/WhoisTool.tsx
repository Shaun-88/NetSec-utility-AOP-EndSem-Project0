"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { WhoisOutputData } from "./types";
import {
  Globe,
  Search,
  AlertTriangle,
  Calendar,
  Server,
  Info,
  Building2,
} from "lucide-react";

const PRESET_DOMAINS = ["cloudflare.com", "github.com", "google.com", "mozilla.org"];

function daysBetween(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function ageInDays(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function WhoisTool() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<WhoisOutputData> | null>(null);
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
      const res = await fetch("/api/tools/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: query.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ||
            `WHOIS lookup failed with status ${res.status}`,
        );
      }

      const data = (await res.json()) as ToolResult<WhoisOutputData>;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to perform WHOIS lookup.",
      );
    } finally {
      setLoading(false);
    }
  };

  const whoisData = result?.data;
  const domainAgeDays = ageInDays(whoisData?.registrationDate ?? null);
  const isNewDomain = domainAgeDays !== null && domainAgeDays < 30;
  const daysToExpiry = daysBetween(whoisData?.expiryDate ?? null);
  const isExpiringDomain = daysToExpiry !== null && daysToExpiry < 30;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header / Explainer */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#f59e0b]/40 text-[#f59e0b] flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                WHOIS / Domain Lookup
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30">
                RDAP Protocol
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              <strong>WHOIS / RDAP</strong> shows the public registration record for a domain —
              who registered it, when, and when it expires. A{" "}
              <strong>newly-registered domain</strong> (days old) is a common red flag for phishing
              campaigns. An <strong>expiring domain</strong> may go offline or be hijacked by
              domain squatters who buy it at expiry. This tool uses the modern{" "}
              <strong>RDAP protocol</strong>, which replaces the older plain-text WHOIS system.
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
              Domain Name
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. cloudflare.com or example.org"
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Looking up..." : "WHOIS Lookup"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
            <span className="font-semibold text-slate-300">Quick Presets:</span>
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
      {whoisData && (
        <div className="space-y-5">
          {/* New Domain Alert */}
          {isNewDomain && (
            <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">New domain alert:</strong> This domain was
                registered only <strong className="text-[#ef4444]">{domainAgeDays} day{domainAgeDays !== 1 ? "s" : ""} ago</strong>.
                Newly-registered domains are a common red flag for phishing, brand impersonation,
                and malware campaigns. Treat links from this domain with caution.
              </p>
            </div>
          )}

          {/* Expiry Alert */}
          {isExpiringDomain && daysToExpiry !== null && (
            <div className="p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Domain expiring soon:</strong> This domain expires
                in <strong className="text-[#f59e0b]">{daysToExpiry} day{daysToExpiry !== 1 ? "s" : ""}</strong>.
                If not renewed, the domain may go offline or be acquired by domain squatters.
              </p>
            </div>
          )}

          {/* Summary Header */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
              <Globe className="w-4 h-4 text-[#f59e0b]" />
              <span>Domain Registration Record</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{whoisData.domain}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 flex-wrap">
              <Building2 className="w-3.5 h-3.5" />
              <span>Registrar: <strong className="text-slate-200">{whoisData.registrar}</strong></span>
              {whoisData.registrantCountry && (
                <>
                  <span>•</span>
                  <span>Registrant Country: <strong className="text-slate-200">{whoisData.registrantCountry}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Detail Grid */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00e575]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Registration Details
              </span>
            </div>

            <div className="divide-y divide-[#182234]">
              {[
                {
                  label: "Registered On",
                  value: formatDate(whoisData.registrationDate),
                  sub: domainAgeDays !== null ? `${domainAgeDays.toLocaleString()} days ago` : undefined,
                  alert: isNewDomain,
                },
                {
                  label: "Expires On",
                  value: formatDate(whoisData.expiryDate),
                  sub: daysToExpiry !== null ? `${daysToExpiry.toLocaleString()} days remaining` : undefined,
                  alert: isExpiringDomain,
                },
                {
                  label: "Last Updated",
                  value: formatDate(whoisData.updatedDate),
                  sub: undefined,
                  alert: false,
                },
                {
                  label: "Registrar",
                  value: whoisData.registrar,
                  sub: undefined,
                  alert: false,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-[#121927]/30 transition-colors"
                >
                  <span className="text-slate-400 flex-shrink-0">{row.label}</span>
                  <div className="text-right">
                    <span
                      className={`font-semibold font-sans ${
                        row.alert
                          ? "text-[#f59e0b]"
                          : "text-white"
                      }`}
                    >
                      {row.value}
                    </span>
                    {row.sub && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{row.sub}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Name Servers */}
          {whoisData.nameServers.length > 0 && (
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#00e575]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Authoritative Name Servers ({whoisData.nameServers.length})
                </span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {whoisData.nameServers.map((ns) => (
                  <span
                    key={ns}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-300 font-sans"
                  >
                    {ns}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status Flags */}
          {whoisData.status.length > 0 && (
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Domain Status Flags
                </span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {whoisData.status.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#080b11] border border-[#182234] text-slate-400 font-sans"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
