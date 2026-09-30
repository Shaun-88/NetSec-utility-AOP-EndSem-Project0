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
  Server,
  Network,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function PortCheckerTool() {
  const [target, setTarget] = useState("");
  const [port, setPort] = useState(443);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<PortCheckerData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Directory filter state
  const [directoryFilter, setDirectoryFilter] = useState<string>("All");
  const [showDirectory, setShowDirectory] = useState<boolean>(false);

  const selectedPortDef = ALLOWED_PORTS.find((p) => p.port === port) || ALLOWED_PORTS[7]; // default 443

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

  // Filtered port directory list
  const filteredPorts =
    directoryFilter === "All"
      ? ALLOWED_PORTS
      : ALLOWED_PORTS.filter((p) => p.category === directoryFilter);

  const categories = ["All", "Web", "Remote Access", "Mail", "Database", "Infrastructure"];

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
              Verify external connectivity to common network services with strict port allowlisting and SSRF protection.
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
              What is a network port & why check it?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Think of an <strong className="text-white">IP address</strong> as an apartment building&apos;s street address, and <strong className="text-white">ports</strong> as the specific numbered doors inside. Every internet service listens behind a standard door number: <strong className="text-[#00e575]">Port 80 and 443</strong> welcome web visitors, <strong className="text-[#00e575]">Port 22</strong> allows server administrators to log in remotely, <strong className="text-[#00e575]">Port 25</strong> handles emails, and <strong className="text-[#00e575]">Port 3306</strong> houses database records.
            </p>
          </div>
        </div>

        {/* Actionable Guide: What to actually do with this */}
        <div className="border-t border-[#182234] pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00e575]">
              <Server className="w-4 h-4" />
              <span>Confirm Server Reachability</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verify that a web server, VPN, or home-lab service you set up is reachable by the public internet through your router&apos;s port forwarding.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f59e0b]">
              <Network className="w-4 h-4" />
              <span>Verify Firewall Rules</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Test whether cloud security groups (AWS, DigitalOcean, Azure) or local firewalls (UFW) have correctly opened or blocked incoming traffic.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-[#00e575]" />
              <span>Audit Accidental Exposure</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ensure sensitive internal services (like database ports 3306 or 5432) are safely filtered or closed rather than openly exposed to attackers.
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Target Hostname or IP
                </label>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>Quick test:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTarget("cloudflare.com");
                      setPort(443);
                    }}
                    className="text-[#00e575] hover:underline"
                  >
                    cloudflare.com
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTarget("google.com");
                      setPort(80);
                    }}
                    className="text-[#00e575] hover:underline"
                  >
                    google.com
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. your-server.com or 1.1.1.1"
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
              Quick Port Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { pNum: 80, label: "Web HTTP" },
                { pNum: 443, label: "Web HTTPS" },
                { pNum: 22, label: "SSH Remote" },
                { pNum: 25, label: "SMTP Mail" },
                { pNum: 587, label: "Mail Submit" },
                { pNum: 993, label: "IMAP Secure" },
                { pNum: 3306, label: "MySQL DB" },
                { pNum: 5432, label: "Postgres DB" },
                { pNum: 8080, label: "Alt Web" },
              ].map(({ pNum, label }) => {
                const isSelected = port === pNum;
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPort(pNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#00e575] text-[#080b11] shadow-glow"
                        : "bg-[#080b11] border border-[#182234] text-slate-300 hover:text-white hover:border-[#00e575]/40"
                    }`}
                  >
                    Port {pNum} ({label})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-Time Selected Port Explanation Card */}
          <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Port {selectedPortDef.port} — {selectedPortDef.service}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedPortDef.category}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {selectedPortDef.description}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="text-[#00e575] font-semibold">What it does: </span>
              {selectedPortDef.plainExplanation}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-[#f59e0b] font-semibold">Why test this: </span>
              {selectedPortDef.useCase}
            </p>
            {selectedPortDef.securityNote && (
              <div className="pt-1 flex items-start gap-1.5 text-[11px] text-amber-400/90">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{selectedPortDef.securityNote}</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Strict 16-port allowlist active per security policy</span>
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
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Port {portData.port} — {portData.serviceName}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Target: <span className="text-white">{portData.target}</span></span>
                    <span>•</span>
                    <span>Resolved IP: <span className="text-white">{portData.resolvedIp}</span></span>
                    <span>•</span>
                    <span>Category: <span className="text-white">{portData.serviceCategory}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${
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

            {/* Plain-Language Status Explanation Banner */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                portData.status === "open"
                  ? "bg-[#00e575]/5 border-[#00e575]/20 text-slate-200"
                  : portData.status === "closed"
                  ? "bg-[#ef4444]/5 border-[#ef4444]/20 text-slate-200"
                  : "bg-[#f59e0b]/5 border-[#f59e0b]/20 text-slate-200"
              }`}
            >
              <strong className="text-white">Diagnostic Outcome: </strong>
              {portData.statusMeaning}
            </div>
          </div>

          {/* Technical Diagnostics & Security Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Diagnostics */}
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
                  <span className="text-slate-400">Service Role</span>
                  <span className="text-white font-medium">{portData.serviceDescription}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Target Resolved To</span>
                  <span className="text-white font-medium">{portData.resolvedIp}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Tested At</span>
                  <span className="text-slate-300 font-medium">
                    {new Date(portData.checkedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Guidance */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-[#00e575]" />
                <span>Security Guidance</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#080b11] p-3.5 rounded-xl border border-[#182234]">
                {portData.securityRecommendation}
              </p>
              <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                <p>
                  <strong className="text-slate-300">Service Purpose: </strong>
                  {portData.plainExplanation}
                </p>
                <p>
                  <strong className="text-slate-300">Primary Use Case: </strong>
                  {portData.useCase}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allow-Listed Ports Reference Directory (Collapsible) */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDirectory(!showDirectory)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-[#182234]/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#080b11] border border-[#182234] text-[#00e575]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Allowed Diagnostic Ports Directory ({ALLOWED_PORTS.length} Supported Ports)
              </h2>
              <p className="text-xs text-slate-400">
                Browse plain-language explanations and common use cases for all supported ports.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{showDirectory ? "Hide Reference" : "View Reference"}</span>
            {showDirectory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDirectory && (
          <div className="p-5 border-t border-[#182234] space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDirectoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    directoryFilter === cat
                      ? "bg-[#00e575] text-[#080b11]"
                      : "bg-[#080b11] border border-[#182234] text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Port Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {filteredPorts.map((p) => {
                const isSelected = port === p.port;
                return (
                  <div
                    key={p.port}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-[#080b11] border-[#00e575]/50 ring-1 ring-[#00e575]/50"
                        : "bg-[#080b11] border-[#182234] hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          Port {p.port}
                        </span>
                        <span className="text-xs font-semibold text-[#00e575]">
                          {p.service}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182234] text-slate-300">
                        {p.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {p.plainExplanation}
                    </p>

                    <div className="text-[11px] text-slate-400 mb-3">
                      <strong className="text-slate-300">Use Case: </strong>
                      {p.useCase}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPort(p.port);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs text-[#00e575] hover:text-[#00c864] font-semibold flex items-center gap-1 group"
                    >
                      <span>Select Port {p.port} for Test</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
