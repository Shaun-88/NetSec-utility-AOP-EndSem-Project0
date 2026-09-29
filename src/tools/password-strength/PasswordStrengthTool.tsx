"use client";

import React, { useState, useEffect } from "react";
import { computePasswordStrength } from "./compute";
import { passwordStrengthInputSchema } from "./schema";
import type { PasswordStrengthData } from "./types";
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Clock,
  Cpu,
  Globe,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function PasswordStrengthTool() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<PasswordStrengthData | null>(null);

  useEffect(() => {
    const parse = passwordStrengthInputSchema.safeParse({ password });
    if (parse.success) {
      setResult(computePasswordStrength(parse.data));
    }
  }, [password]);

  const strengthColor =
    !result || result.score < 25
      ? "text-[#ef4444] bg-[#ef4444]"
      : result.score < 50
      ? "text-[#f59e0b] bg-[#f59e0b]"
      : result.score < 75
      ? "text-[#38bdf8] bg-[#38bdf8]"
      : "text-[#00e575] bg-[#00e575]";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Password Strength &amp; Entropy Auditor
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Client-Side Pure Logic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluate Shannon password entropy, pattern heuristics, dictionary vulnerabilities, and estimated brute-force crack times.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Enter Password to Audit
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type or paste password..."
              className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Strength Meter Bar */}
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">
                Audited Resilience Score
              </span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{result.score}/100</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    result.rating === "Very Strong"
                      ? "bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30"
                      : result.rating === "Strong"
                      ? "bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30"
                      : result.rating === "Moderate"
                      ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30"
                      : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30"
                  }`}
                >
                  {result.rating}
                </span>
              </span>
            </div>

            <div className="h-2 w-full bg-[#080b11] rounded-full overflow-hidden border border-[#182234]">
              <div
                className={`h-full transition-all duration-300 ${strengthColor.split(" ")[1]}`}
                style={{ width: `${Math.max(4, result.score)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Analysis */}
      {result && password.length > 0 && (
        <div className="space-y-6">
          {/* Estimated Crack Times Grid */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#00e575]" />
              <span>Estimated Brute-Force Crack Times</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Online Web Attack</span>
                </div>
                <div className="text-lg font-bold text-white truncate">
                  {result.crackTimes.onlineAttack}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  ~100 guesses/sec (rate limited)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Offline GPU Rig</span>
                </div>
                <div className="text-lg font-bold text-white truncate">
                  {result.crackTimes.offlineFastHash}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  ~10 Billion guesses/sec
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-[#00e575]" />
                  <span>Supercomputer Cluster</span>
                </div>
                <div className="text-lg font-bold text-white truncate">
                  {result.crackTimes.nationStateSupercomputer}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  ~10 Trillion guesses/sec
                </span>
              </div>
            </div>
          </div>

          {/* Checklist & Heuristics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checklist */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Security Checklist
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#182234]">
                  <span className="text-slate-300">Length (At least 12 characters)</span>
                  {result.checklist.hasMinLength ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Uppercase (A–Z)</span>
                  {result.checklist.hasUppercase ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Lowercase (a–z)</span>
                  {result.checklist.hasLowercase ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Numbers (0–9)</span>
                  {result.checklist.hasNumbers ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Special Symbols (!@#$)</span>
                  {result.checklist.hasSymbols ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-300">No Dictionary Terms or Runs</span>
                  {result.checklist.hasNoCommonPatterns ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#f59e0b]" />
                  )}
                </div>
              </div>
            </div>

            {/* Metrics & Recommendations */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Entropy &amp; Recommendations
              </span>

              <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] flex items-center justify-between text-xs">
                <span className="text-slate-400">Shannon Entropy:</span>
                <span className="text-base font-bold text-[#00e575]">
                  {result.entropyBits} <span className="text-xs text-slate-400 font-normal">bits</span>
                </span>
              </div>

              {result.warnings.length > 0 && (
                <div className="space-y-1.5">
                  {result.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                {result.feedback.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-xs text-slate-300 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e575] flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
