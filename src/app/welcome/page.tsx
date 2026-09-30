"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, User, Terminal } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.displayName && data.displayName !== "Security Agent") {
          router.replace("/home");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update profile name.");
      }

      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-grid bg-[#080b11] text-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-[#182234] bg-[#0d131f] rounded-2xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#00e575]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#080b11] border border-[#00e575]/40 flex items-center justify-center shadow-glow mx-auto">
            <User className="w-7 h-7 text-[#00e575]" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#00e575] bg-[#00e575]/10 border border-[#00e575]/30 px-2.5 py-0.5 rounded-full font-medium">
            <Terminal className="w-3 h-3" />
            <span>INITIAL AGENT CONFIGURATION</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            What should we call you?
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your alias will be displayed on reports, diagnostics, and throughout
            The Big Bro&apos;s NetSec Armoury.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Agent Name / Call-Sign
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Detective Shaun, Cipher, Ghost"
              autoFocus
              className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
            />
          </div>

          {error && (
            <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
          >
            <span>{loading ? "Saving Credentials..." : "Enter the Armoury"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[#182234] flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-[#00e575]" />
          <span>You can change this anytime in Settings</span>
        </div>
      </div>
    </div>
  );
}
