"use client";

import React, { useState, useEffect } from "react";
import { Search, Volume2, VolumeX, Shield, X, ArrowRight } from "lucide-react";
import { isSoundFxEnabled, setSoundFxEnabled, playSound } from "@/utils/audio";
import { tools } from "@/registry/tools";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    setSoundEnabled(isSoundFxEnabled());
    const handleAudioChange = () => {
      setSoundEnabled(isSoundFxEnabled());
    };
    window.addEventListener("netsec_audio_config_changed", handleAudioChange);
    return () => {
      window.removeEventListener("netsec_audio_config_changed", handleAudioChange);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundFxEnabled(next);
    if (next) {
      playSound("click", true);
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredTools = query.trim()
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
    : tools.slice(0, 6);

  const handleSelectTool = (id: string) => {
    setSearchOpen(false);
    setQuery("");
    router.push(`/tools/${id}`);
  };

  return (
    <>
      <header className="h-16 border-b border-[#182234] bg-[#0d131f]/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Global Search Bar Trigger */}
        <div className="flex-1 max-w-md ml-10 lg:ml-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-slate-400 transition-colors shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00e575] transition-colors" />
              <span>Search security &amp; network tools...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#121927] border border-[#182234] text-[10px] text-slate-400 font-sans">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Header Utilities */}
        <div className="flex items-center gap-3">
          {/* Active Tools Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#080b11] border border-[#182234] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse" />
            <span className="font-medium text-white">{tools.length}</span>
            <span className="text-slate-400">Tools Active</span>
          </div>

          {/* Quick Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-[#080b11] border border-[#182234] text-slate-300 hover:text-white hover:border-[#00e575]/40 transition-colors"
            title={soundEnabled ? "Mute interface sound effects" : "Enable interface sound effects"}
            aria-label="Toggle sound effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#00e575]" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* User Profile Avatar Link */}
          <Link
            href="/account"
            className="w-9 h-9 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 flex items-center justify-center text-xs font-bold text-white transition-colors"
            title="Account Profile"
          >
            <Shield className="w-4 h-4 text-[#00e575]" />
          </Link>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-[#0d131f] border border-[#182234] rounded-2xl shadow-2xl overflow-hidden z-10">
            {/* Input Header */}
            <div className="p-4 border-b border-[#182234] flex items-center gap-3">
              <Search className="w-4 h-4 text-[#00e575]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools by name, tag, or description..."
                autoFocus
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#121927]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredTools.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No tools found matching &ldquo;{query}&rdquo;.
                </div>
              ) : (
                filteredTools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTool(t.id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#121927] transition-colors flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-[#00e575] transition-colors">
                          {t.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#080b11] border border-[#182234] text-slate-400 capitalize">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {t.description}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#00e575] transition-colors" />
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#182234] bg-[#070a10] flex items-center justify-between text-[11px] text-slate-500">
              <span>{tools.length} total tools registered</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
