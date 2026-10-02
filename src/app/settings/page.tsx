"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { signOut } from "next-auth/react";
import { Volume2, VolumeX, Music, Play, LogOut, CheckCircle } from "lucide-react";
import {
  isSoundFxEnabled,
  setSoundFxEnabled,
  isAmbientBgmEnabled,
  setAmbientBgmEnabled,
  playSound,
} from "@/utils/audio";

export default function SettingsPage() {
  const [soundFx, setSoundFx] = useState(true);
  const [ambientBgm, setAmbientBgm] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSoundFx(isSoundFxEnabled());
    setAmbientBgm(isAmbientBgmEnabled());

    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.displayName) setDisplayName(data.displayName);
      })
      .catch(() => {});
  }, []);

  const handleToggleSoundFx = (enabled: boolean) => {
    setSoundFx(enabled);
    setSoundFxEnabled(enabled);
    if (enabled) {
      playSound("click", true);
    }
  };

  const handleToggleAmbientBgm = (enabled: boolean) => {
    setAmbientBgm(enabled);
    setAmbientBgmEnabled(enabled);
  };

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

        {/* Section 1: Audio & Acoustic Feedback */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#00e575]" />
              <span>Audio &amp; Acoustic Feedback</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize terminal interface sound effects and atmospheric boot audio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Sound FX Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                soundFx
                  ? "border-[#00e575]/40 bg-[#080b11]"
                  : "border-[#182234] bg-[#080b11]/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${
                      soundFx
                        ? "bg-[#00e575]/10 text-[#00e575]"
                        : "bg-slate-850 text-slate-500"
                    }`}
                  >
                    {soundFx ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      Interface Sound Effects
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Button clicks, hover tones, and alert chirps.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#182234]">
                <button
                  type="button"
                  onClick={() => playSound("click", true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121927] hover:bg-[#182234] text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  <Play className="w-3 h-3 text-[#00e575]" />
                  <span>Test Tone</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSoundFx(!soundFx)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    soundFx
                      ? "bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                  }`}
                >
                  {soundFx ? "Enabled" : "Muted"}
                </button>
              </div>
            </div>

            {/* Ambient BGM Card */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                ambientBgm
                  ? "border-[#00e575]/40 bg-[#080b11]"
                  : "border-[#182234] bg-[#080b11]/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${
                      ambientBgm
                        ? "bg-[#00e575]/10 text-[#00e575]"
                        : "bg-slate-850 text-slate-500"
                    }`}
                  >
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      Boot Background Audio
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Atmospheric synth music during terminal boot.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end pt-3 border-t border-[#182234]">
                <button
                  type="button"
                  onClick={() => handleToggleAmbientBgm(!ambientBgm)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    ambientBgm
                      ? "bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                  }`}
                >
                  {ambientBgm ? "Enabled" : "Muted"}
                </button>
              </div>
            </div>
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
