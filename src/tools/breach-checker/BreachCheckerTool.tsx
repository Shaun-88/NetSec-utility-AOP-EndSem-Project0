"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { BreachCheckerOutputData, BreachEntry } from "./types";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  Lock,
  Info,
  Calendar,
  Users,
  ExternalLink,
  KeyRound,
} from "lucide-react";

const DISCLAIMER =
  "Your email is queried directly over encrypted HTTPS and is never stored, logged, or shared.";

const PRESETS = [
  "multiple-breaches@hibp-integration-tests.com",
  "single-breach@hibp-integration-tests.com",
];

export default function BreachCheckerTool() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<BreachCheckerOutputData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent, customTarget?: string) => {
    e?.preventDefault();
    const emailToQuery = (customTarget ?? target).trim();
    if (!emailToQuery) {
      setError("Please enter an email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/breach-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: emailToQuery }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ||
            `Breach check failed with status ${res.status}`,
        );
      }

      const data = (await res.json()) as ToolResult<BreachCheckerOutputData>;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to check breach status.",
      );
    } finally {
      setLoading(false);
    }
  };

  const breachData = result?.data;
  const isPwned = (breachData?.breachCount ?? 0) > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header / Explainer */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ef4444]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#ef4444]/40 text-[#ef4444] flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Data Breach Checker
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                Breach Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Checks whether your email address has appeared in publicly known data breaches.
              A data breach occurs when cybercriminals unlawfully penetrate a service&apos;s database
              and leak user accounts, passwords, or personal credentials onto the public web.
            </p>
            <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-[#00e575] flex-shrink-0 mt-0.5" />
              <span>{DISCLAIMER}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Query Form */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. yourname@example.com"
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Scanning..." : "Check Breaches"}</span>
              </button>
            </div>
          </div>

          {/* Quick Test Presets */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-500">Test with:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setTarget(preset);
                  handleSubmit(undefined, preset);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#080b11] border border-[#182234] text-slate-400 hover:text-[#00e575] hover:border-[#00e575]/40 transition-colors font-sans truncate max-w-xs"
              >
                {preset}
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
      {breachData && (
        <div className="space-y-5">
          {/* Summary Banner */}
          <div
            className={`border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isPwned
                ? "border-[#ef4444]/30 bg-gradient-to-r from-[#ef4444]/10 via-[#0d131f] to-[#0d131f]"
                : "border-[#00e575]/30 bg-gradient-to-r from-[#00e575]/10 via-[#0d131f] to-[#0d131f]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-xl border ${
                  isPwned
                    ? "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]"
                    : "bg-[#00e575]/15 border-[#00e575]/40 text-[#00e575]"
                }`}
              >
                {isPwned ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <ShieldCheck className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
                  Security Assessment
                </div>
                <h2 className="text-2xl font-black text-white">
                  {isPwned ? "Pwned!" : "All Clear"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isPwned
                    ? `This email appeared in ${breachData.breachCount} known data breach${breachData.breachCount !== 1 ? "es" : ""}.`
                    : "No compromised records were detected for this email address."}
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[#182234] sm:pl-6">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Target Email
              </div>
              <div className="text-sm text-slate-200 font-sans mt-0.5 font-medium break-all">
                {breachData.email}
              </div>
              {breachData.provider && (
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Source: {breachData.provider}
                </div>
              )}
            </div>
          </div>

          {/* Remediation Guidance */}
          {isPwned && (
            <div className="p-5 rounded-2xl bg-[#f59e0b]/5 border border-[#f59e0b]/20 flex items-start gap-3.5">
              <Info className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed space-y-1.5">
                <p className="font-semibold text-white">
                  Recommended Immediate Security Actions:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>
                    <strong>Rotate Compromised Passwords:</strong> Change your password on all breached
                    services immediately, especially if you reused this password on other accounts.
                  </li>
                  <li>
                    <strong>Enable Multi-Factor Authentication (2FA):</strong> Add hardware keys or
                    authenticator apps (Google Authenticator, Bitwarden) to protect your critical services.
                  </li>
                  <li>
                    <strong>Use a Password Manager:</strong> Generate unique, random 20+ character
                    passwords for every site so a single breach cannot compromise your other logins.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Breach Cards List */}
          {breachData.breaches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Detailed Breach Records ({breachData.breaches.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {breachData.breaches.map((breach: BreachEntry, idx: number) => (
                  <div
                    key={`${breach.name}-${idx}`}
                    className="border border-[#182234] bg-[#0d131f] rounded-2xl p-5 space-y-4 hover:border-[#1e2d42] transition-colors"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182234] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#080b11] border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] font-bold text-sm flex-shrink-0">
                          {breach.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white">
                              {breach.name}
                            </h4>
                            {breach.domain && (
                              <a
                                href={`https://${breach.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-400 hover:text-[#00e575] flex items-center gap-1 transition-colors"
                              >
                                <span>{breach.domain}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {breach.breachDate && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>Breached: {breach.breachDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {breach.pwnCount && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 sm:text-right">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{breach.pwnCount.toLocaleString()} accounts</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {breach.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {breach.description}
                      </p>
                    )}

                    {/* Exposed Data Classes */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                        <KeyRound className="w-3 h-3" />
                        <span>Compromised Data Attributes:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {breach.dataClasses.map((cls) => {
                          const isPass = /password/i.test(cls);
                          return (
                            <span
                              key={cls}
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                                isPass
                                  ? "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444] font-semibold"
                                  : "bg-[#182234] border-[#223249] text-slate-300"
                              }`}
                            >
                              {cls}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
