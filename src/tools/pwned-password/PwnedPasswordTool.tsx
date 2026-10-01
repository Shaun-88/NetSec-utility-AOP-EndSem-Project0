"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ToolResult } from "@/core/results/types";
import type { PwnedPasswordOutputData } from "./types";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";

/**
 * Computes SHA-1 hash of a string using the browser's WebCrypto API.
 * The plaintext password NEVER leaves the browser.
 */
const computeSha1 = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default function PwnedPasswordTool() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<PwnedPasswordOutputData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password) {
      setError("Please enter a password to check.");
      return;
    }

    setError(null);
    setResult(null);

    // Step 1: Hash client-side (never send the plaintext to the server)
    setHashing(true);
    let fullHash: string;
    try {
      fullHash = await computeSha1(password);
    } catch {
      setError("Failed to compute hash in your browser. Please try again.");
      setHashing(false);
      return;
    }
    setHashing(false);

    // Step 2: Send only the first 5 chars (k-anonymity prefix) + full hash to our server
    const prefix = fullHash.slice(0, 5);
    setLoading(true);

    try {
      const res = await fetch("/api/tools/pwned-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, fullHash }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: string }).error ||
            `Request failed with status ${res.status}`,
        );
      }

      const data = (await res.json()) as ToolResult<PwnedPasswordOutputData>;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check password breach status.",
      );
    } finally {
      setLoading(false);
    }
  };

  const pwnedData = result?.data;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header / Explainer */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#f59e0b]/40 text-[#f59e0b] flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Pwned Password Checker
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                k-Anonymity
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                HIBP API
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Check if a password has appeared in known data breaches using{" "}
              <strong>k-anonymity</strong> — your actual password is{" "}
              <strong className="text-[#00e575]">never transmitted</strong>. Only a 5-character
              partial hash is ever sent to our server.
            </p>
            {/* Privacy Architecture Callout */}
            <div className="mt-3 p-3 rounded-xl bg-[#00e575]/5 border border-[#00e575]/20 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-[#00e575] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                How your privacy is protected:
              </div>
              <ol className="space-y-0.5 text-slate-400 list-none">
                <li>① Your browser computes a SHA-1 hash of your password locally</li>
                <li>② Only the first 5 characters of the hash are sent to our server</li>
                <li>③ Our server queries HIBP with that 5-char prefix</li>
                <li>④ The match is checked server-side — your password never leaves your device</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Query Form */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password to Check
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password to check..."
                  autoComplete="off"
                  className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || hashing}
                className="px-6 py-3 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {hashing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Computing hash locally...</span>
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Password</span>
                  </>
                )}
              </button>
            </div>
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
      {pwnedData && (
        <div className="space-y-4">
          {/* Result Banner */}
          {pwnedData.isPwned ? (
            <div className="border border-[#ef4444]/40 bg-gradient-to-r from-[#ef4444]/10 via-[#0d131f] to-[#0d131f] rounded-2xl p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/40 text-[#ef4444] flex-shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">
                  ⚠️ Password Compromised
                </h2>
                <p className="text-sm text-[#ef4444] font-semibold">
                  This password was seen{" "}
                  <strong>{pwnedData.pwnedCount.toLocaleString()}</strong> times in known
                  data breaches. Stop using it immediately.
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  This does not mean your account was breached — but this password is known to
                  attackers and should never be used.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-[#00e575]/30 bg-gradient-to-r from-[#00e575]/5 via-[#0d131f] to-[#0d131f] rounded-2xl p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#00e575]/10 border border-[#00e575]/40 text-[#00e575] flex-shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">
                  ✅ Password Not Found in Breaches
                </h2>
                <p className="text-sm text-[#00e575]">
                  This password has not appeared in any known breach database.
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  A clean result doesn&apos;t guarantee the password is strong — use the Password
                  Strength Checker to evaluate entropy and patterns.
                </p>
              </div>
            </div>
          )}

          {/* Strength Checker CTA */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Want to also check how <strong className="text-slate-200">strong</strong> this
              password is?
            </div>
            <Link
              href="/tools/password-strength"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#00e575] hover:underline"
            >
              Check password strength
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Technical Detail */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-1">
            <Lock className="w-3 h-3 text-[#00e575]" />
            <span>
              Only the 5-char prefix <code className="text-[#00e575]">{pwnedData.prefix}</code> was
              transmitted. Your password never left your browser.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
