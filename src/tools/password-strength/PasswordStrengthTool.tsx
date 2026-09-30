"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";

const SAMPLE_PASSWORDS = [
  { label: "Common Weak", value: "password123" },
  { label: "Predictable Run", value: "qwerty987" },
  { label: "Substitution", value: "Tr0ub4dor&" },
  { label: "Strong Random", value: "K9#xP!m9$wL2@vQ7" },
  { label: "Long Passphrase", value: "solar-panther-galaxy-echo" },
];

export default function PasswordStrengthTool() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<PasswordStrengthData | null>(null);
  const [showJargonGuide, setShowJargonGuide] = useState(false);

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
                100% In-Browser / Zero Network Transmission
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Audit Shannon entropy, character diversity, pattern heuristics, and estimated brute-force crack times.
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
              What does this tool audit &amp; why does it matter?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              This auditor evaluates how hard your password is for an attacker&apos;s computer to guess or crack. It tests password length, character diversity, and scans for dangerous habits like <strong className="text-white">dictionary words</strong> (e.g. &quot;admin&quot;) or <strong className="text-white">keyboard runs</strong> (e.g. &quot;qwerty&quot; or &quot;123456&quot;) that automated bots exploit in milliseconds.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#00e575] pt-1">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>100% Private &amp; In-Browser:</strong> Your password is evaluated locally and never sent over the internet or saved to any server.
              </span>
            </div>
          </div>
        </div>

        {/* Jargon Decoded Toggle & Cards */}
        <div className="border-t border-[#182234] pt-3">
          <button
            type="button"
            onClick={() => setShowJargonGuide(!showJargonGuide)}
            className="text-xs text-[#00e575] hover:underline flex items-center gap-1 font-semibold"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showJargonGuide ? "Hide Security Terms Guide" : "Confused by terms like 'Entropy' or 'Crack Time'? (Click to decode)"}</span>
          </button>

          {showJargonGuide && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#00e575]">
                  <Zap className="w-4 h-4" />
                  <span>Entropy (Randomness in Bits)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  In plain words, <strong className="text-white">entropy</strong> measures how unpredictable a password is to a guessing computer. Think of it like a combination lock: the more wheels and the more symbols per wheel, the higher the entropy. <strong>Higher is always better:</strong> &lt; 40 bits is weak, 60+ bits is strong, and 80+ bits is bank-grade.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f59e0b]">
                  <Clock className="w-4 h-4" />
                  <span>Crack Time Estimates</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  An estimate of how long computers would take to try every combination until guessing yours:
                </p>
                <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
                  <li><strong>Online Attack:</strong> Guessing via a web login (slowed down by site limits).</li>
                  <li><strong>Offline GPU Rig:</strong> Hackers with a stolen database cracking at 10 billion guesses/sec.</li>
                  <li><strong>Supercomputer:</strong> Massive computing clusters trying trillions of guesses/sec.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Enter Password to Audit
            </label>
            <span className="text-[11px] text-slate-400">
              {password.length} characters
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type or paste any password to test..."
              className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Sample Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Try Sample Passwords:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PASSWORDS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setPassword(sample.value)}
                className="px-2.5 py-1 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Strength Meter Bar & Rating */}
        {result && (
          <div className="space-y-3 pt-2 border-t border-[#182234]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">
                Audited Resilience Score
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{result.score}/100</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    result.rating === "Very Strong"
                      ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/40"
                      : result.rating === "Strong"
                      ? "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40"
                      : result.rating === "Moderate"
                      ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40"
                      : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40"
                  }`}
                >
                  {result.rating}
                </span>
              </div>
            </div>

            <div className="h-2.5 w-full bg-[#080b11] rounded-full overflow-hidden border border-[#182234]">
              <div
                className={`h-full transition-all duration-300 ${strengthColor.split(" ")[1]}`}
                style={{ width: `${Math.max(4, result.score)}%` }}
              />
            </div>

            {/* Plain-Language Rating Summary */}
            <p className="text-xs text-slate-300 leading-relaxed bg-[#080b11] p-3 rounded-xl border border-[#182234]">
              {result.ratingDescription}
            </p>
          </div>
        )}
      </div>

      {/* Results Analysis */}
      {result && password.length > 0 && (
        <div className="space-y-6">
          {/* Estimated Crack Times Grid */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#00e575]" />
                <span>Estimated Brute-Force Crack Times</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Assuming 50% search space on average
              </span>
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
                  ~100 guesses/sec (site rate limits)
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
                  ~10 Billion guesses/sec (stolen database)
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
                  ~10 Trillion guesses/sec (state actor)
                </span>
              </div>
            </div>
          </div>

          {/* Checklist & Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checklist */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Security Checklist
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[#182234]">
                  <span className="text-slate-300">Length (&ge; 12 characters)</span>
                  {result.checklist.hasMinLength ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Uppercase (A–Z)</span>
                  {result.checklist.hasUppercase ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Lowercase (a–z)</span>
                  {result.checklist.hasLowercase ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Numbers (0–9)</span>
                  {result.checklist.hasNumbers ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#182234]">
                  <span className="text-slate-300">Contains Special Symbols (!@#$)</span>
                  {result.checklist.hasSymbols ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#ef4444]" />
                  )}
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">No Dictionary Words or Keyboard Runs</span>
                  {result.checklist.hasNoCommonPatterns ? (
                    <Check className="w-4 h-4 text-[#00e575]" />
                  ) : (
                    <X className="w-4 h-4 text-[#f59e0b]" />
                  )}
                </div>
              </div>
            </div>

            {/* Metrics & Actionable Recommendations */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Entropy &amp; Actionable Tips
              </span>

              {/* Entropy Metric Card */}
              <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">Shannon Entropy:</span>
                  <span className="text-[10px] text-slate-500">Pool Size: {result.characterPoolSize} chars</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#00e575]">
                    {result.entropyBits} <span className="text-xs text-slate-400 font-normal">bits</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {result.entropyBits >= 80 ? "Bank-Grade" : result.entropyBits >= 60 ? "Strong" : "Vulnerable"}
                  </span>
                </div>
              </div>

              {/* Warnings */}
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

              {/* Actionable Tips */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Recommended Action Steps:
                </span>
                {result.actionableTips.map((tip, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-xs text-slate-300 flex items-start gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-[#00e575] flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Link to Generator */}
              <div className="pt-2 border-t border-[#182234]">
                <Link
                  href="/tools/password-generator"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#00e575]" />
                    <span>Need an unbreakable password?</span>
                  </span>
                  <span className="text-[#00e575] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Generate One</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
