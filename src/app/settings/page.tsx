"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useTheme } from "@/components/ThemeProvider";
import { signOut } from "next-auth/react";
import { Sun, Moon, LogOut, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.displayName) setDisplayName(data.displayName);
      })
      .catch(() => {});
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update name.");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            System Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your workspace interface theme and identity preferences.
          </p>
        </div>

        {/* Section 1: Theme Preferences */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Appearance &amp; Theme</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select between the default dark terminal palette and daytime light mode.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Dark Theme Option */}
            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all ${
                theme === "dark"
                  ? "border-[#00e575] bg-[#080b11] shadow-glow"
                  : "border-[#182234] bg-[#080b11]/60 hover:border-slate-700"
              }`}
            >
              <div className="p-2.5 rounded-lg bg-[#00e575]/10 text-[#00e575] flex-shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Dark Mode (Default)</span>
                  {theme === "dark" && (
                    <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Near-black background with terminal green accents and subtle scanlines.
                </p>
              </div>
            </button>

            {/* Light Theme Option */}
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all ${
                theme === "light"
                  ? "border-[#00e575] bg-[#080b11] shadow-glow"
                  : "border-[#182234] bg-[#080b11]/60 hover:border-slate-700"
              }`}
            >
              <div className="p-2.5 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] flex-shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Light Mode</span>
                  {theme === "light" && (
                    <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  High-contrast daylight theme with deep emerald and amber indicators.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Display Name Alias */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Agent Identity Alias</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The call-sign used in header greetings and tool reports.
            </p>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4 max-w-md pt-1">
            <div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Detective Shaun"
                className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              />
            </div>

            {error && (
              <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 p-2 rounded-lg">
                {error}
              </p>
            )}

            {savedSuccess && (
              <div className="flex items-center gap-2 text-xs text-[#00e575] bg-[#00e575]/10 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>Alias updated successfully.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-xs rounded-xl transition-colors shadow-glow disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Alias"}
            </button>
          </form>
        </div>

        {/* Section 3: Session & Sign Out */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white">Session Security</h2>
            <p className="text-xs text-slate-400">
              End your active session and sign out of The Big Bro&apos;s NetSec Armoury.
            </p>
          </div>

          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("boot_sequence_completed");
                document.cookie =
                  "app_booted=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              } catch {}
              signOut({ callbackUrl: "/signin" });
            }}
            className="px-4 py-2.5 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
