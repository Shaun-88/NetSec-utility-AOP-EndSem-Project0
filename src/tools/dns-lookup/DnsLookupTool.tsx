"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { DnsLookupData } from "./types";
import {
  Search,
  Server,
  Copy,
  Check,
  Globe,
  AlertTriangle,
} from "lucide-react";

const RECORD_TYPES: Array<{ label: string; value: string }> = [
  { label: "All Records", value: "ALL" },
  { label: "A (IPv4)", value: "A" },
  { label: "AAAA (IPv6)", value: "AAAA" },
  { label: "MX (Mail)", value: "MX" },
  { label: "TXT (SPF/DKIM)", value: "TXT" },
  { label: "NS (Name Server)", value: "NS" },
  { label: "CNAME (Alias)", value: "CNAME" },
  { label: "SOA (Authority)", value: "SOA" },
];

const PRESET_DOMAINS = ["cloudflare.com", "google.com", "github.com", "vercel.com"];

export default function DnsLookupTool() {
  const [target, setTarget] = useState("");
  const [recordType, setRecordType] = useState("ALL");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<DnsLookupData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (overrideTarget?: string) => {
    const domainQuery = overrideTarget !== undefined ? overrideTarget : target;
    if (!domainQuery.trim()) {
      setError("Please enter a domain name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/dns-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: domainQuery.trim(),
          recordType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `DNS query failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setActiveTab("ALL");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to query DNS records.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const dnsData = result?.data;

  const displayedRecords =
    dnsData?.allRecords.filter((rec) =>
      activeTab === "ALL" ? true : rec.type === activeTab,
    ) || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                DNS Record Analyzer
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Authoritative Resolver
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Inspect authoritative DNS records including A, AAAA, MX, TXT, NS, CNAME, and SOA zone parameters.
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. cloudflare.com or example.com"
                className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Query Type
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#0d131f] text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
              <span>Presets:</span>
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

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-glow disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Resolving DNS..." : "Lookup Records"}</span>
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
      {dnsData && (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00e575]" />
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  DNS Zone File for
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                {dnsData.domain}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-300">
                Found <strong className="text-[#00e575]">{dnsData.totalRecordsFound}</strong> records
              </span>
            </div>
          </div>

          {/* Record Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#182234]">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === "ALL"
                  ? "bg-[#00e575] text-[#080b11]"
                  : "bg-[#0d131f] text-slate-400 hover:text-white border border-[#182234]"
              }`}
            >
              <span>ALL</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                {dnsData.totalRecordsFound}
              </span>
            </button>

            {dnsData.availableTypes.map((type) => {
              const count = dnsData.recordsByType[type]?.length || 0;
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                    activeTab === type
                      ? "bg-[#00e575] text-[#080b11]"
                      : "bg-[#0d131f] text-slate-400 hover:text-white border border-[#182234]"
                  }`}
                >
                  <span>{type}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Records Table / List */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden divide-y divide-[#182234]">
            {displayedRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No records found for type {activeTab}.
              </div>
            ) : (
              displayedRecords.map((record, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121927]/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider flex-shrink-0 ${
                        record.type === "A"
                          ? "bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30"
                          : record.type === "AAAA"
                          ? "bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30"
                          : record.type === "MX"
                          ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30"
                          : record.type === "TXT"
                          ? "bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {record.type}
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white break-all">
                          {record.value}
                        </span>
                        {record.priority !== undefined && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#182234] text-slate-400">
                            Priority: {record.priority}
                          </span>
                        )}
                      </div>
                      {record.ttl !== undefined && (
                        <span className="text-[10px] text-slate-500 block">
                          TTL: {record.ttl} seconds
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCopy(record.value, idx)}
                      className="p-1.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-400 hover:text-[#00e575] transition-colors"
                      title="Copy Record Value"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-[#00e575]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
